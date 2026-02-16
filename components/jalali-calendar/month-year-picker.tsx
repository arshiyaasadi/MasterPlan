"use client";

import { useRef, useEffect } from "react";
import { JALALI_MONTH_NAMES } from "@/lib/jalali";
import { cn } from "@/lib/utils";

interface MonthYearPickerProps {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  jYear: number;
  jMonth: number;
  onSelect: (jYear: number, jMonth: number) => void;
}

const MIN_YEAR = 1350;
const MAX_YEAR = 1450;

/** Persian digit for 1–12 */
const MONTH_NUMBERS = ["۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹", "۱۰", "۱۱", "۱۲"];

export function MonthYearPicker({
  open,
  onClose,
  anchorRef,
  jYear,
  jMonth,
  onSelect,
}: MonthYearPickerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute top-full z-50 mt-1 w-64 rounded-lg border bg-background p-3 shadow-lg"
      role="dialog"
      aria-label="انتخاب ماه و سال"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground">سال</span>
        <select
          className="rounded-md border bg-background px-2 py-1 text-sm"
          value={jYear}
          onChange={(e) => onSelect(Number(e.target.value), jMonth)}
          aria-label="سال"
        >
          {Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i)
            .reverse()
            .map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
        </select>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {JALALI_MONTH_NAMES.map((name, i) => (
          <button
            key={name}
            type="button"
            onClick={() => {
              onSelect(jYear, i + 1);
              onClose();
            }}
            className={cn(
              "rounded-md px-2 py-1.5 text-sm transition-colors text-start",
              jMonth === i + 1
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent"
            )}
          >
            <span className="text-muted-foreground me-1">{MONTH_NUMBERS[i]}</span>
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
