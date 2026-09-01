import React from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  PlusCircle, 
  Mail
} from 'lucide-react';
import { PlantConfig } from '../../types/attendance';

interface HeaderProps {
  currentDate: string;
  onDateChange: (newDate: string) => void;
  config: PlantConfig;
  onOpenNewPermit: () => void;
  onExportExcel: () => void;
  onOpenSendEmail: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  onDateChange,
  config,
  onOpenNewPermit,
  onExportExcel,
  onOpenSendEmail
}) => {
  const handleShiftDate = (days: number) => {
    const d = new Date(currentDate + 'T00:00:00');
    d.setDate(d.getDate() + days);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    onDateChange(`${yyyy}-${mm}-${dd}`);
  };

  const handleSetToday = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    onDateChange(`${yyyy}-${mm}-${dd}`);
  };

  const dateObj = new Date(currentDate + 'T00:00:00');
  const formattedDate = dateObj.toLocaleDateString('es-CL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="top-bar">
      {/* Date controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: '0.15rem 0.25rem' }}>
          <button 
            onClick={() => handleShiftDate(-1)} 
            className="btn btn-ghost btn-sm" 
            style={{ padding: '0.25rem 0.4rem' }}
            title="Día anterior"
          >
            <ChevronLeft size={14} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.15rem 0.4rem' }}>
            <Calendar size={13} color="var(--text-muted)" />
            <input 
              type="date" 
              value={currentDate} 
              onChange={(e) => onDateChange(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            />
          </div>
          <button 
            onClick={() => handleShiftDate(1)} 
            className="btn btn-ghost btn-sm" 
            style={{ padding: '0.25rem 0.4rem' }}
            title="Día siguiente"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        <button 
          onClick={handleSetToday}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.725rem', fontWeight: 500 }}
        >
          Hoy
        </button>

        <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
          {formattedDate}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          onClick={onOpenNewPermit}
          className="btn btn-secondary btn-sm"
          title="Registrar permiso u horas no trabajadas"
        >
          <PlusCircle size={13} color="var(--text-secondary)" />
          <span>Registrar Permiso</span>
        </button>

        <button
          onClick={onExportExcel}
          className="btn btn-secondary btn-sm"
          title="Descargar planilla oficial con formato KARMAC"
        >
          <Download size={13} />
          <span>Excel Matriz</span>
        </button>

        {/* Dedicated Email Button */}
        <button
          onClick={onOpenSendEmail}
          className="btn btn-primary btn-sm"
          title="Enviar reporte a cgarrido@karmac.cl y asistente.rrhh@karmac.cl"
        >
          <Mail size={13} />
          <span>Enviar a RRHH</span>
        </button>
      </div>
    </header>
  );
};
