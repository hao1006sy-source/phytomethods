---
title: "Genomic variation in 3,010 diverse accessions of Asian cultivated rice"
summary: "分析亚洲栽培稻群体遗传变异和泛基因组基因存在缺失。"
authors: "Wang W, Mauleon R, Hu Z, et al."
year: 2018
journal: Nature
doi: 10.1038/s41586-018-0063-9
type: application
methodIds: [admixture, plink, eupan]
domainIds: [pangenomics-structural-variation, population-genetics]
speciesIds: [rice]
status: draft
updatedAt: 2026-11-21
---
## 研究问题与方法价值
Wang 等分析 3,010 份亚洲栽培稻的序列变异、群体结构和遗传多样性，并将短读段重测序与新增序列整合为水稻泛基因组，以减少单一 Nipponbare 参考基因组造成的变异遗漏。原文报告 29,399,875 个 SNP（其中 27,024,796 个为双等位 SNP）和 2,467,043 个长度小于 40 bp 的 indel。论文对 3,010 份材料进行了结构变异调用，并在 453 份高测序深度样本中报告 93,683 个 SV；该子集与全群体 SNP/indel 统计及后续 PAV 分析的样本范围不同。3,010 份组装产生 268 Mb 非冗余新序列，并预测 12,465 个新全长基因。

## 计算流程与软件关系
短读段 SNP/indel 分析以 Nipponbare RefSeq 为参考，使用 BWA-MEM 0.7.10 与 GATK 3.2-2；PLINK 用于连锁不平衡剪枝并生成核心 SNP 集，ADMIXTURE 对候选 K 值进行重复拟合，最终以 K=9 描述群体结构，Q 矩阵再由 CLUMPP 对齐。本站的 ADMIXTURE 与 PLINK 关联分别对应群体结构和 SNP 数据筛选/LD 分析，不代表这些工具完成了所有变异检测步骤。

结构变异由定制的 novoBreak-germline 流程检测。泛基因组采用 Map-to-pan 思路：把 Nipponbare RefSeq 与 3,010 份组装产生的非冗余新序列整合，再将 reads 映射到 pan-genome，按基因体与 CDS 覆盖计算 PAV。论文把测序深度 >20× 且参考比对深度 >15× 的 453 份材料用于 SV 与 PAV 重点分析；基因存在判定采用 CDS 覆盖 >95% 且基因体覆盖 >85%。代码说明将基因与基因家族 PAV 流程归入 EUPAN；本站将 EUPAN 单列为相应方法资源。[PMC 全文与方法](https://pmc.ncbi.nlm.nih.gov/articles/PMC6784863/)。

## 结果解读与限制
在 453 份高覆盖材料上，研究将参考基因和全长新基因聚为 23,876 个基因家族；其中 12,770 个家族出现在全部 453 份材料中，2,056 个列为候选核心家族，9,050 个列为可变家族。模拟结果显示，9,050 个可变家族可能低估实际的可变泛基因组规模。新基因核验中，11,792 个（94.6%）在至少两份水稻材料上达到论文使用的 CDS 与基因体覆盖标准；论文还指出，约四分之一新基因因组装片段化而出现偏短预测。研究结果说明群体规模、测序深度、基因模型与覆盖阈值共同影响变异和 PAV 估计。PAV 结论应结合读段覆盖、注释质量及独立证据解读；该研究的 453 份样本筛选和覆盖阈值适用于其原始分析设计，不作为其他作物的通用默认值。

## 资料来源
本文是稻属栽培群体和基因 PAV 的植物应用案例，链接 ADMIXTURE、PLINK 与 EUPAN，分别指向论文明确使用的群体结构、SNP/LD 和 Map-to-pan PAV 工具。它不是 Minigraph、PGGB 或 Minigraph-Cactus 的图泛基因组案例。[PubMed 记录](https://pubmed.ncbi.nlm.nih.gov/29695866/)；[PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC6784863/)；[数据论文 DOI](https://doi.org/10.1038/s41586-018-0063-9)。
