import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDbPool, ensureDbInitialized } from './_db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
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
    return res.status(200).json({
      status: 'offline_storage',
      message: 'No POSTGRES_URL variable detected. Running in browser local storage fallback mode.'
    });
  }

  try {
    await ensureDbInitialized();

    const empCount = await pool.query('SELECT COUNT(*) FROM employees');
    const attCount = await pool.query('SELECT COUNT(*) FROM daily_attendance');
    const hntCount = await pool.query('SELECT COUNT(*) FROM non_worked_hours');

    return res.status(200).json({
      status: 'connected',
      database: 'PostgreSQL Active',
      employees: parseInt(empCount.rows[0].count, 10),
      attendanceRecords: parseInt(attCount.rows[0].count, 10),
      permits: parseInt(hntCount.rows[0].count, 10),
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return res.status(500).json({ status: 'error', error: err.message });
  }
}
