---
title: Bismark
name: Bismark
summary: 全基因组亚硫酸氢盐测序 (WGBS) 的计算机四链转换感知比对、去重复与胞嘧啶甲基化 (CG/CHG/CHH) 提取工具。
dataType: 亚硫酸氢盐测序 FASTQ (单端/双端)、参考基因组 FASTA
principle: 计算机四链 In Silico C→T/G→A 转换、Bowtie2/HISAT2 比对引擎与胞嘧啶上下文分类提取
domainIds: [epigenomics-3d-genome]
topicIds: [m07-topic-02, m07-topic-03]
principleIds: [bisulfite-mapping]
dataIds: [bisulfite-reads]
paper: bismark-paper
repository: https://github.com/FelixKrueger/Bismark
status: published
updatedAt: 2026-11-25
---

## 生物学问题与定位

在植物表观遗传学中，DNA 胞嘧啶甲基化（5-methylcytosine, 5mC）是调控转座子（TE）沉默、基因印记（Genomic Imprinting）、组织特异性表达以及植物对逆境胁迫形成表观记忆的核心机制。

**全基因组亚硫酸氢盐测序（Whole-Genome Bisulfite Sequencing, WGBS）**是测定单碱基分辨率 DNA 甲基化图谱的金标准生化技术。其化学原理是：未甲基化的胞嘧啶（C）在重亚硫酸氢盐处理下脱氨基转变为尿嘧啶（U），在随后的 PCR 扩增中被扩增为胸腺嘧啶（T）；而甲基化的胞嘧啶（5mC）受到化学修饰保护，保持 C 不变。

然而，该技术给生物信息学比对带来了致命困难：
1. **参考序列复杂度暴跌**：基因组上大部分 C 转变为 T，导致全基因组几乎退化为仅含 3 种碱基（A, G, T），比对歧义性呈数量级暴增；
2. **植物三类胞嘧啶上下文的复杂分工**：不同于哺乳动物几乎仅存在对称性 CG 甲基化，植物基因组进化出了由不同生化途径维系的**三种独立甲基化上下文：CG（由 MET1 维系）、CHG（由 CMT3 维系）和非对称性 CHH（由 RNA 指导的 DNA 甲基化 RdDM 途径催化，H = A, C 或 T）**。

**Bismark** 由英国 Babraham 研究所的 Felix Krueger 与 Simon Andrews 于 2011 年发表在 *Bioinformatics* 上。作为表观组学领域的奠基级工具，Bismark 创造性地构建了计算机四链转换参考基因组比对框架，支持底层 Bowtie2 或 HISAT2 极速比对，并在比对后精确区分读段来源链，全自动提取全基因组每一个单碱基的 CG、CHG 与 CHH 甲基化状态，是植物表观基因组学分析的核心基础设施。

---

## 核心算法数学原理与推导

Bismark 的核心算法包含虚拟参考基因组转换与三上下文甲基化解析：

### 1. 计算机四链转换（In Silico 4-Strand Genome Mapping）

直接将 C→T 测序 reads 比对到未转换的参考基因组会导致巨量错配，使比对率跌入谷底。Bismark 在预处理阶段对参考基因组 FASTA 执行全双向虚拟转换：

1. **正向链 C→T 转换（Forward Strand C→T）**：将参考基因组正向链的所有 C 强制替换为 T；
2. **反向互补链 G→A 转换（Reverse Strand G→A）**：等价于将参考基因组反向链的 C 替换为 T。

在比对阶段，Bismark 同样对测序 reads 进行 C→T 虚拟转换，随后并行比对到上述转换参考空间：
- 通过正向链 C→T 比对定位源自原始正向单链（Original Top strand, OT）的 reads；
- 通过反向链 G→A 比对定位源自原始互补单链（Original Bottom strand, OB）的 reads；
- 比对成功后，Bismark 还原原始 reads 的真实碱基，对比其在参考基因组原始未转换序列上的对应位置。若参考序列为 C，测序 read 亦为 C，则记为**甲基化胞嘧啶**；若测序 read 变为 T，则记为**未甲基化胞嘧啶**。

### 2. 植物三种胞嘧啶序列上下文分类模型

植物甲基化机制高度依赖胞嘧啶下游的邻近核苷酸模式。Bismark 的 `methylation_extractor` 扫描参考基因组三联核苷酸模式：

- **CG 上下文**：胞嘧啶后紧邻鸟嘌呤（$\text{C-G}$），由植物 MET1 甲基转移酶（等价于动物 DNMT1）以半保留复制方式维持；
- **CHG 上下文**：胞嘧啶后跨一个非 G 碱基连接鸟嘌呤（$\text{C-[A/T/C]-G}$），由植物特异的 CMT3 甲基转移酶与组蛋白 H3K9me2 修饰形成正反馈协同维持；
- **CHH 上下文**：胞嘧啶下游紧邻两个非 G 碱基（$\text{C-[A/T/C]-[A/T/C]}$），为非对称性修饰，无法通过半保留复制遗传，主要由 24-nt siRNA 介导的 DRM2 从头甲基化酶（RdDM 途径）维持。

### 3. 单碱基甲基化水平计算

对于基因组任意特定的胞嘧啶位点 $i$，在经过 PCR 去重处理后，覆盖该位点的有效测序深度为 $N_i = C_i + T_i$。单碱基甲基化比例定义为：

$$\text{Methylation Level}(i) = \frac{C_i}{C_i + T_i}$$

其中 $C_i$ 为支持该位点甲基化的保留 C reads 计数，$T_i$ 为发生脱氨基转化的 T reads 计数。

---

## 生产环境标准流水线

以下展示为植物参考基因组建立 Bismark 转换索引、执行双端 WGBS 高灵敏度比对、PCR 去重复并分类提取 CG/CHG/CHH 甲基化报告的标准流水线：

```bash
# 步骤 1：为植物参考基因组构建 In Silico 四链比对索引 (调用底层 Bowtie2)
bismark_genome_preparation \
  --bowtie2 \
  --parallel 8 \
  /path/to/reference_genome/

# 步骤 2：执行双端 WGBS 序列比对
# --directional 适用于常规方向性文库 (OT/OB)；-p 设定线程数；--score_min 设定比对得分函数
bismark \
  --bowtie2 \
  --genome /path/to/reference_genome/ \
  -1 sample_R1_val_1.fq.gz \
  -2 sample_R2_val_2.fq.gz \
  --parallel 4 \
  --pbat FALSE \
  --output_dir results/bismark_align/

# 步骤 3：去除双端测序由于 PCR 扩增引入的假性技术重复 (Deduplication)
deduplicate_bismark \
  --paired \
  --bam \
  results/bismark_align/sample_R1_val_1_bismark_bt2_pe.bam \
  --output_dir results/dedup/

# 步骤 4：单碱基分辨率分类提取 CG、CHG 与 CHH 甲基化信息
# --cytosine_report 生成全基因组每个胞嘧啶的终极统计大表；--CX 报告非 CG 甲基化
bismark_methylation_extractor \
  --paired-end \
  --no_overlap \
  --comprehensive \
  --merge_non_CpG \
  --cytosine_report \
  --CX \
  --genome_folder /path/to/reference_genome/ \
  --parallel 8 \
  -o results/methylation/ \
  results/dedup/sample_R1_val_1_bismark_bt2_pe.deduplicated.bam
```

---

## 核心参数科学解析与植物调优指南

| 参数指令 | 推荐取值 | 物理含义与植物科研注意事项 |
| :--- | :--- | :--- |
| `--CX` / `--merge_non_CpG` | **植物研究必须开启** | **提取全量非 CG 甲基化**；默认 Bismark 仅输出 CpG；在植物中必须显式指定 `--CX`，否则所有关键的 CHG 和 CHH 甲基化数据将被全盘遗弃！ |
| `--no_overlap` | **双端测序必须开启** | **重叠读段去重**；当双端测序片段较短产生重叠时，重叠区域的同一物理胞嘧啶仅计读一次，杜绝人工双倍计数。 |
| `--cytosine_report` | 强烈推荐开启 | **全基因组胞嘧啶总报告**；生成覆盖全基因组所有正反链 C 的规范大表，是下游 DSS 或 ViewBS 分析的最佳输入。 |
| `--score_min` | `L,0,-0.2` (默认) | **比对得分函数**；在植物高杂合或未完全组装物种中，可适度微调以平衡比对灵敏度与错配容忍度。 |

---

## 植物基因组特有挑战与避坑指南

### 1. 叶绿体 DNA 转化率“质控金标准”
- **生化事实**：在植物细胞中，**叶绿体质体 DNA（Chloroplast DNA）天然完全不含有 5mC 修饰**（纯未甲基化分子）。
- **避坑质控规范**：
  - 在 WGBS 实验中，必须将叶绿体基因组作为天然无偏的内参对照；
  - 提取叶绿体序列上所有胞嘧啶的实测转化率：
    $$\text{Bisulfite Conversion Rate} = \frac{T_{\text{chloro}}}{C_{\text{chloro}} + T_{\text{chloro}}} \times 100\%$$
  - **若叶绿体转化率低于 99.0%~99.5%，表明重亚硫酸盐化学转化不完全，未甲基化的 C 被大量错误保留为 C，导致全基因组甲基化水平被系统性严重假阳性高估**！此实验数据必须坚决废弃重做。

### 2. 重复序列与转座子（TE）的“多重比对丢弃陷阱”
- 植物基因组富含高度同源的长末端重复转座子（LTR-RT），其本身就是重度甲基化静默的焦点区域。由于 C→T 转换进一步降低了序列复杂度，大量长读段将落在多个拷贝之间，产生多重比对（Multi-mapping）。
- Bismark 默认仅保留唯一比对读段（Unique mappers），这会导致最活跃的年轻转座子簇因为缺乏唯一定位而出现数据空白。
- **对策**：在分析整体转座子表观状态时，推荐结合单端长读段（Nanopore 原生测序修饰检测）或专门的转座子分配工具综合互证。

---

## 植物应用案例与真实文献证据

1. **六倍体普通小麦亚基因组特异性 DNA 甲基化图谱与表达调控**：
   在异源六倍体小麦（*Triticum aestivum*，AABBDD）表观遗传调控研究中（Gardiner et al., *Genome Biology*, 2015），研究团队针对小麦庞大（16 Gb）且富含重复序列的基因组，利用 Bismark 对靶向捕获测序 reads 执行高精度比对，精确分类提取了 A、B、D 三个亚基因组同源基因启动子区与外显子区的 CG、CHG 与 CHH 甲基化图谱，揭示了亚基因组不对称甲基化对三套同源基因剂量表达平衡的关键调控机制（[Gardiner et al., *Genome Biology*, 2015](https://doi.org/10.1186/s13059-015-0838-3)）。

---

## 实践排错与质控规范

- **错误 1：比对率极低（如 Alignment rate < 10%）**
  - *排查原因*：文库构建方式与比对参数不匹配。例如构建的是非方向性文库（Non-directional）或 PBAT 文库，却以默认的方向性（`--directional`）参数运行。
  - *解决方案*：查阅建库试剂盒说明书；若为 PBAT 文库，必须在 Bismark 比对时显式声明 `--pbat`。
- **错误 2：`deduplicate_bismark` 报错 `BAM file is not sorted by name`**
  - *排查原因*：双端测序在执行去重复时，要求 BAM 文件按读段名称排序（Name-sorted），而非物理坐标排序。
  - *解决方案*：使用 `samtools sort -n` 对比对输出的 BAM 文件按名称重排，再输入去重复模块。
