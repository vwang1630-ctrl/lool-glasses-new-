// Camera PD tool for /measure-pd.
//
// Method (same as the card-based tools used by most online optical stores):
//   1. MediaPipe FaceLandmarker (self-hosted, same assets as try-on) tracks the
//      iris centres (landmarks 468 / 473) live; we gate on a frontal, level
//      face at a usable distance.
//   2. "Take photo" averages ~12 frames of pupil positions and freezes the
//      last frame, with the customer holding a standard ID-1 card
//      (85.60 mm wide, ISO/IEC 7810) flat on the forehead.
//   3. The customer drags two handles onto the card's left/right edges
//      (handles snap to the strongest vertical edge nearby) → mm-per-pixel.
//   4. PD = pupil pixel distance × mm-per-pixel. Without a card we fall back
//      to the average horizontal visible iris diameter (≈11.7 mm), flagged as
//      a rough estimate.
// Nothing leaves the device — the frame lives only in an in-memory canvas.
import { useCallback, useEffect, useRef, useState } from "react";
import type { FaceLandmarker } from "@mediapipe/tasks-vision";
import { gaEvent } from "@/lib/analytics";
import {
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Glasses,
  Lightbulb,
  Loader2,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { LangLink } from "@/components/LangLink";
import { useI18n } from "@/lib/i18n";
import { FACE_LANDMARKER_MODEL, MEDIAPIPE_WASM_BASE } from "@/lib/mediapipe-assets";
import { roundHalf, saveMeasuredPd } from "@/lib/measured-pd";
import { pdStrings } from "@/lib/pd-tool-i18n";

const CARD_MM = 85.6;
const CARD_H_MM = 53.98;
const IRIS_MM = 11.7;
const SAMPLES_NEEDED = 12;

type Phase = "intro" | "loading" | "live" | "capturing" | "mark" | "result" | "error";
type Hint = "noFace" | "closer" | "straight" | "level" | "ready";
type Pt = { x: number; y: number };

interface Sample {
  od: Pt; // subject's right pupil
  os: Pt; // subject's left pupil
  bridge: Pt;
  ipdPx: number;
  irisPx: number;
  guide: { cx: number; cy: number; w: number; h: number };
}

interface Measurement {
  pd: number;
  od: number;
  os: number;
  method: "card" | "iris";
}

const median = (a: number[]) => {
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

type NLm = { x: number; y: number };

/** Turn one frame of normalised landmarks into pixel-space measurements. */
function analyse(lm: NLm[], W: number, H: number): { sample: Sample; hint: Hint } | null {
  if (!lm || lm.length < 478) return null;
  const P = (i: number): Pt => ({ x: lm[i].x * W, y: lm[i].y * H });
  const a = P(468);
  const b = P(473);
  // In the raw (un-mirrored) frame the subject's right eye has the smaller x.
  const [od, os] = a.x < b.x ? [a, b] : [b, a];
  const ipdPx = Math.hypot(os.x - od.x, os.y - od.y);
  const spread = (ids: number[]) => {
    const xs = ids.map((i) => P(i).x);
    return Math.max(...xs) - Math.min(...xs);
  };
  const irisPx = (spread([469, 470, 471, 472]) + spread([474, 475, 476, 477])) / 2;
  const bridge = P(168);
  const nose = P(1);
  const c1 = P(33);
  const c2 = P(263);
  const [cr, cl] = c1.x < c2.x ? [c1, c2] : [c2, c1];
  const yaw = Math.abs(nose.x - cr.x) / Math.max(1, Math.abs(cl.x - nose.x));
  const roll = (Math.atan2(os.y - od.y, os.x - od.x) * 180) / Math.PI;
  const forehead = P(10);
  const gw = (ipdPx * CARD_MM) / 63;
  const guide = {
    cx: bridge.x,
    cy: bridge.y + (forehead.y - bridge.y) * 0.6,
    w: gw,
    h: (gw * CARD_H_MM) / CARD_MM,
  };
  let hint: Hint = "ready";
  if (ipdPx / Math.min(W, H) < 0.14) hint = "closer";
  else if (yaw < 0.8 || yaw > 1.25) hint = "straight";
  else if (Math.abs(roll) > 4) hint = "level";
  return { sample: { od, os, bridge, ipdPx, irisPx, guide }, hint };
}

export function PdMeasureTool() {
  const { lang } = useI18n();
  const s = pdStrings(lang);

  const [phase, setPhase] = useState<Phase>("intro");
  const [hint, setHint] = useState<Hint>("noFace");
  const [aspect, setAspect] = useState(4 / 3);
  const [edges, setEdges] = useState<{ l: Pt; r: Pt } | null>(null);
  const [dragging, setDragging] = useState<"l" | "r" | null>(null);
  const [history, setHistory] = useState<Measurement[]>([]);
  const [saved, setSaved] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const markRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const phaseRef = useRef<Phase>("intro");
  const hintRef = useRef<Hint>("noFace");
  const samplesRef = useRef<Sample[]>([]);
  const lastTsRef = useRef(0);
  const captureT0Ref = useRef(0);
  // Frozen frame (mirrored, so it looks like a selfie) + measurements in its
  // pixel space.
  const photoRef = useRef<HTMLCanvasElement | null>(null);
  const grayRef = useRef<{ data: Float32Array; w: number; h: number } | null>(null);
  const shotRef = useRef<Sample | null>(null);

  const go = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(
    () => () => {
      stopCamera();
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    },
    [stopCamera],
  );

  const freeze = useCallback(() => {
    const v = videoRef.current;
    const samples = samplesRef.current;
    if (!v || samples.length === 0) return;
    const W = v.videoWidth;
    const H = v.videoHeight;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d", { willReadFrequently: true })!;
    ctx.translate(W, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(v, 0, 0, W, H);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    photoRef.current = c;
    const img = ctx.getImageData(0, 0, W, H).data;
    const gray = new Float32Array(W * H);
    for (let i = 0; i < W * H; i++) {
      gray[i] = 0.299 * img[i * 4] + 0.587 * img[i * 4 + 1] + 0.114 * img[i * 4 + 2];
    }
    grayRef.current = { data: gray, w: W, h: H };

    // Average the burst, then mirror x into the photo's coordinate space.
    const last = samples[samples.length - 1];
    const m = (p: Pt): Pt => ({ x: W - p.x, y: p.y });
    const shot: Sample = {
      od: m(last.od),
      os: m(last.os),
      bridge: m(last.bridge),
      ipdPx: median(samples.map((x) => x.ipdPx)),
      irisPx: median(samples.map((x) => x.irisPx)),
      guide: { ...last.guide, cx: W - last.guide.cx },
    };
    shotRef.current = shot;
    const g = shot.guide;
    setEdges({ l: { x: g.cx - g.w / 2, y: g.cy }, r: { x: g.cx + g.w / 2, y: g.cy } });
    stopCamera();
    gaEvent("pd_photo_captured", { frames: samples.length });
    go("mark");
  }, [stopCamera]);

  const drawOverlay = (sample: Sample | null, ready: boolean) => {
    const cv = overlayRef.current;
    const v = videoRef.current;
    if (!cv || !v) return;
    if (cv.width !== v.videoWidth) cv.width = v.videoWidth;
    if (cv.height !== v.videoHeight) cv.height = v.videoHeight;
    const ctx = cv.getContext("2d")!;
    ctx.clearRect(0, 0, cv.width, cv.height);
    if (!sample) return;
    const k = cv.width / 640;
    const g = sample.guide;
    ctx.save();
    ctx.setLineDash([10 * k, 8 * k]);
    ctx.lineWidth = 3 * k;
    ctx.strokeStyle = ready ? "rgba(74,222,128,0.95)" : "rgba(255,255,255,0.85)";
    const r = 8 * k;
    const x0 = g.cx - g.w / 2;
    const y0 = g.cy - g.h / 2;
    ctx.beginPath();
    ctx.roundRect(x0, y0, g.w, g.h, r);
    ctx.stroke();
    ctx.restore();
    for (const p of [sample.od, sample.os]) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4 * k, 0, Math.PI * 2);
      ctx.fillStyle = ready ? "#4ade80" : "#ffffff";
      ctx.fill();
    }
  };

  const loop = useCallback(() => {
    const v = videoRef.current;
    const lmk = landmarkerRef.current;
    if (!v || !lmk || !streamRef.current) return;
    if (v.readyState >= 2 && v.videoWidth > 0) {
      let ts = performance.now();
      if (ts <= lastTsRef.current) ts = lastTsRef.current + 1;
      lastTsRef.current = ts;
      const res = lmk.detectForVideo(v, ts);
      const out = analyse(res.faceLandmarks?.[0] as NLm[], v.videoWidth, v.videoHeight);
      const h: Hint = out ? out.hint : "noFace";
      if (h !== hintRef.current) {
        hintRef.current = h;
        setHint(h);
      }
      drawOverlay(out?.sample ?? null, h === "ready");
      if (phaseRef.current === "capturing" && out && h === "ready") {
        samplesRef.current.push(out.sample);
      }
      if (phaseRef.current === "capturing") {
        const n = samplesRef.current.length;
        // Enough frames — or after 4 s settle for what we have (≥4 frames).
        if (n >= SAMPLES_NEEDED || (n >= 4 && performance.now() - captureT0Ref.current > 4000)) {
          freeze();
          return;
        }
      }
    }
    rafRef.current = requestAnimationFrame(loop);
  }, [freeze]);

  const start = async () => {
    setSaved(false);
    gaEvent("pd_tool_start", { attempt: history.length + 1 });
    go("loading");
    try {
      if (!landmarkerRef.current) {
        const { FilesetResolver, FaceLandmarker } = await import("@mediapipe/tasks-vision");
        const fileset = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_BASE);
        const opts = (delegate: "GPU" | "CPU") => ({
          baseOptions: { modelAssetPath: FACE_LANDMARKER_MODEL, delegate },
          runningMode: "VIDEO" as const,
          numFaces: 1,
        });
        try {
          landmarkerRef.current = await FaceLandmarker.createFromOptions(fileset, opts("GPU"));
        } catch {
          landmarkerRef.current = await FaceLandmarker.createFromOptions(fileset, opts("CPU"));
        }
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      const v = videoRef.current!;
      v.srcObject = stream;
      await v.play();
      if (v.videoWidth && v.videoHeight) setAspect(v.videoWidth / v.videoHeight);
      hintRef.current = "noFace";
      setHint("noFace");
      go("live");
      gaEvent("pd_camera_ready");
      rafRef.current = requestAnimationFrame(loop);
    } catch (e) {
      console.error("PD tool camera/model start failed", e);
      stopCamera();
      gaEvent("pd_camera_error", {
        reason: e instanceof DOMException ? e.name : "model",
      });
      go("error");
    }
  };

  const capture = () => {
    samplesRef.current = [];
    captureT0Ref.current = performance.now();
    go("capturing");
  };

  // ── Mark phase: draw the frozen photo + handles ───────────────────────────
  const drawMark = useCallback(() => {
    const cv = markRef.current;
    const photo = photoRef.current;
    const shot = shotRef.current;
    if (!cv || !photo || !shot || !edges) return;
    const W = photo.width;
    const H = photo.height;
    if (cv.width !== W) cv.width = W;
    if (cv.height !== H) cv.height = H;
    const ctx = cv.getContext("2d")!;
    ctx.drawImage(photo, 0, 0);
    const k = W / Math.max(1, cv.getBoundingClientRect().width || W);
    const band = shot.guide.h * 0.8;
    for (const key of ["l", "r"] as const) {
      const p = edges[key];
      ctx.strokeStyle = "#2563eb";
      ctx.lineWidth = 2 * k;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - band);
      ctx.lineTo(p.x, p.y + band);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(p.x, p.y + band + 14 * k, 12 * k, 0, Math.PI * 2);
      ctx.fillStyle = "#2563eb";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2.5 * k;
      ctx.stroke();
    }
    for (const p of [shot.od, shot.os]) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5 * k, 0, Math.PI * 2);
      ctx.fillStyle = "#4ade80";
      ctx.fill();
    }
    // Magnifier while dragging, in the corner away from the handle.
    if (dragging) {
      const p = edges[dragging];
      const R = 70 * k;
      const zoom = 3;
      const cx = p.x < W / 2 ? W - R - 12 * k : R + 12 * k;
      const cy = R + 12 * k;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();
      const src = R / zoom;
      ctx.drawImage(photo, p.x - src, p.y - src, src * 2, src * 2, cx - R, cy - R, R * 2, R * 2);
      ctx.strokeStyle = "#2563eb";
      ctx.lineWidth = 2 * k;
      ctx.beginPath();
      ctx.moveTo(cx, cy - R);
      ctx.lineTo(cx, cy + R);
      ctx.stroke();
      ctx.restore();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3 * k;
      ctx.stroke();
    }
  }, [edges, dragging]);

  useEffect(() => {
    if (phase === "mark") drawMark();
  }, [phase, drawMark]);

  const toImage = (e: React.PointerEvent<HTMLCanvasElement>): Pt => {
    const cv = e.currentTarget;
    const r = cv.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) * cv.width) / r.width,
      y: ((e.clientY - r.top) * cv.height) / r.height,
    };
  };

  /** Snap x to the strongest vertical edge within ±12 px, over a row band. */
  const snap = (p: Pt): Pt => {
    const g = grayRef.current;
    const shot = shotRef.current;
    if (!g || !shot) return p;
    const half = Math.max(8, Math.round(shot.guide.h * 0.3));
    const y0 = Math.max(1, Math.round(p.y - half));
    const y1 = Math.min(g.h - 2, Math.round(p.y + half));
    let best = p.x;
    let bestScore = -1;
    for (let x = Math.round(p.x) - 12; x <= Math.round(p.x) + 12; x++) {
      if (x < 1 || x >= g.w - 1) continue;
      let sum = 0;
      for (let y = y0; y <= y1; y++) {
        sum += Math.abs(g.data[y * g.w + x + 1] - g.data[y * g.w + x - 1]);
      }
      if (sum > bestScore) {
        bestScore = sum;
        best = x;
      }
    }
    return { x: best, y: p.y };
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!edges) return;
    const p = toImage(e);
    const dl = Math.abs(p.x - edges.l.x);
    const dr = Math.abs(p.x - edges.r.x);
    const which = dl <= dr ? "l" : "r";
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(which);
    setEdges({ ...edges, [which]: { x: p.x, y: edges[which].y } });
  };
  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragging || !edges) return;
    const p = toImage(e);
    setEdges({ ...edges, [dragging]: { x: p.x, y: edges[dragging].y } });
  };
  const onUp = () => {
    if (!dragging || !edges) return;
    setEdges({ ...edges, [dragging]: snap(edges[dragging]) });
    setDragging(null);
  };
  const nudge = (key: "l" | "r", dx: number) => {
    if (!edges) return;
    setEdges({ ...edges, [key]: { ...edges[key], x: edges[key].x + dx } });
  };

  const finish = (method: "card" | "iris") => {
    const shot = shotRef.current;
    if (!shot) return;
    let mmPerPx: number;
    if (method === "card") {
      if (!edges) return;
      const cardPx = Math.abs(edges.r.x - edges.l.x);
      if (cardPx < 20) return;
      mmPerPx = CARD_MM / cardPx;
    } else {
      mmPerPx = IRIS_MM / Math.max(1, shot.irisPx);
    }
    const pd = shot.ipdPx * mmPerPx;
    const dOd = Math.abs(shot.od.x - shot.bridge.x);
    const dOs = Math.abs(shot.os.x - shot.bridge.x);
    const tot = dOd + dOs || 1;
    setHistory((h) => [...h, { pd, od: (pd * dOd) / tot, os: (pd * dOs) / tot, method }]);
    setSaved(false);
    gaEvent("pd_result", {
      method,
      run: history.length + 1,
      in_typical_range: pd >= 54 && pd <= 74,
    });
    go("result");
  };

  // Average card measurements if there are any, otherwise the iris estimates.
  const cardRuns = history.filter((m) => m.method === "card");
  const used = cardRuns.length ? cardRuns : history;
  const method: "card" | "iris" = cardRuns.length ? "card" : "iris";
  const avg = (f: (m: Measurement) => number) =>
    used.length ? used.reduce((a, m) => a + f(m), 0) / used.length : 0;
  const pd = roundHalf(avg((m) => m.pd));
  const od = roundHalf(avg((m) => m.od));
  const os = roundHalf(avg((m) => m.os));
  const unusual = pd < 54 || pd > 74;
  const savable = pd >= 48 && pd <= 78;

  const onSave = () => {
    if (!savable) return;
    saveMeasuredPd({
      pd,
      odHalf: od,
      osHalf: os,
      method,
      samples: used.length,
      measuredAt: Date.now(),
    });
    gaEvent("pd_saved", { method, runs: used.length });
    setSaved(true);
  };

  const step =
    phase === "intro" || phase === "error"
      ? 0
      : phase === "mark"
        ? 2
        : phase === "result"
          ? 3
          : 1;
  const steps = [s.stepPrep, s.stepPhoto, s.stepMark, s.stepResult];
  const hintText: Record<Hint, string> = {
    noFace: s.hintNoFace,
    closer: s.hintCloser,
    straight: s.hintStraight,
    level: s.hintLevel,
    ready: s.hintReady,
  };
  const showCamera = phase === "loading" || phase === "live" || phase === "capturing";
  const btn =
    "inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full text-sm font-medium transition-smooth disabled:opacity-50 disabled:cursor-not-allowed";
  const primary = `${btn} bg-primary text-primary-foreground hover:opacity-90 shadow-soft`;
  const secondary = `${btn} border border-border bg-background hover:bg-muted`;

  return (
    <section
      id="pd-tool"
      className="rounded-3xl border border-border/60 bg-card shadow-card p-5 sm:p-8 md:p-10 scroll-mt-24"
    >
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-semibold font-display">{s.title}</h2>
        <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">{s.sub}</p>
      </div>

      <ol className="mt-6 flex items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm">
        {steps.map((label, i) => (
          <li key={label} className="flex items-center gap-1.5 sm:gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                i < step
                  ? "bg-primary text-primary-foreground"
                  : i === step
                    ? "border-2 border-primary text-primary"
                    : "border border-border text-muted-foreground"
              }`}
            >
              {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className={i === step ? "font-medium" : "text-muted-foreground"}>{label}</span>
            {i < steps.length - 1 && <span className="hidden sm:block w-6 h-px bg-border" />}
          </li>
        ))}
      </ol>

      <div className="mt-8">
        {(phase === "intro" || phase === "error") && (
          <div className="max-w-2xl mx-auto">
            <ul className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: Glasses, text: s.prep1 },
                { icon: Lightbulb, text: s.prep2 },
                { icon: CreditCard, text: s.prep3 },
              ].map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="rounded-2xl border border-border/60 bg-background p-4 text-sm leading-relaxed flex sm:flex-col gap-3 items-start"
                >
                  <Icon className="h-6 w-6 text-primary shrink-0" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
            {phase === "error" && (
              <p
                role="alert"
                className="mt-5 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
              >
                {s.camError}
              </p>
            )}
            <div className="mt-6 flex flex-col items-center gap-3">
              <button type="button" onClick={start} className={primary}>
                <Camera className="h-4 w-4" />
                {s.start}
              </button>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                {s.privacy}
              </p>
            </div>
          </div>
        )}

        <div className={showCamera ? "max-w-2xl mx-auto" : "hidden"}>
          <div
            className="relative w-full overflow-hidden rounded-2xl bg-black"
            style={{ aspectRatio: String(aspect) }}
          >
            <video
              ref={videoRef}
              playsInline
              muted
              className="absolute inset-0 h-full w-full object-contain -scale-x-100"
            />
            <canvas
              ref={overlayRef}
              className="absolute inset-0 h-full w-full object-contain -scale-x-100 pointer-events-none"
            />
            {phase === "loading" && (
              <div className="absolute inset-0 flex items-center justify-center gap-2 text-white text-sm">
                <Loader2 className="h-5 w-5 animate-spin" />
                {s.loading}
              </div>
            )}
          </div>
          {phase !== "loading" && (
            <>
              <p
                aria-live="polite"
                className={`mt-4 text-center text-sm md:text-base font-medium ${
                  hint === "ready" ? "text-emerald-600" : "text-foreground"
                }`}
              >
                {phase === "capturing" ? s.capturing : hintText[hint]}
              </p>
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={capture}
                  disabled={hint !== "ready" || phase === "capturing"}
                  className={primary}
                >
                  {phase === "capturing" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                  {phase === "capturing" ? s.capturing : s.capture}
                </button>
              </div>
            </>
          )}
        </div>

        {phase === "mark" && edges && (
          <div className="max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold">{s.markTitle}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.markBody}</p>
            <canvas
              ref={markRef}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              className="mt-4 w-full rounded-2xl bg-black touch-none cursor-ew-resize select-none"
            />
            <div className="mt-4 grid grid-cols-2 gap-3">
              {(["l", "r"] as const).map((key) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 py-2"
                >
                  <button
                    type="button"
                    aria-label={`${key === "l" ? s.leftEdge : s.rightEdge} −`}
                    onClick={() => nudge(key, -1)}
                    className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:bg-muted"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="text-xs sm:text-sm text-center">
                    {key === "l" ? s.leftEdge : s.rightEdge}
                  </span>
                  <button
                    type="button"
                    aria-label={`${key === "l" ? s.leftEdge : s.rightEdge} +`}
                    onClick={() => nudge(key, 1)}
                    className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:bg-muted"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-3">
              <button type="button" onClick={() => finish("card")} className={primary}>
                {s.calc}
              </button>
              <button type="button" onClick={start} className={secondary}>
                <RotateCcw className="h-4 w-4" />
                {s.retake}
              </button>
              <button
                type="button"
                onClick={() => finish("iris")}
                className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                {s.noCard}
              </button>
            </div>
          </div>
        )}

        {phase === "result" && used.length > 0 && (
          <div className="max-w-xl mx-auto text-center">
            <p className="text-sm text-muted-foreground">{s.resultTitle}</p>
            <p className="mt-1 font-display text-6xl md:text-7xl font-semibold tracking-tight">
              {pd.toFixed(1)}
              <span className="ml-1 text-2xl md:text-3xl font-normal text-muted-foreground">mm</span>
            </p>
            <p className="mt-2 text-sm">{s.distLabel}</p>
            <div className="mt-5 inline-flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-2 text-sm">
              <span className="text-muted-foreground">{s.monoLabel}</span>
              <span className="font-semibold">
                {od.toFixed(1)} / {os.toFixed(1)}
              </span>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              {method === "card" ? s.methodCard : s.methodIris}
              {used.length > 1 && <> · {s.avgOf.replace("{n}", String(used.length))}</>}
            </p>
            {unusual && (
              <p
                role="alert"
                className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"
              >
                {s.outOfRange}
              </p>
            )}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={onSave}
                disabled={!savable || saved}
                className={primary}
              >
                {saved ? <Check className="h-4 w-4" /> : null}
                {s.save}
              </button>
              <button type="button" onClick={start} className={secondary}>
                <RotateCcw className="h-4 w-4" />
                {s.again}
              </button>
            </div>
            {saved ? (
              <p className="mt-4 text-sm text-emerald-700" role="status">
                {s.saved}{" "}
                <LangLink to="/products" className="underline underline-offset-4 font-medium">
                  {s.shop}
                </LangLink>
              </p>
            ) : (
              <p className="mt-4 text-xs text-muted-foreground">{s.againTip}</p>
            )}
            <p className="mt-6 text-xs text-muted-foreground">{s.disclaimer}</p>
          </div>
        )}
      </div>
    </section>
  );
}
