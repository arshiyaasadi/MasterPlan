import { NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { dirname } from "path";
import {
  getEventsFilePath,
  isValidJalaliDate,
  isValidEventTitle,
  type CalendarEvent,
  type EventsData,
} from "@/lib/events";

const DEFAULT_DATA: EventsData = { events: [] };

async function readEventsData(): Promise<EventsData> {
  const filePath = getEventsFilePath();
  if (!existsSync(filePath)) return DEFAULT_DATA;
  try {
    const raw = await readFile(filePath, "utf-8");
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object" || !Array.isArray((data as EventsData).events)) {
      return DEFAULT_DATA;
    }
    const events = (data as EventsData).events.filter(
      (e): e is CalendarEvent =>
        e &&
        typeof e === "object" &&
        typeof e.id === "string" &&
        typeof e.date === "string" &&
        typeof e.title === "string"
    );
    return { events };
  } catch {
    return DEFAULT_DATA;
  }
}

async function writeEventsData(data: EventsData): Promise<void> {
  const filePath = getEventsFilePath();
  const dir = dirname(filePath);
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const data = await readEventsData();
    const index = data.events.findIndex((e) => e.id === id);
    if (index === -1) return NextResponse.json({ error: "Event not found" }, { status: 404 });
    const prev = data.events[index];
    if (body.date !== undefined && !isValidJalaliDate(body.date)) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }
    if (body.title !== undefined && !isValidEventTitle(body.title)) {
      return NextResponse.json({ error: "Invalid title" }, { status: 400 });
    }
    data.events[index] = {
      ...prev,
      ...(body.date !== undefined && { date: body.date as string }),
      ...(body.title !== undefined && { title: String(body.title).trim() }),
      ...(body.description !== undefined && { description: typeof body.description === "string" ? body.description : undefined }),
      ...(body.time !== undefined && { time: typeof body.time === "string" ? body.time : undefined }),
      ...(body.courseId !== undefined && { courseId: typeof body.courseId === "string" ? body.courseId : undefined }),
    };
    await writeEventsData(data);
    return NextResponse.json(data.events[index]);
  } catch (e) {
    console.error("Events PATCH error:", e);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    const data = await readEventsData();
    const index = data.events.findIndex((e) => e.id === id);
    if (index === -1) return NextResponse.json({ error: "Event not found" }, { status: 404 });
    data.events.splice(index, 1);
    await writeEventsData(data);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Events DELETE error:", e);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
