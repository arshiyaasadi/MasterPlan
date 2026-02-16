import { SiteNav } from "@/components/site-nav";
import { CourseList } from "@/components/course-list";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="relative isolate px-6 pt-24 pb-16 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <CourseList />
        </div>
      </main>
    </div>
  );
}
