"use client";

import { useState, useEffect, useRef } from "react";
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
import type { Course, SessionDetail, SessionFile } from "@/lib/courses";
import { formatJalaliDateFull } from "@/lib/jalali";
import { FileText, Upload, Trash2, Download } from "lucide-react";

interface SessionDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course;
  dateKey: string;
  sessionIndex: number;
  onCourseUpdated: (course: Course) => void;
}

async function patchCourseSessionDetails(
  courseId: string,
  sessionDetails: Record<string, SessionDetail>
): Promise<Course> {
  const res = await fetch(`/api/courses/${courseId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionDetails }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to update");
  }
  return res.json();
}

export function SessionDetailModal({
  open,
  onOpenChange,
  course,
  dateKey,
  sessionIndex,
  onCourseUpdated,
}: SessionDetailModalProps) {
  const detail = (course.sessionDetails ?? {})[dateKey] ?? {};
  const [title, setTitle] = useState(detail.title ?? "");
  const [description, setDescription] = useState(detail.description ?? "");
  const [saving, setSaving] = useState(false);
  const [fileToAdd, setFileToAdd] = useState<File | null>(null);
  const [newFileName, setNewFileName] = useState("");
  const [newFileDesc, setNewFileDesc] = useState("");
  const [uploading, setUploading] = useState(false);
  const [fileMetaEdits, setFileMetaEdits] = useState<Record<string, { originalName: string; description: string }>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const d = (course.sessionDetails ?? {})[dateKey] ?? {};
      setTitle(d.title ?? "");
      setDescription(d.description ?? "");
      setFileToAdd(null);
      setNewFileName("");
      setNewFileDesc("");
      setFileMetaEdits({});
    }
  }, [open, course.sessionDetails, dateKey]);

  const files = detail.files ?? [];

  const handleSaveDetail = async () => {
    const details = { ...(course.sessionDetails ?? {}) };
    details[dateKey] = {
      ...details[dateKey],
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      files: details[dateKey]?.files,
    };
    setSaving(true);
    try {
      const updated = await patchCourseSessionDetails(course.id, details);
      onCourseUpdated(updated);
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async () => {
    if (!fileToAdd) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", fileToAdd);
      formData.append("dateKey", dateKey);
      if (newFileName.trim()) formData.append("originalName", newFileName.trim());
      if (newFileDesc.trim()) formData.append("description", newFileDesc.trim());
      const res = await fetch(`/api/courses/${course.id}/session-files`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Upload failed");
      }
      const data = await res.json();
      onCourseUpdated(data.course);
      setFileToAdd(null);
      setNewFileName("");
      setNewFileDesc("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const res = await fetch(`/api/courses/${course.id}/session-files/${fileId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      const data = await res.json();
      onCourseUpdated(data.course);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveFileMeta = async (file: SessionFile) => {
    const edit = fileMetaEdits[file.id];
    if (!edit) return;
    const details = { ...(course.sessionDetails ?? {}) };
    const session = { ...(details[dateKey] ?? {}) };
    const fileList = [...(session.files ?? [])];
    const idx = fileList.findIndex((f) => f.id === file.id);
    if (idx === -1) return;
    fileList[idx] = {
      ...file,
      originalName: edit.originalName.trim() || file.originalName,
      description: edit.description.trim() || undefined,
    };
    session.files = fileList;
    details[dateKey] = session;
    setSaving(true);
    try {
      const updated = await patchCourseSessionDetails(course.id, details);
      onCourseUpdated(updated);
      setFileMetaEdits((prev) => {
        const next = { ...prev };
        delete next[file.id];
        return next;
      });
    } finally {
      setSaving(false);
    }
  };

  const downloadUrl = (fileId: string) =>
    `/api/courses/${course.id}/session-files/${fileId}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle>
            جلسه {sessionIndex + 1} — {formatJalaliDateFull(dateKey)}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">عنوان جلسه</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSaveDetail}
              placeholder="نام یا عنوان جلسه"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">توضیحات</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleSaveDetail}
              placeholder="توضیحات جلسه"
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="size-4" />
              <span className="text-sm font-medium text-foreground">مستندات</span>
            </div>
            <ul className="space-y-2 rounded-md border bg-muted/20 p-2 max-h-40 overflow-y-auto">
              {files.map((file) => {
                const edit = fileMetaEdits[file.id] ?? {
                  originalName: file.originalName,
                  description: file.description ?? "",
                };
                const hasChanges =
                  edit.originalName !== file.originalName ||
                  edit.description !== (file.description ?? "");
                return (
                  <li
                    key={file.id}
                    className="flex flex-col gap-1 rounded border bg-background p-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Input
                        value={edit.originalName}
                        onChange={(e) =>
                          setFileMetaEdits((prev) => ({
                            ...prev,
                            [file.id]: { ...edit, originalName: e.target.value },
                          }))
                        }
                        className="h-8 text-sm"
                        placeholder="نام فایل"
                      />
                      <a
                        href={downloadUrl(file.id)}
                        download={file.originalName}
                        className="shrink-0 rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                        title="دانلود"
                      >
                        <Download className="size-4" />
                      </a>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteFile(file.id)}
                        title="حذف"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                    <div className="flex gap-1">
                      <Input
                        value={edit.description}
                        onChange={(e) =>
                          setFileMetaEdits((prev) => ({
                            ...prev,
                            [file.id]: { ...edit, description: e.target.value },
                          }))
                        }
                        placeholder="توضیحات فایل"
                        className="h-8 text-sm"
                      />
                      {hasChanges && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleSaveFileMeta(file)}
                          disabled={saving}
                        >
                          ذخیره
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="rounded-md border border-dashed p-3 space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setFileToAdd(f);
                    setNewFileName(f.name);
                    setNewFileDesc("");
                  }
                }}
              />
              {!fileToAdd ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="size-4" />
                  انتخاب فایل برای آپلود
                </Button>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      placeholder="نام فایل"
                      className="flex-1 min-w-0"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFileToAdd(null);
                        setNewFileName("");
                        setNewFileDesc("");
                      }}
                    >
                      انصراف
                    </Button>
                  </div>
                  <Input
                    value={newFileDesc}
                    onChange={(e) => setNewFileDesc(e.target.value)}
                    placeholder="توضیحات فایل (اختیاری)"
                    className="text-sm"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleUpload}
                    disabled={uploading}
                    className="gap-1.5"
                  >
                    <Upload className="size-4" />
                    {uploading ? "در حال آپلود…" : "آپلود"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            بستن
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
