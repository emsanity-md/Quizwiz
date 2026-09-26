"use client";

import type { GenerateResponse, ReviewResponse } from "./types";

/**
 * Browser side of the quiz API. The key never comes near this file; it only
 * ever talks to our own routes.
 */

export class QuizApiError extends Error {}

/** Mirrors the server's progress event. Safe to import in a client component. */
export type GenerateProgress = {
  /** Fractional while a batch is still streaming, in question units. */
  done: number;
  total: number;
  batches: number;
  batchTotal: number;
};

type StreamEvent =
  | ({ type: "progress" } & GenerateProgress)
  | ({ type: "done" } & GenerateResponse)
  | { type: "error"; error: string };

async function errorFrom(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error || fallback;
  } catch {
    return fallback;
  }
}

export type GenerateInput = {
  name: string;
  categoryId: string;
  count: number;
  kind?: "quiz" | "teaser";
  file?: File | null;
};

/**
 * Streams progress while the questions are being written. The response is
 * newline-delimited JSON, so one request covers the whole wait: no polling, no
 * job id, nothing to lose if the server restarts.
 */
export async function generateQuiz(
  input: GenerateInput,
  onProgress: (progress: GenerateProgress) => void,
  signal?: AbortSignal,
): Promise<GenerateResponse> {
  const form = new FormData();
  form.append("name", input.name);
  form.append("categoryId", input.categoryId);
  form.append("count", String(input.count));
  if (input.kind) form.append("kind", input.kind);
  if (input.file) form.append("file", input.file);

  let response: Response;
  try {
    response = await fetch("/api/quiz/generate", {
      method: "POST",
      body: form,
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new QuizApiError("Could not reach the server. Check your connection.");
  }

  if (!response.ok) {
    throw new QuizApiError(
      await errorFrom(response, "The quiz could not be started."),
    );
  }

  if (!response.body) {
    throw new QuizApiError("The server sent an empty response.");
  }

  let result: GenerateResponse | null = null;
  let failure: string | null = null;

  const consume = (line: string) => {
    let event: StreamEvent;
    try {
      event = JSON.parse(line) as StreamEvent;
    } catch {
      return;
    }
    if (event.type === "progress") {
      onProgress({
        done: event.done,
        total: event.total,
        batches: event.batches,
        batchTotal: event.batchTotal,
      });
      return;
    }
    else if (event.type === "error") failure = event.error;
    else result = event;
  };

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      // The tail is a partial line until the next chunk arrives.
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line.trim()) consume(line);
      }

      if (result || failure) break;
    }
  } finally {
    void reader.cancel().catch(() => {});
  }

  if (buffer.trim() && !result && !failure) consume(buffer.trim());

  if (failure) throw new QuizApiError(failure);
  if (!result) {
    throw new QuizApiError(
      "Generation stopped before it finished. Please try again.",
    );
  }

  return result;
}

export async function submitAnswers(
  token: string,
  answers: (number | null)[],
): Promise<ReviewResponse> {
  let response: Response;
  try {
    response = await fetch("/api/quiz/review", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, answers }),
    });
  } catch {
    throw new QuizApiError("Could not reach the server to mark your quiz.");
  }

  if (!response.ok) {
    throw new QuizApiError(
      await errorFrom(response, "Your answers could not be marked."),
    );
  }

  return (await response.json()) as ReviewResponse;
}
