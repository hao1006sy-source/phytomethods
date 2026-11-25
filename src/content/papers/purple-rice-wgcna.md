---
title: "Transcriptome analysis of the coexpression network of genes related to antioxidant characteristics after grain filling in purple rice"
summary: "对紫米不同灌浆时期的籽粒转录组与生理指标进行动态追踪，利用 WGCNA 有符号共表达网络高精度鉴定花青素积累核心调控模块与主效 MYB 枢纽基因。"
authors: "Sun H, Wang Y, Chen L, et al."
year: 2024
journal: Scientific Reports
doi: 10.1038/s41598-024-73698-w
type: application
methodIds: [wgcna]
domainIds: [regulatory-genomics-ai]
speciesIds: [rice]
status: published
updatedAt: 2026-11-25
---

## 研究问题与材料范围

紫米（特种有色水稻，*Oryza sativa* L.）富含花青素（Anthocyanins）、原花青素、黄酮类化合物及酚酸类抗氧化次生代谢物，具有极高的营养健康与抗氧化药用价值。在水稻灌浆期（Grain Filling Stage），籽粒果皮中的花青素经历剧烈的生物合成与转运积累过程，其分子调控机制受复杂的转录网络精密调控。

本研究选取了特种紫米品种 **“滇紫粳”**（Dianzi 1 号）以及同胚乳对照普通白米品种作为试验材料：
- 在开花后第 7 天（灌浆初期）、第 14 天（灌浆中期）、第 21 天（灌浆盛期）以及第 28 天（成熟期）系统采集新鲜发育籽粒；
- 每个时期包含 3 个严格的生物学重复，共计 24 个转录组测序文库（Illumina NovaSeq 6000，PE150，各样本平均产出 6.5 Gb 高质干净数据）；
- 同步生理测定籽粒总花青素含量（TAC）、超氧化物歧化酶（SOD）活性、DPPH 自由基清除率等抗氧化生理量化表型。

---

## 基因组学与生物信息学分析流程

1. **测序质控与参考对齐**：
   使用 fastp 进行低质量碱基切除与接头清洗；使用 **HISAT2 (v2.2.1)** 将干净 reads 比对到水稻标准参考基因组（Nipponbare IRGSP-1.0），平均比对率达到 95.3%；
2. **基因表达定量与方差稳定化**：
   使用 StringTie (v2.1.4) 提取原始读段计数；在 R 环境下调用 **DESeq2 (v1.38.0)** 执行基因表达归一化，通过 `vst()`（Variance Stabilizing Transformation）消除泊松抽样异方差性，生成样本间表达连续方差稳定矩阵；
3. **加权共表达网络构建 (WGCNA)**：
   - 筛选在至少 6 个样本中表达量 $\text{TPM} > 1$ 且方差排名前 25% 的高变基因（约 12,500 个基因）输入 **WGCNA (v1.72)**；
   - 依据无标度拓扑拟合准则（Scale-Free Topology Criterion, $R^2 \ge 0.85$），选定最优软阈值幂指数 $\beta = 12$；
   - 严格采用**有符号网络模式（Signed Network）**与有符号拓扑重叠矩阵（Signed TOM），确保仅将正向协同表达的基因划入同一模块；
   - 设定最小模块基因数 `minModuleSize = 30`，利用动态树剪枝（Dynamic Tree Cut）算法并合并相似度 $>0.75$ 的高度关联模块；
4. **模块-表型关联与核心 Hub 基因锁定**：
   通过奇异值分解（SVD）提取各模块第一主成分（PC1）作为模块特征基因（Module Eigengene, ME），计算 ME 与花青素生理指标的 Pearson 相关性；
   计算基因在模块内的成员度（$k_{\text{ME}}$），结合 Cytoscape 绘制核心调控拓扑网络。

---

## 软件在研究中的具体作用

| 软件 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **HISAT2 (v2.2.1)** | 将灌浆期多时间点转录组双端短读段比对至水稻 IRGSP-1.0 参考基因组 | 准确处理植物内含子可变剪接，获得高质量单拷贝与多拷贝定位 |
| **DESeq2 (v1.38.0)** | 原始计数标准化、差异表达检验与 `vst` 方差稳定化变换 | 输出消除文库大小偏倚的连续表达矩阵，为 WGCNA 提供合规输入 |
| **WGCNA (v1.72)** | 构建加权有符号共表达网络，识别发育模块并执行模块-性状关联分析 | 发现与总花青素含量极显著相关的核心 Brown 模块（*r* = 0.92, *P* < 0.001） |
| **Cytoscape (v3.9.1)** | 导入 Brown 模块拓扑重叠矩阵高权重连接边并渲染网络 | 可视化呈现类黄酮合成酶与转录因子围绕核心 Hub 基因的星型辐射调控结构 |

---

## 主要科研发现与农艺性状突破

1. **锁定花青素特异关联主效模块**：
   WGCNA 最终划分出 14 个基因共表达模块，其中 **Brown 模块（包含 1,142 个基因）** 与紫米籽粒总花青素含量（TAC）和 DPPH 自由基清除能力呈现极强的正协同相关（*r* = 0.92, *P* = 2.4e-10），而在普通白米中该模块表达量处于完全基线关闭状态；
2. **类黄酮合成通路全酶谱的转录共激活**：
   Brown 模块高度富集了类黄酮/花青素合成通路的全部结构基因，包括查尔酮合酶（*CHS*）、查尔酮异构酶（*CHI*）、黄烷酮 3-羟化酶（*F3H*）、二氢黄酮醇 4-还原酶（*DFR*）以及花青素合酶（*ANS*），证明紫米抗氧化特性的形成是整套生化通路的同步级联激活；
3. **鉴定主效转录调控枢纽基因 (Hub Genes)**：
   依据模块内连通度（$k_{\text{ME}} > 0.85$）与基因表型显著性（$\text{GS} > 0.80$），鉴定了两个核心 R2R3-MYB 家族转录因子（*OsMYB3*、*OsC1*）和一个 bHLH 转录因子（*OsbHLH148*）位于网络最高层级节点，qRT-PCR 实验进一步证实其在灌浆盛期表达量与花青素积累高度平行，为高抗氧化功能性水稻分子设计育种提供了直接的优选基因靶点。

---

## 阅读与数据复现资源

- **期刊全文**：[Scientific Reports, 14, 23412 (2024)](https://doi.org/10.1038/s41598-024-73698-w)
- **PubMed 记录**：[PMID: 39375372](https://pubmed.ncbi.nlm.nih.gov/39375372/)
- **原始测序数据存取号**：NCBI SRA **PRJNA1078235**（包含全部 24 个转录组测序文库的原始 FASTQ 数据）
- **基因表达矩阵归档**：NCBI Gene Expression Omnibus **GSE256190**
