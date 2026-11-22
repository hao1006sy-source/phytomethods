---
title: vg
name: vg
summary: 使用序列变异图、路径和图索引进行读段比对与变异分析。
version: 1.78.0
dataType: 变异图 / FASTQ reads
principle: 图索引、种子匹配和单倍型感知比对
domainIds: [pangenomics-structural-variation]
topicIds: [m03-topic-03, m03-topic-06]
principleIds: [graph-genomics, minimizer]
dataIds: [graph, short-reads, long-reads, hifi]
paper: vg-paper
repository: https://github.com/vgteam/vg
status: published
updatedAt: 2026-11-21
---
## 研究问题与方法定位
单一参考序列可能缺少某些样本特有的序列。vg 是处理基因组变异图的一组工具，支持图的构建与表示、索引、读段比对和部分变异分析。图中的节点带有序列，边连接节点端点，路径可以表示参考或样本单倍型；节点 ID 是图内部标识，不能直接当作稳定的染色体坐标。[vg 原始论文](https://doi.org/10.1038/nbt.4227)、[官方项目](https://github.com/vgteam/vg)。

## Giraffe 的计算思想
`vg giraffe` 是 vg 中面向泛基因组读段比对的工具。原始方法利用图中编码的单倍型及 minimizer 等索引，为 reads 寻找候选匹配、组织候选位置并计算图上的比对。[Giraffe 论文](https://doi.org/10.1126/science.abg8871)。已观察单倍型为搜索提供信息；图构建和输入样本决定哪些序列和路径可用，不代表图已经包含所有真实变异。

图比对输出可记录读段相对于图节点和路径的位置。将它投影到线性参考需要指定图中相应参考路径，并核查路径名称、版本、方向和坐标；重复区域、缺失于图的序列、图结构和读段质量都可能影响映射质量。图上比对、已知变异分型和新的结构变异发现是不同分析任务，不能把某个图比对结果直接当作所有变异的完整集合。

## 输入、索引与输出
输入通常包括带有样本路径的图及 FASTQ reads。官方索引说明中，Giraffe 工作流使用包含单倍型索引和图结构的 GBZ、距离索引，以及带距离信息的 minimizer 索引；短读长和长读长模式可使用不同索引文件。长读段模式自 vg 1.63.0 起提供；官方流程要求按平台选择 `hifi`（PacBio HiFi）或 `r10`（ONT R10）预设。`vg autoindex` 可以为指定工作流构建配套索引；索引必须与图、工作流和软件版本一致。[官方索引说明](https://github.com/vgteam/vg/wiki/Index-Construction)、[长读段比对说明](https://github.com/vgteam/vg/wiki/Mapping-long-reads-with-Giraffe)。

根据工作流，`vg giraffe` 的 `-Z` 用于指定 GBZ，`-f` 指定 FASTQ，`-t` 控制线程；可按版本设置输出格式，例如图比对 GAM 或 GAF。[官方长读长说明](https://github.com/vgteam/vg/wiki/Mapping-long-reads-with-Giraffe)。索引名称、参数和支持模式会随版本变化，运行前需核对版本帮助。本机尚未运行 vg；上述参数是依据官方文档整理，不是已验证教程。

若需要线性参考 BAM，可使用 `vg surject` 并通过 `--ref-paths` 指定图中的目标参考路径。对长读段，`--read-length long` 自 vg 1.73.0 起可用，用于启动长读段投射时的低复杂度剪枝；使用旧版时应按对应版本的官方说明确认等效处理。PanSN 路径名称必须与清单和目标参考一致；投射 BAM 供线性工具使用时，仍应保留原始 GAM/GAF 及图，便于复查无法在单一线性坐标中完整表达的图路径信息。[官方长读段投射说明](https://github.com/vgteam/vg/wiki/Mapping-long-reads-with-Giraffe)。

## 软件、论文与植物案例
vg 原始论文描述变异图框架；Sirén 等的 Giraffe 论文主要基于人类数据阐述单倍型感知短读段比对。后续长读段功能应以相应版本与论文为准，不能把原始短读段方法的评估直接套用到长读段。

Kopalli 等的高粱泛基因组比较分别评估模拟 reads 与公开真实 paired-end reads。模拟 reads 由泛基因组图生成，Giraffe 将其映射到 Minigraph 或 Minigraph-Cactus 图，再与 Minimap2 的线性参考映射及模拟真值比较。真实 paired-end reads 也映射到 Minigraph、Minigraph-Cactus 图和线性参考，论文分别报告总比对率与完美比对比例。PGGB 图因索引生成所需计算和内存未纳入 read-mapping 比较；模拟数据的真值准确率不能与真实 reads 的比对率合并解释。[植物应用论文](https://doi.org/10.1093/gigascience/giaf121)。

该论文的公开真实 reads 结果中，Minimap2、Minigraph-Cactus 和 Minigraph 的总比对率分别为 82.47%、73.44% 和 73.27%；完美比对比例分别为 68.77%、82.77% 和 78.13%。这组结果呈现“总比对数量”和“完美比对比例”之间的差异，不能只看其中一个指标，也只适用于论文的数据集及评估定义。[出版方图 9](https://academic.oup.com/gigascience/article/doi/10.1093/gigascience/giaf121/8364989)。

## 上下游、版本和许可
上游包括样本组装、图构建与质量评估；下游可开展参考路径投影、已知变异分型和独立验证。vg 自身使用 MIT 许可，子模块及附带工具可能有各自许可。[许可证](https://github.com/vgteam/vg/blob/master/LICENSE)。2026-11-21 查看官方发布页列出 v1.78.0，该记录是来源快照，未在本机安装或执行。[发布页](https://github.com/vgteam/vg/releases)。

`vg giraffe` 的映射记录应与后续变异表示/分型分开交付。使用 VCF 或其他坐标输出时，要固定参考路径、图版本和图到线性坐标的转换；若任务需要新结构变异发现，Giraffe 的 mapping 结果不能单独作为 caller 结论。vg 项目自身 MIT 许可不延伸覆盖所有贡献目录、子模块或随流程使用的外部工具，须按实际发布和依赖单独检查。[vg 许可证](https://github.com/vgteam/vg/blob/master/LICENSE)、[官方索引指南](https://github.com/vgteam/vg/wiki/Index-Construction)。

高粱基准以真实组装构建 pangenome 图，并分别使用模拟 reads 和公开真实 paired-end reads 评估映射。模拟数据有生成位置真值，可用于该实验设定内的定位正确性比较；真实数据用于对比总映射和完美映射结果，不具备同一套模拟位置真值。PGGB 图未参与 mapping benchmark，因其索引生成计算和内存需求超出该研究可执行范围。[高粱基准论文](https://doi.org/10.1093/gigascience/giaf121)。
