import React, { useState } from 'react';
import { 
  CalendarDays, 
  Download
} from 'lucide-react';
import { 
  Employee, 
  DailyAttendanceRecord, 
  AreaType, 
  AttendanceCode, 
  PlantConfig 
} from '../../types/attendance';
import { ExcelService } from '../../services/excelService';

interface MonthlyMatrixViewProps {
  employees: Employee[];
  attendanceRecords: DailyAttendanceRecord[];
  config: PlantConfig;
  onUpdateStatus: (recordId: string, status: AttendanceCode) => void;
}

export const MonthlyMatrixView: React.FC<MonthlyMatrixViewProps> = ({
  employees,
  attendanceRecords,
  config,
  onUpdateStatus
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(8); // August
  const [selectedArea, setSelectedArea] = useState<AreaType | 'ALL'>('DESPOSTE');

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayInitials = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

  const areas: AreaType[] = ['DESPOSTE', 'PORCIONADO', 'SALA DE CUCHILLOS', 'VARAS'];

  const filteredEmployees = employees.filter(e => {
    if (!e.active) return false;
    if (selectedArea === 'ALL') return true;
    return e.area === selectedArea;
  });

  const nextStatusCycle: Record<AttendanceCode, AttendanceCode> = {
    '1': '0',
    '0': 'V',
    'V': 'L',
    'L': 'P',
    'P': '1',
    'PSG': '1',
    'A': '1',
    'F': '1'
  };

  const handleCellClick = (emp: Employee, day: number) => {
    const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const recordId = `${dateStr}_${emp.id}`;
    const existing = attendanceRecords.find(a => a.id === recordId);
    const currentStatus: AttendanceCode = existing ? existing.status : '1';
    const nextStatus = nextStatusCycle[currentStatus] || '1';
    onUpdateStatus(recordId, nextStatus);
  };

  const handleExportWorkbook = () => {
    ExcelService.exportKarmacMonthlyWorkbook(
      selectedYear,
      selectedMonth,
      employees,
      attendanceRecords,
      config
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Controls Card */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-input)', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)' }}>
              <CalendarDays size={14} color="var(--text-muted)" />
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="select font-mono"
                style={{ background: 'transparent', border: 'none', padding: 0, width: 'auto', fontWeight: 600, fontSize: '0.8rem' }}
              >
                {monthNames.map((name, idx) => (
                  <option key={name} value={idx + 1}>{name}</option>
                ))}
              </select>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="select font-mono"
                style={{ background: 'transparent', border: 'none', padding: 0, width: 'auto', fontWeight: 600, fontSize: '0.8rem' }}
              >
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>

            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {daysInMonth} días
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedArea('ALL')}
              className={`btn btn-sm ${selectedArea === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Todo ({employees.length})
            </button>
            {areas.map(area => (
              <button
                key={area}
                onClick={() => setSelectedArea(area)}
                className={`btn btn-sm ${selectedArea === area ? 'btn-primary' : 'btn-secondary'}`}
              >
                {area} ({employees.filter(e => e.area === area).length})
              </button>
            ))}
          </div>

          <button
            onClick={handleExportWorkbook}
            className="btn btn-secondary btn-sm"
          >
            <Download size={13} />
            <span>Descargar Excel</span>
          </button>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', padding: '0.4rem 0.65rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.725rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Marcas:</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span className="matrix-cell matrix-cell-1" style={{ width: '18px', height: '18px', fontSize: '0.65rem' }}>1</span> Presente
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span className="matrix-cell matrix-cell-0" style={{ width: '18px', height: '18px', fontSize: '0.65rem' }}>0</span> Ausente
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span className="matrix-cell matrix-cell-V" style={{ width: '18px', height: '18px', fontSize: '0.65rem' }}>V</span> Vacaciones
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span className="matrix-cell matrix-cell-L" style={{ width: '18px', height: '18px', fontSize: '0.65rem' }}>L</span> Licencia
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span className="matrix-cell matrix-cell-P" style={{ width: '18px', height: '18px', fontSize: '0.65rem' }}>P</span> Permiso
          </span>
        </div>
        <div style={{ color: 'var(--text-muted)' }}>
          <em>Clic en celda para cambiar marca.</em>
        </div>
      </div>

      {/* Grid Table */}
      <div className="table-container" style={{ maxHeight: '700px' }}>
        <table className="data-table" style={{ fontSize: '0.725rem' }}>
          <thead>
            <tr>
              <th style={{ width: '45px', position: 'sticky', left: 0, zIndex: 20, background: 'var(--bg-secondary)' }}>Nº</th>
              <th style={{ minWidth: '200px', position: 'sticky', left: '45px', zIndex: 20, background: 'var(--bg-secondary)' }}>Colaborador / Sección</th>
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dObj = new Date(selectedYear, selectedMonth - 1, day);
                const dayOfWeek = dObj.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                return (
                  <th 
                    key={day} 
                    style={{ 
                      textAlign: 'center', 
                      padding: '0.35rem 0.15rem', 
                      minWidth: '28px',
                      background: isWeekend ? 'rgba(255,255,255,0.015)' : 'var(--bg-secondary)',
                      color: isWeekend ? 'var(--text-muted)' : 'var(--text-primary)'
                    }}
                  >
                    <div>{day}</div>
                    <div style={{ fontSize: '0.6rem', fontWeight: 400, opacity: 0.7 }}>
                      {dayInitials[dayOfWeek]}
                    </div>
                  </th>
                );
              })}
              <th style={{ textAlign: 'center', background: 'var(--bg-secondary)', minWidth: '50px' }}>% Asis</th>
              <th style={{ textAlign: 'center', background: 'var(--bg-secondary)', minWidth: '40px' }}>Aus</th>
              <th style={{ textAlign: 'center', background: 'var(--bg-secondary)', minWidth: '40px' }}>Vac</th>
              <th style={{ textAlign: 'center', background: 'var(--bg-secondary)', minWidth: '40px' }}>Lic</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map(emp => {
              let pCount = 0;
              let aCount = 0;
              let vCount = 0;
              let lCount = 0;

              return (
                <tr key={emp.id}>
                  <td 
                    className="font-mono" 
                    style={{ 
                      fontWeight: 600, 
                      color: 'var(--text-secondary)', 
                      position: 'sticky', 
                      left: 0, 
                      zIndex: 10, 
                      background: 'var(--bg-card)' 
                    }}
                  >
                    #{emp.docNumber}
                  </td>

                  <td 
                    style={{ 
                      position: 'sticky', 
                      left: '45px', 
                      zIndex: 10, 
                      background: 'var(--bg-card)' 
                    }}
                  >
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                      {emp.name}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      {emp.area}
                    </div>
                  </td>

                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dObj = new Date(selectedYear, selectedMonth - 1, day);
                    const isWeekend = dObj.getDay() === 0 || dObj.getDay() === 6;

                    const rec = attendanceRecords.find(a => a.workerId === emp.id && a.date === dateStr);
                    const status = rec ? rec.status : '1';

                    if (status === '1') pCount++;
                    else if (status === '0' || status === 'F') aCount++;
                    else if (status === 'V') vCount++;
                    else if (status === 'L') lCount++;

                    return (
                      <td 
                        key={day} 
                        style={{ 
                          padding: '0.15rem', 
                          textAlign: 'center',
                          background: isWeekend ? 'rgba(255,255,255,0.01)' : undefined 
                        }}
                      >
                        <div 
                          onClick={() => handleCellClick(emp, day)}
                          className={`matrix-cell matrix-cell-${status}`}
                          title={`Día ${day}: ${emp.name} (${status})`}
                        >
                          {status}
                        </div>
                      </td>
                    );
                  })}

                  <td className="font-mono" style={{ textAlign: 'center', fontWeight: 600, color: 'var(--color-present)' }}>
                    {Math.round((pCount / daysInMonth) * 100)}%
                  </td>
                  <td className="font-mono" style={{ textAlign: 'center', color: aCount > 0 ? 'var(--color-absent)' : 'var(--text-muted)' }}>
                    {aCount}
                  </td>
                  <td className="font-mono" style={{ textAlign: 'center', color: vCount > 0 ? 'var(--color-vacation)' : 'var(--text-muted)' }}>
                    {vCount}
                  </td>
                  <td className="font-mono" style={{ textAlign: 'center', color: lCount > 0 ? 'var(--color-license)' : 'var(--text-muted)' }}>
                    {lCount}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};
