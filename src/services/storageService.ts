import { 
  Employee, 
  DailyAttendanceRecord, 
  NonWorkedHoursRecord, 
  PlantConfig, 
  AttendanceCode,
  EmailDispatchLog
} from '../types/attendance';
import { INITIAL_EMPLOYEES, INITIAL_PLANT_CONFIG } from '../data/initialRoster';
import { ApiService } from './apiService';

const STORAGE_KEYS = {
  EMPLOYEES: 'karmac_desposte_employees_v1',
  ATTENDANCE: 'karmac_desposte_attendance_v1',
  NON_WORKED_HOURS: 'karmac_desposte_non_worked_hours_v1',
  PLANT_CONFIG: 'karmac_desposte_config_v1',
  EMAIL_LOGS: 'karmac_desposte_email_logs_v1',
  CURRENT_DATE: 'karmac_desposte_current_date_v1',
  THEME: 'karmac_desposte_theme_v1'
};

export class StorageService {
  // Config
  static getPlantConfig(): PlantConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.PLANT_CONFIG);
    if (!raw) {
      this.savePlantConfig(INITIAL_PLANT_CONFIG);
      return INITIAL_PLANT_CONFIG;
    }
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.hrEmailRecipients || parsed.hrEmailRecipients.length === 0) {
        parsed.hrEmailRecipients = INITIAL_PLANT_CONFIG.hrEmailRecipients;
        parsed.ccEmailRecipients = INITIAL_PLANT_CONFIG.ccEmailRecipients;
        this.savePlantConfig(parsed);
      }
      return parsed;
    } catch {
      return INITIAL_PLANT_CONFIG;
    }
  }

  static savePlantConfig(config: PlantConfig): void {
    localStorage.setItem(STORAGE_KEYS.PLANT_CONFIG, JSON.stringify(config));
    ApiService.saveConfig(config).catch(() => {});
    window.dispatchEvent(new CustomEvent('karmac-config-updated'));
  }

  // Employees
  static getEmployees(): Employee[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    if (!raw) {
      this.saveEmployees(INITIAL_EMPLOYEES);
      return INITIAL_EMPLOYEES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_EMPLOYEES;
    }
  }

  static saveEmployees(employees: Employee[]): void {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    window.dispatchEvent(new CustomEvent('karmac-employees-updated'));
  }

  static addEmployee(emp: Omit<Employee, 'id'>): Employee {
    const list = this.getEmployees();
    const id = `EMP-${Date.now().toString(36)}`;
    const newEmp: Employee = { ...emp, id };
    list.push(newEmp);
    this.saveEmployees(list);
    ApiService.saveEmployee(newEmp).catch(() => {});
    return newEmp;
  }

  static updateEmployee(employee: Employee): void {
    const list = this.getEmployees();
    const idx = list.findIndex(e => e.id === employee.id);
    if (idx !== -1) {
      list[idx] = employee;
      this.saveEmployees(list);
      ApiService.saveEmployee(employee).catch(() => {});
    }
  }

  static deleteEmployee(id: string): void {
    const list = this.getEmployees().filter(e => e.id !== id);
    this.saveEmployees(list);
    ApiService.deleteEmployee(id).catch(() => {});
  }

  // Daily Attendance
  static getAllAttendance(): DailyAttendanceRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static getAttendanceForDate(dateStr: string): DailyAttendanceRecord[] {
    const all = this.getAllAttendance();
    const employees = this.getEmployees();
    
    // Ensure all active employees have a record for this date
    const dateRecords = all.filter(r => r.date === dateStr);
    const existingIds = new Set(dateRecords.map(r => r.workerId));

    let modified = false;
    employees.filter(e => e.active).forEach(emp => {
      if (!existingIds.has(emp.id)) {
        const newRecord: DailyAttendanceRecord = {
          id: `${dateStr}_${emp.id}`,
          date: dateStr,
          workerId: emp.id,
          docNumber: emp.docNumber,
          workerName: emp.name,
          area: emp.area,
          status: '1',
          updatedAt: new Date().toISOString()
        };
        all.push(newRecord);
        dateRecords.push(newRecord);
        modified = true;
      }
    });

    if (modified) {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(all));
    }

    return dateRecords;
  }

  static saveAttendanceRecord(record: DailyAttendanceRecord): void {
    const all = this.getAllAttendance();
    const idx = all.findIndex(r => r.id === record.id);
    if (idx !== -1) {
      all[idx] = { ...record, updatedAt: new Date().toISOString() };
    } else {
      all.push({ ...record, updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(all));
    ApiService.saveAttendance(record).catch(() => {});
    window.dispatchEvent(new CustomEvent('karmac-attendance-updated'));
  }

  static bulkUpdateAttendance(records: DailyAttendanceRecord[]): void {
    const all = this.getAllAttendance();
    const map = new Map(all.map(r => [r.id, r]));
    records.forEach(r => {
      map.set(r.id, { ...r, updatedAt: new Date().toISOString() });
    });
    const updated = Array.from(map.values());
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(updated));
    ApiService.saveAttendance(records).catch(() => {});
    window.dispatchEvent(new CustomEvent('karmac-attendance-updated'));
  }

  // Non Worked Hours / Permisos
  static getNonWorkedHours(): NonWorkedHoursRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NON_WORKED_HOURS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static saveNonWorkedHours(records: NonWorkedHoursRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.NON_WORKED_HOURS, JSON.stringify(records));
    window.dispatchEvent(new CustomEvent('karmac-nonworked-updated'));
  }

  static addNonWorkedHours(record: Omit<NonWorkedHoursRecord, 'id' | 'createdAt'>): NonWorkedHoursRecord {
    const all = this.getNonWorkedHours();
    const id = `HNT-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`;
    const fullRecord: NonWorkedHoursRecord = {
      ...record,
      id,
      createdAt: new Date().toISOString()
    };
    all.unshift(fullRecord);
    this.saveNonWorkedHours(all);
    ApiService.savePermit(fullRecord).catch(() => {});
    return fullRecord;
  }

  static deleteNonWorkedHours(id: string): void {
    const all = this.getNonWorkedHours().filter(r => r.id !== id);
    this.saveNonWorkedHours(all);
    ApiService.deletePermit(id).catch(() => {});
  }

  // Email Dispatch Logs
  static getEmailLogs(): EmailDispatchLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EMAIL_LOGS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static saveEmailLogs(logs: EmailDispatchLog[]): void {
    localStorage.setItem(STORAGE_KEYS.EMAIL_LOGS, JSON.stringify(logs));
    window.dispatchEvent(new CustomEvent('karmac-emails-updated'));
  }

  static logEmailDispatch(log: Omit<EmailDispatchLog, 'id' | 'timestamp'>): EmailDispatchLog {
    const all = this.getEmailLogs();
    const id = `EMAIL-${Date.now().toString(36)}`;
    const fullLog: EmailDispatchLog = {
      ...log,
      id,
      timestamp: new Date().toISOString()
    };
    all.unshift(fullLog);
    this.saveEmailLogs(all);
    ApiService.saveEmailLog(fullLog).catch(() => {});
    return fullLog;
  }

  /**
   * Automatically purges records older than 5 months (150 days) from localStorage
   */
  static purgeOldLocalData(monthsToKeep: number = 5): void {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsToKeep);
    const cutoffStr = cutoffDate.toISOString().substring(0, 10);

    const allAtt = this.getAllAttendance().filter(a => a.date >= cutoffStr);
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(allAtt));

    const allHnt = this.getNonWorkedHours().filter(h => h.date >= cutoffStr);
    localStorage.setItem(STORAGE_KEYS.NON_WORKED_HOURS, JSON.stringify(allHnt));

    const allEmails = this.getEmailLogs().filter(e => e.date >= cutoffStr);
    localStorage.setItem(STORAGE_KEYS.EMAIL_LOGS, JSON.stringify(allEmails));
  }

  /**
   * Sync initial data from PostgreSQL if available
   */
  static async syncWithRemoteDb(): Promise<void> {
    try {
      this.purgeOldLocalData(5);

      const [remoteEmps, remoteAtt, remoteHnt, remoteConfig] = await Promise.all([
        ApiService.fetchEmployees(),
        ApiService.fetchAttendance(),
        ApiService.fetchPermits(),
        ApiService.fetchConfig()
      ]);

      if (remoteEmps && remoteEmps.length > 0) {
        localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(remoteEmps));
      }
      if (remoteAtt && remoteAtt.length > 0) {
        localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(remoteAtt));
      }
      if (remoteHnt) {
        localStorage.setItem(STORAGE_KEYS.NON_WORKED_HOURS, JSON.stringify(remoteHnt));
      }
      if (remoteConfig) {
        localStorage.setItem(STORAGE_KEYS.PLANT_CONFIG, JSON.stringify(remoteConfig));
      }
    } catch {
      // Graceful fallback to localStorage
    }
  }
}
