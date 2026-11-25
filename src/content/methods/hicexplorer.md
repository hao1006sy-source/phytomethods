---
title: HiCExplorer
name: HiCExplorer
summary: 全染色体高通量染色质构象捕获 (Hi-C) 接触矩阵构建、质控归一化、拓扑关联结构域 (TAD) 与 A/B 区室分析工具集。
dataType: Hi-C 双端比对 BAM / SAM、限制性酶切位点 BED、接触矩阵 (.h5 / .cool)
principle: 接触矩阵离散分箱 (Binning)、Knight-Ruiz (KR) / 迭代校正 (ICE) 矩阵平衡、方向性指数 (DI) 与特征向量主成分分解 (A/B Compartments)
domainIds: [epigenomics-3d-genome]
topicIds: [m07-topic-06]
principleIds: [hic-contact-matrix]
dataIds: [hic-contact-matrix]
paper: hicexplorer-paper
repository: https://github.com/deeptools/HiCExplorer
version: "4"
status: published
updatedAt: 2026-11-25
---

## 生物学问题与定位

在真核生物细胞核内，数亿乃至数十亿碱基对的植物染色体 DNA 绝非杂乱无章的线性分子，而是在三维空间中历经严密、多层次的折叠与排布：
1. **染色体领地（Chromosome Territories）**：各条染色体占据独立的核内空间域；
2. **A/B 染色质区室（A/B Compartments）**：在兆碱基（Mb）尺度上，基因丰富且高度表达的活跃常染色质相互吸引聚集为 **A 区室**，而基因贫乏、高度富集转座子与甲基化的异染色质相互凝聚折叠为 **B 区室**；
3. **拓扑关联结构域（Topologically Associating Domains, TADs）**：在数十至数百 kb 尺度上，染色质折叠形成的局部相对封闭的互作单元，使得同一 TAD 内部的增强子（Enhancers）能够高频碰撞其靶标基因启动子，同时绝缘阻断跨边界的不良异位激活。

**Hi-C 技术**通过甲醛原位交联、限制性内切酶（如 DpnII 或 HindIII）消化、末端标记生物素、临近连接（Proximity Ligation）与高通量测序，全面捕获全基因组所有染色质区段之间的物理空间接触频率。

然而，原始 Hi-C 数据充满技术偏差：酶切位点物理分布不均、局部 GC 含量、片段长度偏好以及不同细胞间测序深度的波动。

**HiCExplorer** 由德国马克斯·普朗克免疫生物学与表观遗传学研究所（MPI-IE）Fidel Ramírez、Joachim Wolff 等人开发，其核心方法发表于 *Nature Communications*（2018）与 *Nucleic Acids Research*（2020）。作为当今三维基因组学生信分析的旗舰级套件，HiCExplorer 提供了从原始双端读段比对、矩阵质控去杂、迭代矩阵平衡（ICE/KR Normalization）、TAD 绝缘边界识别到 A/B 区室特征向量分解的端到端标准化分析能力，在植物大型基因组三维结构解析中获得了极其广泛的权威应用。

---

## 核心算法数学原理与推导

HiCExplorer 的数学与统计分析体系包含以下关键支柱：

### 1. 接触矩阵离散分箱（Binning）

将植物参考基因组各染色体按预设分辨率（Bin size，如 $10\text{ kb}, 40\text{ kb}, 100\text{ kb}$）等距切分为连续的基因组区间。若一对 Hi-C 双端测序 reads 的两端分别唯一比对到窗口 $i$ 与窗口 $j$，则全基因组接触对称矩阵 $\mathbf{M} \in \mathbb{R}^{B \times B}$ 的对应元素 $M_{ij}$ 计数加 1：

$$M_{ij} = M_{ji} = \sum_{\text{pairs}} \mathbb{I}(\text{Read1} \in \text{Bin } i \land \text{Read2} \in \text{Bin } j)$$

由于绝大多数染色质位点仅在物理邻近区域发生频繁碰撞，矩阵 $\mathbf{M}$ 表现为以对角线为中心高度富集的高维稀疏矩阵。

### 2. 迭代平衡矩阵归一化（Iterative Correction / ICE 算法）

原始接触计数 $M_{ij}$ 受到窗口 $i$ 和窗口 $j$ 自身实验偏差因子 $b_i$ 与 $b_j$ 的乘性畸变：

$$M_{ij} = b_i b_j T_{ij}$$

其中 $T_{ij}$ 为真实的生物学空间接触概率。Imakaev 等人（2012）提出的 ICE 假定：**排除未测序间隙与极端不可比对区域后，全基因组每一个染色质位点被 Hi-C 实验捕获的总能见度（Visibility）在统计学上应当均等**，即归一化后的矩阵各行各列之和应当严格恒等于常数（通常归一化为 1）：

$$\sum_{j=1}^B T_{ij} = 1, \qquad \forall i \in \{1, 2, \dots, B\}$$

HiCExplorer 采用高效的 Sinkhorn-Knopp 迭代对角缩放算法，交替对行和与列和执行除法缩放，直至矩阵边际和完全收敛，彻底消除酶切位点不均与 GC 偏差。

### 3. A/B 染色质区室分解（A/B Compartments via PCA）

染色质互作频率随一维物理距离的增大呈现陡峭的幂律衰减 $P(s) \sim s^{-\alpha}$。为了消除距离带来的平凡背景，算法执行三步转换：
1. **期望衰减消除（Observed / Expected Matrix, $\mathbf{O/E}$）**：计算相同对角线距离下的全基因组平均互作，用观测值除以期望值；
2. **皮尔逊相关矩阵（Pearson Correlation Matrix, $\mathbf{C}$）**：计算任意两窗口互作分布模式的皮尔逊相关系数：
   $$C_{ij} = \text{corr}\left( (O/E)_{i,*}, (O/E)_{j,*} \right)$$
   空间互作模式相近的区域在相关矩阵上呈现强烈的棋盘状块状聚集；
3. **主成分特征分解（PCA）**：对相关矩阵 $\mathbf{C}$ 求解第一主成分特征向量 $\mathbf{v}_1$（PC1）。特征向量的数值正负对应区室空间分离的两个极性。结合全基因组基因密度或表观标记 H3K4me3，将基因丰富的高表达正值区标定为 **A 区室（常染色质）**，负值区标定为 **B 区室（异染色质）**。

### 4. 绝缘得分（Insulation Score）与 TAD 边界检出

沿着接触矩阵的对角线滑动一个菱形检测窗口（Diamond window，边长通常为 $100\text{ kb} \sim 200\text{ kb}$）。计算落在该菱形窗口内的总接触强度作为该位点的绝缘得分（Insulation Score）：
- 当菱形窗口完全处于某个 TAD 内部时，内部互作频繁，绝缘得分处于高位；
- 当菱形窗口滑过两个 TAD 之间的绝缘边界时，由于跨越边界的长程互作被结构屏障阻断，菱形区域内的接触强度急剧下降，形成显著的**局部极小值凹陷（Valley）**；
- HiCExplorer 通过一阶导数过零点与二阶极小值检验，并结合 Delta 向量阈值，精准锚定全染色体所有物理 TAD 绝缘边界。

---

## 生产环境标准流水线

以下展示利用 HiCExplorer 针对植物 Hi-C 双端比对 BAM 构建 10 kb 接触矩阵、执行 ICE 归一化、检出 TAD 边界并进行三维可视化的标准流程：

```bash
# 步骤 1：利用双端独立比对的 BAM 文件构建未归一化原始接触矩阵 (h5 格式)
# --binSize 设定分辨率 (如 10,000 bp)；--minDistance 过滤自环与未消化片段
hicBuildMatrix \
  --samFiles hic_forward_bwa.bam hic_reverse_bwa.bam \
  --binSize 10000 \
  --restrictionSequence GATC \
  --danglingSequence GATC \
  --minDistance 1000 \
  --outFileName results/rice_hic_raw_10kb.h5

# 步骤 2：对接触矩阵执行质量诊断并过滤极端离群窗口 (去除组装间隙与超高异常计数)
hicCorrectMatrix diagnostic_plot \
  -m results/rice_hic_raw_10kb.h5 \
  -o results/qc_diagnostic_plot.png

hicCorrectMatrix correct \
  -m results/rice_hic_raw_10kb.h5 \
  --filterThreshold -2 3 \
  --correctionMethod ICE \
  -o results/rice_hic_corrected_10kb.h5

# 步骤 3：计算全染色体绝缘得分并鉴定拓扑关联结构域 (TADs)
# --minDepth 与 --maxDepth 控制菱形绝缘窗口跨度 (如 30 kb 至 100 kb)
hicFindTADs \
  -m results/rice_hic_corrected_10kb.h5 \
  --outPrefix results/rice_tads \
  --minDepth 30000 \
  --maxDepth 100000 \
  --step 10000 \
  --thresholdComparisons 0.05 \
  --correctForMultipleTesting fdr

# 步骤 4：以 100 kb 粗分辨率计算 A/B 染色质区室第一主成分 (PC1)
hicPCA \
  -m results/rice_hic_corrected_100kb.h5 \
  --numberOfEigenvectors 2 \
  --format bigwig \
  --extraTrack rice_gene_density.bed \
  --outputFileName results/rice_compartment_pc1.bw results/rice_compartment_pc2.bw

# 步骤 5：绘制局部染色质三维接触三角形热图与 TAD 边界
hicPlotMatrix \
  -m results/rice_hic_corrected_10kb.h5 \
  --region Chr01:1000000-5000000 \
  --log1p \
  --title "Rice 3D Chromatin Architecture at Chr01" \
  -o results/chr01_tad_heatmap.pdf
```

---

## 核心参数科学解析与植物调优指南

| 参数指令 | 推荐取值 | 物理含义与植物科研注意事项 |
| :--- | :--- | :--- |
| `--binSize` | `10000` 或 `40000` | **矩阵分辨率（bp）**；取决于测序有效独立对数；常规植物 Hi-C 推荐使用 10 kb 解析 TAD，使用 100 kb 解析 A/B 区室。 |
| `--restrictionSequence` | 严格匹配实验酶 | **酶切序列**；如 DpnII/MboI 为 `GATC`，HindIII 为 `AAGCTT`；必须与生化建库实验所用酶完全一致。 |
| `--filterThreshold` | `-2 3` (对数标准差) | **离群窗口过滤阈值**；剔除覆盖度过低（间隙区）或过高（未组装重复序列热点）的窗口，防止矩阵平衡失真。 |
| `--correctionMethod` | `ICE` 或 `KR` | **矩阵平衡算法**；ICE 算法速度快且对稀疏矩阵收敛稳定，是植物首选标准。 |

---

## 植物基因组特有挑战与避坑指南

### 1. 植物三维基因组的“非典型 TAD 特征”
- **机制与差异**：在哺乳动物中，TAD 边界高度富集 CTCF 绝缘蛋白和粘连蛋白（Cohesin）复合体，形成极其清晰的角圈（Corner loops）。然而，**植物界天然缺乏 CTCF 同源物**！
- **植物现象**：
  - 在小型紧凑基因组（如拟南芥，~120 Mb）中，全基因组缺乏哺乳动物那样的典型规则大 TAD，染色质以较为松散的微结构域（Micro-domains）形式存在；
  - 在中大型植物基因组（水稻、玉米、小麦、大豆）中，存在明确的 TAD 结构，但其边界往往由**活跃转录启动子、开放染色质（ATAC 峰）以及两侧排列的长末端重复转座子（LTR-RT）的物理相分离共同界定**；
- **避坑对策**：在植物中解释 `hicFindTADs` 结果时，严禁生搬硬套动物的 CTCF 染色质环形成假说，必须结合转座子分布与 RNA-seq 转录活性进行植物特异的相分离与绝缘机制阐释。

---

## 植物应用案例与真实文献证据

1. **水稻全基因组三维染色质拓扑结构与环境表观重塑**：
   在水稻三维基因组开创性研究中（Dong et al., *Nature Plants*, 2018），研究人员利用 HiCExplorer 对不同水稻品种与组织构建了高分辨率接触矩阵。通过 ICE 矩阵平衡与绝缘得分分析，在全基因组鉴定了上千个高置信度植物 TAD 结构域，证实了水稻基因组中 A/B 区室的空间翻转直接主导了逆境应答基因的簇状协同激活（[Dong et al., *Nature Plants*, 2018](https://doi.org/10.1038/s41477-018-0199-9)）。

---

## 实践排错与质控规范

- **错误 1：`hicCorrectMatrix` 迭代超过 100 轮仍未收敛（Not converged）**
  - *排查原因*：矩阵中存在未过滤的极端低覆盖窗口或全零染色体。
  - *解决方案*：先绘制 `diagnostic_plot`，将 `--filterThreshold` 下限收紧（如由 -2 改为 -1.5），过滤掉过多的边缘稀疏窗口后再执行平衡。
- **错误 2：`hicPCA` 生成的区室方向与基因密度完全反向（A/B 倒置）**
  - *排查原因*：PCA 特征向量的符号（正负号）在数学上具有二元任意性。
  - *解决方案*：在 `hicPCA` 中务必提供 `--extraTrack rice_gene_density.bed`，软件会自动将特征向量与基因密度进行正相关对齐，强制修正符号极性。
