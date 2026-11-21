---
title: "Toward a standardized framework for pangenome graph evaluation: assessing crop plant pangenome variation graph construction from multiple assemblies"
summary: "以高粱等作物评估多种泛基因组图构建和下游分析方法。"
authors: "Kopalli V, Arslan K, Morales-Díaz N, Zanini SF, Golicz AA"
year: 2025
journal: GigaScience
doi: 10.1093/gigascience/giaf121
type: application
methodIds: [minigraph, pggb, minigraph-cactus, syri, vg, odgi]
domainIds: [pangenomics-structural-variation]
speciesIds: [sorghum]
status: draft
updatedAt: 2026-11-21
---
## 研究问题与数据
Kopalli 等以高粱组装为主要数据，比较 PGGB、Minigraph-Cactus 与 Minigraph 构建泛基因组图，并将评估扩展到其他作物。研究针对图的完整性、重复和下游变异分析建立比较指标。

## 方法与用途
研究在六份高粱组装与参考基因组上按染色体分别构建 Minigraph、PGGB 和 Minigraph-Cactus 图，报告版本分别为 0.21、0.5.4 和 2.7.2；ODGI 0.8.6 用于图处理与路径展平，BUSCO 等指标用于评估内容。论文还以 SyRI 1.6.3 和 SVIM-asm 对组装间变异进行比较，并通过 VG deconstruct 1.54.0 处理图路径变异。图大小及变异结果受输入、过滤阈值和评价方法影响，不能将特定数据集排名推广为普遍结论。

读段映射评估分为模拟数据与公开高粱 paired-end reads。模拟 reads 由泛基因组图生成，使用 VG Giraffe 1.58.0 映射到 Minigraph 或 Minigraph-Cactus 图，并以 Minimap2 2.26-r1175 映射线性参考作比较；真实 reads 也按图与线性参考分别进行映射。真实 reads 的总比对率为 Minimap2 82.47%、Minigraph-Cactus 73.44%、Minigraph 73.27%；完美比对比例分别为 68.77%、82.77%、78.13%。PGGB 图因索引生成的计算和内存需求未纳入 read-mapping 评估。总比对率与完美比对比例、模拟真值指标和真实 reads 映射率属于不同评价维度，应分别解读。

[出版方论文](https://doi.org/10.1093/gigascience/giaf121)；[PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC12676463/)。
