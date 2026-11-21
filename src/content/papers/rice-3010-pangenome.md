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
Wang 等分析 3,010 份亚洲栽培稻的序列变异、群体结构和遗传多样性，并将短读段重测序与新增序列整合为水稻泛基因组，以减少单一 Nipponbare 参考基因组造成的变异遗漏。论文报告 2,939 万个 SNP、约 247 万个小 indel、超过 9 万个结构变异，以及 12,465 个新全长蛋白编码基因。上述总群体规模与后续 PAV 分析的样本数不同。

## 计算流程与软件关系
短读段 SNP/indel 分析以 Nipponbare RefSeq 为参考，使用 BWA-MEM 0.7.10 与 GATK 3.2-2；PLINK 用于连锁不平衡剪枝并生成核心 SNP 集，ADMIXTURE 对候选 K 值进行重复拟合，最终以 K=9 描述群体结构，Q 矩阵再由 CLUMPP 对齐。本站的 ADMIXTURE 与 PLINK 关联分别对应群体结构和 SNP 数据筛选/LD 分析，不代表这些工具完成了所有变异检测步骤。

结构变异由定制的 novoBreak-germline 流程检测。泛基因组采用 Map-to-pan 思路：把 Nipponbare RefSeq 与 3,010 份组装产生的非冗余新序列整合，再将 reads 映射到 pan-genome，按基因体与 CDS 覆盖计算 PAV。论文把测序深度 >20× 且参考比对深度 >15× 的 453 份材料用于 SV 与 PAV 重点分析；基因存在判定采用 CDS 覆盖 >95% 且基因体覆盖 >85%。代码说明将基因与基因家族 PAV 流程归入 EUPAN；本站将 EUPAN 单列为相应方法资源。[PMC 全文与方法](https://pmc.ncbi.nlm.nih.gov/articles/PMC6784863/)。

## 结果解读与限制
该研究说明群体规模、测序深度和覆盖阈值会共同决定可报告的变异和 PAV。短读段映射到单一参考会低估高度分化或参考缺失区域；Map-to-pan 扩充可映射序列范围，但基因模型错误、低覆盖和新序列冗余仍可能导致状态误判。PAV 结论应结合测序深度、比对覆盖、基因模型和独立证据解读，453 份高覆盖样本的阈值不能直接当成适用于任意作物的通用默认值。

## 资料来源
本文是稻属栽培群体和基因 PAV 的植物应用案例，链接 ADMIXTURE、PLINK 与 EUPAN，分别指向论文明确使用的群体结构、SNP/LD 和 Map-to-pan PAV 工具。它不是 Minigraph、PGGB 或 Minigraph-Cactus 的图泛基因组案例。[PubMed 记录](https://pubmed.ncbi.nlm.nih.gov/29695866/)；[PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC6784863/)；[数据论文 DOI](https://doi.org/10.1038/s41586-018-0063-9)。
