"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const navigation = [
  { name: "خانه", href: "/" },
  { name: "داشبورد", href: "/dashboard" },
];

export function SiteNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <nav
        aria-label="Global"
        className="flex items-center justify-between p-6 lg:px-8"
      >
        <div className="flex lg:flex-1 items-center gap-3">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">MasterPlan</span>
            <span className="text-lg font-semibold text-foreground">
              MasterPlan
            </span>
          </Link>
          <ThemeToggle />
        </div>
        <div className="flex lg:hidden">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 text-foreground"
            aria-label="Open main menu"
          >
            <Menu className="size-6" aria-hidden />
          </Button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm/6 font-semibold text-foreground"
            >
              {item.name}
            </Link>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <Link href="/dashboard">
            <span className="text-sm/6 font-semibold text-foreground">
              ورود
            </span>
            <span aria-hidden className="me-1">
              ←
            </span>
          </Link>
        </div>
      </nav>

      {/* Mobile menu: RTL panel from start (right in RTL) */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/20 lg:hidden"
            aria-hidden
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            className="fixed inset-y-0 start-0 z-50 w-full overflow-y-auto bg-background px-6 py-6 shadow-lg sm:max-w-sm sm:ring-1 sm:ring-border lg:hidden"
            role="dialog"
            aria-modal
            aria-label="Main menu"
          >
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5" onClick={() => setMobileMenuOpen(false)}>
                <span className="sr-only">MasterPlan</span>
                <span className="text-lg font-semibold text-foreground">
                  MasterPlan
                </span>
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 text-foreground"
                aria-label="Close menu"
              >
                <X className="size-6" aria-hidden />
              </Button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-foreground hover:bg-accent"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="py-6">
                  <Link
                    href="/dashboard"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-foreground hover:bg-accent"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    ورود
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
