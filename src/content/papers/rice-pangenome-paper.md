---
title: "Pan-genome analysis highlights the extent of genomic variation in cultivated and wild rice"
summary: "比较栽培和野生水稻材料的基因内容与基因组变异。"
authors: "Zhao Q, Feng Q, Lu H, Li Y, Wang A, Tian Q, Zhan Q, Lu Y, Zhang L, Huang T, Wang Y, Fan D, Zhao Y, Wang Z, Zhou C, Chen J, Zhu C, Li W, Weng Q, Xu Q, Wang Z-X, Wei X, Han B, Huang X"
year: 2018
journal: Nature Genetics
doi: 10.1038/s41588-018-0041-z
type: application
methodIds: []
domainIds: [pangenomics-structural-variation]
speciesIds: [rice]
status: published
updatedAt: 2026-11-25
---
## 研究问题与材料范围
Zhao 等（2018）指出，单一日本晴（Nipponbare）参考基因组上的短读段重测序会遗漏高度多态区域及参考缺失基因。研究从 1,529 份群体材料中选择 **57 份代表性材料** 及 **9 个常用栽培品种**（共 **66 份**栽培稻 *Oryza sativa* 与野生稻 *O. rufipogon*），使用 Illumina HiSeq 2500 进行深度重测序（100 bp/150 bp paired-end，平均深度约 115×，总数据量约 3.1 Tb），构建基于多份从头组装的物种泛基因组，系统解析等位变异、基因存在缺失变异（PAV）与稻种分化。

## 分析流程
1. **多策略从头组装与补洞**：以 Fermi 1.1 与 SOAPdenovo2 2.23 并行构建 contig，再以 GapCloser 1.12-r6 填补 SOAPdenovo2 草稿组装中的 gap，经 REPLACE 合并（contig N50 为 21–75 kb）。
2. **组装质量独立核验**：利用 GLA4 的 273 个 BAC 序列（覆盖约 22 Mb）及 GLA4/W1943 全长 cDNA 验证局部组装完整度（>98% identity 匹配率分别为 90.25% 和 96.77%）。
3. **共线性比对与变异检测**：使用 MUMmer 将 66 份组装锚定至 Nipponbare 参考基因组，通过一对一比对区块及 EMBOSS `diffseq`（4.0，`-wordsize 10`）提取 SNP/Indel 与大型 SV。
4. **泛基因组基因集构建**：整合 67 个基因组（66 份材料 + Nipponbare）注释的蛋白编码基因，划分核心基因与可变基因，结合 InterPro 结构域注释评估基因模型可靠性。

## 软件明细表格
| 软件 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **Fermi 1.1 / SOAPdenovo2 2.23** | 66 份水稻材料的短读段从头组装 | 互补组装策略提升高度多态区域的 contig 连续性（N50 达 21–75 kb） |
| **GapCloser 1.12-r6** | 填补 SOAPdenovo2 草稿组装缺口 | 减少组装碎片化，提高基因区完整度 |
| **MUMmer / EMBOSS diffseq** | 组装序列与 Nipponbare 共线性比对及变异提取 | 检出约 1,656 万 SNP、555 万 indel（$\le$20 bp）及 93.3 万 SV（20 bp–12 kb） |
| **BUSCO / OrthoMCL** | 基因集完整度评估与同源基因聚类 | 注释 42,580 个非转座子蛋白编码基因，识别 26,372 个核心基因与 16,208 个可变基因 |

## 主要科研发现
- 按至少 60/67 份材料存在（约 89.6%）定义核心基因，共鉴定 **26,372 个核心基因**与 **16,208 个可变基因**，其中 **10,872 个基因**相对 Nipponbare 至少部分缺失。
- 可变基因集中 InterPro 结构域注释比例为 35.8%，显著低于核心基因集的 77.6%，提示部分可变条目可能涉及假基因或基因模型注释伪影，解读 PAV 需结合功能域证据。
- *说明*：本研究使用线性参考锚定和多组装比较，未构建现代变异图泛基因组（如 Minigraph、PGGB）。

## 阅读与数据复现资源
- **原始论文**：[Nature Genetics (2018)](https://www.nature.com/articles/s41588-018-0041-z) | [作者提供 PDF](https://xhhuanglab.cn/uploads/publications/Rice_Pangenome_NG2018.pdf)
- **PubMed**：[PMID: 29335547](https://pubmed.ncbi.nlm.nih.gov/29335547/)
- **数据复现**：原始测序与组装数据已存放在 ENA / NCBI BioProject（详见原文 Data Availability 部分）。
