// Supabase Edge Function: ai-generate
// Proxies chat-completion requests to OpenRouter so the OPENROUTER_API_KEY never
// leaves the server. The app posts { model, messages, temperature, response_format }
// exactly as an OpenAI-compatible body; we inject auth + attribution headers.
//
// Deploy:
//   supabase functions deploy ai-generate --no-verify-jwt=false
//   supabase secrets set OPENROUTER_API_KEY=sk-or-...
//
// The app calls it via EXPO_PUBLIC_AI_PROXY_URL =
//   https://<project-ref>.functions.supabase.co/ai-generate
//
// deno-lint-ignore-file no-explicit-any

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  const key = Deno.env.get("OPENROUTER_API_KEY");
  if (!key) return json({ error: "missing_api_key" }, 500);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  // Whitelist + clamp the fields we forward. Never trust the client blindly.
  const payload = {
    model: typeof body.model === "string" ? body.model : "anthropic/claude-3.5-haiku",
    messages: Array.isArray(body.messages) ? body.messages.slice(0, 8) : [],
    temperature: clampNum(body.temperature, 0, 1, 0.6),
    max_tokens: clampNum(body.max_tokens, 256, 4000, 2000),
    response_format: body.response_format ?? { type: "json_object" },
  };
  if (payload.messages.length === 0) return json({ error: "no_messages" }, 400);

  let upstream: Response;
  try {
    upstream = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://adventurebox.app",
        "X-Title": "AdventureBox",
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    return json({ error: "upstream_unreachable", detail: String(e) }, 502);
  }

  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
});

function clampNum(v: unknown, min: number, max: number, dflt: number): number {
  const n = typeof v === "number" ? v : dflt;
  return Math.max(min, Math.min(max, n));
}

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
