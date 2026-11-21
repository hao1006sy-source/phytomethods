---
title: "SweepFinder2: increased sensitivity, robustness and flexibility"
summary: "在 SweepFinder 框架上纳入局部重组率和背景选择影响，扩展单群体选择清除扫描。"
authors: "DeGiorgio M, Huber CD, Hubisz MJ, Hellmann I, Nielsen R"
year: 2016
journal: Bioinformatics
doi: 10.1093/bioinformatics/btw051
type: method
methodIds: [sweepfinder2]
domainIds: [population-genetics]
speciesIds: []
status: draft
updatedAt: 2026-11-21
---
## 方法贡献

SweepFinder2 延续按基因组空间分布的等位基因频率谱识别清除的复合似然框架，进一步支持在背景选择影响下调整中性频率谱，并考虑局部重组率和固定差异位点。论文以模拟及分析说明新增处理能够改善某些场景下的稳健性和灵活性；运行前仍需为物种、采样和外群数据设定适当的模型输入。

软件手册列出单染色体频率文件、经验频率谱、重组率文件、B 值图及可自定义测试网格。B 值校正有明确人口参数和样本单系假设，不能将可选开关理解为自动消除背景选择混杂。[原文](https://doi.org/10.1093/bioinformatics/btw051)；[PubMed](https://pubmed.ncbi.nlm.nih.gov/27153702/)；[作者手册](https://degiorgiogroup.fau.edu/Manual_SweepFinder2_v1.0.pdf)。

植物应用：[水稻 TE 标记与选择扫描](../rice-temarker-sweeps/)；软件：[SweepFinder2 工具页](../../methods/sweepfinder2/)；相关主题：[M05-05 选择性清除](../../topics/population-genetics/m05-topic-05/)。
