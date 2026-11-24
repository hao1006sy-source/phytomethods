---
title: 单细胞质控、文库归一化与批次校正：MAD 自适应过滤、DoubletFinder 与 Harmony 流形对齐
summary: 深入推导中位数绝对偏差 (MAD) 自适应质控模型、DoubletFinder 人工双细胞模拟检验、SCTransform 正则化负二项归一化以及 Harmony / Scanorama 批次流形校正算法。
domain: single-cell-spatial-omics
methods: [scanpy, sc-kb-copilot, doubletfinder]
status: published
updatedAt: 2026-11-25
---

## 核心科学问题：技术噪声、双细胞假象与实验批次效应

单细胞转录组测序数据中的基因表达量差异，往往受到多种强烈的技术性噪声与实验偏差干扰：
1. **文库大小异质性**：由于单个微胶滴内逆转录酶捕获效率、裂解程度及 PCR 扩增效率的物理随机波动，不同细胞检测到的总 UMI 计数可相差数倍至数十倍；
2. **死细胞与细胞破损**：质膜破裂会导致细胞质 mRNA 大量流失，而双层膜包裹的细胞器（线粒体与叶绿体）较不易破损，使得低质量破损细胞中线粒体/叶绿体转录本比例异常飙升；
3. **双细胞/多细胞液滴**（Doublets/Multiplets）：同一个微胶滴偶然包裹了两个或多个不同类型的细胞（如 1 个表皮细胞 + 1 个皮层细胞），在下游聚类分析中会表现为虚假的“过渡中间态”或“新细胞亚群”；
4. **批次效应**（Batch Effects）：不同植物采样批次、不同酶解操作人员、不同测序芯片（Lane）会引入显著的技术系统性位移，甚至完全掩盖真实的基因型或抗逆胁迫处理效应。

---

## 算法数学推导：质控过滤、归一化与批次对齐

### 1. 中位数绝对偏差（MAD）自适应过滤模型

在传统的质控中，科研人员常武断地设定硬编码阈值（如 UMI $\ge 1000$, 基因数 $\ge 500$）。然而植物不同细胞类型的天然体积与转录活性差异极大（例如形成层干细胞的 RNA 含量天然远低于多倍化成熟薄壁细胞），硬截断极易系统性抹杀微小但关键的细胞类型。

**自适应 MAD 统计模型**：
对于某一样本中所有细胞的指标向量 $\mathbf{x} = (x_1, \dots, x_N)$（如总基因数取 $\log_{10}$ 变换）：
1. 计算中位数（Median）：$M = \text{median}(\mathbf{x})$；
2. 计算中位数绝对偏差（Median Absolute Deviation, MAD）：
   $$\text{MAD} = \text{median}(|x_i - M|)$$
3. 动态设定上下截断红线：
   $$\text{Threshold}_{\text{low}} = M - 3 \cdot \text{MAD}, \quad \text{Threshold}_{\text{high}} = M + 3 \cdot \text{MAD}$$
若指标服从正态分布，该区间严格覆盖 $99.7\%$ 的正常细胞，将极端离群值作为死细胞或潜在破损液滴客观剔除。

### 2. DoubletFinder 人工合成双细胞检验算法

由于双细胞是由两个独立细胞随机混合而成，其总 UMI 往往偏高且同时表达两套正交的细胞类型标记基因。

**DoubletFinder 统计检验推导**：
1. **人工双细胞模拟**（Artificial Doublets）：
   从原始过滤后的单细胞矩阵中，按比例随机无放回抽取细胞对 $(c_1, c_2)$，将其原始表达量相加生成模拟双细胞：
   $$\mathbf{x}_{\text{art}} = \mathbf{x}_{c_1} + \mathbf{x}_{c_2}$$
   通常合成占真实细胞数 $25\%$ 的人工双细胞集合；
2. **联合降维与空间嵌入**：
   将真实细胞与人工模拟双细胞合并，重新执行主成分分析（PCA），构建前 $K$ 个主成分的联合特征空间；
3. **计算邻近人工双细胞比例**（pANN, proportion of Artificial Nearest Neighbors）：
   对每一个真实细胞 $i$，在 PC 空间中找出其 $k$ 个最近邻细胞（$k = \text{round}(0.005 \cdot N)$）：
   $$\text{pANN}_i = \frac{\sum_{j \in \text{NN}(i)} \mathbb{I}(j \in \text{Artificial Doublets})}{k}$$
   $\text{pANN}_i$ 得分越高，表明该细胞在局部流形空间中与模拟双细胞无法区分；
4. **基于泊松装载率确定阈值截断**：
   根据 10x Genomics 微流控细胞装载浓度计算理论预期双细胞比率（例如每捕获 10,000 个细胞预期含约 $7.6\%$ 双细胞），按 pANN 得分降序截取前 $7.6\%$ 的细胞标记为 Doublet 并予以彻底移除。

### 3. 文库归一化：Shifted Logarithm 与 SCTransform 负二项模型

#### (1) 常规对数变换归一化（Shifted Logarithm）
将每个细胞 $c$ 的原始计数 $x_{cg}$ 按照该细胞总文库大小 $N_c = \sum_g x_{cg}$ 进行等比例缩放（通常缩放到全细胞中位数或 $10^4$），再做自然对数平滑：
$$z_{cg} = \log \left( 1 + 10^4 \cdot \frac{x_{cg}}{N_c} \right)$$
*局限性*：对于高表达基因，该方法无法消除方差与均值的强相关性（技术采样泊松噪声）。

#### (2) SCTransform 正则化负二项回归（Regularized Negative Binomial Regression）
SCTransform（*Hafemeister & Satija, Genome Biology, 2019*）假定每个基因 $g$ 在细胞 $c$ 中的原始 UMI 计数服从**负二项分布**：
$$x_{cg} \sim \text{NB}(\mu_{cg}, \theta_g), \quad \log(\mu_{cg}) = \beta_{0,g} + \beta_{1,g} \log_{10}(N_c)$$
1. 拟合参数并利用全局核密度估计（Kernel Density Smoothing）对回归系数 $\beta$ 与过度离散度（Overdispersion）$\theta_g$ 进行正则化收缩；
2. 计算**皮尔逊残差**（Pearson Residuals）：
   $$r_{cg} = \frac{x_{cg} - \mu_{cg}}{\sqrt{\mu_{cg} + \mu_{cg}^2 / \theta_g}}$$
皮尔逊残差 $r_{cg}$ 彻底剥离了测序深度的技术效应，将方差稳定为均值为 0、方差为 1 的无量纲表达值，是下游构建高变基因与 PCA 降维的最优输入。

### 4. 批次效应校正：Harmony 软聚类最大期望（EM）算法

Harmony（*Korsunsky et al., Nature Methods, 2019*）直接在 PCA 低维空间内运行，避免了对高维稀疏矩阵的破坏性重构：
1. **最大化多样性聚类（EM 算法 E 步）**：
   将所有细胞分配到 $K$ 个聚类中心，引入信息熵惩罚项，促使每个聚类中心包含来自不同实验批次的细胞比例与其全局比例相匹配；
2. **批次校正向量计算（EM 算法 M 步）**：
   根据细胞所属聚类的软分配概率，计算每个批次偏离聚类中心的系统性线性偏移向量，将细胞坐标平移校正，迭代直至收敛。

---

## 植物生物学特色：细胞器比例与组织异质性

在动物单细胞分析中，学术界普遍将线粒体基因比例（Mito%）硬性截断为 $\le 5\%$。**这一标准绝不能直接套用在植物组织中**：
1. **光合成熟绿色组织**（如拟南芥真叶、玉米叶片）：叶肉细胞富含超高拷贝的叶绿体基因组，叶绿体转录本（Chloro%）占比往往天然高达 $20\% \sim 50\%$，硬性截断 5% 将导致全叶肉细胞群被彻底误杀；
2. **根系地下未分化组织**（如水稻根尖、拟南芥根系）：缺乏成熟叶绿体，主要转录本集中在核基因组，正常根细胞的 Mito% 通常低于 $2\% \sim 3\%$；
3. **最佳实践**：必须针对光合与非光合组织分别绘制细胞器双峰分布密度图，结合核编码内参基因（如 *ACTIN*、*UBQ*）表达水平确立特异性阈值。

---

## 真实植物科研案例：光照时序图谱与土壤胁迫批次整合

### 1. 拟南芥全幼苗光响应单细胞时序图谱（*Sun et al., Nature Plants, 2023*）
在研究暗诱导白化苗遭遇连续光照刺激（0h, 1h, 6h, 12h）的细胞重编程时，研究者使用 DoubletFinder 过滤了约 $5.8\%$ 的双细胞；采用 SCTransform 对各时间点文库进行方差稳定化，并利用 Harmony 成功消除了测序 Lane 与独立生物学重复间的技术位移，精准保留了叶肉细胞在光照诱导下的叶绿体发生发育时序轨迹。

### 2. 水稻耐盐碱土壤胁迫单细胞图谱（*Nature, 2025*）
在对盐碱土与对照土培养的水稻根系细胞进行整合时，研究团队通过基于负二项回归的批次校正模型，成功将酶解时间批次与盐胁迫生理响应解耦，证实表皮细胞层中木质素合成基因的上调是由高盐环境真实诱导，而非体外解离时间长短引起的实验假象。

---

## 关联工具与复现入口

- **Scanpy**：通过 `sc.pp.filter_cells`、`sc.pp.normalize_total`、`sc.pp.log1p` 与 `scanpy.external.pp.harmony_integrate` 提供完整的质控与批次消除链条。
- **DoubletFinder**：R 语言生态中单细胞人工双细胞预测的标准工具。
- 参见[拟南芥时序单细胞图谱文献解读](../../../papers/arabidopsis-light-atlas-2023/)与[Scanpy 质控与降维教程](../../../tutorials/scanpy-synthetic/)。
