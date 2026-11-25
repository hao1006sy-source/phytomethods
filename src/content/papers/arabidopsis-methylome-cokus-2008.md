---
title: "Shotgun bisulphite sequencing of the Arabidopsis genome reveals DNA methylation patterning"
summary: "全基因组亚硫酸氢盐测序揭示拟南芥 DNA 甲基化的序列背景与分布。"
authors: "Cokus SJ, Feng S, Zhang X, et al."
year: 2008
journal: Nature
doi: 10.1038/nature06745
type: application
methodIds: []
domainIds: [epigenomics-3d-genome]
speciesIds: [arabidopsis]
status: published
updatedAt: 2026-11-25
---
## 研究问题与材料范围
在全基因组单碱基分辨率下精确测定 DNA 胞嘧啶甲基化（5mC），是表观遗传学研究的基础。Cokus 等（2008）首次将高通量鸟枪法亚硫酸氢盐测序（**BS-seq**）应用于 **拟南芥（*Arabidopsis thaliana*）** 野生型及甲基化通路突变体（如 *met1*、*drm1 drm2 cmt3* 等），在全基因组水平揭示了植物 CG、CHG 和 CHH 三种序列背景的 DNA 甲基化精确分布规律。

## 分析流程
1. **亚硫酸氢盐转化与高通量测序**：对拟南芥基因组 DNA 进行亚硫酸氢钠处理（将未甲基化胞嘧啶转化为尿嘧啶），构建测序文库并开展 Illumina 高通量测序。
2. **亚硫酸氢盐读段比对（BS-mapping）**：开发专用概率比对算法处理 C-to-T 转化导致的序列不对称性，将短读段精确定位至拟南芥参考基因组。
3. **单碱基甲基化水平定量与周期性分析**：分别统计 **CG、CHG 和 CHH** 上下文的胞嘧啶甲基化比例，并分析核小体尺度下的甲基化空间周期性。

## 软件明细表格
| 方法 / 分析模块 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **BS-seq 概率比对算法** | 将亚硫酸氢盐转化读段比对至参考基因组 | 克服 C→T 简并性，实现植物全基因组单碱基分辨率甲基化测序 |
| **序列上下文（CG/CHG/CHH）统计** | 定量不同序列背景与突变体中的 5mC 分布 | 揭示 CG 甲基化主要位于基因体与重复序列，CHG/CHH 富集于转座子区 |

## 主要科研发现
- 建立了植物全基因组单碱基分辨率 **BS-seq** 技术与分析范式（为后续 Bismark 等标准工具奠定了算法需求基础）。
- 发现拟南芥 CHH 甲基化在局部呈现约 **10 bp 的空间周期性**，提示 DNA 甲基转移酶与核小体缠绕结构之间的空间互作。

## 阅读与数据复现资源
- **原始论文**：[Nature (2008)](https://doi.org/10.1038/nature06745)
- **数据复现**：原始 BS-seq 测序数据已存放在 NCBI GEO（详见原文 Data Availability 部分）。
