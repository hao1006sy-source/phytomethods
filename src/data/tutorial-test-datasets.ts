/**
 * PhytoMethods 十篇教程经典小型测试数据集注册表 (Tutorial Test Datasets Registry)
 * 严格基于仓库已有实测数据、官方示例、真实公共测序数据与可核实模拟数据
 * 遵循原则：
 * 1. 严格反映真实验证状态 (executed / documented / not_verified)
 * 2. 绝不因为数据公开可下载而将模板教程随意升级为 verified
 * 3. 区分真实公共测序数据 (public_sequencing)、官方示例 (official_example) 与合成模拟数据 (synthetic)
 */

export interface TutorialTestDataset {
  tutorialId: string;
  datasetId: string;
  title: string;
  organism?: string;
  datasetType: 'official_example' | 'public_sequencing' | 'synthetic' | 'reference_derived';
  sourceName: string;
  sourceUrl: string;
  accession?: string;
  downloadUrl?: string;
  fileName?: string;
  format: string;
  compressedBytes?: number;
  sha256?: string;
  softwareVersion?: string;
  installCommand?: string;
  downloadCommand?: string;
  quickStartCommand?: string;
  expectedOutputs: string[];
  estimatedDuration?: string;
  durationBasis?: string;
  cpuRecommendation?: string;
  memoryRecommendation?: string;
  verificationStatus: 'executed' | 'documented' | 'not_verified';
  verificationEvidence?: string[];
  limitations: string;
}

export const tutorialTestDatasets: TutorialTestDataset[] = [
  // 1. Hifiasm 快速入门
  {
    tutorialId: 'hifiasm-intro',
    datasetId: 'hifiasm-chr11-2m',
    title: 'Hifiasm 官方小型 HiFi 测试数据 (chr11-2M)',
    organism: 'Caenorhabditis elegans (秀丽隐杆线虫 chr11 局部截断)',
    datasetType: 'official_example',
    sourceName: 'Hifiasm 官方 Release v0.7 附件',
    sourceUrl: 'https://github.com/chhylp123/hifiasm/releases/tag/v0.7',
    downloadUrl: 'https://github.com/chhylp123/hifiasm/releases/download/v0.7/chr11-2M.fa.gz',
    fileName: 'chr11-2M.fa.gz',
    format: 'FASTA.GZ (PacBio HiFi reads)',
    compressedBytes: 24718504, // ~24 MB
    softwareVersion: 'Hifiasm v0.19.8 / v0.20.0+',
    installCommand: 'git clone https://github.com/chhylp123/hifiasm.git && cd hifiasm && make -j 4',
    downloadCommand: 'curl -L -o chr11-2M.fa.gz https://github.com/chhylp123/hifiasm/releases/download/v0.7/chr11-2M.fa.gz',
    quickStartCommand: './hifiasm -o test_hifi -t 4 -f 0 chr11-2M.fa.gz 2> test.log',
    expectedOutputs: [
      'test_hifi.bp.p_ctg.gfa (主要组装单倍型 Contig 图)',
      'test_hifi.bp.a_ctg.gfa (次要单倍型 Contig 图)',
      'test.log (组装过程日志与 k-mer 统计)'
    ],
    estimatedDuration: '约 1~3 分钟',
    durationBasis: '4 线程 CPU、SSD 存储、24MB 输入数据',
    cpuRecommendation: '4 核心',
    memoryRecommendation: '4 GB RAM',
    verificationStatus: 'documented',
    limitations: '仅用于测试软件编译安装与基本命令参数，不反映植物大基因组（如玉米、小麦）杂合度与多倍化下的实际组装表现。'
  },

  // 2. OrthoFinder 同源基因推断
  {
    tutorialId: 'orthofinder-intro',
    datasetId: 'orthofinder-example-data',
    title: 'OrthoFinder 官方微型蛋白数据集 (ExampleData)',
    organism: 'Mycoplasma (4 种支原体蛋白组)',
    datasetType: 'official_example',
    sourceName: 'OrthoFinder GitHub Release v3.2',
    sourceUrl: 'https://github.com/OrthoFinder/OrthoFinder/releases/tag/v3.2',
    downloadUrl: 'https://github.com/OrthoFinder/OrthoFinder/releases/download/v3.2/ExampleData.tar.gz',
    fileName: 'ExampleData.tar.gz',
    format: 'TAR.GZ (4 个 FASTA 蛋白文件)',
    compressedBytes: 1536000, // ~1.5 MB
    softwareVersion: 'OrthoFinder 3.2.0',
    installCommand: 'micromamba create -n orthofinder-demo -c conda-forge -c bioconda python=3.12 orthofinder=3.2',
    downloadCommand: 'curl -L -o ExampleData.tar.gz https://github.com/OrthoFinder/OrthoFinder/releases/download/v3.2/ExampleData.tar.gz && tar -xzf ExampleData.tar.gz',
    quickStartCommand: 'orthofinder -f ExampleData -t 2 -a 2',
    expectedOutputs: [
      'Orthogroups.tsv (同源正交群矩阵表)',
      'SpeciesTree_rooted.txt (有根物种树)',
      'Statistics_Overall.tsv (同源聚类汇总统计)'
    ],
    estimatedDuration: '实测 48 秒',
    durationBasis: 'WSL Ubuntu 22.04、2 线程 DIAMOND 搜索',
    cpuRecommendation: '2 核心',
    memoryRecommendation: '2 GB RAM',
    verificationStatus: 'executed',
    verificationEvidence: [
      'examples/orthofinder/verified-20261121/Log.txt',
      'examples/orthofinder/verified-20261121/SpeciesTree_rooted.txt'
    ],
    limitations: '原生物种蛋白数较少（约 500~800 基因/物种）；植物全基因组分析通常涉及 3~5 万基因，耗时和内存需求随物种平方增长。'
  },

  // 3. SyRI 结构变异与共线性识别
  {
    tutorialId: 'syri-intro',
    datasetId: 'syri-arabidopsis-chr4',
    title: 'SyRI 官方拟南芥第 4 染色体比对示例数据',
    organism: 'Arabidopsis thaliana (Col-0 vs Ler 第 4 染色体)',
    datasetType: 'reference_derived',
    sourceName: 'Schneeberger Lab SyRI 官方示例仓库 (commit acf72cc)',
    sourceUrl: 'https://schneebergerlab.github.io/syri/example.html',
    downloadUrl: 'https://github.com/schneebergerlab/syri/archive/acf72cc.zip',
    fileName: 'syri-example-acf72cc.zip',
    format: 'FASTA / NUCmer coords',
    softwareVersion: 'SyRI 1.8.2；MUMmer 3.23',
    installCommand: 'micromamba create -n syri-demo -c conda-forge -c bioconda python=3.11 syri=1.8.2 mummer=3.23',
    downloadCommand: 'git clone https://github.com/schneebergerlab/syri.git && cd syri/example',
    quickStartCommand: 'nucmer --maxmatch -c 100 -b 500 -l 50 ref.fa qry.fa && delta-filter -m -i 90 -l 100 out.delta > out.filtered.delta && show-coords -THrd out.filtered.delta > out.coords && syri -c out.coords -d out.filtered.delta -r ref.fa -q qry.fa',
    expectedOutputs: [
      'syri.out (全染色体结构变异与共线性块坐标表)',
      'syri.vcf (标准 VCF 格式的倒位、易位与局部重排)',
      'syri.summary (各类结构变异统计概览)'
    ],
    estimatedDuration: '实测 1 分 12 秒',
    durationBasis: 'WSL Ubuntu、单核比对过滤与 SyRI 构图解析',
    cpuRecommendation: '2 核心',
    memoryRecommendation: '4 GB RAM',
    verificationStatus: 'executed',
    verificationEvidence: [
      'examples/syri/verified-20261121/mummer_syri.summary',
      'examples/syri/verified-20261121/mummer_syri.log'
    ],
    limitations: '仅分析单一染色体对；全基因组分析需注意染色体同源命名一致性及大片段着丝粒重复区的比对噪声。'
  },

  // 4. Bismark 甲基化数据处理
  {
    tutorialId: 'bismark-synthetic',
    datasetId: 'bismark-synthetic-reads',
    title: 'Bismark 亚硫酸氢盐测序合成测试数据',
    organism: 'Synthetic (植物基因组典型 CpG/CHG/CHH 甲基化特征仿真)',
    datasetType: 'synthetic',
    sourceName: 'PhytoMethods 官方可复现测试套件',
    sourceUrl: 'https://github.com/hao1006sy-source/phytomethods/tree/main/examples/bismark',
    fileName: 'bismark_synthetic_demo.fastq',
    format: 'FASTQ (配对 150bp 双端模拟测序数据)',
    compressedBytes: 520000,
    softwareVersion: 'Bismark 0.24.2 / Bowtie2 2.5.4',
    installCommand: 'micromamba create -n bismark-demo -c bioconda bismark bowtie2 samtools',
    downloadCommand: 'curl -L -o bismark_demo.tar.gz https://github.com/hao1006sy-source/phytomethods/raw/main/examples/bismark/bismark_demo.tar.gz',
    quickStartCommand: 'bismark --bowtie2 -N 0 -L 20 --genome ref_folder -1 reads_R1.fq -2 reads_R2.fq && bismark_methylation_extractor --bedGraph --cutoff 3 reads_R1_bismark_bt2_pe.bam',
    expectedOutputs: [
      '*.bismark.cov.gz (位点级别甲基化覆盖与胞嘧啶状态)',
      '*_splitting_report.txt (全基因组 CpG/CHG/CHH 转化率报告)',
      '*.bedGraph.gz (基因组浏览器可导入的连续甲基化轨迹)'
    ],
    estimatedDuration: '实测 32 秒',
    durationBasis: 'WSL Ubuntu、2 线程 Bowtie2 比对',
    cpuRecommendation: '2 核心',
    memoryRecommendation: '4 GB RAM',
    verificationStatus: 'executed',
    verificationEvidence: [
      'examples/bismark/verified-20261121/run.txt',
      'examples/bismark/verified-20261121/bismark_demo_splitting_report.txt'
    ],
    limitations: '模拟数据测序深度与转录本长度规整，未包含真实植物重亚硫酸氢盐转化不完全产生的系统背景误差。'
  },

  // 5. PLINK 群体遗传基础
  {
    tutorialId: 'plink-synthetic',
    datasetId: 'plink-synthetic-bed',
    title: 'PLINK 795 样本多位点质控测试集',
    organism: 'Synthetic (模拟水稻双等位基因 SNP 矩阵)',
    datasetType: 'synthetic',
    sourceName: 'PhytoMethods 群体遗传学测试集',
    sourceUrl: 'https://github.com/hao1006sy-source/phytomethods/tree/main/examples/plink',
    fileName: 'plink_synthetic_demo.bed',
    format: 'PLINK 二进制格式 (.bed/.bim/.fam)',
    compressedBytes: 860000,
    softwareVersion: 'PLINK 1.90b6.21',
    installCommand: 'micromamba create -n plink-demo -c bioconda plink',
    downloadCommand: 'curl -L -o plink_demo.zip https://github.com/hao1006sy-source/phytomethods/raw/main/examples/plink/plink_demo.zip',
    quickStartCommand: 'plink --bfile plink_synthetic_demo --maf 0.05 --geno 0.1 --mind 0.1 --make-bed --out clean_data && plink --bfile clean_data --indep-pairwise 50 5 0.2 --out pruned && plink --bfile clean_data --extract pruned.prune.in --pca 10 --out pca_result',
    expectedOutputs: [
      'clean_data.bed/.bim/.fam (位点与个体质控后的干净数据集)',
      'pruned.prune.in (去除连锁不平衡的高质量独立 SNP 集合)',
      'pca_result.eigenvec (样本前 10 个主成分特征向量矩阵)'
    ],
    estimatedDuration: '实测 18 秒',
    durationBasis: '单核执行、内存消耗 < 100 MB',
    cpuRecommendation: '1 核心',
    memoryRecommendation: '2 GB RAM',
    verificationStatus: 'executed',
    verificationEvidence: [
      'examples/plink/verified-20261121/run.txt',
      'examples/plink/verified-20261121/pca_result.eigenvec'
    ],
    limitations: '模拟了常规染色体分布与频率，但缺乏自交物种复杂的长程单倍型连锁块。'
  },

  // 6. GWAS 混合模型分析
  {
    tutorialId: 'gwas-synthetic',
    datasetId: 'gwas-synthetic-matrix',
    title: 'GWAS 表型与基因型混合线性模型测试集',
    organism: 'Synthetic (水稻株高模拟表型与 10,000 位点 SNP 矩阵)',
    datasetType: 'synthetic',
    sourceName: 'PhytoMethods 分子育种与 GWAS 测试套件',
    sourceUrl: 'https://github.com/hao1006sy-source/phytomethods/tree/main/examples/gwas',
    fileName: 'gwas_synthetic_input.tsv',
    format: 'TSV / CSV (含表型、PCA 协变量与基因型)',
    compressedBytes: 1200000,
    softwareVersion: 'R 4.3+；GAPIT 3 或 rrBLUP',
    installCommand: 'Rscript -e "install.packages(c(\'rrBLUP\', \'GAPIT\'), repos=\'https://cloud.r-project.org\')"',
    downloadCommand: 'curl -L -o gwas_demo.tar.gz https://github.com/hao1006sy-source/phytomethods/raw/main/examples/gwas/gwas_demo.tar.gz',
    quickStartCommand: 'Rscript examples/gwas/run_gwas_synthetic.R',
    expectedOutputs: [
      'gwas_pvalues.csv (全基因组各位点关联显著性 p 值表)',
      'manhattan_plot.png (全基因组曼哈顿图)',
      'qq_plot.png (检验模型控制群体分层膨胀效果的 QQ 图)'
    ],
    estimatedDuration: '实测 1 分 05 秒',
    durationBasis: '4 核并行拟合 MLM 混合模型',
    cpuRecommendation: '4 核心',
    memoryRecommendation: '4 GB RAM',
    verificationStatus: 'executed',
    verificationEvidence: [
      'examples/gwas/verified-20261121/run.txt',
      'examples/gwas/verified-20261121/gwas_pvalues.csv'
    ],
    limitations: '表型为正态连续数量性状，非二元抗病/抗逆性状；未包含显著环境交互效应 (G×E)。'
  },

  // 7. Scanpy 单细胞转录组分析
  {
    tutorialId: 'scanpy-synthetic',
    datasetId: 'scanpy-plant-root-matrix',
    title: '植物根尖单细胞转录组小型表达矩阵测试集',
    organism: 'Synthetic (模拟水稻根系分生区与分化区 1,200 个单细胞表达谱)',
    datasetType: 'synthetic',
    sourceName: 'PhytoMethods 单细胞组学教学套件',
    sourceUrl: 'https://github.com/hao1006sy-source/phytomethods/tree/main/examples/scanpy',
    fileName: 'synthetic_singlecell_counts.h5ad',
    format: 'H5AD (AnnData 单细胞标准化结构)',
    compressedBytes: 2800000, // ~2.8 MB
    softwareVersion: 'Scanpy 1.10.0；Python 3.11',
    installCommand: 'micromamba create -n scanpy-demo -c conda-forge scanpy python-igraph leidenalg',
    downloadCommand: 'curl -L -o synthetic_singlecell_counts.h5ad https://github.com/hao1006sy-source/phytomethods/raw/main/examples/scanpy/synthetic_singlecell_counts.h5ad',
    quickStartCommand: 'python3 -c "import scanpy as sc; adata = sc.read_h5ad(\'synthetic_singlecell_counts.h5ad\'); sc.pp.filter_genes(adata, min_cells=3); sc.pp.normalize_total(adata); sc.pp.log1p(adata); sc.pp.highly_variable_genes(adata); sc.tl.pca(adata); sc.pp.neighbors(adata); sc.tl.umap(adata); sc.tl.leiden(adata); adata.write(\'processed.h5ad\')"',
    expectedOutputs: [
      'processed.h5ad (包含过滤、标准化、PCA、UMAP 坐标与 Leiden 聚类簇的完整对象)',
      'umap_clusters.png (2D 空间细胞类群聚类图谱)'
    ],
    estimatedDuration: '实测 45 秒',
    durationBasis: '单节点单进程、内存占用约 450 MB',
    cpuRecommendation: '2 核心',
    memoryRecommendation: '4 GB RAM',
    verificationStatus: 'executed',
    verificationEvidence: [
      'examples/scanpy/verified-20261121/run.txt',
      'examples/scanpy/verified-20261121/clusters.csv'
    ],
    limitations: '模拟了 1,200 个细胞，远小于真实植物根系 2~5 万细胞图谱，主要用于快速熟悉 AnnData 结构与 Scanpy 管道。'
  },

  // 8. WGCNA 加权基因共表达网络
  {
    tutorialId: 'wgcna-synthetic',
    datasetId: 'wgcna-synthetic-expression',
    title: 'WGCNA 植物胁迫响应共表达矩阵测试集',
    organism: 'Synthetic (模拟拟南芥干旱胁迫时间序列 3,000 基因 × 36 样本)',
    datasetType: 'synthetic',
    sourceName: 'PhytoMethods 转录调控网络测试套件',
    sourceUrl: 'https://github.com/hao1006sy-source/phytomethods/tree/main/examples/coexpression',
    fileName: 'synthetic_expression.tsv',
    format: 'TSV (已归一化 TPM 表达矩阵)',
    compressedBytes: 480000,
    softwareVersion: 'R 4.3+；WGCNA 1.72-5',
    installCommand: 'Rscript -e "BiocManager::install(c(\'impute\', \'preprocessCore\', \'WGCNA\'))"',
    downloadCommand: 'curl -L -o synthetic_expression.tsv https://github.com/hao1006sy-source/phytomethods/raw/main/examples/coexpression/verified-20261121/synthetic_expression.tsv',
    quickStartCommand: 'Rscript examples/coexpression/wgcna_demo.R results-wgcna-demo',
    expectedOutputs: [
      'modules.csv (每个基因划分的共表达模块颜色标识表)',
      'module_eigengenes.csv (各模块第一特征基因在 36 个样本中的表达特征)',
      'dendrogram.png (基于拓扑重叠矩阵 TOM 的基因聚类树图)'
    ],
    estimatedDuration: '实测 55 秒',
    durationBasis: '4 核并行计算邻接矩阵与 TOM 相似度',
    cpuRecommendation: '4 核心',
    memoryRecommendation: '4 GB RAM',
    verificationStatus: 'executed',
    verificationEvidence: [
      'examples/coexpression/verified-20261121/run.txt',
      'examples/coexpression/verified-20261121/modules.csv'
    ],
    limitations: '为了在 1 分钟内完成演示，对输入基因数做了过滤（3,000 变异基因）；全基因组分析建议结合软阈值功率选择曲线进行严谨质检。'
  },

  // 9. EDTA 转座元件全自动注释
  {
    tutorialId: 'edta-tutorial',
    datasetId: 'edta-rice-sample',
    title: 'EDTA 官方测试样本数据 (水稻基因组片段)',
    organism: 'Oryza sativa (水稻基因组 1 Mb 示例片段)',
    datasetType: 'official_example',
    sourceName: 'EDTA 官方 GitHub 测试集',
    sourceUrl: 'https://github.com/oushujun/EDTA/tree/master/test',
    downloadUrl: 'https://github.com/oushujun/EDTA/raw/master/test/genome.fa',
    fileName: 'genome.fa',
    format: 'FASTA (未掩蔽基因组序列)',
    compressedBytes: 1100000,
    softwareVersion: 'EDTA v2.0+',
    installCommand: 'conda create -n EDTA -c bioconda -c conda-forge edta',
    downloadCommand: 'curl -L -o genome.fa https://github.com/oushujun/EDTA/raw/master/test/genome.fa',
    quickStartCommand: 'EDTA.pl --genome genome.fa --species rice --step all --anno 1 --threads 4',
    expectedOutputs: [
      'genome.fa.EDTA.TElib.fa (从头识别构建的高质量非冗余 TE 库)',
      'genome.fa.EDTA.anno/genome.fa.TEanno.gff3 (全基因组转座子精细结构注释 GFF3)',
      'genome.fa.EDTA.anno/genome.fa.TEanno.sum (LTR、TIR、Helitron 等家族丰度汇总)'
    ],
    estimatedDuration: '约 10~25 分钟',
    durationBasis: '4 线程运行 LTR_retriever、TIR-Learner 与 HelitronScanner 流程',
    cpuRecommendation: '4~8 核心',
    memoryRecommendation: '8 GB RAM',
    verificationStatus: 'documented',
    limitations: '仅分析 1 Mb 区域验证流程；完整植物基因组（400 Mb ~ 2.5 Gb）注释往往需要 8~24 小时及 16~32 核心计算资源。'
  },

  // 10. CAFE 5 基因家族扩张与收缩分析
  {
    tutorialId: 'cafe5-intro',
    datasetId: 'cafe5-official-mammals',
    title: 'CAFE 5 官方哺乳动物 12 物种基因家族测试集',
    organism: '12 种哺乳动物系统发育基准（含人、黑猩猩、鼠等）',
    datasetType: 'official_example',
    sourceName: 'CAFE 5 GitHub 官方示例仓库 (commit 8d3ab08)',
    sourceUrl: 'https://github.com/hahnlab/CAFE5/tree/8d3ab080796eafa192241a1067398832d886592d',
    fileName: 'mammal_gene_families.txt',
    format: '文本文件 (树文件 .txt + 家族计数表 .txt)',
    compressedBytes: 380000,
    softwareVersion: 'CAFE5 1.1 (commit 8d3ab08)',
    installCommand: 'git clone --branch v5.1 --depth 1 https://github.com/hahnlab/CAFE5.git && cd CAFE5 && autoreconf -fi && ./configure && make -j4',
    downloadCommand: 'curl -L -o mammals_tree.txt https://raw.githubusercontent.com/hahnlab/CAFE5/8d3ab080796eafa192241a1067398832d886592d/examples/mammals_tree.txt && curl -L -o mammal_gene_families.txt https://raw.githubusercontent.com/hahnlab/CAFE5/8d3ab080796eafa192241a1067398832d886592d/examples/mammal_gene_families.txt',
    quickStartCommand: 'cafe5 -t mammals_tree.txt -i mammal_gene_families.txt -p -c 4 -o results-base && cafe5 -t mammals_tree.txt -i mammal_gene_families.txt -p -k 2 -c 4 -o results-gamma',
    expectedOutputs: [
      'Base_results.txt / Gamma_results.txt (最大似然估计速率 λ 与收敛报告)',
      'Base_family_results.txt (全基因组显著扩张/收缩基因家族判定表)',
      'Base_asr.tre (各祖先节点基因家族数量祖先状态重建树)'
    ],
    estimatedDuration: '实测 1 分 18 秒 (Base 模型) / 3 分 42 秒 (Gamma 模型)',
    durationBasis: 'WSL Ubuntu 26.04、4 核 OpenMP 并行计算',
    cpuRecommendation: '4 核心',
    memoryRecommendation: '4 GB RAM',
    verificationStatus: 'executed',
    verificationEvidence: [
      'examples/cafe5/verified-20261123/base-stdout.log',
      'examples/cafe5/verified-20261123/gamma-stdout.log',
      'examples/cafe5/verified-20261123/validation-results.json'
    ],
    limitations: '输入数据为官方 12 物种基准；植物基因组演化研究常伴随全基因组多倍化 (WGD) 事件，需注意是否需要设定多速率分枝模型。'
  }
];

export function getTutorialTestDataset(tutorialId: string): TutorialTestDataset | undefined {
  return tutorialTestDatasets.find(d => d.tutorialId === tutorialId);
}

export function getAllTutorialTestDatasets(): TutorialTestDataset[] {
  return tutorialTestDatasets;
}
