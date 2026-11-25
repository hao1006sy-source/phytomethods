---
title: "Robust and scalable inference of population history from hundreds of unphased whole genomes"
summary: "提出结合连续马尔可夫共祖连锁信息与大样本条件位点频谱（SFS）的未定相群体历史推断方法 SMC++。"
authors: "Terhorst J, Kamm JA, Song YS"
year: 2017
journal: Nature Genetics
doi: 10.1038/ng.3748
type: method
methodIds: [smcpp]
domainIds: [population-genetics]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

# Robust and scalable inference of population history from hundreds of unphased whole genomes: SMC++

## 1. 研究背景与算法贡献

顺序马尔可夫共祖模型（SMC / PSMC / MSMC）能够深入挖掘单倍型之间由于减数分裂重组产生的空间连锁信息，推断过去的有效群体大小（$N_e$）。然而，传统的 SMC 派生算法存在两大突出的应用瓶颈：
1. **严格依赖物理定相（Phasing）**：PSMC 仅限单个个体的 2 条同源染色体，而 MSMC/MSMC2 则强制要求全样本具备高质量的长程单倍型定相信息。在大多数非模式植物或重测序群体中，高精度定相依赖昂贵的长读长测序或超大单倍型参考面板；不可避免的定相跳跃错误（Switch Errors）会破坏真实连锁，导致近期历史推断严重失真；
2. **两类经典推断范式长期割裂**：经典的位点频谱法（Site Frequency Spectrum, SFS，如 $\partial a \partial i$、fastsimcoal2）擅长处理数百个未定相样本，但完全丢弃了相邻位点间的物理连锁信息；而传统 SMC 仅能利用极少量定相样本，无法容纳群体全基因组测序中海量样本的低频与罕见等位基因信息。

加州大学伯克利分校的 Jonathan Terhorst、Jack A. Kamm 与 Yun S. Song（宋运生）在 2017 年推出了 **SMC++**（发表于 *Nature Genetics*）。SMC++ 首次在数学理论上架起了**连续马尔可夫共祖（SMC）连锁信息** 与 **大样本条件位点频谱（Conditional SFS）** 之间的统一桥梁。SMC++ 能够直接从数十至数百个**完全未定相（Unphased）的全基因组序列**中，高精度、跨越数个数量级时间尺度重建近现代与古老历史时期的有效群体大小动态，并支持在假定干净分化（Clean-split）模型下精准估计群体分歧时间。

---

## 2. 核心数学模型与数据结构

### 2.1 条件位点频谱（Conditional SFS）与马尔可夫共祖耦合

SMC++ 的核心理论突破在于设计了巧妙的复合隐马尔可夫模型：
- 将群体样本分解为一个**区分样本（Distinguished Lineage）** 与其余 $N$ 个常规未定相个体；
- 设区分样本在某染色体区段的局部共祖时间为隐藏状态 $T$；
- **观测发射概率**：模型不再仅仅观测二值化的单倍型是否匹配，而是观测在给定的区分样本状态下，其余 $N$ 个个体在该位点所呈现的**等位基因突变频数（即条件位点频谱 Conditional SFS）**：
  $$P(\text{DerCount} = k \mid T)$$
- 区分谱线与背景群体之间发生共祖的时间 $T$ 直接调制了全群体 SFS 的分布形态：若 $T$ 极近，突变主要以罕见低频等位基因存在；若 $T$ 极深，该位点突变将在全群体中呈现高频多态。

这一设计完美吸收了数百个未定相样本提供的海量近期突变信息，使得模型对近期历史（距今数百年至数千年）的分辨率大幅跃升，且彻底摆脱了对全群体定相的苛刻要求。

### 2.2 连续样条平滑（Cubic Splines）与 $N_e(t)$ 参数化

传统 PSMC/MSMC 将历史划分为阶梯状离散固定窗口，易产生人为参数边界伪影。SMC++ 采用**三次平滑样条（Cubic Splines）** 对对数有效群体大小进行连续参数化：
$$\log N_e(t) = \sum_{k} \alpha_k B_k(\log t)$$

结合惩罚似然函数（Penalized Likelihood）控制曲率，输出自然平滑且生理学真实的连续人口历史演化曲线。

### 2.3 干净分化模型（Clean-split Divergence Model）

在推断两个群体（Pop1 与 Pop2）的分化历史时：
- 模型假设在分化时间点 $T_{\text{split}}$ 之前，两群体合并为一个共同祖先泛混种群；在 $T_{\text{split}}$ 之后，两群体相互隔离并各自遵循独立的有效群体大小轨迹；
- 利用两群体的联合未定相二维条件位点频谱，同时联合优化求解 $N_{e, 1}(t)$、$N_{e, 2}(t)$ 以及精确的分化年代 $T_{\text{split}}$。

---

## 3. 算法复杂度与计算性能

1. **计算性能卓越**：核心优化算法由 C++ 与 Python 混合编写，利用高斯求积（Gaussian Quadrature）加速积分运算。
2. **轻松吞吐数百全基因组**：处理来自几百个未定相个体的全基因组 VCF 文件，在常规 16 核服务器上仅需 2–6 小时即可完成全部优化收敛。
3. **输入格式简便**：提供一站式 `vcf2smc` 转换脚本，原生兼容标准多样本 VCF 文件与可比对性掩码 BED 文件。

---

## 4. 植物基因组学应用场景与科研价值

植物群体全基因组重测序通常包含几十至数百个农家种或野生居群样本，往往缺乏染色体级别的定相支撑：
- **农业作物近代驯化剧烈收缩历史还原**：在水稻、玉米、大豆的大规模群体中，SMC++ 能够从数百个未定相重测序个体中，以极高的近代分辨率准确捕捉到农业驯化早期（距今 1 万年前后）伴随的极端有效群体规模剧降；
- **野生种群亚群分化与避难所隔离时间测定**：测定植物地理生态型（如高海拔耐冷生态型与低海拔敏感型）分化分歧的精确历法年代；
- **免去繁琐定相的分析鲁棒性**：彻底规避了因长读长定相不准造成的近期历史伪反弹假象。

---

## 5. 输入输出规范与关键参数指南

### 5.1 核心分析流程与执行命令 (Python / SMC++)
```bash
# 步骤 1: 将未定相多样本 VCF 转换为 SMC++ 专用输入格式
# 指定区分个体区分标签 (如 PopA_ind1)，其余作为背景群体
smc++ vcf2smc \
  --mask mappability_mask.bed.gz \
  plant_popA.vcf.gz \
  chr01_popA.smc.gz \
  chr01 \
  PopA:PopA_ind1,PopA_ind2,PopA_ind3,PopA_ind4

# 步骤 2: 单群体有效群体大小历史推断 (支持传入所有染色体)
smc++ estimate \
  --cores 16 \
  --spline cubic \
  -o popA_estimate/ \
  6.5e-9 \
  chr01_popA.smc.gz chr02_popA.smc.gz ...

# 步骤 3: 提取双群体联合数据并推断分化时间 (Clean-split)
smc++ vcf2smc -m mappability.bed.gz joint.vcf.gz chr01_joint.smc.gz chr01 PopA:PopA1,PopA2 PopB:PopB1,PopB2
smc++ split \
  --cores 16 \
  -o split_estimate/ \
  popA_estimate/model.final.json \
  popB_estimate/model.final.json \
  chr*_joint.smc.gz

# 步骤 4: 结果绘图输出实际历法曲线 (世代时间 g=1)
smc++ plot -g 1 -u 6.5e-9 popA_history.png popA_estimate/model.final.json
```

### 5.2 关键参数说明
- `6.5e-9`：物种的每代每碱基突变率，直接决定时间坐标与 $N_e$ 的绝对物理尺度。
- `--spline cubic`：采用三次样条插值拟合连续的平滑有效群体大小曲线。

---

## 6. 阅读与复现资源

- **原始研究论文**：[Nature Genetics 2017 DOI: 10.1038/ng.3748](https://doi.org/10.1038/ng.3748)
- **PMC 全文**：[PMC5470542](https://pmc.ncbi.nlm.nih.gov/articles/PMC5470542/)
- **SMC++ 官方源码仓库**：[popgenmethods/smcpp GitHub](https://github.com/popgenmethods/smcpp)
- **站内配套专题**：[群体历史动态与有效群体大小推断](../../topics/population-genetics/m05-topic-06/)
- **站内配套专题**：[群体遗传变异与分化统计指标](../../topics/population-genetics/m05-topic-01/)
