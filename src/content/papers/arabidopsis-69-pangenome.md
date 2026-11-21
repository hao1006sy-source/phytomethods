---
title: "A pan-genome of 69 Arabidopsis thaliana accessions reveals a conserved genome structure throughout the global species range"
summary: "以 69 个拟南芥组装比较基因内容和基因组结构。"
authors: "Qichao Lian, Bruno Huettel, Birgit Walkemeier, Baptiste Mayjonade, Céline Lopez-Roques, Lisa Gil, Fabrice Roux, Korbinian Schneeberger, Raphael Mercier"
year: 2024
journal: Nature Genetics
doi: 10.1038/s41588-024-01715-9
type: application
methodIds: [hifiasm, orthofinder, syri, merqury, edta, interproscan, iqtree2, plink, admixture]
domainIds: [pangenomics-structural-variation, comparative-genomics]
speciesIds: [arabidopsis]
status: draft
updatedAt: 2026-11-21
---
## 研究问题与材料范围

研究以全球分布的拟南芥（*Arabidopsis thaliana*）材料为对象，检验染色体结构在不同地理群体间的保守程度，并估计基因家族组成的核心与可变部分。研究最初选取 72 份材料进行群体变异分析，其中 48 份使用 PacBio HiFi（平均深度约 45×）、24 份使用 Oxford Nanopore（平均深度约 67×）测长读段，并获得短读段数据。作者根据近交性评估排除 3 份显示杂合信号的材料；染色体级组装比较和基因泛基因组分析使用其余 69 份。群体结构分析以最初的 72 份材料为单位，组装和泛基因组分析以 69 份材料为单位。

## 组装与群体分析

HiFi 材料先分别使用 Canu v2.1.1、Flye v2.7 和 Hifiasm v0.16.1 组装；随后对其中部分组装去除 haplotig/重叠，并用 quickmerge 合并不同组装结果，再以 Col-CEN 为参考进行 RaGOO 排序和定向、人工检查，并用 MaSuRCA 补闭缺口。ONT 材料先用 SMARTdenovo 与 Flye 组装，再经长读段和 Illumina 短读段抛光、purge_dups 和 scaffold 校正。这里的 Hifiasm 是该研究多个 HiFi 组装方案之一，最终分析流程还包括组装合并与后续处理。

69 份最终材料的 contig N50 为 6.1–21.3 Mb，平均 13.3 Mb，随后构建到染色体级。用于比较的组装长度为 128–148 Mb，平均 135 Mb。作者还以短读段 k-mer 估计组装完整性，并针对最完整的 46 份材料分析着丝粒重复；该子集的五条染色体着丝粒重复总长平均约 14 Mb，范围 10–22 Mb，并与组装长度呈高度相关（文中报告 Pearson *r* = 0.93）。这些数值描述本研究的材料及筛选子集。

组装评价综合了多种互补指标：以 Brassicales OrthoDB 数据集运行 compleasm，BUSCO 完整度均值为 99.8%；Merqury 基于 Illumina k-mer 报告平均 QV 53.4 和 k-mer 完整度 98.5%；参考基因比对与 Liftoff 结果分别报告平均 97.3% 和 98.4% 的参考蛋白编码基因成功组装；LTR Assembly Index（LAI）均值为 22，着丝粒重复完整度均值为 96%。这些指标的定义和数据来源不同，不能相互替代。

72 份材料的短读段 SNP 经 PLINK v1.90b6.18 连锁不平衡剪枝（`--indep-pairwise 50 10 0.1`）后用于主成分分析；ADMIXTURE v1.3.0 在 K=2–5 范围内估计群体结构。作者观察到地理来源与遗传聚类大体对应，并标出欧洲、非洲、马德拉和亚洲群体，同时保留若干混合来源材料。该群体结构步骤回答的是样本间遗传关系问题，与后续的基因家族聚类不是同一分析。

## 基因家族泛基因组方法

研究将 69 份组装的预测蛋白编码基因，与 Col-0 TAIR10、Col-PEK、近缘种 *Arabidopsis lyrata* 和 *Capsella rubella* 的代表基因共同输入 OrthoFinder v2.5.4，并使用 DIAMOND ultra-sensitive 搜索设置（`-S diamond_ultra_sens`）推断基因家族。初始聚类后，作者检查同源基因及潜在的基因模型拆分/合并情形，再调整相关 orthogroup。论文报告 73 个基因组的最终聚类数为 36,991；只统计 69 份拟南芥组装时，得到 32,986 个基因家族。泛基因组和核心基因组累积曲线通过不同样本数下各进行 2,000 次随机抽样估计。

作者将所有 69 份材料共有的家族定义为核心；63–68 份材料中出现的家族为 softcore；2–62 份材料中出现的家族为可变（dispensable）；仅在一份材料中检出的家族为私有（private）。这些分类依据本研究的基因预测、家族聚类方法和样本集合定义。

## 主要结果及解释边界

- **染色体结构：** 染色体臂总体高度共线，大型臂部重排较少；较强的结构动态集中在着丝粒及其周边。研究在染色体臂报告 7 个倒位，绝大多数只见于单份材料。作者据多组装比较提出拟南芥核型在全球分布范围内近乎固定，而着丝粒差异是组装大小差异的重要来源。
- **基因家族组成：** 32,986 个家族中，19,721 个（约 60%）为核心，1,613 个（约 5%）为 softcore，5,582 个（约 17%）为可变，6,070 个（约 18%）为私有。样本累积曲线在本研究采样范围内仍未达到平台，提示增加群体材料可能继续发现新的基因家族。
- **注释对“私有家族”的影响：** 作者识别出 6,954 个家族涉及不同材料间基因模型拆分或合并；此类情形占私有家族的 78.9%。排除可由序列同源性检测到的拆并情形后，另有 1,281 个私有家族未在其他材料中检测到序列相似性。因此，私有类别同时受到注释拆并和材料特异序列信号影响，功能判断还需结合后续证据。
- **基因特征：** 核心基因编码蛋白总体较长、Pfam 结构域匹配较多，在 Col-0 的 79 个器官/发育阶段表达数据中也整体表现出较高表达；核心基因的 *K*ₐ/*K*ₛ 比值较低。作者报告可变基因家族富集于防御相关功能；其与适应性表型之间的具体关系可由后续遗传和功能研究检验。

## 软件在研究中的具体作用

| 软件 | 论文中的任务 | 结果解释 |
| --- | --- | --- |
| OrthoFinder v2.5.4 | 跨材料蛋白编码基因家族/orthogroup 聚类；作者进一步检查并调整部分拆分、合并情形 | 家族聚类为基因内容比较提供分组基础，功能解释结合后续注释 |
| Hifiasm v0.16.1 | 48 份 HiFi 材料的三种初始 de novo 组装方案之一；后续组装经评估、去冗余和 quickmerge 整合 | 在 HiFi 组装器比较流程中承担初始组装步骤 |
| SyRI v1.6 | 对 minimap2 v2.21-r1071 的全基因组组装比对识别结构变异，随后按长度范围使用 SURVIVOR 合并 | 结构变异集合对应指定参考、比对及合并流程 |
| Merqury v1.3 | 根据 Illumina reads 的 k-mer 频谱评估共识 QV 和 k-mer 完整度 | 反映 k-mer 一致性和完整度维度，与其他组装评价指标互补 |
| EDTA v2.0.1 | 在各组装中注释转座元件并建立 pan-TE 库 | 泛转座元件库用于跨材料的重复序列注释 |
| InterProScan v5.59-91.0 | 为预测蛋白提供结构域及功能签名注释 | 注释为序列功能解释提供计算证据 |
| IQ-TREE v1.6.12 | 对单拷贝直系同源基因 CDS、SNP 及 PAV 矩阵构建系统树 | 各类数据矩阵形成对应的系统发育结果 |
| PLINK v1.90b6.18 | 72 份材料 SNP 的 LD 剪枝和 PCA | 用于遗传变异降维和样本关系可视化 |
| ADMIXTURE v1.3.0 | 72 份材料在 K=2–5 下的群体结构估计 | 展示不同 K 模型下的样本成分比例 |

论文还使用 BUSCO、基因同源比对和 LTR Assembly Index 等指标评估组装，分别考察保守单拷贝基因、参考基因映射或重复序列组装情况。工具关系字段列出本知识库已有详情页、且在原文中有明确用途的工具；其他流水线依赖也在正文按原文记录。

## 阅读与复现资源

- [论文原文及方法](https://doi.org/10.1038/s41588-024-01715-9)
- [作者开放版 PDF](https://www.mpipz.mpg.de/5602936/lian_nat_gen_2024_OA.pdf)
- [PubMed 书目信息](https://pubmed.ncbi.nlm.nih.gov/38605175/)
- [测序原始数据 ENA：PRJEB62038](https://www.ebi.ac.uk/ena/browser/view/PRJEB62038)
- [组装数据 NCBI：PRJNA1033522](https://www.ncbi.nlm.nih.gov/bioproject/PRJNA1033522)

书目信息：Lian Q, Huettel B, Walkemeier B, Mayjonade B, Lopez-Roques C, Gil L, Roux F, Schneeberger K, Mercier R. *Nature Genetics* 56, 982–991 (2024). DOI: 10.1038/s41588-024-01715-9。

本条为植物应用论文记录，结果按 72 份群体分析和 69 份组装泛基因组分析的实际样本范围分别表述，并区分群体关系、基因家族和染色体结构等分析层级。
