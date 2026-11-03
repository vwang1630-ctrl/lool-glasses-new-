# loollook 虚拟试戴（Virtual Try-On）— 全量代码与内容交付

> 更新至 **2026-10-09**。本文档是 3D/2D 虚拟试戴的**唯一完整交付物**：数据层（D1 + R2）+ 全部代码（路由、渲染循环、API、loader、migration）+ 页面文案（i18n）+ 真跟踪需求逻辑（已合流，含关键批注）+ 部署与验证清单。
>
> 线上入口：
>
> - 3D 款：`https://loollook.com/en/try-on?frame=lool-tr90-square`
> - 2D 款：`https://loollook.com/en/try-on?frame=lool-8663`

---

## 0. 一页总结（当前线上状态）

| 项          | 状态                                                                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 3D 渲染     | **已上线且是真跟踪**（MediaPipe `outputFacialTransformationMatrixes` + 每帧 `detectForVideo` + 4×4 矩阵驱动朝向 + 瞳孔 landmark 锚点定位） |
| 3D 唯一款式 | `lool-tr90-square` / 颜色 `havana` → GLB `https://loollook.com/images/frames-3d/lool-tr90-square.glb`（456,920 字节，gltfpack 压缩版）     |
| 2D 回退     | `lool-8663`（6 色）无 GLB → 走 PNG overlay 2D 路径                                                                                         |
| 帧选择器    | 已打通跨款式切换（`?frame=<slug>`，两款式各一个 tile）                                                                                     |
| 贴合规则    | `FRAME_WIDTH_RATIO=1.85`、锚点=瞳孔中点 468/473、`FRAME_Y_OFFSET_RATIO=-0.02`                                                              |
| 遮挡器      | 隐形头型椭球（`SphereGeometry` + `colorWrite:false depthWrite:true`）已部署                                                                |
| 平滑        | 位置 lerp `POSITION_SMOOTHING=0.25` + 朝向 slerp `ROTATION_SMOOTHING=0.6`                                                                  |
| 假跟踪争议  | 假 `setInterval(Math.sin)` 只在旧参考 HTML 里，**从未进线上**（证据见 §5）                                                                 |

---

## 1. 架构与数据流

```
浏览器（/en/try-on?frame=<slug>）
   │
   ├─ 数据管线（选款）
   │    D1 product_colors.tryon_model_url / tryon_image_url
   │        │
   │        ▼
   │    /api/catalog  (GET) ──┐
   │    src/server/catalog-loader.ts（SSR loader，同 SQL）──┤
   │                        ▼                              │
   │    CatalogProduct.colors[].tryonModelUrl / tryonImageUrl
   │
   ├─ 资源管线（渲染）
   │    R2 PRODUCTS_BUCKET: frames-3d/lool-tr90-square.glb（3D）
   │    R2 PRODUCTS_BUCKET: images/product/*.jpg（2D overlay PNG）
   │        │
   │        ▼
   │    /images/frames-3d/$  (serveR2Image, immutable cache)
   │
   └─ 试戴会话（客户端）
         video ← getUserMedia({facingMode:'user', 1280×720})
         FaceLandmarker (MediaPipe tasks-vision 0.10.34, VIDEO 模式)
             │ 每帧 detectForVideo(video, performance.now())
             ├─ faceLandmarks[0]  → 468/473 瞳孔中点 → 位置锚点
             │                       33/263 外眼角   → 瞳距 eyeDist → 缩放
             ├─ facialTransformationMatrixes[0] → 4×4 矩阵 → 朝向
             └─ 渲染：
                  2D → canvas 2D，镜像视频 + rotate(frameW) + alpha-key overlay
                  3D → three.js WebGL（正交像素世界，视频作背景 plane，
                       隐形遮挡器写深度，GLB 眼镜实体）→ overlayCanvas
```

**3D 世界坐标约定（关键，勿改）**

- 视频画面按**镜像自拍**处理：`p_world = (W−x, H−y)`。镜像烘焙进矩阵 `WM`（`we[0..]=-e[0..]`，平移列 `we[12]=w−e[12]`）。
- 最终朝向矩阵 `FINAL = WM × FACE_ALIGN`，`FACE_ALIGN = Rz(π)`（净效果≈单位阵，保留 GLB 出厂朝向——镜片朝相机、镜腿朝后，已在几何层面实测）。
- 正交相机像素空间：`left=0, right=w, top=h, bottom=0`，`near/far = ±5000`（曾因 ±100 把镜片/镜腿裁掉，只剩铰链）。
- 背景视频 plane 停在 `z=−2000`（在眼镜 Z 跨度之后）。
- **位置不用矩阵平移**：MediaPipe 矩阵平移列是规范 face-model 单位、不是像素；位置一律用瞳孔 landmark 468/473 像素锚点（任务 #79 治"定角"的关键）。

---

## 2. 数据层

### 2.1 D1 schema — `migrations/0086_tryon_model_url.sql`

```sql
-- Virtual Try-On 3D upgrade (WO-20261008-02): per-color optional GLB model
-- path for the 3D try-on renderer. NULL keeps the legacy 2D PNG fallback
-- (tryon_image_url / images[0]) fully intact — 3D only activates when a
-- model is present AND loads successfully.
ALTER TABLE product_colors ADD COLUMN tryon_model_url TEXT;
```

### 2.2 线上数据现状（2026-10-09 实测 `/api/catalog`）

| 款式                                    | 颜色                                                                 | `tryonImageUrl`                                     | `tryonModelUrl`                          | 试戴模式       |
| --------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------- | ---------------------------------------- | -------------- |
| `lool-8663` (Vintage Round Boston Oval) | black / gray / transparent / hawksbill / tea-stripes / green（6 色） | `/images/product/*.jpg`（各自）                     | `NULL`                                   | **2D** overlay |
| `lool-tr90-square` (TR90 Square)        | havana `#6B4A32`                                                     | `/images/product/tr90-square-reading-glasses-1.jpg` | `/images/frames-3d/lool-tr90-square.glb` | **3D** WebGL   |

回填命令（任务 #78，用 `wrangler d1 execute` 直接写，非 migration）：

```bash
wrangler d1 execute lool-work --remote \
  --command "UPDATE product_colors SET tryon_model_url = 'https://loollook.com/images/frames-3d/lool-tr90-square.glb' WHERE color_id = 'havana'"
```

### 2.3 R2 GLB 资产

- 位置：`PRODUCTS_BUCKET`（R2）→ `frames-3d/lool-tr90-square.glb`
- 大小：**456,920 字节**；来源 = 站主上传的 `textured_*.glb`（18.2 MB）经 **gltfpack** 压缩。
- 朝向：Y-up，+Z 面朝相机；镜片几何**镂空**（眼可通过镂空透出，无需半透明材质）。
- 尺寸：宽 0.145 m（X），高 0.0444 m（Y）→ 常量 `MODEL_WIDTH_M=0.145`、`MODEL_HEIGHT_M=0.0444`。
- 投放新 3D 款的 SOP：GLB（Y-up, +Z 面）gltfpack 压缩 <500KB → 上传 `frames-3d/` → D1 回填 `tryon_model_url` → 若原始尺寸≠0.145×0.0444 更新常量 → 部署。

---

## 3. 全部代码

### 3.1 试戴页主路由 `src/routes/$lang/try-on.tsx`（1,066 行 · 完整）

```tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { pickLang } from "@/lib/lang";
import { FRAME_PNGS } from "@/data/products";
import { useCatalogProducts } from "@/lib/use-catalog-products";
import { Button } from "@/components/ui/button";
import { Camera, X, Check, Sliders, ImageDown, Glasses } from "lucide-react";
import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { trackCustomerEvent } from "@/lib/customer-audit";

interface TryOnSearch {
  frame?: string;
}

export const Route = createFileRoute("/$lang/try-on")({
  head: () => ({ meta: [{ title: "lool — Virtual Try-On" }] }),
  validateSearch: (s: Record<string, unknown>): TryOnSearch => ({
    frame: typeof s.frame === "string" ? s.frame : undefined,
  }),
  component: TryOn,
});

// Frame picker is now driven by the live catalog (see useCatalogProducts).
// Static FRAME_PNGS retained as a last-resort fallback if catalog hasn't
// loaded yet.
const FALLBACK_FRAME_SRC = FRAME_PNGS.tortoise;

// --- 3D try-on constants (tunable) ---
// The GLB model in /images/frames-3d/ is authored with its width along X and
// height along Y (lool-tr90-square: X 0.145m, Y 0.0444m). These meters are
// turned into screen pixels by matching the rendered frame width to 1.85× the
// (mirrored) eye distance — the same fit rule as the 2D overlay. (2.15 read as
// visibly oversized on a real face; 1.85 keeps the frame within the head width
// while leaving the slider to fine-tune.)
const MODEL_WIDTH_M = 0.145;
const MODEL_HEIGHT_M = 0.0444;
const FRAME_WIDTH_RATIO = 1.85;
// Anchor offset relative to the pupil midpoint, in fractions of frame height.
// −2% lifts the frame center a hair above the eye line so the lens optical
// centers sit on the pupils (world −Y is up in the 3D scene; canvas −Y is up
// in the 2D overlay, both read the same −0.02).
const FRAME_Y_OFFSET_RATIO = -0.02;
// Alignment from GLB local axes onto the MediaPipe canonical face model.
// Verified against the GLB geometry (lool-tr90-square): the frame's front
// (lens plane + bridge) faces +Z and +Y is up. The mirror+flip world transform
// (WM) alone reads as a net Rz(180°), so cancelling it with Rz(180°) leaves the
// frame in its authored orientation — front toward the camera, upright.
const FACE_ALIGN = new THREE.Matrix4().makeRotationZ(Math.PI);
// Some MediaPipe builds return the packed matrix row-major. Flip to true if
// the glasses' orientation is transposed (rotation looks inverted).
const TRANSPOSE_MATRIX = false;
// Ground the in-plane roll to the detected eye line each frame. Guards against
// a systematic tilt error in the matrix convention while leaving yaw/pitch
// (the head-turn test) driven by the raw matrix.
const ROLL_CORRECT = true;
// Quaternion smoothing (0 = raw matrix, 1 = frozen). 0.6 keeps temples tracking
// head turns while removing most frame-to-frame jitter.
const ROTATION_SMOOTHING = 0.6;
// Position smoothing (0 = raw landmarks, 1 = frozen). The landmark anchor hops
// a few pixels between frames; lerping the anchor toward the raw target each
// frame removes that jitter — the adaptive-smoothing pair (position lerp +
// rotation slerp) from the occluder reference build.
const POSITION_SMOOTHING = 0.25;
// Invisible face-volume occluder (alperenuzun/basic-virtual-tryon-glasses): a
// head-sized ellipsoid writes depth before the glasses render, so temple arms
// that swing behind the head on a turn get depth-culled instead of drawing
// over the nose/cheek. Radius is a fraction of the (outer-canthus) eyeDist;
// 0.7 leaves the temple tips (|X| ≈ 0.79×eyeDist at default scale) outside its
// silhouette at frontal view — so the two temple arms still show — while a
// turned far-side temple projects into the silhouette and disappears behind it.
const OCC_HEAD_RATIO = 0.7;
// Lens-plane clearance, as a fraction of the occluder radius: the ellipsoid is
// parked with its front surface 0.2×rx behind the glasses origin, i.e. safely
// behind the frame front (z ≈ +0.93×eyeDist) but well in front of the temple
// tips (z ≈ −1.0×eyeDist), so it never hides the frame itself.
const OCC_FRONT_GAP = 0.2;
// The GLB is authored with geometric lens openings, so the eyes already show
// through the lens plane in a fully opaque render — no per-material see-through
// pass needed (kept as the single material for correct rim culling).

// Cheap stable hash for deterministic shuffles.
function hashStr(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return h >>> 0;
}

type StepDef = {
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  done: boolean;
};

function StepsGuide({
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

function TryOn() {
  const { t, contentLang } = useI18n();
  const products = useCatalogProducts();
  const search = Route.useSearch();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameImgRef = useRef<HTMLImageElement | null>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const glassesRef = useRef<THREE.Object3D | null>(null);
  const lastQuatRef = useRef<THREE.Quaternion | null>(null);
  const hadFaceRef = useRef(false);
  const modeRef = useRef<"2d" | "3d">("2d");
  const modelUrlRef = useRef<string | null>(null);
  const scaleRef = useRef(1);
  const bgRef = useRef<THREE.Mesh | null>(null);
  const occluderRef = useRef<THREE.Mesh | null>(null);
  const smoothPosRef = useRef<THREE.Vector3 | null>(null);

  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [frameId, setFrameId] = useState<string>("");
  const [scale, setScale] = useState(1);
  const [scaleTouched, setScaleTouched] = useState(false);
  const [snapped, setSnapped] = useState(false);
  const [use3D, setUse3D] = useState(false);

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
  // frames to compare" has real frames to switch between — clicking a tile
  // navigates to `?frame=<slug>` and swaps the whole product.
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

  // COLORWAYS of the active frame, shown as a secondary swatch row under the
  // frame picker. Each option swaps the overlay PNG (2D) or GLB (3D).
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

  // MORE FRAMES = 3 random products other than the active one. Stable per
  // catalog snapshot (random seed = catalog length) so navigating doesn't
  // re-shuffle wildly between renders.
  const moreFrames = useMemo(() => {
    const others = products.filter((p) => p.id !== activeProduct?.id);
    // deterministic shuffle: seeded sort by hash(slug) % length
    const ordered = others
      .map((p) => ({ p, k: hashStr(p.slug + ":" + products.length) }))
      .sort((a, b) => a.k - b.k)
      .map((x) => x.p);
    return ordered.slice(0, 3);
  }, [products, activeProduct]);

  // Default-select the first color of the active product when it loads or changes.
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

  // The RAF loop self-recurses with the closure it was created in (camera
  // start), so React state read inside it goes stale the moment the loop
  // begins. Mirror scale into a ref the loop reads each frame; otherwise the
  // size slider renders but does nothing while the camera is running.
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

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

  // Lazily create the WebGL renderer / scene / ortho camera once per page.
  // The context lives on the overlay canvas and is reused across sessions, so
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
        preserveDrawingBuffer: true,
      });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setPixelRatio(1);
      // The depth-culling occluder needs a fixed render order (video bg →
      // occluder → glasses), so disable the renderer's depth-based opaque
      // sorting and rely on scene add order instead.
      renderer.sortObjects = false;
      const scene = new THREE.Scene();
      scene.add(new THREE.AmbientLight(0xffffff, 1.0));
      const key = new THREE.DirectionalLight(0xffffff, 1.8);
      key.position.set(0.4, 0.6, 1);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xffffff, 0.5);
      rim.position.set(-0.5, -0.2, -0.8);
      scene.add(rim);
      // Wide near/far: the GLB's temples extend ~±0.08 model units in Z, which
      // after the frameW-scale (≈250px here, more on real cameras) reaches
      // hundreds of px from the frame center. The old ±100 near/far clipped the
      // lens plane and temple tips, leaving only the hinge bars visible.
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -5000, 5000);
      camera.position.set(0, 0, 10);
      camera.lookAt(0, 0, 0);
      // Mirrored video background: raw camera frames are sampled with a negative
      // U-repeat so the scene reads as a mirror (the glasses world is mirrored),
      // and VideoTexture refreshes itself on every render. Rendering the video
      // inside the scene also makes snapshot() capture the full composite.
      const v = videoRef.current;
      if (v) {
        const bg = new THREE.Mesh(
          new THREE.PlaneGeometry(1, 1),
          new THREE.MeshBasicMaterial({
            map: new THREE.VideoTexture(v),
            side: THREE.DoubleSide,
          }),
        );
        const bgTex = (bg.material as THREE.MeshBasicMaterial)
          .map as THREE.VideoTexture;
        bgTex.colorSpace = THREE.SRGBColorSpace;
        bgTex.repeat.set(-1, 1);
        bgTex.offset.set(1, 0);
        // Park the video plane well behind the glasses' Z span (−5000 camera far
        // plane) so the temples render in front of it instead of being occluded.
        bg.position.set(0, 0, -2000);
        scene.add(bg);
        bgRef.current = bg;
      }
      // Invisible face-volume occluder. With sortObjects off the scene add
      // order IS the render order, so this mesh (added right after the video
      // bg, before the glasses) writes depth in between: the glasses depth-test
      // against it and lose wherever the head sits in front of them — temple
      // arms get culled behind the face on a turn. Sized/oriented each frame.
      const occGeo = new THREE.SphereGeometry(1, 12, 12);
      const occMat = new THREE.MeshBasicMaterial({
        colorWrite: false,
        depthWrite: true,
        depthTest: true,
      });
      const occ = new THREE.Mesh(occGeo, occMat);
      occ.visible = false;
      scene.add(occ);
      occluderRef.current = occ;
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

  // Load frame image whenever the selected frame changes. Our placeholder
  // PNGs have opaque white where the lenses are (product-photo "demo lenses"),
  // so we alpha-key near-white pixels to transparent before using as overlay.
  useEffect(() => {
    const opt = colorOptions.find((f) => f.id === frameId);
    const src = opt?.src ?? FALLBACK_FRAME_SRC;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctxOff = canvas.getContext("2d");
        if (!ctxOff) {
          frameImgRef.current = img;
          return;
        }
        ctxOff.drawImage(img, 0, 0);
        const data = ctxOff.getImageData(0, 0, canvas.width, canvas.height);
        const px = data.data;
        const W = canvas.width;
        const H = canvas.height;

        // Flood-fill alpha-key from each lens center. Any pixel connected to
        // the lens center via "light" pixels (lum > LUM_THRESH) gets alpha=0.
        // The dark frame rim acts as a barrier, so this also wipes out
        // temple-tip artifacts that were drawn behind the lens "shine".
        const LUM_THRESH = 90;
        const visited = new Uint8Array(W * H);
        const stack: number[] = [];
        const seed = (xPct: number, yPct: number) => {
          const cx0 = Math.floor(W * xPct);
          const cy0 = Math.floor(H * yPct);
          // Search a small box around the expected center for a light pixel.
          for (let dy = -20; dy <= 20; dy += 4) {
            for (let dx = -20; dx <= 20; dx += 4) {
              const x = cx0 + dx;
              const y = cy0 + dy;
              if (x < 0 || x >= W || y < 0 || y >= H) continue;
              const idx = y * W + x;
              const pi = idx * 4;
              const lum = (px[pi] + px[pi + 1] + px[pi + 2]) / 3;
              if (lum > LUM_THRESH && !visited[idx]) {
                visited[idx] = 1;
                stack.push(idx);
                return;
              }
            }
          }
        };
        seed(0.27, 0.5);
        seed(0.73, 0.5);

        while (stack.length > 0) {
          const idx = stack.pop()!;
          const pi = idx * 4;
          const lum = (px[pi] + px[pi + 1] + px[pi + 2]) / 3;
          if (lum < LUM_THRESH) continue;
          px[pi + 3] = 0;
          const y = Math.floor(idx / W);
          const x = idx % W;
          if (x > 0) {
            const ni = idx - 1;
            if (!visited[ni]) {
              visited[ni] = 1;
              stack.push(ni);
            }
          }
          if (x < W - 1) {
            const ni = idx + 1;
            if (!visited[ni]) {
              visited[ni] = 1;
              stack.push(ni);
            }
          }
          if (y > 0) {
            const ni = idx - W;
            if (!visited[ni]) {
              visited[ni] = 1;
              stack.push(ni);
            }
          }
          if (y < H - 1) {
            const ni = idx + W;
            if (!visited[ni]) {
              visited[ni] = 1;
              stack.push(ni);
            }
          }
        }

        // Morphological "thinning of opaque" passes: thin opaque structures
        // (≤ ~5px wide) surrounded by transparent space are temple-tip outline
        // residue still inside the lens area. The rim has solid frame body on
        // its outside, so only its inside edge sees transparent — that's 1 hit
        // out of 4, below threshold. Safe.
        const REACH = 5;
        const MIN_HITS = 3;
        for (let pass = 0; pass < 3; pass++) {
          const toClear: number[] = [];
          for (let y = 0; y < H; y++) {
            for (let x = 0; x < W; x++) {
              const idx = y * W + x;
              if (px[idx * 4 + 3] === 0) continue;
              let hits = 0;
              if (x - REACH >= 0 && px[(y * W + (x - REACH)) * 4 + 3] === 0)
                hits++;
              if (x + REACH < W && px[(y * W + (x + REACH)) * 4 + 3] === 0)
                hits++;
              if (y - REACH >= 0 && px[((y - REACH) * W + x) * 4 + 3] === 0)
                hits++;
              if (y + REACH < H && px[((y + REACH) * W + x) * 4 + 3] === 0)
                hits++;
              if (hits >= MIN_HITS) toClear.push(idx);
            }
          }
          if (toClear.length === 0) break;
          for (const idx of toClear) px[idx * 4 + 3] = 0;
        }

        ctxOff.putImageData(data, 0, 0);
        const processed = new Image();
        processed.src = canvas.toDataURL();
        processed.onload = () => {
          frameImgRef.current = processed;
        };
      } catch {
        // CORS or other failure → fall back to raw image
        frameImgRef.current = img;
      }
    };
  }, [frameId, colorOptions]);

  const start = async () => {
    setError(null);
    setLoading(true);
    try {
      const fileset = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm",
      );
      const lm = await FaceLandmarker.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
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
      // modelUrlRef is kept in sync by an effect so frame switches mid-session
      // also flip modes (see the modelUrl effect below).
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
    // Detach the video element from the stream and clear the canvas so closing
    // doesn't leave the last camera frame frozen on screen.
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
    // Tear down the 3D scene. The renderer keeps its WebGL context on the
    // overlay canvas and is reused if the user restarts into 3D mode.
    disposeGlb();
    if (rendererRef.current) {
      rendererRef.current.clear();
    }
    lastQuatRef.current = null;
    hadFaceRef.current = false;
    modeRef.current = "2d";
    setUse3D(false);
    // Reset transient session state so reopening the page is a fresh start.
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
      const glasses = glassesRef.current;
      if (renderer && scene && camera) {
        if (
          renderer.domElement.width !== w ||
          renderer.domElement.height !== h
        ) {
          renderer.setSize(w, h, false);
          camera.left = 0;
          camera.right = w;
          camera.top = h;
          camera.bottom = 0;
          camera.updateProjectionMatrix();
          if (bgRef.current) {
            bgRef.current.scale.set(w, h, 1);
            bgRef.current.position.set(w / 2, h / 2, -2000);
          }
        }
        if (glasses) {
          const face = result.faceLandmarks?.[0];
          const tm = result.facialTransformationMatrixes?.[0];
          glasses.visible = !!face;
          if (occluderRef.current)
            occluderRef.current.visible = glasses.visible;
          if (face && tm) {
            // MediaPipe 0.10.34 exposes Matrix.getPackedData(); 0.10.35+ moved to
            // a plain `data: number[]` (same column-major layout). Accept both so
            // a ^0.10.x npm bump can't silently break the 3D loop.
            const m = tm as unknown as {
              getPackedData?: () => number[];
              data: number[];
            };
            const data = m.getPackedData ? m.getPackedData() : m.data;
            const M = new THREE.Matrix4().fromArray(data);
            if (TRANSPOSE_MATRIX) M.transpose();
            const e = M.elements;
            // Mirrored selfie world: x → W−x, y → H−y (y-up). Bake the mirror
            // and the y-flip into the raw face matrix so the glasses track the
            // head, then align GLB axes onto the canonical face via FACE_ALIGN.
            const WM = new THREE.Matrix4();
            const we = WM.elements;
            we[0] = -e[0];
            we[1] = -e[1];
            we[2] = e[2];
            we[4] = -e[4];
            we[5] = -e[5];
            we[6] = e[6];
            we[8] = -e[8];
            we[9] = -e[9];
            we[10] = e[10];
            we[12] = w - e[12];
            we[13] = h - e[13];
            we[14] = e[14];
            we[15] = 1;
            const FINAL = new THREE.Matrix4().multiplyMatrices(WM, FACE_ALIGN);

            // Landmark indices: 33 right eye outer, 263 left eye outer.
            const r = face[33];
            const l = face[263];
            const dx = (1 - l.x) * w - (1 - r.x) * w;
            const dy = l.y * h - r.y * h;
            const eyeDist = Math.hypot(dx, dy);
            // Same fit rule as 2D: rendered frame width = 2.15× eye distance.
            const frameW = eyeDist * FRAME_WIDTH_RATIO * scaleRef.current;
            const frameH = frameW * (MODEL_HEIGHT_M / MODEL_WIDTH_M);
            glasses.scale.setScalar(frameW / MODEL_WIDTH_M);

            // Anchor the frame center on the pupil midpoint — iris landmarks
            // 468/473 — so the lenses sit on the eyes instead of floating on
            // the brow line (the old nose-bridge-top anchor 168 pushed the top
            // rim up onto the forehead). MediaPipe's matrix translation is in
            // canonical face-model units, not pixels, so the landmark is the
            // reliable source for where the glasses sit on the face.
            const pR = face[468];
            const pL = face[473];
            const px = (1 - (pR.x + pL.x) / 2) * w;
            const py = ((pR.y + pL.y) / 2) * h;
            const pos = new THREE.Vector3(
              px,
              h - (py + frameH * FRAME_Y_OFFSET_RATIO),
              0,
            );
            // Adaptive position smoothing: ease the anchor toward the raw
            // landmark target (lerp) so frame-to-frame landmark noise doesn't
            // shake the frame. Snap on the first face of a session so the frame
            // doesn't swoop in from offscreen.
            if (smoothPosRef.current) {
              smoothPosRef.current.lerp(pos, POSITION_SMOOTHING);
              glasses.position.copy(smoothPosRef.current);
            } else {
              smoothPosRef.current = pos.clone();
              glasses.position.copy(pos);
            }

            const q = new THREE.Quaternion().setFromRotationMatrix(FINAL);
            if (ROLL_CORRECT) {
              // Ground the in-plane roll to the detected eye line so the frame
              // sits level even if the matrix convention is off on that axis.
              const dirX = new THREE.Vector3(1, 0, 0).applyQuaternion(q);
              const rollMatrix = Math.atan2(dirX.y, dirX.x);
              const rollLandmark = Math.atan2(-(l.y - r.y) * h, dx);
              let delta = rollLandmark - rollMatrix;
              // Keep the frame's own chirality: only correct within ±90°.
              while (delta > Math.PI / 2) delta -= Math.PI;
              while (delta < -Math.PI / 2) delta += Math.PI;
              q.premultiply(
                new THREE.Quaternion().setFromAxisAngle(
                  new THREE.Vector3(0, 0, 1),
                  delta,
                ),
              );
            }
            if (lastQuatRef.current) {
              q.slerp(lastQuatRef.current, 1 - ROTATION_SMOOTHING);
            } else {
              lastQuatRef.current = new THREE.Quaternion();
            }
            lastQuatRef.current.copy(q);
            glasses.quaternion.copy(q);
            // Occluder: head-sized ellipsoid parked just behind the lens plane,
            // rotated with the face. Its depth surface culls the far-side temple
            // when a head turn swings it behind the head. Sized by eyeDist (head
            // size), not the frame scale, so the slider only grows the frame.
            const occ = occluderRef.current;
            if (occ) {
              const rx = eyeDist * OCC_HEAD_RATIO;
              occ.position.set(
                glasses.position.x,
                glasses.position.y,
                -rx * (OCC_FRONT_GAP + 0.6),
              );
              occ.quaternion.copy(q);
              occ.scale.set(rx, rx * 1.3, rx * 0.6);
            }
            hadFaceRef.current = true;
          } else {
            // Reset the smoothing anchors when the face drops so we don't
            // lerp/slerp from a stale pose after a few lost frames.
            if (hadFaceRef.current) lastQuatRef.current = null;
            smoothPosRef.current = null;
            hadFaceRef.current = false;
          }
        }
        renderer.render(scene, camera);
      }
    } else {
      const c = canvasRef.current;
      if (c) {
        if (c.width !== w || c.height !== h) {
          c.width = w;
          c.height = h;
        }
        const ctx = c.getContext("2d")!;
        // mirror video
        ctx.save();
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(v, 0, 0, w, h);
        ctx.restore();

        if (result.faceLandmarks?.[0] && frameImgRef.current) {
          const lmk = result.faceLandmarks[0];
          // landmark indices: 33 right eye outer, 263 left eye outer, 468/473 iris centers
          const r = lmk[33],
            l = lmk[263],
            pR = lmk[468],
            pL = lmk[473];
          const rx = (1 - r.x) * w; // mirrored
          const ry = r.y * h;
          const lx = (1 - l.x) * w;
          const ly = l.y * h;
          const nx = (1 - (pR.x + pL.x) / 2) * w;
          const ny = ((pR.y + pL.y) / 2) * h;
          const dx = lx - rx;
          const dy = ly - ry;
          const eyeDist = Math.hypot(dx, dy);
          const angle = Math.atan2(dy, dx);
          const img = frameImgRef.current;
          const frameW = eyeDist * FRAME_WIDTH_RATIO * scaleRef.current;
          const frameH = frameW * (img.height / img.width);
          // Center the frame on the pupil midpoint (iris landmarks 468/473) so
          // the lenses line up with the eyes instead of floating on the brow.
          ctx.save();
          ctx.translate(nx, ny + frameH * FRAME_Y_OFFSET_RATIO);
          ctx.rotate(angle);
          // Flip the frame vertically to correct the upside-down rendering observed
          // when overlaying these top-down product photos onto a face viewed from
          // a slightly-below-camera angle (laptop webcam).
          ctx.scale(1, -1);
          ctx.drawImage(img, -frameW / 2, -frameH / 2, frameW, frameH);
          ctx.restore();
        }
      }
    }
    rafRef.current = requestAnimationFrame(loop);
  };

  const snapshot = () => {
    const c = use3D ? overlayCanvasRef.current : canvasRef.current;
    if (!c) return;
    const a = document.createElement("a");
    a.href = c.toDataURL("image/png");
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
        <div className="relative rounded-3xl overflow-hidden bg-secondary/40 aspect-[4/3] shadow-card">
          <video ref={videoRef} className="hidden" playsInline muted />
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
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
              {t("tryon.scale")}
            </h3>
            <input
              type="range"
              min="0.7"
              max="1.4"
              step="0.02"
              value={scale}
              onChange={(e) => {
                setScale(Number(e.target.value));
                setScaleTouched(true);
              }}
              className="w-full accent-primary"
            />
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
```

### 3.2 GLB 静态路由 `src/routes/images/frames-3d/$.ts`（R2 出口）

```ts
// GET /images/frames-3d/<file> — public R2 origin for 3D try-on GLB models.
// Mirrors /images/frames/<file> but serves from the `frames-3d/` R2 prefix.
import { createFileRoute } from "@tanstack/react-router";
import { serveR2Image } from "@/server/serve-r2-image";

export const Route = createFileRoute("/images/frames-3d/$")({
  server: {
    handlers: {
      GET: async ({ params }) =>
        serveR2Image(`frames-3d/${params._splat ?? ""}`),
    },
  },
});
```

### 3.3 R2 处理器 `src/server/serve-r2-image.ts`

```ts
// Shared handler for public R2 image routes. Each /images/<prefix>/<file> route
// resolves to the same PRODUCTS_BUCKET object keyed `<prefix>/<file>`, plus the
// legacy /api/admin/r2/<key> internal alias. Immutable, cacheable, public-read.
import { env } from "cloudflare:workers";

export async function serveR2Image(key: string): Promise<Response> {
  if (!key) return new Response("not found", { status: 404 });

  const bucket = (env as unknown as { PRODUCTS_BUCKET?: R2Bucket })
    .PRODUCTS_BUCKET;
  if (!bucket) return new Response("r2_binding_missing", { status: 500 });

  const obj = await bucket.get(key);
  if (!obj) return new Response("not found", { status: 404 });

  const headers = new Headers();
  const ct = obj.httpMetadata?.contentType ?? "application/octet-stream";
  headers.set("Content-Type", ct);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  if (obj.etag) headers.set("ETag", obj.etag);

  return new Response(obj.body, { headers });
}
```

### 3.4 Catalog API `src/routes/api/catalog.ts`（`tryonModelUrl` 关键处）

```ts
// GET /api/catalog
// Returns the storefront product catalog: products + their color variants +
// a flat lens-SKU summary. Schema is v3 (lens_brands + lens_skus + suppliers).
// The wizard pulls richer lens metadata from /api/lens/skus separately.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { parseLangJson } from "@/lib/lang";

type ProductRow = {
  id: string;
  slug: string;
  product_kind: "eyeglasses" | "sunglasses" | "accessory";
  categories_json: string | null;
  styles_json: string | null;
  material: string | null;
  finish: string | null;
  shape: string | null;
  genders_json: string | null;
  name_json: string | null;
  price_cents: number;
  original_price_cents: number | null;
  weight_g: number | null;
  rating: number;
  review_count: number;
  review_quality: number;
  review_fit: number;
  review_design: number;
  lens_width_mm: number | null;
  bridge_mm: number | null;
  temple_mm: number | null;
  is_new: number;
  bestseller: number;
  supports_reader: number;
  supports_single_vision: number;
  supports_progressive: number;
  supports_non_prescription: number;
  highlights_json: string | null;
  intro_json: string | null;
  description_json: string | null;
  card_image_url: string | null;
  card_hover_image_url: string | null;
};

type ColorRow = {
  product_id: string;
  color_id: string;
  label_json: string | null;
  hex: string;
  color_family: string | null;
  images_json: string | null;
  views_json: string | null;
  tryon_image_url: string | null;
  tryon_model_url: string | null;
  sort_order: number;
};

type ColorViewKey = "front" | "side" | "angle" | "folded" | "detail";
const VIEW_KEYS: ColorViewKey[] = [
  "front",
  "side",
  "angle",
  "folded",
  "detail",
];

const safeJsonObject = (s: string | null): Record<string, unknown> => {
  if (!s) return {};
  try {
    const v = JSON.parse(s);
    return v && typeof v === "object" && !Array.isArray(v)
      ? (v as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
};

const parseViews = (s: string | null): Record<ColorViewKey, string | null> => {
  const raw = safeJsonObject(s);
  const out = {} as Record<ColorViewKey, string | null>;
  for (const k of VIEW_KEYS) {
    const v = raw[k];
    out[k] = typeof v === "string" && v.length > 0 ? v : null;
  }
  return out;
};

type LensSkuRow = {
  id: string;
  brand_id: string;
  prescription_type: string;
  refractive_index: number;
  base_function:
    | "clear"
    | "blue"
    | "photo"
    | "driving"
    | "tinted"
    | "polarized";
  function_variant: "base" | "blueUpgrade" | null;
  progressive_design: "standard" | "short" | null;
  progressive_view_area: "standard" | "broader" | null;
  lens_colors_json: string | null;
  retail_cents: number;
  recommended: number;
  sort_order: number;
};

const safeJsonArray = (s: string | null): unknown[] => {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};

export const Route = createFileRoute("/api/catalog")({
  server: {
    handlers: {
      GET: async () => {
        const db = getDB();
        const [productsRes, colorsRes, skusRes] = await Promise.all([
          db
            .prepare(
              `SELECT id, slug, product_kind, categories_json, styles_json, material, finish, shape, genders_json,
                      name_json, price_cents, original_price_cents, weight_g,
                      rating, review_count, review_quality, review_fit, review_design,
                      lens_width_mm, bridge_mm, temple_mm,
                      is_new, bestseller,
                      supports_reader, supports_single_vision,
                      supports_progressive, supports_non_prescription,
                      highlights_json, intro_json, description_json,
                      card_image_url, card_hover_image_url
               FROM products WHERE archived_at IS NULL ORDER BY product_kind, id`,
            )
            .all<ProductRow>(),
          db
            .prepare(
              `SELECT product_id, color_id, label_json, hex, color_family,
                      images_json, views_json, tryon_image_url, tryon_model_url, sort_order
               FROM product_colors ORDER BY product_id, sort_order`,
            )
            .all<ColorRow>(),
          db
            .prepare(
              `SELECT id, brand_id, prescription_type, refractive_index,
                      base_function, function_variant, progressive_design,
                      progressive_view_area, lens_colors_json,
                      retail_cents, recommended, sort_order
               FROM lens_skus WHERE active = 1
               ORDER BY brand_id, prescription_type, sort_order, refractive_index`,
            )
            .all<LensSkuRow>(),
        ]);

        const colorsByProduct = new Map<string, ColorRow[]>();
        for (const c of colorsRes.results ?? []) {
          const arr = colorsByProduct.get(c.product_id) ?? [];
          arr.push(c);
          colorsByProduct.set(c.product_id, arr);
        }

        const products = (productsRes.results ?? []).map((p: ProductRow) => {
          const highlightsRaw = parseLangJson(p.highlights_json) as Record<
            string,
            unknown
          >;
          // highlights stored as {zh: [...], en: [...]} — preserve as-is.
          const highlights: Record<string, string[]> = {};
          for (const [k, v] of Object.entries(highlightsRaw)) {
            if (Array.isArray(v)) {
              highlights[k] = v.filter(
                (x): x is string => typeof x === "string",
              );
            }
          }
          return {
            id: p.id,
            slug: p.slug,
            productKind: p.product_kind,
            categories: safeJsonArray(p.categories_json) as string[],
            styles: safeJsonArray(p.styles_json) as string[],
            material: p.material,
            finish: p.finish,
            shape: p.shape,
            genders: safeJsonArray(p.genders_json) as string[],
            name: parseLangJson(p.name_json),
            intro: parseLangJson(p.intro_json),
            description: parseLangJson(p.description_json),
            priceCents: p.price_cents,
            originalPriceCents: p.original_price_cents,
            weightG: p.weight_g,
            rating: p.rating,
            reviewCount: p.review_count,
            reviewQuality: p.review_quality,
            reviewFit: p.review_fit,
            reviewDesign: p.review_design,
            size: {
              lensWidth: p.lens_width_mm,
              bridge: p.bridge_mm,
              temple: p.temple_mm,
            },
            isNew: !!p.is_new,
            bestseller: !!p.bestseller,
            supportsReader: !!p.supports_reader,
            supportsSingleVision: !!p.supports_single_vision,
            supportsProgressive: !!p.supports_progressive,
            supportsNonPrescription: !!p.supports_non_prescription,
            cardImageUrl: p.card_image_url,
            cardHoverImageUrl: p.card_hover_image_url,
            highlights,
            colors: (colorsByProduct.get(p.id) ?? []).map((c) => {
              const images = safeJsonArray(c.images_json) as string[];
              const views = parseViews(c.views_json);
              return {
                id: c.color_id,
                label: parseLangJson(c.label_json),
                hex: c.hex,
                colorFamily: c.color_family,
                images,
                views,
                tryonImageUrl: c.tryon_image_url ?? images[0] ?? null,
                tryonModelUrl: c.tryon_model_url ?? null,
              };
            }),
          };
        });

        const lenses = (skusRes.results ?? []).map((s: LensSkuRow) => ({
          id: s.id,
          brandId: s.brand_id,
          prescriptionType: s.prescription_type,
          refractiveIndex: s.refractive_index,
          baseFunction: s.base_function,
          functionVariant: s.function_variant,
          progressiveDesign: s.progressive_design,
          progressiveViewArea: s.progressive_view_area,
          lensColors: safeJsonArray(s.lens_colors_json),
          retailCents: s.retail_cents,
          recommended: !!s.recommended,
        }));

        return Response.json(
          { products, lenses },
          { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } },
        );
      },
    },
  },
});
```

### 3.5 服务端加载器 `src/server/catalog-loader.ts`（`tryonModelUrl` 关键处）

```ts
// Server-side catalog loader. Same SQL + mapping as /api/catalog GET, but
// callable directly from TanStack Start route loaders (so PDP / sitemap /
// future SSR pages get product data without a self-HTTP roundtrip on the
// Cloudflare Worker).

import { getDB } from "@/server/db";
import { parseLangJson, type LangMap } from "@/lib/lang";
import type { ColorFamilyId, FinishId } from "@/lib/color-palette";

const safeJsonArray = (s: string | null): unknown[] => {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};

const safeJsonObject = (s: string | null): Record<string, unknown> => {
  if (!s) return {};
  try {
    const v = JSON.parse(s);
    return v && typeof v === "object" && !Array.isArray(v)
      ? (v as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
};

const parseContent = (s: string | null): ProductContentMap | null => {
  const raw = safeJsonObject(s);
  if (Object.keys(raw).length === 0) return null;
  return raw as ProductContentMap;
};

// Per-product content story (WO-20261008-01). Mirrors the section set the
// operator patch ships (docs/system-kit/patch/*.json) so the PDP route can
// render a full DB-driven SSR section story with per-section H2s.
export type ProductContentFaq = { question?: string; answer?: string };
export interface ProductContentSections {
  overview?: { heading?: string; body?: string };
  vto?: { heading?: string; text?: string };
  frame_details?: { label?: string; value?: string }[];
  lens_options?: { brands?: string[]; note?: string };
  pd_measure?: { text?: string };
  progressive_guarantee?: { text?: string; note?: string };
  shipping_returns?: {
    text?: string;
    detail?: {
      shipping_heading?: string;
      shipping_body?: string;
      returns_heading?: string;
      returns_body?: string;
    };
  };
  faq?: ProductContentFaq[];
  reviews?: { note?: string };
  quote?: { text?: string; source?: string };
  ldProperties?: { name?: string; value?: string }[];
}
export interface ProductContent {
  seo?: {
    title?: string;
    description?: string;
    h1?: string;
    keywords?: string[];
  };
  sections?: ProductContentSections;
}
export type ProductContentMap = Record<string, ProductContent>;

export type ColorViewKey = "front" | "side" | "angle" | "folded" | "detail";
export type ColorViews = Record<ColorViewKey, string | null>;
const VIEW_KEYS: ColorViewKey[] = [
  "front",
  "side",
  "angle",
  "folded",
  "detail",
];

const parseViews = (s: string | null): ColorViews => {
  const raw = safeJsonObject(s);
  const out = {} as ColorViews;
  for (const k of VIEW_KEYS) {
    const v = raw[k];
    out[k] = typeof v === "string" && v.length > 0 ? v : null;
  }
  return out;
};

type ProductRow = {
  id: string;
  slug: string;
  product_kind: "eyeglasses" | "sunglasses" | "accessory";
  categories_json: string | null;
  styles_json: string | null;
  material: string | null;
  finish: string | null;
  shape: string | null;
  genders_json: string | null;
  name_json: string | null;
  intro_json: string | null;
  description_json: string | null;
  highlights_json: string | null;
  content_json: string | null;
  price_cents: number;
  original_price_cents: number | null;
  weight_g: number | null;
  rating: number;
  review_count: number;
  review_quality: number;
  review_fit: number;
  review_design: number;
  lens_width_mm: number | null;
  bridge_mm: number | null;
  temple_mm: number | null;
  is_new: number;
  bestseller: number;
  supports_reader: number;
  supports_single_vision: number;
  supports_progressive: number;
  supports_non_prescription: number;
  card_image_url: string | null;
  card_hover_image_url: string | null;
};

type ColorRow = {
  product_id: string;
  color_id: string;
  label_json: string | null;
  hex: string;
  color_family: string | null;
  images_json: string | null;
  views_json: string | null;
  tryon_image_url: string | null;
  tryon_model_url: string | null;
  sort_order: number;
};

export interface CatalogProduct {
  id: string;
  slug: string;
  productKind: string;
  categories: string[];
  styles: string[];
  material: string | null;
  finish: FinishId | null;
  shape: string | null;
  genders: string[];
  name: LangMap;
  intro: LangMap;
  description: LangMap;
  priceCents: number;
  originalPriceCents: number | null;
  weightG: number | null;
  rating: number;
  reviewCount: number;
  reviewQuality: number;
  reviewFit: number;
  reviewDesign: number;
  size: {
    lensWidth: number | null;
    bridge: number | null;
    temple: number | null;
  };
  isNew: boolean;
  bestseller: boolean;
  supportsReader: boolean;
  supportsSingleVision: boolean;
  supportsProgressive: boolean;
  supportsNonPrescription: boolean;
  cardImageUrl: string | null;
  cardHoverImageUrl: string | null;
  highlights: Record<string, string[]>;
  content: ProductContentMap | null;
  colors: {
    id: string;
    label: LangMap;
    hex: string;
    colorFamily: ColorFamilyId | null;
    images: string[];
    views: ColorViews;
    tryonImageUrl: string | null;
    tryonModelUrl: string | null;
  }[];
}

function mapProduct(p: ProductRow, colors: ColorRow[]): CatalogProduct {
  const highlightsRaw = parseLangJson(p.highlights_json) as Record<
    string,
    unknown
  >;
  const highlights: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(highlightsRaw)) {
    if (Array.isArray(v)) {
      highlights[k] = v.filter((x): x is string => typeof x === "string");
    }
  }
  return {
    id: p.id,
    slug: p.slug,
    productKind: p.product_kind,
    categories: safeJsonArray(p.categories_json) as string[],
    styles: safeJsonArray(p.styles_json) as string[],
    material: p.material,
    finish: (p.finish ?? null) as FinishId | null,
    shape: p.shape,
    genders: safeJsonArray(p.genders_json) as string[],
    name: parseLangJson(p.name_json),
    intro: parseLangJson(p.intro_json),
    description: parseLangJson(p.description_json),
    priceCents: p.price_cents,
    originalPriceCents: p.original_price_cents,
    weightG: p.weight_g,
    rating: p.rating,
    reviewCount: p.review_count,
    reviewQuality: p.review_quality,
    reviewFit: p.review_fit,
    reviewDesign: p.review_design,
    size: {
      lensWidth: p.lens_width_mm,
      bridge: p.bridge_mm,
      temple: p.temple_mm,
    },
    isNew: !!p.is_new,
    bestseller: !!p.bestseller,
    supportsReader: !!p.supports_reader,
    supportsSingleVision: !!p.supports_single_vision,
    supportsProgressive: !!p.supports_progressive,
    supportsNonPrescription: !!p.supports_non_prescription,
    cardImageUrl: p.card_image_url,
    cardHoverImageUrl: p.card_hover_image_url,
    highlights,
    content: parseContent(p.content_json),
    colors: colors.map((c) => {
      const images = safeJsonArray(c.images_json) as string[];
      const views = parseViews(c.views_json);
      return {
        id: c.color_id,
        label: parseLangJson(c.label_json),
        hex: c.hex,
        colorFamily: (c.color_family ?? null) as ColorFamilyId | null,
        images,
        views,
        tryonImageUrl: c.tryon_image_url ?? images[0] ?? null,
        tryonModelUrl: c.tryon_model_url ?? null,
      };
    }),
  };
}

const PRODUCT_COLS = `id, slug, product_kind, categories_json, styles_json, material, finish, shape, genders_json,
  name_json, intro_json, description_json, highlights_json, content_json,
  price_cents, original_price_cents, weight_g, rating, review_count,
  review_quality, review_fit, review_design,
  lens_width_mm, bridge_mm, temple_mm, is_new, bestseller,
  supports_reader, supports_single_vision, supports_progressive, supports_non_prescription,
  card_image_url, card_hover_image_url`;

const COLOR_COLS = `product_id, color_id, label_json, hex, color_family, images_json, views_json, tryon_image_url, tryon_model_url, sort_order`;

/** Load a single product by slug, with its colors. Returns null if not found. */
export async function loadProductBySlug(
  slug: string,
): Promise<CatalogProduct | null> {
  const db = getDB();
  const productRow = await db
    .prepare(
      `SELECT ${PRODUCT_COLS} FROM products WHERE slug = ? AND archived_at IS NULL LIMIT 1`,
    )
    .bind(slug)
    .first<ProductRow>();
  if (!productRow) return null;
  const colorsRes = await db
    .prepare(
      `SELECT ${COLOR_COLS} FROM product_colors WHERE product_id = ? ORDER BY sort_order, color_id`,
    )
    .bind(productRow.id)
    .all<ColorRow>();
  return mapProduct(productRow, colorsRes.results ?? []);
}

/** Load full catalog (every non-archived product + colors). */
export async function loadAllProducts(): Promise<CatalogProduct[]> {
  const db = getDB();
  const [pRes, cRes] = await Promise.all([
    db
      .prepare(
        `SELECT ${PRODUCT_COLS} FROM products WHERE archived_at IS NULL ORDER BY product_kind, id`,
      )
      .all<ProductRow>(),
    db
      .prepare(
        `SELECT ${COLOR_COLS} FROM product_colors ORDER BY product_id, sort_order`,
      )
      .all<ColorRow>(),
  ]);
  const colorsByProduct = new Map<string, ColorRow[]>();
  for (const c of cRes.results ?? []) {
    const arr = colorsByProduct.get(c.product_id) ?? [];
    arr.push(c);
    colorsByProduct.set(c.product_id, arr);
  }
  return (pRes.results ?? []).map((p) =>
    mapProduct(p, colorsByProduct.get(p.id) ?? []),
  );
}
```

---

## 4. 页面文案（i18n `tryon.*` 全部键）

> 全 14 语字典里 `tryon.*` 均存在；以下是 **EN（源文）+ 中文** 完整文案。其余语言为翻译铺满（结构键一致）。`pdp.color` 复用于色板标题，`wiz.loading` 复用于加载占位。

**EN（`src/lib/i18n.tsx` L683-706）**

```jsonc
"tryon.title": "Virtual try-on",
"tryon.start": "Start camera",
"tryon.tip": "Allow camera access. Tracking runs locally with MediaPipe — no video leaves your device.",
"tryon.choose": "Pick a frame",
"tryon.stop": "Stop",
"tryon.snapshot": "Save snapshot",
"tryon.scale": "Frame size",
"tryon.loading": "Loading…",
"tryon.error": "Unable to start camera or load model. Check permissions.",
"tryon.eyebrow": "On-device tracking",
"tryon.helperTip": "Tip: even lighting and a frontal pose give the best fit. Try several frames to compare.",
"tryon.more": "More frames",
"tryon.steps.title": "How it works",
"tryon.step1.title": "Allow camera",
"tryon.step1.desc": "Grant browser permission so we can map your face locally.",
"tryon.step2.title": "Pick a frame",
"tryon.step2.desc": "Choose any style on the right — switch any time.",
"tryon.step3.title": "Adjust the fit",
"tryon.step3.desc": "Use the size slider to match your face width.",
"tryon.step4.title": "Save your look",
"tryon.step4.desc": "Snap a photo to compare or share with friends.",
```

**中文（L1677-1699）**

```jsonc
"tryon.title": "虚拟试戴",
"tryon.start": "开启摄像头",
"tryon.tip": "请允许摄像头权限。我们使用 MediaPipe 在本地实时识别，不上传任何画面。",
"tryon.choose": "选择一款镜框",
"tryon.stop": "停止",
"tryon.snapshot": "保存截图",
"tryon.scale": "镜框大小",
"tryon.loading": "加载中…",
"tryon.error": "无法启动摄像头或加载模型，请检查权限。",
"tryon.eyebrow": "本地实时识别",
"tryon.helperTip": "提示：保持光线均匀，正对镜头效果最佳。可选择多款镜框对比。",
"tryon.more": "推荐镜框",
"tryon.steps.title": "试戴步骤",
"tryon.step1.title": "授权摄像头",
"tryon.step1.desc": "允许浏览器访问摄像头，所有识别均在本地完成。",
"tryon.step2.title": "选择镜框",
"tryon.step2.desc": "在右侧挑选喜欢的款式，可随时切换。",
"tryon.step3.title": "调整尺寸",
"tryon.step3.desc": "拖动滑块让镜框宽度匹配你的脸型。",
"tryon.step4.title": "保存效果",
"tryon.step4.desc": "点击截图保存，或分享给朋友看看。",
```

---

## 5. 真跟踪需求逻辑（已合流版 — 可直接并入需求文档）

> 来源：站主 `Pdp-Unified-3d-Tryon-Real-Tracking` 参考（成功案例）。**线上实现已包含以下全部三要素**（证据：源码 `setInterval`/`Math.sin`/`setFromMatrixPosition` = 0；线上 bundle `assets/try-on-D9h2d7nP.js` `detectForVideo`×7、`facialTransformationMatrixes`×4、`outputFacialTransformationMatrixes`×7）。
>
> ⚠️ **唯一不能照搬的部分**：参考 loop 里 `pos.setFromMatrixPosition(mat4)` 加 `*0.01` 偏移。那是它自己的 PerspectiveCamera 归一化世界；MediaPipe 矩阵平移列是**规范 face-model 单位、不是像素**。线上用 **瞳孔 landmark 468/473 像素锚点**做位置，矩阵只做朝向。**位置必须用 landmark 锚点，不用矩阵平移**——这条是硬批注。

### 需求描述（正文，可直接粘贴）

**真贴脸 3 要素（本需求强制要求）**

1. **要矩阵**：`FaceLandmarker.createFromOptions` 必须设 `outputFacialTransformationMatrixes: true`（旧版曾为 false）。
2. **每帧真检测**：渲染循环里每帧调用 `landmarker.detectForVideo(video, performance.now())`，取 `result.facialTransformationMatrixes[0]` 的 4×4 矩阵数据驱动眼镜**朝向**。
3. **矩阵驱动朝向 + landmark 锚定位置 + 瞳孔算缩放**：
   - **朝向**：`quat.setFromRotationMatrix(matrix)`（镜像自拍世界需先烘焙镜像 `WM`，再乘 `FACE_ALIGN`）。
   - **位置**（硬批注）：**用 468/473 瞳孔中点像素坐标**，`px=(1−(pR.x+pL.x)/2)*w`、`py=((pR.y+pL.y)/2)*h`；**禁止用矩阵平移列**（那是规范模型单位，直接用它眼镜会定在角落）。
   - **缩放**：用 468/473 瞳孔间距（或 33/263 外眼角瞳距）× `FRAME_WIDTH_RATIO`。

**必带配套（成功案例都有）**

- **遮挡器（Face Mesh Occluder）**：隐形头型椭球，`colorWrite:false, depthWrite:true, depthTest:true`，`renderer.sortObjects=false`，跟随眼镜中心，z 停在镜框前沿之后、镜腿尖之前——转头时远侧镜腿被深度剔除到"耳朵后"。
- **自适应平滑**：位置 `lerp`（`POSITION_SMOOTHING=0.25`）+ 朝向 `slerp`（`ROTATION_SMOOTHING=0.6`）；首帧/丢脸 snap 重置，防止抖帧和残影。
- **镜像自拍世界**：`p_world=(W−x, H−y)`；正交相机像素空间 `left=0,right=w,top=h,bottom=0`，`near/far=±5000`；视频背景 plane 在 z=−2000。
- **删除假循环**：任何 `setInterval(()=>{ const yaw = Math.sin(t)*0.8 })` 之类的假数据驱动一律禁止（那是演示用的，不是真脸，眼镜不会贴脸）。

### 参考 loop（真跟踪版，作者原版）

```js
function loop() {
  if (!running || !landmarker || !video || video.readyState < 2) {
    requestAnimationFrame(loop);
    return;
  }
  const result = landmarker.detectForVideo(video, performance.now());
  if (
    result.facialTransformationMatrixes &&
    result.facialTransformationMatrixes.length > 0 &&
    result.faceLandmarks &&
    result.faceLandmarks.length > 0
  ) {
    const matrix = result.facialTransformationMatrixes[0].data;
    const landmarks = result.faceLandmarks[0];
    const mat4 = new THREE.Matrix4().fromArray(matrix);
    const pos = new THREE.Vector3().setFromMatrixPosition(mat4);
    const quat = new THREE.Quaternion().setFromRotationMatrix(mat4);
    // MediaPipe坐标到Three坐标系修正（PerspectiveCamera 归一化世界专属）
    targetPos.set(-pos.x * 0.01, -pos.y * 0.01 + 0.02, -pos.z * 0.01 - 0.05);
    targetQuat.copy(quat);
    const fix = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(0, Math.PI, 0),
    ); // 镜腿朝后
    targetQuat.multiply(fix);
    // 缩放用瞳距（468/473 瞳孔）
    const left = landmarks[468],
      right = landmarks[473];
    if (left && right) {
      const eyeDist = Math.hypot(left.x - right.x, left.y - right.y);
      targetScale = eyeDist * 8;
    }
  } else {
    // 未检测到人脸
  }
  requestAnimationFrame(loop);
}
```

### 为何线上不能逐字拷贝这段

| 差异点   | 参考 HTML                                 | 线上（正交像素世界）                                                  |
| -------- | ----------------------------------------- | --------------------------------------------------------------------- |
| 相机     | `PerspectiveCamera(45, aspect, 0.1, 100)` | `OrthographicCamera(0..w, 0..h, ±5000)`                               |
| 镜像     | CSS `canvas{transform:scaleX(-1)}`        | 烘焙进矩阵 `WM`（`we[0]=-e[0]`、`we[12]=w−e[12]`）                    |
| 位置     | 矩阵平移 `*0.01` + 偏移                   | **瞳孔 landmark 468/473 像素锚点**                                    |
| 朝向修正 | `fix = Euler(0,π,0)` 全对象翻转           | `FACE_ALIGN = Rz(π)`（净≈单位阵；GLB 镜腿实测本来就朝后）             |
| 缩放     | `eyeDist*8`                               | `eyeDist × FRAME_WIDTH_RATIO(1.85) × scaleRef / MODEL_WIDTH_M(0.145)` |
| 镜片     | `lens` 材质 opacity 0.15                  | 几何镂空（opaque 即可见眼，无需半透明）                               |
| 遮挡器   | `SphereGeometry(0.18)` 缩放 (1,1.3,0.6)   | `SphereGeometry(1)`，`rx=eyeDist×0.7`，`scale=(rx,1.3rx,0.6rx)`       |

盲拷参考 loop 会让线上**退回任务 #79 修掉的"眼镜定在左上角" bug**。正确做法是保留上表右列的线上实现，只从参考搬"遮挡器概念 + 自适应平滑 + 真矩阵三要素"（线上已全部落地）。

---

## 6. 部署与验证

### 6.1 部署命令

```bash
cd lool-glasses-new-
bun install
bun run build                    # ≈27s，产出 assets/try-on-*.js
npx wrangler deploy              # 用 CLOUDFLARE_API_TOKEN（cfat_ 前缀 token 可被 wrangler deploy 接受，
                                 # 即使 /user/tokens/verify 对同一 token 返回 401 —— 以后以实际 deploy 为准）
# D1（本次交付无需重跑，已在上线时回填；加新 3D 款时用）
npx wrangler d1 execute lool-work --remote --command "UPDATE product_colors SET tryon_model_url = '...' WHERE color_id = '...'"
```

### 6.2 站主自验清单（三轴）

1. **3D 款**：打开 `?frame=lool-tr90-square` → "Start camera" → 应看到页面状态字为"检测到人脸"、眼镜**贴鼻梁跟随**（不再是定左上角）。
   - 若停在初始姿势像"定角"：多半是 MediaPipe 模型 CDN（`storage.googleapis.com` / `cdn.jsdelivr.net`）在你当前网络被拦 → 换网络或检查 WAF（大陆 IP 被 CF 阻断是预期，见 CLAUDE.md）。
2. **滑杆实时调大小**：`scaleRef` 修复后，`Frame size` 滑块在摄像头运行中应即时改变镜框大小。
3. **转头遮挡**：侧面转头，**远侧镜腿**应被隐形椭球挡到"耳朵后"；正面时双镜腿露出。
4. **2D 款**：切到 `?frame=lool-8663`（6 色），应走 2D PNG overlay，色板切换生效。
5. **帧选择器**：`Pick a frame` 显示两款式 tile，点 `lool-8663` → URL 变 `?frame=lool-8663`，客户端导航不重载相机。

### 6.3 环境 gotcha（headless 验证时复用）

- WebGL overlay 画布在 swiftshader headless 下 `toDataURL()`/`readPixels()` 恒黑 → 用 `page.screenshot()` 合成帧 + clip 画布 bbox。
- canvas `captureStream` 与 video-element `captureStream` 在本沙箱**均偶发 `readyState=0`**（管线不启动、GLB 不请求）→ 属环境抖动非代码缺陷；`/tmp/moving-face.mp4`（ffmpeg 6s 左/右人脸视频）可复现部分启动。
- 两态 diff（real GLB vs `route('**/*.glb', abort)`）是隔离眼镜剪影的可靠方法（`/tmp/smoke-occ5.mjs` 已验证遮挡器活跃时眼镜正常渲染）。

---

## 7. 变更历史（VTO 相关）

| 日期       | 内容                                           | 任务 |
| ---------- | ---------------------------------------------- | ---- |
| 2026-10-09 | GLB 压缩 + 上传 R2 `frames-3d/`                | #73  |
| 2026-10-09 | migration 0086 `tryon_model_url` 列            | #74  |
| 2026-10-09 | `/images/frames-3d/$.ts` R2 路由               | #75  |
| 2026-10-09 | catalog 三处返回 `tryonModelUrl`               | #76  |
| 2026-10-09 | try-on.tsx 3D 渲染循环（矩阵 + 遮挡器 + 平滑） | #77  |
| 2026-10-09 | D1 回填 + 部署验证                             | #78  |
| 2026-10-09 | 修复眼镜不上脸（FACE_ALIGN + landmark 定位）   | #79  |
| 2026-10-09 | scale 修复（scaleRef 读 ref）部署              | #80  |
| 2026-10-09 | 贴合微调：瞳孔 468/473 锚点 + `1.85` + `-0.02` | #81  |
| 2026-10-09 | "Pick a frame" 跨款式切换器打通                | #82  |
| 2026-10-09 | 真跟踪争议澄清 + 本交付文档                    | —    |

---

_本文档由 loollook AI（coze）按站主要求整理。改动前请先在 §6.2 自验清单确认基线。_
