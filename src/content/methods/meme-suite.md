---
title: MEME Suite
name: MEME Suite
summary: 包含从头基序发现 (MEME/STREME)、已知转录因子扫描 (FIMO)、基序富集 (AME) 与数据库比对 (Tomtom) 的高精度生物序列基序综合分析套件。
dataType: 表观组富集峰区/启动子 FASTA 序列与转录因子基序位置权重矩阵 (PWM/MEME 格式)
principle: 位置概率矩阵 (PPM)、对数几率位置权重矩阵 (PWM)、期望最大化 (EM) 从头发现与动态规划 FIMO 显著性检验
domainIds: [epigenomics-3d-genome, regulatory-genomics-ai]
topicIds: [m07-topic-05, m09-topic-04]
principleIds: [motif-analysis]
dataIds: [dna-sequence]
paper: meme-suite-paper
repository: https://github.com/meme-suite/meme
version: "5.5.5"
status: published
updatedAt: 2026-11-25
---

## 软件定位与核心科学问题

在植物表观遗传学与顺式调控基因组学研究中，确定转录因子（Transcription Factors, TFs）在基因组 DNA 上的特异性识别结合位点（Transcription Factor Binding Sites, TFBS），是破译基因时空特异表达与转录重编程机制的核心钥匙。

通过 ChIP-seq、CUT&Tag、DAP-seq 以及 ATAC-seq 等实验技术，研究人员能够获得数千至数万个开放染色质或蛋白结合富集峰（Peaks）。然而，这些峰区序列通常长达数百甚至上千个碱基，而真实的转录因子结合核心基序（Motif）通常仅有 6~15 个碱基长度，且常常具有一定的碱基退化容忍性（Degenerate consensus）。

**MEME Suite（Multiple Em for Motif Elicitation）** 是计算生物学领域最具权威性且功能最完备的序列基序分析工具体系。它不仅能从无先验标签的共表达或富集峰序列中从头归纳发现新基序（*de novo* discovery），还能基于严格的概率统计模型在全基因组尺度高灵敏度扫描已知植物转录因子结合位点，并评估基序的中心富集度与相似性分类。

---

## 核心算法原理与数学推导

```
   [ATAC-seq/ChIP-seq 峰中心截取 FASTA] ──► [fasta-get-markov 训练植物物种背景模型]
                      │                                      │
                      ├──────────────────────────────────────┤
                      ▼                                      ▼
       从头基序发现 (de novo)                 已知基序全基因组扫描
       ├─ MEME (期望最大化 EM 算法)           ├─ 输入: JASPAR/PlantTFDB 植物基序库
       ├─ STREME (广义广度优先广义后缀树)      ├─ FIMO (动态规划精确计算匹配分数)
       └─ 计算信息内容 (Information Content)  └─ 经验零分布校正与 FDR q-value 估算
                      │                                      │
                      ▼                                      ▼
       新基序比对分类 (Tomtom 比对已知库)     下游网络剪枝 (pySCENIC 顺式基序修剪)
```

### 1. 位置概率矩阵 (PPM) 与位置权重矩阵 (PWM)

设基序宽度为 $W$，核苷酸字母表为 $\Sigma = \{A, C, G, T\}$：
1. **位置概率矩阵（Position Probability Matrix, PPM）**：
   在收集到的 $N$ 个已对齐的真实结合位点序列中，统计第 $j$ 个位置（$j = 1, \dots, W$）出现碱基 $b \in \Sigma$ 的计数 $n_{b, j}$。为了避免因小样本未抽样引起的零概率陷阱，加入 Dirichlet 伪计数（Laplace's Rule of Succession）：
   $$P_{b, j} = \frac{n_{b, j} + d_b}{N + \sum_{b' \in \Sigma} d_{b'}}$$
   其中 $d_b$ 通常与基因组背景中碱基 $b$ 的先验频率成正比；
2. **位置权重矩阵（Position Weight Matrix, PWM / PSSM）**：
   将观测频率相对于基因组非编码背景频率 $p_b$（如马尔可夫零阶背景）转化为对数几率比（Log-odds ratio）：
   $$M_{b, j} = \log_2 \left( \frac{P_{b, j}}{p_b} \right)$$
   若在第 $j$ 位出现碱基 $b$ 的概率高于背景期望，$M_{b, j} > 0$（正向加分）；若低于背景期望，$M_{b, j} < 0$（惩罚扣分）；
3. **信息内容（Information Content, IC / 位点保守度）**：
   衡量基序中每个位置碱基保守程度的香农信息熵衰减（单位：比特 bits）：
   $$R_j = \log_2(4) - \left( -\sum_{b \in \{A, C, G, T\}} P_{b, j} \log_2 P_{b, j} \right) = 2 - H_j$$
   - $R_j = 2\text{ bits}$：该位置绝对保守为单一固定碱基（$H_j = 0$）；
   - $R_j = 0\text{ bits}$：四种碱基完全等频随机出现（$P=0.25$，$H_j = 2$），无序列特异性；
   - 常见的 Sequence Logo 中，字母的高度正是按 $P_{b, j} \times R_j$ 绘制。

### 2. MEME 期望最大化从头基序发现算法 (Expectation-Maximization)

对于未对齐的 $N$ 条输入序列 $\mathbf{X} = \{X_1, \dots, X_N\}$，MEME 假设每个序列可能包含 0 次、1 次或多次未知基序（ZOOPS 或 ANR 模型）：
- **隐藏变量**：引入二元指示变量 $Z_{ij} = 1$ 表示序列 $i$ 的起始位置 $j$ 为基序起点；
- **E 步（Expectation）**：利用当前参数 $\theta^{(t)}$（当前的 PPM 矩阵和背景模型），计算隐藏变量的后验期望概率：
  $$z_{ij}^{(t)} = P(Z_{ij} = 1 \mid X_i, \theta^{(t)}) = \frac{P(X_i \mid Z_{ij} = 1, \theta^{(t)}) P(Z_{ij} = 1)}{\sum_k P(X_i \mid Z_{ik} = 1, \theta^{(t)}) P(Z_{ik} = 1)}$$
- **M 步（Maximization）**：利用上一步计算出的连续期望权重 $z_{ij}^{(t)}$ 作为加权计数，最大化完全数据的对数似然函数，更新 PPM 矩阵参数 $\theta^{(t+1)}$：
  $$n_{b, k}^{(t+1)} = \sum_{i=1}^N \sum_{j} z_{ij}^{(t)} \mathbb{I}(X_{i, j+k-1} = b)$$
- 循环交替迭代直到参数收敛，并通过启发式搜索在全序列中剥离已发现基序，寻找下一个不同的富集基序。

### 3. FIMO 序列扫描与动态规划精确 $p$ 值检验

FIMO（Find Individual Motif Occurrences）用于在给定的长序列（如全基因组启动子）中扫描已知基序：
1. **匹配原始得分**：对于任意长度为 $W$ 的子序列 $s = (s_1, \dots, s_W)$，其匹配得分为各位置 PWM 权重的代数累加：
   $$S(s) = \sum_{j=1}^W M_{s_j, j}$$
2. **精确 $p$ 值换算（Dynamic Programming）**：
   FIMO 不依赖耗时的蒙特卡洛随机抽样，而是利用动态规划（分治卷积）精确构建零假设背景马尔可夫模型下所有可能整数得分的概率质量函数 $P(S = k)$。由此直接导出匹配得分大于等于观测值 $S(s)$ 的精确双尾 $p$ 值：
   $$p\text{-value} = P(S \ge S(s) \mid \text{Background Model})$$
3. **多重假设检验校正**：在全基因组数百万个滑动窗口中，FIMO 基于 Benjamini-Hochberg 过程计算每个命中位点的局部假发现率（FDR / $q$-value），默认以 $q < 10^{-4}$ 保留高度置信的物理结合位点。

---

## 植物基因组基序分析特殊考量与避坑指南

| 植物组学特殊性 | 潜在统计与分析陷阱 | MEME Suite 规范应对策略 |
| :--- | :--- | :--- |
| **严重的非编码区 AT 偏倚** | 双子叶植物（拟南芥、棉花、大豆）启动子和基因间区 AT 含量常高达 65%~70%。若使用默认的 25% 等频背景，所有富含 AT 的简单重复序列（如 TATA-box 类似物）都会被误判为超极显著的新基序。 | **严禁使用默认等频背景**：必须首先使用 `fasta-get-markov -m 1` 或 `-m 2`，从物种全基因组非编码区提取一阶或二阶真实马尔可夫背景文件（`.bg`），并在 MEME/FIMO 运行时通过 `-bfile` 参数载入。 |
| **单子叶植物 GC 梯度分化** | 水稻、玉米等禾本科植物编码区存在极强的从 5' 端向 3' 端的 GC 含量递增梯度。 | 在扫描禾本科启动子时，背景模型应选用同等位置的启动子序列进行训练，避免全基因组均一化背景掩盖 GC-rich 基序（如 AP2/ERF 家族结合的 GCC-box）。 |
| **宽泛峰区稀释基序信噪比** | 直接将 1,000~2,000 bp 的完整 MACS3 峰输入 MEME，大量侧翼背景中性序列会导致 EM 算法陷入局部极小值。 | **峰中心截取（Summit-centered clipping）**：使用 `bedtools slop` 以每个峰的最高点（Summit）为中心，严格截取 $\pm 100 \sim 150\text{ bp}$（总长 200~300 bp）进行基序挖掘。 |
| **植物转录因子家族特异性核心模体** | 植物特有大家族（WRKY、NAC、MYB、bZIP）结合核心极为严密。 | 扫描完成后调用 `tomtom`，将识别出的基序与植物专用转录因子结合数据库（如 **JASPAR Plant**、**PlantTFDB**、**CIS-BP**）比对，确认核心位点（如 WRKY 的 `TTGACY`、bZIP 的 `CACGTG`）。 |

---

## 典型分析命令与标准操作流

以下为针对植物 ATAC-seq / ChIP-seq 峰区的端到端基序分析命令行规范：

```bash
# 1. 以 MACS3 鉴定的峰顶 (Summit) 为中心，向两侧各扩展 100 bp (总长 200 bp)
bedtools slop \
    -i plant_peaks_summits.bed \
    -g plant_genome.chrom.sizes \
    -b 100 > plant_peaks_center200bp.bed

# 2. 从参考基因组 FASTA 中提取对应序列
bedtools getfasta \
    -fi plant_reference_genome.fa \
    -bed plant_peaks_center200bp.bed \
    -fo plant_peaks_center200bp.fa

# 3. 极其关键: 训练植物物种专属的一阶马尔可夫背景模型 (捕捉植物高 AT 偏倚)
fasta-get-markov -m 1 plant_peaks_center200bp.fa plant_peaks_order1.bg

# 4. 运行 MEME 执行从头基序发现 (de novo discovery)
# -dna: 核苷酸序列; -revcomp: 考虑正反互补链; -mod zoops: 每条序列最多出现 1 次
# -nmotifs: 发现前 5 个最显著基序; -minw/-maxw: 基序宽度在 6 到 15 bp 之间
meme plant_peaks_center200bp.fa \
    -dna \
    -revcomp \
    -mod zoops \
    -bfile plant_peaks_order1.bg \
    -nmotifs 5 \
    -minw 6 \
    -maxw 15 \
    -oc ./meme_output/

# 5. 使用 Tomtom 将新发现的基序与已知植物转录因子数据库比对分类
# 数据库采用 JASPAR 2024 Core Plants 数据库
tomtom \
    -oc ./tomtom_output/ \
    -bfile plant_peaks_order1.bg \
    -thresh 0.05 \
    ./meme_output/meme.xml \
    /databases/JASPAR2024_CORE_plants_non-redundant.meme

# 6. 使用 FIMO 在全基因组启动子序列中高精度扫描已知目标转录因子结合位点
# 筛选 q-value < 1e-4 的高置信度结合位点
fimo \
    --oc ./fimo_output/ \
    --bfile plant_peaks_order1.bg \
    --thresh 1e-4 \
    --motif WRKY33_MA1234.1 \
    /databases/JASPAR2024_CORE_plants_non-redundant.meme \
    plant_all_promoters_2kb.fa
```

---

## 科学研究案例与上下游分析协同

- **拟南芥 bZIP11 顺式调控机理案例**：在拟南芥光合产物与代谢协同调控研究中，研究团队利用 ATAC-seq 鉴定了受蔗糖抑制的关键染色质开放区域，通过 MEME Suite 配合一阶物种背景模型开展从头基序挖掘，成功捕获了高保守的 G-box 核心结合基序（`CACGTG`），并经 Tomtom 明确比对定位至 bZIP 家族转录因子，揭示了植物通过表观重构响应能量供应的级联分子机制；
- **分析工具流转与协同界定**：
  - **上游工具对接**：MACS3 产出的窄峰与 Summit 点阵坐标为 MEME 序列提取提供了最高物理分辨率的候选区间；
  - **下游调控网络精修**：FIMO 扫描获得的物理结合位点，是 pySCENIC（对接 GRNBoost2 产出的边列表）与 iGRN 构建中剔除“非直接表达相关边”的不可替代的金标准。
