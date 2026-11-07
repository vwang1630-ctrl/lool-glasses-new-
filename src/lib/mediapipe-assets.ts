// Self-hosted MediaPipe engine files (public/mediapipe/, long-cached via
// public/_headers). The wasm dir is pinned to the npm @mediapipe/tasks-vision
// version in package.json — bump both together (new version = new directory).
// The model is byte-identical to Google's face_landmarker float16/1.
export const MEDIAPIPE_WASM_BASE = "/mediapipe/tasks-vision-0.10.34/wasm";
export const FACE_LANDMARKER_MODEL = "/mediapipe/face_landmarker-float16-1.task";
