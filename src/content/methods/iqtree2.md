---
title: IQ-TREE 2
name: IQ-TREE 2
summary: 使用最大似然方法推断系统发育树并评估支持度。
dataType: DNA / 蛋白多序列比对
principle: 最大似然与系统树搜索
domainIds: [comparative-genomics]
topicIds: [m04-topic-04]
principleIds: [phylogenetics]
dataIds: [proteins, coding-sequences]
paper: iqtree2-paper
repository: https://github.com/iqtree/iqtree2
status: published
updatedAt: 2026-11-22
---
## 研究问题与计算原理
IQ-TREE 2 使用最大似然方法，从序列比对、替换模型及候选树计算似然并进行启发式树搜索。ModelFinder 可比较候选替换模型，树搜索在模型参数下优化拓扑与分支长度；UFBoot 是快速近似的分支支持度流程，具体解释应注明所用支持度算法。版本 2 的方法论文对应 2020 年功能描述，软件仓库和文档持续更新。[IQ-TREE 2 论文](https://doi.org/10.1093/molbev/msaa015)。仓库标示 GPL-2.0 许可。

## 输入、输出与参数
输入为核酸或蛋白多序列比对；应先检查序列同源、缺失、比对质量与数据类型。官方命令文档说明 `-s` 指定比对文件，`-m` 控制模型，`-bb` 用于超快速 bootstrap；可用选项和参数范围取决于版本。输出包括推断树、分支支持度和日志；节点支持应结合数据及模型解释。[官方文档](https://iqtree.github.io/doc/Command-Reference)。本机未执行示例。

## 植物研究与上下游
拟南芥群体泛基因组研究在单拷贝直系同源序列比对与过滤后，使用 IQ-TREE v2.0.3 推断物种关系，并明确报告模型和 bootstrap 设置。该软件步骤对应此研究中的树推断，不等同于后续的复制、分化时间或群体结构分析。[植物案例记录](../../papers/arabidopsis-adaptation/)。上游包括序列选择、同源判断和比对；下游可结合多基因树、共祖物种树、基因复制及时间校准。
## 已核实的植物应用
Kang 等使用拟南芥多个材料的单拷贝直系同源基因，进行序列比对和位点筛选后，使用 IQ-TREE v2.0.3 推断系统树，论文报告了模型选择与 bootstrap 设置。[原文](https://doi.org/10.1038/s41467-023-42029-4)。
