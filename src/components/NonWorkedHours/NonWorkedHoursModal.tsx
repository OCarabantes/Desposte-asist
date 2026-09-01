import React, { useState, useEffect } from 'react';
import { 
  X, 
  Hourglass, 
  Check
} from 'lucide-react';
import { 
  Employee, 
  NonWorkedCategory, 
  NonWorkedHoursRecord, 
  PlantConfig 
} from '../../types/attendance';
const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const parts = timeStr.split(':').map(Number);
  return (parts[0] || 0) * 60 + (parts[1] || 0);
};

interface NonWorkedHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: string;
  employees: Employee[];
  config: PlantConfig;
  preselectedWorker?: Employee | null;
  onSave: (record: Omit<NonWorkedHoursRecord, 'id' | 'createdAt'>) => void;
}

export const NonWorkedHoursModal: React.FC<NonWorkedHoursModalProps> = ({
  isOpen,
  onClose,
  currentDate,
  employees,
  config,
  preselectedWorker,
  onSave
}) => {
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
  const [date, setDate] = useState<string>(currentDate);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('10:30');
  const [category, setCategory] = useState<NonWorkedCategory>('CONSULTA_MEDICA');
  const [paid, setPaid] = useState<boolean>(true);
  const [hasCertificate, setHasCertificate] = useState<boolean>(true);
  const [reason, setReason] = useState<string>('');
  const [approvedBy, setApprovedBy] = useState<string>(config.supervisorName);

  useEffect(() => {
    if (preselectedWorker) {
      setSelectedWorkerId(preselectedWorker.id);
    } else if (employees.length > 0 && !selectedWorkerId) {
      setSelectedWorkerId(employees[0].id);
    }
  }, [preselectedWorker, employees]);

  useEffect(() => {
    setDate(currentDate);
  }, [currentDate]);

  if (!isOpen) return null;

  const startMins = timeToMinutes(startTime);
  const endMins = timeToMinutes(endTime);
  const totalMinutes = Math.max(0, endMins - startMins);
  const totalHours = Number((totalMinutes / 60).toFixed(2));

  const selectedWorker = employees.find(e => e.id === selectedWorkerId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorker) return;

    onSave({
      date,
      workerId: selectedWorker.id,
      workerName: selectedWorker.name,
      area: selectedWorker.area,
      startTime,
      endTime,
      totalMinutes,
      totalHours,
      category,
      reason: reason || `Permiso por ${category.replace('_', ' ')}`,
      approvedBy,
      paid,
      status: 'APPROVED',
      hasCertificate
    });

    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Hourglass size={18} color="var(--text-secondary)" />
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Registrar Horas No Trabajadas</h3>
              <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Control de permisos, salidas y atrasos</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '0.3rem' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div className="grid-cols-2">
            <div className="input-group">
              <label className="input-label">Colaborador</label>
              <select 
                value={selectedWorkerId} 
                onChange={(e) => setSelectedWorkerId(e.target.value)}
                className="select"
                required
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    #{emp.docNumber} - {emp.name} ({emp.area})
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Fecha</label>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="input font-mono"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Tipo de Permiso / Causal</label>
            <select 
              value={category} 
              onChange={(e) => {
                const val = e.target.value as NonWorkedCategory;
                setCategory(val);
                if (val === 'PERMISO_PERSONAL' || val === 'ATRASO') setPaid(false);
                else setPaid(true);
              }}
              className="select"
            >
              <option value="CONSULTA_MEDICA">Consulta Médica</option>
              <option value="MUTUAL">Mutual de Seguridad</option>
              <option value="PERMISO_ADMIN">Permiso Administrativo (Con Goce)</option>
              <option value="PERMISO_PERSONAL">Permiso Personal (Sin Goce)</option>
              <option value="ATRASO">Atraso Entrada</option>
              <option value="SALIDA_ANTICIPADA">Salida Anticipada</option>
              <option value="CAPACITACION">Capacitación</option>
              <option value="TRAMITE_INTERNO">Trámite Interno</option>
              <option value="PAUSA_OPERATIVA">Pausa Operativa</option>
              <option value="OTRO">Otro Motivo</option>
            </select>
          </div>

          {/* Time range card */}
          <div style={{ background: 'var(--bg-input)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div className="grid-cols-2" style={{ marginBottom: '0.5rem' }}>
              <div className="input-group">
                <label className="input-label">Hora Salida / Inicio</label>
                <input 
                  type="time" 
                  value={startTime} 
                  onChange={(e) => setStartTime(e.target.value)}
                  className="input font-mono"
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Hora Regreso / Fin</label>
                <input 
                  type="time" 
                  value={endTime} 
                  onChange={(e) => setEndTime(e.target.value)}
                  className="input font-mono"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.4rem', borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tiempo No Trabajado:</span>
              <span className="font-mono" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {totalHours} hrs ({totalMinutes} min)
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.8rem' }}>
              <input 
                type="checkbox" 
                checked={paid} 
                onChange={(e) => setPaid(e.target.checked)}
                style={{ width: '15px', height: '15px', accentColor: 'var(--text-primary)' }}
              />
              <span>Con goce de sueldo (Remunerado)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.8rem' }}>
              <input 
                type="checkbox" 
                checked={hasCertificate} 
                onChange={(e) => setHasCertificate(e.target.checked)}
                style={{ width: '15px', height: '15px', accentColor: 'var(--text-primary)' }}
              />
              <span>Presenta comprobante / certificado</span>
            </label>
          </div>

          <div className="input-group">
            <label className="input-label">Motivo o Justificación</label>
            <textarea 
              rows={2}
              placeholder="Detalle o justificación de la salida..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="textarea"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Autorizado Por</label>
            <input 
              type="text" 
              value={approvedBy} 
              onChange={(e) => setApprovedBy(e.target.value)}
              className="input"
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.35rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              <Check size={14} />
              <span>Guardar Permiso</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
