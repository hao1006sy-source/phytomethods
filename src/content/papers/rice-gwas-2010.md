---
title: "Genome-wide association studies of 14 agronomic traits in rice landraces"
summary: "利用水稻地方品种的基因组变异分析多个农艺性状。"
authors: "Huang X, Wei X, Sang T, et al."
year: 2010
journal: Nature Genetics
doi: 10.1038/ng.695
type: application
methodIds: []
domainIds: [gwas-breeding]
speciesIds: [rice]
status: published
updatedAt: 2026-11-25
---
## 研究问题与材料范围
水稻（*Oryza sativa*）地方品种蕴含丰富的农艺性状遗传多样性，但传统双亲本 QTL 作图受限于重组事件数量与亲本多态性。Huang 等（2010）收集了 **517 份中国水稻地方品种**（包括 373 份 *indica* 籼稻和 131 份 *japonica* 粳稻等），开展低深度全基因组重测序（平均深度约 1×）与基于隐马尔可夫模型（HMM）的基因型填充，在群体水平对 **14 个重要农艺性状**（分蘖数、株高、抽穗期、粒型、直链淀粉含量等）进行全基因组关联分析（GWAS）。

## 分析流程
1. **浅层重测序与变异检测**：利用 Illumina GAIIx 对 517 份地方品种进行约 1× 测序，比对至日本晴（Nipponbare）参考基因组（IRGSP 4.0），鉴定出约 **360 万个 SNP**。
2. **基因型填充与群体结构**：利用自研 HMM 算法对低深度测序产生的缺失基因型进行填充（准确率 >98%），并结合主成分分析（PCA）评估 *indica* 与 *japonica* 亚种间的群体分层。
3. **全基因组关联分析（GWAS）**：在 *indica* 亚群（373 份）及全群体中分别使用 **EMMAX**（压缩混合线性模型）与 **TASSEL**（MLM + Q + K），控制群体结构（Q）和亲缘关系矩阵（K），以 $P < 1 \times 10^{-7}$ 为全基因组显著阈值定位关联位点。

## 软件明细表格
| 软件 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **Ssaha2 / BWA** | 短读段比对至 Nipponbare 参考基因组 | 在 1× 浅层测序下稳定锚定约 3.6M 高置信度 SNP 位点 |
| **自研 HMM 填充工具** | 低深度重测序基因型缺失填充 | 将稀疏测序矩阵补全为高密度单倍型图谱，大幅降低单样本测序成本 |
| **EMMAX / TASSEL** | 混合线性模型（MLM）GWAS 关联检验 | 有效校正 *indica*/*japonica* 亚种分层导致的假阳性，检出 38 个显著位点 |

## 主要科研发现
- 在 14 个农艺性状中鉴定出 **38 个全基因组显著关联位点**，平均可解释相应性状 **36% 的表型变异**。
- 成功精确定位并验证了多个已知关键基因（如控制粒宽的 *GW5*、控制直链淀粉含量的 *Wx*、控制株高的 *sd1* 等）及多个新的候选基因区域，确立了"低深度重测序 + 基因型填充 + GWAS"在植物复杂性状遗传解析中的经典范式。

## 阅读与数据复现资源
- **原始论文**：[Nature Genetics (2010)](https://doi.org/10.1038/ng.695)
- **PubMed**：[PMID: 20972439](https://pubmed.ncbi.nlm.nih.gov/20972439/)
- **数据复现**：原始重测序数据已存放在 NCBI SRA（`SRA023116`），单倍型与 GWAS 结果发布于 RiceHapMap 数据库。
