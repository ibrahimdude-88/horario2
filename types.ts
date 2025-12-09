export type ShiftLocation = 'Guardia' | 'Valle' | 'Mitras' | 'Descanso' | 'Office';

export interface Shift {
  dayIndex: number; // 0 = Monday, 6 = Sunday
  label: string; // e.g., "07:00 - 15:00"
  location: ShiftLocation;
  isToday?: boolean;
}

export interface ScheduleTemplate {
  id: number;
  name: string;
  shifts: Shift[]; // Array of 7 shifts (Mon-Sun)
}

export interface Employee {
  id: string;
  name: string;
  baseScheduleId: number; // The schedule they have on Week 1
  avatarUrl?: string;
}

export interface SwapRequest {
  id: string;
  weekNumber: number;
  requesterId: string; // Who initiates/leaves the shift
  targetId: string;    // Who takes the shift
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