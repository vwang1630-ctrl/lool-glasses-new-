# 虚拟试戴（Virtual Try-On）说明书

> 页面：`/{lang}/try-on`（如 `/en/try-on`、`/zh/try-on`）
> 一句话：**用真实摄像头 + 设备端人脸关键点追踪 + WebGL 3D 镜框模型，把眼镜实时"戴"到你脸上**，转头时镜腿跟随头部旋转。支持换色、调大小、截图保存。视频不出本机。

---

## 1. 功能定位与用户旅程

试戴页是 PDP（商品详情页）"Try on" 按钮的落地页。两个入口：

- **PDP 卡片按钮** → 带 `?frame=<slug>` 跳转，直接打开该款眼镜的试戴。
- **站内导航 / 首页 CTA** → 无参数进入，默认选中目录里第一个商品。

页内引导分 4 步（`StepsGuide` 组件实时打勾）：

1. **Allow camera** —— 授权摄像头（开始追踪）
2. **Pick a frame** —— 右侧选颜色 / 选款式，随时切换
3. **Adjust the fit** —— 尺寸滑杆（0.7×–1.4×）匹配脸宽
4. **Save your look** —— 截图导出 PNG 对比或分享

**3D 与 2D 双模式**：某一色配了 GLB 3D 模型（`tryon_model_url` 非空）就进入 **3D 模式**（WebGL 渲染真实模型，镜腿随头部旋转）；否则回退 **2D 模式**（透明 PNG 叠加，早期方案，逻辑保留）。同一会话内切换镜框可跨模式切换。

---

## 2. 技术栈与依赖

| 项              | 内容                                                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 框架            | TanStack Start (SSR) + React 19                                                                                           |
| 人脸追踪        | **MediaPipe Face Landmarker**（`@mediapipe/tasks-vision`，^0.10.34）                                                      |
| 模型            | `face_landmarker.task`（float16 版，Google Storage，单脸 `numFaces: 1`，`outputFacialTransformationMatrixes: true`）      |
| WASM            | jsDelivr CDN `@mediapipe/tasks-vision@0.10.34/wasm`                                                                       |
| 摄像头          | `navigator.mediaDevices.getUserMedia`（前置摄像头，1280×720）                                                             |
| 3D 渲染         | **three@0.160.0**：`WebGLRenderer`（`alpha/antialias/preserveDrawingBuffer`）+ `OrthographicCamera` + `GLTFLoader`        |
| 镜框模型        | GLB 二进制模型，R2 `frames-3d/` 前缀，`/images/frames-3d/<file>` 同源出口                                                 |
| 3D 背景         | 镜像视频作为 WebGL 场景背景 quad（`VideoTexture` + `repeat.set(-1,1)` + `offset.set(1,0)` 镜像）→ 截图含视频+眼镜合成画面 |
| 2D 叠加（回退） | `<canvas>` 2D 逐帧描镜像视频 → 叠加透明镜框 PNG                                                                           |
| 截图            | `canvas.toDataURL("image/png")` 触发浏览器下载（3D 用 overlay canvas，`preserveDrawingBuffer` 保证取帧）                  |
| 埋点            | `trackCustomerEvent()` → `POST /api/customer/audit-log`（sendBeacon）                                                     |

**隐私红线**：追踪用 MediaPipe 在**浏览器本地 WASM** 完成；摄像头流从不上传，页面文案也写明 "no video leaves your device"。

---

## 3. 文件地图

| 文件                                   | 职责                                                                                               |
| -------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `src/routes/$lang/try-on.tsx`          | ⭐ 唯一页面文件：路由、状态、追踪循环、3D/2D 渲染、UI                                              |
| `src/data/products.ts`                 | `Product` / `ColorImages` 类型（`framePng`、`tryonImageUrl`、`tryonModelUrl` 字段）                |
| `src/lib/use-catalog-products.ts`      | 客户端拉取 `/api/catalog` 并适配成旧 `Product` 形状（含 `tryonModelUrl`）                          |
| `src/routes/api/catalog.ts`            | 目录 API：返回每色 `tryonImageUrl` + `tryonModelUrl` + `views`（D1 数据源）                        |
| `src/server/catalog-loader.ts`         | SSR 侧同构目录加载（`tryonModelUrl` 由它带出）                                                     |
| `src/routes/images/frames-3d/$.ts`     | **3D GLB 出口**：`/images/frames-3d/<file>`，经 `serveR2Image` 带 `model/gltf-binary` Content-Type |
| `src/routes/images/product/$.ts`       | 商品图 R2 出口（`/images/product/<file>`，同源）                                                   |
| `src/routes/images/frames/$.ts`        | 透明镜框图 R2 出口（`/images/frames/<file>`，2D 模式用）                                           |
| `src/server/serve-r2-image.ts`         | R2 图响应统一处理（Content-Type / ETag / immutable cache）                                         |
| `src/lib/customer-audit.ts`            | 埋点工具（客户端 ID + sendBeacon）                                                                 |
| `src/routes/api/customer/audit-log.ts` | 埋点接收端（服务端白名单 action）                                                                  |
| `src/lib/i18n.tsx`                     | `tryon.*` 文案键（10 语言）                                                                        |

---

## 4. 数据流：谁驱动"镜框"列表

试戴页的镜框由真实商品目录驱动：

```
D1 products / product_colors
        │  （tryon_image_url / tryon_model_url / images_json / label_json / hex）
        ▼
/api/catalog  GET  →  { products: [{ colors: [{ tryonImageUrl, tryonModelUrl, images, label, hex }] }] }
        │
        ▼  useCatalogProducts().adaptProduct()
        │   tryonModelUrl = c.tryonModelUrl ?? null
        ▼
try-on.tsx
  activeProduct  ← ?frame=<slug> 匹配，兜底 products[0]
  frameOptions   ← activeProduct.colors.map(c => ({ id: color_id, name, src: tryonImageUrl ?? images[0], hex, modelUrl }))
  moreFrames     ← 目录里除当前款外 3 个随机商品（按 slug hash 确定性排序，避免渲染间乱跳）
```

- **换颜色 = 换同一款的不同色**；每色可有独立 GLB（`tryon_model_url`）或独立叠加 PNG（`tryon_image_url`）。
- **3D 优先级**：某色 `tryonModelUrl` 非空 → 3D 模式；为空 → 2D（`tryonImageUrl`，回退 `images[0]`）。
- **遗留 `FRAME_PNGS`**（`/frames/frame-*.png`）仅作"目录还没加载出来"时的最后兜底。

---

## 5. 核心渲染循环（loop）

`start()` 初始化 MediaPipe（开启 `outputFacialTransformationMatrixes`）→ 开摄像头 → 进入 `requestAnimationFrame` 循环。启动后按当前镜框是否配 GLB 决定 `modeRef`（"3d"/"2d"）与 `use3D` state。

### 每帧 `loop()` —— 3D 分支（核心）

```
1. result = landmarker.detectForVideo(video, performance.now())
2. 画布对齐视频尺寸（renderer.setSize + ortho camera left/right/top/bottom）
3. tm = result.facialTransformationMatrixes[0]  →  4×4 矩阵（column-major，Float32Array×16）
4. 构建镜像世界矩阵 WM：
     自拍视频是镜像世界：x→W−x, y→H−y（y-up）。
     WM = 手动符号翻转（x/y 取负、平移轴取 w−x / h−y）+ 保持 z
   FINAL = WM × FACE_ALIGN（Ry(π)，把 GLB 正面轴对齐到 canonical face +z）
5. 取 33（右眼外）/ 263（左眼外）眼角：
     eyeDist = 眼角距；frameW = eyeDist × 2.15 × scale；frameH = frameW × (模型高/模型宽)
     glasses.scale.setScalar(frameW / MODEL_WIDTH_M)
6. position：FINAL 平移位 + y 下移 frameH×14%（FRAME_Y_OFFSET_RATIO，让镜片对准瞳孔）；z=0（ortho）
7. quaternion：q = setFromRotationMatrix(FINAL)
     ROLL_CORRECT：用眼角连线把 in-plane roll 校准到水平（±90° 钳制保 chirality）
     平滑：q.slerp(lastQuat, 1−ROTATION_SMOOTHING=0.6) 防抖
     glasses.quaternion.copy(q)
8. 无 face 时 glasses.visible=false；renderer.render(scene, camera)
```

3D 场景构成：镜像视频背景 quad（z=−50，满视口）→ 眼镜 GLB（`glassesRef`）。灯光：Ambient 1.0 + key Directional 1.8 + rim Directional 0.5。

### 关键常量（`try-on.tsx` 顶部集中）

| 常量                               | 值             | 含义                                            |
| ---------------------------------- | -------------- | ----------------------------------------------- |
| `MODEL_WIDTH_M` / `MODEL_HEIGHT_M` | 0.145 / 0.0444 | GLB 原始尺寸（米），缩放标定用                  |
| `FRAME_WIDTH_RATIO`                | 2.15           | 镜宽 = 眼距 × 2.15 × 滑杆                       |
| `FRAME_Y_OFFSET_RATIO`             | 0.14           | 锚点下移比例，让镜片对准瞳孔                    |
| `FACE_ALIGN`                       | Ry(π)          | GLB 正面轴 → canonical 脸 +z 轴对齐             |
| `ROTATION_SMOOTHING`               | 0.6            | slerp 平滑系数（越大越稳）                      |
| `ROLL_CORRECT`                     | true           | 眼线接地校正 in-plane roll                      |
| `TRANSPOSE_MATRIX`                 | false          | 兼容层：若 MediaPipe 输出来是 row-major 翻 true |

### 2D 分支（无 GLB 回退）

```
1. 镜像画视频 → 2. 取 33/263/168 关键点（168=鼻梁顶，x 镜像）
3. eyeDist / angle / frameW = eyeDist×2.15×scale / frameH = frameW×高宽比
   锚点 = 鼻梁顶 + 下移 frameH×14%；ctx.translate/rotate/scale(1,−1)；drawImage(PNG)
```

### 生命周期

- `ensure3D()`：惰性创建 `WebGLRenderer`（挂在 overlay canvas）+ 场景 + 相机 + 镜像背景 quad；跨会话复用，避免 WebGL context 冲突。
- `GLTFLoader.loadAsync(modelUrl)`：加载 GLB → `gltf.scene` 加入场景存 `glassesRef`；失败回退 2D。
- `disposeGlb()`：从场景移除眼镜 + 遍历 dispose geometry/materials。
- `stop()`：取消 rAF、停流、`disposeGlb()`、`renderer.clear()`、重置会话状态。

---

## 6. 镜框叠加图预处理（2D 模式的"去镜片"抠白算法）

仅 2D 模式需要。普通商品图里镜片是白/亮的（产品照的"demo 镜片"），直接叠到脸上会盖住眼睛。代码在**内存 canvas** 里把近白色镜片像素 alpha 置 0：

```
onload 处理：
  1. drawImage 到离屏 canvas（保留原分辨率）
  2. 洪泛填充（flood-fill）：从左右镜片中心种子点找"亮像素"（亮度 > LUM_THRESH=90），
     四邻域扩散把与镜片中心连通的亮像素 alpha → 0；深色镜框边缘是天然屏障
  3. 形态学"瘦身" 3 遍：对仍不透明、且其 ±5px 邻域透明命中 ≥3/4 的像素 → alpha 置 0
  4. putImageData → toDataURL → new Image() → frameImgRef
  5. CORS/处理失败 → 直接回退用原图
```

**为什么图片是同源就能用**：叠加图和视频都来自本站 `/images/*`（同 origin），`crossOrigin="anonymous"` 的 `toDataURL()` 不会被污染。

---

## 7. UI 组件与交互

- **`StepsGuide`**：4 步进度卡，`done` 状态实时驱动高亮。
- **主舞台**：`aspect-[4/3]` 圆角容器；`<video>` 隐藏、2D `<canvas>` 与 3D overlay `<canvas>` 按 `use3D` 切换 `hidden`；未启动时居中 "Start camera" 按钮。
- **右上操作**（激活后）：`Save snapshot` + 关闭（`X`）。
- **右侧栏**：当前款信息卡（名字 + 价格，Link 回 PDP）、**Pick a frame** 颜色宫格、**Frame size** 滑杆、Helper tip、**More frames** 3 款商品。
- **路由参数**：`?frame=<slug>` 经 `validateSearch` 白名单解析；`head()` 固定 title `lool — Virtual Try-On`。

---

## 8. 权限与错误处理

- 摄像头被拒 / 模型加载失败 → `setError(t("tryon.error"))` + 埋点 `TRYON_FAILED`，舞台显示错误文案。
- GLB 加载失败 → 自动回退 2D（不报错打断）。
- `stop()`：取消 rAF、停掉所有 media track、`video.srcObject=null`、清空 canvas、`disposeGlb()`、重置 `snapped/scaleTouched/error/active`；组件卸载时自动调用。
- 关闭后重开 = 全新会话，不留上次状态。

---

## 9. 埋点审计

`customer-audit.ts` 客户端持有一个 localStorage 常驻 `client_id`，事件经 `sendBeacon`（兜底 fetch `keepalive`）发到 `/api/customer/audit-log`。试戴相关 action：

| action            | 触发点                | meta                                     |
| ----------------- | --------------------- | ---------------------------------------- |
| `TRYON_REQUEST`   | `start()` 成功开流    | `{ frameSlug, colorId }`                 |
| `TRYON_SUCCEEDED` | 点击 `Save snapshot`  | `{ frameSlug, colorId, snapshot: true }` |
| `TRYON_FAILED`    | 启动异常（权限/模型） | `{ frameSlug }`                          |

服务端 `audit-log.ts` 用白名单 Set 校验 action，防注入。

---

## 10. i18n 文案键（`src/lib/i18n.tsx`，10 语言）

`tryon.*`：`title / start / tip / choose / stop / snapshot / scale / loading / error / eyebrow / helperTip / more / steps.title / step1~4.{title,desc}`。

要点：`tip` 原文写明 "Tracking runs locally with MediaPipe — no video leaves your device."，`eyebrow` = "On-device tracking"——这是隐私卖点，翻译时不得弱化。

---

## 11. 数据库 schema 关联

```sql
-- 2D 叠加图（migrations/0019_per_color_imagery.sql）
ALTER TABLE product_colors ADD COLUMN tryon_image_url TEXT;   -- 每色一张可选透明 PNG

-- 3D 模型（migrations/0086_tryon_model_url.sql）
ALTER TABLE product_colors ADD COLUMN tryon_model_url TEXT;   -- 每色一个可选 GLB 路径
-- 例：/images/frames-3d/lool-tr90-square.glb（存 R2 PRODUCTS_BUCKET 的 frames-3d/ 前缀）

-- product_colors 其余相关列
-- images_json   : TEXT 顺序数组，index 0 即 hero
-- views_json    : {"front":…,"side":…,"angle":…,"detail":…} 命名角度槽
```

`/api/catalog` 返回的 `tryonImageUrl` / `tryonModelUrl` 即这两列；前端取值 `tryonModelUrl ?? null`（3D）与 `tryonImageUrl ?? images[0]`（2D）。

---

## 12. 已知问题与注意事项

1. **3D 模式依赖 GLB 模型质量**：`MODEL_WIDTH_M/MODEL_HEIGHT_M` 标定值对应某个特定模型的原始尺寸；换新模型时需重新标定（拿真实尺寸改常量），否则镜框大小/贴合不准。
2. **GLB 尺寸**：经 gltfpack 压缩后目标 <500KB（`-tw -tl 1024 -tq 7 -sa -si 0.08`）；未压缩 GLB 会让首帧变慢。
3. **遗留占位图路径可能 404**：`FRAME_PNGS` 指向 `/frames/frame-*.png`，但代码里只有 `/images/frames/` 路由。仅当某色 `images` 与 `tryon_image_url` 都为空且目录未加载时才可能踩到；正常线上不会触发，但属潜在死链。**上透明 PNG 时应优先把 `tryon_image_url` 填实**。
4. **产品图做 2D 叠加图质量一般**：`images[0]` 是 1:1 产品照，无透明背景。抠白对"亮色背景 + 深色镜框"效果好；浅色镜框可能误删镜框本身 → 建议主打款配透明 PNG 或 GLB。
5. **单脸模型**：`numFaces: 1`，多人同框只跟第一张脸。
6. **移动端**：`getUserMedia` 需要 HTTPS（本站已满足）；iOS 需用户授权后 `video.play()` 由用户手势触发（Start 按钮天然满足）。WebGL 需 iOS Safari 15.4+。
7. **性能**：3D 模式每帧 renderer.render + MediaPipe detectForVideo；`ROTATION_SMOOTHING` 降低抖动。2D 模式图片预处理一次性完成，循环内只 drawImage。
8. **`video` 元素是 `hidden` 的**：画面只经 canvas/WebGL 呈现；`playsInline muted` 保证 iOS 不弹出全屏播放。

---

## 13. 维护指南

**给一款镜框加 3D 试戴：**

1. 准备 GLB（Y-up，正面朝 +Z，镜腿朝 −Z；单位米），gltfpack 压缩到 <500KB。
2. 上传 R2 `PRODUCTS_BUCKET`，key `frames-3d/<file>.glb`，Content-Type `model/gltf-binary`。
3. D1 `UPDATE product_colors SET tryon_model_url='/images/frames-3d/<file>.glb' WHERE product_id=… AND color_id=…;`
4. 若模型原始尺寸 ≠ 0.145×0.0444m，更新 `MODEL_WIDTH_M/MODEL_HEIGHT_M` 常量。
5. 部署 Worker（`/images/frames-3d/<file>` 同源可取）。

**只加 2D 叠加图（无 GLB）：** 上传透明 PNG → `UPDATE … SET tryon_image_url='…'` → 部署。

**调贴合度：** 3D 改 `eyeDist × 2.15`、`FRAME_Y_OFFSET_RATIO`、`ROTATION_SMOOTHING`；2D 改 `LUM_THRESH / REACH / MIN_HITS` 与滑杆 `min/max`。

**验证路径：** `/en/try-on` 无参打开（默认第一款）→ `/en/try-on?frame=lool-tr90-square`（3D 款）→ 授权摄像头看贴合，**侧面转头看镜腿是否跟随** → 截图 → 检查 D1 审计表 `TRYON_*` 三事件。
