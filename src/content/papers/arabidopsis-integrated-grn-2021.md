---
title: "Integrative inference of transcriptional networks in Arabidopsis yields novel ROS signalling regulators"
summary: "整合序列基序、开放染色质、转录因子结合和表达信息推断拟南芥调控网络。"
authors: "De Clercq I, Van de Velde J, Luo X, et al."
year: 2021
journal: Nature Plants
doi: 10.1038/s41477-021-00894-1
type: application
methodIds: []
domainIds: [regulatory-genomics-ai]
speciesIds: [arabidopsis]
status: published
updatedAt: 2026-11-25
---
## 研究问题与材料范围
单一组学数据（如仅依赖共表达或仅依赖 motif 扫描）在推断植物全基因组转录调控网络（GRN）时往往存在较高假阳性。De Clercq 等（2021）以 **拟南芥（*Arabidopsis thaliana*）** 为模式体系，整合多维度功能基因组证据构建高置信度整合基因调控网络（**iGRN**），并利用该网络发掘活性氧（ROS）胁迫响应的新型核心调控因子。

## 分析流程
1. **多源调控证据整合**：系统收集并对齐拟南芥转录因子结合基序（TF motifs）、开放染色质足迹（DNase-seq）、实验验证的 TF 结合峰（ChIP-seq / DAP-seq）以及大规模转录组共表达数据。
2. **监督学习网络推断（iGRN）**：将多维特征输入监督学习框架，训练并预测全基因组范围的"转录因子—靶基因"有向调控边。
3. **功能验证与 ROS 调控因子发掘**：基于 iGRN 网络拓扑结构与已知 ROS 基因集富集分析，筛选候选调控因子并通过突变体/过表达表型实验验证其对 ROS 稳态的调控功能。

## 软件明细表格
| 方法 / 数据层 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **开放染色质与 Motif 足迹** | 过滤非活跃染色质区的假阳性顺式基序 | 大幅压缩全基因组 motif 搜索空间，提升调控边精确度 |
| **iGRN 监督学习整合** | 融合 ChIP-seq、足迹与表达相关性构建有向网络 | 显著优于单一证据网络，成功预测并实验验证多个未知 ROS 调控因子 |

## 主要科研发现
- 构建了覆盖拟南芥全基因组的高精度整合转录调控网络 **iGRN**，在基准测试中显著提升了转录因子靶基因预测的召回率与精确度。
- 从网络中成功预测并实验验证了多个此前未知的活性氧（ROS）信号转导关键转录因子。

## 阅读与数据复现资源
- **原始论文**：[Nature Plants (2021)](https://doi.org/10.1038/s41477-021-00894-1)
- **数据复现**：iGRN 网络文件与分析代码详见原文 Data/Code Availability 部分。
