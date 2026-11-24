import type { TroubleshootingEntry } from './types';

export const troubleshootingEntries: TroubleshootingEntry[] = [
  // 1. Hifiasm
  {
    methodId: 'hifiasm',
    errorId: 'hifiasm-oom-killed',
    errorPattern: 'Killed / Out of memory during string graph construction',
    errorType: 'oom',
    symptom: '进程在执行重叠群构建或第二轮纠错时突然退出，系统日志记录 Exit Code 137。',
    rootCause: '植物超大基因组或高杂合基因组中，包含大量低频测序噪声 k-mer；若使用了 `-f 0`（完全关闭 Bloom filter），会导致内存消耗急剧暴涨并触发 Linux OOM Killer。',
    diagnosticCommand: 'dmesg -T | grep -i -E "killed process|oom-killer|hifiasm"',
    solution: '移除 `-f 0` 参数（允许默认 Bloom filter 过滤低频错误 k-mer），或设置适当的 `-f 37`；同时提高 Slurm/PBS 内存限制至 256GB+。'
  },
  {
    methodId: 'hifiasm',
    errorId: 'hifiasm-segfault-format',
    errorPattern: 'Segmentation fault (core dumped) in read loading',
    errorType: 'input_format',
    symptom: '程序刚启动数秒即发生段错误崩溃。',
    rootCause: '输入的 gzip 压缩包不完整、文件被截断，或者 FASTQ 中存在包含特殊控制字符/空行的破损序列。',
    diagnosticCommand: 'gzip -t input.fq.gz || zcat input.fq.gz | head -n 4',
    solution: '使用 `gzip -t` 校验测序文件完整性，若损坏需重新传输；确认 FASTQ 每 4 行对应一条有效读段。'
  },

  // 2. OrthoFinder
  {
    methodId: 'orthofinder',
    errorId: 'orthofinder-diamond-oom',
    errorPattern: 'DIAMOND failed with exit code 1 / memory allocation error',
    errorType: 'oom',
    symptom: '在第二步 Running DIAMOND all-versus-all 时报错中断。',
    rootCause: 'DIAMOND 默认分块过大，且多个并行进程同时向内存加载大蛋白数据库，导致超出单机可用内存。',
    diagnosticCommand: 'grep -i "error" OrthoFinder/Results_*/Log.txt',
    solution: '降低 `-t` 线程数，或在运行前将每个物种的蛋白文件通过脚本筛选为“每个基因仅保留最长转录本”，显著降低数据量。'
  },
  {
    methodId: 'orthofinder',
    errorId: 'orthofinder-stop-codon-star',
    errorPattern: 'ERROR: Non-standard amino acid characters found (*, .)',
    errorType: 'input_format',
    symptom: '序列预检查阶段报错，提示存在非法氨基酸字符。',
    rootCause: '部分基因组注释软件导出的蛋白序列末尾包含终止密码子 `*` 或占位符 `.`，DIAMOND/BLAST 解析器拒绝接收。',
    diagnosticCommand: 'grep -E "[\\*\\.]" *.fa | head -n 5',
    solution: '运行 `sed -i "s/\\*$//g" *.fa` 清除末尾星号，确保蛋白序列只包含标准单字母氨基酸简写。'
  },

  // 3. EDTA
  {
    methodId: 'edta',
    errorId: 'edta-ltr-retriever-header',
    errorPattern: 'LTR_retriever failed: Sequence ID too long or contains whitespace',
    errorType: 'input_format',
    symptom: '程序运行数小时后，在 LTR 检测模块报错终止。',
    rootCause: '参考基因组 FASTA 序列的 Header（如 `>Chr01 assembly_v1.0 scaffold`）过长或含有空格、制表符等字符，下游古老 Perl/C 依赖无法识别。',
    diagnosticCommand: 'grep ">" genome.fa | grep -E "\\s"',
    solution: '运行 `seqkit seq -i genome.fa | awk \'{print $1}\' > clean_genome.fa` 简化染色体名称为纯数字或 `Chr1`。'
  },

  // 4. CAFE 5
  {
    methodId: 'cafe5',
    errorId: 'cafe5-ultrametric-tree',
    errorPattern: 'The tree is not ultrametric / branch lengths error',
    errorType: 'input_format',
    symptom: '读取物种树文件时报错退出，拒绝进行收缩扩张计算。',
    rootCause: '物种树的各叶节点到根节点的距离不相等。CAFE 5 要求严格的超度量树（Ultrametric Tree，即带绝对分化地质年代的高精度时间树）。',
    diagnosticCommand: 'head -n 1 tree.nwk',
    solution: '使用 r8s、MCMCTree 或 TreePL 对系统发育树进行分化时间校准和平滑，导出各支末端到根距离完全相等的超度量 Newick 树。'
  },

  // 5. PLINK
  {
    methodId: 'plink',
    errorId: 'plink-multiallelic-rejected',
    errorPattern: 'Error: Multiallelic variant ... detected',
    errorType: 'input_format',
    symptom: '从 VCF 转换为二进制 BED 格式时终止。',
    rootCause: 'PLINK 1.9 仅支持严格的二等位基因（Biallelic SNP），植物多倍体或高变异群体中常存在单一位点多个替代等位基因（如 `ALT=C,G`）。',
    diagnosticCommand: 'bcftools view -m2 -M2 -v snps input.vcf.gz | wc -l',
    solution: '运行 `bcftools view -m2 -M2 -v snps input.vcf.gz -Oz -o biallelic.vcf.gz` 预先过滤出纯二等位 SNP，或使用 PLINK 2.0 (`plink2 --max-alleles 2`)。'
  },

  // 6. GAPIT
  {
    methodId: 'gapit',
    errorId: 'gapit-collinear-singularity',
    errorPattern: 'Error in solve.default: system is computationally singular',
    errorType: 'numerical',
    symptom: '在拟合混合线性模型（MLM）求逆方差协方差矩阵时 R 语言报错抛出异常。',
    rootCause: '样本亲缘关系矩阵（Kinship）中存在完全相同的克隆株、同卵双胞或高度共线性的重复个体，导致矩阵不可逆。',
    diagnosticCommand: 'which(kinship == 1, arr.ind = TRUE)',
    solution: '检查材料表型与基因型，剔除完全重复测序的材料；或在 GAPIT 中切换为无需全矩阵求逆的 `model=c("FarmCPU", "Blink")` 算法。'
  },

  // 7. DESeq2
  {
    methodId: 'deseq2',
    errorId: 'deseq2-non-integer-counts',
    errorPattern: 'Error in checkCountData: some values in assay are not integers',
    errorType: 'input_format',
    symptom: '构建 DESeqDataSetFromMatrix 对象时失败。',
    rootCause: '输入了经过 RPKM/FPKM/TPM 标准化的浮点数矩阵。DESeq2 的统计模型基于泊松-负二项分布计数模型，必须输入未标准化的原始整数计数（Raw Counts）。',
    diagnosticCommand: 'any(countData %% 1 != 0)',
    solution: '提供来自 featureCounts、HTSeq 或 Salmon（通过 tximport round 转换）的纯整数 raw counts 表达矩阵。'
  },

  // 8. WGCNA
  {
    methodId: 'wgcna',
    errorId: 'wgcna-sample-outlier-tree',
    errorPattern: 'Sample clustering dendrogram shows extreme isolated branches',
    errorType: 'parameter',
    symptom: '样本层次聚类树中个别样本距离其余样本距离极远，严重干扰软阈值计算。',
    rootCause: '存在测序批次效应（Batch effect）、严重降解样品或实验标签颠倒导致的离群样本。',
    diagnosticCommand: 'plot(hclust(dist(datExpr), method = "average"))',
    solution: '在构建共表达网络前绘制样本层次聚类树，使用 `cutreeStatic` 剔除明显的离群样本，确保输入样本具有良好的生物学可比性。'
  },

  // 9. SyRI
  {
    methodId: 'syri',
    errorId: 'syri-csrc-missing',
    errorPattern: 'RuntimeError: CIGAR string lacks CS tag / missing alignments',
    errorType: 'parameter',
    symptom: 'SyRI 解析 minimap2 比对 BAM 时报错终止。',
    rootCause: 'minimap2 默认不输出详尽的精确比对标签（cs tag），而 SyRI 需要借助该标签精确定位结构变异碱基断点。',
    diagnosticCommand: 'samtools view file.bam | head -n 1 | grep "cs:Z"',
    solution: '调用 minimap2 时务必加上 `--cs -c` 参数：`minimap2 -ax asm5 --eqx --cs -c ref.fa qry.fa | samtools sort -o out.bam`。'
  },

  // 10. Bismark
  {
    methodId: 'bismark',
    errorId: 'bismark-index-missing',
    errorPattern: 'No Bowtie 2 index found in reference directory',
    errorType: 'parameter',
    symptom: '比对作业一启动即提示未找到甲基化转换参考基因组索引。',
    rootCause: 'Bismark 无法直接使用普通的 bowtie2-build 索引，必须先执行 `bismark_genome_preparation` 将基因组进行 C->T 与 G->A 计算机双向亚硫酸氢盐转换。',
    diagnosticCommand: 'ls Bisulfite_Genome/',
    solution: '运行 `bismark_genome_preparation --bowtie2 /path/to/ref/`，等待生成专门的 `Bisulfite_Genome` 目录后再启动比对。'
  }
];
