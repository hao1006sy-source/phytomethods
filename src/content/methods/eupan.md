---
title: EUPAN
name: EUPAN
summary: 面向真核生物超大规模群体的 Map-to-pan 泛基因组构建与测序覆盖度驱动的基因存在缺失变异 (PAV) 分析工具集。
dataType: 短读段全基因组重测序 FASTQ、参考基因组 FASTA 与结构注释 GFF3/GTF
principle: Map-to-pan 泛基因组整合、基因体/CDS 覆盖度双阈值 PAV 判定与 Heaps 定律泛基因组规模建模
domainIds: [pangenomics-structural-variation]
topicIds: [m03-topic-01, m03-topic-04]
principleIds: [alignment, pav-calling]
dataIds: [short-reads, assembly, annotation-input]
paper: eupan-paper
repository: https://cgm.sjtu.edu.cn/eupan/index.html
version: "0.44"
status: published
updatedAt: 2026-11-25
---

## 软件定位与核心科学问题

在植物群体遗传学与功能基因组学研究中，长久以来依赖的单一参考基因组（如水稻 Nipponbare、拟南芥 Col-0、玉米 B73）存在严重的**参考基因组偏倚（Reference Bias）**。单一参考个体无法代表整个物种丰富的遗传多样性，大量分布在地方品种、农家种及野生近缘种中的优异抗病、耐逆和营养品质关键基因（如耐淹、抗稻瘟病、耐盐碱基因）在标准参考序列中完全缺失。

为了从海量重测序数据中挖掘这些“非参考基因”，上海交通大学胡革等开发了 **EUPAN（Eukaryotic PAN-genome analysis toolkit）**（发表于 *Bioinformatics*, 2017）。

EUPAN 提出了经典的 **Map-to-pan（比对至泛参考）** 计算范式：它不仅能够高效并行处理成百上千份样本的短读段 *de novo* 组装，提取未比对的新序列（Novel Contigs）并合并去冗余构建出全物种泛基因组；更通过严谨的双重测序覆盖度概率模型，大规模鉴定全群体样本的**基因存在缺失变异（Presence-Absence Variation, PAV）**，揭示核心基因组（Core Genome）与可变基因组（Dispensable Genome）的演化特征。

---

## 核心算法原理与数学推导

```
   [成百上千份短读段重测序样本 (FASTQ)]  +  [物种标准参考基因组 (Reference FASTA)]
                                 │
                                 ▼
         多样本并行从头组装 (SOAPdenovo2 / linearK 流程) ──► 组装 Contigs
                                 │
                                 ▼
         全基因组比对过滤 (MUMmer / BLAST)
         └─ 剔除完全对齐到参考基因组的同源序列，提取未比对非参考 Contigs (Novel Contigs)
                                 │
                                 ▼
         序列清洗与冗余聚类 (CD-HIT)
         └─ 剔除叶绿体/线粒体及微生物污染，合并生成【线性泛基因组参考序列】(Pan-genome FASTA)
                                 │
                                 ▼
         全样本短读段回比至泛基因组 (BWA-MEM / Bowtie2)
                                 │
                                 ▼
         双重覆盖度驱动的 PAV 判定模型 (Gene Body & CDS Coverage)
                                 │
                                 ▼
         全群体 PAV 二元矩阵与 Heaps 定律泛基因组容量建模
```

### 1. 线性泛基因组构建流程 (Map-to-pan 策略)

设参考基因组为 $\mathcal{R}$，重测序样本集合为 $\mathcal{S} = \{S_1, S_2, \dots, S_N\}$：
1. **个体序列组装**：利用优化 $k$-mer 的 `linearK` 脚本调用短读段组装软件（如 SOAPdenovo2）对每个重测序个体独立组装获得 contig 集合；
2. **提取非参考候选序列**：利用 MUMmer（`nucmer`）将每个个体的 contigs 与参考基因组 $\mathcal{R}$ 进行高精度全基因组比对，筛选未被比对覆盖（Unmapped）或仅有极低序列相似度（如 Identity $< 80\%$ 或覆盖度 $< 50\%$）的序列片段；
3. **质控与去冗余**：
   - 过滤长度短于指定阈值（如 $< 500\text{ bp}$）的低质量碎片；
   - 剔除宿主内生菌、线粒体和叶绿体污染序列；
   - 使用 CD-HIT（通常在 90%~95% 相似性阈值）对所有样本的新增序列进行多序列聚类与去冗余，保留代表性 contigs；
4. **拼接全景泛基因组**：将去冗余的新增序列集合 $\mathcal{N}$ 追加到参考基因组 $\mathcal{R}$ 末尾，形成扩展的线性泛基因组参考序列 $\mathcal{P} = \mathcal{R} \cup \mathcal{N}$。

### 2. 双重覆盖度驱动的 PAV 判定模型

在泛基因组序列 $\mathcal{P}$ 完成基因结构注释后，设全基因组共有 $G$ 个已注释基因。
对于任意一个基因 $g$（$g = 1, \dots, G$），设其完整的**基因体（Gene body）**物理坐标长度为 $L_g^{\text{body}}$，其全部**外显子编码区（CDS）**累计长度为 $L_g^{\text{CDS}}$。

将样本 $s$ 的高质量测序 reads 比对回泛基因组 $\mathcal{P}$：
- 统计基因体区域内测序深度达到至少 $1\times$（或指定深度阈值）的物理碱基总数 $C_{gs}^{\text{body}}$；
- 统计 CDS 编码区内达到深度要求的物理碱基总数 $C_{gs}^{\text{CDS}}$；
- 分别计算基因体覆盖度 $\text{Cov}_{gs}^{\text{body}}$ 与 CDS 覆盖度 $\text{Cov}_{gs}^{\text{CDS}}$：
  $$\text{Cov}_{gs}^{\text{body}} = \frac{C_{gs}^{\text{body}}}{L_g^{\text{body}}}, \quad \text{Cov}_{gs}^{\text{CDS}} = \frac{C_{gs}^{\text{CDS}}}{L_g^{\text{CDS}}}$$

**二元判定准则**：
EUPAN 建立双重刚性阈值复合判定机制：
$$\text{PAV}_{gs} = \begin{cases} 1 \; (\text{Present}), & \text{若 } \text{Cov}_{gs}^{\text{body}} \ge \theta_{\text{body}} \quad \text{且} \quad \text{Cov}_{gs}^{\text{CDS}} \ge \theta_{\text{CDS}} \\ 0 \; (\text{Absent}), & \text{其他} \end{cases}$$
- 官方 SOP 推荐的经典基准阈值为 $\theta_{\text{body}} = 0.80$（基因体覆盖达 80%），$\theta_{\text{CDS}} = 0.95$（编码区覆盖达 95%）；
- 严格要求 CDS 覆盖度 $\ge 95\%$ 能极好地防止由于假基因、转座子外显子嵌合或边缘比对误差导致的假阳性判定。

### 3. 泛基因组容量与 Heaps 定律建模

利用生成的 $G \times N$ 维 PAV 矩阵，EUPAN 评估物种泛基因组的开放性（Openness）：
从全群体 $N$ 个样本中，无放回随机抽取 $n$ 个样本（$n = 1, 2, \dots, N$），重复抽样 $B$ 次（默认 $B = 100$ 次），计算抽样样本中的泛基因组总数 $y_{\text{pan}}(n)$ 与核心基因总数 $y_{\text{core}}(n)$：
- **泛基因组容量方程（Heaps' Law）**：
  $$y_{\text{pan}}(n) = A \cdot n^\gamma + B$$
  - $\gamma > 0$：泛基因组为**开放型（Open pangenome）**。随着测序样本数的增加，物种特有基因数量将持续攀升（绝大多数异花授粉植物如玉米、向日葵均属此类）；
  - $\gamma \le 0$：泛基因组为**封闭型（Closed pangenome）**（如专性自交物种拟南芥在采样达到一定程度后趋于平缓饱和）；
- **核心基因组衰减方程**：
  $$y_{\text{core}}(n) = C \cdot \exp(-n / \tau) + \Omega$$
  其中 $\Omega$ 代表该植物物种赖以维持基础生存功能的最简核心基因组极限规模。

---

## 植物泛基因组分析实践考量与避坑指南

| 植物组学特殊性 | 潜在技术风险与偏倚 | EUPAN 规范对策与参数配置 |
| :--- | :--- | :--- |
| **重测序深度对覆盖度的高度敏感性** | 低测序深度（如 $< 5\times \sim 10\times$）时，随机抽样波动会导致大量真实存在的基因因偶然未测到而跌破 80%/95% 阈值，造成全群假性缺失暴增。 | **样本测序深度准入门槛**：开展 PAV 判定时，严禁使用低深度重测序样本；必须严格挑选全基因组平均测序深度 $\ge 15\times \sim 20\times$ 的个体（如 3K 水稻项目中精选 453 份高深度材料进入 PAV 主分析）。 |
| **转座子与高同源基因的多重比对** | 植物基因组中包含大量反转录转座子与同源多拷贝。短读段多重比对若被直接丢弃（MAPQ=0 剔除），会导致整段重复外显子覆盖度为 0。 | 比对阶段需适当保留一定多重比对随机分配；或在提取出 PAV 候选后，利用 **OrthoMCL / OrthoFinder** 将旁系同源基因汇总为“基因家族”，以**基因家族 PAV（Family PAV）**作为补充指标消除拷贝数波动干扰。 |
| **叶绿体与线粒体高拷贝污染** | 从头组装产生的大量高深度 contigs 往往来自叶绿体或质体 DNA。 | 在合并进入泛基因组前，必须使用植物叶绿体与线粒体完整参考基因组执行严格的局部比对（`eupan qualCtg`），彻底滤除细胞器 contigs。 |

---

## 典型分析命令与标准操作流

以下为基于 EUPAN 官方规范在 Linux 集群上执行 PAV 鉴定的核心命令：

```bash
# 1. 对各样本未对齐组装的 Contig 执行质量检查与污染过滤
# 剔除叶绿体/线粒体匹配以及序列长度 < 500 bp 的短片段
eupan qualCtg \
    -i sample_novel_contigs.fa \
    -o ./filtered_contigs/ \
    -l 500 \
    -c chloroplast_mitochondria.fa

# 2. 将全群体过滤后的非参考序列与原参考基因组聚类去冗余 (CD-HIT 90% 相似度)
# 产出标准泛基因组参考序列: pan_genome.fa
eupan mergeCtg \
    -r reference_genome.fa \
    -i ./filtered_contigs_list.txt \
    -c 0.90 \
    -o pan_genome.fa

# 3. 将各重测序样本的高质量短读段对齐至全泛基因组序列 (BWA-MEM)
bwa mem -t 16 pan_genome.fa sample_R1.fq.gz sample_R2.fq.gz | \
    samtools sort -@ 8 -o sample_pangenome.bam

# 4. 计算每个基因在样本中的基因体 (Gene body) 与 CDS 测序物理覆盖度
# gff: 泛基因组包含全基因结构注释的 GFF 文件
eupan getCov \
    -b sample_pangenome.bam \
    -g pan_genome.gff \
    -o sample_cov_summary.txt

# 5. 基于双重刚性阈值判定基因存在与缺失 (PAV Calling)
# -b 0.8: 基因体覆盖度 >= 80%; -c 0.95: CDS 覆盖度 >= 95%
eupan geneExist \
    -i all_samples_cov_summary.list \
    -b 0.80 \
    -c 0.95 \
    -o pangenome_gene_PAV_matrix.tsv

# 6. 执行 100 次蒙特卡洛随机重抽样，拟合 Heaps 定律泛基因组容量与核心基因曲线
eupan panSim \
    -i pangenome_gene_PAV_matrix.tsv \
    -n 100 \
    -o ./pangenome_simulation/
```

---

## 科学研究案例与分析流转界定

- **3,010 份亚洲栽培稻泛基因组经典案例**：在由中国农科院与 IRRI 主导的 3,010 份亚洲水稻泛基因组里程碑研究（*Nature*, 2018）中，研究团队利用 EUPAN 流水线对精选的 453 份高深度重测序水稻样本（平均深度 $> 20\times$）展开了 Map-to-pan 泛基因组分析。成功从非参考基因组中挖掘出 268 Mb 的全新序列与上万个新基因模型，通过严格的 PAV 矩阵不仅完整复原了籼稻与粳稻两个亚种间高达数千个基因的显著分化，更定位到了与水稻稻瘟病抗性、分蘖数和株型相关的核心可变基因；
- **分析工具流转与架构边界**：
  - **方法演进与定位**：EUPAN 属于第一代**基于线性多序列拼接（Linear concatenation）的 Map-to-pan 泛基因组工具**，极度适用于对超大规模重测序群体（数百至数千样本）进行快速廉价的基因 PAV 矩阵构建；
  - **图泛基因组拓展**：EUPAN 产出的线性 Pan-genome 无法保留变异在物理染色体上的复杂倒位、易位图拓扑结构；对于高质量单倍型染色体级别组装，应进阶选择基于图变异拓扑的工具（如 **Minigraph**、**PGGB** 或 **Minigraph-Cactus**）。
