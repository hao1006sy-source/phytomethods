---
title: "The design and construction of reference pangenome graphs with minigraph"
summary: "提出参考引导的增量式图形泛基因组构建算法架构，通过将多套组装序列依次对齐至生长中的序列图，高效捕捉和组织大规模结构变异（SVs），奠定了现代结构泛基因组图的表示基石。"
authors: "Li H, Feng X, Chu C"
year: 2020
journal: Genome Biology
doi: 10.1186/s13059-020-02168-z
type: method
method: minigraph
methodIds: [minigraph]
domainIds: [pangenomics-structural-variation]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

## 研究背景与算法贡献

在动植物长读长高保真组装技术成熟之后，科研人员能够在物种内获取数十至数百套染色体级别的单倍型组装。然而，如何将这些庞大的全基因组组装有效地整合为一个多样本共享的统一参考坐标系统，成为了泛基因组学的核心挑战：
1. **多重序列比对（MSA）的计算爆炸**：传统基于全基因组全局比对的多序列比对方法计算复杂度高达 $\mathcal{O}(N^2)$ 或更高，面对动植物动辄数吉碱基（Gb）的多基因组组装极易发生内存溢出与性能瘫痪；
2. **小变异过度复杂化图拓扑**：将全基因组内海量的 SNP 与短 InDel（通常数千万个）全部无差别纳入图模型，会导致图拓扑产生极度密集的微小气泡（Bubbles），极大地拖慢下游序列比对和路径遍历；
3. **坐标系缺失与变异错位**：缺少统一且与传统线性参考向后兼容的坐标映射系统，使得传统科研人员难以将图内结构变异投影回主参考基因组。

针对上述瓶颈，李恒等开发了 **Minigraph**。该算法的核心突破在于提出了**“参考引导的增量图构建（Reference-guided Incremental Graph Generation）”**范式：以单一高质量参考基因组作为主干骨架（Linear Backbone），仅将长度超过设定阈值（默认 $\ge 50\text{ bp}$）的结构变异以图分支（Alternative Segments/Paths）形式增量集成至图中，在保持图拓扑高度稀疏与线性的同时，精确捕获了群体水平的大片段插入、缺失及倒位变异。

---

## 核心数学模型与数据结构

Minigraph 的核心数据结构是**有向双向标记变异图（Bidirectional Sequence Graph, $G = (V, E)$）**，其中每个节点 $v \in V$ 对应一段非重叠的连续 DNA 序列片断，有向边 $(u, v) \in E$ 表示序列的物理邻接方向。

```
              主参考骨架 (Linear Backbone)
Node 1 ────────────► Node 2 ────────────► Node 4 ────────────► Node 5
                       │                    ▲
                       │ (结构变异分枝)     │
                       └─────► Node 3 ──────┘
                           (50 bp+ 插入事件)
```

### 1. 增量构图流程
- **骨架初始化**：首先将初始线性参考基因组（如拟南芥 Col-0 或水稻日本晴）转换为初始图 $G_0$。
- **序列图共线性比对（Graph-to-Sequence Mapping）**：对于新输入的候选基因组组装 $A_i$，利用 minimizer 索引技术，将 $A_i$ 快速锚定并共线性链化比对（Chaining）至当前的变异图 $G_{i-1}$ 上。
- **结构变异分枝识别与图拓扑分裂**：根据比对路径中的长未对齐区段（Unmapped Divergent Flanks），若插入或缺失变异长度 $\ge L$（默认 50 bp），则在该位置裂解原有节点，创建新的变异节点，并将边连接关系增量嵌入图中，生成 $G_i$。
- **可反向图坐标系（rGFA 规范）**：Minigraph 首创了 **rGFA（Reference Graph Format）** 数据标准，每个节点除了自身序列与长度外，明确记录其相对线性参考骨架的起始与终止偏移量（`SN:Z:chr`, `SO:i:offset`, `SR:i:rank`），使得图内任意结构变异都能无损反推回主干坐标。

---

## 算法复杂度与计算性能

- **时间复杂度**：对于 $N$ 个大小为 $G$ 的基因组，Minigraph 的构建时间仅为 $\mathcal{O}(N \cdot G \cdot \log G)$，近似于线性的扩展能力，使得在大规模动植物群体泛基因组中极具实用价值。
- **内存消耗**：由于 Minimizer 稀疏采样与仅保留 $\ge 50\text{ bp}$ 结构变异的设计，构建包含数十个植物基因组的图模型通常仅需 20~40 GB 内存。
- **实际基准数据**：原始论文基准测试表明，在 90 个人类单倍型组装构建中，Minigraph 在 24 线程下仅需数小时即可完成构建；在植物领域，对 33 套水稻基因组进行增量构图耗时通常在 2 小时以内，构建出的 GFA 图文件小且检索极快。

---

## 植物基因组学应用场景与科研价值

1. **复杂大基因组物种的结构泛基因组骨架构建**：在玉米（~2.3 Gb）、大豆（~1.1 Gb）、小麦（~16 Gb）等富含转座子的植物物种中，全碱基级图构建极为沉重，Minigraph 常作为构建结构变异骨架的第一步首选工具；
2. **转座子爆发与基因结构变异（PAV）图解**：高效捕获不同农家种或野生渐渗系特有的长片段 TE 插入与基因簇复制扩增事件；
3. **Minigraph-Cactus 流水线的核心上游**：作为现代全碱基级泛基因组流水线（如 Minigraph-Cactus）的第一阶段结构骨架生成器，奠定了后续碱基级比对与小变异填充的基础。

更多关于植物泛基因组构建策略的系统阐述，可参阅 [泛基因组与核心、可变基因组](../../topics/pangenomics-structural-variation/m03-topic-01/) 及 [图形泛基因组构建方法](../../topics/pangenomics-structural-variation/m03-topic-02/)。

---

## 输入输出规范与关键参数指南

### 1. 核心输入输出
- **输入文件**：参考基因组 FASTA 文件（首个输入，作为 Backbone），以及一系列目标个体 FASTA 基因组序列。
- **输出文件**：rGFA 格式的变异图文件（文本格式，记录 `S` 节点、`L` 边、以及节点对应的参考序列 rank 编号）。

### 2. 关键参数设置与植物优化建议
```bash
# 增量构建植物参考泛基因组图
minigraph -cxggs -t 32 \
  -l 50 \
  ref_backbone.fa \
  line1.fa line2.fa line3.fa > pangenome.gfa
```
- `-c`：输出 PAF 格式比对结果或进行构图模式；
- `-xggs`：预设参数模式（Graph Generation from Sequences），针对组装间长变异构图进行算法调优；
- `-l 50`：结构变异长度截断阈值（默认 50 bp）。在高度发散的野生植物种群中，可根据研究目的调整为 100 bp 以降低转座子微小多态性对拓扑造成的扰动；
- `-t 32`：多线程并行数。

---

## 阅读与复现资源

- **期刊正式原文**：[Genome Biology 21:2168 (2020)](https://doi.org/10.1186/s13059-020-02168-z)
- **PubMed 检索记录**：[PMID: 33066802](https://pubmed.ncbi.nlm.nih.gov/33066802/)
- **PubMed Central 全文**：[PMC7568353](https://pmc.ncbi.nlm.nih.gov/articles/PMC7568353/)
- **官方开源代码库**：[lh3/minigraph (GitHub)](https://github.com/lh3/minigraph)
- **格式规范参考**：[rGFA 格式官方规范](https://github.com/lh3/gfatools/blob/master/doc/rGFA.md)
