---
title: "The pan-genome and local adaptation of Arabidopsis thaliana"
summary: "比较拟南芥多材料泛基因组、结构变异及环境适应。"
authors: "Kang M, Wu H, Liu H, et al."
year: 2023
journal: Nature Communications
doi: 10.1038/s41467-023-42029-4
type: application
methodIds: [orthofinder, iqtree2, minigraph, vg]
domainIds: [pangenomics-structural-variation, comparative-genomics]
speciesIds: [arabidopsis]
status: draft
updatedAt: 2026-11-21
---
## 研究流程
研究对 32 份拟南芥材料构建组装，使用 OrthoFinder 组织基因家族，并用 IQ-TREE v2.0.3 推断系统树；论文使用独立 Minigraph（`-cxggs`）构建参考引导图泛基因组，再用 vg toolkit v1.40.0 对 1,135 份重测序个体 reads 进行图上映射和结构变异基因型分析。经过缺失率和 MAF 过滤后，作者报告 1,073 个个体、20,326 个 SV 位点进入后续分析。该证据支持 Minigraph 与 vg 的植物应用关联，不应归为 Minigraph-Cactus 案例。[论文原文及方法](https://doi.org/10.1038/s41467-023-42029-4)。
