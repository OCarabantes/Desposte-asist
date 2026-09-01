export type AreaType = 'DESPOSTE' | 'PORCIONADO' | 'SALA DE CUCHILLOS' | 'VARAS';

export type AttendanceCode = 
  | '1'   // Presente / Asistencia normal
  | '0'   // Ausente
  | 'V'   // Vacaciones
  | 'L'   // Licencia Médica
  | 'P'   // Permiso con Goce
  | 'PSG' // Permiso sin Goce
  | 'A'   // Atraso
  | 'F';  // Falla Injustificada

export interface Employee {
  id: string;
  docNumber: string;
  name: string;
  area: AreaType;
  role: string;
  active: boolean;
  rut?: string;
  email?: string;
  phone?: string;
  hireDate?: string;
  notes?: string;
}

export interface DailyAttendanceRecord {
  id: string; // `${date}_${workerId}`
  date: string; // YYYY-MM-DD
  workerId: string;
  docNumber: string;
  workerName: string;
  area: AreaType;
  status: AttendanceCode;
  checkInPhysical?: string;
  checkOutPhysical?: string;
  clockInTime?: string;
  clockOutTime?: string;
  hasDiscrepancy?: boolean;
  discrepancyType?: DiscrepancyType;
  discrepancyResolved?: boolean;
  discrepancyNote?: string;
  notes?: string;
  updatedAt: string;
}

export type DiscrepancyType = 
  | 'RELOJ_SIN_SALA'
  | 'SALA_SIN_RELOJ'
  | 'ATRASO_NO_JUSTIFICADO'
  | 'SALIDA_ANTICIPADA'
  | 'DIFERENCIA_HORAS';

export interface Discrepancy {
  id: string;
  date: string;
  workerId: string;
  docNumber: string;
  workerName: string;
  area: AreaType;
  type: DiscrepancyType;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  description: string;
  clockMark?: string;
  roomMark?: string;
  status: 'PENDING' | 'JUSTIFIED' | 'RESOLVED';
  justificationNote?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  sentToRRHH?: boolean;
}

export type NonWorkedCategory = 
  | 'PERMISO_ADMIN'
  | 'PERMISO_PERSONAL'
  | 'CONSULTA_MEDICA'
  | 'MUTUAL'
  | 'ATRASO'
  | 'SALIDA_ANTICIPADA'
  | 'CAPACITACION'
  | 'TRAMITE_INTERNO'
  | 'PAUSA_OPERATIVA'
  | 'OTRO';

export interface NonWorkedHoursRecord {
  id: string;
  date: string;
  workerId: string;
  workerName: string;
  area: AreaType;
  startTime: string;
  endTime: string;
  totalMinutes: number;
  totalHours: number;
  category: NonWorkedCategory;
  reason: string;
  approvedBy: string;
  paid: boolean;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  hasCertificate?: boolean;
  notes?: string;
  createdAt: string;
}

export interface ClockLog {
  id: string;
  date: string;
  time: string;
  docNumber: string;
  workerName?: string;
  type: 'ENTRADA' | 'SALIDA';
  device: string;
  rawText?: string;
}

export interface EmailDispatchLog {
  id: string;
  date: string;
  timestamp: string;
  recipients: string[];
  ccRecipients?: string[];
  subject: string;
  reportType: 'DAILY_SUMMARY' | 'DISCREPANCIES_ONLY' | 'PERMITS_ONLY';
  status: 'SENT' | 'SIMULATED';
  summary: string;
  sentBy: string;
}

export interface PlantConfig {
  institution: string;
  areaName: string;
  supervisorName: string;
  supervisorRole: string;
  shiftStartTime: string;
  shiftEndTime: string;
  graceMinutes: number;
  autoReconcile: boolean;
  hrEmailRecipients: string[];
  ccEmailRecipients?: string[];
}
