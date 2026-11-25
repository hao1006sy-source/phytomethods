---
title: "Genome sequence of mungbean and insights into evolution within Vigna species"
summary: "以绿豆及近缘豆属材料研究基因组重复信号与物种演化。"
authors: "Kang YJ, Kim SK, Kim MY, et al."
year: 2014
journal: Nature Communications
doi: 10.1038/ncomms6443
type: application
methodIds: []
domainIds: [comparative-genomics]
speciesIds: [mungbean]
status: published
updatedAt: 2026-11-25
---
## 研究问题与材料范围
绿豆（*Vigna radiata*）是重要的食用豆类作物，其所在的豇豆属（*Vigna*）包含二倍体栽培种、野生近缘种及异源四倍体物种。Kang 等（2014）构建了栽培绿豆参考基因组，并结合野生近缘材料及异源四倍体 *Vigna reflexo-pilosa* 的测序数据，系统解析豇豆属的基因组重复历史与物种分化。

## 分析流程
1. **绿豆参考基因组组装与注释**：整合短读段与长片段文库构建栽培绿豆基因组草图，完成基因预测与重复序列注释。
2. **同义替换率（$K_s$）分布分析**：提取旁系同源与直系同源基因对，计算 $K_s$ 分布以追溯豆科及豇豆属的全基因组加倍（WGD）与物种分化时间。
3. **异源四倍体亚基因组比较**：将 *Vigna reflexo-pilosa* 转录组/基因组数据与二倍体亲本谱系比对，解析亚基因组演化关系。

## 软件明细表格
| 方法 / 分析模块 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **基因组组装与注释** | 构建栽培绿豆（*Vigna radiata*）参考基因组 | 为豇豆属比较基因组学与分子育种提供基础参考序列 |
| **同源基因 $K_s$ 分布分析** | 量化基因重复与物种分歧的同义替换率峰值 | 揭示豆科共享古老 WGD 及异源四倍体 *V. reflexo-pilosa* 的杂交起源 |

## 主要科研发现
- 发布了栽培绿豆高质量参考基因组，并阐明了其与野生近缘种及异源四倍体 *V. reflexo-pilosa* 之间的演化与亚基因组关系。
- 明确 $K_s$ 峰值需结合具体比对与采样背景解读（不将后期发布的 `wgd` 等软件追溯归为本研究工具）。

## 阅读与数据复现资源
- **原始论文**：[Nature Communications (2014)](https://doi.org/10.1038/ncomms6443)
- **数据复现**：基因组组装与测序数据详见原文 Data Availability 部分（NCBI BioProject）。
