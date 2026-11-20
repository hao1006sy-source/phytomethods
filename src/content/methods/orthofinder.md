---
title: OrthoFinder
name: OrthoFinder
summary: 结合基因家族、基因树和物种树推断直系同源及基因复制。
dataType: 蛋白序列 FASTA
principle: 序列相似性聚类与系统发育
domainIds: [comparative-genomics]
topicIds: [m04-topic-01, m04-topic-02]
principleIds: [phylogenetics]
dataIds: [proteins]
paper: orthofinder-paper
repository: https://github.com/OrthoFinder/OrthoFinder
status: draft
updatedAt: 2026-11-21
---
## 生物学问题与定位
OrthoFinder 由 David Emms、Steven Kelly 等开发，针对多物种蛋白序列推断基因家族、直系同源和复制事件。原始方法论文发表于 2019 年；软件目前由 [OrthoFinder 团队维护](https://github.com/OrthoFinder/OrthoFinder)。软件仓库注明 GPL-3.0 许可。植物多倍体和复制基因家族常包含一对多关系，需要结合物种树和基因树解释。

## 核心思想与步骤
软件依据序列相似性组织基因家族，进一步推断基因树和有根物种树，结合树的拓扑推断正交基因关系及基因复制事件。基因家族的成员不一定两两互为直系同源：一个家族内部可以保留较早的复制。推断依赖输入蛋白集、树、根和方法配置；注释不全与复制拷贝遗漏会影响结果。[方法论文](https://doi.org/10.1186/s13059-019-1832-y)。

## 输入、输出与参数
基本输入是每个物种一个蛋白 FASTA 文件的目录，序列 ID 应稳定且在数据集中可区分。官方示例使用 `orthofinder -f 输入目录`，`-f` 指定序列文件夹；实际可用参数和依赖请以所用版本帮助为准。输出包括基因家族、直系同源关系、基因树、物种树及复制事件统计。具体输出目录和字段应对照当前官方文档；使用不同版本应保留参数、软件版本和输入文件校验信息。

## 比较与植物应用
双向最佳匹配适合快速筛选候选，同源基因复制或丢失可能使其不足以描述复杂的一对多关系。树方法能显式解释复制，结果质量受序列比对、物种采样、进化模型和树不确定性影响。植物研究可以结合共线性、亚基因组来源和表达进一步分析候选家族，具体植物案例见下文。

## 上下游与来源
上游是物种选取、蛋白编码基因预测和序列质控；下游可结合基因树、共线性、家族大小及功能验证分析。软件版本 3 增加大规模分析的 `--core` 与 `--assign` 流程，具体条件以[官方说明](https://github.com/OrthoFinder/OrthoFinder)为准。本条目及示例命令尚未在本机执行验证。
## 植物应用案例
攀枝花苏铁基因组研究使用 OrthoFinder 将苏铁与其他植物基因组的蛋白序列组织为基因家族，再结合系统发育等证据研究种子植物演化。[Liu 等，2022](https://doi.org/10.1038/s41477-022-01129-7)。69 份拟南芥组装的研究使用 OrthoFinder 定义基因家族，再以重复抽样研究泛基因组和核心基因组。[Lian 等，2024](https://doi.org/10.1038/s41588-024-01715-9)。


2026-11-21 查阅[官方发布页](https://github.com/OrthoFinder/OrthoFinder/releases)，列出 v3.2。该记录不代表本机已安装或运行此版本。
