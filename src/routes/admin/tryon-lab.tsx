// /admin/tryon-lab — owner-only test bench for the v7 try-on engine
// (src/lib/tryon-v7/engine.ts). The public /try-on page is untouched; this page
// lets the owner compare v7 on our own GLB models / PNG fronts and tune the fit
// parameters before v7 replaces the live engine.
//
// Access: rendered inside the /admin layout (noindex) and additionally refuses
// to mount the camera / engine until /api/admin/me confirms an admin session.

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCatalogProducts } from "@/lib/use-catalog-products";
import { pickLang } from "@/lib/lang";
import type {
  GlassesSource,
  TrackState,
  TryOnV7Engine as EngineType,
  V7Config,
} from "@/lib/tryon-v7/engine";

export const Route = createFileRoute("/admin/tryon-lab")({
  component: TryOnLab,
});

interface FrameOption {
  key: string;
  label: string;
  thumb: string | null;
  source: GlassesSource;
  badge: "3D" | "2D" | "v7";
}

const DEFAULT_CFG: V7Config = {
  refHeadWidth: 140,
  refFaceHeight: 210,
  glassesDepth: 10,
  glassesDown: 2,
  glassesCenterX: 0,
  glassesScale: 1.22,
  occluder: true,
};

const SLIDERS: {
  k: keyof Omit<V7Config, "occluder">;
  label: string;
  min: number;
  max: number;
  step: number;
}[] = [
  { k: "glassesScale", label: "整体大小 glassesScale", min: 0.6, max: 2, step: 0.01 },
  { k: "glassesDown", label: "上下位置 glassesDown（正=下移）", min: -30, max: 30, step: 0.5 },
  { k: "glassesDepth", label: "前后深度 glassesDepth", min: -20, max: 40, step: 0.5 },
  { k: "glassesCenterX", label: "左右微调 glassesCenterX", min: -20, max: 20, step: 0.5 },
];

function TryOnLab() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState<boolean | null>(null);
  useEffect(() => {
    fetch("/api/admin/me", { credentials: "same-origin" })
      .then((r) => {
        if (r.ok) setAuthed(true);
        else {
          setAuthed(false);
          navigate({ to: "/admin/login" });
        }
      })
      .catch(() => {
        setAuthed(false);
        navigate({ to: "/admin/login" });
      });
  }, [navigate]);

  if (!authed) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        {authed === null ? "校验管理员登录…" : "需要管理员登录"}
      </div>
    );
  }
  return <Lab />;
}

function Lab() {
  const products = useCatalogProducts();
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const engineRef = useRef<EngineType | null>(null);
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [track, setTrack] = useState<TrackState | null>(null);
  const [fps, setFps] = useState(0);
  const [cfg, setCfg] = useState<V7Config>({ ...DEFAULT_CFG });
  const [frameKey, setFrameKey] = useState<string>("v7-procedural");
  const [copied, setCopied] = useState(false);

  // Every catalog colour with a GLB (3D) or try-on image (2D), plus the v7
  // procedural gold frame as the baseline.
  const frames = useMemo<FrameOption[]>(() => {
    const list: FrameOption[] = [
      {
        key: "v7-procedural",
        label: "v7 原版金丝圆框（基准）",
        thumb: null,
        source: { kind: "procedural" },
        badge: "v7",
      },
    ];
    for (const p of products) {
      for (const c of p.colors ?? []) {
        const name = `${pickLang(p.name, "zh")} · ${pickLang(c.label, "zh")}`;
        if (c.tryonModelUrl)
          list.push({
            key: `${p.slug}:${c.id}:glb`,
            label: name,
            thumb: c.images?.[0] || null,
            source: { kind: "glb", url: c.tryonModelUrl },
            badge: "3D",
          });
        if (c.tryonImageUrl)
          list.push({
            key: `${p.slug}:${c.id}:png`,
            label: name,
            thumb: c.tryonImageUrl,
            source: { kind: "png", url: c.tryonImageUrl },
            badge: "2D",
          });
      }
    }
    return list;
  }, [products]);
  const frame = frames.find((f) => f.key === frameKey) ?? frames[0];

  useEffect(() => {
    engineRef.current?.setConfig(cfg);
  }, [cfg]);

  useEffect(() => {
    if (!running || !engineRef.current || !frame) return;
    engineRef.current.setGlasses(frame.source).catch((e: unknown) => {
      console.error(e);
      setError(`镜框加载失败：${e instanceof Error ? e.message : String(e)}`);
    });
  }, [running, frame]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setFps(engineRef.current?.fps ?? 0), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => () => engineRef.current?.dispose(), []);

  const start = async () => {
    if (!stageRef.current || !videoRef.current) return;
    setError(null);
    try {
      const { TryOnV7Engine } = await import("@/lib/tryon-v7/engine");
      const engine = new TryOnV7Engine(stageRef.current, videoRef.current, setTrack);
      engine.setConfig(cfg);
      engineRef.current = engine;
      await engine.start(setStep);
      setStep(null);
      setRunning(true);
    } catch (e) {
      engineRef.current?.dispose();
      engineRef.current = null;
      const err = e as { name?: string; message?: string };
      const hint =
        err.name === "NotAllowedError"
          ? "摄像头被拒绝——地址栏左侧图标 → 允许 → 刷新"
          : err.name === "NotFoundError"
            ? "设备没有摄像头"
            : err.name === "NotReadableError"
              ? "摄像头被其他程序占用"
              : "详见浏览器 console";
      setError(`启动失败 [${err.name ?? "Error"}] ${err.message ?? ""} — ${hint}`);
      setStep(null);
    }
  };

  const stop = () => {
    engineRef.current?.dispose();
    engineRef.current = null;
    setRunning(false);
    setTrack(null);
  };

  const snap = () => {
    const url = engineRef.current?.snapshot();
    if (!url) return;
    const a = document.createElement("a");
    a.download = `tryon-v7-${Date.now()}.png`;
    a.href = url;
    a.click();
  };

  const copyParams = async () => {
    const out = {
      frame: frame?.key,
      glassesScale: cfg.glassesScale,
      glassesDown: cfg.glassesDown,
      glassesDepth: cfg.glassesDepth,
      glassesCenterX: cfg.glassesCenterX,
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(out, null, 2));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const trackText =
    track === "locked"
      ? { t: "✓ 人脸已锁定", c: "text-emerald-600" }
      : track === "lost"
        ? { t: "未检测到人脸——正对摄像头，40–70cm，露出全脸", c: "text-amber-600" }
        : track === "searching"
          ? { t: "请正对摄像头", c: "text-amber-600" }
          : null;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">试戴实验室 · v7 引擎</h1>
        <p className="text-sm text-muted-foreground mt-1">
          仅管理员可见。用两耳（太阳穴）+ 鼻梁 + 额头/下巴定位、自适应平滑、脸部遮挡。线上 /try-on
          未改动，调满意后再替换。
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-xl border border-border bg-black aspect-video">
            <div ref={stageRef} className="absolute inset-0 [&>canvas]:!h-full [&>canvas]:!w-full [&>canvas]:object-contain" />
            {/* Kept 2px visible: Chrome stops supplying frames to hidden videos. */}
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="absolute left-0 top-0 h-[2px] w-[2px] opacity-[0.01]"
            />
            {!running && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
                <button
                  onClick={start}
                  disabled={!!step}
                  className="rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-emerald-950 disabled:opacity-60"
                >
                  {step ? step : "▶ 开始试戴"}
                </button>
                <span className="text-xs text-white/70">画面只在本机处理，不上传</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {running && (
              <>
                <button onClick={snap} className="rounded-md border border-border px-3 py-1.5">
                  📸 截图
                </button>
                <button onClick={stop} className="rounded-md border border-border px-3 py-1.5">
                  停止
                </button>
                <span className="text-muted-foreground">追踪 {fps} fps</span>
              </>
            )}
            {trackText && <span className={trackText.c}>{trackText.t}</span>}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <div className="space-y-5">
          <section>
            <h2 className="mb-2 text-sm font-semibold">镜框</h2>
            <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
              {frames.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFrameKey(f.key)}
                  className={`flex w-full items-center gap-2 rounded-md border px-2 py-1.5 text-left text-xs ${
                    f.key === frame?.key
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  {f.thumb ? (
                    <img src={f.thumb} alt="" className="h-8 w-12 rounded object-contain bg-white" />
                  ) : (
                    <span className="flex h-8 w-12 items-center justify-center rounded bg-secondary">○○</span>
                  )}
                  <span className="flex-1">{f.label}</span>
                  <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold">
                    {f.badge}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold">贴合参数</h2>
            {SLIDERS.map((s) => (
              <label key={s.k} className="block text-xs">
                <span className="flex justify-between">
                  <span>{s.label}</span>
                  <span className="tabular-nums">{cfg[s.k]}</span>
                </span>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={cfg[s.k]}
                  onChange={(e) => setCfg((c) => ({ ...c, [s.k]: Number(e.target.value) }))}
                  className="w-full"
                />
              </label>
            ))}
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={cfg.occluder}
                onChange={(e) => setCfg((c) => ({ ...c, occluder: e.target.checked }))}
              />
              脸部遮挡（转头时远侧镜腿藏到头后）
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setCfg({ ...DEFAULT_CFG })}
                className="rounded-md border border-border px-3 py-1.5 text-xs"
              >
                恢复默认
              </button>
              <button onClick={copyParams} className="rounded-md border border-border px-3 py-1.5 text-xs">
                {copied ? "已复制" : "复制参数"}
              </button>
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              调到贴合后点「复制参数」发给开发，作为该镜框的默认值。2D 图片款没有镜腿；3D 款按模型包围盒自动对齐，偏差用上面滑杆修正。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
