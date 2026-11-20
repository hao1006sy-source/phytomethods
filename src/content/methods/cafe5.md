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
status: draft
updatedAt: 2026-11-21
---
## 研究问题与原理
CAFE 5 由 Mendes 等开发，用于分析基因家族大小沿物种树的变化。软件使用生灭过程模拟基因拷贝获得与丢失，可考虑不同家族的速率差异和计数误差。输入计数、物种树及分支长度是推断的基础；扩张或收缩是基于模型的判断，不直接说明发生机制。[方法论文](https://doi.org/10.1093/bioinformatics/btaa1022)。

## 输入、输出及参数
需要家族 × 物种的计数表与物种树，名称应严格匹配；树的分支长度和时间单位需符合分析假设。官方示例中 `-i` 指定家族计数文件，`-t` 指定树文件，`-k` 指定离散速率类别数；输出包含模型拟合及家族变化相关结果，具体字段以实际版本为准。[官方文档](https://github.com/hahnlab/CAFE5)。不同物种注释完整度、可变剪接处理和异常大簇会影响计数与模型拟合，本机尚未运行示例。

## 植物案例及上下游
茶树和相关山茶属研究使用 OrthoFinder 得到家族，结合分化时间与 CAFE5 分析家族大小变化，并记录了模型设置。[原始论文](https://doi.org/10.3389/fpls.2024.1449006)。上游需统一基因集与物种树；下游应结合基因树、共线性与注释证据检查候选。软件许可与具体发布版本待进一步核对。
