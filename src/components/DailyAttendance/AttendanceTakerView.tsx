import React, { useState } from 'react';
import { 
  Search, 
  CheckCheck, 
  Clock, 
  Hourglass,
  Mail,
  Layers,
  TableProperties
} from 'lucide-react';
import { 
  Employee, 
  DailyAttendanceRecord, 
  AreaType, 
  AttendanceCode,
  NonWorkedHoursRecord
} from '../../types/attendance';
import { AttendanceCarousel } from './AttendanceCarousel';

interface AttendanceTakerViewProps {
  currentDate: string;
  employees: Employee[];
  attendanceRecords: DailyAttendanceRecord[];
  onUpdateStatus: (recordId: string, status: AttendanceCode, notes?: string) => void;
  onBulkSetPresent: (areaFilter?: AreaType) => void;
  onOpenPermitForWorker: (worker: Employee) => void;
  onOpenSendEmail?: () => void;
  dailyNonWorkedHours?: NonWorkedHoursRecord[];
}

export const AttendanceTakerView: React.FC<AttendanceTakerViewProps> = ({
  currentDate,
  employees,
  attendanceRecords,
  onUpdateStatus,
  onBulkSetPresent,
  onOpenPermitForWorker,
  onOpenSendEmail,
  dailyNonWorkedHours = []
}) => {
  const [viewMode, setViewMode] = useState<'CAROUSEL' | 'TABLE'>('CAROUSEL');
  const [selectedArea, setSelectedArea] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const areas: AreaType[] = ['DESPOSTE', 'PORCIONADO', 'SALA DE CUCHILLOS', 'VARAS'];

  // Filtered list for Table view
  const filteredRecords = attendanceRecords.filter(record => {
    const matchesArea = selectedArea === 'ALL' || record.area === selectedArea;
    const matchesSearch = 
      record.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.docNumber.includes(searchTerm);
    const matchesStatus = statusFilter === 'ALL' || record.status === statusFilter;
    return matchesArea && matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Top Header Controls: Mode Switcher & Global Actions */}
      <div className="card" style={{ padding: '0.85rem 1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Mode Switcher: Carousel vs Table */}
          <div style={{ display: 'inline-flex', background: 'var(--bg-input)', padding: '0.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)' }}>
            <button
              type="button"
              onClick={() => setViewMode('CAROUSEL')}
              className={`btn btn-sm ${viewMode === 'CAROUSEL' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.775rem', padding: '0.35rem 0.75rem', gap: '0.4rem' }}
            >
              <Layers size={14} />
              <span>Modo Carrusel (1x1 Rápido)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              className={`btn btn-sm ${viewMode === 'TABLE' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.775rem', padding: '0.35rem 0.75rem', gap: '0.4rem' }}
            >
              <TableProperties size={14} />
              <span>Modo Tabla Completa</span>
            </button>
          </div>

          {/* Quick global actions */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => onBulkSetPresent(selectedArea === 'ALL' ? undefined : (selectedArea as AreaType))}
              className="btn btn-secondary btn-sm"
              title="Marcar todos los trabajadores como Presentes"
            >
              <CheckCheck size={13} />
              <span>Todos Presentes</span>
            </button>

            {onOpenSendEmail && (
              <button
                onClick={onOpenSendEmail}
                className="btn btn-primary btn-sm"
                title="Enviar reporte diario a cgarrido@karmac.cl y asistente.rrhh@karmac.cl"
              >
                <Mail size={13} />
                <span>Enviar Asistencia a RRHH</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Render Selected View */}
      {viewMode === 'CAROUSEL' ? (
        <AttendanceCarousel
          currentDate={currentDate}
          employees={employees}
          attendanceRecords={attendanceRecords}
          onUpdateStatus={onUpdateStatus}
          onOpenPermitForWorker={onOpenPermitForWorker}
          dailyNonWorkedHours={dailyNonWorkedHours}
          selectedArea={selectedArea}
          onSelectArea={setSelectedArea}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Table Filters */}
          <div className="card" style={{ padding: '0.85rem 1.25rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: '0.35rem 0.65rem', minWidth: '240px' }}>
                <Search size={14} color="var(--text-muted)" />
                <input 
                  type="text" 
                  placeholder="Buscar por nombre o Nº Doc..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem',
                    outline: 'none',
                    width: '100%'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setSelectedArea('ALL')}
                  className={`btn btn-sm ${selectedArea === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Todas ({employees.length})
                </button>
                {areas.map(area => {
                  const count = employees.filter(e => e.area === area).length;
                  return (
                    <button
                      key={area}
                      onClick={() => setSelectedArea(area)}
                      className={`btn btn-sm ${selectedArea === area ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      {area} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Roster Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '55px' }}>Nº</th>
                  <th>Colaborador</th>
                  <th>Sección</th>
                  <th>Asistencia en Sala</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No se encontraron colaboradores con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map(record => {
                    const emp = employees.find(e => e.id === record.workerId);
                    return (
                      <tr key={record.id}>
                        <td className="font-mono" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                          #{record.docNumber}
                        </td>

                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {record.workerName}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {emp?.role || 'Operador'}
                          </div>
                        </td>

                        <td>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {record.area}
                          </span>
                        </td>

                        <td>
                          <div className="toggle-btn-group">
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(record.id, '1')}
                              className={`toggle-item-btn ${record.status === '1' ? 'active-1' : ''}`}
                              title="Presente"
                            >
                              1 (Pres)
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(record.id, '0')}
                              className={`toggle-item-btn ${record.status === '0' ? 'active-0' : ''}`}
                              title="Ausente / Falla"
                            >
                              0 (Aus)
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(record.id, 'V')}
                              className={`toggle-item-btn ${record.status === 'V' ? 'active-V' : ''}`}
                              title="Vacaciones"
                            >
                              V (Vac)
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(record.id, 'L')}
                              className={`toggle-item-btn ${record.status === 'L' ? 'active-L' : ''}`}
                              title="Licencia Médica"
                            >
                              L (Lic)
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(record.id, 'P')}
                              className={`toggle-item-btn ${record.status === 'P' ? 'active-P' : ''}`}
                              title="Permiso"
                            >
                              P (Perm)
                            </button>

                            {/* Mostrar horas si hay un registro de permiso */}
                            {record.status === 'P' && dailyNonWorkedHours.some(h => h.workerId === record.workerId) && (
                              <div style={{ marginLeft: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'var(--color-permission)', background: 'var(--color-permission-bg)', padding: '0.15rem 0.4rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-permission-border)' }}>
                                <Hourglass size={12} />
                                <span>
                                  {dailyNonWorkedHours.filter(h => h.workerId === record.workerId).reduce((acc, curr) => acc + curr.totalHours, 0)} hrs
                                </span>
                              </div>
                            )}
                          </div>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => emp && onOpenPermitForWorker(emp)}
                            className="btn btn-ghost btn-sm"
                            style={{ fontSize: '0.725rem', padding: '0.25rem 0.5rem' }}
                            title="Registrar permiso u horas no trabajadas"
                          >
                            <Hourglass size={12} />
                            <span>Permiso</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
