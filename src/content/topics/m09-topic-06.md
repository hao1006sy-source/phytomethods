---
title: 植物基因组基础大模型：AgroNT 与 PlantCAD2 架构、MLM 自监督预训练与状态空间模型
summary: 深入推导植物 DNA 基础模型 6-mer 分词、AgroNT Transformer 双向自注意力、PlantCAD2 双向 Mamba2 状态空间方程 (SSM)、反向互补等变性以及 MLM 预训练目标。
domain: regulatory-genomics-ai
methods: [agront, plantcad2]
status: published
updatedAt: 2026-11-25
---

## 核心科学问题：海量未标注序列与基因组语法表征

随着高保真长读段测序技术（HiFi / ONT）的成熟，植物基因组学界已经组装出成百上千种高质量植物的参考基因组。然而，**全基因组中超过 98% 的非编码序列至今仍缺乏明确的功能注释**：
- 传统的转录因子结合与表观预测模型（如基于卷积神经网络 CNN 或 $k$-mer SVM）通常受制于短序列窗口（如 500~1,000 bp），无法感知长程增强子与启动子之间相距数万碱基的跨尺度三维互作；
- 依赖于大语言模型（LLM）突破的**基因组基础大模型**（Genomic Foundation Models），直接在大规模多物种参考基因组序列上进行无监督自监督预训练，从纯序列中自主学习“基因组语法（Genomic Syntax）”，成为解码植物非编码调控密码的最前沿工具。

![植物基因组基础大模型 (AgroNT / PlantCAD2) 架构与下游微调](/phytomethods/images/topics/m09/genomic-foundation-models-agront-architecture.svg)

---

## 算法数学推导：分词、注意力机制与状态空间模型

### 1. 序列分词与嵌入表征（Tokenization & Embeddings）

DNA 双链由四种碱基构成（$\Sigma = \{A, C, G, T, N\}$）。处理 DNA 输入有两种核心技术路线：

1. **$k$-mer 分词（如 AgroNT 采用的非重叠 6-mer 方案）**：
   - 以固定步长（Stride）为 6 将 DNA 切分为非重叠的 6-mer 子串（non-overlapping tokens）；
   - 词表大小严格定义为 $|\mathcal{V}| = 4^6 + \text{Special Tokens} = 4,096 + 5 = 4,101$；
   - *优势*：将原本序列长度有效压缩 6 倍，显著降低了自注意力机制二次方内存开销；
2. **单碱基高分辨率分词（如 PlantCAD2 方案）**：
   - 词表大小极小（仅 5 个单碱基 Tokens），能够保持**严格的单碱基物理空间分辨率**；
3. **嵌入叠加与旋转位置编码（RoPE）**：
   每个 Token 映射为 $d_{\text{model}}$ 维向量，并通过旋转位置编码（Rotary Position Embedding, RoPE）引入相对距离感知：
   $$\mathbf{x}_m = \mathbf{W}_{\text{emb}} \cdot \text{token}_m, \quad \tilde{\mathbf{q}}_m = \mathbf{R}_{\Theta, m}^d \mathbf{W}_q \mathbf{x}_m$$
   确保注意力权重严格依赖于序列上的相对物理间隔 $|m - n|$。

### 2. 掩码语言模型（Masked Language Modeling, MLM）预训练目标

预训练不需要任何人工湿实验功能标签，全靠模型从上下文语法中学习碱基组合规则：
1. 在输入序列中随机选择 $15\%$ 的 Tokens 进行掩码替换：
   - 其中 80% 替换为特殊标记 `[MASK]`；
   - 10% 随机替换为任意非真实 Token；
   - 10% 保持原样不变；
2. **交叉熵优化目标**：
   $$\mathcal{L}_{\text{MLM}}(\theta) = -\sum_{i \in \text{Masked}} \log P_\theta(x_i \mid \mathbf{x}_{\setminus i})$$
   模型必须理解植物启动子 TATA-box、剪接供体/受体 GT-AG 信号及远端模序上下文，才能准确猜出被掩码的核苷酸。

### 3. 两大主流植物大模型架构路线深度对比

#### 路线 A：AgroNT（Transformer 架构，10 亿参数，*Communications Biology, 2024*）
- **论文与作者**：Mendoza-Revilla et al. (2024), *Communications Biology*, 7: 835 (DOI: 10.1038/s42003-024-06465-2)；
- **骨干网络**：32 层双向 Transformer 编码器（48 个多头注意力机制，隐藏维度 $d_{\text{model}} = 1536$）；
- **预训练语料**：涵盖水稻、玉米、小麦、大豆等 **48 种可食用植物基因组（涵盖 45 个植物物种）** 的高质量组装，累计超过 100 亿个核苷酸；
- **全多头自注意力机制**（Multi-Head Self-Attention）：
  $$\text{Attention}(\mathbf{Q}, \mathbf{K}, \mathbf{V}) = \text{softmax}\left( \frac{\mathbf{Q} \mathbf{K}^T}{\sqrt{d_k}} \right) \mathbf{V}$$
  能够全面捕获全基因组所有位置对之间的全连接双向全局依赖。

#### 路线 B：PlantCAD2（Mamba2 状态空间模型，6.76 亿参数，*Cell Genomics, 2026*）
- **论文与作者**：Zhai et al. (2026), *Cell Genomics*, 6(9): 101329 (DOI: 10.1016/j.xgen.2026.101329)；
- **架构突破**：鉴于 Transformer 复杂度随序列长度呈平方增长（$\mathcal{O}(L^2)$），PlantCAD2 采用基于 **Caduceus / Mamba2 状态空间模型（State Space Models, SSM）**；
- **预训练语料**：涵盖 **65 个被子植物参考基因组**，覆盖主要单子叶与双子叶谱系；
- **线性复杂度与超长上下文**：
  $$\frac{dh(t)}{dt} = \mathbf{A} h(t) + \mathbf{B} x(t), \quad y(t) = \mathbf{C} h(t) + \mathbf{D} x(t)$$
  在离散化后通过并行关联扫描（Parallel Associative Scan）实现计算复杂度降至线性 $\mathcal{O}(L)$，直接在单碱基分辨率下支持长达 **8,192 bp** 的超长上下文推断（实际吞吐需结合显存带宽评估）；
- **反向互补等变性（Reverse Complement Equivariance）**：
  DNA 具有双螺旋反向互补对称性。PlantCAD2 架构通过 Caduceus RC 模块在底层约束正负链变换，确保模型对 Watson 链与 Crick 链的预测概率保持一致。

---

## 真实植物科研案例：启动子强度与剪接位点跨物种泛化

### 1. AgroNT 在玉米和拟南芥启动子强度预测中的微调表现
在包含数万条合成启动子的大规模平行报告基因测验（MPRA）基准评估中：
- 冻结 AgroNT 预训练骨干网络，仅在顶层添加轻量级 MLP 线性回归头；
- 启动子定量转录活性的预测相关性高达 Pearson $r = 0.76 \sim 0.82$，显著超越传统的随机森林与单纯 CNN 架构；
- 注意力图谱（Attention Rollout）自动显现出高权重集中于 TATA-box 与 Inr 核心启动子起始区。

### 2. PlantCAD2 跨被子植物剪接位点零样本预测
在对覆盖 65 个被子植物基因组的跨物种盲测中：
- PlantCAD2 在单碱基分辨率下对内含子-外显子连接处的经典 `GT` 供体位点与 `AG` 受体位点识别的 ROC AUC 达到 0.96；
- 针对植物中极为高发的“内含子保留（Intron Retention）”这一特殊非典型剪接模式，成功捕获了内含子内部富含的微弱分支点信号。

---

## 关联工具与复现入口

- **AgroNT**：通过 HuggingFace Transformers 框架（`InstaDeepAI/nucleotide-transformer-500m-human-ref` 及 `agro-nt` 系列权重）直接调用。
- **PlantCAD2**：基于 PyTorch 与 Mamba2 官方生态的植物长程序列状态空间大模型。
- 参见[AgroNT 原始论文文献解读](../../../papers/agro-nt-2024/)与[PlantCAD2 方法文献](../../../papers/plantcad2-paper/)。
