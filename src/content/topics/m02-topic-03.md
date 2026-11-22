---
title: 蛋白编码基因结构预测
summary: 解释从头预测、同源与转录证据如何形成候选模型，并比较 BRAKER3 等整合流程。
domain: genome-annotation
methods: [braker3]
updatedAt: 2026-11-22
---

## 要解决的计算问题

蛋白编码基因预测（protein-coding gene prediction）要在基因组 DNA 序列上识别外显子、内含子、剪接供体/受体、起始和终止密码子，并把相邻片段连成一个或多个转录本模型。短序列信号（例如剪接位点）不足以单独决定整个基因结构；需要同时利用局部序列模式、外显子/内含子长度、转录本剪接证据和同源蛋白约束。

植物的高重复度和多倍体会增加相似区域。RNA-seq reads 可能在同源拷贝间多重比对；同源蛋白可能来自距离较远的物种；转座子编码区也可能表现为开放阅读框。因此，一个完整 ORF 或一次 BLAST 命中都不足以证明该序列是功能性基因。

## 隐马尔可夫模型与路径求解

常见统计基因预测器可用隐马尔可夫模型（hidden Markov model, HMM）或广义 HMM 表示：隐藏状态 (z_i) 描述碱基位置属于基因间区、编码外显子、内含子、剪接位点等状态，观测序列为 (x_1,…,x_n)。简化模型的联合概率为

\[
P(x,z)=P(z_1)\prod_{i=2}^{n}P(z_i\mid z_{i-1})\prod_{i=1}^{n}P(x_i\mid z_i).
\]

其中 (P(z_i\mid z_{i-1})) 是状态转移概率，描述例如外显子接内含子的可能性；(P(x_i\mid z_i)) 是发射概率，描述该状态下观察到碱基或信号的可能性。Viterbi 解码寻找使联合概率最大的状态路径；实际预测器还使用剪接位点模型、长度分布、相位和训练参数，不等同于上式的简单四状态示例。

有证据的预测器把 RNA 剪接连接或蛋白比对作为“提示”（hints）。提示增加候选边界/外显子被支持的证据，但不替代统计模型；低覆盖、错配参考版本或同源拷贝混淆会把错误提示传入模型。

## BRAKER3 的方法流程及实现边界

BRAKER3 是一套整合工作流，不是单一预测算法。论文所述流程联合 GeneMark-ETP、AUGUSTUS 与 TSEBRA：GeneMark-ETP 利用转录与蛋白信息训练/预测，AUGUSTUS 根据目标物种训练参数并结合 hints 产生候选，TSEBRA 按提示支持和模型规则组合候选基因集。过程可概括为：

```text
软屏蔽基因组 + RNA-seq 剪接证据 + 同源蛋白
       → GeneMark-ETP 与 AUGUSTUS 训练/预测
       → 候选模型和证据提示
       → TSEBRA 组合筛选
       → GTF/GFF、CDS/蛋白 → 质量评估与人工复核
```

常用输入包括基因组 FASTA、蛋白 FASTA，以及剪接比对 BAM 或 RNA-seq 数据；输出包含最终 `braker.gtf`，并保留 GeneMark、AUGUSTUS 候选和日志用于追溯。示例命令如下，属于模板而非本机运行记录：

```bash
braker.pl \
  --genome=genome.softmasked.fa \
  --prot_seq=related_species.proteins.fa \
  --bam=rnaseq.splice_aware.bam \
  --threads=16 \
  --busco_lineage=PLANT_LINEAGE
```

`--genome` 和 `--prot_seq` 指定参考及同源蛋白；`--bam` 需是与基因组坐标对应的剪接感知比对；`--threads` 控制并行度；`--busco_lineage` 需换成当前 BUSCO 版本实际存在、且与目标分类群匹配的谱系。BRAKER 官方说明 RNA 比对 BAM 的剪接链标签会影响 GeneMark-ETP；例如 HISAT2 需使用其支持剪接的参数，STAR 则按官方要求设置 intron motif。不能把来自不同组装版本或序列命名不一致的 BAM、FASTA 混用。

## 结果质量如何比较

有参考真值时，可按匹配规则计算精确率 (P=TP/(TP+FP))、召回率 (R=TP/(TP+FN)) 和 (F_1=2PR/(P+R))。TP、FP、FN 分别表示匹配真模型、错误预测和漏掉的真模型；不同论文的匹配阈值、物种和数据集会影响数值，不能直接把一个 benchmark 排名当作本物种的预期结果。没有完整真值时，综合 BUSCO、RNA 剪接支持、同源蛋白、模型完整度、冗余、重复重叠和人工抽查。

方法差异在于证据类型和假设：AUGUSTUS、GeneMark 提供不同的统计模型和预测流程；GeneMark-ETP/BRAKER3 联合 RNA 与蛋白提示；MAKER 可整合外部预测、同源和转录证据，强调注释整合。运行软件的版本、参数及数据库必须报告。

## 植物应用与版本提醒

芒果基因组研究报告使用 BRAKER3 v3.0.3 推断结构模型，并以 BUSCO 评估基因集；论文方法段同时说明重复软屏蔽和叶/花 RNA-seq 比对。此案例说明多类输入如何进入结构预测，不代表不同植物都能用相同参数获得同等质量。[原始研究](https://doi.org/10.1002/tpg2.20441)。BRAKER3 的整合算法和 benchmark 见 [Gabriel et al., 2024](https://doi.org/10.1101/gr.278090.123)。

截至 2026-11-22，BRAKER 官方仓库已将 BRAKER 标记为弃用并指向 BRAKER4。BRAKER3 仍作为已发表方法和历史研究工具记录；新项目应核对 BRAKER4 官方文档、依赖和方法论文，不能把旧页面的 BRAKER3 示例当作当前官方推荐版本。

## 延伸阅读

[BRAKER3 方法论文](https://doi.org/10.1101/gr.278090.123)；[BRAKER 官方代码与版本公告](https://github.com/Gaius-Augustus/BRAKER)；[TSEBRA 方法论文](https://doi.org/10.1186/s12859-021-04482-0)；[芒果基因组注释案例](https://doi.org/10.1002/tpg2.20441)。

