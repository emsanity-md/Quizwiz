"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { transitionTheme } from "@/lib/theme-transition";

/** Nothing to subscribe to, but the hook needs a stable function. */
const noop = () => () => {};

/**
 * Whether the browser has taken over from the server render. The theme is
 * only known on the client, so anything that reads it waits for this.
 */
function useIsMounted(): boolean {
  return React.useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const mounted = useIsMounted();
  const { setTheme, resolvedTheme } = useTheme();
  const isDark = mounted && resolvedTheme === "dark";
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  function toggle() {
    // The other one. "System" is not an option here: the first press picks
    // a side and it sticks, so the button is a button rather than a menu.
    const next = isDark ? "light" : "dark";

    transitionTheme(
      () => setTheme(next),
      triggerRef.current?.getBoundingClientRect() ?? null,
    );
  }

  return (
    <Button
      ref={triggerRef}
      variant="ghost"
      size="icon-sm"
      className="relative"
      onClick={toggle}
      aria-label={
        mounted
          ? isDark
            ? "Switch to light theme"
            : "Switch to dark theme"
          : "Toggle theme"
      }
      aria-pressed={mounted ? isDark : undefined}
    >
      {/* The icon is swapped by the `dark` class, so there is nothing to
          resolve on the server and nothing to flash on the way in. */}
      <SunIcon className="scale-100 rotate-0 transition-transform duration-300 dark:scale-0 dark:-rotate-90" />
      <MoonIcon className="absolute scale-0 rotate-90 transition-transform duration-300 dark:scale-100 dark:rotate-0" />
    </Button>
  );
}
