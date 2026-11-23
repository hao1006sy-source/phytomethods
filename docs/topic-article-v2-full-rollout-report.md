# PhytoMethods 63 篇专题 V2 全量适配报告

日期：2026-11-23  
分支：`feat/topic-article-v2-full-rollout`  
目标：以已验收的 M01 专题 V2 页面为统一模板，将 M01–M09 全部 63 篇专题接入同一数据驱动布局，保留既有正文、科学图解、路径和关联数据。

## 实施结果

- M01–M09 每个领域各 7 篇，共 63 篇专题均使用 `TopicArticleLayout`。既有专题 URL、Markdown 正文和科学内容保持原样。
- 两种专题路由统一使用 Astro Content Collections 和 `topicMetadata` 提供的稳定 ID 与关系数据。面包屑、领域目录、上一页/下一页、工具、论文和教程由页面数据生成。
- 领域目录显示 Markdown 实际标题，避免元数据短标题与已发布正文标题不同步时出现目录错配。
- 新增中央图解注册组件，将各专题已有的原创 SVG、科研图解和交互演示纳入共享模板。将已有测序读长示意图限定在 M01“测序技术与原始数据”文章中，避免其他带表格的文章错误插入该图。
- 专题要点从专题摘要和关键概念生成；已验收样板仍沿用其明确配置的两条要点。
- 文章目录包含二、三级标题，图表和宽表保留小屏横向查看能力，目录和图表控制均提供键盘可达结构。

## 专题覆盖清单

专题 ID、路径、标题、领域、排序、目录目标、布局和图解组件检查明细记录在 `outputs/topic-v2-full-rollout/topic-acceptance.json`。该文件由 `scripts/check-topic-v2-rollout.mjs` 从实际内容和构建结果生成。63/63 通过，0 项失败。

| 领域 | 页面数 | 截图目录 |
| --- | ---: | --- |
| M01 测序与基因组组装 | 7 | `outputs/topic-v2-full-rollout/verified-v2/screenshots/desktop/M01/` |
| M02 基因组注释与重复序列 | 7 | `outputs/topic-v2-full-rollout/verified-v2/screenshots/desktop/M02/` |
| M03 泛基因组与结构变异 | 7 | `outputs/topic-v2-full-rollout/verified-v2/screenshots/desktop/M03/` |
| M04 比较基因组学与进化 | 7 | `outputs/topic-v2-full-rollout/verified-v2/screenshots/desktop/M04/` |
| M05 群体遗传与驯化 | 7 | `outputs/topic-v2-full-rollout/verified-v2/screenshots/desktop/M05/` |
| M06 全基因组关联分析与育种 | 7 | `outputs/topic-v2-full-rollout/verified-v2/screenshots/desktop/M06/` |
| M07 表观基因组与三维基因组 | 7 | `outputs/topic-v2-full-rollout/verified-v2/screenshots/desktop/M07/` |
| M08 单细胞与空间组学 | 7 | `outputs/topic-v2-full-rollout/verified-v2/screenshots/desktop/M08/` |
| M09 调控网络与组学人工智能 | 7 | `outputs/topic-v2-full-rollout/verified-v2/screenshots/desktop/M09/` |

每篇专题已生成 1600×900 桌面截图；每个领域生成一张 390px 手机长页截图。截图位置与自动化结果一并打包交付。

## 测试与结果

| 检查 | 结果 |
| --- | --- |
| `npm run check` | Astro/TypeScript 检查通过，0 error、0 warning、0 hint |
| `npm run build` | 构建通过，生成 279 个页面并建立 Pagefind 索引 |
| `npm run validate` | 构建、首页推荐、领域页面、站内链接检查通过；10,517 条本地链接、0 错误 |
| `npm run coverage` | 63 篇已发布专题及现有内容集合统计通过 |
| `npm run test:figure-a11y` | 通过；检查 375、768、1280、1440px 下的公式、宽表、交互图、键盘滚动、放大对话框和焦点恢复 |
| 专题 V2 内容检查 | 63/63；标题、英文标题、领域目录、当前专题、TOC 锚点、特殊图表范围均通过 |
| 浏览器多视口检查 | 63 篇 × 7 种视口，共 441 项页面检查；0 页面错误、0 控制台错误 |
| 专题导航检查 | 63/63 上一篇/下一篇次序与章节跳转通过 |
| SVG 放大检查 | 所有具备放大入口的文章完成打开、关闭与焦点恢复检查 |
| 交互专项 | 15/15 专题控件状态变化通过；单倍型演示播放、暂停、重置，手机导航和手机目录展开/收起通过 |
| Pagefind 浏览器检索 | “Hifiasm”返回 24 条，“测序技术与原始数据”返回 16 条 |

浏览器宽度：1600、1440、1280、1024、768、390、375px。全量页面检查无页面级横向溢出。

图表无障碍回归发现手机端宽表没有滑动提示，已在 V2 专题样式中补齐提示。旧测试曾要求一条可完整显示的短公式也必须溢出；测试现按实际溢出状态验证，公式过宽时检查键盘滚动，完整显示时无需滚动。更新后 `npm run test:figure-a11y` 通过。

## 内容与已知问题

- 本轮没有编辑 63 篇专题 Markdown 正文，也没有新增或替换论文事实；内容回归检查比较了页面标题、目录标题和稳定 ID。
- 专题内容科学准确性不属于本轮视觉与模板验收范围。
- M04 一篇既有文章截图显示正文中存在未渲染的 Markdown `**` 标记；内容源属于既有文本，本轮保留以避免未经授权改动科学正文。建议后续内容修订时修复格式。
- “通过浏览器检查”指本地 Astro 预览站点上的 Playwright/Edge 测试。本报告不声称远程 GitHub Pages 已部署。

## 文件变更

- 共用模板与样式：`src/components/article-v2/TopicArticleLayout.astro`、`src/components/article-v2/article-v2.css`
- 专题图解注册及读长图：`src/components/article-v2/TopicArticleFigures.astro`、`src/components/article-v2/SequencingReadLengthFigure.astro`
- 结构化专题要点：`src/data/topic-article-v2.ts`
- 路由适配：`src/pages/topics/[domain]/[topic].astro`、`src/pages/topics/genome-assembly/[slug].astro`
- 自动化验收：`scripts/check-topic-v2-rollout.mjs`、`scripts/browser-test-topic-v2-rollout.mjs`、`scripts/browser-test-topic-v2-navigation.mjs`

## 发布状态

开发分支：`feat/topic-article-v2-full-rollout`。报告提交：`a606bc0`。PR #16：<https://github.com/hao1006sy-source/phytomethods/pull/16>，状态 Open，目标 `main`，未合并。最新 CI `validate` 于 2026-11-23 通过：<https://github.com/hao1006sy-source/phytomethods/actions/runs/45091507319/job/137421894220>。
