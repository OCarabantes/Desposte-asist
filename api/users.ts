import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDbPool, ensureDbInitialized } from './_db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const pool = getDbPool();
  if (!pool) {
    return res.status(503).json({ error: 'Database not configured. POSTGRES_URL environment variable is missing.' });
  }

  try {
    await ensureDbInitialized();

    if (req.method === 'GET') {
      const result = await pool.query('SELECT id, email, name, role, area, created_at FROM users ORDER BY created_at DESC');
      const users = result.rows.map(r => ({
        id: r.id,
        email: r.email,
        name: r.name,
        role: r.role,
        area: r.area,
        createdAt: r.created_at
      }));
      return res.status(200).json(users);
    }

    if (req.method === 'POST') {
      const { email, password, name, role, area = 'DESPOSTE' } = req.body || {};
      
      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
      }

      const id = `USR-${Date.now().toString(36)}`;
      
      // In a real production app, we would hash the password with bcrypt here.
      // For this system where we previously used plaintext in the initial seed (Mandoneao26),
      // we'll store it as provided to maintain compatibility with the auth.ts login query.
      // E.g., password_hash = password.
      
      await pool.query(`
        INSERT INTO users (id, email, password_hash, name, role, area)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [id, email, password, name, role || 'Supervisor', area]);

      return res.status(201).json({ id, email, name, role, area });
    }

    if (req.method === 'PUT') {
      const { id, email, password, name, role, area } = req.body || {};
      
      if (!id || !email || !name) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
      }

      if (password && password.trim() !== '') {
        await pool.query(`
          UPDATE users
          SET email = $2, name = $3, role = $4, area = $5, password_hash = $6
          WHERE id = $1
        `, [id, email, name, role, area, password]);
      } else {
        await pool.query(`
          UPDATE users
          SET email = $2, name = $3, role = $4, area = $5
          WHERE id = $1
        `, [id, email, name, role, area]);
      }

      return res.status(200).json({ id, email, name, role, area });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Missing id' });
      
      // Prevent deleting the main admin if necessary, or let them delete whatever
      await pool.query('DELETE FROM users WHERE id = $1', [id]);
      
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    // Check if it's a unique constraint violation on email
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Ya existe un usuario con este correo' });
    }
    return res.status(500).json({ error: err.message });
  }
}
