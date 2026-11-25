---
title: "A foundational large language model for edible plant genomes"
summary: "提出基于 48 种主要农作物基因组预训练的 10 亿参数植物 DNA 序列基础大模型 AgroNT 及多任务微调基准。"
authors: "Mendoza-Revilla J, Trop E, Gonzalez L, et al."
year: 2024
journal: Communications Biology
doi: 10.1038/s42003-024-06465-2
type: method
methodIds: [agront]
domainIds: [regulatory-genomics-ai]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

# A foundational large language model for edible plant genomes: AgroNT

## 1. 研究背景与算法贡献

随着深度学习与大语言模型（Large Language Models, LLMs）在生命科学领域的快速突破，基于自监督预训练的 DNA 基础模型（DNA Foundation Models，如 Nucleotide Transformer、DNABERT、HyenaDNA 等）展现出从海量未标注基因组序列中自发学习语法规则的强大能力。然而，现有的基因组基础大模型绝大多数主要以人类、小鼠或模式脊椎动物序列为训练核心。相较于动物基因组，植物基因组具有极其独特的复杂特性：
1. **多倍化与染色体剧烈重排**：许多关键农作物（如六倍体小麦、四倍体马铃薯、多倍体甘蔗）经历了多轮全基因组复制（WGD），同源重复区域巨大；
2. **极端高比例的转座子与重复序列**：在玉米、大麦等大基因组作物中，转座子（TE）序列占比高达 70%–85% 以上；
3. **功能调控元件跨物种分布极不均衡**：除了模式植物拟南芥外，绝大多数主粮作物的调控元件与表观修饰实验注释极度匮乏。

2024 年，InstaDeep 团队的 Javier Mendoza-Revilla、Eva Trop、Luis Gonzalez 与 Bernardo P. de Almeida 等在 *Communications Biology* 推出了 **AgroNT**（Agro-Nucleotide Transformer）。AgroNT 的核心学术与技术贡献包括：
- **专为可食用农作物量身定制的基础大模型**：基于 48 种重要栽培植物（涵盖单子叶禾本科、双子叶茄科、豆科、十字花科及多年生果树等）的高质量无标注基因组序列开展大规模预训练；
- **10 亿参数级 Transformer 架构**：通过基于 6-mer 的重叠分词与掩码语言建模（MLM），学习植物特有的非编码调控句法与长程序列约束；
- **构建全面的植物下游基准与饱和突变分析**：在启动子活性预测、增强子可及性、剪接供体/受体识别以及农艺因果变异优先排序等多个下游任务上大幅超越传统卷积神经网络基线，并在木寿等关键作物上展现出强大的虚拟饱和突变（In silico Saturation Mutagenesis, ISM）设计潜力。

---

## 2. 核心数学模型与数据结构

### 2.1 预训练语料与 6-mer Tokenization

AgroNT 的训练语料汇集了 48 种代表性开花植物的染色体级别参考基因组组装：
- **6-mer 重叠滑动分词**：为了平衡序列上下文长度与显存占用，模型将输入的 DNA 序列（由 A, C, G, T 构成）通过滑动步长为 6 的窗口转换为 6-mer tokens。词表大小（Vocabulary Size）为 $4^6 = 4096$ 个常规词汇，另加专用特殊符号（`[CLS]`, `[MASK]`, `[PAD]`, `[UNK]` 等）；
- **位置编码（Positional Embeddings）**：采用标准学习式绝对位置编码或旋转位置嵌入（RoPE），赋予模型对数千碱基序列物理相对距离的精确感知。

### 2.2 掩码语言建模（Masked Language Modeling, MLM）

AgroNT 采用类似 BERT 的双向自注意力 Transformer 编码器结构（1B 参数）：
- 在自监督预训练阶段，随机挑选输入序列中 15% 的 6-mer tokens 进行破坏（其中 80% 替换为 `[MASK]`，10% 替换为随机 6-mer，10% 保持不变）；
- 模型的优化目标是基于未被掩码的上下文双向自注意力表征，最小化被掩码位置的交叉熵损失函数：
  $$\mathcal{L}_{\text{MLM}} = - \sum_{i \in \text{Masked}} \log P(t_i \mid t_{\setminus i}; \Theta)$$
  通过这一任务，网络内部自发编码了植物启动子核心基序（如 TATA-box、Inr 元件）、转录因子协同结合语法以及内含子-外显子剪接信号。

### 2.3 下游迁移学习与虚拟饱和突变（In silico Saturation Mutagenesis, ISM）

在完成通用预训练后，AgroNT 支持两种核心推理范式：
1. **参数高效微调（PEFT / LoRA）**：冻结 10 亿参数的主干权重，仅在顶层接入单层多层感知机（MLP）任务头或轻量低秩自适应层，实现跨物种表观可及性或转录起始强度的快速迁移拟合；
2. **虚拟饱和突变（ISM）打分**：在待研究的关键启动子区域，系统性将每一个单核苷酸逐一替换为其余三种可能的替代等位基因（Alt），计算突变序列与参考序列（Ref）在模型预测输出上的对数比值：
   $$\Delta \text{Score} = f(\text{Sequence}_{\text{alt}}) - f(\text{Sequence}_{\text{ref}})$$
   无需进行昂贵的体外报告基因实验，即可在全基因组尺度生成高精度的单碱基功能扰动效应景观图。

---

## 3. 算法复杂度与计算性能

1. **Transformer 预训练开销巨大**：全量 1B 模型在数百块专业 GPU 集群上训练数周完成；但预训练权重开源后，研究人员仅需单张消费级 GPU（如 16–24 GB 显存）即可流畅执行下游特征提取与推理。
2. **序列上下文长度**：标准输入窗口通常支持 1000–6000 bp 的 DNA 序列片断，有效覆盖植物近端核心启动子区与 5' UTR。
3. **开源生态无缝集成**：模型权重完全兼容 Hugging Face `transformers` 库，支持一键加载与调用。

---

## 4. 植物基因组学应用场景与科研价值

AgroNT 为资源受限的农作物功能基因组学与智能设计育种提供了强有力的 AI 预测引擎：
- **作物品种非编码关键调控突变高通量筛选**：在全基因组重测序（WGS）或群体 GWAS 得到的成千上万个非编码候选突变中，利用 AgroNT 的 $\Delta \text{Score}$ 快速打分，优先筛选破坏或产生转录因子结合位点的真正功能因果变异（Causal Regulatory Variants）；
- **合成启动子（Synthetic Promoters）的理性设计**：评估人工拼接顺式作用元件时序列语境的兼容性与预期转录表达强度；
- **跨物种零样本（Zero-shot）基因注释辅助**：在缺乏高质量转录组数据的新测序非模式热带或小宗农作物中，利用模型零样本预测潜在的转录起始位点（TSS）与高可及性开放染色质岛。

---

## 5. 输入输出规范与关键参数指南

### 5.1 核心调用流程与代码示例 (Python / Transformers)
```python
import torch
from transformers import AutoTokenizer, AutoModelForMaskedLM

# 1. 从 Hugging Face 载入 AgroNT 预训练分词器与模型权重
model_name = "InstaDeepAI/agro-nucleotide-transformer-1b"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForMaskedLM.from_pretrained(model_name)
model.eval()

# 2. 准备植物候选启动子 DNA 序列 (FASTA 格式字符串)
dna_seq = "ATGCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATC"

# 3. 6-mer 快速分词与张量化
inputs = tokenizer(dna_seq, return_tensors="pt")

# 4. 获取序列的高维潜在嵌入表示 (Embeddings)
with torch.no_grad():
    outputs = model(**inputs, output_hidden_states=True)
    # 提取顶层隐藏状态作为基因组特征嵌入 (Batch_size, Seq_len, Hidden_dim)
    sequence_embeddings = outputs.hidden_states[-1]

# 5. 开展针对特定点突变位点的虚拟突变效应评估 (ISM)
# 计算参考等位基因与替换等位基因对掩码预测似然的影响
```

### 5.2 关键注意事项
- 输入序列必须严格限制在标准碱基字符集（`A, C, G, T, N`），在预处理阶段需将小写字母统一转换为大写。
- 由于 6-mer 分词具有固定步长，对插入/缺失（InDel）或边界坐标的变异打分需注意保持分词相位的连续性。

---

## 6. 阅读与复现资源

- **原始研究论文**：[Communications Biology 2024 DOI: 10.1038/s42003-024-06465-2](https://doi.org/10.1038/s42003-024-06465-2)
- **PubMed 记录**：[PMID: 39014092](https://pubmed.ncbi.nlm.nih.gov/39014092/)
- **Hugging Face 官方模型主页**：[InstaDeepAI/agro-nucleotide-transformer-1b](https://huggingface.co/InstaDeepAI/agro-nucleotide-transformer-1b)
- **InstaDeep 开源仓库**：[instadeepai/nucleotide-transformer GitHub](https://github.com/instadeepai/nucleotide-transformer)
- **站内配套专题**：[AI 大模型在植物基因组学中的应用](../../topics/regulatory-genomics-ai/m09-topic-06/)
- **站内配套专题**：[转录因子与顺式调控元件分析](../../topics/regulatory-genomics-ai/m09-topic-01/)
