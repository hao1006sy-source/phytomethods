---
title: 图泛基因组构建
summary: 深入解析变异诱导图（Variation Graph）数学定义、超泡 Snarl 代数拓扑、Minigraph-Cactus 与 PGGB 构图管线及 GFA/rGFA 格式规范。
domain: pangenomics-structural-variation
methods: [minigraph, minigraph-cactus, pggb]
status: published
updatedAt: 2026-11-25
---

## 核心科学问题与图论建模本质

在植物泛基因组从“静态多序列对比”迈向“群体功能基因组学”的跃迁中，最为关键的理论与技术突破是**图泛基因组**（Graph Pangenome）的创立。传统的生物信息学比对工具依赖一维线性坐标系；然而，当面对多个高度发散的植物单倍型（如不同水稻亚种、玉米自交系）时，大片段倒位、易位和非参考新插入使得任何单一的线性参考都会强制丢失巨量的物种真实遗传信息。

**图泛基因组将多个个体的核苷酸序列组织为一个统一的拓扑图数据结构**：所有单倍型完全共享的保守骨干区域被压缩合并为公共节点（Shared Nodes），而个体特异性的 SNPs、InDels 及大尺度结构变异则表现为分支展开的气泡（Bubbles）。每个被测序的植物材料不再被“投影”在他人坐标下，而是作为一条穿行于图中的**独立单倍型路径**（Haplotype Path）被完整、无偏地全息记录。

![植物变异诱导图拓扑结构与单倍型遍历模型](/phytomethods/images/topics/m03/graph-pangenome-cactus-topology.svg)

---

## 变异诱导图的数学定义与拓扑元素

在数学上，形式化定义一个变异诱导图（Variation Graph）为一个四元组：

$$G = (V, E, \sigma, \mathcal{P})$$

### 1. 核心拓扑组件
- **节点集合 $V$ 与序列映射 $\sigma$**：每个节点 $v \in V$ 承载一段非空的双链 DNA 碱基序列 $\sigma(v) \in \{A, C, G, T\}^*$。节点拥有正向链（Forward, $v^+$）与反向互补链（Reverse Complement, $v^-$）两个互补方向；
- **有向边集合 $E$**：边 $e = (u^s, v^t) \in E$（其中 $s, t \in \{+, -\}$）表示节点 $u$ 的指定末端与节点 $v$ 的指定起始端之间存在磷酸二酯键的生物学连续连接；
- **样本路径集合 $\mathcal{P}$**：对于每个测序的植物单倍型样本 $k$，其染色体对应于图上的一条连续有向节点遍历序列：
  
  $$P_k = \left( v_{k,1}^{s_1}, \ v_{k,2}^{s_2}, \ \dots, \ v_{k,m}^{s_m} \right)$$
  
  满足对任意相邻步骤，均有 $(v_{k,i}^{s_i}, v_{k,i+1}^{s_{i+1}}) \in E$。

### 2. 变异气泡（Bubbles）与代数超泡（Snarls）
为了从复杂甚至包含循环嵌套的拓扑图中自动提取结构变异，Paten 等人（2018）引入了**超泡**（Snarl）的代数图论定义：
- 一个 Snarl 由一对分离割节点 $(x, y)$ 界定。若切断节点 $x$ 和 $y$，图中的某个子图组件与图的其余部分完全断开连接；
- **嵌套与层次性**：Snarl 具有严格的树状包含结构（Snarl Tree）。最外层的宏观 Snarl 可能对应一个几兆碱基的大型倒位，其内部可递归嵌套几十个代表局部小型 InDel 或转座子插入的子 Snarl。这一代数结构为从图中全自动化识别和导出多等位变异 VCF 提供了坚实的数学理论支持。

---

## 三大构图流派的算法机制与技术分工

现代图泛基因组构建根据其参考依赖性与变异解析度，形成了三大代表性算法管线：

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      植物图泛基因组三大构建流派对比                      │
├───────────────────┬─────────────────────┬───────────────────────────────┤
│ 构图工具管线       │ 核心算法机制        │ 优势与植物科研适用场景        │
├───────────────────┼─────────────────────┼───────────────────────────────┤
│ **Minigraph**     │ 迭代增量骨架图诱导   │ 计算极快、内存极小；专用于检出│
│ (Li et al., 2020) │ (仅纳入 ≥50 bp SV)   │ 大规模植物组装的宏观结构变异  │
├───────────────────┼─────────────────────┼───────────────────────────────┤
│ **Minigraph-**    │ 参考引导分层对齐    │ 当前植物学界应用最广泛的金标准│
│ **Cactus**        │ 宏观 SV 骨架 + Cactus│ 兼顾宏观重排与单碱基精度，全面│
│ (Hickey et al.)   │ 全基因组单碱基全联配│ 支持下游 Giraffe 短/长读段分型│
├───────────────────┼─────────────────────┼───────────────────────────────┤
│ **PGGB**          │ 全对称无偏全对全比对│ 彻底消除任何参考选择偏倚；    │
│ (Garrison et al.) │ wfmash + seqwish +  │ 适合单倍型高度发散、无公认权威│
│                   │ smoothxg + odgi     │ 参考的小麦等复杂多倍体或野生群│
└───────────────────┴─────────────────────┴───────────────────────────────┘
```

### 1. Minigraph：增量启发式骨架图构建
Minigraph 采用迭代式增量构建策略：
1. 以选定的主参考基因组作为初始线性图；
2. 依次将其余植物组装比对至当前图；
3. 当且仅当比对检测到 $\ge 50\text{ bp}$ 的长结构插入或分叉时，在图中引入新节点和旁路边；
4. 优点是计算速度极快（数小时内可处理数十个植物基因组），但缺点是彻底忽略了 50 bp 以下的小型 InDel 与 SNP，无法作为高通量全基因分型的底图。

### 2. Minigraph-Cactus：全碱基高分辨率图构建（推荐工业级流程）
Minigraph-Cactus 完美结合了宏观拓扑稳定性与微观单碱基精度：
1. **宏观阶段**：调用 Minigraph 构建仅包含大片段 SVs 的骨架图；
2. **切分映射**：将全图沿非分支核心区域自动切割为可独立并行计算的局部连续区块；
3. **微观全联配**：调用经典的 Cactus 多序列全碱基比对器，在每个局部区块内部重构包含全部单碱基替换（SNPs）与小型插入缺失的高密度局部图；
4. **全景合并**：缝合为全局全碱基分辨率的变异诱导图，原生支持下游 `vg giraffe` 进行高精度短读段回贴与全基因组分型。

### 3. PGGB：完全无参考偏倚的全对全图诱导
PGGB（Pangenome Graph Builder）彻底摒弃了以单一基因组为骨干的先验设定：
1. **wfmash**：对全样本所有染色体执行高容错率、无预设立场的多对多全长局部比对；
2. **seqwish**：基于比对坐标的传递闭包（Transitive Closure）诱导生成初始碱基图；
3. **smoothxg**：在图局部建立多重序列比对（POA, Partial Order Alignment），对由于比对噪声引起的微小扭曲自环进行拓扑平滑；
4. **odgi sort**：利用一维 Hilbert 空间填充曲线或主成分投影对节点重新进行物理拓扑排序。

---

## 核心数据交换格式：GFAv1 与 rGFA

图泛基因组的工业界标准数据格式为 **GFA（Graphical Fragment Assembly）**：

### 1. 核心记录类型
- **`S` 行（Segment / Node）**：定义图节点物理实体
  ```text
  S  node_1024  ACGTGATCGATCGATC  LN:i:16
  ```
- **`L` 行（Link / Edge）**：定义节点间的有向连接
  ```text
  L  node_1024  +  node_1025  +  0M
  ```
  （表示 `node_1024` 的 3' 端连接至 `node_1025` 的 5' 端，重叠长度为 0）
- **`P` 行（Path）**：记录特定样本或染色体单倍型遍历的完整节点序列
  ```text
  P  Nipponbare#Chr1  node_1024+,node_1025+,node_1027+  *,*
  ```

### 2. rGFA（Reference-guided GFA）专属扩展标签
Minigraph 生成的 rGFA 在 `S` 行中引入了关键的参考坐标反向投影标签：
- `SN:Z:Chr1`：该节点所属的参考染色体名称；
- `SO:i:152000`：该节点在参考染色体上的起始偏移量（Start Offset）；
- `SR:i:0`：节点的层级排秩（Rank），其中 `SR:i:0` 严格代表主参考骨干节点，`SR:i:1` 代表次级样本插入，数字越大代表越特异的非参考序列。

---

## 参考文献与数据来源

1. **Li H, Feng X, Chu C.** (2020). The design and construction of reference pangenome graphs with minigraph. *Genome Biology*, 21(1), 265. DOI: [10.1186/s13059-020-02168-z](https://doi.org/10.1186/s13059-020-02168-z)
2. **Hickey G, Monlong J, Ebler J, et al.** (2023). Pangenome graph construction from genome alignments with Minigraph-Cactus. *Nature Biotechnology*, 42, 1464–1473. DOI: [10.1038/s41587-023-01793-w](https://doi.org/10.1038/s41587-023-01793-w)
3. **Paten B, Eizenga JM, Rosen YM, et al.** (2018). Superbubbles, secondary snarls, and the topology of pangenome graphs. *Journal of Computational Biology*, 25(7), 678–700. DOI: [10.1089/cmb.2017.0251](https://doi.org/10.1089/cmb.2017.0251)
4. **Guo L, Long Y, Wang X, et al.** (2025). Pangenomic analysis of wild and cultivated rice reveals structural variation and disease resistance genes. *Nature Genetics*, 57. DOI: [10.1038/s41588-024-02008-0](https://doi.org/10.1038/s41588-024-02008-0)
