---
title: "Inferring human population size and separation history from multiple genome sequences"
summary: "提出多重顺序马尔可夫共祖模型（MSMC），支持多单倍型基因组联合推断近期群体大小动态与跨群体分化历史。"
authors: "Schiffels S, Durbin R"
year: 2014
journal: Nature Genetics
doi: 10.1038/ng.3015
type: method
methodIds: [msmc]
domainIds: [population-genetics]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

# Inferring human population size and separation history from multiple genome sequences: MSMC

## 1. 研究背景与算法贡献

经典的 PSMC 算法虽然开创了利用单条二倍体全基因组序列推断历史有效群体大小（$N_e$）的先河，但其理论框架仅基于**单对单倍型（2 条染色体）**。在溯祖理论中，两条谱线在近期发生共祖的概率极低，导致 PSMC 在距今 2 万年以内的近代历史时期（例如植物农业驯化爆发、人类走出非洲与各大洲定居等关键历史节点）完全丧失分辨率；同时，PSMC 无法直接分析两个或多个群体之间的遗传隔离与分化过程。

2014 年，德国马克斯·普朗克研究所的 Stephan Schiffels 与英国桑格研究所的 Richard Durbin 在 *Nature Genetics* 上推出了 **MSMC（Multiple Sequentially Markovian Coalescent）**。MSMC 突破性地将顺序马尔可夫共祖模型从 2 条单倍型扩展至 **最多 8 条已定相单倍型基因组（4 个二倍体个体）**。其核心学术贡献在于：
1. **显著拓宽了近期历史的时间分辨率**：随着单倍型条数 $M$ 的增加，近期发生共祖事件的采样概率大幅上升，成功将群体历史推断的分辨率推进至距今数百至数千年以内；
2. **提出了跨群体相对共祖率（Relative Cross-Coalescence Rate, RCCR）模型**：通过联合推断来自两个不同群体的染色体之间的共祖速率，首次实现了无偏、高精度量化两个群体在历史上由连续基因流逐渐走向生殖隔离与谱系完全分化的时间动态。

---

## 2. 核心数学模型与数据结构

### 2.1 首个共祖事件（First Coalescence Event）状态空间扩展

在分析 $M$ 条定相单倍型时（例如 $M = 4$ 或 $M = 8$），系统在染色体局部位点 $x$ 处的状态不再追踪所有可能的树拓扑，而是核心追踪该位点集合中**第一对谱线发生共祖的时间 $T_{\text{first}}$**：
- $M$ 条谱线在过去的共祖等待时间服从指数分布，其共祖强度正比于 $\binom{M}{2} / (2 N_e(t))$；
- 单倍型越多，在近期历史中观测到共祖事件的密度成二次方激增，从而在极近代的历史时间窗口内提供了充分的统计推断信息；
- 沿染色体线性移动时，当发生重组，当前处于首共祖状态的谱线可能会发生拓扑重构，算法通过扩展的一阶隐马尔可夫模型进行转移概率转移。

### 2.2 跨群体相对共祖率（Relative Cross-Coalescence Rate, RCCR）

当输入样本包含来自两个不同群体（Pop1 与 Pop2）的定相单倍型时，MSMC 可以同时估计三种不同谱线对的共祖速率：
- $\lambda_{11}(t)$：群体 1 内部两条单倍型在历史时间 $t$ 的共祖速率（与 Pop1 当时的有效群体大小成反比）；
- $\lambda_{22}(t)$：群体 2 内部两条单倍型在历史时间 $t$ 的共祖速率；
- $\lambda_{12}(t)$：分别取自群体 1 和群体 2 的两条异源单倍型在历史时间 $t$ 的**跨群体共祖速率**。

**相对共祖率（RCCR）** 定义为跨群体共祖速率与群体内部共祖速率均值的比值：
$$\text{RCCR}(t) = \frac{2 \lambda_{12}(t)}{\lambda_{11}(t) + \lambda_{22}(t)}$$

- **完全融合期（$\text{RCCR} \approx 1$）**：若在时间 $t$，两群体尚未发生地理或生殖隔离，自由交配使得跨群体共祖与群内共祖概率完全相同；
- **逐渐分化期（$0 < \text{RCCR} < 1$）**：随着群体隔离加剧与基因流衰减，跨群体共祖速率下降；
- **完全分化期（$\text{RCCR} \to 0$）**：当两群体完全隔离后，跨群体谱线必须回溯至分化前的祖先群体中才能相遇，因此在该时间段内不可能发生跨群体共祖，RCCR 趋近于 0。
- 习惯上将 $\text{RCCR} = 0.5$ 对应的年代作为两个亚种或群体分化分歧的中位时间节点。

---

## 4. 植物基因组学应用场景与科研价值

在植物驯化历史与亚种分化研究中，MSMC 提供了比单一静态分化指数（$F_{ST}$）更为详尽的时间演化连续图谱：
- **栽培作物与野生祖先种的驯化分化定年**：在水稻（栽培籼粳稻 vs 野生稻 *Oryza rufipogon*）、大豆（栽培大豆 *Glycine max* vs 野生大豆 *G. soja*）中，利用 RCCR 能够精确量化驯化瓶颈发生的时间跨度（通常在距今 8,000 至 12,000 年前）；
- **异源多倍体植物近缘二倍体祖先分化定年**：在小麦、油菜的近缘二倍体供体种之间，推断它们在多倍化发生之前的独立分歧时间；
- **冰期气候对多谱系分化的驱动机制**：检验不同地理生态型之间的隔离时间是否与地质历史事件（如青藏高原隆升、第四纪冰期周期）高度吻合。

---

## 6. 阅读与复现资源

- **原始研究论文**：[Nature Genetics 2014 DOI: 10.1038/ng.3015](https://doi.org/10.1038/ng.3015)
- **PubMed/PMC 记录**：[PMC4116295](https://pmc.ncbi.nlm.nih.gov/articles/PMC4116295/)
- **MSMC 官方 GitHub 仓库**：[stschiff/msmc GitHub](https://github.com/stschiff/msmc)
- **配套预处理工具集**：[stschiff/msmc-tools GitHub](https://github.com/stschiff/msmc-tools)
- **站内配套专题**：[群体历史动态与有效群体大小推断](../../topics/population-genetics/m05-topic-06/)
- **站内配套专题**：[群体遗传变异与分化统计指标](../../topics/population-genetics/m05-topic-01/)
