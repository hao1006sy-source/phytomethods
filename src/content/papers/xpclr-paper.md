---
title: "Population differentiation as a test for selective sweeps"
summary: "提出 XP-CLR，通过跨群体连锁位点的等位基因频率分化复合似然扫描选择信号。"
authors: "Chen H, Patterson N, Reich D"
year: 2010
journal: Genome Research
doi: 10.1101/gr.100545.109
type: method
methodIds: [xpclr]
domainIds: [population-genetics]
speciesIds: []
status: published
updatedAt: 2026-11-22
---
## 方法贡献

Chen、Patterson 与 Reich 提出 XP-CLR（cross-population composite likelihood ratio），在中性模型下用共享祖先背景中的随机遗传漂变描述两群体 SNP 频率差异；在选择模型下则加入邻近受选择位点的频率变化。通过窗口内多个关联位点的复合似然比寻找与局部清除相容的候选区域。原文说明该统计量在特定模拟条件下具有检测能力，并展示了人群数据分析；这些结果不自动给出对植物种群的普适阈值。

方法关注跨群体频率分化和连锁邻域，需说明目标与对照群体、位点集合、遗传距离/重组信息、窗口参数及相关 SNP 权重。群体历史和重组率模型不匹配会影响候选解释。[PubMed 书目与摘要](https://pubmed.ncbi.nlm.nih.gov/20086244/)；[PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC2840981/)；[DOI](https://doi.org/10.1101/gr.100545.109)。

原文首次发表于 2010 年《Genome Research》20(3):393–402。相关实现：[XP-CLR 工具页](../../methods/xpclr/)；[M05-05 选择性清除专题](../../topics/population-genetics/m05-topic-05/)；[韩国杂草稻应用](../rice-weedy-selection/)。
