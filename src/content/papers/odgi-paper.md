---
title: "ODGI: understanding pangenome graphs"
summary: "介绍泛基因组图操作与可视化工具。"
authors: "Guarracino A, Heumos S, Nahnsen S, Prins P, Garrison E"
year: 2022
journal: Bioinformatics
doi: 10.1093/bioinformatics/btac308
type: method
methodIds: [odgi]
domainIds: [pangenomics-structural-variation]
speciesIds: []
status: draft
updatedAt: 2026-11-21
---
## 方法贡献
ODGI（Optimized Dynamic Genome/Graph Implementation）为 DNA 泛基因组变异图提供可扩展的内存表示和并行操作。论文介绍从 GFA 图构建、坐标定位、复杂区域检测、位点提取、伪影清理、图验证到可视化的分析能力，并以大型人类泛基因组图展示其性能与图结构浏览方式。ODGI 负责图处理和分析，不执行短读段比对或结构变异的生物学验证。方法论文发表于 Bioinformatics 38(13):3319–3326（2022），软件以 MIT 许可证发布。[原文与 PubMed 记录](https://pubmed.ncbi.nlm.nih.gov/35552372/)；[官方仓库](https://github.com/pangenome/odgi)。
