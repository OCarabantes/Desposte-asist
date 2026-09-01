import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, NavTab } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { DashboardView } from './components/Dashboard/DashboardView';
import { AttendanceTakerView } from './components/DailyAttendance/AttendanceTakerView';
import { NonWorkedHoursView } from './components/NonWorkedHours/NonWorkedHoursView';
import { MonthlyMatrixView } from './components/MonthlyMatrix/MonthlyMatrixView';
import { StaffView } from './components/StaffManagement/StaffView';
import { SettingsView } from './components/Settings/SettingsView';
import { NonWorkedHoursModal } from './components/NonWorkedHours/NonWorkedHoursModal';
import { SendEmailModal } from './components/EmailReports/SendEmailModal';
import { LoginView } from './components/Auth/LoginView';

import { 
  Employee, 
  DailyAttendanceRecord, 
  NonWorkedHoursRecord, 
  PlantConfig, 
  AttendanceCode, 
  AreaType,
  EmailDispatchLog
} from './types/attendance';

import { StorageService } from './services/storageService';
import { ExcelService } from './services/excelService';
import { AuthService, UserSession } from './services/authService';
import { INITIAL_EMPLOYEES, INITIAL_PLANT_CONFIG } from './data/initialRoster';

export const App: React.FC = () => {
  // Auth state
  const [session, setSession] = useState<UserSession | null>(() => AuthService.getSession());

  // Navigation & Date
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [currentDate, setCurrentDate] = useState<string>('2026-08-10');
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  // Modals
  const [isNonWorkedModalOpen, setIsNonWorkedModalOpen] = useState<boolean>(false);
  const [isSendEmailOpen, setIsSendEmailOpen] = useState<boolean>(false);
  const [selectedWorkerForPermit, setSelectedWorkerForPermit] = useState<Employee | null>(null);

  // Core Data State
  const [config, setConfig] = useState<PlantConfig>(() => StorageService.getPlantConfig());
  const [employees, setEmployees] = useState<Employee[]>(() => StorageService.getEmployees());
  const [attendanceRecords, setAttendanceRecords] = useState<DailyAttendanceRecord[]>([]);
  const [allAttendance, setAllAttendance] = useState<DailyAttendanceRecord[]>(() => StorageService.getAllAttendance());
  const [nonWorkedHours, setNonWorkedHours] = useState<NonWorkedHoursRecord[]>(() => StorageService.getNonWorkedHours());
  const [emailLogs, setEmailLogs] = useState<EmailDispatchLog[]>(() => StorageService.getEmailLogs());

  // Load attendance when date or employees change
  const refreshAttendance = useCallback(() => {
    const daily = StorageService.getAttendanceForDate(currentDate);
    const all = StorageService.getAllAttendance();
    setAttendanceRecords(daily);
    setAllAttendance(all);
    setEmailLogs(StorageService.getEmailLogs());
  }, [currentDate]);

  useEffect(() => {
    if (session) {
      StorageService.syncWithRemoteDb().then(() => {
        setEmployees(StorageService.getEmployees());
        setConfig(StorageService.getPlantConfig());
        refreshAttendance();
      });
    }
  }, [session, refreshAttendance]);

  // Sync theme
  useEffect(() => {
    document.body.className = theme === 'dark' ? 'theme-dark' : 'theme-light';
  }, [theme]);

  // Logout handler
  const handleLogout = () => {
    AuthService.logout();
    setSession(null);
  };

  // Handlers
  const handleUpdateStatus = (recordId: string, status: AttendanceCode, notes?: string) => {
    const rec = attendanceRecords.find(r => r.id === recordId);
    if (rec) {
      const updated: DailyAttendanceRecord = { ...rec, status, notes: notes || rec.notes };
      StorageService.saveAttendanceRecord(updated);
      refreshAttendance();
    }
  };

  const handleBulkSetPresent = (areaFilter?: AreaType) => {
    const toUpdate = attendanceRecords
      .filter(r => !areaFilter || r.area === areaFilter)
      .map(r => ({ ...r, status: '1' as AttendanceCode }));
    StorageService.bulkUpdateAttendance(toUpdate);
    refreshAttendance();
  };

  const handleSaveNonWorked = (record: Omit<NonWorkedHoursRecord, 'id' | 'createdAt'>) => {
    StorageService.addNonWorkedHours(record);
    setNonWorkedHours(StorageService.getNonWorkedHours());
  };

  const handleDeleteNonWorked = (id: string) => {
    StorageService.deleteNonWorkedHours(id);
    setNonWorkedHours(StorageService.getNonWorkedHours());
  };

  const handleAddEmployee = (emp: Omit<Employee, 'id'>) => {
    StorageService.addEmployee(emp);
    setEmployees(StorageService.getEmployees());
    refreshAttendance();
  };

  const handleUpdateEmployee = (emp: Employee) => {
    StorageService.updateEmployee(emp);
    setEmployees(StorageService.getEmployees());
    refreshAttendance();
  };

  const handleDeleteEmployee = (id: string) => {
    StorageService.deleteEmployee(id);
    setEmployees(StorageService.getEmployees());
    refreshAttendance();
  };

  const handleUpdateConfig = (newConfig: PlantConfig) => {
    StorageService.savePlantConfig(newConfig);
    setConfig(newConfig);
  };

  const handleResetToDefault = () => {
    StorageService.saveEmployees(INITIAL_EMPLOYEES);
    StorageService.savePlantConfig(INITIAL_PLANT_CONFIG);
    localStorage.removeItem('karmac_desposte_attendance_v1');
    localStorage.removeItem('karmac_desposte_non_worked_hours_v1');
    localStorage.removeItem('karmac_desposte_email_logs_v1');
    setEmployees(INITIAL_EMPLOYEES);
    setConfig(INITIAL_PLANT_CONFIG);
    setNonWorkedHours([]);
    setEmailLogs([]);
    refreshAttendance();
  };

  const handleExportExcel = () => {
    const d = new Date(currentDate + 'T00:00:00');
    ExcelService.exportKarmacMonthlyWorkbook(
      d.getFullYear(),
      d.getMonth() + 1,
      employees,
      allAttendance,
      config
    );
  };

  const handleOpenPermitForWorker = (worker: Employee) => {
    setSelectedWorkerForPermit(worker);
    setIsNonWorkedModalOpen(true);
  };

  const handleLogEmailDispatch = (log: Omit<EmailDispatchLog, 'id' | 'timestamp'>) => {
    StorageService.logEmailDispatch(log);
    setEmailLogs(StorageService.getEmailLogs());
  };

  // If not authenticated, render Login Screen
  if (!session) {
    return <LoginView onLoginSuccess={(sess) => setSession(sess)} />;
  }

  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        config={config}
        theme={theme}
        onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        session={session}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {/* Sticky Top Header */}
        <Header
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          config={config}
          onOpenNewPermit={() => {
            setSelectedWorkerForPermit(null);
            setIsNonWorkedModalOpen(true);
          }}
          onExportExcel={handleExportExcel}
          onOpenSendEmail={() => setIsSendEmailOpen(true)}
        />

        {/* Dynamic View Body */}
        <div className="content-body">
          {activeTab === 'dashboard' && (
            <DashboardView
              currentDate={currentDate}
              employees={employees}
              attendance={attendanceRecords}
              nonWorkedHours={nonWorkedHours}
              config={config}
              onNavigateTab={setActiveTab}
              onOpenNewPermit={() => {
                setSelectedWorkerForPermit(null);
                setIsNonWorkedModalOpen(true);
              }}
              onOpenSendEmail={() => setIsSendEmailOpen(true)}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceTakerView
              currentDate={currentDate}
              employees={employees}
              attendanceRecords={attendanceRecords}
              onUpdateStatus={handleUpdateStatus}
              onBulkSetPresent={handleBulkSetPresent}
              onOpenPermitForWorker={handleOpenPermitForWorker}
              onOpenSendEmail={() => setIsSendEmailOpen(true)}
            />
          )}

          {activeTab === 'non-worked-hours' && (
            <NonWorkedHoursView
              currentDate={currentDate}
              nonWorkedHours={nonWorkedHours}
              employees={employees}
              config={config}
              onOpenNewPermit={() => {
                setSelectedWorkerForPermit(null);
                setIsNonWorkedModalOpen(true);
              }}
              onDeleteRecord={handleDeleteNonWorked}
            />
          )}

          {activeTab === 'monthly-matrix' && (
            <MonthlyMatrixView
              employees={employees}
              attendanceRecords={allAttendance}
              config={config}
              onUpdateStatus={(recordId, status) => {
                const parts = recordId.split('_');
                const dStr = parts[0];
                const empId = parts[1];
                const emp = employees.find(e => e.id === empId);
                if (emp) {
                  StorageService.saveAttendanceRecord({
                    id: recordId,
                    date: dStr,
                    workerId: emp.id,
                    docNumber: emp.docNumber,
                    workerName: emp.name,
                    area: emp.area,
                    status,
                    updatedAt: new Date().toISOString()
                  });
                  refreshAttendance();
                }
              }}
            />
          )}

          {activeTab === 'staff' && (
            <StaffView
              employees={employees}
              onAddEmployee={handleAddEmployee}
              onUpdateEmployee={handleUpdateEmployee}
              onDeleteEmployee={handleDeleteEmployee}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              config={config}
              onUpdateConfig={handleUpdateConfig}
              onResetToDefault={handleResetToDefault}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      <NonWorkedHoursModal
        isOpen={isNonWorkedModalOpen}
        onClose={() => {
          setIsNonWorkedModalOpen(false);
          setSelectedWorkerForPermit(null);
        }}
        currentDate={currentDate}
        employees={employees}
        config={config}
        preselectedWorker={selectedWorkerForPermit}
        onSave={handleSaveNonWorked}
      />

      <SendEmailModal
        isOpen={isSendEmailOpen}
        onClose={() => setIsSendEmailOpen(false)}
        currentDate={currentDate}
        employees={employees}
        attendance={attendanceRecords}
        allAttendance={allAttendance}
        nonWorkedHours={nonWorkedHours}
        config={config}
        emailLogs={emailLogs}
        onLogEmailDispatch={handleLogEmailDispatch}
      />
    </div>
  );
};

export default App;
