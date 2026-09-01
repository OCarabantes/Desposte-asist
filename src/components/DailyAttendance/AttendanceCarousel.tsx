import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  Clock, 
  Hourglass, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Keyboard,
  RotateCcw
} from 'lucide-react';
import { 
  Employee, 
  DailyAttendanceRecord, 
  AttendanceCode, 
  AreaType,
  NonWorkedHoursRecord
} from '../../types/attendance';

interface AttendanceCarouselProps {
  currentDate: string;
  employees: Employee[];
  attendanceRecords: DailyAttendanceRecord[];
  onUpdateStatus: (recordId: string, status: AttendanceCode, notes?: string) => void;
  onOpenPermitForWorker: (worker: Employee) => void;
  selectedArea: string;
  onSelectArea: (area: string) => void;
  dailyNonWorkedHours?: NonWorkedHoursRecord[];
}

export const AttendanceCarousel: React.FC<AttendanceCarouselProps> = ({
  currentDate,
  employees,
  attendanceRecords,
  onUpdateStatus,
  onOpenPermitForWorker,
  selectedArea,
  onSelectArea,
  dailyNonWorkedHours = []
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');
  const [animating, setAnimating] = useState<boolean>(false);

  const areas: AreaType[] = ['DESPOSTE', 'PORCIONADO', 'SALA DE CUCHILLOS', 'VARAS'];

  // Filter employees according to area
  const filteredEmployees = employees.filter(emp => {
    if (!emp.active) return false;
    if (selectedArea === 'ALL') return true;
    return emp.area === selectedArea;
  });

  // Ensure index stays in bounds when area filter changes
  useEffect(() => {
    if (currentIndex >= filteredEmployees.length) {
      setCurrentIndex(0);
    }
  }, [filteredEmployees.length, currentIndex]);

  const currentEmp = filteredEmployees[currentIndex];
  const currentRecord = currentEmp 
    ? attendanceRecords.find(r => r.workerId === currentEmp.id)
    : undefined;

  const currentStatus = currentRecord ? currentRecord.status : '1';

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (filteredEmployees.length === 0) return;
    setSlideDirection('next');
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % filteredEmployees.length);
      setAnimating(false);
    }, 100);
  }, [filteredEmployees.length]);

  const handlePrev = useCallback(() => {
    if (filteredEmployees.length === 0) return;
    setSlideDirection('prev');
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex(prev => (prev - 1 + filteredEmployees.length) % filteredEmployees.length);
      setAnimating(false);
    }, 100);
  }, [filteredEmployees.length]);

  // Handle Mark and advance to next card automatically
  const handleMarkAndAdvance = useCallback((status: AttendanceCode) => {
    if (!currentEmp || !currentRecord) return;
    onUpdateStatus(currentRecord.id, status);
    
    // Auto advance smoothly
    if (currentIndex < filteredEmployees.length - 1) {
      handleNext();
    }
  }, [currentEmp, currentRecord, currentIndex, filteredEmployees.length, handleNext, onUpdateStatus]);

  // Keyboard shortcut listeners (1, 0, V, L, P, Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === '1') {
        e.preventDefault();
        handleMarkAndAdvance('1');
      } else if (e.key === '0') {
        e.preventDefault();
        handleMarkAndAdvance('0');
      } else if (e.key.toLowerCase() === 'v') {
        e.preventDefault();
        handleMarkAndAdvance('V');
      } else if (e.key.toLowerCase() === 'l') {
        e.preventDefault();
        handleMarkAndAdvance('L');
      } else if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handleMarkAndAdvance('P');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMarkAndAdvance, handleNext, handlePrev]);

  if (!currentEmp || !currentRecord) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        No hay colaboradores en la sección seleccionada.
      </div>
    );
  }

  // Calculate progress
  const progressPercent = Math.round(((currentIndex + 1) / filteredEmployees.length) * 100);
  const presentTotal = attendanceRecords.filter(r => r.status === '1').length;
  const absentTotal = attendanceRecords.filter(r => r.status === '0' || r.status === 'F').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '820px', margin: '0 auto', width: '100%' }}>
      
      {/* Top Header Controls: Section Selector & Progress */}
      <div className="card" style={{ padding: '0.85rem 1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
          
          {/* Section pills */}
          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => { onSelectArea('ALL'); setCurrentIndex(0); }}
              className={`btn btn-sm ${selectedArea === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Todas ({employees.length})
            </button>
            {areas.map(area => {
              const count = employees.filter(e => e.area === area).length;
              return (
                <button
                  key={area}
                  onClick={() => { onSelectArea(area); setCurrentIndex(0); }}
                  className={`btn btn-sm ${selectedArea === area ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {area} ({count})
                </button>
              );
            })}
          </div>

          {/* Quick Counter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--color-present)', fontWeight: 600 }}>
              {presentTotal} Presentes
            </span>
            <span style={{ color: 'var(--border-medium)' }}>•</span>
            <span style={{ color: absentTotal > 0 ? 'var(--color-absent)' : 'var(--text-muted)', fontWeight: 600 }}>
              {absentTotal} Ausentes
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            <span>Colaborador {currentIndex + 1} de {filteredEmployees.length}</span>
            <span className="font-mono">{progressPercent}% completado</span>
          </div>
          <div style={{ height: '4px', background: 'var(--bg-input)', borderRadius: '2px', overflow: 'hidden' }}>
            <div 
              style={{ 
                width: `${progressPercent}%`, 
                height: '100%', 
                background: 'var(--text-primary)', 
                transition: 'width 0.2s ease',
                borderRadius: '2px' 
              }} 
            />
          </div>
        </div>
      </div>

      {/* Main Interactive Carousel Card Container */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        
        {/* Left Arrow */}
        <button
          onClick={handlePrev}
          className="btn btn-secondary"
          style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: '50%', 
            padding: 0, 
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Colaborador anterior (Flecha Izquierda)"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Central 1x1 Worker Card */}
        <div 
          className="card" 
          style={{ 
            flex: 1, 
            padding: '2rem', 
            background: 'var(--bg-glass-elevated)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)',
            transform: animating ? (slideDirection === 'next' ? 'translateX(-8px)' : 'translateX(8px)') : 'translateX(0)',
            opacity: animating ? 0.7 : 1,
            transition: 'all 0.12s cubic-bezier(0.16, 1, 0.3, 1)',
            minHeight: '340px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          {/* Card Top: Document Number & Section Tag */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span 
                className="font-mono" 
                style={{ 
                  fontSize: '1rem', 
                  fontWeight: 700, 
                  background: 'var(--bg-input)', 
                  padding: '0.2rem 0.6rem', 
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-secondary)'
                }}
              >
                #{currentEmp.docNumber}
              </span>
              <span className="badge" style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)', border: '1px solid var(--border-medium)', fontSize: '0.75rem' }}>
                {currentEmp.area}
              </span>
            </div>

            {/* Current Status Pill */}
            <div>
              {currentStatus === '1' && <span className="badge badge-present" style={{ fontSize: '0.8rem' }}>Presente</span>}
              {currentStatus === '0' && <span className="badge badge-absent" style={{ fontSize: '0.8rem' }}>Ausente / Falla</span>}
              {currentStatus === 'V' && <span className="badge badge-vacation" style={{ fontSize: '0.8rem' }}>Vacaciones</span>}
              {currentStatus === 'L' && <span className="badge badge-license" style={{ fontSize: '0.8rem' }}>Licencia Médica</span>}
              {currentStatus === 'P' && <span className="badge badge-permission" style={{ fontSize: '0.8rem' }}>Permiso</span>}
            </div>
          </div>

          {/* Card Center: Big Name & Details */}
          <div style={{ margin: '1.5rem 0', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              {currentEmp.name}
            </h2>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              {currentEmp.role}
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.25rem 0.65rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Dotación Oficial Karmac • Asistencia de Sala</span>
            </div>

            {currentStatus === 'P' && dailyNonWorkedHours.some(h => h.workerId === currentEmp.id) && (
              <div style={{ marginTop: '0.85rem', display: 'flex', justifyContent: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-permission)', background: 'var(--color-permission-bg)', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-permission-border)', fontSize: '0.8rem', fontWeight: 600 }}>
                  <Hourglass size={14} />
                  <span>
                    Tiempo de Permiso: {dailyNonWorkedHours.filter(h => h.workerId === currentEmp.id).reduce((acc, curr) => acc + curr.totalHours, 0)} Hrs registradas
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Card Bottom: Tactile 1-Click Action Buttons */}
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
              
              {/* Button 1: Presente */}
              <button
                type="button"
                onClick={() => handleMarkAndAdvance('1')}
                className={`btn ${currentStatus === '1' ? 'btn-success' : 'btn-secondary'}`}
                style={{ 
                  flexDirection: 'column', 
                  padding: '0.75rem 0.25rem', 
                  gap: '0.25rem',
                  borderColor: currentStatus === '1' ? 'var(--color-present-border)' : undefined
                }}
                title="Presione [1] en teclado"
              >
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>1</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Presente</div>
              </button>

              {/* Button 2: Ausente */}
              <button
                type="button"
                onClick={() => handleMarkAndAdvance('0')}
                className={`btn ${currentStatus === '0' ? 'btn-danger' : 'btn-secondary'}`}
                style={{ 
                  flexDirection: 'column', 
                  padding: '0.75rem 0.25rem', 
                  gap: '0.25rem',
                  borderColor: currentStatus === '0' ? 'var(--color-absent-border)' : undefined
                }}
                title="Presione [0] en teclado"
              >
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>0</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Ausente</div>
              </button>

              {/* Button 3: Vacaciones */}
              <button
                type="button"
                onClick={() => handleMarkAndAdvance('V')}
                className="btn btn-secondary"
                style={{ 
                  flexDirection: 'column', 
                  padding: '0.75rem 0.25rem', 
                  gap: '0.25rem',
                  background: currentStatus === 'V' ? 'var(--color-vacation-bg)' : undefined,
                  color: currentStatus === 'V' ? 'var(--color-vacation)' : undefined,
                  borderColor: currentStatus === 'V' ? 'var(--color-vacation-border)' : undefined
                }}
                title="Presione [V] en teclado"
              >
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>V</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Vacaciones</div>
              </button>

              {/* Button 4: Licencia */}
              <button
                type="button"
                onClick={() => handleMarkAndAdvance('L')}
                className="btn btn-secondary"
                style={{ 
                  flexDirection: 'column', 
                  padding: '0.75rem 0.25rem', 
                  gap: '0.25rem',
                  background: currentStatus === 'L' ? 'var(--color-license-bg)' : undefined,
                  color: currentStatus === 'L' ? 'var(--color-license)' : undefined,
                  borderColor: currentStatus === 'L' ? 'var(--color-license-border)' : undefined
                }}
                title="Presione [L] en teclado"
              >
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>L</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Licencia</div>
              </button>

              {/* Button 5: Permiso */}
              <button
                type="button"
                onClick={() => handleMarkAndAdvance('P')}
                className="btn btn-secondary"
                style={{ 
                  flexDirection: 'column', 
                  padding: '0.75rem 0.25rem', 
                  gap: '0.25rem',
                  background: currentStatus === 'P' ? 'var(--color-permission-bg)' : undefined,
                  color: currentStatus === 'P' ? 'var(--color-permission)' : undefined,
                  borderColor: currentStatus === 'P' ? 'var(--color-permission-border)' : undefined
                }}
                title="Presione [P] en teclado"
              >
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>P</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Permiso</div>
              </button>

            </div>

            {/* Auxiliary actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => onOpenPermitForWorker(currentEmp)}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                <Hourglass size={13} />
                <span>Registrar Horas No Trabajadas / Permiso Detallado</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                <span>Saltar / Siguiente →</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Arrow */}
        <button
          onClick={handleNext}
          className="btn btn-secondary"
          style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: '50%', 
            padding: 0, 
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Siguiente colaborador (Flecha Derecha)"
        >
          <ChevronRight size={20} />
        </button>

      </div>

      {/* Keyboard Shortcuts Hint Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap', padding: '0.5rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.725rem', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Keyboard size={13} />
          <span>Atajos de teclado rápidos:</span>
        </div>
        <span><kbd style={{ background: 'var(--bg-input)', padding: '0.1rem 0.35rem', borderRadius: '3px', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}>1</kbd> Presente</span>
        <span><kbd style={{ background: 'var(--bg-input)', padding: '0.1rem 0.35rem', borderRadius: '3px', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}>0</kbd> Ausente</span>
        <span><kbd style={{ background: 'var(--bg-input)', padding: '0.1rem 0.35rem', borderRadius: '3px', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}>V</kbd> Vacaciones</span>
        <span><kbd style={{ background: 'var(--bg-input)', padding: '0.1rem 0.35rem', borderRadius: '3px', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}>L</kbd> Licencia</span>
        <span><kbd style={{ background: 'var(--bg-input)', padding: '0.1rem 0.35rem', borderRadius: '3px', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}>P</kbd> Permiso</span>
        <span><kbd style={{ background: 'var(--bg-input)', padding: '0.1rem 0.35rem', borderRadius: '3px', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}>← / →</kbd> Navegar</span>
      </div>

      {/* Horizontal Worker Ribbon / Thumbnail Strip */}
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Cinta de Cuadrilla ({filteredEmployees.length} colaboradores)
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '0.4rem', 
          overflowX: 'auto', 
          paddingBottom: '0.5rem',
          scrollbarWidth: 'thin'
        }}>
          {filteredEmployees.map((emp, idx) => {
            const rec = attendanceRecords.find(r => r.workerId === emp.id);
            const st = rec ? rec.status : '1';
            const isSelected = idx === currentIndex;

            return (
              <div
                key={emp.id}
                onClick={() => setCurrentIndex(idx)}
                style={{
                  minWidth: '95px',
                  background: isSelected ? 'var(--bg-input)' : 'var(--bg-glass)',
                  border: isSelected ? '1px solid var(--text-primary)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.45rem',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.15rem' }}>
                  <span className="font-mono" style={{ fontSize: '0.7rem', fontWeight: 700, color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    #{emp.docNumber}
                  </span>
                  <span className={`matrix-cell matrix-cell-${st}`} style={{ width: '16px', height: '16px', fontSize: '0.6rem' }}>
                    {st}
                  </span>
                </div>
                <div style={{ fontSize: '0.725rem', fontWeight: isSelected ? 600 : 400, color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {emp.name.split(' ')[0]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
