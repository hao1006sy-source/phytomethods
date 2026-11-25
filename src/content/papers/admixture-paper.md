---
title: "Fast model-based estimation of ancestry in unrelated individuals"
summary: "提出基于最大似然、交替块松弛与拟牛顿加速的高性能个体祖先成分与群体结构推断算法 ADMIXTURE。"
authors: "Alexander DH, Novembre J, Lange K"
year: 2009
journal: Genome Research
doi: 10.1101/gr.094052.109
type: method
methodIds: [admixture]
domainIds: [population-genetics]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

# Fast model-based estimation of ancestry in unrelated individuals: ADMIXTURE

## 1. 研究背景与算法贡献

在群体遗传学、分子生态学以及全基因组关联分析（GWAS）中，准确解析样本群体的宏观**遗传结构（Population Structure）** 与推断个体的**祖先成分混合比例（Ancestry Proportions）** 是最基础且关键的分析步骤。经典算法 **STRUCTURE**（Pritchard et al. 2000）确立了基于贝叶斯多项混合模型的标准理论，但其依赖极其繁重的马尔可夫链蒙特卡洛（MCMC）后验抽样算法。在面对数十万个高通量 SNP 芯片标记或全基因组重测序大数据集时，STRUCTURE 计算极其缓慢，完成一次参数收敛往往需要数周乃至数月，成为高通量基因组学时代的严重算力瓶颈。

加利福尼亚大学洛杉矶分校（UCLA）的 David H. Alexander、John Novembre 与 Kenneth Lange 在 2009 年推出了 **ADMIXTURE**（发表于 *Genome Research*）。ADMIXTURE 的核心学术与算法创新包括：
- **同等模型，全新求解范式**：完全继承了 STRUCTURE 经典的二项/多项混合概率似然模型，但彻底摒弃了 MCMC 抽样，创新性地采用**最大似然点估计（Maximum Likelihood Estimation, MLE）**；
- **交替块松弛与序列二次规划（SQP）加速**：将极高维度的参数矩阵解耦为交替更新的子问题，并引入大型拟牛顿法（Quasi-Newton Acceleration）；
- **算力提升数百倍**：在保持与 STRUCTURE 统计推断结果高度一致（甚至精度更优）的前提下，将数十万标记全基因组分析时间缩短至数十分钟，确立了全球群体结构分析的工业级通用基准。

---

## 2. 核心数学模型与数据结构

### 2.1 最大似然多项混合概率模型

设包含 $I$ 个个体与 $J$ 个独立的双等位基因 SNP 标记，假定群体由 $K$ 个未知的祖先成分（Ancestral Populations）混合而成。
个体 $i$ 在标记 $j$ 处的等位基因型计数记为 $g_{ij} \in \{0, 1, 2\}$（突变等位基因拷贝数），模型假定其服从二项分布：
$$g_{ij} \sim \text{Binomial}\left(2, p_{ij}\right)$$

其中成功概率 $p_{ij}$ 为个体在各个祖先成分中的血统比例与对应成分等位基因频率的线性加权和：
$$p_{ij} = \sum_{k=1}^K q_{ik} f_{kj}$$

参数矩阵定义：
- **$Q$ 矩阵（大小为 $I \times K$）**：$q_{ik}$ 为个体 $i$ 来源于第 $k$ 个祖先成分的血统比例，满足非负性约束 $q_{ik} \ge 0$ 且行和归一化 $\sum_{k=1}^K q_{ik} = 1$；
- **$F$ / $P$ 矩阵（大小为 $K \times J$）**：$f_{kj}$ 为第 $k$ 个祖先成分在标记 $j$ 处的等位基因频率，满足概率约束 $0 \le f_{kj} \le 1$。

全基因组的对数似然函数为：
$$\mathcal{L}(Q, F) = \sum_{i=1}^I \sum_{j=1}^J \left[ g_{ij} \log p_{ij} + (2 - g_{ij}) \log(1 - p_{ij}) \right]$$

### 2.2 交替块优化（Block Relaxation）与序列二次规划（SQP）

由于同时对 $Q$ 和 $F$ 联合求极大似然为非凸高维优化问题，ADMIXTURE 采用交替块松弛策略：
1. **固定 $F$ 求解 $Q$**：此时全问题被彻底解耦为 $I$ 个彼此独立的凸优化子问题，每个个体的更新仅取决于其自身基因型；利用二次逼近（Sequential Quadratic Programming, SQP）快速求解带约束极值；
2. **固定 $Q$ 求解 $F$**：全问题被解耦为 $J$ 个彼此独立的凸优化子问题，各标记的等位基因频率更新完全并行；
3. **拟牛顿长期割线加速（Quasi-Newton Acceleration）**：利用前后两次迭代的梯度差分向量动态近似 Hessian 逆矩阵，极大跨步推进参数更新，将原本需要数千步的一阶梯度下降压缩至数十步内收敛。

---

## 4. 植物基因组学应用场景与科研价值

植物具有极其漫长复杂的驯化历史，伴随频繁的远缘杂交与渐渗事件：
- **水稻超级多样性群体的祖先成分解析**：在国际著名的水稻 3010 份基因组计划中，ADMIXTURE 是划分水稻主要亚群（籼稻 *indica*、粳稻 *japonica*、奥斯 *aus*、芳香稻 *aromatic*）以及鉴定中间型渗入农家种的核心标准工具；
- **农作物驯化过程中的野生渐渗（Introgression）鉴定**：评估现代玉米自交系中是否渗入了野生大刍草（Teosinte）的基因组片段，或栽培大豆中保留的野生大豆祖先血统比例；
- **为 GWAS 提供宏观群体结构协变量（$Q$ 矩阵）**：输出的 `.Q` 矩阵是输入经典 $Q+K$ 混合线性模型以消除全基因组关联假阳性的黄金协变量。

---

## 6. 阅读与复现资源

- **原始研究论文**：[Genome Research 2009 DOI: 10.1101/gr.094052.109](https://doi.org/10.1101/gr.094052.109)
- **PubMed 记录**：[PMID: 19648217](https://pubmed.ncbi.nlm.nih.gov/19648217/)
- **ADMIXTURE 官方发布主页**：[ADMIXTURE Official Website](https://dalexander.github.io/admixture/)
- **站内配套专题**：[群体遗传结构与主成分分析](../../topics/population-genetics/m05-topic-03/)
- **站内配套专题**：[群体遗传变异与分化统计指标](../../topics/population-genetics/m05-topic-01/)
