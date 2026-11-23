/**
 * PhytoMethods 植物应用论文与算法真实使用证据登记表 (Verified Application Methods Registry)
 * 严格基于论文原文、Methods/STAR Methods 章节、补充材料及官方分析流程核实
 * 遵循原则：
 * 1. 每一条记录均对应真实的论文与算法使用证据，绝不因标题关键词或单纯引用推断
 * 2. 区分算法实际使用 (uses_method) 与性能基准评测 (evaluates_method)、算法扩展 (extends_method)
 * 3. 详细记录分析任务、原文章节、软件版本（若有明确记录）与直接可追溯的文献来源
 */

import type { VerificationStatus } from './graph-types.ts';

export interface VerifiedApplicationMethod {
  paperId: string;
  methodId: string;
  relation: 'uses_method';
  sourceUrl: string;
  doi?: string;
  sourceSection?: string;
  softwareVersion?: string;
  analysisPurpose: string;
  evidenceSummary: string;
  verificationStatus: VerificationStatus;
  sourceType: 'paper';
  verifiedAt: string;
}

export const verifiedApplicationMethods: VerifiedApplicationMethod[] = [
  // 1. african-rice-246-genomes -> psmc
  {
    paperId: 'african-rice-246-genomes',
    methodId: 'psmc',
    relation: 'uses_method',
    doi: '10.1016/j.cub.2018.05.066',
    sourceUrl: 'https://doi.org/10.1016/j.cub.2018.05.066',
    sourceSection: 'STAR Methods - Demographic History Inference',
    analysisPurpose: '基于 16 条单倍型构建 8 个伪二倍体，分别拟合 PSMC 模型推断非洲栽培稻与野生祖先深层历史有效群体大小变化。',
    evidenceSummary: 'Cubry 等 (Current Biology 2018) 在 STAR Methods 详细说明使用 PSMC 针对自交背景下的伪二倍体进行有效群体规模动态拟合。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 2. african-rice-246-genomes -> smcpp
  {
    paperId: 'african-rice-246-genomes',
    methodId: 'smcpp',
    relation: 'uses_method',
    doi: '10.1016/j.cub.2018.05.066',
    sourceUrl: 'https://doi.org/10.1016/j.cub.2018.05.066',
    sourceSection: 'STAR Methods - SMC++ Analysis',
    analysisPurpose: '利用 79 个伪二倍体与 5 条独立谱系，结合位点频率谱与连锁信息联合推断非洲水稻近期人口历史与瓶颈事件。',
    evidenceSummary: 'Cubry 等 (2018) 采用 SMC++ 拟合 25 个样条结点的样条曲线，以每代 6.5e-9 突变率重构栽培稻近一万年以来的群体骤降。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 3. angiosperm-phylogenomics-2024 -> iqtree2
  {
    paperId: 'angiosperm-phylogenomics-2024',
    methodId: 'iqtree2',
    relation: 'uses_method',
    doi: '10.1038/s41586-024-07324-0',
    sourceUrl: 'https://doi.org/10.1038/s41586-024-07324-0',
    sourceSection: 'Methods - Gene Tree Reconstruction and Branch Length Estimation',
    softwareVersion: 'IQ-TREE 2',
    analysisPurpose: '为 Angiosperms353 靶向捕获数据集推断单基因树，并基于最大似然法开展枝长估计。',
    evidenceSummary: 'Zuntini 等 (Nature 2024) 在 Methods 说明使用 IQ-TREE 2 对 353 个核基因位点开展基因树构建与模型选择，作为 ASTRAL 汇总物种树输入。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 4. arabidopsis-69-pangenome -> edta
  {
    paperId: 'arabidopsis-69-pangenome',
    methodId: 'edta',
    relation: 'uses_method',
    doi: '10.1038/s41588-024-01715-9',
    sourceUrl: 'https://doi.org/10.1038/s41588-024-01715-9',
    sourceSection: 'Methods - Transposable Element Annotation',
    softwareVersion: 'EDTA v2.0.0',
    analysisPurpose: '对 69 个拟南芥高质量基因组开展从头转座元件结构注释，构建非冗余 pan-TE 数据库。',
    evidenceSummary: 'Lian 等 (Nature Genetics 2024) 在各组装中标准化运行 EDTA 注释反转录转座子与 DNA 转座子，分析全球生态型 TE 动态。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 5. arabidopsis-69-pangenome -> hifiasm
  {
    paperId: 'arabidopsis-69-pangenome',
    methodId: 'hifiasm',
    relation: 'uses_method',
    doi: '10.1038/s41588-024-01715-9',
    sourceUrl: 'https://doi.org/10.1038/s41588-024-01715-9',
    sourceSection: 'Methods - Genome Assembly and Scaffolding',
    softwareVersion: 'Hifiasm v0.16.1',
    analysisPurpose: '对 48 份 PacBio HiFi 测序材料进行高质量从头组装，生成 primary 与 alternate contig 图。',
    evidenceSummary: 'Lian 等 (2024) 将 Hifiasm 作为三种初始组装方案之一，经评估与去冗余后通过 quickmerge 产生染色体级组装。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 6. arabidopsis-69-pangenome -> interproscan
  {
    paperId: 'arabidopsis-69-pangenome',
    methodId: 'interproscan',
    relation: 'uses_method',
    doi: '10.1038/s41588-024-01715-9',
    sourceUrl: 'https://doi.org/10.1038/s41588-024-01715-9',
    sourceSection: 'Methods - Functional Annotation of Predicted Proteins',
    softwareVersion: 'InterProScan 5.52-86.0',
    analysisPurpose: '对泛基因组中预测的全部蛋白质序列进行结构域匹配、Pfam 家族比对与 GO 注释。',
    evidenceSummary: 'Lian 等 (2024) 使用 InterProScan 为 69 份生态型的预测蛋白提供标准化结构域与功能签名注释。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 7. arabidopsis-69-pangenome -> merqury
  {
    paperId: 'arabidopsis-69-pangenome',
    methodId: 'merqury',
    relation: 'uses_method',
    doi: '10.1038/s41588-024-01715-9',
    sourceUrl: 'https://doi.org/10.1038/s41588-024-01715-9',
    sourceSection: 'Methods - Quality Evaluation and QV Estimation',
    softwareVersion: 'Merqury v1.3',
    analysisPurpose: '利用短读段 k-mer 频谱独立评估各生态型从头组装的单碱基共识质量值 (QV) 与 k-mer 完整度。',
    evidenceSummary: 'Lian 等 (2024) 运行 Merqury 验证组装精度，报告生态型组装平均 QV 大于 50。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 8. arabidopsis-69-pangenome -> orthofinder
  {
    paperId: 'arabidopsis-69-pangenome',
    methodId: 'orthofinder',
    relation: 'uses_method',
    doi: '10.1038/s41588-024-01715-9',
    sourceUrl: 'https://doi.org/10.1038/s41588-024-01715-9',
    sourceSection: 'Methods - Orthogroup Inference and Gene Pangenome',
    softwareVersion: 'OrthoFinder v2.5.4',
    analysisPurpose: '对 69 份拟南芥基因组的全部蛋白编码基因进行跨材料同源聚类，构建 pan-gene 矩阵。',
    evidenceSummary: 'Lian 等 (2024) 使用 OrthoFinder 进行大规模直系同源群划分，并进一步手工检查拆分/合并异质性。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 9. arabidopsis-69-pangenome -> syri
  {
    paperId: 'arabidopsis-69-pangenome',
    methodId: 'syri',
    relation: 'uses_method',
    doi: '10.1038/s41588-024-01715-9',
    sourceUrl: 'https://doi.org/10.1038/s41588-024-01715-9',
    sourceSection: 'Methods - Structural Variation Detection from Whole-Genome Alignments',
    softwareVersion: 'SyRI v1.5',
    analysisPurpose: '基于 minimap2 全基因组共线性比对，系统鉴定生态型间倒位、易位、重复和复杂重排变异。',
    evidenceSummary: 'Lian 等 (2024) 运行 SyRI 识别染色体级重排，并结合 SURVIVOR 合并跨生态型结构变异多态性。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 10. arabidopsis-adaptation -> edta
  {
    paperId: 'arabidopsis-adaptation',
    methodId: 'edta',
    relation: 'uses_method',
    doi: '10.1038/s41467-023-42029-4',
    sourceUrl: 'https://doi.org/10.1038/s41467-023-42029-4',
    sourceSection: 'Methods - Repeat Annotation in 32 Arabidopsis Ecotypes',
    softwareVersion: 'EDTA',
    analysisPurpose: '对 32 份生态型基因组开展转座元件自动化结构注释并构建泛转座元件库。',
    evidenceSummary: 'Kang 等 (Nature Communications 2023) 使用 EDTA 注释不同生境拟南芥转座子分布，分析与环境气候因子关联。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 11. arabidopsis-adaptation -> hifiasm
  {
    paperId: 'arabidopsis-adaptation',
    methodId: 'hifiasm',
    relation: 'uses_method',
    doi: '10.1038/s41467-023-42029-4',
    sourceUrl: 'https://doi.org/10.1038/s41467-023-42029-4',
    sourceSection: 'Methods - De novo Assembly with PacBio HiFi',
    softwareVersion: 'Hifiasm v0.18',
    analysisPurpose: '以 -l0 参数组装 32 份拟南芥生态型 HiFi reads，输出 primary contig 进入参考引导挂载。',
    evidenceSummary: 'Kang 等 (2023) 采用 Hifiasm v0.18 组装生成平均 contig N50 为 5.91–20.3 Mb 的高质量单倍型 contig。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 12. arabidopsis-adaptation -> minigraph
  {
    paperId: 'arabidopsis-adaptation',
    methodId: 'minigraph',
    relation: 'uses_method',
    doi: '10.1038/s41467-023-42029-4',
    sourceUrl: 'https://doi.org/10.1038/s41467-023-42029-4',
    sourceSection: 'Methods - Graph Pangenome Construction',
    softwareVersion: 'Minigraph v0.19',
    analysisPurpose: '以 Col-PEK T2T 为骨架，迭代整合 31 份生态型组装构建参考引导的泛基因组变异图。',
    evidenceSummary: 'Kang 等 (2023) 使用 Minigraph 构建结构变异图，表征拟南芥群体大片段插入缺失拓扑结构。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 13. arabidopsis-adaptation -> orthofinder
  {
    paperId: 'arabidopsis-adaptation',
    methodId: 'orthofinder',
    relation: 'uses_method',
    doi: '10.1038/s41467-023-42029-4',
    sourceUrl: 'https://doi.org/10.1038/s41467-023-42029-4',
    sourceSection: 'Methods - Orthologous Group Clustering',
    analysisPurpose: '使用 Markov 聚类方法聚类 887,723 个预测基因，获得 31,318 个基因家族并划分核心与可变基因。',
    evidenceSummary: 'Kang 等 (2023) 使用 OrthoFinder 建立泛基因组矩阵，发现可变基因家族显著富集于逆境适应与次生代谢途径。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 14. arabidopsis-adaptation -> vg
  {
    paperId: 'arabidopsis-adaptation',
    methodId: 'vg',
    relation: 'uses_method',
    doi: '10.1038/s41467-023-42029-4',
    sourceUrl: 'https://doi.org/10.1038/s41467-023-42029-4',
    sourceSection: 'Methods - Read Mapping and Genotyping on Graphs',
    softwareVersion: 'vg',
    analysisPurpose: '将群体短读段测序映射至构建的变异图，开展结构变异群体基因型分型。',
    evidenceSummary: 'Kang 等 (2023) 采用 vg 工具套件进行图索引与读段比对分型，解析结构变异与环境气候指标关联。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 15. arabidopsis-heat-hic-2020 -> hicexplorer
  {
    paperId: 'arabidopsis-heat-hic-2020',
    methodId: 'hicexplorer',
    relation: 'uses_method',
    doi: '10.1038/s41467-020-15809-5',
    sourceUrl: 'https://doi.org/10.1038/s41467-020-15809-5',
    sourceSection: 'Methods - Hi-C Data Processing and Contact Matrix Normalization',
    softwareVersion: 'HiCExplorer',
    analysisPurpose: '将 Hi-C contact maps 转换格式并使用 hicNormalize、hicCorrectMatrix 与 hicTransform 校正交互矩阵与展示互作距离衰减。',
    evidenceSummary: 'Sun 等 (Nature Communications 2020) 在处理拟南芥热胁迫染色质互作重排时，明确采用 HiCExplorer 工具套件进行接触矩阵转换与标准化。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 16. arabidopsis-stomata-accessibility-2022 -> meme-suite
  {
    paperId: 'arabidopsis-stomata-accessibility-2022',
    methodId: 'meme-suite',
    relation: 'uses_method',
    doi: '10.1038/s41477-022-01304-w',
    sourceUrl: 'https://doi.org/10.1038/s41477-022-01304-w',
    sourceSection: 'Methods - Motif Enrichment and Discovery in ACRs',
    softwareVersion: 'MEME Suite (AME)',
    analysisPurpose: '在气孔细胞系动态开放染色质区域 (ACRs) 中扫描富集的转录因子结合基序 (如 BBR/BPC 与 bHLH E-box)。',
    evidenceSummary: 'Kim 等 (Nature Plants 2022) 采用 MEME Suite (包括 AME) 对 ATAC-seq 可及性峰进行顺式作用元件富集分析，揭示气孔命运决定的协同调控网络。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 17. cycas-evolution -> orthofinder
  {
    paperId: 'cycas-evolution',
    methodId: 'orthofinder',
    relation: 'uses_method',
    doi: '10.1038/s41477-022-01129-7',
    sourceUrl: 'https://doi.org/10.1038/s41477-022-01129-7',
    sourceSection: 'Methods - Comparative Genomics and Gene Family Clustering',
    softwareVersion: 'OrthoFinder',
    analysisPurpose: '将攀枝花苏铁与代表性种子植物、裸子植物及被子植物的蛋白质序列进行同源聚类，提取直系同源基因。',
    evidenceSummary: 'Liu 等 (Nature Plants 2022) 使用 OrthoFinder 构建全基因组直系同源基因集，支撑种子植物早期演化与 WGD 历史重构。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 18. macadamia-mcscanx -> mcscanx
  {
    paperId: 'macadamia-mcscanx',
    methodId: 'mcscanx',
    relation: 'uses_method',
    doi: '10.1002/pld3.364',
    sourceUrl: 'https://doi.org/10.1002/pld3.364',
    sourceSection: 'Methods - Synteny and Gene Duplication Analysis',
    softwareVersion: 'MCScanX',
    analysisPurpose: '基于 all-versus-all BLASTP 输出与 GFF 基因注释，运行 duplicate_gene_classifier 识别全基因组复制、串联与分散重复基因。',
    evidenceSummary: 'Sharma 等 (Plant Direct 2021) 运用 MCScanX 分类濒危植物 Macadamia jansenii 基因组内部的共线性片段与复制基因模式。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 19. macadamia -> hifiasm
  {
    paperId: 'macadamia',
    methodId: 'hifiasm',
    relation: 'uses_method',
    doi: '10.1111/tpj.15583',
    sourceUrl: 'https://doi.org/10.1111/tpj.15583',
    sourceSection: 'Methods - PacBio HiFi Assembly',
    softwareVersion: 'Hifiasm',
    analysisPurpose: '以默认参数与内置重复清理算法直接组装 28× PacBio HiFi 长读段，生成染色体级连续单倍型组装 (contig N50 46.1 Mb)。',
    evidenceSummary: 'Sharma 等 (The Plant Journal 2022) 使用 Hifiasm 组装澳洲坚果 Macadamia jansenii，14 条染色体中有 8 条仅由单个大型 contig 覆盖。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 20. maize-zeas-adaptation -> admixture
  {
    paperId: 'maize-zeas-adaptation',
    methodId: 'admixture',
    relation: 'uses_method',
    doi: '10.1186/s12870-022-03427-w',
    sourceUrl: 'https://doi.org/10.1186/s12870-022-03427-w',
    sourceSection: 'Methods - Population Structure and Admixture Analysis',
    softwareVersion: 'ADMIXTURE',
    analysisPurpose: '基于全基因组 SNP 标记对 982 份玉米自交系和 190 份 teosinte 材料进行祖先成分推断与遗传结构建模。',
    evidenceSummary: 'Xu 等 (BMC Plant Biology 2022) 采用 ADMIXTURE 评估玉米驯化与改良过程中不同生态亚群的基因流与祖先成分演化。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 21. maize-zeas-adaptation -> xpclr
  {
    paperId: 'maize-zeas-adaptation',
    methodId: 'xpclr',
    relation: 'uses_method',
    doi: '10.1186/s12870-022-03427-w',
    sourceUrl: 'https://doi.org/10.1186/s12870-022-03427-w',
    sourceSection: 'Methods - Cross-Population Likelihood Ratio Scanning',
    softwareVersion: 'XP-CLR',
    analysisPurpose: '设置 100 kb 窗口与 10 kb 步长，跨群体扫描 teosinte 与玉米、热带与温带玉米之间的选择清除信号。',
    evidenceSummary: 'Xu 等 (2022) 使用 XP-CLR 结合 Fst 联合筛选驯化与局部气候适应的特征区间，定位与开花期调控相关的候选基因。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 22. mango-annotation -> braker3
  {
    paperId: 'mango-annotation',
    methodId: 'braker3',
    relation: 'uses_method',
    doi: '10.1002/tpg2.20441',
    sourceUrl: 'https://doi.org/10.1002/tpg2.20441',
    sourceSection: 'Methods - Gene Structure Prediction Pipeline',
    softwareVersion: 'BRAKER3 v3.0.3',
    analysisPurpose: '结合叶与花组织 RNA-seq 比对信息与同源蛋白比对证据，全自动训练 GeneMark-ETP 与 AUGUSTUS 完成芒果染色体级组装基因模型预测。',
    evidenceSummary: 'Wijesundara 等 (The Plant Genome 2024) 明确在长读长芒果组装中采用 BRAKER3 执行结构注释并输出高质量蛋白编码模型。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 23. mango-annotation -> interproscan
  {
    paperId: 'mango-annotation',
    methodId: 'interproscan',
    relation: 'uses_method',
    doi: '10.1002/tpg2.20441',
    sourceUrl: 'https://doi.org/10.1002/tpg2.20441',
    sourceSection: 'Methods - Functional Annotation and Domain Mapping',
    softwareVersion: 'InterProScan',
    analysisPurpose: '对 BRAKER3 预测的芒果全套蛋白质序列执行结构域与保守功能位点扫描，分配 GO 术语与功能分类。',
    evidenceSummary: 'Wijesundara 等 (2024) 采用 InterProScan 对芒果基因组蛋白集合进行标准化功能注释。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 24. plant-induced-sv-2025 -> cutesv
  {
    paperId: 'plant-induced-sv-2025',
    methodId: 'cutesv',
    relation: 'uses_method',
    doi: '10.1371/journal.pgen.1011977',
    sourceUrl: 'https://doi.org/10.1371/journal.pgen.1011977',
    sourceSection: 'Methods - Structural Variant Calling from Long Reads',
    softwareVersion: 'cuteSV',
    analysisPurpose: '对依托泊苷处理引发的突变材料 Nanopore 长读长测序比对结果调用插入、缺失、倒位与复杂染色体易位。',
    evidenceSummary: 'Bechen 等 (PLoS Genetics 2025) 使用 cuteSV 在拟南芥中检测长读长 SV，成功识别出矮化材料中 1.52 Mb 的染色体倒位与外显子移码缺失。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 25. plant-wgd-timing-2017 -> paml
  {
    paperId: 'plant-wgd-timing-2017',
    methodId: 'paml',
    relation: 'uses_method',
    doi: '10.1098/rspb.2017.0912',
    sourceUrl: 'https://doi.org/10.1098/rspb.2017.0912',
    sourceSection: 'Methods - Bayesian Molecular Clock Dating',
    softwareVersion: 'PAML (MCMCTree)',
    analysisPurpose: '在 35 项化石记录校准与固定系统发育拓扑下，利用 MCMCTree 正态近似算法估计被子植物古全基因组复制 (WGD) 绝对分化地质年代。',
    evidenceSummary: 'Clark & Donoghue (Proc. R. Soc. B 2017) 使用 PAML MCMCTree 分子钟程序约束种子植物与被子植物演化史中 zeta 与 epsilon WGD 事件的发生窗口。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 26. populus-euphratica-demography -> psmc
  {
    paperId: 'populus-euphratica-demography',
    methodId: 'psmc',
    relation: 'uses_method',
    doi: '10.1093/jxb/eraa172',
    sourceUrl: 'https://doi.org/10.1093/jxb/eraa172',
    sourceSection: 'Materials and Methods - Demographic History Reconstruction',
    softwareVersion: 'PSMC',
    analysisPurpose: '基于高质量单全基因组杂合位点分布，模拟胡杨西北中国 4 个地理亚群从更新世至今的有效群体规模波动曲线。',
    evidenceSummary: 'Jia 等 (Journal of Experimental Botany 2020) 采用 PSMC 成功描绘胡杨各支系在冰期与间冰期的瓶颈与扩张动态。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 27. populus-repeats-demography -> psmc
  {
    paperId: 'populus-repeats-demography',
    methodId: 'psmc',
    relation: 'uses_method',
    doi: '10.1038/s41437-021-00443-8',
    sourceUrl: 'https://doi.org/10.1038/s41437-021-00443-8',
    sourceSection: 'Materials and Methods - Demographic Inference with Masking Schemes',
    softwareVersion: 'PSMC',
    analysisPurpose: '在美洲黑杨全基因组上应用不同重复序列掩蔽策略，实证评估重复区对 PSMC 历史有效群体大小推断曲线的系统性偏移效应。',
    evidenceSummary: 'Patil & Vijay (Heredity 2021) 运行 PSMC 分析美洲黑杨杂合序列，揭示屏蔽重复序列使远古 Ne 降低而近期 Ne 估计上升。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 28. populus-repeats-demography -> smcpp
  {
    paperId: 'populus-repeats-demography',
    methodId: 'smcpp',
    relation: 'uses_method',
    doi: '10.1038/s41437-021-00443-8',
    sourceUrl: 'https://doi.org/10.1038/s41437-021-00443-8',
    sourceSection: 'Materials and Methods - Multi-Sample Demographic Analysis',
    softwareVersion: 'SMC++',
    analysisPurpose: '利用多重顺序马尔可夫模型测试不同可比对性与重复掩蔽过滤等级下美洲黑杨近期有效群体大小推断的鲁棒性。',
    evidenceSummary: 'Patil & Vijay (2021) 在美洲黑杨重测序数据中实际运行 SMC++ 流程，系统比较位点频率谱与连锁共祖模型在重复区干扰下的响应。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 29. purple-rice-wgcna -> wgcna
  {
    paperId: 'purple-rice-wgcna',
    methodId: 'wgcna',
    relation: 'uses_method',
    doi: '10.1038/s41598-024-73698-w',
    sourceUrl: 'https://doi.org/10.1038/s41598-024-73698-w',
    sourceSection: 'Methods - Co-expression Network Construction and Trait Correlation',
    softwareVersion: 'WGCNA R package',
    analysisPurpose: '构建紫米籽粒灌浆期转录组基因共表达模块，并将特征模块与花青素含量及抗氧化酶活性表型进行相关性关联。',
    evidenceSummary: 'Sun 等 (Scientific Reports 2024) 运用 WGCNA 鉴定与紫米抗氧化特性显著相关的关键枢纽基因网络。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 30. rice-3010-pangenome -> eupan
  {
    paperId: 'rice-3010-pangenome',
    methodId: 'eupan',
    relation: 'uses_method',
    doi: '10.1038/s41586-018-0063-9',
    sourceUrl: 'https://doi.org/10.1038/s41586-018-0063-9',
    sourceSection: 'Methods - Map-to-Pan Strategy and Gene PAV Profiling',
    softwareVersion: 'EUPAN',
    analysisPurpose: '基于 3,010 份水稻重测序数据比对泛基因组新序列，依据 CDS 覆盖率 >95% 与基因体覆盖率 >85% 计算基因及基因家族存在缺失变异 (PAV)。',
    evidenceSummary: 'Wang 等 (Nature 2018) 采用 EUPAN 工具体系的 map-to-pan 流程分析 453 份高深度栽培稻的基因家族泛基因组构成。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 31. rice-deleterious-domestication -> xpclr
  {
    paperId: 'rice-deleterious-domestication',
    methodId: 'xpclr',
    relation: 'uses_method',
    doi: '10.1093/molbev/msw296',
    sourceUrl: 'https://doi.org/10.1093/molbev/msw296',
    sourceSection: 'Methods - Detection of Selective Sweeps',
    softwareVersion: 'XP-CLR',
    analysisPurpose: '基于 3K 基因型数据集，利用跨群体复合似然比方法扫描栽培稻 (籼/粳) 与野生稻之间的多位点等位基因频率分化区间。',
    evidenceSummary: 'Liu 等 (Molecular Biology and Evolution 2017) 运行 XP-CLR 检测人工选择清除区域，用于分析驯化过程中有害变异富集模式。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 32. rice-root-single-cell-2021 -> scanpy
  {
    paperId: 'rice-root-single-cell-2021',
    methodId: 'scanpy',
    relation: 'uses_method',
    doi: '10.1038/s41467-021-22352-4',
    sourceUrl: 'https://doi.org/10.1038/s41467-021-22352-4',
    sourceSection: 'Methods - Single-cell RNA-seq Data Processing and Cell Clustering',
    softwareVersion: 'Scanpy 1.4.5.1',
    analysisPurpose: '执行 ComBat 批次校正、高变基因筛选、PCA 降维、k 近邻图构建、Diffusion Map 及 ForceAtlas2 可视化布局。',
    evidenceSummary: 'Zhang 等 (Nature Communications 2021) 使用 Scanpy 处理水稻根尖单细胞转录组表达矩阵，重构细胞命运分化轨迹。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 33. rice-root-soil-single-cell-2025 -> doubletfinder
  {
    paperId: 'rice-root-soil-single-cell-2025',
    methodId: 'doubletfinder',
    relation: 'uses_method',
    doi: '10.1038/s41586-025-08941-z',
    sourceUrl: 'https://doi.org/10.1038/s41586-025-08941-z',
    sourceSection: 'Methods - Single-cell Droplet Quality Control',
    softwareVersion: 'DoubletFinder',
    analysisPurpose: '在微滴单细胞文库质控阶段鉴定并剔除人工双胞 (doublet) 液滴，确保根细胞类型聚类纯度。',
    evidenceSummary: 'Zhu 等 (Nature 2025) 在水稻根系土壤应激单细胞测序中采用 DoubletFinder 过滤液滴双细胞伪影。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 34. rice-root-soil-single-cell-2025 -> sc-kb-copilot
  {
    paperId: 'rice-root-soil-single-cell-2025',
    methodId: 'sc-kb-copilot',
    relation: 'uses_method',
    doi: '10.1038/s41586-025-08941-z',
    sourceUrl: 'https://doi.org/10.1038/s41586-025-08941-z',
    sourceSection: 'Methods - scRNA-seq Preprocessing and Quality Filtering',
    softwareVersion: 'scKB / COPILOT',
    analysisPurpose: '执行快速原始读段映射计数 (kallisto-bustools / scKB) 及客观无偏质量控制过滤 (COPILOT)，获取逾 79,000 个高质量细胞。',
    evidenceSummary: 'Zhu 等 (2025) 采用作者团队研发的 scKB/COPILOT 流程对土壤压实胁迫水稻根单细胞转录组开展质控与预处理。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 35. rice-roots-population -> plink
  {
    paperId: 'rice-roots-population',
    methodId: 'plink',
    relation: 'uses_method',
    doi: '10.1371/journal.pgen.1007521',
    sourceUrl: 'https://doi.org/10.1371/journal.pgen.1007521',
    sourceSection: 'Materials and Methods - LD Pruning and SNP Quality Filtering',
    softwareVersion: 'PLINK',
    analysisPurpose: '从 3.3 百万个全基因组 SNP 中按缺失率 <=50%、MAF >=5% 与 r^2 <=0.3 提取 154,516 个独立标记构建群体结构分析数据集。',
    evidenceSummary: 'Zhao 等 (PLOS Genetics 2018) 在水稻根系 GWAS 研究中采用 PLINK 进行全基因组连锁不平衡剪枝。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 36. rice-roots-population -> admixture
  {
    paperId: 'rice-roots-population',
    methodId: 'admixture',
    relation: 'uses_method',
    doi: '10.1371/journal.pgen.1007521',
    sourceUrl: 'https://doi.org/10.1371/journal.pgen.1007521',
    sourceSection: 'Materials and Methods - Population Structure Modeling',
    softwareVersion: 'ADMIXTURE 1.3',
    analysisPurpose: '对 795 份栽培稻材料拟合 K=1 至 K=10 模型，选定 K=8 结构解析籼稻与粳稻生态群组的遗传分化。',
    evidenceSummary: 'Zhao 等 (2018) 明确运行 ADMIXTURE 1.3 评估水稻群体遗传背景，为下游 GWAS 混合线性模型提供群体结构分群依据。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 37. rice-temarker-sweeps -> sweepfinder2
  {
    paperId: 'rice-temarker-sweeps',
    methodId: 'sweepfinder2',
    relation: 'uses_method',
    doi: '10.1016/j.xplc.2021.100270',
    sourceUrl: 'https://doi.org/10.1016/j.xplc.2021.100270',
    sourceSection: 'Methods - Selective Sweep Scans on SNP and TE Datasets',
    softwareVersion: 'SweepFinder2',
    analysisPurpose: '在 10 kb 网格上分别针对 SNP 标记与 TE 存在/缺失标记计算复合似然比 (CLR)，检测水稻人工选择清除区间。',
    evidenceSummary: 'Yan 等 (Plant Communications 2022) 运行 SweepFinder2 比较 TE 标记与单核苷酸变异的选择信号重叠度与农艺性状关联。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 38. rice-weedy-selection -> plink
  {
    paperId: 'rice-weedy-selection',
    methodId: 'plink',
    relation: 'uses_method',
    doi: '10.1111/pbi.12630',
    sourceUrl: 'https://doi.org/10.1111/pbi.12630',
    sourceSection: 'Methods - Linkage Disequilibrium Analysis',
    softwareVersion: 'PLINK',
    analysisPurpose: '对韩国杂草稻、地方品种与野生祖先重测序数据执行质量控制，并计算全基因组 SNP 标记间连锁不平衡 (LD) r^2 衰减速率。',
    evidenceSummary: 'He 等 (Plant Biotechnology Journal 2017) 采用 PLINK 评估杂草稻群体的基因型质量控制与连锁不平衡衰减距离。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 39. rice-weedy-selection -> selscan
  {
    paperId: 'rice-weedy-selection',
    methodId: 'selscan',
    relation: 'uses_method',
    doi: '10.1111/pbi.12630',
    sourceUrl: 'https://doi.org/10.1111/pbi.12630',
    sourceSection: 'Methods - Haplotype-Based Selection Scans (XP-EHH & iHS)',
    softwareVersion: 'selscan',
    analysisPurpose: '利用相位化单倍型数据高效计算跨群体扩展单倍型纯合性 (XP-EHH) 与群体内积分单倍型分数 (iHS)。',
    evidenceSummary: 'He 等 (2017) 在 70 份水稻重测序材料中运行 selscan 扫描杂草稻脱颖去芒与落粒性改变等近期强选择信号。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 40. rice-weedy-selection -> xpclr
  {
    paperId: 'rice-weedy-selection',
    methodId: 'xpclr',
    relation: 'uses_method',
    doi: '10.1111/pbi.12630',
    sourceUrl: 'https://doi.org/10.1111/pbi.12630',
    sourceSection: 'Methods - Cross-Population Allele Frequency Differentiation',
    softwareVersion: 'XP-CLR',
    analysisPurpose: '跨杂草稻与地方栽培稻群体扫描多位点等位基因频率异常分化，检测驯化反向逃逸选择清除事件。',
    evidenceSummary: 'He 等 (2017) 使用 XP-CLR 配合 100 kb 滑动窗以经验前 2.5% 阈值筛选杂草稻关键适应性候选基因区间。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 41. tea-comparative -> cafe5
  {
    paperId: 'tea-comparative',
    methodId: 'cafe5',
    relation: 'uses_method',
    doi: '10.3389/fpls.2024.1449006',
    sourceUrl: 'https://doi.org/10.3389/fpls.2024.1449006',
    sourceSection: 'Materials and Methods - Gene Family Expansion and Contraction',
    softwareVersion: 'CAFE5',
    analysisPurpose: '基于物种系统发育树与时间标尺，运用生灭模型推断山茶属及近缘种基因家族拷贝数的扩张与收缩。',
    evidenceSummary: 'Duan 等 (Frontiers in Plant Science 2024) 采用 CAFE5 鉴定茶树次生代谢（如儿茶素和茶氨酸合成）相关基因家族显著扩张。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 42. tea-comparative -> mcscanx
  {
    paperId: 'tea-comparative',
    methodId: 'mcscanx',
    relation: 'uses_method',
    doi: '10.3389/fpls.2024.1449006',
    sourceUrl: 'https://doi.org/10.3389/fpls.2024.1449006',
    sourceSection: 'Materials and Methods - Collinearity and Synteny Analysis',
    softwareVersion: 'MCScanX',
    analysisPurpose: '比对茶树与近缘植物基因组共线性区块，表征染色体结构变异与复制基因保留模式。',
    evidenceSummary: 'Duan 等 (2024) 运行 MCScanX 识别山茶属内部染色体共线重排，解析基因组演化与农艺性状塑造。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 43. tea-comparative -> orthofinder
  {
    paperId: 'tea-comparative',
    methodId: 'orthofinder',
    relation: 'uses_method',
    doi: '10.3389/fpls.2024.1449006',
    sourceUrl: 'https://doi.org/10.3389/fpls.2024.1449006',
    sourceSection: 'Materials and Methods - Orthogroup Identification',
    softwareVersion: 'OrthoFinder',
    analysisPurpose: '在茶树及代表性被子植物基因组间进行直系同源群划分，提取单拷贝直系同源基因集。',
    evidenceSummary: 'Duan 等 (2024) 使用 OrthoFinder 获得山茶属系统发育分析所依赖的保守基因簇矩阵。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 44. tea-comparative -> paml
  {
    paperId: 'tea-comparative',
    methodId: 'paml',
    relation: 'uses_method',
    doi: '10.3389/fpls.2024.1449006',
    sourceUrl: 'https://doi.org/10.3389/fpls.2024.1449006',
    sourceSection: 'Materials and Methods - Divergence Time Estimation',
    softwareVersion: 'PAML (MCMCTree)',
    analysisPurpose: '结合化石标定点与单拷贝基因超矩阵，运用 MCMCTree 贝叶斯松弛分子钟估计山茶属物种分化时间。',
    evidenceSummary: 'Duan 等 (2024) 采用 PAML 的 MCMCTree 模块测定茶树及其近缘种的分化时间标尺。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 45. wheat-methylome-2015 -> bismark
  {
    paperId: 'wheat-methylome-2015',
    methodId: 'bismark',
    relation: 'uses_method',
    doi: '10.1186/s13059-015-0838-3',
    sourceUrl: 'https://doi.org/10.1186/s13059-015-0838-3',
    sourceSection: 'Methods - Bisulfite Sequencing Alignment and Methylation Calling',
    softwareVersion: 'Bismark',
    analysisPurpose: '将六倍体普通小麦靶向重硫酸盐测序读段高效比对到 A、B、D 亚基因组并提取 CpG、CHG 与 CHH 甲基化水平。',
    evidenceSummary: 'Gardiner 等 (Genome Biology 2015) 使用 Bismark 进行多倍体复杂基因组甲基化读段比对与修饰识别。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 46. wild-rice-pangenome-2025 -> hifiasm
  {
    paperId: 'wild-rice-pangenome-2025',
    methodId: 'hifiasm',
    relation: 'uses_method',
    doi: '10.1038/s41586-025-08883-6',
    sourceUrl: 'https://doi.org/10.1038/s41586-025-08883-6',
    sourceSection: 'Methods - PacBio HiFi Genome Assembly',
    softwareVersion: 'Hifiasm v0.16.0',
    analysisPurpose: '以默认参数组装 133 份野生稻与栽培稻 HiFi 材料，输出 primary contigs (p-contigs) 与 alternate contigs (a-contigs)。',
    evidenceSummary: 'Guo 等 (Nature 2025) 使用 Hifiasm v0.16.0 获得平均 contig N50 达 14.95 Mb 的高质量稻属初级组装。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 47. wild-rice-pangenome-2025 -> minigraph
  {
    paperId: 'wild-rice-pangenome-2025',
    methodId: 'minigraph',
    relation: 'uses_method',
    doi: '10.1038/s41586-025-08883-6',
    sourceUrl: 'https://doi.org/10.1038/s41586-025-08883-6',
    sourceSection: 'Methods - Graph Pangenome Generation Pipeline',
    softwareVersion: 'Minigraph v0.19-r551',
    analysisPurpose: '迭代加入 144 份野生与栽培稻组装，构建捕获结构变异的初始泛基因组图拓扑。',
    evidenceSummary: 'Guo 等 (2025) 采用 Minigraph v0.19 建立大片段 SV 变异图框架，作为 Minigraph-Cactus 流程初始图。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 48. wild-rice-pangenome-2025 -> minigraph-cactus
  {
    paperId: 'wild-rice-pangenome-2025',
    methodId: 'minigraph-cactus',
    relation: 'uses_method',
    doi: '10.1038/s41586-025-08883-6',
    sourceUrl: 'https://doi.org/10.1038/s41586-025-08883-6',
    sourceSection: 'Methods - Pangenome Graph Construction',
    softwareVersion: 'Cactus v2.2.1 (Minigraph-Cactus)',
    analysisPurpose: '在 Minigraph 初始图基础上执行碱基级多序列比对与图整理，生成栽培稻 (15 份)、野生稻 (129 份) 及合并泛基因组图 (144 份)。',
    evidenceSummary: 'Guo 等 (2025) 使用 Minigraph-Cactus 流程构建包含 3.87 Gb 新节点序列的稻属碱基级全序列泛基因组变异图。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 49. wild-rice-pangenome-2025 -> minimap2
  {
    paperId: 'wild-rice-pangenome-2025',
    methodId: 'minimap2',
    relation: 'uses_method',
    doi: '10.1038/s41586-025-08883-6',
    sourceUrl: 'https://doi.org/10.1038/s41586-025-08883-6',
    sourceSection: 'Methods - Long-Read Alignment for Variant Calling and PAV',
    softwareVersion: 'minimap2 v2.21-r1071',
    analysisPurpose: '作为核心长读段比对器，为 Longshot 单核苷酸多态性分型及基因存在/缺失 (PAV) 分析提供全局序列比对映射。',
    evidenceSummary: 'Guo 等 (2025) 运行 minimap2 v2.21 将长读段比对到参考序列支撑变异调用。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 50. wild-rice-pangenome-2025 -> mummer4
  {
    paperId: 'wild-rice-pangenome-2025',
    methodId: 'mummer4',
    relation: 'uses_method',
    doi: '10.1038/s41586-025-08883-6',
    sourceUrl: 'https://doi.org/10.1038/s41586-025-08883-6',
    sourceSection: 'Methods - Assembly Alignment, Organelle Filtering, and SNP Detection',
    softwareVersion: 'MUMmer v4.0.0beta2',
    analysisPurpose: '运行 nucmer 比较 Nipponbare 与四个代表材料的基因组共线性，并经 delta-filter 与 show-snps 识别组装比对变异。',
    evidenceSummary: 'Guo 等 (2025) 使用 MUMmer4 的 nucmer 与过滤工具执行细胞器 contig 过滤与代表性组装对齐变异鉴定。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 51. wild-rice-pangenome-2025 -> syri
  {
    paperId: 'wild-rice-pangenome-2025',
    methodId: 'syri',
    relation: 'uses_method',
    doi: '10.1038/s41586-025-08883-6',
    sourceUrl: 'https://doi.org/10.1038/s41586-025-08883-6',
    sourceSection: 'Methods - Structural Rearrangement Assessment',
    softwareVersion: 'SyRI v1.4',
    analysisPurpose: '比较 Hi-C 辅助组装与 ALLMAPS 染色体组装，精准识别并定位大型倒位与易位等结构变异差异。',
    evidenceSummary: 'Guo 等 (2025) 使用 SyRI v1.4 对齐水稻基因组组装，验证染色体挂载一致性并提取结构重排。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 52. wild-rice-pangenome-2025 -> vg
  {
    paperId: 'wild-rice-pangenome-2025',
    methodId: 'vg',
    relation: 'uses_method',
    doi: '10.1038/s41586-025-08883-6',
    sourceUrl: 'https://doi.org/10.1038/s41586-025-08883-6',
    sourceSection: 'Methods - Short-Read Graph Mapping with Giraffe',
    softwareVersion: 'vg Giraffe v1.43.0',
    analysisPurpose: '将 142 份本研究材料与 407 份公开水稻重测序短读段精确比对至合并泛基因组变异图，为 DeepVariant/GLnexus 变异汇总提供图比对结果。',
    evidenceSummary: 'Guo 等 (2025) 运用 vg Giraffe v1.43.0 完成逾 500 份群体的泛基因组图上短读长高效比对。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 53. wild-rice-pangenome-2025 -> yahs
  {
    paperId: 'wild-rice-pangenome-2025',
    methodId: 'yahs',
    relation: 'uses_method',
    doi: '10.1038/s41586-025-08883-6',
    sourceUrl: 'https://doi.org/10.1038/s41586-025-08883-6',
    sourceSection: 'Methods - Hi-C Scaffolding',
    softwareVersion: 'YaHS v1.1',
    analysisPurpose: '利用 Chromap 比对的 Hi-C 染色质构象互作数据，对 30 份代表性水稻材料的 contig 执行染色体级定向与挂载。',
    evidenceSummary: 'Guo 等 (2025) 采用 YaHS v1.1 完成 30 份关键材料的染色体支架构建，结合 JuiceBox 人工检查校正组装。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 54. xanthoceras -> hifiasm
  {
    paperId: 'xanthoceras',
    methodId: 'hifiasm',
    relation: 'uses_method',
    doi: '10.1038/s41597-025-05057-x',
    sourceUrl: 'https://doi.org/10.1038/s41597-025-05057-x',
    sourceSection: 'Methods - Comparative Assembly and Gap Closing',
    softwareVersion: 'Hifiasm',
    analysisPurpose: '组装 HiFi reads 产生独立单倍型 contig，辅助跨图比对验证并填补 Verkko 主组装中的残余 gap。',
    evidenceSummary: 'Liu 等 (Scientific Data 2025) 在文冠果 (Xanthoceras sorbifolium) T2T 基因组研究中，使用 Hifiasm 组装结果作为互补证据闭合缺口。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  },
  // 55. xanthoceras -> verkko
  {
    paperId: 'xanthoceras',
    methodId: 'verkko',
    relation: 'uses_method',
    doi: '10.1038/s41597-025-05057-x',
    sourceUrl: 'https://doi.org/10.1038/s41597-025-05057-x',
    sourceSection: 'Methods - Haplotype-Resolved Telomere-to-Telomere Assembly',
    softwareVersion: 'Verkko',
    analysisPurpose: '整合超长 Oxford Nanopore reads 与 PacBio HiFi reads，构建无缺口且单倍型完全解析的端粒到端粒 (T2T) 染色体组装。',
    evidenceSummary: 'Liu 等 (2025) 采用 Verkko 完成文冠果两套单倍型基因组的从头组装，实现高难度重复区与着丝粒端粒解析。',
    verificationStatus: 'source_checked',
    sourceType: 'paper',
    verifiedAt: '2026-11-23'
  }
];

export function findVerifiedApplicationMethod(paperId: string, methodId: string): VerifiedApplicationMethod | undefined {
  return verifiedApplicationMethods.find(v => v.paperId === paperId && v.methodId === methodId);
}

export function getAllVerifiedApplicationMethods(): VerifiedApplicationMethod[] {
  return verifiedApplicationMethods;
}
