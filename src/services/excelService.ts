import * as XLSX from 'xlsx';
import { 
  Employee, 
  DailyAttendanceRecord, 
  NonWorkedHoursRecord, 
  PlantConfig, 
  AreaType 
} from '../types/attendance';

export class ExcelService {
  /**
   * Export Full Monthly Attendance Workbook in exact KARMAC format (4 Sheets)
   */
  static exportKarmacMonthlyWorkbook(
    year: number,
    month: number,
    employees: Employee[],
    attendanceList: DailyAttendanceRecord[],
    config: PlantConfig
  ): void {
    const wb = XLSX.utils.book_new();
    const areas: { area: AreaType; sheetName: string }[] = [
      { area: 'DESPOSTE', sheetName: 'LISTADO-ASISTENCIA DESPOSTE' },
      { area: 'PORCIONADO', sheetName: 'LISTADO-ASISTENCIA PORCIONADO' },
      { area: 'SALA DE CUCHILLOS', sheetName: 'LISTADO-ASISTENCIA SALA DE CUCH' },
      { area: 'VARAS', sheetName: 'LISTADO-ASISTENCIA VARAS' }
    ];

    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const monthName = monthNames[month - 1];
    const daysInMonth = new Date(year, month, 0).getDate();
    const dayInitials = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

    areas.forEach(({ area, sheetName }) => {
      const areaEmployees = employees.filter(e => e.area === area && e.active);
      const wsData: any[][] = [];

      wsData.push([]);

      let totalPresents = 0;
      let totalAbsents = 0;
      let totalVacations = 0;
      let totalMedical = 0;

      areaEmployees.forEach(emp => {
        for (let d = 1; d <= daysInMonth; d++) {
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const rec = attendanceList.find(a => a.workerId === emp.id && a.date === dateStr);
          if (rec) {
            if (rec.status === '1') totalPresents++;
            else if (rec.status === '0' || rec.status === 'F') totalAbsents++;
            else if (rec.status === 'V') totalVacations++;
            else if (rec.status === 'L') totalMedical++;
          }
        }
      });

      wsData.push(['', '', '', '', '', '', '', '', '', '', '', '', 'ASISTENTES', '', '', '', totalPresents, 'VACACIONES', '', '', '', totalVacations, '', '', '', 'Leyenda', '', '', '', '', '%']);
      wsData.push(['', '', 'INSTITUCIÓN:', '', config.institution, '', '', '', '', '', '', '', 'AUSENCIAS', '', '', '', totalAbsents, 'LICENCIAS', '', '', '', totalMedical, '', '', '', 'Asistencia =', '', '', '1', '', '']);
      wsData.push(['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Ausencia =', '', '', '0', '', '']);
      wsData.push(['', '', 'RESPONSABLE:', '', config.supervisorName, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Vacaciones =', '', '', 'V', 'V', '']);
      wsData.push([]);
      wsData.push(['', '', 'CARGO', '', config.supervisorRole, '', '', '', '', '', '', '', '', '', '', '', 'AÑO', '', year, '', '', '', '10', '', '', 'Licencia =', '', '', 'L', 'L', '']);
      wsData.push([]);
      wsData.push(['', '', 'AREA', '', area, '', '', '', '', '', '', '', '', '', '', '', 'MES', '', monthName, '', '', month, daysInMonth, '', '', '', '', '', '', '', '']);

      const r10 = new Array(40).fill('');
      r10[35] = '1'; r10[36] = '0'; r10[37] = 'T'; r10[38] = 'J';
      wsData.push(r10);

      const r11 = ['', '', '', ''];
      for (let d = 1; d <= 31; d++) {
        r11.push(d <= daysInMonth ? `${d}/${month}/${year}` : '');
      }
      r11.push('ASISTENCIA', 'AUSENCIA', 'VACACIONES', 'LICENCIA');
      wsData.push(r11);

      const r12 = ['', '', '', ''];
      for (let d = 1; d <= 31; d++) {
        if (d <= daysInMonth) {
          const dayDate = new Date(year, month - 1, d);
          r12.push(dayInitials[dayDate.getDay()]);
        } else {
          r12.push('');
        }
      }
      wsData.push(r12);

      const r13 = ['', 'Nº Documento', 'Nombres y Apellidos', ''];
      for (let d = 1; d <= 31; d++) {
        r13.push(d.toString());
      }
      wsData.push(r13);

      wsData.push([]);

      areaEmployees.forEach(emp => {
        const empRow = ['', emp.docNumber, emp.name, ''];
        let empPresents = 0;
        let empAbsents = 0;
        let empVacations = 0;
        let empMedical = 0;

        for (let d = 1; d <= 31; d++) {
          if (d <= daysInMonth) {
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const rec = attendanceList.find(a => a.workerId === emp.id && a.date === dateStr);
            const mark = rec ? rec.status : '1';
            empRow.push(mark);

            if (mark === '1') empPresents++;
            else if (mark === '0' || mark === 'F') empAbsents++;
            else if (mark === 'V') empVacations++;
            else if (mark === 'L') empMedical++;
          } else {
            empRow.push('');
          }
        }

        const workingDays = daysInMonth - 8;
        const pctPresent = workingDays > 0 ? `${Math.round((empPresents / workingDays) * 100)}%` : '100%';
        const pctAbsent = workingDays > 0 ? `${Math.round((empAbsents / workingDays) * 100)}%` : '0%';
        const pctVac = `${empVacations}d`;
        const pctMed = `${empMedical}d`;

        empRow.push(pctPresent, pctAbsent, pctVac, pctMed);
        wsData.push(empRow);
      });

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws['!cols'] = [
        { wch: 3 }, { wch: 12 }, { wch: 36 }, { wch: 3 },
        ...Array(31).fill({ wch: 4 }),
        { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }
      ];

      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    const fileName = `Control-de-Asistencia-DESPOSTE-${monthName}-${year}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  /**
   * Export Official DAILY Attendance & Permits Excel Report for RRHH
   */
  static exportDailyReportWorkbook(
    dateStr: string,
    employees: Employee[],
    attendanceList: DailyAttendanceRecord[],
    nonWorkedList: NonWorkedHoursRecord[],
    config: PlantConfig
  ): void {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Asistencia Diaria en Sala
    const sheet1Data: any[][] = [
      ['REPORTE DIARIO DE ASISTENCIA Y DOTACIÓN - ÁREA DESPOSTE'],
      ['EMPRESA:', config.institution],
      ['ÁREA / UNIDAD:', config.areaName],
      ['FECHA:', dateStr],
      ['SUPERVISOR RESPONSABLE:', `${config.supervisorName} (${config.supervisorRole})`],
      ['HORARIO TURNO:', `${config.shiftStartTime} a ${config.shiftEndTime}`],
      [],
      ['Nº Doc', 'Colaborador', 'Sección / Cuadrilla', 'Cargo', 'Estado Asistencia en Sala', 'Observaciones']
    ];

    employees.filter(e => e.active).forEach(emp => {
      const rec = attendanceList.find(a => a.workerId === emp.id && a.date === dateStr);
      const statusText = rec ? (
        rec.status === '1' ? 'PRESENTE' :
        rec.status === '0' ? 'AUSENTE / FALLA' :
        rec.status === 'V' ? 'VACACIONES' :
        rec.status === 'L' ? 'LICENCIA MÉDICA' :
        rec.status === 'P' ? 'PERMISO' : rec.status
      ) : 'PRESENTE';

      sheet1Data.push([
        emp.docNumber,
        emp.name,
        emp.area,
        emp.role,
        statusText,
        rec?.notes || ''
      ]);
    });

    const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);
    ws1['!cols'] = [{ wch: 8 }, { wch: 34 }, { wch: 20 }, { wch: 24 }, { wch: 24 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, ws1, 'Asistencia_Diaria');

    // Sheet 2: Horas No Trabajadas del día
    const dateNonWorked = nonWorkedList.filter(n => n.date === dateStr);
    const sheet2Data: any[][] = [
      ['HORAS NO TRABAJADAS Y PERMISOS DEL DÍA'],
      ['FECHA:', dateStr],
      ['SUPERVISOR:', config.supervisorName],
      [],
      ['ID', 'Colaborador', 'Sección', 'Tipo Permiso', 'Hora Inicio', 'Hora Fin', 'Total Minutos', 'Total Horas', '¿Con Goce?', 'Motivo / Detalle', 'Autorizado Por', 'Certificado']
    ];

    dateNonWorked.forEach(r => {
      sheet2Data.push([
        r.id,
        r.workerName,
        r.area,
        r.category,
        r.startTime,
        r.endTime,
        r.totalMinutes,
        r.totalHours,
        r.paid ? 'SÍ (Remunerado)' : 'NO (A Descuento)',
        r.reason,
        r.approvedBy,
        r.hasCertificate ? 'SÍ' : 'NO'
      ]);
    });

    const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);
    ws2['!cols'] = [{ wch: 14 }, { wch: 32 }, { wch: 18 }, { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 16 }, { wch: 35 }, { wch: 22 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, ws2, 'Permisos_HNT');

    XLSX.writeFile(wb, `Reporte-Diario-Asistencia-DESPOSTE-${dateStr}.xlsx`);
  }

  /**
   * Export Official WEEKLY Attendance & Lost Hours Excel Report for RRHH
   */
  static exportWeeklyReportWorkbook(
    startDateStr: string,
    endDateStr: string,
    employees: Employee[],
    allAttendance: DailyAttendanceRecord[],
    nonWorkedList: NonWorkedHoursRecord[],
    config: PlantConfig
  ): void {
    const wb = XLSX.utils.book_new();

    const start = new Date(startDateStr + 'T00:00:00');
    const end = new Date(endDateStr + 'T00:00:00');
    const dateList: string[] = [];
    const dayLabels: string[] = [];
    const dayInitials = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    const curr = new Date(start);
    while (curr <= end) {
      const yyyy = curr.getFullYear();
      const mm = String(curr.getMonth() + 1).padStart(2, '0');
      const dd = String(curr.getDate()).padStart(2, '0');
      dateList.push(`${yyyy}-${mm}-${dd}`);
      dayLabels.push(`${dayInitials[curr.getDay()]} ${dd}/${mm}`);
      curr.setDate(curr.getDate() + 1);
    }

    // Sheet 1: Matriz de Asistencia Semanal
    const sheet1Data: any[][] = [
      ['REPORTE SEMANAL DE ASISTENCIA Y GESTIÓN DE DOTACIÓN - RRHH'],
      ['EMPRESA:', config.institution],
      ['ÁREA / UNIDAD:', config.areaName],
      ['PERIODO SEMANAL:', `Desde ${startDateStr} hasta ${endDateStr}`],
      ['SUPERVISOR RESPONSABLE:', `${config.supervisorName} (${config.supervisorRole})`],
      ['HORARIO TURNO:', `${config.shiftStartTime} a ${config.shiftEndTime}`],
      [],
      [
        'Nº Doc', 
        'Colaborador', 
        'Sección', 
        'Cargo', 
        ...dayLabels, 
        'Días Pres', 
        'Días Aus', 
        'Días Vac', 
        'Días Lic', 
        '% Asistencia',
        'Horas HNT'
      ]
    ];

    employees.filter(e => e.active).forEach(emp => {
      const row: any[] = [emp.docNumber, emp.name, emp.area, emp.role];
      let pCount = 0;
      let aCount = 0;
      let vCount = 0;
      let lCount = 0;

      dateList.forEach(dStr => {
        const rec = allAttendance.find(a => a.workerId === emp.id && a.date === dStr);
        const st = rec ? rec.status : '1';
        row.push(st);

        if (st === '1') pCount++;
        else if (st === '0' || st === 'F') aCount++;
        else if (st === 'V') vCount++;
        else if (st === 'L') lCount++;
      });

      const totalDays = dateList.length;
      const rate = totalDays > 0 ? `${Math.round((pCount / totalDays) * 100)}%` : '100%';

      const workerMins = nonWorkedList
        .filter(n => n.workerId === emp.id && dateList.includes(n.date))
        .reduce((sum, n) => sum + n.totalMinutes, 0);
      const workerHours = (workerMins / 60).toFixed(1);

      row.push(pCount, aCount, vCount, lCount, rate, `${workerHours}h`);
      sheet1Data.push(row);
    });

    const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);
    ws1['!cols'] = [
      { wch: 8 }, { wch: 34 }, { wch: 18 }, { wch: 22 },
      ...Array(dateList.length).fill({ wch: 10 }),
      { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 14 }, { wch: 12 }
    ];
    XLSX.utils.book_append_sheet(wb, ws1, 'Matriz_Asistencia_Semanal');

    // Sheet 2: Horas No Trabajadas de la Semana
    const weekNonWorked = nonWorkedList.filter(n => dateList.includes(n.date));
    const sheet2Data: any[][] = [
      ['DETALLE SEMANAL DE HORAS NO TRABAJADAS Y PERMISOS - RRHH'],
      ['PERIODO:', `${startDateStr} a ${endDateStr}`],
      ['SUPERVISOR:', config.supervisorName],
      [],
      ['Fecha', 'Colaborador', 'Sección', 'Tipo Permiso', 'Hora Inicio', 'Hora Fin', 'Total Minutos', 'Total Horas', '¿Con Goce?', 'Motivo / Justificación', 'Autorizado Por', 'Certificado']
    ];

    weekNonWorked.forEach(r => {
      sheet2Data.push([
        r.date,
        r.workerName,
        r.area,
        r.category,
        r.startTime,
        r.endTime,
        r.totalMinutes,
        r.totalHours,
        r.paid ? 'SÍ (Remunerado)' : 'NO (A Descuento)',
        r.reason,
        r.approvedBy,
        r.hasCertificate ? 'SÍ' : 'NO'
      ]);
    });

    const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);
    ws2['!cols'] = [{ wch: 12 }, { wch: 32 }, { wch: 18 }, { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 16 }, { wch: 35 }, { wch: 22 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, ws2, 'Permisos_Semana');

    const fileName = `Reporte-Semanal-Asistencia-DESPOSTE-${startDateStr}_al_${endDateStr}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  /**
   * Export Non Worked Hours & Permits Report
   */
  static exportNonWorkedHoursReport(
    records: NonWorkedHoursRecord[],
    config: PlantConfig
  ): void {
    const wb = XLSX.utils.book_new();
    const data: any[][] = [
      ['REPORTE DE HORAS NO TRABAJADAS Y CONTROL DE PERMISOS'],
      ['EMPRESA:', config.institution],
      ['ÁREA:', config.areaName],
      ['SUPERVISOR:', config.supervisorName],
      ['FECHA REPORTE:', new Date().toLocaleDateString('es-CL')],
      [],
      [
        'ID', 
        'Fecha', 
        'Colaborador', 
        'Área', 
        'Categoría', 
        'Hora Inicio', 
        'Hora Fin', 
        'Total Minutos', 
        'Total Horas', 
        '¿Con Goce?', 
        'Motivo / Fundamento', 
        'Autorizado Por', 
        'Certificado', 
        'Estado'
      ]
    ];

    records.forEach(r => {
      data.push([
        r.id,
        r.date,
        r.workerName,
        r.area,
        r.category,
        r.startTime,
        r.endTime,
        r.totalMinutes,
        r.totalHours,
        r.paid ? 'SÍ (Con Goce)' : 'NO (Sin Goce)',
        r.reason,
        r.approvedBy,
        r.hasCertificate ? 'SÍ' : 'NO',
        r.status
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [
      { wch: 14 }, { wch: 12 }, { wch: 32 }, { wch: 18 }, 
      { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, 
      { wch: 12 }, { wch: 15 }, { wch: 35 }, { wch: 22 }, { wch: 12 }, { wch: 12 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Permisos_Horas_Perdidas');
    XLSX.writeFile(wb, `Reporte-Permisos-Horas-No-Trabajadas-${new Date().toISOString().substring(0, 10)}.xlsx`);
  }
}
