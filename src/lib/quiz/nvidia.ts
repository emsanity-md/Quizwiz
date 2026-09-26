import "server-only";

/**
 * The only place the NVIDIA key is read. Nothing in here may be imported by a
 * client component, and `server-only` makes that a build error rather than a
 * silent leak.
 */

const ENDPOINT = "https://integrate.api.nvidia.com/v1/chat/completions";

/**
 * Verified against the live API. The catalogue also lists
 * `nvidia/nemotron-3.5-lightning-30b-a3b`, but it times out on a cold start,
 * so the default is the one that reliably answers. Override with NVIDIA_MODEL.
 */
const DEFAULT_MODEL = "nvidia/nemotron-3-super-120b-a12b";

const TIMEOUT_MS = 120_000;

/**
 * The model occasionally opens with a preamble and burns the whole budget
 * before finishing a single question. The system prompt pushes back on that;
 * the ceiling leaves room for ten questions plus their explanations.
 */
const DEFAULT_MAX_TOKENS = 4096;

export const MODEL = process.env.NVIDIA_MODEL || DEFAULT_MODEL;

export class NvidiaError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "NvidiaError";
  }
}

type ChatOptions = {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
};

/** How much has been streamed so far, in characters, reasoning included. */
export type StreamTick = { chars: number };

function apiKey(): string {
  const key = process.env.NVIDIA_API_KEY;
  if (!key) {
    throw new NvidiaError("NVIDIA_API_KEY is not configured on the server.", 500);
  }
  return key;
}

function requestBody(
  model: string,
  options: ChatOptions,
  stream: boolean,
): string {
  return JSON.stringify({
    model,
    messages: [
      { role: "system", content: options.system },
      { role: "user", content: options.user },
    ],
    max_tokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
    temperature: options.temperature ?? 0.7,
    response_format: { type: "json_object" },
    stream,
  });
}

type Delta = { content?: string | null; reasoning_content?: string | null };
type Chunk = {
  choices?: { delta?: Delta; finish_reason?: string | null }[];
};

/**
 * Pulls the next server-sent event payload out of a buffer, or null when the
 * buffer does not hold a complete line yet.
 */
function takeEvent(buffer: string): { payload: string; rest: string } | null {
  const boundary = buffer.indexOf("\n");
  if (boundary === -1) return null;
  const line = buffer.slice(0, boundary).trim();
  return { payload: line, rest: buffer.slice(boundary + 1) };
}

function parseEvent(line: string): Chunk | null {
  if (!line.startsWith("data:")) return null;
  const data = line.slice(5).trim();
  if (!data || data === "[DONE]") return null;
  try {
    return JSON.parse(data) as Chunk;
  } catch {
    return null;
  }
}

/**
 * One chat completion, streamed.
 *
 * Returns the assembled answer and reports progress as the tokens arrive. The
 * reasoning tokens count toward progress: the model spends most of its time
 * reasoning before it writes a single question, and without them the bar would
 * sit still for the whole of that.
 *
 * Throws on a truncated answer, so a caller can retry rather than parse a stump.
 */
export async function chatStream({
  onTick,
  ...options
}: ChatOptions & { onTick?: (tick: StreamTick) => void }): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey()}`,
        "Content-Type": "application/json",
      },
      body: requestBody(MODEL, options, true),
    });

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 300);
      throw new NvidiaError(
        `NVIDIA request failed (${response.status}): ${detail}`,
        response.status,
      );
    }
    if (!response.body) {
      throw new NvidiaError("The model returned no stream to read.", 502);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";
    let answer = "";
    let chars = 0;
    let finish: string | null | undefined;

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      for (;;) {
        const event = takeEvent(buffer);
        if (!event) break;
        buffer = event.rest;

        const chunk = parseEvent(event.payload);
        if (!chunk) continue;

        const choice = chunk.choices?.[0];
        if (choice?.finish_reason) finish = choice.finish_reason;

        const delta = choice?.delta;
        if (!delta) continue;

        // Reasoning is real work and is counted for progress, but it is not
        // part of the answer.
        chars += (delta.reasoning_content?.length ?? 0) + (delta.content?.length ?? 0);
        if (delta.content) answer += delta.content;

        onTick?.({ chars });
      }
    }

    if (finish === "length") {
      throw new NvidiaError(
        "The model ran out of room before finishing its answer.",
        502,
      );
    }

    if (!answer.trim()) {
      throw new NvidiaError("The model returned an empty answer.", 502);
    }

    return answer;
  } catch (error) {
    if (error instanceof NvidiaError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new NvidiaError("The model took too long to answer.", 504);
    }
    throw new NvidiaError(
      error instanceof Error ? error.message : "Unknown NVIDIA failure.",
      502,
    );
  } finally {
    clearTimeout(timer);
  }
}

/**
 * One chat completion, returning the raw assistant text. JSON mode is requested
 * because every caller needs it; the caller still has to parse and validate.
 *
 * The non-streaming twin of `chatStream`, kept as the fallback: if a stream ever
 * fails to open or dies mid-answer, the caller can still get a whole answer
 * without a retry round trip.
 */
export async function chat(options: ChatOptions): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey()}`,
        "Content-Type": "application/json",
      },
      body: requestBody(MODEL, options, false),
    });

    if (!response.ok) {
      // The body can carry the real reason (unknown model, quota, cold start).
      // It never contains the key.
      const detail = (await response.text()).slice(0, 300);
      throw new NvidiaError(
        `NVIDIA request failed (${response.status}): ${detail}`,
        response.status,
      );
    }

    const payload = (await response.json()) as {
      choices?: { message?: { content?: string }; finish_reason?: string }[];
    };

    const choice = payload.choices?.[0];
    if (choice?.finish_reason === "length") {
      throw new NvidiaError(
        "The model ran out of room before finishing its answer.",
        502,
      );
    }

    const content = choice?.message?.content;
    if (!content) {
      throw new NvidiaError("The model returned an empty answer.", 502);
    }

    return content;
  } catch (error) {
    if (error instanceof NvidiaError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new NvidiaError("The model took too long to answer.", 504);
    }
    throw new NvidiaError(
      error instanceof Error ? error.message : "Unknown NVIDIA failure.",
      502,
    );
  } finally {
    clearTimeout(timer);
  }
}
