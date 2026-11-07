import { createFileRoute, Link } from "@tanstack/react-router";
import { pageTitle } from "@/lib/page-titles";
import { headTranslator } from "@/lib/page-descriptions";
import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { pickLang } from "@/lib/lang";
import { FRAME_PNGS } from "@/data/products";
import { useCatalogProducts } from "@/lib/use-catalog-products";
import { Button } from "@/components/ui/button";
import {
  Camera,
  X,
  Check,
  Sliders,
  ImageDown,
  Glasses,
  Upload,
  FlipHorizontal2,
} from "lucide-react";
import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { trackCustomerEvent } from "@/lib/customer-audit";
import { FACE_LANDMARKER_MODEL, MEDIAPIPE_WASM_BASE } from "@/lib/mediapipe-assets";

interface TryOnSearch {
  frame?: string;
}

export const Route = createFileRoute("/$lang/try-on")({
  head: ({ params }) => {
    // description = the page's own heading + tip line (design-source copy,
    // already translated in the i18n dictionary).
    const t = headTranslator(params.lang);
    const desc = `${t("tryon.title")} — ${t("tryon.tip")}`;
    return {
      meta: [
        { title: pageTitle("tryOn", params.lang) },
        { name: "description", content: desc },
        { property: "og:description", content: desc },
        { name: "twitter:description", content: desc },
      ],
    };
  },
  validateSearch: (s: Record<string, unknown>): TryOnSearch => ({
    frame: typeof s.frame === "string" ? s.frame : undefined,
  }),
  component: TryOn,
});

// Frame picker is driven by the live catalog (see useCatalogProducts). Static
// FRAME_PNGS retained as a last-resort fallback if the catalog hasn't loaded.
const FALLBACK_FRAME_SRC = FRAME_PNGS.tortoise;

// ---------------------------------------------------------------------------
// Plugin mode (offline VTO package v0.1, `public/tryon/index.html`).
//
// The whole render pipeline follows the plugin verbatim — no reinterpretation:
//   * 2D overlay is anchored on the iris landmarks 468/473 (sort-by-x →
//     pL/pR), width = pd × widthRatio, centered at (ex, ey + pd × offsetRatio),
//     rotated by roll × rotFollow, drawn as one composited image.
//   * Mirroring is a CSS `scaleX(-1)` on the stage (video + overlay canvases),
//     exactly like `.stage.mirror { transform: scaleX(-1) }` in the plugin.
//   * Snap composits the video + overlay onto an export canvas, explicitly
//     flipped when mirrored, so the PNG matches what the user sees.
//   * The three sliders keep the plugin's exact ranges/defaults
//     (width 1.6–2.6 → 2.15, offset −0.3..0.5 → 0, rot 0..1 → 0.95).
//     Default offset is 0: 0 = bridge at the pupil line (镜梁正对瞳孔连线),
//     positive = lower, negative = raise (站主测试结果修改 2026-10-11).
//   * Dynamic temples (镜腿架耳, 2026-10-11): two lines drawn UNDER the frame
//     from each hinge (frame outer edge, 15% above center) to the MediaPipe
//     tragion anchors 234/454. Yaw compensation is automatic — the projected
//     anchors carry the perspective, plus a nose→eye-outer yaw ratio folds the
//     far temple back so it reads "going behind the head".
//
// GLB 3D mode (README §6):
//   const mat = new THREE.Matrix4().fromArray(m);
//   glassesModel.matrixAutoUpdate = false;
//   glassesModel.matrix.copy(mat).multiply(modelLocalOffset); // +手工标定偏移
//
// MediaPipe's face-geometry transformation matrix maps the canonical metric
// face (units ≈ cm) into the camera space of its DEFAULT projection — vertical
// fov 63°, near 1 cm, far 100 m, origin top-left (confirmed in
// fg_face_geometry_from_landmarks_graph.cc). We replay that exact camera in
// three.js (PerspectiveCamera(63°, aspect, 1, 10000) at the origin looking
// down −Z) so a GLB product lands on the face 1:1 with zero extra alignment.
// ---------------------------------------------------------------------------

const DEFAULT_PARAMS = {
  width: 2.15,
  offset: 0,
  rot: 0.95,
  templeWidthRatio: 0.04,
};
const WIDTH_MIN = 1.6;
const WIDTH_MAX = 2.6;
const WIDTH_STEP = 0.01;
const OFFSET_MIN = -0.3;
const OFFSET_MAX = 0.5;
const OFFSET_STEP = 0.01;
const ROT_MIN = 0;
const ROT_MAX = 1;
const ROT_STEP = 0.01;

// Dynamic temples (镜腿架耳) — 2D mode only, drawn under the frame layer
// (站主追加需求 2026-10-11). Hinge sits at the frame's left/right outer edge,
// 15% above its vertical center. MediaPipe tragion anchors: 234 = wearer's
// right ear (screen-left, unmirrored), 454 = wearer's left ear (screen-right).
const EAR_R = 234;
const EAR_L = 454;
// Yaw proxy points: eye outer corners + nose tip (nose→outer-eye ratio).
const EYE_OUTER_R = 33;
const EYE_OUTER_L = 263;
const NOSE_TIP = 1;
// Temple thickness ≈ pd × templeWidthRatio (default 0.04 of the PD).
const TEMPLE_HINGE_Y_RATIO = -0.15; // 15% above the frame's vertical center
const TEMPLE_FALLBACK_COLOR = "#1a1a1a";

// --- §6 GLB calibration constants (verified against the probe) ---
// The default MediaPipe camera frustum, replayed by the three.js camera below.
const CAM_FOV = 63;
const CAM_NEAR = 1; // 1 cm
const CAM_FAR = 10000; // 100 m
// GLB authored width along X (lool-tr90-square: X 0.145 m, Y 0.0444 m).
const MODEL_WIDTH_M = 0.145;
// Bridge bar offset inside the GLB's root-local frame (meters).
const BRIDGE_Y_M = 0.0125;
const BRIDGE_Z_M = 0.078;
// Nose bridge in the canonical metric face model (canonical.obj #168).
const CANONICAL_168 = new THREE.Vector3(0, 3.271027, 5.236015);
// Canonical inter-pupillary distance (cm), triangulated from a 120-frame probe
// under the default camera. IPD/canthi = 0.631 (anthropometric range). The §6
// scale `S = widthRatio × IPD_CANONICAL / MODEL_WIDTH_M` makes the rendered GLB
// width equal `widthRatio × pd_px` on screen — the same fit rule as the 2D
// overlay, by construction.
const IPD_CANONICAL = 5.6128;

// §6 hand-calibrated model offset: T(canonical_168) × Scale(S) × T(−bridge).
// Applies to the GLB's root BEFORE the face matrix, so the bridge vertex lands
// on the nose bridge at every head pose. `offsetRatio` shifts the anchor down
// on the face (screen −Y = metric −Y), mirroring the plugin's vertical slider.
const modelLocalOffset = (widthRatio: number, offsetRatio: number) => {
  const S = (widthRatio * IPD_CANONICAL) / MODEL_WIDTH_M;
  const tBridge = new THREE.Matrix4().makeTranslation(
    0,
    -BRIDGE_Y_M,
    -BRIDGE_Z_M,
  );
  const s = new THREE.Matrix4().makeScale(S, S, S);
  const anchor = new THREE.Vector3(
    0,
    CANONICAL_168.y - offsetRatio * IPD_CANONICAL,
    CANONICAL_168.z,
  );
  const tAnchor = new THREE.Matrix4().makeTranslation(
    anchor.x,
    anchor.y,
    anchor.z,
  );
  return new THREE.Matrix4().multiplyMatrices(tAnchor, s).multiply(tBridge);
};

// Cheap stable hash for deterministic shuffles.
function hashStr(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return h >>> 0;
}

// Best-effort temple color: average the opaque OUTLINE of the frame artwork
// (the rim), so the drawn temples match the frame instead of a hard-coded tone.
// Returns null when the canvas is tainted or the artwork has too few outline
// pixels — callers fall back to TEMPLE_FALLBACK_COLOR.
function sampleTempleColor(
  src: HTMLImageElement | HTMLCanvasElement,
): string | null {
  try {
    const c = document.createElement("canvas");
    const sw = src instanceof HTMLImageElement ? src.naturalWidth : src.width;
    const sh = src instanceof HTMLImageElement ? src.naturalHeight : src.height;
    const scale = Math.min(1, 200 / Math.max(sw, sh));
    c.width = Math.max(1, Math.round(sw * scale));
    c.height = Math.max(1, Math.round(sh * scale));
    const g = c.getContext("2d");
    if (!g) return null;
    g.drawImage(src, 0, 0, c.width, c.height);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    const alphaAt = (x: number, y: number) => d[(y * c.width + x) * 4 + 3];
    let rs = 0;
    let gs = 0;
    let bs = 0;
    let n = 0;
    for (let y = 1; y < c.height - 1; y++) {
      for (let x = 1; x < c.width - 1; x++) {
        if (alphaAt(x, y) < 80) continue;
        // Any transparent neighbour ⇒ this is an outline pixel (frame rim).
        if (
          alphaAt(x - 1, y) < 30 ||
          alphaAt(x + 1, y) < 30 ||
          alphaAt(x, y - 1) < 30 ||
          alphaAt(x, y + 1) < 30
        ) {
          const i = (y * c.width + x) * 4;
          rs += d[i];
          gs += d[i + 1];
          bs += d[i + 2];
          n++;
        }
      }
    }
    if (n < 10) return null;
    return `rgb(${Math.round(rs / n)},${Math.round(gs / n)},${Math.round(bs / n)})`;
  } catch {
    return null;
  }
}

type StepDef = {
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  done: boolean;
};

function StepsGuide({
  active,
  frameId,
  scaleTouched,
  snapped,
  title,
  steps,
}: {
  active: boolean;
  frameId: string;
  scaleTouched: boolean;
  snapped: boolean;
  title: string;
  steps: StepDef[];
}) {
  const currentIdx = steps.findIndex((s) => !s.done);
  return (
    <div className="mb-10">
      <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground text-center mb-4">
        {title}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isCurrent = i === currentIdx;
          return (
            <div
              key={i}
              className={`relative rounded-2xl border p-4 transition-smooth ${
                s.done
                  ? "border-primary/40 bg-primary/5"
                  : isCurrent
                    ? "border-primary bg-background shadow-soft"
                    : "border-border/60 bg-secondary/30"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium ${
                    s.done
                      ? "bg-primary text-primary-foreground"
                      : isCurrent
                        ? "bg-primary/15 text-primary"
                        : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {s.done ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Step {i + 1}
                </span>
              </div>
              <p className="text-sm font-medium mb-1">{s.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {s.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// One plugin control slider (width / vertical / rotation-follow).
function ParamSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <b className="text-xs font-semibold">
          {format ? format(value) : value}
        </b>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </div>
  );
}

function TryOn() {
  const { t, contentLang } = useI18n();
  const products = useCatalogProducts();
  const search = Route.useSearch();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null); // 2D overlay canvas
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null); // 3D WebGL canvas
  const frameImgRef = useRef<HTMLImageElement | HTMLCanvasElement | null>(null);
  const templeColorRef = useRef<string | null>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const glassesRef = useRef<THREE.Object3D | null>(null);
  const modeRef = useRef<"2d" | "3d">("2d");
  const modelUrlRef = useRef<string | null>(null);
  const paramsRef = useRef(DEFAULT_PARAMS);
  const mirroredRef = useRef(true);

  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [frameId, setFrameId] = useState<string>("");
  const [params, setParams] = useState({ ...DEFAULT_PARAMS });
  const [mirrored, setMirrored] = useState(true);
  const [scaleTouched, setScaleTouched] = useState(false);
  const [snapped, setSnapped] = useState(false);
  const [use3D, setUse3D] = useState(false);

  // The RAF loop self-recurses with the closure created at camera start, so
  // React state read inside it goes stale the moment the loop begins. Mirror
  // the plugin params + mirror flag into refs the loop / snapshot read each
  // frame; otherwise the sliders render but do nothing while running.
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);
  useEffect(() => {
    mirroredRef.current = mirrored;
  }, [mirrored]);

  // Active product comes from ?frame=<slug> (e.g. set by PDP "Try on" link).
  // Falls back to the first catalog product so the page is usable cold.
  const activeProduct = useMemo(() => {
    if (search.frame) {
      const m = products.find((p) => p.slug === search.frame);
      if (m) return m;
    }
    return products[0];
  }, [products, search.frame]);

  // PICK A FRAME = every catalog product that carries a try-on asset (a color
  // with a try-on image or GLB model). One tile per frame, so "try several
  // frames to compare" has real frames to switch between.
  const frameOptions = useMemo(() => {
    return products
      .filter((p) =>
        (p.colors ?? []).some((c) => c.tryonImageUrl || c.tryonModelUrl),
      )
      .map((p) => {
        const c =
          p.colors.find((co) => co.tryonImageUrl || co.tryonModelUrl) ??
          p.colors[0];
        return {
          id: p.id,
          slug: p.slug,
          name: pickLang(p.name, contentLang),
          src: c?.tryonImageUrl ?? c?.images?.[0] ?? "",
        };
      });
  }, [products, contentLang]);

  // COLORWAYS of the active frame — each option swaps the overlay PNG (2D) or
  // GLB model URL (3D).
  const colorOptions = useMemo(() => {
    if (!activeProduct?.colors) return [];
    return activeProduct.colors.map((c) => ({
      id: c.id,
      name: pickLang(c.label, contentLang),
      src: c.tryonImageUrl ?? c.images[0] ?? "",
      hex: c.hex,
      modelUrl: c.tryonModelUrl ?? null,
    }));
  }, [activeProduct, contentLang]);

  // MORE FRAMES = 3 random products other than the active one.
  const moreFrames = useMemo(() => {
    const others = products.filter((p) => p.id !== activeProduct?.id);
    const ordered = others
      .map((p) => ({ p, k: hashStr(p.slug + ":" + products.length) }))
      .sort((a, b) => a.k - b.k)
      .map((x) => x.p);
    return ordered.slice(0, 3);
  }, [products, activeProduct]);

  // Default-select the first color of the active product when it loads/changes.
  useEffect(() => {
    if (colorOptions.length === 0) return;
    if (!colorOptions.some((f) => f.id === frameId)) {
      setFrameId(colorOptions[0].id);
    }
  }, [frameId, colorOptions]);

  // Selected color → GLB model URL (null keeps the 2D PNG overlay path).
  const modelUrl = useMemo(() => {
    const opt = colorOptions.find((f) => f.id === frameId);
    return opt?.modelUrl ?? null;
  }, [colorOptions, frameId]);

  useEffect(() => {
    modelUrlRef.current = modelUrl;
  }, [modelUrl]);

  // Remove the current GLB from the scene and free its GPU resources.
  const disposeGlb = () => {
    if (glassesRef.current && sceneRef.current) {
      sceneRef.current.remove(glassesRef.current);
    }
    if (glassesRef.current) {
      glassesRef.current.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry?.dispose();
          const m = mesh.material as
            | THREE.Material
            | THREE.Material[]
            | undefined;
          (Array.isArray(m) ? m : m ? [m] : []).forEach((mm) => mm.dispose());
        }
      });
      glassesRef.current = null;
    }
  };

  // Lazily create the WebGL renderer / scene / camera once per page. The
  // context lives on the overlay canvas and is reused across sessions, so
  // re-entering 3D mode after stop() doesn't fight a disposed context.
  const ensure3D = () => {
    if (rendererRef.current && sceneRef.current && cameraRef.current)
      return true;
    const canvas = overlayCanvasRef.current;
    if (!canvas) return false;
    try {
      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true, // keep the frame for snapshot()
      });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setPixelRatio(1);
      const scene = new THREE.Scene();
      scene.add(new THREE.AmbientLight(0xffffff, 1.0));
      const key = new THREE.DirectionalLight(0xffffff, 1.8);
      key.position.set(0.4, 0.6, 1);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xffffff, 0.5);
      rim.position.set(-0.5, -0.2, -0.8);
      scene.add(rim);
      // §6 camera: MediaPipe's default projection replayed in three.js —
      // vertical fov 63°, near 1 cm, far 100 m, at the origin looking −Z.
      const camera = new THREE.PerspectiveCamera(CAM_FOV, 1, CAM_NEAR, CAM_FAR);
      camera.position.set(0, 0, 0);
      camera.lookAt(0, 0, -1);
      rendererRef.current = renderer;
      sceneRef.current = scene;
      cameraRef.current = camera;
      return true;
    } catch (e) {
      console.error("WebGL init failed — falling back to 2D overlay", e);
      return false;
    }
  };

  // Switch render path when the selected frame's 3D capability changes.
  useEffect(() => {
    if (!active) return;
    const want3D = !!modelUrl && ensure3D();
    if (want3D && modeRef.current !== "3d") {
      modeRef.current = "3d";
      setUse3D(true);
    } else if (!want3D && modeRef.current !== "2d") {
      modeRef.current = "2d";
      setUse3D(false);
    }
  }, [modelUrl, active]);

  // Load / swap the GLB whenever 3D mode is active and the model URL changes.
  useEffect(() => {
    if (!active || modeRef.current !== "3d" || !use3D) return;
    let cancelled = false;
    disposeGlb();
    if (!modelUrl) return;
    new GLTFLoader()
      .loadAsync(modelUrl)
      .then((gltf) => {
        if (cancelled || modeRef.current !== "3d") return;
        const g = gltf.scene;
        g.visible = false; // revealed by the loop on first face
        sceneRef.current?.add(g);
        glassesRef.current = g;
        // A subtle specular sheen on the frame — flat matte plastic reads dead
        // in a selfie-perspective shot (Zeelool reference PBR).
        g.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (!mesh.isMesh) return;
          const mat = mesh.material as THREE.MeshStandardMaterial;
          if (mat && mat.isMeshStandardMaterial) {
            mat.metalness = 0.1;
            mat.roughness = 0.4;
          }
        });
      })
      .catch((e) => {
        console.error("3D model load failed — falling back to 2D overlay", e);
        modeRef.current = "2d";
        setUse3D(false);
      });
    return () => {
      cancelled = true;
    };
  }, [modelUrl, active, use3D]);

  // Load the frame image whenever the selected frame changes. The offline
  // plugin uses the raw product PNG as-is (transparent lenses), so no
  // flood-fill / alpha-key pass here — matching the plugin's draw() verbatim.
  useEffect(() => {
    const opt = colorOptions.find((f) => f.id === frameId);
    const src = opt?.src ?? FALLBACK_FRAME_SRC;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      frameImgRef.current = img;
      templeColorRef.current = sampleTempleColor(img);
    };
  }, [frameId, colorOptions]);

  const start = async () => {
    setError(null);
    setLoading(true);
    try {
      // Engine files are self-hosted (see @/lib/mediapipe-assets) — no
      // jsdelivr / Google Storage dependency.
      const fileset = await FilesetResolver.forVisionTasks(
        MEDIAPIPE_WASM_BASE,
      );
      const lm = await FaceLandmarker.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath: FACE_LANDMARKER_MODEL,
        },
        runningMode: "VIDEO",
        numFaces: 1,
        outputFacialTransformationMatrixes: true,
      });
      landmarkerRef.current = lm;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 1280, height: 720 },
      });
      streamRef.current = stream;
      const v = videoRef.current!;
      v.srcObject = stream;
      await v.play();
      setActive(true);
      setLoading(false);
      // 3D mode when the selected frame has a GLB model; else 2D PNG overlay.
      if (modelUrlRef.current) {
        const ok = ensure3D();
        modeRef.current = ok ? "3d" : "2d";
        setUse3D(ok);
      } else {
        modeRef.current = "2d";
        setUse3D(false);
      }
      trackCustomerEvent({
        action: "TRYON_REQUEST",
        resourceType: "tryon",
        resourceId: activeProduct?.id ?? frameId,
        meta: { frameSlug: activeProduct?.slug ?? null, colorId: frameId },
      });
      loop();
    } catch (e) {
      console.error(e);
      setError(t("tryon.error"));
      setLoading(false);
      trackCustomerEvent({
        action: "TRYON_FAILED",
        resourceType: "tryon",
        resourceId: activeProduct?.id ?? frameId,
        meta: { frameSlug: activeProduct?.slug ?? null },
      });
    }
  };

  const stop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    const v = videoRef.current;
    if (v) {
      try {
        v.pause();
      } catch {
        /* pause() can reject if no media is loaded — safe to ignore */
      }
      v.srcObject = null;
    }
    const c = canvasRef.current;
    if (c) {
      const ctx = c.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, c.width, c.height);
    }
    disposeGlb();
    if (rendererRef.current) {
      rendererRef.current.clear();
    }
    modeRef.current = "2d";
    setUse3D(false);
    setSnapped(false);
    setScaleTouched(false);
    setError(null);
    setLoading(false);
    setActive(false);
  };

  useEffect(() => () => stop(), []);

  const loop = () => {
    const v = videoRef.current;
    const lm = landmarkerRef.current;
    if (!v || !lm || v.readyState < 2) {
      rafRef.current = requestAnimationFrame(loop);
      return;
    }
    const w = v.videoWidth;
    const h = v.videoHeight;
    const result = lm.detectForVideo(v, performance.now());
    const is3D = modeRef.current === "3d";

    if (is3D) {
      const renderer = rendererRef.current;
      const scene = sceneRef.current;
      const camera = cameraRef.current;
      if (renderer && scene && camera) {
        const aspect = w / h;
        if (
          renderer.domElement.width !== w ||
          renderer.domElement.height !== h ||
          camera.aspect !== aspect
        ) {
          renderer.setSize(w, h, false);
          camera.aspect = aspect;
          camera.updateProjectionMatrix();
        }
        const glasses = glassesRef.current;
        if (glasses) {
          const face = result.faceLandmarks?.[0];
          const tm = result.facialTransformationMatrixes?.[0];
          glasses.visible = !!face;
          if (face && tm) {
            // MediaPipe 0.10.34 exposes Matrix.getPackedData(); 0.10.35+ moved
            // to a plain `data: number[]` (same column-major layout). Accept
            // both so a ^0.10.x npm bump can't silently break the 3D loop.
            const m = tm as unknown as {
              getPackedData?: () => number[];
              data: number[];
            };
            const data = m.getPackedData ? m.getPackedData() : m.data;
            // §6 (verbatim from README):
            //   const mat = new THREE.Matrix4().fromArray(m);
            //   glassesModel.matrixAutoUpdate = false;
            //   glassesModel.matrix.copy(mat).multiply(modelLocalOffset);
            const mat = new THREE.Matrix4().fromArray(data);
            const P = paramsRef.current;
            glasses.matrixAutoUpdate = false;
            glasses.matrix
              .copy(mat)
              .multiply(modelLocalOffset(P.width, P.offset));
          }
        }
        renderer.render(scene, camera);
      }
    } else {
      // --- 2D plugin draw() — verbatim from public/tryon/index.html ---
      const c = canvasRef.current;
      const img = frameImgRef.current;
      if (c && img) {
        if (c.width !== w || c.height !== h) {
          c.width = w;
          c.height = h;
        }
        const ctx = c.getContext("2d")!;
        ctx.clearRect(0, 0, w, h);
        const lmk = result.faceLandmarks?.[0];
        if (lmk) {
          const a = lmk[468];
          const b = lmk[473];
          const pL = a.x < b.x ? a : b;
          const pR = a.x < b.x ? b : a;
          const ex = ((pL.x + pR.x) / 2) * w;
          const ey = ((pL.y + pR.y) / 2) * h;
          const dx = (pR.x - pL.x) * w;
          const dy = (pR.y - pL.y) * h;
          const pd = Math.hypot(dx, dy);
          const roll = Math.atan2(dy, dx);
          const P = paramsRef.current;
          const fw = pd * P.width;
          const fh = (fw * img.height) / img.width;

          // --- Dynamic temples (镜腿架耳): drawn FIRST so the frame layer
          // covers the hinge joint (站主追加需求 2026-10-11). Hinge = the
          // frame's left/right outer edge at 15% above vertical center,
          // rotated by the same θ as the frame. Ear anchors are the MediaPipe
          // tragion points (234 right / 454 left). As the head yaws, the near
          // anchor swings outward and the far one folds back — the projected
          // landmarks already carry the perspective; the yaw ratio only drives
          // a far-side shrink so the far temple reads "going behind the head"
          // instead of a line across the cheek.
          const cy = ey + pd * P.offset;
          const theta = roll * P.rot;
          const cosT = Math.cos(theta);
          const sinT = Math.sin(theta);
          const hly = fh * TEMPLE_HINGE_Y_RATIO;
          const hxL = ex + (-fw / 2) * cosT - hly * sinT;
          const hyL = cy + (-fw / 2) * sinT + hly * cosT;
          const hxR = ex + (fw / 2) * cosT - hly * sinT;
          const hyR = cy + (fw / 2) * sinT + hly * cosT;
          const dR = Math.abs(lmk[EYE_OUTER_R].x - lmk[NOSE_TIP].x) * w;
          const dL = Math.abs(lmk[EYE_OUTER_L].x - lmk[NOSE_TIP].x) * w;
          const yaw = dR + dL > 0 ? (dR - dL) / (dR + dL) : 0; // >0 = head to wearer's left
          const farShrink = Math.max(0.35, 1 - Math.min(Math.abs(yaw), 0.6));
          const eR = { x: lmk[EAR_R].x * w, y: lmk[EAR_R].y * h }; // wearer right ear
          const eL = { x: lmk[EAR_L].x * w, y: lmk[EAR_L].y * h }; // wearer left ear
          ctx.save();
          ctx.lineCap = "round";
          ctx.lineWidth = pd * (P.templeWidthRatio ?? 0.04);
          ctx.strokeStyle = templeColorRef.current ?? TEMPLE_FALLBACK_COLOR;
          // Wearer's right temple: hinge-left → right ear. Near when yaw > 0.
          ctx.beginPath();
          ctx.moveTo(hxL, hyL);
          ctx.lineTo(
            hxL + (eR.x - hxL) * (yaw > 0 ? 1 : farShrink),
            hyL + (eR.y - hyL) * (yaw > 0 ? 1 : farShrink),
          );
          ctx.stroke();
          // Wearer's left temple: hinge-right → left ear. Near when yaw < 0.
          ctx.beginPath();
          ctx.moveTo(hxR, hyR);
          ctx.lineTo(
            hxR + (eL.x - hxR) * (yaw < 0 ? 1 : farShrink),
            hyR + (eL.y - hyR) * (yaw < 0 ? 1 : farShrink),
          );
          ctx.stroke();
          ctx.restore();

          ctx.save();
          // Contact shadow — subtle 2D drop under the frame so it reads as
          // sitting on the face, not floating (站主测试结果修改 2026-10-11).
          ctx.shadowColor = "rgba(0,0,0,0.35)";
          ctx.shadowBlur = w * 0.02;
          ctx.shadowOffsetY = w * 0.008;
          ctx.translate(ex, cy);
          ctx.rotate(theta);
          ctx.drawImage(img, -fw / 2, -fh / 2, fw, fh);
          ctx.restore();
        }
      }
    }
    rafRef.current = requestAnimationFrame(loop);
  };

  const snapshot = () => {
    const c = use3D ? overlayCanvasRef.current : canvasRef.current;
    const v = videoRef.current;
    if (!c || !v) return;
    // Compose the video + overlay on an export canvas. When the stage is
    // mirrored, flip the composite so the PNG matches what the user sees.
    const out = document.createElement("canvas");
    out.width = c.width;
    out.height = c.height;
    const g = out.getContext("2d");
    if (!g) return;
    if (mirroredRef.current) {
      g.translate(out.width, 0);
      g.scale(-1, 1);
    }
    g.drawImage(v, 0, 0, out.width, out.height);
    g.drawImage(c, 0, 0);
    const a = document.createElement("a");
    a.href = out.toDataURL("image/png");
    a.download = `lool-tryon-${Date.now()}.png`;
    a.click();
    setSnapped(true);
    trackCustomerEvent({
      action: "TRYON_SUCCEEDED",
      resourceType: "tryon",
      resourceId: activeProduct?.id ?? frameId,
      meta: {
        frameSlug: activeProduct?.slug ?? null,
        colorId: frameId,
        snapshot: true,
      },
    });
  };

  // Upload a transparent PNG/JPEG and use it as the 2D overlay (plugin
  // loadUpload). Transparent borders are cropped off so the frame sizing math
  // keys off the visible artwork.
  const onUpload = (file: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const g = c.getContext("2d");
      if (!g) {
        frameImgRef.current = img;
        templeColorRef.current = sampleTempleColor(img);
        return;
      }
      g.drawImage(img, 0, 0);
      try {
        const d = g.getImageData(0, 0, c.width, c.height).data;
        let minX = c.width;
        let minY = c.height;
        let maxX = 0;
        let maxY = 0;
        let found = false;
        for (let y = 0; y < c.height; y++) {
          for (let x = 0; x < c.width; x++) {
            if (d[(y * c.width + x) * 4 + 3] > 10) {
              found = true;
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }
        if (found) {
          const cc = document.createElement("canvas");
          cc.width = maxX - minX + 1;
          cc.height = maxY - minY + 1;
          cc.getContext("2d")!.drawImage(
            c,
            minX,
            minY,
            cc.width,
            cc.height,
            0,
            0,
            cc.width,
            cc.height,
          );
          frameImgRef.current = cc;
        } else {
          frameImgRef.current = c;
        }
      } catch {
        frameImgRef.current = c;
      }
      templeColorRef.current = frameImgRef.current
        ? sampleTempleColor(frameImgRef.current)
        : null;
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const touchParams = (next: typeof params) => {
    setParams(next);
    setScaleTouched(true);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <span className="text-xs uppercase tracking-[0.2em] text-primary/70">
          {t("tryon.eyebrow")}
        </span>
        <h1 className="text-4xl font-semibold font-display mt-2">
          {t("tryon.title")}
        </h1>
        <p className="text-muted-foreground mt-3 text-sm max-w-xl mx-auto">
          {t("tryon.tip")}
        </p>
      </div>

      <StepsGuide
        active={active}
        frameId={frameId}
        scaleTouched={scaleTouched}
        snapped={snapped}
        title={t("tryon.steps.title")}
        steps={[
          {
            title: t("tryon.step1.title"),
            desc: t("tryon.step1.desc"),
            icon: Camera,
            done: active,
          },
          {
            title: t("tryon.step2.title"),
            desc: t("tryon.step2.desc"),
            icon: Glasses,
            done: active && !!frameId,
          },
          {
            title: t("tryon.step3.title"),
            desc: t("tryon.step3.desc"),
            icon: Sliders,
            done: active && scaleTouched,
          },
          {
            title: t("tryon.step4.title"),
            desc: t("tryon.step4.desc"),
            icon: ImageDown,
            done: snapped,
          },
        ]}
      />

      <div className="grid lg:grid-cols-[1fr_280px] gap-8">
        {/* Stage: the video element is visible; the overlay canvases (2D PNG or
            transparent WebGL) sit on top. Mirroring is a CSS scaleX(-1) on the
            media elements — the plugin's `.stage.mirror` — applied via the
            `tryon-mirror` utility (see src/styles.css) to the video and both
            canvases together. */}
        <div
          className={`relative rounded-3xl overflow-hidden bg-secondary/40 aspect-video shadow-card ${
            mirrored ? "tryon-mirror" : ""
          }`}
        >
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full object-cover ${use3D ? "hidden" : ""}`}
          />
          <canvas
            ref={overlayCanvasRef}
            className={`absolute inset-0 w-full h-full object-cover ${use3D ? "" : "hidden"}`}
          />
          {!active && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Camera className="w-6 h-6 text-primary" />
              </div>
              <Button
                onClick={start}
                disabled={loading}
                className="rounded-full px-6 h-11 shadow-soft"
              >
                {loading ? t("tryon.loading") : t("tryon.start")}
              </Button>
              {error && (
                <p className="text-xs text-destructive max-w-xs text-center px-4">
                  {error}
                </p>
              )}
            </div>
          )}
          {active && (
            <div className="absolute top-3 right-3 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={snapshot}
                className="rounded-full h-9"
              >
                {t("tryon.snapshot")}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={stop}
                className="rounded-full h-9 w-9 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          {activeProduct && (
            <div className="rounded-xl bg-secondary/30 p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                {t("tryon.eyebrow")}
              </p>
              <Link
                to="/product/$slug"
                params={{ slug: activeProduct.slug }}
                className="text-sm font-medium hover:text-primary transition-smooth"
              >
                {pickLang(activeProduct.name, contentLang)}
              </Link>
              <p className="text-xs text-muted-foreground mt-0.5">
                ${activeProduct.priceUSD}
              </p>
            </div>
          )}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
              {t("tryon.choose")}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {frameOptions.length === 0 ? (
                <p className="col-span-3 text-xs text-muted-foreground text-center py-6">
                  {t("wiz.loading")}
                </p>
              ) : (
                frameOptions.map((f) => (
                  <Link
                    key={f.id}
                    to="/try-on"
                    search={{ frame: f.slug } as never}
                    title={f.name}
                    className={`aspect-square rounded-xl bg-secondary/60 p-2 border-2 transition-smooth ${
                      activeProduct?.slug === f.slug
                        ? "border-primary"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={f.src}
                      alt={f.name}
                      className="w-full h-full object-contain"
                    />
                  </Link>
                ))
              )}
            </div>
            {colorOptions.length > 1 && (
              <div className="mt-4">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                  {t("pdp.color")}
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {colorOptions.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setFrameId(c.id)}
                      title={c.name}
                      className={`aspect-square rounded-xl bg-secondary/60 p-2 border-2 transition-smooth ${
                        frameId === c.id
                          ? "border-primary"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={c.src}
                        alt={c.name}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Upload chip — plugin's loadUpload. Replaces the current overlay
                PNG with the user's own transparent artwork. */}
            <label className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 py-2.5 text-xs font-medium text-muted-foreground hover:text-primary hover:border-primary/60 transition-smooth cursor-pointer">
              <Upload className="w-4 h-4" />
              {t("tryon.upload")}
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(e) => onUpload(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          {/* The plugin's three fit controls — same ranges, defaults, step. */}
          <div className="space-y-4">
            <ParamSlider
              label={t("tryon.scale")}
              value={params.width}
              min={WIDTH_MIN}
              max={WIDTH_MAX}
              step={WIDTH_STEP}
              format={(v) => v.toFixed(2)}
              onChange={(v) => touchParams({ ...params, width: v })}
            />
            <ParamSlider
              label={t("tryon.vertical")}
              value={params.offset}
              min={OFFSET_MIN}
              max={OFFSET_MAX}
              step={OFFSET_STEP}
              format={(v) => v.toFixed(2)}
              onChange={(v) => touchParams({ ...params, offset: v })}
            />
            <ParamSlider
              label={t("tryon.rotate")}
              value={params.rot}
              min={ROT_MIN}
              max={ROT_MAX}
              step={ROT_STEP}
              format={(v) => v.toFixed(2)}
              onChange={(v) => touchParams({ ...params, rot: v })}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setMirrored((m) => !m)}
              className="w-full rounded-full"
            >
              <FlipHorizontal2 className="w-4 h-4" />
              {t("tryon.mirror")}
            </Button>
          </div>

          <div className="rounded-xl bg-secondary/40 p-4 text-xs text-muted-foreground leading-relaxed">
            {t("tryon.helperTip")}
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
              {t("tryon.more")}
            </h3>
            <div className="space-y-2">
              {moreFrames.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  …
                </p>
              ) : (
                moreFrames.map((p) => (
                  <Link
                    key={p.id}
                    to="/try-on"
                    search={{ frame: p.slug } as never}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/40 transition-smooth"
                  >
                    <div className="w-12 h-12 rounded-md bg-secondary flex-shrink-0">
                      <img
                        src={p.colors?.[0]?.images[0] ?? p.framePng}
                        alt=""
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">
                        {pickLang(p.name, contentLang)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ${p.priceUSD}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
