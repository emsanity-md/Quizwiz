import "server-only";

import { extractText, getDocumentProxy } from "unpdf";

/**
 * Pulls the text layer out of a PDF. Doing this locally is faster, free, and
 * deterministic compared with sending pages through a vision model.
 *
 * The trade-off is scanned documents: a scan of a page is an image with no text
 * layer, and this returns nothing. That case is detected and reported rather
 * than silently producing an empty quiz.
 */

export const MAX_PDF_BYTES = 10 * 1024 * 1024;
const MAX_PDF_PAGES = 120;
/** Characters handed to the model. Beyond this, quality drops and cost climbs. */
const MAX_SOURCE_CHARS = 60_000;

export type ExtractedPdf = {
  text: string;
  pageCount: number;
  truncated: boolean;
};

export class PdfError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
    this.name = "PdfError";
  }
}

export async function extractPdfText(file: File): Promise<ExtractedPdf> {
  if (file.size === 0) {
    throw new PdfError("That file is empty.");
  }
  if (file.size > MAX_PDF_BYTES) {
    throw new PdfError(
      `That PDF is ${(file.size / 1024 / 1024).toFixed(1)}MB. The limit is 10MB.`,
      413,
    );
  }

  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    throw new PdfError("Only PDF files can be used.");
  }

  let pageCount: number;
  let text: string;

  try {
    const buffer = new Uint8Array(await file.arrayBuffer());
    const document = await getDocumentProxy(buffer);
    pageCount = document.numPages;

    if (pageCount > MAX_PDF_PAGES) {
      throw new PdfError(
        `That PDF has ${pageCount} pages. The limit is ${MAX_PDF_PAGES}.`,
        413,
      );
    }

    const extracted = await extractText(document, { mergePages: true });
    text = Array.isArray(extracted.text)
      ? extracted.text.join("\n\n")
      : String(extracted.text ?? "");
  } catch (error) {
    if (error instanceof PdfError) throw error;
    throw new PdfError(
      "That file could not be read as a PDF. It may be corrupt or password protected.",
    );
  }

  // Collapse the runs of whitespace that text layers are full of.
  const cleaned = text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (cleaned.length < 200) {
    throw new PdfError(
      "No usable text was found in that PDF. It is most likely a scan or an image, which needs OCR rather than text extraction.",
      422,
    );
  }

  return {
    text: cleaned.slice(0, MAX_SOURCE_CHARS),
    pageCount,
    truncated: cleaned.length > MAX_SOURCE_CHARS,
  };
}
