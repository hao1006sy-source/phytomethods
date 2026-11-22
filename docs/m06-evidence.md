# M06 科学内容来源记录

日期：2026-11-22。此记录列出 M06 核心书目、软件信息及植物案例的主要核验入口。条目页面保留 DOI、期刊或官方文档链接；工具页面会注明尚未在本机执行的软件。

## 数量遗传学与 QTL

- Schmidt P, Hartung J, Bennewitz J, Piepho H-P. 2019. *Heritability in Plant Breeding on a Genotype-Difference Basis*. Genetics. DOI: [10.1534/genetics.119.302134](https://doi.org/10.1534/genetics.119.302134)。用于 genotype-difference 遗传力估计及论文书目信息核对，来源包括 [Genetics/PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC6763524/)。
- Smith A, Lim P, Cullis B. 2006. *The design and analysis of multi-phase plant breeding trials*. Journal of Agricultural Science. DOI: [10.1017/S0021859606006319](https://doi.org/10.1017/S0021859606006319)。用于多阶段育种试验设计与混合模型说明，依据 Cambridge 期刊 DOI 记录核对。
- Broman KW, Gatti DM, Simecek P, et al. 2019. *R/qtl2: Software for Mapping Quantitative Trait Loci with High-Dimensional Data and Multiparent Populations*. Genetics. DOI: [10.1534/genetics.118.301595](https://doi.org/10.1534/genetics.118.301595)；[官方手册与仓库](https://github.com/rqtl/qtl2)。版本快照记录为官方 release v0.46（2026-07-21）；工具未在本机运行。
- Lou Q, Chen L, Mei H, et al. 2015. *Quantitative trait locus mapping of deep rooting by linkage and association analysis in rice*. Journal of Experimental Botany. DOI: [10.1093/jxb/erv246](https://doi.org/10.1093/jxb/erv246)；[PubMed](https://pubmed.ncbi.nlm.nih.gov/26022253/)、[PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC4507776/)。专题只将其报告作为连锁群体与多材料关联的应用案例，未将研究归为 R/qtl2 分析。

## GWAS、关联模型与植物案例

- Yu J, Pressoir G, Briggs WH, et al. 2006. *A unified mixed-model method for association mapping that accounts for multiple levels of relatedness*. Nature Genetics. DOI: [10.1038/ng1702](https://doi.org/10.1038/ng1702)；[PubMed](https://pubmed.ncbi.nlm.nih.gov/16380716/)。
- Huang X, Wei X, Sang T, et al. 2010. *Genome-wide association studies of 14 agronomic traits in rice landraces*. Nature Genetics. DOI: [10.1038/ng.695](https://doi.org/10.1038/ng.695)；[PubMed](https://pubmed.ncbi.nlm.nih.gov/20972439/)。M06 页面中的 517 份材料、约 3.6 million SNP 和 14 个性状依原文摘要与记录整理。
- Wang J, Zhang Z. 2021. *GAPIT Version 3: Boosting Power and Accuracy for Genomic Association and Prediction*. Genomics, Proteomics & Bioinformatics. DOI: [10.1016/j.gpb.2021.08.005](https://doi.org/10.1016/j.gpb.2021.08.005)；[官方 GAPIT 仓库](https://github.com/jiabowang/GAPIT)。工具页将平台与其提供的统计模型区分；当前软件版本与方法论文历史版本分开记录。
- Anilkumar C, Muhammed Azharudheen TP, Sah RP, et al. 2023. *Gene based markers improve precision of genome-wide association studies and accuracy of genomic predictions in rice breeding*. Heredity. DOI: [10.1038/s41437-023-00599-5](https://doi.org/10.1038/s41437-023-00599-5)；[PubMed](https://pubmed.ncbi.nlm.nih.gov/36792661/)。
- Zhao Y, Zhang H, Xu J, et al. 2018. *Loci and natural alleles underlying robust roots and adaptive domestication of upland ecotype rice in aerobic conditions*. PLOS Genetics. DOI: [10.1371/journal.pgen.1007521](https://doi.org/10.1371/journal.pgen.1007521)；[出版方全文](https://journals.plos.org/plosgenetics/article?id=10.1371/journal.pgen.1007521)。PLINK、ADMIXTURE 和 GAPIT 的任务按原文方法段分别记载。
- FarmCPU 原文 DOI：[10.1371/journal.pgen.1005767](https://doi.org/10.1371/journal.pgen.1005767)；BLINK 原文 DOI：[10.1093/gigascience/giy154](https://doi.org/10.1093/gigascience/giy154)。M06-04 说明两种算法思想和迭代流程的差异。

## 基因组选择与神经网络预测

- Endelman JB. 2011. *Ridge Regression and Other Kernels for Genomic Selection with R Package rrBLUP*. The Plant Genome. DOI: [10.3835/plantgenome2011.08.0024](https://doi.org/10.3835/plantgenome2011.08.0024)。CRAN [rrBLUP 页面](https://cran.r-project.org/web/packages/rrBLUP/index.html)列出 4.6.3、R ≥ 4.0、GPL-3、包引用 DOI 和说明的模型用途。
- Wang K, Abid MA, Rasheed A, et al. 2023. *DNNGP, a deep neural network-based method for genomic prediction using multi-omics data in plants*. Molecular Plant 16:279–293. DOI: [10.1016/j.molp.2022.11.004](https://doi.org/10.1016/j.molp.2022.11.004)；[Cell Press 原文](https://www.cell.com/article/S167420522200404X/pdf)。论文摘要及方法部分用于核实四个数据集、五个对照模型及卷积层、批归一化、dropout、ReLU 和 early stopping 的模型描述。官方[代码仓库](https://github.com/AIBreeding/DNNGP)记载 Python 3.9、TensorFlow 2.6.0 与 2024-03 v3.1 更新。本站未安装或运行 DNNGP。
- Crossa J, Pérez-Rodríguez P, Cuevas J, et al. 2017. *Genomic Selection in Plant Breeding: Methods, Models, and Perspectives*. Trends in Plant Science. DOI: [10.1016/j.tplants.2017.08.011](https://doi.org/10.1016/j.tplants.2017.08.011)。用于基因组选择方法背景。
- 植物群体结构与交叉验证的案例讨论链接至 [PMC7772221](https://pmc.ncbi.nlm.nih.gov/articles/PMC7772221/)；M06-06 区分随机折叠与按家系、世代、环境留出的估计目标。

## 教程验证范围

`gwas-synthetic` 使用固定随机种子生成虚构基因型与表型，教程所列 60 个标记 P 值曾在本站记录的 Python/SciPy 环境中复算。该验证只覆盖模拟单标记回归与图表生成，不构成真实植物群体 GWAS、群体结构校正或任何 M06 工具的运行验证。
