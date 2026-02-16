"use client";

import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppStore } from "@/store/use-app-store";

/**
 * Client-only block: shows session visit count from Zustand and confirms Card (shadcn) works.
 */
export function DashboardStats() {
  const { visitCount, incrementVisitCount } = useAppStore();

  useEffect(() => {
    incrementVisitCount();
  }, [incrementVisitCount]);

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>وضعیت جلسه</CardTitle>
        <CardDescription>
          تعداد بازدید از این صفحه در این جلسه (ذخیره شده با Zustand)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-gray-900">{visitCount}</p>
      </CardContent>
    </Card>
  );
}
