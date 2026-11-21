---
title: SNP 检测、过滤与 VCF
summary: 从测序比对证据到标准化变异记录和群体基因型矩阵，理解植物 SNP 与 InDel 流程。
domain: population-genetics
methods: [bcftools, plink]
status: draft
updatedAt: 2026-11-21
---

## 研究问题与流程边界

植物群体遗传、驯化和育种研究通常需要为多个材料建立可比较的基因型集合。变异分析包含彼此衔接的环节：测序读段质控、比对至参考、变异检测与基因型推断、标准化、过滤、格式转换和下游群体分析。参考版本、倍性、测序深度、群体采样和过滤规则都会影响最终保留的记录。

变异调用（variant calling）利用读段与参考的比对证据推断候选位点及样本基因型；质量控制（quality control，QC）评估调用可靠性并定义分析集合；PLINK 等群体工具从已得到的基因型开始，处理数据集、筛选位点并计算群体统计。PLINK 不承担原始 reads 比对或变异发现。一个工具的输出格式也不等于它完成了整个研究流程。

## SNP、InDel 与基因型证据

单核苷酸变异（single-nucleotide variant，SNV）表示相对于指定参考的单碱基差异；群体遗传中常称 SNP。插入或缺失（insertion/deletion，InDel）表示相对于参考的短序列插入或缺失。参考序列是比较坐标系，REF 并非跨所有个体都更常见的祖先等位基因。

变异检测器依据碱基质量、比对质量、读段深度、读段方向、等位基因支持及倍性模型计算基因型证据。基因型似然（genotype likelihood）刻画观测读段在不同基因型假设下的支持；硬调用 GT 则给出一个离散基因型。低深度下保留似然或剂量可保存不确定性，后续软件能否读取和使用这些信息需分别检查。位点级 QUAL 与样本级 GQ 是不同字段；DP、AD 等的计算范围和定义应查文件头及调用器文档。

## VCF 记录结构

VCF（Variant Call Format）以文本形式记录变异和样本基因型；BCF 是其二进制对应格式。文件开头的 `##` 元信息行声明参考、contig 和 INFO、FILTER、FORMAT 标签定义；`#CHROM` 表头后是数据列。标准固定字段为 8 列；若包含样本基因型，还会出现 `FORMAT` 与每个样本列。[HTS 规范](https://samtools.github.io/hts-specs/)

| 字段 | 含义 | 阅读要点 |
| --- | --- | --- |
| `CHROM`, `POS` | 参考序列与位置 | VCF 的 POS 从 1 开始；与 BED 等区间格式互换时核对坐标约定 |
| `ID` | 变异标识 | `.` 表示当前记录未提供 ID |
| `REF`, `ALT` | 参考等位基因及一个或多个备选等位基因 | ALT 顺序决定 GT 中非参考等位基因编号 |
| `QUAL`, `FILTER` | 记录级质量分数与过滤状态 | QUAL 不是样本级 GQ；FILTER 的标签需结合调用流程解释 |
| `INFO` | 位点级注释 | 字段结构及每个值的数量由元信息声明 |
| `FORMAT` 与样本列 | 每个样本的基因型和证据字段 | GT、DP、GQ、AD、PL 等按 FORMAT 顺序解析 |

例如，二倍体 `GT=0/1` 表示一个 REF 和一个第一个 ALT 等位基因；`1/2` 表示两个不同 ALT；`|` 表示记录了相位，`/` 表示未定相或相位未提供。多倍体基因型可以包含更多等位基因拷贝，缺失编码也取决于倍性。VCF 规范规定 `POS`、INFO/FORMAT 结构及基因型等位基因编号；具体字段语义以该文件头的声明为准。

## 从 BAM/CRAM 到 VCF/BCF

BCFtools 的官方基础流程由 `mpileup` 汇集比对证据并计算基因型似然，再由 `call` 在所选模型下输出候选变异与基因型。[官方变异检测流程](https://samtools.github.io/bcftools/howtos/variant-calling.html)

```bash
# 输入 BAM/CRAM 应与参考版本一致，并具有可读取的索引
bcftools mpileup -Ou -f reference.fa sample1.bam sample2.bam \
  | bcftools call -m -v -Ob -o cohort.raw.bcf
bcftools index cohort.raw.bcf
```

`-Ou` 在管道中输出未压缩 BCF，避免转成 VCF 文本后再解析；`call -m` 使用多等位调用模型，`-v` 只写变异位点，`-Ob` 输出压缩 BCF。单个样本或多样本的调用策略、先逐样本检测再联合分型等方案需根据数据设计与软件文档选择。官方文档指出 `mpileup` 对每个输入文件单个位点默认最多考虑 250 条 reads；超高深度数据需要评估 `--max-depth` 设置。该默认值是实现参数，不是适用于所有实验的深度建议。

## 标准化、过滤与分析集合

插入缺失在重复序列附近可能有多个等价表示。若要跨样本或数据库比较，常用参考序列进行左对齐和规范化，并核对 REF 等位基因是否与参考一致。BCFtools `norm` 可执行参考引导的 InDel 左对齐，也可按需拆分多等位记录；拆分会改变记录表示和某些注释/基因型字段的结构，因此只有在下游工具或比较规则要求时才实施。[BCFtools `norm` 手册](https://samtools.github.io/bcftools/bcftools-man.html#norm)

```bash
# 参考引导规范化；输入、输出和参考索引需匹配
bcftools norm -f reference.fa -Oz -o cohort.norm.vcf.gz cohort.raw.bcf
bcftools index -t cohort.norm.vcf.gz

# 如分析流程要求双等位记录，可另行拆分并单独留档
bcftools norm -f reference.fa -m -any -Oz \
  -o cohort.norm.biallelic.vcf.gz cohort.raw.bcf
```

过滤应分清记录级和样本级信息。位点 QUAL/FILTER 用来筛选记录；FORMAT/DP 或 FORMAT/GQ 用于评估具体样本调用。`bcftools view` 对多样本 FORMAT 条件的逻辑按记录筛选，常见表达式中的 `&`、`&&` 和对缺失 GT 的筛除方式会产生不同结果；先写清分析单位，再查看保留样本数和位点数。[BCFtools 过滤说明](https://samtools.github.io/bcftools/howtos/filtering.html)

```bash
# 教学示例：删除任一样本 GT 缺失的整条记录
bcftools view -e 'GT="mis"' -Oz \
  -o cohort.complete-sites.vcf.gz cohort.norm.vcf.gz
```

该 complete-case 示例会因为任一材料缺失而删除整个变异位点；大群体中可能显著减少数据量，且留下的位点集合可能偏向更易调用的区域。它只演示表达式语义，不是默认过滤方案。MAF、样本缺失率、位点缺失率、深度、杂合度和重复区域过滤都需依据科学问题、倍性、群体结构、可调用区域与经验校准报告。过严的频率筛选会减少稀有变异，HWE 过滤在自交或群体混合材料中也不能直接作为普遍规则。

## 转入群体基因型工具

完成调用和基本质控后，可将适合的 VCF 导入 PLINK 2 的 PGEN 文件集：

```bash
plink2 --vcf cohort.norm.vcf.gz --make-pgen --out cohort
```

该转换适合后续 PLINK 支持的群体统计、连锁剪枝和关联工作。PLINK 2 从 VCF 只读取其内部格式能够表示的内容，部分每样本测序深度和质量字段会被舍弃；如需依据 GQ、DP 等过滤，应在转换前完成。官方手册还指出 PLINK 2 文件格式不支持大于二倍体的基因型调用；`--polyploid-mode` 默认 `error`，也可选择 `missing`，后者会把整条多倍体调用转为缺失并丢弃剂量信息。多倍体分析需选用支持目标倍性和剂量语义的工具链。[PLINK 2 VCF/BCF 输入说明](https://www.cog-genomics.org/plink/2.0/input)

## 植物数据的关键控制点

- **参考和比对。** 参考缺失、重复区、多拷贝基因和同源亚基因组可能造成错配或等位基因偏倚；先核对可调用区域与映射质量。
- **自交与近交。** 杂合度和频率谱受繁殖方式影响；HWE、MAF 和杂合度过滤的阈值须对应样本来源和研究设计。
- **倍性和剂量。** 多倍体的剂量状态可能超出二倍体编码。确定检测器、文件格式和下游软件对目标倍性的共同支持情况。
- **变异表示。** 参考版本、染色体命名、多等位拆分、REF/ALT 顺序和坐标转换要保持一致；合并前检查样本重复、参考不匹配及表示差异。
- **数据筛选影响。** 每一步记录样本数、位点数、过滤原因、缺失与深度分布；群体结构、关联和选择扫描可以使用不同的分析子集，并说明构建方式。

## 水稻植物案例与方法比较

Wang 等的 3,010 份亚洲栽培稻研究以 BWA-MEM 0.7.10 比对，使用 GATK 3.2-2 进行 SNP/InDel 检测，并对 3,010 份材料识别约 2,939.99 万个 SNP 与 246.70 万个短 InDel。PLINK 用于 LD 剪枝和核心 SNP 集构建，ADMIXTURE 用于群体结构分析；这些下游软件不是其变异调用器。[原始论文与步骤记录](../../papers/rice-3010-pangenome/)

Balimponya 等对水稻杂合变异检测比较了 Bowtie2 或 BWA-MEM2 与 GATK4.3 HaplotypeCaller 或 BCFtools mpileup 的组合，并以相同 DNA 的独立测序结果评估一致性。该研究选定 BWA-MEM2 + GATK4.3 HaplotypeCaller：四项实验报告的相似度为 99.74%、99.63%、99.02% 和 99.37%；BWA-MEM2 + BCFtools mpileup 对应为 71.52%、71.43%、70.97% 和 66.51%。这是该研究材料、过滤和验证设定下的比较，不构成跨物种或跨数据集的调用器排名。[论文记录](../../papers/rice-variant-comparison/)；[Plant Methods 原文](https://doi.org/10.1186/s13007-025-01437-x)

## 延伸阅读与关联资源

- 工具：[BCFtools](../../methods/bcftools/)负责变异数据处理与基于比对的调用；[PLINK](../../methods/plink/)处理已调用的基因型数据。
- 案例：[3,010 份栽培稻变异与群体分析](../../papers/rice-3010-pangenome/)；[水稻杂合 SNP 调用组合比较](../../papers/rice-variant-comparison/)。
- 教程：[PLINK 模拟数据分析](../../tutorials/plink-synthetic/)实际使用虚构二倍体样本验证格式转换和统计输出；不代表真实植物数据复现。
- 延伸专题：[群体遗传学基本概念](../m05-topic-01/)、[PCA 与群体结构](../m05-topic-03/)、[多样性、分化与 LD](../m05-topic-04/)和[驯化与环境适应案例](../m05-topic-07/)。
