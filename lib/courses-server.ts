import { join } from "path";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { dirname } from "path";
import type { Course, CoursesData } from "./courses";

const DATA_DIR = "data";
const COURSES_FILE = "courses.json";
const DEFAULT_DATA: CoursesData = { courses: [] };

export function getCoursesFilePath(): string {
  return join(process.cwd(), DATA_DIR, COURSES_FILE);
}

export function getCourseSessionsDir(courseId: string): string {
  return join(process.cwd(), DATA_DIR, "course-sessions", courseId);
}

export async function readCoursesData(): Promise<CoursesData> {
  const filePath = getCoursesFilePath();
  if (!existsSync(filePath)) return DEFAULT_DATA;
  try {
    const raw = await readFile(filePath, "utf-8");
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object" || !Array.isArray((data as CoursesData).courses)) {
      return DEFAULT_DATA;
    }
    const courses = (data as CoursesData).courses.filter(
      (c): c is Course =>
        c &&
        typeof c === "object" &&
        typeof c.id === "string" &&
        typeof c.name === "string"
    );
    return { courses };
  } catch {
    return DEFAULT_DATA;
  }
}

export async function writeCoursesData(data: CoursesData): Promise<void> {
  const filePath = getCoursesFilePath();
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  const content = JSON.stringify(data, null, 2);
  await writeFile(filePath, content, "utf-8");
}
