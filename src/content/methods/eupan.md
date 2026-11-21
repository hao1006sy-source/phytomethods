---
title: EUPAN
name: EUPAN
summary: 面向真核生物大规模泛基因组分析的工具集，以参考序列和新增非冗余序列构建 pan-genome，并依据 reads 覆盖推断基因存在缺失变异。
dataType: 短读段 FASTQ、参考组装 FASTA、基因注释 GFF/GTF
principle: Map-to-pan 与覆盖度驱动的 PAV 判定
domainIds: [pangenomics-structural-variation]
topicIds: [m03-topic-01, m03-topic-04]
principleIds: [alignment, pav-calling]
dataIds: [short-reads, assembly, annotation-input]
paper: eupan-paper
repository: https://cgm.sjtu.edu.cn/eupan/index.html
status: draft
updatedAt: 2026-11-21
---
## 研究问题与开发背景
EUPAN（Eukaryotic PAN-genome analysis toolkit）由 Hu 等开发，用于对大量真核生物材料进行泛基因组和基因存在缺失变异（presence–absence variation, PAV）分析。传统流程为每份材料进行高深度组装和注释；EUPAN 提供面向大样本的流程组件，并以 Map-to-pan（reads 比对至泛基因组）策略用覆盖证据判断基因或基因家族是否存在。[方法论文](https://doi.org/10.1093/bioinformatics/btx170)。

## 核心计算流程
1. 对多样本短读段进行质量检查和过滤，可并行执行。
2. 以 SOAPdenovo2 等外部组装程序组装材料，并用 QUAST 评估组装；工具也支持迭代选择 k-mer 的 `linearK` 流程。
3. 在参考组装上识别未比对 contig，合并并去冗余；清除污染序列后，将参考序列与新增序列合并为线性 pan-genome。新增序列的基因预测需采用适合物种的外部流程。
4. 结合基因注释，将 reads 映射到 pan-genome，汇总基因体和 CDS 覆盖度。
5. 按设定覆盖阈值生成样本 × 基因的 PAV 矩阵；如提供基因家族文件，可由基因状态汇总家族状态，并通过样本重抽样估计核心与可变基因规模。

EUPAN 的这一 Map-to-pan 工作流使用线性序列集合，不负责构建 Minigraph、PGGB 或 Minigraph-Cactus 图。基因家族划分需要外部工具，例如论文和官方 SOP 中提到的 OrthoMCL。

## 输入、输出与参数
输入按样本组织的短读段 FASTQ、参考基因组 FASTA，以及与 pan-genome 序列匹配的基因注释 GFF/GTF；按具体步骤还需提供 SOAPdenovo2、QUAST、MUMmer、BWA 或 Bowtie2、Samtools、CD-HIT 等外部依赖。主要结果包括个体组装、未比对序列及去冗余序列、pan-genome FASTA、映射 BAM/覆盖 BED、基因覆盖摘要、基因或家族 PAV 矩阵和核心/泛基因组重抽样曲线。

官方 SOP 的 `eupan geneExist` 示例以基因体覆盖度 0.8、CDS 覆盖度 0.95 判定存在；这两个阈值需结合测序深度、比对质量和注释质量确定。官方稻米分析在进入 PAV 分析前筛选测序深度 >20× 且参考比对深度 >15× 的样本，属于该研究的筛选标准，不是通用软件默认值。[官方 SOP](https://cgm.sjtu.edu.cn/eupan/sop.html)、[安装说明](https://cgm.sjtu.edu.cn/eupan/installation.html)。

## 植物应用与适用边界
EUPAN 的方法论文报告其应用于 453 份水稻材料；Wang 等的 3,010 份亚洲栽培稻研究也在代码说明中将基因及基因家族 PAV 分析代码与 EUPAN 关联。3,010 份样本是群体 SNP 分析规模，论文的 SV 与 PAV 分析进一步聚焦 453 份高覆盖样本。Map-to-pan 结果依赖短读段覆盖度、pan-genome 序列代表性、基因模型及阈值；低深度或高分化区域可能造成存在状态不确定，不能把单一二元矩阵当作无误差真值。[水稻应用论文](https://doi.org/10.1038/s41586-018-0063-9)。

## 官方资源与验证状态
官方工具页列出的最新版本记录为 EUPAN v0.44，发布日期为 2017-10-23；该页将软件说明为面向非商业使用，许可为 CC BY-NC 4.0。版本快照及许可信息来自项目维护的官方页面，不代表本机安装状态。方法论文指出软件由 Perl、R 和 C++ 实现，面向 Linux，可在 LSF/SLURM 集群或单机运行。官方安装页还列出 R 3.1+、Perl、g++ 及供 QUAST 使用的 Python 2.5–2.7 依赖；复现前需准备隔离环境并核对各外部依赖的兼容版本。[官方工具页与版本记录](https://cgm.sjtu.edu.cn/eupan/index.html)、[官方安装说明](https://cgm.sjtu.edu.cn/eupan/installation.html)、[官方 SOP](https://cgm.sjtu.edu.cn/eupan/sop.html)。本机尚未安装或执行 EUPAN。
