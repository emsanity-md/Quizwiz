import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Quizwiz — Test your knowledge",
  description:
    "Turn a topic, a PDF, or a question bank into a shareable quiz. Your learners take it in one click, and you see exactly where they got stuck.",
};

/**
 * Motion paints its starting state into the markup, so without script the hero
 * headline and the stat counters would be blank. Browsers ignore the contents
 * of <noscript> when script is on, so this costs nothing in the normal case.
 */
const NO_SCRIPT_CSS = `
  .blur-reveal span { opacity: 1 !important; filter: none !important; transform: none !important; }
  .stat-value > span { display: none; }
  .stat-value::after { content: attr(data-value); }
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geist.variable} antialiased`}
    >
      <body className="flex min-h-dvh flex-col">
        <noscript>
          <style dangerouslySetInnerHTML={{ __html: NO_SCRIPT_CSS }} />
        </noscript>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
