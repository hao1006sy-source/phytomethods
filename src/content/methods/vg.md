---
title: vg
name: vg
summary: 使用序列变异图、路径和图索引进行读段比对与变异分析。
dataType: 变异图 / FASTQ reads
principle: 图索引、种子匹配和单倍型感知比对
domainIds: [pangenomics-structural-variation]
topicIds: [m03-topic-06]
principleIds: [graph-genomics, minimizer]
dataIds: [graph, short-reads]
paper: vg-paper
repository: https://github.com/vgteam/vg
status: draft
updatedAt: 2026-11-21
---
## 研究问题与方法定位
单一参考序列可能缺少某些样本特有的序列。vg 是处理基因组变异图的一组工具，支持图的构建与表示、索引、读段比对和部分变异分析。图中的节点带有序列，边连接节点端点，路径可以表示参考或样本单倍型；节点 ID 是图内部标识，不能直接当作稳定的染色体坐标。[vg 原始论文](https://doi.org/10.1038/nbt.4227)、[官方项目](https://github.com/vgteam/vg)。

## Giraffe 的计算思想
`vg giraffe` 是 vg 中面向泛基因组读段比对的工具。原始方法利用图中编码的单倍型及 minimizer 等索引，为 reads 寻找候选匹配、组织候选位置并计算图上的比对。[Giraffe 论文](https://doi.org/10.1126/science.abg8871)。已观察单倍型为搜索提供信息；图构建和输入样本决定哪些序列和路径可用，不代表图已经包含所有真实变异。

图比对输出可记录读段相对于图节点和路径的位置。将它投影到线性参考需要指定图中相应参考路径，并核查路径名称、版本、方向和坐标；重复区域、缺失于图的序列、图结构和读段质量都可能影响映射质量。图上比对、已知变异分型和新的结构变异发现是不同分析任务，不能把某个图比对结果直接当作所有变异的完整集合。

## 输入、索引与输出
输入通常包括带有样本路径的图及 FASTQ reads。官方索引说明中，Giraffe 工作流使用包含单倍型索引和图结构的 GBZ、距离索引，以及带距离信息的 minimizer 索引；当前版本的短读长和长读长模式可使用不同索引文件。`vg autoindex` 可以为指定工作流构建配套索引；索引必须与图、工作流和软件版本一致。[官方索引说明](https://github.com/vgteam/vg/wiki/Index-Construction)。

根据工作流，`vg giraffe` 的 `-Z` 用于指定 GBZ，`-f` 指定 FASTQ，`-t` 控制线程；可按版本设置输出格式，例如图比对 GAM 或 GAF。[官方长读长说明](https://github.com/vgteam/vg/wiki/Mapping-long-reads-with-Giraffe)。索引名称、参数和支持模式会随版本变化，运行前需核对版本帮助。本机尚未运行 vg；上述参数是依据官方文档整理，不是已验证教程。

## 软件、论文与植物案例
vg 原始论文描述变异图框架；Sirén 等的 Giraffe 论文主要基于人类数据阐述单倍型感知短读段比对。后续长读段功能应以相应版本与论文为准，不能把原始短读段方法的评估直接套用到长读段。

Kopalli 等的高粱泛基因组比较使用 Giraffe 将模拟 reads 比对到不同构建方法得到的图，并在设定的映射质量阈值及真值条件下评价结果。[植物应用论文](https://doi.org/10.1093/gigascience/giaf121)。该例使用高粱组装生成的模拟 reads，不能描述成对真实测序 reads 的同一项验证。不同图的覆盖内容和评价条件直接影响比较。

## 上下游、版本和许可
上游包括样本组装、图构建与质量评估；下游可开展参考路径投影、已知变异分型和独立验证。vg 自身使用 MIT 许可，子模块及附带工具可能有各自许可。[许可证](https://github.com/vgteam/vg/blob/master/LICENSE)。2026-11-21 查看官方发布页列出 v1.78.0，该记录是来源快照，未在本机安装或执行。[发布页](https://github.com/vgteam/vg/releases)。
