import { START_DATE, SCHEDULE_TEMPLATES } from '../constants';
import { ScheduleTemplate } from '../types';

/**
 * Calculates the number of weeks passed since the start date.
 * Allows negative values/history.
 */
export const getWeeksPassed = (targetDate: Date): number => {
  const start = new Date(START_DATE).getTime();
  const target = new Date(targetDate).getTime();
  const diff = target - start;
  // Convert milliseconds to weeks
  const weeks = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
  return weeks;
};

/**
 * Determines the specific schedule for a user based on their base assignment and the current week.
 * Logic: (BaseIndex + WeeksPassed) % 7. Handles negative rotation correctly.
 */
export const getScheduleForWeek = (baseScheduleId: number, weeksPassed: number): ScheduleTemplate | undefined => {
  // Convert 1-based ID to 0-based index
  const baseIndex = Number(baseScheduleId) - 1;
  
  // Standard circular array rotation logic with support for negative numbers
  // ((n % m) + m) % m ensures positive index
  const rotatedIndex = ((baseIndex + weeksPassed) % 7 + 7) % 7;
  
  // Return the template
  return SCHEDULE_TEMPLATES[rotatedIndex];
};

export const getWeekRange = (date: Date) => {
  const current = new Date(date);
  const day = current.getDay();
  // Adjust to make Monday index 0, Sunday index 6. 
  // Native getDay(): Sun=0, Mon=1...
  const diff = current.getDate() - day + (day === 0 ? -6 : 1);
  
  const monday = new Date(current.setDate(diff));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  return { start: monday, end: sunday };
};