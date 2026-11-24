---
title: 单倍型解析与单倍型感知组装
summary: 深度剖析最小错误校正（MEC）模型、Trio-binning 亲本特异 k-mer 划分、Hi-C 物理分相算法、Switch Error 评估与四倍体马铃薯等真实植物案例。
domain: genome-assembly
methods: [hifiasm, verkko]
updatedAt: 2026-11-25
---

## 单倍型分相的生物学本质与科学价值

在有性生殖的真核生物中，二倍体细胞包含分别继承自父本与母本的两套同源染色体。然而，传统的基因组组装方法往往采用“伪单倍体折叠共识（Collapsed Pseudo-haplotype）”策略，将来自两条同源染色体的等位差异强行压缩、混合为一个单一的人工拼合序列。这种折叠组装在植物科学中会带来严重的生物学误判：
1. **等位特异性表达（Allele-Specific Expression, ASE）被彻底抹平**，无法解析杂种优势（Heterosis）的分子遗传机制；
2. **结构变异与等位基因渗入（Introgression）被误判为缺失或旁系重复**；
3. **农艺优良等位基因与其野生型同源异型的精细因果关联无法厘清**。

单倍型感知组装（Haplotype-resolved Assembly）的目标，是在全染色体尺度上完整重构出互不混杂的两套（二倍体）或多套（多倍体）同源染色体序列。

---

## 单倍型相位推断的数学模型：MEC 与似然最大化

从计算理论角度，将海量离散且含有错误的测序片段分配至不同同源染色体单倍型，被形式化为经典的**最小错误校正问题（Minimum Error Correction, MEC）**。

### 1. 片段矩阵与二倍体单倍型形式化

设在目标基因组区间内检测出 $N$ 个杂合单核苷酸多态性（SNP）位点，测序获得 $M$ 条跨越一个或多个杂合位点的读段。定义片段联配矩阵为：

$$F \in \{0, 1, -\}^{M \times N}$$

其中 $0$ 表示对应参考等位基因，$1$ 表示交替等位基因，$-$ 表示读段在该位点未覆盖（缺失）。

二倍体单倍型对定义为矩阵 $H = (H_1, H_2) \in \{0, 1\}^{2 \times N}$。在同源无嵌合假设下，$H_2 = 1 - H_1$。

### 2. 极大似然概率目标函数

设测序读段的平均单碱基测序错误率为 $\epsilon$。读段 $f_i$ 来源于单倍型 $H_k \in \{H_1, H_2\}$ 的条件似然函数为：

$$P(f_i \mid H_k) = \prod_{j: f_{ij} \ne -} \left[ (1 - \epsilon)^{\mathbb{I}(f_{ij} = H_{kj})} \cdot \left(\frac{\epsilon}{3}\right)^{\mathbb{I}(f_{ij} \ne H_{kj})} \right]$$

其中 $\mathbb{I}(\cdot)$ 为指示函数。全样本联合对数似然最大化目标为：

$$\max_{H_1, H_2} \sum_{i=1}^M \ln \left( \pi_1 P(f_i \mid H_1) + \pi_2 P(f_i \mid H_2) \right)$$

在常数错误率假设下，极大似然等价于极小化读段与目标单倍型之间的 Hamming 距离总和（即 MEC 分数）。在通用图拓扑下，MEC 问题已被严格证明为 **NP-hard**。现代组装器（如 Hifiasm）通过在局部 String Graph 中识别连续重叠的杂合气泡链（Bubble chains），采用动态规划与马尔可夫链贪心启发式，实现了在多项式时间内的稳健近似求解。

---

## 三大主流单倍型分相技术路线对比

| 分相技术路线 | 核心输入数据 | 算法分离机制 | 染色体尺度长程相位能力 | 适用植物材料 |
| :--- | :--- | :--- | :--- | :--- |
| **HiFi 自主重叠分相 (In-read Phasing)** | 仅需高深度 PacBio HiFi (≥30x) | 依据读段直接跨越相邻杂合位点直接分离气泡路径 | 受限于纯合区跨度，常形成局部 Phase Blocks (断裂于长纯合区) | 高杂合野生种、无亲本异交二倍体草本/木本 |
| **Trio-binning 亲本特异 $k$-mer 划分** | $F_1$ 代 HiFi + 双亲短读段 (各 ≥30x) | 利用双亲纯合差异 $k$-mer 预先对子代读段执行物理二项式分群 | **全染色体绝对分相** (天然锁定父本/母本单倍型) | 杂交育种材料、具有可测序稳定亲本的杂交种 |
| **Hi-C 辅助物理分相 (Hi-C Phasing)** | HiFi 读段 + 样本自交交联 HiC 数据 | 利用 Hi-C 顺式互作主要发生在同一物理染色单体的空间特性 | **全染色体级连续连接** (成功桥接长纯合间隙) | 无亲本材料、自交不亲和野生植物、多倍体 |

### Trio-binning 亲本特异 $k$-mer 统计判据

设父本 $P$、母本 $M$ 与杂种一代 $F_1$ 的独立测序读段集合中提取出的 $k$-mer 集合分别为 $K_P$、$K_M$ 与 $K_{F_1}$。

定义父本特异性 $k$-mer 标记集与母本特异性标记集：

$$S_P = (K_P \cap K_{F_1}) \setminus K_M$$

$$S_M = (K_M \cap K_{F_1}) \setminus K_P$$

对于子代中的任意一条长读段 $R$，统计其精确匹配到父本与母本标记集的出现次数 $c_P(R)$ 与 $c_M(R)$。算法采用双侧统计截断进行标签划分（满足阈值差 $\delta$ 与最小计数 $c_{\min}$）：

$$
\text{Label}(R) = \begin{cases}
\text{Paternal}, & c_P(R) \ge c_M(R) + \delta \\
\text{Maternal}, & c_M(R) \ge c_P(R) + \delta \\
\text{Ambiguous}, & |c_P(R) - c_M(R)| < \delta
\end{cases}
$$

将分类后的读段独立送入组装引擎，天然生成两条纯合的父本与母本单倍型基因组。

---

## 相位准确率指标的数学量化：Switch Error 与 Hamming Error

为了客观评估分相组装的质量，通常利用已知亲本标记或高密度遗传单倍型作为真值（Truth）进行基准比对：

### 1. 相位跳跃错误率（Switch Error Rate, SER）

SER 衡量相邻两个杂合位点之间相位连贯性发生非预期倒转的频率。设预测单倍型向量为 $\hat{H} \in \{0, 1\}^N$，真实基准向量为 $H \in \{0, 1\}^N$：

$$\text{SER} = \frac{1}{N - 1} \sum_{j=1}^{N - 1} \mathbb{I}\left( (\hat{H}_{j+1} \oplus \hat{H}_j) \ne (H_{j+1} \oplus H_j) \right)$$

其中 $\oplus$ 为异或（XOR）运算。SER 越低，表明局部相位块内部的逻辑连贯性越纯净。

### 2. 全局汉明错误率（Hamming Error Rate, HER）

HER 衡量全染色体尺度上单倍型分配的全局宏观翻转率：

$$\text{HER} = \frac{1}{N} \min\left( \sum_{j=1}^N \mathbb{I}(\hat{H}_j \ne H_j), \ \sum_{j=1}^N \mathbb{I}(\hat{H}_j = H_j) \right)$$

---

## 植物多倍体科研案例：四倍体马铃薯的单倍型突破

在同源四倍体植物（如栽培马铃薯 *Solanum tuberosum*, $2n = 4x = 48$）中，每个基因组位点同时存在四套高度相似但互有变异的等位染色体。传统的二倍体分相工具若强行介入，只能输出两条高度嵌合的伪单倍体。

Sun 等人于 2022 年发表在 *Nature Genetics* 上的开创性工作，结合超深 PacBio HiFi 测序、超长 ONT 读段以及高通量单细胞花粉测序（Single-pollen sequencing）技术，成功克服了自交衰退与同源多倍体联会重组的复杂障碍，首次完整解析了同源四倍体马铃薯全部 48 条染色体的单倍型基因组图谱。该研究揭示了马铃薯基因组中广泛存在的有害突变隐藏机制，为基于二倍体自交系的马铃薯杂交种子育种（“优薯计划”）提供了关键的基因组学奠基支撑。

---

## 参考文献与数据来源

1. **Cheng H, Concepcion GT, Meng X, et al.** (2021). Haplotype-resolved de novo assembly using phased assembly graphs with Hifiasm. *Nature Methods*, 18(2), 170–175. DOI: [10.1038/s41592-020-01056-5](https://doi.org/10.1038/s41592-020-01056-5)
2. **Koren S, Rhie A, Walenz BP, et al.** (2018). De novo diploid genome assembly using trio binning. *Nature Biotechnology*, 36(12), 1174–1182. DOI: [10.1038/nbt.4277](https://doi.org/10.1038/nbt.4277)
3. **Sun H, Jiao WB, Krause K, et al.** (2022). Chromosome-scale and haplotype-resolved genome assembly of a tetraploid potato cultivar. *Nature Genetics*, 54(3), 342–348. DOI: [10.1038/s41588-022-01015-0](https://doi.org/10.1038/s41588-022-01015-0)
4. **Garg S.** (2021). Computational methods for chromosome-scale haplotype reconstruction. *Genome Biology*, 22(1), 101. DOI: [10.1186/s13059-021-02328-9](https://doi.org/10.1186/s13059-021-02328-9)
