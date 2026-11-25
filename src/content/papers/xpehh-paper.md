---
title: "Genome-wide detection and characterization of positive selection in human populations"
summary: "提出跨群体延伸单倍型纯合性检验（XP-EHH），利用不同谱系间单倍型纯合延伸不对称性精准识别正向选择信号。"
authors: "Sabeti PC, Varilly P, Fry B, et al.; International HapMap Consortium"
year: 2007
journal: Nature
doi: 10.1038/nature06250
type: method
methodIds: []
domainIds: [population-genetics]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

# Genome-wide detection and characterization of positive selection in human populations: The XP-EHH Statistic

## 1. 研究背景与算法贡献

在演化生物学与群体基因组学中，检测基因组上的**正向自然选择与适应性进化信号**对于揭示物种如何适应严酷环境、抵抗病原侵染以及解析农业驯化分子机制至关重要。经典的群体分化度量（如单一 SNP 的 $F_{ST}$）虽然能反映等位基因频率差异，但极易受到中性随机遗传漂变（Genetic Drift）的严重干扰，且无法区分分化究竟是由正选择驱动还是中性瓶颈导致；而单群体单倍型纯合性指标（如 iHS）虽然对正在经历选择的中等频率突变灵敏，但在目标群体中突变等位基因已经接近固定（Fixed）或达到极高频率时，由于祖先等位基因单倍型样本量耗尽而完全丧失检测效力。

2007 年，哈佛大学与 Broad 研究所的 Pardis C. Sabeti、Patrick Varilly 与国际 HapMap 联盟在 *Nature* 上发表了里程碑式的全基因组正选择图谱论文。该论文在统计方法学上的最大突破在于系统提出了**跨群体延伸单倍型纯合性统计量（Cross-Population Extended Haplotype Homozygosity, XP-EHH）**。XP-EHH 创新性地利用了两个不同群体之间在同一染色体区段上的单倍型纯合延伸物理不对称性，能够在目标群体突变已经完全固定、且对照群体仍保持中性重组打断的状态下，以单基因级别的极高物理分辨率精准定位正向选择靶标，确立了全球跨群体选择扫荡检测的奠基性理论。

---

## 2. 核心数学模型与数据结构

### 2.1 延伸单倍型纯合性（EHH）沿染色体的积分

设对于核心测试单核苷酸位点 $x$：
- 考察某个群体中的所有单倍型集合；
- **EHH 衰减函数**：定义为从核心位点 $x$ 向染色体上游或下游延伸距离 $d$ 处，随机抽取的两条单倍型在区间 $[x, x + d]$ 内保持完全纯合一致的概率；
- **单倍型积分面积（Integrated EHH, iHH）**：
  $$iHH = \int_{x_{\text{left}}}^{x_{\text{right}}} EHH(d) \, \text{d}d$$
  积分在 EHH 随物理/遗传距离衰减至接近背景水平（通常设定截断阈值为 0.05）时停止。

### 2.2 跨群体单倍型纯合面积比值与对数变换

当一个有利变异在群体 A 中经历强正向选择扫荡时：
- 该变异及其连锁的侧翼中性单倍型在极短时间内扩散至全群体，来不及发生充分的减数分裂重组，导致群体 A 的单倍型纯合延伸区段异常漫长，其积分面积 $iHH_A$ 极大；
- 在未经历该选择压力的对照群体 B 中，漫长的历史中性重组将单倍型充分打碎，其积分面积 $iHH_B$ 极其狭窄；
- **非标准化 XP-EHH 统计量** 定义为两群体全单倍型纯合积分面积的自然对数比值：
  $$\text{unstandardized } XP\text{-}EHH(x) = \ln \left( \frac{iHH_A(x)}{iHH_B(x)} \right)$$

若在位点 $x$ 处发生目标群体 A 的特异性选择扫荡，该比值呈现巨大的正值；反之，若群体 B 发生选择，该比值呈现负值。

### 2.3 全基因组标准化变换与显著性检验

为了消除不同染色体物理背景与全局重组率基线的差异，算法将全基因组所有测试标记的非标准化分值减去全局均值并除以标准差：
$$XP\text{-}EHH = \frac{\text{unstandardized } XP\text{-}EHH - \mu_{\text{global}}}{\sigma_{\text{global}}}$$

经变换后，$XP\text{-}EHH$ 统计量在全基因组中性背景下近似服从标准正态分布 $\mathcal{N}(0, 1)$。通常将 $XP\text{-}EHH > 2.5$（对应单侧 $p < 0.006$）或全基因组排名前 1% 的显著极值区段判定为高置信度的正向选择候选区。

---

## 3. 算法复杂度与计算性能

1. **计算复杂度**：需在全基因组每个标记处计算双向单倍型一致性概率，计算复杂度与单倍型条数呈二次方关系 $O(N_{\text{snps}} \cdot M^2)$。
2. **现代多线程加速**：随着后续专业计算程序（如 `selscan`）的研发，现代基于位掩码与 Pthreads 的多线程实现能够在 10–30 分钟内完成全基因组数百万标记的双群体高速计算。
3. **输入严格依赖物理定相（Phasing）**：与 PSMC/SMC++ 类似，XP-EHH 强制要求输入的基因型必须具备高精度的染色体物理定相（Phased Haplotypes）。

---

## 4. 植物基因组学应用场景与科研价值

植物在人工驯化与抗逆适应中，形成了大量在某一生态型中高度固定、而在野生祖先种或不同生态型中保持中性的特异性适应单倍型：
- **作物品种水田与旱作生态型适应性分化定位**：在亚洲栽培水稻中，比较旱稻地方品种与普通浅水田水稻，XP-EHH 能够以极高的信噪比准确定位出在旱稻中已完全固定的深根系形成基因 *DRO1* 与耐干旱渗透调节顺式调控元件；
- **高纬度与耐盐碱极端种质选择清除挖掘**：在大豆与大麦从热带向高纬度寒冷地区扩散过程中，定位控制光周期敏感性突变与开花抑制因子的选择区段；
- **与 XP-CLR 及 $F_{ST}$ 形成四重互补证据链**：在现代植物群体基因组学论文中，XP-EHH（基于长单倍型纯合延伸）、XP-CLR（基于多位点频率空间复合似然）、单标记 $F_{ST}$（群体分化）以及核苷酸多样性比值（$\pi_{\text{wild}} / \pi_{\text{cultivated}}$）共同构成了选择性清除鉴定的四重互补验证黄金证据链。

---

## 5. 输入输出规范与关键参数指南

### 5.1 核心数据结构与调用逻辑 (基于标准 selscan 执行)
```bash
# 步骤 1: 准备两群体已定相的双等位基因 VCF 文件 (如 rice_phased.vcf.gz)
# 分别提供目标群体 (cultivar_ids.txt) 与对照群体 (wild_ids.txt) 样本编号

# 步骤 2: 运行多线程 selscan 计算全基因组 XP-EHH
selscan \
  --xpehh \
  --vcf rice_phased.vcf.gz \
  --pop1 cultivar_ids.txt \
  --pop2 wild_ids.txt \
  --map rice_genetic_map.txt \
  --threads 16 \
  --out chr01_xpehh_raw

# 步骤 3: 全基因组正态标准化 (生成标准正态化 Z-score)
norm --xpehh --files chr01_xpehh_raw.xpehh.out

# 步骤 4: 结果提取与候选基因功能注释
# 提取标准化后 xpehh > 2.5 且连续聚集的候选物理区间，与参考注释 GFF/GTF 取交集
```

### 5.2 关键注意事项
- 群体定义方向性：`--pop1` 必须指定为预期的受选择群体，`--pop2` 为对照未受选择群体；若颠倒群体顺序，所得 XP-EHH 分值符号相反。
- 必须确保输入的两个群体样本量适中（通常每个群体至少包含 20 至 50 个个体以上），以保证单倍型频率采样的统计稳定性。

---

## 6. 阅读与复现资源

- **原始研究论文**：[Nature 2007 DOI: 10.1038/nature06250](https://doi.org/10.1038/nature06250)
- **PubMed 记录**：[PMID: 17943131](https://pubmed.ncbi.nlm.nih.gov/17943131/)
- **高性能计算工具实现**：[selscan 官方仓库](https://github.com/szpiech/selscan)
- **站内配套专题**：[选择性清除与自然选择检测](../../topics/population-genetics/m05-topic-05/)
- **站内配套专题**：[群体遗传变异与分化统计指标](../../topics/population-genetics/m05-topic-01/)
