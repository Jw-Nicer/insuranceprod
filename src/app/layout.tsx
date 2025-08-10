
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Insurance Assistant",
  description: "Analyze insurance claims with AI",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full overflow-x-clip">
      <head>
        {/* Ensure responsive sizing on all devices */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Inter font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="h-full min-h-screen w-full overflow-x-hidden bg-background text-foreground antialiased font-sans selection:bg-primary/10 selection:text-primary"
        style={{ scrollbarGutter: "stable both-edges" }}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {/*
            Center content, cap max width to prevent very-wide layouts from causing horizontal scroll,
            and clip any accidental overflows from inner components.
          */}
          <div id="app-root" className="relative isolate mx-auto w-full max-w-screen-2xl px-3 sm:px-4 md:px-6 overflow-x-clip">
            <main className="w-full min-w-0">{children}</main>
          </div>

          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
