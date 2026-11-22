---
title: "Exploring transposable element-based markers to identify allelic variations underlying agronomic traits in rice"
summary: "在 176 份水稻材料中构建转座子插入基因型，并用 SweepFinder2 比较 SNP 与 TE 标记的扫荡信号。"
authors: "Yan H, Haak DC, Li S, Huang L, Bombarely A"
year: 2022
journal: Plant Communications
doi: 10.1016/j.xplc.2021.100270
type: application
methodIds: [sweepfinder2]
domainIds: [population-genetics]
speciesIds: [rice]
status: published
updatedAt: 2026-11-22
---
## 研究设计与软件任务

Yan 等使用 176 份日本稻材料的公开全基因组数据，开发 TEmarker 流程，从转座子插入读段证据生成群体基因型，并比较 TE 标记与 SNP 标记在 GWAS 和选择扫描中的表现。TEmarker 与 SweepFinder2 回答不同问题：前者构建 TE 存在/缺失基因型，后者使用群体位点频率谱扫描候选清除信号。

论文对 SNP 与 TE 标记分别用 SweepFinder2 计算复合似然比，扫描网格间距为 10 kb；将每类标记最高 1%窗口定义为候选扫荡区，并将相邻超阈值分数合并。该研究还把 TE 信号与农艺性状、GWAS 区域和候选基因进行比较。最高 1%属于研究设定，不能作为跨物种默认阈值。[PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC9251385/)；[DOI](https://doi.org/10.1016/j.xplc.2021.100270)。

该案例说明 SFS 扫描输入不局限于传统 SNP，但标记编码、位点计数、缺失和频率谱定义必须与软件要求兼容。选择扫描候选与 GWAS 峰、具体因果变异和功能机制之间需要分别建立证据。

相关资源：[SweepFinder2 方法页](../../methods/sweepfinder2/)、[方法论文](../sweepfinder2-paper/)、[M05-05 选择性清除专题](../../topics/population-genetics/m05-topic-05/)。
