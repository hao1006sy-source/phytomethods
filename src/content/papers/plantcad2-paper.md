---
title: "PlantCAD2: A DNA foundation model for interpreting genomes across flowering plants"
summary: "基于 Mamba2 状态空间长上下文与反向互补等变性架构的开花植物 DNA 基础模型及单碱基分辨率调控解释基准。"
authors: "Zhai J, Gokaslan A, Hsu S-K, Chen S-P, Liu Z-Y, Marroquin E, Czech E, Cannon B, Berthel A, Romay MC, Pennell M, Kuleshov V, Buckler ES"
year: 2026
journal: Cell Genomics
doi: 10.1016/j.xgen.2026.101329
type: method
methodIds: [plantcad2]
domainIds: [regulatory-genomics-ai]
speciesIds: [maize]
status: published
updatedAt: 2026-11-25
---

# PlantCAD2: A DNA foundation model for interpreting genomes across flowering plants

## 1. 研究背景与算法贡献

基因组基础大模型正在彻底改写非编码调控序列（Non-coding Regulatory DNA）的解读范式。然而，在植物这一特殊领域，第一代基于标准 Transformer 架构的模型面临严峻的物理与算法结构瓶颈：
1. **二次方计算复杂度导致上下文长度严重受限**：标准的双向自注意力机制计算与显存开销随序列长度呈现 $O(L^2)$ 爆炸，导致模型输入窗口通常被压缩在 1 kb 左右，无法捕获远端增强子、染色质拓扑绝缘边界以及长程顺式元件之间的空间互作；
2. **缺乏 DNA 双螺旋物理对称性约束**：DNA 是反向平行的双链分子，顺式元件在正链与反向互补（Reverse-Complement, RC）负链上行使相同的物理识别功能。传统模型必须通过数据增强在正负链分别学习，不仅训练效率低下，还极易产生正负链预测不自洽的数学谬误；
3. **$k$-mer 分词丧失单碱基物理分辨率**：粗粒度的 6-mer 或 BPE 分词模糊了单个点突变（SNV）在蛋白质物理结合界面上的精准原子接触。

2026 年，康奈尔大学与 USDA-ARS 的 J. Zhai、A. Gokaslan、S.-K. Hsu 以及 Edward S. Buckler 等在 Cell Press 旗舰期刊 *Cell Genomics* 上推出了 **PlantCAD2**。PlantCAD2 针对植物基因组完成了底层架构的革命性重构：
- **基于长上下文状态空间模型（Mamba2 / Caduceus）架构**：突破了注意力瓶颈，在单碱基分辨率下将有效感受野延伸至 **8192 bp**（超长线性扩展）；
- **原生反向互补等变性（RC Equivariance）归纳偏置**：模型在物理上严格保证对正反双链输入产生数学等价的表征；
- **覆盖 65 个开花植物（Angiosperms）高质量基因组预训练**：在涵盖单子叶禾本科、双子叶核心分支的超大比较基因组学语料上完成预训练，并在玉米（Maize）等复杂农作物的开放染色质可及性、基因表达及跨物种进化保守性预测中树立了全新的世界领先基准。

---

## 2. 核心数学模型与数据结构

### 2.1 Mamba2 状态空间序列建模（SSM）

为了克服传统 Transformer 的二次方复杂度，PlantCAD2 采用了最新的 **Mamba2 状态空间模型（State Space Model, SSM）** 骨干网络：
- 连续时间状态空间方程：
  $$h'(t) = A h(t) + B x(t), \quad y(t) = C h(t)$$
  其中 $x(t)$ 为单碱基序列输入，$h(t)$ 为隐状态向量，$y(t)$ 为预测输出；
- 通过零阶保持（ZOH）离散化后，状态转移矩阵 $A$ 依赖输入数据自适应变化（Selective State Spaces）；
- **线性时间与内存复杂度**：序列前向计算与反向传播的复杂度降低至严格线性的 $O(L)$，使得模型能够在单张 GPU 上直接吞吐高达 8192 bp 的超长单碱基序列。

### 2.2 Caduceus 双向反向互补（RC）等变性机制

为确保模型遵循 DNA 分子的本质物理法则，PlantCAD2 引入了 Caduceus 的 RC 等变设计：
- 定义反向互补置换算子 $\rho_{\text{rc}}$，对任意核苷酸序列 $s = (s_1, s_2, \dots, s_L)$，其反向互补为 $\bar{s} = (\text{comp}(s_L), \dots, \text{comp}(s_1))$；
- 模型的神经网络层满足严格的等变性条件：
  $$f(\rho_{\text{rc}}(s)) = \rho_{\text{rc}}(f(s))$$
  通过参数共享与通道反转，彻底根除了同一突变在正链和负链预测分值不一致的技术假象，使得特征提取效率提升一倍。

### 2.3 单碱基无分词输入与自监督预训练

PlantCAD2 摒弃了基于 $k$-mer 的粗粒度分词器：
- 词表仅由 4 个基本核苷酸字母（`A, C, G, T`）及少量特殊符号构成；
- 采用掩码语言模型（MLM）进行单碱基填空预训练，网络能够高灵敏度感知单个核苷酸缺失、插入或单碱基置换（SNP）对局部热力学自由能和转录因子亲和力的细微扰动。

---

## 3. 算法复杂度与计算性能

1. **参数规模与显存优化**：模型拥有约 6.76 亿（676M）参数。相较于参数量相近的 Transformer 架构，Mamba2 在处理 8 kb 序列时的显存消耗降低 75%，推理吞吐量提升 3 至 4 倍。
2. **长上下文消融优势**：论文实验表明，在玉米开放染色质（ATAC-seq 可及性）预测任务中，随着有效上下文窗口从 1 kb 扩展至 8 kb，受试者精度-召回率曲线下面积（AUPRC）从 0.587 显著跃升至 **0.711**，充分证明植物基因调控极其依赖长距离远端增强子信息的支撑。
3. **零样本保守性基准领先**：在跨被子植物物种的 12 项进化保守性零样本测试中，PlantCAD2 有 10 项显著超越了参数量高达 70 亿（7B）的通用大模型 Evo2。

---

## 4. 植物基因组学应用场景与科研价值

玉米等大基因组作物具有巨大的基因间非编码区，驯化与改良过程中的关键数量性状位点（QTL）多位于远端调控元件中：
- **玉米全组织开放染色质与顺式调控元件图谱解析**：利用 8 kb 单碱基长上下文，精准预测植物在根、茎、叶各组织中潜在开放的染色质峰值；
- **农艺关键基因长程增强子与启动子互作挖掘**：例如在水稻 *IPA1* 或玉米 *tb1* 等经典驯化基因周围，定位位于转录起始位点数千碱基以外的调控元件；
- **全基因组功能性非编码自然变异优先排序**：在全基因组重测序数据中，对数百万个天然 SNPs 进行高通量单碱基突变效应打分，助力分子标记辅助选择与全基因组选择（GS）育种。

---

## 5. 输入输出规范与关键参数指南

### 5.1 核心调用规范与模型执行代码示例 (Python / PyTorch)
```python
import torch
from plantcad.models import PlantCAD2Model
from plantcad.tokenizers import SingleNucleotideTokenizer

# 1. 初始化单碱基分词器并加载 PlantCAD2-676M 预训练模型
tokenizer = SingleNucleotideTokenizer()
model = PlantCAD2Model.from_pretrained("plantcad/plantcad2-676m")
model.eval()

# 2. 准备植物 8192 bp 单碱基基因组序列 (支持标准 A, C, G, T)
dna_seq_8k = "ATGCGATCGATC..." * 682  # 长度扩展至 8192 bp
tokens = tokenizer(dna_seq_8k, return_tensors="pt")

# 3. 前向推理提取具有反向互补等变性的序列嵌入
with torch.no_grad():
    embeddings = model(tokens.input_ids)
    # 输出形状: (Batch_size, 8192, Hidden_dim)

# 4. 执行单碱基变异效应预测 (Variant Effect Prediction, VEP)
# 针对位于第 4096 位的中心测试点突变计算 Reference 与 Alternate 的对数优势比
ref_score = model.predict_accessibility(tokens.input_ids)
tokens_alt = tokens.input_ids.clone()
tokens_alt[0, 4096] = tokenizer.convert_token_to_id("G")
alt_score = model.predict_accessibility(tokens_alt)
delta_vep = alt_score - ref_score
```

### 5.2 关键参数说明
- `context_length = 8192`：推荐设定的单碱基窗口跨度，能够最大化利用模型在长程调控关联上的归纳偏置。
- `SingleNucleotideTokenizer`：输入为严格的单核苷酸字符流，无需拼接重叠 $k$-mer，对点突变物理坐标定位具备原生单碱基对齐优势。

---

## 6. 阅读与复现资源

- **原始研究论文**：[Cell Genomics 2026 DOI: 10.1016/j.xgen.2026.101329](https://doi.org/10.1016/j.xgen.2026.101329)
- **PubMed 记录**：[PMID: 42567165](https://pubmed.ncbi.nlm.nih.gov/42567165/)
- **PMC 全文**：[PMCID: PMC13576720](https://pmc.ncbi.nlm.nih.gov/articles/PMC13576720/)
- **官方开源代码库**：[plantcad/plantcad GitHub](https://github.com/plantcad/plantcad)
- **站内配套专题**：[AI 大模型在植物基因组学中的应用](../../topics/regulatory-genomics-ai/m09-topic-06/)
- **站内配套专题**：[转录组学差异表达与统计模型](../../topics/regulatory-genomics-ai/m09-topic-02/)
