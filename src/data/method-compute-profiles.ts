/**
 * PhytoMethods 核心算法与工具计算资源与运行规模基准数据库
 * 遵循科研严谨性原则：
 * 1. 严格基于官方 Benchmark、实测记录与高水平发表文献
 * 2. 详细标明输入数据规模、物种类型及物理硬件规格
 * 3. 区分本地实测基准 (empirical_log) 与权威发表基准 (published_benchmark)
 * 4. 严禁捏造未经测试的虚假数据，标明核查日期与对应表格/章节
 * 5. 无法找到原始表格行、实际执行日志或完整实验条件时，明确标注为「暂无可核实的运行时间基准」与「暂无可核实的峰值内存基准」
 */

export interface MethodComputeProfile {
  methodId: string;
  name: string;
  hasBenchmark: boolean;
  softwareVersion?: string;
  datasetOrSpecies?: string;
  inputScale?: string;
  benchmarkType?: 'empirical_log' | 'published_benchmark' | 'no_verified_benchmark';
  verifiedDate?: string;
  benchmarkSectionOrTable?: string;
  scenario?: string;
  hardware?: string;
  peakMemory?: string;
  runtime?: string;
  cpuScalability?: string;
  scalingFormula?: string;
  bottleneckTips?: string;
  evidenceSource?: string;
}

export const methodComputeProfiles: Record<string, MethodComputeProfile> = {
  hifiasm: {
    methodId: 'hifiasm',
    name: 'Hifiasm',
    hasBenchmark: true,
    softwareVersion: 'Hifiasm v0.12 (参数: -t48 -l0)',
    datasetOrSpecies: 'Zea mays (近交系 B73 参考组装)',
    inputScale: '2.2 Gb 基因组, 22× PacBio HiFi reads',
    benchmarkType: 'published_benchmark',
    verifiedDate: '2026-11-24',
    benchmarkSectionOrTable: 'GitHub Benchmarking Table & Nature Methods (2021) Table 1',
    scenario: '植物参考基因组组装 (玉米 B73 近交系, 2.2 Gb, 22x PacBio HiFi reads, 参数: -t48 -l0)',
    hardware: '48 CPU 线程 (实测配置), 推荐 ≥ 128 GB 物理内存',
    peakMemory: '68 GB RAM (官方实测)',
    runtime: '实测 5.1 小时 (Wall-clock, 48 线程) / 203.2 小时 (CPU 时间)',
    cpuScalability: '多线程扩展性良好，推荐 32~48 线程；线程数过高易受磁盘 I/O 吞吐制约',
    scalingFormula: '内存占用与基因组大小 $G$ 和杂合度呈正比；时间复杂度接近 $O(N \\log N)$',
    bottleneckTips: '处理超大植物基因组时切勿盲目关闭 `-f 0`（Bloom filter），开启过滤可显著降低低频错误 k-mer 带来的巨大内存开销。',
    evidenceSource: 'Hifiasm 官方基准表 (https://github.com/chhylp123/hifiasm) & Cheng et al. Nature Methods (2021)'
  },
  orthofinder: {
    methodId: 'orthofinder',
    name: 'OrthoFinder',
    hasBenchmark: true,
    softwareVersion: 'OrthoFinder v2.5+ (搭配 DIAMOND v2.x)',
    datasetOrSpecies: '真核生物代表性全蛋白质组',
    inputScale: '多物种代表性单一最长蛋白本',
    benchmarkType: 'published_benchmark',
    verifiedDate: '2026-11-24',
    benchmarkSectionOrTable: 'Genome Biology (2019) 20:238 Figure 5 & Scalability section',
    scenario: '跨物种同源正交群推断 (真核生物全蛋白质组，DIAMOND 模式)',
    hardware: '16~32 CPU 线程, 推荐 ≥ 64 GB RAM',
    peakMemory: '暂无可核实的峰值内存基准 (推荐配置 ≥ 32 GB RAM, 视输入蛋白数而定)',
    runtime: '暂无可核实的运行时间基准 (原始论文 Fig 5 仅展示相对耗时曲线，无特定植物全蛋白组绝对时长表格行，待独立测定)',
    cpuScalability: 'DIAMOND 双向全比对阶段近乎线性扩展；树推断阶段为多进程调度',
    scalingFormula: '全对全比对计算量随物种数 $S$ 呈 $O(S^2)$ 二次增长',
    bottleneckTips: '输入前务必剔除转录本选择性剪接（每个基因仅保留代表性最长蛋白本），以避免多转录本引入冗余序列比对并大幅降低计算开销。',
    evidenceSource: 'Emms & Kelly Genome Biology (2019) Figure 5'
  },
  edta: {
    methodId: 'edta',
    name: 'EDTA',
    hasBenchmark: true,
    softwareVersion: 'EDTA v1.x (整合 LTR_retriever, TIR-Learner, HelitronScanner 等)',
    datasetOrSpecies: '植物全基因组从头重复序列注释场景',
    inputScale: '全基因组 FASTA 序列',
    benchmarkType: 'published_benchmark',
    verifiedDate: '2026-11-24',
    benchmarkSectionOrTable: 'Genome Biology (2019) 20:275 Additional file 2: Table S2',
    scenario: '全基因组转座子全面从头注释与过滤管线',
    hardware: '多核计算节点 (支持多线程并行，推荐 ≥ 32 GB RAM)',
    peakMemory: '暂无可核实的峰值内存基准 (论文 Additional file 2 Table S2 仅记录了各单独子程序在不同平台的开销，全管线整体基准待独立测定)',
    runtime: '暂无可核实的运行时间基准 (论文未单列全管线实测总耗时，待独立测定)',
    cpuScalability: '支持多线程并行，但部分 LTR_retriever 与 RepeatModeler 模块存在单线程瓶颈',
    scalingFormula: '运行时间受基因组大小与转座子重复度双重影响，重复度极高的大基因组需申请长时作业队列',
    bottleneckTips: '建议挂载高性能本地 SSD scratch 盘；大基因组推荐按染色体分批运行或合理设置 `--sensitive 0` 预筛选。',
    evidenceSource: 'Ou et al. Genome Biology (2019) 20:275 Additional file 2: Table S2'
  },
  cafe5: {
    methodId: 'cafe5',
    name: 'CAFE 5',
    hasBenchmark: true,
    softwareVersion: 'CAFE5 1.1 (v5.1, commit 8d3ab08)',
    datasetOrSpecies: '12 种哺乳动物系统发育基准基因家族',
    inputScale: '12 物种 × 12,653 个基因家族计数表 (模型分析保留 10,956 个家族)',
    benchmarkType: 'empirical_log',
    verifiedDate: '2026-11-24',
    benchmarkSectionOrTable: 'examples/cafe5/verified-20261123/execution.json',
    scenario: '基因家族收缩与扩张演化分析 (官方 12 物种基准，12,653 原始家族，Base 单 λ 与 2 类别 Gamma 离散模型)',
    hardware: 'WSL Ubuntu 24.04, 4 CPU 线程, 16 GB 宿主物理内存',
    peakMemory: '暂无峰值内存实测记录 (推荐配置 ≥ 4 GB RAM)',
    runtime: 'Base 模型实测 187.99 秒 (3分08秒)；Gamma 模型实测 828.50 秒 (13分48秒)',
    cpuScalability: '支持 `-c` 多核 OpenMP 似然计算加速，推荐 4~8 线程',
    scalingFormula: '似然拟合时间随基因家族最大成员数与物种树节点数呈超线性增长',
    bottleneckTips: '输入前强烈建议过滤掉单一物种成员数极端庞大（如 >100 拷贝）的离群家族，否则可能引起数值溢出并拖慢全局收敛。',
    evidenceSource: '本地实测执行日志 (execution.json / validation-results.json) & Mendes et al. Bioinformatics (2020)'
  },
  plink: {
    methodId: 'plink',
    name: 'PLINK',
    hasBenchmark: true,
    softwareVersion: 'PLINK 1.90b / PLINK 2.0',
    datasetOrSpecies: '群体全基因组变异数据集',
    inputScale: '高密度双等位基因 SNP 标记',
    benchmarkType: 'published_benchmark',
    verifiedDate: '2026-11-24',
    benchmarkSectionOrTable: 'GigaScience (2015) 4:7 Table 2',
    scenario: '全基因组群体质控、过滤与关联统计分析',
    hardware: '4 核心 8 线程 (普通台式机或集群节点), 推荐 ≥ 8 GB RAM',
    peakMemory: '暂无可核实的峰值内存基准 (待独立测定)',
    runtime: '暂无可核实的运行时间基准 (原始论文表 2 仅测试部分人类步骤，全量软硬件基准待独立测定)',
    cpuScalability: '位点独立位运算多线程扩展极佳，I/O 速度影响显著',
    scalingFormula: '采用紧凑 2-bit 二进制床文件存储，空间与时间复杂度严格保持 $O(M \\cdot N / 4)$',
    bottleneckTips: '优先使用二进制 `.bed/.bim/.fam` 格式，避免直接对巨大纯文本 VCF 重复解压与扫描。',
    evidenceSource: 'Chang et al. GigaScience (2015) 4:7 Table 2'
  },
  gapit: {
    methodId: 'gapit',
    name: 'GAPIT',
    hasBenchmark: true,
    softwareVersion: 'GAPIT3 (含 FarmCPU / Blink 算法实现；原始独立算法见 FarmCPU R 包)',
    datasetOrSpecies: '植物群体 GWAS 基因型与表型数据 (支持多种混合模型)',
    inputScale: '通常为数百至数千个体、数万至数百万 SNP 位点',
    benchmarkType: 'published_benchmark',
    verifiedDate: '2026-11-24',
    benchmarkSectionOrTable: 'PLOS Genetics (2016) 12(2): e1005767 Computational efficiency & Figure 6',
    scenario: '全基因组关联分析 (GAPIT3 集成实现；包含 FarmCPU / Blink 等迭代模型)',
    hardware: '4~8 CPU 核心 (普通台式机/工作站)',
    peakMemory: '暂无可核实的峰值内存基准 (待独立测定)',
    runtime: '暂无可核实的运行时间基准 (原始 FarmCPU 论文主要在模拟数据上测试，GAPIT3 实现下的实测运行时间待独立测定)',
    cpuScalability: 'FarmCPU 与 Blink 算法分块迭代计算，多核加速比良好',
    scalingFormula: '传统 MLM 为 $O(N^3)$ 复杂度；FarmCPU 优化为迭代固定效应模型，计算量降至近 $O(M \\cdot N)$',
    bottleneckTips: '样本量较大时建议选用 `model=c("Blink")` 或 `FarmCPU`，避免纯 MLM 引起的亲缘关系矩阵求逆内存膨胀。',
    evidenceSource: 'Liu et al. PLOS Genetics (2016) 12(2): e1005767 (DOI: 10.1371/journal.pgen.1005767)'
  },
  syri: {
    methodId: 'syri',
    name: 'SyRI',
    hasBenchmark: true,
    softwareVersion: 'SyRI 1.4+ / 1.8.2',
    datasetOrSpecies: '染色体级别双基因组全组装',
    inputScale: '同源染色体共线性比对文件 (BAM/PAF)',
    benchmarkType: 'published_benchmark',
    verifiedDate: '2026-11-24',
    benchmarkSectionOrTable: 'Genome Biology (2019) 20:277 Table 1',
    scenario: '染色体级别双基因组结构变异识别 (全基因组比对与重排解析)',
    hardware: '8~16 CPU 线程, 推荐 ≥ 16 GB RAM',
    peakMemory: '暂无可核实的峰值内存基准 (待独立测定)',
    runtime: '暂无可核实的运行时间基准 (原始论文 Table 1 仅统计变异数量，未包含算力耗时表格行，待独立测定)',
    cpuScalability: 'SyRI 本身为单进程/多线程图遍历算法，比对阶段多核扩展充分',
    scalingFormula: '与染色体分块比对规模和局部结构重排复杂度呈线性相关',
    bottleneckTips: '比对前确保两套基因组的染色体命名与顺序一致，且务必使用 `--csrc` 选项保留足够跨越比对。',
    evidenceSource: 'Goel et al. Genome Biology (2019) 20:277 Table 1'
  },
  'minigraph-cactus': {
    methodId: 'minigraph-cactus',
    name: 'Minigraph-Cactus',
    hasBenchmark: true,
    softwareVersion: 'Minigraph-Cactus v2.6+',
    datasetOrSpecies: '多基因组染色体级别组装数据集',
    inputScale: '多单倍型基因组全序列 (碱基级对齐泛基因组图)',
    benchmarkType: 'published_benchmark',
    verifiedDate: '2026-11-24',
    benchmarkSectionOrTable: 'Nature Biotechnology (2023) 41:1447-1456 Methods Benchmarks',
    scenario: '高质量碱基级图形泛基因组构建',
    hardware: '推荐 64+ CPU 线程, 128~256 GB RAM, 本地 NVMe SSD',
    peakMemory: '暂无可核实的峰值内存基准 (人类基准单节点任务分配 128~256 GB RAM，特定植物配置待独立测定)',
    runtime: '暂无可核实的运行时间基准 (人类 HPRC 94 单倍型全流程约 14,000 CPU 小时，无特定植物独立表格行，待独立测定)',
    cpuScalability: '基于 Toil 分布式任务调度，支持多节点计算集群与多核高并发',
    scalingFormula: '计算复杂度随加入基因组数非线性递增，碱基级对齐阶段计算量大',
    bottleneckTips: '建议严格设置 Docker/Singularity 共享临时目录于本地高速 NVMe 盘，避免由于分布式网络文件系统网络延迟造成任务停滞。',
    evidenceSource: 'Hickey et al. Nature Biotechnology (2023)'
  },
  deseq2: {
    methodId: 'deseq2',
    name: 'DESeq2',
    hasBenchmark: true,
    softwareVersion: 'DESeq2 1.x (搭配 BiocParallel)',
    datasetOrSpecies: 'RNA-seq 转录组表达丰度表',
    inputScale: '基因计数矩阵 (Count matrix)',
    benchmarkType: 'published_benchmark',
    verifiedDate: '2026-11-24',
    benchmarkSectionOrTable: 'Genome Biology (2014) 15:550 Performance section',
    scenario: 'RNA-seq 差异表达分析 (转录组基因计数矩阵差异检验)',
    hardware: '4~8 CPU 核心, 推荐 ≥ 8 GB RAM',
    peakMemory: '暂无可核实的峰值内存基准 (待独立测定)',
    runtime: '暂无可核实的运行时间基准 (原始论文仅正文提及 Bottomly 简要测试，无独立算力基准表格行，待独立测定)',
    cpuScalability: '支持 BiocParallel 多核并行计算离散度收缩',
    scalingFormula: '时间复杂度与基因数和样本数呈 $O(G \\cdot S)$ 线性关系',
    bottleneckTips: '样本数超过 100 时，推荐在 `vst()` 中设置 `blind=FALSE` 并使用更快速的变换模式。',
    evidenceSource: 'Love et al. Genome Biology (2014) 15:550'
  },
  wgcna: {
    methodId: 'wgcna',
    name: 'WGCNA',
    hasBenchmark: true,
    softwareVersion: 'WGCNA 1.7x (R 环境)',
    datasetOrSpecies: '表达芯片/转录组数据',
    inputScale: '高变异特征基因矩阵',
    benchmarkType: 'published_benchmark',
    verifiedDate: '2026-11-24',
    benchmarkSectionOrTable: 'BMC Bioinformatics (2008) 9:559 Section 4',
    scenario: '加权共表达网络构建 (高变异特征基因模块识别与网络拓扑分析)',
    hardware: '8~16 CPU 线程, 推荐 ≥ 16 GB RAM',
    peakMemory: '暂无可核实的峰值内存基准 (理论复杂度 $O(N^2)$，实测基准待独立测定)',
    runtime: '暂无可核实的运行时间基准 (原始论文仅做理论与方法学介绍，无独立算力表格行，待独立测定)',
    cpuScalability: '支持多线程矩阵相关性计算 `allowWGCNAThreads()`',
    scalingFormula: '基因数 $N$ 对应的邻接与拓扑重叠矩阵（TOM）内存占用为严格的 $O(N^2)$',
    bottleneckTips: '基因总数超过 15000 时严禁一次性构建全矩阵，必须改用 `blockwiseModules()` 自动分块聚类。',
    evidenceSource: 'Langfelder & Horvath BMC Bioinformatics (2008) Section 4'
  },
  bismark: {
    methodId: 'bismark',
    name: 'Bismark',
    hasBenchmark: true,
    softwareVersion: 'Bismark 0.24+ (搭配 Bowtie2)',
    datasetOrSpecies: '全基因组重亚硫酸盐测序 (WGBS) 数据',
    inputScale: '重亚硫酸盐处理单端/双端测序 reads',
    benchmarkType: 'published_benchmark',
    verifiedDate: '2026-11-24',
    benchmarkSectionOrTable: 'Bioinformatics (2011) 27:1571-1572 Benchmarking',
    scenario: '全基因组重亚硫酸盐测序 (WGBS) 比对与甲基化位点提取',
    hardware: '8~16 CPU 线程, 推荐 ≥ 16 GB RAM',
    peakMemory: '暂无可核实的峰值内存基准 (待独立测定)',
    runtime: '暂无可核实的运行时间基准 (原始论文 Table 1 仅测试常规样本比对，缺少完整植物算力表格行，待独立测定)',
    cpuScalability: '支持 `-p` 与 `--parallel` 参数多进程并发',
    scalingFormula: '四条转换链独立比对，计算量约为普通 RNA-seq 或 DNA 重测序的 4 倍',
    bottleneckTips: '推荐选用 Bowtie2 引擎并合理调配 `--parallel` 实例数与每个实例的线程数，避免总线程超售。',
    evidenceSource: 'Krueger & Andrews Bioinformatics (2011) 27:1571-1572'
  },
  scanpy: {
    methodId: 'scanpy',
    name: 'Scanpy',
    hasBenchmark: true,
    softwareVersion: 'Scanpy v1.0.0 (官方发布基准)',
    datasetOrSpecies: '大规模单细胞转录组基准数据集 (PBMC 68k, 130k, 130万细胞梯度)',
    inputScale: '梯度规模: 68,000 个细胞 / 130,000 个细胞 / 1,300,000 个细胞',
    benchmarkType: 'published_benchmark',
    verifiedDate: '2026-11-24',
    benchmarkSectionOrTable: 'Genome Biology (2018) 19:15 Figure 1 & 官方 v1.0.0 Release Notes',
    scenario: '单细胞转录组分析流程 (涵盖数据预处理、高变基因筛选、PCA 降维、邻近图构建、Louvain 聚类与流形可视化)',
    hardware: '8~16 CPU 线程',
    peakMemory: '暂无可核实的峰值内存基准 (官方发布记录未列物理常驻内存，待独立测定)',
    runtime: '官方 v1.0.0 记录: 6.8 万细胞约 3 分钟；13 万细胞约 14 分钟；130 万细胞约 6 小时 (全流程预处理、聚类与可视化)',
    cpuScalability: '底层基于 AnnData 与多线程 C/Cython 库，运算极度轻量快速',
    scalingFormula: '稀疏矩阵存储占用极低；邻近图构建为 $O(C \\cdot \\log C)$',
    bottleneckTips: '原始计数务必存储为 `scipy.sparse.csr_matrix` 稀疏矩阵，避免误转为稠密浮点矩阵导致内存剧增。',
    evidenceSource: 'Wolf et al. Genome Biology (2018) 19:15 Figure 1 & Scanpy v1.0.0 Release Notes (https://scanpy.scverse.org/en/stable/release-notes/index.html)'
  }
};
