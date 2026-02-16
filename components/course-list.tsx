"use client";

import { useState, useEffect, useCallback } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CourseSetup } from "@/components/course-setup";
import { JalaliCalendar } from "@/components/jalali-calendar";
import type { Course } from "@/lib/courses";

async function fetchCourses(): Promise<Course[]> {
  const res = await fetch("/api/courses");
  if (!res.ok) throw new Error("Failed to fetch courses");
  const data = await res.json();
  return data.courses ?? [];
}

async function addCourse(name: string): Promise<Course> {
  const res = await fetch("/api/courses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to add course");
  }
  return res.json();
}

async function updateCourse(id: string, name: string): Promise<Course> {
  const res = await fetch(`/api/courses/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to update course");
  }
  return res.json();
}

export function CourseList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchCourses();
      setCourses(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا در بارگذاری");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const course = await addCourse(name);
      setCourses((prev) => [...prev, course]);
      setNewName("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا در افزودن دوره");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (course: Course) => {
    setEditingId(course.id);
    setEditValue(course.name);
  };

  const saveEdit = async (id: string) => {
    const name = editValue.trim();
    if (!name) {
      setEditingId(null);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const updated = await updateCourse(id, name);
      setCourses((prev) =>
        prev.map((c) => (c.id === id ? updated : c))
      );
      setEditingId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا در ذخیره");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditBlur = (id: string) => {
    saveEdit(id);
  };

  const handleEditKeyDown = (id: string, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  if (loading) {
    return (
      <p className="text-muted-foreground text-sm">در حال بارگذاری...</p>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="space-y-2">
        <label htmlFor="course-name" className="text-sm font-medium text-foreground">
          نام دوره
        </label>
        <div className="flex gap-2">
          <Input
            id="course-name"
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="نام دوره را وارد کنید"
            className="max-w-sm"
            disabled={submitting}
          />
          <Button type="submit" disabled={submitting || !newName.trim()}>
            افزودن
          </Button>
        </div>
      </form>

      {error && (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      )}

      <div className="space-y-2">
        {courses.length === 0 ? (
          <p className="text-muted-foreground text-sm">هنوز دوره‌ای اضافه نشده است.</p>
        ) : (
          <ul className="divide-y divide-border">
            {courses.map((course) => (
              <li key={course.id} className="flex items-center gap-2 py-2">
                {editingId === course.id ? (
                  <Input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleEditBlur(course.id)}
                    onKeyDown={(e) => handleEditKeyDown(course.id, e)}
                    className="max-w-sm"
                    autoFocus
                    disabled={submitting}
                  />
                ) : (
                  <>
                    <span className="flex-1 text-foreground">{course.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => startEdit(course)}
                      className="shrink-0"
                      aria-label="ویرایش نام دوره"
                    >
                      <Pencil className="size-4" aria-hidden />
                    </Button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {courses.length > 0 && (
        <>
          <section className="border-t border-border pt-8" aria-labelledby="course-setup-heading">
            <h2 id="course-setup-heading" className="mb-4 text-lg font-semibold text-foreground">
              ستاپ دوره
            </h2>
            <CourseSetup
              course={courses[0]}
              onUpdated={(updated) =>
                setCourses((prev) =>
                  prev.map((c) => (c.id === updated.id ? updated : c))
                )
              }
            />
          </section>
          <section className="border-t border-border pt-8" aria-labelledby="calendar-heading">
            <h2 id="calendar-heading" className="mb-4 text-lg font-semibold text-foreground">
              تقویم دوره — ثبت روزهای دوره
            </h2>
            <JalaliCalendar
              course={courses[0]}
              onCourseUpdated={(updated) =>
                setCourses((prev) =>
                  prev.map((c) => (c.id === updated.id ? updated : c))
                )
              }
            />
          </section>
        </>
      )}
    </div>
  );
}
