---
title: "The Rise and Fall of African Rice Cultivation Revealed by Analysis of 246 New Genomes"
summary: "对 246 份非洲栽培稻及其野生祖先进行全基因组重测序，结合 PSMC、MSMC 与 SMC++ 等溯祖分析，揭示非洲稻在尼日尔河内陆三角洲的单一起源驯化历程及近期群体规模演变。"
authors: "Cubry P, Tranchant-Dubreuil C, Thuillet AC, et al."
year: 2018
journal: Current Biology
doi: 10.1016/j.cub.2018.05.066
type: application
methodIds: [psmc, msmc, smcpp]
domainIds: [population-genetics]
speciesIds: [rice]
status: published
updatedAt: 2026-11-25
---

## 研究问题与材料范围

与起源于亚洲的亚洲栽培稻（*Oryza sativa*）完全独立，非洲栽培稻（*Oryza glaberrima*）是人类在非洲大陆独立驯化的另一水稻栽培种。它由野生祖先短药野生稻（*Oryza barthii*）驯化而来，具有耐旱、耐贫瘠、耐铁毒及抗非洲特有病虫害的优良特性。

本研究对涵盖非洲西非至东非分布范围的 **246 份水稻种质** 开展了全基因组重测序（Illumina HiSeq 2500，双端 100/150 bp）：
- 包含 163 份非洲栽培稻地方品种（*O. glaberrima*）；
- 包含 83 份野生短药野生稻（*O. barthii*）；
- 原始测序数据已存入 ENA 项目 **PRJEB21312**（SRA study **ERP023549**）。研究系统解析了非洲稻的单一起源中心、历史演化瓶颈及关键驯化选择基因。

---

## 基因组学与生物信息学分析流程（依原文 STAR Methods）

依据原文 STAR Methods（pp. e3–e6）记录，分析流程严格配置如下：

1. **测序比对与参考坐标**：
   重测序读段经质控后，使用 **BWA (v0.7.4)** 的 `aln` 和 `sampe` 模块比对至亚洲栽培稻日本晴参考基因组（**Nipponbare IRGSP 1.0**），使用 Picard 标记并剔除 PCR 重复；
2. **群体变异检测与过滤**：
   使用 **GATK (v3.3) UnifiedGenotyper** 进行全群体 SNP 检测，执行严格位点质量与深度过滤，获得用于群体遗传分析的高质量全基因组变异集；
3. **群体遗传结构与地理空间模拟**：
   - 使用 R 语言程序包 **LEA** 进行群体结构分析，设置祖先成分数 $K = 2 \sim 6$ 评估遗传聚类；
   - 结合 **SPLATCHE2** 与近似贝叶斯计算（ABC），在包含高程与水网地理栅格上模拟非洲栽培稻从驯化中心的扩散动态；
4. **有效群体规模历史动态反演**：
   - 运行 **PSMC** 分析单基因组杂合位点，推断中更新世以来的长期历史群体波动；
   - 运行 **MSMC（v1.1.0 原生实现，设定 4 条单倍型）**，明确区分于 2020 年发表的两两边际共祖协议 MSMC2，推断短药野生稻与非洲栽培稻群体的早期分化与有效群体大小；
   - 运行 **SMC++** 结合未折叠位点频率谱（unfolded SFS）与连锁信息，精细重构距今 10,000 年至 2,000 年前随全新世气候波动的群体动态；
5. **选择清除扫描**：
   使用 **SweeD (v3.3.2)** 基于复合似然比（CLR）执行全基因组选择消除扫描，定位株型与落粒性相关候选基因。

---

## 软件在研究中的具体作用与证据出处

| 软件 | 论文版本与调用细节 | 论文中的具体任务与推论 | 原文位置 |
| :--- | :--- | :--- | :--- |
| **BWA** | v0.7.4 (`aln`/`sampe`) | 将 246 份重测序短读段比对至 Nipponbare IRGSP 1.0 参考基因组 | STAR Methods, p. e3 |
| **GATK** | v3.3 (UnifiedGenotyper) | 多样本 SNP 检测与过滤 | STAR Methods, p. e3 |
| **LEA** | R package ($K=2 \sim 6$) | 祖先成分推断与群体结构分析 | STAR Methods, p. e4 |
| **PSMC** | 原始实现 | 单样本杂合度反演深层有效群体规模历史 | STAR Methods, p. e4 |
| **MSMC** | v1.1.0 (4 条单倍型，非后续 MSMC2) | 模拟多单倍型共祖时间，分析野生祖先与栽培群体分歧；知识图谱关联 `msmc` | STAR Methods, pp. e4–e5 |
| **SMC++** | SMC++ 流水线 | 结合 SFS 与重组信息精细反演近期种群规模动态 | STAR Methods, p. e5 |
| **SPLATCHE2** | 空间模拟与 ABC 框架 | 模拟西非地理水网上的驯化向外扩散路径 | STAR Methods, pp. e5–e6 |
| **SweeD** | v3.3.2 (CLR) | 复合似然比全基因组选择清除扫描 | STAR Methods, p. e6 |

---

## 主要科研发现

1. **尼日尔河内陆三角洲单一起源**：
   基因组数据支持非洲栽培稻在距今约 3,000 年前起源于马里境内的尼日尔河内陆三角洲（Inland Niger Delta），随后沿水系扩散，排除了此前多中心独立驯化假说；
2. **气候变化与驯化瓶颈**：
   SMC++ 历史动态显示野生祖先短药野生稻在距今 10,000 年前随撒哈拉干旱化经历严重种群萎缩，随后的干旱驱动了定居先民对水稻的驯化选择；
3. **农艺基因的选择印记**：
   SweeD 扫描在非洲稻直立株型相关位点及落粒性相关基因区域检测到显著的驯化选择信号；
4. **历史晚期种植规模收缩**：
   种群动态结合历史记录证实，自 16 世纪亚洲水稻引入后，非洲水稻种植面积显著萎缩，提示对非洲特有地方品种遗传资源保护的紧迫性。

---

## 阅读与数据复现资源

- **期刊正式全文**：[Current Biology 28(14):2274–2282.e6 (2018), DOI: 10.1016/j.cub.2018.05.066](https://doi.org/10.1016/j.cub.2018.05.066)
- **PubMed 记录**：[PMID: 29983312](https://pubmed.ncbi.nlm.nih.gov/29983312/)
- **欧洲核苷酸档案库数据项目**：ENA Project **PRJEB21312**（SRA study **ERP023549**）
- **作者开源分析代码**：[Africrop/african_rice (GitHub)](https://github.com/Africrop/african_rice)
