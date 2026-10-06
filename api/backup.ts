import type { IncomingMessage, ServerResponse } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtemp, rm, stat } from 'node:fs/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { createGzip } from 'node:zlib';
import { getDbPool } from './_db.js';

type Request = IncomingMessage & { body?: { email?: unknown; password?: unknown } };

export default async function handler(req: Request, res: ServerResponse) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const fail = (status: number, error: string) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error }));
  };
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return fail(405, 'Método no permitido.');
  }
  const pool = getDbPool();
  if (!pool) return fail(503, 'No hay una base de datos PostgreSQL conectada para respaldar.');
  let directory: string | undefined;
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!email || !password) return fail(401, 'Ingrese sus credenciales de administrador.');
    // Do not initialize the database: initialization also purges historical data.
    const user = await pool.query(
      'SELECT role FROM users WHERE LOWER(email) = LOWER($1) AND password_hash = $2',
      [email, password]
    );
    if (!user.rows.length) return fail(401, 'Credenciales incorrectas.');
    if (!/\badmin\b/i.test(user.rows[0].role)) return fail(403, 'Solo administradores pueden descargar respaldos.');

    const connection = process.env.BACKUP_DATABASE_URL || process.env.POSTGRES_URL_NON_POOLING ||
      process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;
    directory = await mkdtemp(join(tmpdir(), 'desposte-backup-'));
    const sqlPath = join(directory, 'backup.sql');
    await new Promise<void>((resolve, reject) => {
      // Pass the connection through the environment, never through shell arguments.
      const child = spawn(process.env.PG_DUMP_PATH || 'pg_dump', [
        '--format=plain', '--create', '--no-password', '--file', sqlPath,
      ], { env: { ...process.env, PGDATABASE: connection, PGCONNECT_TIMEOUT: '15' }, shell: false });
      const timeout = setTimeout(() => child.kill(), 120000);
      child.stderr.on('data', () => { /* Do not expose connection credentials in errors. */ });
      child.on('error', (error: NodeJS.ErrnoException) => {
        clearTimeout(timeout);
        reject(new Error(error.code === 'ENOENT' ? 'PG_DUMP_MISSING' : 'PG_DUMP_FAILED'));
      });
      child.on('close', code => {
        clearTimeout(timeout);
        if (code === 0) resolve();
        else reject(new Error('PG_DUMP_FAILED'));
      });
    });
    const archivePath = join(directory, 'backup.sql.gz');
    await pipeline(createReadStream(sqlPath), createGzip(), createWriteStream(archivePath));
    const archive = await stat(archivePath);
    const date = new Date().toISOString().replace(/[:.]/g, '-');
    res.setHeader('Content-Type', 'application/gzip');
    res.setHeader('Content-Disposition', `attachment; filename="desposte-respaldo-completo-${date}.sql.gz"`);
    res.setHeader('Content-Length', archive.size);
    await pipeline(createReadStream(archivePath), res);
  } catch (error) {
    if (!res.headersSent) {
      fail(503, error instanceof Error && error.message === 'PG_DUMP_MISSING'
        ? 'El servidor necesita pg_dump para generar el respaldo completo. Contacte al administrador del servidor.'
        : 'No se pudo generar el respaldo. Revise la conexión, los permisos y la versión de pg_dump en el servidor.');
    }
  } finally {
    if (directory) await rm(directory, { recursive: true, force: true });
  }
}
