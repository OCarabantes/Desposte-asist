import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  X,
  Shield,
  Loader
} from 'lucide-react';
import { SystemUser, AreaType } from '../../types/attendance';
import { ApiService } from '../../services/apiService';
import { StorageService } from '../../services/storageService';

export const SystemUsersView: React.FC = () => {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Supervisor');
  const [area, setArea] = useState<AreaType>('DESPOSTE');
  
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const areas: AreaType[] = ['DESPOSTE', 'PORCIONADO', 'SALA DE CUCHILLOS', 'VARAS'];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    let data = await ApiService.fetchSystemUsers();
    if (!data) {
      // fallback to local storage
      data = StorageService.getSystemUsers();
    } else {
      StorageService.saveSystemUsers(data);
    }
    setUsers(data || []);
    setIsLoading(false);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingUser(null);
    setEmail('');
    setPassword('');
    setName('');
    setRole('Supervisor');
    setArea('DESPOSTE');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: SystemUser) => {
    setEditingUser(user);
    setEmail(user.email);
    setPassword(''); // leave blank so they only update it if they type something new
    setName(user.name);
    setRole(user.role);
    setArea(user.area);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro que desea eliminar a este usuario del sistema? Ya no podrá iniciar sesión.')) {
      const success = await ApiService.deleteSystemUser(id);
      if (success) {
        const updated = users.filter(u => u.id !== id);
        setUsers(updated);
        StorageService.saveSystemUsers(updated);
      } else {
        alert('Hubo un error al eliminar el usuario.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!email.trim() || !name.trim()) {
      setFormError('Nombre y correo son obligatorios.');
      return;
    }

    if (!editingUser && !password.trim()) {
      setFormError('La contraseña es obligatoria para nuevos usuarios.');
      return;
    }

    setIsSaving(true);
    
    const userData: any = {
      email: email.trim(),
      name: name.trim(),
      role: role.trim(),
      area
    };

    if (password.trim()) {
      userData.password = password.trim();
    }

    if (editingUser) {
      userData.id = editingUser.id;
    }

    const res = await ApiService.saveSystemUser(userData);
    
    setIsSaving(false);

    if (res.success && res.data) {
      let updatedUsers = [...users];
      if (editingUser) {
        updatedUsers = updatedUsers.map(u => u.id === res.data!.id ? res.data! : u);
      } else {
        updatedUsers.unshift(res.data);
      }
      setUsers(updatedUsers);
      StorageService.saveSystemUsers(updatedUsers);
      setIsModalOpen(false);
    } else {
      setFormError(res.error || 'Error al guardar el usuario.');
    }
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
              <Shield size={14} color="var(--color-present)" />
              <span style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Accesos y Seguridad
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.2rem' }}>
              Usuarios del Sistema
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '640px' }}>
              Administración de cuentas con acceso para iniciar sesión y gestionar la aplicación.
            </p>
          </div>

          <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
            <UserPlus size={13} />
            <span>Nuevo Usuario</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: '0.35rem 0.65rem', minWidth: '240px' }}>
            <Search size={14} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o correo..."
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
        </div>

        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Loader className="spin" size={24} style={{ margin: '0 auto 1rem' }} />
            <p>Cargando usuarios...</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Cargo</th>
                  <th>Área / Sección</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{u.role}</td>
                      <td>
                        <span className="badge" style={{ background: 'var(--bg-glass-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)', fontSize: '0.675rem' }}>
                          {u.area}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.2rem' }}>
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '0.25rem 0.4rem' }}
                            title="Editar usuario"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--color-absent)', padding: '0.25rem 0.4rem' }}
                            title="Eliminar usuario"
                            disabled={u.id === 'USR-ADMIN-01'} // protect main admin?
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No se encontraron usuarios
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-ghost btn-sm" style={{ padding: '0.3rem' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {formError && (
                <div style={{ padding: '0.75rem', background: 'var(--color-absent-bg)', border: '1px solid var(--color-absent-border)', color: 'var(--color-absent)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                  {formError}
                </div>
              )}

              <div className="input-group">
                <label className="input-label">Nombre Completo</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  required
                />
              </div>

              <div className="grid-cols-2">
                <div className="input-group">
                  <label className="input-label">Correo Electrónico (Login)</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Contraseña</label>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    className="input"
                    placeholder={editingUser ? 'Dejar en blanco para mantener' : 'Contraseña de acceso'}
                    required={!editingUser}
                  />
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="input-group">
                  <label className="input-label">Cargo</label>
                  <input 
                    type="text" 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)}
                    className="input"
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Área / Sección</label>
                  <select 
                    value={area} 
                    onChange={(e) => setArea(e.target.value as AreaType)}
                    className="select"
                  >
                    {areas.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary btn-sm" disabled={isSaving}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isSaving}>
                  {isSaving ? <Loader size={14} className="spin" /> : <Check size={14} />}
                  <span>{editingUser ? 'Guardar Cambios' : 'Crear Usuario'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
