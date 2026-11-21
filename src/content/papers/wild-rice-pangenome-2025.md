---
title: "A pangenome reference of wild and cultivated rice"
summary: "整合野生稻与栽培稻的多组装、基因家族矩阵和图泛基因组，展示群体采样与表示层级对结果的影响。"
authors: "Guo D, Li Y, Lu H, Zhao Y, Kurata N, Wei X, Wang A, Wang Y, Zhan Q, et al."
year: 2025
journal: Nature
doi: 10.1038/s41586-025-08883-6
type: application
methodIds: [hifiasm, yahs, syri, minigraph, minigraph-cactus, vg, mummer4, minimap2]
domainIds: [pangenomics-structural-variation]
speciesIds: [rice]
status: draft
updatedAt: 2026-11-21
---

## 研究问题与样本集合

Guo 等构建野生稻（*Oryza rufipogon*）与栽培稻（*O. sativa*）的高质量泛基因组资源，研究野生材料的基因和结构变异多样性，并分析栽培稻的演化关系。论文从既有群体中选择 149 份材料；叶绿体序列复核后，将其中 3 份材料归为 *O. longistaminata*、1 份归为 *O. meridionalis* 外群。主要稻属泛基因组由 129 份 *O. rufipogon* 和 16 份 *O. sativa* 构成。正文的不同分析使用不同子集，不能将样本量互换。

## 测序、组装与染色体级锚定

研究对 133 份材料进行 PacBio HiFi 测序，对另外 16 份材料进行 Oxford Nanopore Technologies（ONT）测序。HiFi 材料使用 Hifiasm v0.16.0 默认参数组装，生成 primary contigs（p-contigs）和 alternate contigs（a-contigs）；ONT 数据中 7 份使用 NECAT，其余 9 份使用 NextDenovo，后续以长读段和 Illumina 短读段抛光。全体材料先用 ALLMAPS 结合遗传或共线性信息锚定至伪染色体；另有 30 份代表材料具有 Hi-C 数据，作者用 Chromap 比对、YaHS v1.1 挂载，并用 JuiceBox Assembly Tools 人工检查和优化。

作者报告平均 contig N50 为 14.95 Mb、BUSCO 完整度为 98.55%、LTR Assembly Index（LAI）为 24.13；按测序平台分组的组装 QV 均值为 HiFi 57.92、ONT 24.55。它们是本研究数据和流程的结果，不是其他物种的默认验收阈值。a-contigs 保留了未进入主组装的杂合等位序列信息；该设计使后续基因集合不限于 p-contigs 的单一主路径。

## 基因家族泛基因组与序列图分别回答的问题

### 基因家族层面

作者使用全对全 CDS 比对建立 16 份栽培稻与 129 份野生稻的基因集合，并以至少 95% 序列一致性及至少 50% 覆盖度作为论文中的基因存在判据。合并 145 份材料后共报告 69,531 个 pan-genes，其中 28,907 个为所有材料均检测到的核心基因，5,181 个为单一材料的 private genes，13,728 个被定义为野生稻特异基因。三种标签分别依据全样本频率或物种分组定义，不能互作同义词。

### 序列图层面

论文的基因家族矩阵使用 145 份材料；图泛基因组则用 Minigraph-Cactus 构建，栽培稻图使用 15 份材料、野生稻图使用 129 份材料、合并图使用 144 份材料。流程先由 Minigraph v0.19-r551 建立含结构变异的初始图，再将组装映射回图并用 Cactus v2.2.1 生成最终图。作者把不在参考序列中的图节点总长度报告为 3.87 Gb。该值是节点序列总长指标，不等同于新增基因数或去冗余新序列长度。

论文还将短读段映射至合并图，以 vg Giraffe v1.43.0 执行图上比对，再用 DeepVariant v1.6.1 及 GLnexus v1.4.1 汇总变异调用；这一步纳入 142 份本研究材料及另一研究的 407 份材料。图构建、图上比对和群体变异调用是相连但不同的分析阶段。

## 主要发现及解释边界

野生稻和栽培稻之间存在广泛的基因、结构变异与转座元件差异；作者报告野生稻中抗性基因类似物的多样性较高，并提出其稻属系统发育和基因流证据支持亚洲栽培稻初始驯化的单一起源模型。这些结论来自论文所选材料、基因注释、家族定义、图表示和群体分析，应按对应分析集合解释。尤其是“野生稻特异”基因需结合样本覆盖、注释一致性及家族分类阈值判断，不能仅由数据库中未检出推断为生物学上的绝对缺失。

## 本知识库中的方法关联

| 工具 | 论文中的具体任务 |
| --- | --- |
| Hifiasm v0.16.0 | 组装 133 份 HiFi 材料，生成 p-contigs 与 a-contigs |
| YaHS v1.1 | 将 Hi-C 联系用于 30 份代表材料的染色体级 scaffold |
| MUMmer v4.0.0beta2 | 过滤候选细胞器 contig；用 `nucmer` 比较 Nipponbare 与四个代表材料的基因组共线性；将组装 contig 比对参考，经 `delta-filter` 和 `show-snps` 完成组装比对变异识别 |
| minimap2 v2.21-r1071 | 作为长读段比对步骤的比对器，为 Longshot SNP calling 及 PAV 分析流程提供比对结果；论文方法未给出该流程的 preset |
| SyRI v1.4 | 比较 Hi-C 与 ALLMAPS 染色体组装并识别结构差异 |
| Minigraph v0.19-r551 与 Cactus v2.2.1（Minigraph-Cactus 流程） | 先建立含结构变异的初始图，再进行碱基级比对及整理；分别用于栽培、野生和合并材料的图构建 |
| vg Giraffe v1.43.0 | 将短读段映射到合并图，为后续变异调用提供比对 |

## 数据、代码与延伸阅读

- [PubMed 书目记录](https://pubmed.ncbi.nlm.nih.gov/40240605/)
- [PMC 全文与方法](https://pmc.ncbi.nlm.nih.gov/articles/PMC12176639/)
- [DOI](https://doi.org/10.1038/s41586-025-08883-6)
- 测序数据：ENA BioProject [PRJEB73710](https://www.ebi.ac.uk/ena/browser/view/PRJEB73710)
- 组装、注释、VCF 与图文件：[Figshare 数据集](https://doi.org/10.25452/figshare.plus.25697817)及 [RicePandb](http://ricepandb.ncgr.ac.cn)
- 分析代码：[Wild-rice-Pangenome-Project](https://github.com/dongling-hub/Wild-rice-Pangenome-Project)；归档版本：[Zenodo 10.5281/zenodo.14881729](https://doi.org/10.5281/zenodo.14881729)

本研究可与[泛基因组概念专题](../../topics/pangenomics-structural-variation/m03-topic-01/)、[PAV 专题](../../topics/pangenomics-structural-variation/m03-topic-04/)及[图泛基因组构建专题](../../topics/pangenomics-structural-variation/m03-topic-05/)共同阅读。跨样本基因集合、单样本主/替代组装和全序列图是不同的数据对象；在复现时应记录材料 ID、测序平台、组装版本和进入各分析的样本子集。
