# Topic V2 全量适配执行状态

最后更新：2026-11-23

## 当前目标

将 63 篇专题统一接入 `TopicArticleLayout`，保留原科学正文及图解，完成页面、移动端、搜索、导航和构建验收，建立独立分支并创建未合并 PR。

## 已完成

- 从远程 `main`（PR #15 合并后）建立 `feat/topic-article-v2-full-rollout`。
- 两类专题路由已统一使用数据驱动 V2 模板；M01–M09 的 63 篇专题静态页面均通过结构检查。
- 已整合专题已有的原创图解和交互组件；读长图只在相应专题显示。
- 完成 63 篇专题 × 7 个屏幕宽度浏览器检查、63 篇前后导航检查、15 项专题交互、SVG 放大以及 Pagefind 搜索检查。
- 生成 63 张桌面截图、9 张手机长页截图、九个领域联系表、63 页总览联系表和 M01 样板前后对照图。
- `npm run check`、`npm run build`、`npm run validate`、`npm run coverage` 通过。
- `npm run test:figure-a11y` 通过；补齐手机宽表横向滑动提示，并使短公式不溢出时按实际情况跳过键盘滚动断言。
- 已完成 `docs/topic-article-v2-full-rollout-report.md`。

## 待处理

1. 整理截图和验证结果，复制交付 ZIP 与报告到任务输出目录。
2. PR #16 `https://github.com/hao1006sy-source/phytomethods/pull/16` 已创建，最新提交 `8c6a7b2899ce755605131cbf7010a7f3ad67aec2`。
3. CI `validate` 已通过：`https://github.com/hao1006sy-source/phytomethods/actions/runs/45091141957/job/137420719518`。PR 保持打开且未合并。

## 当前边界

不改动专题 Markdown 科学正文；不合并 PR；不部署正式网站。
