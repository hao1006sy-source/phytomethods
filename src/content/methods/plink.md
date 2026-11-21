---
title: PLINK
name: PLINK
summary: 面向基因型数据的质量控制、遗传统计、群体结构概览与关联分析工具集。
dataType: VCF / BCF / PLINK 基因型文件
principle: 基因型统计与关联分析
domainIds: [population-genetics]
topicIds: [m05-topic-02, m05-topic-03]
principleIds: [genotype-statistics]
dataIds: [variant-data]
paper: plink-paper
repository: https://github.com/chrchang/plink-ng
status: draft
updatedAt: 2026-11-21
---
## 一句话简介与开发背景

PLINK 是处理大规模个体基因型数据的命令行工具集，覆盖数据转换、样本与变异质量控制、遗传距离、群体结构摘要及关联分析。第一代工具论文发表于 2007 年；PLINK 1.9 以位运算和内存效率改进处理较大数据集，PLINK 2.0 引入 PGEN 文件集，并扩展了剂量和多等位变异数据的读写。PLINK 2.0 官方文档截至 2026-11-21 标注 Beta 1.4（2026-11-07）。[PLINK 1.9 官方文档](https://www.cog-genomics.org/plink/1.9/)；[PLINK 2.0 官方文档](https://www.cog-genomics.org/plink/2.0/)；[PLINK 方法论文](../../papers/plink-paper/)。

## 生物学与计算问题

群体遗传学和 GWAS 分析需要将每个样本在大量遗传位点上的基因型编码为可检验矩阵。PLINK 能完成基因型数据整理、样本和位点过滤、等位基因频率与缺失统计、连锁不平衡（linkage disequilibrium，LD）剪枝、亲缘估计、主成分分析（principal component analysis，PCA）及多种关联检验。它从已调用的基因型开始，不负责 reads 比对、变异发现或参考组装。

在常见二倍体双等位 SNP 表示中，基因型剂量为 0、1、2，表示备选等位基因的拷贝数。分析矩阵的样本和位点筛选会决定频率、PCA 坐标和关联统计量。植物自交、克隆繁殖、种群材料取样不均和多倍体剂量编码都可能改变数据的统计结构，筛选规则须结合物种、交配系统、倍性、测序平台和问题设置。

## 核心计算流程

PLINK 工作流通常从一致的样本 ID、位点 ID、等位基因和参考基因组坐标开始。随后检查样本缺失率、位点缺失率、次要等位基因频率、异常杂合度、亲缘关系和重复样本，再生成用于目标分析的数据子集。PLINK 2.0 的 PGEN 可保存硬调用及支持的剂量信息；PLINK 1 二进制文件集由 BED、BIM、FAM 三个文件组成。

PCA 的常见计算思路是从经过频率标准化的基因型矩阵构建样本间关系矩阵，再对该矩阵进行特征分解。以双等位二倍体基因型为例，标准化的示意形式为

$$
z_{ij}=\frac{g_{ij}-2p_j}{\sqrt{2p_j(1-p_j)}},\qquad K\propto ZZ^{\mathsf T},
$$

其中 $g_{ij}$ 是样本 $i$ 在位点 $j$ 的备选等位基因剂量，$p_j$ 是该位点等位基因频率，$K$ 表示样本关系矩阵。特征向量给出样本在主成分上的坐标，特征值概括相应方向的矩阵变异。该式用于说明标准化关系矩阵的基本思想；缺失基因型处理、频率估计、变异纳入条件和具体计算选项应按实际 PLINK 版本记录。

PLINK 1.9 与 PLINK 2.0 都提供 `--pca`，默认主成分数量不同：PLINK 1.9 默认为 20 个，PLINK 2.0 默认为 10 个，均可显式指定数量。PLINK 2.0 的 `approx` 使用随机化近似计算，可用于大样本前几个主成分的估计；其官方说明指出该模式会对缺失基因型作均值填补。PCA 结果可以帮助发现宽尺度群体结构、近亲或批次异常，也可作为关联分析的协变量；图上的分离轴不直接对应历史迁徙、祖先百分比或因果机制。[PLINK 1.9 群体分层文档](https://www.cog-genomics.org/plink/1.9/strat#pca)；[PLINK 2.0 PCA 文档](https://www.cog-genomics.org/plink/2.0/strat)。

## PLINK 1.9 与 PLINK 2.0

| 项目 | PLINK 1.9 | PLINK 2.0 |
| --- | --- | --- |
| 常用二进制文件 | `.bed`、`.bim`、`.fam` | `.pgen`、`.pvar`、`.psam`；也可读写部分 PLINK 1 格式 |
| 常见基因型输入 | VCF、PED/MAP、PLINK 1 文件集 | VCF/BCF、PGEN、BGEN、EIGENSOFT 等；具体以当前手册为准 |
| PCA 输出 | `.eigenvec`、`.eigenval`；默认 20 个 PC | `.eigenvec`、`.eigenval`；默认 10 个 PC，可使用 `approx` |
| 状态与许可 | 1.9 系列；PLINK 1.9 方法论文记录 GPLv3 | 官方页面仍标为 Beta；官方说明采用 GNU GPL v3 |

两代格式、缺失填补、等位基因编码、输出表头和选项并不完全相同。复现既有研究时，应同时记录实际可执行文件版本、构建日期、输入格式、调用参数和日志，不以工具系列名称代替运行环境。

## 输入、输出与主要参数

| 环节 | 主要输入或参数 | 常见输出 | 用途 |
| --- | --- | --- | --- |
| VCF 导入与转换 | `--vcf`、`--make-bed`；PLINK 2 可使用 `--make-pgen` | BED/BIM/FAM 或 PGEN/PVAR/PSAM | 生成可重复读取的分析文件集 |
| 样本和位点筛选 | `--mind`、`--geno`、`--maf` / `--max-maf` | 过滤后的文件集、日志 | 根据缺失和频率标准定义分析集合 |
| 连锁不平衡剪枝 | `--indep-pairwise` | `.prune.in`、`.prune.out` | 选取近似独立标记用于群体结构等分析 |
| 主成分分析 | `--pca N`；PLINK 2 可用 `--pca N approx` | `.eigenvec`、`.eigenval` | 输出样本主成分坐标与对应特征值 |
| 基本统计 | `--freq`、`--missing` | `.frq`/`.afreq`、`.imiss`、`.lmiss` | 复核等位基因频率及样本/位点缺失情况 |

参数阈值是研究设计的一部分。低频变异、强 LD 区域、近亲和异常样本可能影响关系矩阵及 PCA；是否过滤、剪枝或使用近似算法应结合研究目的、样本结构和版本文档确定。PLINK 官方建议在 PCA 前处理极低频变异，并指出 LD 剪枝可降低少数基因组区域主导主成分的风险。[PLINK 2.0 群体分层文档](https://www.cog-genomics.org/plink/2.0/strat)。

PLINK 2.0 示例命令展示 VCF 转 PGEN、筛选、LD 剪枝并计算 10 个近似 PC。筛选值仅为命令格式示例，需根据数据和设计替换：

```bash
plink2 --vcf cohort.vcf.gz --max-alleles 2 --make-pgen --out work/cohort
plink2 --pfile work/cohort --mind 0.10 --geno 0.05 --maf 0.05 --make-pgen --out work/qc
plink2 --pfile work/qc --indep-pairwise 50 5 0.2 --out work/prune
plink2 --pfile work/qc --extract work/prune.prune.in --pca 10 approx --threads 8 --out results/cohort
```

运行后先检查日志中的样本数、变异数、过滤数量、等位基因和输入解析信息，再读取 `.eigenvec` 与 `.eigenval`。PLINK 1.9 的 `.eigenvec` 默认无表头，PLINK 2.0 输出格式包含 FID/IID 表头；下游脚本需按版本适配。[PLINK 文件格式文档](https://www.cog-genomics.org/plink/2.0/formats)。

## 植物应用案例

Wang 等的 3,010 份亚洲栽培稻研究将 PLINK 用于 SNP/LD 处理，之后运行 ADMIXTURE 比较候选 $K$，并用 CLUMPP 对齐成分矩阵。论文把重点结构变异和 PAV 分析限定在 453 份高覆盖材料。该案例中 PLINK 对应标记筛选与 LD 步骤，不能据此把论文的所有 PCA、变异检测或泛基因组分析归给 PLINK。[原始论文](../../papers/rice-3010-pangenome/)；[研究原文](https://doi.org/10.1038/s41586-018-0063-9)。

水稻根系适应研究中，PLINK 从 3.3 百万个未填补 SNP 中筛选出 154,516 个满足论文 LD 阈值的标记；ADMIXTURE 运行 $K=1$–10 并把 $K=8$ 作为一个模型选择；PCA 和亲缘矩阵则由 GAPIT 使用 3.3 百万个未填补 SNP 计算。页面分别关联 PLINK、ADMIXTURE 与 GAPIT，保留每项方法的原文任务边界。[原始研究](../../papers/rice-roots-population/)；[出版方全文](https://journals.plos.org/plosgenetics/article?id=10.1371/journal.pgen.1007521)。

## 结果判读与适用边界

- PCA 坐标表示样本在所选基因型集合和标准化方案下的投影；PC 轴的符号可整体翻转，轴序、尺度和方向均不表示单一历史过程。
- PCA 图上的分组可能由地理群体、近亲、取样比例、测序批次、缺失模式或强 LD 区域共同影响。需结合样本元数据、质量统计、特征值和位点贡献检查。
- 用 PC 作为 GWAS 协变量时，应同时处理亲缘和实验设计；加入若干 PC 不保证自动消除全部混杂，也不替代适合物种与样本结构的统计模型。
- PLINK 文件与常见 0/1/2 编码主要面向二倍体双等位基因型工作流。多倍体研究应核实调用工具对剂量和倍性的支持方式，避免把不匹配的倍性基因型强行折叠为二倍体编码。
- PLINK 不处理原始 reads，也不进行组装或变异发现；它从已有变异/基因型数据开始工作。

## 教程、来源与关联资源

本站 [PLINK 模拟数据教程](../../tutorials/plink-synthetic/)实际使用 PLINK 1.9.1（2026-11-11 构建）处理 8 个虚构二倍体样本和 6 个虚构 SNP，核对了频率、缺失率和 PCA 文件。示例不代表真实植物数据运行。命令、输入文件、实际输出、校验脚本和日志见教程及 `examples/population/verified-plink-20261121/`。

PLINK 1.9 方法与格式见[原始论文](../papers/plink-paper/)；PCA 的群体结构解释可继续读 Price 等人的[主成分校正研究](https://doi.org/10.1038/ng1847)和 Patterson 等人的[群体结构特征值分析](https://doi.org/10.1371/journal.pgen.0020190)。本页重点连接[M05-02 SNP/VCF 专题](../../topics/population-genetics/m05-topic-02/)和[M05-03 群体结构专题](../../topics/population-genetics/m05-topic-03/)；上游为变异调用、参考和样本信息，下游包括 ADMIXTURE、GWAS 和亲缘相关分析。

本机 PLINK 1.9.1 模拟数据分析已经执行；真实植物数据分析尚未在本机运行。PLINK 2.0 页面及参数在 2026-11-21 核对，未安装 PLINK 2.0 或本机实跑上面的 PLINK 2.0 命令。PLINK 1.9 原始方法论文记录 GNU GPL v3；PLINK 2.0 官方文档标注 Beta 并声明 GPL v3。[PLINK 1.9 原始论文](https://doi.org/10.1093/gigascience/giv023)；[PLINK 2.0 官方文档](https://www.cog-genomics.org/plink/2.0/)。
