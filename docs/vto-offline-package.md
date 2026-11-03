# AR 眼镜试戴插件(自研方案 v0.1)

> 目标:复刻 Zeelool 商品页那种"AR Try-On"实时试戴插件,用**真开源组件**自建,不依赖任何商用 SDK。
> Demo 页:`ar-tryon/index.html`(浏览器打开即用,需 HTTPS/localhost)。

---

## 一、Zeelool 那个插件到底是什么(拆解)

点 Zeelool 商品页的 AR 试戴后,背后发生的事只有四步:

```
摄像头视频流 → 人脸 AI 检测(关键点+头部姿态) → 读该 SKU 的镜框参数/模型 → 逐帧合成到画面上
```

| 环节     | Zeelool 的做法                          | 本插件的做法                                                                 |
| -------- | --------------------------------------- | ---------------------------------------------------------------------------- |
| 人脸检测 | 商用级人脸跟踪(疑似 Banuba 系 SDK,闭源) | Google **MediaPipe FaceLandmarker**,478 个关键点(含瞳孔),Apache-2.0 免费商用 |
| 镜框资产 | 每款眼镜一个 3D 模型,进厂商的模型库     | 每款眼镜 = **一张透明 PNG + 三个参数**,或(升级路线)GLB 3D 模型               |
| 渲染     | WebGL 3D 渲染                           | Canvas 2D 贴图(v1)/ Three.js 3D(v2)                                          |
| 隐私     | —                                       | **全程本地运行**,视频帧不出浏览器(可当卖点写上详情页)                        |

结论:没有可以直接"拿来的 Zeelool 插件"。GitHub 上最接近的 [jeelizGlassesVTOWidget](https://github.com/jeeliz/jeelizGlassesVTOWidget) 看着开源,**实为商用许可**,镜框模型还必须托管进它家 GlassesDB,自定义模型要联系商务——等于被卡脖子。所以走 MediaPipe 自建路线。

## 二、技术选型(为什么不选别的)

| 方案                                 | 许可               | 判断                                                                      |
| ------------------------------------ | ------------------ | ------------------------------------------------------------------------- |
| **MediaPipe FaceLandmarker**(Google) | Apache-2.0         | ✅ 本方案核心。纯浏览器端推理(WASM/GPU),给 478 关键点 + 头部 4×4 变换矩阵 |
| jeelizGlassesVTOWidget               | 商用许可           | ❌ 非真开源,模型入库受制于人                                              |
| Banuba / Perfect Corp                | 商业闭源、按月收费 | ❌ 冷启动零投流纪律下不烧这个钱                                           |
| Three.js                             | MIT                | ✅ v2 做 3D 模式时用                                                      |

## 三、核心算法(参数是怎么"合成"上去的)

每帧从 478 关键点里取 3 个:

- **468 / 473** = 左右瞳孔中心 → 得到 `锚点`(瞳孔中点)、`屏上瞳距 pd`(像素)、`侧倾角 roll`
- 瞳距 pd 自动随人脸远近缩放 → **眼镜自动跟着变大变小,不用任何额外距离传感器**

合成公式(也就是 demo 页三个滑杆的数学含义):

```
镜框绘制宽度 w = pd × widthRatio    (widthRatio ≈ 2.0~2.3,成年人镜框全宽≈瞳距的2倍出头)
垂直下移  oy = pd × offsetRatio     (默认 0:镜梁正对瞳孔连线;正=下移,负=上移。站主测试结果修改 2026-10-11)
旋转      θ  = roll × rotFollow     (头部歪,镜框跟着歪;0=不跟,1=全跟)

动态镜腿(追加需求 2026-10-11):
- 铰链点 = 镜框左右外缘,垂直中心偏上 15%,随 θ 同步旋转
- 末端 = MediaPipe 耳前轮廓点 234(佩戴者右耳)/454(左耳)
- 镜腿粗细 ≈ pd × templeWidthRatio(缺省 0.04),颜色 = templeColor(缺省取商品图边缘主色)
- 偏航补偿 = 鼻尖(1)→眼外角(33/263)水平距离比 yaw=(dR−dL)/(dR+dL);
  近侧镜腿全伸,远侧按 farShrink=1−min(|yaw|,0.6)(≥0.35)收短 → 近长远短,远腿不穿脸颊
```

**这就是"Zeelool 参数"的本质:每款 SKU 一组 `(widthRatio, offsetRatio, rotFollow)` + 一张透明正面图。** 运营在 demo 页上传商品图、拖滑杆调到贴合,把三格数值记进 `products.json` 即上架一款可试戴商品——不需要建模师。

## 四、怎么跑起来

**整个包零外网依赖**(AI 模型已打进 `vendor/`),把 `ar-tryon/` 整个文件夹原样上传到你网站的任意目录(如 `/tryon/`),访问即用。

唯一硬规定:摄像头 API 要求 **HTTPS 或 localhost**——你的正式站点本身是 HTTPS,直接满足;本地测试:

```powershell
# 在 ar-tryon 目录下任选一种:
python -m http.server 8080      # 然后浏览器开 http://localhost:8080
npx serve -l 8080
```

注意:直接双击 index.html(file:// 方式)开不了摄像头,必须走上面两种方式之一。

## 五、文件清单

| 文件                       | 说明                                                                                   |
| -------------------------- | -------------------------------------------------------------------------------------- |
| `index.html`               | 单文件插件 Demo:摄像头 + 人脸跟踪 + 参数合成 + 拍照导出 + 上传自有商品图(自动裁透明边) |
| `products.example.json`    | 商品参数规范 v0.1(每款眼镜一条记录;可选 `templeColor`/`templeWidthRatio` 镜腿参数)     |
| `vendor/vision_bundle.mjs` | MediaPipe FaceLandmarker 引擎(Apache-2.0)                                              |
| `vendor/wasm/`             | WASM 运行时(SIMD/非 SIMD 两版自动适配)+ 人脸模型 face_landmarker.task                  |

## 六、v2 升级路线(3D 真立体,带镜腿)

MediaPipe 同时输出 **facialTransformationMatrix(4×4 头部位姿矩阵)**,喂给 Three.js 直接把 3D 镜框模型钉在脸上:

```js
// FaceLandmarker 开 outputFacialTransformationMatrixes 后,每帧:
const m = res.facialTransformationMatrixes[0].data; // 16 个浮点,列主序
const mat = new THREE.Matrix4().fromArray(m);
glassesModel.matrixAutoUpdate = false;
glassesModel.matrix.copy(mat).multiply(modelLocalOffset); // 模型再乘一个手工标定偏移
```

需要:每款眼镜一个 GLB 模型(Blender 建一次,后来复用铰链模板)。v1 的 2D 版对电商转化已够用——Zeelool 自己也同时提供 2D 照片试戴模式。

## 七、红线自查

- 开工前已查 `docs/library/INDEX.md`:库内无 AR/试戴资产,属新能力域,无重复发明(红线①)
- 本文件 + index.html + products.example.json 已登记 INDEX(红线②)
- 未引用任何无出处数字;Zeelool 疑似 Banuba 系为网络资料推断,标 **T4** 待验证(红线③)
- 未抓取/未反编译 Zeelool 任何代码或模型,参数格式为自定义,无侵权风险

---

## 八、追加需求:镜腿架耳(2D 动态镜腿,2026-10-11)

### 一、问题

2D 贴图方案下,商品正面图里的镜腿只有一小截,没有延伸到耳朵,视觉上像镜框直接插进脸颊。

### 二、修改内容

1. **动态镜腿绘制**
   - 取 MediaPipe 耳前轮廓点 **234/454**(tragion)作为耳朵锚点。
   - **图层顺序:先画腿、后画框**,镜框盖住铰链接缝。
   - 铰链点 = 镜框左右外缘,垂直中心偏上 15%,随镜框旋转角 θ 同步转动。
   - 镜腿粗细 ≈ `pd × templeWidthRatio`,颜色 = `templeColor`(缺省取商品图边缘主色,读不到时回退深色 `#1a1a1a`)。
2. **偏航自动伸缩**
   - 用鼻尖(1)→左右眼外角(33/263)的水平距离比估算偏航:`yaw = (dR − dL) / (dR + dL)`。
   - 头向左转时左镜腿缩短、右镜腿伸长(透视近长远短),反之亦然。
   - 主体透视来自"耳点锚定在轮廓点"的投影本身;yaw 只用来把远侧镜腿再收短(`farShrink`),避免远腿横穿脸颊。
3. **商品参数表新增可选项**(products.example.json)
   - `templeColor`(镜腿颜色,缺省取商品图边缘主色)
   - `templeWidthRatio`(镜腿粗细比,缺省 0.04)

### 三、已知局限(如实告知)

- 2D 镜腿是"画"上去的,**大角度侧脸(>45°)时贴耳精度下降**——耳锚点接近遮挡边缘,镜腿只是近似。
- **彻底解决需 v2 3D 模式**:GLB 模型自带镜腿,由头部姿态矩阵驱动,无此问题。

### 四、验收标准(新增)

1. 正面平视时,两条镜腿清晰可见且末端落在耳朵前侧轮廓上。
2. 头部缓慢左右转 30°,同侧镜腿缩短、对侧伸长,无穿模进脸颊的情况。
3. 佩戴大框商品图时镜腿不被镜框图遮挡出戏(镜腿图层在镜框之下)。
