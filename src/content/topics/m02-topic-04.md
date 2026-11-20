---
title: 转录本辅助注释
summary: 用 RNA-seq 和全长转录本支持外显子与剪接结构。
domain: genome-annotation
methods: [braker3]
updatedAt: 2026-11-20
---
## 研究背景
RNA 测序提供转录证据，支持外显子、剪接连接和不同转录本结构。同一基因可产生多种剪接异构体；不同组织、发育阶段或胁迫条件下的表达差异影响可观察范围。

## 计算过程与方法比较
短读长需使用识别剪接的比对方法定位到基因组，再通过跨剪接 reads 与覆盖信息组装转录本。StringTie2 用于从比对 reads 组装转录本；PASA 使用转录本比对与装配支持基因结构注释。全长转录本能够连接较长的剪接结构，但仍需要考虑测序错误、截断、嵌合与表达覆盖。

## 植物中的证据解释
多倍体或基因家族成员高度相似时，reads 可能多重比对；建议检查唯一比对、剪接支持和同源蛋白。单一组织未表达不等于基因不存在，短读长拼接出的低支持异构体需谨慎解释。

## 方法与案例
BRAKER3 原始论文将 RNA-seq 与蛋白证据结合，并以多种植物进行基准评估。[BRAKER3 论文](https://doi.org/10.1101/gr.278090.123)；[StringTie 官方文档](https://ccb.jhu.edu/software/stringtie/)；[PASA 官方仓库](https://github.com/PASApipeline/PASApipeline)。
