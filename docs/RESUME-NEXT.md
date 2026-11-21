# PhytoMethods 下一次恢复入口

- 分支：`feat/long-run-m03-v2`；本地未推送提交以 `git log origin/feat/long-run-m03-v2..HEAD` 核对，远程仍在 `58c339f`。HTTPS 推送曾因 GitHub 443 连接超时失败，GitHub API Git Data 写入被集成返回 403；远程未发生本地提交内容变更。网络或连接权限恢复后执行 `git push origin feat/long-run-m03-v2`。已发布 main 基点为 `91f24bd`；M03–M09 新增内容仍为草稿，尚未合并部署。
- M03～M09 共 49 篇专题已有正文初稿；仍需逐篇深化、科学审核和正式发布态验收。M03、M04、M05 已有部分工具及论文，M06 新增 GAPIT 与 SciPy，M07 新增 Bismark，M08 新增 Scanpy，M09 新增 WGCNA。
- 七个新增领域各有一篇已实际运行的教程草稿：SyRI 使用官方拟南芥染色体测试数据；OrthoFinder 使用官方支原体示例；PLINK、GWAS、Bismark、Scanpy 和 WGCNA 使用模拟数据。后六者没有声称在本机运行真实植物数据。
- `examples/syri/verified-20261121/`、`examples/orthofinder/verified-20261121/` 及其余 `examples/` 子目录保存实际运行日志、输入说明、版本和摘要。M03 相关资料见 `docs/m03-evidence.md`。
- 最近核心页面回归：`node scripts/browser-test-v1.3.mjs`、`node scripts/browser-test-knowledge.mjs`、`node scripts/browser-test-knowledge-graph.mjs` 的桌面和移动端测试通过。M03 七篇草稿在仅开发环境的预览路由中按 375、768、1280、1440 px 检查，HTTP 200、正文标题、预览标识和横向溢出检查通过；AnchorChain、图路径和读段映射交互通过。该检查不等同于正式发布态构建或科学审核关闭。
- 最近完整构建：授权环境下 `npm run validate` 通过，Astro 检查 0 错误/警告，静态生成 54 个已发布页面，Pagefind 索引 54 页、5913 词，1276 条内部链接通过。Pagefind 索引输出位于 `pagefind-search/`，静态预览的英文/中文搜索及 `/phytomethods/` 路径通过。最近 `npm run coverage` 显示 M03 七篇专题、八个工具、14 篇论文和一篇教程仍为草稿；七专题均有结构化工具关联。八篇方法论文和 EUPAN、两篇水稻案例完成四种宽度浏览器检查。EUPAN 未本机运行。高粱基准文案按出版方全文区分模拟及公开真实 paired-end reads 两类评价；PGGB 因索引计算/内存需求未纳入 mapping benchmark。
- 数据可复核命令：`python scripts/check-plink-example.py`、`python scripts/check-gwas-example.py`、`python scripts/check-bismark-example.py`、`python scripts/generate-single-cell-demo.py --check`、`python scripts/test-pca-demo.py`、`python scripts/generate-gwas-demo.py --check`、`node scripts/test-phylogeny-demo.mjs`。
- 知识关联页已增加基于已发布内容的工具中心图，支持领域及原理筛选；上下游等关系仍待建模。新增单细胞、拟时序、共表达、GWAS 和甲基化示意图，其中模拟数据均标注。
- 已保存阶段截图至 `outputs/long-run/checkpoint-20261121-0625/`；截图反映开发分支本地构建，M03 专题仍显示筹备状态，不能当作线上发布截图。
- SyRI、OrthoFinder 和 Bismark 曾在 WSL `/tmp/phytomethods-mamba-20261121/` 隔离环境运行；当前 WSL 状态检查返回 `E_ACCESSDENIED`，暂时无法确认该环境是否仍可用，既有运行日志和摘要保存在项目验证目录。当前 Windows PATH 未发现 AnchorWave、Minigraph、ODGI、vg、PGGB、Cactus 或 EUPAN。R 独立包库和 Scanpy 虚拟环境位于项目 `work/`，属于临时环境，不应提交。
- 下一步：M03-05 的 segment/link/path 路径图和 Minigraph、PGGB 流程已按 GFA 规范及官方说明完成局部内容核查；M03-06 的 Giraffe 单倍型感知映射步骤与教学读段子串关系也已核对。M03-05 axe-core 4.12.1 在 375/1280px 页面及 375px 弹窗为零违规；M03-06 在页面布局与溢出区键盘初始化完成后，375/1280px 均为零违规。七专题其他 axe 检查、图解弹窗四视口回归已通过；可用 `npm run test:figure-a11y` 重跑。继续逐条核对 M03 植物案例、方法论文、工具参数与许可，并处理水稻论文 → ADMIXTURE → M05 `m05-topic-03` 的发布依赖闭包。npm 官方安全审计仍受 DNS/网络超时阻断，网络恢复后重试。满足发布门槛前保留草稿状态，再推进 M04–M09。
- 发布前需处理跨领域关联的状态依赖：已发布专题关联的工具、论文和教程必须同时为已发布状态，论文引用的工具及工具引用的专题也必须可访问。不得删除准确的关联以绕过检查。
- 最终仍需整体科学审核、性能与可访问性检查、完整知识网络、阶段报告、合并及线上部署；当前没有声称完成或上线 v2.0。

- 2026-11-21：修复放大图解弹窗的屏幕阅读器名称与说明、SVG ID 克隆冲突、键盘关闭和焦点恢复；对横向溢出的图、表、公式和代码加上按需焦点及方向键/Home/End 滚动。M03 七专题在手机 375px 与桌面 1280px 的 axe 4.12.1 自动审计各为 0 个违规；剩余一组 KaTeX/SVG 对比度项由 axe 列为人工核查。持久回归脚本 `npm run test:figure-a11y` 验证图解弹窗四宽度、五个滚动区键盘移动、视口切换、ESC 关闭及焦点返回通过；预览地址和 Edge 路径均可配置。`npm run validate` 通过，60 个 Astro 文件零诊断，54 个静态页面、54 页 Pagefind 索引、5913 词及 1276 条内部链接完成检查；M03 保持草稿，科学审核和发布依赖仍待关闭。
