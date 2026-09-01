import type { VercelRequest, VercelResponse } from '@vercel/node';
import { purgeOldRecords, getDbPool } from './_db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const pool = getDbPool();
  if (!pool) {
    return res.status(200).json({
      status: 'offline_storage',
      message: 'No active PostgreSQL database. Cleanup skipped.'
    });
  }

  try {
    const months = req.query.months ? parseInt(String(req.query.months), 10) : 5;
    const result = await purgeOldRecords(months || 5);

    return res.status(200).json({
      success: true,
      message: `Depuración automática ejecutada con éxito. Registros anteriores a ${months} meses eliminados.`,
      retentionPolicy: `${months} meses (150 días)`,
      stats: result,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
