---
title: 泛基因组与核心、可变基因组
summary: 深入解析植物泛基因组概念演进、Heaps' law 幂律数学建模、核心/可变基因划分准则、基因级与序列图级泛基因组的多尺度构建策略。
domain: pangenomics-structural-variation
methods: [eupan, orthofinder, minigraph, pggb, minigraph-cactus]
status: published
updatedAt: 2026-11-25
---

## 研究背景与核心科学问题

自 2000 年拟南芥（*Arabidopsis thaliana*）Col-0 和 2005 年水稻（*Oryza sativa*）日本晴（Nipponbare）基因组发布以来，利用单一代表性个体作为全物种的“标准线性参考基因组（Linear Reference Genome）”奠定了现代植物分子生物学的基础。然而，随着测序技术的跨越式发展，研究人员逐渐认识到：**单一参考基因组无法代表物种完整的遗传多样性**。

在植物界中，复杂的转座子爆发式扩增、多倍化事件（WGD）、广泛的亚种间杂交以及强烈的自然与人工选择，导致同一个物种的不同材料间存在海量的大片段结构变异（SVs）与**基因存在/缺失变异（Presence/Absence Variation, PAV）**。当研究人员将非参考系物种的二代或三代测序 reads 强行比对至单一线性参考基因组时，会产生严重的**参考基因组偏倚（Reference Bias）**：
1. **暗物质序列丢失**：存在于野生种、农家种或特异育种材料中、但在参考品系中缺失的基因片段（如抗病 NLR 基因簇、特化代谢途径基因）完全无法获得比对映射；
2. **错配与假变异激增**：在发生大片段倒位或序列高度发散的基因组区域，读段发生多重错配或非特异性剪切比对，假阳性 SNP 与 InDel 剧增；
3. **连锁不平衡信号扭曲**：单一坐标系无法表达复杂的非共线性重排，导致 GWAS 关联定位信号发生空间错位。

为了彻底突破线性参考的局限，**泛基因组**（Pan-genome）理论应运而生——它将全物种所有个体的全部遗传信息统一纳入一个全局性知识框架中，系统表征全物种的“核心序列”与“可变多样性”。

![植物泛基因组建模与 Heaps Law 幂律演化曲线](/phytomethods/images/topics/m03/pangenome-heaps-law-curves.svg)

---

## Heaps' Law 幂律数学建模与开放/封闭判据

在泛基因组研究中，一个根本性的数学问题是：**该物种的泛基因组是“开放型（Open）”还是“封闭型（Closed）”？随着测序个体数不断增加，最终是否存在一个有限的基因容量上限？**

### 1. 经典 Heaps' Law 幂律公式
受到语言学中词汇丰富度模型的启发，Tettelin 等人（2008）建立了泛基因组容量扩展的数学判据。设全物种已测序的独立基因组数为 $N$，每加入一个新基因组所额外发现的**全新基因家族增量** $\Delta n$ 服从幂律衰减模型：

$$\Delta n = \kappa \cdot N^{-\alpha}$$

对增量公式在 $[1, N]$ 区间积分，可推导出累计观察到的**泛基因组总基因家族数 $n(N)$** 的幂律表达式：

$$n(N) = \kappa' \cdot N^\gamma \quad (\text{其中 } \gamma = 1 - \alpha)$$

式中：
- $\kappa, \kappa'$ 为由物种自身遗传分化度决定的拟合常数；
- $\alpha$ 为递减指数，$\gamma$ 为增长指数。

### 2. 开放型与封闭型的定量准则
依据拟合参数 $\alpha$（或 $\gamma$），可定量判定物种泛基因组的开放度：
- **开放型泛基因组（Open Pan-genome, $\alpha < 1 \iff \gamma > 0$）**：
  随着测序个体数 $N \to \infty$，新增基因数 $\Delta n$ 衰减速率极其缓慢，理论泛基因组容量 $n(N)$ 不收敛于有限极值。意味着物种拥有近乎无限的基因库储备，持续测序新的种质资源仍能不断捕获全新的基因。
  *植物典型代表*：异花授粉作物、具有野生渐渗历史的栽培种，如玉米（*Zea mays*，$\alpha \approx 0.4 \sim 0.6$）、水稻（*Oryza sativa*，$\alpha \approx 0.6 \sim 0.7$）、甘蓝型油菜（*Brassica napus*）。
- **封闭型泛基因组（Closed Pan-genome, $\alpha > 1 \iff \gamma < 0$）**：
  新增基因数 $\Delta n$ 随个体数剧烈衰减趋近于 0，累计泛基因曲线迅速达到平台期（Asymptotic Plateau），存在理论容量上限 $n_{\max}$。此时即使继续大幅追加测序个体，也极难发现新基因家族。
  *典型代表*：演化瓶颈期自交系、地理分布狭窄的孤立物种。

### 3. 核心基因组指数衰减模型
与此同时，所有个体均完全共享的**核心基因组大小 $F_{\text{core}}(N)$** 随测序样本数增加呈现指数衰减规律：

$$F_{\text{core}}(N) = \Omega + A \cdot e^{-N / \tau}$$

其中 $\Omega$ 为全物种真正的**绝对核心基因组极限大小（Conserved Core Floor）**，$A$ 为非核心衰减振幅，$\tau$ 为衰减特征尺度。

---

## 泛基因组四大组分层级划分

依据基因在群体样本中的出现频率（Frequency），国际通用标准将泛基因组精细划分为四大组分层级：

```
┌─────────────────────────────────────────────────────────────┐
│ 泛基因组全量空间 (Pan-genome Space, 100%)                    │
├─────────────────────────────────────────────────────────────┤
│ 1. 核心基因组 (Core Genome, 存在于 ≥ 99% 的个体)             │
│    - 生物学本质：植物最基础的生命支持系统                   │
│    - 功能富集：光合作用核心机制、基本生化代谢、转录翻译、DNA 修复 │
│                                                             │
│ 2. 软核心基因组 (Soft-core Genome, 存在于 90% ~ 99% 的个体)   │
│    - 生物学本质：在生物学上应属于核心，但在技术上存在波动   │
│    - 容忍场景：组装间隙断裂 (Gaps)、剪接位点未被识别、测序深度波动│
│                                                             │
│ 3. 可变/外壳基因组 (Dispensable / Shell Genome, 1% ~ 90%)   │
│    - 生物学本质：决定品系间表型分化与环境适应性差异的主体   │
│    - 功能富集：抗病防御 (NLR/RLK 家族)、非生物逆境响应 (抗旱耐盐)、│
│               株型与分蘖发育、特定花青素/芳香代谢产物合成    │
│                                                             │
│ 4. 特有/云基因组 (Private / Cloud Genome, 仅存在于 < 1% 或单株)│
│    - 生物学本质：极端稀有的特异性多态性                     │
│    - 演化机制：近期由转座子捕获产生的新基因、野生近缘种渐渗片段│
└─────────────────────────────────────────────────────────────┘
```

**频率计算与缺失判定准则**：
对于全基因组共线性基因座 $g$，设在统一判定标准下可评价的有效样本集合为 $C_g$（排查测序覆盖断崖与非特异性区域），该基因的群体分布频率为：

$$f_g = \frac{\sum_{s \in C_g} x_{gs}}{|C_g|}, \quad x_{gs} \in \{0, 1\}$$

严禁将测序覆盖度不足的“未测定状态（Missing Data）”简单草率地记为“物理缺失（Absence, 0）”。

---

## 基因级 vs 序列图级泛基因组的多尺度构建

在具体工程实现与数据表示上，泛基因组存在两个截然不同但又高度互补的维度：

### 1. 基于基因集合的泛基因组（Gene-based Pan-genome）
- **核心计算逻辑**：对全样本进行高精度的独立结构预测（如 BRAKER3/MAKER），利用 [OrthoFinder](../../../methods/orthofinder/)、SonicParanoid 等工具开展全蛋白质组直系同源群（Orthogroups）多向聚类，最终构建 `样本 × 基因家族` 的二值或拷贝数矩阵（PAV Matrix）；
- **优点**：直接聚焦于编码功能单元，易于开展基因家族演化扩张/收缩分析及转录组功能富集；
- **缺陷**：彻底丢失了启动子、增强子等非编码顺式调控元件的结构变异，无法反映基因间的物理基因组拓扑顺序。

### 2. 基于序列图的泛基因组（Graph-based / Sequence Pan-genome）
- **核心计算逻辑**：利用 [Minigraph](../../../methods/minigraph/)、[Minigraph-Cactus](../../../methods/minigraph-cactus/) 或 [PGGB](../../../methods/pggb/)，以图论模型（Variation Graph, rGFA）将全部单倍型组装的完整核苷酸链融为一体。图中的节点（Nodes）代表碱基片段，边（Edges）代表连接，样本的单倍型对应于穿行于图中的路径（Paths）；
- **优点**：全息保留编码区与非编码区的全部单核苷酸变异（SNPs）、小插入缺失（InDels）与结构变异（SVs），真正实现全序列级别的无偏表征；
- **缺陷**：图数据结构复杂、计算资源消耗巨大，图上非共线性路径的注释难度高。

---

## 植物经典案例与实战启示

植物基因组学是全球泛基因组科学研究的前沿阵地：
- **水稻 3,010 份亚洲栽培稻泛基因组**：Wang 等人（*Nature*, 2018）对全球 3,010 份亚洲栽培稻进行测序分析，构建了大规模基因存在缺失变异图谱，揭示了籼稻（*Indica*）与粳稻（*Japonica*）亚种间存在显著的谱系特异性基因富集；
- **玉米 26 个奠基自交系染色体级泛基因组**：Hufford 等人（*Science*, 2021）基于 HiFi 长读段重构了 NAM 种质群体的 26 个代表自交系，发现玉米泛基因组中包含高达 103,000 个结构变异，且超过三分之一的基因模型在自交系间存在拷贝数变化或完整缺失，彻底颠覆了以 B73 为唯一参考的认知局限；
- **野生稻图泛基因组（2025）**：Guo 等人在野生稻（*Oryza rufipogon*）研究中并行构建了基于 145 份材料的蛋白家族矩阵与基于 144 份材料的 Minigraph-Cactus 变异诱导图，检出高达 3.87 Gb 的非参考图节点序列，成功克隆了多个在栽培稻驯化进程中丢失的关键耐涝与抗稻瘟病基因。[Nature Genetics, 2025](https://doi.org/10.1038/s41588-024-02008-0)。

---

## 参考文献与数据来源

1. **Tettelin H, Masignani V, Cieslewicz MJ, et al.** (2005). Genome analysis of multiple pathogenic isolates of *Streptococcus agalactiae*: Implications for the microbial "pan-genome". *PNAS*, 102(39), 13950–13955. DOI: [10.1073/pnas.0506758102](https://doi.org/10.1073/pnas.0506758102)
2. **Tettelin H, Riley D, Cattuto C, Medini D.** (2008). Comparative genomics: the bacterial pan-genome. *Current Opinion in Microbiology*, 11(5), 472–477. DOI: [10.1016/j.mib.2008.09.006](https://doi.org/10.1016/j.mib.2008.09.006)
3. **Wang W, Mauleon R, Hu Z, et al.** (2018). Genomic variation in 3,010 diverse accessions of Asian cultivated rice. *Nature*, 557(7703), 43–49. DOI: [10.1038/s41586-018-0063-9](https://doi.org/10.1038/s41586-018-0063-9)
4. **Hufford MB, Seetharam AS, Woodhouse MR, et al.** (2021). De novo assembly, annotation, and comparative analysis of 26 diverse maize genomes. *Science*, 373(6555), 655–662. DOI: [10.1126/science.abg5289](https://doi.org/10.1126/science.abg5289)
5. **Hickey G, Monlong J, Ebler J, et al.** (2023). Pangenome graph construction from genome alignments with Minigraph-Cactus. *Nature Biotechnology*, 42, 1464–1473. DOI: [10.1038/s41587-023-01793-w](https://doi.org/10.1038/s41587-023-01793-w)
