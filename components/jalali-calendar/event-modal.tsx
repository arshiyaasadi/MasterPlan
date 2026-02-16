"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CalendarEvent } from "@/lib/events";
import { JALALI_MONTH_NAMES } from "@/lib/jalali";

interface EventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateKey: string | null;
  event: CalendarEvent | null;
  onSave: (payload: {
    id?: string;
    date: string;
    title: string;
    description?: string;
    time?: string;
  }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

function formatDateKey(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  const monthName = JALALI_MONTH_NAMES[m - 1] ?? m;
  return `${d} ${monthName} ${y}`;
}

export function EventModal({
  open,
  onOpenChange,
  dateKey,
  event,
  onSave,
  onDelete,
}: EventModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [time, setTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isEdit = !!event?.id;

  useEffect(() => {
    if (open) {
      setTitle(event?.title ?? "");
      setDescription(event?.description ?? "");
      setTime(event?.time ?? "");
    }
  }, [open, event?.title, event?.description, event?.time]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateKey || !title.trim()) return;
    setSaving(true);
    try {
      await onSave({
        ...(event?.id && { id: event.id }),
        date: dateKey,
        title: title.trim(),
        description: description.trim() || undefined,
        time: time.trim() || undefined,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!event?.id || !onDelete) return;
    setDeleting(true);
    try {
      await onDelete(event.id);
      onOpenChange(false);
    } finally {
      setDeleting(false);
    }
  };

  if (!dateKey) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "ویرایش رویداد" : "رویداد جدید"} — {formatDateKey(dateKey)}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="event-title" className="text-sm font-medium">
              عنوان (الزامی)
            </label>
            <Input
              id="event-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="عنوان رویداد"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="event-desc" className="text-sm font-medium">
              توضیحات
            </label>
            <Textarea
              id="event-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="توضیحات (اختیاری)"
              rows={2}
              className="resize-none"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="event-time" className="text-sm font-medium">
              زمان
            </label>
            <Input
              id="event-time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="مثلاً ۱۰:۰۰ (اختیاری)"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            {isEdit && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={saving || deleting}
              >
                {deleting ? "در حال حذف…" : "حذف"}
              </Button>
            )}
            <Button type="submit" disabled={saving || !title.trim()}>
              {saving ? "در حال ذخیره…" : "ذخیره"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
