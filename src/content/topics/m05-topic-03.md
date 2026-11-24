---
title: PCA、群体结构与祖先成分：Patterson 谱分解与 ADMIXTURE 极大似然模型
summary: 深入推导高维 SNP 基因型 Patterson 协方差奇异值分解、ADMIXTURE 块坐标下降与拟牛顿优化、CV 交叉验证误差最低点准则与植物亚群分层解析。
domain: population-genetics
methods: [plink, admixture]
status: published
updatedAt: 2026-11-25
---

## 核心科学问题：高维基因组数据的降维与连续谱推断

在植物群体基因组学中，来自不同地理纬度、生态区系（如耐旱、耐寒型）或人工育种谱系（如地方品种、现代杂交选育系）的材料，其等位基因频率存在广泛的连续梯度或离散分化。如果忽略**群体结构（Population Structure）与亲缘混杂**，在全基因组关联分析（GWAS）中会导致海量的假阳性虚假关联，而在选择扫描中也会将人口历史波动误判为正选择清除。

因此，群体遗传学发展了两大互补分析范式：
- **无监督非参数降维（PCA）**：通过主成分分析（Principal Component Analysis），将包含数十万至数百万 SNP 的高维基因型矩阵投影到前几个主要变异正交轴上，直观展示个体的连续聚类、地理距离隔离（IBD）与离群材料；
- **参数化概率混合模型（ADMIXTURE）**：在假定存在 $K$ 个未观察祖先群体的先验模型下，利用极大似然法联合估计每个个体的祖先血统比例向量（$Q$ 矩阵）与每个祖先群体的等位基因频率（$P$ 矩阵）。

![群体结构解析：主成分分析（PCA）与 ADMIXTURE 祖先成分推断](/phytomethods/images/topics/m05/population-structure-pca-admixture.svg)

---

## 算法数学推导：Patterson 矩阵分解与 ADMIXTURE 优化

### 1. Patterson 基因型标准化矩阵与 PCA 奇异值分解

设群体包含 $n$ 个个体和 $m$ 个双等位 SNP 位点。原始基因型矩阵记为 $G \in \{0, 1, 2\}^{m \times n}$（记录非参考等位基因剂量）。由于不同 SNP 的次等位基因频率（MAF $p_i$）悬殊，高频突变在方差中会占据不合理的统治地位。Patterson（2006）提出了经典的**归一化中心化矩阵 $M$**：

$$M_{ij} = \frac{g_{ij} - 2p_i}{\sqrt{2p_i(1 - p_i)}}$$

其中 $p_i = \frac{1}{2n} \sum_{j=1}^n g_{ij}$ 为该位点的实测等位基因频率。构建样本间的遗传协方差矩阵 $C \in \mathbb{R}^{n \times n}$：

$$C = \frac{1}{m} M^T M$$

对其进行**特征值谱分解**（Eigen-decomposition）或等价的**奇异值分解**（SVD）：

$$C = V \Lambda V^T$$

- 特征向量矩阵 $V$ 的前两列即为个体在前两个主成分上的投影视角坐标（PC1 与 PC2）；
- 对角阵 $\Lambda = \text{diag}(\lambda_1, \dots, \lambda_n)$ 记录特征值，第 $k$ 主成分所解释的遗传方差比例为 $\frac{\lambda_k}{\sum_i \lambda_i}$。

### 2. ADMIXTURE 极大似然概率模型

[ADMIXTURE](../../../methods/admixture/) 假设 $n$ 个个体源于 $K$ 个未知的离散祖先群体。设个体 $i$ 源自祖先成分 $k$ 的血统贡献比例为 $q_{ik}$（满足 $\sum_{k=1}^K q_{ik} = 1$），祖先群体 $k$ 在位点 $j$ 的等位基因频率为 $p_{kj}$。则个体 $i$ 在位点 $j$ 抽样得到突变等位基因的合成成功概率为：

$$\theta_{ij} = \sum_{k=1}^K q_{ik} p_{kj}$$

假定位点间在祖先群体内处于连锁平衡（LE），全基因组所有基因型观测值的全对数似然函数为二项分布乘积之和：

$$\ln L(Q, P) = \sum_{i=1}^n \sum_{j=1}^m \left[ g_{ij} \ln \theta_{ij} + (2 - g_{ij}) \ln(1 - \theta_{ij}) \right]$$

### 3. 拟牛顿块坐标下降加速（Fast Quasi-Newton Acceleration）

传统的 STRUCTURE 采用贝叶斯 MCMC 算法，在数十万标记上运行数天。ADMIXTURE 采用了高度优化的**交替块坐标下降**（Block Coordinate Descent）结合**拟牛顿加速**（Secant Quasi-Newton Method）：
- 固定 $P$ 矩阵，求解关于 $Q$ 矩阵的凸二次规划子问题；
- 固定 $Q$ 矩阵，求解关于 $P$ 矩阵的凸二次规划子问题；
- 计算速度比 MCMC 提升 100 倍以上，可在数十分钟内处理数千个植物重测序全样本。

### 4. 最优亚群数 $K$ 判定：交叉验证误差（CV Error）

通过启用 `--cv=5`（5-fold Cross-Validation），算法在每次迭代中随机掩蔽 $20\%$ 的已知基因型数据，用其余 $80\%$ 数据拟合的参数预测被掩盖位点的基因型，计算预测预测均方误差（CV Error）。
- **判定黄金标准**：绘制 CV error 随 $K$ 变化的折线图，**误差谷底对应的 $K$ 值**即为最具统计预测能力且未过拟合的最优亚群划分数。

---

## 植物群体结构分析实践流程

```bash
# 步骤 1：利用 PLINK 进行严密的连锁不平衡 (LD) 剪枝 (去除高相关共分离标记)
plink \
  --vcf cohort.filtered.vcf.gz \
  --indep-pairwise 50 10 0.2 \
  --out cohort.ld_pruned

# 步骤 2：提取剪枝后独立位点并生成用于 PCA 和 ADMIXTURE 的二进制 BED 格式
plink \
  --vcf cohort.filtered.vcf.gz \
  --extract cohort.ld_pruned.prune.in \
  --make-bed \
  --pca 10 \
  --out cohort.core

# 步骤 3：多 K 值循环并行运行 ADMIXTURE 并计算 CV error
for K in {2..6}; do
  admixture --cv=5 -j8 cohort.core.bed $K | tee log_K${K}.out
done

# 步骤 4：提取 CV error 绘制评估折线
grep -h "CV error" log_K*.out
```

---

## 植物应用案例与真实文献证据

1. **3,010 份亚洲栽培稻群体架构与驯化分化**：
   在著名的 3,010 份水稻全基因组泛基因组研究中，作者利用 PLINK 进行全基因组双重 LD 剪枝获得核心 SNP 标记，在 ADMIXTURE 中测试 $K=2 \sim 15$。CV error 分析清晰证实了 $K=9$ 达到最佳预测稳态，全面将亚洲栽培稻划分为五大传统亚群（籼稻 *indica*、温带粳稻 *temperate japonica*、热带粳稻 *tropical japonica*、芳香稻 *aromatic* 和深水稻 *aus*）及进一步的生态亚类，为全球水稻基因库奠定了分类规范（[Wang et al., *Nature*, 2018](https://doi.org/10.1038/s41586-018-0063-9)）。
2. **栽培大豆与野生大豆（*Glycine soja*）渐渗分析**：
   通过 PCA 将东亚栽培大豆与野生祖先种投影，PC1 轴清晰隔离野生与栽培群体，而部分农家地方品种在 PC1 与 PC2 散点图中呈现介于野生与育成品种之间的线性格局，配合 ADMIXTURE 揭示出野生大豆向农家品种频繁发生的古渐渗杂交事件。

---

## 实践规范与质控要点

| 分析环节 | 核心标准与参数建议 | 常见陷阱与科学纠正 |
| :--- | :--- | :--- |
| **LD 剪枝生命线** | 必须执行 `--indep-pairwise 50 10 0.2` | 未做 LD 剪枝，大片段倒位或着丝粒高连锁区主导前几主成分造成假分层 |
| **多倍体与自交自交系** | 对严格纯合自交系，基因型多为纯合，需注意等位平衡设定 | 误将自交群体的极低杂合度当作测序错误过度剔除 |
| **K 值选择客观性** | 严禁凭主观先验只运行单一 $K$ 值 | 必须展示从 $K=2$ 到 $K=8$ 的完整 CV 曲线与堆叠图演进过程 |
| **监督模型模式** | 探索未知群体时使用无监督模式；溯源时可加 `-s` 监督模式 | 探索性研究误加先验监督标签，导致人工偏倚掩盖新亚群 |

---

## 延伸阅读与前置依赖

- **前置依赖**：变异位点过滤与高质量双等位 SNP 提取（详见 [M05-Topic-02 SNP 检测、过滤与 VCF](../../population-genetics/m05-topic-02/)）。
- **核心算法工具**：[PLINK 官方手册与主成分分析参数指南](../../../methods/plink/)。
- **群体建模工具**：[ADMIXTURE 拟牛顿优化与多线程加速全解析](../../../methods/admixture/)。
- **后续承接专题**：核苷酸多样性、群体分化与连锁不平衡（详见 [M05-Topic-04 遗传多样性、群体分化与连锁不平衡](../../population-genetics/m05-topic-04/)）。
