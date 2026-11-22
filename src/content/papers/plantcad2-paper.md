---
title: "PlantCAD2: A DNA foundation model for interpreting genomes across flowering plants"
summary: "提出面向开花植物的长上下文 Caduceus/Mamba2 DNA 基础模型及跨物种基准。"
authors: "Zhai J, Gokaslan A, Hsu S-K, Chen S-P, Liu Z-Y, Marroquin E, Czech E, Cannon B, Berthel A, Romay MC, Pennell M, Kuleshov V, Buckler ES"
year: 2026
journal: Cell Genomics
doi: 10.1016/j.xgen.2026.101329
type: method
methodIds: [plantcad2]
domainIds: [regulatory-genomics-ai]
speciesIds: [maize]
status: published
updatedAt: 2026-11-22
---
## 研究问题与方法设计

植物基因组跨物种差异明显，长距离调控和核苷酸级功能定位要求模型兼顾上下文和序列方向。PlantCAD2 在 65 个被子植物基因组上训练，论文报告 676M 参数，并提供最长 8192 bp 的单碱基上下文。架构基于 Caduceus 与 Mamba2 状态空间建模，结合双向序列处理和反向互补等变性；其实现路线与 Transformer 类 AgroNT 不同。

## 任务与主要结果

论文评估序列保守性、染色质可及性、表达和翻译相关任务。报告的比较包括其 zero-shot 保守性基准中 12 项任务有 10 项优于所测 Evo2 7B 设置、参数高效微调的跨物种任务与 AgroNT 1B 的比较，以及玉米开放染色质预测中上下文长度扩展对应 AUPRC 0.587 到 0.711 的变化。上述结果绑定论文特定数据切分、指标和比较设置，不代表跨任务普遍领先。论文还分析上下文长度等因素对预测的作用。

## 限制与复现关注点

长上下文会增加推理资源需求；跨物种性能受预训练物种、同源序列泄漏和标签质量影响。特定任务的可及性标签不等价于所有调控元件或组织中的真实因果功能。复现时固定代码与权重版本、基因组坐标与组装版本、输入窗口边界、模型头和按物种划分方案。当前网站只核实论文与公开资源，未在本地部署权重或重新计算基准结果。

## 阅读重点与原始来源

阅读模型架构、跨物种划分和不同上下文长度比较时，分别核对测试集合、基线模型和评价单位。论文：[Cell Genomics](https://doi.org/10.1016/j.xgen.2026.101329)、[PubMed](https://pubmed.ncbi.nlm.nih.gov/42567165/)、[PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC13576720/)、[官方代码](https://github.com/plantcad/plantcad)。
