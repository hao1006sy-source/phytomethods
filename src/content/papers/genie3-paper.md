---
title: "Inferring Regulatory Networks from Expression Data Using Tree-Based Methods"
summary: "提出基于树集成特征选择（随机森林与 Extra-Trees）的基因调控网络（GRN）有向拓扑无偏推断算法 GENIE3。"
authors: "Huynh-Thu VA, Irrthum A, Wehenkel L, Geurts P"
year: 2010
journal: PLOS ONE
doi: 10.1371/journal.pone.0012776
type: method
methodIds: [genie3]
domainIds: [regulatory-genomics-ai]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

# Inferring Regulatory Networks from Expression Data Using Tree-Based Methods: GENIE3

## 1. 研究背景与算法贡献

从大规模高通量基因表达数据中逆向重建**基因调控网络（Gene Regulatory Networks, GRN）** 是计算系统生物学的核心圣杯任务。传统的统计推断方法（如基于线性相关的相关系数网络、偏相关网络或基于互信息 Relevance Networks/ARACNE）长期面临两大理论困境：
1. **难以捕获非线性复杂调控模式**：转录因子对靶基因的调控常包含协同激活、协同阻遏、饱和阈值开关等高度非线性的逻辑交互，简单的相关性指标容易漏判；
2. **缺乏网络有向性（Directionality）**：无向网络无法明确指示两个具有表达同步性的基因究竟哪一个是上游调控因子（Regulator / TF），哪一个是下游受调控靶基因（Target Gene）。

比利时列日大学的 Vân Anh Huỳnh-Thu、Alexandre Irrthum、Louis Wehenkel 与 Pierre Geurts 在 2010 年推出了 **GENIE3**（GEne Network Inference with Ensemble of trees，发表于 *PLOS ONE*）。GENIE3 的核心理论创新在于**将高维全网络有向拓扑推断解耦为 $p$ 个独立的非参数特征选择回归子问题**：
- 对基因组中的每一个靶基因，训练一个基于树集成回归（随机森林 Random Forest 或极端随机树 Extra-Trees）的非线性预测模型；
- 将候选调控因子（如已知转录因子列表）作为输入特征，以特征在树节点分裂中的不纯度减少贡献作为特征重要度（Feature Importance）；
- 将所有靶基因的局部特征重要度汇总排序，输出全局有向加权调控边列表。在著名的 **DREAM4 和 DREAM5 全球基因网络推断盲测挑战赛**中，GENIE3 连续荣获综合表现第一名，奠定了树模型网络推断的学术基石。

---

## 2. 核心数学模型与数据结构

### 2.1 逐靶基因特征选择回归分解

设表达矩阵包含 $p$ 个基因与 $N$ 个观测样本。GENIE3 将网络推断任务分解为 $p$ 个并行的监督学习子任务：
- 对于第 $j$ 个目标基因（Target Gene $j \in \{1,\dots,p\}$），其表达量向量作为响应变量 $y_j = (x_{1j}, \dots, x_{Nj})^T$；
- 其余全部候选转录因子集合（或全基因组中除了 $j$ 本身以外的所有基因）作为自变量特征矩阵 $X_{-j}$；
- 训练一个非参数回归函数模型：
  $$y_j = f_j(X_{-j}) + \epsilon_j$$

### 2.2 基于方差减少量（Variance Reduction）的特征重要性量化

在构建决策树集合（通常包含 500–1000 棵树）时，对于单个决策树中的每个内部节点 $S$，算法寻找能够使当前节点样本目标方差减少最大的最优特征与分裂点：
$$\Delta V(S, \text{TF}_i) = V(S) - \frac{|S_L|}{|S|} V(S_L) - \frac{|S_R|}{|S|} V(S_R)$$

其中 $V(S)$ 为节点 $S$ 中靶基因表达量的样本方差。

特征 $\text{TF}_i$ 对预测靶基因 $j$ 的总特征重要度 $w(\text{TF}_i \to \text{Target}_j)$ 定义为在森林中所有使用 $\text{TF}_i$ 进行分裂的节点方差减少量的加权总和：
$$w(\text{TF}_i \to \text{Target}_j) = \sum_{T \in \text{Forest}} \sum_{S \in T, v(S) = \text{TF}_i} \Delta V(S, \text{TF}_i)$$

重要度得分天然具备不对称性，即 $w(\text{TF}_a \to \text{Target}_b) \neq w(\text{TF}_b \to \text{Target}_a)$，从而赋予了调控边明确的有向性与因果优先级。

### 2.3 全网调控边归一化与排序

所有 $p$ 个模型训练完成后：
- 将每一行或每个靶基因模型的特征重要性进行全网统合；
- 输出一个大小为 $|\text{TFs}| \times |\text{Targets}|$ 的调控权重矩阵；
- 按照权重从大到小对全网可能存在的调控边进行降序排列，研究人员可通过设定权重阈值或边数阈值（如 Top 10,000 条边）提取高置信度调控网络。

---

## 3. 算法复杂度与计算性能

1. **计算复杂度**：对于 $p$ 个基因、$N$ 个样本和 $T$ 棵决策树，时间复杂度约为 $O(p \cdot T \cdot \sqrt{M} \cdot N \log N)$（$M$ 为候选调控因子数）。
2. **天然易并行的计算架构（Embarrassingly Parallel）**：由于每个靶基因的回归模型完全相互独立，GENIE3 支持通过多核 CPU 进行分布式并行加速。
3. **算法健壮性**：树集成方法对转录组数据中的非线性饱和、单调转换（如 log 转换与否）高度不敏感，且对离群极值具有天然的免疫力。

---

## 4. 植物基因组学应用场景与科研价值

植物具有极其庞大且多样的转录因子家族（占植物基因组编码基因的 5%–10%），调控关系高度交织：
- **植物核心抗逆转录回路从头重建**：例如在水稻或玉米干旱胁迫转录组数据中，输入已知的植物转录因子列表（如 bZIP、WRKY、NAC、MYB 等），GENIE3 能够无偏挖掘出位于调控层级顶端的“主调控因子（Master Regulators）”及其下游直接激活的靶基因富集网络；
- **与非编码调控元件实验证据结合**：将 GENIE3 预测的有向边与 DAP-seq、ChIP-seq 或 ATAC-seq 结合位点进行交集验证，能够大幅过滤间接调控假象，构建出高精度的植物物理调控金标准网络；
- **分生组织细胞分化转录级联**：解析干细胞向成熟表皮或导管分子分化过程中逐级激活的级联转录开关。

---

## 5. 输入输出规范与关键参数指南

### 5.1 核心分析流程与执行代码 (R / Bioconductor)
```R
library(GENIE3)

# 1. 准备标准归一化的表达矩阵 (行: 基因, 列: 样本)
exprMatrix <- as.matrix(read.table("plant_norm_expr.txt", header = TRUE, row.names = 1))

# 2. 准备候选转录因子列表 (可选, 强烈建议提供以提速并聚焦调控因子)
plant_tfs <- readLines("plant_transcription_factors.txt")

# 3. 运行 GENIE3 树集成调控网络推断 (推荐使用 Random Forest 模式)
set.seed(42)
weightMatrix <- GENIE3(
  exprMatrix,
  regulators = plant_tfs,
  treeMethod = "RF",      # 可选 "RF" (Random Forest) 或 "ET" (Extra Trees)
  K = "sqrt",             # 每个节点分裂候选特征数
  nTrees = 1000,          # 每个靶基因森林树数目
  nCores = 16,            # 多线程并行核心数
  verbose = TRUE
)

# 4. 提取全网调控边排序列表 (包含 fromNode, toNode, weight)
linkList <- getLinkList(weightMatrix)

# 5. 筛选最高置信度的 Top 5000 条调控边
topLinks <- linkList[1:5000, ]
```

### 5.2 关键参数说明
- `regulators`：候选调控因子 ID 向量。若不提供则将全基因组每个基因都作为其他基因的候选调控因子，计算耗时显著增加。
- `treeMethod = "RF"`：树集成类型。`"RF"` 准确率更优；`"ET"`（Extra Trees）训练速度更快。
- `nTrees = 1000`：树的数量，设置在 500 至 1000 能够确保特征重要性排名的统计稳定性。

---

## 6. 阅读与复现资源

- **原始研究论文**：[PLOS ONE 2010 DOI: 10.1371/journal.pone.0012776](https://doi.org/10.1371/journal.pone.0012776)
- **PubMed 记录**：[PMID: 21002644](https://pubmed.ncbi.nlm.nih.gov/21002644/)
- **Bioconductor 软件包**：[GENIE3 on Bioconductor](https://bioconductor.org/packages/release/bioc/html/GENIE3.html)
- **Aerts 实验室开源实现**：[aertslab/GENIE3 GitHub](https://github.com/aertslab/GENIE3)
- **站内配套专题**：[基因表达调控与转录组动力学](../../topics/regulatory-genomics-ai/m09-topic-03/)
- **站内配套专题**：[转录因子与顺式调控元件分析](../../topics/regulatory-genomics-ai/m09-topic-01/)
