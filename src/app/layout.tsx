import type { Metadata } from "next";
import localFont from "next/font/local";

import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

/**
 * Self-hosted rather than next/font/google.
 *
 * The generated @font-face came out with a mangled unicode-range — `U+??` where
 * the latin subset's `U+0000-00FF` should be — which is invalid CSS, so browsers
 * threw the rule away. The effect was invisible and total: the site rendered in
 * the fallback face while the woff2 was downloaded and preloaded on every page
 * and then never used. Same in dev and in a production build, so it was not a
 * dev-server artefact.
 *
 * Geist is a variable font, so one file covers every weight. next/font/local
 * emits no unicode-range at all, which is valid here: the file is the whole
 * latin face, so there is nothing to subset.
 */
const geist = localFont({
  src: "../fonts/Geist-Variable.woff2",
  weight: "100 900",
  display: "swap",
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
      // globals.css sets scroll-behavior: smooth. This attribute is what lets
      // Next keep that while still jumping instantly on a route change.
      data-scroll-behavior="smooth"
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
