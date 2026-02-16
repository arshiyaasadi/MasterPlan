import { NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { dirname } from "path";
import {
  getEventsFilePath,
  createEventId,
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const data = await readEventsData();
    if (date) {
      const filtered = data.events.filter((e) => e.date === date);
      return NextResponse.json({ events: filtered });
    }
    return NextResponse.json(data);
  } catch (e) {
    console.error("Events GET error:", e);
    return NextResponse.json({ error: "Failed to read events" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (!isValidJalaliDate(body.date)) {
      return NextResponse.json({ error: "Invalid or missing date (YYYY-MM-DD)" }, { status: 400 });
    }
    if (!isValidEventTitle(body.title)) {
      return NextResponse.json({ error: "Invalid or missing title" }, { status: 400 });
    }
    const data = await readEventsData();
    const event: CalendarEvent = {
      id: createEventId(),
      date: body.date,
      title: String(body.title).trim(),
      description: typeof body.description === "string" ? body.description : undefined,
      time: typeof body.time === "string" ? body.time : undefined,
      courseId: typeof body.courseId === "string" ? body.courseId : undefined,
    };
    data.events.push(event);
    await writeEventsData(data);
    return NextResponse.json(event, { status: 201 });
  } catch (e) {
    console.error("Events POST error:", e);
    return NextResponse.json({ error: "Failed to add event" }, { status: 500 });
  }
}
