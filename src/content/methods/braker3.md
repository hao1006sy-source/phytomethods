---
title: BRAKER3
name: BRAKER3
summary: 将 RNA-seq 与同源蛋白证据输入 GeneMark-ETP、AUGUSTUS 和 TSEBRA 的真核基因结构注释流程。
dataType: 软屏蔽基因组 FASTA / 剪接比对 BAM / 同源蛋白 FASTA
principle: 隐马尔可夫模型预测与异质证据整合
domainIds: [genome-annotation]
topicIds: [m02-topic-01, m02-topic-03, m02-topic-04]
principleIds: [annotation]
dataIds: [annotation-input]
paper: braker3-paper
repository: https://github.com/Gaius-Augustus/BRAKER
version: BRAKER3 v3.0.3（芒果案例报告版本；当前开发状态请见官方仓库）
updatedAt: 2026-11-22
---
## 简介与开发背景

BRAKER3 是自动化真核基因预测工作流，组合 GeneMark-ETP、AUGUSTUS 与 TSEBRA，目标是在提供 RNA-seq 和同源蛋白证据时自动训练预测并整合候选模型。它不是一个单一预测器。方法论文发表于 Genome Research（2024），在多物种数据集评估工作流表现；植物案例包括拟南芥、番茄、蒺藜苜蓿等。该版本页面保留为已发表方法记录；官方仓库当前将 BRAKER 标记为弃用并引导至 BRAKER4，新分析应先阅读当前文档。

## 问题与算法流程

输入基因组经软屏蔽后，RNA 比对和蛋白同源比对产生 hints。GeneMark-ETP 利用证据训练和扩展候选基因集合；AUGUSTUS 进行基于物种参数的结构预测；TSEBRA 按 RNA 与蛋白支持规则比较重叠转录本并筛选候选集合。错误或不匹配的 hints、物种差异过远的蛋白以及软屏蔽不当都会影响结果。

## 输入、命令与输出

命令模板（不是本站实测记录，参数按所用 BRAKER 版本核对）：

```bash
braker.pl --genome=genome.softmasked.fa --prot_seq=related.proteins.fa \
  --bam=rnaseq.splice_aware.bam --threads=16 --busco_lineage=LINEAGE
```

`--genome` 为目标组装，`--prot_seq` 为同源蛋白，`--bam` 为坐标匹配的剪接比对 BAM，`--threads` 控制并行度，`--busco_lineage` 需使用当前 BUSCO 版本中的有效谱系。官方说明对 BAM 剪接链标签有要求；例如 HISAT2/STAR 比对需按 BRAKER 文档设置相应选项。常见主输出为 `braker.gtf`，流程也保存 GeneMark、AUGUSTUS 候选、日志和蛋白/CDS 文件，文件集随版本和选项变化。运行后核对 GTF 与基因组坐标一致、ID 唯一，并检查日志中每个阶段退出状态。

## 参数选择与适用范围

增加线程不能弥补 RNA-seq 组织覆盖不足。蛋白数据宜覆盖近缘和适度多样的谱系，同时避免把污染或高度远缘蛋白当强证据。重复屏蔽策略应记录；若输入没有剪接证据，应明确流程模式变化。多倍体项目应检查同源拷贝间 RNA 多重比对和注释冗余。

## 植物应用与资源

芒果染色体级基因组研究报告 BRAKER3 v3.0.3，并结合叶与花 RNA-seq 及蛋白证据预测基因结构。该实例说明实际输入构成，论文报告结果不能直接作为其他物种的预期指标。[原始应用论文](https://doi.org/10.1002/tpg2.20441)。方法论文：[Gabriel et al., 2024](https://doi.org/10.1101/gr.278090.123)。[官方仓库与版本状态](https://github.com/Gaius-Augustus/BRAKER)。教程：当前教程库未登记专门的 BRAKER3 实操页；该工具页提供命令模板，未标记为已运行验证。相关专题：重复序列识别、基因结构预测、转录本辅助注释、质量评估。常见下游评估包括 BUSCO、RNA junction 支持及 OMArk。


