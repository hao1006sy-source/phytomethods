---
title: "EUPAN enables pan-genome studies of a large number of eukaryotic genomes"
summary: "提出面向超大规模真核生物群体的端到端泛基因组分析套件 EUPAN，开创了 Map-to-Pan 范式、非参考序列挖掘流程以及基于基因覆盖度矩阵的基因存在/缺失变异（PAV）判定体系，为大规模植物泛基因组与 Heaps' Law 核心基因组演化建模奠定了方法基础。"
authors: "Hu Z, Sun C, Lu K-C, Chu X, Zhao Y, Lu J, Shi J, Wei C"
year: 2017
journal: "Bioinformatics 33(15):2408–2410"
doi: 10.1093/bioinformatics/btx170
type: method
method: eupan
methodIds: [eupan]
domainIds: [pangenomics-structural-variation]
speciesIds: [rice]
status: published
updatedAt: 2026-11-25
---

## 研究背景与算法贡献

在动植物第二代高通量测序蓬勃发展的阶段（如著名的“水稻 3,000 份核心种质基因组计划”），科研人员面对着海量的低深度或中深度二代全基因组重测序数据。然而，由于长读长三代测序尚未普及且成本极高，直接对成千上万个材料进行染色体级别的高质量从头拼接在当时是不现实的。科研人员面临着迫切的**方法学难题**：
1. **单一参考基因组带来的“暗物质序列丢失”**：将数千个地方品种或野生稻的二代短读段单纯比对到单一参考系（如日本晴），会导致大量非参考特异性功能序列（Unmapped Reads）被当作垃圾数据丢弃；
2. **缺乏标准化的基因存在/缺失变异（PAV）判定规范**：不同课题组对一个基因在某个样品中究竟是“真实缺失”还是由于“测序覆盖度波动导致的假缺失”，缺乏统一且统计鲁棒的评估阈值；
3. **缺乏端到端全自动化的泛基因组大数据流程**：数据预处理、未对齐读段独立组装、序列去冗余合并、群体读段再比对与核心/可变基因划分长期依赖分散的自制脚本，亟需标准化的流水线工具。

针对这些挑战，上海交通大学魏冬青教授团队胡志刚等人开发了 **EUPAN（Eukaryotic Pan-genome Analysis Toolkit）**。EUPAN 首次将真核生物多样本泛基因组分析形式化为模块化、端到端的计算流水线，系统确立了以 **Map-to-Pan** 为核心的大规模植物群体泛基因组分析与 PAV 判定方法。

---

## 核心数学模型与数据结构

EUPAN 架构由七大高度协作的功能模块组成，其核心计算流程如下图所示：

```
                    大规模群体二代测序 FASTQ
                               │
                               ▼
           [阶段 1: 测序质量控制与参考基因组初次比对]
         (BWA-MEM 比对至标准线性参考，分离未比对 Reads)
                               │
                               ▼
           [阶段 2: 未对齐读段从头组装与非参考序列挖掘]
        (SOAPdenovo 对未比对 Reads 独立拼接，过滤短 Contigs)
                               │
                               ▼
           [阶段 3: 聚类消除冗余，构建 Pan-genome 序列]
       (CD-HIT-EST 聚类合并生成: 线性参考 + 非冗余新增序列)
                               │
                               ▼
           [阶段 4: Map-to-Pan 群体序列读段回贴比对]
        (将全群体 Reads 重新比对至合并后的 Pan-genome)
                               │
                               ▼
           [阶段 5: 基于 CDS/Gene 覆盖度的 PAV 精准判定]
        (双阈值模型评估基因存在度，构建全群体 0/1 变异矩阵)
                               │
                               ▼
           [阶段 6: Heaps' Law 拟合与核心/可变基因组划分]
        (拟合幂律方程 $N = \kappa \cdot n^\gamma$，评估物种开放度)
```

### 1. 核心数学模型
- **Map-to-Pan 序列合成**：泛基因组序列由两部分构成：标准参考基因组 $R$ 与所有样本特异从头拼接序列经聚类合并后的非冗余超集 $E$：
  $$\text{Pan-Genome} = R \cup \text{Cluster}(E_{\text{sample}_1} \cup E_{\text{sample}_2} \dots)$$
- **双阈值基因存在/缺失（PAV）判定模型**：对于基因 $g$ 在样本 $s$ 中的状态判定，EUPAN 综合考察基因全长覆盖度（Gene Body Coverage, $C_{\text{gene}}$）与编码区外显子覆盖度（CDS Coverage, $C_{\text{cds}}$）：
  $$\text{PAV}(g, s) = \begin{cases} 1 (\text{Present}), & \text{若 } C_{\text{gene}} \ge \theta_{\text{gene}} \text{ 且 } C_{\text{cds}} \ge \theta_{\text{cds}} \\ 0 (\text{Absent}), & \text{否则} \end{cases}$$
  标准植物参数推荐将阈值设定为 $\theta_{\text{gene}} \ge 0.8$ 且 $\theta_{\text{cds}} \ge 0.8$；
- **Heaps' Law 泛基因组容量演化建模**：通过随机重抽样群体样本量 $n$，拟合泛基因组总基因数 $N(n)$：
  $$N(n) = \kappa \cdot n^\gamma$$
  当拟合指数 $\gamma > 0$ 时，表明泛基因组为**开放型（Open Pan-genome）**，新测序个体将持续带来新基因；当 $\gamma \le 0$ 时，表明泛基因组为**封闭型（Closed Pan-genome）**。

---

## 算法复杂度与计算性能

- **高并发作业分发**：EUPAN 原生支持 PBS、SLURM 及 SGE 等高性能计算集群（HPC）作业调度系统，将数千个样本的组装与比对无缝分发至数百个节点；
- **计算瓶颈与突破**：其主要算力消耗集中在前期单样本从头组装与全局 Map-to-Pan 回贴比对上；一旦生成 PAV 矩阵，下游的核心/可变基因划分与系统发育分析可在数分钟内瞬间完成；
- **农业标杆实测**：原论文使用水稻 3,000 基因组计划的真实数据进行全面验证，成功鉴定了数千个在常规参考水稻（日本晴）中缺失但在地方品种与野生稻中特异存在的功能基因。

---

## 植物基因组学应用场景与科研价值

1. **大规模农作物核心种质泛基因组构建与资源盘点**：在二代测序占主导的数百至数千个植物群体重测序项目中，EUPAN 提供了标准的非参考基因挖掘与 PAV 分析范式；
2. **核心基因组（Core）与可变基因组（Dispensable）划分**：揭示农作物中必需生命维持基因与抗逆、抗病等可变基因的比例分布；
3. **驱动基于 PAV 的全基因组关联分析（PAV-GWAS）**：生成的基因存在/缺失 0/1 离散矩阵，可直接作为分子标记输入 GAPIT、EMMAX 等 GWAS 软件，挖掘控制农艺性状的关键缺失基因。

更多植物泛基因组建模与分析实操请参阅 [泛基因组与核心、可变基因组](../../topics/pangenomics-structural-variation/m03-topic-01/)。

---

## 输入输出规范与关键参数指南

### 1. 核心输入输出
- **输入**：群体的双端测序 FASTQ 序列、标准参考基因组 FASTA 及对应基因注释 GFF3 文件；
- **输出**：泛基因组非冗余序列 FASTA、群体基因存在/缺失变异矩阵（PAV 0/1 矩阵）、核心/可变基因归类列表，以及 Heaps' law 拟合曲线图。

### 2. 标准运行命令
```bash
# 步骤 1: 运行比对并将未对齐 reads 组装成样本特异 contigs
eupan qalign -f sample.fq1.gz -r sample.fq2.gz -d ref_genome.fa -o align_out
eupan assem -i unmapped_reads/ -o novel_contigs/

# 步骤 2: 聚类去冗余构建 Pan-genome 序列
eupan cd-hit -i novel_contigs.fa -o novel_nonredundant.fa -c 0.90
cat ref_genome.fa novel_nonredundant.fa > pan_genome.fa

# 步骤 3: Map-to-Pan 全群体再比对与覆盖度统计
eupan align -i all_samples/ -d pan_genome.fa -o map_to_pan_bam/
eupan gcover -a map_to_pan_bam/ -g all_genes.gff3 -o gene_coverage.txt

# 步骤 4: 基于 80% 阈值生成群体 PAV 矩阵与 Heaps' Law 拟合
eupan pav -i gene_coverage.txt -t 0.8 -o pav_matrix.tsv
eupan heaps -i pav_matrix.tsv -n 100 -o heaps_simulation.txt
```
- `cd-hit -c 0.90`：设定序列相似度阈值 90% 用于去冗余；
- `eupan pav -t 0.8`：设置覆盖度判据阈值（默认 80%）；
- `eupan heaps -n 100`：执行 100 次蒙特卡洛随机重抽样拟合 Heaps 幂律曲线。

---

## 阅读与复现资源

- **期刊正式原文**：[Bioinformatics 33(15):2408–2410 (2017)](https://doi.org/10.1093/bioinformatics/btx170)
- **PubMed 检索记录**：[PMID: 28369371](https://pubmed.ncbi.nlm.nih.gov/28369371/)
- **官方代码与资源库**：[EUPAN 工具包主页](http://cgm.sjtu.edu.cn/eupan/)
- **GitHub 维护版本**：[zhb/eupan (GitHub)](https://github.com/cgm-sjtu/eupan)
