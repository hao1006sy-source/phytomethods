---
title: "Maize leaves drought-responsive genes revealed by comparative transcriptome of two cultivars during the filling stage"
summary: 玉米灌浆期叶片干旱响应转录组比较使用 DESeq2 进行差异表达分析。
authors: "Jin H, Liu S, Zenda T, et al."
year: 2019
journal: PLOS ONE
doi: 10.1371/journal.pone.0223786
type: application
methodIds: [deseq2]
domainIds: [regulatory-genomics-ai]
speciesIds: [maize]
status: published
updatedAt: 2026-11-25
---
## 研究问题与材料范围
灌浆期干旱胁迫会严重影响玉米籽粒发育与最终产量。Jin 等（2019）选取耐旱性存在显著差异的 **两个玉米品种**，在灌浆期设置正常供水与干旱胁迫处理，开展叶片比较转录组测序（RNA-seq），系统筛选玉米灌浆期叶片干旱响应基因与代谢通路。

## 分析流程
1. **转录组测序与比对定量**：对两个玉米品种在正常供水与干旱处理下的叶片样本进行 Illumina RNA-seq 测序，比对至玉米 B73 参考基因组并统计基因水平表达计数（raw counts）。
2. **差异表达分析**：使用 **DESeq2** 进行文库大小标准化与负二项分布广义线性模型检验，筛选两品种在干旱胁迫下显著上调或下调的差异表达基因（DEGs）。
3. **功能富集与实验验证**：对 DEGs 进行 GO 与 KEGG 通路富集分析，并选取关键干旱响应候选基因开展 **qRT-PCR** 独立验证。

## 软件明细表格
| 软件 / 方法 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **DESeq2** | 基因计数标准化与跨处理/品种差异表达检验 | 有效控制生物学重复间的离散度，鉴定出显著干旱响应基因集 |
| **qRT-PCR** | 关键候选基因表达趋势实验验证 | 验证了 RNA-seq 与 DESeq2 鉴定的核心干旱调控基因的表达可靠性 |

## 主要科研发现
- 揭示了两个玉米品种在灌浆期应对干旱胁迫的共有与品种特异转录调控网络（涉及激素信号转导、渗透调节与抗氧化防御通路）。
- 为玉米灌浆期耐旱分子育种提供了候选基因资源。

## 阅读与数据复现资源
- **原始论文**：[PLOS ONE (2019)](https://doi.org/10.1371/journal.pone.0223786)
- **相关站内资源**：[DESeq2 方法页](../../methods/deseq2/)
- **数据复现**：原始 RNA-seq 数据详见原文 Data Availability 部分。
