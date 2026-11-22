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

中文标题保留书卷感衬线字体，正文改为系统无衬线字体。首页组件继续使用 `home.css` 的局部变量和 `.home-body` 作用域；全站基础底色、内容页样式没有修改。

## 主要修改文件

- `src/styles/home.css`：统一 V2 绿白色变量；为 Hero 右侧添加低对比薄荷波形；缩短 Hero 纵向占用；领域卡片改为浅薄荷底，优化标题和正文层级。
- `public/assets/home/botanical/rice-line-art.svg`：改绘原创水稻植株与稻穗线稿，采用自然的穗轴、侧枝、籽粒和叶片形态。
- `public/assets/home/icons/m01-genome-assembly.svg` 至 `m09-regulatory-ai.svg`：统一 64×64 画布、2px 线条、森林绿配色，分别表达双螺旋、基因结构、变异路径、系统树、群体分布、GWAS 峰、核小体、空间细胞和调控网络。
- `src/layouts/Base.astro`：在页面载入和字体加载后补充执行可横向滚动区域的键盘可访问性标记，修复 M03 公式区初始排版完成后未及时获得焦点属性的问题。
- `docs/home-white-green-v2-report.md`：本报告。

首页结构、搜索和结构化内容读取沿用已有 `src/pages/index.astro`，精选方法 ID、真实更新日期及文献教程关联均保持原数据源。

## 两轮视觉验收

- 第一轮在 1440×900 检查了 V2 颜色、Hero 波形、水稻线稿、卡片和图标比例；随后压缩 Hero 高度，确保 900px 首屏能够看到三栏资源区。
- 第二轮在最终构建产物上检查 1440×900、1280×900、768×1024、390×844、375×812，并保存截图及前后对比图。
- 375px 下文档宽度为 375px，搜索按钮右边界为 349px。所有视口下页面文档宽度均与视口宽度相同。
- 浏览器确认首页 10 个 SVG 图片资源均完成加载；页面控制台未报告错误。

## 功能和自动化检查

- `npm run validate`：通过。Astro 检查 64 个文件，0 错误、0 警告、0 提示；静态构建 279 个页面；Pagefind 索引 279 页、38,425 个词；首页推荐配置检查通过；10,058 个本地链接 0 错误。
- `npm run test:figure-a11y`：通过。375、768、1280、1440px 下图解键盘滚动、菜单选择、图表放大、焦点管理和文档溢出检查通过。
- 浏览器逐项点击：首页移动菜单、Hifiasm 搜索表单、M01 领域入口、Hifiasm 工具、最新专题、论文和教程链接均到达目标路径。
- 公开搜索实测：`Hifiasm` 返回 24 条，`泛基因组` 返回 53 条结果。

## 截图文件

- 改版前桌面：`outputs/home-white-editorial/before-v2-1440x900.png`
- 改版前手机：`outputs/home-white-editorial/before-v2-390x844.png`
- 改版后桌面：`outputs/home-white-editorial/v2-final-1440x900.png`
- 改版后完整桌面页：`outputs/home-white-editorial/v2-final-full-1440.png`
- 改版后 1280px：`outputs/home-white-editorial/v2-final-1280.png`
- 改版后 768px：`outputs/home-white-editorial/v2-final-768.png`
- 改版后手机 390px：`outputs/home-white-editorial/v2-final-390x844.png`
- 改版后手机 375px：`outputs/home-white-editorial/v2-final-375.png`
- 1440px 前后对比：`outputs/home-white-editorial/v2-before-after-1440x900.png`
- 390px 前后对比：`outputs/home-white-editorial/v2-before-after-390x844.png`

## 发布状态

改动继续保留在 `feat/home-white-editorial` 与 PR #10，未合并、未部署。用户确认截图后再按既定流程处理合并和发布。

截图来自本地 Astro 静态构建产物在浏览器中的渲染。为通过 `file://` 本地查看资源，只在临时预览副本中调整了首页子路径资源前缀；正式源码和 GitHub Pages `/phytomethods/` 配置保持原样。
