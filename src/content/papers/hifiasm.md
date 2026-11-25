---
title: "Haplotype-resolved de novo assembly using phased assembly graphs with hifiasm"
summary: "提出相位感知组装图 (Phased Assembly Graph) 算法架构，直接利用高准确度 PacBio HiFi 长读段的高保真度与连续性，在不压制等位杂合多样性的前提下原生输出两套完全分相的单倍型基因组。"
authors: "Cheng H, Concepcion GT, Feng X, Zhang H, Li H"
year: 2021
journal: Nature Methods
doi: 10.1038/s41592-020-01056-5
type: method
method: hifiasm
methodIds: [hifiasm]
domainIds: [genome-assembly]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

## 研究背景与算法贡献

在真核生物全基因组从头组装（*de novo* assembly）中，如何高精度解析同源染色体的单倍型序列（Haplotypes）长期以来是计算生物学的一大瓶颈。传统基于噪声长读段（如早期 CLR 或 ONT）的拼接算法普遍采用**“折叠-压平”（Collapse-and-Purge）**策略：先将杂合等位基因区域强制压缩为单一的伪单倍型共识序列（Primary Contigs），再将残余的替代分支（Alternative Contigs）作为副产品剥离。这种策略不仅丢失了大量结构变异与等位基因特异性表达调控信息，且极易在复杂高度杂合区引入嵌合拼接错误（Switch Errors）。

针对 PacBio 高保真长读段（HiFi reads，平均读长 15~20 kb，碱基准确率 >99.9%）的出现，李恒团队与合作者开发了 **Hifiasm**。其核心算法突破在于摒弃传统的叠缩假设，提出了**相位感知双亲/单倍型组装图（Phased Assembly Graph）**理论：
1. **保留全部杂合分相信息**：在组装图的构建初期即保留所有等位变异气泡（Bubbles），避免人为贪心合并；
2. **读段级纠错与单倍型标记**：利用同源重叠群之间的微小单核苷酸差异（SNVs）完成重叠群内（Intra-read）与重叠群间（Inter-read）的局部定相；
3. **多模式分相输出**：原生支持无父母本辅助的独立分相（HiFi-only）、基于父母本短读段 k-mer 的精准三重定相（Trio-binning），以及基于高通量染色质构象捕获（Hi-C）的一步式染色体尺度全分相组装。

---

## 核心数学模型与数据结构

Hifiasm 采用基于局部对齐重叠群的弦图（String Graph）拓展架构，核心数学模型包含以下关键阶段：

```
                 原始 HiFi Reads
                       │
                       ▼
             [同源全对全比对识别 SNVs]
                       │
                       ▼
           [单倍型特异性 Read 纠错]
        (保留真实等位杂合，消除系统测序错误)
                       │
                       ▼
         [构建双向加权 Phased Assembly Graph]
                       │
       ┌───────────────┴───────────────┐
       ▼                               ▼
[非辅助气泡解旋模式]             [外部数据指导定相模式]
• 基于拓扑与覆盖度剥离             • Trio-binning (亲本特异 k-mer)
• 输出 Primary / Alternate       • Hi-C 接触概率马尔可夫聚类
       │                               │
       ▼                               ▼
完全分相的双单倍型序列组装 (Haplotype 1 & Haplotype 2)
```

1. **同源等位多态性识别与保真纠错**：
   对于重叠读段集合 $\mathcal{R}$ 中的任意读段对 $r_i, r_j$，计算其汉明距离与比对分值。若两读段间存在系统性的纯合差异位点且覆盖度支持二项分布：
   $$P(X = k) = \binom{n}{k} p^k (1-p)^{n-k}$$
   算法将其判定为真实杂合 SNV 并施加锁定；仅对随机离散的低频单碱基替换执行多数表决纠错（Majority Voting），从而严格保护等位多态性不被抹除；
2. **气泡链（Bubble Chains）拓扑解缠**：
   在组装图中，杂合位点与短插入缺失表现为典型的简单气泡（Simple Bubbles）或复式气泡（Complex Bubbles）。设气泡源点为 $v_s$，汇点为 $v_t$，分支路径集合为 $\mathcal{P} = \{p_1, p_2\}$。Hifiasm 通过追踪跨越 $v_s$ 与 $v_t$ 的原始长读段物理连接集合 $\mathcal{L}$，构建二元相关度得分矩阵，使长读段跨越距离直接指导同向分支的拼接；
3. **Trio-binning 与 Hi-C 似然度目标函数**：
   当提供父母本 Illumina 测序数据时，算法利用 Meryl 提取亲本特有标记 $K_{\text{mat}}$ 与 $K_{\text{pat}}$，计算图中每个节点 $u$ 的亲本归属似然比：
   $$\Lambda(u) = \frac{\sum_{k \in u} \mathbb{I}(k \in K_{\text{mat}})}{\sum_{k \in u} \mathbb{I}(k \in K_{\text{pat}}) + \epsilon}$$
   当提供 Hi-C 数据时，构建染色体接触概率矩阵 $C_{ij}$，利用马尔可夫聚类（MCL）与全局单倍型路径规划算法将重叠群分别定向至两个独立的单倍型组件。

---

## 算法复杂度与计算性能

| 性能指标 | 理论复杂度 / 实测参数 | 算法工程优化机制 |
| :--- | :--- | :--- |
| **全对全比对** | $O(N \log N)$ 期望时间 | 基于 Minimizer 索引与双向带状 Myers 扩展算法，多线程线性加速 |
| **内存空间复杂度** | 峰值约 68 GB RAM (以 2.2 Gb 玉米基因组为例) | 紧凑型 2-bit 碱基压缩与内存映射（mmap）图结构存储 |
| **CPU 计算耗时** | 典型植物基因组（~1 Gb）约 3~6 小时（48 线程） | 高度优化的多线程无锁并发队列，计算-I/O 流水线重叠 |
| **连续性指标** | Contig N50 普遍达 20~50 Mb+ | 直接跨越全长植物 LTR 反转录转座子与串联微卫星重复 |

---

## 植物基因组学应用场景与科研价值

1. **高杂合野生与果树植物破译**：
   果树（如苹果、葡萄、柑橘、芒果）与多年生林木天然高度杂合且难以纯系化。Hifiasm 的双单倍型无损输出能力，使育种家首次能够同时获得等位基因间完整的结构变异全景图与等位特异性表达谱；
2. **杂交后代与多倍体精准分相**：
   对于单交种水稻、玉米或异源多倍体（如小麦、甘蓝型油菜），Hifiasm 结合 Trio-binning 模式可实现高达 99.9% 以上的亲本分相正确率（Switch error < 0.1%），为解析超亲优势与亚基因组不对称演化提供了基石；
3. **复杂着丝粒与核仁组织区（NOR）跨越**：
   配合 HiFi 长读段的高物理保真度，Hifiasm 能直接连续拼装出长达数兆碱基的染色体着丝粒区域卫星 DNA 阵列，极大推进了模式植物拟南芥与水稻端粒到端粒（T2T）基因组图谱的完成。

---

## 输入输出规范与关键参数指南

### 关键运行参数

```bash
# 1. 独立非辅助单倍型感知组装模式 (标准模式)
hifiasm -o plant_asm -t 48 hifi_reads.fq.gz

# 2. 父母本三重分相模式 (Trio-binning 模式)
hifiasm -o plant_trio -t 48 -1 maternal.kmer.dump -2 paternal.kmer.dump hifi_reads.fq.gz

# 3. 整合 Hi-C 数据染色体级原位分相模式
hifiasm -o plant_hic -t 48 --h1 hic_R1.fq.gz --h2 hic_R2.fq.gz hifi_reads.fq.gz

# 4. 超高杂合度植物防过度剪枝优化
hifiasm -o plant_hetero -t 48 -l 0 --n-perturb 100 hifi_reads.fq.gz
```

- `-t <int>`：线程数（推荐 32~64 线程）；
- `-l <int>`：单倍型清除级别（`0` 表示完全禁用 PURGE 过程，保留最大等位复杂性；默认 `3` 用于近交纯系）；
- `-s <float>`：相似度截断阈值（用于区分同源染色体与近期重复片段）；
- `--hom-cov <int>`：纯合覆盖峰值（建议从 K-mer 频谱预估，供算法判定单倍型与二倍体深度）。

### 标准输出文件体系

- `*.bp.p_ctg.gfa`：主重叠群（Primary Contigs）组装图；
- `*.bp.a_ctg.gfa`：替代等位重叠群（Alternate Contigs）组装图；
- `*.dip.hap1.p_ctg.gfa` / `*.dip.hap2.p_ctg.gfa`：Trio 或 Hi-C 模式下两套完全分相的单倍型组装图（可直接经 `gfatools gfa2fa` 转换为 FASTA 格式）。

---

## 阅读与复现资源

- **论文全文**：[Nature Methods, 18(2), 170–175 (2021)](https://doi.org/10.1038/s41592-020-01056-5)
- **PubMed 记录**：[PMID: 33526943](https://pubmed.ncbi.nlm.nih.gov/33526943/)
- **官方开源代码仓库**：[GitHub - chhylp123/hifiasm](https://github.com/chhylp123/hifiasm)
- **相关方法与教程页面**：[Hifiasm 算法工具详情](../../methods/hifiasm/) ｜ [Hifiasm 真实数据实测教程](../../tutorials/hifiasm-intro/)
