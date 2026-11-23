# PhytoMethods Tutorial V3 布局修复报告

## 修复内容

教程详情页共用 `.tv3-hero`、`.tv3-columns` 与 `.tv3-resources`。旧样式通过 Hero 右侧负空间和资源栏负上边距安排位置，并在桌面端使用固定侧栏宽度。该组合让资源栏脱离正常纵向文档流；浏览器缩放和可用宽度改变时，容易与页首或正文发生挤压。

本轮仅修改教程 V3 专属 CSS：取消 Hero 的右侧预留和资源栏负上边距；桌面端使用 `minmax()` 列轨道并为子项设置 `min-width: 0`；1100px 以下改为目录加正文双栏、资源卡片移至正文后；1000px 以下切为单栏；700px 以下资源卡片单列。保留资源内容、验证状态、目录和教程正文。

## 修复前后几何数据

CAFE 5 修复前由 Edge DOM `getBoundingClientRect()` 测得：

| 视口 | Hero 右边界 / 右侧预留 | 内容列范围 | 资源栏范围 | 资源栏与内容起始 Y |
| --- | ---: | ---: | ---: | ---: |
| 1600×900 | 1268px / 294px | 38–1562px | 1292–1562px | 94px / 312px |
| 1280×800 | 994px / 258px | 28–1252px | 1012–1252px | 64px / 324px |
| 1024×768 | 738px / 258px | 28–996px | 756–996px | 109px / 369px |

标准尺寸的基线截图中，资源栏横向边界仍在视口内；截图报告的右侧裁切未能在当前浏览器的这些标准尺寸复现。DOM 数据确认资源栏依赖 `margin-top:-218px`（中等宽度为 `-260px`）上移，Hero 使用 `margin-right:294px`（中等宽度为 `258px`）。这造成资源栏覆盖页首垂直区域并使布局依赖固定像素补偿。修复后删除这两种补偿，资源栏回归共享 Grid 的正常文档流。

## 浏览器测试

Edge 真实浏览器测试结果：

- 10/10 教程页面：Hifiasm、OrthoFinder、SyRI、Bismark、PLINK、模拟 GWAS、Scanpy、WGCNA、EDTA、CAFE 5。
- 10 篇 × 8 个视口，共 80 组布局检查：1920×1080、1600×900、1440×900、1280×800、1024×768、768×1024、390×844、375×812。
- 检查 Hero、三栏容器、目录、正文、资源栏和 4 张资源卡片的实际矩形边界；断言没有越界或相互重叠，并校验桌面三栏、平板双栏和窄屏单栏顺序。80 组全部通过。
- 浏览器缩放对应的有效 CSS 视口检查：100%→1600px、125%→1280px、150%→1067px、200%→800px，4 组均未越界或重叠。该项通过响应式视口尺寸模拟，浏览器 UI 缩放倍率本身未单独控制。
- 原有完整回归脚本：10 篇、70 次页面载入和响应式检查；19 个代码块复制、76 次目录跳转、71 个站内链接，0 个页面异常。
- 验证状态仍为 7 篇 `verified`、3 篇 `template`。

## 工程检查

- `npm ci`：通过，安装 413 个依赖包，审计报告 0 漏洞。
- `npm run check`：通过，0 errors / 0 warnings / 0 hints。
- `npm run build`：通过，生成 279 个页面，Pagefind 索引 279 页。
- `npm run validate`：通过，包含构建、链接、领域、知识图谱和专题 Markdown 检查。
- `npm run coverage`：通过，9 个研究领域均完成覆盖统计。
- `npm run test:knowledge-integrity`：通过，13 项断言全部通过。
- `git diff --check`：通过。

## 截图与数据

- 修复前：`outputs/tutorial-v3-layout-fix/before/`
- 修复后各页截图和尺寸报告：`outputs/tutorial-v3-layout-fix/after/`
- CAFE 5 前后并排对照：`outputs/tutorial-v3-layout-fix/comparison/cafe5-before-after.png`
- 既有教程交互回归：`outputs/tutorial-v3-layout-fix/regression/`
- 布局专项脚本：`scripts/browser-test-tutorial-v3-layout-fix.mjs`

修复前标准视口截图未复现用户截图所见的水平裁切；交付截图展示本轮修复后的实际桌面、平板和手机页面，DOM 边界报告保留完整测量数据。
