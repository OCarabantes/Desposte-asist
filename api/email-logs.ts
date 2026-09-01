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
    return res.status(200).json([]);
  }

  try {
    await ensureDbInitialized();

    if (req.method === 'GET') {
      const result = await pool.query('SELECT * FROM email_dispatch_logs ORDER BY timestamp DESC LIMIT 100');
      const logs = result.rows.map(r => ({
        id: r.id,
        date: typeof r.date === 'string' ? r.date : r.date.toISOString().substring(0, 10),
        timestamp: r.timestamp,
        recipients: typeof r.recipients === 'string' ? JSON.parse(r.recipients) : r.recipients,
        ccRecipients: typeof r.cc_recipients === 'string' ? JSON.parse(r.cc_recipients) : r.cc_recipients,
        subject: r.subject,
        reportType: r.report_type,
        status: r.status,
        summary: r.summary,
        sentBy: r.sent_by
      }));
      return res.status(200).json(logs);
    }

    if (req.method === 'POST') {
      const { date, recipients, ccRecipients, subject, reportType, status = 'SENT', summary, sentBy } = req.body || {};
      const id = `EMAIL-${Date.now().toString(36)}`;

      await pool.query(`
        INSERT INTO email_dispatch_logs (id, date, timestamp, recipients, cc_recipients, subject, report_type, status, summary, sent_by)
        VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4, $5, $6, $7, $8, $9)
      `, [
        id,
        date,
        JSON.stringify(recipients || []),
        JSON.stringify(ccRecipients || []),
        subject,
        reportType,
        status,
        summary,
        sentBy
      ]);

      return res.status(201).json({ id, date, recipients, subject, status, summary, sentBy });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
