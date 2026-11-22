---
title: "The Rise and Fall of African Rice Cultivation Revealed by Analysis of 246 New Genomes"
summary: "使用非洲栽培稻和野生祖先的群体基因组数据重建栽培历史与种群变化。"
authors: "Cubry P, Tranchant-Dubreuil C, Thuillet AC, et al."
year: 2018
journal: Current Biology
doi: 10.1016/j.cub.2018.05.066
type: application
methodIds: [psmc, msmc2, smcpp]
domainIds: [population-genetics]
speciesIds: [rice]
status: published
updatedAt: 2026-11-22
---

## 研究问题与样本

研究分析 246 份新测序材料，包括 163 份非洲栽培稻 *Oryza glaberrima* 和 83 份野生祖先 *O. barthii*，以研究非洲稻种群历史、地理扩张和驯化相关基因组变化。[PubMed 摘要](https://pubmed.ncbi.nlm.nih.gov/29983312/)；[论文全文](https://rbca.africarice.org/files/doc/journal/10.1016j.cub.2018.05.066.pdf)。

## 群体历史方法和论文结果

作者采用 PSMC、MSMC 和 SMC++。针对自交背景，PSMC/MSMC 输入由单倍型组合得到伪二倍体；栽培稻的 16 条单倍型组成 8 个伪二倍体，PSMC 分别分析并汇总，MSMC 联合分析并以 6 次 bootstrap 检查估计变化。SMC++ 使用 79 个伪二倍体与 5 条区分谱系，采用每代每位点 $6.5\times10^{-9}$ 突变率、100,000 代上界和 25 个样条结点，并按一年世代时间展示时间轴。相关设置详见论文 STAR Methods。

论文报告栽培稻与野生稻均有始于一万年前以上的有效群体规模下降；栽培稻历史曲线约在 3,400 年前达到低点，在约 1,847 年前出现增加信号。作者结合地理数据、单倍型、基因组选择扫描和空间模型解释该变化。曲线的日期受突变率、世代时间和伪二倍体构造影响，代表论文模型尺度下的估计。

资源关联：[PSMC](../../methods/psmc/)、[MSMC2](../../methods/msmc2/)、[SMC++](../../methods/smcpp/)与[群体历史专题](../../topics/population-genetics/m05-topic-06/)。此处 MSMC/MSMC2 的链接指该研究所用的顺序马尔可夫共祖家族流程；具体脚本版本与样本步骤以原文 STAR Methods 为准。
