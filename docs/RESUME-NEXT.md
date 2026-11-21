# PhytoMethods 下一次恢复入口

- 分支：`feat/long-run-m03-v2`；本地未推送提交以 `git log origin/feat/long-run-m03-v2..HEAD` 核对，远程仍在 `58c339f`。HTTPS 推送曾因 GitHub 443 连接超时失败，GitHub API Git Data 写入被集成返回 403；远程未发生本地提交内容变更。网络或连接权限恢复后执行 `git push origin feat/long-run-m03-v2`。已发布 main 基点为 `91f24bd`；M03–M09 新增内容仍为草稿，尚未合并部署。
- M03～M09 共 49 篇专题已有正文初稿；仍需逐篇深化、科学审核和正式发布态验收。M03、M04、M05 已有部分工具及论文，M06 新增 GAPIT 与 SciPy，M07 新增 Bismark，M08 新增 Scanpy，M09 新增 WGCNA。
- 七个新增领域各有一篇已实际运行的教程草稿：SyRI 使用官方拟南芥染色体测试数据；OrthoFinder 使用官方支原体示例；PLINK、GWAS、Bismark、Scanpy 和 WGCNA 使用模拟数据。后六者没有声称在本机运行真实植物数据。
- `examples/syri/verified-20261121/`、`examples/orthofinder/verified-20261121/` 及其余 `examples/` 子目录保存实际运行日志、输入说明、版本和摘要。M03 相关资料见 `docs/m03-evidence.md`。
- 最近核心页面回归：`node scripts/browser-test-v1.3.mjs`、`node scripts/browser-test-knowledge.mjs`、`node scripts/browser-test-knowledge-graph.mjs` 的桌面和移动端测试通过。M03 七篇草稿在仅开发环境的预览路由中按 375、768、1280、1440 px 检查，HTTP 200、正文标题、预览标识和横向溢出检查通过；AnchorChain、图路径和读段映射交互通过。该检查不等同于正式发布态构建或科学审核关闭。
- 最近完整构建：授权环境下 `npm run validate` 通过，Astro 检查 0 错误/警告，静态生成 54 个已发布页面，Pagefind 索引 54 页、5948 词，1276 条内部链接通过。Pagefind 索引输出位于 `pagefind-search/`，静态预览的英文/中文搜索及 `/phytomethods/` 路径通过。最近 `npm run coverage` 显示 M03 七篇专题、八个工具、14 篇论文和一篇教程仍为草稿；七专题均有结构化工具关联。八篇方法论文、EUPAN、三篇拟南芥案例和两篇水稻案例已完成四种宽度浏览器检查。3,010 水稻案例结果数和 66 份短读段组装案例方法及验证数据已对照原文复核；EUPAN 未本机运行。高粱基准现已按出版方全文复核模拟/真实组装、图完整度、变异 F1/置换检验和两类读段映射，PGGB 因索引计算与内存需求未纳入映射评估。M05-05 已本地提交 4c0c76c；M05-06 新增内容通过构建、Edge 四视口和专题→工具/案例关系检查，待本地提交。
- 数据可复核命令：`python scripts/check-plink-example.py`、`python scripts/check-gwas-example.py`、`python scripts/check-bismark-example.py`、`python scripts/generate-single-cell-demo.py --check`、`python scripts/test-pca-demo.py`、`python scripts/generate-gwas-demo.py --check`、`node scripts/test-phylogeny-demo.mjs`。
- 知识关联页已增加基于已发布内容的工具中心图，支持领域及原理筛选；上下游等关系仍待建模。新增单细胞、拟时序、共表达、GWAS 和甲基化示意图，其中模拟数据均标注。
- 已保存阶段截图至 `outputs/long-run/checkpoint-20261121-0625/`；截图反映开发分支本地构建，M03 专题仍显示筹备状态，不能当作线上发布截图。
- SyRI、OrthoFinder 和 Bismark 曾在 WSL `/tmp/phytomethods-mamba-20261121/` 隔离环境运行；当前 WSL 状态检查返回 `E_ACCESSDENIED`，暂时无法确认该环境是否仍可用，既有运行日志和摘要保存在项目验证目录。当前 Windows PATH 未发现 AnchorWave、Minigraph、ODGI、vg、PGGB、Cactus 或 EUPAN。R 独立包库和 Scanpy 虚拟环境位于项目 `work/`，属于临时环境，不应提交。
- 下一步：M05-03 的 ADMIXTURE 模型和 PLINK PCA、M05-04 的 PLINK FST/LD 实现已局部深化；水稻根系研究的 PLINK LD 筛选、ADMIXTURE $K$ 拟合及 GAPIT PCA/亲缘模型现已按 PLOS 原文分开关联。M05-05/06/07 已完成局部深化、来源核查和 DEV 四视口回归；下一步审核 M05-01/02 与其余工具/案例，再处理 M03-01 的泛基因组和家族定义及跨专题发布闭包。`npm audit` 曾因 DNS/网络超时未能取得官方审计结果，网络恢复后重试。全站草稿专题中现有 15 篇缺少工具关联，需逐题核实后补充；已发布 M01/M02 中有 3 篇专题缺少工具关联，仍待处理。完成科学审核、关联闭包、教程和发布检查后再推进 M03–M09。
- 发布前需处理跨领域关联的状态依赖：已发布专题关联的工具、论文和教程必须同时为已发布状态，论文引用的工具及工具引用的专题也必须可访问。不得删除准确的关联以绕过检查。
- 最终仍需整体科学审核、性能与可访问性检查、完整知识网络、阶段报告、合并及线上部署；当前没有声称完成或上线 v2.0。

- 2026-11-21：修复放大图解弹窗的屏幕阅读器名称与说明、SVG ID 克隆冲突、键盘关闭和焦点恢复；对横向溢出的图、表、公式和代码加上按需焦点及方向键/Home/End 滚动。M03 七专题在手机 375px 与桌面 1280px 的 axe 4.12.1 自动审计各为 0 个违规；剩余一组 KaTeX/SVG 对比度项由 axe 列为人工核查。持久回归脚本 `npm run test:figure-a11y` 验证图解弹窗四宽度、五个滚动区键盘移动、视口切换、ESC 关闭及焦点返回通过；预览地址和 Edge 路径均可配置。`npm run validate` 通过，60 个 Astro 文件零诊断，54 个静态页面、54 页 Pagefind 索引、5913 词及 1276 条内部链接完成检查；M03 保持草稿，科学审核和发布依赖仍待关闭。
- 2026-11-21：复核 ADMIXTURE 官方 1.4.0 版本记录、用户手册、2009 原始方法论文、2011 算法增强论文、2016 软件可用性记录及 3,010 水稻原文。工具页和 M05-03 补入模型似然、Q/P 约束、分块优化、输入输出、CV、投影、监督估计和 K=9 水稻结构结果；明确二进制分发与源码状态、软件未在本机实跑。新增 `admixture-enhancements` 文献记录及 `docs/m05-evidence.md`，更新科学审核、发布核对表。修复长公式移动端溢出和 Markdown 站内链接绕过 `/phytomethods/` 基路径的问题。`npm run validate`、`npm run coverage` 通过；Edge 本地预览完成 24 次多视口检查、公式可访问滚动及 M05-03/ADMIXTURE/两篇方法论文/水稻案例导航，页面脚本错误为 0。M05 及其依赖保持草稿。下一步审核 PLINK/PCA 与 M05 其他专题，并继续 M03 全文、教程及跨领域发布依赖闭合。
- 2026-11-21：依据 PLINK 1.9/2.0 官方 PCA 文档深化 PLINK 工具页，补充标准化关系矩阵、输入输出、版本默认值、参数示例及本机模拟运行边界。对照 PLOS Genetics 原文将 795 份水稻根系研究中的 PLINK LD 子集、ADMIXTURE K 拟合及 GAPIT PCA/亲缘矩阵分工写入案例、M05-03 和 GAPIT 页面。M05 余下专题与发布依赖继续审核。
- 本轮回归：授权环境 `npm run validate` 通过（Astro 零诊断、54 页构建、54 页 Pagefind/5932 词、1276 条链接）；`npm run coverage` 通过。Edge DEV 预览 16 个页面视口和专题→GAPIT→案例→PLINK 路径通过。后续继续审核 M05-04 至 M05-07 与工具/案例，再审 M03-01 和跨领域发布闭包；本地 v2.0 改动仍待推送，GitHub API/HTTPS 写入仍受权限或网络阻断。
- 本轮回归：授权环境 `npm run validate` 通过（Astro 零诊断、54 页构建、54 页 Pagefind/5932 词、1276 条链接）；`npm run coverage` 通过。Edge DEV 预览已检查 16 个前序页面视口、8 个本轮 PLINK/M05-04 视口，并验证专题→GAPIT→案例→PLINK 与 M05-04→PLINK 路径。后续继续审核 M05-05 至 M05-07 与工具/案例，再审 M03-01 和跨领域发布闭包；本地 v2.0 改动仍待推送，GitHub API/HTTPS 写入仍受权限或网络阻断。
### M05-07 最新进度（2026-11-21）

M05-07 已完成本轮专题深化：驯化、改良和地方适应已分别定义和比较；新增水稻 Civáň 模型对照、玉米 Xu 2022 环境适应案例、三类原理比较图；完善 Huang、Hufford、Lam 三个既有案例，并更新 PLINK/ADMIXTURE/XP-CLR 双向链接与 `topic-metadata.json`。来源及方法分工写入 `docs/m05-evidence.md` 和 `docs/scientific-review-v2.md`。`npm run check`、`npm run coverage`、`npm run validate` 通过；Edge/Playwright 完成 40 个页面/视口状态的回归和关键关系链接检查。新增内容维持草稿；群体基因型案例未在本机重新运行。

下一步：继续审核 M05-01/02、剩余工具和应用案例，再处理 M03-01 与跨领域发布依赖闭包。M05-07 的本地改动已完成回归，尚待提交。
