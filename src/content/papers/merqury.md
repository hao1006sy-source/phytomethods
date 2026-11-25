---
title: "Merqury: reference-free quality, completeness, and phasing assessment for genome assemblies"
summary: "提出基于无偏高准确度测序读段 k-mer 频谱的无参考基因组质控理论，建立共识碱基准确度质量值 (QV)、组装完整度 (Completeness)、等位序列冗余拷贝数与单倍型分相连续性 (Phasing Block) 的严格数学评估体系。"
authors: "Rhie A, Walenz BP, Koren S, Phillippy AM"
year: 2020
journal: Genome Biology
doi: 10.1186/s13059-020-02134-9
type: method
method: merqury
methodIds: [merqury]
domainIds: [genome-assembly]
speciesIds: [arabidopsis]
status: published
updatedAt: 2026-11-25
---

## 研究背景与算法贡献

在长读段组装技术快速迭代的背景下，评估基因组拼接质量的传统方法暴露出严重缺陷：
- **依赖既有参考基因组的比对法**：传统评估通过将待测组装比对至旧版本参考基因组（如拟南芥 Col-0 或水稻 Nipponbare）计算结构一致性。然而，当新组装质量与连续性超越旧参考、或研究对象属于高分化野生近缘种时，比对法会将真实的生物学大片段结构变异（SVs）错误判定为拼接结构错接（Chimeras），并继承旧参考的缺口偏倚；
- **依赖保守基因完整度的评估（如 BUSCO）**：BUSCO 仅评估基因组中极小比例（约 1%~2%）的高度保守单拷贝蛋白质编码基因，对于非编码区、转座元件巢穴、着丝粒及染色体骨架的大量碱基错误和分相错误完全盲区。

由美国国家人类基因组研究所（NHGRI）Arang Rhie 与 Adam Phillippy 等人开发的 **Merqury**，彻底革新了基因组组装的质控范式。其核心贡献在于提出**完全无需参考基因组（Reference-free）的 k-mer 集合谱学评估理论**：
1. **真实基因组基准构建**：直接从独立的高准确度短读段（Illumina）或高保真长读段（HiFi）中统计 $k$-mers 频率，构建无偏真实的基因组 k-mer 数据库（通过 Meryl 工具）；
2. **碱基准确度 Phred-scale QV 严格建模**：通过计算组装中出现的“未在真实读段中检出”的非法 k-mer 比例，结合二项分布与泊松统计反推单碱基错误概率，给出标准质量分值（QV）；
3. **单倍型分相与嵌合错误定量解析**：引入亲本特异性标记（Hap-mers），首创单倍型色层柱状图（Spectra-cn / Spectra-asm）与分相块（Phase Block NG50）及分相跳跃错误率（Switch Error Rate）的数学量化指标。

---

## 核心数学模型与数据结构

Merqury 构建于高效的 k-mer 计数引擎 **Meryl** 之上，其数学推导与频谱模型如下：

```
                 全基因组高准确度 Reads (Illumina / HiFi)
                                │
                                ▼
                   [Meryl: 构建真实 k-mer 计数集 R]
                                │
           ┌────────────────────┴────────────────────┐
           ▼                                         ▼
   [组装序列 A 的 k-mer 集合]              [亲本测序数据构建特异标记]
           │                                 Mat-mers & Pat-mers
           ▼                                         │
   [集合交集与差集运算]                              │
• A ∩ R: 组装支持的真实 k-mers                       │
• A \ R: 组装中虚构的错误 k-mers                     │
           │                                         │
   ┌───────┴───────┐                                 │
   ▼               ▼                                 ▼
[计算 QV 分值]   [计算 Completeness]           [分相块与色谱图]
• 碱基错误率 P    • k-mer 召回率              • Spectra-cn (多倍性/拷贝数)
• QV = -10 logP   • 基因组完整度              • Phase Block NG50
                                              • Switch Error Rate
```

1. **共识质量值（QV, Consensus Quality Value）数学推导**：
   设组装序列总长度为 $L$，k-mer 长度为 $k$，组装中提取出的唯一 k-mer 总数为 $N$。若在真实测序读段集合 $R$ 中未找到（出现频次为 0）的错误 k-mer 数量为 $E$。
   假定每个碱基发生错误的概率为 $P$，且碱基间错误相互独立，则一个长为 $k$ 的 k-mer 没有任何碱基错误的概率为 $(1 - P)^k$。由此得出错误 k-mer 的比例期望：
   $$\frac{E}{N} = 1 - (1 - P)^k \implies P = 1 - \left(1 - \frac{E}{N}\right)^{1/k}$$
   根据国际标准的 Phred 分值定义，组装碱基共识质量值计算为：
   $$\text{QV} = -10 \log_{10}(P) = -10 \log_{10}\left(1 - \left(1 - \frac{E}{N}\right)^{1/k}\right)$$
   例如：当 $\text{QV} = 50$ 时，代表组装碱基准确度为 99.999%（每 10 万个碱基仅有 1 个错误）；
2. **组装完整度（k-mer Completeness）**：
   在过滤掉低频测序错误 k-mers 后，设基因组真实可信的特异 k-mer 集合为 $R_{\text{solid}}$。组装完整度直接定义为组装中已成功恢复的可信 k-mer 比例：
   $$C = \frac{|A \cap R_{\text{solid}}|}{|R_{\text{solid}}|} \times 100\%$$
3. **Spectra-cn 拷贝数与假二倍体塌缩诊断**：
   以测序读段中的 k-mer 覆盖乘数（Multiplicity）为横坐标，以组装序列包含该 k-mer 的拷贝数（Copy Number）赋予不同色彩（例如 1-copy 为红色、2-copy 为蓝色、0-copy 为灰色）。若二倍体植物组装发生单倍型人工塌缩（Collapsed Assembly），原本应属于 1-copy 的杂合峰将异常显示为 2-copy，或在缺失单倍型中表现为未组装的巨大 0-copy 峰。

---

## 植物基因组学应用场景与科研价值

1. **复杂多倍体与高杂合农作物组装验收黄金标准**：
   国际脊椎动物与植物参考基因组联盟（EBP / VGP）已将 Merqury 确立为必选的底层质量指标（验收门槛通常为 $\text{QV} \ge 40$ 且 $\text{Completeness} \ge 95\%$）。在评估普通小麦、甘蔗、草莓等复杂多倍体时，Spectra-cn 图可清晰揭示同源亚基因组是否发生了嵌合塌缩；
2. **染色体挂载前重叠群去杂合冗余（Purge Dups）效果核查**：
   在利用 purge_dups 剥离杂合替代重叠群时，研究人员可通过 Merqury 对比去冗余前后的 k-mer 频谱，精确确认是否误删除了真实的串联同源重复序列；
3. **动植物杂交群体分相连续性评估**：
   对于拟南芥、水稻 F1 杂交种或自交不亲和野生品系，利用父母本特异性 Hap-mers，Merqury 能精细定位组装序列中单倍型转换错误（Switch errors）与迁移错误（Hamming errors）的物理断点坐标。

---

## 阅读与复现资源

- **论文全文**：[Genome Biology, 21(1), 245 (2020)](https://doi.org/10.1186/s13059-020-02134-9)
- **PubMed 记录**：[PMID: 32907985](https://pubmed.ncbi.nlm.nih.gov/32907985/)
- **官方开源代码仓库**：[GitHub - marbl/merqury](https://github.com/marbl/merqury)
- **相关算法工具详情**：[Merqury 算法原理与指南](../../methods/merqury/)
