import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDbPool, ensureDbInitialized } from './_db.js';
import { INITIAL_PLANT_CONFIG } from '../src/data/initialRoster.js';

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
    return res.status(200).json(INITIAL_PLANT_CONFIG);
  }

  try {
    await ensureDbInitialized();

    if (req.method === 'GET') {
      const result = await pool.query('SELECT * FROM plant_config WHERE id = $1', ['karmac_default_config']);
      if (result.rows.length === 0) {
        return res.status(200).json(INITIAL_PLANT_CONFIG);
      }
      const r = result.rows[0];
      return res.status(200).json({
        institution: r.institution,
        areaName: r.area_name,
        supervisorName: r.supervisor_name,
        supervisorRole: r.supervisor_role,
        shiftStartTime: r.shift_start_time,
        shiftEndTime: r.shift_end_time,
        graceMinutes: r.grace_minutes,
        hrEmailRecipients: typeof r.hr_email_recipients === 'string' ? JSON.parse(r.hr_email_recipients) : r.hr_email_recipients,
        ccEmailRecipients: typeof r.cc_email_recipients === 'string' ? JSON.parse(r.cc_email_recipients) : r.cc_email_recipients,
        autoReconcile: true
      });
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      const {
        institution,
        areaName,
        supervisorName,
        supervisorRole,
        shiftStartTime,
        shiftEndTime,
        graceMinutes,
        hrEmailRecipients,
        ccEmailRecipients
      } = req.body || {};

      await pool.query(`
        INSERT INTO plant_config (
          id, institution, area_name, supervisor_name, supervisor_role,
          shift_start_time, shift_end_time, grace_minutes,
          hr_email_recipients, cc_email_recipients, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE
        SET institution = EXCLUDED.institution,
            area_name = EXCLUDED.area_name,
            supervisor_name = EXCLUDED.supervisor_name,
            supervisor_role = EXCLUDED.supervisor_role,
            shift_start_time = EXCLUDED.shift_start_time,
            shift_end_time = EXCLUDED.shift_end_time,
            grace_minutes = EXCLUDED.grace_minutes,
            hr_email_recipients = EXCLUDED.hr_email_recipients,
            cc_email_recipients = EXCLUDED.cc_email_recipients,
            updated_at = CURRENT_TIMESTAMP
      `, [
        'karmac_default_config',
        institution,
        areaName,
        supervisorName,
        supervisorRole,
        shiftStartTime,
        shiftEndTime,
        graceMinutes,
        JSON.stringify(hrEmailRecipients || ['cgarrido@karmac.cl', 'asistente.rrhh@karmac.cl']),
        JSON.stringify(ccEmailRecipients || ['ssoruco@karmac.cl'])
      ]);

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
