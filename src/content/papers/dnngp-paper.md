---
title: "DNNGP, a deep neural network-based method for genomic prediction using multi-omics data in plants"
summary: "提出基于多分支深度神经网络（DNNGP）整合基因型与转录组等多组学数据的植物基因组预测方法，构建三层卷积神经网络（1D-CNN）、批量归一化与 Dropout 特征提取分支，在多种植物复杂农艺性状中验证了多组学融合预测能力。"
authors: "Wang K, Abid MA, Rasheed A, Crossa J, Hearne S, Li H"
year: 2023
journal: Molecular Plant
doi: 10.1016/j.molp.2022.11.004
type: method
methodIds: [dnngp]
domainIds: [gwas-breeding]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

# DNNGP, a deep neural network-based method for genomic prediction using multi-omics data in plants

## 1. 研究背景与算法贡献

全基因组选择（Genomic Selection, GS）是现代植物分子育种的核心技术，旨在利用覆盖全基因组的标记预测未测个体的基因组估计育种值（GEBV）。传统统计方法（如 rrBLUP、GBLUP、贝叶斯方法）大多基于线性加性效应假说，难以显式建模复杂的非加性上位性（Epistasis）及多组学间非线性级联调控机制。

中国农业科学院作物科学研究所与国际玉米小麦改良中心（CIMMYT）的 Kelin Wang（王克林）、Muhammad Adil Abid、Awais Rasheed、José Crossa、Sarah Hearne 与 Hui Li（李慧）等在 *Molecular Plant*（2023）发表了 **DNNGP**（Deep Neural Network for Genomic Prediction）。DNNGP 的核心贡献在于提出了一套针对植物基因型与多组学特征的多分支深度神经网络架构，通过独立特征提取与晚期特征融合，为复杂表型的多组学预测提供了端到端深度学习方法。

---

## 2. 核心模型结构与实现原理

依据原论文图示（Figure 1A）及作者开源实现，DNNGP 的核心网络架构设计如下：

### 2.1 多分支组学特征提取网络
- **组学分流输入**：模型支持将不同组学数据（如 SNP 基因型矩阵、转录组 RNA 表达量谱等）分别送入独立的特征提取子分支；
- **三层一维卷积（3-layer 1D-CNN）**：每个子分支由三层一维卷积神经网络构成，用于从局部连续的特征维度中提取高阶非线性抽象表征；
- **批量归一化与正则化**：在卷积层后紧接批量归一化（Batch Normalization, BN）层以稳定隐层特征分布，并引入 Dropout 层防止高维小样本场景下的过拟合；
- **激活函数与全连接映射**：卷积输出经过激活函数变换与展开后，经由密集全连接层（Dense layers）生成各分支的紧凑隐向量。

### 2.2 特征融合与损失优化
- **特征拼接融合（Feature Concatenation）**：将各组学分支提取的一维特征向量在融合层进行沿通道拼接；
- **回归输出**：拼接向量输入后续全连接决策网络，最终由单神经元线性输出连续型表型预测值 $\hat{y}$；
- **损失函数与训练优化**：模型使用均方误差（Mean Squared Error, MSE）作为回归损失函数，采用 Adam 优化算法更新网络权重，并在训练迭代中配合验证集早停（Early Stopping）策略以降低过拟合风险。

---

## 3. 软件实现与计算环境

- **深度学习框架**：官方开源代码采用 **Python 3.9** 与 **TensorFlow 2.6.0** 实现；
- **执行方式**：工具通过脚本式传参调用，包含核心训练预测流程与基于网格搜索/贝叶斯优化的超参数调优模块（`DNNGP_OPN.py`）；
- **评估标准**：采用十折交叉验证（10-fold cross-validation），以预测值与真实观测值之间的皮尔逊相关系数（Pearson correlation coefficient, $r$）及均方根误差（RMSE）评估模型精度；
- **实验数据**：原论文在小麦杂交种产量、玉米自交系性状以及拟南芥代谢物等多套动植物公开数据集上进行了多组学预测评估，展示了多组学融合相较单组学基准的预测表现。

---

## 4. 植物基因组学应用场景与科研价值

1. **多组学驱动的作物复杂农艺表型预测**：在同时获得群体全基因组重测序与关键发育时期转录组测序的育种材料中，联合提取序列变异与表达丰度特征；
2. **非加性效应与杂种优势预测探索**：利用神经网络的多层非线性映射能力，辅助捕捉异源多倍体（如普通小麦）及杂交组合中的非线性交互效应；
3. **高维组学特征组合评估**：探索不同组学层（SNP、RNA 等）对不同性状预测准确率的相对贡献。

---

## 5. 输入输出规范与官方运行方式

### 5.1 数据输入格式
- **基因型与组学文件**：制表符或逗号分隔的数值矩阵（CSV/TXT），行为样本（个体），列为标记（如 0/1/2 编码的 SNP）或标准化后的基因表达量数值；
- **表型文件**：包含样本标识符与目标连续表型观测值的对照表。

### 5.2 官方脚本调用示例
根据官方仓库提供的命令行规范，通过 Python 执行训练与超参数搜索：
```bash
# 激活包含 TensorFlow 2.6.0 的 Python 环境
# 运行 DNNGP 超参数优化与交叉验证主脚本
python DNNGP_OPN.py \
  --genotype genotype_data.csv \
  --phenotype phenotype_data.csv \
  --omics transcriptomic_data.csv \
  --cv 10 \
  --out results_dnngp/
```
*注：具体参数名与输入通道请以官方仓库对应版本的脚本文档与示例数据为准。*

---

## 6. 阅读与复现资源

- **原始研究论文**：[Molecular Plant 16(1):279–293 (2023), DOI: 10.1016/j.molp.2022.11.004](https://doi.org/10.1016/j.molp.2022.11.004)
- **PubMed 官方记录**：[PMID: 36366781](https://pubmed.ncbi.nlm.nih.gov/36366781/)
- **官方开源代码仓库**：[AIBreeding/DNNGP (GitHub)](https://github.com/AIBreeding/DNNGP)
- **站内关联专题**：[机器学习与深度学习在分子育种中的应用](../../topics/gwas-breeding/m06-topic-07/)
