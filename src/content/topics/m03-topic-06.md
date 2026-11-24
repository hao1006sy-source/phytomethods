---
title: 图上的序列比对与变异分型
summary: 深入解析图泛基因组索引构建（GBWT/GBZ/Distance Index）、Giraffe 单倍型感知高速比对算法、GAF 格式规范及贝叶斯变异分型数学推导。
domain: pangenomics-structural-variation
methods: [vg, odgi]
status: published
updatedAt: 2026-11-25
---

## 核心科学问题与计算复杂性挑战

将高通量短读段（Short Reads）或长读段（Long Reads）比对至参考基因组，是全基因组变异检测的起点。在线性参考坐标系下，比对算法仅需在一维坐标空间内寻找对齐位置。然而，在**图泛基因组**（Graph Pangenome）中，图包含成千上万个分叉气泡、倒位反向边与复杂多等位节点：
1. **组合爆炸（Combinatorial Path Explosion）**：如果允许读段在图的任意分支节点之间自由跳转，理论上可以遍历出天文数字般的“嵌合虚假路径”，导致搜索空间呈指数级膨胀，造成比对时间不可接受且假阳性剧增；
2. **图上距离度量（Graph Distance）计算昂贵**：在线性序列中，两个种子的间距等于简单的坐标相减；但在带有复杂环状拓扑的图中，求解两个种子之间的最短路径等价于求解全图最短路径问题（Dijkstra 复杂度 $O(|E| + |V| \log |V|)$），在高通量比对中会带来极大的算力开销；
3. **坐标投影与变异分型**：图上的比对结果是以节点路径序列（Node Traversal）呈现的，如何将复杂的图比对证据无损转换为符合临床与农业分子育种规范的标准 VCF 格式，是实现落地的核心瓶颈。

为了解决这一系列理论与工程难题，以 **vg（Variation Graph toolkit）** 与 **Giraffe** 为代表的新一代图比对生态系统应运而生。

---

## 核心索引体系：GBWT、GBZ 与 Distance Index

为了在图上实现媲美传统线性比对工具（如 BWA-MEM、Bowtie2）的秒级高速映射，Giraffe 引入了三位一体的高性能索引架构：

```
                    ┌──────────────────────────────────────────┐
                    │     变异诱导图 (GFA / rGFA / VG 格式)     │
                    └────────────────────┬─────────────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
【单倍型压缩索引 (GBWT)】          【几何拓扑索引 (Distance Index)】   【特征种子索引 (Minimizers)】
 压缩存储真实生物学单倍型          基于 Snarl 树常数时间 O(1)         在 GBWT 采样的高频单倍型空间
 将搜索空间限制在已观测路径        查询图中任意两节点间测地线距离      提取具有最小哈希值的特征 k-mer
        │                                │                                │
        └────────────────────────────────┼────────────────────────────────┘
                                         ▼
                    ┌──────────────────────────────────────────┐
                    │       GBZ 统一紧凑二进制图格式包装         │
                    │   (原生集成 GBWTGraph 与单倍型索引)      │
                    └──────────────────────────────────────────┘
```

### 1. 图 Burrows-Wheeler 变换（Graph BWT, GBWT）
传统的 BWT 仅能压缩线性文本。Sirén 等人（2020）发明的 **GBWT** 能够将图上的有向多单倍型路径高度压缩：
- **约束搜索空间**：GBWT 记录了每一个节点后继连接在各个已知单倍型中的真实转移概率。在比对延伸时，算法**仅沿着生物学上已被实测单倍型走过的路径前行**，彻底封死了不存在的重组虚假路径，将图搜索复杂度从指数级直接压回线性级；
- **极高压缩比**：在大型植物群体（如水稻数千个单倍型）中，由于大部分序列高度共享，GBWT 能够将数千条染色体的路径信息压缩至几百兆字节内存中。

### 2. 超泡距离索引（Snarl-based Distance Index）
为了在不执行昂贵图遍历的前提下评估两个种子是否可能属于同一个测序读段，Giraffe 利用 Snarl 的树状分解（Snarl Tree）预计算距离矩阵：
- 对于位于同一个 Snarl 内部或不同层级 Snarl 间的任意两个节点，Distance Index 可在 **$O(1)$ 常数时间**内直接返回两者之间的图上最小测地线物理跨度，为后续种子聚类（Clustering）提供了极高的执行效率。

---

## Giraffe 单倍型感知比对算法流水线

```
输入 Reads ──► Minimizer 种子匹配 ──► Distance Index 聚类 ──► GBWT 无缺口延伸 ──► WFA 带状对齐 ──► 输出 GAF
```

1. **种子匹配（Minimizer Seeding）**：在输入 reads 中提取 $k$-mer（通常 $k=29, w=11$），利用 Minimizer 索引快速定位图中的匹配节点；
2. **图距离聚类（Clustering）**：利用 Distance Index，将物理间距在文库插入片段长度（如 $300 \sim 500\text{ bp}$）以内的候选种子合并为一个共线簇；
3. **GBWT 约束无缺口延伸（Gapless Extension）**：以聚类中的种子为锚点，沿着 GBWT 所支持的单倍型路径向两侧无缺口快速延伸，计算精确匹配得分；
4. **波前算法带状对齐（WFA Alignment）**：对未完全对齐的局部断裂区域，调用 Wavefront Alignment（WFA）算法在图的局域子图上完成最终的带间隙全局最优联配；
5. **计算映射质量（MAPQ）**：根据最高分路径与次优路径的分值差，结合测序错误模型估计比对置信度。

---

## 图比对输出标准：GAF 格式深度解析

图比对输出的标准交换格式为 **GAF（Graph Alignment Format）**，其采用类似于 PAF 的 12 列制表符分隔结构：

| 列号 | 字段名称 | 示例数据 | 含义与解释 |
| :--- | :--- | :--- | :--- |
| **Col 1** | Query sequence name | `read_001` | 输入测序读段的唯一标识符 |
| **Col 2** | Query sequence length | `150` | 读段物理全长（bp） |
| **Col 3-4**| Query start / end | `0 / 150` | 比对在读段中的起始与终止位置（0-based, 半开区间） |
| **Col 5** | Strand | `+` | 读段相对图路径的相对方向 |
| **Col 6** | Path matching | `>1024>1025<1028` | **核心路径字段**：`>` 表示正向穿越该节点，`<` 表示反向互补穿越 |
| **Col 7** | Path length | `220` | 该路径上所有节点序列的总长度（bp） |
| **Col 8-9**| Start / End on path | `20 / 170` | 比对在整条路径上的起始与终止物理偏移量 |
| **Col 10** | Number of residue matches | `148` | 完全匹配的核苷酸碱基数 |
| **Col 11** | Alignment block length | `150` | 比对总跨度（包含错配与 InDel） |
| **Col 12** | Mapping quality (MAPQ) | `60` | Phred 标度的比对质量得分（-10 log10 P_err） |

---

## 贝叶斯变异分型数学推导（Genotyping Formulation）

从图比对结果（GAF/GAM）向标准二倍体或多倍体基因型 VCF 转换，本质是一个**贝叶斯最大后验概率估计**（MAP）问题。

设在全基因组某个特定变异超泡（Snarl）位点中，该位点存在 $m$ 条互斥的等位单倍型候选分支 $\{a_1, a_2, \dots, a_m\}$。对于一个倍性为 $c$ 的植物样本（例如二倍体 $c=2$，候选基因型由两条单倍型组成 $G = (a_{j_1}, a_{j_2})$；同源四倍体 $c=4$，$G = (a_{j_1}, a_{j_2}, a_{j_3}, a_{j_4})$）：

观察到所有覆盖该位点的独立测序读段集合为 $R = \{r_1, r_2, \dots, r_n\}$。在已知先验概率 $P(G)$ 的条件下，基因型 $G$ 的后验概率由贝叶斯定理推导为：

$$P(G \mid R) = \frac{P(G) \cdot P(R \mid G)}{\sum_{G'} P(G') \cdot P(R \mid G')}$$

### 1. 似然函数计算
假设各测序读段的产生相互独立，总似然函数为单条读段似然的连乘积：

$$P(R \mid G) = \prod_{i=1}^n P(r_i \mid G)$$

在已知基因型 $G$ 的各等位基因等概率发射测序读段的零假设下，单条读段 $r_i$ 在基因型 $G$ 上的边际似然为对 $G$ 包含的 $c$ 条等位路径的均匀混合：

$$P(r_i \mid G) = \frac{1}{c} \sum_{a \in G} P(r_i \mid a)$$

其中 $P(r_i \mid a)$ 为读段 $r_i$ 来源于单倍型路径 $a$ 的条件概率，由读段各碱基的测序质量值（Phred Quality Score $Q$）与比对编辑距离对数似然推导计算。

### 2. 基因型判定准则
最终预测的基因型 $G^*$ 为使后验概率最大的候选组合：

$$G^* = \arg\max_G \log P(G \mid R)$$

若最高分基因型与次优基因型的对数似然比（Log-likelihood Ratio）未达到预设置信阈值（例如低于 30），或者该位点仅由跨分支节点共享序列读段支持、完全缺乏能够区分分支的特异性读段，算法将严禁虚假填充为纯合参考，而是输出为**未决基因型（Missing Genotype, `./.`）**。

---

## 参考文献与数据来源

1. **Sirén J, Monlong J, Chang X, et al.** (2021). Pangenomics enables genotyping of complex structural variants in 5202 diverse human genomes. *Science*, 374(6574), abg8871. DOI: [10.1126/science.abg8871](https://doi.org/10.1126/science.abg8871)
2. **Garrison E, Sirén J, Novak AM, et al.** (2018). Variation graph toolkit improves read mapping by reducing reference bias. *Nature Biotechnology*, 36(9), 875–881. DOI: [10.1038/nbt.4227](https://doi.org/10.1038/nbt.4227)
3. **Sirén J.** (2020). Indexing variation graphs with the compressed suffix array. *Algorithms for Molecular Biology*, 15, 12. DOI: [10.1186/s13015-020-00171-8](https://doi.org/10.1186/s13015-020-00171-8)
4. **Ebler J, Ebert P, Clarke L, et al.** (2022). Pangenome-based genome inference allows efficient and accurate detection of structural variation. *Nature Genetics*, 54(4), 518–525. DOI: [10.1038/s41588-022-01043-w](https://doi.org/10.1038/s41588-022-01043-w)
