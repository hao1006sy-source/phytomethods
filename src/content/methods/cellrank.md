---
title: CellRank
name: CellRank
summary: 基于马尔可夫转移核 (Transition Kernels) 与吸收马尔可夫链 (GPCCA) 的单细胞命运概率与分化动态推断软件。
dataType: 单细胞表达矩阵 (AnnData)、RNA 速率 (spliced/unspliced)、拟时序或实验时序数据
principle: 广义 Perron 簇聚类分析 (GPCCA)、连续马尔可夫转移核组合、吸收概率与驱动基因关联
domainIds: [single-cell-spatial-omics]
topicIds: [m08-topic-05]
principleIds: [pseudotime, transition-probability]
dataIds: [single-cell-matrix, expression-matrix]
paper: cellrank2-paper
repository: https://github.com/scverse/cellrank
version: "2.x"
status: published
updatedAt: 2026-11-25
---

## 生物学问题与定位

在植物发育生物学中，植物器官（如根系、侧枝、顶芽）具有贯穿其生命周期的**无限发育可塑性与干细胞多能性**。例如在植物根尖分生组织（RAM）中，静止中心（Quiescent Center, QC）周围的初始干细胞在物理空间和时间的推进下，必须做出精确的命运分枝抉择：分化为表皮细胞、皮层、内皮层，亦或是分化为运输水和养分的导管细胞。

然而，传统的拟时序分析工具（如早期的 Monocle 2/3 或 DPT）存在显著局限：
1. **强行假定单向无环树拓扑**：无法刻画细胞发育中存在的去分化（Dedifferentiation）或双向状态震荡；
2. **极度依赖主观根细胞先验**：若用户错误指定了起始细胞（Root cell），整条拟时序轨迹将被彻底颠倒；
3. **确定性轨迹 vs 概率化抉择**：在干细胞分化分叉点，细胞的分化是随机概率主导的过程，传统工具无法对中间细胞分化为各终末命运的概率进行数学定量。

**CellRank** 由德国慕尼黑亥姆霍兹中心与慕尼黑工业大学 Marius Lange、Michal Klein 和 Fabian Theis 等人开发（初代发表于 *Nature Methods*, 2022；CellRank 2 全面发表于 *Nature Biotechnology*, 2024）。作为单细胞轨迹推断领域的巅峰之作，CellRank 2 创造性地将**多源生物物理转移核（Kernels）**与**吸收马尔可夫链（Absorbing Markov Chains / GPCCA）**深度解耦。无论数据源自 RNA velocity、拟时序、细胞发育潜能（CytoTRACE）还是真实实验时间点，CellRank 均能以严格的数学方程自动推算初始干细胞与终末吸收状态，并为每一个中间细胞精准计算其走向各个分化终点的**命运吸收概率（Fate Probabilities）**。

---

## 核心算法数学原理与推导

CellRank 的数学架构建立在马尔可夫随机过程、谱聚类与吸收概率解析解之上：

### 1. 转移核（Transition Kernels）与行随机矩阵构建

设群体包含 $N$ 个单细胞，其在高维空间构成的连通图邻接矩阵为 $\mathbf{W}$。对于任意细胞 $i$ 及其邻近细胞 $j \in \mathcal{N}(i)$，CellRank 根据生物学证据计算有向跃迁倾向性。

- **基于发育潜能/拟时序的 PseudotimeKernel**：
  设细胞 $i$ 与 $j$ 的拟时序分值分别为 $t_i$ 与 $t_j$。若 $t_j > t_i$（时间向前推移），则赋予较高跃迁概率：
  $$v_{ij} = \frac{t_j - t_i}{d(\mathbf{z}_i, \mathbf{z}_j)}$$
- **基于 RNA 速率的 VelocityKernel**：
  利用剪接/未剪接转录本计算单细胞速度向量 $\mathbf{v}_i$，计算其与高维位移向量 $\mathbf{z}_j - \mathbf{z}_i$ 的皮尔逊相关系数：
  $$w_{ij} = \text{corr}\left( \mathbf{v}_i, \mathbf{z}_j - \mathbf{z}_i \right)$$
- **Softmax 归一化**：
  将多源转移核进行凸组合，并通过 Softmax 映射得到单步有向转移概率矩阵 $\mathbf{P} \in \mathbb{R}^{N \times N}$：
  $$P_{ij} = \frac{\exp(w_{ij} / \sigma)}{\sum_{k \in \mathcal{N}(i)} \exp(w_{ik} / \sigma)}$$
  矩阵 $\mathbf{P}$ 严格满足非负性与行和为 1（行随机矩阵，Row-stochastic Matrix）。

### 2. 广义 Perron 簇聚类分析（GPCCA）与宏观状态识别

转移矩阵 $\mathbf{P}$ 的长周期极限行为由其特征系统主导。根据 Perron-Frobenius 理论，$\mathbf{P}$ 的最大实特征值为 1。

前若干个实部极其接近 1 的特征值对应系统中衰减极慢的亚稳态宏观结构（Metastable Macrostates）。GPCCA（Weber et al., 2004）将这组主特征向量进行几何仿射投影，寻找包围这组坐标的最优极小外接单形（Simplex）：
- 单形的顶点自动且精确地定义了系统的**终末吸收状态（Terminal States, $\mathcal{T}_{\text{abs}}$）**与**初始原始状态（Initial States）**；
- 这一过程完全由纯线性代数驱动，无需人工指定任何根细胞或终点先验。

### 3. 吸收马尔可夫链（Absorbing Markov Chain）与命运概率解析解

一旦确定了终末状态集合，CellRank 将全状态空间重新排列并分块为瞬态子集（Transient states, $\mathcal{T}_{\text{trans}}$）与吸收态子集（Absorbing states, $\mathcal{T}_{\text{abs}}$）：

$$\mathbf{P} = \begin{pmatrix} \mathbf{Q} & \mathbf{R} \\ \mathbf{0} & \mathbf{I} \end{pmatrix}$$

- $\mathbf{Q} \in \mathbb{R}^{n_t \times n_t}$：瞬态中间细胞相互之间的单步转移概率矩阵；
- $\mathbf{R} \in \mathbb{R}^{n_t \times n_a}$：瞬态中间细胞一步跌入各终末吸收态的概率矩阵；
- $\mathbf{I} \in \mathbb{R}^{n_a \times n_a}$：单位矩阵（吸收态不可逆逃逸）。

根据吸收马尔可夫链经典理论，基本矩阵（Fundamental Matrix）为无穷几何级数的收敛和：

$$\mathbf{N} = \sum_{k=0}^{\infty} \mathbf{Q}^k = (\mathbf{I} - \mathbf{Q})^{-1}$$

矩阵元素 $N_{ij}$ 的物理意义为：从瞬态干细胞 $i$ 出发，在被终末吸收之前访问瞬态状态 $j$ 的期望平均步数。

任意瞬态细胞 $i$ 最终被特定终末分化状态 $k \in \mathcal{T}_{\text{abs}}$ 吸收的**全局终末命运吸收概率矩阵（Fate Absorption Probabilities, $\mathbf{B}$）**由线性矩阵方程直接给出闭式解析解：

$$\mathbf{B} = \mathbf{N}\mathbf{R} = (\mathbf{I} - \mathbf{Q})^{-1} \mathbf{R}$$

矩阵中的每个连续数值 $B_{ik} \in [0, 1]$ 极其严谨地刻画了处于分化中途的单个细胞未来发育为目标成熟组织类型 $k$ 的绝对发生概率（且每一行概率和严格为 1.0）。

---

## 生产环境标准流水线

以下展示利用 CellRank 2 在 Python 环境中基于拟时序核（PseudotimeKernel）与 CytoTRACEKernel 组合推断植物根尖终末分化命运与关键调控驱动基因的标准流水线：

```python
import cellrank as cr
import scanpy as sc
import numpy as np

# 步骤 1：读取已完成降维、聚类与 DPT 拟时序计算的 AnnData 对象
adata = sc.read_h5ad("results/rice_root_processed.h5ad")

# 步骤 2：构建多源生物学转移核 (针对植物内含子捕获偏低，优先采用 CytoTRACE 与 DPT 组合)
# CytoTRACEKernel 评估细胞分化潜能 (越原始发育潜能越高)
# PseudotimeKernel 引导细胞沿根尖分化轴向前推移
pk = cr.kernels.PseudotimeKernel(adata, time_key="dpt_pseudotime")
ck = cr.kernels.CytoTRACEKernel(adata)

# 组合转移核：80% 权重赋予拟时序梯度，20% 赋予干细胞潜能
combined_kernel = 0.8 * pk + 0.2 * ck
combined_kernel.compute_transition_matrix()

# 步骤 3：构建 GPCCA 估计器并自动识别终末吸收宏状态 (Terminal States)
g = cr.estimators.GPCCA(combined_kernel)
g.compute_schur(n_components=20)
g.plot_spectrum(real_only=True)

# 自动检出 3 个核心终末吸收态 (如成熟表皮、皮层与木质部)
g.compute_macrostates(n_states=3, n_cells=30)
g.set_terminal_states()

# 步骤 4：闭式求解全基因组单细胞命运吸收概率矩阵 (Fate Probabilities)
g.compute_fate_probabilities()
g.plot_fate_probabilities(same_plot=False, save="results/rice_fate_probabilities.pdf")

# 步骤 5：发掘驱动特定谱系分化的关键转录因子驱动基因 (Lineage Drivers)
drivers = g.compute_lineage_drivers(cluster_key="leiden_res0.6", return_df=True)
top_drivers = drivers.head(10)
print(top_drivers)
```

---

## 核心参数科学解析与植物调优指南

| 参数指令 | 推荐取值 | 物理含义与植物科研注意事项 |
| :--- | :--- | :--- |
| `time_key` | `"dpt_pseudotime"` | **拟时序先验字段**；提供时间箭头方向；在植物中优先推荐基于高可信根原基标记衍生的 DPT 轴。 |
| `n_states` | `3` ~ `6` | **预估终末状态数**；根据植物解剖学结构设定（例如根尖成熟区包含表皮、皮层、中柱等明确终末分支）。 |
| `threshold` | `0.1` ~ `0.2` | **宏状态细胞纯度阈值**；剔除边界模糊的弱关联细胞，确保终末核心状态由最具代表性的典型成熟细胞组成。 |
| `kernel 权重` | `0.8 : 0.2` | **多核融合权重**；结合数据特征灵活调整；若有高置信度代谢标记或时间序列，可加入 `RealTimeKernel`。 |

---

## 植物基因组特有挑战与避坑指南

### 1. 植物内含子捕获率偏低时的“RNA Velocity 陷阱”
- **生化事实与局限**：在哺乳动物中，RNA velocity 广泛依赖剪接前未成熟 pre-mRNA 中的内含子比例。然而在很多植物物种中（如水稻、玉米），成熟 mRNA 迅速剪接且多聚腺苷酸化发生在细胞核内，常规 3' 端单细胞测序捕获到的未剪接读段比例极低（常低于 $5\%$），且植物广泛存在可变剪接和内含子保留（Intron Retention）。
- **严重后果**：若在植物中强行机械套用单纯依赖内含子的 `VelocityKernel`，计算出的速度向量常充满随机布朗运动噪声甚至方向完全逆反！
- **避坑准则**：在植物单细胞分化研究中，**强烈推荐采用 CellRank 2 的 `PseudotimeKernel` 或 `CytoTRACEKernel` 作为主干转移核**，利用发育潜能与多点拟时序构建稳健的单向时间箭头。

---

## 植物应用案例与真实文献证据

1. **水稻根系分生组织多能干细胞分化命运概率定量**：
   在单细胞解析水稻根部分化动力学研究中，研究团队利用 CellRank 2 针对由静止中心向外辐射的分化细胞建立了吸收马尔可夫模型。通过融合拟时序核与细胞潜能核，算法完全自动识别出了成熟外皮层与中柱鞘两个主要终末吸收态，并精准计算出了中间过渡态细胞走向中柱鞘的吸收概率矩阵，成功预测并实验验证了调控木质部导管次生壁加厚的关键 NAC 家族转录因子（*OsVND*）的级联驱动表达趋势。

---

## 实践排错与质控规范

- **错误 1：`compute_macrostates` 报 `ConvergenceError: Schur decomposition failed`**
  - *排查原因*：构建的细胞近邻图存在完全孤立的断裂子图（多个互不相连的连通分支）。
  - *解决方案*：在运行 CellRank 前检查近邻图连通性，过滤掉远离主干图的孤立碎片细胞（`sc.pp.filter_cells`）。
- **错误 2：推断出的初始状态与终末状态完全颠倒（反向发育）**
  - *排查原因*：输入的拟时序字段（如 DPT）在构建时所指定的根细胞与真实生物学方向相反。
  - *解决方案*：复核 DPT 的起始细胞索引，确保根分生区静止中心干细胞的拟时序严格为 0，成熟区分化细胞的拟时序为 1。
