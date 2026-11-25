---
title: "Single-cell transcriptomics reveal how root tissues adapt to soil stress"
summary: "结合单细胞 RNA 测序与空间转录组研究水稻根对土壤环境的响应。"
authors: "Zhu M, Hsu CW, Peralta Ogorek LL, et al."
year: 2025
journal: Nature
doi: 10.1038/s41586-025-08941-z
type: application
methodIds: [sc-kb-copilot, doubletfinder]
domainIds: [single-cell-spatial-omics]
speciesIds: [rice]
status: published
updatedAt: 2026-11-25
---
## 研究问题与材料范围
土壤机械压实是限制水稻根系生长与养分吸收的重要非生物胁迫。Zhu 等（2025）以水稻 *Xkitaake* 为材料，比较根系在 **琼脂凝胶（gel）、非压实土（uncompacted soil）和压实土（compacted soil）** 三种物理环境下的细胞水平响应，结合 **scRNA-seq**（整合超过 **79,000 个高质量细胞**）与 **Molecular Cartography** 靶向空间转录组技术，揭示根系不同组织层应对土壤压实胁迫的特异机制。

## 分析流程
1. **单细胞质控与双细胞去除**：对不同土壤处理下的根系原生质体 scRNA-seq 数据进行过滤，使用 **DoubletFinder** 识别并剔除潜在双细胞，整合超过 79,000 个高质量单细胞。
2. **细胞类型注释与胁迫响应分析**：结合领域知识与标记基因（可与 **sc-kb-copilot** 等注释辅助流程对应）鉴定根尖各组织层，比较压实土与非压实土间的差异表达基因与细胞比例变化。
3. **靶向原位空间验证**：采用 Molecular Cartography 技术对关键 marker mRNA 进行原位杂交检测（注意：该空间实验为靶向原位成像，而非基于测序斑点的 `cell2location` 反卷积）。

## 软件明细表格
| 软件 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **DoubletFinder** | 单细胞转录组双细胞（doublet）检测与过滤 | 保障 >79,000 个整合细胞图谱的纯度，避免过渡态细胞被误判为双细胞 |
| **sc-kb-copilot** | 水稻根系单细胞类型知识库辅助注释 | 结合植物根系已知 marker 基因体系，准确锚定外层与内层组织细胞群 |

## 主要科研发现
- 发现水稻根系**外层细胞群**（如表皮、外皮层）对土壤物理压实与环境变化表现出最显著的转录组重编程响应。
- 原位杂交验证了关键胁迫响应基因在压实土根系中的空间分布变化，同时指出压实土样本的 RNA 原位信号受组织固定效率与细胞壁机械变化的影响，解释空间定量结果时需谨慎校正。

## 阅读与数据复现资源
- **原始论文**：[Nature (2025)](https://doi.org/10.1038/s41586-025-08941-z) | [PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC12176638/) | [Methods 与流程](https://backoffice.biblio.ugent.be/download/01JTFTDSPSTXD7PSHX8DN1MBRQ/01JYNVVT7JZFM02KA6CAWCKTRM)
- **数据复现**：原始单细胞与空间转录组数据详见原文 Data Availability 部分。
