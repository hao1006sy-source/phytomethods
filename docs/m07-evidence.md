# M07 表观基因组与三维基因组来源记录

日期：2026-11-22。条目以期刊原文、PubMed/PMC、Bioconductor 与软件官方文档核对。方法软件与植物应用论文分别记录；模拟教程不充当真实植物数据分析案例。

## 表观遗传与 DNA 甲基化

- Zhang H, Lang Z, Zhu JK. 2021. “Dynamics of DNA Methylation and Its Functions in Plant Growth and Development.” *Frontiers in Plant Science* 12:596236. DOI [10.3389/fpls.2021.596236](https://doi.org/10.3389/fpls.2021.596236)。综述用于核对 MET1、CMT3、CMT2、DRM2/RdDM 在不同胞嘧啶背景中的作用与相互作用。
- Cokus SJ, Feng S, Zhang X, et al. 2008. “Shotgun bisulphite sequencing of the Arabidopsis genome reveals DNA methylation patterning.” *Nature*. DOI [10.1038/nature06745](https://doi.org/10.1038/nature06745)。用于拟南芥甲基化图谱案例。
- Krueger F, Andrews SR. 2011. “Bismark: a flexible aligner and methylation caller for Bisulfite-Seq applications.” *Bioinformatics* 27:1571–1572. DOI [10.1093/bioinformatics/btr167](https://doi.org/10.1093/bioinformatics/btr167)。期刊页说明 Bismark 执行 BS-seq reads 比对和 CG/CHG/CHH 甲基化提取。
- Gardiner LJ, Quinton-Tulloch M, Olohan L, et al. 2015. “A genome-wide survey of DNA methylation in hexaploid wheat.” *Genome Biology* 16:273. DOI [10.1186/s13059-015-0838-3](https://doi.org/10.1186/s13059-015-0838-3)。原文报告六个小麦样本、12°C/27°C 条件、靶向基因富集及 Bismark 比对；甲基化比较使用 methylKit。M07 页面不称其为全基因组均匀覆盖 WGBS。
- Feng H, Conneely KN, Wu H. 2014. “A Bayesian hierarchical model to detect differentially methylated loci from single nucleotide resolution sequencing data.” *Nucleic Acids Research* 42:e69. DOI [10.1093/nar/gku154](https://doi.org/10.1093/nar/gku154)。DSS 方法依据层次 beta-binomial/dispersion-shrinkage 论文和[Bioconductor 3.23 用户指南](https://bioconductor.org/packages/release/bioc/vignettes/DSS/inst/doc/DSS.html)。截至核对日，release 为 DSS 2.60.0，Bioconductor 3.23；本站未运行 DSS。

## 可及性、蛋白富集与基序

- Buenrostro JD, Giresi PG, Zaba LC, Chang HY, Greenleaf WJ. 2013. ATAC-seq 方法 DOI [10.1038/nmeth.2688](https://doi.org/10.1038/nmeth.2688)。
- Hellens AM, Humphreys JL, Fichtner F, et al. 2023. “Genome-wide identification of accessible chromatin regions by ATAC-seq upon induction of the transcription factor bZIP11 in Arabidopsis.” *Scientific Data* 10:490. DOI [10.1038/s41597-023-02395-6](https://doi.org/10.1038/s41597-023-02395-6)；[PubMed](https://pubmed.ncbi.nlm.nih.gov/37500689/)。作为拟南芥 ATAC-seq 数据论文，不将其 peak caller 写成 MACS3。
- Weiste C, Dröge-Laser W. 2014. “The Arabidopsis transcription factor bZIP11 activates auxin-mediated transcription by recruiting the histone acetylation machinery.” *Nature Communications* 5:3883. DOI [10.1038/ncomms4883](https://doi.org/10.1038/ncomms4883)。用于 ChIP、转录因子与组蛋白乙酰化植物案例。
- Kaya-Okur HS, Wu SJ, Codomo CA, et al. 2019. “CUT&Tag for efficient epigenomic profiling of small samples and single cells.” *Nature Communications* 10:1930. DOI [10.1038/s41467-019-09982-5](https://doi.org/10.1038/s41467-019-09982-5)。CUT&Tag 实验原理和抗体引导 pA/G–Tn5 定位依据原文。
- Bailey TL, Johnson J, Grant CE, Noble WS. 2015. “The MEME Suite.” *Nucleic Acids Research* 43:W39–W49. DOI [10.1093/nar/gkv416](https://doi.org/10.1093/nar/gkv416)；[官方总览](https://meme-suite.org/meme/doc/overview.html)与[FIMO 文档](https://meme-suite.org/meme/doc/fimo.html)用于区分 de novo discovery、enrichment 和扫描任务。
- MACS 原始方法：Zhang Y, Liu T, Meyer CA, et al. 2008. “Model-based Analysis of ChIP-Seq (MACS).” *Genome Biology* 9:R137. DOI [10.1186/gb-2008-9-9-r137](https://doi.org/10.1186/gb-2008-9-9-r137)。MACS3 当前命令与 paired-end ATAC 示例依据[官方文档](https://macs3-project.github.io/MACS/)；截至本轮查阅手册标记 3.1.0。软件未在本机运行。

## 植物 Hi-C 与胁迫响应

- Wolff J, Rabbani L, Gilsbach R, et al. 2020. “Galaxy HiCExplorer 3: a web server for reproducible Hi-C, capture Hi-C and single-cell Hi-C data analysis, quality control and visualization.” *Nucleic Acids Research* 48:W177–W184. DOI [10.1093/nar/gkaa220](https://doi.org/10.1093/nar/gkaa220)；[当前官方文档](https://hicexplorer.readthedocs.io/en/latest/)。当前文档主版本为 4；本站未运行软件。
- Sun L, Jing Y, Liu X, et al. 2020. “Heat stress-induced transposon activation correlates with 3D chromatin organization rearrangement in Arabidopsis.” *Nature Communications* 11:1886. DOI [10.1038/s41467-020-15809-5](https://doi.org/10.1038/s41467-020-15809-5)；[PubMed](https://pubmed.ncbi.nlm.nih.gov/32312999/)、[PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC7170881/)。原文方法明确 HiC-Pro 负责 reads 过滤/有效 pairs 与矩阵，HiCExplorer 转换矩阵并执行距离衰减、归一化、矩阵校正和观察/期望变换；compartment PCA 由 HOMER 计算。该页按真实任务关联 HiCExplorer。
- Göbel AM, Zhou S, Wang Z, et al. 2024. “Mutations of PDS5 genes enhance TAD-like domain formation in Arabidopsis thaliana.” *Nature Communications* 15:9308. DOI [10.1038/s41467-024-53760-x](https://doi.org/10.1038/s41467-024-53760-x)。原文报告 HiTC 矩阵归一化、Juicer 交互热图及 Arrowhead TAD 调用；本轮已保持其为 M07-06 生物学案例，未关联 HiCExplorer。
- Ding Y, Fromm M, Avramova Z. 2012. “Multiple exposures to drought ‘train’ transcriptional responses in Arabidopsis.” *Nature Communications*. DOI [10.1038/ncomms1732](https://doi.org/10.1038/ncomms1732)。Friedrich T, Oberkofler V, Trindade I, et al. 2021. “Heteromeric HSFA2/HSFA3 complexes drive transcriptional memory after heat stress in Arabidopsis.” *Nature Communications* 12:3426. DOI [10.1038/s41467-021-23786-6](https://doi.org/10.1038/s41467-021-23786-6)。页面分别描述重复脱水的响应记忆和热胁迫 HSFA2/HSFA3 研究，不称其为跨代遗传。

## 教程验证状态

Bismark 模拟教程记录 Rust suite 3.3.0、Bowtie2 2.5.5 和 Samtools 1.25 的本机运行结果，使用固定参考和已知甲基化状态模拟 reads。该验证检查命令及模拟流程，不是植物样本的复现。DSS、MACS3、MEME Suite 和 HiCExplorer 本轮仅核对官方文档，未在本机运行。
