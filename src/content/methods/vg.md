---
title: vg
name: vg
summary: 全面覆盖序列变异图构建、GBZ 单倍型索引、Giraffe 高性能读段图比对与 surject 线性投影的工业级图泛基因组分析套件。
version: "1.56.0"
dataType: GFA/VCF 变异图、单倍型 GBWT 索引、短读段/长读段 FASTQ 与 GAM/GAF 图比对文件
principle: 序列变异图数据模型、GBZ 单倍型感知索引、Snarl 距离矩阵加速与 Giraffe 多项式图比对
domainIds: [pangenomics-structural-variation]
topicIds: [m03-topic-03, m03-topic-06]
principleIds: [graph-genomics, minimizer]
dataIds: [graph, short-reads, long-reads, hifi]
paper: vg-paper
repository: https://github.com/vgteam/vg
status: published
updatedAt: 2026-11-25
---

## 软件定位与核心科学问题

随着泛基因组学研究的深入，学术界已经形成明确共识：用单一维度的扁平线性序列来表示一个物种的基因组是存在根本缺陷的。传统的线性参考比对工具（如 BWA、Bowtie、STAR）在面对与参考基因组差异较大、包含大片段转座子插入或染色体倒位的样本时，会出现严重的**参考偏倚（Reference Bias）**——与参考基因组相同的等位基因能轻易对齐，而携带非参考变异的真实读段则被降权、错配甚至完全丢弃。

为了在全基因组尺度彻底消弭参考偏倚，Erik Garrison、Jouni Sirén 与 Benedict Paten 等国际团队研发了 **vg（Variation Graph toolkit）**（其变异图基础模型发表于 *Nature Biotechnology*, 2018；其旗舰级图比对算法 Giraffe 发表于 *Science*, 2021）。

vg 是计算生物学中功能最强大、生态最完备的图泛基因组通用计算平台。它不仅统一定义了带方向的序列变异图（Variation Graph）数学模型，更通过革命性的 **vg giraffe** 引擎，基于 **GBZ 单倍型紧凑索引**、**真实单倍型 minimizer** 与 **Snarl 拓扑距离矩阵**，在完全保留图结构丰富性的同时，将全图读段比对速度提升到了与传统线性比对器（BWA-MEM）相当的秒级水准。

---

## 核心算法架构与数学推导

```
   [线性参考 FASTA + 群体多样本结构变异 VCF] 或 [多基因组组装构建的 GFA 图]
                                │
                                ▼
       阶段 1: 变异图构建与紧凑化 (vg construct / vg convert)
       └─ 构建节点序列、有向连接边与多样本单倍型穿行路径 (Paths)
                                │
                                ▼
       阶段 2: Giraffe 三重轻量索引构建 (vg autoindex)
       ├─ GBZ 索引: 结合 Graph BWT (GBWT) 紧凑压缩数千个已观测单倍型路径与图拓扑
       ├─ Distance 索引: 预先计算图所有气泡 (Snarls) 间的最短/最长测地距离
       └─ Minimizer 索引: 仅在【真实单倍型路径】上抽取 minimizers (杜绝虚假重组种子)
                                │
                                ▼
       阶段 3: Giraffe 单倍型感知高速图比对 (vg giraffe)
       ├─ 种子哈希匹配 ──► 利用 Distance 索引常数时间 O(1) 聚类
       └─ SIMD 向量化在受限单倍型子流形上执行动态规划对齐，输出 GAF/GAM
                                │
                                ├─────────────────────────────────────────┐
                                ▼                                         ▼
         图比对向线性参考投影 (vg surject)                 基于图比对的变异重分型 (vg call)
         └─ 提取指定参考路径，无偏导出标准线性 BAM 文件    └─ 结合图覆盖深度无偏分型 SNP 与大型结构变异
```

### 1. 序列变异图数据模型 (Sequence Variation Graph Model)

在数学图论中，vg 将泛基因组严谨定义为一个带单倍型标注的有向双向图（Bidirected Sequence Graph）：
$$G = (V, E, \mathcal{P})$$
其中：
- **节点集合 $V$**：每个节点 $v \in V$ 拥有唯一的非负整数编号，并携带一段非空的核苷酸序列 $\text{seq}(v) \in \{A, C, G, T\}^+$；
- **边集合 $E$**：每条边连接两个节点的特定末端。由于 DNA 双链特性，每个节点具有正向（$+$）与反向互补（$-$）两个方向。边 $e = (u^{\pm}, v^{\pm})$ 明确定义了核苷酸在物理双螺旋上的连接极性；
- **路径集合 $\mathcal{P} = \{P_1, P_2, \dots, P_m\}$**：代表实际测序观测到的具体连续序列。其中一条特异指定的路径对应标准参考基因组（如水稻 Nipponbare 或玉米 B73），其余路径对应各个测序样本的真实单倍型（Haplotype Walks）。

### 2. Giraffe 核心索引与计算加速机制 (Science 2021)

将数千万条读段对齐到包含数百万个分叉的复杂变异图，传统算法会因为遍历所有可能的分支组合而陷入计算爆炸。Giraffe 的核心突破在于：**将搜索空间严格限制在群体演化中真实观测到的单倍型路径之内**。

Giraffe 依赖三个互补的高性能图索引：

#### (1) GBZ 索引（GBWT + Graph）
- **Graph Burrows-Wheeler Transform（GBWT）**：将群体中成百上千个单倍型的穿行路径按 BWT 原理进行无损前缀压缩，支持以 $\mathcal{O}(L)$ 时间复杂度检索任意单倍型子序列；
- GBZ 将 GBWT 路径索引与紧凑序列图直接打包为一个单一的二进制只读文件，内存占用极小。

#### (2) 真实单倍型 Minimizer 索引
- 传统图索引在所有拓扑可能的分叉中抽取 minimizers，会产生海量在真实自然界中根本不存在的“人造重组假种子”；
- Giraffe **仅在已由 GBWT 索引的真实单倍型路径中提取 minimizers**。不仅使得索引体积相比传统图索引骤降 90%，更彻底杜绝了因随机重组假分支引起的无效哈希匹配。

#### (3) Snarl 拓扑距离索引 (Distance Index)
- 图论中，**气泡（Snarl）**是指可以通过一对分离节点（Cut-pair）从图中解耦出来的极小双连通子图；
- 距离索引预先通过树形分解递归存储了全图所有 Snarl 内部及 Snarl 之间的最短与最长物理距离；
- 当读段在图的不同节点命中多个 minimizer 种子时，Giraffe 无需在庞大的图上做昂贵的最短路径搜索（Dijkstra 算法），而是直接在 Snarl 距离树上执行常数时间 $\mathcal{O}(1)$ 的查表运算，秒级判定这些种子在物理上是否可能属于同一条共线匹配链。

### 3. 图比对向标准线性参考投影 (`vg surject`)

虽然图比对从根本上解决了参考偏倚，但下游许多变异分析软件（如 GATK HaplotypeCaller、FreeBayes）以及基因组浏览器（如 IGV）仍仅能读取基于一维线性坐标的 SAM/BAM 文件。

`vg surject` 提供了优雅的无偏投影桥梁：
1. 识别并提取图中被标记为主参考基因组的骨架路径 $P_{\text{ref}}$；
2. 对于每条在图上对齐的读段，将其在图节点间的行进坐标无偏投影至 $P_{\text{ref}}$ 的线性物理区间；
3. **消除偏倚的本质红利**：该读段是在无参考偏倚的全图拓扑中通过单倍型全局搜索找到的最佳位置，即便是投影回线性参考后生成的 BAM 文件，其在多态性极高的复杂位点处的映射准确率（Mapping Quality）与覆盖完整度依然显著超越直接用 BWA 比对线性参考的结果。

---

## 官方科学基准数据与植物实测对比 (Kopalli et al., 2024)

在发表于 *GigaScience*（2024）的作物图泛基因组基准研究中，研究团队在高粱真实测序数据上系统评估了基于线性参考的 Minimap2 与基于图泛基因组的 vg giraffe 的比对效能：

| 比对策略与工具平台 | 输入参考/图拓扑结构 | 公开真实短读段总比对率 (Total Mapping %) | 完美无错配比对比例 (Perfect Mappings %) | 核心科学结论与机理 |
| :--- | :--- | :--- | :--- | :--- |
| **传统线性比对 (Minimap2)** | 单一高粱参考基因组 (Tx430) | **82.47%** | **68.77%** | 线性比对总比对率略高，但完美比对率显著偏低，大量读段因被迫对齐参考而产生大量假错配。 |
| **图泛基因组比对 (vg giraffe)** | **Minigraph-Cactus 全碱基变异图** | **73.44%** | **82.77%**（+14.0%） | 图中包含群体的全部已知变异，读段能够完美匹配其来源单倍型，完美比对率大幅跃升 14 个百分点。 |
| **图泛基因组比对 (vg giraffe)** | **Minigraph 结构变异图** | **73.27%** | **78.13%**（+9.36%） | 仅纳入大结构变异即可显著改善跨越大型缺失/插入读段的对齐保真度。 |

---

## 典型分析命令与标准操作流

以下为利用 vg 生态执行泛基因组图索引构建、Giraffe 高性能比对与线性投影的标准流程：

```bash
# 阶段 1：使用 vg autoindex 一键构建 Giraffe 所需的三重索引 (针对短读段测序)
# 输入为标准全碱基变异图: plant_pangenome.gfa
# 自动生成: plant_pangenome.giraffe.gbz, plant_pangenome.min, plant_pangenome.dist
vg autoindex \
    --workflow giraffe \
    --gfa plant_pangenome.gfa \
    --prefix plant_pangenome \
    --threads 16

# 阶段 2：执行高精度单倍型感知图比对 (vg giraffe)
# -Z: 指定 GBZ 索引; -m: 指定 minimizer 索引; -d: 指定距离索引
# -f: 输入双端短读段 FASTQ; -t 16: 调用 16 线程
# 输出 GAF 格式图对齐文件: sample_graph_aln.gaf
vg giraffe \
    -Z plant_pangenome.giraffe.gbz \
    -m plant_pangenome.min \
    -d plant_pangenome.dist \
    -f sample_R1.fastq.gz \
    -f sample_R2.fastq.gz \
    -t 16 > sample_graph_aln.gaf

# 阶段 3：将图比对无偏投影为标准线性参考 BAM 文件 (vg surject)
# --ref-paths: 指定图中作为标准主干参考的染色体路径名称列表
# -b: 输出 BAM 格式; 随后通过 samtools 排序并建立索引
vg surject \
    -x plant_pangenome.giraffe.gbz \
    --ref-paths reference_chromosomes_list.txt \
    -b \
    -t 16 \
    sample_graph_aln.gaf | \
    samtools sort -@ 8 -o sample_surjected.sorted.bam

samtools index sample_surjected.sorted.bam

# 阶段 4：从图比对中直接执行群体变异重分型 (vg pack & vg call)
# 统计全图各节点的真实读段覆盖物理深度
vg pack \
    -x plant_pangenome.giraffe.gbz \
    -a sample_graph_aln.gaf \
    -o sample.pack \
    -t 16

# 基于覆盖深度呼叫该样本在全图中的特异等位基因 (输出标准 VCF)
vg call \
    plant_pangenome.giraffe.gbz \
    -k sample.pack \
    -t 16 > sample_genotyped_variants.vcf
```

---

## 科学研究案例与上下游分析协同

- **高粱与禾本科作物泛基因组图比对基准案例**：在作物图泛基因组系统基准评测（Kopalli 等，*GigaScience*, 2024）中，研究人员完整测试了 vg 体系在真实高粱全基因组数据中的应用。通过 `vg autoindex` 为 Minigraph-Cactus 构建的索引在保持极高内存效率的同时，支撑了海量重测序读段的高并发图映射。结果不仅证实了图比对能显著压制结构变异断点附近的虚假单核苷酸错配，更展示了 `vg surject` 在桥接下游经典分析工具中的核心价值；
- **分析工具流转与协作边界**：
  - **上游图源构建**：vg 既支持将传统 VCF 转化为图（`vg construct`），更广泛接受 **PGGB**、**Minigraph-Cactus** 输出的标准 GFA 文件；
  - **下游图拓扑与切片**：vg 生成的图或 GFA 可与 **ODGI** 深度互通，利用 ODGI 进行一维宏观流形平铺渲染或利用 `vg call` 进行无偏基因型判定。
