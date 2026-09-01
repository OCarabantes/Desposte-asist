export interface UserSession {
  email: string;
  name: string;
  role: string;
  area: string;
  loginTimestamp: string;
}

const AUTH_STORAGE_KEY = 'karmac_desposte_session_v1';

export const ADMIN_CREDENTIALS = {
  email: 'ssoruco@karmac.cl',
  password: 'Mandoneao26',
  name: 'SEBASTIAN SORUCO C.',
  role: 'Jefe de Producción (Admin)',
  area: 'DESPOSTE'
};

export class AuthService {
  /**
   * Validate credentials and create session
   */
  static login(email: string, password: string): { success: boolean; message?: string; session?: UserSession } {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (cleanEmail === ADMIN_CREDENTIALS.email.toLowerCase() && cleanPassword === ADMIN_CREDENTIALS.password) {
      const session: UserSession = {
        email: ADMIN_CREDENTIALS.email,
        name: ADMIN_CREDENTIALS.name,
        role: ADMIN_CREDENTIALS.role,
        area: ADMIN_CREDENTIALS.area,
        loginTimestamp: new Date().toISOString()
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      return { success: true, session };
    }

    return { 
      success: false, 
      message: 'Correo electrónico o contraseña incorrecta. Verifique sus credenciales de acceso.' 
    };
  }

  /**
   * Get active session
   */
  static getSession(): UserSession | null {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  /**
   * Logout user
   */
  static logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    window.location.reload();
  }
}
