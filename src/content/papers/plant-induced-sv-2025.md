---
title: "A simple method to efficiently generate structural variation in plants"
summary: "在拟南芥中评估依托泊苷诱导遗传结构变异，并以长读长测序和遗传分析验证候选事件。"
authors: "Bechen LL, Ahsan N, Bahrainwala A, Gehring M, Satyaki PRV"
year: 2025
journal: "PLoS Genetics 21(12):e1011977"
doi: 10.1371/journal.pgen.1011977
type: application
methodIds: [cutesv]
domainIds: [pangenomics-structural-variation]
speciesIds: [arabidopsis]
status: published
updatedAt: 2026-11-25
---
## 研究问题与材料范围
化学诱变剂通常主要诱导点突变，如何高效在植物中诱导可遗传的结构变异（SV）仍缺乏简便方法。Bechen 等（2025）以 **拟南芥（*Arabidopsis thaliana*）** 为材料，评估拓扑异构酶 II 抑制剂 **依托泊苷（etoposide）** 处理诱导可遗传结构变异的效率，并结合 Nanopore 长读长测序与遗传实验验证致因 SV。

## 分析流程
1. **Nanopore 长读长测序与比对**：对依托泊苷处理后的表型突变体、无表型同系材料及对照进行 Nanopore 测序，将长读段比对至 **Col-CEN v1.2** 参考基因组。
2. **结构变异检测与过滤**：使用 **cuteSV** 检测候选结构变异，并依据对照样本、重复出现率与测序质量条件进行严格过滤，最终锁定 **12 个候选 SV**（7 个缺失、2 个插入、2 个倒位、1 个易位）。
3. **PCR 与遗传实验验证**：对关键候选 SV 进行 PCR 扩增验证、基因表达测定及互补杂交遗传分析。

## 软件明细表格
| 软件 / 方法 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **cuteSV** | 基于 Nanopore 比对信号检测候选 SV | 从长读段中检出缺失、插入、倒位与易位等 12 个高置信度候选事件 |
| **PCR 与互补杂交实验** | 验证候选 SV 真实性与表型因果关系 | 确认 1.52 Mb 倒位（矮化）与 *IMMUTANS* 37 bp 移码缺失（斑叶）的致因作用 |

## 主要科研发现
- 证明依托泊苷处理可在拟南芥中高效诱导可遗传的多种类型结构变异（包括大片段倒位与外显子缺失）。
- 明确了软件检测与因果验证的边界：cuteSV 负责从比对信号识别候选，生物学因果解释来自对照、PCR、表达与互补杂交实验。

## 阅读与数据复现资源
- **原始论文**：[PLOS Genetics (2025)](https://journals.plos.org/plosgenetics/article?id=10.1371/journal.pgen.1011977) | [DOI](https://doi.org/10.1371/journal.pgen.1011977)
- **相关站内资源**：[cuteSV 方法页](../../methods/cutesv/)
- **数据复现**：Nanopore 长读段数据已存放在 NCBI GEO（[`GSE284456`](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE284456)）。
