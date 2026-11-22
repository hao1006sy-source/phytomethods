---
title: 非编码 RNA 注释
summary: 按 RNA 类型整合序列、二级结构、保守家族和转录证据识别非编码 RNA。
domain: genome-annotation
methods: []
updatedAt: 2026-11-22
---

## 研究背景与问题

非编码 RNA（non-coding RNA, ncRNA）包括 tRNA、rRNA、microRNA（miRNA）、小核 RNA（snRNA）、小核仁 RNA（snoRNA）及长链非编码 RNA（lncRNA）等。不同类型的长度、成熟过程、结构和功能不同，不能用单一预测策略覆盖。注释目标是定位候选基因或成熟转录本，并给出家族、结构或表达证据；序列不编码长开放阅读框本身不足以判定 ncRNA。

## 方法原理与计算流程

保守家族识别可以利用序列相似性，也可以利用协方差模型（covariance model, CM）同时表示序列位点和配对碱基的演化约束。Infernal 的 `cmsearch` 使用 CM 对目标序列进行统计搜索；模型由已知 RNA 家族的多序列比对及结构注释建立。tRNAscan-SE 针对 tRNA 结构和序列特征设计；rRNA 常使用专门模型或数据库；miRNA 候选还需要前体发夹结构、成熟小 RNA 证据及加工特征。

可复现分析步骤：

1. 固定基因组组装版本和序列命名，确定线粒体、叶绿体与核基因组是否分别分析。
2. 按类型选择工具和数据库，例如 tRNAscan-SE 搜索 tRNA，Infernal/Rfam 搜索已知 RNA 家族。
3. 记录模型库版本、阈值、扫描命令和重复区域处理策略。
4. 检查命中区间、链方向、结构评分、覆盖和重叠；对多个模型重复命中的区域进行去冗余判断。
5. 结合小 RNA 测序、转录组、已知家族和基因组背景筛选候选；区分基因拷贝、成熟产物和加工片段。
6. 将 ncRNA feature 写入 GFF3，并验证坐标和 ID 唯一性。

lncRNA 通常没有一个类似保守 CM 的统一搜索模型，常结合转录组组装、编码潜力评估、结构特征、组织表达及实验验证。不同类别的识别输出应分开保存，避免把相似命中直接合并为统一“ncRNA”结论。

## 植物特异性难点与结果解释

植物基因组包含大量重复序列、串联基因和细胞器来源序列；重复区域中的短保守片段可能引起假阳性。多倍体会带来真实拷贝增加。低表达组织、阶段特异表达和小 RNA 加工差异会造成测序证据缺失。应报告识别工具、版本、数据库、过滤阈值、组装来源和是否包含细胞器序列。计算命中代表候选注释，不等于表达或功能验证。

## 植物应用案例

番茄 VF36 的端粒到端粒基因组研究将多种 ncRNA 检测分工处理：tRNAscan-SE 用于 tRNA，RNAmmer 用于 rRNA，Infernal/Rfam 用于 miRNA 与 snRNA 候选，再与结构注释整合。该案例说明不同 RNA 类型依赖不同模型；文章报告的候选数量属于该基因组、该版本流程的结果，不能视为其他物种的预期值。[原始论文](https://doi.org/10.1093/gigascience/giaf058)。

## 方法比较与阅读

Infernal/Rfam 适于已建模家族的结构同源搜索；tRNAscan-SE 专门识别 tRNA；转录组组装可以发现表达转录本，但本身无法可靠区分所有 ncRNA 类型。比较结果时需统一基因组、数据库版本和统计单位。方法论文：[Infernal 1.1](https://doi.org/10.1093/bioinformatics/btt509)、[tRNAscan-SE 2.0](https://doi.org/10.1093/nar/gkab688)。植物案例：[番茄 T2T 研究](https://doi.org/10.1093/gigascience/giaf058)。
