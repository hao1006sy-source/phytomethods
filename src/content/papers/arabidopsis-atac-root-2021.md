---
title: "The regulatory landscape of Arabidopsis thaliana roots at single-cell resolution"
summary: "单细胞 ATAC-seq 揭示拟南芥根细胞类型的染色质可及性差异。"
authors: "Dorrity MW, Alexandre CM, Hamm MO, et al."
year: 2021
journal: Nature Communications
doi: 10.1038/s41467-021-23675-y
type: application
methodIds: []
domainIds: [single-cell-spatial-omics]
speciesIds: [arabidopsis]
status: published
updatedAt: 2026-11-25
---
## 研究问题与材料范围
单细胞染色质可及性图谱能够直接揭示顺式调控元件在植物细胞命运决定中的动态变化。Dorrity 等（2021）对模式植物 **拟南芥（*Arabidopsis thaliana*）根系** 开展单细胞转座酶可及染色质测序（scATAC-seq），并与独立测得的根系 scRNA-seq 数据进行跨模态整合，解析不同根细胞类型及发育阶段的染色质开放景观与转录因子调控基序。

## 分析流程
1. **scATAC-seq 质控与降维聚类**：基于核小体信号、TSS 富集度过滤低质量细胞核，构建特征峰矩阵并进行降维聚类，锚定根系主要细胞类型。
2. **细胞类型特异开放峰与 Motif 富集**：鉴定各细胞群特异的差异开放染色质区域（DARs），扫描富集的转录因子结合基序（TF motifs）。
3. **跨模态整合分析**：将 scATAC-seq 基因活性评分与独立 scRNA-seq 表达图谱映射至共享细胞身份空间（注意：两种模态为独立实验测得，非同细胞配对 multiome）。

## 软件明细表格
| 方法 / 分析模块 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **scATAC-seq 峰矩阵与聚类** | 拟南芥根单细胞染色质开放图谱构建 | 清晰区分表皮、皮层、内皮层与维管束等根系细胞类型 |
| **TF Motif 富集与跨模态整合** | 预测细胞类型特异转录因子调控逻辑 | 将顺式调控元件开放性与独立 scRNA-seq 转录因子表达关联 |

## 主要科研发现
- 构建了单细胞分辨率的拟南芥根系染色质可及性图谱，揭示细胞类型分化过程中顺式调控元件的动态重塑。
- 发现核内复制（endoreduplication）等发育状态伴随显著的染色质开放度与调控基序活性变化。

## 阅读与数据复现资源
- **原始论文**：[Nature Communications (2021)](https://doi.org/10.1038/s41467-021-23675-y) | [PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC8184767/)
- **数据复现**：原始 scATAC-seq 数据详见原文 Data Availability 部分（NCBI GEO）。
