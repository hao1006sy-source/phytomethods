---
title: AgroNT
name: AgroNT
summary: 基于 48 种可食用植物全基因组预训练的 10 亿参数 Agronomic Nucleotide Transformer 基础模型，赋能植物顺式调控元件挖掘、组织特异性表达预测与农艺变异饱和突变扫描。
dataType: 单碱基植物参考基因组 DNA 序列（输入长度通常为 1,000~6,000 bp）
principle: 非重叠 6-mer 分词、Transformer 编码器架构、遮蔽语言模型预训练 (MLM) 与序列计算饱和突变扫描 (ISSM)
domainIds: [regulatory-genomics-ai]
topicIds: [m09-topic-06, m09-topic-07]
principleIds: [sequence-transformer]
dataIds: [dna-sequence]
paper: agro-nt-2024
repository: https://github.com/instadeepai/nucleotide-transformer
version: "1.0.0"
status: published
updatedAt: 2026-11-25
---

## 模型定位与核心科学问题

长期以来，基于深度学习的基因组序列预测模型（如 Enformer、Basenji）主要在人类和小鼠基因组上训练。然而，植物基因组具有极其独特的复杂性：极高的转座子（TE）比例、频繁发生的全基因组复制（WGD）、多倍体分化以及极其庞大的基因组体积差异（从拟南芥的 135 Mb 到六倍体小麦的 16 Gb）。直接将人类预训练模型迁移至植物作物，预测准确率会出现断崖式下跌。

为了构建专属于农业作物的生命“大语言模型”，InstaDeep 与合作团队联合推出了 **AgroNT（Agronomic Nucleotide Transformer）**（发表于 *Nature Communications*, 2024）。

AgroNT 拥有约 10 亿参数（1B），是全球首个在大规模可食用植物基因组上进行系统无监督预训练的基础模型。它克服了以往植物模型仅能针对单一作物、单一任务的狭隘性，能够从纯序列中自动捕捉植物顺式调控语法（Cis-regulatory grammar），并在下游调控元件识别、基因表达强度预测及农艺有益变异优先排序等数十项任务中展现出卓越的少样本（Few-shot）和零样本（Zero-shot）预测性能。

---

## 核心算法架构与数学推导

```
   [48 种农作物全基因组未标注 DNA 序列 (~数十亿碱基)]
                         │
                         ▼
        非重叠 6-mer 切分 (Non-overlapping 6-mers, Stride = 6)
        └─ 词表大小 V = 4^6 = 4,096 个常规 token + 特殊符号 ([CLS], [MASK], [PAD])
                         │
                         ▼
          Transformer 编码器基础模型 (1B 参数, 33 层, 隐藏维度 1536)
          └─ 引入旋转位置编码 (RoPE) 强化相对距离语义
                         │
                         ▼
          遮蔽语言模型预训练 (Masked Language Modeling, MLM)
          └─ 随机遮蔽 15% 的 6-mer，最小化预测负对数似然交叉熵损失
                         │
                         ├─────────────────────────────────────────┐
                         ▼                                         ▼
            下游任务适配微调 (Fine-tuning)             计算饱和突变扫描 (In Silico Saturation Mutagenesis)
            ├─ 启动子/终止子分类预测                   ├─ 对每个位点引入单核苷酸突变 (SNV)
            ├─ 组织特异性表达丰度回归                  ├─ 计算突变体与野生型的模型输出差值 (ΔScore)
            └─ 多组织染色质可及性 (ATAC-seq) 预测      └─ 识别关键转录因子结合核心基序
```

### 1. 预训练语料基础与分词机制 (Tokenization)

AgroNT 在涵盖 48 种重要栽培作物及模式植物的参考基因组上训练，覆盖单子叶植物（水稻、玉米、小麦、大麦、高粱、谷子等）、双子叶植物（大豆、油菜、番茄、马铃薯、棉花、木薯等）及模式拟南芥：
- **非重叠 6-mer 切分（Stride = 6）**：
  若采用单碱基分词，上下文窗口对长程调控序列的容纳极为有限。AgroNT 采用步长为 6 的不重叠切分：
  $$S = (s_1 s_2 \dots s_6), (s_7 s_8 \dots s_{12}), \dots, (s_{6L-5} \dots s_{6L})$$
  序列中每个 token 代表一个长度为 6 的 $k$-mer。由于字母表仅有 $\{A, C, G, T\}$，词表理论大小为 $|\mathcal{V}| = 4^6 = 4,096$；
- **优势**：将实际可输入的物理碱基长度扩大了 6 倍。例如 1,000 个 token 即可完整覆盖长达 6,000 bp 的复杂植物启动子与远端调控区。

### 2. Transformer 编码器结构

AgroNT 基于仅编码器（Encoder-only）的 Transformer 架构：
- 参数规模：约 10 亿参数（1B）；
- 隐藏维度（Hidden Dimension）$d = 1536$，包含 33 个 Transformer 块，24 个多头注意力机制（Multi-Head Attention）；
- **旋转位置编码（Rotary Position Embeddings, RoPE）**：取代传统的绝对三角正弦位置编码。RoPE 通过将查询向量 $\mathbf{q}$ 与键向量 $\mathbf{k}$ 在复数空间旋转相对距离差值，天然赋予模型对植物序列相对距离的等变感知能力，大幅改善了模型在长序列中的外推能力。

### 3. 预训练目标：遮蔽语言模型 (Masked Language Modeling, MLM)

在无人工标注的前提下，模型通过预测遮蔽的 DNA 片段学习深层基因组演化语法：
1. 随机选取输入序列中 15% 的 6-mer token；
2. 其中 80% 的被选 token 替换为特殊的 `[MASK]` 标记，10% 替换为随机的其他 6-mer，10% 保持不变；
3. 模型优化目标是最小化在被遮蔽位置上的交叉熵负对数似然损失：
   $$\mathcal{L}_{\text{MLM}}(\theta) = -\sum_{i \in \text{Masked}} \log P(x_i \mid \mathbf{x}_{\setminus i}; \theta)$$
   通过迫使网络根据侧翼数千碱基的序列上下文来“猜出”缺失的 6-mer，模型被迫在自注意力层中内化植物顺式调控规律、密码子偏好、剪接供体/受体信号及核小体定位特征。

### 4. 计算饱和突变分析 (In Silico Saturation Mutagenesis, ISSM)

在微调后或利用预训练表征，AgroNT 具备强大的单核苷酸变异（SNV）致病性与调控效应打分能力：
对于长度为 $L$ 的目标植物调控序列 $S$，在位置 $p$（$1 \le p \le L$）将其原始参考碱基 $ref$ 替换为候选突变碱基 $alt \in \{A, C, G, T\} \setminus \{ref\}$：
$$\Delta \text{Score}_{p, alt} = f_{\theta}(S_{p \to alt}) - f_{\theta}(S_{\text{ref}})$$
若 $f_\theta$ 为下游微调的启动子活性预测头，$\Delta \text{Score}$ 能够直接量化该点突变导致的功能增益（Gain-of-Function）或功能缺失（Loss-of-Function），无需耗费数月进行繁复的启动子定点突变转基因实验。

---

## 植物应用评估与技术考量

| 植物模型特性 | 潜在技术风险与局限 | 规范应对与最佳实践 |
| :--- | :--- | :--- |
| **6-mer 分词引起的相位偏倚** | 点突变发生在 6-mer 的第 1 位与第 6 位时，分词划分相位不同，可能引起输出分数的细微数值摆动。 | 针对重要的致病/功能变异位点，建议对输入序列进行 1~5 bp 的微小滑动平移（Shifting），多次推理取模型输出平均值以平滑相位误差。 |
| **多倍体同源序列的数据泄漏** | 小麦或油菜基因组内存在高度相似的同源拷贝（Homeologs）。若在评估时采用随机切分，训练集与测试集包含相同的启动子拷贝，将导致虚高指标。 | **严格按染色体划分（Hold-out Chromosome）**：例如将拟南芥第 4 号染色体或水稻第 10 号染色体的所有基因完全隔离作为独立测试集，严禁跨染色体混淆。 |
| **超长非编码与转座子稀释** | 玉米等作物基因间区包含超过 80% 的转座子，有效顺式元件常分布在极远的远端增强子（数十 kb 处）。 | AgroNT 的输入窗口主要针对 1~6 kb 的近端启动子与终止子，对于超长距离染色质三维环化（Looping）相互作用，需联合 Hi-C 锚点或采用针对更长上下文的模型（如 PlantCAD2）进行互补解释。 |

---

## 典型调用代码与推理流程

以下为基于 Python 3.10+ 与 Hugging Face `transformers` 库载入 AgroNT 提取植物序列特征的示例：

```python
import torch
from transformers import AutoTokenizer, AutoModelForMaskedLM

# 1. 载入官方开源的 AgroNT 预训练模型与分词器 (需 Hugging Face 访问环境)
model_name = "InstaDeepAI/agro-nucleotide-transformer-1b"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForMaskedLM.from_pretrained(
    model_name,
    torch_dtype=torch.float16,   # 使用半精度节省 GPU 显存
    device_map="auto"
)
model.eval()

# 2. 准备植物目标启动子序列 (大写 DNA 字符串, 不含非法字符)
# 以水稻抗逆转录因子启动子 1000 bp 为例
rice_promoter_seq = "ATGCTAGCTAGCTAGCTA..." # 长度可达 6,000 bp

# 3. 对序列进行 6-mer 分词编码
inputs = tokenizer(
    rice_promoter_seq,
    return_tensors="pt",
    padding="max_length",
    max_length=1000,
    truncation=True
).to("cuda")

# 4. 前向推理提取序列隐藏层上下文表征 (Embeddings)
with torch.no_grad():
    outputs = model(**inputs, output_hidden_states=True)
    # 提取最后一层隐藏状态: (batch_size, seq_len, 1536)
    last_hidden_states = outputs.hidden_states[-1]
    
    # 计算全序列的平均池化表征 (Sequence Representation)
    seq_embedding = last_hidden_states.mean(dim=1).squeeze().cpu().numpy()

print("已成功提取植物序列 1536 维特征表征向量:", seq_embedding.shape)

# 5. 计算饱和突变打分示例 (计算特定碱基替换导致的似然损失变化)
# 将序列第 120 位的碱基突变为 'G' 并评估预测概率变化
```

---

## 科学研究案例与上下游分析协同

- **木薯淀粉与抗逆顺式元件饱和突变案例**：在木薯基因组功能顺式调控元件的无监督扫描中，研究团队利用 AgroNT 对木薯关键叶绿体前体蛋白及碳同化酶启动子执行了全序列 *in silico* 饱和突变分析，成功高精度识别出与已验证生化结合位点完全吻合的 8 bp 核心转录因子结合基序，展现了 DNA 大模型在非模式农作物顺式语法挖掘中的强大穿透力；
- **分析工具流转与协作边界**：
  - **上游序列提取**：由 bedtools 或 Plant Genome Hub 提供特定物种标准注释下的无偏启动子与基因间区 FASTA 序列；
  - **横向互补**：AgroNT 基于 6-mer 的编码器更偏重启动子/终止子局部的强度预测与表征提取；而在单碱基精细分辨率与跨越 8,192 bp 超长上下文的 zero-shot 保守性评价上，可与基于状态空间模型的 **PlantCAD2** 形成优势互补。
