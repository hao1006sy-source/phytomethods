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
updatedAt: 2026-11-21
---
## 研究背景与问题
Zhao 等指出，单一 Nipponbare 参考上的短读段重测序会遗漏高度多态区域及参考缺失基因。研究从栽培稻（*Oryza sativa*）和野生稻（*O. rufipogon*）群体选择 66 份材料，建立基于多份组装的物种泛基因组，分析等位变异、基因存在缺失和稻种分化。

## 数据与计算流程
66 份材料包括从 1,529 份群体材料中选择的 57 份代表性材料及 9 个常用栽培品种。每份材料使用 Illumina HiSeq 2500 测序，原始数据为 100 bp 或 150 bp paired-end reads，平均深度约 115×，共约 3.1 Tb。个体组装以 Fermi 1.1 与 SOAPdenovo2 2.23 并行构建 contig，再以 GapCloser 1.12-r6 填补 SOAPdenovo2 草稿组装中的 gap；不同组装结果经 REPLACE 合并。该短读段流程的 contig N50 为 21–75 kb。作者以 GLA4 的 273 个 BAC 序列（合并为 87 个 contig，覆盖约 22 Mb）核验组装，并将 GLA4 与 W1943 的全长 cDNA 映射至各自组装；按 >98% identity 计算的近乎完全匹配比例分别为 90.25% 和 96.77%。这些是对应材料的局部序列验证指标，不代表全部 66 份组装均达到相同结果。

## 变异检测与 PAV
组装 contig 随后使用 MUMmer 锚定到 Nipponbare 参考，通过一对一比对区块及 EMBOSS `diffseq`（4.0，`-wordsize 10`）整理序列变异；大型 SV 依据 MUMmer 比对判定。研究报告约 1,656 万 SNP、555 万个长度不超过 20 bp 的 indel，以及约 93.3 万个 20 bp–12 kb 的 SV。上述指标按论文的比对方案与变异定义统计。

论文进一步整合 67 个基因组（66 份材料加 Nipponbare）的编码基因，共得到至少在一个组装中注释到的 42,580 个非转座子蛋白编码基因。按至少 60/67 份材料存在（约 89.6%，论文概称约 90%）定义核心基因，26,372 个基因进入核心集合，16,208 个进入可变集合；研究还识别出相对 Nipponbare 至少部分缺失的 10,872 个基因。作者指出可变集合中 InterPro 域注释比例为 35.8%，低于核心集合的 77.6%，提示其中部分条目可能涉及基因模型伪影或假基因。此结果说明 PAV 结论需结合基因预测证据解读。

## 方法范围与进一步阅读
这项研究使用线性参考锚定和多组装比较，未构建现代变异图泛基因组，因此页面不将 MUMmer 比对误标为 Minigraph、PGGB 或 Minigraph-Cactus 的应用。其历史软件组件包括 Fermi、SOAPdenovo2、GapCloser、MUMmer、EMBOSS、Bowtie2、BUSCO 和 OrthoMCL，本站暂未把这些工具关系映射到同名但不同功能的软件条目。[出版方全文与方法](https://www.nature.com/articles/s41588-018-0041-z)；[PubMed 书目](https://pubmed.ncbi.nlm.nih.gov/29335547/)；[作者提供的论文 PDF](https://xhhuanglab.cn/uploads/publications/Rice_Pangenome_NG2018.pdf)。
