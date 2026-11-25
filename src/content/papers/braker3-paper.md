---
title: "BRAKER3: Fully automated genome annotation using RNA-Seq and protein evidence with GeneMark-ETP, AUGUSTUS, and TSEBRA"
summary: "提出全自动真核生物基因组蛋白质编码基因预测体系 BRAKER3，无缝整合转录组短读段 RNA-seq 剪接比对与跨物种同源蛋白质比对证据，由 GeneMark-ETP 自动生成高置信度种子基因并无监督自适应训练 AUGUSTUS 隐马尔可夫模型，经 TSEBRA 组合器实现极高精度的全基因组基因结构注释。"
authors: "Gabriel L, Hoff KJ, Brůna T, Borodovsky M, Stanke M"
year: 2024
journal: Genome Research
doi: 10.1101/gr.278090.123
type: method
methodIds: [braker3]
domainIds: [genome-annotation]
speciesIds: [arabidopsis, tomato]
status: published
updatedAt: 2026-11-25
---

## 研究背景与算法贡献

在动植物新参考基因组测序后，如何高通量、高保真地注释全基因组数万个蛋白质编码基因是连接基因组学与功能生物学的关键桥梁。然而，传统的从头（*ab initio*）预测与早期证据整合工具面临两难困境：
- **纯从头预测（如早期 AUGUSTUS / SNAP）**：依赖严格的预训练模型。当研究人员处理非模式植物、古老演化分支或倍性复杂的特殊物种时，缺乏高质量的手工校正训练集，导致外显子边界错跳、内含子假剪接与嵌合预测严重；
- **单一证据预测的片面性**：纯依赖 RNA-seq 转录组证据（如 BRAKER1）无法预测在特定组织中低表达、仅在特殊胁迫诱导或特定发育阶段瞬时转录的基因；而纯依赖跨物种同源蛋白比对（如 BRAKER2）受限于同源搜索灵敏度，难以精确界定具有物种特异性的非保守可变剪接外显子。

由德国格赖夫斯瓦尔德大学 Mario Stanke、Katharina Hoff 以及佐治亚理工学院 Mark Borodovsky 团队联合开发的 **BRAKER3**，代表了现代真核生物全自动基因注释技术的最高水准。其核心突破在于将 **GeneMark-ETP**、**AUGUSTUS** 与 **TSEBRA** 深度融合：
1. **多源异质证据闭环耦合**：原生同时接收 RNA-seq 比对生成的物理剪接接头（Splicing Junctions）与来自 OrthoDB 的超大规模跨物种同源蛋白比对（ProtHint）；
2. **GeneMark-ETP 动态迭代种子训练**：直接利用同源蛋白与 RNA-seq 的物理重合区间提取极高置信度的完整基因结构，彻底摒弃任何人工干预或预先训练参数；
3. **TSEBRA 基于权重的双模型模型集成**：利用 TSEBRA 针对 GeneMark-ETP 与 AUGUSTUS 的竞争性预测转录本进行外显子支持度赋权与剪接位点协调，输出结构最完整、假阳性最低的最终基因集。

---

## 核心数学模型与数据结构

BRAKER3 采用精密的分层迭代状态机流水线，各组件间的数据流与数学约束如下：

```
           RNA-seq (HISAT2 BAM)     +     OrthoDB 植物同源蛋白
                    │                                 │
                    ▼                                 ▼
         [提取高置信剪接接头 SJ]             [ProtHint: 提取蛋白提示 Hints]
                    │                                 │
                    └───────────────┬─────────────────┘
                                    │
                                    ▼
                         [GeneMark-ETP 第一阶段]
         • 启发式识别具有双重证据支持的初始基因核心 (Core CDS)
         • 基于自适应转移概率矩阵估计 GC 含量分层马尔可夫模型
                                    │
                                    ▼
                     [生成高置信度黄金训练基因集]
                                    │
                                    ▼
                          [AUGUSTUS 参数训练]
         • 极大似然估计 (MLE) 优化外显子/内含子隐马尔可夫转移概率
         • 结合转录与同源提示生成全基因组 AUGUSTUS 预测转录本
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
          GeneMark-ETP 预测模型              AUGUSTUS 预测模型
                    │                               │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
                    [TSEBRA: 转录本选择器与证据组合器]
         • 评估外显子支持率 (Exon support score)
         • 过滤孤立无证据 ab initio 转录本并解析可变剪接
                                    │
                                    ▼
                     输出标准结构注释 GFF3 / GTF
```

1. **同源提示（ProtHint）得分计算**：
   对于比对至基因组区域的同源蛋白质局域序列，设外显子内部密码子对齐得分为 $S_{\text{align}}$，剪接位点（供体 `GT` 与受体 `AG`）的保守氨基酸对应打分为 $S_{\text{splice}}$。ProtHint 计算每个候选剪接边界的概率似然：
   $$P_{\text{hint}} = \frac{1}{1 + e^{-(\beta_0 + \beta_1 S_{\text{align}} + \beta_2 S_{\text{splice}})}}$$
   只有当 $P_{\text{hint}}$ 超出动态可靠性截断值时，才被赋予“高优先级外部提示（High-confidence hints）”；
2. **GeneMark-ETP 隐半马尔可夫模型（HSMM）**：
   模型将真核生物基因组序列划分为外显子、内含子、基因间区等隐藏状态。外显子长度分布采用非负连续伽马分布拟合：
   $$f(L; \alpha, \lambda) = \frac{\lambda^\alpha}{\Gamma(\alpha)} L^{\alpha - 1} e^{-\lambda L}$$
   结合密码子三联体偏好（In-frame 6-mer 频率矩阵），显著提升起始密码子（ATG）与终止密码子判定准确度；
3. **TSEBRA 转录本评估优化函数**：
   对于候选转录本 $T$，设其外显子集合为 $\mathcal{E}(T)$，内含子集合为 $\mathcal{I}(T)$。TSEBRA 计算转录本综合支持度评分：
   $$\text{Score}(T) = w_1 \frac{|\mathcal{E}_{\text{supported}}(T)|}{|\mathcal{E}(T)|} + w_2 \frac{|\mathcal{I}_{\text{supported}}(T)|}{|\mathcal{I}(T)|} - w_3 \mathbb{I}(\text{overlaps unsupported non-canonical splice})$$
   在发生位点冲突时，贪心保留支持度最高的非冗余转录本。

---

## 植物基因组学应用场景与科研价值

1. **复杂植物大基因组从头注释标准流水线**：
   植物基因组内含子平均长度跨度大、假基因（Pseudogenes）与非自主转座子极多。BRAKER3 通过同源蛋白质提示与转录剪接的双重过滤，能有效避免将截断型 LTR 反转录转座子误判为真实宿主蛋白质编码基因；
2. **园艺与作物新种质的精准可变剪接捕获**：
   在果树（如芒果、苹果）、蔬菜（番茄、辣椒）及粮食作物中，结合多组织（根、茎、叶、花、果实）混合 RNA-seq，BRAKER3 能高灵敏度解析响应生物/非生物胁迫的特定剪接异构体（Isoforms）；
3. **远缘甚至孤儿植物（Orphan crops）注释突破**：
   对于缺乏近缘属物种高质量基因库的孤儿植物，BRAKER3 可直接借助 OrthoDB 的植物界（Viridiplantae）泛蛋白库，实现高精度的自举迭代训练。

---

## 阅读与复现资源

- **论文全文**：[Genome Research, 34(5), 787–797 (2024)](https://doi.org/10.1101/gr.278090.123)
- **PubMed 记录**：[PMID: 38942588](https://pubmed.ncbi.nlm.nih.gov/38942588/)
- **官方开源代码仓库**：[GitHub - Gaius-Augustus/BRAKER](https://github.com/Gaius-Augustus/BRAKER)
- **相关算法工具详情**：[BRAKER3 算法原理与指南](../../methods/braker3/)
