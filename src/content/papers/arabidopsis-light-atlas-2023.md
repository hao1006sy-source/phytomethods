---
title: "Time series single-cell transcriptional atlases reveal cell fate differentiation driven by light in Arabidopsis seedlings"
summary: "以拟南芥光诱导时间序列单细胞图谱分析地上部和根的细胞类型响应。"
authors: "Han X, Zhang Y, Lou Z, et al."
year: 2023
journal: Nature Plants
doi: 10.1038/s41477-023-01544-4
type: application
methodIds: []
domainIds: [single-cell-spatial-omics]
speciesIds: [arabidopsis]
status: published
updatedAt: 2026-11-25
---
## 研究问题与材料范围
光信号是驱动植物幼苗去黄化（de-etiolation）与器官细胞命运分化的核心环境因子。Han 等（2023）对 **暗生（etiolated）、去黄化过程（时间序列）和光生（light-grown）拟南芥幼苗** 的地上部（shoot）与根系（root）分别开展单细胞 RNA 测序（scRNA-seq），构建了包含 **92,861 个有效细胞**、注释 **48 个细胞簇** 的光响应时空单细胞转录组图谱。

## 分析流程
1. **时间序列 scRNA-seq 数据整合**：采集暗培养及照光后多个真实时间点（time series）的地上部与根系原生质体样本，完成质控、批次校正与降维聚类，鉴定 48 个细胞簇。
2. **细胞命运轨迹与光响应解析**：结合真实采样时间点与细胞状态变化，对比光信号在地上部（如叶肉、表皮、气孔谱系）与根系不同细胞类型中诱导的差异表达程序。
3. **关键光调控因子验证**：筛选细胞类型特异的光响应转录因子，通过遗传突变体分析验证其在光形态建成中的功能。

## 软件明细表格
| 方法 / 分析模块 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **多时间点 scRNA-seq 聚类** | 整合 92,861 个有效细胞并划分 48 个细胞簇 | 全面覆盖暗生向光生转变过程中的地上部与地下部细胞类型 |
| **时空轨迹与差异表达分析** | 追踪真实采样时间点下的细胞状态分化 | 区分真实时间动态与模型拟时序排序，揭示器官特异的光信号响应路径 |

## 主要科研发现
- 构建了涵盖 92,861 个单细胞、48 个细胞簇的拟南芥光诱导时间序列单细胞图谱。
- 揭示了光信号在地上部与根系不同细胞类型中高度特异的转录重编程与细胞分化驱动机制。

## 阅读与数据复现资源
- **原始论文**：[Nature Plants (2023)](https://doi.org/10.1038/s41477-023-01544-4)
- **数据复现**：原始 scRNA-seq 数据详见原文 Data Availability 部分（NCBI GEO）。
