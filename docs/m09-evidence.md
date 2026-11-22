# M09 科学内容与引用核验记录

核验日期：2026-11-22。范围为调控基因组学与 AI 的七个专题、八个方法条目、十三篇领域相关论文与 WGCNA 模拟教程。本页记录用于撰写的原始论文、官方实现和归属边界；论文案例只关联原文明确报告的工具。

## 方法与原始来源

| 方法 | 已核验来源 | 关键核验点 |
|---|---|---|
| DESeq2 | [Love et al., 2014](https://doi.org/10.1186/s13059-014-0550-8)；[Bioconductor](https://bioconductor.org/packages/DESeq2/) | 原始整数计数、负二项 GLM、离散度估计、设计与结果检验；玉米干旱应用按原论文关联。 |
| WGCNA | [Langfelder & Horvath, 2008](https://doi.org/10.1186/1471-2105-9-559)；[官方 CRAN 页面](https://cran.r-project.org/package=WGCNA) | 加权相关、拓扑重叠、动态模块及模块特征基因。紫米案例经[期刊原文](https://doi.org/10.1038/s41598-024-73698-w)核验。 |
| GENIE3 | [Huynh-Thu et al., 2010](https://doi.org/10.1371/journal.pone.0012776)；[官方 R 包](https://github.com/aertslab/GENIE3) | 每个 target gene 单独拟合 Random Forest/Extra-Trees 回归，按特征重要性排序候选边；原文测试 DREAM4 与大肠杆菌，不当作植物应用。 |
| GRNBoost2 / Arboreto | [Moerman et al., 2019](https://doi.org/10.1093/bioinformatics/bty916)；[官方仓库](https://github.com/aertslab/arboreto) | Gradient boosting 与可扩展任务调度；未核实到本站所列植物研究直接运行此工具。 |
| MEME Suite / FIMO | [Bailey et al., 2015](https://doi.org/10.1093/nar/gkv416)；[FIMO 文档](https://meme-suite.org/meme/doc/fimo.html) | 区分 de novo 发现、集合富集及已知 motif 扫描；拟南芥气孔命运研究的方法部分报告 FIMO motif 扫描。 |
| MOFA+ | [Argelaguet et al., 2020](https://doi.org/10.1186/s13059-020-02015-1)；[MOFA2 官方仓库](https://github.com/bioFAM/MOFA2) | 多视图/多组因子模型、随机变分推断、稀疏权重和因子解释。玉米整合网络作为植物研究路线案例，不关联为 MOFA+ 应用。 |
| AgroNT | [Mendoza-Revilla et al., 2024](https://doi.org/10.1038/s42003-024-06465-2)；[官方文档与代码](https://github.com/instadeepai/nucleotide-transformer) | 原文称 48 种植物基因组、Transformer、遮盖建模；论文评估调控注释、启动子/终止子、表达和变异优先级任务。 |
| PlantCAD2 | [Zhai et al., 2026](https://doi.org/10.1016/j.xgen.2026.101329)；[PubMed](https://pubmed.ncbi.nlm.nih.gov/42567165/)；[官方仓库](https://github.com/plantcad/plantcad)；[Hugging Face 权重集合](https://huggingface.co/collections/kuleshov-group/plantcad2-67e437e241a382671371a572) | Cell Genomics 6(9):101329；65 个被子植物基因组、676M 参数、8192 bp 上下文、Caduceus/Mamba2 状态空间架构。论文报告的任务差异、AUPRC 和比较范围均限制在各自 benchmark。 |

## 植物应用论文

- [玉米灌浆期干旱转录组](https://doi.org/10.1371/journal.pone.0223786)：论文报告使用 DESeq2 并对候选基因开展 qRT-PCR。
- [紫米灌浆后抗氧化相关共表达网络](https://doi.org/10.1038/s41598-024-73698-w)：方法部分报告使用 WGCNA；模块和 hub 基因作为候选相关，不视为直接因果。
- [拟南芥整合转录调控网络](https://doi.org/10.1038/s41477-021-00894-1)：motif、开放染色质、TF 结合和表达网络通过监督学习整合；记录为 GRN 领域案例，不归到 GENIE3/GRNBoost2。
- [拟南芥气孔细胞命运与染色质可及性](https://doi.org/10.1038/s41477-022-01304-w)：期刊全文描述使用 FIMO 扫描候选 motif；本文仅将 motif 任务与 MEME Suite 关联。
- [玉米多组学整合网络图谱](https://doi.org/10.1038/s41588-022-01262-1)：Nat Genet 55:144–153 (2023)，整合基因组、转录组、翻译组与蛋白质组数据。未据此推断论文使用 MOFA+。
- [AgroNT 研究](https://doi.org/10.1038/s42003-024-06465-2)：Communications Biology 7:835 (2024)，用于 AgroNT 方法/应用条目。
- [PlantCAD2 研究](https://doi.org/10.1016/j.xgen.2026.101329)：Cell Genomics 6(9), article 101329 (2026)；玉米开放染色质 AUPRC 0.587→0.711 为论文指定 benchmark 上的上下文比较结果。

## 教程与验证边界

`wgcna-synthetic` 使用模拟表达矩阵，已在 R 4.5.1、WGCNA 1.74 下重复运行；模拟矩阵不含真实植物实验。DESeq2、GENIE3、GRNBoost2、MEME Suite、MOFA+、AgroNT 与 PlantCAD2 页面未声明本机真实植物样本运行。PlantCAD2 论文与官方链接核验不等于本站环境已部署模型或复现实验。
