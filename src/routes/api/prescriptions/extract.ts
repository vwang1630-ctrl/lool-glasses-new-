// POST /api/prescriptions/extract
// Takes a prescription image (multipart `file`, image/jpeg|png|webp ≤10MB),
// sends it to Claude Haiku 4.5 (Anthropic Messages API, vision input) and
// returns the extracted SPH/CYL/AXIS/ADD/PD values. The image itself is NEVER
// persisted — neither in D1 nor in R2. The frontend writes the values to
// /api/prescriptions only after the user reviews / edits and clicks Save.
//
// Auth: open. Anyone — guest or signed in — can OCR. The risk is small
// quota burn on the Anthropic API, capped by the per-account billing tier.
// Direct fetch to api.anthropic.com (no SDK install) — works on Workers
// out of the box.

import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ANTHROPIC_MODEL = "claude-haiku-4-5";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

const SYSTEM_PROMPT = `You are an optometry assistant reading a prescription for eyeglasses.

Rules:
- SPH and CYL are diopters with two decimal places (e.g. -1.25, +0.50, 0.00).
- AXIS is an integer 1–180.
- ADD is a positive diopter (e.g. +2.00); null for single-vision prescriptions.
- PD: if you see one number for total pupillary distance (mm), use "total". If you
  see two numbers (right/left, monocular), use "odHalf"/"osHalf" and leave "total"
  null. Otherwise all null.
- "PL" or "Plano" means 0.00.
- "DS" or "SPH/DS" in the CYL column means 0.00.
- Use null for any value you can't read with confidence.`;

// JSON schema for output_config.format — Claude returns plain text JSON
// matching this shape. Stricter than a free-form parse: the model can't omit
// fields or change types, so the client-side normalizer is just a safety net
// for the (rare) refusal / max_tokens edge case.
const OUTPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    od: {
      type: "object",
      additionalProperties: false,
      properties: {
        sph: { type: ["number", "null"] },
        cyl: { type: ["number", "null"] },
        axis: { type: ["integer", "null"] },
        add: { type: ["number", "null"] },
      },
      required: ["sph", "cyl", "axis", "add"],
    },
    os: {
      type: "object",
      additionalProperties: false,
      properties: {
        sph: { type: ["number", "null"] },
        cyl: { type: ["number", "null"] },
        axis: { type: ["integer", "null"] },
        add: { type: ["number", "null"] },
      },
      required: ["sph", "cyl", "axis", "add"],
    },
    pd: {
      type: "object",
      additionalProperties: false,
      properties: {
        total: { type: ["number", "null"] },
        odHalf: { type: ["number", "null"] },
        osHalf: { type: ["number", "null"] },
      },
      required: ["total", "odHalf", "osHalf"],
    },
  },
  required: ["od", "os", "pd"],
};

// Convert image bytes → base64 (Anthropic vision input format).
function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  // Chunk to avoid call-stack blowouts on larger images.
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin);
}

interface ExtractedRx {
  od: {
    sph: number | null;
    cyl: number | null;
    axis: number | null;
    add: number | null;
  };
  os: {
    sph: number | null;
    cyl: number | null;
    axis: number | null;
    add: number | null;
  };
  pd: { total: number | null; odHalf: number | null; osHalf: number | null };
}

const EMPTY: ExtractedRx = {
  od: { sph: null, cyl: null, axis: null, add: null },
  os: { sph: null, cyl: null, axis: null, add: null },
  pd: { total: null, odHalf: null, osHalf: null },
};

function asNum(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function asInt(v: unknown): number | null {
  const n = asNum(v);
  return n == null ? null : Math.round(n);
}

// Defensive: never trust model output structure, only pull the typed fields.
// With output_config.format this normalizer rarely changes anything, but it
// covers refusal / max_tokens / future schema drift.
function normalize(raw: unknown): ExtractedRx {
  if (!raw || typeof raw !== "object") return EMPTY;
  const r = raw as Record<string, unknown>;
  const eye = (e: unknown) => {
    const o = (e ?? {}) as Record<string, unknown>;
    return {
      sph: asNum(o.sph),
      cyl: asNum(o.cyl),
      axis: asInt(o.axis),
      add: asNum(o.add),
    };
  };
  const pdRaw = (r.pd ?? {}) as Record<string, unknown>;
  return {
    od: eye(r.od),
    os: eye(r.os),
    pd: {
      total: asNum(pdRaw.total),
      odHalf: asNum(pdRaw.odHalf),
      osHalf: asNum(pdRaw.osHalf),
    },
  };
}

// Brace-matching parser — covers the rare case where output_config gives back
// JSON wrapped in prose or markdown fences (e.g. refusal preamble).
function extractJsonObject(s: string): unknown | null {
  const start = s.indexOf("{");
  if (start < 0) return null;
  let depth = 0;
  for (let i = start; i < s.length; i++) {
    if (s[i] === "{") depth++;
    else if (s[i] === "}") {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(s.slice(start, i + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

interface AnthropicMessageResponse {
  content?: Array<{ type: string; text?: string }>;
  stop_reason?: string;
}

export const Route = createFileRoute("/api/prescriptions/extract")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return Response.json({ error: "invalid_form" }, { status: 400 });
        }
        const file = form.get("file");
        if (!(file instanceof File)) {
          return Response.json({ error: "missing_file" }, { status: 400 });
        }
        if (file.size === 0) {
          return Response.json({ error: "empty_file" }, { status: 400 });
        }
        if (file.size > MAX_BYTES) {
          return Response.json({ error: "file_too_large" }, { status: 413 });
        }
        if (!ALLOWED_MIMES.has(file.type)) {
          return Response.json({ error: "unsupported_mime" }, { status: 415 });
        }

        const apiKey = (env as unknown as { ANTHROPIC_API_KEY?: string })
          .ANTHROPIC_API_KEY;
        if (!apiKey) {
          console.error("[prescriptions/extract] ANTHROPIC_API_KEY not set");
          return Response.json({ error: "ai_unconfigured" }, { status: 500 });
        }

        const bytes = new Uint8Array(await file.arrayBuffer());
        const b64 = bytesToBase64(bytes);

        const body = {
          model: ANTHROPIC_MODEL,
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: file.type,
                    data: b64,
                  },
                },
                { type: "text", text: "Extract this prescription." },
              ],
            },
          ],
          output_config: {
            format: {
              type: "json_schema",
              schema: OUTPUT_SCHEMA,
            },
          },
        };

        let res: Response;
        try {
          res = await fetch(ANTHROPIC_API_URL, {
            method: "POST",
            headers: {
              "x-api-key": apiKey,
              "anthropic-version": "2023-06-01",
              "content-type": "application/json",
            },
            body: JSON.stringify(body),
          });
        } catch (err) {
          console.error("[prescriptions/extract] fetch threw:", err);
          return Response.json({ error: "ai_network" }, { status: 502 });
        }

        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          console.error(
            "[prescriptions/extract] Anthropic API error",
            res.status,
            errText,
          );
          return Response.json(
            { error: "ai_failed", upstream_status: res.status },
            { status: 502 },
          );
        }

        const j = (await res.json()) as AnthropicMessageResponse;
        const text = j.content?.find((b) => b.type === "text")?.text ?? "";
        const parsed = extractJsonObject(text);
        if (!parsed) {
          console.error("[prescriptions/extract] no JSON in output", {
            stop_reason: j.stop_reason,
            text_preview: text.slice(0, 200),
          });
          return Response.json({ error: "no_json_in_output" }, { status: 422 });
        }
        return Response.json({ ok: true, extracted: normalize(parsed) });
      },
    },
  },
});
