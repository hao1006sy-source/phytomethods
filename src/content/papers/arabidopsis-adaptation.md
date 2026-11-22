---
title: "The pan-genome and local adaptation of Arabidopsis thaliana"
summary: "比较拟南芥多材料泛基因组、结构变异及环境适应。"
authors: "Minghui Kang, Haolin Wu, Huanhuan Liu, Wenyu Liu, Mingjia Zhu, Yu Han, Wei Liu, Chunlin Chen, Yan Song, Luna Tan, Kangqun Yin, Yusen Zhao, Zhen Yan, Shangling Lou, Yanjun Zan, Jianquan Liu"
year: 2023
journal: Nature Communications
doi: 10.1038/s41467-023-42029-4
type: application
methodIds: [hifiasm, orthofinder, edta, minigraph, vg]
domainIds: [pangenomics-structural-variation, comparative-genomics]
speciesIds: [arabidopsis]
status: published
updatedAt: 2026-11-22
---
## 研究问题与基因组材料

研究考察拟南芥基因存在/缺失变异（presence/absence variation, PAV）和结构变异（structural variation, SV）如何扩展物种基因组多样性，并与环境适应性状相关。作者选择覆盖主要谱系与多样生境的 32 份生态型（ecotype），其中包括 6 份遗存谱系材料。PacBio HiFi 数据量为每份 2.18–8.28 Gb，约 15–60×。Hifiasm v0.18 以 `-l0` 关闭 haplotig 清除，后续使用 primary contig（p_ctg）；RagTag v2.1.0 以 Col-PEK T2T 组装为参照构建五条拟染色体。最终组装大小为 129.4–144.9 Mb，contig N50 为 5.91–20.3 Mb；染色体尺度组装 BUSCO 完整度为 99.0–99.3%。

## 基因家族泛基因组

研究整合转录组、ab initio 和同源蛋白证据预测基因，并将 *Arabidopsis lyrata* 作为外群。作者以 OrthoFinder 的 Markov clustering 方法聚类 887,723 个基因，结果部分报告 31,318 个基因家族。随着组装数量增加，泛基因组曲线在 n 接近 26 时趋于平台，新增家族比例低于 1%。按 32 份材料中的出现频率，21,545 个（68.8%）为核心家族，3,743 个（12.0%）为 softcore，3,929 个（12.6%）为可变家族，2,101 个（6.7%）为私有家族。

环境关联分析将可变家族与 19 个 BIOCLIM 变量进行比较；平均昼夜温差（BIO2）和年温度范围（BIO7）与部分家族出现/缺失显著相关，其中 215 个相关家族富集于不同胁迫响应功能。核心家族富集于花发育、RNA 结合、转录调控、运输和细胞稳态等类别；可变家族富集于次生代谢、细胞分化和胁迫响应类别。该研究还观察到可变家族表达较低、Ka/Ks 较高的整体趋势。

## Minigraph 图泛基因组与结构变异

作者以本研究的 Col-0 组装为参考，按顺序将其余 31 个组装加入 Minigraph（`-cxggs`）参考引导图。输入比对采用 Minigraph 中基于 minimap2 的序列到图定位流程；不同材料相对参考的片段作为 GFA 图路径表示，图中的多路径结构形成 bubble。研究报告图长 243.27 Mb，含 468,168 个节点和 649,692 条边，其中非参考节点 203,747 个、合计 108.90 Mb。gfatools 使用 bubble-popping 方法提取变异，过滤小于 50 bp 的事件后，结果部分报告 61,322 个至少出现在一份生态型中的 SV，涉及 18,883 个基因。该集合以 Col-0 参考路径为坐标框架；双等位变异按参考路径关系分为 insertion、deletion、divergent 等类型，多等位 bubble 单独计数。

## 群体读段映射与性状分析

研究将 Illumina 短读段映射至图泛基因组，以 vg toolkit v1.40.0 对图上的 SV 进行分型，再用 PLINK v1.90b6.7 按缺失率和次要等位基因频率筛选，随后进行 Beagle 填补。方法与数据可用性段记录了来自 NCBI SRA BioProject PRJNA273563 的 1,135 份群体重测序数据，并说明 Tibet-0 与 Yilong-0 是本研究新增测序材料；过滤后报告 1,073 份个体与 20,326 个 SV 进入后续分析。图 6 图注将这一分析集合描述为 1,071 份全球材料加上 Tibet-0 和 Yilong-0。此处保留论文各部分对原始和过滤后样本集合的表述层级。

研究比较 61 项性状，包括 21 项环境指标、两个温度条件下的开花时间和 38 项离子组学性状。SV 在 48 项性状（78.69%）上的解释方差比例高于 SNP；跨性状平均 SV 解释比例为 57.98%。在 LD >0.6 的标准下，3,369 个 SV（16.57%）被 SNP 标记。SV-GWAS 对 10 °C 开花时间和 11 项离子组学表型检出 SNP-GWAS 未检出的关联信号；论文以包含群体亲缘关系的线性混合模型进行 GWAS。

## 生态型案例与功能验证

- **KNAT3：** Tibet-0 启动子区域存在 566 bp 转座元件插入；研究报告其与 KNAT3 表达增加相关，并用 qRT-PCR 与双荧光素酶试验支持调控效应。作者将该变异与高海拔强光环境适应联系起来。
- **WH1：** 启动子区域的 180 bp 插入与表达降低和 UV-B 抗性表型相关，研究提供了生态型分布、表达和双荧光素酶结果。
- **HPCA1：** Tibet-0 启动子区域的 332 bp 转座元件插入与 HPCA1 表达增加及干旱抗性表型相关；作者结合表达测定、双荧光素酶和植株胁迫试验报告该结果。

这些案例把图上变异发现与候选基因表达、表型实验连接起来。具体解释对应论文中的拟南芥材料与实验条件。

## 软件在该研究中的作用

| 软件 | 论文中的任务 |
| --- | --- |
| Hifiasm v0.18 | 32 份 HiFi reads 初始组装，使用 p_ctg 进入后续参考引导 scaffold |
| OrthoFinder | 基因家族聚类及单拷贝直系同源基因提取 |
| IQ-TREE v2.0.3 | 根据 17,183 个单拷贝家族构建最大似然系统树 |
| EDTA v2.1.0 / pan-EDTA | 生态型级转座元件注释与泛转座元件库构建 |
| Minigraph | 以 Col-0 为骨架、逐份加入 31 个组装构建参考引导图泛基因组 |
| vg toolkit v1.40.0 | 群体短读段图上映射及 SV 分型 |
| PLINK v1.90b6.7 | SV 个体缺失率/MAF筛选；SNP 数据另用于过滤 |
| MCScanX | 通过基因共线性检查 SV 与基因对应关系 |

该文使用独立 Minigraph 构图，vg 承担图上 reads 映射和基因型分析；两者在研究流程中分属不同步骤。

## 统计口径与资料来源

原文不同段落存在两组汇总数差异：摘要写 61,332 个 SV，结果段写 61,322 个；OrthoFinder 基因家族结果段写 31,318 个，方法段写 31,317 个，结果段四类计数合计为 31,318。本文依据结果段和分类计数表述，并在内容审核台账保留差异记录。

- [论文原文及书目信息](https://doi.org/10.1038/s41467-023-42029-4)
- [PMC 全文与方法](https://pmc.ncbi.nlm.nih.gov/articles/PMC10558531/)
- [PubMed 书目信息](https://pubmed.ncbi.nlm.nih.gov/37802986/)
- [原始测序数据：GSA PRJCA012695](https://ngdc.cncb.ac.cn/bioproject/browse/PRJCA012695)
- [组装、注释、图泛基因组及家族矩阵：Figshare](https://figshare.com/articles/dataset/32_ecotypes_Arabidopsis_thaliana_genomes_gene_annotation_pan-TE_library_graph_pan-genome_gene_family_and_gene_presence_absence_matrices_files_/21673895)
- [群体重测序数据：SRA PRJNA273563](https://www.ncbi.nlm.nih.gov/bioproject/PRJNA273563)

书目信息：Kang M, Wu H, Liu H, Liu W, Zhu M, Han Y, Liu W, Chen C, Song Y, Tan L, Yin K, Zhao Y, Yan Z, Lou S, Zan Y, Liu J. *Nature Communications* 14, 6259 (2023). DOI: 10.1038/s41467-023-42029-4。
