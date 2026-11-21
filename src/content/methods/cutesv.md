---
title: cuteSV 长读段结构变异检测
name: cuteSV
summary: 从长读段比对中提取结构变异信号，通过类型特异聚类和迭代细化生成 VCF 候选。
version: 2.1.4
dataType: 坐标排序的长读段 BAM；参考 FASTA
principle: 断点信号聚类与迭代细化
domainIds: [pangenomics-structural-variation]
topicIds: [m03-topic-03]
principleIds: [variant-calling]
dataIds: [long-reads, assembly, variant-data]
paper: cutesv-paper
repository: https://github.com/tjiangHIT/cuteSV
status: draft
updatedAt: 2026-11-21
---
## 一句话简介与开发背景
cuteSV 是基于长读段比对信号检测结构变异的软件，由 Jiang 等开发并首先在长读段人类基因组数据上评估。算法收集读段内与读段间的插入、缺失、倒位、重复和易位信号，按事件类型聚类并迭代细化断点和候选等位。[方法论文](../../../papers/cutesv-paper/)。官方发布页当前列出 cuteSV v2.1.4；论文中的 v1.x 方法版本与当前 v2.x 软件行为应分开记载。[官方发布页](https://github.com/tjiangHIT/cuteSV/releases)。

## 生物学与计算问题
结构变异可能跨越较长重复区或包含大片段插入，单个读段的局部对齐容易出现多个候选信号。cuteSV 将比对文件解析为候选签名，再依据插入、缺失、倒位、重复和易位使用不同聚类距离与合并标准，形成事件候选；在候选周围收集支持比对并迭代调整断点/等位表示，最后输出变异和可选基因型。核心算法是候选签名聚类及细化；程序对 BAM 标签、工作目录、阈值及 VCF 字段的处理属于软件实现。

长读段比对质量会直接影响输入信号。参考组装缺口、重复拷贝、读段嵌合、测序平台和样本倍性都可能改变支持数及基因型解释；caller 输出需要按独立组装、reads 或实验进行后续核查。

## 输入、输出与主要参数
官方基本命令形式为：

```bash
cuteSV sample.sorted.bam reference.fa sample.vcf work_dir --threads 16 --min_size 30 --min_support 10
```

输入为坐标排序的长读段 BAM、对应参考 FASTA、输出 VCF 路径和临时工作目录。常见参数包括 `--threads`、`--min_mapq`、`--min_support`、`--min_size`、`--max_size`、插入/缺失候选的聚类偏差和合并比例。平台和版本会影响建议的聚类阈值；官网 README 对 CLR、HiFi 和 ONT 分别列出参数建议，需从目标版本帮助中确认参数名和默认值。[官方 README 参数表](https://github.com/tjiangHIT/cuteSV#usage)。

主要输出为 VCF，工作目录保存可配置的中间签名与批次数据；是否保留临时文件由运行参数决定。检查参考样本名称、VCF 样本列、事件坐标和支持读段数，且将每个 caller 的过滤阈值分别记录。

## 植物应用案例
Bechen 等在拟南芥中以 Nanopore 长读段比对至 Col-CEN v1.2，再用 cuteSV 调用处理诱导变异的材料；作者报告 12 个 SV，并对部分事件进行 PCR 检查。该论文将 cuteSV 作为检测流程一环，结果也结合控制材料、表型及后续验证解释。另一个十种被子植物 HiFi benchmark 报告 Minimap2/cuteSV2 在插入检测上具有跨物种稳定性，评价基于该研究建立的高可信 assembly-derived truth sets。[拟南芥应用论文](../../../papers/plant-induced-sv-2025/)，[十种被子植物基准](../../../papers/plant-sv-benchmark-2026/)。

cuteSV 原始方法论文主要以人类长读段数据评估软件；植物数据的应用和基准结果由各自论文独立支撑，不能直接沿用人类基准的精确率或召回率。[方法论文](../../../papers/cutesv-paper/)。

## 实战教程与关联资源
本项目当前没有经真实植物数据实跑验证的 cuteSV 教程。官方项目提供安装方法、命令与平台参数建议：[代码仓库](https://github.com/tjiangHIT/cuteSV)。关联专题为[植物基因组结构变异检测](../topics/pangenomics-structural-variation/m03-topic-03/)，上游为 minimap2 等长读段比对器，下游为 SV 合并、基因型检查及独立验证。
