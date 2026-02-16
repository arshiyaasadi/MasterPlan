import { NextResponse } from "next/server";
import { unlink, readFile } from "fs/promises";
import { existsSync } from "fs";
import {
  readCoursesData,
  writeCoursesData,
  getCourseSessionsDir,
} from "@/lib/courses-server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  const { id: courseId, fileId } = await params;
  if (!courseId || !fileId) {
    return NextResponse.json({ error: "Missing course id or file id" }, { status: 400 });
  }
  try {
    const data = await readCoursesData();
    const course = data.courses.find((c) => c.id === courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    const details = course.sessionDetails ?? {};
    for (const detail of Object.values(details)) {
      const file = (detail.files ?? []).find((f) => f.id === fileId);
      if (!file) continue;
      const dir = getCourseSessionsDir(courseId);
      const path = `${dir}/${file.savedName}`;
      if (!existsSync(path)) {
        return NextResponse.json({ error: "File not found on disk" }, { status: 404 });
      }
      const buf = await readFile(path);
      const name = file.originalName || file.savedName;
      return new NextResponse(buf, {
        headers: {
          "Content-Disposition": `attachment; filename="${encodeURIComponent(name)}"`,
          "Cache-Control": "private",
        },
      });
    }
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  } catch (e) {
    console.error("Session file get error:", e);
    return NextResponse.json(
      { error: "Failed to get file" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  const { id: courseId, fileId } = await params;
  if (!courseId || !fileId) {
    return NextResponse.json({ error: "Missing course id or file id" }, { status: 400 });
  }
  try {
    const data = await readCoursesData();
    const courseIndex = data.courses.findIndex((c) => c.id === courseId);
    if (courseIndex === -1) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const course = data.courses[courseIndex];
    const details = course.sessionDetails ?? {};
    let found = false;
    const updatedDetails = { ...details };

    for (const [dateKey, detail] of Object.entries(details)) {
      const files = detail.files ?? [];
      const idx = files.findIndex((f) => f.id === fileId);
      if (idx === -1) continue;
      const file = files[idx];
      const dir = getCourseSessionsDir(courseId);
      const path = `${dir}/${file.savedName}`;
      if (existsSync(path)) {
        await unlink(path);
      }
      const newFiles = files.filter((_, i) => i !== idx);
      updatedDetails[dateKey] = {
        ...detail,
        files: newFiles.length ? newFiles : undefined,
      };
      found = true;
      break;
    }

    if (!found) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    data.courses[courseIndex] = {
      ...course,
      sessionDetails: updatedDetails,
    };
    await writeCoursesData(data);

    return NextResponse.json({ course: data.courses[courseIndex] });
  } catch (e) {
    console.error("Session file delete error:", e);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
