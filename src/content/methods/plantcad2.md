---
title: PlantCAD2
name: PlantCAD2
summary: 基于 Caduceus/Mamba2 双向状态空间模型 (SSM) 构建的长上下文、单碱基分辨率被子植物 DNA 基础模型，具备严格反向互补 (RC) 等变性与卓越的跨物种零样本调控预测能力。
dataType: 单碱基分辨率植物参考基因组 DNA 序列（最长支持 8,192 bp 上下文窗口）
principle: 双向状态空间模型 (Bidirectional SSM)、反向互补等变性 (RC Equivariance)、关联扫描线性序列建模与单碱基调控表征
domainIds: [regulatory-genomics-ai]
topicIds: [m09-topic-06, m09-topic-07]
principleIds: [bidirectional-state-space-model]
dataIds: [dna-sequence]
paper: plantcad2-paper
repository: https://github.com/plantcad/plantcad
version: "1.0.0"
status: published
updatedAt: 2026-11-25
---

## 模型定位与核心科学问题

植物顺式调控网络具有显著的远距离空间交互特征：关键转录因子不仅结合在转录起始位点（TSS）附近的近端启动子上，更广泛分布在距离编码区数千碱基甚至数十万碱基之外的远端增强子（Enhancers）与抑制子（Silencers）上。

然而，以往的植物深度学习模型面临多重根本性架构瓶颈：
1. **Transformer 计算复杂度的二次方爆炸**：标准自注意力机制的时间与显存复杂度为序列长度的平方 $\mathcal{O}(L^2)$。当输入长度扩展到数千碱基时，显存消耗呈指数级上升，迫使多数模型采用 6-mer 切分，牺牲了单碱基分辨率；
2. **DNA 双链反向互补（Reverse Complement, RC）物理对称性缺失**：在分子生物学中，DNA 正义链与其反向互补反义链是物理双螺旋分子的不可分割对偶面。传统大语言模型将 $5' \to 3'$ 与其反向互补链作为完全无关的序列处理，导致同一结合位点在正反链输入时输出截然相反的预测分数；
3. **因果卷积或单向掩码的局限**：单向生成式语言模型只能看到上游序列，无法捕捉下游调控元件的向后反馈。

为了攻克这些瓶颈，Kuleshov 实验室等研发了 **PlantCAD2**（发表于 *Cell Genomics*, 2026）。PlantCAD2 摒弃了传统的 Transformer 架构，基于 **Caduceus 与 Mamba2 双向状态空间模型（State Space Model, SSM）** 进行了根本性重构。它在 65 个被子植物基因组上完成了大规模预训练，在保持单碱基绝对分辨率的同时将上下文窗口推进至 **8,192 bp**，并首次在植物中实现了数学严格保证的**反向互补等变性（RC Equivariance）**。

---

## 核心算法架构与数学推导

```
   [65 个被子植物全基因组未标注 DNA 序列 (~数十亿碱基)]
                         │
                         ▼
        单碱基分词 (Single-base Resolution, Token = A, C, G, T)
        └─ 严格保持每个核苷酸的物理位置，杜绝 k-mer 分词的相位模糊
                         │
                         ▼
         Caduceus / Mamba2 双向状态空间模型 (676M 参数, 上下文 8,192 bp)
        ├─ 连续状态空间微分方程离散化 (Discretized SSM)
        ├─ 双向序列隐状态传递 (Bidirectional Hidden States)
        └─ 参数绑定与通道对换实现严格反向互补等变性 (RC Equivariant)
                         │
                         ▼
         关联扫描 (Associative Scan) 线性计算复杂度 O(L)
        └─ 显存与时间随序列长度线性增加，轻松处理 8,192 bp 超长区间
                         │
                         ├─────────────────────────────────────────┐
                         ▼                                         ▼
         零样本多任务评估 (Zero-shot Benchmarks)        远端调控与可及染色质预测 (ATAC-seq)
         ├─ 跨物种序列保守性评估 (Conservation)         ├─ 捕获 8 kb 内启动子与远端增强子协同
         └─ 显著超越参数量 7B 的 Evo2 模型              └─ 玉米开放染色质预测 AUPRC 跃升至 0.711
```

### 1. 连续状态空间模型 (SSM) 与离散化原理

PlantCAD2 底层建立在控制理论的状态空间模型之上。设输入单碱基序列为标量序列 $x(t)$，连续隐状态为向量 $h(t) \in \mathbb{R}^N$：
$$h'(t) = \mathbf{A} h(t) + \mathbf{B} x(t), \quad y(t) = \mathbf{C} h(t) + \mathbf{D} x(t)$$
其中 $\mathbf{A} \in \mathbb{R}^{N \times N}$ 为状态转移矩阵，$\mathbf{B}, \mathbf{C}$ 为输入和输出投影矩阵。

为了在离散计算机上处理离散的 DNA 序列，通过零阶保持（Zero-Order Hold, ZOH）与步长参数 $\Delta$ 将连续系统离散化：
$$\mathbf{\bar{A}} = \exp(\Delta \mathbf{A}), \quad \mathbf{\bar{B}} = (\Delta \mathbf{A})^{-1} (\mathbf{\bar{A}} - \mathbf{I}) \cdot (\Delta \mathbf{B})$$
离散化后，隐状态按照循环线性方程递推更新：
$$h_t = \mathbf{\bar{A}} h_{t-1} + \mathbf{\bar{B}} x_t, \quad y_t = \mathbf{C} h_t + \mathbf{D} x_t$$
**线性复杂度优势**：借助并行关联扫描（Parallel Associative Scan）算法，该递推过程可在现代 GPU 上并行完成，时间复杂度仅为 $\mathcal{O}(L)$，彻底摆脱了 Transformer $\mathcal{O}(L^2)$ 的内存墙束缚。

### 2. 双向建模 (Bidirectional SSM)

生物序列中的顺式调控元件对基因转录的影响没有单向时间因果性（上游启动子与下游内含子调控元件双向作用）。

PlantCAD2 构建了对称的双向状态传递通道：
- **正向状态通道**：从 $5' \to 3'$ 递推隐状态 $\overrightarrow{h}_t = \mathbf{\bar{A}}_{\text{fwd}} \overrightarrow{h}_{t-1} + \mathbf{\bar{B}}_{\text{fwd}} x_t$；
- **反向状态通道**：从 $3' \to 5'$ 递推隐状态 $\overleftarrow{h}_t = \mathbf{\bar{A}}_{\text{rev}} \overleftarrow{h}_{t+1} + \mathbf{\bar{B}}_{\text{rev}} x_t$；
- 在每一个核苷酸位置 $t$，将正向与反向隐状态进行门控融合，使模型在单碱基分辨率下同时拥有其左侧与右侧长达数千碱基的全局调控视野。

### 3. 反向互补等变性 (RC Equivariance)

设变换算子 $\rho_{\text{in}}$ 为输入 DNA 序列的反向互补变换：$\rho_{\text{in}}(x)_t = \text{comp}(x_{L - t + 1})$，其中 $\text{comp}(A) = T, \text{comp}(C) = G$。

PlantCAD2 在架构设计上实现了数学上的群等变性（Group Equivariance）：
$$f(\rho_{\text{in}}(x)) = \rho_{\text{out}}(f(x))$$
即：当输入反向互补链时，模型各层的隐藏表征与输出等价于对原输出执行空间镜像与通道取反操作。
这一特性通过在 Caduceus 块中强制参数对称绑定（Weight-tying across forward and reverse strands）以及通道对偶对换（Channel pairing）实现，从数学底层彻底消除了正反链预测不一致的系统性人造假象。

---

## 官方科学定量基准数据对比 (转述自原论文)

根据发表于 *Cell Genomics* (2026) 的原论文基准评测报告，PlantCAD2 在一系列植物下游任务中展现出跨尺度的突破：

| 评估基准任务 | 比较模型及参数量 | PlantCAD2 表现与官方量化数据 | 科学机理与结论 |
| :--- | :--- | :--- | :--- |
| **零样本序列保守性评估 (Zero-shot Conservation)** | Evo2 7B（70 亿参数，通用大模型） | **在 12 项跨植物任务中有 10 项超越 Evo2 7B** | 证明针对被子植物专门演化语料预训练的基础模型，比通用动植物混合大模型更加敏锐精准。 |
| **跨物种参数高效微调 (PEFT Transfer)** | AgroNT 1B（10 亿参数，Transformer 架构） | **在跨物种迁移的 7 项任务中全部超越 AgroNT 1B** | 单碱基分辨率结合双向 SSM 架构在跨物种外推中具备更优的顺式语法泛化性。 |
| **玉米开放染色质预测 (ATAC-seq AUPRC)** | PlantCAD2 短上下文基线 | **从短上下文的 0.587 跃升至长上下文 (8 kb) 的 0.711** | 扩展至 8,192 bp 上下文使模型成功涵盖了远端调控元件与染色质微环境，大幅减少了假阳性。 |

---

## 植物应用评估与技术考量

| 植物基因组特性 | 潜在应用风险与局限 | 规范对策与最佳实践 |
| :--- | :--- | :--- |
| **超长非编码与异染色质稀释** | 部分禾本科作物（如大麦、黑麦）基因组中高达 85% 为高度重复的逆转录转座子（LTR-RT），8 kb 窗口可能全部落入转座子内部。 | 在构建输入序列时，应以高置信度基因的转录起始位点（TSS）或已知的开放染色质区域（Peak）为锚点中心展开 8,192 bp 窗口，确保窗口内包含有效基因组上下文。 |
| **硬件与推理环境要求** | Mamba2 架构依赖优化的 GPU Triton 算子，需在支持 CUDA 的现代硬件（如 Ampere / Hopper 架构，A100 / H100 / RTX 3090/4090）上运行以发挥极致速度。 | 在部署环境前，必须验证 PyTorch 与 `mamba-ssm` / `causal-conv1d` 扩展库的编译版本兼容性；推理 8 kb 序列时单样本显存占用仅需约 4~8 GB。 |
| **模型输出的生物学因果界定** | 即使模型在零样本下给出极高的突变效应差值（ΔScore），其本质仍属于基于序列演化似然的统计推断。 | 严禁将模型预测分数等同于绝对的生化结合或表型因果；筛选出的高危/主效调控位点必须通过双荧光素酶（Dual-LUC）报告系统或 CRISPR-Cas9 靶向基因编辑进行实验验证。 |

---

## 典型调用代码与推理流程

以下为基于 Python 3.10+ 与官方 `plantcad` 库载入 PlantCAD2 进行单碱基调控表征推理的示例：

```python
import torch
from plantcad.models import PlantCAD2ForMaskedLM
from plantcad.tokenizer import SingleBaseDNATokenizer

# 1. 载入 PlantCAD2 预训练模型与单碱基分词器
# 权重已开源于 Hugging Face: kuleshov-group/plantcad2-676m
device = "cuda" if torch.cuda.is_available() else "cpu"
tokenizer = SingleBaseDNATokenizer()
model = PlantCAD2ForMaskedLM.from_pretrained(
    "kuleshov-group/plantcad2-676m",
    torch_dtype=torch.bfloat16
).to(device)
model.eval()

# 2. 准备植物 8,192 bp 长上下文 DNA 序列 (以玉米 ZmNAC 启动子及侧翼为例)
# 字符串必须为纯单碱基序列 (A, C, G, T)
dna_seq_8k = "ACGT..." * 2048  # 恰好 8192 bp

# 3. 单碱基无偏编码 (不进行任何 k-mer 切分)
tokens = tokenizer.encode(dna_seq_8k, return_tensors="pt").to(device)

# 4. 执行状态空间模型线性前向推理
with torch.no_grad():
    outputs = model(tokens, output_hidden_states=True)
    # 提取顶层单碱基分辨率隐状态表征: shape 为 (1, 8192, 1024)
    hidden_states = outputs.hidden_states[-1]

print(f"成功获得 8192 bp 单碱基上下文表征矩阵: {hidden_states.shape}")

# 5. 反向互补等变性验证 (RC Equivariance Check)
# 模型内部已原生绑定 RC 对称性，对反向互补链推理与原表征完美对偶
rc_seq = tokenizer.reverse_complement(dna_seq_8k)
rc_tokens = tokenizer.encode(rc_seq, return_tensors="pt").to(device)

with torch.no_grad():
    rc_outputs = model(rc_tokens, output_hidden_states=True)
    rc_hidden = rc_outputs.hidden_states[-1]
```

---

## 科学研究案例与分析流转界定

- **被子植物全基因组顺式元件跨物种预测案例**：在被子植物演化调控图谱绘制中，研究者利用 PlantCAD2 在 65 个植物物种上训练的深层权重，对水稻、大豆、拟南芥等多个代表性物种的核心抗逆启动子进行跨物种零样本保守性打分。模型在单碱基分辨率下清晰勾勒出转录因子结合基序的保守“足迹”（Footprint），为非模式植物缺乏表观组测序数据时的顺式元件定位提供了极其强大的计算推断手段；
- **分析工具流转与协作边界**：
  - **上游序列支持**：输入序列由物种基因组组装版本（如水稻 MSU7 / Nipponbare）标准 FASTA 提供；
  - **下游调控与验证衔接**：PlantCAD2 预测的高活性 8 kb 调控区间，可与 MEME Suite / FIMO 结合精确定位直接结合位点，并与 DESeq2 的实验差异表达数据协同验证，为作物合成生物学启动子设计提供精准指导。
