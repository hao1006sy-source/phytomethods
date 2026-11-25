---
title: "Establishment of single-cell transcriptional states during seed germination"
summary: "比较拟南芥胚胎完整组织、原生质体和单细胞制备中的转录状态。"
authors: "Liew LC, You Y, Auroux L, et al."
year: 2024
journal: Nature Plants
doi: 10.1038/s41477-024-01771-3
type: application
methodIds: []
domainIds: [single-cell-spatial-omics]
speciesIds: [arabidopsis]
status: published
updatedAt: 2026-11-25
---
## 研究问题与材料范围
植物单细胞转录组测序通常依赖酶解制备原生质体（protoplasting），但细胞壁消化过程本身会诱导强烈的创伤与应激转录反应，可能掩盖真实的发育生物学信号。Liew 等（2024）以 **拟南芥萌发胚胎（seed germination）** 为材料，系统比较 **完整胚胎组织 RNA-seq、原生质体 bulk RNA-seq 与单细胞 scRNA-seq** 三种制备方式下的转录状态，定量评估原生质体解离效应。

## 分析流程
1. **三类样本平行转录组测序**：在种子萌发关键时间点同步采集完整胚胎、酶解原生质体及单细胞悬液，进行转录组测序与基因定量。
2. **原生质体诱导应激基因识别**：对比完整组织与原生质体样本的差异表达基因，构建"原生质体解离响应基因集"。
3. **单细胞图谱去混淆建模**：在 scRNA-seq 降维聚类与细胞状态注释中评估解离应激信号对细胞分群的影响，并将其与真实胚胎发育状态分离建模。

## 软件明细表格
| 方法 / 分析模块 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **组织 vs 原生质体差异表达** | 量化酶解制备引入的转录组系统性偏差 | 明确区分原生质体创伤伪影与真实种子萌发发育信号 |
| **单细胞状态解耦建模** | 在 scRNA-seq 中校正或标记解离应激效应 | 避免将原生质体高应激细胞误判为独立的胚胎发育亚群 |

## 主要科研发现
- 证实酶解制备原生质体会在拟南芥萌发胚胎中诱发显著的转录重编程，该效应在单细胞数据分析中必须与真实生物学处理效应分开建模与解释。
- 为植物单细胞转录组实验设计（如采用单细胞核测序 snRNA-seq 或计算去混淆）提供了重要的方法学警示。

## 阅读与数据复现资源
- **原始论文**：[Nature Plants (2024)](https://doi.org/10.1038/s41477-024-01771-3)
- **数据复现**：原始 RNA-seq 与 scRNA-seq 数据详见原文 Data Availability 部分。
