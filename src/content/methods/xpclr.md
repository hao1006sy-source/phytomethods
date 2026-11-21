---
title: XP-CLR
name: XP-CLR
summary: 基于两群体多位点等位基因频率差异和连锁结构的跨群体复合似然扫描。
dataType: 两个群体的 SNP 基因型与等位基因频率
principle: 跨群体等位基因频率复合似然
domainIds: [population-genetics]
topicIds: [m05-topic-05, m05-topic-07]
principleIds: [allele-frequency-differentiation, composite-likelihood-selection]
dataIds: [variant-data]
paper: xpclr-paper
repository: https://github.com/hardingnj/xpclr
status: draft
updatedAt: 2026-11-21
---
## 一句话简介与来源

XP-CLR（cross-population composite likelihood ratio）是 Chen、Patterson 与 Reich 于 2010 年提出的跨群体选择扫描方法。该方法检验两个群体之间一段连续基因组上的等位基因频率变化，是否与连锁选择模型相容。[方法论文](../../papers/xpclr-paper/)；[PubMed 记录](https://pubmed.ncbi.nlm.nih.gov/20086244/)。

本页代码链接指向 Python 实现 `hardingnj/xpclr`。仓库说明该实现按原始 XP-CLR 方法重写，支持 VCF、HDF5 及原始文本风格输入；仓库作者还说明重写缘于原始程序代码中的问题。它是一个实现分支，不能与 2010 年统计方法或历史研究中的原版二进制视为同一软件版本。[实现仓库和用法](https://github.com/hardingnj/xpclr)。

## 研究问题与输入条件

在一个群体经历局部正选择时，受选择位点附近的连锁 SNP 会呈现一段成组的频率偏移。XP-CLR 以一个群体作为目标、另一个群体作为对照，在多个相邻标记上评估这种偏移是否超过中性遗传漂变下的预期。它主要针对群体分化后发生、且在一个比较群体中较突出的选择过程；目标群体、对照群体和分化背景由分析者定义。

常见输入是经过一致质量控制的双群体 SNP 基因型或频率、染色体坐标，以及遗传距离或重组率信息。数据应位于相同参考组装及同一套可检测位点上；需检查样本身份、位点对应、缺失、等位基因编码和群体分组。方法本身不要求把统计量解释为相位单倍型长度；使用相位数据可以为特定实现中的 LD 相关性估计提供更多信息，但应按软件手册核对。

## 统计模型与核心流程

XP-CLR 的中性模型以共享祖先背景下两个群体的遗传漂变描述位点频率差异；备择模型加入一个受选择等位基因及其邻近连锁位点的频率变化。方法在滑动窗口中汇总多个位点的边际似然比，形成复合似然比（composite likelihood ratio，CLR）。它不是将窗口内所有 SNP 当作独立观测的普通似然：原方法依据对照群体中 SNP 间的连锁相关性对冗余位点作权重调整，减轻强连锁对信息量的重复计算。[原始模型说明](https://pmc.ncbi.nlm.nih.gov/articles/PMC2840981/)。

典型计算步骤为：

1. 将目标和参考群体基因型投影到同一套位点和染色体坐标，准备遗传距离或重组率。
2. 按物理或遗传距离划分扫描窗口，并在窗口中确定候选测试位置。
3. 对窗口中相邻标记估计两群体频率差异，以漂变模型和选择模型计算位点级似然贡献。
4. 使用连锁相关性权重降低高度相关 SNP 的重复贡献，合并边际似然比并输出窗口统计量。
5. 对分数进行全基因组背景或模拟校准，检查候选窗口的位点数、缺失和群体定义。

高 XP-CLR 分数表示观测到的局部频率变化更符合方法所设选择模型；分数不能直接读作选择系数、起始年代或因果证据。复合似然对位点依赖的处理是近似，人口史不匹配、结构、重组率和频率估计误差均可引入候选信号。

## 输入、输出与实现差异

`hardingnj/xpclr` 的 README 列出 VCF、由 scikit-allel 生成的 HDF5，以及兼容原程序文本结构的输入；命令参数包括群体样本表、遗传距离映射、染色体、窗口大小和步长、窗口 SNP 数、LD 权重截断与是否提供相位。输出字段包含模型与中性模型似然、拟合选择系数、窗口 SNP 数、坐标、CLR 及该实现计算的标准化分数。`xpclr_norm` 是此实现的归一化输出，不能与其他研究所用阈值不经校准直接对比。

```bash
# 参数名称依据 hardingnj/xpclr 仓库 README；执行前请用所安装版本的 --help 核对。
xpclr --format vcf --input rice.filtered.vcf \
  --samplesA cultivated.ids --samplesB wild.ids \
  --map rice.genetic.map --chr Chr01 \
  --size 50000 --step 20000 --maxsnps 200 --ld 0.95 \
  --out cultivated_vs_wild_chr01
```

`--size`、`--step` 和 `--maxsnps` 共同决定窗口的物理跨度与位点上限；位点密度不均时，同一碱基窗口可纳入不同数量的 SNP。`--ld` 是实现的相关性权重控制值，`--phased` 表示输入含相位信息。不要将不同软件、版本或分析群体的窗口参数默认为相同含义。该命令由仓库参数文档整理，本项目尚未用真实植物数据验证。

原始 XP-CLR 程序与社区 Python 实现之间在文件格式、参数语义、数值优化和输出列上可能存在差异。论文的分析复现应从论文方法及所用版本入手，不能仅凭相同统计量名称替换实现。官方原始软件的历史地址登记于 [David Reich Lab 软件目录](https://reich.hms.harvard.edu/software)；该目录当前不提供可访问的 XP-CLR 下载页。

## 植物应用

He 等对 30 份韩国野生稻、30 份地方栽培稻和 10 份野生稻材料进行全基因组重测序，使用 XP-CLR、XP-EHH、iHS、群体分化和多样性降低等统计量比较韩国地方稻与杂草稻。研究按各方法经验分布的前 2.5%定义扫描离群区，并将至少被两个方法支持的基因列为候选；不同统计量命中的基因数量并不相同。[原始研究](https://doi.org/10.1111/pbi.12630)；[全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC5316921/)。该研究使用 XP-CLR 程序，并不能验证本页所列 Python 重写程序的输出。

Liu 等在亚洲稻驯化研究中采用 XP-CLR 与 SweeD 等方法比较栽培稻和野生稻的候选扫荡区域。其结果显示不同方法所识别的区域数与重叠程度有差别，说明方法选择会影响候选集合。[原始研究](https://doi.org/10.1093/molbev/msw296)；[论文记录](../../papers/rice-deleterious-domestication/)。

## 与其他方法的关系

XP-CLR 依据两个群体的多位点频率变化；XP-EHH 比较两群体中延伸单倍型纯合性，依赖经过相位处理的密集标记；SweepFinder2 依据单群体位点频率谱及空间分布。FST 描述群体分化程度，单独的高 FST 并未包含 XP-CLR 的连锁选择模型。分析可并列报告互补方法，阈值、窗口与群体抽样必须分别说明。

相关资源：[M05-05 选择性清除](../../topics/population-genetics/m05-topic-05/)、[M05-07 驯化与环境适应](../../topics/population-genetics/m05-topic-07/)、[XP-CLR 方法论文](../../papers/xpclr-paper/)、[玉米驯化与适应案例](../../papers/maize-zeas-adaptation/)、[SweepFinder2](../sweepfinder2/)、[selscan 与 XP-EHH](../selscan/)、[PLINK 群体统计](../plink/)。
