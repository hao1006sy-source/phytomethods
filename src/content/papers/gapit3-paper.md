---
title: "GAPIT Version 3: Boosting Power and Accuracy for Genomic Association and Prediction"
summary: "集成了混合线性模型（MLM）、FarmCPU、BLINK 及多亲缘基因组预测算法的全基因组关联分析与基因组选择综合 R 平台。"
authors: "Wang J, Zhang Z"
year: 2021
journal: Genomics Proteomics Bioinformatics
doi: 10.1016/j.gpb.2021.08.005
type: method
methodIds: [gapit]
domainIds: [gwas-breeding]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

# GAPIT Version 3: Boosting Power and Accuracy for Genomic Association and Prediction

## 1. 研究背景与算法贡献

全基因组关联分析（Genome-Wide Association Study, GWAS）与全基因组预测/基因组选择（Genomic Prediction / Genomic Selection, GS）是现代植物功能基因组学与分子设计育种的两个核心支柱。随着测序成本持续下降，育种群体中的单核苷酸多态性（SNP）标记密度从早期的数万个急剧攀升至数百万乃至上千万个。在此背景下，经典的数量遗传学计算工具面临两大严峻挑战：
1. **多重共线性与传统模型假阴性**：经典的一元混合线性模型（MLM）在引入全基因组亲缘矩阵（Kinship）控制假阳性的同时，不可避免地会过度惩罚与群体结构平行的真实因果基因，导致统计功效严重下降（假阴性过高）；
2. **超大规模高密度标记计算耗时不可承受**：随着群体样本量扩展至数千个个体、标记数达到数百万，传统基于矩阵重复求逆的 MLM 算法计算复杂度呈三次幂爆炸（$O(M \cdot N^3)$）。

华盛顿州立大学的 Jiadong Wang 与 Zhiwu Zhang（张志武）在 2021 年推出了 **GAPIT 3**（Genomic Association and Prediction Integrated Tool Version 3，发表于 *Genomics, Proteomics & Bioinformatics*）。GAPIT 3 打造了集数据质控、前沿关联分析、多组学基因组预测与全自动图形可视化于一体的综合计算平台。其核心学术贡献在于系统集成了团队多年来创新的多项高精度核心算法（如压缩混合模型 CMLM、多位点迭代模型 FarmCPU、基于贝叶斯信息准则的超快 BLINK 算法），以及多样化的基因组选择模型（gBLUP、cBLUP、sBLUP），成为动植物数量遗传学研究中应用最广泛的标准工具之一。

---

## 2. 核心数学模型与数据结构

### 2.1 经典混合线性模型（$Q+K$ MLM）与压缩模型（CMLM）

GAPIT 原生支持经典的混合线性模型：
$$y = X\alpha + P\beta + Zu + e$$

其中：
- $X\alpha$ 为候选待测 SNP 标记的固定加性效应；
- $P\beta$ 为通过主成分分析（PCA）或结构分析提取的前几个主成分，用于控制大尺度群体分化；
- $u \sim \mathcal{N}(0, 2K\sigma_a^2)$ 为多基因背景随机效应，$K$ 为基于全基因组标记计算的亲缘关系矩阵（Kinship）；
- **压缩混合线性模型（Compressed MLM, CMLM）**：GAPIT 创新性地根据亲缘相似性将 $N$ 个个体聚类压缩为 $G$ 个类群（$G \ll N$），在群组水平上估计随机效应方差组分，将计算效率提升数倍的同时显著提高统计检验功效。

### 2.2 FarmCPU 迭代混合模型（固定效应与随机效应交替优化）

为彻底解决亲缘矩阵过度拟合导致的假阴性问题，GAPIT 3 原生集成了 **FarmCPU（Fixed and random model Circulating Probability Unification）** 算法：
- **固定效应模型（Fixed Effect Model, FEM）**：依次扫描每个测试标记，同时将一组预选的关联伴随标记（Pseudo-QTNs）作为协变量纳入模型，控制多基因背景；
- **随机效应模型（Random Effect Model, REM）**：利用 FEM 中显著性最高的标记集合重新定义亲缘关系矩阵，估计方差组分；
- **交替迭代**：固定模型与随机模型反复交替迭代，直至伪 QTN 集合完全收敛。由于测试标记与亲缘矩阵解耦，既严格消除了假阳性，又完全释放了因果位点的统计检验功效。

### 2.3 BLINK 极限提速算法（Bayesian Information and Linkage Disequilibrium Iteratively Nested Keyway）

针对千万级标记的大规模 GWAS，GAPIT 3 引入了 **BLINK** 算法：
- 彻底摒弃了计算开销极大的全基因组亲缘矩阵（Kinship Matrix）；
- 直接在多位点固定效应模型中，基于连锁不平衡（LD）矩阵筛选独立候选位点；
- 使用**贝叶斯信息准则（Bayesian Information Criterion, BIC）** 快速评估多标记组合的最优子集，将整个 GWAS 算法的计算复杂度降低至严格线性的 $O(M)$，扫描提速上千倍。

---

## 4. 植物基因组学应用场景与科研价值

植物多样性群体具有强烈的地理分布亚群与繁育历史近亲背景：
- **主粮作物重要农艺性状 QTN 精细定位**：例如水稻粒型、千粒重、分蘖角度、稻瘟病抗性；玉米株高、穗位高、籽粒淀粉含量；大豆花期与蛋白质含量。FarmCPU 与 BLINK 能够精准定位紧邻功能基因核心外显子或启动子区域的单碱基 QTN；
- **植物复杂性状候选基因挖掘与等位变异效应解析**：GAPIT 自动提取各显著标记的等位基因效应值（Effect Size），直观呈现优势等位基因在群体中的表型增益；
- **分子标记辅助育种与基因组选择**：利用预测模块评估不同品系的育种潜力，加速优良杂交组合的早期筛选。

---

## 6. 阅读与复现资源

- **原始研究论文**：[Genomics, Proteomics & Bioinformatics 2021 DOI: 10.1016/j.gpb.2021.08.005](https://doi.org/10.1016/j.gpb.2021.08.005)
- **PubMed 记录**：[PMID: 34182103](https://pubmed.ncbi.nlm.nih.gov/34182103/)
- **张志武实验室官方门户**：[ZZLab GAPIT Official Page](https://zzlab.net/GAPIT/)
- **GAPIT 源码仓库与使用指南**：[jiabowang/GAPIT3 GitHub](https://github.com/jiabowang/GAPIT3)
- **站内配套专题**：[全基因组关联分析（GWAS）原理与质控](../../topics/gwas-breeding/m06-topic-01/)
- **站内配套专题**：[多位点 GWAS 模型与统计功效](../../topics/gwas-breeding/m06-topic-02/)
