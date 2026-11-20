---
title: PLINK
name: PLINK
summary: 对基因型数据进行质量控制、群体统计和遗传关联分析。
dataType: VCF / PLINK 基因型文件
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
## 研究问题与功能
PLINK 是基因型数据管理和统计工具集，支持数据转换、位点和样本质量控制、群体结构相关统计及关联分析。它处理已有的基因型数据，具体文件格式和功能取决于版本。[原始论文](https://doi.org/10.1086/519795)。

## 输入输出与参数
可根据版本导入 VCF 或使用 PLINK 文件集；输出包括过滤后的数据、频率、缺失率和不同分析结果。位点缺失、个体缺失、MAF 和 LD 相关参数会改变保留的数据。分析前应检查等位基因编码、样本 ID、倍性、染色体规则与版本文档；本机尚未执行示例。[官方文档](https://www.cog-genomics.org/plink/)。

## 植物案例与上下游
水稻根系研究使用 PLINK 从 SNP 数据中筛选符合指定缺失率、频率和 LD 条件的位点，再开展群体结构分析。[原始论文](https://doi.org/10.1371/journal.pgen.1007521)。上游是可靠基因型与元数据；下游可连接 PCA、ADMIXTURE 或关联检验。二倍体假设与植物多倍体输入兼容性需要具体核查，许可证和版本快照待复核。
