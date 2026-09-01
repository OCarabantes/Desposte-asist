-- ==========================================================================
-- FRIGORÍFICO KARMAC SPA - ÁREA DESPOSTE
-- PostgreSQL Database Schema for Attendance & Non-Worked Hours System
-- Auto-Retention Policy: 5 Months (150 Days Rolling Window)
-- ==========================================================================

-- 1. Users / Authentication Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(120) NOT NULL,
    area VARCHAR(80) NOT NULL DEFAULT 'DESPOSTE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Employees Roster Table (47 Official Workers)
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

-- 3. Daily Attendance Records Table (Auto-purged after 5 months)
CREATE TABLE IF NOT EXISTS daily_attendance (
    id VARCHAR(128) PRIMARY KEY, -- '${date}_${worker_id}'
    date DATE NOT NULL,
    worker_id VARCHAR(64) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    doc_number VARCHAR(32) NOT NULL,
    worker_name VARCHAR(255) NOT NULL,
    area VARCHAR(80) NOT NULL,
    status VARCHAR(8) NOT NULL DEFAULT '1',
    notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Non-Worked Hours & Permits Table (Auto-purged after 5 months)
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

-- 5. Plant Configuration Table
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

-- 6. Email Dispatch Audit Logs Table (Auto-purged after 5 months)
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_attendance_date ON daily_attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_worker ON daily_attendance(worker_id);
CREATE INDEX IF NOT EXISTS idx_employees_area ON employees(area);
CREATE INDEX IF NOT EXISTS idx_nonworked_date ON non_worked_hours(date);
CREATE INDEX IF NOT EXISTS idx_nonworked_worker ON non_worked_hours(worker_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_date ON email_dispatch_logs(date);
