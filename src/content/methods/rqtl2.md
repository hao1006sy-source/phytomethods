---
title: R/qtl2
name: R/qtl2
summary: 面向双亲分离群体、多亲本重组自交系 (MAGIC) 与复杂杂交群体的 QTL 定位、基因型概率推断与 LOD 关联扫描 R 软件包。
dataType: 杂交群体标记基因型、高密度遗传图谱 (cM)、表型数据与亲本祖先单倍型
principle: 隐马尔可夫模型 (HMM) 多点单倍型概率、留一染色体亲缘校正 (LOCO)、线性混合模型单 QTL 扫描与置换检验
domainIds: [gwas-breeding]
topicIds: [m06-topic-02]
principleIds: [qtl-linkage-mapping]
dataIds: [variant-data, phenotype]
paper: rqtl2-paper
repository: https://github.com/rqtl/qtl2
version: "0.46"
status: published
updatedAt: 2026-11-25
---

## 生物学问题与定位

在植物功能基因组学、正向遗传学与农艺性状基因克隆中，**数量性状位点（QTL）连锁定位**是连接田间优异表型与染色体具体物理区段的核心桥梁。传统的定位研究依赖人工构建的双亲杂交分离群体（如 F2、回交群体 BC、重组自交系 RIL、双单倍体 DH）；而现代作物育种更进一步拓展至包含多个原始亲本的多亲本高级代重组互交群体（Multi-parent Advanced Generation Inter-Cross, MAGIC）以及巢式关联作图群体（Nested Association Mapping, NAM）。

在全基因组测序时代，QTL 定位面临两大新挑战：
1. 变异标记密度达到数万至数百万，但高通量测序在低覆盖度下存在较多缺失数据；
2. 在多亲本群体中，后代个体的染色体片段是由 4 个、8 个乃至 16 个不同始祖亲本（Founders）的单倍型片段相互嵌合拼接而成，无法直接用二元数值表示。

**R/qtl2** 由著名统计遗传学家 Karl Broman 等人于 2019 年发表在 *Genetics* 上（CRAN 最新版本 0.46）。作为经典 R/qtl 的完全重构与现代工业级升级版，R/qtl2 针对高密度测序标记与多亲本复杂设计进行了底层性能优化：通过隐马尔可夫模型（HMM）精确计算任意染色体网格点上的**多点始祖单倍型概率（Founder Probabilities）**，引入**留一染色体（LOCO）亲缘校正算法**彻底杜绝近亲假阳性与近端污染，成为植物数量性状定位领域公认的黄金标准分析工具。

---

## 核心算法数学原理与推导

R/qtl2 的分析流程解耦为两大核心数学模块：

### 1. 隐马尔可夫模型（HMM）与多点单倍型概率推断

设染色体上分布着按遗传距离排序的测序标记位点。由于测序标记之间存在物理间隙，R/qtl2 首先以固定的步长（如每 $0.2\text{ cM}$）在遗传图谱上插入虚拟网格点（Pseudomarkers）。

令 $G(x) \in \{1, 2, \dots, K\}$ 为个体在染色体位置 $x$ 处继承的真实祖先基因型隐状态（对于 8 亲本 MAGIC 群体，纯合单倍型状态数 $K = 8$）：
- **状态转移概率（Transition Probability）**：根据相邻位置间的遗传距离 $d$（厘摩 cM），利用 Haldane 或 Kosambi 映射函数计算减数分裂重组率 $r$；
- **发射概率（Emission Probability）**：考虑基因分型测序错误率 $\epsilon$（参数 `error_prob`，通常设为 0.002）。即使某个标记因测序错误而出现异常等位基因，发射矩阵亦能容错吸收；
- **多点后验概率求解**：利用 Baum-Welch 前向-后向算法（Forward-Backward Algorithm），对每个个体在染色体各网格点 $x$ 处计算条件于全染色体所有观测标记的后验基因型概率矩阵：
  $$P_{ik}(x) = P(G_i(x) = k \mid \text{全部观测标记数据})$$

### 2. 线性模型与似然比对数（LOD Score）全基因组扫描

在候选测试网格位置 $x$ 处，建立表型与基因型概率的多元回归模型：

$$\mathbf{y} = \mathbf{X}\boldsymbol{\beta} + \sum_{k=1}^{K-1} P_{ik}(x) \alpha_k + \mathbf{e}$$

- $\mathbf{X}\boldsymbol{\beta}$：固定协变量效应（如性别、区组、环境）；
- $\alpha_k$：第 $k$ 个始祖亲本单倍型的加性遗传效应；
- $\mathbf{e} \sim \mathcal{N}(\mathbf{0}, \mathbf{I}\sigma^2)$：独立随机误差。

全基因组单 QTL 扫描通过计算含有候选 QTL 的全模型与仅含协变量的零模型之间的似然比对数（Logarithm of the Odds, LOD）：

$$\text{LOD}(x) = \log_{10} \left[ \frac{L(\text{全模型})}{L(\text{零模型})} \right] = \frac{n}{2} \log_{10} \left( \frac{\text{RSS}_0}{\text{RSS}(x)} \right)$$

其中 $\text{RSS}_0$ 与 $\text{RSS}(x)$ 分别为零模型与全模型的残差平方和。LOD 曲线呈现显著尖峰的区域即定位出候选 QTL。

### 3. 留一染色体（Leave-One-Chromosome-Out, LOCO）亲缘校正

在存在多基因多代杂交或群体亲缘背景的群体中，若直接使用包含全基因组标记的亲缘矩阵 $\mathbf{K}$ 进行混合模型扫描，会发生致命的**近端污染（Proximal Contamination）**：
- 待检验的第 $c$ 号染色体上的真实 QTL 效应本身会被包含在该全基因组亲缘矩阵中；
- 混合模型在求解时，会把该位置的真实 QTL 效应当作“背景亲缘噪音”直接抵消吸收，导致真实峰值的 LOD 分值被大幅压低！
- **LOCO 解决方案**：在扫描第 $c$ 号染色体时，**强制使用剔除了第 $c$ 号染色体标记后计算得到的局部亲缘矩阵 $\mathbf{K}_{(-c)}$**。这种留一法彻底杜绝了近端吸收，确保主效与微效 QTL 均能呈现真实的显著性峰值。

### 4. 经验显著性阈值的置换检验（Permutation Test）

通过参数 `scan1perm` 执行 1,000 次随机置换（Permutation）：保持全基因组基因型概率与图谱结构不变，随机打乱表型向量 $\mathbf{y}$ 的样本对应关系。记录每次置换全基因组的最大 LOD 极值，提取第 95% 分位数作为全基因组实验显著性阈值（$\alpha = 0.05$）。

---

## 生产环境标准流水线

以下展示利用 R/qtl2 读取双亲或多亲本植物群体数据、计算 HMM 概率、执行 LOCO 混合模型扫描并输出 1.5-LOD 候选置信区间的标准 R 脚本：

```r
library(qtl2)

# 步骤 1：利用 YAML 配置文件读取植物杂交群体数据 (cross2 格式)
plant_cross <- read_cross2("rice_ril_cross.yaml")

# 步骤 2：在全基因组插入虚拟网格点 (每 0.2 cM 一个测试点)
map_grid <- insert_pseudomarkers(plant_cross$gmap, step = 0.2)

# 步骤 3：基于 HMM 计算各网格点的祖先基因型后验概率 (考虑 0.2% 测序错误率)
probs <- calc_genoprob(
  cross = plant_cross,
  map = map_grid,
  error_prob = 0.002,
  cores = 8
)

# 步骤 4：计算留一染色体 (LOCO) 亲缘关系矩阵列表
kinship_loco <- calc_kinship(probs, type = "loco", cores = 8)

# 步骤 5：执行全基因组单 QTL 混合模型扫描
out_loco <- scan1(
  genoprobs = probs,
  pheno = plant_cross$pheno,
  kinship = kinship_loco,
  cores = 8
)

# 步骤 6：通过 1,000 次置换检验确定全基因组显著性阈值 (alpha = 0.05)
perm_threshold <- scan1perm(
  genoprobs = probs,
  pheno = plant_cross$pheno,
  kinship = kinship_loco,
  n_perm = 1000,
  cores = 8
)
sig_lod <- summary(perm_threshold, alpha = 0.05)

# 步骤 7：提取跨越显著性阈值的峰值位点及其 1.5-LOD 下降置信区间
peaks <- find_peaks(
  scan1_output = out_loco,
  map = map_grid,
  threshold = sig_lod,
  drop = 1.5
)
print(peaks)
```

---

## 核心参数科学解析与植物调优指南

| 函数指令 | 推荐设置 | 物理含义与植物科研注意事项 |
| :--- | :--- | :--- |
| `error_prob` | `0.002` ~ `0.005` | **测序错误率先验**；在 `calc_genoprob` 中至关重要！绝不可设为 0，否则 HMM 遇到测序噪声会误判为紧邻的双交换重组。 |
| `step` | `0.2` ~ `0.5` (cM) | **虚拟网格插值步长**；过细（如 0.05 cM）会导致计算冗余，过粗（如 2 cM）易漏掉局部尖锐峰值。 |
| `type = "loco"` | **强烈推荐必须开启** | **留一染色体亲缘计算**；彻底消除近端污染，防止真实 QTL 信号被自身亲缘矩阵吸收。 |
| `drop = 1.5` | 经典 QTL 标准 | **LOD 置信区间估算**；从峰值最高点向两侧各下降 1.5 个 LOD 单位所对应的物理/遗传跨度，通常对应 95% 贝叶斯置信区间。 |

---

## 植物基因组特有挑战与避坑指南

### 1. 遗传图谱距离（cM）与物理基因组距离（bp）的非线性畸变
- **机制提示**：植物基因组着丝粒区、次缢痕及大倒位区段，由于重组被极度抑制，物理距离可达数兆碱基（Mb），但遗传图谱距离仅为 0.1~0.5 cM。
- **严重后果**：若未意识到该非线性特征，在遗传图谱上表现为非常狭窄尖锐的 1.5-LOD 峰（看似区间极小），对应到物理基因组上却涵盖了上百个候选基因，导致后续图位克隆极难缩小范围。
- **科学应对**：完成初步定位后，必须通过物理图谱映射（Physical map conversion）将遗传峰对齐至参考基因组坐标，针对目标区间开发局部高密度 CAPS/InDel 标记进行大群体精细定位。

---

## 植物应用案例与真实文献证据

1. **水稻深根性耐旱主效基因 *DRO1* 的高精度 QTL 连锁定位**：
   在水稻抗旱遗传学经典突破中（Uga et al., *Nature Genetics*, 2013），研究人员利用浅根品种 IR64 与深根水稻品系构建的重组自交系（RIL）群体，通过高密度遗传连锁扫描与 LOD 显著性检验，在 9 号染色体上精准定位出控制水稻根系向地性生长的经典主效 QTL（*DRO1*），1.5-LOD 置信区间被压缩在极小物理范围内，最终成功克隆出该调控生长素不对称分布的关键基因（[Uga et al., *Nature Genetics*, 2013](https://doi.org/10.1038/ng.2725)）。

---

## 实践排错与质控规范

- **错误 1：`calc_genoprob` 报错 `Error: Incompatible genotype codes for cross type`**
  - *排查原因*：YAML 文件中声明的群体类型（`crosstype`，如 `riself`、`f2` 或 `magic`）与基因型矩阵中输入的字符编码（如 `AA/BB/AB` vs `1/2/3`）不匹配。
  - *解决方案*：查阅 R/qtl2 官方文档规范，严格确保基因型编码与所声明的杂交群体类型完全一致。
- **错误 2：`scan1` 运行后 LOD 曲线在整条染色体上完全是一条水平直线**
  - *排查原因*：该染色体上的所有标记在输入数据中均没有有效的物理/遗传图谱坐标，或该性状表型值全为常数。
  - *解决方案*：检查输入数据的图谱文件，确保遗传距离严格按递增排列且无缺失值。
