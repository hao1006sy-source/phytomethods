---
title: Hi-C 辅助染色体水平挂载
summary: 阐述三维染色质构象聚合物物理接触衰减模型、YaHS 多分辨率迭代挂载与误组装纠错、多倍体植物亚基因组等位分群及接触热图病态判读。
domain: genome-assembly
methods: [yahs]
updatedAt: 2026-11-25
---

## 染色体空间构象与全基因组挂载原理

在现代植物参考基因组组装中，由 PacBio HiFi 或 ONT 长读段直接构建出的 Contig，通常受到着丝粒巨型卫星重复区、核糖体 DNA（rDNA）阵列或转座子高密度簇的阻隔，无法直接实现整条染色体的无间隙贯通。染色体构象捕获技术（High-throughput Chromosome Conformation Capture, Hi-C）通过空间原位甲醛交联、限制性内切酶（如 DpnII, MboI）消化、生物素标记末端并邻近连接（Proximity Ligation），将细胞核内物理空间相近的染色质 DNA 双端测序片段捕获下来。

Hi-C 辅助挂载（Scaffolding）的数学核心，在于建立高阶接触矩阵，利用染色质在三维核空间中接触概率与线性物理距离呈强反比关系的聚合物统计物理规律，将数百个甚至数千个游离 Contig 准确地分配（Clustering）、排序（Ordering）并定向（Orienting）至对应假分子染色体。

![Hi-C 接触概率幂律衰减模型与热图对角线模式图](/phytomethods/images/topics/m01/hic-scaffolding-decay.svg)

---

## 聚合物物理接触衰减模型的数学推导

高分子聚合物物理学（Polymer Physics）研究证明，真核生物间期染色体在细胞核空间内并非随机自由游离的刚性棒，而是受到拓扑约束的高密度折叠结构。

### 1. 顺式接触概率幂律衰减公式

对于同一条染色体上的任意两个基因组位点 $i$ 和 $j$，设其沿染色体线性 DNA 的物理距离为 $s = |i - j|$。其实验观测到的物理接触概率 $P(s)$ 严格遵循幂律衰减方程（Power-law Decay）：

$$P(s) \propto s^{-\alpha}$$

在双对数坐标系下，该关系表现为一条斜率为 $-\alpha$ 的直线：

$$\log_{10} P(s) = -\alpha \log_{10} s + C$$

- **分形球模型（Fractal Globule Model, $\alpha \approx 1.0$）**：Lieberman-Aiden 等人在 2009 年的开创性研究中证实，人类及高等植物间期染色体在 $500\text{ kb} \sim 10\text{ Mb}$ 尺度上高度符合无打结（Unknotted）、层级自相似的分形球模型，接触衰减指数 $\alpha \approx 1.08$；
- **平衡球模型（Equilibrium Globule Model, $\alpha \approx 1.5$）**：若染色质发生完全无约束的热力学平衡折叠，衰减指数理论上为 $\alpha = 1.5$。

### 2. Cis/Trans 接触比率：文库质量的黄金判据

根据染色体领地理论（Chromosome Territories），染色质在核空间中占据各自相对独立的物理领地，同一条染色体内部位点间的顺式接触（cis-contacts）发生几率，应在数量级上显著高于不同染色体之间的反式接触（trans-contacts）：

$$\text{Cis/Trans Ratio} = \frac{\sum_{i,j \in \text{Same Chr}} C_{ij}}{\sum_{i,j \in \text{Diff Chr}} C_{ij}}$$

- **高质量植物文库标准**：在甲醛交联充分且细胞壁裂解彻底的植物组织（如幼嫩嫩叶、黄化苗）中，过滤 PCR 重复后的高质量有效读段对（Valid pairs）中，$\text{Cis/Trans Ratio}$ 推荐应 $\ge 4.0 \sim 8.0$；
- **病态失效警示**：若比值低于 $2.5$，通常表明存在大量细胞游离裂解液中 DNA 的随机非特异性物理连接，或制备过程中发生严重的交联逆转。基于此类文库构建的接触图将充满全基因组均匀弥散的虚假反式噪音，极易导致挂载软件发生灾难性的染色体间异位嵌合。

---

## YaHS 现代多分辨率迭代挂载算法架构

传统挂载软件（如 LACHESIS, SALSA2）往往受限于固定的单一窗口分辨率，对高度碎片化的小 Contig 极其敏感。Zhou 等人在 2023 年开发的 **YaHS (Yet Another Hi-C Scaffolding tool)**，以其极高速度、卓越的稳健性和对长读段 Contig 的自适应优化，成为现代植物基因组学的主流首选。

### 1. 局部端点接触加权图构建

对于任意两个初始 Contig $A$ 与 $B$，YaHS 并不简单聚合全局总接触数，而是将每个 Contig 的两端分别定义为独立顶点：左端顶点 $A_L$ 与右端顶点 $A_R$。定义端点局部窗口（例如末端 $50\text{ kb}$ 区间），计算四个端点组合对之间的空间连接权重：

$$W(A_*, B_*) = \frac{C(A_*, B_*)}{\sqrt{\text{Cov}(A_*) \cdot \text{Cov}(B_*)}} \cdot \exp\left(-\beta \cdot \text{Dist}(A_*, B_*)\right)$$

通过归一化消除测序覆盖度不均的影响，精准辨析 Contig 拼接时的相对正反朝向（Forward 或 Reverse-Complement）。

### 2. 多轮分辨率渐进迭代（Multi-resolution Iteration）

YaHS 采用由粗到精的多尺度层级启发式图搜索：
1. **第一轮粗粒度（如 500 kb / 100 kb）**：在宏观尺度上优先聚类并确定大型 Contig（骨干序列）的染色体归属与粗略排序；
2. **中间轮次（如 50 kb / 20 kb）**：引入中等尺度 Contig，利用两端衰减模型逐步插入骨架；
3. **最终精细轮次（如 10 kb）**：将小于 $50\text{ kb}$ 的微小 Contig 精确定向并填充入相邻间隙。

### 3. 初始 Contig 内部错组装自动侦测与切断（Error Correction）

长读段初始组装虽然连续性高，但仍可能因重复序列跨越错误而在 Contig 内部产生嵌合拼接。YaHS 在挂载前会对 Contig 内部的 Hi-C 接触密度进行滑动窗口扫描：
- 若某 Contig 内部局部区域的两侧接触密度呈现**断崖式骤降**（Sharp drop in intra-contig contacts），且该断点两侧分别与外部不同染色体表现出强空间相关；
- YaHS 会自动在该疑似错误拼接位点执行硬切断（Split），将其打散为独立的子 Contig 重新参与全局挂载，从源头上杜绝错接在染色体水平上的传递。

---

## 植物多倍体挂载特异性与 HapHiC 突破

### 1. 同源多倍体与异源多倍体的亚基因组串扰

在六倍体小麦（AABBDD）或异源四倍体油菜（AACC）中，由于亚基因组间存在大量高度同源的染色体（Homeologous chromosomes），其序列相似性极高。普通 Hi-C 比对算法极易将来自 A 亚基因组染色体的 read 对错误联配至 B 亚基因组的同源染色体上，形成大范围的人工伪反式接触带，导致传统软件将两条不同亚基因组的同源染色体混杂聚集成同一个超大畸形假分子。

### 2. HapHiC 算法的等位分群解决方案

Tang 等人在 2024 年发表的 **HapHiC (Nature Plants)** 专门攻克了单倍型分辨与多倍体组装挂载难题：
- **等位基因感知过滤（Allele-aware filtering）**：利用长读段组装图中的同源等位分支信息，预先识别并惩罚同源染色体间的模糊 Hi-C 比对噪声；
- **马尔可夫聚类（Markov Cluster Algorithm, MCL）**：在高维加权接触网络中利用随机游走（Random walk）自适应寻找亚基因组内部高连通稠密子图，成功实现了从二倍体高杂合植物到同源异型三倍体奇岗（*Miscanthus × giganteus*）的全单倍型无混杂染色体级组装。

---

## 参考文献与数据来源

1. **Lieberman-Aiden E, van Berkum NL, Williams L, et al.** (2009). Comprehensive mapping of long-range interactions reveals folding principles of the human genome. *Science*, 326(5950), 289–293. DOI: [10.1126/science.1181369](https://doi.org/10.1126/science.1181369)
2. **Zhou C, McCarthy SA, Durbin R.** (2023). YaHS: yet another Hi-C scaffolding tool. *Bioinformatics*, 39(1), btac808. DOI: [10.1093/bioinformatics/btac808](https://doi.org/10.1093/bioinformatics/btac808)
3. **Tang X, Guo X, Zhang J, et al.** (2024). HapHiC: a fast, allele-aware scaffolding tool for phased and polyploid genome assemblies. *Nature Plants*, 10, 1079–1089. DOI: [10.1038/s41477-024-01755-3](https://doi.org/10.1038/s41477-024-01755-3)
4. **Zhang J, Zhang X, Tang H, et al.** (2019). Allele-defined genome of the autopolyploid sugarcane *Saccharum spontaneum* L. *Nature Genetics*, 50(11), 1565–1573. DOI: [10.1038/s41588-018-0237-2](https://doi.org/10.1038/s41588-018-0237-2)
