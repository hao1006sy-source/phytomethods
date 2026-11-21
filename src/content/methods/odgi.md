---
title: ODGI
name: ODGI
summary: 处理、统计和可视化泛基因组图及样本路径。
dataType: GFA / 泛基因组图
principle: 图存储与路径可视化
domainIds: [pangenomics-structural-variation]
topicIds: [m03-topic-06, m03-topic-07]
principleIds: [graph-genomics]
dataIds: [graph]
paper: odgi-paper
repository: https://github.com/pangenome/odgi
status: published
updatedAt: 2026-11-22
---
## 方法定位
ODGI 提供图及嵌入路径的处理、统计和可视化。它可用于理解图结构和不同样本经过的路径，功能定位应与专门的 reads 比对器区分。

## 数据和结果
图的导入、路径提取及可视化命令需要对应版本的图格式和参数；结果图中的布局距离不必然等于基因组距离。应保留输入图版本、路径名称与坐标映射。[官方文档](https://odgi.readthedocs.io/)列出支持操作。

对基于 GFA 的常见处理，可按官方命令框架用 `odgi build -g graph.gfa -o graph.og` 将 GFA 建成 ODGI 图；`odgi stats -i graph.og` 汇总节点、边和路径等结构统计；`odgi sort` 生成更便于部分算法处理的节点顺序；`odgi viz` 输出路径图像，`odgi draw` 生成更细的图示。此处列出的是工具职责和命令接口，不是已实跑流程；详细参数、线程和输入图版本要查阅当前文档及 `--help`。

## 方法论文
[ODGI 原始论文](https://doi.org/10.1093/bioinformatics/btac308)介绍图工具与可视化。植物多倍体的相似拷贝可能使局部图结构复杂，应配合组装和样本路径检查。

## 已核实的植物案例
Kopalli 等使用 ODGI 将高粱泛基因组图展平为序列，以配合 BUSCO 等指标进行评估；展平后的结果依赖图及转换方式，不能单独证明每条样本路径的完整性。[GigaScience 原文](https://doi.org/10.1093/gigascience/giaf121)。

Morris 等使用 ODGI v0.9.0 检查由 33 个高粱基因组构成的泛基因组中各基因组的图表示；其构图由 Minigraph-Cactus v2.9.3 完成，区域变异展示另使用 sequenceTubeMap。该研究将图构建、合并处理、路径检查和区域图形显示分配给不同工具。[Nature 2026 案例](../../papers/sorghum-pangenome-reference-2026/)。

## 数据模型与典型操作
ODGI 的节点包含序列，边连接有方向的节点，路径记录经过的节点及方向。其实现利用图的稀疏性和局部路径相似性编码节点连接及路径步骤。官方文档列出 `odgi build` 导入 GFA、`odgi stats` 统计、`odgi sort` 排序、`odgi viz` 生成线性视图和 `odgi draw` 生成二维视图；输入格式、路径名及输出选项应以实际版本为准。[方法论文](https://pmc.ncbi.nlm.nih.gov/articles/PMC9237687/)。

## 来源与结果边界
官方仓库标示 MIT 许可证，应记录 ODGI 版本与上游构图软件版本。节点布局反映所用排序与可视化算法；图上接近不自动代表染色体上相邻。它主要处理已有图，reads 定位和分型需另选相应工具。[官方仓库](https://github.com/pangenome/odgi)。

高粱方法基准使用 ODGI 展平图路径并评估序列内容，程序转换并不验证原始组装本身正确；解读需结合原始输入、路径恢复与独立质量指标。ODGI 的图算法与输出可帮助追踪共享节点和样本路径，但不能仅凭二维布局给出基因组坐标或变异基因型。[原论文](https://doi.org/10.1093/bioinformatics/btac308)、[高粱应用研究](https://doi.org/10.1093/gigascience/giaf121)。


## 官方发布版本记录
2026-11-21 查看[官方发布页](https://github.com/pangenome/odgi/releases)，页面列出 v0.9.4。这是一项来源快照，软件更新后应重新核对；本机并未安装和运行该版本。
