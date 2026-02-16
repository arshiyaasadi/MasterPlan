import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import {
  readCoursesData,
  writeCoursesData,
  getCourseSessionsDir,
} from "@/lib/courses-server";
import { createId, type SessionFile, type SessionDetail } from "@/lib/courses";

const JALALI_DATE_REGEX = /^\d{4}-\d{1,2}-\d{1,2}$/;

/** Safe file extension from original name (e.g. .pdf). */
function getSafeExtension(fileName: string): string {
  const base = fileName.replace(/^.*[/\\]/, "");
  const ext = base.includes(".") ? base.slice(base.lastIndexOf(".")) : "";
  return ext.replace(/[^a-zA-Z0-9.]/g, "") || ".bin";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: courseId } = await params;
  if (!courseId) {
    return NextResponse.json({ error: "Missing course id" }, { status: 400 });
  }
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const dateKey = formData.get("dateKey") as string | null;
    const originalNameParam = formData.get("originalName") as string | null;
    const descriptionParam = formData.get("description") as string | null;

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "File required" }, { status: 400 });
    }
    if (!dateKey || !JALALI_DATE_REGEX.test(dateKey)) {
      return NextResponse.json({ error: "Valid dateKey (Jalali YYYY-MM-DD) required" }, { status: 400 });
    }

    const data = await readCoursesData();
    const courseIndex = data.courses.findIndex((c) => c.id === courseId);
    if (courseIndex === -1) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const course = data.courses[courseIndex];
    if (!course.selectedDates?.includes(dateKey)) {
      return NextResponse.json({ error: "Date not in course selected dates" }, { status: 400 });
    }

    const fileId = createId();
    const savedName = `${fileId}${getSafeExtension(file.name)}`;

    const dir = getCourseSessionsDir(courseId);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
    const bytes = await file.arrayBuffer();
    await writeFile(`${dir}/${savedName}`, Buffer.from(bytes));

    const originalName = (originalNameParam && originalNameParam.trim()) || file.name || savedName;
    const description = (descriptionParam && descriptionParam.trim()) || undefined;
    const newFile: SessionFile = {
      id: fileId,
      savedName,
      originalName,
      ...(description && { description }),
    };

    const details = course.sessionDetails ?? {};
    const existing = details[dateKey] ?? {};
    const files = [...(existing.files ?? []), newFile];
    const updatedDetails: Record<string, SessionDetail> = {
      ...details,
      [dateKey]: { ...existing, files },
    };

    data.courses[courseIndex] = {
      ...course,
      sessionDetails: updatedDetails,
    };
    await writeCoursesData(data);

    return NextResponse.json({
      course: data.courses[courseIndex],
      file: newFile,
    });
  } catch (e) {
    console.error("Session file upload error:", e);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
