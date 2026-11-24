---
title: SNP 检测、过滤与 VCF：从比对证据到高质量群体基因型矩阵
summary: 系统推导基因型似然贝叶斯模型、GATK/BCFtools 变异质控统计量（QD/FS/SOR/AB）、多倍体等位基因剂量与植物高重复基因组硬过滤标准。
domain: population-genetics
methods: [bcftools, plink]
status: published
updatedAt: 2026-11-25
---

## 核心科学问题：从测序噪声中提取真实遗传变异

全基因组重测序（WGS）是植物群体遗传学与育种研究的核心数据源。然而，从短读长（Illumina PE150）原始比对 BAM 文件到最终可用于群体结构与 GWAS 分析的基因型矩阵，中间跨越了变异识别（Variant Calling）与质量控制（Quality Control, QC）两大关口。

在植物基因组中，由于转座子序列高达 $70\% \sim 85\%$（如玉米、大麦、小麦）以及古多倍化旁系同源基因高度相似，错误比对（Misalignment）极其普遍。大量来自不同重复拷贝的读长错配至同一参考位点，会产生虚假的高深度“杂合”假突变。

因此，建立严谨的概率基因型似然模型（Genotype Likelihoods），并在多维质量指标空间中实施客观的统计过滤，是确保整个群体演化结论真实可靠的生命线。

---

## 算法数学推导：基因型似然与变异质控指标

### 1. 基因型似然（Genotype Likelihood, GL）与贝叶斯分型

设某单样本在特定基因组位点覆盖了 $k$ 条有效 Reads，观测到的碱基向量为 $\mathbf{R} = \{r_1, r_2, \dots, r_k\}$，各碱基测序错误率为 $e_i$（由 Phred 测序质量值换算：$e_i = 10^{-Q_i/10}$）。在二倍体候选基因型 $G \in \{A_1A_1, A_1A_2, A_2A_2\}$ 条件下，该样本数据的似然函数为各位点读长独立条件概率的乘积：

$$P(\mathbf{R} \mid G = A_1A_2) = \prod_{i=1}^k \left( \frac{1}{2} P(r_i \mid A_1) + \frac{1}{2} P(r_i \mid A_2) \right)$$

其中单个碱基在给定真实等位基因 $A$ 下的观测概率定义为：

$$P(r_i \mid A) = \begin{cases} 1 - e_i & \text{若 } r_i = A \\ \frac{e_i}{3} & \text{若 } r_i \ne A \end{cases}$$

结合群体先验等位基因频率 $\pi(G)$，通过贝叶斯定理计算各基因型的**后验概率**（Posterior Probability），并取最大后验对应的基因为硬基因型（Hard-call GT），同时将非最优基因型的对数几率差转化为**基因型质量值（Genotype Quality, GQ）**：

$$\text{GQ} = -10 \log_{10} \left( 1 - \max_G P(G \mid \mathbf{R}) \right)$$

---

## GATK 与 BCFtools 核心质控指标数学体系

在 VCF 文件的 `INFO` 字段中，一系列标准化统计量用于从不同物理维度剥离系统误差：

```
VCF 质量控制核心六维指标体系：
├── 1. 深度标准化质量 (QD, Qual By Depth): QD = QUAL / DP，消除深读长人为堆叠的高 QUAL 假象
├── 2. 链偏好性检验 (Strand Bias):
│   ├── Fisher 链偏好 (FS): 基于 2x2 列联表检验正反向比对 Reads 偏向性
│   └── 链让步比 (SOR): 平滑链偏倚，在超高深度或单链极端缺失时更为稳健
├── 3. 比对质量偏倚 (MQ & MQRankSum):
│   ├── 均方根比对质量 (MQ): 全部位点比对质量 RMS，评估是否落入低比对度重复区
│   └── 比对质量秩和检验 (MQRankSum): 比较支持 REF 与 ALT 的比对质量秩和差异
└── 4. 读长物理位置偏倚 (ReadPosRankSum): 检验变异是否系统性富集在 Reads 末端 (易受测序酶末端错误污染)
```

### 1. 深度标准化质量（Qual By Depth, QD）
原始比对质量总和 `QUAL` 会随覆盖深度线性上升，导致低质量重复区因深度极大而获得虚假的高分。$QD = \text{QUAL} / \text{DP}$ 实现了单位深度的置信度归一化，植物重测序标准推荐过滤阈值：$QD < 2.0$。

### 2. 等位基因平衡度（Allele Balance, AB）
对于真正的二倍体杂合变异（$0/1$），支持 ALT 碱基的读数比例理论上应当服从均值为 0.5 的二项分布：

$$AB = \frac{\text{AD}_{\text{ALT}}}{\text{DP}}$$

若实测 $AB < 0.2$ 或 $AB > 0.8$，表明该位点大概率源自旁系同源基因错配或严重的 PCR 扩增偏倚，必须强制标记为缺失或剔除。

---

## 植物高重复基因组硬过滤标准规范

结合植物高重复、转座子密布的基因组学特征，推荐采用以下生产级硬过滤准则：

```bash
# 1. 针对 SNP 位点的标准 GATK/BCFtools 统计量硬过滤
bcftools filter -Oz -o cohort.snps.filtered.vcf.gz \
  -e 'QD < 2.0 || FS > 60.0 || MQ < 40.0 || MQRankSum < -12.5 || ReadPosRankSum < -8.0 || SOR > 3.0' \
  cohort.snps.raw.vcf.gz

# 2. 针对植物转座子多拷贝区：过滤异常超高深度位点 (DP > 2.5 * 平均全基因组深度)
# 防止将未组装分相的古加倍拷贝误判为假杂合 SNP
bcftools filter -Oz -o cohort.snps.normdp.vcf.gz \
  -e 'INFO/DP > 2.5 * MEAN_DEPTH || INFO/DP < 0.3 * MEAN_DEPTH' \
  cohort.snps.filtered.vcf.gz

# 3. 提取严格双等位位点 (Biallelic) 并过滤缺失率与 MAF
bcftools view -m2 -M2 -v snps \
  -e 'F_MISSING > 0.1 || MAF < 0.05' \
  -Oz -o cohort.snps.final.vcf.gz \
  cohort.snps.normdp.vcf.gz
```

---

## 实践规范与质控要点

| 过滤阶段 | 核心参数与阈值 | 常见陷阱与科学纠正 |
| :--- | :--- | :--- |
| **基因型样本级过滤** | 将个体 $\text{DP} < 4$ 或 $\text{GQ} < 20$ 的单元格重置为缺失 (`./.`) | 直接使用硬调用 0/1，导致低深度（如 1 条 read）被轻率认定为纯合 |
| **超高深度截断** | 必须设定最大深度（如全基因组平均深度的 2 ~ 2.5 倍） | 忽略超高深度过滤，将大量转座子反转录多拷贝错配误当作高多态性热点 |
| **InDel 邻域屏蔽** | 剔除位于 InDel 左右 5 bp 范围内的 SNP 位点 | 插入缺失附近的局部比对错位会造成密集的人工伪假 SNP 簇 |
| **多倍体基因型** | 异源多倍体推荐使用 FreeBayes 或 updog 设置真实染色体倍性 | 强行按二倍体分型四倍体油菜或六倍体小麦，丢失亚基因组特异性多态 |

---

## 延伸阅读与前置依赖

- **前置依赖**：短读长回帖比对与 BAM 排序索引（详见 [M01 测序与组装](../../genome-assembly/assembly-basics/)）。
- **核心算法工具**：[BCFtools 官方指南与高效数据流处理](../../../methods/bcftools/)。
- **群体处理工具**：[PLINK 基因型矩阵质控与 LD 剪枝实操](../../../methods/plink/)。
- **后续承接专题**：群体结构降维与主成分分析（详见 [M05-Topic-03 PCA、群体结构与祖先成分](../../population-genetics/m05-topic-03/)）。
