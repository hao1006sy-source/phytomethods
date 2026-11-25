---
title: PLINK
name: PLINK
summary: 面向全基因组变异数据的位压缩存储、质控过滤、连锁不平衡剪枝、PCA 降维与群体遗传统计工具集。
dataType: VCF / BCF / PLINK 二进制文件集 (BED/BIM/FAM 与 PGEN/PVAR/PSAM)
principle: 2-bit 位运算压缩矩阵、样本协方差奇异值分解 (SVD)、连锁不平衡贪心剪枝与多态性统计
domainIds: [population-genetics]
topicIds: [m05-topic-01, m05-topic-02, m05-topic-03, m05-topic-04, m05-topic-07]
principleIds: [genotype-statistics]
dataIds: [variant-data]
paper: plink-paper
repository: https://github.com/chrchang/plink-ng
status: published
updatedAt: 2026-11-25
---

## 生物学问题与定位

在植物群体基因组学和全基因组关联分析（GWAS）中，高通量重测序产生的变异数据往往包含数百至数万个个体、数百万至数千万个 SNP 位点。若以原始文本格式（如未压缩 VCF）直接处理，将面临数百 GB 乃至数 TB 的内存占用与漫长的 I/O 读写瓶颈。

**PLINK** 是群体遗传学领域的基石级计算工具集。第一代 PLINK 论文于 2007 年由 Shaun Purcell 等人发表在 *American Journal of Human Genetics* 上；随后 Christopher Chang 等人重构出第二代核心 **PLINK 1.9**（*GigaScience*, 2015），通过位级压缩（Bit-level compression）与并行位掩码运算实现了数量级的性能飞跃；最新的 **PLINK 2.0** 引入了更紧凑的分块压缩格式（PGEN/PVAR/PSAM），原生支持多等位变异、定相信息与基因型连续剂量（Dosage），并引入高效的随机化奇异值分解算法（Randomized SVD / `approx`），使超大规模植物群体的质量控制、等位基因频率计算、连锁不平衡（LD）剪枝、近亲关系识别与主成分分析（PCA）可在短时间内完成。

---

## 核心算法数学原理与数据结构

PLINK 的高吞吐分析能力建立在紧凑的数据结构与线性代数算法之上：

### 1. 2-bit 基因型位运算压缩结构

PLINK 1.x 传统的 `.bed`（Binary PED）格式采用紧凑的 **2-bit/genotype** 编码模式。一个字节（8 bits）可顺序存储 4 个个体的双等位基因型：

- `00`：主要等位基因纯合（Homozygote Major / $0/0$）
- `01`：缺失基因型（Missing Genotype / $./.$）
- `10`：杂合基因型（Heterozygote / $0/1$）
- `11`：次要等位基因纯合（Homozygote Minor / $1/1$）

在计算等位基因计数、频率或成对相关性时，PLINK 利用 CPU 硬件级位操作指令（如 POPCNT 计数与掩码向量化指令），直接在位流上执行布尔逻辑与查表统计，彻底规避了浮点数转换与字符串解析开销。

### 2. 主成分分析（PCA）与奇异值分解（SVD）

设群体包含 $N$ 个个体和 $M$ 个双等位 SNP。令 $g_{ij} \in \{0, 1, 2\}$ 为个体 $i$ 在位点 $j$ 携带的次要等位基因剂量，$p_j$ 为位点 $j$ 的等位基因频率。PLINK 首先对基因型矩阵执行频率标准化变换：

$$z_{ij} = \frac{g_{ij} - 2p_j}{\sqrt{2p_j(1 - p_j)}}$$

由标准化矩阵 $Z \in \mathbb{R}^{N \times M}$ 构建样本间遗传关系协方差矩阵（Genetic Relationship Matrix, GRM）$K$：

$$K = \frac{1}{M} Z Z^{\mathsf{T}}$$

对矩阵 $K$ 进行特征值分解，或直接对 $Z$ 执行紧凑奇异值分解（SVD）：

$$Z = U \Sigma V^{\mathsf{T}}$$

其中，左奇异向量矩阵 $U \in \mathbb{R}^{N \times N}$ 的前 $k$ 列即对应样本在前 $k$ 个主成分轴上的投影坐标（`.eigenvec`），奇异值平方差 $\lambda_k = \Sigma_{kk}^2 / M$ 对应特征值（`.eigenval`），量化各主成分解释的遗传方差比例。PLINK 2.0 的 `--pca approx` 进一步引入随机化低秩分解算法（Halko et al., 2011），以极低的内存开销在超大矩阵上逼近前几个主成分。

### 3. 连锁不平衡（LD）统计与贪心剪枝

对于任意两个双等位位点 A（等位基因 $A, a$）和 B（等位基因 $B, b$），配子频率分别为 $p_A, p_B$，单倍型频率为 $p_{AB}$。二者的连锁不平衡系数定义为：

$$D = p_{AB} - p_A p_B, \qquad r^2 = \frac{D^2}{p_A (1 - p_A) p_B (1 - p_B)}$$

在未定相样本中，PLINK 通过个体基因型剂量向量的相关系数平方直接估计 $r^2$。`--indep-pairwise <window size> <step> <r^2 threshold>` 采用滑动窗口贪心剪枝策略：
1. 在指定物理大小或变异数窗口内计算所有 SNP 对的 $r^2$；
2. 一旦某对 SNP 的 $r^2$ 超过设定阈值（如 0.2），则移除次要等位基因频率较低或缺失率较高的位点；
3. 窗口向前滑动固定步长，重复剪枝，直至全基因组保留相互近似独立的变异标记集（`.prune.in`）。

### 4. 近交系数与同源同源同一（IBD）估计

PLINK 利用全基因组中性位点的杂合度偏离评估样本近交系数 $F$：

$$F = \frac{O(HOM) - E(HOM)}{N - E(HOM)}$$

其中 $O(HOM)$ 为观测到的纯合位点总数，$E(HOM) = \sum [1 - 2p_j(1-p_j)]$ 为哈代-温伯格平衡下的期望纯合数。对于成对样本，PLINK 基于位点等位基因共享状态的矩估计推断亲缘系数 $\hat{\pi}$：

$$\hat{\pi} = P(IBD = 2) + \frac{1}{2} P(IBD = 1)$$

当 $\hat{\pi} \approx 1$ 时提示为同一克隆品系或生物学重复，$\hat{\pi} \approx 0.5$ 提示为全同胞或亲子关系。

---

## PLINK 1.9 与 PLINK 2.0 架构与特性对比

| 功能特性 | PLINK 1.9 | PLINK 2.0 |
| :--- | :--- | :--- |
| **核心格式** | `.bed` / `.bim` / `.fam` (2-bit 固定编码) | `.pgen` / `.pvar` / `.psam` (分块差分压缩，体积减半) |
| **等位基因支持** | 严格双等位 SNP，强制丢弃多等位或拆分为伪双等位 | 原生支持多等位位点（Multiallelic SNPs / Indels） |
| **连续剂量 (Dosage)** | 仅支持离散硬调用（0/1/2） | 原生支持概率填补后的连续剂量（0.00 ~ 2.00）与相位信息 |
| **PCA 算法** | 经典全矩阵特征分解，默认输出前 20 个 PC | 经典分解与随机化近似算法（`--pca approx`），默认 10 个 PC |
| **FST 计算** | `--fst`：仅支持 Weir–Cockerham 估计 | 支持 Hudson 估计（默认）及 Weir–Cockerham，支持 Jackknife 标准误 |
| **多线程支持** | OpenMP 多线程加速部分模块 | 全面重写 SIMD 向量化运算（AVX2 / SSE4.2），吞吐大幅提升 |
| **生态兼容性** | 几乎所有下游软件（ADMIXTURE 等）的通用事实标准 | 现代大规模生物库（UK Biobank 等）与新一代植物泛基因组标准 |

---

## 生产环境标准流水线

以下展示将多样本重测序 VCF 转换为 PGEN/BED 格式，执行严格质控过滤、LD 剪枝、PCA 结构分解与 FST 计算的标准化生产流水线：

```bash
# 步骤 1：将多样本 VCF 转换为 PLINK 2.0 紧凑格式，限制为双等位变异并更新位点 ID
plink2 \
  --vcf plant_cohort_raw.vcf.gz \
  --set-all-var-ids @:#:\$r:\$a \
  --new-id-max-allele-len 50 \
  --max-alleles 2 \
  --make-pgen \
  --out work/plant_raw

# 步骤 2：样本与位点级严格质量控制（缺失率过滤、MAF 过滤）
# 注意：植物自交系需谨慎或禁用 --hwe 过滤（详见避坑指南）
plink2 \
  --pfile work/plant_raw \
  --mind 0.10 \
  --geno 0.05 \
  --maf 0.05 \
  --make-pgen \
  --out work/plant_qc

# 步骤 3：滑动窗口连锁不平衡（LD）剪枝
# 窗口 50 kb，步长 10 kb，r² 阈值 0.2（需结合物种 LD 衰减调整）
plink2 \
  --pfile work/plant_qc \
  --indep-pairwise 50kb 10kb 0.2 \
  --out work/plant_pruned

# 步骤 4：提取独立位点计算前 10 个主成分（PCA）
plink2 \
  --pfile work/plant_qc \
  --extract work/plant_pruned.prune.in \
  --pca 10 approx \
  --threads 16 \
  --out results/plant_pca

# 步骤 5：导出 PLINK 1.x BED 格式以供下游 ADMIXTURE 等工具使用
plink2 \
  --pfile work/plant_qc \
  --extract work/plant_pruned.prune.in \
  --make-bed \
  --out results/plant_admixture_ready

# 步骤 6：基于群体标签计算群体分化指数 Fst（PLINK 1.9 示例）
plink \
  --bfile results/plant_admixture_ready \
  --within plant_populations.clst \
  --fst \
  --out results/plant_fst
```

---

## 核心参数科学解析与植物调优指南

| 参数指令 | 推荐取值 | 物理含义与植物科研注意事项 |
| :--- | :--- | :--- |
| `--mind <float>` | `0.10` ~ `0.20` | **个体缺失率阈值**；剔除测序深度不足或建库失败的劣质样本；对难获取的野生珍稀种质可适当放宽至 0.20。 |
| `--geno <float>` | `0.05` ~ `0.10` | **位点缺失率阈值**；过滤在群体中缺失比例过高的 SNP；植物重复序列区易产生不均一覆盖，需严格控制。 |
| `--maf <float>` | `0.05` | **次要等位基因频率阈值**；剔除测序测序错误导致的极低频伪变异；若探索稀有适应性变异或瓶颈群体可降至 0.01。 |
| `--hwe <p-value>` | **自交作物必须禁用或设为 1e-50** | **哈代-温伯格平衡检验**；在异花授粉作物（玉米）中可设为 `1e-6` 剔除杂合度异常高的测序错误；但在高度自交作物中严禁设为 `1e-6`（详见下文）。 |
| `--indep-pairwise` | 视 LD 衰减而定 | **LD 剪枝窗口**；异交作物（玉米）LD 衰减快，推荐 `10kb 2kb 0.2`；自交作物（水稻/大豆）衰减慢，推荐 `50kb 10kb 0.2` 甚至 `100kb`。 |
| `--pca <k> [approx]` | `10` 或 `20` | **主成分提取数量**；`approx` 适合样本量 $> 1000$ 的大型植物群体，可提速数十倍且前几个 PC 精度与精确 SVD 高度吻合。 |

---

## 植物基因组特有挑战与避坑指南

### 1. 自交作物的“HWE 过滤陷阱”
- **机制与风险**：人类遗传学通常将 `--hwe 1e-6` 作为常规质控标准，用于剔除旁系同源基因误比对导致的假性超杂合位点。然而，水稻（*Oryza sativa*）、拟南芥（*Arabidopsis thaliana*）、大豆（*Glycine max*）和小麦（*Triticum aestivum*）等植物均为高度自花授粉物种，天然近交系数 $F \to 1$，全基因组几乎所有天然位点均处于纯合状态（极度缺乏杂合子）。
- **严重后果**：若机械执行 `--hwe 1e-6`，卡方检验将判定纯合子过度代表而极度偏离 HWE，**导致 80%~95% 以上真实可靠的纯合功能性 SNP 被错误过滤殆尽**！
- **避坑准则**：自交作物进行全基因组质控时，**必须显式关闭 `--hwe` 过滤**，或者仅设置针对“杂合子过剩（Excess of Heterozygosity）”的单侧检验，严格禁止双侧 HWE 过滤。

### 2. 连锁不平衡衰减距离的物种跨度极大
- **物种差异**：
  - 远缘异交物种（如玉米、杨树）：有效群体大且重组频繁，LD 衰减距离通常在 $1 \sim 5\text{ kb}$ 内即跌破 $r^2 = 0.2$；
  - 驯化自交作物（如栽培稻、栽培大豆）：经历严苛驯化瓶颈与长期纯系繁育，LD 衰减距离往往长达 $100 \sim 200\text{ kb}$。
- **调优策略**：严禁照搬人类或模式生物的剪枝参数（如 `50 5 0.5`）。在运行 `--indep-pairwise` 前，必须先用 PopLDdecay 或 PLINK `--r2` 实测目标群体的全基因组平均 LD 衰减曲线，将窗口大小设定为该物种 LD 衰减半数距离的 2~3 倍，避免染色体大倒位（Inversion）或着丝粒抑制重组冷区在 PCA 分析中占据绝对主导。

### 3. 克隆繁殖与种质资源重复取样去冗余
- 许多多年生果树（葡萄、柑橘、马铃薯等）主要通过无性扦插繁殖，种质资源库中常存在同名异物或异名同物的近全同卵克隆材料。
- 在构建群体结构前，使用 PLINK 计算成对 IBD 系数（`--genome` 或 PLINK 2 `--make-king`）。对亲缘系数 $\hat{\pi} > 0.90$ 或 KING 相关系数 $> 0.354$ 的重复样本进行去冗余，保留测序深度更高的一份，防止过密的人工克隆系严重扭曲 PCA 主轴。

---

## 输出结果深度解析

```text
results/
├── plant_pca.eigenvec       # 样本主成分投影坐标矩阵 (第一列为 FID, 第二列为 IID, 后续列为 PC1 ~ PC10)
├── plant_pca.eigenval       # 各主成分对应的特征值大小 (降序排列, 用于计算各 PC 解释方差百分比)
├── plant_pruned.prune.in    # LD 剪枝后保留的近似相互独立 SNP ID 列表
├── plant_pruned.prune.out   # LD 剪枝中被剔除的强连锁冗余 SNP ID 列表
├── plant_admixture_ready.bed # 二进制基因型矩阵
├── plant_admixture_ready.bim # 变异位点元数据信息表 (染色体、位点ID、遗传距离、物理位置、等位基因)
└── plant_admixture_ready.fam # 样本家系与表型信息表 (家系ID、个体ID、父本、母本、性别、表型)
```

- **方差解释率计算**：若 `eigenval` 文件前三个特征值分别为 $24.5, 12.3, 8.1$，所有特征值总和为 $100.0$，则 PC1、PC2、PC3 分别解释 $24.5\%, 12.3\%, 8.1\%$ 的全基因组遗传变异。
- **散点图绘制规范**：在 R 或 Python 中绘制 PC1 vs PC2 散点图时，坐标轴标签必须注明方差百分比（例如：`PC1 (24.5%)`），并根据种质的地理来源、亚种分类（如籼稻 vs 粳稻）赋予不同颜色，直观展现群体分化格局。

---

## 植物应用案例与真实文献证据

1. **3,010 份亚洲栽培稻全球代表性种质泛基因组与群体结构解析**：
   在国际水稻 3K 基因组计划中（Wang et al., *Nature*, 2018），研究人员首先使用 PLINK 对全基因组 1,000 万个原始 SNP 进行严格位点缺失率（`--geno 0.1`）、个体缺失率（`--mind 0.2`）过滤与 MAF 筛选；随后运用 `--indep-pairwise` 过滤掉强连锁变异，生成高质量轻量级子集，成功支撑了后续九大栽培稻亚群（xian/indica, geng/japonica, aus, basmati 等）的高精度主成分投影与 ADMIXTURE 聚类分析（[Wang et al., *Nature*, 2018](https://doi.org/10.1038/s41586-018-0063-9)）。
2. **拟南芥 1,135 个全基因组自然地理分布与适应性演化**：
   在拟南芥 1001 基因组联盟研究中，研究团队利用 PLINK 执行大规模成对 IBD 距离计算，精准鉴别并剔除了近缘克隆取样偏差；通过高效的 PCA 矩阵分解，清晰识别出伊比利亚半岛、亚洲高山以及北欧亚群的遗传分化界限（[1001 Genomes Consortium, *Cell*, 2016](https://doi.org/10.1016/j.cell.2016.05.063)）。

---

## 实践排错与质控规范

- **错误 1：执行 `--make-bed` 时报错 `Error: Duplicate ID 'chr1:10052:A:T'`**
  - *排查原因*：输入的 VCF 中存在物理位置与等位基因完全相同的冗余变异记录，或由多等位位点拆分引起 ID 碰撞。
  - *解决方案*：使用 `plink2 --rm-dup force-first` 自动剔除重复 ID，或在生成 PGEN 前利用 `bcftools norm -d all` 执行标准化去冗余。
- **错误 2：自交植物运行 PCA 后，散点图呈现大量样本簇拥在单一极端孤立点**
  - *排查原因*：未做 LD 剪枝，导致一条染色体上的巨型倒位区（如数兆碱基的强连锁倒位区段）包含数千个高相关变异，彻底主导了第一或第二主成分。
  - *解决方案*：先严格执行 `--indep-pairwise` 剪枝；若倒位信号极强，可在计算 PCA 时显式剔除已知染色体倒位与着丝粒抑制重组区域（`--exclude range inversion_coords.bed`）。
