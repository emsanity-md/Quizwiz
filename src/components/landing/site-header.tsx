"use client";

import * as React from "react";
import Link from "next/link";
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

export function SiteHeader() {
  const [open, setOpen] = React.useState(false);

  return (
    <header
      id="top"
      className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md"
    >
      <Container className="flex h-16 items-center justify-between gap-4">
        <a
          href="#top"
          className="text-base font-semibold tracking-tight"
        >
          Quizwiz
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) =>
            link.href.startsWith("/") ? (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ),
          )}
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
                {NAV_LINKS.map((link) =>
                  link.href.startsWith("/") ? (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  ),
                )}
              </nav>
            
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  );
}