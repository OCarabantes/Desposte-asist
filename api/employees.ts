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
      const result = await pool.query('SELECT * FROM employees ORDER BY CAST(REGEXP_REPLACE(doc_number, \'[^0-9]\', \'\', \'g\') AS INTEGER) ASC');
      const employees = result.rows.map(r => ({
        id: r.id,
        docNumber: r.doc_number,
        name: r.name,
        area: r.area,
        role: r.role,
        active: r.active,
        rut: r.rut,
        email: r.email,
        phone: r.phone,
        hireDate: r.hire_date,
        notes: r.notes
      }));
      return res.status(200).json(employees);
    }

    if (req.method === 'POST') {
      const { docNumber, name, area, role, active = true, rut, email, phone, notes } = req.body || {};
      const id = `EMP-${Date.now().toString(36)}`;
      await pool.query(`
        INSERT INTO employees (id, doc_number, name, area, role, active, rut, email, phone, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [id, docNumber, name, area, role, active, rut, email, phone, notes]);

      return res.status(201).json({ id, docNumber, name, area, role, active, rut, email, phone, notes });
    }

    if (req.method === 'PUT') {
      const { id, docNumber, name, area, role, active, rut, email, phone, notes } = req.body || {};
      await pool.query(`
        UPDATE employees
        SET doc_number = $2, name = $3, area = $4, role = $5, active = $6, rut = $7, email = $8, phone = $9, notes = $10, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [id, docNumber, name, area, role, active, rut, email, phone, notes]);

      return res.status(200).json({ id, docNumber, name, area, role, active, rut, email, phone, notes });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Missing id' });
      await pool.query('DELETE FROM employees WHERE id = $1', [id]);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
