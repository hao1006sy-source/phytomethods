---
title: "Dynamic chromatin accessibility deploys heterotypic cis/trans-acting factors driving stomatal cell-fate commitment"
summary: "研究气孔细胞命运决定过程中的动态染色质可及性与顺反调控因子。"
authors: "Kim ED, Dorrity MW, Fitzgerald BA, et al."
year: 2022
journal: Nature Plants
doi: 10.1038/s41477-022-01304-w
type: application
methodIds: [meme-suite]
domainIds: [regulatory-genomics-ai, epigenomics-3d-genome]
speciesIds: [arabidopsis]
status: published
updatedAt: 2026-11-25
---
## 研究问题与材料范围
气孔发育是研究植物细胞谱系重编程与命运决定的经典模型，涉及 *SPCH*、*MUTE*、*FAMA* 等 bHLH 主控转录因子的序贯调控。Kim 等（2022）以 **拟南芥气孔谱系不同发育阶段的特异荧光分选细胞** 为材料，开展染色质可及性测序（ATAC-seq）与转录组分析，揭示气孔细胞命运决定过程中顺式调控元件开放性与反式转录因子的协同部署机制。

## 分析流程
1. **气孔谱系分选与 ATAC-seq**：利用阶段特异启动子驱动的细胞核/原生质体分选技术（INTACT/FACS），获取气孔前体细胞至成熟保卫细胞的动态染色质可及性图谱。
2. **差异开放峰与 Motif 富集**：鉴定各发育阶段特异开放的染色质区域，使用 **MEME-Suite** 进行 *de novo* 基序发现与已知转录因子结合基序富集分析。
3. **顺反调控因子协同验证**：结合转录因子表达谱与遗传突变体实验，验证异源顺/反式调控因子组合如何逐步锁定气孔细胞命运。

## 软件明细表格
| 软件 / 方法 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **ATAC-seq 动态峰分析** | 刻画气孔谱系各阶段染色质开放重塑 | 揭示细胞命运转换伴随大量远端与启动子区顺式元件的阶段性开启 |
| **MEME-Suite** | 差异开放峰内的转录因子结合基序富集与发现 | 识别出与 bHLH 主控因子协同作用的异源辅助转录因子基序 |

## 主要科研发现
- 描绘了拟南芥气孔发育全过程的动态染色质可及性景观，证明染色质开放重塑与细胞命运锁定紧密偶联。
- 揭示了异源顺式调控元件与反式作用因子（heterotypic cis/trans-acting factors）协同驱动气孔分化的分子逻辑。

## 阅读与数据复现资源
- **原始论文**：[Nature Plants (2022)](https://doi.org/10.1038/s41477-022-01304-w)
- **相关站内资源**：[MEME-Suite 方法页](../../methods/meme-suite/)
- **数据复现**：原始 ATAC-seq 与 RNA-seq 数据详见原文 Data Availability 部分（NCBI GEO）。
