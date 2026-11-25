---
title: GAPIT
name: GAPIT
summary: 全基因组关联分析 (GWAS) 与基因组预测 (GS) 一体化集成工具，支持 MLM、CMLM、FarmCPU 与 BLINK 等先进多位点模型。
dataType: 变异基因型 (HapMap / VCF / 数值矩阵)、表型数据 (TSV/CSV)、协变量与亲缘矩阵
principle: 线性混合模型 (Q+K)、压缩混合模型 (CMLM)、固定与随机模型迭代 (FarmCPU) 及贝叶斯 LD 剪枝 (BLINK)
domainIds: [gwas-breeding]
topicIds: [m06-topic-03, m06-topic-04, m06-topic-05, m06-topic-06]
principleIds: [gwas-mixed-model]
dataIds: [variant-data, phenotype]
paper: gapit3-paper
repository: https://github.com/jiabowang/GAPIT
status: published
updatedAt: 2026-11-25
---

## 生物学问题与定位

在植物功能基因组学与现代分子设计育种中，全基因组关联分析（GWAS）是解析作物复杂农艺性状（产量、抗逆性、养分高效、株型等）遗传架构的核心手段。然而，植物种质材料具有极特殊的演化背景：
1. **强烈的群体分层（Population Structure）**：如水稻籼粳分化、玉米温带与热带硬粒型分化，地理生态隔离极易引发全基因组范围的假阳性关联；
2. **复杂的近亲家系结构（Family Relatedness）**：育种系谱中存在大量全同胞、半同胞杂交系，造成基因型与表型的伪相关；
3. **因果变异与群体结构高度共线**：关键农艺性状（如水稻抽穗期、播种期）往往与地理纬度完全吻合，传统混合线性模型极易过度矫正导致致命假阴性。

**GAPIT（Genome Association and Prediction Integrated Tool）**由康奈尔大学 Zhiwu Zhang 教授实验室与 Jiabo Wang 等人开发（初代发表于 *Bioinformatics*, 2012；最新 GAPIT 3 系统发表于 *Genomics, Proteomics & Bioinformatics*, 2021）。作为植物数量遗传学领域的旗舰级 R 语言工具包，GAPIT 完整集成了从经典混合线性模型（MLM）到前沿多位点迭代模型（FarmCPU、BLINK）的全套演进算法，并无缝衔接基因组预测（GBLUP），是全球植物学界使用最广泛的 GWAS 工具之一。

---

## 核心算法数学原理与推导

GAPIT 的统计引擎涵盖了四个里程碑式的演进模型：

### 1. 经典混合线性模型（MLM / Q+K 框架）

由 Yu et al.（*Nature Genetics*, 2006）确立，将样本表型拆解为固定效应与随机背景效应：

$$\mathbf{y} = \mathbf{X}\boldsymbol{\beta} + \mathbf{S}\alpha + \mathbf{Q}\mathbf{v} + \mathbf{u} + \mathbf{e}$$

- $\mathbf{y} \in \mathbb{R}^{n \times 1}$：个体表型值向量；
- $\mathbf{X}\boldsymbol{\beta}$：试验设计固定效应（均值、批次、环境等）；
- $\mathbf{S}\alpha$：待检验的单个 SNP 标记效应，$\alpha$ 为加性效应标量；
- $\mathbf{Q}\mathbf{v}$：群体结构固定效应协变量（由 PCA 前几个主成分或 ADMIXTURE $Q$ 矩阵构成），用以控制宏观群体分层；
- $\mathbf{u} \sim \mathcal{N}(\mathbf{0}, 2\mathbf{K}\sigma_a^2)$：个体间多基因微效随机遗传背景效应，$\mathbf{K} \in \mathbb{R}^{n \times n}$ 为根据全基因组标记构建的亲缘关系矩阵（Kinship Matrix）；
- $\mathbf{e} \sim \mathcal{N}(\mathbf{0}, \mathbf{I}\sigma_e^2)$：独立随机残差。

通过限制性极大似然法（REML）估计方差组分比 $\delta = \sigma_e^2 / \sigma_a^2$，MLM 能有效控制绝大部分由群体分化和亲缘近邻引起的膨胀假阳性。

### 2. 压缩混合线性模型（Compressed MLM, CMLM）

Zhang et al.（*Nature Genetics*, 2010）针对大样本个体亲缘矩阵特征值分解的 $O(n^3)$ 耗时瓶颈，提出根据亲缘距离对个体执行聚类压缩。将 $n$ 个样本聚类为 $g$ 个组（$g < n$），用群间亲缘矩阵替代原个体亲缘矩阵，在大幅提速数十倍的同时提高了统计检测效力。

### 3. 多位点固定与随机模型循环（FarmCPU）

Liu et al.（*Nature Genetics*, 2016）针对经典 MLM 的“假阴性过度矫正”缺陷，提出了突破性的分步交替迭代框架：
1. **固定效应模型（Fixed Effect Model, FEM）**：
   $$\mathbf{y} = \mathbf{S}_i \alpha_i + \mathbf{S}_{\text{pseudo}} \boldsymbol{\gamma} + \mathbf{e}$$
   将筛选出的若干代表性伪 QTNs（Pseudo Quantitative Trait Nucleotides）作为协变量纳入模型，逐一检验全基因组各候选 SNP 位点 $i$ 的 $p$ 值；
2. **随机效应模型（Random Effect Model, REM）**：
   根据 FEM 检验出的极显著候选位点，利用全基因组遗传算法重新优化伪 QTNs 集合，并估计遗传方差组分；
3. **循环迭代至收敛**：固定模型负责发掘信号，随机模型负责约束假阳性，两者交替迭代，彻底消除了由于亲缘矩阵过度矫正而将真正因果基因当作随机背景抹杀的严重弊端。

### 4. 贝叶斯信息准则与连锁不平衡剪枝模型（BLINK）

Huang et al.（*GigaScience*, 2019）对 FarmCPU 进行了第二代优化。BLINK 彻底废除了耗时的随机效应模型，直接利用**贝叶斯信息准则（BIC）**与**两两标记连锁不平衡（LD）贪心排除策略**，在固定效应模型框架下以毫秒级速度迭代筛选最优伪 QTN 协变量组合，使数百万标记的植物全基因组 GWAS 分析耗时缩短至分钟级。

---

## 生产环境标准流水线

以下展示在 R 语言环境中利用 GAPIT 运行经典 MLM、FarmCPU 与 BLINK 模型并自动生成 Manhattan 与 QQ 图的工业级脚本：

```r
library(GAPIT)

# 步骤 1：读取质控后的数值化基因型矩阵 (GD/GM) 与表型数据 (Y)
# GD: 样本行, SNP列, 数值 0/1/2; GM: SNP ID, 染色体, 物理位置
myGD <- read.table("plant_genotype.GD", head = TRUE)
myGM <- read.table("plant_genotype.GM", head = TRUE)
myY  <- read.table("plant_phenotype.txt", head = TRUE)

# 步骤 2：读取由 PLINK 计算的前 5 个主成分作为群体结构协变量
myCV <- read.table("plant_pca_covariates.txt", head = TRUE)

# 步骤 3：调用 GAPIT 运行 BLINK 与 FarmCPU 多位点关联模型
myGAPIT <- GAPIT(
  Y = myY,                     # 表型数据 (第一列 Taxa, 第二列性状值)
  GD = myGD,                   # 数值化基因型矩阵
  GM = myGM,                   # 基因组物理坐标映射表
  CV = myCV,                   # PCA 协变量
  PCA.total = 3,               # 若未提供 CV，GAPIT 内部自动计算的 PC 数量
  model = c("BLINK", "FarmCPU", "MLM"), # 同时运行并对比三种经典模型
  Multiple_analysis = TRUE,    # 多模型综合对比输出
  SNP.MAF = 0.05,              # 过滤次要等位基因频率 < 0.05 的罕见变异
  memo = "Rice_Yield_GWAS"     # 输出文件命名前缀
)

# 步骤 4：自动输出结果位于当前工作目录：
# - Manhattan-Plot.Genewise.pdf (高保真曼哈顿图)
# - QQ-Plot.pdf (基因组膨胀 QQ 图)
# - GAPIT.Association.GWAS_Results.BLINK.csv (完整关联检验 p 值表)
```

---

## 核心参数科学解析与植物调优指南

| 参数指令 | 推荐设置 | 物理含义与植物科研注意事项 |
| :--- | :--- | :--- |
| `model` | `c("BLINK", "FarmCPU")` | **关联统计模型**；对于复杂植物群体，强烈推荐优先采纳 BLINK 和 FarmCPU；传统 MLM 可作为对照基线。 |
| `SNP.MAF` | `0.05` (默认) | **次要等位基因频率阈值**；在探索稀有变异时可放宽至 0.01，但在小样本（$<200$）中过低的 MAF 会导致严重虚假关联峰。 |
| `PCA.total` | `3` ~ `5` | **主成分协变量纳入数**；通过预先绘制 Scree plot 确定拐点，通常 3~5 个 PC 即可充分吸收宏观群体分层。 |
| `kinship.algorithm` | `"VanRaden"` | **亲缘矩阵算法**；VanRaden 算法能够严格反映加性等位基因共享状态，适合自交系与近交群体。 |
| `cutOff` | `0.05` | **显著性检验截断**；通常配合 Bonferroni 校正（$-\log_{10}(0.05/M)$）或 FDR（Benjamini-Hochberg）判定全基因组显著位点。 |

---

## 植物基因组特有挑战与避坑指南

### 1. 经典 MLM 的“假阴性过度矫正”致命陷阱
- **机制提示**：在水稻、大豆等植物中，驯化和地理适应导致大量关键性状（如开花期、抗寒性、籽粒休眠）在亚种或地理群体之间发生极度分化。
- **严重后果**：由于这些因果基因与群体结构（PCA 轴）或亲缘矩阵（Kinship）高度共线，**经典 MLM 的随机背景项 $\mathbf{u}$ 会将这些真正的因果主效 QTL 效应全盘当作“家系遗传背景”直接吸收过滤**，导致 Manhattan 图上真实的生物学主峰完全消失（假阴性）！
- **科学准则**：当发现 QQ 图严重下陷（$\lambda_{\text{GC}} \ll 1.0$）且已知主效基因未出峰时，**必须果断换用 FarmCPU 或 BLINK 模型**。FarmCPU 将 QTN 剥离为固定效应协变量，能完美将真实主效 QTL 与宏观背景亲缘区分开来。

### 2. 基因组膨胀因子 $\lambda_{\text{GC}}$ 的科学判读
- 每次运行必须严格复核生成的 QQ 图及其基因组膨胀因子 $\lambda_{\text{GC}}$（Genomic Inflation Factor）：
  - $\lambda_{\text{GC}} \approx 1.0$（通常在 $0.95 \sim 1.05$ 之间）：模型控制极佳，无系统性偏差；
  - $\lambda_{\text{GC}} > 1.15$：存在严重的群体分层未控制假阳性，需增加协变量主成分数或检查样本杂合性；
  - $\lambda_{\text{GC}} < 0.90$：模型存在显著过度矫正，大量潜在真实关联被抹杀。

---

## 植物应用案例与真实文献证据

1. **水稻籽粒外观与品质性状多模型 GWAS 解析**：
   在亚洲栽培稻核心育种资源研究中（Anilkumar et al., *Heredity*, 2023），研究人员利用 GAPIT 分别运行了 GLM、MLM、CMLM 与 FarmCPU 模型，针对粒长、粒宽和千粒重性状开展系统关联扫描。研究明确证实：由于水稻存在强烈的籼粳群体分化，传统 MLM 导致已知粒型基因 *GS3* 与 *GW5* 的显著性被严重低估，而 FarmCPU 模型在完全控制背景膨胀的同时，以极高的统计检出力精准命中了这些经典因果位点（[Anilkumar et al., *Heredity*, 2023](https://doi.org/10.1038/s41437-023-00599-5)）。

---

## 实践排错与质控规范

- **错误 1：程序报 `Error in solve.default(H): system is computationally singular`**
  - *排查原因*：表型数据中样本 ID 与基因型矩阵未严格对齐，或者输入的 PCA 协变量列之间存在完全共线性（多重共线性）。
  - *解决方案*：检查并确保表型第一列与基因型样本名完全交集匹配；剔除协变量中常数列或高度相关的冗余轴。
- **错误 2：FarmCPU 迭代进入死循环或耗时异常漫长**
  - *排查原因*：基因型矩阵未经过 LD 剪枝且包含数百万位点，导致 FEM 阶段纳入了过多处于同一紧密连锁块的伪 QTNs。
  - *解决方案*：在运行 GWAS 前，先使用 PLINK 进行适当的 LD 剪枝（如 $r^2 > 0.8$ 过滤），或直接改用计算速度更快的 BLINK 算法。
