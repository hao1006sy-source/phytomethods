---
title: EDTA
name: EDTA
summary: 为植物基因组构建过滤后的转座子序列库，并可将其用于全基因组 TE 注释。
dataType: 基因组 FASTA / 可选 CDS FASTA、已知 TE library、基因 BED
principle: 结构特征识别、分类、去冗余与同源注释
domainIds: [genome-annotation]
topicIds: [m02-topic-02]
principleIds: [annotation]
dataIds: [annotation-input]
paper: edta-paper
repository: https://github.com/oushujun/EDTA
version: 版本随仓库发布更新；运行时以官方 release 和安装文档为准
updatedAt: 2026-11-22
---
## 简介与背景

EDTA（Extensive de novo TE Annotator）面向植物基因组转座子（transposable element, TE）发现与注释。植物基因组的重复比例可很高，TE 既影响基因组大小和结构演化，也会影响软屏蔽后的基因预测。EDTA 通过多个结构识别和分类模块生成候选集合，再进行过滤、冗余整理；可使用整理后的 TE library 对基因组进行全局同源注释。

## 核心流程与算法边界

流程由不同 TE 类别的检测、候选合并、嵌套/嵌合过滤、分类及非冗余库构建组成。结构完整的 LTR、TIR、Helitron 等候选依据各自的端部重复、靶位点重复或结构特征识别；残片可通过 library 比对识别。EDTA 不会把所有低复杂度区域都转化为可靠 TE，也不能完全替代人工 curated library 或后续抽查。

## 输入、命令和输出

官方建议核对 FASTA header，保持序列名简短（不超过 13 个字符），避免空格及特殊字符，并保持原始序列 ID 映射表。可选 CDS、已知基因位置 BED 或 curated library 用于过滤/补充。常用模板：

```bash
EDTA.pl --genome genome.fa --species others --step all --anno 1 --threads 8
```

`--species` 控制物种特定模式（如 Rice、Maize 或 others；具体支持值依版本）；`--step all` 执行全流程；`--anno 1` 用最终 library 注释全基因组；`--threads` 指定线程。按官方 README 还可使用 `--cds`、`--curatedlib`、`--rmlib` 等参数。常见输出包括非冗余 TE library（如 `*.EDTA.TElib.fa`），启用全基因组注释后生成 `*.EDTA.TEanno.gff3` 和汇总文件；具体命名受输入前缀和版本影响。

## 结果解释与植物案例

分别查看 intact TE、fragmented TE、家族分类和基因组覆盖统计。组装断裂会截断完整结构元件，组装塌缩可能低估拷贝数；基因区同源序列可能造成 TE/宿主边界误判。EDTA 原始基准包含水稻数据，并与人工整理的重复库比较；不能据此推断每种植物都获得同一准确率。[原始方法论文](https://doi.org/10.1186/s13059-019-1905-y)。

## 教程和关联资源

[EDTA 教程](../../tutorials/edta-tutorial/)当前标记“命令已核对、真实数据待验证”，包含官方小型测试集步骤。官方代码和最新参数：[EDTA GitHub](https://github.com/oushujun/EDTA)。结果常作为基因预测前的软屏蔽输入；也可与 RepeatModeler2/RepeatMasker 结果进行审阅。相关专题：重复序列识别、结构预测、注释质量评估。


