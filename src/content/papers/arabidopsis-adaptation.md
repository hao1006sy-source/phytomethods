---
title: "The pan-genome and local adaptation of Arabidopsis thaliana"
summary: "比较拟南芥多材料泛基因组、结构变异及环境适应。"
authors: "Kang M, Wu H, Liu H, et al."
year: 2023
journal: Nature Communications
doi: 10.1038/s41467-023-42029-4
type: application
methodIds: [hifiasm, orthofinder, iqtree2, minigraph, vg, plink, mcscanx]
domainIds: [pangenomics-structural-variation, comparative-genomics]
speciesIds: [arabidopsis]
status: draft
updatedAt: 2026-11-21
---
## 研究流程
研究对 32 份拟南芥材料使用 Hifiasm 组装 HiFi reads，以 OrthoFinder 推断基因家族，并从单拷贝直系同源基因构建 IQ-TREE v2.0.3 最大似然树。论文使用独立 Minigraph（`-cxggs`）构建参考引导图泛基因组；来自 SRA 的 1,135 份个体短读段用于 vg toolkit v1.40.0 图上映射和结构变异基因型分析，Tibet-0 与 Yilong-0 是本研究新增测序材料。PLINK 用于缺失率与次要等位基因频率过滤，MCScanX 用于共线性分析。过滤后作者报告 1,073 个个体、20,326 个 SV 位点进入后续分析。以上关系分别对应原文报告的组装、基因家族、系统树、图构建、图上映射、基因型过滤及共线性步骤；Minigraph 与 vg 是独立工具，不能归为 Minigraph-Cactus 案例。[论文原文及方法](https://doi.org/10.1038/s41467-023-42029-4)；[PMC 全文方法](https://pmc.ncbi.nlm.nih.gov/articles/PMC10558531/)。
