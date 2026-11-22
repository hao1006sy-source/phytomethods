---
title: CAFE 5
name: CAFE5
summary: 在物种树上以生灭模型分析基因家族大小变化。
dataType: 基因家族计数表 / 物种时间树
principle: 基因获得与丢失的随机过程
domainIds: [comparative-genomics]
topicIds: [m04-topic-02]
principleIds: [birth-death]
dataIds: [gene-counts]
paper: cafe5-paper
repository: https://github.com/hahnlab/CAFE5
status: published
updatedAt: 2026-11-22
---
## 研究问题与原理
CAFE 5 由 Mendes 等开发，用于分析基因家族大小沿物种树的变化。软件使用随机生灭过程描述基因拷贝获得与丢失，CAFE 5 可用 Gamma 速率类别表示家族间的速率差异，并可根据误差模型处理观测家族计数偏离真实大小的技术误差。输入计数、物种树及分支长度是推断基础；扩张或收缩是模型判断，不直接说明发生机制。[方法论文](https://doi.org/10.1093/bioinformatics/btaa1022)。

## 输入、输出及参数
需要家族 × 物种的计数表与物种树，树中的物种名称必须与表头一致，分支长度及其时间单位需符合模型假设。`-i` 指定计数文件，`-t` 指定 Newick 树，`-k` 启用离散 Gamma 速率类别，`-p` 采用 Poisson 根分布；`-e` 可估计或载入计数误差模型，`-o` 设置输出目录，`-c` 设置线程数。根分布、家族间速率差异和误差模型分别对应不同假设，参数需按数据质量和研究设计选择。[官方 README 与参数说明](https://github.com/hahnlab/CAFE5)。

CAFE5 1.1 的报告目录包含 `Base_report.cafe` 或 `Gamma_report.cafe`、家族结果、分支概率、λ、模型参数、节点概率和 p 值等报告文件；文件前缀及具体集合随所选模型和版本变化。报告记录似然、λ、家族变化和祖先节点重建结果。分析时检查日志、优化状态和报告，再结合树与家族注释解释显著变化。[官方 1.1 发行说明](https://github.com/hahnlab/CAFE5/releases)。不同物种注释完整度、可变剪接处理和异常大簇会影响计数与模型拟合。本机尚未运行示例。

## 植物案例及上下游
茶树和相关山茶属研究使用 OrthoFinder 得到家族，结合分化时间与 CAFE5 分析家族大小变化，并记录了模型设置。[原始论文](https://doi.org/10.3389/fpls.2024.1449006)。上游需统一基因集与物种树；下游应结合基因树、共线性与注释证据检查候选。论文报告的茶树分析使用 CAFE5 的两个 Gamma 速率类别和根分布 Poisson 设置；这属于该研究参数。CAFE 5 假设家族在树根存在，若家族只在部分末端新生，需评估其是否符合模型。官方代码仓库列出 IU Open Source License，并提供输入和误差模型说明。[植物案例记录](../../papers/tea-comparative/)、[官方仓库与许可](https://github.com/hahnlab/CAFE5)。
