---
title: 组装质量评估与基准
summary: 深度剖析 N50/NG50 数学定义、Merqury 参考无关 k-mer 拷贝数谱图与对数 QV 推导、BUSCO 基因空间完整性及多倍体植物质控陷阱。
domain: genome-assembly
methods: [merqury]
updatedAt: 2026-11-25
---

## 质量评估的多维正交框架

在植物基因组学研究中，评估一个从头组装草图或参考基因组的优劣，绝不能依赖单一的长度统计指标。一个高度连续但充满错误嵌合（Mis-assembly）或碱基错误的序列，不仅会给下游的基因结构预测、转座子注释带来毁灭性系统偏差，还会彻底误导比较基因组学与结构变异检测。

现代国际基因组学联盟（如 Earth BioGenome Project, EBP 与 Vertebrate Genomes Project, VGP）提出了正交独立的**四维质量评价体系**：
1. **连续性（Continuity）**：Contig 与 Scaffold 的宏观长度分布（N50 / NG50）；
2. **碱基准确率（Base Accuracy）**：单碱基替换与小片段插入缺失（InDel）的质量值（QV）；
3. **序列与单倍型完整度（Completeness & Phasing）**：全基因组无偏 $k$-mer 覆盖与等位基因纯净分离度；
4. **结构准确性（Structural Fidelity）**：大尺度重排、倒位、易位及染色体空间构象的真实性。

![N50 与 NG50 累加阶梯对比及 Merqury 拷贝数谱图](/phytomethods/images/topics/m01/assembly-quality-curves.svg)

---

## 连续性指标的严格数学定义与陷阱规避

### 1. N50 与 L50 的数学形式化

设某个组装结果包含 $n$ 条 Contig（或 Scaffold），其长度集合降序排列为：

$$L = \{l_1, l_2, \dots, l_n\} \quad \text{其中} \quad l_1 \ge l_2 \ge \dots \ge l_n$$

组装总长度定义为序列长度的总和：$S = \sum_{i=1}^n l_i$。

- **N50 长度**：满足前缀累加和首次达到或超过组装总长 $50\%$ 的临界序列长度 $l_k$：

$$N50 = l_k \quad \text{满足} \quad \sum_{i=1}^{k-1} l_i < \frac{S}{2} \le \sum_{i=1}^k l_i$$

- **L50 数量**：达到上述 $50\%$ 阈值所需的最小序列条目数，即上式中的下标 $k$：

$$L50 = k$$

同理可推广至 N90、L90 等指标。

### 2. 植物科研陷阱：为何高杂合植物必须使用 NG50？

在二倍体高杂合植物（如异交树木、果树、高杂合自交不亲和植物）中，若组装软件未能完美将同源单倍型合并或分相，两条同源染色体的不同等位序列会同时进入组装结果，导致总组装长度 $S$ 严重偏离真实的单倍体基因组大小 $G$（例如真实 $G = 1.0\text{ Gb}$，而组装总长 $S = 1.8\text{ Gb}$）。

此时，使用 $S/2 = 0.9\text{ Gb}$ 作为阈值计算出的 N50 会产生严重的**虚假偏高或失真**。

为了消除组装冗余对评估尺度的扭曲，必须引入基于独立实验物理测定（如流式细胞术 C-value 或精细 $k$-mer 频数分析）的真实基因组单倍体大小 $G$：

$$NG50 = l_m \quad \text{满足} \quad \sum_{i=1}^{m-1} l_i < \frac{G}{2} \le \sum_{i=1}^m l_i$$

$$LG50 = m$$

当且仅当组装完整覆盖全基因组且无冗余时，$S \approx G$，此时 $N50 \approx NG50$。若 $N50 \gg NG50$ 且总长严重超标，往往提示存在严重的等位基因未折叠冗余。

---

## 参考无关 k-mer 谱与 Merqury 碱基质量推导

传统的准确率评估往往依赖比对至已知近缘参考基因组，这在植物从头测序中必然引入严重的参考偏倚。Rhie 等人于 2020 年开发的 **Merqury**，利用高精度原始测序读段（如短读段或 PacBio HiFi）构建的 $k$-mer 频数数据库（Meryl），实现了完全不依赖外部参考的独立科学评估。

### 1. 单碱基错误率 $E$ 与 Phred 质量值 QV 数学推导

假设单倍体基因组由独立随机碱基构成。设 $k$-mer 长度为 $k$，在组装序列中提取出的总不同 $k$-mer 数为 $K_{\text{total}}$，其中能在原始高精度测序读段集合中精确匹配到的可信共有 $k$-mer 数为 $K_{\text{shared}}$。

定义 $k$-mer 的准确找回概率为：

$$P = \frac{K_{\text{shared}}}{K_{\text{total}}}$$

假设单碱基错误率为 $E$，且各碱基发生替换或插入缺失的概率相互独立，则一个长度为 $k$ 的 $k$-mer 内部完全不含任何错误的概率为 $(1 - E)^k$。由此建立统计等式：

$$P = (1 - E)^k \implies 1 - E = P^{1/k} \implies E = 1 - \left(\frac{K_{\text{shared}}}{K_{\text{total}}}\right)^{1/k}$$

根据生物信息学标准 Phred 对数标度，组装全基因组的特征碱基质量值（Consensus Quality Value, QV）定义为：

$$QV = -10 \log_{10}(E) = -10 \log_{10}\left(1 - \left(\frac{K_{\text{shared}}}{K_{\text{total}}}\right)^{1/k}\right)$$

- **Q40 标准**：对应 $E = 10^{-4}$，即平均每 10,000 个碱基中仅有 1 个错误（$99.99\%$ 精度），为现代高质量植物参考基因组的标准底线；
- **Q50 标准**：对应 $E = 10^{-5}$，即平均每 100,000 个碱基仅有 1 个错误（$99.999\%$ 精度），为完整端粒到端粒（T2T）基因组的追求目标。

### 2. Spectra-cn 拷贝数谱图深度判读法则

Merqury 输出的核心图谱之一是 `spectra-cn`（拷贝数频谱图）。横坐标为 $k$-mer 在原始测序读段中的深度（Multiplicity），纵坐标为具有该深度的独特 $k$-mer 数量（Count），曲线按其在组装序列中的拷贝数进行着色：

1. **测序误差低频峰（$< 5\times$）**：主要集中在深度极低区域，由随机测序错误产生，在高质量组装中其在组装体内的拷贝数应为 0（即在组装序列中被完全过滤）；
2. **单倍型杂合峰（1-copy Peak）**：位于纯合峰深度的二分之一处（如 $18\times$）。在完美单倍型分相组装中，该峰应精确呈现为组装中的 1 拷贝；若大量杂合 $k$-mer 塌缩为 0 拷贝，表明杂合序列在组装去冗余过程中被过度丢弃；
3. **二倍体纯合主峰（2-copy Peak）**：位于全测序深度处（如 $36\times$）。在单倍体共识组装中应表现为 1 拷贝，在二倍体双单倍型组装中表现为 2 拷贝；若出现异常的 4 拷贝或更高倍数峰，提示存在重复序列的错误人工扩增。

---

## 基因空间完整性：BUSCO 评估与多倍体解读

BUSCO（Benchmarking Universal Single-Copy Orthologs）通过在特定系统发育分支（如植物界的 `embryophyta_odb10`，含 1,614 个保守单拷贝基因）中搜索保守核心直系同源基因，评估组装对功能基因空间的恢复完整度：

$$\text{BUSCO 评级} = [C: \text{Complete} \ (S: \text{Single}, D: \text{Duplicated}), F: \text{Fragmented}, M: \text{Missing}]$$

### 多倍体植物的核心解读准则

在二倍体水稻或拟南芥中，通常期望：
$$C > 98.0\% \quad (S > 95.0\%, \ D < 3.0\%), \ F < 1.0\%, \ M < 1.0\%$$

然而在**异源多倍体植物**（如四倍体油菜 *Brassica napus* AACC，六倍体普通小麦 *Triticum aestivum* AABBDD）中：
- 极高的重复比例（$D > 60\% \sim 90\%$）完全是正常的生物学现象，它忠实反映了各亚基因组间同源基因（Homeologs）的同时完整存在；
- 反之，若异源六倍体小麦的 BUSCO 结果中 $D$ 值反常偏低（如 $D < 20\%$），往往直接证明三个亚基因组发生了严重的**同源序列人工折叠与塌陷**，该组装在科学上是不合格的。

---

## 参考文献与数据规范

1. **Rhie A, Walenz BP, Koren S, Phillippy AM.** (2020). Merqury: reference-free quality, completeness, and phasing assessment for genome assemblies. *Genome Biology*, 21(1), 245. DOI: [10.1186/s13059-020-02134-9](https://doi.org/10.1186/s13059-020-02134-9)
2. **Manni M, Berkeley MR, Seppey M, Simão FA, Zdobnov EM.** (2021). BUSCO Update: Novel and Streamlined Workflows along with Broader and Deeper Phylogenetic Coverage for Scoring of Eukaryotic, Prokaryotic, and Viral Genomes. *Molecular Biology and Evolution*, 38(10), 4647–4654. DOI: [10.1093/molbev/msab199](https://doi.org/10.1093/molbev/msab199)
3. **Earth BioGenome Project Consortium.** (2022). The Earth BioGenome Project 2020: Starting the clock. *PNAS*, 119(4), e2115635118. DOI: [10.1073/pnas.2115635118](https://doi.org/10.1073/pnas.2115635118)
