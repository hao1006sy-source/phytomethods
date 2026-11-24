---
title: Hi-C 与三维基因组：接触矩阵平衡、TAD 绝缘边界与 A/B 区室空间解析
summary: 深入推导 Hi-C 原位构象捕获原理、ICE 矩阵迭代平衡算法、接触概率幂律衰减模型、Insulation Score 边界探测、A/B 区室主成分分析以及植物 Rabl 极性构象与 KNOT 纽状体。
domain: epigenomics-3d-genome
methods: [hicexplorer]
status: published
updatedAt: 2026-11-25
---

## 核心科学问题：一维线状 DNA 的高阶空间折叠与拓扑绝缘

真核生物细胞核直径通常仅有数微米（$\mu\text{m}$），但其内部容纳的染色体线状 DNA 双螺旋完全拉直后长度可达数厘米甚至数米（如小麦基因组总长超过 5 米）。这种高达数十万倍的极度压缩并不是随机杂乱的一团乱麻，而是呈现出极其严密、层次分明的三维立体折叠构象。

启动子与其上下游相距数万碱基甚至数十万碱基之遥的远端增强子，必须借由染色质在三维核空间中弯曲形成**染色质环（Chromatin Loops）**，才能在空间上直接接近并招募转录机器；而不同的功能结构域则通过**拓扑关联结构域**（Topologically Associating Domains, TADs）相互绝缘，防止异常的异位跨区室转录激活。

**染色质构象捕获高通量测序**（High-throughput Chromosome Conformation Capture, Hi-C）利用原位分子化学邻近连接技术，将整个细胞核内所有物理空间邻近的 DNA 片段对进行全基因组测序统计，成为重构真核生物高阶染色质折叠构象的颠覆性利器。

![Hi-C 染色质三维构象：接触热图、TAD 绝缘边界与 A/B 区室空间划分](/phytomethods/images/topics/m07/hi-c-contact-matrix-and-compartments.svg)

---

## 算法数学推导：原位连接、矩阵平衡与多级拓扑解析

### 1. 原位 Hi-C（In situ Hi-C）的生物化学核心步骤

1. **原位甲醛交联（In situ Formaldehyde Crosslinking）**：
   甲醛分子快速穿透细胞核，在物理空间距离 $\le 2\text{ \AA}$ 的蛋白质-蛋白质与蛋白质-DNA 之间形成稳定的共价交联，将三维核构象原位“冻结”；
2. **限制性内切酶原位消化**：
   加入 4 碱基识别酶（如 DpnII, 识别 $5'\text{-GATC-}3'$）或 6 碱基酶（如 HindIII），在交联状态下将裸露的染色质剪切为均一的小片段；
3. **末端标记与平端化**：
   利用 DNA 聚合酶 I 大片段（Klenow 片段）补平黏性末端，同时在补平末端掺入带有生物素标记的脱氧胞苷三磷酸（Biotin-14-dCTP）；
4. **超稀释原位邻近连接（In situ Proximity Ligation）**：
   在极度稀释的连接缓冲液中加入 T4 DNA 连接酶。由于浓度极低，溶液中不同交联复合物之间的分子间随机扩散碰撞被彻底压制，而**同一交联复合物内部物理相贴的末端以极高概率发生原位连接**；
5. **超声剪切与链霉亲和素磁珠捕获**：
   消化去交联蛋白，超声将 DNA 打断至 $300 \sim 500\text{ bp}$，利用链霉亲和素磁珠特异性抓取包含生物素接头的两端连接产物，构建双端文库测序。

### 2. 接触矩阵构建与 ICE 迭代平衡算法（Iterative Correction）

将全染色体划分为等宽的离散物理区间（Bins，如植物中常用 $10\text{ kb}$、$20\text{ kb}$、$40\text{ kb}$ 或 $100\text{ kb}$），得到原始接触频率矩阵 $\mathbf{C} \in \mathbb{R}^{K \times K}$，其中 $C_{ij}$ 记录 Bin $i$ 与 Bin $j$ 之间的有效配对连接数。

原始矩阵存在强烈的技术系统偏倚（限制性位点分布密度不均、GC 含量偏倚、测序可比对性差异）。
Imakaev 等（2012）提出了**迭代校正算法（Iterative Correction and Eigenvector decomposition, ICE）**：
- 假定在理想状态下，消除技术偏差后每个基因组 Bin 与全基因组其他区域相互作用的“总可见度（Total Visibility）”应当是均匀恒定的；
- 设第 $i$ 个 Bin 具有未知偏差因子 $b_i$。观察到的原始计数为真实物理接触概率 $T_{ij}$ 的受偏乘积：
  $$C_{ij} = b_i b_j T_{ij}$$
- **Sinkhorn-Knopp 迭代对角化求解**：
  迭代计算行和与列和，在每次迭代中通过更新缩放向量：
  $$b_i^{(t+1)} = b_i^{(t)} \sqrt{\frac{\sum_j C_{ij} / (b_i^{(t)} b_j^{(t)})}{\text{Mean Row Sum}}}$$
- 迭代直到矩阵每行每列的和完全收敛于常数 1。经过 ICE 平衡后的归一化矩阵直接反映两点间的真实三维接触概率。

### 3. 接触概率随一维物理距离的幂律衰减模型（Power-law Decay）

在同一条染色体内部，任意两个位点之间的接触频率与其在染色体上的一维物理线性距离 $s = |i - j|$ 呈现强烈的**幂律衰减规律（Power-law Decay）**：

$$P(s) \sim s^{-\alpha}$$

在双对数坐标系（$\log_{10} P$ vs $\log_{10} s$）下呈现严格的负斜率直线。
- **高分子聚合物物理学意义**：指数 $\alpha$ 直接反映了染色质纤维的紧密折叠状态。在没有结节缠绕的“分形小球模型（Fractal Globule Model）”中，理论预测 $\alpha \approx 1.0$；
- **植物科学特征**：植物核小体折叠程度根据核大小存在物种特异性，在拟南芥等紧凑小基因组植物中 $\alpha \approx 0.8 \sim 0.9$；在玉米、小麦等高转座子超大基因组中 $\alpha \approx 1.0 \sim 1.25$。

### 4. 拓扑关联结构域（TAD）与绝缘得分（Insulation Score）算法

TAD 是三维空间中高频自相互作用、而与外部区域相互作用显著受抑的局部球状折叠单元。Crane 等（2015）提出了计算稳健的**绝缘得分算法（Insulation Score）**：

在 Hi-C 接触矩阵对角线上，以待测位点 $i$ 为中心建立一个大小为 $w \times w$（如 $100\text{ kb} \times 100\text{ kb}$）的滑动菱形窗口（Diamond Window），计算跨越位点 $i$ 的两翼相互作用总强度：

$$\text{IS}(i) = \sum_{x = i - w/2}^{i} \sum_{y = i}^{i + w/2} T_{xy}$$

- **TAD 内部**：菱形窗口落在同一 TAD 内部，接触极其稠密，$\text{IS}(i)$ 处于高位平台；
- **TAD 绝缘边界（Boundary）**：当窗口恰好滑过两个相邻 TAD 的分界点时，由于 TAD 之间存在强烈的物理阻隔，跨越分界点的接触频率断崖式暴跌，$\text{IS}(i)$ 曲线形成极其尖锐的**深谷（Insulation Dip）**；
- 利用极值求导寻找二次导数大于零的极小值谷底点，精准确定 TAD 的单碱基物理边界。

### 5. A/B 区室（Compartments）第一主成分特征向量解卷积

为了在大尺度上消除距离幂律衰减的主导效应，将平衡后的矩阵除以相同物理距离下的全基因组平均期望值，获得**观察值/期望值矩阵（Observed / Expected, O/E Matrix）**，并计算每对 Bin 接触向量之间的 Pearson 相关系数矩阵 $\mathbf{R}$。

对相关矩阵 $\mathbf{R}$ 执行特征值分解（Eigenvector Decomposition），提取对应最大特征值的第一主成分（PC1）：
- PC1 特征向量的值在全基因组范围内呈现出正负交替波动；
- **正负极性判定（Biological Polarity）**：结合全基因组基因密度、转录表达量与 ATAC 开放峰进行关联校准：
  - **A 区室（Active Compartment, PC1 > 0）**：富集活性转录基因、染色质高度开放松散、组蛋白 H3K4me3/H3K9ac 活跃修饰丰富、DNA 甲基化水平低；
  - **B 区室（Inactive Compartment, PC1 < 0）**：富集着丝粒周围异染色质、转座子高密度堆积、组蛋白 H3K9me2/me3 抑制修饰高耸、DNA 甲基化高度浓缩。

---

## 植物特有的两大经典高级三维构象

1. **Rabl 极性构象（Rabl Configuration，大基因组禾本科植物）**：
   - 小麦、大麦、水稻、黑麦等禾本科作物的间期细胞核内，染色体并不杂乱散布，而是呈现严格的极性排列：所有染色体的**着丝粒（Centromeres）紧密锚定在核膜的一极**，而所有的**端粒（Telomeres）则分散聚拢在核膜相反的另一极**，染色体臂如发卡般平行伸展；
   - 这种构象极大降低了超长染色体在核内的缠结概率，是植物减数分裂前期同源染色体精确配对识别的拓扑基础。
2. **拟南芥染色质纽浓缩体（KNOT，小基因组双子叶植物）**：
   - 拟南芥不具备 Rabl 构象，但 Grob 等（2014, Molecular Cell）发现其 5 条染色体上的 10 个特定的异染色质孤岛（Chromatin Knobs）在三维核空间中跨越染色体强烈交织聚集，形成一个被称为 **KNOT** 的超级异染色质物理中心，发挥着全基因组协同镇压孤立转座子激活的核心功能。
