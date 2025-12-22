
export type ShiftLocation = 'Guardia' | 'Valle' | 'Mitras' | 'Descanso' | 'VACACIONES';

export interface Shift {
  dayIndex: number;
  label: string;
  location: ShiftLocation;
}

export interface ScheduleTemplate {
  id: number;
  name: string;
  shifts: Shift[];
}

export interface Employee {
  id: string;
  name: string;
  baseScheduleId: number;
}

export interface SwapRequest {
  id: string;
  weekNumber: number;
  requesterId: string;
  targetId: string;
  reason: string;
}

export interface Vacation {
  id: string;
  employeeId: string;
  start: Date;
  end: Date;
}

export interface ShiftOverride {
  id: string;
  employeeId: string;
  date: string; 
  location: ShiftLocation;
  reason?: string;
}

export interface AppState {
  currentDate: Date;
  viewMode: 'my-schedule' | 'general' | 'config';
  isAuthenticated: boolean;
  isAdmin: boolean;
  theme: 'light' | 'dark';
}

export const LOCATIONS = {
  GUARDIA: 'Guardia',
  VALLE: 'Valle',
  MITRAS: 'Mitras',
  DESCANSO: 'Descanso'
} as const;
