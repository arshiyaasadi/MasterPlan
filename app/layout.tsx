import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MasterPlan",
  description: "MasterPlan application",
  // Disable indexing: site should not appear in search results
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    noimageindex: true,
    nosnippet: true,
  },
  // Prevent search engines from showing cached copy
  other: {
    "googlebot": "noindex, nofollow, noarchive, nosnippet",
    "bingbot": "noindex, nofollow, noarchive, nosnippet",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className="antialiased">{children}</body>
    </html>
  );
}
