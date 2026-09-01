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
    return res.status(503).json({ error: 'Database not configured.' });
  }

  try {
    await ensureDbInitialized();

    if (req.method === 'GET') {
      const { date, month, year } = req.query;

      let query = 'SELECT * FROM daily_attendance';
      const params: any[] = [];

      if (date) {
        query += ' WHERE date = $1';
        params.push(date);
      } else if (month && year) {
        query += ' WHERE EXTRACT(MONTH FROM date) = $1 AND EXTRACT(YEAR FROM date) = $2';
        params.push(month, year);
      }

      query += ' ORDER BY date ASC';
      const result = await pool.query(query, params);

      const records = result.rows.map(r => ({
        id: r.id,
        date: typeof r.date === 'string' ? r.date : r.date.toISOString().substring(0, 10),
        workerId: r.worker_id,
        docNumber: r.doc_number,
        workerName: r.worker_name,
        area: r.area,
        status: r.status,
        notes: r.notes,
        updatedAt: r.updated_at
      }));

      return res.status(200).json(records);
    }

    if (req.method === 'POST') {
      const body = req.body;
      const recordsToSave = Array.isArray(body) ? body : [body];

      for (const rec of recordsToSave) {
        const { id, date, workerId, docNumber, workerName, area, status = '1', notes } = rec;
        const recId = id || `${date}_${workerId}`;

        await pool.query(`
          INSERT INTO daily_attendance (id, date, worker_id, doc_number, worker_name, area, status, notes, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
          ON CONFLICT (id) DO UPDATE
          SET status = EXCLUDED.status,
              notes = EXCLUDED.notes,
              updated_at = CURRENT_TIMESTAMP
        `, [recId, date, workerId, docNumber, workerName, area, status, notes]);
      }

      return res.status(200).json({ success: true, count: recordsToSave.length });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
