export interface Course {
  id: string;
  name: string;
  /** Course description (ستاپ دوره) */
  description?: string;
  /** Hours per session (تعداد ساعت هر جلسه) */
  hoursPerSession?: number;
  /** Duration in days (تعداد روز تداوم دوره) */
  durationDays?: number;
  /** Selected course days (Jalali YYYY-MM-DD) for session schedule */
  selectedDates?: string[];
  /** Session start time per date (Jalali date key -> "HH:mm") */
  sessionTimes?: Record<string, string>;
  /** Per-session title, description, and file refs (Jalali date key -> detail) */
  sessionDetails?: Record<string, SessionDetail>;
}

export interface SessionFile {
  id: string;
  /** Unique filename on disk (in course-sessions folder) */
  savedName: string;
  /** Display name (user can edit) */
  originalName: string;
  description?: string;
}

export interface SessionDetail {
  title?: string;
  description?: string;
  files?: SessionFile[];
}

/** Total hours = hoursPerSession × durationDays (one session per day). */
export function getTotalHours(course: Course): number | null {
  const h = course.hoursPerSession;
  const d = course.durationDays;
  if (h == null || d == null || h <= 0 || d <= 0) return null;
  return Math.round(h * d * 10) / 10;
}

export interface CoursesData {
  courses: Course[];
}

export function isValidCourseName(name: unknown): name is string {
  return typeof name === "string" && name.trim().length > 0;
}

export function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
