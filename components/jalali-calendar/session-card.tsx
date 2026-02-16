"use client";

import { useState } from "react";
import type { Course, SessionDetail, SessionFile } from "@/lib/courses";
import { formatJalaliDateFull } from "@/lib/jalali";
import { Button } from "@/components/ui/button";
import { ChevronDown, FileText, Download, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface SessionCardProps {
  course: Course;
  dateKey: string;
  sessionIndex: number;
  onEditClick: () => void;
}

function FileRow({ courseId, file }: { courseId: string; file: SessionFile }) {
  const downloadUrl = `/api/courses/${courseId}/session-files/${file.id}`;
  return (
    <li className="flex flex-col gap-0.5 rounded-md border border-border/60 bg-background/80 p-2.5 text-sm">
      <div className="flex items-center gap-2">
        <FileText className="size-4 shrink-0 text-muted-foreground" />
        <span className="font-medium text-foreground">{file.originalName}</span>
        <a
          href={downloadUrl}
          download={file.originalName}
          className="mr-auto flex shrink-0 items-center gap-1 rounded p-1 text-primary hover:bg-primary/10"
          title="دانلود"
        >
          <Download className="size-4" />
          <span className="text-xs">دانلود</span>
        </a>
      </div>
      {file.description && (
        <p className="text-muted-foreground pr-6 text-xs leading-relaxed">
          {file.description}
        </p>
      )}
    </li>
  );
}

export function SessionCard({
  course,
  dateKey,
  sessionIndex,
  onEditClick,
}: SessionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const sessionTime = course.sessionTimes?.[dateKey];
  const detail: SessionDetail = (course.sessionDetails ?? {})[dateKey] ?? {};
  const files = detail.files ?? [];
  const hasContent = detail.title || detail.description || files.length > 0;

  return (
    <li
      className={cn(
        "rounded-xl border transition-colors",
        expanded ? "border-primary/30 bg-card" : "border-border bg-muted/30"
      )}
    >
      <div
        className="flex flex-wrap items-center gap-2 px-3 py-2.5 text-sm cursor-pointer"
        onClick={() => setExpanded((e) => !e)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded((x) => !x);
          }
        }}
        aria-expanded={expanded}
      >
        <span
          className={cn(
            "flex shrink-0 transition-transform",
            expanded && "rotate-180"
          )}
          aria-hidden
        >
          <ChevronDown className="size-4 text-muted-foreground" />
        </span>
        <span className="font-medium text-primary">جلسه {sessionIndex + 1}</span>
        <span className="text-muted-foreground">—</span>
        <span className="text-foreground">{formatJalaliDateFull(dateKey)}</span>
        {sessionTime && (
          <>
            <span className="text-muted-foreground">—</span>
            <span className="font-mono text-primary">{sessionTime}</span>
          </>
        )}
        {detail.title && (
          <>
            <span className="text-muted-foreground">—</span>
            <span className="text-foreground">{detail.title}</span>
          </>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mr-auto gap-1.5 text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onEditClick();
          }}
          title={hasContent ? "ویرایش جزئیات" : "افزودن جزئیات"}
        >
          <Pencil className="size-4" />
          {hasContent ? "ویرایش" : "افزودن جزئیات"}
        </Button>
      </div>

      {expanded && (
        <div className="border-t border-border px-3 pb-3 pt-2">
          {detail.description && (
            <div className="mb-3">
              <p className="text-muted-foreground text-xs font-medium mb-1">توضیحات جلسه</p>
              <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                {detail.description}
              </p>
            </div>
          )}
          {files.length > 0 ? (
            <div>
              <p className="text-muted-foreground mb-2 text-xs font-medium flex items-center gap-1">
                <FileText className="size-3.5" />
                مستندات ({files.length})
              </p>
              <ul className="space-y-2">
                {files.map((file) => (
                  <FileRow key={file.id} courseId={course.id} file={file} />
                ))}
              </ul>
            </div>
          ) : (
            !detail.description && (
              <p className="text-muted-foreground py-2 text-xs">
                توضیح یا مستنداتی ثبت نشده. با «افزودن جزئیات» یا «ویرایش» می‌توانید عنوان، توضیحات و فایل اضافه کنید.
              </p>
            )
          )}
        </div>
      )}
    </li>
  );
}
