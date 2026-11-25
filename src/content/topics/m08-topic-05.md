---
title: 单细胞拟时序与细胞命运决定：扩散伪时间 (DPT)、RNA Velocity 动力学与 CellRank 吸收马尔可夫链
summary: 深入推导扩散图马尔可夫转移算子、DPT 扩散伪时间、RNA 速率相平面微分方程、scVelo 动力学模型以及 CellRank 吸收马尔可夫链命运决定推断。
domain: single-cell-spatial-omics
methods: [scanpy, cellrank]
status: published
updatedAt: 2026-11-25
---

## 核心科学问题：静态快照数据与动态发育连续体

植物发育具有高度**终生连续性与可塑性**：以植物根系为例，根尖顶端分生组织（RAM）中包含终生保持未分化状态的干细胞中心，随着细胞不断分裂并向基部推移，细胞沿着纵轴依次经历分生区、伸长区与成熟分化区。

然而，单细胞测序实验所获得的仅仅是某一特定物理时间点、所有细胞被瞬间破坏裂解后的**静态瞬时快照**（Static Snapshot）。如何从这数万个杂乱无序的静态细胞表达量中，无偏差地重构出细胞分化的先后时间顺序、分支决策节点以及终末分化命运（如根冠、表皮或导管），是计算发育生物学的重大核心挑战。

---

## 算法数学推导：扩散图、RNA 速率与马尔可夫命运吸收

### 1. 扩散图（Diffusion Maps）与扩散伪时间（DPT）数学模型

扩散图（*Coifman et al., PNAS, 2005; Haghverdi et al., Nature Methods, 2016*）通过在细胞邻近图上模拟**热传导与随机游走**（Random Walks），能够自然地滤除局部的技术高频噪声，提取大尺度的连续发育几何流形。

**数学推导过程**：
1. **亲和力核矩阵构建**：
   $$W_{ij} = \exp\left( -\frac{\|\mathbf{x}_i - \mathbf{x}_j\|^2}{2\sigma^2} \right)$$
2. **马尔可夫随机游走转移矩阵**：
   定义度矩阵对角阵 $D_{ii} = \sum_j W_{ij}$，单步状态转移概率矩阵为：
   $$T = D^{-1} W, \quad T_{ij} = P(X_{t+1} = j \mid X_t = i)$$
3. **谱分解与多步扩散距离**：
   $T$ 具有实特征值 $1 = \lambda_0 > |\lambda_1| \ge |\lambda_2| \dots$ 及对应的右特征向量 $\psi_k$。随机游走经历 $t$ 步后的转移概率为 $T^t$。
   任意两个细胞 $i$ 与 $j$ 之间的**扩散距离**（Diffusion Distance）定义为所有可能随机游走路径的欧氏加权和：
   $$D_t(i, j)^2 = \| T^t(i, \cdot) - T^t(j, \cdot) \|_{1/\phi_0}^2 = \sum_{k=1}^{d} \lambda_k^{2t} \left( \psi_k(i) - \psi_k(j) \right)^2$$
4. **扩散伪时间（DPT）**：
   指定生物学生长起始根节点 $r$（如根据生物学已知标记 *WOX5* 锁定的静止中心干细胞 QC），细胞 $i$ 的扩散伪时间 $\tau_i$ 计算为从根节点到达该细胞的多尺度稳健随机游走测地距离：
   $$\tau_i = D_{\text{dpt}}(r, i)$$
   DPT 在图网络存在多条冗余并行路径时具有极高的容错性，不会受局部缺失断联影响。

### 2. RNA Velocity（RNA 速率）生物物理学微分方程

常规拟时序方法只能给出未定向的连续流形，其真实时间箭头的流动方向往往必须人工主观指定根节点。
RNA 速率（*La Manno et al., Nature, 2018; Bergen et al., Nature Biotechnology, 2020*）利用高通量测序读段中偶然包含的未剪接前体 mRNA（**未剪接 pre-mRNA, $u$**，含内含子 reads）与成熟 **剪接 mRNA ($s$)** 的物理动态丰度比值，首次实现了完全基于物理化学规律推导的**单细胞内在时间箭头与运动速度矢量**。

**两室生化反应动力学方程**：
$$\text{DNA} \xrightarrow{\alpha(t)} u \xrightarrow{\beta} s \xrightarrow{\gamma} \emptyset$$
对于任意特定基因：
$$\frac{du}{dt} = \alpha(t) - \beta u(t)$$
$$\frac{ds}{dt} = \beta u(t) - \gamma s(t)$$
- $\alpha(t)$：转录起始速率（单位时间分子数）；
- $\beta$：内含子剪切成熟速率常数（$\text{时间}^{-1}$）；
- $\gamma$：成熟 mRNA 的细胞内降解速率常数（$\text{时间}^{-1}$）。

#### (1) 稳态模型（Steady-state Model）
当基因处于稳态表达（$\frac{ds}{dt} = 0$）时：
$$u = \frac{\gamma}{\beta} s = \tilde{\gamma} s$$
在 $(s, u)$ 相平面图（Phase Portrait）上，处于转录平衡状态的细胞分布在一条斜率为 $\tilde{\gamma} = \frac{\gamma}{\beta}$ 的射线上：
- 若细胞位于平衡线上方（$u > \tilde{\gamma} s$）：$\frac{ds}{dt} > 0$，表明转录处于诱导激活或上升阶段，成熟转录本正在积累；
- 若细胞位于平衡线下方（$u < \tilde{\gamma} s$）：$\frac{ds}{dt} < 0$，表明基因转录下调或关闭，mRNA 处于净降解消耗阶段。

在实践中，通常将时间尺度以剪切速率进行归一化（即取基准 $\beta = 1$），定义相对瞬时速率为：
$$v = u - \tilde{\gamma} s$$
需注意，此处的 $v$ 是时间尺度归一化后的相对速率投影，其与绝对物理时间导数相差标度比例 $\beta$。

#### (2) 动力学模型（Dynamical Model, scVelo）与植物局限
针对植物中瞬间转录应激或尚未达到稳态相平衡的基因，scVelo 利用全期望最大化（EM）算法联合估计隐变量潜伏时间与反应动力学参数 $(\alpha, \beta, \gamma)$。但需注意：植物组织内含子读段捕获比例通常显著低于哺乳动物（且普遍存在内含子保留），因此需严格过滤拟合优度低的相平面，避免产生方向性误导。

### 3. CellRank 吸收马尔可夫链（Absorbing Markov Chains）与命运推断

CellRank（*Lange et al., Nature Methods, 2022*）将 RNA Velocity 速率向量、DPT 伪时间或实验时间点融合成统一的**有向细胞状态转移核**（Transition Kernel $\mathbf{P}$）：

1. **速度投影相似度矩阵**：
   计算细胞 $i$ 的速度向量 $\mathbf{v}_i$ 与其邻居位移向量 $\mathbf{s}_j - \mathbf{s}_i$ 的余弦相关性，转化为从细胞 $i$ 跃迁到细胞 $j$ 的概率 $P_{ij}$；
2. **广义 Perron 聚类分析（GPCCA）**：
   对有向转移矩阵 $\mathbf{P}$ 进行 Schur 谱分解，自动识别有向网络中的终末吸收态（Terminal States，如分化成熟的导管、根冠、表皮）；
3. **吸收概率矩阵求解（Absorption Probabilities）**：
   将细胞状态划分为瞬态集合 $\mathcal{T}$（分生区祖细胞）与吸收态集合 $\mathcal{A}$（成熟终态），转移矩阵重构为分块形式：
   $$\mathbf{P} = \begin{pmatrix} \mathbf{Q} & \mathbf{R} \\ \mathbf{0} & \mathbf{I} \end{pmatrix}$$
   从任意未分化祖细胞 $i \in \mathcal{T}$ 最终分化沉降进入各个终末吸收谱系的概率矩阵 $\mathbf{B}$ 满足**第一步代数方程**：
   $$\mathbf{B} = \mathbf{R} + \mathbf{Q} \mathbf{B} \implies (\mathbf{I} - \mathbf{Q}) \mathbf{B} = \mathbf{R} \implies \mathbf{B} = (\mathbf{I} - \mathbf{Q})^{-1} \mathbf{R}$$
   解矩阵逆即可量化任意祖细胞向木质部或韧皮部分化的谱系偏向概率（Lineage Commitment Probability）。

---

## 真实植物科研案例：水稻不定根原基发生与拟南芥根系分化

### 1. 水稻不定根原基发生的单细胞拟时序（*Zhang et al., Nature Communications, 2021*）
在对水稻根系单细胞图谱的研究中，利用 Palantir 扩散图算法：
- 以未分化的维管束母细胞（*WOX11* 高表达）为根起点；
- 计算沿扩散伪时间的基因动态变化，成功捕获了侧生不定根原基在穿越内皮层与皮层突破壁障过程中，细胞壁松弛酶（*EXPA* 扩张蛋白）与生长素应答因子（*ARF*）的连续时间阶梯级联激活模式。

### 2. 拟南芥根系全景稳态最优传输（StationaryOT, *Shahan et al., Dev Cell, 2022*）
针对植物根系在空间和时间上维持稳态生长的特征，研究者应用最优传输（Optimal Transport）理论对 11 万个拟南芥单细胞进行质量平衡流分析，证实由静止中心干细胞产生的子细胞在离开分生区前已显现出高度稳定的组织分化偏向性。

---

## 关联工具与复现入口

- **Scanpy**：通过 `sc.tl.diffmap` 与 `sc.tl.dpt` 执行扩散图与伪时间计算。
- **scVelo**：通过 `scv.tl.velocity` 与 `scv.tl.velocity_graph` 拟合 RNA 速率向量场。
- **CellRank**：利用 `cr.kernels.VelocityKernel` 与 `cr.estimators.GPCCA` 推导吸收态与谱系命运决定概率。
- 参见[水稻根单细胞发育轨迹文献解读](../../../papers/rice-root-single-cell-2021/)与[拟南芥根发育时序图谱](../../../papers/arabidopsis-root-atlas-2022/)。
