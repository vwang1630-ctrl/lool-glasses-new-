// POST /api/chat
// AI concierge for loollook.com — a Field Deployment Engineer that knows
// the full product catalog, lens types, frame materials, and can
// recommend glasses, guide prescriptions, and answer eyewear questions.
//
// Returns SSE stream (text/event-stream) for real-time token delivery.
// Frontend reads chunks incrementally; product recommendation cards
// appear after the text stream completes.
//
// Follows the same pattern as /api/prescriptions/extract.ts:
// direct fetch to api.anthropic.com, no SDK, ANTHROPIC_API_KEY from
// Cloudflare Worker secrets.

import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { getDB } from "@/server/db";
import { pickLang } from "@/lib/lang";
import { assembleBrain } from "@/lib/ai-knowledge";
import { nanoid } from "@/server/ids";

const encoder = new TextEncoder();
const ANTHROPIC_MODEL = "claude-haiku-4-5";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

// --------------- types ---------------

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  lang: string;
  currentUrl?: string;
  conversationId?: string;
  sessionToken?: string;
}

interface ProductBrief {
  slug: string;
  name: string;
  priceCents: number;
  material: string | null;
  shape: string | null;
  styles: string[];
  colors: string[];
  lensWidth: number | null;
  bridge: number | null;
  temple: number | null;
  supportsReader: boolean;
  supportsSingleVision: boolean;
  supportsProgressive: boolean;
  supportsNonPrescription: boolean;
  rating: number;
  reviewCount: number;
  bestseller: boolean;
  isNew: boolean;
}

interface RecommendedProduct {
  slug: string;
  name: string;
  priceCents: number;
  material: string | null;
  shape: string | null;
  colors: string[];
  rating: number;
  reviewCount: number;
}

// --------------- product briefs from D1 ---------------

async function fetchProductBriefs(lang: string): Promise<ProductBrief[]> {
  const db = getDB();
  const productsRes = await db
    .prepare(
      `SELECT id, slug, name_json, price_cents, material, shape,
              styles_json, lens_width_mm, bridge_mm, temple_mm,
              supports_reader, supports_single_vision,
              supports_progressive, supports_non_prescription,
              rating, review_count, bestseller, is_new
       FROM products WHERE archived_at IS NULL
       ORDER BY bestseller DESC, rating DESC`,
    )
    .all<{
      id: string;
      slug: string;
      name_json: string | null;
      price_cents: number;
      material: string | null;
      shape: string | null;
      styles_json: string | null;
      lens_width_mm: number | null;
      bridge_mm: number | null;
      temple_mm: number | null;
      supports_reader: number;
      supports_single_vision: number;
      supports_progressive: number;
      supports_non_prescription: number;
      rating: number;
      review_count: number;
      bestseller: number;
      is_new: number;
    }>();

  const colorsRes = await db
    .prepare(
      `SELECT product_id, label_json
       FROM product_colors
       ORDER BY sort_order`,
    )
    .all<{ product_id: string; label_json: string | null }>();

  const colorsByProduct = new Map<string, string[]>();
  for (const c of colorsRes.results ?? []) {
    const arr = colorsByProduct.get(c.product_id) ?? [];
    let labelJson: Record<string, string> = {};
    try {
      labelJson = JSON.parse(c.label_json ?? "{}");
    } catch {
      /* skip bad JSON */
    }
    arr.push(pickLang(labelJson, lang));
    colorsByProduct.set(c.product_id, arr);
  }

  return (productsRes.results ?? []).map((p) => {
    let styles: string[] = [];
    try {
      const raw = JSON.parse(p.styles_json ?? "[]");
      if (Array.isArray(raw))
        styles = raw.filter((s): s is string => typeof s === "string");
    } catch {
      /* skip */
    }

    let nameObj: Record<string, string> = {};
    try {
      nameObj = JSON.parse(p.name_json ?? "{}");
    } catch {
      /* skip */
    }

    return {
      slug: p.slug,
      name: pickLang(nameObj, lang),
      priceCents: p.price_cents,
      material: p.material,
      shape: p.shape,
      styles,
      colors: colorsByProduct.get(p.id) ?? [],
      lensWidth: p.lens_width_mm,
      bridge: p.bridge_mm,
      temple: p.temple_mm,
      supportsReader: !!p.supports_reader,
      supportsSingleVision: !!p.supports_single_vision,
      supportsProgressive: !!p.supports_progressive,
      supportsNonPrescription: !!p.supports_non_prescription,
      rating: p.rating,
      reviewCount: p.review_count,
      bestseller: !!p.bestseller,
      isNew: !!p.is_new,
    };
  });
}

// --------------- system prompt builder ---------------

function buildSystemPrompt(
  lang: string,
  products: ProductBrief[],
  currentUrl?: string,
): string {
  const catalog = products
    .map(
      (p) =>
        `- ${p.name} (/${lang}/product/${p.slug}): $${(p.priceCents / 100).toFixed(2)} | ${p.material ?? "N/A"} | ${p.shape ?? "N/A"} | styles: ${p.styles.join(", ") || "N/A"} | colors: ${p.colors.join(", ") || "N/A"} | size: ${p.lensWidth ?? "?"}×${p.bridge ?? "?"}/${p.temple ?? "?"}mm | lenses: ${[p.supportsReader && "reading", p.supportsSingleVision && "single-vision", p.supportsProgressive && "progressive", p.supportsNonPrescription && "non-prescription"].filter(Boolean).join(", ") || "none"} | ⭐${p.rating} (${p.reviewCount} reviews)${p.bestseller ? " [BESTSELLER]" : ""}${p.isNew ? " [NEW]" : ""}`,
    )
    .join("\n");

  const pageHint = currentUrl
    ? `\nThe customer is currently viewing: ${currentUrl}. Factor this into your response — if they're on a product page, they're interested in that frame; if on the try-on page, they want to experiment; if on the prescription guide, they need lens guidance.`
    : "";

  // Assemble the portable brain — 7 knowledge domains per language
  const brain = assembleBrain(lang);

  return `You are the lool AI Field Deployment Engineer — an expert eyewear consultant for loollook.com, a direct-to-consumer eyeglasses brand specializing in reading glasses (presbyopia) and everyday eyeglasses (myopia) for the 45–60 generation. Brand philosophy: "ageless design" — glasses that look modern and stylish, not "old person glasses."

CORE RULES:
- Reply in the customer's language (match what they write).
- Keep replies concise and friendly (2-4 sentences). Use bullet points for comparisons or lists.
- Never fabricate product names, prices, or features. Use only the catalog below.
- When recommending products, ALWAYS include the link: /${lang}/product/<slug>
- Format prices as $XX.XX (e.g. $89.00, not 8900 cents).
- Be knowledgeable but never pushy. Guide, don't sell.

PRODUCT CATALOG (live from database):
${catalog}

${brain}

PAGE CONTEXT:${pageHint}

When the customer asks about topics not in the catalog, use the knowledge above. If unsure about specifics, direct them to the relevant help page or suggest contacting support.`;
}

// --------------- product extraction (post-stream) ---------------

function extractRecommendedProducts(
  fullText: string,
  products: ProductBrief[],
): RecommendedProduct[] {
  const mentionedSlugs = [
    ...fullText.matchAll(/\/[a-z]{2}\/product\/([a-z0-9-]+)/g),
  ]
    .map((m) => m[1])
    .filter((s) => products.some((p) => p.slug === s));

  const unique = [...new Set(mentionedSlugs)];
  return unique.map((slug) => {
    const p = products.find((x) => x.slug === slug)!;
    return {
      slug: p.slug,
      name: p.name,
      priceCents: p.priceCents,
      material: p.material,
      shape: p.shape,
      colors: p.colors,
      rating: p.rating,
      reviewCount: p.reviewCount,
    };
  });
}

// --------------- SSE helpers ---------------

function sseEncode(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

// --------------- D1 persistence ---------------

async function persistConversation(params: {
  conversationId: string;
  sessionToken: string;
  lang: string;
  userMessage: string;
  assistantMessage: string;
}) {
  try {
    const db = getDB();
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);

    // Upsert conversation (create if new, update timestamp if existing)
    await db
      .prepare(
        `INSERT INTO chat_conversations (id, session_token, lang, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET updated_at = ?`,
      )
      .bind(
        params.conversationId,
        params.sessionToken,
        params.lang,
        now,
        now,
        now,
      )
      .run();

    // Insert user message
    await db
      .prepare(
        `INSERT INTO chat_messages (id, conversation_id, role, content, created_at)
         VALUES (?, ?, 'user', ?, ?)`,
      )
      .bind(nanoid(), params.conversationId, params.userMessage, now)
      .run();

    // Insert assistant message
    await db
      .prepare(
        `INSERT INTO chat_messages (id, conversation_id, role, content, created_at)
         VALUES (?, ?, 'assistant', ?, ?)`,
      )
      .bind(nanoid(), params.conversationId, params.assistantMessage, now)
      .run();
  } catch (err) {
    // Persistence is best-effort — don't fail the response
    console.error("[chat] D1 persist failed:", err);
  }
}

// --------------- route ---------------

const DEFAULT_HISTORY_LIMIT = 10;
const MAX_HISTORY_LIMIT = 50;

export const Route = createFileRoute("/api/chat/")({
  server: {
    handlers: {
      // GET /api/chat?session=<token>&limit=<n> — load conversation history
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const session = url.searchParams.get("session");

        if (!session) {
          return Response.json({ error: "missing_session" }, { status: 400 });
        }

        const limit = Math.min(
          parseInt(
            url.searchParams.get("limit") ?? String(DEFAULT_HISTORY_LIMIT),
            10,
          ) || DEFAULT_HISTORY_LIMIT,
          MAX_HISTORY_LIMIT,
        );

        try {
          const db = getDB();

          const convosRes = await db
            .prepare(
              `SELECT id, lang, created_at, updated_at
               FROM chat_conversations
               WHERE session_token = ?
               ORDER BY updated_at DESC
               LIMIT ?`,
            )
            .bind(session, limit)
            .all<{
              id: string;
              lang: string;
              created_at: string;
              updated_at: string;
            }>();

          const conversations = convosRes.results ?? [];
          if (conversations.length === 0) {
            return Response.json({ conversations: [], messages: [] });
          }

          const convoIds = conversations.map((c) => c.id);
          const placeholders = convoIds.map(() => "?").join(", ");

          const msgsRes = await db
            .prepare(
              `SELECT id, conversation_id, role, content, created_at
               FROM chat_messages
               WHERE conversation_id IN (${placeholders})
               ORDER BY created_at ASC`,
            )
            .bind(...convoIds)
            .all<{
              id: string;
              conversation_id: string;
              role: string;
              content: string;
              created_at: string;
            }>();

          return Response.json({
            conversations: conversations.map((c) => ({
              id: c.id,
              lang: c.lang,
              createdAt: c.created_at,
              updatedAt: c.updated_at,
            })),
            messages: (msgsRes.results ?? []).map((m) => ({
              id: m.id,
              conversationId: m.conversation_id,
              role: m.role,
              content: m.content,
              createdAt: m.created_at,
            })),
          });
        } catch (err) {
          console.error("[chat] history D1 query failed:", err);
          return Response.json({ error: "db_error" }, { status: 500 });
        }
      },

      // POST /api/chat — stream AI response (SSE)
      POST: async ({ request }) => {
        let body: ChatRequest;
        try {
          body = (await request.json()) as ChatRequest;
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }

        if (!Array.isArray(body.messages) || body.messages.length === 0) {
          return Response.json({ error: "empty_messages" }, { status: 400 });
        }

        // Cap conversation history to avoid token bloat
        if (body.messages.length > 20) {
          body.messages = body.messages.slice(-20);
        }

        for (const m of body.messages) {
          if (
            (m.role !== "user" && m.role !== "assistant") ||
            typeof m.content !== "string"
          ) {
            return Response.json({ error: "invalid_message" }, { status: 400 });
          }
        }

        const apiKey = (env as unknown as { ANTHROPIC_API_KEY?: string })
          .ANTHROPIC_API_KEY;
        if (!apiKey) {
          console.error("[chat] ANTHROPIC_API_KEY not set");
          return Response.json({ error: "ai_unconfigured" }, { status: 500 });
        }

        const lang = body.lang || "en";

        // Fetch live catalog and build system prompt
        let products: ProductBrief[];
        try {
          products = await fetchProductBriefs(lang);
        } catch (err) {
          console.error("[chat] failed to fetch product briefs:", err);
          products = [];
        }

        const systemPrompt = buildSystemPrompt(lang, products, body.currentUrl);

        // Build API messages array
        const apiMessages = body.messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        // --- Streaming: call Anthropic with stream=true ---
        const apiBody = {
          model: ANTHROPIC_MODEL,
          max_tokens: 1024,
          stream: true,
          system: systemPrompt,
          messages: apiMessages,
        };

        let upstream: Response;
        try {
          upstream = await fetch(ANTHROPIC_API_URL, {
            method: "POST",
            headers: {
              "x-api-key": apiKey,
              "anthropic-version": "2023-06-01",
              "content-type": "application/json",
            },
            body: JSON.stringify(apiBody),
          });
        } catch (err) {
          console.error("[chat] fetch threw:", err);
          return Response.json({ error: "ai_network" }, { status: 502 });
        }

        if (!upstream.ok || !upstream.body) {
          const errText = await upstream.text().catch(() => "");
          console.error("[chat] Anthropic API error", upstream.status, errText);
          return Response.json(
            { error: "ai_failed", upstream_status: upstream.status },
            { status: 502 },
          );
        }

        const upstreamReader = upstream.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
        let sseBuffer = "";
        let persisted = false;

        // Prepare persistence params
        const conversationId = body.conversationId || nanoid();
        const sessionToken = body.sessionToken || "anonymous";
        const lastUserMsg =
          body.messages[body.messages.length - 1]?.content ?? "";

        async function persistAndFinalize(
          controller: ReadableStreamDefaultController,
        ) {
          if (persisted) return;
          persisted = true;

          // Send products + done (with conversationId for frontend tracking)
          const recommendedProducts = extractRecommendedProducts(
            fullText,
            products,
          );
          if (recommendedProducts.length > 0) {
            controller.enqueue(
              encoder.encode(sseEncode("products", recommendedProducts)),
            );
          }
          controller.enqueue(
            encoder.encode(
              sseEncode("done", {
                stop_reason: "end",
                conversationId,
              }),
            ),
          );
          controller.close();

          // Persist to D1 (fire-and-forget after stream closes)
          if (fullText && sessionToken !== "anonymous") {
            await persistConversation({
              conversationId,
              sessionToken,
              lang,
              userMessage: lastUserMsg,
              assistantMessage: fullText,
            });
          }
        }

        const stream = new ReadableStream({
          async pull(controller) {
            try {
              const { done, value } = await upstreamReader.read();

              if (done) {
                // Flush any remaining SSE buffer
                if (sseBuffer.trim()) {
                  for (const line of sseBuffer.split("\n")) {
                    if (line.startsWith("data: ")) {
                      try {
                        const d = JSON.parse(line.slice(6));
                        if (d.type === "content_block_delta" && d.delta?.text) {
                          fullText += d.delta.text;
                          controller.enqueue(
                            encoder.encode(sseEncode("text", d.delta.text)),
                          );
                        }
                      } catch {
                        /* skip malformed */
                      }
                    }
                  }
                }

                await persistAndFinalize(controller);
                return;
              }

              // Decode the chunk and accumulate into SSE line buffer
              sseBuffer += decoder.decode(value, { stream: true });
              const lines = sseBuffer.split("\n");
              // Keep the last (possibly incomplete) line in the buffer
              sseBuffer = lines.pop() ?? "";

              for (const line of lines) {
                if (!line.startsWith("data: ")) continue;
                const jsonStr = line.slice(6).trim();
                if (!jsonStr) continue;

                try {
                  const d = JSON.parse(jsonStr) as {
                    type: string;
                    delta?: { type: string; text?: string };
                  };

                  if (
                    d.type === "content_block_delta" &&
                    d.delta?.type === "text_delta" &&
                    d.delta.text
                  ) {
                    fullText += d.delta.text;
                    controller.enqueue(
                      encoder.encode(sseEncode("text", d.delta.text)),
                    );
                  }
                  // message_stop also triggers finalization
                  if (d.type === "message_stop") {
                    await persistAndFinalize(controller);
                    return;
                  }
                } catch {
                  /* skip malformed JSON lines */
                }
              }
            } catch (err) {
              console.error("[chat] stream error:", err);
              controller.enqueue(
                encoder.encode(
                  sseEncode("error", { message: "Stream interrupted" }),
                ),
              );
              controller.close();
            }
          },

          cancel() {
            upstreamReader.cancel().catch(() => {});
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
          },
        });
      },
    },
  },
});
