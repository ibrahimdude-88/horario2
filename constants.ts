import { ScheduleTemplate, LOCATIONS } from './types';

export const START_DATE = new Date('2025-12-29T00:00:00');

const s = (start: string, end: string, loc: string) => ({
  label: start === 'OFF' ? 'Descanso' : `${start} - ${end}`,
  location: loc as any
});

export const SCHEDULE_TEMPLATES: ScheduleTemplate[] = [
  {
    id: 1,
    name: 'H-1 (Guardia)',
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
    id: 2,
    name: 'H-2 (Valle)',
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
    name: 'H-3 (Mitras)',
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
    name: 'H-4 (Guardia)',
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
    name: 'H-5 (Valle)',
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
    name: 'H-6 (Mitras)',
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
    name: 'H-7 (Mitras)',
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