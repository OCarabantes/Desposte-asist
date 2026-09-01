import React from 'react';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Hourglass, 
  Layers, 
  ArrowRight,
  ShieldCheck,
  CalendarDays,
  Mail
} from 'lucide-react';
import { 
  Employee, 
  DailyAttendanceRecord, 
  NonWorkedHoursRecord, 
  PlantConfig, 
  AreaType 
} from '../../types/attendance';
import { NavTab } from '../Layout/Sidebar';

interface DashboardViewProps {
  currentDate: string;
  employees: Employee[];
  attendance: DailyAttendanceRecord[];
  nonWorkedHours: NonWorkedHoursRecord[];
  config: PlantConfig;
  onNavigateTab: (tab: NavTab) => void;
  onOpenNewPermit: () => void;
  onOpenSendEmail?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentDate,
  employees,
  attendance,
  nonWorkedHours,
  config,
  onNavigateTab,
  onOpenNewPermit,
  onOpenSendEmail
}) => {
  const activeEmps = employees.filter(e => e.active);
  const totalStaff = activeEmps.length;

  const presentCount = attendance.filter(a => a.status === '1').length;
  const absentCount = attendance.filter(a => a.status === '0' || a.status === 'F').length;
  const vacationCount = attendance.filter(a => a.status === 'V').length;
  const licenseCount = attendance.filter(a => a.status === 'L').length;
  const permissionCount = attendance.filter(a => a.status === 'P' || a.status === 'PSG').length;

  const attendanceRate = totalStaff > 0 ? Math.round((presentCount / totalStaff) * 100) : 0;

  // Non-worked hours today
  const todayNonWorked = nonWorkedHours.filter(n => n.date === currentDate);
  const totalLostMinutes = todayNonWorked.reduce((sum, item) => sum + item.totalMinutes, 0);
  const totalLostHours = (totalLostMinutes / 60).toFixed(1);

  const sections: { area: AreaType; expected: number }[] = [
    { area: 'DESPOSTE', expected: 31 },
    { area: 'PORCIONADO', expected: 10 },
    { area: 'SALA DE CUCHILLOS', expected: 1 },
    { area: 'VARAS', expected: 5 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Executive Welcome Card */}
      <div className="card" style={{ 
        background: 'var(--bg-glass-elevated)',
        border: '1px solid var(--border-medium)',
        padding: '1.5rem'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge" style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)', border: '1px solid var(--border-medium)' }}>
                {config.institution}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>•</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Turno {config.shiftStartTime} a {config.shiftEndTime}
              </span>
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '0.25rem' }}>
              Control de Asistencia - {config.areaName}
            </h1>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', maxWidth: '620px' }}>
              Registro diario de presencia en sala, novedades de dotación y control de horas no trabajadas para envío oficial a Recursos Humanos.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <button
              onClick={() => onNavigateTab('attendance')}
              className="btn btn-primary"
            >
              <Layers size={14} />
              <span>Pase de Asistencia (Carrusel 1x1)</span>
            </button>

            <button
              onClick={onOpenNewPermit}
              className="btn btn-secondary"
            >
              <Hourglass size={14} />
              <span>Registrar Permiso</span>
            </button>

            {onOpenSendEmail && (
              <button
                onClick={onOpenSendEmail}
                className="btn btn-secondary"
                title="Enviar informe a Recursos Humanos"
              >
                <Mail size={14} />
                <span>Enviar a RRHH</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid-kpi">
        
        {/* KPI 1: Total Staff */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Dotación Activa
            </span>
            <Users size={16} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {totalStaff}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Colaboradores registrados en nómina
          </div>
        </div>

        {/* KPI 2: Present & Attendance Rate */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Presentes en Sala
            </span>
            <CheckCircle2 size={16} color="var(--color-present)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-present)', fontFamily: 'var(--font-mono)' }}>
              {presentCount}
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              ({attendanceRate}%)
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {totalStaff - presentCount} ausencias en la jornada
          </div>
        </div>

        {/* KPI 3: Absences Breakdown */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Novedades & Ausencias
            </span>
            <XCircle size={16} color="var(--color-absent)" />
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
            <span className="badge badge-absent" title="Fallas / Ausencias">{absentCount} Fallas</span>
            <span className="badge badge-vacation" title="Vacaciones">{vacationCount} Vac</span>
            <span className="badge badge-license" title="Licencias Médicas">{licenseCount} Lic</span>
            <span className="badge badge-permission" title="Permisos">{permissionCount} Perm</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Total novedades registradas
          </div>
        </div>

        {/* KPI 4: Non-Worked Hours (HNT) */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Horas No Trabajadas
            </span>
            <Hourglass size={16} color="var(--color-permission)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {totalLostHours} <span style={{ fontSize: '1rem', fontWeight: 500 }}>hrs</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {todayNonWorked.length} permisos / salidas en el día
          </div>
        </div>

      </div>

      {/* Production Sections Strip */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Dotación por Sección Productiva</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Distribución de personal en los 4 sectores del área de Desposte
            </p>
          </div>

          <button 
            onClick={() => onNavigateTab('attendance')} 
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.75rem' }}
          >
            <span>Ver Pase de Asistencia</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {sections.map(sec => {
            const secEmployees = activeEmps.filter(e => e.area === sec.area);
            const secPresent = attendance.filter(a => a.area === sec.area && a.status === '1').length;
            const secRate = secEmployees.length > 0 ? Math.round((secPresent / secEmployees.length) * 100) : 0;

            return (
              <div 
                key={sec.area}
                className="card card-interactive"
                onClick={() => onNavigateTab('attendance')}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{sec.area}</span>
                  <span className="badge" style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)', border: '1px solid var(--border-medium)' }}>
                    {secPresent} / {secEmployees.length}
                  </span>
                </div>

                <div style={{ height: '5px', background: 'var(--bg-input)', borderRadius: '3px', overflow: 'hidden', margin: '0.5rem 0' }}>
                  <div 
                    style={{ 
                      width: `${secRate}%`, 
                      height: '100%', 
                      background: secRate === 100 ? 'var(--color-present)' : 'var(--text-primary)',
                      borderRadius: '3px' 
                    }} 
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
                  <span>Cumplimiento:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{secRate}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
