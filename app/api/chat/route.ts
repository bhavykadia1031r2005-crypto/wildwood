import Anthropic from "@anthropic-ai/sdk";
import { ASSISTANT_SYSTEM_PROMPT } from "@/lib/assistant/systemPrompt";

/**
 * AI guide endpoint. Streams newline-delimited JSON events to the chat widget:
 *   {"t":"text","v":"..."}   text delta
 *   {"t":"reset"}            a fallback model took over; discard text so far
 *   {"t":"refusal"}          the request was declined
 *   {"t":"done","stop":"…"}  finished
 *   {"t":"error"}            the stream broke after it started
 * Errors before the first event are returned as normal HTTP status codes.
 *
 * Needs ANTHROPIC_API_KEY (or another Anthropic credential) on the server.
 */

const MODEL = "claude-opus-5-5";
const MAX_TURNS = 16;
const MAX_CHARS_PER_TURN = 1500;
const MAX_TOTAL_CHARS = 12000;

let client: Anthropic | null = null;
const getClient = () => (client ??= new Anthropic());

// Best-effort, per-instance limiter. Use a shared store (e.g. Redis) in production.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 30;
const hits = new Map<string, number[]>();
function isRateLimited(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 10_000) hits.clear();
  return recent.length > MAX_REQUESTS;
}

function parseMessages(body: unknown): Anthropic.Beta.BetaMessageParam[] | null {
  if (!body || typeof body !== "object" || !Array.isArray((body as { messages?: unknown }).messages)) return null;
  const raw = (body as { messages: unknown[] }).messages.slice(-MAX_TURNS);
  const messages: Anthropic.Beta.BetaMessageParam[] = [];
  let total = 0;
  for (const m of raw) {
    if (!m || typeof m !== "object") return null;
    const { role, content } = m as { role?: unknown; content?: unknown };
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    const text = content.trim().slice(0, MAX_CHARS_PER_TURN);
    if (!text) continue;
    total += text.length;
    messages.push({ role, content: text });
  }
  // History must start and end with the visitor.
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user" || total > MAX_TOTAL_CHARS) return null;
  return messages;
}

function errorResponse(err: unknown) {
  if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
    console.error("[chat] Anthropic credentials rejected:", err.message);
    return Response.json({ error: "not_configured" }, { status: 503 });
  }
  if (err instanceof Anthropic.RateLimitError) {
    return Response.json({ error: "busy" }, { status: 429 });
  }
  if (err instanceof Anthropic.APIError) {
    console.error(`[chat] Anthropic API error ${err.status}:`, err.message);
    return Response.json({ error: "upstream" }, { status: 502 });
  }
  if (err instanceof Anthropic.AnthropicError) {
    // Raised before any request is sent, e.g. no credentials configured.
    console.error("[chat] Anthropic client not configured:", err.message);
    return Response.json({ error: "not_configured" }, { status: 503 });
  }
  console.error("[chat] Unexpected error:", err);
  return Response.json({ error: "server" }, { status: 500 });
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  if (isRateLimited(ip)) return Response.json({ error: "rate_limited" }, { status: 429 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid" }, { status: 400 });
  }
  const messages = parseMessages(body);
  if (!messages) return Response.json({ error: "invalid" }, { status: 400 });

  const stream = getClient().beta.messages.stream(
    {
      model: MODEL,
      // Short chat replies; leaves headroom for adaptive thinking at low effort.
      max_tokens: 4096,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      system: [{ type: "text", text: ASSISTANT_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      messages,
    },
    { signal: request.signal },
  );

  // Pull the first event before responding so setup failures get a real status code.
  const events = stream[Symbol.asyncIterator]();
  let first: IteratorResult<Anthropic.Beta.BetaRawMessageStreamEvent>;
  try {
    first = await events.next();
  } catch (err) {
    return errorResponse(err);
  }

  const encoder = new TextEncoder();
  const send = (controller: ReadableStreamDefaultController<Uint8Array>, event: Record<string, unknown>) =>
    controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));

  const body$ = new ReadableStream<Uint8Array>({
    async start(controller) {
      let stop: string | null = null;
      const handle = (event: Anthropic.Beta.BetaRawMessageStreamEvent) => {
        if (event.type === "content_block_start" && event.content_block.type === "fallback") {
          send(controller, { t: "reset" });
        } else if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          send(controller, { t: "text", v: event.delta.text });
        } else if (event.type === "message_delta" && event.delta.stop_reason) {
          stop = event.delta.stop_reason;
        }
      };
      try {
        if (!first.done) handle(first.value);
        for (let next = await events.next(); !next.done; next = await events.next()) handle(next.value);
        if (stop === "refusal") send(controller, { t: "refusal" });
        send(controller, { t: "done", stop });
      } catch (err) {
        if (!request.signal.aborted) {
          console.error("[chat] Stream interrupted:", err);
          send(controller, { t: "error" });
        }
      } finally {
        try {
          controller.close();
        } catch {
          /* Already closed by a client disconnect. */
        }
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body$, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
