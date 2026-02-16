"use client";

import { useState, useRef } from "react";
import { ChevronRight, ChevronLeft, CalendarDays, Clock } from "lucide-react";
import {
  startOfJalaliMonth,
  toJalaliKey,
  getWeekdaySatToFri,
  createJalali,
  getJalaliDaysInMonth,
  JALALI_MONTH_NAMES,
  WEEKDAY_NAMES_FULL,
  WEEKDAY_NAMES,
  formatJalaliDateFull,
  moment,
  type MomentJ,
} from "@/lib/jalali";
import type { Course } from "@/lib/courses";
import { CalendarCell } from "./calendar-cell";
import { MonthYearPicker } from "./month-year-picker";
import { BatchSessionTimeModal } from "./batch-session-time-modal";
import { SessionDetailModal } from "./session-detail-modal";
import { SessionCard } from "./session-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

async function updateCourseSelectedDates(
  courseId: string,
  selectedDates: string[]
): Promise<Course> {
  const res = await fetch(`/api/courses/${courseId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ selectedDates }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to update");
  }
  return res.json();
}

async function updateCourseSessionTimes(
  courseId: string,
  sessionTimes: Record<string, string>
): Promise<Course> {
  const res = await fetch(`/api/courses/${courseId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionTimes }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to update");
  }
  return res.json();
}

interface JalaliCalendarProps {
  course: Course;
  onCourseUpdated: (course: Course) => void;
}

export function JalaliCalendar({ course, onCourseUpdated }: JalaliCalendarProps) {
  const now = moment();
  const [jYear, setJYear] = useState(now.jYear());
  const [jMonth, setJMonth] = useState(now.jMonth());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [batchTimeModalOpen, setBatchTimeModalOpen] = useState(false);
  const [sessionDetailDateKey, setSessionDetailDateKey] = useState<string | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const selectedDatesSorted = (course.selectedDates ?? []).slice().sort();
  const selectedDatesSet = new Set(selectedDatesSorted);
  const maxSessions = course.durationDays != null && course.durationDays > 0 ? course.durationDays : null;

  const startOfMonth = startOfJalaliMonth(jYear, jMonth);
  const firstWeekday = getWeekdaySatToFri(startOfMonth);
  const daysInMonth = getJalaliDaysInMonth(jYear, jMonth);
  const prevJYear = jMonth === 1 ? jYear - 1 : jYear;
  const prevJMonth = jMonth === 1 ? 12 : jMonth - 1;
  const prevMonthDays = getJalaliDaysInMonth(prevJYear, prevJMonth);

  const cells: { m: MomentJ; isCurrentMonth: boolean }[] = [];
  for (let i = 0; i < firstWeekday; i++) {
    const d = prevMonthDays - firstWeekday + i + 1;
    cells.push({
      m: createJalali(prevJYear, prevJMonth, d),
      isCurrentMonth: false,
    });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      m: createJalali(jYear, jMonth, d),
      isCurrentMonth: true,
    });
  }
  const remaining = 42 - cells.length;
  const nextJYear = jMonth === 12 ? jYear + 1 : jYear;
  const nextJMonth = jMonth === 12 ? 1 : jMonth + 1;
  for (let d = 1; d <= remaining; d++) {
    cells.push({
      m: createJalali(nextJYear, nextJMonth, d),
      isCurrentMonth: false,
    });
  }

  const todayKey = toJalaliKey(now);

  const handleSelectDate = async (dateKey: string) => {
    const next = new Set(selectedDatesSet);
    if (next.has(dateKey)) {
      next.delete(dateKey);
    } else {
      if (maxSessions != null && next.size >= maxSessions) return;
      next.add(dateKey);
    }
    const arr = Array.from(next).sort();
    setSaving(true);
    try {
      const updated = await updateCourseSelectedDates(course.id, arr);
      onCourseUpdated(updated);
    } finally {
      setSaving(false);
    }
  };

  const goToToday = () => {
    setJYear(now.jYear());
    setJMonth(now.jMonth());
    setPickerOpen(false);
  };

  const sessionNumberByDate = new Map<string, number>();
  selectedDatesSorted.forEach((key, i) => sessionNumberByDate.set(key, i + 1));

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2" dir="rtl">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                if (jMonth === 1) {
                  setJMonth(12);
                  setJYear((y) => y - 1);
                } else {
                  setJMonth((m) => m - 1);
                }
              }}
              aria-label="ماه قبل"
            >
              <ChevronRight className="size-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                if (jMonth === 12) {
                  setJMonth(1);
                  setJYear((y) => y + 1);
                } else {
                  setJMonth((m) => m + 1);
                }
              }}
              aria-label="ماه بعد"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="text-foreground"
            >
              امروز
            </Button>
          </div>
          <div className="relative" ref={headerRef}>
            <button
              type="button"
              onClick={() => setPickerOpen((o) => !o)}
              className={cn(
                "rounded-md px-2 py-1 text-lg font-semibold text-foreground hover:bg-accent",
                "focus-visible:ring-ring outline-none focus-visible:ring-2"
              )}
              aria-expanded={pickerOpen}
              aria-haspopup="dialog"
            >
              {JALALI_MONTH_NAMES[jMonth - 1]} {jYear}
            </button>
            <MonthYearPicker
              open={pickerOpen}
              onClose={() => setPickerOpen(false)}
              anchorRef={headerRef}
              jYear={jYear}
              jMonth={jMonth}
              onSelect={(y, m) => {
                setJYear(y);
                setJMonth(m);
              }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-2" dir="rtl">
        <div className="grid grid-cols-7 gap-1 pb-1">
          {WEEKDAY_NAMES_FULL.map((name, i) => (
            <div
              key={name}
              className="text-center text-xs font-medium text-muted-foreground"
              title={name}
            >
              <span className="hidden sm:inline">{name}</span>
              <span className="sm:hidden">{WEEKDAY_NAMES[i]}</span>
            </div>
          ))}
        </div>
        {(maxSessions != null || selectedDatesSorted.length > 0) && (
          <p className="text-muted-foreground mb-2 text-center text-xs">
            {maxSessions != null ? (
              <>
                <span className="font-medium text-foreground">{selectedDatesSorted.length}</span>
                {" از "}
                <span className="font-medium text-foreground">{maxSessions}</span>
                {" جلسه انتخاب شده"}
              </>
            ) : (
              <>
                <span className="font-medium text-foreground">{selectedDatesSorted.length}</span>
                {" جلسه انتخاب شده. برای محدودیت تعداد، در ستاپ دوره «تعداد روز تداوم دوره» را وارد کنید."}
              </>
            )}
          </p>
        )}
        <div className="grid grid-cols-7 gap-1">
          {cells.map(({ m, isCurrentMonth }) => {
            const dateKey = toJalaliKey(m);
            return (
              <CalendarCell
                key={dateKey}
                m={m}
                isCurrentMonth={isCurrentMonth}
                isToday={dateKey === todayKey}
                sessionNumber={sessionNumberByDate.get(dateKey) ?? null}
                onSelect={handleSelectDate}
              />
            );
          })}
        </div>
        {saving && (
          <p className="text-muted-foreground mt-2 text-center text-xs">
            در حال ذخیره…
          </p>
        )}
      </CardContent>

      {selectedDatesSorted.length > 0 && (
        <CardContent className="border-t border-border pt-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <CalendarDays className="size-4" />
              روزهای انتخاب‌شده با جزئیات
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setBatchTimeModalOpen(true)}
              className="gap-1.5"
            >
              <Clock className="size-4" />
              تعیین ساعت جلسات
            </Button>
          </div>
          <ul className="space-y-2">
            {selectedDatesSorted.map((dateKey, index) => (
              <SessionCard
                key={dateKey}
                course={course}
                dateKey={dateKey}
                sessionIndex={index}
                onEditClick={() => setSessionDetailDateKey(dateKey)}
              />
            ))}
          </ul>
          {sessionDetailDateKey && (
            <SessionDetailModal
              open={!!sessionDetailDateKey}
              onOpenChange={(open) => !open && setSessionDetailDateKey(null)}
              course={course}
              dateKey={sessionDetailDateKey}
              sessionIndex={selectedDatesSorted.indexOf(sessionDetailDateKey)}
              onCourseUpdated={onCourseUpdated}
            />
          )}
          <BatchSessionTimeModal
            open={batchTimeModalOpen}
            onOpenChange={setBatchTimeModalOpen}
            course={course}
            onSave={async (sessionTimes) => {
              const updated = await updateCourseSessionTimes(course.id, sessionTimes);
              onCourseUpdated(updated);
            }}
          />
        </CardContent>
      )}
    </Card>
  );
}
