import { START_DATE, SCHEDULE_TEMPLATES } from '../constants';
import { ScheduleTemplate } from '../types';

export const getWeeksPassed = (targetDate: Date): number => {
  const start = new Date(START_DATE).getTime();
  const target = new Date(targetDate).getTime();
  const diff = target - start;
  const weeks = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
  return weeks;
};

export const getScheduleForWeek = (baseScheduleId: number, weeksPassed: number): ScheduleTemplate | undefined => {
  const baseIndex = baseScheduleId - 1;
  const rotatedIndex = ((baseIndex + weeksPassed) % 7 + 7) % 7;
  return SCHEDULE_TEMPLATES[rotatedIndex];
};

export const getWeekRange = (date: Date) => {
  const current = new Date(date);
  const day = current.getDay();
  const diff = current.getDate() - day + (day === 0 ? -6 : 1);
  
  const monday = new Date(current.setDate(diff));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  return { start: monday, end: sunday };
};