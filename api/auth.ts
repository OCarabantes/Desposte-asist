import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDbPool, ensureDbInitialized } from './_db.js';
import { ADMIN_CREDENTIALS } from '../src/services/authService.js';

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body || {};
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPassword = String(password || '').trim();

    const pool = getDbPool();
    if (!pool) {
      // Direct credential fallback
      if (cleanEmail === ADMIN_CREDENTIALS.email.toLowerCase() && cleanPassword === ADMIN_CREDENTIALS.password) {
        return res.status(200).json({
          success: true,
          session: {
            email: ADMIN_CREDENTIALS.email,
            name: ADMIN_CREDENTIALS.name,
            role: ADMIN_CREDENTIALS.role,
            area: ADMIN_CREDENTIALS.area,
            loginTimestamp: new Date().toISOString()
          }
        });
      }
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    await ensureDbInitialized();

    const result = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1) AND password_hash = $2',
      [cleanEmail, cleanPassword]
    );

    if (result.rows.length > 0) {
      const u = result.rows[0];
      return res.status(200).json({
        success: true,
        session: {
          email: u.email,
          name: u.name,
          role: u.role,
          area: u.area,
          loginTimestamp: new Date().toISOString()
        }
      });
    }

    return res.status(401).json({ success: false, message: 'Correo o contraseña incorrecta' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
