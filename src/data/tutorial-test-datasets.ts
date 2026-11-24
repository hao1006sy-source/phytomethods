/**
 * PhytoMethods 十篇教程经典小型测试数据集注册表 (Tutorial Test Datasets Registry)
 * 严格基于仓库已有实测数据、官方示例、真实公共测序数据与可核实模拟数据
 * 遵循原则：
 * 1. 严格反映真实验证状态 (executed / documented / not_verified)
 * 2. 绝不因为数据公开可下载而将模板教程随意升级为 verified
 * 3. 区分真实公共测序数据 (public_sequencing)、官方示例 (official_example) 与合成模拟数据 (synthetic)
 * 4. 严禁使用不存在的虚假归档路径，所有本地 evidence 路径必须在仓库中物理存在
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
    compressedBytes: 24718504,
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
    durationBasis: '4 线程 CPU、SSD 存储、24MB 输入数据 (官方文档典型耗时)',
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
    compressedBytes: 1536000,
    softwareVersion: 'OrthoFinder 3.2.0 (Diamond 2.1.8)',
    installCommand: 'micromamba create -n orthofinder-demo -c conda-forge -c bioconda python=3.12 orthofinder=3.2',
    downloadCommand: 'curl -L -o ExampleData.tar.gz https://github.com/OrthoFinder/OrthoFinder/releases/download/v3.2/ExampleData.tar.gz && tar -xzf ExampleData.tar.gz',
    quickStartCommand: 'orthofinder -f ExampleData -t 2 -a 2',
    expectedOutputs: [
      'Orthogroups.tsv (同源正交群矩阵表)',
      'SpeciesTree_rooted.txt (有根物种树)',
      'Statistics_Overall.tsv (同源聚类汇总统计)'
    ],
    estimatedDuration: '实测 48 秒',
    durationBasis: 'WSL Ubuntu 22.04、2 线程 DIAMOND 搜索、本地实测存档',
    cpuRecommendation: '2 核心',
    memoryRecommendation: '2 GB RAM',
    verificationStatus: 'executed',
    verificationEvidence: [
      'examples/orthofinder/verified-20261121/Log.txt',
      'examples/orthofinder/verified-20261121/SpeciesTree_rooted.txt',
      'examples/orthofinder/verified-20261121/Statistics_Overall.tsv'
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
    title: 'Bismark 植物胞嘧啶甲基化微型模拟测试集',
    organism: 'Synthetic (植物基因组典型 CpG/CHG/CHH 甲基化特征仿真)',
    datasetType: 'synthetic',
    sourceName: 'PhytoMethods 甲基化分析套件 (examples/methylation)',
    sourceUrl: 'https://github.com/hao1006sy-source/phytomethods/tree/main/examples/methylation',
    downloadUrl: 'https://raw.githubusercontent.com/hao1006sy-source/phytomethods/main/examples/methylation/synthetic-input-v2/reads.fastq',
    fileName: 'reads.fastq / reference.fa',
    format: 'FASTQ / FASTA (单端模拟重亚硫酸氢盐测序数据与微型参考序列)',
    compressedBytes: 15300,
    softwareVersion: 'Bismark Rust suite 3.3.0 / Bowtie2 2.5.5 / Samtools 1.25',
    installCommand: 'micromamba create -n bismark-demo -c bioconda bismark bowtie2 samtools',
    downloadCommand: 'curl -sLO https://raw.githubusercontent.com/hao1006sy-source/phytomethods/main/examples/methylation/synthetic-input-v2/reference.fa && curl -sLO https://raw.githubusercontent.com/hao1006sy-source/phytomethods/main/examples/methylation/synthetic-input-v2/reads.fastq',
    quickStartCommand: 'bismark_genome_preparation --bowtie2 . && bismark --bowtie2 -N 0 -L 20 . reads.fastq && bismark_methylation_extractor --bedGraph --CX reads_bismark_bt2.bam',
    expectedOutputs: [
      'reads_bismark_bt2.CX_report.txt (全胞嘧啶环境甲基化报告)',
      'reads_bismark_bt2_splitting_report.txt (转化率与甲基化率拆分统计报告)',
      'align.stderr.log (比对过程日志)'
    ],
    estimatedDuration: '实测 15 秒',
    durationBasis: '本地 WSL Ubuntu 环境、2 线程比对提取实测存档',
    cpuRecommendation: '2 核心',
    memoryRecommendation: '2 GB RAM',
    verificationStatus: 'executed',
    verificationEvidence: [
      'examples/methylation/verified-20261121/reads_bismark_bt2.CX_report.txt',
      'examples/methylation/verified-20261121/reads_bismark_bt2_splitting_report.txt',
      'examples/methylation/verified-20261121/align.stderr.log'
    ],
    limitations: '基于合成序列模拟，旨在检验 Bismark 基因组准备、单端比对与 CX 上下文甲基化拆分链路；实际植物全基因组 BS-seq 需注意大基因组构建索引耗时与非完全转化对照 (如叶绿体 DNA)。'
  },

  // 5. PLINK 群体遗传基础
  {
    tutorialId: 'plink-synthetic',
    datasetId: 'plink-synthetic-vcf',
    title: 'PLINK 8 样本微型模拟基因型测试集',
    organism: 'Synthetic (模拟 8 个个体 × 6 个多态位点二倍体基因型 VCF)',
    datasetType: 'synthetic',
    sourceName: 'PhytoMethods 群体遗传分析套件 (examples/population)',
    sourceUrl: 'https://github.com/hao1006sy-source/phytomethods/tree/main/examples/population',
    downloadUrl: 'https://raw.githubusercontent.com/hao1006sy-source/phytomethods/main/examples/population/simulated-genotypes.vcf',
    fileName: 'simulated-genotypes.vcf',
    format: 'VCF v4.2 (二倍体基因型矩阵与样本 ID)',
    compressedBytes: 2800,
    softwareVersion: 'PLINK 1.9.1 (1.90b6.21)',
    installCommand: 'micromamba create -n plink-demo -c bioconda plink',
    downloadCommand: 'curl -sLO https://raw.githubusercontent.com/hao1006sy-source/phytomethods/main/examples/population/simulated-genotypes.vcf',
    quickStartCommand: 'plink --vcf simulated-genotypes.vcf --freq --pca --out analysis --double-id --allow-extra-chr',
    expectedOutputs: [
      'analysis.frq (等位基因频率计算结果)',
      'analysis.eigenval (PCA 特征值)',
      'analysis.eigenvec (样本主成分坐标向量)',
      'analysis.log (PLINK 执行过程完整日志)'
    ],
    estimatedDuration: '实测 1 秒 (秒级瞬时)',
    durationBasis: '本地 WSL Ubuntu 环境、单核 PLINK 1.9.1 实测存档',
    cpuRecommendation: '1 核心',
    memoryRecommendation: '1 GB RAM',
    verificationStatus: 'executed',
    verificationEvidence: [
      'examples/population/verified-plink-20261121/analysis.eigenval',
      'examples/population/verified-plink-20261121/analysis.eigenvec',
      'examples/population/verified-plink-20261121/analysis.frq',
      'examples/population/verified-plink-20261121/analysis.log'
    ],
    limitations: '本测试集由 examples/population/generate_vcf.py 生成，设计用于验证 VCF 到 PLINK 频率分析与 PCA 管道通畅性，规模极小（8 样本 6 SNP），不具备真实群体遗传结构的统计学解释意义。'
  },

  // 6. GWAS 混合模型分析
  {
    tutorialId: 'gwas-synthetic',
    datasetId: 'gwas-synthetic-demo',
    title: 'GWAS 线性回归关联分析演示脚本与模拟数据',
    organism: 'Synthetic (模拟植物株高表型与单核苷酸多态性矩阵)',
    datasetType: 'synthetic',
    sourceName: 'PhytoMethods GWAS 关联分析套件 (examples/gwas)',
    sourceUrl: 'https://github.com/hao1006sy-source/phytomethods/tree/main/examples/gwas',
    downloadUrl: 'https://raw.githubusercontent.com/hao1006sy-source/phytomethods/main/examples/gwas/gwas_demo.py',
    fileName: 'gwas_demo.py',
    format: 'Python 脚本与 CSV 数据 (Python 3.13 / SciPy 1.18.1 / NumPy 2.5.2)',
    compressedBytes: 4200,
    softwareVersion: 'Python 3.13.9, SciPy 1.18.1, NumPy 2.5.2, Matplotlib 3.10.1',
    installCommand: 'pip install scipy numpy matplotlib pandas',
    downloadCommand: 'curl -sLO https://raw.githubusercontent.com/hao1006sy-source/phytomethods/main/examples/gwas/gwas_demo.py',
    quickStartCommand: 'python3 gwas_demo.py results-gwas',
    expectedOutputs: [
      'associations.csv (位点关联检验显著性 p 值与回归系数)',
      'genotypes.csv (模拟基因型矩阵)',
      'phenotypes.csv (模拟表型向量)',
      'gwas.png (Manhattan 图与关联信号)',
      'run.json (执行环境与运行时参数记录)'
    ],
    estimatedDuration: '实测 3 秒',
    durationBasis: '本地 Python 3.13 实测执行日志',
    cpuRecommendation: '1 核心',
    memoryRecommendation: '1 GB RAM',
    verificationStatus: 'executed',
    verificationEvidence: [
      'examples/gwas/verified-20261121/associations.csv',
      'examples/gwas/verified-20261121/genotypes.csv',
      'examples/gwas/verified-20261121/phenotypes.csv',
      'examples/gwas/verified-20261121/gwas.png',
      'examples/gwas/verified-20261121/run.json'
    ],
    limitations: '使用 SciPy 普通最小二乘回归演示 GWAS 基本概念；真实植物 GWAS 分析应使用混合线性模型（如 GAPIT / GEMMA）以严格矫正群体结构 (Q/PCA) 与亲缘关系亲权矩阵 (K)。'
  },

  // 7. Scanpy 单细胞转录组分析
  {
    tutorialId: 'scanpy-synthetic',
    datasetId: 'scanpy-singlecell-demo',
    title: 'Scanpy 植物单细胞质控与聚类分析脚本及测试集',
    organism: 'Synthetic (模拟植物分生组织 60 细胞 × 20 基因表达矩阵)',
    datasetType: 'synthetic',
    sourceName: 'PhytoMethods 单细胞组学分析套件 (examples/single-cell)',
    sourceUrl: 'https://github.com/hao1006sy-source/phytomethods/tree/main/examples/single-cell',
    downloadUrl: 'https://raw.githubusercontent.com/hao1006sy-source/phytomethods/main/examples/single-cell/scanpy_demo.py',
    fileName: 'scanpy_demo.py',
    format: 'Python 脚本与 CSV 数据 (Scanpy 1.13.0 / igraph 1.0.0 / leidenalg 0.12.0)',
    compressedBytes: 3600,
    softwareVersion: 'Scanpy 1.13.0, python-igraph 1.0.0, leidenalg 0.12.0',
    installCommand: 'pip install scanpy python-igraph leidenalg',
    downloadCommand: 'curl -sLO https://raw.githubusercontent.com/hao1006sy-source/phytomethods/main/examples/single-cell/scanpy_demo.py',
    quickStartCommand: 'python3 scanpy_demo.py results-singlecell',
    expectedOutputs: [
      'cell_results.csv (包含 Leiden 聚类簇分配与 UMAP 坐标的细胞分析结果)',
      'qc_before.csv (过滤前单细胞质控指标)',
      'simulated_counts.csv (模拟原始计数矩阵)',
      'run.json (执行环境与聚类参数记录)'
    ],
    estimatedDuration: '实测 4 秒',
    durationBasis: '本地 Python 3 环境与 Scanpy 1.13.0 实测执行',
    cpuRecommendation: '1 核心',
    memoryRecommendation: '1 GB RAM',
    verificationStatus: 'executed',
    verificationEvidence: [
      'examples/single-cell/verified-20261121/cell_results.csv',
      'examples/single-cell/verified-20261121/qc_before.csv',
      'examples/single-cell/verified-20261121/simulated_counts.csv',
      'examples/single-cell/verified-20261121/run.json'
    ],
    limitations: '用于验证 Scanpy 完整流程（质控、高变基因选择、PCA 降维、邻近图构建与 Leiden 聚类）；输入为 60 细胞 × 20 基因的极简模拟数据，真实单细胞研究通常包含数万细胞。'
  },

  // 8. WGCNA 加权基因共表达网络
  {
    tutorialId: 'wgcna-synthetic',
    datasetId: 'wgcna-synthetic-expression',
    title: 'WGCNA 植物表达谱共表达网络分析脚本与矩阵',
    organism: 'Synthetic (模拟植物胁迫响应 36 样本 × 60 基因表达矩阵)',
    datasetType: 'synthetic',
    sourceName: 'PhytoMethods 基因共表达分析套件 (examples/coexpression)',
    sourceUrl: 'https://github.com/hao1006sy-source/phytomethods/tree/main/examples/coexpression',
    downloadUrl: 'https://raw.githubusercontent.com/hao1006sy-source/phytomethods/main/examples/coexpression/verified-20261121/synthetic_expression.tsv',
    fileName: 'synthetic_expression.tsv / wgcna_demo.R',
    format: 'TSV (表达矩阵) 与 R 脚本',
    compressedBytes: 12000,
    softwareVersion: 'R 4.5.1 / WGCNA 1.74',
    installCommand: 'Rscript -e "install.packages(c(\'WGCNA\', \'dynamicTreeCut\'), repos=\'https://cloud.r-project.org\')"',
    downloadCommand: 'curl -sLO https://raw.githubusercontent.com/hao1006sy-source/phytomethods/main/examples/coexpression/verified-20261121/synthetic_expression.tsv && curl -sLO https://raw.githubusercontent.com/hao1006sy-source/phytomethods/main/examples/coexpression/wgcna_demo.R',
    quickStartCommand: 'Rscript wgcna_demo.R results-wgcna',
    expectedOutputs: [
      'modules.csv (基因模块归属划分表)',
      'module_eigengenes.csv (各共表达模块的第一特征向量)',
      'synthetic_expression.tsv (输入的标准化表达矩阵)',
      'run.txt (R 环境与执行运行日志)'
    ],
    estimatedDuration: '实测 6 秒',
    durationBasis: '本地 R 4.5.1 / WGCNA 1.74 实测运行记录',
    cpuRecommendation: '1 核心',
    memoryRecommendation: '2 GB RAM',
    verificationStatus: 'executed',
    verificationEvidence: [
      'examples/coexpression/verified-20261121/modules.csv',
      'examples/coexpression/verified-20261121/module_eigengenes.csv',
      'examples/coexpression/verified-20261121/synthetic_expression.tsv',
      'examples/coexpression/verified-20261121/run.txt'
    ],
    limitations: '测试集经规模剪裁（60 个特征基因），用于快速演示拓扑重叠矩阵 (TOM) 计算、层次聚类与动态剪枝；真实植物共表达分析通常需筛选方差排名前 25%~50%（如 5,000~15,000）的表达基因。'
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
    downloadUrl: 'https://raw.githubusercontent.com/oushujun/EDTA/master/test/genome.fa',
    fileName: 'genome.fa',
    format: 'FASTA (未掩蔽基因组序列)',
    compressedBytes: 1048576,
    softwareVersion: 'EDTA v2.0+',
    installCommand: 'conda create -n EDTA -c bioconda -c conda-forge edta',
    downloadCommand: 'curl -L -o genome.fa https://raw.githubusercontent.com/oushujun/EDTA/master/test/genome.fa',
    quickStartCommand: 'EDTA.pl --genome genome.fa --species rice --step all --anno 1 --threads 4',
    expectedOutputs: [
      'genome.fa.EDTA.TElib.fa (从头识别构建的高质量非冗余 TE 库)',
      'genome.fa.EDTA.anno/genome.fa.TEanno.gff3 (全基因组转座子精细结构注释 GFF3)',
      'genome.fa.EDTA.anno/genome.fa.TEanno.sum (LTR、TIR、Helitron 等家族丰度汇总)'
    ],
    estimatedDuration: '约 10~25 分钟',
    durationBasis: '4 线程运行 LTR_retriever、TIR-Learner 与 HelitronScanner 流程 (官方文档)',
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
    downloadUrl: 'https://raw.githubusercontent.com/hahnlab/CAFE5/8d3ab080796eafa192241a1067398832d886592d/examples/mammal_gene_families.txt',
    fileName: 'mammal_gene_families.txt / mammals_tree.txt',
    format: '文本文件 (系统发育树 .txt + 家族计数表 .txt)',
    compressedBytes: 380000,
    softwareVersion: 'CAFE5 1.1 (commit 8d3ab08)',
    installCommand: 'git clone --branch v5.1 --depth 1 https://github.com/hahnlab/CAFE5.git && cd CAFE5 && autoreconf -fi && ./configure && make -j4',
    downloadCommand: 'curl -sLO https://raw.githubusercontent.com/hahnlab/CAFE5/8d3ab080796eafa192241a1067398832d886592d/examples/mammals_tree.txt && curl -sLO https://raw.githubusercontent.com/hahnlab/CAFE5/8d3ab080796eafa192241a1067398832d886592d/examples/mammal_gene_families.txt',
    quickStartCommand: 'cafe5 -t mammals_tree.txt -i mammal_gene_families.txt -p -c 4 -o results-base && cafe5 -t mammals_tree.txt -i mammal_gene_families.txt -p -k 2 -c 4 -o results-gamma',
    expectedOutputs: [
      'Base_results.txt / Gamma_results.txt (最大似然估计速率 λ 与收敛报告)',
      'Base_family_results.txt (全基因组显著扩张/收缩基因家族判定表)',
      'Base_asr.tre (各祖先节点基因家族数量祖先状态重建树)'
    ],
    estimatedDuration: '实测 1 分 18 秒 (Base 模型) / 3 分 42 秒 (Gamma 模型)',
    durationBasis: 'WSL Ubuntu、4 核 OpenMP 并行计算、本地实测验证',
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
