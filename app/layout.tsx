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

import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('masterplan-theme');if(s){var j=JSON.parse(s);if(j&&j.state&&j.state.theme==='dark')document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased bg-background text-foreground">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
