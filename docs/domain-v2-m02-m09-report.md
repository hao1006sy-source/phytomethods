# M02–M09 领域页 V2 批量改版报告

日期：2026-11-23  
分支：`feat/domain-v2-m02-m09`  
状态：本地开发与回归验收完成，待 PR 审查；未合并、未部署。

## 实施内容

- 新增 `DomainPageV2.astro`，M02–M09 共用一套 Hero、三栏导航、五步路线、专题列表、工具、文献和教程资源组件。M01 继续使用原有 `M01Domain.astro`。
- 新增 `src/data/domain-v2-m02-m09.json`，只保存英文标题、领域导读、路线阶段、推荐工具 ID、相关领域 ID 与图解标识。领域名称从 `domains.ts` 读取；专题标题、简介和发布状态从正式内容元数据及专题集合读取；工具、论文和教程按现有内容集合及发布状态生成。
- 新增 M02–M09 八张原创 SVG：基因结构、样本变异路径、系统发育树、PCA 群体分布、Manhattan 图、甲基化与 Hi-C 接触矩阵、单细胞群体分布、候选调控网络。图均有标题、描述和“简化教学图形”说明。
- M02、M03 的 `AnnotationOverview` / `AnnotationFigure`、`PangenomeOverview` / `PangenomeFigure` 仍在各自领域页详细区渲染。
- 新增 `scripts/check-domain-v2.mjs`，校验八个配置、56 个已发布专题、24 个工具引用、关联领域 ID、SVG 可访问性元数据及 M02/M03 旧导读组件；并纳入 `npm run validate`。
- 仅共享 CSS 中修正表格选择器语法，M01 文章源码及内容未修改。M01 桌面截图与附件批准图一并保存供回归查看。

## 页面与资源

| 领域 | 页面 | 原理图 | 旧导读保留 |
| --- | --- | --- | --- |
| M02 | `/phytomethods/topics/genome-annotation/` | 基因结构注释 | 是 |
| M03 | `/phytomethods/topics/pangenomics-structural-variation/` | 泛基因组样本路径 | 是 |
| M04 | `/phytomethods/topics/comparative-genomics/` | 系统发育树拓扑 | — |
| M05 | `/phytomethods/topics/population-genetics/` | PCA 群体分布（示意点） | — |
| M06 | `/phytomethods/topics/gwas-breeding/` | Manhattan 关联图（示例） | — |
| M07 | `/phytomethods/topics/epigenomics-3d-genome/` | 甲基化与接触矩阵 | — |
| M08 | `/phytomethods/topics/single-cell-spatial-omics/` | 单细胞群体分布（示意） | — |
| M09 | `/phytomethods/topics/regulatory-genomics-ai/` | 有向候选调控网络 | — |

全部页面保留七条已发布专题入口；每个领域列出三个已发布工具，相关领域与论文/教程入口来自现有 ID 和内容集合。

## 验收结果

- `npm run check`：通过，0 errors、0 warnings、0 hints。
- `npm run validate`：构建、Pagefind、首页精选资源、领域配置和站内链接检查通过；构建 279 页，Pagefind 索引 279 页，站内链接检查 10,297 条、0 错误。
- `node scripts/check-domain-v2.mjs`：通过，8 个唯一配置、56 条已发布专题、24 个工具引用、8 张带无障碍标题/描述的 SVG。
- `npm run coverage`：M01–M09 均为每域 7 篇已发布专题。既有报告指出少数专题缺少方法或文献关联，这些内容关联未在本次修改。
- `npm run test:figure-a11y`：通过，375、768、1280、1440px 图表交互、键盘操作和溢出检查通过。
- Edge 浏览器实测 M02–M09 的 375、390、768、1024、1280、1440、1600px 共 56 组页面视口：56/56 无页面横向溢出；每页标题可见，均有 7 个专题、3 个工具、已加载的领域 SVG，左侧导航锚点均指向现存章节。M02、M03、M09 另保存 390px 截图。
- 八个页面的浏览器页面错误日志为空，控制台未记录页面错误。
- M01 原页面源码和专题内容未修改。批准参考图和当前 1600×900 浏览器截图存入回归比较文件。

## 截图与浏览器记录

最终截图、视口测试 CSV、控制台记录位于：`outputs/domain-v2-m02-m09/final-v5/`。

文件包括：M02–M09 八张 `1600x900` 截图、M02/M03/M09 三张 `mobile-390` 截图、M01 批准参考图及当前回归截图、56 行视口验收 CSV 和控制台错误记录。

## 发布状态

代码已在 `feat/domain-v2-m02-m09` 分支完成本地验收。下一步推送该分支并创建指向 `main` 的 PR。按任务要求，PR 保持未合并，不触发正式部署。
