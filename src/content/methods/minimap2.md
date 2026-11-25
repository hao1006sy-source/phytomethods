---
title: minimap2
name: minimap2
summary: 基于稀疏 minimizer 种子索引、凸仿射链化与 SIMD 向量化局部比对的高性能长读段、全基因组组装与全转录本通用对齐器。
version: "2.28"
dataType: 长读段 (PacBio HiFi, ONT)、全基因组染色体级组装 FASTA、短读段及全长转录组 cDNA/直接 RNA
principle: 窗口 minimizer 稀疏哈希索引、同质多聚物压缩 (HPC)、凸分段仿射 gap 链化与条带动态规划对齐
domainIds: [pangenomics-structural-variation]
topicIds: [m03-topic-02]
principleIds: [alignment, minimizer]
dataIds: [assembly, dna-sequence, short-reads, long-reads, hifi]
paper: minimap2-paper
repository: https://github.com/lh3/minimap2
status: published
updatedAt: 2026-11-25
---

## 软件定位与核心科学问题

自单分子长读段测序（PacBio SMRT/HiFi、Oxford Nanopore ONT）技术问世以来，生物信息学比对领域面临着前所未有的计算挑战：
1. **长读段与全染色体组装对传统比对算法的维度打击**：读段长度从短读段的 150 bp 暴增至 10 kb ~ 100 kb+（超长 ONT reads 甚至突破 1 Mb），而全基因组组装比较更涉及数百兆碱基（Mb）染色体之间的直接对齐。传统的短读段比对工具（如 BWA、Bowtie）基于精确匹配的 BWT/FM-index 索引，在处理长序列时由于高错误率或结构变异导致回溯搜索空间发生组合爆炸；
2. **植物基因组极其高密度的转座子与同源重复**：植物基因组动辄高达 70%~85% 为反转录转座子（LTR-RT），全 $k$-mer 索引内存消耗极其庞大，导致全基因组比对成为严重的高性能计算瓶颈；
3. **大片段插入与缺失（Indels/SVs）导致对齐链断裂**：传统的线性罚分模型在遇到转座子跳跃插入（如 5~10 kb 的插入事件）时会施加极大的累计罚分，造成比对人为割裂为断断续续的局部碎片。

为了彻底解决这一系统性难题，李恒（Heng Li）研发了 **minimap2**（发表于 *Bioinformatics*, 2018）。作为近十年来基因组学与三代测序领域最重要的基础设施工具之一，minimap2 综合运用了**窗口 minimizer 稀疏索引**、**同质多聚物压缩（HPC）**、**非线性凸分段仿射 gap 链化（Convex Gap Cost Chaining）**与 **SIMD 向量化局部比对**，兼顾了近乎物理极限的比对速度与高度可靠的结构变异容忍能力。

---

## 核心算法原理与数学推导

```
   [参考基因组序列 (Reference FASTA)]
                  │
                  ▼
   (w, k)-minimizer 稀疏哈希索引构建 (采样密度 2/(w+1))
   └─ 可选启用同质多聚物压缩 (HPC: AAAA -> A 抹平 ONT 测序偏倚)
                  │
                  ├─────────────────────────────────────────┐
                  ▼                                         ▼
   [查询序列: PacBio HiFi / ONT / 组装 FASTA]      提取查询序列 minimizers 并哈希匹配
                  │                                         │
                  └────────────────────┬────────────────────┘
                                       ▼
                       匹配锚点收集 (Anchors: (x, y))
                                       │
                                       ▼
                       非线性凸仿射链化 (Convex Chaining)
                       └─ 动态规划求解最优锚点链，放宽超长 gap 罚分
                                       │
                                       ▼
                       条带动态规划与 SIMD 向量化延伸 (Banded DP Extension)
                       └─ Suzuki-Kasahara 算法精确生成 CIGAR 串
                                       │
                                       ▼
                       输出 PAF (轻量比对坐标) 或 SAM/BAM (带全 CIGAR 记录)
```

### 1. $(w, k)$-minimizer 稀疏哈希索引与同质多聚物压缩 (HPC)

为了在极低内存占用下实现秒级快速定位，minimap2 采用稀疏的 minimizer 代表元抽样机制：
1. **窗口代表元抽取**：
   对于序列中的每一个滑动窗口（该窗口包含 $w$ 个连续的长度为 $k$ 的 $k$-mer），通过不可逆哈希函数 $h(\cdot)$ 计算每个 $k$-mer 的哈希值，挑选哈希值最小的那个 $k$-mer 作为代表元：
   $$m(W) = \arg\min_{k\text{-mer} \in W} h(k\text{-mer})$$
2. **理论稀疏压缩比**：
   在随机序列中，选取 minimizer 的期望采样密度为：
   $$\text{Density} = \frac{2}{w + 1}$$
   例如设定 $w=19, k=19$ 时，索引密度仅为全 $k$-mer 的 10%，将全基因组索引的内存消耗与哈希冲突直接压缩了整整一个数量级；
3. **同质多聚物压缩（Homopolymer Compression, HPC）**：
   Oxford Nanopore 早期平台最典型的系统误差为同质多聚物测序偏倚（如将 6 个 `A` 误读为 5 个或 7 个）。minimap2 在抽取 minimizer 之前，可预先将所有连续相同碱基坍缩为单一碱基（如 `GAAATTC` $\to$ `GATC`），从底层数学特征上彻底抹平了长度测量误差。

### 2. 高阶启发式锚点链化 (Heuristic Chaining)

设参考序列与查询序列之间通过 minimizer 哈希匹配获得了一组同向共线匹配锚点集合 $\mathcal{A} = \{a_1, a_2, \dots, a_N\}$，其中每个锚点为坐标对 $a_i = (x_i, y_i)$（$x_i$ 为参考坐标，$y_i$ 为查询坐标）。

目标是寻找一条最优子序列链 $\mathcal{C} = (a_{i_1}, a_{i_2}, \dots, a_{i_m})$，使得该链的累计收益减去距离惩罚最大化：
$$f(j) = \max \left( w_j, \max_{i < j, y_i < y_j, x_i < x_j} \left[ f(i) + \min(w_j, y_j - y_i) - \gamma(x_j - x_i, y_j - y_i) \right] \right)$$
其中：
- $w_j$ 为锚点 $a_j$ 的基础匹配长度（即 $k$）；
- $\min(w_j, y_j - y_i)$ 为去除重叠后的有效新增匹配增益；
- $\gamma(\Delta x, \Delta y)$ 为**凸分段仿射 Gap 罚分函数（Convex Gap Cost Function）**：
  $$\gamma(\Delta x, \Delta y) = q \cdot |\Delta x - \Delta y| + \begin{cases} e_1 \cdot |\Delta x - \Delta y|, & \text{若 } |\Delta x - \Delta y| \le L_0 \\ e_1 \cdot L_0 + e_2 \cdot (|\Delta x - \Delta y| - L_0), & \text{若 } |\Delta x - \Delta y| > L_0 \end{cases}$$
  （其中 $e_2 \ll e_1$）。
- **数学物理意义**：对于短 Indel，采用较大斜率 $e_1$ 严厉罚分；而对于跨越转座子或大片段缺失的超长 Gap，罚分斜率迅速切换为极小值 $e_2$。这种凹形/凸分段罚分使得长达数万碱基的结构变异不会导致比对链的断裂，实现了长跨度结构变异的完整追踪。

### 3. SIMD 并行向量化条带对齐 (Banded Alignment Extension)

锚点链化确定了读段在全基因组上的宏观行进轨迹后，minimap2 并不对全矩阵执行昂贵的全局 Smith-Waterman 算法：
- 仅在相邻锚点之间的狭窄条带（Bandwidth 通常设为 100~500 bp）内执行动态规划；
- 采用 **Suzuki-Kasahara 算法（基于 2-bit 对角线编码）**，深度调用 CPU 的 SSE2、AVX2 或 AVX-512 SIMD 并行寄存器向量化计算，将单碱基级全局 CIGAR 串生成速度提升了数十倍。

---

## 任务专用 Presets 预设规范与避坑指南

minimap2 采用 `-x` 参数封装了高度优化的专用任务预设，**在植物分析中必须严格按测序数据类型与分析目标精确匹配，严禁跨模式生搬硬套**：

| 分析任务 | 推荐 Preset 参数 | 关键算法底层配置 | 适用植物生信场景与避坑要点 |
| :--- | :--- | :--- | :--- |
| **PacBio HiFi 读段比对** | `-x map-hifi` | $k=19, w=19$；无 HPC；严格的误配罚分 | **高保真 HiFi 测序黄金标准**：由于 HiFi 准确率 $>99.9\%$，该模式下严格惩罚错配，能极大提升植物同源染色体与基因旁系的区分度。 |
| **Oxford Nanopore 比对** | `-x map-ont` | $k=15, w=10$；开启 HPC；容忍高插入/缺失率 | 适用于 ONT 超长读段。能自动抹平高错误率并在富含转座子的复杂区域稳健穿行。 |
| **近缘基因组组装比较** | `-x asm5` | $k=19, w=19$；极小的 gap 惩罚；针对分化度 $\le 5\%$ | **同物种不同品种组装比对首选**（如水稻明恢 63 vs 珍汕 97、玉米 B73 vs Mo17）。 |
| **中度分化物种组装比较** | `-x asm10` | $k=19, w=19$；放宽分化容忍；针对分化度 $\le 10\%$ | 适用于近缘种或亚种间组装共线性比对（如亚洲栽培稻 vs 普通野生稻 *O. rufipogon*）。 |
| **高度分化或属间组装比对** | `-x asm20` | $k=15, w=10$；较短的种子；针对分化度 $\le 20\%$ | 适用于草本与木本植物跨属比较。种子变短以保证在演化分化区依然能捕获锚点。 |
| **全长转录组 (Iso-Seq/cDNA)** | `-x splice` | 引入非对称内含子剪接位点先验（GT-AG） | 识别植物可变剪接与全长转录本结构；严禁使用常规 DNA 比对模式。 |

---

## 典型分析命令与标准操作流

以下为在植物基因组分析中两类最典型场景的命令行规范：

### 场景 A：高质量染色体组装间比对（Assembly-to-Assembly，输出 PAF 供共线性分析）

```bash
# 比较两个水稻单倍型组装，序列差异在 5% 以内 (asm5)
# -c: 生成 CIGAR 字符串; --cs: 输出紧凑的碱基差异差分标签 (极利于下游直接提取 SNP/InDel)
# -t 16: 调用 16 线程并行
minimap2 \
    -x asm5 \
    -c \
    --cs \
    -t 16 \
    Oryza_sativa_Nipponbare.fa \
    Oryza_sativa_9311.fa > rice_9311_vs_nip.paf

# 利用配套工具 paftools 从 PAF 中直接提取结构变异与高精变异位点
paftools.js call rice_9311_vs_nip.paf > rice_assembly_variants.vcf
```

### 场景 B：PacBio HiFi 测序 reads 回比参考基因组（输出坐标排序 BAM 供 Sniffles2 检测 SV）

```bash
# 对水稻 HiFi 测序 reads 进行精准对齐
# -a: 输出 SAM 格式 (而非 PAF); -Y: 使用软剪切 (Soft clipping) 保留嵌合多重对齐
minimap2 \
    -ax map-hifi \
    -t 16 \
    -Y \
    rice_reference.fa \
    rice_sample_hifi.fastq.gz | \
    samtools sort -@ 8 -m 4G -o rice_sample_hifi.sorted.bam

# 为生成的 BAM 文件建立物理索引
samtools index rice_sample_hifi.sorted.bam
```

---

## 科学研究案例与上下游分析协同

- **野生稻与栽培稻泛基因组 SNP 与 PAV 调用案例**：在郭等关于野生稻与栽培稻群体演化的里程碑研究中，研究团队利用 minimap2 对大规模三代长读段进行了参考对齐，并将其标准 BAM 文件无缝对接至 Longshot（用于 SNP 分型）与 Sniffles（用于长读段结构变异检测）；而在基因组共线性与非参考序列识别模块中，minimap2 依靠其高效的 `asm5/asm10` 预设，在数十份野生稻染色体级组装间快速完成了高质量的全基因组共线性映射，为下游基因存在缺失分析提供了无偏的物理比对基石；
- **分析工具流转与协作边界**：
  - **核心边界**：minimap2 专职于**原始序列到参考的超快速物理对齐与坐标映射**；它本身不负责变异的过滤分型与统计假设检验（此任务由 Sniffles2、Longshot 或 DeepVariant 完成）；
  - **图泛基因组图谱**：当基因组间存在超大规模倒位与复杂基因渗入时，可将 minimap2 的比对结果作为生成 Pan-genome 变异图的基础，或直接进阶至基于图索引的比对工具（如 **vg giraffe**）。
