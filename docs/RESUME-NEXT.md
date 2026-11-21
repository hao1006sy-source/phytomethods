# PhytoMethods 下一次恢复入口

- 分支：`feat/long-run-m03-v2`；本地未推送提交以 `git log origin/feat/long-run-m03-v2..HEAD` 核对，远程仍在 `58c339f`。HTTPS 推送曾因 GitHub 443 连接超时失败，GitHub API Git Data 写入被集成返回 403；远程未发生本地提交内容变更。网络或连接权限恢复后执行 `git push origin feat/long-run-m03-v2`。已发布 main 基点为 `91f24bd`；M03–M09 新增内容仍为草稿，尚未合并部署。
- M03～M09 共 49 篇专题已有正文初稿；仍需逐篇深化、科学审核和正式发布态验收。M03、M04、M05 已有部分工具及论文，M06 新增 GAPIT 与 SciPy，M07 新增 Bismark，M08 新增 Scanpy，M09 新增 WGCNA。
- 七个新增领域各有一篇已实际运行的教程草稿：SyRI 使用官方拟南芥染色体测试数据；OrthoFinder 使用官方支原体示例；PLINK、GWAS、Bismark、Scanpy 和 WGCNA 使用模拟数据。后六者没有声称在本机运行真实植物数据。
- `examples/syri/verified-20261121/`、`examples/orthofinder/verified-20261121/` 及其余 `examples/` 子目录保存实际运行日志、输入说明、版本和摘要。M03 相关资料见 `docs/m03-evidence.md`。
- 最近核心页面回归：`node scripts/browser-test-v1.3.mjs`、`node scripts/browser-test-knowledge.mjs`、`node scripts/browser-test-knowledge-graph.mjs` 的桌面和移动端测试通过。M03 七篇草稿在仅开发环境的预览路由中按 375、768、1280、1440 px 检查，HTTP 200、正文标题、预览标识和横向溢出检查通过；AnchorChain、图路径和读段映射交互通过。该检查不等同于正式发布态构建或科学审核关闭。
- 最近完整构建：`npm run validate` 通过，Astro 检查 0 错误/警告，静态生成 54 个已发布页面，Pagefind 索引 54 页、5913 词，1222 条内部链接通过。Pagefind 索引输出位于 `pagefind-search/`，静态预览的英文/中文搜索及 `/phytomethods/` 路径通过。最近 `npm run coverage` 显示 M03 七篇专题、七个工具、13 篇论文和一篇教程仍为草稿；M03 七专题目前均有结构化工具关联。八篇方法论文在 375、768、1280、1440 px 共完成 32 次 Edge 页面渲染，预览状态和横向溢出检查通过。高粱基准文案按出版方全文区分模拟及公开真实 paired-end reads 两类评价；PGGB 因索引计算/内存需求未纳入 mapping benchmark。
- 数据可复核命令：`python scripts/check-plink-example.py`、`python scripts/check-gwas-example.py`、`python scripts/check-bismark-example.py`、`python scripts/generate-single-cell-demo.py --check`、`python scripts/test-pca-demo.py`、`python scripts/generate-gwas-demo.py --check`、`node scripts/test-phylogeny-demo.mjs`。
- 知识关联页已增加基于已发布内容的工具中心图，支持领域及原理筛选；上下游等关系仍待建模。新增单细胞、拟时序、共表达、GWAS 和甲基化示意图，其中模拟数据均标注。
- 已保存阶段截图至 `outputs/long-run/checkpoint-20261121-0625/`；截图反映开发分支本地构建，M03 专题仍显示筹备状态，不能当作线上发布截图。
- SyRI、OrthoFinder 和 Bismark 的隔离环境位于 WSL `/tmp/phytomethods-mamba-20261121/`，可能随重启消失；R 的独立包库和 Scanpy 虚拟环境位于项目 `work/`，属于临时环境，不应提交。
- 下一步：先运行 `git status --short`，读取本文件、`docs/long-run-progress.md`、`docs/m03-evidence.md` 与 `docs/scientific-review-v2.md`；继续审核 M03 论文、工具与图示，处理 M03 水稻论文 → ADMIXTURE → M05 `m05-topic-03` 的发布依赖闭包。npm 官方安全审计当前受 DNS/网络超时阻断，网络恢复后重试。满足发布门槛前保留草稿状态，再推进 M04–M09。
- 发布前需处理跨领域关联的状态依赖：已发布专题关联的工具、论文和教程必须同时为已发布状态，论文引用的工具及工具引用的专题也必须可访问。不得删除准确的关联以绕过检查。
- 最终仍需整体科学审核、性能与可访问性检查、完整知识网络、阶段报告、合并及线上部署；当前没有声称完成或上线 v2.0。
