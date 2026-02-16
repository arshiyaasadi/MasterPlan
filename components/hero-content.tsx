"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function HeroContent() {
  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">
        MasterPlan
      </h1>
      <p className="mt-8 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
        بستر پروژه آماده توسعه است. از پوشه samples برای الگوی UI و تایپوگرافی استفاده کنید.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
        <Link href="/dashboard">
          <Button size="lg">شروع</Button>
        </Link>
        <Link
          href="/dashboard"
          className="text-sm/6 font-semibold text-gray-900"
        >
          داشبورد
          <span aria-hidden className="me-1">
            ←
          </span>
        </Link>
      </div>
    </motion.div>
  );
}
