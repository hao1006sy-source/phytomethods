---
title: DNNGP
name: DNNGP
summary: 基于深度神经网络与多组学特征集成的植物基因组预测方法，通过多分支卷积网络整合基因型与多组学数据。
dataType: SNP 变异矩阵、表型数据、多组学分子特征 (如转录组表达量)
principle: 多分支一维卷积神经网络 (3-layer 1D-CNN)、批量归一化 (Batch Normalization)、Dropout 正则化与全连接特征融合
domainIds: [gwas-breeding]
topicIds: [m06-topic-07]
principleIds: [deep-learning-genomic-prediction]
dataIds: [variant-data, phenotype, expression-matrix]
paper: dnngp-paper
repository: https://github.com/AIBreeding/DNNGP
version: "1.0"
status: published
updatedAt: 2026-11-25
---

## 生物学问题与定位

全基因组选择（Genomic Selection, GS）广泛应用于植物分子育种。经典的统计学模型（如 rrBLUP、GBLUP）基于线性加性假设，在处理复杂的非加性上位性（Epistasis）及跨组学层面的级联调控时面临模型表征能力的局限。

**DNNGP（Deep Neural Network for Genomic Prediction）**由中国农业科学院作物科学研究所与 CIMMYT 等机构的研究人员（第一作者 Kelin Wang）于 2023 年发表于 *Molecular Plant*。该方法针对植物基因型与多组学特征设计了专用的多分支深度神经网络架构，旨在通过数据驱动方式提取多组学特征的非线性表征，辅助复杂农艺性状的基因组预测。

---

## 核心算法与网络结构

依据原论文 Figure 1A 及官方开源代码，DNNGP 的核心结构包含以下要素：

### 1. 多分支一维卷积特征提取
- **独立组学分支**：输入支持基因型变异矩阵与转录组表达量等多组学数据，不同数据类型分别输入独立的网络分支；
- **三层一维卷积（3-layer 1D-CNN）**：每个分支由 3 层一维卷积神经网络构成，逐层提取局域特征；
- **批量归一化与 Dropout**：在卷积层之后配置批量归一化（Batch Normalization）层以稳定特征分布，并结合 Dropout 随机失活策略防止高维小样本过拟合；
- **激活函数与平坦化**：卷积特征经非线性激活函数与展平映射后，生成代表各组学模态的抽象隐向量。

### 2. 特征融合与损失优化
- **晚期特征拼接**：将各组学分支提取的特征向量进行通道拼接（Concatenation）；
- **全连接回归输出**：拼接向量输入全连接密集层（Dense layers），最终输出连续型表型预测标量；
- **损失函数与训练策略**：以均方误差（Mean Squared Error, MSE）为损失函数，采用 Adam 优化器更新参数，训练过程中结合验证集早停（Early Stopping）策略保存最优模型权重。

---

## 软件实现与运行规范

- **开发语言与依赖框架**：官方开源代码基于 **Python 3.9** 与 **TensorFlow 2.6.0**；
- **官方脚本组织**：官方代码库（GitHub: `AIBreeding/DNNGP`）提供主运行脚本（如 `Scripts/dnngp_runner.py`）及基于 Nevergrad 的超参数优化脚本（`Tuning_hyperparameters/DNNGP_OPN.py`），支持 K 折交叉验证与多表型批量评估；
- **输入数据规范**：
  - 基因型数据：样本行、标记列的数值化矩阵（CSV/TXT）；
  - 表型数据：样本 ID 与对应表型观测值表格；
  - 多组学数据：如基因表达量矩阵，格式与基因型对应；
- **评估指标**：原论文通过十折交叉验证，以皮尔逊相关系数（Pearson correlation coefficient, $r$）和均方根误差（RMSE）评估基因组预测性能。

---

## 植物应用案例与真实文献证据

原论文在小麦杂交种产量、玉米自交系性状以及拟南芥代谢物等多套动植物公开数据集上进行了系统评估，验证了多组学融合与一维卷积网络在植物复杂性状预测中的适用性（详见 [Wang et al., *Molecular Plant*, 2023, DOI: 10.1016/j.molp.2022.11.004](https://doi.org/10.1016/j.molp.2022.11.004)）。

---

## 实践注意事项与质控建议

1. **样本量与模型复杂度平衡**：深度学习模型参数量较大，在样本量有限（如数百份材料）时极易发生过拟合，应严格执行交叉验证与早停机制；
2. **严格防范数据泄漏**：特征选择（如基于显著性的 SNP 预筛选）必须严格在每折训练集内部独立进行，严禁使用包含验证集或测试集的全部数据进行特征过滤；
3. **环境与依赖配置**：建议在独立的 conda 环境中安装官方指定的 Python 3.9 与 TensorFlow 2.6.0，避免因框架版本差异导致算子不兼容。
