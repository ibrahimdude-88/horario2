export type ShiftLocation = 'Guardia' | 'Valle' | 'Mitras' | 'Descanso' | 'Office';

export interface Shift {
  dayIndex: number;
  label: string;
  location: ShiftLocation;
  isToday?: boolean;
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
  avatarUrl?: string;
}

export interface SwapRequest {
  id: string;
  weekNumber: number;
  requesterId: string;
  targetId: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Vacation {
  id: string;
  employeeId: string;
  start: Date;
  end: Date;
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