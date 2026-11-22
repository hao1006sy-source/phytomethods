---
title: SweepFinder2
name: SweepFinder2
summary: 依据群体位点频率谱沿基因组的空间变化计算清除复合似然比，并可建模背景选择。
dataType: 单群体 SNP 位点频率谱、祖先状态及可选重组率/B 值
principle: 位点频率谱复合似然与背景选择校正
domainIds: [population-genetics]
topicIds: [m05-topic-05]
principleIds: [site-frequency-spectrum-scan, composite-likelihood-selection]
dataIds: [variant-data]
paper: sweepfinder2-paper
repository: https://github.com/mdegiorgio/SweepFinder2
status: published
updatedAt: 2026-11-22
---
## 一句话简介与开发背景

SweepFinder2 是 DeGiorgio 等于 2016 年发布的 C 程序，用于依据单群体位点频率谱（site frequency spectrum，SFS）的空间分布扫描近期选择性清除，并扩展了对背景选择及突变率变化的处理。[方法论文](../../papers/sweepfinder2-paper/)；[开发者项目页](https://degiorgiogroup.fau.edu/sf2.html)；[源代码仓库](https://github.com/mdegiorgio/SweepFinder2)。开发者页发布了手册与程序，代码仓库标注 GPL-3.0；可用资料中的程序手册版本为 1.0。运行时应保存实际源码版本和编译记录。

## 研究问题与模型

近期清除会改变受选择位点邻域的等位基因频率谱，并且信号沿物理或遗传距离衰减。SweepFinder2 在候选位置上比较：以经验中性频率谱为背景的零假设，和包含一个清除模型的备择假设。输出的复合似然比（composite likelihood ratio，CLR）刻画两模型相对拟合支持，不是经人口史校准后的 P 值。

SweepFinder2 建立在 SweepFinder 的空间频率谱方法上。其扩展可利用局部重组率，并把背景选择造成的多样性降低纳入频谱调整：B 值用于表示不同位置背景选择导致的相对多样性保留；B 较低处的中性期望频谱相应调整。该模型还可包含由外群信息识别的固定差异位点。B 值不是由 SweepFinder2 自动估计的无误差真值，而是需要外部模型、数据和假设支持的输入。[DeGiorgio 等，2016](https://doi.org/10.1093/bioinformatics/btw051)；[Huber 等，2016](https://doi.org/10.1111/mec.13351)。

## 算法流程

1. 从单一分析群体整理按染色体排序的变异位置、等位基因计数、每个位点有效样本等位基因数，以及该位点是否完成祖先/衍生极化。
2. 合并适合充当中性背景的全基因组位点，使用 `-f` 估计经验频率谱；背景集合及可检测区域需经过设计，不能让大量受候选选择的区域不加筛选地决定零假设。
3. 在每条染色体上按等距或用户指定网格遍历候选位置，计算零假设和清除备择下的空间似然比。
4. 在有可靠局部遗传图谱时提供重组率；需要背景选择校正时提供与样本和外群设计相符的 B 值图，并满足手册提出的群体共同祖先时间假设。
5. 将 CLR 作为候选排序统计量，使用匹配样本、人口历史、重组与可检测区域的模拟或其他校准方法评估尾部阈值，再结合独立证据检查候选。

与 XP-CLR 不同，SweepFinder2 本身不把两个群体作为对照输入；它从单群体频率谱和位置结构中寻找信号。其主要比较依赖 SFS 中低频/高频变异的模式和局部谱变化。未极化位点可通过 folded 标志记录；可靠极化需要外群，祖先状态错误会改变衍生频率类别。

## 输入、输出和实际运行

官方手册规定频率输入为带表头、制表符分隔的文件，每条染色体单独一个文件，包含 `position`、`x`、`n`、`folded` 四列。`x` 是等位基因计数；当 `folded=0` 时，它表示衍生等位基因计数；`folded=1` 表示位点未极化，频谱按折叠方式处理。`n` 是该位点实际可用等位基因总数。若样本缺失，`n` 可逐位点变化，必须依据准确的可检测样本数计算。

频率谱由跨染色体的背景频率文件估计；窗口扫描则用单染色体频率文件。`-lr` 可使用经验频率谱与重组图，`-lrg` 的参数为近似网格间距。官方手册还列出 `-lb` / `-lrb` 背景选择相关模式；B 值、重组图和频率文件必须具有完全匹配的位点顺序及坐标。

```bash
# 在背景频率文件中估计经验频率谱
./SweepFinder2 -f genome_background.freq.tsv genome_background.sfs

# 为 chr01 按约 10 kb 网格扫描，使用重组率图
./SweepFinder2 -lrg 10000 chr01.freq.tsv genome_background.sfs \
  chr01.recombination.tsv chr01.clr.tsv
```

输出包含测试位置及对应的 CLR 结果，后续候选窗口的汇总、阈值和邻接合并策略由分析设计确定。软件编译与上述命令来自[开发者手册](https://degiorgiogroup.fau.edu/Manual_SweepFinder2_v1.0.pdf)；该命令尚未在本站真实植物基因型数据上运行。

## 植物应用

Yan 等在 176 份水稻材料中构建转座子插入标记，并用 SweepFinder2 对 SNP 和 TE 标记计算 CLR；扫描网格约 10 kb，以全基因组最高 1%窗口定义扫荡区，再合并相邻超过阈值的分数。论文报告该分析识别了与性状相关的 TE 扫荡候选；这些是群体统计候选，需要与其表型关联、标记质量和功能证据共同解释。[原始研究](https://doi.org/10.1016/j.xplc.2021.100270)；[全文方法](https://pmc.ncbi.nlm.nih.gov/articles/PMC9251385/)；[本站论文记录](../../papers/rice-temarker-sweeps/)。

该案例展示了同一统计框架用于 SNP 与 TE 插入标记的方式。群体、标记构建流程和过滤阈值各有定义；最高 1%是论文的经验阈值，不能视作软件的通用显著性标准。

## 相关方法与资源

SweepFinder2 使用单群体 SFS 与空间位置；XP-CLR 比较两个群体的多位点频率差异；selscan 计算相位单倍型延伸统计。三者检测的遗传信号不同，区域重叠或不重叠都需结合数据结构、模拟校准及群体历史解释。

相关资源：[M05-05 选择性清除专题](../../topics/population-genetics/m05-topic-05/)、[方法论文](../../papers/sweepfinder2-paper/)、[XP-CLR](../xpclr/)、[selscan](../selscan/)、[开发者软件与版本记录](https://degiorgiogroup.fau.edu/sf2.html)。
