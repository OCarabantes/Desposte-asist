import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Hourglass, 
  Table2, 
  Users, 
  Settings,
  Sun,
  Moon,
  LogOut,
  UserCheck
} from 'lucide-react';
import { PlantConfig } from '../../types/attendance';
import { UserSession } from '../../services/authService';
import logoImg from '../../img/LOGO.png';

export type NavTab = 
  | 'dashboard' 
  | 'attendance' 
  | 'non-worked-hours' 
  | 'monthly-matrix' 
  | 'staff' 
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  config: PlantConfig;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  session: UserSession | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  config,
  theme,
  onToggleTheme,
  session,
  onLogout
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Panel General',
      sublabel: 'KPIs & Dotación',
      icon: LayoutDashboard
    },
    {
      id: 'attendance' as NavTab,
      label: 'Pase de Asistencia',
      sublabel: 'Carrusel 1x1 / Tabla',
      icon: CheckSquare
    },
    {
      id: 'non-worked-hours' as NavTab,
      label: 'Horas No Trabajadas',
      sublabel: 'Permisos & Salidas',
      icon: Hourglass
    },
    {
      id: 'monthly-matrix' as NavTab,
      label: 'Planilla Mensual',
      sublabel: 'Matriz 31 Días KARMAC',
      icon: Table2
    },
    {
      id: 'staff' as NavTab,
      label: 'Dotación de Personal',
      sublabel: '47 Colaboradores',
      icon: Users
    },
    {
      id: 'settings' as NavTab,
      label: 'Configuración',
      sublabel: 'Turnos & Correos RRHH',
      icon: Settings
    }
  ];

  return (
    <aside className="sidebar">
      {/* Brand & Header */}
      <div style={{ padding: '1.25rem 1.25rem', borderBottom: '1px solid var(--border-medium)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
          <img 
            src={logoImg} 
            alt="Karmac" 
            style={{ 
              height: '32px', 
              maxWidth: '85px', 
              objectFit: 'contain'
            }} 
          />
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              KARMAC
            </div>
            <div style={{ fontSize: '0.675rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.04em' }}>
              ÁREA DESPOSTE
            </div>
          </div>
        </div>

        {/* Logged in User Badge */}
        <div style={{ 
          fontSize: '0.725rem', 
          background: 'var(--bg-input)', 
          padding: '0.45rem 0.6rem', 
          borderRadius: 'var(--radius-md)',
          marginTop: '0.6rem',
          border: '1px solid var(--border-medium)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem'
        }}>
          <UserCheck size={14} color="var(--color-present)" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {session?.name || config.supervisorName}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              {session?.email || 'ssoruco@karmac.cl'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ flex: 1, padding: '0.75rem 0.6rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                width: '100%',
                padding: '0.6rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid',
                borderColor: isActive ? 'var(--border-medium)' : 'transparent',
                background: isActive ? 'var(--bg-card)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all var(--transition-fast)',
                position: 'relative'
              }}
            >
              <Icon size={16} color={isActive ? 'var(--text-primary)' : 'var(--text-muted)'} />
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: isActive ? 600 : 500, lineHeight: 1.2 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                  {item.sublabel}
                </div>
              </div>

              {isActive && (
                <div style={{
                  position: 'absolute',
                  left: '2px',
                  top: '18%',
                  bottom: '18%',
                  width: '3px',
                  borderRadius: '2px',
                  background: 'var(--text-primary)'
                }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer, Theme Switch & Logout */}
      <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Karmac SpA v1.3</div>
            <div>Control Desposte</div>
          </div>

          <button
            onClick={onToggleTheme}
            className="btn btn-ghost btn-sm"
            style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)' }}
            title={theme === 'dark' ? 'Cambiar a Modo Crema' : 'Cambiar a Modo Oscuro'}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>

        {/* Log Out Action */}
        <button
          onClick={onLogout}
          className="btn btn-ghost btn-sm"
          style={{ 
            width: '100%', 
            justifyContent: 'flex-start', 
            fontSize: '0.725rem', 
            color: 'var(--color-absent)',
            border: '1px solid var(--border-subtle)',
            padding: '0.35rem 0.5rem'
          }}
          title="Cerrar sesión de administrador"
        >
          <LogOut size={13} />
          <span>Cerrar Sesión</span>
        </button>

      </div>
    </aside>
  );
};
