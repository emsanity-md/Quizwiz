import * as React from "react";

import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";

/**
 * Chrome for the content pages: everything the footer links to, plus the
 * resources and company pages beside them.
 *
 * The two full-screen routes (/quiz and /teasers) stay outside this group
 * because they bring their own header and fill the viewport with the flow.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
