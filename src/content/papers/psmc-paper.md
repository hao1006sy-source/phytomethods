---
title: "Inference of human population history from individual whole-genome sequences"
summary: "提出成对顺序马尔可夫共祖模型（PSMC），仅利用单个二倍体全基因组序列高精度重建历史有效群体大小动态。"
authors: "Li H, Durbin R"
year: 2011
journal: Nature
doi: 10.1038/nature10231
type: method
methodIds: [psmc]
domainIds: [population-genetics]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

# Inference of human population history from individual whole-genome sequences: PSMC

## 1. 研究背景与算法贡献

推断群体在历史演化过程中的有效群体大小（Effective Population Size, $N_e$）动态波动（如经历冰期瓶颈严重收缩、瓶颈后快速扩张等），是演化生物学、生物地理学与保护遗传学的核心基石。传统的群体历史推断方法（如基于位点频谱 SFS 或多座位微卫星）通常要求收集大量的群体样本，且无法充分利用全基因组高密度连续单倍型之间的染色体连锁信息。

2011 年，英国桑格研究所的 Heng Li（李恒）与 Richard Durbin 在 *Nature* 上推出了开创性的 **PSMC（Pairwise Sequentially Markovian Coalescent）** 算法。PSMC 在理论上取得了革命性的突破：**单个二倍体个体的全基因组序列本身就是一部完整的群体演化编年史**。由于减数分裂重组，单个个体的两条同源染色体在全基因组不同物理区段上的最近共同祖先时间（Time to the Most Recent Common Ancestor, TMRCA）呈现阶梯状空间跳跃。PSMC 构建了顺序马尔可夫共祖隐马尔可夫模型，仅需单个深测序二倍体基因组，即可高精度重建该物种在距今 1 万年至 100 万年间波澜壮阔的有效群体大小历史演化轨迹。

---

## 2. 核心数学模型与数据结构

### 2.1 隐马尔可夫模型（HMM）与状态空间

PSMC 将整个二倍体染色体沿线性坐标划分为等间距的连续小窗口（默认每 100 bp 作为一个离散位点）：
- **隐藏状态（Hidden States）**：该基因组区段两条同源单倍型的**最近共同祖先时间 $T$**。为了进行连续时间求逆，算法将连续时间划分为数十个离散时间区间（Atomic Time Intervals，例如参数 `4+25*1+1+6` 将时间划分为多个固定与自由参数区间）；
- **观测状态（Emissions）**：窗口内部是否观测到杂合单核苷酸多态性位点（Heterozygous Site, `1`）或纯合一致位点（Homozygous, `0`）；
- **放射概率（Emission Probability）**：给定共祖时间 $T_k$，发生突变的位点数服从参数为 $\theta_k = 2\mu T_k$ 的泊松分布；
- **状态转移概率（Transition Probability）**：沿染色体向前移动，发生减数分裂重组的概率正比于重组率 $\rho$。一旦发生重组，两条谱线脱离原共祖状态并重新在群体历史中向上溯祖，跳跃至新时间区间 $T_m$ 的概率直接由该历史时期的有效群体大小 $N_e(t)$ 决定：有效群体越小，共祖速率越快，跃迁至该区间的转移概率越高。

### 2.2 期望最大化（EM）算法与参数推断

模型使用标准的前向-后向（Forward-Backward） Baum-Welch 算法迭代更新每个时间区间内的相对共祖速率 $\lambda_k = 1 / (2 N_e(t_k))$：
- 在 E 步中计算全基因组每个窗口属于各个 TMRCA 时间段的后验分布；
- 在 M 步中基于后验期望重新更新有效群体大小参数 $\theta$ 与重组率参数 $\rho$，直至全局似然函数对数收敛。

### 2.3 物理单位真实转换

从 PSMC 输出的无量纲相对时间与相对群体大小，转换为实际年代（年）与真实个体数（$N_e$）：
$$N_e = \frac{\theta}{4\mu s}, \quad \text{Time (Years)} = \frac{T}{2\mu} \times g$$

其中：
- $\mu$ 为物种的年突变率（Per-generation or Per-year Mutation Rate，例如植物常见 $5 \times 10^{-9}$ 至 $7 \times 10^{-9}$ 每次减数分裂每碱基）；
- $g$ 为物种的平均世代时间（Generation Time，一年生草本作物为 1 年，多年生树木可达数年甚至数十年）；
- $s$ 为分箱窗口大小（默认 100 bp）。

---

## 4. 植物基因组学应用场景与科研价值

植物具有极其多样的交配系统（自交、专性异交、无性繁殖）以及复杂的倍性生活史：
- **第四纪更新世冰期避难所与物种演化史推断**：在多年生果树（如苹果、梨、葡萄）以及林木（杨树、松柏）中，PSMC 被广泛用于证明末次盛冰期（LGM，距今约 2 万年前）及中更新世大冰期对天然林木有效群体大小的剧烈瓶颈压制；
- **野生近缘种资源评价**：评估野生稻、野生大豆自然种群在漫长自然历史中是否曾经历严重瓶颈，为种质资源遗传多样性保护提供基准依据；
- **植物应用核心注意事项**：PSMC 假设物种为**严格二倍体且以近随机异交为主**。对于高度自交植物（如栽培水稻、拟南芥），全基因组杂合率极度匮乏，自交生活史会人为拉低全基因组 TMRCA 估计，必须进行有效的自交率校正或改用专门针对自交物种优化的模型。

---

## 6. 阅读与复现资源

- **原始研究论文**：[Nature 2011 DOI: 10.1038/nature10231](https://doi.org/10.1038/nature10231)
- **PubMed 记录**：[PMID: 21753753](https://pubmed.ncbi.nlm.nih.gov/21753753/)
- **李恒官方 PSMC 源码库**：[lh3/psmc GitHub](https://github.com/lh3/psmc)
- **站内配套专题**：[群体历史动态与有效群体大小推断](../../topics/population-genetics/m05-topic-06/)
- **站内配套专题**：[群体遗传变异与分化统计指标](../../topics/population-genetics/m05-topic-01/)
