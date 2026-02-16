import { NextResponse } from "next/server";
import { readCoursesData, writeCoursesData } from "@/lib/courses-server";
import {
  isValidCourseName,
  type Course,
  type CoursesData,
  type SessionDetail,
  type SessionFile,
} from "@/lib/courses";

function optionalNumber(v: unknown): number | undefined {
  if (v == null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function optionalString(v: unknown): string | undefined {
  if (v == null) return undefined;
  return typeof v === "string" ? v : undefined;
}

const JALALI_DATE_REGEX = /^\d{4}-\d{1,2}-\d{1,2}$/;
const TIME_REGEX = /^([01]?\d|2[0-3]):([0-5]\d)$/;
function optionalSelectedDates(v: unknown): string[] | undefined {
  if (v == null || !Array.isArray(v)) return undefined;
  const arr = v.filter((x) => typeof x === "string" && JALALI_DATE_REGEX.test(x));
  return arr.length > 0 ? arr : undefined;
}
function optionalSessionTimes(v: unknown): Record<string, string> | undefined {
  if (v == null || typeof v !== "object" || Array.isArray(v)) return undefined;
  const out: Record<string, string> = {};
  for (const [key, val] of Object.entries(v)) {
    if (typeof val === "string" && JALALI_DATE_REGEX.test(key) && TIME_REGEX.test(val)) {
      out[key] = val;
    }
  }
  return Object.keys(out).length ? out : undefined;
}

function parseSessionFile(x: unknown): SessionFile | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  const id = typeof o.id === "string" ? o.id : "";
  const savedName = typeof o.savedName === "string" ? o.savedName : "";
  const originalName = typeof o.originalName === "string" ? o.originalName : "";
  if (!id || !savedName || !originalName) return null;
  const description = optionalString(o.description);
  return { id, savedName, originalName, ...(description !== undefined && { description }) };
}

function optionalSessionDetails(v: unknown): Record<string, SessionDetail> | undefined {
  if (v == null || typeof v !== "object" || Array.isArray(v)) return undefined;
  const out: Record<string, SessionDetail> = {};
  for (const [key, val] of Object.entries(v)) {
    if (!JALALI_DATE_REGEX.test(key) || !val || typeof val !== "object") continue;
    const obj = val as Record<string, unknown>;
    const title = optionalString(obj.title);
    const description = optionalString(obj.description);
    let files: SessionFile[] | undefined;
    if (Array.isArray(obj.files)) {
      files = obj.files.map(parseSessionFile).filter((f): f is SessionFile => f !== null);
      if (files.length === 0) files = undefined;
    }
    out[key] = {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(files !== undefined && { files }),
    };
  }
  return Object.keys(out).length ? out : undefined;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing course id" }, { status: 400 });
  }
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = body.name !== undefined ? body.name : undefined;
    const description = optionalString(body.description);
    const hoursPerSession = optionalNumber(body.hoursPerSession);
    const durationDays = optionalNumber(body.durationDays);
    const selectedDates = optionalSelectedDates(body.selectedDates);
    const sessionTimes = optionalSessionTimes(body.sessionTimes);
    const sessionDetails = optionalSessionDetails(body.sessionDetails);

    if (name !== undefined && !isValidCourseName(name)) {
      return NextResponse.json(
        { error: "Invalid course name" },
        { status: 400 }
      );
    }

    const data = await readCoursesData();
    const index = data.courses.findIndex((c) => c.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const prev = data.courses[index];
    data.courses[index] = {
      ...prev,
      ...(name !== undefined && { name: String(name).trim() }),
      ...(description !== undefined && { description: description || undefined }),
      ...(hoursPerSession !== undefined && { hoursPerSession }),
      ...(durationDays !== undefined && { durationDays }),
      ...(selectedDates !== undefined && { selectedDates }),
      ...(sessionTimes !== undefined && { sessionTimes }),
      ...(sessionDetails !== undefined && { sessionDetails }),
    };
    await writeCoursesData(data);
    return NextResponse.json(data.courses[index]);
  } catch (e) {
    console.error("Courses PATCH error:", e);
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    );
  }
}
