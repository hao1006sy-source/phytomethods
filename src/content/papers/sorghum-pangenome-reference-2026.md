---
title: "A sorghum pangenome reference improves global crop trait discovery"
summary: "以 33 个基因组构建高粱泛基因组参考，并连接群体多样性与作物性状分析。"
authors: "Morris GP, Harder AM, Healey AL, et al."
year: 2026
journal: Nature 652:1245–1253
doi: 10.1038/s41586-026-10229-9
type: application
methodIds: [minigraph-cactus, vg, odgi]
domainIds: [pangenomics-structural-variation]
speciesIds: [sorghum]
status: published
updatedAt: 2026-11-25
---
## 研究问题与材料范围
高粱（*Sorghum bicolor*）是全球旱区重要的粮食与饲料作物，单一参考基因组难以捕捉其丰富的结构变异与地方品种多样性。Morris 等（2026）基于 **33 个高质量高粱基因组** 构建了高粱泛基因组参考图谱，并整合包含 **1,984 份栽培种与地方品种** 的多样性面板，系统解析泛基因组遗传变异与作物农艺性状发现。

## 分析流程
1. **染色体级泛基因组图构建**：以 BTx623 V5 为主参考基因组，按染色体使用 **Minigraph-Cactus v2.9.3** 构建泛基因组变异图。
2. **图合并、裁剪与路径检查**：使用 **vg v1.59.0** 合并与准备裁剪后的染色体图；利用 **ODGI v0.9.0** 检查不同基因组在图中的路径覆盖与表示情况，并结合 `sequenceTubeMap v0.1.0` 展示目标区域变异。
3. **关键位点等位变异筛选**：在 *dhurrin* 生物合成基因簇与 *SH1* 落粒性位点，结合 **vg** 与 `vcfwave` 筛选特定长度以上的等位变异并关联群体性状。

## 软件明细表格
| 软件 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **Minigraph-Cactus v2.9.3** | 以 BTx623 V5 为主参考构建 33 基因组泛基因组图 | 保留复杂结构变异与多基因组单倍型路径 |
| **vg v1.59.0** | 合并、裁剪染色体图并协同 `vcfwave` 提取等位变异 | 支持大规模多样性面板的图上基因分型与性状关联 |
| **ODGI v0.9.0** | 检查不同高粱基因组在图中的路径表示 | 独立于构图工具评估图路径覆盖完整度 |

## 主要科研发现
- 构建了覆盖 33 个高粱基因组的泛基因组参考，并在 1,984 份材料中揭示了 *dhurrin* 基因簇与 *SH1* 等关键农艺性状位点的泛基因组等位变异。
- 明确了 Minigraph-Cactus（构图）、vg（图操作与变异解析）与 ODGI（路径检查）在泛基因组图工程中的各自职责边界。

## 阅读与数据复现资源
- **原始论文**：[Nature (2026)](https://www.nature.com/articles/s41586-026-10229-9) | [PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC13128447/)
- **PubMed**：[PMID: 41813899](https://pubmed.ncbi.nlm.nih.gov/41813899/)
- **相关站内资源**：[Minigraph-Cactus 方法页](../../methods/minigraph-cactus/)、[vg 方法页](../../methods/vg/)、[ODGI 方法页](../../methods/odgi/)
- **数据复现**：泛基因组图文件与多样性面板数据详见原文 Data Availability 部分。
