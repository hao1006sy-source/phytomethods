---
title: 蛋白编码基因结构预测与证据整合
summary: 深度解析广义隐马尔可夫模型（GHMM）数学原理、Viterbi 解码算法、BRAKER3 多源证据自训练管线与剪接信号判读机制。
domain: genome-annotation
methods: [braker3]
updatedAt: 2026-11-25
---

## 科学定位与生物学计算难点

真核生物蛋白质编码基因（Protein-Coding Genes）在基因组中呈现断裂分布特征：编码多肽链的外显子（Exons）被不翻译的内含子（Introns）在空间上多次截断。结构基因预测（Structural Gene Prediction）的任务，就是在数十亿碱基对的 DNA 序列中，精确识别转录起始位点（TSS）、5' UTR、起始密码子（ATG）、各外显子-内含子剪接边界（Splice sites）、终止密码子（TAA, TAG, TGA）以及 3' UTR，重构出可翻译为功能多肽的完整转录本。

在植物基因组中，这一计算任务尤为棘手：
1. **极端的内含子长度方差**：拟南芥平均内含子仅 160 bp 左右，而在玉米或大豆中，转座子插入可使单个内含子延伸至数十 kb 以上；
2. **微小外显子（Micro-exons）**：部分植物基因包含小于 15~30 bp 的极短外显子，统计信号极弱；
3. **选择性剪接（Alternative Splicing, AS）极其普遍**：超过 60% 的植物多外显子基因存在选择性剪接事件，产生多个异构体；
4. **单靠 ORF 会产生海量假阳性**：任何一段随机产生的 100 kb 基因组序列中均可能偶然出现数百个开放阅读框，必须借助严格的概率图模型与外部转录组/蛋白证据进行加权判决。

---

## 广义隐马尔可夫模型（GHMM）数学原理与 Viterbi 解码

现代从头预测引擎（以 AUGUSTUS 与 GeneMark 为代表）的核心数学架构是**广义隐马尔可夫模型（Generalized Hidden Markov Model, GHMM）**。

### 1. 传统 HMM 的局限与 GHMM 的片段化扩展

在标准 HMM 中，每个隐藏状态只能发射单个碱基，导致状态持续长度 $d$ 在数学上必然退化为**几何分布（Geometric Distribution）** $P(d) = (1 - p) p^{d-1}$，这与真核生物外显子（大多呈单峰或对数正态分布）及内含子的真实生物学长度分布严重不符。

GHMM（又称半马尔可夫模型，Semi-Markov Model）允许每个隐藏状态 $q_k$ 对应一个可变长度的序列片段（例如一个完整的外显子）：

设观测 DNA 序列为 $X = x_1 x_2 \dots x_L$。状态序列定义为 $Q = (q_1, d_1), (q_2, d_2), \dots, (q_M, d_M)$，其中：
- $q_k$ 为第 $k$ 个功能状态（如前导外显子 `Single-exon`、起始外显子 `Initial-exon`、内部外显子 `Internal-exon`、末端外显子 `Terminal-exon`、内含子 `Intron` 或基因间区 `Intergenic`）；
- $d_k$ 为该状态在序列上持续跨越的物理碱基长度，且 $\sum_{k=1}^M d_k = L$。

### 2. 联合概率密度与 Viterbi 最优路径求解

给定模型参数 $\theta$，序列 $X$ 与状态路径 $Q$ 的联合概率密度函数为：

$$P(X, Q \mid \theta) = \prod_{k=1}^M \left[ P(q_k \mid q_{k-1}) \cdot P(d_k \mid q_k) \cdot P(X_k \mid q_k, d_k) \right]$$

其中：
- $P(q_k \mid q_{k-1})$ 为状态转移概率矩阵（如内含子状态转移至末端外显子的先验几率）；
- $P(d_k \mid q_k)$ 为特定生物学状态的**片段长度经验分布函数**；
- $P(X_k \mid q_k, d_k)$ 为该状态在该长度下发射特定核苷酸序列的似然值（由高阶马尔可夫链 $k$-mer 偏好性与密码子偏好性确定）。

在引入外部生物学证据（Hints）时，设由 RNA-seq 剪接接头或同源蛋白比对产生的证据集合为 $H$。外在证据作为先验奖励乘子修正局部的状态转移：

$$P^*(X, Q \mid \theta, H) = P(X, Q \mid \theta) \cdot \prod_{h \in H} \text{Bonus}(h, Q)$$

通过**动态规划 Viterbi 解码算法**，在多项式时间内搜索全局似然乘积最大的最优状态路径：

$$Q^* = \arg\max_Q P^*(X, Q \mid \theta, H)$$

---

## 剪接位点保守信号识别与 MaxEntScan 模型

植物绝大多数内含子遵循严格的 **Chambon 规则**（Canonical Splice Sites）：
- **5' 剪接供体位点（Donor Site）**：外显子与内含子交界处，内含子前两个碱基绝大多数为 `GT`（少数为 `GC`）；
- **3' 剪接受体位点（Acceptor Site）**：内含子与外显子交界处，内含子末尾两个碱基绝大多数为 `AG`；
- **分枝位点（Branch Point Sequence, BPS）**：位于受体位点上游 20~50 bp 处的保守腺嘌呤 `A`。

现代算法（如 MaxEntScan）基于**最大熵原理（Maximum Entropy Modeling）**，不仅考虑单个碱基的位置频率矩阵（PWM），更捕获相邻或相隔位置间的非独立高阶马尔可夫偶联相互作用，使假剪接位点的排除准确率提升至 95% 以上。

---

## BRAKER3 现代自动化集成流程与实战命令

由 Gabriel 等人于 2024 年在 *Genome Research* 上发表的 **BRAKER3**，彻底终结了过去需要繁琐手动构建训练集、独立调用多套软件的碎片化历史。

### BRAKER3 端到端运行命令

```bash
# --genome: 软屏蔽后的参考基因组 FASTA (强烈推荐 EDTA 软屏蔽)
# --prot_seq: 跨物种同源蛋白库 (推荐从 OrthoDB 下载 Viridiplantae 分支多肽集)
# --bam: 多组织 RNA-seq 比对生成的 BAM 文件 (HISAT2 剪接感知比对并按坐标排序)
# --threads: CPU 线程数
braker.pl \
  --genome=genome.softmasked.fa \
  --prot_seq=orthodb_viridiplantae.fa \
  --bam=rnaseq_splice_aware.bam \
  --busco_lineage=embryophyta_odb10 \
  --threads=32
```

### 核心阶段自动化拆解

1. **ProtHint 蛋白外显子线索提取**：利用 DIAMOND 将超大同源蛋白库映射至基因组，并提取出高精度的内含子与外显子边界锚点（Hints）；
2. **GeneMark-ETP 统计自训练**：完全无需人工介入，自动利用 RNA-seq 剪接接头与 ProtHint 共同支持的单拷贝完整外显子集合，训练物种特异性的高阶马尔可夫参数；
3. **AUGUSTUS 迭代概率预测**：将训练好的 HMM 概率矩阵与外部线索送入 AUGUSTUS 进行全基因组 Viterbi 解码；
4. **TSEBRA 模型最优择优**：对 GeneMark 与 AUGUSTUS 输出的重叠转录本模型，按剪接位点支持率、外显子覆盖度及单转录本内支持强度执行非支配排序，输出最终结构注释表 `braker.gtf` 与 `braker.aa`。

---

## 参考文献与数据来源

1. **Gabriel L, Hoff KJ, Brůna T, et al.** (2024). BRAKER3: Fully automated genome annotation using RNA-seq and protein evidence with GeneMark-ETP, AUGUSTUS, and TSEBRA. *Genome Research*, 34(5), 768–781. DOI: [10.1101/gr.278090.123](https://doi.org/10.1101/gr.278090.123)
2. **Stanke M, Diekhans M, Baertsch R, Haussler D.** (2008). Using native and syntenically mapped cDNA alignments to improve de novo gene finding. *Bioinformatics*, 24(5), 637–644. DOI: [10.1093/bioinformatics/btn013](https://doi.org/10.1093/bioinformatics/btn013)
3. **Yeo G, Burge CB.** (2004). Maximum entropy modeling of short sequence motifs with applications to RNA splicing signals. *Journal of Computational Biology*, 11(2-3), 377–394. DOI: [10.1089/1066527041410418](https://doi.org/10.1089/1066527041410418)
