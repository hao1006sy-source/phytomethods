---
title: "Positive selection driving diversification in plant secondary metabolism"
summary: "结合拟南芥 MAM 基因簇的演化分析与酶功能实验研究代谢多样化。"
authors: "Benderoth M, Textor S, Windsor AJ, et al."
year: 2006
journal: Proceedings of the National Academy of Sciences
doi: 10.1073/pnas.0601738103
type: application
methodIds: [paml]
domainIds: [comparative-genomics]
speciesIds: [arabidopsis]
status: published
updatedAt: 2026-11-25
---
## 研究问题与材料范围
植物次生代谢物（如十字花科特有的硫代葡萄糖苷）在抗虫防御中发挥关键作用，其结构多样性往往由基因重复与新功能化驱动。Benderoth 等（2006）以 **拟南芥（*Arabidopsis thaliana*）及其近缘种的甲基硫烷基苹果酸合酶（*MAM*）基因簇** 为研究对象，结合密码子水平的分子演化检验与异源表达酶活测定，揭示正选择如何驱动植物次生代谢酶的功能分化。

## 分析流程
1. ***MAM* 基因簇序列收集与比对**：克隆并收集拟南芥及近缘十字花科物种的 *MAM1*、*MAM2*、*MAM3* 同源序列，构建密码子水平的多序列比对与系统发育树。
2. **Branch-Site 正选择检验**：使用 **PAML 3.14** 中的 `codeml` 程序，比较 **M1a（近中性）空模型** 与 **branch-site Model A（正选择备择模型）**，通过似然比检验（LRT）识别在特定演化分支上经历正选择的氨基酸位点。
3. **体外酶活功能验证**：在大肠杆菌中异源表达重组 MAM 蛋白及定点突变体，测定其对不同链长底物的催化活性，将统计正选择位点与酶学功能转变直接关联。

## 软件明细表格
| 软件 / 方法 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **PAML 3.14 (`codeml`)** | 运行 M1a vs branch-site Model A 检验 $\omega = d_N/d_S > 1$ | 在 *MAM* 基因重复后的特定分支上检出显著正选择信号及关键受选择位点 |
| **异源表达酶活测定** | 验证受选择氨基酸位点对底物特异性的影响 | 为统计学正选择信号提供了直接的生化功能因果证据 |

## 主要科研发现
- 证明 *MAM* 基因家族在基因重复后经历了强烈的**达尔文正选择**，驱动了硫代葡萄糖苷碳链延伸酶底物特异性的分化。
- 示范了"PAML 密码子正选择统计检验 + 体外生化酶活实验"相结合的植物次生代谢演化研究范式。

## 阅读与数据复现资源
- **原始论文**：[PNAS (2006)](https://doi.org/10.1073/pnas.0601738103) | [PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC1482576/)
- **相关站内资源**：[PAML 方法页](../../methods/paml/)
- **数据复现**：基因序列与比对信息详见原文及 GenBank 存取号。
