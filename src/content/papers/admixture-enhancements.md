---
title: "Enhancements to the ADMIXTURE algorithm for individual ancestry estimation"
summary: "提出 ADMIXTURE 的五折交叉验证误差（CV error）最优 K 值选择、移动区块 Bootstrap 标准误与监督估计扩展算法。"
authors: "Alexander DH, Lange K"
year: 2011
journal: BMC Bioinformatics
doi: 10.1186/1471-2105-12-246
type: method
methodIds: [admixture]
domainIds: [population-genetics]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

# Enhancements to the ADMIXTURE algorithm for individual ancestry estimation

## 1. 研究背景与算法贡献

在 2009 年 ADMIXTURE 基础最大似然算法推出后，科研人员在将该工具应用于复杂的动植物自然群体演化分析时，普遍面临数个关键的方法学挑战：
1. **最佳祖先成分数 $K$ 的客观抉择缺乏理论标准**：传统方法只能凭借主观经验观察或依赖极其耗时的贝叶斯证据边际似然估计；
2. **缺乏严格的统计学不确定性度量**：最大似然点估计只给出了单一点估计值，无法提供祖先比例系数的标准误（Standard Errors）与置信区间；
3. **无法有效融入先验已知的纯系参考标签**：在杂交渗入分析中，研究人员通常已知某些代表性亲本（如标准纯系农家种或野生祖先种）的先验血统标签，非监督模型会由于全群体重估计导致参考群体标签发生漂移。

加利福尼亚大学洛杉矶分校（UCLA）的 David H. Alexander 与 Kenneth Lange 在 2011 年推出了 **ADMIXTURE 算法增强版（Enhancements to ADMIXTURE）**（发表于 *BMC Bioinformatics*）。该论文对原有算法进行了四项重大的理论与功能拓展：
- **基于留出交叉验证（Cross-Validation, CV）的客观 $K$ 值选择机制**；
- **考虑连锁不平衡相关性的移动区块 Bootstrap（Block-Moving Bootstrap）标准误估计**；
- **引入参考种群标签的监督与半监督学习模式（Supervised Estimation）**；
- **用于防止过度拟合稀疏成分的惩罚性最大似然估计（Penalized Estimation）** 以及全面的多核多线程 OpenMP 并行支持。

---

## 2. 核心数学模型与数据结构

### 2.1 留出交叉验证误差（Cross-Validation Error）与最优 $K$ 准则

为了客观确定最佳祖先成分数 $K$：
- ADMIXTURE 将全基因组所有被观测到的非缺失基因型矩阵元素随机无放回划分为 $V$ 折（默认 $V = 5$ 折）；
- 在每一轮交叉验证中，将其中一折的基因型人为标记为“缺失（Masked）”，在剩余数据上运行最大似然模型求解 $Q$ 与 $F$ 矩阵；
- 利用求解出的参数，对被留出的掩码测试位点计算基于二项分布预测概率的**交叉验证预测误差（CV Error）**：
  $$\text{CV Error} = -\frac{1}{N_{\text{masked}}} \sum_{(i, j) \in \text{Masked}} \left[ g_{ij} \log \hat{p}_{ij} + (2 - g_{ij}) \log(1 - \hat{p}_{ij}) \right]$$
- **模型选择准则**：在不同的 $K$ 取值（如 $K = 2$ 至 $K = 10$）下绘制 CV Error 曲线。通常选择使交叉验证预测误差达到**全局极小值点（Minimum CV Error）** 或拐点（Elbow）的 $K$ 作为最符合数据泛化能力的最优模型聚类数。

### 2.2 移动区块自举法（Moving-Blocks Bootstrap）标准误

常规独立位点 Bootstrap 假设所有标记完全独立，在残余连锁不平衡（LD）存在时会导致标准误被严重低估。ADMIXTURE 实现了基于物理距离的移动区块 Bootstrap：
- 将染色体划分为包含数千个连续 SNP 的滑动物理区块（Block Size，通常基于物种 LD 衰减距离设定为数百 kb 至数 Mb）；
- 以区块为单位进行有放回的随机重抽样，重复 $B$ 次（例如 $B = 200$）；
- 每次抽样重新拟合模型，从自举经验分布中直接计算每个个体祖先成分比例 $q_{ik}$ 的标准误（SE）与 95% 置信区间，赋予点估计严谨的统计学置信度。

### 2.3 监督与半监督估计（Supervised Learning）

在实际研究中，若某些样本（如标准野生稻或核心纯系亲本）的祖先身份百分之百确定：
- 用户可通过配套的 `.pop` 标签文件为已知样本指定参考群体名称，未知样本标记为 `-`；
- 在监督模式下，参考样本的 $Q$ 向量被强制固定为二值化常数（如纯系对应成分为 1，其余成分为 0）；
- 算法仅在参考样本上求解各群体的纯净等位基因频率矩阵 $F$，并在未知样本上高效求解其混合渗入比例 $Q$，彻底避免了参考样本被杂交后代反向稀释的偏倚。

---

## 3. 算法复杂度与计算性能

1. **计算性能与多线程**：通过 OpenMP 原生支持多处理器多核心并发（参数 `-j`），在大规模多样本数据集上，多线程加速比接近线性。
2. **内存消耗与标准误开销**：运行一次完整的 `--cv` 仅需多耗费数倍的标准估计时间，无需额外的磁盘写入开销。
3. **惩罚估计（Penalized Estimation）**：向对数似然目标中添加 $L_1$ 稀疏惩罚项，能够强制将微弱的极小背景噪声成分精确收缩为 0，防止将同一亚群过度拆分为无意义的碎片成分。

---

## 4. 植物基因组学应用场景与科研价值

植物多样性研究面临复杂的野生物种演化背景与人工杂交渐渗历史：
- **作物品种资源最优 $K$ 值的客观确定**：在分析数百至数千份水稻、玉米、小麦种质资源时，避免科研人员凭借主观肉眼臆断分类，利用 `--cv` 误差极小点提供具有数学说服力的亚群分化数目；
- **农家种与现代培育品种的定点渐渗追踪（监督模式）**：以野生祖先种与核心受体亲本作为监督参考样本（Supervised References），高精度评估现代改良品系中野生渐渗片段的真实血统比例；
- **渐渗渗入比例的统计置信度评估**：利用移动区块 Bootstrap 汇报每个材料祖先成分的 95% 置信区间，严格区分微量真实渐渗与测序随机误差。

---

## 5. 输入输出规范与关键参数指南

### 5.1 核心分析流程与执行命令 (Bash)
```bash
# 1. 运行带 5 折交叉验证的多 K 值扫描 (从 K=2 到 K=8)
for K in 2 3 4 5 6 7 8; do
  admixture --cv -j16 plant_pruned.bed $K | tee log_K${K}.txt
done

# 2. 从日志中提取各个 K 对应的交叉验证误差 (CV error) 并寻找极小值点
grep -h "CV error" log_K*.txt
# 输出示例: CV error (K=4): 0.3842 (最优点)

# 3. 在最优 K 下使用移动区块 Bootstrap 计算标准误 (B=200 次重抽样)
admixture -B200 -j16 plant_pruned.bed 4
# 生成 plant_pruned.4.Q_se 与 plant_pruned.4.P_se 标准误文件

# 4. 运行监督估计模式 (输入配套的 plant_pruned.pop 文件)
# plant_pruned.pop 每行对应一个样本，纯系标记为 "Wild" 或 "Cultivar"，未知个体填 "-"
admixture --supervised -j16 plant_pruned.bed 2
```

### 5.2 关键参数说明
- `--cv`：开启交叉验证模式，默认 5 折（可通过 `--cv=10` 指定 10 折）。
- `-B200`：执行 200 次移动区块 Bootstrap 检验，生成置信区间与标准误。
- `--supervised`：激活监督学习模式，必须提供与 `.fam` 样本顺序严格一致的 `.pop` 标签文件。

---

## 6. 阅读与复现资源

- **原始研究论文**：[BMC Bioinformatics 2011 DOI: 10.1186/1471-2105-12-246](https://doi.org/10.1186/1471-2105-12-246)
- **PubMed 记录**：[PMID: 21672239](https://pubmed.ncbi.nlm.nih.gov/21672239/)
- **PMC 全文**：[PMC3146885](https://pmc.ncbi.nlm.nih.gov/articles/PMC3146885/)
- **ADMIXTURE 官方发布页**：[ADMIXTURE Manual & Updates](https://dalexander.github.io/admixture/)
- **站内配套专题**：[群体遗传结构与主成分分析](../../topics/population-genetics/m05-topic-03/)
- **站内配套专题**：[群体历史动态与有效群体大小推断](../../topics/population-genetics/m05-topic-06/)
