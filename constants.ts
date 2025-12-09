import { ScheduleTemplate, Employee, LOCATIONS } from './types';

// Start Date: December 29, 2025 (Monday)
export const START_DATE = new Date('2025-12-29T00:00:00');

// Helper to create a specific shift
const s = (start: string, end: string, loc: string) => ({
  label: start === 'OFF' ? 'Descanso' : `${start} - ${end}`,
  location: loc as any
});

// 7 Fixed Schedule Templates based on specific requirements
export const SCHEDULE_TEMPLATES: ScheduleTemplate[] = [
  {
    id: 1,
    name: 'Horario 1 (Guardia)',
    shifts: [
      { dayIndex: 0, ...s('05:30 PM', '09:00 PM', LOCATIONS.GUARDIA) }, // Lun
      { dayIndex: 1, ...s('05:30 PM', '09:00 PM', LOCATIONS.GUARDIA) }, // Mar
      { dayIndex: 2, ...s('05:30 PM', '09:00 PM', LOCATIONS.GUARDIA) }, // Mie
      { dayIndex: 3, ...s('05:30 PM', '09:00 PM', LOCATIONS.GUARDIA) }, // Jue
      { dayIndex: 4, ...s('05:00 PM', '09:00 PM', LOCATIONS.GUARDIA) }, // Vie (Different time)
      { dayIndex: 5, ...s('10:00 AM', '09:00 PM', LOCATIONS.GUARDIA) }, // Sab
      { dayIndex: 6, ...s('10:00 AM', '09:00 PM', LOCATIONS.GUARDIA) }, // Dom
    ]
  },
  {
    id: 2,
    name: 'Horario 2 (Valle)',
    shifts: [
      { dayIndex: 0, ...s('10:00 AM', '07:00 PM', LOCATIONS.VALLE) },
      { dayIndex: 1, ...s('10:00 AM', '07:00 PM', LOCATIONS.VALLE) },
      { dayIndex: 2, ...s('10:00 AM', '07:00 PM', LOCATIONS.VALLE) },
      { dayIndex: 3, ...s('10:00 AM', '07:00 PM', LOCATIONS.VALLE) },
      { dayIndex: 4, ...s('10:00 AM', '07:00 PM', LOCATIONS.VALLE) },
      { dayIndex: 5, ...s('OFF', 'OFF', LOCATIONS.DESCANSO) },
      { dayIndex: 6, ...s('OFF', 'OFF', LOCATIONS.DESCANSO) },
    ]
  },
  {
    id: 3,
    name: 'Horario 3 (Mitras)',
    shifts: [
      { dayIndex: 0, ...s('10:00 AM', '07:00 PM', LOCATIONS.MITRAS) },
      { dayIndex: 1, ...s('10:00 AM', '07:00 PM', LOCATIONS.MITRAS) },
      { dayIndex: 2, ...s('10:00 AM', '07:00 PM', LOCATIONS.MITRAS) },
      { dayIndex: 3, ...s('10:00 AM', '07:00 PM', LOCATIONS.MITRAS) },
      { dayIndex: 4, ...s('10:00 AM', '07:00 PM', LOCATIONS.MITRAS) },
      { dayIndex: 5, ...s('OFF', 'OFF', LOCATIONS.DESCANSO) },
      { dayIndex: 6, ...s('OFF', 'OFF', LOCATIONS.DESCANSO) },
    ]
  },
  {
    id: 4,
    name: 'Horario 4 (Guardia)',
    shifts: [
      { dayIndex: 0, ...s('05:30 PM', '09:00 PM', LOCATIONS.GUARDIA) },
      { dayIndex: 1, ...s('05:30 PM', '09:00 PM', LOCATIONS.GUARDIA) },
      { dayIndex: 2, ...s('05:30 PM', '09:00 PM', LOCATIONS.GUARDIA) },
      { dayIndex: 3, ...s('05:30 PM', '09:00 PM', LOCATIONS.GUARDIA) },
      { dayIndex: 4, ...s('05:00 PM', '09:00 PM', LOCATIONS.GUARDIA) },
      { dayIndex: 5, ...s('10:00 AM', '09:00 PM', LOCATIONS.GUARDIA) },
      { dayIndex: 6, ...s('10:00 AM', '09:00 PM', LOCATIONS.GUARDIA) },
    ]
  },
  {
    id: 5,
    name: 'Horario 5 (Valle)',
    shifts: [
      { dayIndex: 0, ...s('10:00 AM', '07:00 PM', LOCATIONS.VALLE) },
      { dayIndex: 1, ...s('10:00 AM', '07:00 PM', LOCATIONS.VALLE) },
      { dayIndex: 2, ...s('10:00 AM', '07:00 PM', LOCATIONS.VALLE) },
      { dayIndex: 3, ...s('10:00 AM', '07:00 PM', LOCATIONS.VALLE) },
      { dayIndex: 4, ...s('10:00 AM', '07:00 PM', LOCATIONS.VALLE) },
      { dayIndex: 5, ...s('OFF', 'OFF', LOCATIONS.DESCANSO) },
      { dayIndex: 6, ...s('OFF', 'OFF', LOCATIONS.DESCANSO) },
    ]
  },
  {
    id: 6,
    name: 'Horario 6 (Mitras)',
    shifts: [
      { dayIndex: 0, ...s('08:30 AM', '05:30 PM', LOCATIONS.MITRAS) },
      { dayIndex: 1, ...s('08:30 AM', '05:30 PM', LOCATIONS.MITRAS) },
      { dayIndex: 2, ...s('08:30 AM', '05:30 PM', LOCATIONS.MITRAS) },
      { dayIndex: 3, ...s('08:30 AM', '05:30 PM', LOCATIONS.MITRAS) },
      { dayIndex: 4, ...s('08:30 AM', '05:30 PM', LOCATIONS.MITRAS) },
      { dayIndex: 5, ...s('OFF', 'OFF', LOCATIONS.DESCANSO) },
      { dayIndex: 6, ...s('OFF', 'OFF', LOCATIONS.DESCANSO) },
    ]
  },
  {
    id: 7,
    name: 'Horario 7 (Mitras)',
    shifts: [
      { dayIndex: 0, ...s('08:30 AM', '05:30 PM', LOCATIONS.MITRAS) },
      { dayIndex: 1, ...s('08:30 AM', '05:30 PM', LOCATIONS.MITRAS) },
      { dayIndex: 2, ...s('08:30 AM', '05:30 PM', LOCATIONS.MITRAS) },
      { dayIndex: 3, ...s('08:30 AM', '05:30 PM', LOCATIONS.MITRAS) },
      { dayIndex: 4, ...s('08:30 AM', '05:30 PM', LOCATIONS.MITRAS) },
      { dayIndex: 5, ...s('OFF', 'OFF', LOCATIONS.DESCANSO) },
      { dayIndex: 6, ...s('OFF', 'OFF', LOCATIONS.DESCANSO) },
    ]
  },
];

export const INITIAL_EMPLOYEES: Employee[] = [];