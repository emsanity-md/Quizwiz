"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type PdfPreviewProps = {
  file: File | null;
  /** Sweeps the scan line down the page. */
  scanning?: boolean;
  className?: string;
};

/**
 * A blob URL for the picked file, derived from the file itself and released when
 * it is replaced or the component goes away. Created in a memo rather than in
 * state: there is nothing to synchronise, because a new file has already
 * re-rendered this component by the time the URL is needed.
 */
function useObjectUrl(file: File | null): string | null {
  const url = React.useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file]
  );

  // A PDF left pointing at a revoked URL renders as a blank frame rather than
  // an error, so the revoke is not optional.
  React.useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url]
  );

  return url;
}

/** Stands in for the page on browsers with no PDF viewer of their own. */
const LINE_WIDTHS = [
  "w-[92%]",
  "w-full",
  "w-[86%]",
  "w-[96%]",
  "w-[70%]",
  "w-full",
  "w-[88%]",
  "w-[94%]",
  "w-[60%]",
  "w-[78%]",
] as const;

function PageFallback() {
  return (
    <div className="absolute inset-0 flex flex-col gap-2.5 bg-background p-5">
      <div className="mb-1 h-3 w-2/3 rounded bg-muted" />
      {/* Keyed by index, not by width: two of the widths are deliberately the
          same and this list never reorders, so there is no identity to track. */}
      {LINE_WIDTHS.map((width, index) => (
        <div key={index} className={`h-1.5 rounded bg-muted ${width}`} />
      ))}
    </div>
  );
}

/**
 * The scan is additive: a trail and a line, and nothing else. A tint over the
 * whole page would dim the document, and the document is the thing worth
 * looking at while it is being read.
 */
function ScanOverlay() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-0 will-change-[top] motion-safe:animate-[scan-sweep_3s_ease-in-out_infinite] motion-reduce:hidden">
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-primary/30 via-primary/8 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-primary shadow-[0_0_12px_2px_var(--primary)]" />
      </div>
    </div>
  );
}

/**
 * The page itself is the browser's own PDF viewer, embedded through <object>
 * rather than rendered to a canvas: the alternative is a pdf.js dependency and a
 * worker, and the file is already in memory.
 *
 * The skeleton page sits underneath it rather than in the <object>'s children,
 * because those only render when the browser refuses the PDF outright. Painted
 * underneath, there is always a page for the scan to travel over, and the real
 * one covers it wherever it loads.
 */
export function PdfPreview({ file, scanning = false, className }: PdfPreviewProps) {
  const url = useObjectUrl(file);

  if (!file || !url) return null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-border bg-background shadow-xs",
        className
      )}
    >
      <div className="relative aspect-[3/4] w-full">
        <PageFallback />
        <object
          data={`${url}#page=1&view=Fit&zoom=page-fit&toolbar=0`}
          type="application/pdf"
          aria-label={`First page of ${file.name}`}
          className={cn(
            "absolute inset-0 size-full",
            scanning && "pointer-events-none"
          )}
        />
      </div>

      {scanning ? <ScanOverlay /> : null}
    </div>
  );
}
