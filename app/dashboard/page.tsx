import { SiteNav } from "@/components/site-nav";
import { DashboardStats } from "@/components/dashboard-stats";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteNav />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <h1 className="text-base/7 font-semibold text-gray-900 sm:text-xl">
          داشبورد
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          این صفحه placeholder برای داشبورد است. لایوت و بخش‌های بعدی را می‌توان از samples/application-ui الهام گرفت.
        </p>
        <div className="mt-8">
          <DashboardStats />
        </div>
        <div className="mt-6">
          <Link
            href="/"
            className="text-sm font-semibold text-gray-900 hover:text-gray-700"
          >
            ← بازگشت به خانه
          </Link>
        </div>
      </div>
    </div>
  );
}
