"use client";

import { cn } from "@/lib/utils";
import type { MomentJ } from "@/lib/jalali";
import { toJalaliKey, formatGregorian, getWeekdaySatToFri } from "@/lib/jalali";

interface CalendarCellProps {
  m: MomentJ;
  isCurrentMonth: boolean;
  isToday: boolean;
  /** 1-based session number when selected, null when not selected */
  sessionNumber: number | null;
  onSelect: (dateKey: string) => void;
}

export function CalendarCell({
  m,
  isCurrentMonth,
  isToday,
  sessionNumber,
  onSelect,
}: CalendarCellProps) {
  const dateKey = toJalaliKey(m);
  const weekday = getWeekdaySatToFri(m);
  const isFriday = weekday === 6;
  const isSelected = sessionNumber != null;

  return (
    <button
      type="button"
      onClick={() => onSelect(dateKey)}
      className={cn(
        "relative flex min-h-14 flex-col items-center justify-start rounded-lg border p-1.5 text-start transition-colors sm:min-h-16",
        "focus-visible:ring-ring outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        isCurrentMonth
          ? "bg-background text-foreground hover:bg-accent/50"
          : "bg-muted/30 text-muted-foreground",
        isToday && "ring-2 ring-primary ring-offset-2",
        isFriday && isCurrentMonth && "text-destructive",
        isSelected && "bg-primary/15 ring-1 ring-primary"
      )}
    >
      <span className="text-lg font-bold sm:text-xl">{m.jDate()}</span>
      <span
        className={cn(
          "absolute bottom-1 start-1 text-[10px] sm:text-xs",
          isCurrentMonth ? "text-muted-foreground" : "text-muted-foreground/70"
        )}
      >
        {formatGregorian(m)}
      </span>
      {sessionNumber != null && (
        <span
          className="absolute top-1 end-1 text-xs font-bold text-primary sm:text-sm"
          aria-label={`جلسه ${sessionNumber}`}
        >
          #{sessionNumber}
        </span>
      )}
    </button>
  );
}
