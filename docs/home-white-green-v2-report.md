# PhytoMethods 首页白绿 V2 改版报告

## 改版范围

本轮沿用未合并的首页 PR 分支，在现有 V1 首页结构上做 V2 视觉细化。保留 Astro、Content Collections、Pagefind、GitHub Pages 子路径、九大领域路由和所有专业正文、论文元数据。

## 设计变量

| 用途 | 色值 |
| --- | --- |
| 页面底色与内容表面 | `#FFFFFF` |
| 深森林绿标题 | `#123C2B` |
| 主要交互绿 | `#117750` |
| 悬停绿 | `#0A6042` |
| 薄荷色领域卡片与热词底 | `#F1F8F3` |
| 边框 | `#CFE1D5` |
| 正文 | `#20352B` |
| 辅助文字 | `#63766B` |

首页采用思源黑体／Noto Sans SC 中文字族，英文与数字使用本地托管的 Inter Variable；标题通过字号、字重和字间距建立层级。Inter 字体文件附带 SIL Open Font License 文本。首页组件继续使用 `home.css` 的局部变量和 `.home-body` 作用域；全站基础底色、内容页样式没有修改。

## 主要修改文件

- `src/styles/home.css`：统一 V2 绿白色变量；为 Hero 增加跨栏薄荷波形；优化图片融合、桌面端出血范围及手机端展示；扩大领域图标区并将领域编号改为浅绿徽标；资源和工具列表改用无衬线字。
- `src/assets/fonts/InterVariable.woff2` 与 `Inter-OFL.txt`：添加 Inter Variable 英文字体资源和对应许可文本。
- `src/pages/index.astro`：Hero 改用横幅式水稻植物配图，保留现有搜索、领域和内容数据逻辑。
- `public/assets/home/botanical/rice-panicle-photo-v5.png`：新增原创生成的写实风格水稻视觉素材，采用更细致的金黄色稻穗、带叶脉的绿色叶片、纯白与轻薄荷色背景；该素材用于视觉呈现，不代表实测植物样本或研究数据。
- `public/assets/home/botanical/rice-line-art.svg`：保留原有水稻线稿资源，供后续页面继续使用。
- `public/assets/home/icons/m01-genome-assembly.svg` 至 `m09-regulatory-ai.svg`：统一 64×64 画布、2px 线条、森林绿配色；进一步校准系统树、GWAS 信号、核小体和调控网络图形。
- `src/layouts/Base.astro`：仅首页品牌符号采用实心叶片标识；内页原标识保留。
- `src/layouts/Base.astro`：在页面载入和字体加载后补充执行可横向滚动区域的键盘可访问性标记，修复 M03 公式区初始排版完成后未及时获得焦点属性的问题。
- `docs/home-white-green-v2-report.md`：本报告。

首页结构、搜索和结构化内容读取沿用已有 `src/pages/index.astro`，精选方法 ID、真实更新日期及文献教程关联均保持原数据源。

## 三轮视觉验收

- 第一轮按交付图对照白底、薄荷波形、领域卡片、绿色图标与资源区；依据用户反馈，将 Hero 右侧升级为稻穗与叶片写实视觉并继续改进植物纹理。
- 第二轮针对截图调整了叶片叶脉、领域图标轮廓与尺寸、资源列表字体、首页品牌标识、图片边缘融合和手机端展示位置；复查 1440×900、1280×900、768×1024、390×844、375×812。
- 五种视口下文档宽度分别与视口一致，九个领域卡片均存在，水稻图成功加载，标题与搜索按钮可见。
- 最终桌面和手机截图：`outputs/home-white-editorial/v2-typography-final-1440x900.png`、`outputs/home-white-editorial/v2-typography-final-390x844.png`；另有 5 种宽度的整页截图。
- 最终视口截图由本地 Astro 页面 `http://127.0.0.1:4321/phytomethods/` 渲染，加载真实子路径资源；浏览器确认 Inter 文件加载，检查五种宽度、搜索和 M01 领域跳转。

## 功能和自动化检查

- `npm run validate`：通过。Astro 检查 64 个文件，0 错误、0 警告、0 提示；静态构建 279 个页面；Pagefind 索引 279 页、38,426 个词；首页推荐配置检查通过；10,058 个本地链接 0 错误。
- `npm run test:figure-a11y`：通过。375、768、1280、1440px 下图解键盘滚动、菜单选择、图表放大、焦点管理和文档溢出检查通过。
- 浏览器逐项点击：首页移动菜单、Hifiasm 搜索表单、M01 领域入口、Hifiasm 工具、最新专题、论文和教程链接均到达目标路径。
- 公开搜索实测：`Hifiasm` 返回 24 条，`泛基因组` 返回 53 条结果。

## 截图文件

- 改版前桌面：`outputs/home-white-editorial/before-v2-1440x900.png`
- 改版前手机：`outputs/home-white-editorial/before-v2-390x844.png`
- 改版后桌面视口：`outputs/home-white-editorial/v2-typography-final-1440x900.png`
- 改版后手机视口：`outputs/home-white-editorial/v2-typography-final-390x844.png`
- 改版后完整 1440、1280、768、390、375px 页面：`outputs/home-white-editorial/v2-typography-final-{1440,1280,768,390,375}-full.png`
- 1440px 前后对比：`outputs/home-white-editorial/v2-typography-before-after-20261122.png`
- 390px 前后对比：`outputs/home-white-editorial/v2-before-after-390x844.png`

## 发布状态

此前 PR #10 已合并。PR #11 已包含首页参考图校准、配图、图标和字体改进；用户已授权直接合并。最新字体实现已本地构建验收，待推送后重新执行 PR CI。

最终审阅截图来自本地 Astro 页面，部署用的 GitHub Pages `/phytomethods/` 子路径保持原样。生成式水稻配图用于首页视觉设计，不作为真实标本照片或科学数据。
