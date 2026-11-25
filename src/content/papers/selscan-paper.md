---
title: "selscan: an efficient multi-threaded program to perform EHH-based scans for positive selection"
summary: "提出基于延伸单倍型纯合性（EHH）的高性能多线程全基因组正向选择扫荡扫描工具 selscan。"
authors: "Szpiech ZA, Hernandez RD"
year: 2014
journal: Molecular Biology and Evolution
doi: 10.1093/molbev/msu211
type: method
methodIds: [selscan]
domainIds: [population-genetics]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

# selscan: an efficient multi-threaded program to perform EHH-based scans for positive selection

## 1. 研究背景与算法贡献

在自然选择（正选择 / 适应性进化）作用下，一个新出现的有利突变或原本处于低频的等位基因频率迅速在群体中攀升。根据遗传搭车（Genetic Hitchhiking）效应，该有利突变所连锁的周围中性单倍型区段来不及被减数分裂重组事件打断，从而与因果突变一同被拖拽至高频，在染色体局部形成显著的长程**延伸单倍型纯合性（Extended Haplotype Homozygosity, EHH）**。

基于单倍型纯合延伸的统计检验（如整合单倍型纯合分值 iHS、跨群体延伸单倍型纯合分值 XP-EHH 以及基于位点纯合性的 nSL）是捕捉近期强选择信号（硬选择或进行中的软选择扫荡）的核心工具。然而，由于计算 EHH 需要在每个候选测试核心位点向两侧双向扩展扫描成百上千条单倍型，其算法涉及大量的两两单倍型比对与积分求和。早期的 R 或 Perl 实现由于单线程限制，处理全基因组数百万个标记时往往需要数天乃至数周，严重阻碍了大规模重测序群体的全基因组扫描。

加利福尼亚大学旧金山分校（UCSF）的 Zachary A. Szpiech 与 Ryan D. Hernandez 在 2014 年推出了 **selscan**（发表于 *Molecular Biology and Evolution*）。selscan 采用纯 C 语言编写并设计了高效的 POSIX 多线程（Pthreads）并行架构，系统实现了 iHS、XP-EHH 以及后续拓展的 nSL 统计量的超高速计算，在保持完全数学等价的前提下将全基因组扫描速度提升了 **一个至两个数量级**，成为全球群体基因组学选择扫荡扫描的标准首选软件。

---

## 2. 核心数学模型与数据结构

### 2.1 延伸单倍型纯合性（EHH）与单单倍型积分（iHH）

设在核心测试标记位点 $x_0$ 处，全群体包含携带祖先等位基因（Ancestral, `0`）的单倍型集合与携带衍生等位基因（Derived, `1`）的单倍型集合。
向染色体两侧物理距离 $x$ 处延伸：
- **EHH 统计量**：定义为从核心等位基因出发，随机抽取的两条携带相同核心等位基因的单倍型在区间 $[x_0, x]$ 内完全一致的概率；
- **积分单倍型纯合度（Integrated Haplotype Homozygosity, iHH）**：
  $$iHH = \int_{x_{\text{left}}}^{x_{\text{right}}} EHH(x) dx$$
  积分边界截断点通常设定在 $EHH(x)$ 衰减至低于预设阈值（默认 0.05）的物理或遗传坐标处。

### 2.2 单群体整合单倍型得分（Integrated Haplotype Score, iHS）

iHS 专门用于在单一群体内部检测**正在经历强正选择但尚未完全固定（中间频率，如 20%–80%）的近期选择信号**：
- 计算衍生等位基因与祖先等位基因积分的自然对数比值：
  $$\text{unstandardized } iHS = \ln \left( \frac{iHH_{\text{derived}}}{iHH_{\text{ancestral}}} \right)$$
- 若新出现的衍生等位基因受到强正选择，其单倍型延伸长度远超古老的祖先单倍型，使得非标准化分值显著大于 0；
- **等位基因频率分箱标准化**：由于罕见等位基因的方差较大，selscan 配套的 `norm` 程序将全基因组标记按衍生等位基因频率划分为若干频段（Bin），在每个频段内部减去均值并除以标准差，生成标准正态化的 $iHS \sim \mathcal{N}(0, 1)$。通常将 $|iHS| > 2.5$ 或最高 1% 极值位点作为强选择候选。

### 2.3 跨群体延伸单倍型纯合度（Cross-Population EHH, XP-EHH）

XP-EHH 专门用于检测**在目标群体（Pop1）中接近或达到固定、而在对照参考群体（Pop2）中尚未发生选择的跨群体定向选择差异**：
- 计算目标群体与对照群体全单倍型积分的对数比：
  $$\text{unstandardized } XP\text{-}EHH = \ln \left( \frac{iHH_{\text{Pop1}}}{iHH_{\text{Pop2}}} \right)$$
- 经全基因组统一标准化后，正极值（如 $XP\text{-}EHH > 3$）直接指示在目标群体中由于定向适应而发生特异性选择扫荡的染色体区段。

---

## 4. 植物基因组学应用场景与科研价值

植物在人工驯化与极端环境适应中历经强烈的选择重塑：
- **水稻去驯化（杂草稻 Weedy Rice）适应性演化解析**：在韩国杂草稻与中国杂草稻全基因组研究中，利用 selscan 计算 XP-EHH，系统锁定了杂草稻在逃脱农田管理重新野生化过程中，在落粒性、休眠性及株型关键位点处重新经历的强烈正向自然选择扫荡；
- **旱稻与水田水稻耐旱性分化选择**：比较旱稻地方品种与普通水稻，挖掘在旱稻中特异性固定的根系构型与渗透调节基因；
- **高海拔耐冷适应性基因扫描**：在青藏高原高海拔大麦（青稞）与平原大麦比较中，精准定位耐低温与强紫外线辐射的关键单倍型延伸区段。

---

## 6. 阅读与复现资源

- **原始研究论文**：[Molecular Biology and Evolution 2014 DOI: 10.1093/molbev/msu211](https://doi.org/10.1093/molbev/msu211)
- **PubMed 记录**：[PMID: 25016584](https://pubmed.ncbi.nlm.nih.gov/25016584/)
- **selscan 官方源码仓库**：[szpiech/selscan GitHub](https://github.com/szpiech/selscan)
- **站内配套专题**：[选择性清除与自然选择检测](../../topics/population-genetics/m05-topic-05/)
- **站内配套专题**：[群体遗传结构与主成分分析](../../topics/population-genetics/m05-topic-03/)
