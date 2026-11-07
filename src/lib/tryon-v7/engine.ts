// Virtual try-on engine v7 — port of the "glasses-ar v7" standalone page
// (itself a port of alperenuzun/basic-virtual-tryon-glasses, MIT).
//
// What v7 does differently from the live /try-on page (iris 468/473 anchor):
//   * Pose: a full 3D basis per frame — x = eye-corner line (33/133 ↔ 263/362),
//     y = forehead(10) → chin(175), z = x × y — so yaw / pitch / roll all follow.
//   * Scale: max(eye width, temple width 127↔356, cheek width 234↔454) blended
//     with face height, so it reads the head size, not just the pupils.
//   * Depth: anchored at the eye midpoint, pushed forward by a nose-bridge(168)
//     → nose-tip(1) depth term so the frame sits on the nose.
//   * Smoothing: adaptive lerp/slerp — small motion = heavy smoothing (no
//     jitter), fast motion = light smoothing (no lag).
//   * Occlusion: a depth-only fan mesh over the 36-point face oval, so the far
//     temple disappears behind the head when you turn.
//
// Math is kept line-for-line from v7 (orthographic camera in the negative
// quadrant + mirrored video sprite). Lab-only additions: our own GLB models and
// PNG fronts as the glasses object, self-hosted MediaPipe, GPU→CPU fallback,
// video colour fix (sprite not tone-mapped), and clean dispose().

import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FACE_LANDMARKER_MODEL, MEDIAPIPE_WASM_BASE } from "@/lib/mediapipe-assets";

/* ── constants (v7) ── */
const LM = {
  leftEyeOuter: 33,
  rightEyeOuter: 263,
  leftEyeInner: 133,
  rightEyeInner: 362,
  leftTemple: 127,
  rightTemple: 356,
  leftCheek: 234,
  rightCheek: 454,
  forehead: 10,
  chin: 175,
  noseBridge: 168,
  noseTip: 1,
};
const FACE_OVAL = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378,
  400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21,
  54, 103, 67, 109,
];
const CANVAS_WIDTH = 640;

export interface V7Config {
  refHeadWidth: number;
  refFaceHeight: number;
  glassesDepth: number;
  glassesDown: number;
  glassesCenterX: number;
  glassesScale: number;
  occluder: boolean;
}
export const V7_DEFAULT_CFG: V7Config = {
  refHeadWidth: 140,
  refFaceHeight: 210,
  glassesDepth: 10,
  glassesDown: 2,
  glassesCenterX: 0,
  glassesScale: 1.22,
  occluder: true,
};

/** Width of the v7 procedural frame front, in v7 world units. Our GLB / PNG
 * fronts are normalized to this width so one CFG fits every source. */
const FRONT_WIDTH = 129;

export type GlassesSource =
  | { kind: "procedural" }
  | { kind: "glb"; url: string }
  | { kind: "png"; url: string };

export type TrackState = "searching" | "locked" | "lost";

type Pts = [number, number, number][];

/* ── helpers (v7) ── */
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const toV = (pts: Pts, i: number) => new THREE.Vector3(-pts[i][0], -pts[i][1], -pts[i][2]);
const mid = (a: THREE.Vector3, b: THREE.Vector3) => a.clone().add(b).multiplyScalar(0.5);
const eyeMid = (pts: Pts, i: number, j: number) => mid(toV(pts, i), toV(pts, j));
const qDelta = (a: THREE.Quaternion, b: THREE.Quaternion) =>
  2 * Math.acos(clamp(Math.abs(a.dot(b)), 0, 1));
const toPixels = (
  landmarks: { x: number; y: number; z: number }[],
  video: HTMLVideoElement,
): Pts => {
  const w = video.videoWidth;
  const h = video.videoHeight;
  return landmarks.map((l) => [l.x * w, l.y * h, l.z * w]);
};

/* ── scene (v7) ── */
function createCamera(video: HTMLVideoElement) {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  const cam = new THREE.OrthographicCamera(-vw / 2, vw / 2, vh / 2, -vh / 2, 0.1, 5000);
  cam.position.set(-vw / 2, -vh / 2, 500);
  return cam;
}
function createVideoBackground(video: HTMLVideoElement, camera: THREE.OrthographicCamera) {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  const tex = new THREE.Texture(video);
  tex.minFilter = THREE.LinearFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, depthWrite: false, side: THREE.DoubleSide });
  // Lab fix: keep the selfie colours true — the renderer's ACES tone mapping
  // is meant for the glasses, not the camera feed.
  mat.toneMapped = false;
  const sprite = new THREE.Sprite(mat);
  sprite.center.set(0.5, 0.5);
  sprite.scale.set(-vw, vh, 1); // mirrored selfie
  sprite.position.copy(camera.position);
  sprite.position.z = 0;
  return { bg: tex, sprite };
}
function createLights() {
  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(0, 120, 250);
  const fill = new THREE.DirectionalLight(0xeef0ff, 0.5);
  fill.position.set(-100, 40, 120);
  const rim = new THREE.DirectionalLight(0xffffff, 0.4);
  rim.position.set(60, 80, -100);
  const top = new THREE.DirectionalLight(0xffffff, 0.25);
  top.position.set(0, 200, 50);
  const amb = new THREE.HemisphereLight(0xffffff, 0x444466, 0.5);
  return [key, fill, rim, top, amb];
}

/* ── occluder (v7: 36-point face-oval fan, depth only, double-sided) ── */
function createDynamicFaceMesh() {
  const nOval = FACE_OVAL.length;
  const positions = new Float32Array((nOval + 1) * 3);
  const indices: number[] = [];
  for (let i = 0; i < nOval; i++) indices.push(0, i + 1, ((i + 1) % nOval) + 1);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setIndex(indices);
  const mat = new THREE.MeshBasicMaterial({ colorWrite: false, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 1;
  mesh.frustumCulled = false;
  return mesh;
}

/* ── procedural gold round frame (v7 baseline) ── */
function createProceduralGlasses() {
  const g = new THREE.Group();
  const lensW = 52;
  const lensH = 43;
  const bridgeGap = 17;
  const wireR = 0.7;
  const templeLen = 56;
  const cx = bridgeGap / 2 + lensW / 2 + 1.5;
  const acetateMat = new THREE.MeshPhysicalMaterial({
    color: 0x3d1f0d, metalness: 0, roughness: 0.16, clearcoat: 0.95,
    clearcoatRoughness: 0.06, reflectivity: 0.5, side: THREE.DoubleSide,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xc9a54e, metalness: 0.92, roughness: 0.12, side: THREE.DoubleSide,
  });
  const goldDarkMat = new THREE.MeshStandardMaterial({ color: 0xa08030, metalness: 0.88, roughness: 0.18 });
  const lensMat = new THREE.MeshPhysicalMaterial({
    color: 0x1c2e1c, metalness: 0.05, roughness: 0.02, transparent: true, opacity: 0.68,
    side: THREE.DoubleSide, depthWrite: false, clearcoat: 1, clearcoatRoughness: 0.03,
    envMapIntensity: 0.3,
  });
  const ellipseCurve3D = (w: number, h: number, segments = 72) => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * w * 0.5, Math.sin(a) * h * 0.5, 0));
    }
    return new THREE.CatmullRomCurve3(pts, true);
  };
  for (const side of [-1, 1]) {
    const rim = new THREE.Mesh(new THREE.TubeGeometry(ellipseCurve3D(lensW, lensH), 72, wireR, 8, true), goldMat);
    rim.position.x = side * cx;
    g.add(rim);
    const shape = new THREE.Shape();
    shape.absellipse(0, 0, lensW * 0.485, lensH * 0.485, 0, Math.PI * 2, false, 0);
    const lens = new THREE.Mesh(new THREE.ShapeGeometry(shape, 48), lensMat);
    lens.position.set(side * cx, 0, 0.2);
    g.add(lens);
  }
  const bridgePts = [
    new THREE.Vector3(-cx + lensW * 0.35, lensH * 0.08, wireR),
    new THREE.Vector3(-bridgeGap * 0.25, lensH * 0.18, wireR * 2),
    new THREE.Vector3(0, lensH * 0.22, wireR * 2.5),
    new THREE.Vector3(bridgeGap * 0.25, lensH * 0.18, wireR * 2),
    new THREE.Vector3(cx - lensW * 0.35, lensH * 0.08, wireR),
  ];
  g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(bridgePts), 24, wireR * 1.2, 8, false), goldMat));
  for (const side of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(side * (cx + lensW * 0.5 + 2.5), lensH * 0.2, 0);
    const armPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -templeLen * 0.5), new THREE.Vector3(0, 0, -templeLen),
    ]);
    pivot.add(new THREE.Mesh(new THREE.TubeGeometry(armPath, 32, 1, 8, false), goldMat));
    const tipPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, -templeLen * 0.65), new THREE.Vector3(0, 0, -templeLen * 0.82), new THREE.Vector3(0, 0, -templeLen),
    ]);
    pivot.add(new THREE.Mesh(new THREE.TubeGeometry(tipPath, 16, 1.6, 8, false), acetateMat));
    pivot.rotation.y = side * 0.06;
    g.add(pivot);
    const hg = new THREE.Group();
    hg.add(new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 4, 12), goldMat));
    const plate = new THREE.Mesh(new THREE.BoxGeometry(3.5, 5, 1.3), goldMat);
    plate.position.set(-side * 1.5, 0, 0);
    hg.add(plate);
    const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.4, 8), goldDarkMat);
    screw.rotation.x = Math.PI / 2;
    screw.position.set(-side * 2.2, 0, 0.8);
    hg.add(screw);
    hg.position.set(side * (cx + lensW * 0.5 + 1), lensH * 0.2, -0.5);
    g.add(hg);
  }
  return g;
}

/** Our GLB (any unit, front facing +Z, Y up): center X, front face at z = 0,
 * vertical center at y = 0, scaled so the front width = FRONT_WIDTH. */
async function loadGlbGlasses(url: string) {
  const gltf = await new GLTFLoader().loadAsync(url);
  const model: THREE.Object3D = gltf.scene;
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const k = FRONT_WIDTH / (size.x || 1);
  model.position.set(-center.x, -center.y, -box.max.z);
  const wrap = new THREE.Group();
  wrap.scale.setScalar(k);
  wrap.add(model);
  model.traverse((o: THREE.Object3D) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mat = mesh.material as THREE.MeshStandardMaterial;
    if (mat && mat.isMeshStandardMaterial) {
      // same sheen as the live page — matte plastic reads dead on camera
      mat.metalness = 0.1;
      mat.roughness = 0.4;
    }
  });
  const g = new THREE.Group();
  g.add(wrap);
  return g;
}

/** PNG front (transparent lenses) as a textured plane, FRONT_WIDTH wide. */
async function loadPngGlasses(url: string) {
  const tex = await new THREE.TextureLoader().setCrossOrigin("anonymous").loadAsync(url);
  tex.colorSpace = THREE.SRGBColorSpace;
  const img = tex.image as { width: number; height: number };
  const h = FRONT_WIDTH * ((img.height || 1) / (img.width || 1));
  const mat = new THREE.MeshBasicMaterial({
    map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false, toneMapped: false,
  });
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.PlaneGeometry(FRONT_WIDTH, h), mat));
  return g;
}

function disposeObject(o: THREE.Object3D) {
  o.traverse((c: THREE.Object3D) => {
    const mesh = c as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry?.dispose();
    const m = mesh.material as THREE.Material | THREE.Material[] | undefined;
    (Array.isArray(m) ? m : m ? [m] : []).forEach((mm) => {
      (mm as THREE.MeshBasicMaterial).map?.dispose();
      mm.dispose();
    });
  });
}

export class TryOnV7Engine {
  cfg: V7Config = { ...V7_DEFAULT_CFG };
  private video: HTMLVideoElement;
  private container: HTMLElement;
  private onTrack: (s: TrackState) => void;
  private stream: MediaStream | null = null;
  private landmarker: FaceLandmarker | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private camera: THREE.OrthographicCamera | null = null;
  private scene: THREE.Scene | null = null;
  private bg: THREE.Texture | null = null;
  private faceObj: THREE.Mesh | null = null;
  private glassesObj: THREE.Group | null = null;
  private stopped = false;
  private inFlight = false;
  private faceSeen = false;
  private loadSeq = 0;
  private sm = {
    ready: false,
    gPos: new THREE.Vector3(),
    gQuat: new THREE.Quaternion(),
    gScale: new THREE.Vector3(1, 1, 1),
    prev: new THREE.Vector3(),
  };
  /** Frames per second of the landmark loop, for the lab HUD. */
  fps = 0;
  private fpsCount = 0;
  private fpsT0 = 0;

  constructor(container: HTMLElement, video: HTMLVideoElement, onTrack: (s: TrackState) => void) {
    this.container = container;
    this.video = video;
    this.onTrack = onTrack;
  }

  /** Camera first (the user sees themself at once), then the engine. */
  async start(onStep?: (msg: string) => void) {
    onStep?.("请求摄像头…");
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: 1280, height: 720 },
    });
    this.video.srcObject = this.stream;
    await this.video.play();
    if (this.stopped) return;
    onStep?.("加载追踪引擎…");
    const fileset = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_BASE);
    onStep?.("加载人脸模型（3.7MB）…");
    const opts = (delegate: "GPU" | "CPU") => ({
      baseOptions: { modelAssetPath: FACE_LANDMARKER_MODEL, delegate },
      runningMode: "VIDEO" as const,
      numFaces: 1,
      outputFaceBlendshapes: false,
      outputFacialTransformationMatrixes: false,
    });
    try {
      this.landmarker = await FaceLandmarker.createFromOptions(fileset, opts("GPU"));
    } catch (e) {
      console.warn("FaceLandmarker GPU delegate failed, using CPU", e);
      this.landmarker = await FaceLandmarker.createFromOptions(fileset, opts("CPU"));
    }
    if (this.stopped) return;
    this.initThree();
    this.onTrack("searching");
    this.scheduleNext();
  }

  private initThree() {
    const video = this.video;
    this.camera = createCamera(video);
    const bgResult = createVideoBackground(video, this.camera);
    this.bg = bgResult.bg;
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    r.setSize(CANVAS_WIDTH, (CANVAS_WIDTH * video.videoHeight) / video.videoWidth, false);
    r.domElement.style.width = "100%";
    r.domElement.style.height = "auto";
    r.domElement.style.display = "block";
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.1;
    r.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer = r;
    this.container.appendChild(r.domElement);
    const scene = new THREE.Scene();
    scene.add(bgResult.sprite);
    const pmrem = new THREE.PMREMGenerator(r);
    pmrem.compileCubemapShader();
    scene.environment = pmrem.fromScene(new THREE.Scene()).texture;
    pmrem.dispose();
    createLights().forEach((l) => scene.add(l));
    this.faceObj = createDynamicFaceMesh();
    this.faceObj.visible = false;
    scene.add(this.faceObj);
    this.glassesObj = new THREE.Group();
    this.glassesObj.visible = false;
    scene.add(this.glassesObj);
    this.scene = scene;
    this.animate();
  }

  /** Swap what is worn. Resolves once the new glasses are in the scene. */
  async setGlasses(src: GlassesSource) {
    const seq = ++this.loadSeq;
    const obj =
      src.kind === "glb"
        ? await loadGlbGlasses(src.url)
        : src.kind === "png"
          ? await loadPngGlasses(src.url)
          : createProceduralGlasses();
    if (seq !== this.loadSeq || this.stopped || !this.glassesObj) {
      disposeObject(obj);
      return;
    }
    obj.traverse((c: THREE.Object3D) => {
      if ((c as THREE.Mesh).isMesh) c.renderOrder = 3;
    });
    for (const old of [...this.glassesObj.children]) {
      this.glassesObj.remove(old);
      disposeObject(old);
    }
    this.glassesObj.add(obj);
  }

  setConfig(patch: Partial<V7Config>) {
    this.cfg = { ...this.cfg, ...patch };
  }

  snapshot(): string | null {
    return this.renderer ? this.renderer.domElement.toDataURL("image/png") : null;
  }

  private animate = () => {
    if (this.stopped || !this.renderer || !this.scene || !this.camera) return;
    if (this.bg) this.bg.needsUpdate = true;
    requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  };

  private scheduleNext() {
    if (this.stopped) return;
    const v = this.video as HTMLVideoElement & {
      requestVideoFrameCallback?: (cb: () => void) => number;
    };
    if (typeof v.requestVideoFrameCallback === "function") v.requestVideoFrameCallback(() => this.predict());
    else requestAnimationFrame(() => this.predict());
  }

  private predict() {
    if (this.stopped) return;
    if (this.inFlight || !this.landmarker) {
      this.scheduleNext();
      return;
    }
    this.inFlight = true;
    try {
      this.track();
    } catch (e) {
      console.error("try-on v7 frame failed", e);
    }
    this.inFlight = false;
    this.scheduleNext();
  }

  private track() {
    const now = performance.now();
    this.fpsCount++;
    if (now - this.fpsT0 >= 1000) {
      this.fps = Math.round((this.fpsCount * 1000) / (now - this.fpsT0 || 1));
      this.fpsCount = 0;
      this.fpsT0 = now;
    }
    const results = this.landmarker!.detectForVideo(this.video, now);
    const glassesObj = this.glassesObj;
    const faceObj = this.faceObj;
    const CFG = this.cfg;
    const sm = this.sm;
    if (!glassesObj) return;
    if (!results.faceLandmarks || results.faceLandmarks.length === 0) {
      glassesObj.visible = false;
      if (faceObj) faceObj.visible = false;
      if (this.faceSeen) {
        this.faceSeen = false;
        this.onTrack("lost");
      }
      sm.ready = false;
      return;
    }
    glassesObj.visible = true;
    if (faceObj) faceObj.visible = CFG.occluder;
    if (!this.faceSeen) {
      this.faceSeen = true;
      this.onTrack("locked");
    }
    const pts = toPixels(results.faceLandmarks[0], this.video);
    const lEye = eyeMid(pts, LM.leftEyeInner, LM.leftEyeOuter);
    const rEye = eyeMid(pts, LM.rightEyeInner, LM.rightEyeOuter);
    const nose = toV(pts, LM.noseBridge);
    const nTip = toV(pts, LM.noseTip);
    const fHead = toV(pts, LM.forehead);
    const chn = toV(pts, LM.chin);
    const lTmp = toV(pts, LM.leftTemple);
    const rTmp = toV(pts, LM.rightTemple);
    const lChk = toV(pts, LM.leftCheek);
    const rChk = toV(pts, LM.rightCheek);
    const eMid = mid(lEye, rEye);
    const eW = lEye.distanceTo(rEye);
    const tW = lTmp.distanceTo(rTmp);
    const cW = lChk.distanceTo(rChk);
    const fW = Math.max(eW, tW, cW);
    const fH = fHead.distanceTo(chn);
    const xAxis = rEye.clone().sub(lEye).normalize();
    const yRaw = fHead.clone().sub(chn).normalize();
    const zAxis = xAxis.clone().cross(yRaw).normalize();
    if (zAxis.z < 0) zAxis.negate();
    const yAxis = zAxis.clone().cross(xAxis).normalize();
    const rotMat = new THREE.Matrix4().makeBasis(xAxis, yAxis, zAxis);
    const targetQuat = new THREE.Quaternion().setFromRotationMatrix(rotMat);
    targetQuat.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI));
    const btt = nTip.clone().sub(nose);
    const depAdj = clamp(btt.length() * 0.1, 0, 6);
    const tGPos = eMid
      .clone()
      .addScaledVector(xAxis, CFG.glassesCenterX)
      .addScaledVector(yAxis, CFG.glassesDown)
      .addScaledVector(zAxis, CFG.glassesDepth + depAdj);
    const wS = fW / CFG.refHeadWidth;
    const hS = fH / CFG.refFaceHeight;
    const bS = wS * 0.7 + hS * 0.3;
    const gS = bS * CFG.glassesScale;
    const tGScale = new THREE.Vector3(gS, gS, gS);
    const mov = tGPos.distanceTo(sm.prev);
    const aDelta = qDelta(sm.gQuat, targetQuat);
    const aP = clamp(0.15 + mov * 0.015, 0.15, 0.55);
    const aR = clamp(0.2 + aDelta * 0.6, 0.2, 0.75);
    const aS = clamp(0.16 + mov * 0.01, 0.16, 0.45);
    if (!sm.ready) {
      sm.gPos.copy(tGPos);
      sm.gQuat.copy(targetQuat);
      sm.gScale.copy(tGScale);
      sm.ready = true;
    } else {
      sm.gPos.lerp(tGPos, aP);
      sm.gQuat.slerp(targetQuat, aR);
      sm.gScale.lerp(tGScale, aS);
    }
    sm.prev.copy(tGPos);
    glassesObj.position.copy(sm.gPos);
    glassesObj.quaternion.copy(sm.gQuat);
    glassesObj.scale.copy(sm.gScale);
    glassesObj.updateWorldMatrix(true, true);
    if (faceObj && CFG.occluder) {
      const posAttr = faceObj.geometry.getAttribute("position") as THREE.BufferAttribute;
      let cx2 = 0;
      let cy2 = 0;
      let cz2 = 0;
      const fwdOff = 8;
      for (let fi = 0; fi < FACE_OVAL.length; fi++) {
        const fv = toV(pts, FACE_OVAL[fi]);
        fv.addScaledVector(zAxis, fwdOff);
        posAttr.setXYZ(fi + 1, fv.x, fv.y, fv.z);
        cx2 += fv.x;
        cy2 += fv.y;
        cz2 += fv.z;
      }
      cx2 /= FACE_OVAL.length;
      cy2 /= FACE_OVAL.length;
      cz2 /= FACE_OVAL.length;
      const coneD = fW * 0.5;
      posAttr.setXYZ(0, cx2 - zAxis.x * coneD, cy2 - zAxis.y * coneD, cz2 - zAxis.z * coneD);
      posAttr.needsUpdate = true;
    }
  }

  dispose() {
    this.stopped = true;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    try {
      this.landmarker?.close();
    } catch {
      /* ignore */
    }
    this.landmarker = null;
    if (this.scene) disposeObject(this.scene);
    this.bg?.dispose();
    this.renderer?.dispose();
    this.renderer?.domElement.remove();
    this.renderer = null;
    this.scene = null;
  }
}
