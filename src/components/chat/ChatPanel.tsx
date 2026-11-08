import { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Send,
  Loader2,
  ShoppingBag,
  Eye,
  HelpCircle,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LangLink } from "@/components/LangLink";
import { whatsappLink, trackWhatsappClick } from "@/lib/contact";

function WhatsappIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.93.95-3.48-.22-.36a9.41 9.41 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.44-9.43 2.52 0 4.89.98 6.67 2.77a9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.23 9.43-9.44 9.43m8.03-17.46A11.27 11.27 0 0 0 12.05.72C5.79.72.7 5.8.7 12.06c0 2 .52 3.95 1.52 5.67L.6 23.28l5.7-1.5a11.33 11.33 0 0 0 5.74 1.47h.01c6.26 0 11.35-5.09 11.35-11.35 0-3.03-1.18-5.88-3.33-8.02" />
    </svg>
  );
}

// --------------- types ---------------

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  streaming?: boolean;
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

interface ChatPanelProps {
  onClose: () => void;
}

// --------------- theme ---------------

/** Slot class map for the chat surface — one light site theme shared by the
 *  desktop card and the mobile bottom sheet, so both stay consistent with the
 *  rest of the storefront. */
const CHAT_THEME = {
  light: {
    root: "bg-card",
    border: "border-border",
    headerChip: "bg-primary/10",
    headerChipIcon: "text-primary",
    muted: "text-muted-foreground",
    iconBtn: "text-muted-foreground hover:bg-secondary hover:text-foreground",
    userBubble: "bg-primary text-primary-foreground",
    assistantBubble: "bg-secondary text-foreground",
    caret: "bg-primary/60",
    productCard: "bg-card border-border",
    productChip: "bg-secondary",
    productMuted: "text-muted-foreground",
    quickBtn: "border-border text-foreground hover:bg-secondary",
    textarea:
      "border-input bg-background placeholder:text-muted-foreground focus:border-ring focus:ring-ring/20",
    sendBtn: "bg-primary text-primary-foreground hover:bg-primary/90",
    loadingBubble: "bg-secondary",
  },
} as const;

const theme = CHAT_THEME.light;

// --------------- SSE stream reader ---------------

async function readChatStream(
  response: Response,
  onText: (chunk: string) => void,
  onProducts: (products: RecommendedProduct[]) => void,
  onDone: (data?: { conversationId?: string }) => void,
  onError: (msg: string) => void,
) {
  const reader = response.body?.getReader();
  if (!reader) {
    onError("Streaming not supported");
    return;
  }

  const decoder = new TextDecoder();
  let sseBuffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      sseBuffer += decoder.decode(value, { stream: true });
      // SSE events are separated by double newlines
      const events = sseBuffer.split("\n\n");
      // Keep the last (possibly incomplete) chunk in the buffer
      sseBuffer = events.pop() ?? "";

      for (const eventStr of events) {
        if (!eventStr.trim()) continue;

        let eventType = "message";
        let eventData = "";

        for (const line of eventStr.split("\n")) {
          if (line.startsWith("event: ")) {
            eventType = line.slice(7).trim();
          } else if (line.startsWith("data: ")) {
            eventData = line.slice(6);
          }
        }

        try {
          const data = JSON.parse(eventData);
          switch (eventType) {
            case "text":
              onText(typeof data === "string" ? data : "");
              break;
            case "products":
              onProducts(data as RecommendedProduct[]);
              break;
            case "done":
              onDone(data as { conversationId?: string } | undefined);
              break;
            case "error":
              onError(data.message ?? "Unknown error");
              break;
          }
        } catch {
          /* skip malformed JSON */
        }
      }
    }
    // If we exit the loop without a done event, finalize anyway
    onDone();
  } catch (err) {
    console.error("[ChatPanel] stream read error:", err);
    onError("Stream interrupted");
  } finally {
    reader.releaseLock();
  }
}

// --------------- product card ---------------

function ProductCard({
  product,
  lang,
}: {
  product: RecommendedProduct;
  lang: string;
}) {
  return (
    <LangLink
      to={`/product/${product.slug}`}
      className={`block shrink-0 w-44 rounded-xl border p-3 transition-shadow hover:shadow-md ${theme.productCard}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`h-8 w-8 rounded-full ${theme.productChip}`}
          aria-hidden
        >
          <ShoppingBag className={`h-4 w-4 m-2 ${theme.productMuted}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{product.name}</p>
          <p className={`text-xs ${theme.productMuted}`}>
            {product.material}
            {product.shape ? ` · ${product.shape}` : ""}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">
          ${(product.priceCents / 100).toFixed(2)}
        </span>
        {product.reviewCount > 0 && (
          <span className={`text-xs ${theme.productMuted}`}>
            ★ {product.rating} ({product.reviewCount})
          </span>
        )}
      </div>
      {product.colors.length > 0 && (
        <div className="mt-2 flex gap-1">
          {product.colors.slice(0, 4).map((c, i) => (
            <span
              key={i}
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${theme.productChip} ${theme.productMuted}`}
            >
              {c}
            </span>
          ))}
          {product.colors.length > 4 && (
            <span className={`text-[10px] px-1.5 py-0.5 ${theme.productMuted}`}>
              +{product.colors.length - 4}
            </span>
          )}
        </div>
      )}
    </LangLink>
  );
}

// --------------- message bubble ---------------

function MessageBubble({
  message,
  recommendedProducts,
  lang,
}: {
  message: Message;
  recommendedProducts?: RecommendedProduct[];
  lang: string;
}) {
  const isUser = message.role === "user";
  const isStreaming = message.streaming;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
          isUser ? theme.userBubble : theme.assistantBubble
        }`}
      >
        <p className="text-sm whitespace-pre-wrap leading-relaxed">
          {message.content}
          {isStreaming && (
            <span
              className={`inline-block w-1.5 h-4 ml-0.5 ${theme.caret} animate-pulse align-text-bottom`}
            />
          )}
        </p>
        {!isUser &&
          !isStreaming &&
          recommendedProducts &&
          recommendedProducts.length > 0 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {recommendedProducts.map((p) => (
                <ProductCard key={p.slug} product={p} lang={lang} />
              ))}
            </div>
          )}
      </div>
    </div>
  );
}

// --------------- quick actions ---------------

const QUICK_ACTIONS = [
  { icon: Sparkles, key: "chat.quick.recommend", action: "recommend" },
  { icon: Eye, key: "chat.quick.tryOn", action: "try-on" },
  { icon: HelpCircle, key: "chat.quick.prescription", action: "prescription" },
  { icon: ShoppingBag, key: "chat.quick.shipping", action: "shipping" },
] as const;

// --------------- session helpers ---------------

const SESSION_KEY = "lool_chat_session";

function getSessionToken(): string {
  if (typeof window === "undefined") return "anonymous";
  let token = localStorage.getItem(SESSION_KEY);
  if (!token) {
    token = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(SESSION_KEY, token);
  }
  return token;
}

// --------------- main panel ---------------

export function ChatPanel({ onClose }: ChatPanelProps) {
  const { t, lang } = useI18n();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: t("chat.welcome"),
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  // Flips true once the AI endpoint fails (e.g. no API key configured) so
  // the panel hands the visitor off to a human on WhatsApp.
  const [aiDown, setAiDown] = useState(false);
  const waHref = whatsappLink(t("chat.whatsappGreeting"));
  const onWhatsappClick = (surface: string) =>
    trackWhatsappClick(surface, lang);
  const [productsByMessage, setProductsByMessage] = useState<
    Record<string, RecommendedProduct[]>
  >({});

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const conversationIdRef = useRef<string | null>(null);
  const sessionTokenRef = useRef<string>("anonymous");

  // Initialize session token on mount
  useEffect(() => {
    sessionTokenRef.current = getSessionToken();
  }, []);

  // Load conversation history on mount
  useEffect(() => {
    const token = sessionTokenRef.current;
    if (token === "anonymous") {
      setHistoryLoaded(true);
      return;
    }

    fetch(`/api/chat?session=${encodeURIComponent(token)}&limit=5`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data || !data.messages || data.messages.length === 0) {
          setHistoryLoaded(true);
          return;
        }

        // Use the most recent conversation
        const lastConvo = data.conversations?.[0];
        if (lastConvo) {
          conversationIdRef.current = lastConvo.id;
        }

        const historyMessages: Message[] = data.messages.map(
          (m: {
            id: string;
            role: string;
            content: string;
            created_at: string;
          }) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
            timestamp: new Date(m.created_at).getTime(),
          }),
        );

        setMessages((prev) => [prev[0], ...historyMessages]); // keep welcome, add history
        setHistoryLoaded(true);
      })
      .catch((err) => {
        console.error("[ChatPanel] history load failed:", err);
        setHistoryLoaded(true);
      });
  }, []);

  // Auto-scroll to bottom on new messages or streaming text
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || streaming) return;

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text.trim(),
        timestamp: Date.now(),
      };

      const assistantId = `assistant-${Date.now()}`;
      const assistantMsg: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: Date.now(),
        streaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setInput("");
      setStreaming(true);

      try {
        // Build history from current messages (exclude welcome, include both user + assistant)
        const prevHistory = messages
          .filter((m) => m.id !== "welcome" && !m.streaming)
          .map((m) => ({ role: m.role, content: m.content }));
        const history = [
          ...prevHistory,
          { role: "user" as const, content: text.trim() },
        ];

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history,
            lang,
            currentUrl: window.location.pathname + window.location.search,
            conversationId: conversationIdRef.current,
            sessionToken: sessionTokenRef.current,
          }),
        });

        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }

        const contentType = res.headers.get("content-type") ?? "";

        if (contentType.includes("text/event-stream")) {
          // SSE streaming mode
          await readChatStream(
            res,
            // onText: append chunk to the assistant message
            (chunk) => {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + chunk }
                    : m,
                ),
              );
            },
            // onProducts: attach product cards
            (products) => {
              if (products.length > 0) {
                setProductsByMessage((prev) => ({
                  ...prev,
                  [assistantId]: products,
                }));
              }
            },
            // onDone: finalize the message, capture conversationId
            (doneData) => {
              if (doneData?.conversationId) {
                conversationIdRef.current = doneData.conversationId;
              }
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, streaming: false } : m,
                ),
              );
              setStreaming(false);
            },
            // onError: show error in the message
            (errMsg) => {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        content: m.content || t("chat.whatsappHint"),
                        streaming: false,
                      }
                    : m,
                ),
              );
              setAiDown(true);
              setStreaming(false);
              console.error("[ChatPanel] stream error:", errMsg);
            },
          );
        } else {
          // Fallback: buffered JSON response (non-streaming)
          const data = (await res.json()) as {
            reply: string;
            recommendedProducts?: RecommendedProduct[];
            conversationId?: string;
          };

          if (data.conversationId) {
            conversationIdRef.current = data.conversationId;
          }

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: data.reply, streaming: false }
                : m,
            ),
          );

          if (data.recommendedProducts && data.recommendedProducts.length > 0) {
            setProductsByMessage((prev) => ({
              ...prev,
              [assistantId]: data.recommendedProducts!,
            }));
          }

          setStreaming(false);
        }
      } catch (err) {
        console.error("[ChatPanel] send failed:", err);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: t("chat.whatsappHint"),
                  streaming: false,
                }
              : m,
          ),
        );
        setAiDown(true);
        setStreaming(false);
      }
    },
    [messages, streaming, lang, t],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const startNewConversation = useCallback(() => {
    conversationIdRef.current = null;
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: t("chat.welcome"),
        timestamp: Date.now(),
      },
    ]);
    setProductsByMessage({});
    setInput("");
    inputRef.current?.focus();
  }, [t]);

  const handleQuickAction = (action: string) => {
    const prompts: Record<string, string> = {
      recommend: t("chat.prompt.recommend"),
      "try-on": t("chat.prompt.tryOn"),
      prescription: t("chat.prompt.prescription"),
      shipping: t("chat.prompt.shipping"),
    };
    sendMessage(prompts[action] || action);
  };

  return (
    <div className={`flex min-h-0 flex-1 flex-col ${theme.root}`}>
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 border-b ${theme.border}`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center ${theme.headerChip}`}
          >
            <Sparkles className={`h-4 w-4 ${theme.headerChipIcon}`} />
          </div>
          <div>
            <h3 className="text-sm font-semibold">{t("chat.title")}</h3>
            <p className={`text-[11px] ${theme.muted}`}>{t("chat.subtitle")}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onWhatsappClick("chat_header")}
            className={`rounded-full p-1.5 transition-colors ${theme.iconBtn}`}
            title={t("chat.whatsapp")}
            aria-label={t("chat.whatsapp")}
          >
            <WhatsappIcon className="h-4 w-4" />
          </a>
          {messages.length > 1 && (
            <button
              type="button"
              onClick={startNewConversation}
              className={`rounded-full p-1.5 transition-colors ${theme.iconBtn}`}
              title={t("chat.newConversation") || "New conversation"}
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className={`rounded-full p-1.5 transition-colors ${theme.iconBtn}`}
            aria-label={t("chat.close")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-4 space-y-3"
      >
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            recommendedProducts={productsByMessage[msg.id]}
            lang={lang}
          />
        ))}
        {streaming &&
          messages[messages.length - 1]?.content === "" &&
          messages[messages.length - 1]?.role === "assistant" && (
            <div className="flex justify-start">
              <div className={`rounded-2xl px-4 py-3 ${theme.loadingBubble}`}>
                <Loader2 className={`h-4 w-4 animate-spin ${theme.muted}`} />
              </div>
            </div>
          )}
        {aiDown && !streaming && (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onWhatsappClick("chat_fallback")}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          >
            <WhatsappIcon className="h-5 w-5" />
            {t("chat.whatsapp")}
          </a>
        )}
      </div>

      {/* Quick actions (only show when just welcome message and history loaded) */}
      {historyLoaded && messages.length === 1 && !streaming && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((qa) => (
            <button
              key={qa.action}
              type="button"
              onClick={() => handleQuickAction(qa.action)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${theme.quickBtn}`}
            >
              <qa.icon className="h-3 w-3" />
              {t(qa.key)}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className={`border-t px-3 py-3 ${theme.border}`}>
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("chat.placeholder")}
            rows={1}
            className={`flex-1 resize-none rounded-xl border px-3 py-2 text-base outline-none focus:ring-2 ${theme.textarea}`}
            style={{ maxHeight: "120px" }}
          />
          <button
            type="button"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || streaming}
            className={`shrink-0 rounded-xl p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${theme.sendBtn}`}
            aria-label={t("chat.send")}
          >
            {streaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className={`mt-1.5 text-[10px] text-center ${theme.muted}`}>
          {t("chat.disclaimer")}
        </p>
      </div>
    </div>
  );
}
