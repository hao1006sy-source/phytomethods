---
title: SyRI
name: SyRI
summary: 通过两个组装基因组的全基因组比对识别共线、重排和局部序列差异。
dataType: 组装 FASTA / 全基因组比对
principle: 共线结构与重排识别
domainIds: [pangenomics-structural-variation]
topicIds: [m03-topic-02, m03-topic-03]
principleIds: [alignment]
dataIds: [assembly]
paper: syri-paper
repository: https://github.com/schneebergerlab/syri
status: draft
updatedAt: 2026-11-20
---
## 研究问题与方法定位
SyRI（Synteny and Rearrangement Identifier）比较两个组装基因组。输入是全基因组比对，软件分析共线区块和重排区域，再描述结构背景下的局部序列差异。它的输入是组装和比对结果，属于组装比较工具；它本身不从原始短 reads 直接进行变异检测。

## 计算过程
根据比对坐标构建候选对应关系，寻找共线路径，进一步识别倒位、易位、重复等重排及其边界。对于每类结构区域，软件检查位于其中的局部差异。重复序列可能产生多个匹配，过滤时保留哪些比对会影响可识别的重复与重排。

## 输入、输出与重要参数
官方 MUMmer 流程先对参考与查询组装进行 NUCmer 全基因组比对，再通过 `delta-filter` 和 `show-coords` 整理输入。PAF 输入使用另一套格式路径。常用参数包括 `-c` 坐标/比对输入、`-r` 参考 FASTA、`-q` 查询 FASTA、`-d` MUMmer delta（使用相应流程时）及 `--prefix` 输出前缀。不同比对格式需要配套格式选项；实际运行以[官方示例](https://schneebergerlab.github.io/syri/example.html)和版本帮助为准。

输出以 `.out` 主结果、`.vcf` 变异记录、`.summary` 汇总和日志为主，具体文件由运行方式决定；在 `.out` 中区分共线、倒位、易位和局部差异类别，VCF 表示亦需核对参考与查询坐标、方向、变异类型和缺失值。官方示例自动映射染色体时会产生 mapids 文件，应人工确认参考与查询的染色体对应关系。

## 植物应用与限制
原论文比较两份拟南芥组装，对部分预测易位进行了实验验证。高度重复或不完整组装会使多个位置产生可竞争的匹配；应检查组装质量、比对过滤和候选断点的独立证据。[原始论文](https://doi.org/10.1186/s13059-019-1911-0)。

高粱图构建基准使用 SyRI 1.6.3 比较染色体级组装，并与 SVIM-asm、图变异流程对照；研究在含已知真值的模拟组装中计算 SV 检测表现，也在真实组装中比较变异结果的区域重叠。模拟真值 F1 与真实组装重叠检验回答不同问题，需按各自数据和指标解读。[高粱方法比较](https://doi.org/10.1093/gigascience/giaf121)。

## 上下游
上游为经过质量控制的两套组装和适合数据的全基因组比对；下游可结合浏览器、reads 回贴及基因注释解释候选重排。不同工具、参数和参考选择得到的变异集合需要按相同坐标体系比较。

## 软件来源与版本记录
SyRI 由 Schneeberger 团队发布，仓库采用 MIT 许可证。2026-11-21 官方 release 页面列出 v1.8.2；本项目实跑使用 SyRI 1.8.2 与 MUMmer 3.23，官方拟南芥测试集输入、版本、命令、日志、摘要和哈希见 `examples/syri/verified-20261121/`。[项目仓库](https://github.com/schneebergerlab/syri)、[发布页](https://github.com/schneebergerlab/syri/releases)、[许可证](https://github.com/schneebergerlab/syri/blob/master/LICENSE)。该运行验证的是固定测试数据的命令链，不是其中所有预测变异的独立验证。

## 运行前方向检查
官方说明要求比较的同源染色体采用一致的方向；如果两条对应染色体的大部分比对方向相反，应先检查染色体方向，必要时对查询染色体做反向互补，再重新进行全基因组比对。不能仅凭单个局部倒位决定整条染色体方向。对于大型易位或重复，候选比对会增加时间和内存消耗，需要结合比对过滤、染色体分组和资源监控处理。[官方限制说明](https://github.com/schneebergerlab/syri#current-limitations)。


## 官方发布版本记录
2026-11-21 查看[官方发布页](https://github.com/schneebergerlab/syri/releases)，页面列出 v1.8.2。这是一项来源快照，软件更新后应重新核对；已在 WSL 隔离环境中运行该版本，拟南芥官方测试数据和验证记录见关联教程。
