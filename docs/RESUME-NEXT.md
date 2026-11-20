# PhytoMethods 下一次恢复入口

- 分支：`feat/long-run-m03-v2`；最新提交以 `git log -1 --oneline` 为准；已发布 main 基点 `91f24bd`。新领域均为草稿，尚未合并部署。
- M03～M09 共 49 篇专题已有初稿，尚需逐页深化及科学审核；M03、M04、M05 已有部分工具和论文，M06 新增 GAPIT，M07 新增 Bismark，M09 新增 WGCNA。已添加多个交互图和科研示意图。
- SyRI 1.8.2 与 MUMmer 3.23 已在 WSL 隔离环境对官方拟南芥测试数据运行完整教程；`src/content/tutorials/syri-intro.md` 仍是草稿，验证日志及摘要在 `examples/syri/verified-20261121/`。
- 最近成功检查：`npm run validate`（Astro 0 错误、链接 1178 条通过）；49 篇草稿正文在临时动态预览下做过 375、768、1280、1440 px 渲染和溢出检查。部分图解独立完成浏览器交互检查；这不代表正式发布态和科学审查已完成。
- 待处理：优先完成 M03 逐篇科学核查、工具版本与植物案例关联、所有图解和专题页面的发布态测试；再逐领域补齐其余工具、教程、图解及论文，完善跨领域知识图谱、全站性能及最终报告。OrthoFinder 已实跑官方支原体示例，植物数据未运行；WGCNA 教程已运行模拟数据，植物表达矩阵尚未运行。
- 下一步先运行 `git status --short`，读取 `docs/long-run-progress.md` 与 `docs/m03-evidence.md`；每轮运行 `npm run validate` 和相关浏览器测试，核查完成后才将草稿改为发布。
- SyRI 隔离环境位于 WSL `/tmp/phytomethods-mamba-20261121/syri-env`，重启后可能清除；输入来自官方仓库固定提交，复现命令在教程中。Docker Linux 引擎未连接。

- OrthoFinder 3.2 官方非植物示例验证记录位于 `examples/orthofinder/verified-20261121/`；运行环境位于 WSL `/tmp/phytomethods-mamba-20261121/orthofinder-env`，可能随重启清除。

- 专题正文与元数据的 ID、领域、状态一致性检查已加入，两个反例测试及恢复后的完整构建通过。

- M08 拟时序预设分支交互已通过四宽度步骤和重置测试，仍需单细胞工具、真实分析教程及内容审核。

- Scanpy 1.13.0 的模拟单细胞示例与教程已完成同环境两次运行；输出和依赖记录在 xamples/single-cell/，植物数据仍待执行。

- M08 单细胞散点图由已验证的模拟 Scanpy 结果生成；运行 python scripts/generate-single-cell-demo.py --check 检查图表数据一致性。

- M06 模拟 GWAS 教程已运行，输入、输出和版本在 xamples/gwas/verified-20261121/；运行 python scripts/check-gwas-example.py 复算。GAPIT 本身和真实植物 GWAS 尚未执行。

- PLINK 1.9.1 的模拟 VCF、频率、缺失与 PCA 已运行，执行 python scripts/check-plink-example.py 验证；真实植物数据和 ADMIXTURE 尚未执行。

- Bismark Rust 3.3.0 模拟甲基化教程已运行，python scripts/check-bismark-example.py 检查覆盖正链位点真值；真实植物数据仍待执行。

- WGCNA 1.74 模拟表达教程已在 R 4.5.1 独立库运行两次，结果在 `examples/coexpression/verified-20261121/`。七个新增领域现各有至少一篇运行过的示例教程；其中仅 SyRI 使用拟南芥真实测试数据。
