import React, { useState } from 'react';
import { 
  Hourglass, 
  PlusCircle, 
  Download, 
  Search, 
  Trash2, 
  FileCheck, 
  Calendar
} from 'lucide-react';
import { 
  NonWorkedHoursRecord, 
  Employee, 
  PlantConfig, 
  AreaType 
} from '../../types/attendance';
import { ExcelService } from '../../services/excelService';

interface NonWorkedHoursViewProps {
  currentDate: string;
  nonWorkedHours: NonWorkedHoursRecord[];
  employees: Employee[];
  config: PlantConfig;
  onOpenNewPermit: () => void;
  onDeleteRecord: (id: string) => void;
}

export const NonWorkedHoursView: React.FC<NonWorkedHoursViewProps> = ({
  currentDate,
  nonWorkedHours,
  employees,
  config,
  onOpenNewPermit,
  onDeleteRecord
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<'TODAY' | 'ALL'>('ALL');

  const areas: AreaType[] = ['DESPOSTE', 'PORCIONADO', 'SALA DE CUCHILLOS', 'VARAS'];

  const filteredRecords = nonWorkedHours.filter(item => {
    const matchesSearch = item.workerName.toLowerCase().includes(searchTerm.toLowerCase()) || item.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = selectedArea === 'ALL' || item.area === selectedArea;
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesDate = dateFilter === 'ALL' || item.date === currentDate;
    return matchesSearch && matchesArea && matchesCat && matchesDate;
  });

  const totalMinutes = filteredRecords.reduce((sum, r) => sum + r.totalMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const paidMinutes = filteredRecords.filter(r => r.paid).reduce((sum, r) => sum + r.totalMinutes, 0);
  const unpaidMinutes = filteredRecords.filter(r => !r.paid).reduce((sum, r) => sum + r.totalMinutes, 0);

  const handleExport = () => {
    ExcelService.exportNonWorkedHoursReport(nonWorkedHours, config);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Overview & Actions */}
      <div className="card" style={{ 
        background: 'var(--bg-glass-elevated)',
        border: '1px solid var(--border-medium)',
        padding: '1.25rem 1.5rem'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Control de Permisos & Atrasos
              </span>
              <span style={{ color: 'var(--border-medium)' }}>•</span>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
                Seguimiento de Horas Hombre
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.2rem' }}>
              Gestión de Horas No Trabajadas (HNT)
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '640px' }}>
              Registra y categoriza salidas médicas, permisos, atrasos o trámites para justificar ante RRHH y conciliar el pago de haberes.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={onOpenNewPermit}
              className="btn btn-primary btn-sm"
            >
              <PlusCircle size={13} />
              <span>Nuevo Registro</span>
            </button>
            <button
              onClick={handleExport}
              className="btn btn-secondary btn-sm"
            >
              <Download size={13} />
              <span>Exportar Reporte</span>
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
          gap: '1rem', 
          marginTop: '1.25rem', 
          paddingTop: '1rem', 
          borderTop: '1px solid var(--border-subtle)' 
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TOTAL HORAS NO TRABAJADAS</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {totalHours} hrs
            </div>
            <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>{totalMinutes} min acumulados</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PERMISOS REGISTRADOS</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {filteredRecords.length}
            </div>
            <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>eventos en periodo</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CON GOCE DE SUELDO</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-present)', fontFamily: 'var(--font-mono)' }}>
              {(paidMinutes / 60).toFixed(1)} hrs
            </div>
            <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>remuneradas</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SIN GOCE (A DESCUENTO)</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-absent)', fontFamily: 'var(--font-mono)' }}>
              {(unpaidMinutes / 60).toFixed(1)} hrs
            </div>
            <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>descuento en RRHH</div>
          </div>
        </div>
      </div>

      {/* Filter & Table */}
      <div className="card">
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: '0.35rem 0.65rem', minWidth: '240px' }}>
            <Search size={14} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Buscar por colaborador o motivo..."
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

          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setDateFilter(dateFilter === 'ALL' ? 'TODAY' : 'ALL')}
              className={`btn btn-sm ${dateFilter === 'TODAY' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Calendar size={12} />
              <span>{dateFilter === 'TODAY' ? 'Solo Hoy' : 'Historial'}</span>
            </button>

            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="select"
              style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
            >
              <option value="ALL">Todas las Secciones</option>
              {areas.map(a => <option key={a} value={a}>{a}</option>)}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="select"
              style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
            >
              <option value="ALL">Todas las Categorías</option>
              <option value="CONSULTA_MEDICA">Consulta Médica</option>
              <option value="MUTUAL">Mutual</option>
              <option value="PERMISO_ADMIN">Permiso Administrativo</option>
              <option value="PERMISO_PERSONAL">Permiso Personal</option>
              <option value="ATRASO">Atraso</option>
              <option value="SALIDA_ANTICIPADA">Salida Anticipada</option>
              <option value="CAPACITACION">Capacitación</option>
              <option value="TRAMITE_INTERNO">Trámite Interno</option>
            </select>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
            <Hourglass size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
            <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '0.2rem' }}>
              Sin registros de horas no trabajadas
            </h4>
            <p style={{ fontSize: '0.8rem' }}>
              Utilice "Nuevo Registro" para ingresar permisos o salidas.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Colaborador</th>
                  <th>Sección</th>
                  <th>Tipo Permiso</th>
                  <th>Horario</th>
                  <th>Duración</th>
                  <th>Remuneración</th>
                  <th>Motivo</th>
                  <th>Autorizado Por</th>
                  <th style={{ textAlign: 'right' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map(item => (
                  <tr key={item.id}>
                    <td className="font-mono" style={{ fontSize: '0.75rem' }}>
                      {item.date}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.workerName}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>{item.area}</span>
                    </td>
                    <td>
                      <span className="badge badge-permission" style={{ fontSize: '0.675rem' }}>
                        {item.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="font-mono" style={{ fontSize: '0.75rem' }}>
                      {item.startTime} - {item.endTime}
                    </td>
                    <td className="font-mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.totalHours} hrs ({item.totalMinutes}m)
                    </td>
                    <td>
                      {item.paid ? (
                        <span className="badge badge-present" style={{ fontSize: '0.675rem' }}>
                          Con Goce
                        </span>
                      ) : (
                        <span className="badge badge-absent" style={{ fontSize: '0.675rem' }}>
                          Sin Goce
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.75rem', maxWidth: '220px' }}>{item.reason}</div>
                      {item.hasCertificate && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.675rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          <FileCheck size={11} />
                          <span>Comprobante</span>
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {item.approvedBy}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => onDeleteRecord(item.id)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--color-absent)', padding: '0.25rem 0.4rem' }}
                        title="Eliminar este registro"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
