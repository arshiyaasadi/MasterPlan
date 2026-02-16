"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Course } from "@/lib/courses";
import { getTotalHours } from "@/lib/courses";
import { formatJalaliDateFull, parseJalaliKey, moment } from "@/lib/jalali";
import { Clock, Percent, CalendarRange } from "lucide-react";

async function updateCourseSetup(
  id: string,
  payload: {
    description?: string;
    hoursPerSession?: number;
    durationDays?: number;
  }
): Promise<Course> {
  const res = await fetch(`/api/courses/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to update");
  }
  return res.json();
}

interface CourseSetupProps {
  course: Course;
  onUpdated: (course: Course) => void;
}

export function CourseSetup({ course, onUpdated }: CourseSetupProps) {
  const [description, setDescription] = useState(course.description ?? "");
  const [hoursPerSession, setHoursPerSession] = useState(
    course.hoursPerSession != null ? String(course.hoursPerSession) : ""
  );
  const [durationDays, setDurationDays] = useState(
    course.durationDays != null ? String(course.durationDays) : ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDescription(course.description ?? "");
    setHoursPerSession(
      course.hoursPerSession != null ? String(course.hoursPerSession) : ""
    );
    setDurationDays(
      course.durationDays != null ? String(course.durationDays) : ""
    );
  }, [course.id, course.description, course.hoursPerSession, course.durationDays]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const h = hoursPerSession.trim() ? Number(hoursPerSession) : undefined;
    const d = durationDays.trim() ? Number(durationDays) : undefined;
    if (h !== undefined && (Number.isNaN(h) || h <= 0)) {
      setError("تعداد ساعت هر جلسه باید عدد مثبت باشد");
      setSaving(false);
      return;
    }
    if (d !== undefined && (Number.isNaN(d) || d <= 0)) {
      setError("تعداد روز باید عدد مثبت باشد");
      setSaving(false);
      return;
    }
    try {
      const updated = await updateCourseSetup(course.id, {
        description: description.trim() || undefined,
        hoursPerSession: h,
        durationDays: d,
      });
      onUpdated(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا در ذخیره");
    } finally {
      setSaving(false);
    }
  };

  const totalHours = getTotalHours(course);

  const overview = useMemo(() => {
    const sorted = (course.selectedDates ?? []).slice().sort();
    const totalSessions = sorted.length;
    if (totalSessions === 0) {
      return {
        startDate: null,
        endDate: null,
        daysUntilStart: null,
        daysPassed: null,
        sessionsWithoutTime: 0,
        completionPercent: null,
        nextSessionIndex: null,
        nextSessionDateKey: null,
        totalSessions: 0,
        completedSessions: 0,
        sessionsHeld: 0,
        sessionsLeft: 0,
      };
    }
    const firstKey = sorted[0];
    const lastKey = sorted[sorted.length - 1];
    const today = moment().startOf("day");
    const startMoment = parseJalaliKey(firstKey).startOf("day");
    const endMoment = parseJalaliKey(lastKey).startOf("day");
    const daysUntilStart = startMoment.diff(today, "days");
    const daysPassed = daysUntilStart <= 0 ? today.diff(startMoment, "days") : 0;

    const sessionTimes = course.sessionTimes ?? {};
    const sessionDetails = course.sessionDetails ?? {};
    let sessionsWithoutTime = 0;
    let completedSessions = 0;
    let sessionsHeld = 0;
    for (const key of sorted) {
      const sessionMoment = parseJalaliKey(key).startOf("day");
      if (sessionMoment.isBefore(today)) sessionsHeld++;
      if (!sessionTimes[key]) sessionsWithoutTime++;
      const detail = sessionDetails[key];
      const hasTime = !!sessionTimes[key];
      const hasDetail =
        !!(detail?.title || detail?.description || (detail?.files?.length ?? 0) > 0);
      if (hasTime && hasDetail) completedSessions++;
    }
    const sessionsLeft = totalSessions - sessionsHeld;

    const completionPercent =
      totalSessions > 0
        ? Math.round((completedSessions / totalSessions) * 100)
        : null;

    let nextSessionIndex: number | null = null;
    let nextSessionDateKey: string | null = null;
    if (daysUntilStart <= 0) {
      for (let i = 0; i < sorted.length; i++) {
        const m = parseJalaliKey(sorted[i]).startOf("day");
        if (m.isSameOrAfter(today)) {
          nextSessionIndex = i + 1;
          nextSessionDateKey = sorted[i];
          break;
        }
      }
    } else {
      nextSessionIndex = 1;
      nextSessionDateKey = firstKey;
    }

    return {
      startDate: firstKey,
      endDate: lastKey,
      daysUntilStart: daysUntilStart > 0 ? daysUntilStart : null,
      daysPassed: daysPassed > 0 ? daysPassed : null,
      sessionsWithoutTime,
      completionPercent,
      totalSessions,
      completedSessions,
      nextSessionIndex,
      nextSessionDateKey,
      sessionsHeld,
      sessionsLeft,
    };
  }, [
    course.selectedDates,
    course.sessionTimes,
    course.sessionDetails,
  ]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ستاپ دوره</CardTitle>
          <CardDescription>تنظیمات و اطلاعات دوره: {course.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="course-desc"
              className="text-sm font-medium text-foreground"
            >
              توضیحات
            </label>
            <Textarea
              id="course-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="توضیحات دوره را وارد کنید"
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="hours-per-session"
                className="text-sm font-medium text-foreground"
              >
                تعداد ساعت هر جلسه
              </label>
              <Input
                id="hours-per-session"
                type="number"
                min={0.5}
                step={0.5}
                value={hoursPerSession}
                onChange={(e) => setHoursPerSession(e.target.value)}
                placeholder="مثلاً 2"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="duration-days"
                className="text-sm font-medium text-foreground"
              >
                تعداد روز تداوم دوره
              </label>
              <Input
                id="duration-days"
                type="number"
                min={1}
                step={1}
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                placeholder="مثلاً 5"
              />
            </div>
          </div>
          {error && (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          )}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "در حال ذخیره…" : "ذخیره تنظیمات"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>اطلاعات دوره (برآیند)</CardTitle>
          <CardDescription>نمای کلی دوره بر اساس تنظیمات و روزهای انتخاب‌شده</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p className="font-medium text-foreground">{course.name}</p>
          {course.description ? (
            <p className="text-muted-foreground line-clamp-3">
              {course.description}
            </p>
          ) : (
            <p className="text-muted-foreground">بدون توضیحات</p>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {course.hoursPerSession != null && course.hoursPerSession > 0 && (
              <span className="text-muted-foreground">
                {course.hoursPerSession} ساعت هر جلسه
              </span>
            )}
            {course.durationDays != null && course.durationDays > 0 && (
              <span className="text-muted-foreground">
                {course.durationDays} روز
              </span>
            )}
            {totalHours != null && (
              <span className="font-medium text-foreground">
                مجموع: {totalHours} ساعت
              </span>
            )}
          </div>

          {overview.totalSessions > 0 ? (
            <div className="border-t border-border pt-4 space-y-3">
              <p className="text-muted-foreground font-medium flex items-center gap-1.5">
                <CalendarRange className="size-4" />
                بازه و وضعیت زمانی
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {overview.startDate && (
                  <div className="rounded-md bg-muted/40 px-3 py-2">
                    <span className="text-muted-foreground text-xs">تاریخ شروع</span>
                    <p className="font-medium text-foreground">
                      {formatJalaliDateFull(overview.startDate)}
                    </p>
                  </div>
                )}
                {overview.endDate && (
                  <div className="rounded-md bg-muted/40 px-3 py-2">
                    <span className="text-muted-foreground text-xs">تاریخ پایان</span>
                    <p className="font-medium text-foreground">
                      {formatJalaliDateFull(overview.endDate)}
                    </p>
                  </div>
                )}
                {overview.daysUntilStart != null && overview.daysUntilStart > 0 && (
                  <div className="rounded-md bg-primary/10 px-3 py-2">
                    <span className="text-muted-foreground text-xs">چند روز تا شروع</span>
                    <p className="font-medium text-foreground">
                      {overview.daysUntilStart} روز
                    </p>
                  </div>
                )}
                {overview.daysPassed != null && overview.daysPassed > 0 && (
                  <div className="rounded-md bg-muted/40 px-3 py-2">
                    <span className="text-muted-foreground text-xs">چند روز گذشته از شروع</span>
                    <p className="font-medium text-foreground">
                      {overview.daysPassed} روز
                    </p>
                  </div>
                )}
                <div className="rounded-md bg-muted/40 px-3 py-2">
                  <span className="text-muted-foreground text-xs">جلسات برگزار شده</span>
                  <p className="font-medium text-foreground">
                    {overview.sessionsHeld} از {overview.totalSessions} جلسه
                  </p>
                </div>
                <div className="rounded-md bg-primary/10 px-3 py-2">
                  <span className="text-muted-foreground text-xs">جلسات مانده</span>
                  <p className="font-medium text-foreground">
                    {overview.sessionsLeft} جلسه
                  </p>
                </div>
                {overview.nextSessionIndex != null && overview.nextSessionDateKey && (
                  <div className="rounded-md bg-primary/10 px-3 py-2 sm:col-span-2">
                    <span className="text-muted-foreground text-xs">جلسه بعدی</span>
                    <p className="font-medium text-foreground">
                      جلسه {overview.nextSessionIndex}
                      {" — "}
                      {formatJalaliDateFull(overview.nextSessionDateKey)}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                {overview.sessionsWithoutTime > 0 && (
                  <div className="flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-1.5">
                    <Clock className="size-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-foreground">
                      {overview.sessionsWithoutTime} جلسه بدون ساعت
                    </span>
                  </div>
                )}
                {overview.completionPercent != null && (
                  <div className="flex items-center gap-1.5 rounded-md border border-border bg-muted/30 px-3 py-1.5">
                    <Percent className="size-4 text-muted-foreground" />
                    <span className="text-foreground">
                      {overview.completionPercent}٪ تکمیل شده
                    </span>
                    <span className="text-muted-foreground text-xs">
                      ({100 - overview.completionPercent}٪ باقی‌مانده)
                    </span>
                  </div>
                )}
              </div>
              {overview.completionPercent != null && overview.completionPercent < 100 && (
                <p className="text-muted-foreground text-xs">
                  درصد تکمیل بر اساس جلساتی که هم ساعت و هم حداقل یکی از (عنوان، توضیحات، مستندات) را دارند.
                </p>
              )}
            </div>
          ) : null}

          {totalHours == null &&
            !course.hoursPerSession &&
            !course.durationDays &&
            overview.totalSessions === 0 && (
              <p className="text-muted-foreground">
                برای دیدن برآیند، ساعت هر جلسه و تعداد روز را وارد و ذخیره کنید؛ سپس روزهای دوره را در تقویم انتخاب کنید.
              </p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
