---
title: Hifiasm
name: Hifiasm
summary: 利用高保真长读长构建相位感知的基因组组装图。
dataType: PacBio HiFi
principle: 重叠图与单倍型解析
domainIds: [genome-assembly]
topicIds: [assembly-basics, assembly-graphs, complete-assembly, haplotype-resolution, sequencing-data]
principleIds: [overlap, phasing]
dataIds: [hifi]
paper: hifiasm
repository: https://github.com/chhylp123/hifiasm
updatedAt: 2026-11-25
---

## 研究问题
植物基因组中普遍存在高杂合度（Heterozygosity）、高比例转座子（尤其是高达 70%~85% 的 LTR-RT）以及古多倍化复制事件。传统组装算法在处理同源染色体间的微小等位差异时，往往将两者强行折叠为单一的人工拼合序列，导致等位特异性表达分析、结构变异检测和杂种优势解析彻底失效。Hifiasm 专为高保真长读段设计，旨在重叠图层面完整保留同源染色体间的全部单倍型差异。

## 计算思路
软件先在同聚物压缩空间（Homopolymer-compressed space）对 HiFi reads 进行高效自纠错与全对全比对，构建出拓扑严格的极小弦图（String Graph），并依据 Myers 传递边约简定理消除冗余边。对于同源染色体间的等位变异，图中以气泡（Bubble）拓扑完整保留候选分支，再结合跨位点读段、亲本特异 $k$-mer 或 Hi-C 空间接触频率，在图上解析出互不混杂的单倍型遍历路径。

## 输入与输出
输入为同一生物个体的 PacBio HiFi FASTQ/FASTA（支持 gzip 压缩，推荐覆盖度 $\ge 30\times$）；可选配双端 Hi-C 测序 reads 或双亲短读段。核心输出包括标准 GFA1 格式的组装图文件（如 primary contig 图 `*.p_ctg.gfa` 与完全相位的两个单倍型图 `*.hap1.p_ctg.gfa`、`*.hap2.p_ctg.gfa`）。

## 植物研究
在植物科学中，高杂合与多倍体是常态。自交系水稻或拟南芥可直接生成全染色体尺度的 Contig；而对玉米、马铃薯等高杂合或多倍体作物，Hifiasm 的单倍型感知机制能够完整分离两条同源单倍型，有效规避异源多倍体亚基因组间的错误折叠。

## 实践与来源
参阅本站 Hifiasm 教程与[官方文档](https://github.com/chhylp123/hifiasm)。原始方法论文由 Cheng 等人于 2021 年发表在 *Nature Methods*，DOI：[10.1038/s41592-020-01056-5](https://doi.org/10.1038/s41592-020-01056-5)；Hi-C 辅助分相算法发表于 *Nature Biotechnology*（2022），DOI：[10.1038/s41587-022-01261-x](https://doi.org/10.1038/s41587-022-01261-x)。

## 开发背景与核心流程
Hifiasm 是面向 PacBio HiFi 高保真长读长（单分子准确率 $\ge 99.9\%$）的新一代从头组装软件。HiFi 极低的错误率使算法能够明确区分“真实杂合等位变异”与“随机测序错误”。软件先执行同聚物压缩下的全局重叠检索，通过 Myers 约简算法消除冗余边，构建相位感知重叠图；随后依据读段跨越证据与覆盖度统计检验对等位气泡链进行全局分相，最终导出连续无歧义的 Unitigs 与 Contigs。

## 输入、参数与结果
HiFi reads 可使用 FASTA 或 FASTQ，支持 gzip 压缩。常用基础参数包括 `-o <prefix>` 指定输出前缀、`-t <int>` 指定 CPU 线程数（推荐 32~64 线程）；`-l <0|2|3>` 设置同源冗余清除级别（二倍体高杂合推荐 `-l 2` 或 `-l 3`，多倍体保留等位分支推荐 `-l 0`）；`--h1/--h2` 指定配对 Hi-C 读段。输出的 `*.bp.p_ctg.gfa` 为 primary contig 图，`*.bp.hap1.p_ctg.gfa` 和 `*.bp.hap2.p_ctg.gfa` 为完全相位的父本与母本单倍型图。

## 已核实植物案例
[Macadamia jansenii 基因组组装研究](https://doi.org/10.1111/tpj.15583)使用 Hifiasm 处理 HiFi 读段，8 条染色体直接以大型连续 Contig 呈现；官方发布的玉米 B73（2.2 Gb）基准测试记录表明，在 48 线程下仅需 5.1 小时即可完成全基因组组装，Contig N50 达到 36.7 Mb。

## 相关资源
[Hifiasm 官方软件与源码仓库](https://github.com/chhylp123/hifiasm)；[ReadTheDocs 官方输出解释](https://hifiasm.readthedocs.io/en/latest/interpreting-output.html)；[Bandage 组装图可视化工具](https://github.com/rrwick/Bandage)。上游需严格准备高分子量 HMW DNA 与 $\ge 30\times$ HiFi 测序，下游配合 Merqury 与 BUSCO 开展无偏质控。

## 一句话简介与开发背景
Hifiasm 是面向 PacBio HiFi 读段的 de novo 组装金标准工具，基于严格的极小弦图（String Graph）与相位感知气泡算法，能够端到端自动化重构高连续性、双单倍型分离的真核生物参考基因组。

## 算法原理与图处理
Hifiasm 首先在同聚物压缩空间进行读段全联配，消除纳米孔或测序仪在连续单碱基微卫星上的微小波动。利用 Myers 2005 传递边约简定理，严格消除所有满足传递性条件的冗余边，将边集合控制在与读段数严格线性的极小规模。对杂合 SNP/InDel 形成的气泡结构，算法执行二项分布覆盖度检验（单倍体峰约为全深度的一半），将其标记为等位气泡并保留两条完整路径；最后结合 Hi-C 物理交联或 Trio 亲本特异 $k$-mer 将气泡链缝合为整条染色体尺度的全相合路径。

## 运行入口、输入检查与参数
输入前检查 HiFi 测序读段的 Q 值（要求 $\ge Q20$，平均 $\ge Q30$）与单倍体覆盖深度（建议 $\ge 30\times$）。基本运行命令：
```bash
# 基础二倍体组装
hifiasm -o rice_asm -t 48 -l 2 pacbio_hifi.fq.gz 2> rice_asm.log

# 整合双端 Hi-C 辅助染色体分相
hifiasm -o maize_phased -t 64 --h1 hic_R1.fq.gz --h2 hic_R2.fq.gz maize_hifi.fq.gz 2> maize_phased.log
```

## 输出文件阅读
GFA1 格式中，`S` 行代表序列片段（Segment），`L` 行代表重叠连接（Link），`A` 行代表单倍型赋值。可利用 `awk` 快速提取 FASTA 序列：
```bash
awk '/^S/{print ">"$2"\n"$3}' maize_phased.hic.p_ctg.gfa > maize_p_ctg.fa
awk '/^S/{print ">"$2"\n"$3}' maize_phased.hic.hap1.p_ctg.gfa > maize_hap1.fa
awk '/^S/{print ">"$2"\n"$3}' maize_phased.hic.hap2.p_ctg.gfa > maize_hap2.fa
```

## 植物案例及证据
在玉米 B73（*Zea mays*, 2.2 Gb, 75% 转座子）官方 v0.12 基准测试中，采用 22× HiFi 数据在 48 线程计算节点上实测：Wall-clock 耗时 5.1 小时，CPU 累积耗时 203.2 小时，峰值内存 68 GB，获得总长 2.1 Gb、Contig N50 高达 36.7 Mb 的超高质量组装；在四倍体马铃薯（Sun et al., 2022, *Nature Genetics*）中，Hifiasm 辅助完成了同源四倍体全 48 条单倍型染色体的解析。

## 适用范围与质量评估
Hifiasm 适用于绝大多数高保真长读段支持的二倍体及多倍体植物组装。对于着丝粒超长串联重复（如数 Mb 的 CentC 阵列），单纯依靠 HiFi 仍可能产生局部断裂，需辅以超长 ONT 读段；组装完成后，必须联合使用 Merqury 评估 Consensus QV（要求 $\ge Q40$）、Spectra-cn 拷贝数双峰谱图、BUSCO 保守基因完整度及全基因组 Hi-C 接触热图进行正交验证。
