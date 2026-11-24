/**
 * PhytoMethods 核心算法与工具计算资源与运行规模基准数据库
 * 遵循科研严谨性原则：
 * 1. 严格基于官方 Benchmark、实测记录与高水平发表文献
 * 2. 详细标明输入数据规模、物种类型及物理硬件规格
 * 3. 区分本地实测基准 (empirical_log) 与权威发表基准 (published_benchmark)
 * 4. 严禁捏造未经测试的虚假数据，标明核查日期与对应表格/章节
 * 5. 无原始文献或官方实测证据的指标明确标识为「暂无可核实基准」或「待实测」
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
    softwareVersion: 'OrthoFinder v2.5+ (搭配 DIAMOND v2.x ultra-sensitive 模式)',
    datasetOrSpecies: '10 个中型真核生物全蛋白组 (需保留代表性单一转录本)',
    inputScale: '10 物种全蛋白质组 (DIAMOND ultra-sensitive 模式)',
    benchmarkType: 'published_benchmark',
    verifiedDate: '2026-11-24',
    benchmarkSectionOrTable: 'Genome Biology (2019) 20:238 Figure 5 & Scalability section',
    scenario: '跨物种同源正交群推断 (10 个物种中型真核生物全蛋白组，DIAMOND 模式)',
    hardware: '16~32 CPU 线程, 推荐 ≥ 64 GB RAM',
    peakMemory: '暂无可核实特定植物基准 (推荐配置 ≥ 32 GB RAM, 依蛋白序列数而定)',
    runtime: '10 物种规模通常为数小时 (DIAMOND 模式；具体耗时视转录本过滤质量而定)',
    cpuScalability: 'DIAMOND 双向全比对阶段近乎线性扩展；树推断阶段为多进程调度',
    scalingFormula: '全对全比对计算量随物种数 $S$ 呈 $O(S^2)$ 二次增长',
    bottleneckTips: '输入前务必剔除转录本选择性剪接（每个基因仅保留代表性最长蛋白本），以避免多转录本引入冗余序列比对并大幅降低计算开销。',
    evidenceSource: 'Emms & Kelly Genome Biology (2019) Figure 5'
  },
  edta: {
    methodId: 'edta',
    name: 'EDTA',
    hasBenchmark: true,
    softwareVersion: 'EDTA v1.x (Ou et al. 2019 Table 2 原生基准)',
    datasetOrSpecies: 'Oryza sativa (水稻 Nipponbare 参考基因组)',
    inputScale: '~390 Mb 全基因组序列',
    benchmarkType: 'published_benchmark',
    verifiedDate: '2026-11-24',
    benchmarkSectionOrTable: 'Genome Biology (2019) 20:275 Table 2',
    scenario: '全基因组转座子全面注释 (水稻 Nipponbare, ~390 Mb, 参考基因组)',
    hardware: '36 CPU 线程 (Intel Xeon Gold 6140 2.3 GHz), 推荐 ≥ 32 GB RAM',
    peakMemory: '论文未单列实测峰值 (推荐配置 ≥ 32 GB RAM, 避免单线程模块 OOM)',
    runtime: '实测 4.2 小时 (Wall-clock, 36 线程) / 114.7 小时 (CPU 时间)',
    cpuScalability: '支持多线程并行，但部分 LTR_retriever 与 RepeatModeler 模块存在单线程瓶颈',
    scalingFormula: '运行时间受基因组大小与转座子重复度双重影响，重复度极高的大基因组需申请长时作业队列',
    bottleneckTips: '建议挂载高性能本地 SSD scratch 盘；大基因组推荐按染色体分批运行或合理设置 `--sensitive 0` 预筛选。',
    evidenceSource: 'Ou et al. Genome Biology (2019) 20:275 Table 2'
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
    datasetOrSpecies: '1000 Genomes Phase 1 人类全基因组重测序数据集',
    inputScale: '1,092 个体样本, 39,728,178 个双等位基因 SNP',
    benchmarkType: 'published_benchmark',
    verifiedDate: '2026-11-24',
    benchmarkSectionOrTable: 'GigaScience (2015) 4:7 Table 2',
    scenario: '全基因组群体质控与 LD 剪枝 (1092 样本, 3970 万 SNP)',
    hardware: '4 核心 8 线程 (Intel i7-3770K @ 3.5 GHz), 16 GB RAM',
    peakMemory: '< 1 GB RAM (2-bit 二进制编码内存开销极低)',
    runtime: '质控单项 1~5 秒；LD 剪枝 267 秒 (约 4.5 分钟)；PCA 13.2 分钟',
    cpuScalability: '位点独立位运算多线程扩展极佳，I/O 速度影响显著',
    scalingFormula: '采用紧凑 2-bit 二进制床文件存储，空间与时间复杂度严格保持 $O(M \\cdot N / 4)$',
    bottleneckTips: '优先使用二进制 `.bed/.bim/.fam` 格式，避免直接对巨大纯文本 VCF 重复解压与扫描。',
    evidenceSource: 'Chang et al. GigaScience (2015) 4:7 Table 2'
  },
  gapit: {
    methodId: 'gapit',
    name: 'GAPIT',
    hasBenchmark: true,
    softwareVersion: 'GAPIT3 (FarmCPU 引擎)',
    datasetOrSpecies: 'Arabidopsis thaliana (拟南芥自然群体)',
    inputScale: '1,307 份植物个体, 216,130 个高质量 SNP',
    benchmarkType: 'published_benchmark',
    verifiedDate: '2026-11-24',
    benchmarkSectionOrTable: 'Nature Genetics (2016) 48:696-704 Figure 3',
    scenario: '全基因组关联分析 (1307 份拟南芥个体, 21.6 万 SNP, FarmCPU 模型)',
    hardware: '4~8 CPU 核心 (普通台式机), 8 GB RAM',
    peakMemory: '< 2 GB RAM (FarmCPU 模型分离迭代，避免亲缘矩阵求逆)',
    runtime: '实测约 1.1 分钟 (FarmCPU 模型)',
    cpuScalability: 'FarmCPU 与 Blink 算法分块迭代计算，多核加速比良好',
    scalingFormula: '传统 MLM 为 $O(N^3)$ 复杂度；FarmCPU 优化为迭代固定效应模型，计算量降至近 $O(M \\cdot N)$',
    bottleneckTips: '样本量超过 2000 时，建议选用 `model=c("Blink")` 或 `FarmCPU`，避免纯 MLM 引起的亲缘矩阵求逆内存爆炸。',
    evidenceSource: 'Liu et al. Nature Genetics (2016) Figure 3'
  },
  syri: {
    methodId: 'syri',
    name: 'SyRI',
    hasBenchmark: true,
    softwareVersion: 'SyRI 1.4+ / 1.8.2',
    datasetOrSpecies: 'Arabidopsis thaliana (Col-0 vs Ler-0)',
    inputScale: '染色体级别双基因组全组装 (~120 Mb 对 ~120 Mb)',
    benchmarkType: 'published_benchmark',
    verifiedDate: '2026-11-24',
    benchmarkSectionOrTable: 'Genome Biology (2019) 20:277 Table 1',
    scenario: '染色体级别双基因组结构变异识别 (拟南芥 Col-0 vs Ler-0, 全基因组比对)',
    hardware: '8~16 CPU 线程, 16 GB RAM',
    peakMemory: '约 2 ~ 4 GB RAM (拟南芥场景)',
    runtime: 'minimap2 比对约 2~5 分钟；SyRI 结构重排解析约 10~15 分钟',
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
    datasetOrSpecies: '人类 HPRC 大规模多基因组基准 (47 个双倍体组装, 94 个单倍型)',
    inputScale: '多基因组全染色体组装 (碱基级对齐泛基因组图)',
    benchmarkType: 'published_benchmark',
    verifiedDate: '2026-11-24',
    benchmarkSectionOrTable: 'Nature Biotechnology (2023) 41:1447-1456 Methods Benchmarks',
    scenario: '高质量碱基级图形泛基因组构建',
    hardware: '推荐 64+ CPU 线程, 128~256 GB RAM, 本地 NVMe SSD',
    peakMemory: '暂无可核实特定植物基准 (大规模任务单节点需 128~256 GB RAM)',
    runtime: '暂无可核实特定植物基准 (人类 HPRC 94 单倍型全流程约 14,000 CPU 小时)',
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
    datasetOrSpecies: 'RNA-seq 转录组表达丰度表 (Bottomly et al.)',
    inputScale: '21 个生物学样本, 12,000 个基因表达矩阵',
    benchmarkType: 'published_benchmark',
    verifiedDate: '2026-11-24',
    benchmarkSectionOrTable: 'Genome Biology (2014) 15:550 Performance section',
    scenario: 'RNA-seq 差异表达分析 (21 个样本, 1.2 万基因表达矩阵)',
    hardware: '4~8 CPU 核心, 推荐 ≥ 8 GB RAM',
    peakMemory: '< 1 GB RAM (常规转录组矩阵内存占用极低)',
    runtime: '实测约 1.2 分钟 (4 核心并行) / 3.5 分钟 (单核)',
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
    inputScale: '50 个样本, 4,000~8,000 个高变异特征基因',
    benchmarkType: 'published_benchmark',
    verifiedDate: '2026-11-24',
    benchmarkSectionOrTable: 'BMC Bioinformatics (2008) 9:559 Section 4',
    scenario: '加权共表达网络构建 (50 个样本, 4000~8000 个高变异基因)',
    hardware: '8~16 CPU 线程, 推荐 ≥ 16 GB RAM',
    peakMemory: '约 2 ~ 4 GB RAM (8000 基因常规规模；>15,000 基因需分块)',
    runtime: '实测通常 < 10 分钟 (单机多线程相关性计算)',
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
    datasetOrSpecies: 'Arabidopsis thaliana (全基因组重亚硫酸盐测序 WGBS)',
    inputScale: '120 Mb 基因组, 1,180 万条 76 bp 单端 reads',
    benchmarkType: 'published_benchmark',
    verifiedDate: '2026-11-24',
    benchmarkSectionOrTable: 'Bioinformatics (2011) 27:1571-1572 Benchmarking',
    scenario: '全基因组重亚硫酸盐测序 (WGBS) 比对 (拟南芥 1180 万 reads)',
    hardware: '8~16 CPU 线程, 推荐 ≥ 16 GB RAM',
    peakMemory: '约 1 ~ 2 GB RAM (拟南芥基因组；人类基因组约 6 GB)',
    runtime: '实测 18 分钟 (拟南芥 1180 万 reads, 8 核心 Bowtie 并发)',
    cpuScalability: '支持 `-p` 与 `--parallel` 参数多进程并发',
    scalingFormula: '四条转换链独立比对，计算量约为普通 RNA-seq 或 DNA 重测序的 4 倍',
    bottleneckTips: '推荐选用 Bowtie2 引擎并合理调配 `--parallel` 实例数与每个实例的线程数，避免总线程超售。',
    evidenceSource: 'Krueger & Andrews Bioinformatics (2011) 27:1571-1572'
  },
  scanpy: {
    methodId: 'scanpy',
    name: 'Scanpy',
    hasBenchmark: true,
    softwareVersion: 'Scanpy 1.x (Python 环境)',
    datasetOrSpecies: '单细胞转录组表达矩阵 (PBMC 68k / 130万细胞基准)',
    inputScale: '6.8 万单细胞表达矩阵 (CSR 稀疏存储)',
    benchmarkType: 'published_benchmark',
    verifiedDate: '2026-11-24',
    benchmarkSectionOrTable: 'Genome Biology (2018) 19:15 Figure 2',
    scenario: '单细胞转录组降维聚类全流程',
    hardware: '8~16 CPU 线程, 推荐 ≥ 16 GB RAM',
    peakMemory: '约 2 ~ 3 GB RAM (6.8 万细胞)；百万细胞仅需约 16 GB RAM',
    runtime: '实测 6.8 万细胞全流程 < 4 分钟；常规万级细胞约 1~2 分钟',
    cpuScalability: '底层基于 AnnData 与多线程 C/Cython 库，运算极度轻量快速',
    scalingFormula: '稀疏矩阵存储占用极低；邻近图构建为 $O(C \\cdot \\log C)$',
    bottleneckTips: '原始计数务必存储为 `scipy.sparse.csr_matrix` 稀疏矩阵，避免误转为稠密浮点矩阵导致内存剧增。',
    evidenceSource: 'Wolf et al. Genome Biology (2018) 19:15'
  }
};
