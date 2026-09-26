"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon } from "lucide-react";

import { Container } from "@/components/landing/container";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NAV_LINKS } from "@/lib/site";

const WORDMARK = "text-base font-semibold tracking-tight";

export function SiteHeader() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const onHome = pathname === "/";

  /**
   * On any other page the wordmark is a link home. On the landing page there is
   * nowhere to navigate to, so it scrolls instead — and it has to be an
   * explicit scroll rather than a `#top` jump, because this header is sticky and
   * therefore already in view: the browser is free to decide the page needs no
   * scrolling at all. The href stays for the case where the script never runs.
   */
  function handleWordmarkClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!onHome) return;

    event.preventDefault();
    window.scrollTo({
      top: 0,
      // globals.css turns off smooth scrolling for reduced motion; an explicit
      // behaviour here would override that, so ask the media query instead.
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }

  return (
    <header
      id="top"
      className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md"
    >
      <Container className="flex h-16 items-center justify-between gap-4">
        {onHome ? (
          <a href="#top" onClick={handleWordmarkClick} className={WORDMARK}>
            Quizwiz
          </a>
        ) : (
          <Link href="/" className={WORDMARK}>
            Quizwiz
          </Link>
        )}

        <nav className="hidden items-center gap-1 md:flex">
          {/* Every href is a path or a path with an anchor, so Link handles all
              of them and there is no plain-anchor case left. */}
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
         
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="md:hidden"
                  aria-label="Open menu"
                />
              }
            >
              <MenuIcon />
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0 sm:max-w-xs">
              <SheetHeader className="border-b p-4">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 p-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  );
}