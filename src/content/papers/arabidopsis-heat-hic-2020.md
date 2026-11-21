---
title: "Heat stress-induced transposon activation correlates with 3D chromatin organization rearrangement in Arabidopsis"
summary: "拟南芥热胁迫 Hi-C 研究将 HiC-Pro 输出转换后用 HiCExplorer 处理与检查接触矩阵。"
authors: "Sun L, Jing Y, Liu X, Li Q, Xue Z, Cheng Z, Wang D, He H, Qian W"
year: 2020
journal: Nature Communications
doi: 10.1038/s41467-020-15809-5
type: application
methodIds: [hicexplorer]
domainIds: [epigenomics-3d-genome]
speciesIds: [arabidopsis]
status: published
updatedAt: 2026-11-22
---
## 植物研究与软件分工
该研究比较拟南芥对照、热处理与恢复期的 Hi-C 数据，并报告热胁迫相关的染色质互作重排及转座子激活关联。原文先由 HiC-Pro 处理配对 reads 和构建 contact maps，再将矩阵用 HiCExplorer 转换；研究记录了 `hicPlotDistVsCounts`、`hicNormalize`、`hicCorrectMatrix` 和 `hicTransform` 的使用。PCA compartment 调用则使用 HOMER，工具之间的任务在本站分开记录。[Nature Communications 原文](https://doi.org/10.1038/s41467-020-15809-5)；[PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC7170881/)。
