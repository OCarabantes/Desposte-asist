import pg from 'pg';
import { INITIAL_EMPLOYEES, INITIAL_PLANT_CONFIG } from '../src/data/initialRoster.js';
import { ADMIN_CREDENTIALS } from '../src/services/authService.js';

const { Pool } = pg;

const connectionString = 
  process.env.POSTGRES_URL || 
  process.env.DATABASE_URL || 
  process.env.POSTGRES_PRISMA_URL || 
  process.env.POSTGRES_URL_NON_POOLING;

let pool: pg.Pool | null = null;
let lastPurgeTime: number = 0;

export function getDbPool(): pg.Pool | null {
  if (!connectionString) {
    return null;
  }

  if (!pool) {
    const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
    pool = new Pool({
      connectionString,
      ssl: isLocalhost ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });
  }

  return pool;
}

/**
 * Automatically purges historical records older than 5 months (150 days)
 * to keep the database lightweight and prevent accumulation of junk data.
 */
export async function purgeOldRecords(monthsToKeep: number = 5): Promise<{ purgedAttendance: number; purgedPermits: number; purgedLogs: number }> {
  const p = getDbPool();
  if (!p) return { purgedAttendance: 0, purgedPermits: 0, purgedLogs: 0 };

  const client = await p.connect();
  try {
    // 1. Purge attendance older than 5 months
    const attRes = await client.query(`
      DELETE FROM daily_attendance 
      WHERE date < CURRENT_DATE - INTERVAL '${monthsToKeep} months'
    `);

    // 2. Purge non-worked hours older than 5 months
    const permRes = await client.query(`
      DELETE FROM non_worked_hours 
      WHERE date < CURRENT_DATE - INTERVAL '${monthsToKeep} months'
    `);

    // 3. Purge email dispatch logs older than 5 months
    const logRes = await client.query(`
      DELETE FROM email_dispatch_logs 
      WHERE date < CURRENT_DATE - INTERVAL '${monthsToKeep} months'
    `);

    lastPurgeTime = Date.now();

    return {
      purgedAttendance: attRes.rowCount || 0,
      purgedPermits: permRes.rowCount || 0,
      purgedLogs: logRes.rowCount || 0
    };
  } finally {
    client.release();
  }
}

/**
 * Ensures schema exists, seeds initial data, and runs 5-month auto-retention purge
 */
export async function ensureDbInitialized(): Promise<void> {
  const p = getDbPool();
  if (!p) return;

  const client = await p.connect();
  try {
    // 1. Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(64) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          role VARCHAR(120) NOT NULL,
          area VARCHAR(80) NOT NULL DEFAULT 'DESPOSTE',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS employees (
          id VARCHAR(64) PRIMARY KEY,
          doc_number VARCHAR(32) NOT NULL,
          name VARCHAR(255) NOT NULL,
          area VARCHAR(80) NOT NULL,
          role VARCHAR(150) NOT NULL,
          active BOOLEAN NOT NULL DEFAULT TRUE,
          rut VARCHAR(32),
          email VARCHAR(255),
          phone VARCHAR(64),
          hire_date DATE,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS daily_attendance (
          id VARCHAR(128) PRIMARY KEY,
          date DATE NOT NULL,
          worker_id VARCHAR(64) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
          doc_number VARCHAR(32) NOT NULL,
          worker_name VARCHAR(255) NOT NULL,
          area VARCHAR(80) NOT NULL,
          status VARCHAR(8) NOT NULL DEFAULT '1',
          notes TEXT,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS non_worked_hours (
          id VARCHAR(128) PRIMARY KEY,
          date DATE NOT NULL,
          worker_id VARCHAR(64) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
          worker_name VARCHAR(255) NOT NULL,
          area VARCHAR(80) NOT NULL,
          start_time VARCHAR(16) NOT NULL,
          end_time VARCHAR(16) NOT NULL,
          total_minutes INTEGER NOT NULL,
          total_hours NUMERIC(6, 2) NOT NULL,
          category VARCHAR(64) NOT NULL,
          reason TEXT NOT NULL,
          approved_by VARCHAR(255) NOT NULL,
          paid BOOLEAN NOT NULL DEFAULT TRUE,
          status VARCHAR(32) NOT NULL DEFAULT 'APPROVED',
          has_certificate BOOLEAN NOT NULL DEFAULT FALSE,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS plant_config (
          id VARCHAR(32) PRIMARY KEY DEFAULT 'karmac_default_config',
          institution VARCHAR(255) NOT NULL DEFAULT 'FRIGORIFICO KARMAC SPA',
          area_name VARCHAR(120) NOT NULL DEFAULT 'DESPOSTE',
          supervisor_name VARCHAR(255) NOT NULL DEFAULT 'SEBASTIAN SORUCO C.',
          supervisor_role VARCHAR(150) NOT NULL DEFAULT 'JEFE DE PRODUCCIÓN',
          shift_start_time VARCHAR(16) NOT NULL DEFAULT '07:30',
          shift_end_time VARCHAR(16) NOT NULL DEFAULT '17:15',
          grace_minutes INTEGER NOT NULL DEFAULT 15,
          retention_months INTEGER NOT NULL DEFAULT 5,
          hr_email_recipients JSONB NOT NULL DEFAULT '["cgarrido@karmac.cl", "asistente.rrhh@karmac.cl"]'::jsonb,
          cc_email_recipients JSONB NOT NULL DEFAULT '["ssoruco@karmac.cl"]'::jsonb,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS email_dispatch_logs (
          id VARCHAR(128) PRIMARY KEY,
          date DATE NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          recipients JSONB NOT NULL,
          cc_recipients JSONB,
          subject TEXT NOT NULL,
          report_type VARCHAR(64) NOT NULL,
          status VARCHAR(32) NOT NULL DEFAULT 'SENT',
          summary TEXT NOT NULL,
          sent_by VARCHAR(255) NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_attendance_date ON daily_attendance(date);
      CREATE INDEX IF NOT EXISTS idx_attendance_worker ON daily_attendance(worker_id);
      CREATE INDEX IF NOT EXISTS idx_employees_area ON employees(area);
      CREATE INDEX IF NOT EXISTS idx_nonworked_date ON non_worked_hours(date);
    `);

    // 2. Seed Admin User
    await client.query(`
      INSERT INTO users (id, email, password_hash, name, role, area)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
    `, [
      'USR-ADMIN-01',
      ADMIN_CREDENTIALS.email,
      ADMIN_CREDENTIALS.password,
      ADMIN_CREDENTIALS.name,
      ADMIN_CREDENTIALS.role,
      ADMIN_CREDENTIALS.area
    ]);

    // 3. Seed Config
    await client.query(`
      INSERT INTO plant_config (id, institution, area_name, supervisor_name, supervisor_role, shift_start_time, shift_end_time, grace_minutes, hr_email_recipients, cc_email_recipients)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO NOTHING
    `, [
      'karmac_default_config',
      INITIAL_PLANT_CONFIG.institution,
      INITIAL_PLANT_CONFIG.areaName,
      INITIAL_PLANT_CONFIG.supervisorName,
      INITIAL_PLANT_CONFIG.supervisorRole,
      INITIAL_PLANT_CONFIG.shiftStartTime,
      INITIAL_PLANT_CONFIG.shiftEndTime,
      INITIAL_PLANT_CONFIG.graceMinutes,
      JSON.stringify(INITIAL_PLANT_CONFIG.hrEmailRecipients),
      JSON.stringify(INITIAL_PLANT_CONFIG.ccEmailRecipients)
    ]);

    // 4. Seed Employees if empty
    const empCountRes = await client.query('SELECT COUNT(*) FROM employees');
    const empCount = parseInt(empCountRes.rows[0].count, 10);

    if (empCount === 0) {
      for (const emp of INITIAL_EMPLOYEES) {
        await client.query(`
          INSERT INTO employees (id, doc_number, name, area, role, active)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO NOTHING
        `, [
          emp.id,
          emp.docNumber,
          emp.name,
          emp.area,
          emp.role,
          emp.active
        ]);
      }
    }

    // 5. Run automatic 5-month purge periodically (throttled to max once per hour)
    if (Date.now() - lastPurgeTime > 3600000) {
      await purgeOldRecords(5);
    }
  } finally {
    client.release();
  }
}
