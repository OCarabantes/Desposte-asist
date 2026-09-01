import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  Building2, 
  Clock, 
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Mail
} from 'lucide-react';
import { PlantConfig } from '../../types/attendance';
import { StorageService } from '../../services/storageService';

interface SettingsViewProps {
  config: PlantConfig;
  onUpdateConfig: (config: PlantConfig) => void;
  onResetToDefault: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  config,
  onUpdateConfig,
  onResetToDefault
}) => {
  const [formData, setFormData] = useState<PlantConfig>(config);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [emailsText, setEmailsText] = useState<string>(
    (config.hrEmailRecipients || ['cgarrido@karmac.cl', 'asistente.rrhh@karmac.cl']).join(', ')
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedEmails = emailsText
      .split(',')
      .map(e => e.trim())
      .filter(e => e.includes('@'));

    const updated = {
      ...formData,
      hrEmailRecipients: parsedEmails.length > 0 ? parsedEmails : ['cgarrido@karmac.cl', 'asistente.rrhh@karmac.cl']
    };

    onUpdateConfig(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetData = () => {
    if (window.confirm('¿Desea restablecer toda la configuración y dotación a los valores oficiales iniciales del Excel?')) {
      onResetToDefault();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>
      
      {/* Header */}
      <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Settings size={20} color="var(--text-secondary)" />
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Configuración de Planta & Turnos</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Parámetros de turnos, tolerancias y destinatarios oficiales de Recursos Humanos
            </p>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--color-present-bg)', border: '1px solid var(--color-present-border)', color: 'var(--color-present)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <CheckCircle2 size={16} />
          <span>Configuración guardada exitosamente.</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Company and Supervisor Info */}
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Building2 size={15} color="var(--text-muted)" />
            <span>Datos de la Empresa & Jefatura</span>
          </h3>

          <div className="grid-cols-2">
            <div className="input-group">
              <label className="input-label">Institución / Empresa</label>
              <input 
                type="text" 
                value={formData.institution} 
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                className="input"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Área / Unidad</label>
              <input 
                type="text" 
                value={formData.areaName} 
                onChange={(e) => setFormData({ ...formData, areaName: e.target.value })}
                className="input"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Responsable</label>
              <input 
                type="text" 
                value={formData.supervisorName} 
                onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}
                className="input"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Cargo del Responsable</label>
              <input 
                type="text" 
                value={formData.supervisorRole} 
                onChange={(e) => setFormData({ ...formData, supervisorRole: e.target.value })}
                className="input"
                required
              />
            </div>
          </div>
        </div>

        {/* Email HR Configuration */}
        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Mail size={15} color="var(--text-muted)" />
            <span>Destinatarios Oficiales de Correo (RRHH)</span>
          </h3>

          <div className="input-group">
            <label className="input-label">Correos Electrónicos RRHH (Separados por coma)</label>
            <input 
              type="text" 
              value={emailsText} 
              onChange={(e) => setEmailsText(e.target.value)}
              className="input font-mono"
              placeholder="cgarrido@karmac.cl, asistente.rrhh@karmac.cl"
              required
            />
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Direcciones predeterminadas a las que se enviarán los reportes diarios de asistencia y horas no trabajadas.
            </div>
          </div>
        </div>

        {/* Shift and Clock rules */}
        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Clock size={15} color="var(--text-muted)" />
            <span>Horarios de Turno & Reglas de Reloj Control</span>
          </h3>

          <div className="grid-cols-3">
            <div className="input-group">
              <label className="input-label">Hora Inicio Turno</label>
              <input 
                type="time" 
                value={formData.shiftStartTime} 
                onChange={(e) => setFormData({ ...formData, shiftStartTime: e.target.value })}
                className="input font-mono"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Hora Fin Turno</label>
              <input 
                type="time" 
                value={formData.shiftEndTime} 
                onChange={(e) => setFormData({ ...formData, shiftEndTime: e.target.value })}
                className="input font-mono"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Tolerancia Atraso (Minutos)</label>
              <input 
                type="number" 
                min={0}
                max={60}
                value={formData.graceMinutes} 
                onChange={(e) => setFormData({ ...formData, graceMinutes: Number(e.target.value) })}
                className="input font-mono"
                required
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
          <button type="submit" className="btn btn-primary btn-sm">
            <Save size={13} />
            <span>Guardar Configuración</span>
          </button>
        </div>
      </form>

      {/* Database Retention Policy Card */}
      <div className="card" style={{ border: '1px solid var(--border-medium)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Building2 size={15} color="var(--color-present)" />
              <span>Política de Auto-Limpieza de Base de Datos (5 Meses)</span>
            </h3>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', maxWidth: '580px', lineHeight: 1.4 }}>
              Para evitar la acumulación de datos obsoletos y mantener la base de datos PostgreSQL ligera y rápida, el sistema elimina automáticamente registros de asistencia, permisos y registros de despacho con más de <strong>5 meses (150 días)</strong> de antigüedad, sobreescribiéndose de forma continua.
            </p>
          </div>

          <button
            type="button"
            onClick={async () => {
              if (window.confirm('¿Desea ejecutar la depuración manual de registros con más de 5 meses de antigüedad?')) {
                StorageService.purgeOldLocalData(5);
                try {
                  await fetch('/api/cron-cleanup?months=5');
                } catch {}
                alert('Depuración ejecutada con éxito. Los registros antiguos han sido eliminados.');
              }
            }}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem' }}
          >
            <span>Ejecutar Limpieza Ahora</span>
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card" style={{ border: '1px solid var(--border-subtle)' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <AlertTriangle size={15} color="var(--text-muted)" />
          <span>Restablecer Datos de Fábrica</span>
        </h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
          Restaura la dotación oficial de 47 colaboradores y la configuración inicial de Karmac.
        </p>
        <button onClick={handleResetData} className="btn btn-secondary btn-sm" style={{ color: 'var(--color-absent)' }}>
          <RotateCcw size={12} />
          <span>Restablecer Dotación Oficial</span>
        </button>
      </div>

    </div>
  );
};
