---
title: 单细胞多组学与跨模态整合：TF-IDF/LSI 降维、ArchR 基因活性评分与 WNN 加权近邻网络
summary: 深入推导 scATAC-seq TF-IDF 潜语义索引、ArchR 距离衰减基因活性评分、WNN 加权最近邻跨模态整合、chromVAR 基序可及性偏差校正及 Peak-to-Gene 顺式调控连锁预测。
domain: single-cell-spatial-omics
methods: [archr]
status: published
updatedAt: 2026-11-25
---

## 核心科学问题：从单模态相关性走向因果调控机制

单细胞转录组（scRNA-seq）测量的是基因表达调控的**最终下游产物**（mRNA 转录本丰度），而无法直接回答：究竟是哪些上游转录因子在何时结合了哪些远端顺式调控元件（cCREs/Enhancers）？染色质在何时从浓缩状态转变为物理开放？

单细胞多组学（scMulti-omics）通过在单细胞水平同时整合转录组与表观基因组（如单细胞染色质可及性测序 scATAC-seq）：
1. **配对实验模式（Paired 10x Multiome）**：在同一个物理微胶滴内的单个细胞核中，通过双条形码或分裂捕获接头，**完全同步测量该单一细胞的 mRNA 转录本与开放染色质片段**；
2. **非配对跨模态对齐（Unpaired Integration）**：对同一植物组织分别制备 scRNA-seq 与 scATAC-seq 文库，通过在 ATAC 模态中计算“拟单细胞基因活性得分（Gene Activity Score）”，在跨模态共享表达特征空间中建立统计学锚点对齐。

---

## 算法数学推导：LSI 降维、基因评分与 WNN 整合

### 1. scATAC-seq 词频-逆文档频率（TF-IDF）与潜语义索引（LSI）

染色质可及性矩阵具有极度二元化（0 表示未切割，1 或 2 表示转座酶在该位点发生双链切割）与极端稀疏性（零值通常超出 $98\%$）。直接使用常规 PCA 会受到超高频背景开放峰和稀有特异峰的强烈扭曲。scATAC 分析借用自然语言处理领域的 **TF-IDF + SVD**（即 Latent Semantic Indexing, LSI）：

1. **词频（Term Frequency, TF）**：
   量化峰 $j$ 在细胞 $i$ 内部的相对切割丰度：
   $$\text{TF}_{ij} = \frac{x_{ij}}{\sum_{k} x_{ik}}$$
2. **逆文档频率（Inverse Document Frequency, IDF）**：
   对全基因组普遍开放的“无信息”非特异性位点实施强力惩罚，提升稀有特异位点权重：
   $$\text{IDF}_j = \log\left( 1 + \frac{N}{\sum_{i=1}^N \mathbb{I}(x_{ij} > 0)} \right)$$
3. **TF-IDF 加权矩阵与截断 SVD**：
   $$\mathbf{M}_{ij} = \text{TF}_{ij} \cdot \text{IDF}_j$$
   对居中矩阵进行截断奇异值分解：$\mathbf{M} = \mathbf{U} \mathbf{\Sigma} \mathbf{V}^T$。
   *关键要点*：第 1 个奇异成分（LSI-1）通常与单个细胞的总测序深度呈高达 $r > 0.98$ 的强相关性，在下游邻域图构建中通常将 **LSI-1 彻底丢弃**，仅保留 LSI 2~30 维真实表观生物学变异。

### 2. ArchR 拟单细胞基因活性评分（Gene Score Model）

为了在非配对多组学中将 ATAC 峰空间映射到 RNA 基因空间，ArchR（*Granja et al., Nature Genetics, 2021*）建立了一套基于**基因组物理距离指数衰减**的生物学加权模型：

对于任意特定基因 $g$，其在细胞 $c$ 中的基因得分计算为启动子及上下游染色质可及性信号的加权积分：
$$\text{GeneScore}_{c, g} = \sum_{p \in \text{Peaks}} x_{c, p} \cdot w(d_{p, g})$$
其中权重函数 $w(d)$ 定义为：
$$w(d) = e^{-|d| / D_0} + e^{-1}$$
- $d_{p, g}$：染色质开放峰中心到基因转录起始位点（TSS）或基因边界的碱基距离；
- $D_0$：特征衰减尺度（在植物致密基因组中通常取 $D_0 = 5,000\text{ bp}$）；
- 同时引入临近基因边界（Gene Boundary）约束，防止将跨越邻近无关基因的远端可及性错误赋予目标基因。

### 3. 加权最近邻整合（Weighted Nearest Neighbor, WNN）

Seurat v4（*Hao et al., Cell, 2021*）提出的 WNN 算法能够在单细胞多组学中，针对每个细胞**自适应学习各模态的信息丰富度**：
1. 对细胞 $i$，在 RNA 低维空间找出其 $k$ 个最近邻细胞，计算根据 RNA 预测自身表达的准确度预测误差 $\epsilon_{i, \text{RNA}}$；
2. 在 ATAC 低维空间同样计算表观模态的预测误差 $\epsilon_{i, \text{ATAC}}$；
3. 计算该细胞在两模态上的归一化权重：
   $$w_{i, \text{RNA}} = \frac{\exp(-\epsilon_{i, \text{RNA}} / \sigma_i)}{\exp(-\epsilon_{i, \text{RNA}} / \sigma_i) + \exp(-\epsilon_{i, \text{ATAC}} / \sigma_i)}$$
   若某细胞处于某一模态信号微弱、噪声巨大的状态（例如在极度分化的成熟厚壁组织中 ATAC 切割极少），算法会自动将该细胞的权重倾向于高质量的 RNA 模态，构建兼具双模态优势的跨模态联合流形图。

### 4. 峰-基因连锁预测（Peak-to-Gene Linkages）

利用配对单细胞数据，可在单细胞分辨率下精准预测植物远端增强子（Enhancers）与其调控的靶基因：
1. 筛选物理距离在 $\pm 50\text{ kb}$ 范围内的所有候选（Peak, Gene）对；
2. 为消除单细胞极高稀疏度的影响，将流形上邻近的 50~100 个细胞聚合为“拟微细胞团”（$k$-NN Aggregated Metacells）；
3. 计算开放峰可及性信号与基因 mRNA 表达量之间的 Pearson / Spearman 相关系数 $r$：
   $$r_{\text{link}} = \text{Corr}\left( \mathbf{A}_{\text{peak}}, \mathbf{Y}_{\text{gene}} \right)$$
4. 结合染色质拓扑绝缘结构域（TAD 边界）与置换检验，筛选出相关性显著（$r > 0.45, P_{\text{adj}} < 0.01$）的调控连接，直接在全基因组绘制顺式调控网络。

---

## 真实植物科研案例：水稻与拟南芥单细胞多组学里程碑

### 1. 拟南芥根系单细胞调控景观（*Dorrity et al., Nature Communications, 2021*）
在对拟南芥幼根进行 scATAC-seq 测序中：
- 鉴定出超过 20,000 个细胞类型特异性染色质开放区域；
- 利用 chromVAR 偏差校正算法成功挖掘出组织特异性转录因子结合模序（如内皮层特异富集 SCR/SHR 基序，中柱特异富集 TMO5/LBD 基序）；
- 揭示了在细胞发生转录之前，部分分化相关顺式调控元件的染色质可及性已提前预先开放（Chromatin Priming）。

### 2. 水稻全生育期 8 个器官同细胞配对单细胞多组学图谱（*Wang et al., Nature Genetics, 2025*）
在涵盖水稻根、茎、叶、幼穗、颖花等 8 个器官、共计 116,564 个单细胞的真核同细胞配对多组学（Paired scRNA + scATAC）研究中：
- 精确重构了水稻幼穗分生组织向小穗原基跃迁的关键调控网络；
- 利用 Peak-to-Gene 连锁预测，证实水稻淀粉合成核心转录因子 *RSR1* 与黄酮代谢酶 *F3H* 启动子上游受多个特异远端增强子协同转录激活，确立了植物单细胞多组学研究的标杆范式。

---

## 关联工具与复现入口

- **ArchR**：基于 R 语言的高性能单细胞染色质可及性分析全面框架，支持超大规模单细胞数据流式处理与 Peak-to-Gene 预测。
- **Signac / Seurat**：提供 WNN 多模态加权最近邻网络构建与配对/非配对数据对齐。
- 参见[水稻单细胞多组学图谱文献解读](../../../papers/rice-single-cell-multiomics-2025/)与[拟南芥根染色质可及性文献](../../../papers/arabidopsis-atac-root-2021/)。
