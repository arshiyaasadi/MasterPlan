import { join } from "path";

export interface CalendarEvent {
  id: string;
  /** Jalali date string YYYY-MM-DD (e.g. 1404-11-15) */
  date: string;
  title: string;
  description?: string;
  time?: string;
  /** Optional link to course for "روز های دوره" */
  courseId?: string;
}

export interface EventsData {
  events: CalendarEvent[];
}

const DATA_DIR = "data";
const EVENTS_FILE = "events.json";

export function getEventsFilePath(): string {
  return join(process.cwd(), DATA_DIR, EVENTS_FILE);
}

export function isValidJalaliDate(date: unknown): date is string {
  if (typeof date !== "string") return false;
  return /^\d{4}-\d{1,2}-\d{1,2}$/.test(date);
}

export function isValidEventTitle(title: unknown): title is string {
  return typeof title === "string" && title.trim().length > 0;
}

export function createEventId(): string {
  return `ev-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
