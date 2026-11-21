---
title: "Long-read-based human genomic structural variation detection with cuteSV"
summary: "介绍基于长读段比对信号聚类和细化的 cuteSV 结构变异检测方法。"
authors: "Jiang T, Liu Y, Jiang Y, Li J, Gao Y, Cui Z, Liu Y, Liu B, Wang Y"
year: 2020
journal: "Genome Biology 21(1):189"
doi: 10.1186/s13059-020-02107-y
type: method
domainIds: [pangenomics-structural-variation]
speciesIds: []
status: draft
updatedAt: 2026-11-21
---

## 方法范围

cuteSV 以长读段比对文件为输入，从读段内及读段间比对收集不同类型的结构变异信号，再经过聚类与迭代细化形成候选等位，并输出变异记录和基因型。方法论文报告的主要评估对象为人类长读段数据；本条文献作为长读段信号聚类方法的原始来源，不表示已在植物数据上验证。

书目信息依据 [PubMed 记录](https://pubmed.ncbi.nlm.nih.gov/32746918/)核对：Tao Jiang 等，*Genome Biology* 21(1):189（2020），DOI `10.1186/s13059-020-02107-y`。项目代码和安装说明见 [cuteSV 官方仓库](https://github.com/tjiangHIT/cuteSV)。
