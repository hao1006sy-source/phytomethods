---
title: SNP 检测、过滤与 VCF
summary: 从测序比对到基因型矩阵，理解植物群体小变异检测和质量过滤。
domain: population-genetics
methods: [bcftools, plink]
status: draft
updatedAt: 2026-11-21
---
## 研究问题与输入
群体遗传分析常需要比较多个个体在基因组位点上的基因型。单核苷酸多态性（single-nucleotide polymorphism，SNP）描述单碱基差异；插入或缺失（insertion/deletion，InDel）涉及相对于所选参考的序列增加或缺少。结果应标明参考组装版本、样本与倍性，才能用于跨分析比较。

短读段流程通常包含测序质控、比对至参考、排序与索引、必要的重复处理、变异检测、基因型生成与过滤。低深度、重复序列、结构变异或参考缺失会影响比对；在植物多倍体中，相似的同源染色体和亚基因组使读段归属与等位剂量更复杂。过滤后的 SNP 集并不代表全部可检测的遗传差异。

## 从读段到候选基因型
比对结果在一个参考位置汇集覆盖该位置的 reads；碱基质量和比对质量可用于衡量证据。变异检测器利用参考和备选等位基因、测序误差及样本倍性等信息，计算不同基因型的相对支持。多样本联合检测与先分别检测再合并可能得到不同结果，应根据软件模型和研究设计选择。

BCFtools 的官方流程用 `mpileup` 汇集比对信息，再通过 `call` 生成候选基因型；这一过程与后续过滤、标准化和群体分析属于不同步骤。[BCFtools 方法论文](https://doi.org/10.1093/gigascience/giab008)；[官方示例](https://samtools.github.io/bcftools/howtos/variant-calling.html)。GATK 也提供变异检测与过滤相关工具；PLINK 侧重基因型数据管理、质量控制和统计分析，不等同于从原始 reads 进行比对。

官方文档给出的 BCFtools 基础命令如下，作为流程语法示例：

```bash
bcftools mpileup -Ou -f reference.fa sample.bam | bcftools call -mv -Ob -o calls.bcf
```

`mpileup` 根据有覆盖的位置生成基因型似然；`-Ou` 以未压缩 BCF 在管道中传递。`call -m` 使用多等位基因调用模型，`-v` 仅输出变异位点，`-Ob` 写出压缩 BCF。实际分析还需匹配排序索引、参考序列、倍性、样本列表和深度设置；示例命令不含通用质量阈值。[官方变异检测说明](https://samtools.github.io/bcftools/howtos/variant-calling.html)。

## VCF 的主要字段
VCF（Variant Call Format）是描述变异与样本基因型的文本格式。以示意记录为例：

```text
#CHROM POS ID REF ALT QUAL FILTER INFO FORMAT sampleA sampleB
chr1   100 .  A   G   60   PASS   .    GT:DP  0/1:18  0/0:22
```

示例为教学展示，实际 VCF 使用制表符并包含以 `##` 开头的元数据行。`CHROM` 和 `POS` 给出参考序列及位置；`REF`、`ALT` 描述参考和备选等位基因；`QUAL` 是位点质量相关数值，`FILTER` 记录过滤状态；`INFO` 存放位点注释；`FORMAT` 定义后续样本字段。`GT` 中 `0` 表示参考等位基因、`1` 表示第一个备选等位基因；`/` 表示未声明相位，`|` 表示相位分隔。`DP` 通常用于深度，具体定义要查该文件头及生成软件。[VCF 规范](https://samtools.github.io/hts-specs/)。

## 位点与样本质量过滤
位点质量（QUAL）和基因型质量（GQ）含义不同；深度、等位基因支持、比对质量和缺失率也需要结合检查。多样本 VCF 的某个样本深度低，不必然等同于整个位点在所有样本中无效。不同工具的过滤表达式可能对样本和位点使用不同逻辑，应核对文档并报告阈值。

次要等位基因频率（minor allele frequency，MAF）和缺失率过滤会改变保留的变异集合。排除低频变异可用于某些统计模型，却会降低对稀有变异的观察能力；自交或群体结构也影响等位基因分布。应比较过滤前后的样本数、位点数、深度分布和缺失情况，而不是套用无来源的统一阈值。

## 坐标、标准化与倍性
插入缺失在重复区可以有多种等价表示；标准化有助于跨文件比较，但前提是参考版本一致。VCF 的位置约定与 BED 等格式不同，转换区间时必须按照各自规范处理。进行多文件合并前，检查参考碱基、染色体名称、位点表示、样本 ID 和排序索引。

二倍体 `0/1` 表示两个等位基因之一为参考、之一为第一个备选；多倍体基因型可能有更多等位基因项和剂量状态。应确认比对、检测和下游软件都支持所需倍性，避免将四倍体数据直接当作二倍体解释。

## 植物案例与下游
3,010 份亚洲栽培稻的研究对大量材料进行变异分析，为群体结构及基因组多样性研究提供数据资源。[原始研究](https://doi.org/10.1038/s41586-018-0063-9)。具体检测软件和参数需按论文方法部分核查，不能仅凭本站工具目录推断其使用了 BCFtools 或其他软件。

得到可靠的基因型数据后，可计算 PCA、等位基因频率、多样性、群体分化和 LD；每一步均需考虑缺失、亲缘关系、群体结构和位点选择。进一步阅读[VCF 规范](https://samtools.github.io/hts-specs/)、[BCFtools 过滤文档](https://samtools.github.io/bcftools/howtos/filtering.html)和[方法论文](https://doi.org/10.1093/gigascience/giab008)。
