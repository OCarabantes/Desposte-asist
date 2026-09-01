import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Send, 
  Copy, 
  Download, 
  Check, 
  FileSpreadsheet, 
  Calendar,
  CalendarDays,
  CheckCircle2, 
  ExternalLink
} from 'lucide-react';
import { 
  Employee, 
  DailyAttendanceRecord, 
  NonWorkedHoursRecord, 
  PlantConfig, 
  EmailDispatchLog 
} from '../../types/attendance';
import { EmailService } from '../../services/emailService';
import { ExcelService } from '../../services/excelService';

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: string;
  employees: Employee[];
  attendance: DailyAttendanceRecord[];
  allAttendance: DailyAttendanceRecord[];
  nonWorkedHours: NonWorkedHoursRecord[];
  config: PlantConfig;
  emailLogs: EmailDispatchLog[];
  onLogEmailDispatch: (log: Omit<EmailDispatchLog, 'id' | 'timestamp'>) => void;
}

export const SendEmailModal: React.FC<SendEmailModalProps> = ({
  isOpen,
  onClose,
  currentDate,
  employees,
  attendance,
  allAttendance,
  nonWorkedHours,
  config,
  emailLogs,
  onLogEmailDispatch
}) => {
  const [reportPeriod, setReportPeriod] = useState<'DAILY' | 'WEEKLY'>('DAILY');
  
  // Weekly date range calculation (Monday to Sunday around currentDate)
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date(currentDate + 'T00:00:00');
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    const yyyy = monday.getFullYear();
    const mm = String(monday.getMonth() + 1).padStart(2, '0');
    const dd = String(monday.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  const [endDate, setEndDate] = useState<string>(() => {
    const d = new Date(currentDate + 'T00:00:00');
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    const sunday = new Date(monday.setDate(monday.getDate() + 6));
    const yyyy = sunday.getFullYear();
    const mm = String(sunday.getMonth() + 1).padStart(2, '0');
    const dd = String(sunday.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  const [recipients, setRecipients] = useState<string[]>(config.hrEmailRecipients || ['cgarrido@karmac.cl', 'asistente.rrhh@karmac.cl']);
  const [newEmailInput, setNewEmailInput] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const [dispatchSuccess, setDispatchSuccess] = useState<boolean>(false);
  const [activeViewTab, setActiveViewTab] = useState<'PREVIEW' | 'LOGS'>('PREVIEW');

  // Update subject when period or dates change
  useEffect(() => {
    if (reportPeriod === 'DAILY') {
      setSubject(EmailService.generateSubject(currentDate, config));
    } else {
      setSubject(EmailService.generateWeeklySubject(startDate, endDate, config));
    }
  }, [reportPeriod, currentDate, startDate, endDate, config]);

  if (!isOpen) return null;

  // Prepare data payloads
  const dailyData = {
    date: currentDate,
    employees,
    attendance,
    nonWorkedHours,
    config
  };

  const weeklyData = {
    startDate,
    endDate,
    employees,
    allAttendance,
    nonWorkedHours,
    config
  };

  const plainTextReport = reportPeriod === 'DAILY'
    ? EmailService.generatePlainTextReport(dailyData)
    : EmailService.generateWeeklyPlainTextReport(weeklyData);

  const mailtoUrl = reportPeriod === 'DAILY'
    ? EmailService.generateMailtoUrl(dailyData, recipients)
    : EmailService.generateWeeklyMailtoUrl(weeklyData, recipients);

  const handleAddRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEmailInput.trim() && newEmailInput.includes('@')) {
      if (!recipients.includes(newEmailInput.trim())) {
        setRecipients([...recipients, newEmailInput.trim()]);
      }
      setNewEmailInput('');
    }
  };

  const handleRemoveRecipient = (emailToRemove: string) => {
    setRecipients(recipients.filter(r => r !== emailToRemove));
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(plainTextReport);
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleDownloadExcelAttachment = () => {
    if (reportPeriod === 'DAILY') {
      ExcelService.exportDailyReportWorkbook(
        currentDate,
        employees,
        attendance,
        nonWorkedHours,
        config
      );
    } else {
      ExcelService.exportWeeklyReportWorkbook(
        startDate,
        endDate,
        employees,
        allAttendance,
        nonWorkedHours,
        config
      );
    }
  };

  const handleOpenMailto = () => {
    handleDownloadExcelAttachment();

    setTimeout(() => {
      window.location.href = mailtoUrl;
    }, 200);

    onLogEmailDispatch({
      date: currentDate,
      recipients,
      ccRecipients: config.ccEmailRecipients,
      subject,
      reportType: reportPeriod === 'DAILY' ? 'DAILY_SUMMARY' : 'PERMITS_ONLY',
      status: 'SENT',
      summary: reportPeriod === 'DAILY' 
        ? `Reporte Diario (${currentDate}): ${attendance.filter(a => a.status === '1').length} presentes en sala`
        : `Reporte Semanal (${startDate} al ${endDate}): Matriz semanal de asistencia y HNT`,
      sentBy: config.supervisorName
    });

    setDispatchSuccess(true);
    setTimeout(() => {
      setDispatchSuccess(false);
      onClose();
    }, 1500);
  };

  const handleMarkAsLogged = () => {
    onLogEmailDispatch({
      date: currentDate,
      recipients,
      ccRecipients: config.ccEmailRecipients,
      subject,
      reportType: reportPeriod === 'DAILY' ? 'DAILY_SUMMARY' : 'PERMITS_ONLY',
      status: 'SENT',
      summary: reportPeriod === 'DAILY' 
        ? `Reporte Diario (${currentDate}): ${attendance.filter(a => a.status === '1').length} presentes en sala`
        : `Reporte Semanal (${startDate} al ${endDate}): Matriz semanal de asistencia y HNT`,
      sentBy: config.supervisorName
    });

    setDispatchSuccess(true);
    setTimeout(() => {
      setDispatchSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '750px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mail size={18} color="var(--text-secondary)" />
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>
                Enviar Reporte Oficial a Recursos Humanos
              </h3>
              <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                Envío de asistencia de sala y horas no trabajadas en formato correo + planilla Excel adjunta
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '0.3rem' }}>
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {dispatchSuccess && (
            <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--color-present-bg)', border: '1px solid var(--color-present-border)', color: 'var(--color-present)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <CheckCircle2 size={16} />
              <span>Reporte registrado y descargado para envío a RRHH con éxito.</span>
            </div>
          )}

          {/* Frequency Switcher: Daily vs Weekly */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-input)', padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'inline-flex', gap: '0.25rem' }}>
              <button
                type="button"
                onClick={() => setReportPeriod('DAILY')}
                className={`btn btn-sm ${reportPeriod === 'DAILY' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', gap: '0.35rem' }}
              >
                <Calendar size={13} />
                <span>Reporte Diario ({currentDate})</span>
              </button>

              <button
                type="button"
                onClick={() => setReportPeriod('WEEKLY')}
                className={`btn btn-sm ${reportPeriod === 'WEEKLY' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', gap: '0.35rem' }}
              >
                <CalendarDays size={13} />
                <span>Reporte Semanal (Semana Completa)</span>
              </button>
            </div>

            {/* If Weekly: Date Range Selector */}
            {reportPeriod === 'WEEKLY' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Del:</span>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input font-mono"
                  style={{ width: 'auto', padding: '0.2rem 0.4rem', fontSize: '0.725rem' }}
                />
                <span style={{ color: 'var(--text-muted)' }}>al:</span>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input font-mono"
                  style={{ width: 'auto', padding: '0.2rem 0.4rem', fontSize: '0.725rem' }}
                />
              </div>
            )}
          </div>

          {/* Recipients Section */}
          <div className="input-group">
            <label className="input-label">Destinatarios Oficiales RRHH</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', background: 'var(--bg-input)', padding: '0.45rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', alignItems: 'center' }}>
              {recipients.map(email => (
                <span 
                  key={email} 
                  className="badge" 
                  style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-medium)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.2rem 0.5rem', fontSize: '0.725rem' }}
                >
                  <span>{email}</span>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveRecipient(email)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 0 }}
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}

              <form onSubmit={handleAddRecipient} style={{ display: 'inline-flex', flex: 1, minWidth: '150px' }}>
                <input 
                  type="email"
                  placeholder="+ Agregar correo..."
                  value={newEmailInput}
                  onChange={(e) => setNewEmailInput(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '0.75rem',
                    outline: 'none',
                    width: '100%'
                  }}
                />
              </form>
            </div>
          </div>

          {/* Subject */}
          <div className="input-group">
            <label className="input-label">Asunto del Correo</label>
            <input 
              type="text" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="input font-mono"
              style={{ fontSize: '0.775rem' }}
            />
          </div>

          {/* Tab Selector: Preview vs Logs */}
          <div style={{ display: 'flex', gap: '0.35rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.35rem' }}>
            <button
              type="button"
              onClick={() => setActiveViewTab('PREVIEW')}
              className={`btn btn-sm ${activeViewTab === 'PREVIEW' ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
            >
              Vista Previa del Mensaje {reportPeriod === 'DAILY' ? '(Diario)' : '(Semanal)'}
            </button>
            <button
              type="button"
              onClick={() => setActiveViewTab('LOGS')}
              className={`btn btn-sm ${activeViewTab === 'LOGS' ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
            >
              Historial de Envíos ({emailLogs.length})
            </button>
          </div>

          {activeViewTab === 'PREVIEW' ? (
            <div>
              {/* Preview Box */}
              <div style={{ 
                background: 'var(--bg-input)', 
                border: '1px solid var(--border-subtle)', 
                borderRadius: 'var(--radius-md)', 
                padding: '0.85rem', 
                maxHeight: '220px', 
                overflowY: 'auto',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-secondary)',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.45
              }}>
                {plainTextReport}
              </div>

              {/* Excel Attachment Reminder & Download button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.75rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginTop: '0.75rem', fontSize: '0.725rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <FileSpreadsheet size={15} color="var(--text-secondary)" />
                  <span>
                    {reportPeriod === 'DAILY' 
                      ? `Planilla Excel Diaria: Reporte-Diario-Asistencia-DESPOSTE-${currentDate}.xlsx` 
                      : `Planilla Excel Semanal: Reporte-Semanal-Asistencia-DESPOSTE-${startDate}_al_${endDate}.xlsx`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadExcelAttachment}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.725rem', padding: '0.25rem 0.55rem' }}
                >
                  <Download size={12} />
                  <span>Descargar Excel</span>
                </button>
              </div>
            </div>
          ) : (
            <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
              {emailLogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  No se registran envíos previos de correo.
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table" style={{ fontSize: '0.725rem' }}>
                    <thead>
                      <tr>
                        <th>Fecha y Hora</th>
                        <th>Destinatarios</th>
                        <th>Resumen</th>
                        <th>Remitente</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emailLogs.map(log => (
                        <tr key={log.id}>
                          <td className="font-mono">
                            {new Date(log.timestamp).toLocaleString('es-CL')}
                          </td>
                          <td style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {log.recipients.join(', ')}
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>
                            {log.summary}
                          </td>
                          <td style={{ color: 'var(--text-muted)' }}>
                            {log.sentBy}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              onClick={handleCopyText}
              className="btn btn-secondary btn-sm"
            >
              {copiedSuccess ? <Check size={13} color="var(--color-present)" /> : <Copy size={13} />}
              <span>{copiedSuccess ? '¡Copiado!' : 'Copiar Texto del Correo'}</span>
            </button>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={handleMarkAsLogged}
                className="btn btn-secondary btn-sm"
                title="Registrar en el historial que ya fue enviado"
              >
                <Check size={13} />
                <span>Marcar como Enviado</span>
              </button>

              <button
                type="button"
                onClick={handleOpenMailto}
                className="btn btn-primary btn-sm"
              >
                <Send size={13} />
                <span>Abrir en Outlook + Descargar Excel</span>
                <ExternalLink size={12} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
