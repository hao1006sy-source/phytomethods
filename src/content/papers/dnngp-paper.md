---
title: "DNNGP, a deep neural network-based method for genomic prediction using multi-omics data in plants"
summary: "提出基于多分支深度神经网络（DNN）融合植物基因型与多组学非线性特征的高精度基因组预测方法 DNNGP。"
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

基因组选择（Genomic Selection, GS）作为驱动现代分子设计育种的核心技术，旨在利用覆盖全基因组的高密度单核苷酸多态性（SNP）直接预测个体的表型表现与育种潜能。然而，传统广泛应用的基因组预测统计模型（如 rrBLUP、GBLUP、贝叶斯 Alphabet 家族）存在根本性的理论假设局限：
1. **严格的线性加性效应假设**：传统线性模型假设每个标记效应独立相加，无法显式刻画复杂的**基因-基因非线性上位互作（Epistasis）** 以及多倍体作物的亚基因组剂量非线性补偿效应；
2. **多组学非线性级联特征融合困难**：随着表型组学、转录组学（RNA-seq）以及代谢组学数据的普及，基因型到最终复杂农艺表型之间经历多层次生物学调控网络的非线性放大与缓冲，传统的多元线性混合模型难以自适应整合异构的多组学特征。

中国农业科学院作物科学研究所与 CIMMYT 国际玉米小麦改良中心的 Kaixuan Wang、Muhammad Adil Abid、Awais Rasheed、José Crossa 与 Hui Li（李慧）等在 2023 年推出了 **DNNGP**（Deep Neural Network-based method for Genomic Prediction，发表于植物学顶级期刊 *Molecular Plant*）。DNNGP 的核心学术贡献在于构建了一套专为植物复杂基因型与多组学特征量身定制的深度神经网络架构，通过多分支子网络独立提取特征与深层感知机联合映射，成功突破了传统线性加性模型的性能天花板，显著提升了植物复杂农艺性状的预测精度。

---

## 2. 核心数学模型与数据结构

### 2.1 多分支组学特征提取子网络架构

DNNGP 针对植物不同数据模态的数学特征设计了多分支结构（Multi-branch Sub-networks）：
- **基因型分支（Genotype Branch）**：输入为数值化单核苷酸多态性编码向量 $x_{\text{SNP}} \in \mathbb{R}^{P_{\text{SNP}}}$（通常编码为 0, 1, 2）；
- **转录组/多组学分支（Omics Branch）**：输入为基因表达量或代谢物连续丰度向量 $x_{\text{RNA}} \in \mathbb{R}^{P_{\text{RNA}}}$；
- 各分支分别通过多层密集全连接层（Dense Layers）逐步降维并提取非线性潜在抽象表征：
  $$h_1 = \sigma\left(W_1 x + b_1\right)$$
  其中 $\sigma(\cdot)$ 采用 **Mish** 或 **ReLU** 连续非线性激活函数，避免梯度消失。

### 2.2 批量归一化与 Dropout 正则化

由于植物育种群体的样本量 $N$（通常数百至数千）远小于高通量标记与转录本维度 $P$（数万至数十万），深度模型极易发生过拟合。DNNGP 在每一层全连接操作后紧随：
- **批量归一化（Batch Normalization, BN）**：重新中心化与缩放特征分布，稳定隐层动力学；
- **自适应 Dropout 层**：在训练阶段以一定概率（默认 0.2–0.5）随机失活部分神经元，强制模型学习解耦的强健组合特征。

### 2.3 潜在特征融合层与多目标损失优化

各分支提取的潜在特征向量在融合层（Fusion Layer）进行拼接拼接：
$$h_{\text{fusion}} = \left[ h_{\text{SNP}} \parallel h_{\text{RNA}} \right]$$

融合后的表征传入后续深度决策全连接层，最终输出标量预测值 $\hat{y}$。模型通过 AdamW 优化器最小化带有 $L_2$ 权重正则化的均方误差损失函数（MSE）：
$$\mathcal{L} = \frac{1}{N} \sum_{i=1}^N \left( y_i - \hat{y}_i \right)^2 + \lambda \|\Theta\|_2^2$$

并严格引入基于早停机制（Early Stopping）的十折交叉验证机制，以验证集最小损失作为最佳模型权重的保存准则。

---

## 3. 算法复杂度与计算性能

1. **GPU 硬件并行加速**：基于 PyTorch 深度学习框架构建，数千个个体的训练在单张普通 GPU 上仅需 30 秒至 2 分钟即可完成 200–500 轮 Epoch 的迭代收敛。
2. **灵活的特征选择支持**：支持内置特征方差筛选与重要性排序，降低超大输入维度的显存占用。
3. **性能基准全面超越**：在作者公开的小麦杂交种产量、玉米自交系百粒重以及拟南芥代谢物等 4 个代表性动植物公开数据集上，DNNGP 的皮尔逊预测准确率（$r_{\text{pred}}$）较传统 GBLUP、LightGBM、支持向量回归（SVR）以及早期的 DeepGS 提升了 **5%–15%**。

---

## 4. 植物基因组学应用场景与科研价值

植物杂种优势（Heterosis）与多倍体复杂性状极其依赖非加性遗传效应：
- **异源多倍体作物（如普通小麦）杂种优势预测**：在小麦杂交育种中，双亲杂交 F1 代的产量通常表现出强烈的超亲优势，传统基于加性效应的 GBLUP 往往产生严重低估。DNNGP 能够自适应捕获非线性上位效应与杂合位点增益，大幅提高杂交组合预测准确度；
- **植物基因型-转录组双轮驱动的智能分子设计育种**：在同时具备全基因组 SNP 与幼苗期 RNA-seq 的作物品种库中，联合多组学分支挖掘受环境和基因型共同驱动的深层表达网络对最终成熟期产量的决定机制；
- **抗逆表型与代谢物丰度预测**：有效利用代谢物高斯特征提升对干旱、高温抗逆指数的跨环境预测稳定性。

---

## 5. 输入输出规范与关键参数指南

### 5.1 核心调用流程与代码示例 (Python / PyTorch)
```python
import torch
from dnngp import DNNGP_Model, train_dnngp, evaluate_dnngp

# 1. 准备标准化基因型与转录组矩阵 (NumPy 数组)
# X_geno: (N_samples, N_snps), X_rna: (N_samples, N_genes), y: (N_samples, 1)
X_geno_train, X_rna_train, y_train = load_plant_data("train_set.npz")
X_geno_test, X_rna_test, y_test = load_plant_data("test_set.npz")

# 2. 构建多分支深度神经网络架构
model = DNNGP_Model(
    input_dim_geno=X_geno_train.shape[1],
    input_dim_omics=X_rna_train.shape[1],
    hidden_dims_geno=[256, 128],
    hidden_dims_omics=[128, 64],
    fusion_dims=[64, 32],
    dropout_rate=0.3,
    activation="Mish"
)

# 3. 执行自适应学习率模型训练 (带 Early Stopping)
trained_model = train_dnngp(
    model,
    X_geno_train, X_rna_train, y_train,
    epochs=300,
    batch_size=64,
    learning_rate=1e-3,
    weight_decay=1e-4,
    patience=20,
    device="cuda" if torch.cuda.is_available() else "cpu"
)

# 4. 在独立测试集中评估预测准确率 (Pearson r 与 RMSE)
pred_y = trained_model.predict(X_geno_test, X_rna_test)
accuracy = evaluate_dnngp(y_test, pred_y)
print(f"Genomic Prediction Accuracy (r): {accuracy:.4f}")
```

### 5.2 关键超参数说明
- `dropout_rate = 0.3`：防止过拟合的核心超参数，样本量较小（$N < 500$）时建议调高至 0.4–0.5。
- `activation = "Mish"`：相比传统 ReLU，Mish 激活函数在负半轴平滑微导，能够更好保留微弱特征信号。
- `patience = 20`：早停容忍轮数，当验证集损失在连续 20 个 Epoch 不再下降时自动中断训练并恢复最佳权重。

---

## 6. 阅读与复现资源

- **原始研究论文**：[Molecular Plant 2023 DOI: 10.1016/j.molp.2022.11.004](https://doi.org/10.1016/j.molp.2022.11.004)
- **PubMed 记录**：[PMID: 36401460](https://pubmed.ncbi.nlm.nih.gov/36401460/)
- **官方开源代码仓库**：[AIBreeding/DNNGP GitHub](https://github.com/AIBreeding/DNNGP)
- **站内配套专题**：[全基因组选择（GS）原理与育种值评估](../../topics/gwas-breeding/m06-topic-05/)
- **站内配套专题**：[机器学习与深度学习在分子育种中的应用](../../topics/gwas-breeding/m06-topic-07/)
