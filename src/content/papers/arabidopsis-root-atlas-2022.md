---
title: "A single-cell Arabidopsis root atlas reveals developmental trajectories in wild-type and cell identity mutants"
summary: "整合 110,427 个拟南芥根细胞表达谱，分析细胞类型和发育轨迹。"
authors: "Shahan R, Hsu CW, Nolan TM, et al."
year: 2022
journal: Developmental Cell
doi: 10.1016/j.devcel.2022.01.008
type: application
methodIds: []
domainIds: [single-cell-spatial-omics]
speciesIds: [arabidopsis]
status: published
updatedAt: 2026-11-25
---
## 研究问题与材料范围
整合跨实验室、跨批次的单细胞数据集是构建高精度器官参考图谱的关键。Shahan 等（2022）整合了 **110,427 个拟南芥根细胞** 的单细胞转录组表达谱，覆盖根尖所有主要细胞类型及发育阶段，并纳入经典细胞身份突变体 *shortroot*（*shr*）与 *scarecrow*（*scr*），系统解析根系细胞命运决定的发育轨迹。

## 分析流程
1. **大规模单细胞图谱整合与注释**：综合已知细胞类型 marker 基因、分选细胞参考表达谱（bulk RNA-seq）及计算空间映射，对 110,427 个细胞进行精细注释（注意：三维位置推断基于参考几何映射，属于计算空间定位而非原位测量）。
2. **发育轨迹与最优传输推断**：联合使用拟时序（pseudotime）分析与最优传输方法 **StationaryOT**，重构根尖分生组织向成熟细胞类型分化的连续命运流向。
3. **细胞身份突变体比较**：将 *shr* 与 *scr* 突变体单细胞投影至野生型参考图谱，定量检测皮层/内皮层谱系分化受阻与细胞身份转变。

## 软件明细表格
| 方法 / 分析模块 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **跨数据集整合与参考映射** | 整合 110,427 个根细胞并完成发育阶段注释 | 建立了拟南芥根系最全面的单细胞参考图谱基准 |
| **StationaryOT** | 基于最优传输理论推断细胞分化轨迹 | 在稳态更新的根尖组织中准确捕捉分叉命运概率 |

## 主要科研发现
- 构建了包含 **110,427 个细胞** 的拟南芥根单细胞参考图谱，揭示了各组织层从干细胞微环境到成熟区的连续转录状态转换。
- 精细刻画了 *shortroot* 与 *scarecrow* 突变体中内皮层/皮层细胞身份缺失的单细胞水平轨迹偏离。

## 阅读与数据复现资源
- **原始论文**：[Developmental Cell (2022)](https://doi.org/10.1016/j.devcel.2022.01.008) | [PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC9014886/)
- **PubMed**：[PMID: 35134336](https://pubmed.ncbi.nlm.nih.gov/35134336/)
- **数据复现**：整合图谱对象与原始数据详见原文 Data Availability 部分（NCBI GEO）。
