import type { ResearchWorkflow } from './types';

export const researchWorkflows: ResearchWorkflow[] = [
  // 1. 基因组组装与泛基因组路线
  {
    id: 'assembly-pangenome',
    title: '从长读段测序到植物泛基因组构建端到端路线',
    englishTitle: 'Long-read Assembly to Plant Pangenome Workflow',
    summary: '面向现代植物基因组研究的完整技术路线，覆盖 PacBio HiFi/ONT 超长读长从从头组装、单倍型解析、Hi-C 染色体水平挂载、结构变异检测至图形泛基因组构建。',
    targetScenario: '二倍体/多倍体高杂合植物参考基因组构建、群体多参考基因组组装与图泛基因组学研究。',
    plantCases: ['水稻 (Oryza sativa)', '玉米 (Zea mays)', '拟南芥 (Arabidopsis thaliana)', '小麦 (Triticum aestivum)'],
    recommendedCompute: '计算节点建议：64+ CPU 线程，256 GB~1 TB RAM，NVMe SSD 高速存储（大型复杂植物基因组需 TB 级内存）。',
    mermaidDiagram: `graph TD
  A[PacBio HiFi / ONT 超长测序数据] --> B[第一阶段: 高保真 Contig 组装]
  B --> C[第二阶段: 序列完整度与 QV 质量评估]
  C --> D[第三阶段: Hi-C 染色体水平挂载]
  D --> E[第四阶段: 基因与重复序列全注释]
  E --> F[第五阶段: 结构变异与图形泛基因组图谱]
  B -.->|核心工具| B1[Hifiasm / Verkko]
  C -.->|质控工具| C1[Merqury / BUSCO]
  D -.->|挂载工具| D1[YaHS / Juicer]
  E -.->|注释工具| E1[EDTA / BRAKER3]
  F -.->|泛基因组| F1[Minigraph-Cactus / SyRI / PGGB]`,
    phases: [
      {
        id: 'contig-assembly',
        order: 1,
        title: '长读段从头组装与单倍型分型',
        englishTitle: 'De novo Long-Read Assembly & Phasing',
        summary: '利用高保真长读段直接构建图连通单元（String Graph），解开植物基因组高度杂合与多倍体单倍型。',
        recommendedTools: [
          {
            methodId: 'hifiasm',
            name: 'Hifiasm',
            role: '主流植物 HiFi 首选组装器，支持 Trio-binning 与 Hi-C 辅助分相',
            recommendedParams: '-o asm -t 64 --h1 hic_R1.fq.gz --h2 hic_R2.fq.gz',
            alternativeMethodIds: ['verkko']
          },
          {
            methodId: 'verkko',
            name: 'Verkko',
            role: '超长 ONT + HiFi 混合组装，专攻着丝粒与端粒 T2T 闭合',
            recommendedParams: '--hifi hifi.fq.gz --nano ont.fq.gz'
          }
        ],
        inputData: ['PacBio HiFi reads (FASTQ, 覆盖度 30x+)', '可选：超长 ONT reads (50kb+, 20x+)', '可选：Hi-C 双端测序 reads (30x+)'],
        outputData: ['primary contigs (p_ctg.gfa / p_ctg.fa)', 'alternate contigs (a_ctg.gfa)', 'haplotype 1 & 2 contigs'],
        qualityCheckpoints: [
          '检查组装图拓扑分支是否连通、着丝粒串联重复区段是否有断裂',
          'Primary 组装总长度是否接近 flow cytometry 估计的单倍体 C-value'
        ],
        tutorialId: 'hifiasm-intro',
        estimatedDuration: '小型植物数小时；玉米等复杂植物 1~2 天'
      },
      {
        id: 'assembly-qc',
        order: 2,
        title: '组装质量、碱基精度与单倍型完整度评估',
        englishTitle: 'Assembly Quality, Base Accuracy & Completeness QC',
        summary: '使用基于参考无关的无偏 k-mer 谱与保守直系同源基因，量化 QV 准确率、完整度及单倍型纯净度。',
        recommendedTools: [
          {
            methodId: 'merqury',
            name: 'Merqury',
            role: '基于高精度短读段或 HiFi k-mer 的参考无关 QV 与单倍型完整度评估',
            recommendedParams: 'merqury.sh kmer.meryl asm.p_ctg.fa out_prefix'
          }
        ],
        inputData: ['Primary Contig FASTA', '原始高精度测序 reads (HiFi 或 Illumina Short reads)'],
        outputData: ['QV 质量报告 (Phred 分数)', 'k-mer 拷贝数频谱图 (Spectra-cn plot)', 'BUSCO 统计报告'],
        qualityCheckpoints: [
          'QV 预期达到 Q40 以上（99.99% 碱基正确率）',
          'k-mer 谱图应显示单拷贝与二拷贝峰完全对应单倍型，无明显人工嵌合或杂合未分相双峰',
          'BUSCO (Embryophyta / Poales 等谱系) 完整度应 > 97%'
        ],
        estimatedDuration: '约 1~4 小时'
      },
      {
        id: 'chromosome-scaffolding',
        order: 3,
        title: '染色体级别挂载 (Scaffolding)',
        englishTitle: 'Chromosome-Level Scaffolding',
        summary: '利用染色质三维空间构象捕获（Hi-C）互作频率与物理距离反比的规律，将 Contig 定向、排序并挂载至假分子染色体。',
        recommendedTools: [
          {
            methodId: 'yahs',
            name: 'YaHS',
            role: '现代高速无偏染色体挂载工具，对长读段 Contig 表现优异',
            recommendedParams: 'yahs -o yahs_out p_ctg.fa hic_aligned.bam'
          }
        ],
        inputData: ['高质量 Primary Contig FASTA', 'Hi-C 比对与过滤后 BAM 文件 (已去重)'],
        outputData: ['染色体水平 Scaffolds (chr*.fasta)', 'Juicebox / HiC-Pro 交互热图 (.hic / .assembly)'],
        qualityCheckpoints: [
          '全基因组 Hi-C 热图沿对角线呈清晰强连续带，无跨染色体异常大范围异位互作',
          '挂载到染色体的序列长度占总基因组比率通常应 > 95%'
        ],
        estimatedDuration: '约 2~8 小时'
      },
      {
        id: 'annotation',
        order: 4,
        title: '转座子重复序列与结构基因注释',
        englishTitle: 'Transposable Elements & Gene Annotation',
        summary: '针对植物基因组富含高比例 LTR-RT 的特征，先精准从头挖掘与屏蔽重复元件，再结合全长转录组与蛋白同源性预测蛋白编码基因。',
        recommendedTools: [
          {
            methodId: 'edta',
            name: 'EDTA',
            role: '植物综合转座子注释工作流，集成 TIR、LTR、Helitron 专用识别引擎',
            recommendedParams: 'EDTA.pl --genome genome.fa --species others --threads 32'
          },
          {
            methodId: 'braker3',
            name: 'BRAKER3',
            role: '结合 RNA-seq 短读段与同源蛋白大数据库的现代基因预测引擎',
            recommendedParams: 'braker.pl --genome=masked.fa --prot_seq=orthodb.fa --bam=rnaseq.bam'
          }
        ],
        inputData: ['挂载后的染色体 FASTA', '植物组织多部位 RNA-seq 或 Iso-Seq 数据', '近缘属种蛋白数据库 (OrthoDB / UniProt)'],
        outputData: ['全基因组转座子 GFF3 与结构统计表', '高可信度结构基因模型 GFF3', '预测蛋白 FASTA'],
        qualityCheckpoints: [
          '转座子注释覆盖率与该植物进化分支预期相符（如水稻 ~40%，玉米 > 75%）',
          '基因 BUSCO 评分接近组装水平 BUSCO，平均内含子长度与外显子分布正常'
        ],
        tutorialId: 'edta-tutorial',
        estimatedDuration: 'EDTA: 12~36 小时；BRAKER3: 1~3 天'
      },
      {
        id: 'pangenome-graph',
        order: 5,
        title: '多基因组共线性与图形泛基因组构建',
        englishTitle: 'Synteny & Graph Pangenome Construction',
        summary: '识别多品系/种质间的共线性块、倒位、易位及大片段插入缺失（PAV），构建无参考偏倚的变异图谱。',
        recommendedTools: [
          {
            methodId: 'syri',
            name: 'SyRI',
            role: '染色体级别双基因组结构变异与倒位、易位、局部重排识别',
            recommendedParams: 'syri -c ref_qry.bam -r ref.fa -q qry.fa -k --prefix out'
          },
          {
            methodId: 'minigraph-cactus',
            name: 'Minigraph-Cactus',
            role: '基于图形的多基因组对齐工具，保留全碱基精度的无偏泛基因组图',
            recommendedParams: 'cactus-pangenome ./jobStore ./seqFile.txt --outDir ./pg_out'
          },
          {
            methodId: 'pggb',
            name: 'PGGB',
            role: '无偏图形泛基因组构建管线，结合 wfmash、seqwish 与 smoothxg 构建变异诱导图',
            alternativeMethodIds: ['eupan']
          }
        ],
        inputData: ['多个高质量组装的染色体 FASTA', '各个个体的结构基因与转座子 GFF3'],
        outputData: ['图形泛基因组图谱 (GFA / VCF)', '核心基因 (Core) 与可变基因 (Dispensable/Private) 矩阵', '大尺度结构变异列表'],
        qualityCheckpoints: [
          '泛基因组饱和度曲线趋于平缓（Core 基因稳定，Pan 基因持续扩展）',
          '倒位与易位断点有充分的染色质共线性与 PacBio HiFi 跨越 reads 支撑'
        ],
        tutorialId: 'syri-intro',
        estimatedDuration: '数小时至数天（取决于基因组数量）'
      }
    ]
  },

  // 2. 群体重测序与 GWAS 路线
  {
    id: 'population-gwas',
    title: '植物群体变异检测与全基因组关联分析路线',
    englishTitle: 'Plant Population Resequencing & GWAS Workflow',
    summary: '面向作物群体遗传学、自然群体多样性、驯化选择信号扫描与农艺性状全基因组关联分析（GWAS）的标准学术路线。',
    targetScenario: '农艺性状遗传机制解析、核心种质资源分群、驯化选择基因挖掘与分子标记辅助育种。',
    plantCases: ['水稻核心种质资源', '玉米自交系群体', '大豆群体', '番茄群体'],
    recommendedCompute: '计算节点建议：32~64 线程，128~256 GB RAM，TB 级高速并行文件系统（存储大量 BAM 与 VCF）。',
    mermaidDiagram: `graph TD
  A[大规模自然群体重测序 FASTQ] --> B[第一阶段: 质控、比对与变异检测]
  B --> C[第二阶段: 变异位点严格质控与填充]
  C --> D[第三阶段: 群体结构与亲缘关系矩阵]
  D --> E[第四阶段: 全基因组关联分析 GWAS]
  E --> F[第五阶段: 候选基因功能注释与驯化选择扫描]
  B -.->|比对调用| B1[BWA-MEM2 / BCFtools]
  C -.->|位点过滤| C1[VCFtools / PLINK]
  D -.->|结构推断| D1[ADMIXTURE / PCA]
  E -.->|关联模型| E1[GAPIT / GEMMA]
  F -.->|功能注释| F1[SnpEff / 结合 RNA-seq]`,
    phases: [
      {
        id: 'alignment-variant-calling',
        order: 1,
        title: '短读段比对与单倍型变异检测',
        englishTitle: 'Read Alignment & Variant Calling',
        summary: '对群体中所有个体进行接头剪切、双端比对到参考基因组、排序标记重复并生成群体联合变异位点集合。',
        recommendedTools: [
          {
            methodId: 'bcftools',
            name: 'BCFtools',
            role: '超高速跨样本变异调用与 VCF 处理工业标准',
            recommendedParams: 'bcftools mpileup -Ou -f ref.fa -b bam_list.txt | bcftools call -mv -Oz -o raw.vcf.gz'
          }
        ],
        inputData: ['参考基因组 FASTA (含索引)', '全样本 Illumina 双端测序 FASTQ (推荐平均覆盖度 5x~15x)'],
        outputData: ['群体原始多样本 VCF (raw.vcf.gz)', '比对 BAM 文件及覆盖深度统计'],
        qualityCheckpoints: [
          '平均比对率 > 95%，基因组覆盖率 > 90%',
          '重复序列标记比例正常（避免 PCR 过度扩增）'
        ],
        estimatedDuration: '根据样本量，数百样本通常需 1~3 天'
      },
      {
        id: 'vcf-qc-filtering',
        order: 2,
        title: '变异位点多维质控与基因型填充',
        englishTitle: 'SNP QC Filtering & Imputation',
        summary: '过滤假阳性 SNP/InDel、质控缺失率与次等位基因频率（MAF），必要时结合参考单倍型面板进行基因型缺失填充。',
        recommendedTools: [
          {
            methodId: 'plink',
            name: 'PLINK',
            role: '超高速大规模基因型质控、过滤、LD 剪枝与格式转换',
            recommendedParams: 'plink --vcf raw.vcf.gz --maf 0.05 --geno 0.1 --mind 0.1 --make-bed --out clean'
          }
        ],
        inputData: ['原始多样本 VCF'],
        outputData: ['高质量纯净 SNP 数据集 (clean.bed/bim/fam 或 clean.vcf.gz)', '位点缺失率与等位基因频谱统计'],
        qualityCheckpoints: [
          '次等位基因频率 (MAF) > 0.05，单SNP缺失率 (geno) < 10%，个体缺失率 (mind) < 10%',
          '剔除异常多等位基因位点与深度极端异常位点（避免旁系同源区域误调用）'
        ],
        tutorialId: 'plink-synthetic',
        estimatedDuration: '约 1~4 小时'
      },
      {
        id: 'pop-structure-kinship',
        order: 3,
        title: '群体遗传结构推断与亲缘关系矩阵',
        englishTitle: 'Population Structure & Kinship Estimation',
        summary: '评估群体层化（Stratification）与亲缘关系（Kinship），为后续控制 GWAS 假阳性提供协变量与随机效应方差协方差矩阵。',
        recommendedTools: [
          {
            methodId: 'admixture',
            name: 'ADMIXTURE',
            role: '最大似然法推断祖先成分比例，通过交叉验证 (CV) 确定最优群体亚群数 K 值',
            recommendedParams: 'admixture --cv clean_pruned.bed 3 -j16'
          },
          {
            methodId: 'plink',
            name: 'PLINK',
            role: '计算主成分分析 (PCA) 与 VanRaden 亲缘关系矩阵 (Kinship)',
            recommendedParams: 'plink --bfile clean_pruned --pca 10 --make-rel square'
          }
        ],
        inputData: ['经过连锁不平衡剪枝 (LD Pruning) 的独立 SNP 数据集 (r² < 0.2)'],
        outputData: ['最优 K 值祖先成分矩阵 (Q 矩阵)', '前 3~10 个主成分特征向量 (PCA 协变量)', '个体间亲缘关系矩阵 (K 矩阵)'],
        qualityCheckpoints: [
          'CV error 最低点提示最优 K 值；PCA 图与地理分布/已知农家种品系分类高度一致',
          '亲缘关系矩阵无大量近亲或重复测序混淆'
        ],
        estimatedDuration: '约 2~12 小时'
      },
      {
        id: 'gwas-association',
        order: 4,
        title: '混合线性模型关联分析 (GWAS)',
        englishTitle: 'Mixed Linear Model (MLM/FarmCPU/Blink) GWAS',
        summary: '利用混合线性模型或多位点迭代模型（如 FarmCPU、Blink），同时矫正群体结构 (Q) 和亲缘关系 (K)，精确定位显著关联位点。',
        recommendedTools: [
          {
            methodId: 'gapit',
            name: 'GAPIT',
            role: 'R 语言动植物 GWAS 金标准平台，集成 MLM、FarmCPU、Blink 等高效算法',
            recommendedParams: 'GAPIT(Y=phenotype, G=genotype, PCA.total=3, model=c("FarmCPU", "Blink"))'
          }
        ],
        inputData: ['多年多点农艺表型矩阵 (含最佳线性无偏预测值 BLUP)', '高质量 SNP 基因型矩阵', 'Q 矩阵或 PCA 协变量', 'Kinship 矩阵'],
        outputData: ['GWAS 显著性结果表 (包含 SNP 物理位置、P-value、效应值 Effect)', '曼哈顿图 (Manhattan Plot)', '分位数-分位数图 (QQ Plot)'],
        qualityCheckpoints: [
          'QQ 图在期望直线 (y=x) 上紧密拟合，且尾部显著位点翘起，表明假阳性与通货膨胀系数 (λ) 得到良好控制 (0.95 ≤ λ ≤ 1.10)',
          '显著性阈值通常采用 Bonferroni 矫正 (-log10 P > 6~7) 或 FDR 阈值'
        ],
        tutorialId: 'gwas-synthetic',
        estimatedDuration: '约 30 分钟 ~ 3 小时'
      },
      {
        id: 'candidate-gene-mining',
        order: 5,
        title: '候选区间界定、功能注释与选择消除分析',
        englishTitle: 'Candidate Locus Dissection & Selection Sweep',
        summary: '以显著关联位点为中心，根据局部连锁不平衡衰减距离界定候选区间，结合转录组表达、等位变异非同义突变及驯化选择信号验证因果基因。',
        recommendedTools: [
          {
            methodId: 'selscan',
            name: 'selscan',
            role: '计算单倍型纯合扩展 (iHS / XP-EHH)，定位驯化过程中经历强烈正选择的区域'
          },
          {
            methodId: 'plink',
            name: 'PLINK',
            role: '局部 LD 块分析与单倍型分群'
          }
        ],
        inputData: ['显著关联 Lead SNP 列表', '参考基因组 GFF3 与蛋白功能注释', '群体单倍型相位数据 (Phased VCF)'],
        outputData: ['候选基因清单及基因内部功能突变效应 (SnpEff missense)', '单倍型网络图 (Haplotype Network)', '选择信号跨群体比较分数 (XP-EHH)'],
        qualityCheckpoints: [
          '优异等位基因与目标性状显著正相关，并在改良品系中表现出选择性富集',
          '候选基因表达模式与表型出现的时间/组织高度契合'
        ],
        estimatedDuration: '约 2~6 小时'
      }
    ]
  },

  // 3. 表达数据与 WGCNA 调控网络路线
  {
    id: 'expression-network',
    title: '植物发育与逆境胁迫转录调控网络解析路线',
    englishTitle: 'Plant Development & Stress Transcriptome & WGCNA Workflow',
    summary: '从植物不同组织、发育时期或逆境胁迫处理（干旱、高盐、病害）多组学 RNA-seq 数据出发，开展差异表达分析、加权共表达网络模块聚类与核心调控枢纽（Hub Gene）定位。',
    targetScenario: '农作物逆境适应性分子机制、生长发育关键信号通路以及转录因子靶基因网络构建。',
    plantCases: ['水稻耐盐/抗旱转录组', '玉米籽粒发育时序转录组', '棉花纤维伸长机制', '拟南芥光周期响应'],
    recommendedCompute: '计算节点建议：16~32 核心 CPU，64~128 GB 内存。',
    mermaidDiagram: `graph TD
  A[植物多组织/多时期表达计数矩阵] --> B[第一阶段: 表达量质控与方差稳定变换 VST]
  B --> C[第二阶段: 差异表达基因分析 DESeq2]
  C --> D[第三阶段: 加权共表达网络与模块划分 WGCNA]
  D --> E[第四阶段: 模块-生理表型关联与特征向量提取]
  E --> F[第五阶段: 转录因子调控网络推断与 Hub 排序]
  B -.->|归一化| B1[DESeq2 vst]
  C -.->|差异分析| C1[DESeq2 / Wald 检验]
  D -.->|共表达聚类| D1[WGCNA / 软阈值]
  E -.->|性状关联| E1[WGCNA / 模块特征向量 ME]
  F -.->|调控网络| F1[GENIE3 / GRNBoost2]`,
    phases: [
      {
        id: 'qc-normalization',
        order: 1,
        title: '表达矩阵质控、低丰度过滤与方差稳定变换',
        englishTitle: 'Expression QC, Filtering & Variance Stabilizing Transformation',
        summary: '对全样本原始计数表达矩阵进行低丰度基因过滤，执行跨文库中位比值标准化与方差稳定变换（VST），消除计数方差随均值增长的异方差性，并通过 PCA 检验生物学重复一致性。',
        recommendedTools: [
          {
            methodId: 'deseq2',
            name: 'DESeq2',
            role: '利用 estimateSizeFactors 与 varianceStabilizingTransformation (vst) 进行稳健无偏数据变换',
            recommendedParams: 'dds <- DESeqDataSetFromMatrix(counts, colData, ~condition); vsd <- vst(dds, blind=FALSE)'
          }
        ],
        inputData: ['全基因组原始基因计数矩阵 (Raw Counts Table)', '样本元数据表格 (ColData: 组织、处理、重复)'],
        outputData: ['过滤与方差稳定变换矩阵 (VST Matrix)', '样本间距离热图 (Sample Distance Matrix)', '主成分分析图 (PCA Plot)'],
        qualityCheckpoints: [
          '过滤行计数和过低的假基因（通常要求每个基因在至少一组生物学重复中 count ≥ 10）',
          '生物学重复在 PCA 空间紧密聚合，不同处理或发育时期显著分离'
        ],
        estimatedDuration: '约 5~15 分钟'
      },
      {
        id: 'diff-expression',
        order: 2,
        title: '多因子差异表达基因鉴定 (DEG)',
        englishTitle: 'Differential Expression Analysis',
        summary: '拟合负二项分布广义线性模型（GLM），精确估计处理 vs 对照间各基因的表达变化倍数及其调整后 P 值（FDR）。',
        recommendedTools: [
          {
            methodId: 'deseq2',
            name: 'DESeq2',
            role: '负二项分布差异分析，通过经验贝叶斯收缩离散度估计，保证小样本下的统计可靠性',
            recommendedParams: 'dds <- DESeq(dds); res <- results(dds, contrast=c("treatment","stress","control"), alpha=0.05)'
          }
        ],
        inputData: ['DESeqDataSet 对象 (含负二项分布离散度估计)'],
        outputData: ['差异表达结果统计表 (包含 baseMean, log2FoldChange, lfcSE, stat, pvalue, padj)', '差异基因火山图 (Volcano Plot)', '显著上调与下调基因清单'],
        qualityCheckpoints: [
          '采用 Benjamini-Hochberg 矫正后 padj < 0.05 且 |log2FC| ≥ 1.0 作为严格阈值',
          '检查离散度拟合曲线（Dispersion plot）是否呈平滑收缩，无异常离群点'
        ],
        estimatedDuration: '约 10~30 分钟'
      },
      {
        id: 'wgcna-network',
        order: 3,
        title: '加权基因共表达网络构建与模块划分',
        englishTitle: 'Weighted Co-expression Network & Module Partition',
        summary: '挑选高变异基因集合，检验无尺度网络拓扑分布（Scale-free topology）选择最佳软阈值 β，构建拓扑重叠矩阵（TOM）并执行层次聚类生成共表达模块。',
        recommendedTools: [
          {
            methodId: 'wgcna',
            name: 'WGCNA',
            role: '系统生物学高引用经典方法，挖掘协同表达基因网络模块与生理表型关联',
            recommendedParams: 'sft <- pickSoftThreshold(datExpr); net <- blockwiseModules(datExpr, power=sft$powerEstimate)'
          }
        ],
        inputData: ['高变异基因标准化表达矩阵 (如前 5000~10000 基因 VST 表达值)'],
        outputData: ['软阈值无尺度拟合曲线图', '基因模块分色聚类树状图 (Dendrogram)', '各模块特征向量基因 (Module Eigengenes, ME)'],
        qualityCheckpoints: [
          '无尺度拟合指数 R² 建议达到 0.80~0.85 以上',
          '模块划分清晰，避免单个模块聚集超过全基因组 50% 基因'
        ],
        tutorialId: 'wgcna-synthetic',
        estimatedDuration: '约 30 分钟 ~ 2 小时'
      },
      {
        id: 'hub-functional-enrichment',
        order: 4,
        title: '模块-表型关联与核心 Hub 基因初筛',
        englishTitle: 'Module-Trait Correlation & Core Hub Identification',
        summary: '计算模块特征向量（ME）与连续生理生化指标（如耐盐存活率、叶绿素含量）的相关性，提取高连通度 Hub 基因。',
        recommendedTools: [
          {
            methodId: 'wgcna',
            name: 'WGCNA',
            role: '计算模块内连通度（kME）与基因显著性（GS）',
            recommendedParams: 'geneModuleMembership <- as.data.frame(cor(datExpr, MEs, use="p"))'
          }
        ],
        inputData: ['模块特征向量矩阵 (ME)', '植株生理表型数据', '模块内部 TOM 邻接矩阵'],
        outputData: ['模块-表型相关性热图 (Module-Trait Heatmap)', '模块高连通度 Hub 基因列表', '各模块内基因显著性 (GS) 与模块身份 (MM) 散点图'],
        qualityCheckpoints: [
          '目标模块与特定性状在生物学上呈现高相关 (|r| > 0.5, P < 0.01)',
          'Hub 基因具有高 kME (> 0.8) 且表达模式与表型强同步'
        ],
        tutorialId: 'wgcna-synthetic',
        estimatedDuration: '约 30 分钟 ~ 1 小时'
      },
      {
        id: 'regulatory-inference',
        order: 5,
        title: '转录因子调控网络推断与候选靶基因排序',
        englishTitle: 'Transcription Factor Regulatory Network Inference',
        summary: '结合植物已知转录因子家族（如 WRKY、MYB、NAC、bHLH 等），利用集成树回归为候选调控因子-靶基因对的重要性权重进行全局排序，锁定逆境适应关键转录调控主通路。',
        recommendedTools: [
          {
            methodId: 'genie3',
            name: 'GENIE3',
            role: '逐靶基因随机森林回归，推断转录因子对下游靶基因的特征重要性权重',
            recommendedParams: 'weightMatrix <- GENIE3(exprMatrix, regulators=plantTFList, nTrees=1000)',
            alternativeMethodIds: ['grnboost2']
          },
          {
            methodId: 'grnboost2',
            name: 'GRNBoost2',
            role: '基于梯度提升机（GBM）的大规模极速基因调控网络推断，处理数万基因超大规模网络'
          }
        ],
        inputData: ['关键模块基因表达矩阵', '植物转录因子注释清单 (PlantTFDB 等)'],
        outputData: ['调控因子-靶基因有向关系及权重打分表 (TF-Target Edges)', '顶层核心调控转录因子排序榜单', 'Cytoscape 网络可视化输入文件'],
        qualityCheckpoints: [
          '高权重 TF-Target 关联需进一步核对启动子区域对应结合基序 (Motif) 是否富集',
          '排除仅在极少数样本中表达波动的假性高权重边'
        ],
        estimatedDuration: '约 1~3 小时'
      }
    ]
  }
];
