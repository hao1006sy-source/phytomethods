---
title: ADMIXTURE
name: ADMIXTURE
summary: 在指定成分数下估计基因型数据的模型祖先成分。
dataType: 多位点 SNP 基因型
principle: 最大似然祖先成分模型
domainIds: [population-genetics]
topicIds: [m05-topic-03]
principleIds: [ancestry-model]
dataIds: [variant-data]
paper: admixture-paper
repository: https://dalexander.github.io/admixture/
status: draft
updatedAt: 2026-11-21
---
## 研究问题与原理
ADMIXTURE 由 Alexander、Novembre 和 Lange 提出，利用多位点 SNP 基因型在给定成分数 K 下以最大似然估计个体成分比例与成分等位基因频率。[方法论文](https://doi.org/10.1101/gr.094052.109)。模型成分及比例受采样、K 和假设影响，不能直接等同于已知历史祖先或混合时间。

## 输入输出与质量控制
输入为兼容版本的 SNP 基因型数据；输出包含样本的成分比例及对应等位基因频率。运行前检查样本关联、缺失、强 LD 和倍性，并通过多个 K、重复运行及可用交叉验证评估稳定性；参数语法以[官方软件页面](https://dalexander.github.io/admixture/)及手册为准。本机未运行示例。

## 水稻应用与上下游
3,010 份亚洲栽培稻研究使用 ADMIXTURE 分析多个 K 下的结构，并结合其他群体分析。[原始研究](https://doi.org/10.1038/s41586-018-0063-9)。上游是经过质控的基因型和样本信息，下游可结合 PCA、地理和独立历史证据；工具许可及安装版本需在发布前复核。
