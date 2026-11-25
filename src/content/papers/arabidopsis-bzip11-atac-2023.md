---
title: "Genome-wide identification of accessible chromatin regions by ATAC-seq upon induction of the transcription factor bZIP11 in Arabidopsis"
summary: "拟南芥叶原生质体中诱导 bZIP11，利用 ATAC-seq 描述染色质可及性变化。"
authors: "Hellens AM, Humphreys JL, Fichtner F, et al."
year: 2023
journal: Scientific Data
doi: 10.1038/s41597-023-02395-6
type: application
methodIds: []
domainIds: [epigenomics-3d-genome]
speciesIds: [arabidopsis]
status: published
updatedAt: 2026-11-25
---
## 研究问题与材料范围
bZIP11 是拟南芥中响应能量饥饿与蔗糖信号的关键转录因子，但其诱导表达后如何在全基因组水平快速重塑染色质可及性仍缺乏高质量基准数据。Hellens 等（2023）在 **拟南芥叶肉原生质体** 中利用地塞米松诱导 bZIP11 核定位系统，开展 **ATAC-seq** 测序，发布了高重复性的染色质可及性动态数据集。

## 分析流程
1. **原生质体诱导与 ATAC-seq 建库**：分离拟南芥叶肉原生质体并诱导 bZIP11 激活，设置对照与诱导处理组及生物学重复，进行 Tn5 转座酶建库测序。
2. **序列比对与峰检测（Peak Calling）**：将双端测序读段比对至拟南芥 TAIR10 参考基因组，过滤线粒体与叶绿体污染读段（植物叶肉原生质体 ATAC-seq 的关键质控步骤），随后进行开放染色质峰识别。
3. **技术质量评估**：统计 TSS 富集度、片段长度分布（核小体周期性）及重复间相关性（FRiP 与 PCA），验证数据集可复用性。

## 软件明细表格
| 方法 / 质控步骤 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **ATAC-seq 比对与细胞器过滤** | 去除叶绿体/线粒体高比例背景读段 | 保障拟南芥叶肉原生质体核染色质开放信号的高信噪比 |
| **Peak Calling 与重复性检验** | 鉴定 bZIP11 诱导前后的差异开放染色质峰 | 为解析 bZIP11 招募染色质重塑因子的顺式作用靶点提供基准数据 |

## 主要科研发现
- 提供了经过严格质控（含 TSS 富集与片段分布验证）的拟南芥叶原生质体 bZIP11 诱导 ATAC-seq 公开基准数据集。
- 揭示了 bZIP11 激活后在全基因组启动子及远端调控区引发的染色质可及性变化特征。

## 阅读与数据复现资源
- **原始论文**：[Scientific Data (2023)](https://doi.org/10.1038/s41597-023-02395-6)
- **数据复现**：原始 ATAC-seq 测序数据与峰文件详见原文 Data Records 部分（NCBI GEO / ENA）。
