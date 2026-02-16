import { NextResponse } from "next/server";
import { readCoursesData, writeCoursesData } from "@/lib/courses-server";
import { isValidCourseName, createId, type Course } from "@/lib/courses";

export async function GET() {
  try {
    const data = await readCoursesData();
    return NextResponse.json(data);
  } catch (e) {
    console.error("Courses GET error:", e);
    return NextResponse.json(
      { error: "Failed to read courses" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = body?.name;
    if (!isValidCourseName(name)) {
      return NextResponse.json(
        { error: "Invalid or missing course name" },
        { status: 400 }
      );
    }
    const data = await readCoursesData();
    const course: Course = {
      id: createId(),
      name: name.trim(),
    };
    data.courses.push(course);
    await writeCoursesData(data);
    return NextResponse.json(course, { status: 201 });
  } catch (e) {
    console.error("Courses POST error:", e);
    return NextResponse.json(
      { error: "Failed to add course" },
      { status: 500 }
    );
  }
}
