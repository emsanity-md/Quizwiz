import Link from "next/link";

import { Container } from "@/components/landing/container";
import { FOOTER_COLUMNS } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <Container className="py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))] lg:gap-8">
          <div>
            <p className="text-base font-semibold tracking-tight">Quizwiz</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Quizzes that tell you something worth knowing.
            </p>
             <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              @2026 Quizwiz. All rights reserved.
            </p>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.heading}>
              <p className="text-sm font-semibold">{column.heading}</p>
              <ul className="mt-4 flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("/") ? (
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </footer>
  );
}
