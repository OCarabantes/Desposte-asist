import { Employee, PlantConfig } from '../types/attendance';

export const INITIAL_PLANT_CONFIG: PlantConfig = {
  institution: 'FRIGORIFICO KARMAC SPA',
  areaName: 'DESPOSTE',
  supervisorName: 'SEBASTIAN SORUCO C.',
  supervisorRole: 'JEFE DE PRODUCCION',
  shiftStartTime: '07:30',
  shiftEndTime: '17:00',
  graceMinutes: 15,
  autoReconcile: true,
  hrEmailRecipients: ['cgarrido@karmac.cl', 'asistente.rrhh@karmac.cl'],
  ccEmailRecipients: ['ssoruco@karmac.cl']
};

export const INITIAL_EMPLOYEES: Employee[] = [
  // ==================== ÁREA: DESPOSTE (31 Colaboradores) ====================
  { id: 'DES-01', docNumber: '1', name: 'Aldophe Ylguens', area: 'DESPOSTE', role: 'Operador Desposte', active: true },
  { id: 'DES-02', docNumber: '2', name: 'Antillanca Saez Cesar Andres', area: 'DESPOSTE', role: 'Despostador Especialista', active: true },
  { id: 'DES-03', docNumber: '3', name: 'Astorga Valdevenito Juan Francisco', area: 'DESPOSTE', role: 'Operador Desposte', active: true },
  { id: 'DES-04', docNumber: '4', name: 'Cerda Benito José Nicolas', area: 'DESPOSTE', role: 'Operador Desposte', active: true },
  { id: 'DES-05', docNumber: '5', name: 'Fuentealba ramos sandy giuseppe', area: 'DESPOSTE', role: 'Despostador', active: true },
  { id: 'DES-06', docNumber: '6', name: 'Gonzalez Paine Rodrigo Andres', area: 'DESPOSTE', role: 'Operador Desposte', active: true },
  { id: 'DES-07', docNumber: '7', name: 'Emiliano Gonzalez', area: 'DESPOSTE', role: 'Operador Desposte', active: true },
  { id: 'DES-08', docNumber: '8', name: 'Hernandez Barrueto Jose Miguel', area: 'DESPOSTE', role: 'Despostador Senior', active: true },
  { id: 'DES-09', docNumber: '9', name: 'Hector Huilcal', area: 'DESPOSTE', role: 'Operador Desposte', active: true },
  { id: 'DES-10', docNumber: '10', name: 'Juan Jara Navarro', area: 'DESPOSTE', role: 'Operador Desposte', active: true },
  { id: 'DES-11', docNumber: '11', name: 'Jara Alarcon Ana Maria', area: 'DESPOSTE', role: 'Operadora Desposte', active: true },
  { id: 'DES-12', docNumber: '12', name: 'Muñoz Paredes Lorena Valeska', area: 'DESPOSTE', role: 'Operadora Desposte', active: true },
  { id: 'DES-13', docNumber: '13', name: 'Teresa Huaiquil', area: 'DESPOSTE', role: 'Operadora Desposte', active: true },
  { id: 'DES-14', docNumber: '14', name: 'Quilapan Salgado Julio Esteban', area: 'DESPOSTE', role: 'Operador Desposte', active: true },
  { id: 'DES-15', docNumber: '15', name: 'San Martin Mendez Maria Angelica', area: 'DESPOSTE', role: 'Operadora Desposte', active: true },
  { id: 'DES-16', docNumber: '16', name: 'Savaria Cheuque Reinaldo', area: 'DESPOSTE', role: 'Despostador', active: true },
  { id: 'DES-17', docNumber: '17', name: 'Torres Sandoval Ariel Orlando', area: 'DESPOSTE', role: 'Operador Desposte', active: true },
  { id: 'DES-18', docNumber: '18', name: 'Cleria Concha', area: 'DESPOSTE', role: 'Operadora Desposte', active: true },
  { id: 'DES-19', docNumber: '19', name: 'Cesar Torres', area: 'DESPOSTE', role: 'Operador Desposte', active: true },
  { id: 'DES-20', docNumber: '20', name: 'Juan Carlos Zuñiga', area: 'DESPOSTE', role: 'Despostador Especialista', active: true },
  { id: 'DES-21', docNumber: '21', name: 'Carlos Zuñiga', area: 'DESPOSTE', role: 'Operador Desposte', active: true },
  { id: 'DES-22', docNumber: '22', name: 'Brayan Lagos', area: 'DESPOSTE', role: 'Operador Desposte', active: true },
  { id: 'DES-23', docNumber: '23', name: 'Bruno Herrera', area: 'DESPOSTE', role: 'Operador Desposte', active: true },
  { id: 'DES-24', docNumber: '24', name: 'Fernando Hernandez', area: 'DESPOSTE', role: 'Despostador', active: true },
  { id: 'DES-25', docNumber: '25', name: 'Silvia Ramos', area: 'DESPOSTE', role: 'Operadora Desposte', active: true },
  { id: 'DES-26', docNumber: '26', name: 'Juan Carlos Quidel', area: 'DESPOSTE', role: 'Despostador', active: true },
  { id: 'DES-27', docNumber: '27', name: 'Zambrano Saldias Maria Olivia', area: 'DESPOSTE', role: 'Operadora Desposte', active: true },
  { id: 'DES-28', docNumber: '28', name: 'Mario fuentes', area: 'DESPOSTE', role: 'Operador Desposte', active: true },
  { id: 'DES-29', docNumber: '29', name: 'Luis Leal', area: 'DESPOSTE', role: 'Operador Desposte', active: true },
  { id: 'DES-30', docNumber: '30', name: 'Gregorio novoa', area: 'DESPOSTE', role: 'Operador Desposte', active: true },
  { id: 'DES-31', docNumber: '31', name: 'Muñoz Isla Jorge Alexis', area: 'DESPOSTE', role: 'Despostador', active: true },

  // ==================== ÁREA: PORCIONADO (10 Colaboradores) ====================
  { id: 'POR-01', docNumber: '1', name: 'JONATAN PURAN', area: 'PORCIONADO', role: 'Operador Porcionado', active: true },
  { id: 'POR-02', docNumber: '2', name: 'Ñanco Cheuquepan Cesar', area: 'PORCIONADO', role: 'Operador Porcionado', active: true },
  { id: 'POR-03', docNumber: '3', name: 'Vallejos Zambrano Cristian Rodrigo', area: 'PORCIONADO', role: 'Operador Porcionado', active: true },
  { id: 'POR-04', docNumber: '4', name: 'ALBERTO NAVARRETE DIAZ', area: 'PORCIONADO', role: 'Operador Porcionado Senior', active: true },
  { id: 'POR-05', docNumber: '5', name: 'BERNARDO SALAMANCA', area: 'PORCIONADO', role: 'Operador Porcionado', active: true },
  { id: 'POR-06', docNumber: '6', name: 'PATRICIO NAHUEL CATRUPAY', area: 'PORCIONADO', role: 'Operador Porcionado', active: true },
  { id: 'POR-07', docNumber: '7', name: 'Sergio Navea', area: 'PORCIONADO', role: 'Operador Porcionado', active: true },
  { id: 'POR-08', docNumber: '8', name: 'Sebastian Ramos', area: 'PORCIONADO', role: 'Operador Porcionado', active: true },
  { id: 'POR-09', docNumber: '9', name: 'Fabiola Pardo', area: 'PORCIONADO', role: 'Operadora Porcionado', active: true },
  { id: 'POR-10', docNumber: '10', name: 'IGNACIO GUEVILAO', area: 'PORCIONADO', role: 'Operador Porcionado', active: true },

  // ==================== ÁREA: SALA DE CUCHILLOS (1 Colaboradora) ====================
  { id: 'SAL-01', docNumber: '1', name: 'CECILIA SANDOVAL', area: 'SALA DE CUCHILLOS', role: 'Encargada Sala de Cuchillos', active: true },

  // ==================== ÁREA: VARAS (5 Colaboradores) ====================
  { id: 'VAR-01', docNumber: '1', name: 'Patricio Cayuan Catalan', area: 'VARAS', role: 'Operador Varas', active: true },
  { id: 'VAR-02', docNumber: '2', name: 'Angelo Gallardo Leal', area: 'VARAS', role: 'Operador Varas', active: true },
  { id: 'VAR-03', docNumber: '3', name: 'abraham alejandro lincopi lincopi', area: 'VARAS', role: 'Operador Varas', active: true },
  { id: 'VAR-04', docNumber: '4', name: 'Jaime Ancalaf  Silva', area: 'VARAS', role: 'Operador Varas', active: true },
  { id: 'VAR-05', docNumber: '5', name: 'Lepilao Namuncura Mauricio Alejandro', area: 'VARAS', role: 'Operador Varas', active: true },
];
