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
      const { date, startDate, endDate } = req.query;

      let query = 'SELECT * FROM non_worked_hours';
      const params: any[] = [];

      if (date) {
        query += ' WHERE date = $1';
        params.push(date);
      } else if (startDate && endDate) {
        query += ' WHERE date >= $1 AND date <= $2';
        params.push(startDate, endDate);
      }

      query += ' ORDER BY created_at DESC';
      const result = await pool.query(query, params);

      const records = result.rows.map(r => ({
        id: r.id,
        date: typeof r.date === 'string' ? r.date : r.date.toISOString().substring(0, 10),
        workerId: r.worker_id,
        workerName: r.worker_name,
        area: r.area,
        startTime: r.start_time,
        endTime: r.end_time,
        totalMinutes: r.total_minutes,
        totalHours: parseFloat(r.total_hours),
        category: r.category,
        reason: r.reason,
        approvedBy: r.approved_by,
        paid: r.paid,
        status: r.status,
        hasCertificate: r.has_certificate,
        notes: r.notes,
        createdAt: r.created_at
      }));

      return res.status(200).json(records);
    }

    if (req.method === 'POST') {
      const { 
        id: customId,
        date, 
        workerId, 
        workerName, 
        area, 
        startTime, 
        endTime, 
        totalMinutes, 
        totalHours, 
        category, 
        reason, 
        approvedBy, 
        paid = true, 
        status = 'APPROVED', 
        hasCertificate = false, 
        notes 
      } = req.body || {};

      const id = customId || `HNT-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`;

      await pool.query(`
        INSERT INTO non_worked_hours (
          id, date, worker_id, worker_name, area, start_time, end_time,
          total_minutes, total_hours, category, reason, approved_by,
          paid, status, has_certificate, notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (id) DO UPDATE
        SET date = EXCLUDED.date,
            start_time = EXCLUDED.start_time,
            end_time = EXCLUDED.end_time,
            total_minutes = EXCLUDED.total_minutes,
            total_hours = EXCLUDED.total_hours,
            category = EXCLUDED.category,
            reason = EXCLUDED.reason,
            approved_by = EXCLUDED.approved_by,
            paid = EXCLUDED.paid,
            status = EXCLUDED.status,
            has_certificate = EXCLUDED.has_certificate,
            notes = EXCLUDED.notes
      `, [
        id, date, workerId, workerName, area, startTime, endTime,
        totalMinutes, totalHours, category, reason, approvedBy,
        paid, status, hasCertificate, notes
      ]);

      return res.status(201).json({ id, date, workerId, workerName, area, startTime, endTime, totalMinutes, totalHours, category, reason, approvedBy, paid, status, hasCertificate });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Missing id' });
      await pool.query('DELETE FROM non_worked_hours WHERE id = $1', [id]);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
