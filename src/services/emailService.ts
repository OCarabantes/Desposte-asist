import { 
  Employee, 
  DailyAttendanceRecord, 
  NonWorkedHoursRecord, 
  PlantConfig,
  AreaType
} from '../types/attendance';

export interface DailyEmailReportData {
  date: string;
  employees: Employee[];
  attendance: DailyAttendanceRecord[];
  nonWorkedHours: NonWorkedHoursRecord[];
  config: PlantConfig;
}

export interface WeeklyEmailReportData {
  startDate: string;
  endDate: string;
  employees: Employee[];
  allAttendance: DailyAttendanceRecord[];
  nonWorkedHours: NonWorkedHoursRecord[];
  config: PlantConfig;
}

export class EmailService {
  /**
   * Generates official Daily email subject
   */
  static generateSubject(dateStr: string, config: PlantConfig): string {
    const parts = dateStr.split('-');
    const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
    return `[KARMAC ${config.areaName}] Reporte Diario de Asistencia y Novedades - ${formattedDate}`;
  }

  /**
   * Generates official Weekly email subject
   */
  static generateWeeklySubject(startDateStr: string, endDateStr: string, config: PlantConfig): string {
    const sParts = startDateStr.split('-');
    const eParts = endDateStr.split('-');
    const sFmt = `${sParts[2]}/${sParts[1]}`;
    const eFmt = `${eParts[2]}/${eParts[1]}/${eParts[0]}`;
    return `[KARMAC ${config.areaName}] Reporte SEMANAL de Asistencia y Horas No Trabajadas - (${sFmt} al ${eFmt})`;
  }

  /**
   * Generates formatted Daily Plain Text email body
   */
  static generatePlainTextReport(data: DailyEmailReportData): string {
    const { date, employees, attendance, nonWorkedHours, config } = data;
    const parts = date.split('-');
    const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;

    const activeEmps = employees.filter(e => e.active);
    const totalStaff = activeEmps.length;
    const present = attendance.filter(a => a.status === '1').length;
    const absents = attendance.filter(a => a.status === '0' || a.status === 'F');
    const vacations = attendance.filter(a => a.status === 'V');
    const licenses = attendance.filter(a => a.status === 'L');
    const permissions = attendance.filter(a => a.status === 'P' || a.status === 'PSG');

    const attendanceRate = totalStaff > 0 ? Math.round((present / totalStaff) * 100) : 0;

    const todayNonWorked = nonWorkedHours.filter(n => n.date === date);
    const totalLostMinutes = todayNonWorked.reduce((sum, item) => sum + item.totalMinutes, 0);
    const totalLostHours = (totalLostMinutes / 60).toFixed(1);

    let body = `Estimado equipo de Recursos Humanos (cgarrido@karmac.cl, asistente.rrhh@karmac.cl),\n\n`;
    body += `Junto con saludar, adjunto el reporte oficial de asistencia diaria en sala y registro de horas no trabajadas para el área de ${config.areaName}.\n\n`;
    body += `[ADJUNTO]: Se adjunta la planilla Excel oficial "Reporte-Diario-Asistencia-DESPOSTE-${date}.xlsx" con el detalle nominal para su cotejo con los registros locales de ingreso a planta.\n\n`;

    body += `==========================================================\n`;
    body += `1. RESUMEN GENERAL DE DOTACIÓN Y TURNO\n`;
    body += `==========================================================\n`;
    body += `• Empresa: ${config.institution}\n`;
    body += `• Área: ${config.areaName}\n`;
    body += `• Fecha: ${formattedDate}\n`;
    body += `• Supervisor Responsable: ${config.supervisorName} (${config.supervisorRole})\n`;
    body += `• Horario Turno: ${config.shiftStartTime} a ${config.shiftEndTime}\n`;
    body += `• Dotación Total Activa: ${totalStaff} colaboradores\n`;
    body += `• Presentes en Sala: ${present} (${attendanceRate}% de Asistencia)\n`;
    body += `• Ausencias Totales: ${totalStaff - present}\n\n`;

    body += `==========================================================\n`;
    body += `2. DETALLE DE NOVEDADES Y AUSENCIAS\n`;
    body += `==========================================================\n`;
    if (absents.length === 0 && vacations.length === 0 && licenses.length === 0 && permissions.length === 0) {
      body += `(Sin ausencias ni novedades registradas en la jornada)\n\n`;
    } else {
      if (absents.length > 0) {
        body += `[FALLAS / AUSENCIAS INJUSTIFICADAS (${absents.length})]:\n`;
        absents.forEach(a => {
          body += `  - #${a.docNumber} ${a.workerName} (${a.area})\n`;
        });
      }
      if (vacations.length > 0) {
        body += `\n[VACACIONES (${vacations.length})]:\n`;
        vacations.forEach(a => {
          body += `  - #${a.docNumber} ${a.workerName} (${a.area})\n`;
        });
      }
      if (licenses.length > 0) {
        body += `\n[LICENCIAS MÉDICAS (${licenses.length})]:\n`;
        licenses.forEach(a => {
          body += `  - #${a.docNumber} ${a.workerName} (${a.area})\n`;
        });
      }
      if (permissions.length > 0) {
        body += `\n[PERMISOS AUTORIZADOS (${permissions.length})]:\n`;
        permissions.forEach(a => {
          body += `  - #${a.docNumber} ${a.workerName} (${a.area})\n`;
        });
      }
      body += `\n`;
    }

    body += `==========================================================\n`;
    body += `3. HORAS NO TRABAJADAS (PERMISOS, SALIDAS Y ATRASOS)\n`;
    body += `==========================================================\n`;
    if (todayNonWorked.length === 0) {
      body += `(No se registran salidas ni horas no trabajadas durante el turno)\n\n`;
    } else {
      body += `Total de Horas No Trabajadas: ${totalLostHours} hrs (${totalLostMinutes} minutos en ${todayNonWorked.length} eventos)\n\n`;
      todayNonWorked.forEach(item => {
        body += `  • ${item.workerName} (${item.area}):\n`;
        body += `    - Tipo: ${item.category.replace('_', ' ')} (${item.paid ? 'Con goce' : 'Sin goce - A descuento'})\n`;
        body += `    - Horario: ${item.startTime} a ${item.endTime} (${item.totalHours} hrs / ${item.totalMinutes}m)\n`;
        body += `    - Motivo: ${item.reason}\n`;
        body += `    - Comprobante adjunto: ${item.hasCertificate ? 'SÍ' : 'NO'}\n`;
        body += `    - Autorizado por: ${item.approvedBy}\n\n`;
      });
    }

    body += `==========================================================\n`;
    body += `Saluda atentamente,\n\n`;
    body += `${config.supervisorName}\n`;
    body += `${config.supervisorRole}\n`;
    body += `${config.institution} - Área ${config.areaName}\n`;

    return body;
  }

  /**
   * Generates formatted WEEKLY Plain Text email body
   */
  static generateWeeklyPlainTextReport(data: WeeklyEmailReportData): string {
    const { startDate, endDate, employees, allAttendance, nonWorkedHours, config } = data;
    const sParts = startDate.split('-');
    const eParts = endDate.split('-');
    const sFmt = `${sParts[2]}/${sParts[1]}/${sParts[0]}`;
    const eFmt = `${eParts[2]}/${eParts[1]}/${eParts[0]}`;

    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    const dateList: string[] = [];
    const curr = new Date(start);
    while (curr <= end) {
      const yyyy = curr.getFullYear();
      const mm = String(curr.getMonth() + 1).padStart(2, '0');
      const dd = String(curr.getDate()).padStart(2, '0');
      dateList.push(`${yyyy}-${mm}-${dd}`);
      curr.setDate(curr.getDate() + 1);
    }

    const activeEmps = employees.filter(e => e.active);
    const totalStaff = activeEmps.length;

    let totalWeeklyPresents = 0;
    let totalWeeklyAbsents = 0;
    let totalWeeklyVacations = 0;
    let totalWeeklyLicenses = 0;

    activeEmps.forEach(emp => {
      dateList.forEach(dStr => {
        const rec = allAttendance.find(a => a.workerId === emp.id && a.date === dStr);
        const st = rec ? rec.status : '1';
        if (st === '1') totalWeeklyPresents++;
        else if (st === '0' || st === 'F') totalWeeklyAbsents++;
        else if (st === 'V') totalWeeklyVacations++;
        else if (st === 'L') totalWeeklyLicenses++;
      });
    });

    const totalPossibleShifts = totalStaff * dateList.length;
    const avgAttendanceRate = totalPossibleShifts > 0 ? Math.round((totalWeeklyPresents / totalPossibleShifts) * 100) : 0;

    const weekNonWorked = nonWorkedHours.filter(n => dateList.includes(n.date));
    const totalWeekLostMins = weekNonWorked.reduce((sum, item) => sum + item.totalMinutes, 0);
    const totalWeekLostHours = (totalWeekLostMins / 60).toFixed(1);
    const paidMins = weekNonWorked.filter(n => n.paid).reduce((sum, item) => sum + item.totalMinutes, 0);
    const unpaidMins = weekNonWorked.filter(n => !n.paid).reduce((sum, item) => sum + item.totalMinutes, 0);

    let body = `Estimado equipo de Recursos Humanos (cgarrido@karmac.cl, asistente.rrhh@karmac.cl),\n\n`;
    body += `Junto con saludar, adjunto el REPORTE SEMANAL consolidado de asistencia en sala y balance de horas no trabajadas para el área de ${config.areaName}.\n\n`;
    body += `[ADJUNTO]: Se adjunta la planilla consolidada en Excel "Reporte-Semanal-Asistencia-DESPOSTE-${startDate}_al_${endDate}.xlsx" con las matrices de los 4 sectores para su cotejo.\n\n`;

    body += `==========================================================\n`;
    body += `1. BALANCE SEMANAL CONSOLIDADO\n`;
    body += `==========================================================\n`;
    body += `• Empresa: ${config.institution}\n`;
    body += `• Área: ${config.areaName}\n`;
    body += `• Periodo Semanal: Del ${sFmt} al ${eFmt} (${dateList.length} días)\n`;
    body += `• Supervisor Responsable: ${config.supervisorName} (${config.supervisorRole})\n`;
    body += `• Dotación Activa: ${totalStaff} colaboradores\n`;
    body += `• Promedio de Asistencia Semanal: ${avgAttendanceRate}%\n`;
    body += `• Turnos Presentes Totales: ${totalWeeklyPresents}\n`;
    body += `• Días Fallas / Injustificadas: ${totalWeeklyAbsents}\n`;
    body += `• Días en Vacaciones: ${totalWeeklyVacations}\n`;
    body += `• Días en Licencia Médica: ${totalWeeklyLicenses}\n\n`;

    body += `==========================================================\n`;
    body += `2. RESUMEN DE ASISTENCIA POR SECCIÓN PRODUCTIVA\n`;
    body += `==========================================================\n`;
    const sections: AreaType[] = ['DESPOSTE', 'PORCIONADO', 'SALA DE CUCHILLOS', 'VARAS'];
    sections.forEach(sec => {
      const secEmps = activeEmps.filter(e => e.area === sec);
      let secPres = 0;
      secEmps.forEach(emp => {
        dateList.forEach(dStr => {
          const rec = allAttendance.find(a => a.workerId === emp.id && a.date === dStr);
          if (rec && rec.status === '1') secPres++;
          else if (!rec) secPres++;
        });
      });
      const secTotal = secEmps.length * dateList.length;
      const secRate = secTotal > 0 ? Math.round((secPres / secTotal) * 100) : 100;
      body += `• ${sec} (${secEmps.length} trabajadores): ${secRate}% de Asistencia Semanal\n`;
    });
    body += `\n`;

    body += `==========================================================\n`;
    body += `3. BALANCE SEMANAL DE HORAS NO TRABAJADAS (HNT)\n`;
    body += `==========================================================\n`;
    body += `• Total Horas No Trabajadas en la semana: ${totalWeekLostHours} hrs (${totalWeekLostMins} minutos en ${weekNonWorked.length} eventos)\n`;
    body += `• Horas Con Goce (Remuneradas): ${(paidMins / 60).toFixed(1)} hrs\n`;
    body += `• Horas Sin Goce (A Descuento RRHH): ${(unpaidMins / 60).toFixed(1)} hrs\n\n`;

    if (weekNonWorked.length > 0) {
      body += `[DETALLE DE PERMISOS REGISTRADOS EN LA SEMANA]:\n`;
      weekNonWorked.forEach(item => {
        body += `  - [${item.date}] ${item.workerName} (${item.area}): ${item.category.replace('_', ' ')} por ${item.totalHours} hrs (${item.startTime}-${item.endTime}). Motivo: "${item.reason}". ${item.paid ? 'Con goce' : 'A descuento'}.\n`;
      });
      body += `\n`;
    }

    body += `==========================================================\n`;
    body += `Saluda cordialmente,\n\n`;
    body += `${config.supervisorName}\n`;
    body += `${config.supervisorRole}\n`;
    body += `${config.institution} - Área ${config.areaName}\n`;

    return body;
  }

  /**
   * Generates Daily mailto URL
   */
  static generateMailtoUrl(data: DailyEmailReportData, customRecipients?: string[]): string {
    const recipients = customRecipients && customRecipients.length > 0 
      ? customRecipients 
      : data.config.hrEmailRecipients;
    
    const to = recipients.join(',');
    const cc = (data.config.ccEmailRecipients || []).join(',');
    const subject = encodeURIComponent(this.generateSubject(data.date, data.config));
    const body = encodeURIComponent(this.generatePlainTextReport(data));

    let url = `mailto:${to}?subject=${subject}&body=${body}`;
    if (cc) {
      url += `&cc=${encodeURIComponent(cc)}`;
    }
    return url;
  }

  /**
   * Generates Weekly mailto URL
   */
  static generateWeeklyMailtoUrl(data: WeeklyEmailReportData, customRecipients?: string[]): string {
    const recipients = customRecipients && customRecipients.length > 0 
      ? customRecipients 
      : data.config.hrEmailRecipients;
    
    const to = recipients.join(',');
    const cc = (data.config.ccEmailRecipients || []).join(',');
    const subject = encodeURIComponent(this.generateWeeklySubject(data.startDate, data.endDate, data.config));
    const body = encodeURIComponent(this.generateWeeklyPlainTextReport(data));

    let url = `mailto:${to}?subject=${subject}&body=${body}`;
    if (cc) {
      url += `&cc=${encodeURIComponent(cc)}`;
    }
    return url;
  }
}
