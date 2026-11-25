---
title: "Repetitive genomic regions and the inference of demographic history"
summary: "以美洲黑杨分析重复区域掩蔽对多类人口历史估计的影响。"
authors: "Patil AB, Vijay N"
year: 2021
journal: Heredity
doi: 10.1038/s41437-021-00443-8
type: application
methodIds: [psmc, smcpp]
domainIds: [population-genetics]
speciesIds: [populus-trichocarpa]
status: published
updatedAt: 2026-11-25
---
## 研究问题与材料范围
植物基因组普遍含有高比例重复序列，在群体历史动态（demographic history）推断中，重复区域掩蔽（repeat masking）策略会直接改变可调用位点密度与杂合度估计。Patil 与 Vijay（2021）以 **美洲黑杨（*Populus trichocarpa*）** 参考基因组为模型，系统评估不同重复序列掩蔽策略对多种主流群体历史推断方法的影响。

## 分析流程
1. **多梯度重复序列掩蔽**：针对美洲黑杨全基因组及不同重复序列类别（如 LTR、DNA 转座子、简单重复）设计多种掩蔽方案。
2. **多方法群体历史推断比较**：在相同数据掩蔽处理下分别运行 **PSMC**、MSMC、**SMC++** 以及基于位点频率谱（SFS）的 Stairway Plot。
3. **时间尺度偏差评估**：对比掩蔽前后远古时期与近期有效群体大小（$N_e$）估计曲线的偏移方向与幅度。

## 软件明细表格
| 软件 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **PSMC** | 单基因组成对序贯马尔可夫共祖推断 | 评估重复掩蔽对远古 $N_e$ 轨迹及可调用区间长度的敏感性 |
| **SMC++** | 结合多样本 SFS 与 LD 推断近期至远古 $N_e$ | 检验掩蔽策略对近期群体收缩/扩张信号估计的影响 |

## 主要科研发现
- 发现在美洲黑杨中**掩蔽重复区域后，远古时期 $N_e$ 估计值普遍降低，而近期 $N_e$ 估计值上升**，且不同重复类型与染色体分布会改变结果。
- 强调该研究旨在揭示数据可调用性与重复序列对群体历史推断的系统性影响，而非对软件进行优劣排名。

## 阅读与数据复现资源
- **原始论文**：[Heredity (2021)](https://doi.org/10.1038/s41437-021-00443-8) | [Nature 页面](https://www.nature.com/articles/s41437-021-00443-8)
- **PubMed**：[PMID: 34002046](https://pubmed.ncbi.nlm.nih.gov/34002046/)
- **相关站内资源**：[PSMC 方法页](../../methods/psmc/)、[SMC++ 方法页](../../methods/smcpp/)
- **数据复现**：分析脚本与掩蔽区间配置详见原文 Data/Code Availability 部分。
