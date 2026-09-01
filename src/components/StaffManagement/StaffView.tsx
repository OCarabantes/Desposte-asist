import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  X
} from 'lucide-react';
import { Employee, AreaType } from '../../types/attendance';

interface StaffViewProps {
  employees: Employee[];
  onAddEmployee: (emp: Omit<Employee, 'id'>) => void;
  onUpdateEmployee: (emp: Employee) => void;
  onDeleteEmployee: (id: string) => void;
}

export const StaffView: React.FC<StaffViewProps> = ({
  employees,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);

  const [docNumber, setDocNumber] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [area, setArea] = useState<AreaType>('DESPOSTE');
  const [role, setRole] = useState<string>('Operador Desposte');
  const [active, setActive] = useState<boolean>(true);

  const areas: AreaType[] = ['DESPOSTE', 'PORCIONADO', 'SALA DE CUCHILLOS', 'VARAS'];

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || emp.docNumber.includes(searchTerm);
    const matchesArea = selectedArea === 'ALL' || emp.area === selectedArea;
    return matchesSearch && matchesArea;
  });

  const handleOpenAdd = () => {
    setEditingEmp(null);
    setDocNumber(String(employees.length + 1));
    setName('');
    setArea('DESPOSTE');
    setRole('Operador Desposte');
    setActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmp(emp);
    setDocNumber(emp.docNumber);
    setName(emp.name);
    setArea(emp.area);
    setRole(emp.role);
    setActive(emp.active);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingEmp) {
      onUpdateEmployee({
        ...editingEmp,
        docNumber,
        name: name.trim(),
        area,
        role,
        active
      });
    } else {
      onAddEmployee({
        docNumber,
        name: name.trim(),
        area,
        role,
        active
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Banner */}
      <div className="card" style={{ 
        background: 'var(--bg-glass-elevated)',
        border: '1px solid var(--border-medium)',
        padding: '1.25rem 1.5rem'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Dotación Oficial KARMAC
              </span>
              <span style={{ color: 'var(--border-medium)' }}>•</span>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
                47 Colaboradores Registrados
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.2rem' }}>
              Gestión de Colaboradores & Cuadrillas
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '640px' }}>
              Administración de la dotación oficial distribuida en Desposte, Porcionado, Sala de Cuchillos y Varas.
            </p>
          </div>

          <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
            <UserPlus size={13} />
            <span>Agregar Colaborador</span>
          </button>
        </div>

        {/* Section counters strip */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
          gap: '1rem', 
          marginTop: '1.25rem', 
          paddingTop: '1rem', 
          borderTop: '1px solid var(--border-subtle)' 
        }}>
          {areas.map(a => {
            const count = employees.filter(e => e.area === a && e.active).length;
            return (
              <div key={a}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{a}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {count} <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 400 }}>personas</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Staff Table */}
      <div className="card">
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: '0.35rem 0.65rem', minWidth: '240px' }}>
            <Search size={14} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o número..."
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
              Todos ({employees.length})
            </button>
            {areas.map(a => (
              <button
                key={a}
                onClick={() => setSelectedArea(a)}
                className={`btn btn-sm ${selectedArea === a ? 'btn-primary' : 'btn-secondary'}`}
              >
                {a} ({employees.filter(e => e.area === a).length})
              </button>
            ))}
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Nº</th>
                <th>Nombre y Apellidos</th>
                <th>Sección</th>
                <th>Cargo</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(emp => (
                <tr key={emp.id}>
                  <td className="font-mono" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                    #{emp.docNumber}
                  </td>
                  <td style={{ fontWeight: 600 }}>{emp.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{emp.area}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{emp.role}</td>
                  <td>
                    {emp.active ? (
                      <span className="badge badge-present" style={{ fontSize: '0.675rem' }}>Activo</span>
                    ) : (
                      <span className="badge badge-absent" style={{ fontSize: '0.675rem' }}>Inactivo</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.2rem' }}>
                      <button
                        onClick={() => handleOpenEdit(emp)}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '0.25rem 0.4rem' }}
                        title="Editar colaborador"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => onDeleteEmployee(emp.id)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--color-absent)', padding: '0.25rem 0.4rem' }}
                        title="Eliminar colaborador"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>
                {editingEmp ? 'Editar Colaborador' : 'Nuevo Colaborador'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-ghost btn-sm" style={{ padding: '0.3rem' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="grid-cols-2">
                <div className="input-group">
                  <label className="input-label">Nº Documento</label>
                  <input 
                    type="text" 
                    value={docNumber} 
                    onChange={(e) => setDocNumber(e.target.value)}
                    className="input font-mono"
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Sección</label>
                  <select 
                    value={area} 
                    onChange={(e) => setArea(e.target.value as AreaType)}
                    className="select"
                  >
                    {areas.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Nombre y Apellidos</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Cargo / Función</label>
                <input 
                  type="text" 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  className="input"
                  required
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                <input 
                  type="checkbox" 
                  checked={active} 
                  onChange={(e) => setActive(e.target.checked)}
                  style={{ width: '15px', height: '15px', accentColor: 'var(--text-primary)' }}
                />
                <span>Colaborador activo en plantilla</span>
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary btn-sm">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <Check size={14} />
                  <span>{editingEmp ? 'Guardar' : 'Registrar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
