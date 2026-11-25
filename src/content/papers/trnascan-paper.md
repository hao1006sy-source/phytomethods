---
title: "tRNAscan-SE 2.0: improved detection and functional classification of transfer RNA genes"
summary: "提出全基因组转移 RNA (tRNA) 识别与功能分类体系 tRNAscan-SE 2.0，基于多重协方差模型 (CMs) 与分层同源搜索算法，攻克假基因 (Pseudogenes) 与未知等受体 (Isodecoders/Isoacceptors) 精准区分难题，并建立真核与细胞器特异性 tRNA 注释权威标准。"
authors: "Chan PP, Lin BY, Mak AJ, Lowe TM"
year: 2021
journal: Nucleic Acids Research
doi: 10.1093/nar/gkab688
type: method
methodIds: []
domainIds: [genome-annotation]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

## 研究背景与算法贡献

转移 RNA（Transfer RNA, tRNA）是生物体遗传信息翻译的核心适配体分子，由约 70~90 个核苷酸折叠成经典的三叶草（Cloverleaf）二级结构与 L 型三维空间结构。在真核生物与复杂植物基因组中，tRNA 基因注释面临多项长期困扰：
- **大量源自反转录转座的 tRNA 假基因（tRNA-derived Pseudogenes / SINEs）污染**：许多真核生物基因组中存在数以千计的由 tRNA 衍生的逆转录假基因或短散在核元件（SINEs）。这些假基因保留了部分三叶草特征，但缺乏功能活性，传统算法极易产生大量假阳性报告；
- **同功受体（Isoacceptors）与同解码受体（Isodecoders）功能分类不准**：针对相同氨基酸、但具有不同反密码子或不同骨架序列的复杂等位亚型，早期工具缺乏特异性的分类评分模型；
- **植物核基因组与细胞器基因组（线粒体与叶绿体）的分异**：植物细胞器 tRNA 与核编码 tRNA 在密码子使用模式（如非标准遗传密码）和二级结构上具有显著系统发育差异，混合使用通用模型容易导致漏检。

由加利福尼亚大学圣克鲁兹分校（UCSC）Todd Lowe 实验室开发的 **tRNAscan-SE 2.0**，是全球公认的 tRNA 基因鉴定金标准系统。其核心方法突破包括：
1. **域特异性多重协方差模型（Domain-specific Covariance Models）**：针对真核生物（Eukaryota）、细菌（Bacteria）、古菌（Archaea）以及线粒体/叶绿体独立训练了高精度的概率结构模型；
2. **基于伪基因评分（Pseudogene Filtering）的严格排除流水线**：结合一级序列保守性、二级结构茎环折叠自由能变化与反密码子环结构完整性，首创高精度假基因判别评分卡；
3. **同功受体与同解码受体全景功能分类**：自动识别常规 20 种标准氨基酸、稀有硒半胱氨酸（Sec / SeCys）及吡咯赖氨酸（Pyl），并精确标记抑制子（Suppressor）tRNA。

---

## 核心数学模型与数据结构

tRNAscan-SE 2.0 采用启发式多阶段串联工作流，兼顾搜索通量与结构判别精度：

```
                    待测植物全基因组 FASTA
                               │
                               ▼
        [第一阶段: 启发式快速扫描 (First-pass Candidate Scanners)]
• 运行 Infernal 针对保守 tRNA 轮廓 HMM 进行单链极速粗筛
• 可选结合 tRNAscan 启发式算法或 Aragorn 进行候选位点提取
                               │
                               ▼
        [第二阶段: 协方差模型高精度结构评估 (Infernal CM Evaluation)]
• 运行针对真核生物 (Eukaryota) 校准的完整协方差模型
• 计算三叶草茎环 (受体臂、D 环、反密码子环、T 环) 互补配对打分
                               │
                               ▼
        [第三阶段: 反密码子识别与内含子剪接解析 (Anticodon & Intron)]
• 精确定位反密码子三联体 (Anticodon triplet) 与对应的氨基酸类别
• 识别并切除插入在反密码子环 37/38 位下游的特定非编码内含子
                               │
                               ▼
        [第四阶段: 假基因检测与功能验证模型 (Pseudogene Scoring)]
• 计算二级结构异常罚分与核心不变碱基 (Invariant bases) 保守性得分
• 区分功能性真实表达 tRNA 与退化无活性假基因
                               │
                               ▼
         输出标准格式注释表、结构序列与 GFF3 染色体坐标
```

1. **结构打分与内含子切除模型**：
   真核生物 tRNA 常在反密码子环下游携带 10~100 bp 的特殊内含子。算法首先在无内含子假设下尝试对齐，若反密码子茎环得分异常降低，则动态启动内含子边界搜索算法，求解最优内含子起止坐标 $[i_s, i_e]$，使切除内含子后的成熟 tRNA 结构匹配分数最大化：
   $$S_{\text{mature}} = \max_{i_s, i_e} \text{Score}(x_{1 \dots i_s} \circ x_{i_e \dots L} | M_{\text{tRNA}})$$
2. **假基因判别指标卡（Pseudogene Classifier）**：
   假基因通常在结构不变位点（如 $U_8, A_{14}, G_{18}, G_{19}, U_{33}, A_{58}$）发生致命突变，或导致受体臂（Acceptor stem）发生不可配对的错配。算法计算结构偏离度综合得分：
   $$\text{Score}_{\text{pseudo}} = \Delta S_{\text{CM}} + \sum_{b \in \text{Invariant}} \log \frac{P_{\text{mut}}(b)}{P_{\text{wild}}(b)}$$
   当得分低于预设临界值时，该候选基因被强制赋予 `Pseudo` 标签并排除出高置信集合；
3. **Isodecoder 变异注释**：
   对于同一种反密码子（如核编码 `tRNA-Ala-AGC`），算法对全基因组所有拷贝的成熟序列进行多序列聚类，自动标记出由于体细胞演化产生的同解码突变拷贝。

---

## 植物基因组学应用场景与科研价值

1. **植物全基因组 tRNA 库权威发布与三叶草结构可视化**：
   在拟南芥、水稻、玉米等植物参考基因组及 PlantGDB 数据库中，tRNAscan-SE 2.0 是官方唯一指定的 tRNA 注释标准，产出规范的染色体分布图与反密码子使用频数；
2. **植物细胞质与细胞器（叶绿体/线粒体）翻译机制解耦**：
   植物拥有三套独立的基因组系统。利用 tRNAscan-SE 2.0 的特异模型（`-E` 真核模式、`-M chloroplast` 叶绿体模式、`-M vertmito` 线粒体模式），能够清晰解析细胞器基因组向细胞核转移的 tRNA 演化事件；
3. **tRNA 来源非编码小 RNA（tsRNAs / tRFs）源头比对基准**：
   近年来植物抗逆调控研究发现，tRNA 在特定酶切下会产生大量功能性的小 RNA 片段（tRFs）。高质量的 tRNAscan-SE 前体基因图谱是进行此类新型表观遗传学分析的绝对前提。

---

## 阅读与复现资源

- **论文全文**：[Nucleic Acids Research, 49(16), 9077–9096 (2021)](https://doi.org/10.1093/nar/gkab688)
- **PubMed 记录**：[PMID: 34478544](https://pubmed.ncbi.nlm.nih.gov/34478544/)
- **官方开源代码与文档**：[GitHub - UCSC-LoweLab/tRNAscan-SE](https://github.com/UCSC-LoweLab/tRNAscan-SE)
- **相关算法专题**：[非编码 RNA 注释专题](../../topics/genome-annotation/m02-topic-06/)
