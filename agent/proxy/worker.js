// Cloudflare Worker that relays the app's requests to the Claude API so the
// API key never reaches the browser. Only POST /v1/messages from the origins
// listed in ALLOWED_ORIGINS is forwarded, and only for ALLOWED_MODEL.
//
// Secrets / vars (see wrangler.toml):
//   ANTHROPIC_API_KEY  - `wrangler secret put ANTHROPIC_API_KEY`
//   ALLOWED_ORIGINS    - comma-separated, e.g. "https://you.github.io"
//   ALLOWED_MODEL      - e.g. "claude-opus-5-5"

const FORWARD_HEADERS = ["content-type", "anthropic-version", "anthropic-beta"];

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
    if (!allowed.includes(origin)) return new Response("Forbidden origin", { status: 403 });

    const cors = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers") || "*",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin",
    };
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    const url = new URL(request.url);
    if (request.method !== "POST" || url.pathname !== "/v1/messages") {
      return new Response("Not found", { status: 404, headers: cors });
    }

    const body = await request.text();
    let model;
    try { model = JSON.parse(body).model; } catch { model = null; }
    if (model !== env.ALLOWED_MODEL) return new Response("Model not allowed", { status: 400, headers: cors });

    const headers = new Headers({ "x-api-key": env.ANTHROPIC_API_KEY });
    for (const name of FORWARD_HEADERS) {
      const value = request.headers.get(name);
      if (value) headers.set(name, value);
    }

    const upstream = await fetch(`https://api.anthropic.com/v1/messages${url.search}`, {
      method: "POST", headers, body,
    });
    const out = new Headers(upstream.headers);
    for (const [k, v] of Object.entries(cors)) out.set(k, v);
    return new Response(upstream.body, { status: upstream.status, headers: out });
  },
};
