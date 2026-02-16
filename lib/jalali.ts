/**
 * Jalali (Shamsi) calendar helpers using moment-jalaali.
 * Use only in client components ("use client").
 * moment-jalaali has no .jalali() method; use string + format 'jYYYY/jM/jD' to create dates.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const jMoment = require("moment-jalaali") as typeof import("moment");
(jMoment as unknown as { loadPersian?: (o: { dialect?: string; usePersianDigits?: boolean }) => void }).loadPersian?.({ dialect: "persian-modern", usePersianDigits: false });

const JALALI_FORMAT = "jYYYY/jM/jD";

export type MomentJ = import("moment").Moment;

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** Jalali date string YYYY-MM-DD */
export function toJalaliKey(m: MomentJ): string {
  return `${m.jYear()}-${pad(m.jMonth() + 1)}-${pad(m.jDate())}`;
}

/** Create moment from Jalali year, month (1–12), day */
export function createJalali(jYear: number, jMonth: number, jDay: number): MomentJ {
  return jMoment(`${jYear}/${jMonth}/${jDay}`, JALALI_FORMAT);
}

export function parseJalaliKey(key: string): MomentJ {
  const [y, m, d] = key.split("-").map(Number);
  return createJalali(y, m, d);
}

/** Start of Jalali month (moment) */
export function startOfJalaliMonth(jYear: number, jMonth: number): MomentJ {
  return createJalali(jYear, jMonth, 1);
}

/** Number of days in a Jalali month (static on jMoment, not on instance) */
export function getJalaliDaysInMonth(jYear: number, jMonth: number): number {
  return (jMoment as unknown as { jDaysInMonth: (y: number, m: number) => number }).jDaysInMonth(jYear, jMonth - 1);
}

/** Weekday: 0 = Saturday (Shanbeh), 6 = Friday (Jomeh) */
export function getWeekdaySatToFri(m: MomentJ): number {
  const d = m.day();
  return (d + 1) % 7;
}

/** Gregorian day for display (small text) */
export function formatGregorian(m: MomentJ): string {
  return m.format("D/M");
}

export const JALALI_MONTH_NAMES = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

export function getJalaliMonthName(jMonth: number): string {
  return JALALI_MONTH_NAMES[jMonth - 1] ?? "";
}

/** 0 = Saturday ... 6 = Friday (short) */
export const WEEKDAY_NAMES = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

/** Full Persian weekday names */
export const WEEKDAY_NAMES_FULL = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنج‌شنبه",
  "جمعه",
];

/** Format Jalali date key to full Persian date (e.g. ۱۵ فروردین ۱۴۰۴) */
export function formatJalaliDateFull(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  const name = JALALI_MONTH_NAMES[m - 1] ?? m;
  return `${d} ${name} ${y}`;
}

export { jMoment as moment };
