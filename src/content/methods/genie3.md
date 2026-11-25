---
title: GENIE3
name: GENIE3
summary: 将全基因组调控网络推断解耦为逐基因树集成回归任务，利用随机森林与极端随机树的特征不纯度衰减量定量评估非线性转录调控边。
dataType: 基因表达矩阵与候选植物转录因子 (TF) 列表
principle: 树集成回归特征重要性、非线性调控解耦、MDI 方差不纯度衰减与调控权重排序
domainIds: [regulatory-genomics-ai]
topicIds: [m09-topic-03]
principleIds: [tree-ensemble-regression]
dataIds: [expression-matrix]
paper: genie3-paper
repository: https://github.com/aertslab/GENIE3
version: "1.24.0"
status: published
updatedAt: 2026-11-25
---

## 软件定位与核心科学问题

在植物生命活动中，转录因子（Transcription Factors, TFs）构成了调控发育程序、形态发生以及环境胁迫适应的核心分子网络。从大样本量的转录组表达数据中逆向重建基因调控网络（Gene Regulatory Networks, GRNs），对于发现关键农艺性状主效调控基因至关重要。

然而，传统的共表达网络（如基于 Pearson 相关的 WGCNA）面临两大固有缺陷：
1. **只能捕捉对称的无向线性相关**：无法揭示转录因子作为“控制源”对下游靶基因的非对称调控作用（即 $A$ 调控 $B$ 不等于 $B$ 调控 $A$）；
2. **难以建模复杂的非线性调控行为**：植物体内广泛存在协同结合、转录饱和阈值以及多因子组合逻辑门（AND/OR 门），线性模型会导致大量假阴性；
3. **贝叶斯网络的维数灾难**：全基因组尺度包含上万个基因，基于有向无环图（DAG）的精确贝叶斯网络推断属于 NP-hard 问题，无法扩展至真实植物基因组。

为了突破这一瓶颈，Huynh-Thu 等开发了 **GENIE3（GEne Network Inference with Ensemble of trees）** 算法。该方法在国际著名的 DREAM4 和 DREAM5 基因网络逆向推断挑战赛中拔得头筹，成为基于树集成特征重要性推断有向调控网络的奠基性算法。

---

## 核心算法原理与数学推导

```
  [植物全转录组表达矩阵 (Samples × Genes)]  +  [候选转录因子列表 (TF List)]
                                 │
                                 ▼
           全基因组网络问题解耦为 p 个独立的单靶基因回归任务
                                 │
           ┌─────────────────────┼─────────────────────┐
           ▼                     ▼                     ▼
     靶基因 g_1 树回归      靶基因 g_2 树回归      靶基因 g_p 树回归
     [输入: 其余候选 TFs]   [输入: 其余候选 TFs]   [输入: 其余候选 TFs]
           │                     │                     │
           ▼                     ▼                     ▼
     拟合随机森林/Extra-Trees (构建 T 棵二叉决策回归树)
           │                     │                     │
           ▼                     ▼                     ▼
     计算 MDI 特征重要性    计算 MDI 特征重要性    计算 MDI 特征重要性
     w(TF_k -> g_1)        w(TF_k -> g_2)        w(TF_k -> g_p)
           │                     │                     │
           └─────────────────────┬─────────────────────┘
                                 ▼
               全网非对称调控权重矩阵 W (p × p)
                                 │
                                 ▼
               全局降序排列与调控边显著性截断
```

### 1. 全基因组推断任务解耦 (Problem Decomposition)

假设表达矩阵包含 $N$ 个样本和 $p$ 个基因（设其中 $K$ 个动植物基因被先验注释为转录因子，通常 $K \le p$）。

GENIE3 将极其复杂的全网联合概率推断问题，数学解耦为 $p$ 个完全独立的单靶基因非参数回归子任务。对于每一个选定的靶基因 $g_j$（$j = 1, \dots, p$），其在各样本中的表达量向量为 $\mathbf{y}_j = (y_{1j}, y_{2j}, \dots, y_{Nj})^T$。其余所有候选转录因子（排除自身，若自身也是 TF）构成的预测变量矩阵为 $\mathbf{X}_{-j} \in \mathbb{R}^{N \times (K - 1)}$。

目标是拟合一个能够刻画任意复杂非线性关系的回归函数 $f_j$：
$$y_{ij} = f_j(\mathbf{x}_{i, -j}) + \varepsilon_{ij}, \quad i = 1, \dots, N$$

### 2. 树集成回归拟合 (Random Forest & Extra-Trees)

GENIE3 采用非参数的树集成模型拟合 $f_j$：
- **随机森林（Random Forest, RF）**：引入 Bagging 自助采样，并在每个分裂节点随机抽取 $m_{\text{try}}$ 个特征，根据均方误差（MSE）最小化寻找最优分裂阈值；
- **极端随机树（Extra-Trees, ET）**：使用全部样本（无放回），且在每个节点对每个抽取的特征随机选择分裂切分点，计算速度大幅快于随机森林，方差衰减更强，是 GENIE3 推荐的默认模式。

### 3. 平均不纯度衰减 (Mean Decrease Impurity, MDI) 与调控重要性计算

在构建好的每一元决策树 $t$（共 $T$ 棵树）中，每次选择某个候选转录因子 $TF_k$ 作为分裂特征时，该节点样本子集 $S$ 的表达方差都将发生下降。

设节点 $v$ 的样本数为 $N_v$，其被切分为左子节点 $v_L$（样本数 $N_{v_L}$）和右子节点 $v_R$（样本数 $N_{v_R}$）。该次分裂带来的方差不纯度减少量（Variance Reduction）定义为：
$$\Delta I(v) = N_v \text{Var}(S_v) - N_{v_L} \text{Var}(S_{v_L}) - N_{v_R} \text{Var}(S_{v_R})$$
其中样本方差 $\text{Var}(S) = \frac{1}{|S|} \sum_{i \in S} (y_i - \bar{y}_S)^2$。

特征 $TF_k$ 对预测靶基因 $g_j$ 的全局调控权重 $w(TF_k \to g_j)$ 定义为所有决策树中以该特征为分裂依据的节点不纯度减少量的总和均值：
$$w(TF_k \to g_j) = \frac{1}{T} \sum_{t=1}^T \sum_{v \in \mathcal{V}_t: \text{split}(v) = TF_k} \Delta I(v)$$

### 4. 全网权重归一化与排序

由于每个靶基因模型的方差尺度可能不同，GENIE3 对每个靶基因的输出权重进行归一化：
$$\tilde{w}(TF_k \to g_j) = \frac{w(TF_k \to g_j)}{\sum_{k'} w(TF_{k'} \to g_j)}$$
最后，汇集所有 $p$ 个子模型输出的权重，构建全基因组非对称有向权重矩阵 $W \in \mathbb{R}^{K \times p}$。矩阵中每一项的大小严格代表调控因子对靶基因表达预测的重要性排位。

---

## 植物应用特殊考量与先验约束

| 植物组学特殊性 | 潜在计算与生物学风险 | 针对性应对策略 |
| :--- | :--- | :--- |
| **庞大的转录因子家族与全基因扫描开销** | 植物基因组中约有 5%~10% 为转录因子（如玉米、大豆含有 2,000~3,000 个 TF，包含 WRKY、NAC、MYB、MADS-box 等大类）。若不指定 TF 列表，算法将对全部 30,000+ 个基因执行全对全树回归，计算时间以月计。 | **必须提供精选的先验 TF 列表**：从 PlantTFDB、PlnTFDB 或基因组功能注释中提取明确的 TF 基因 ID，调用 `regulators` 参数进行约束，将计算量直接压缩至原本的 1/20。 |
| **表达关联不等于物理结合** | 树回归的高重要性分数仅表示表达层面的预测能力，可能源于非直接的级联调控（如 $TF_A \to TF_B \to Gene_C$，模型可能将 $TF_A$ 误判为直接调控 $Gene_C$）。 | 必须联合下游 DNA 序列基序（Motif）扫描工具（如 MEME/FIMO）或 ChIP-seq/DAP-seq 证据进行剪枝（Pruning），构建高置信度的顺式调控直接结合网络。 |
| **无调控符号（无法区分激活或抑制）** | MDI 特征重要性是基于方差减少量计算的非负标量，天然不包含“激活（+）”或“抑制（-）”的调控极性。 | 在提取高权重边后，可计算转录因子与靶基因之间的 Spearman 秩相关系数符号 $\text{sign}(r)$，作为边的符号标注（正相关为激活，负相关为抑制）。 |

---

## 典型分析命令与标准操作流

以下为在 R 4.3+ 环境中运行 `GENIE3` 的标准分析范式：

```r
library(GENIE3)

# 1. 载入植物基因表达矩阵 (已完成 VST 或 Log-TPM 标准化)
# 格式要求: 行为基因 (Gene ID)，列为测序样本 (Sample ID)
expr_mat <- as.matrix(read.csv("corn_vst_counts.csv", row.names = 1))

# 2. 载入植物特异性转录因子列表 (从 PlantTFDB 提取)
plant_tfs <- scan("corn_plant_tfdb_ids.txt", what = "character")
valid_tfs <- intersect(plant_tfs, rownames(expr_mat))

cat(sprintf("输入总基因数: %d; 有效输入候选转录因子数: %d\n", 
            nrow(expr_mat), length(valid_tfs)))

# 3. 运行 GENIE3 树集成调控推断
# 采用 Extra-Trees 算法, 并行利用 16 个 CPU 核心加速
set.seed(42)
weight_matrix <- GENIE3(
  expr_mat,
  regulators = valid_tfs,      # 限制输入特征仅为先验 TF
  treeMethod = "ET",            # ET: 极端随机树 (速度更快); RF: 随机森林
  K = "sqrt",                   # 节点随机抽取的特征数: sqrt(p)
  nTrees = 1000,                # 决策树数量
  nCores = 16,
  verbose = TRUE
)

# 4. 提取并按权重降序排列所有候选调控边 (Link List)
link_list <- getLinkList(weight_matrix)
colnames(link_list) <- c("regulatory_gene", "target_gene", "weight")

# 5. 筛选前 0.1% 高置信度显著候选边
top_edges <- link_list[link_list$weight > quantile(link_list$weight, 0.999), ]

# 6. 计算 Spearman 相关性以补充调控符号 (激活 vs 抑制)
edge_cors <- sapply(1:nrow(top_edges), function(idx) {
  tf_id <- top_edges$regulatory_gene[idx]
  target_id <- top_edges$target_gene[idx]
  cor(expr_mat[tf_id, ], expr_mat[target_id, ], method = "spearman")
})
top_edges$mode <- ifelse(edge_cors > 0, "Activation", "Repression")
top_edges$cor <- edge_cors

# 导出网络边表供 Cytoscape 可视化
write.table(top_edges, "corn_top_regulatory_network.tsv", 
            sep = "\t", quote = FALSE, row.names = FALSE)
```

---

## 科学研究案例与上下游分析协同

- **拟南芥整合基因调控网络 (iGRN) 建设案例**：在拟南芥多组学基因调控网络构建研究中，研究者综合了数千个微阵列与 RNA-seq 样本，采用树集成算法从大规模表达共变中提取非线性调控边，并结合 ChIP-seq、DAP-seq 与 PWM 序列基序完成了网络修剪与拓扑分析，成功预测了多个参与侧根发生与花器官分化的核心主效调控因子；
- **分析工具链流转界定**：
  - **上游工具输入**：RNA-seq 测序计数经 DESeq2 或 Scanpy 预过滤、大小因子归一化和方差稳定变换后，直接作为连续表达量输入；
  - **横向替代与扩展**：针对单细胞转录组（如 50,000+ 细胞）的大规模表达矩阵，GENIE3 的 R 语言原生计算效率将成为瓶颈，此时应无缝切换为下一代分布式梯度提升树框架 **GRNBoost2 / Arboreto**。
