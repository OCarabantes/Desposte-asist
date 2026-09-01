import { 
  Employee, 
  DailyAttendanceRecord, 
  NonWorkedHoursRecord, 
  PlantConfig, 
  EmailDispatchLog 
} from '../types/attendance';

export class ApiService {
  private static isApiAvailable: boolean | null = null;

  /**
   * Check if backend API is responding
   */
  static async checkApi(): Promise<boolean> {
    try {
      const res = await fetch('/api/init-db', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        this.isApiAvailable = data.status === 'connected';
        return this.isApiAvailable;
      }
      this.isApiAvailable = false;
      return false;
    } catch {
      this.isApiAvailable = false;
      return false;
    }
  }

  // Employees
  static async fetchEmployees(): Promise<Employee[] | null> {
    try {
      const res = await fetch('/api/employees');
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  static async saveEmployee(emp: Employee): Promise<boolean> {
    try {
      const res = await fetch('/api/employees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emp)
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  static async deleteEmployee(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/employees?id=${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  }

  // Attendance
  static async fetchAttendance(date?: string, month?: number, year?: number): Promise<DailyAttendanceRecord[] | null> {
    try {
      let url = '/api/attendance';
      if (date) url += `?date=${date}`;
      else if (month && year) url += `?month=${month}&year=${year}`;

      const res = await fetch(url);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  static async saveAttendance(records: DailyAttendanceRecord[] | DailyAttendanceRecord): Promise<boolean> {
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(records)
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // Permits (HNT)
  static async fetchPermits(): Promise<NonWorkedHoursRecord[] | null> {
    try {
      const res = await fetch('/api/permits');
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  static async savePermit(record: NonWorkedHoursRecord | Omit<NonWorkedHoursRecord, 'id' | 'createdAt'>): Promise<boolean> {
    try {
      const res = await fetch('/api/permits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  static async deletePermit(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/permits?id=${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  }

  // Config
  static async fetchConfig(): Promise<PlantConfig | null> {
    try {
      const res = await fetch('/api/config');
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  static async saveConfig(config: PlantConfig): Promise<boolean> {
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // Email Logs
  static async fetchEmailLogs(): Promise<EmailDispatchLog[] | null> {
    try {
      const res = await fetch('/api/email-logs');
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  static async saveEmailLog(log: EmailDispatchLog | Omit<EmailDispatchLog, 'id' | 'timestamp'>): Promise<boolean> {
    try {
      const res = await fetch('/api/email-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log)
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}
