"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Course } from "@/lib/courses";
import { formatJalaliDateFull } from "@/lib/jalali";
import { cn } from "@/lib/utils";

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
function toEnglishDigits(s: string): string {
  return s.replace(/[۰-۹0-9]/g, (c) => {
    const i = PERSIAN_DIGITS.indexOf(c);
    return i >= 0 ? String(i) : c;
  });
}

/** Keep only digits, normalize Persian to English, max 4 chars, format as HH:mm */
function formatTimeInput(raw: string): string {
  const digits = toEnglishDigits(raw).replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

const TIME_REGEX = /^([01]?\d|2[0-3]):([0-5]\d)$/;
function isValidTime(s: string): boolean {
  return TIME_REGEX.test(s);
}

/** Normalize to HH:mm for validation/submit (digits only, 4 chars → HH:mm). */
function normalizeTimeToHHMM(raw: string): string | null {
  const digits = toEnglishDigits(raw).replace(/\D/g, "").slice(0, 4);
  if (digits.length !== 4) return null;
  const hh = digits.slice(0, 2);
  const mm = digits.slice(2, 4);
  const s = `${hh}:${mm}`;
  return isValidTime(s) ? s : null;
}

interface BatchSessionTimeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course;
  onSave: (sessionTimes: Record<string, string>) => Promise<void>;
}

export function BatchSessionTimeModal({
  open,
  onOpenChange,
  course,
  onSave,
}: BatchSessionTimeModalProps) {
  const selectedDatesSorted = (course.selectedDates ?? []).slice().sort();
  const sessionTimes = course.sessionTimes ?? {};
  type TimeFilter = "all" | "withTime" | "withoutTime";
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [timeValue, setTimeValue] = useState("");
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  const filteredIndices = selectedDatesSorted
    .map((dateKey, index) => ({ dateKey, index }))
    .filter(({ dateKey }) => {
      const hasTime = !!sessionTimes[dateKey];
      if (timeFilter === "withTime") return hasTime;
      if (timeFilter === "withoutTime") return !hasTime;
      return true;
    });

  const handleTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTimeInput(e.target.value);
    setTimeValue(formatted);
  }, []);

  const indicesInFilter = new Set(filteredIndices.map(({ index }) => index));
  const allFilteredSelected =
    filteredIndices.length > 0 &&
    filteredIndices.every(({ index }) => selectedIndices.has(index));

  useEffect(() => {
    if (open) {
      setTimeValue("");
      setSelectedIndices(new Set());
      setTimeFilter("all");
    }
  }, [open]);

  const handleToggleAllInFilter = () => {
    if (allFilteredSelected) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices((prev) => new Set([...prev, ...indicesInFilter]));
    }
  };

  const toggleSession = (index: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const normalizedTime = normalizeTimeToHHMM(timeValue);
  const validTime = normalizedTime !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const time = normalizeTimeToHHMM(timeValue);
    if (!time || selectedIndices.size === 0) return;
    const existing = { ...(course.sessionTimes ?? {}) };
    selectedIndices.forEach((i) => {
      const dateKey = selectedDatesSorted[i];
      if (dateKey) existing[dateKey] = time;
    });
    setSaving(true);
    try {
      await onSave(existing);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const canSubmit = validTime && selectedIndices.size > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>تعیین ساعت جلسات</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="batch-time" className="text-sm font-medium text-foreground">
              ساعت شروع
            </label>
            <Input
              id="batch-time"
              type="text"
              inputMode="numeric"
              value={timeValue}
              onChange={handleTimeChange}
              placeholder="۰۹:۳۰ یا 09:30"
              className="font-mono text-lg"
              maxLength={5}
              aria-invalid={timeValue.length > 0 && !validTime}
            />
            <p className="text-muted-foreground text-xs">
              فقط عدد (فارسی یا انگلیسی). بعد از دو رقم به‌صورت خودکار «:» قرار می‌گیرد.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-foreground">جلسه‌های مورد نظر</span>
              <div className="flex rounded-md border border-border bg-muted/30 p-0.5" role="tablist">
                {(
                  [
                    { value: "all" as const, label: "همه" },
                    { value: "withoutTime" as const, label: "بدون ساعت" },
                    { value: "withTime" as const, label: "با ساعت" },
                  ] as const
                ).map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={timeFilter === value}
                    onClick={() => setTimeFilter(value)}
                    className={cn(
                      "rounded px-2 py-1 text-xs font-medium transition-colors",
                      timeFilter === value
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1 rounded-md border bg-muted/20 p-2 max-h-48 overflow-y-auto">
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors hover:bg-accent/50",
                  allFilteredSelected && "bg-primary/15 font-medium"
                )}
              >
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={handleToggleAllInFilter}
                  className="size-4 rounded border-input"
                />
                {timeFilter === "all"
                  ? "تمام جلسات"
                  : timeFilter === "withoutTime"
                    ? "تمام جلسات بدون ساعت"
                    : "تمام جلسات با ساعت"}
                {allFilteredSelected && (
                  <span className="text-muted-foreground text-xs">
                    (کلیک برای برداشتن همه)
                  </span>
                )}
              </label>
              {filteredIndices.map(({ dateKey, index }) => (
                <label
                  key={dateKey}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors hover:bg-accent/50",
                    selectedIndices.has(index) && "bg-primary/15"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedIndices.has(index)}
                    onChange={() => toggleSession(index)}
                    className="size-4 rounded border-input"
                  />
                  <span className="font-medium text-primary">جلسه {index + 1}</span>
                  <span className="text-muted-foreground">—</span>
                  <span className="text-foreground">{formatJalaliDateFull(dateKey)}</span>
                  {sessionTimes[dateKey] && (
                    <span className="font-mono text-primary text-xs mr-auto">
                      {sessionTimes[dateKey]}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              انصراف
            </Button>
            <Button type="submit" disabled={saving || !canSubmit}>
              {saving ? "در حال ذخیره…" : "تایید"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
