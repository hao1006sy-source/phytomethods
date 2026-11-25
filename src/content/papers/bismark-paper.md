---
title: "Bismark: a flexible aligner and methylation caller for Bisulfite-Seq applications"
summary: "提出重亚硫酸氢盐测序（Bisulfite-Seq）的三字母转换比对模型与胞嘧啶甲基化状态精准提取算法。"
authors: "Krueger F, Andrews SR"
year: 2011
journal: Bioinformatics
doi: 10.1093/bioinformatics/btr167
type: method
methodIds: [bismark]
domainIds: [epigenomics-3d-genome]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

# Bismark: a flexible aligner and methylation caller for Bisulfite-Seq applications

## 1. 研究背景与算法贡献

在表观基因组学研究中，重亚硫酸氢盐测序（Bisulfite Sequencing, BS-seq / WGBS）是全基因组单碱基分辨率绘制 DNA 甲基化图谱的金标准技术。该化学处理将未发生甲基化修饰的胞嘧啶（C）发生脱氨基反应转化为尿嘧啶（U），在随后的 PCR 扩增和测序过程中被读出为胸腺嘧啶（T）；而具有保护性修饰的 5-甲基胞嘧啶（5mC）则保持不变。这一化学转换虽然保留了甲基化印记，但也给计算比对带来了严峻挑战：
1. **序列复杂性急剧降低**：四进制的 DNA 字母表在未修饰区域退化为近似三进制（A, G, T），导致大量重复序列比对歧义。
2. **多重链方向异质性**：重亚硫酸氢盐处理后两条 DNA 互补链不再互补，在标准双端文库中会产生多达 4 种理论链状态（OT: 原始顶链；CTOT: 互补于原始顶链；OB: 原始底链；CTOB: 互补于原始底链）。

Felix Krueger 与 Simon Andrews 在 2011 年提出了 **Bismark**，成为表观基因组学领域应用最广泛的经典比对与甲基化识别工具。Bismark 的核心贡献在于提出了一套高效、鲁棒的**三字母转换参考基因组索引与双向映射机制**，结合底层快速短读段比对器（早期支持 Bowtie，随后升级支持 Bowtie 2），实现了高灵敏度的链特异性比对，并可原生无缝区分植物基因组中至关重要的三种不同胞嘧啶序列上下文（CpG、CHG 和 CHH）。

---

## 2. 核心数学模型与数据结构

### 2.1 四链转换比对空间构建

为了解决 C-to-T 转换带来的不对称性，Bismark 在索引构建阶段生成两个转换版本的参考基因组：
- **C $\to$ T 转换基因组**：将参考基因组正链所有的 C 替换为 T。
- **G $\to$ A 转换基因组**：将参考基因组负链所有的 C 替换为 T（即正链的 G 替换为 A）。

在比对阶段，Bismark 同样对测序 reads 进行实时转换：
- 对于定向测序文库（Directional Library）：将 Read 1 进行 C $\to$ T 转换，分别与 C $\to$ T 基因组和 G $\to$ A 基因组进行比对。
- 对于非定向文库（Non-directional / PBAT）：Reads 同时进行 C $\to$ T 和 G $\to$ A 转换，并行比对到 4 种理论转换链空间中。

比对器仅接受在唯一转换链上具有最佳比对得分的记录，彻底杜绝因三字母转换引发的错误跨链交叉比对。

### 2.2 胞嘧啶甲基化状态判决与上下文分类

完成比对后，Bismark 回溯测序 reads 与未转换原始参考基因组序列的逐碱基比对位置：
- 当参考基因组为 **C**，测序 read 对应位置为 **C** 时：判定为**甲基化胞嘧啶（Methylated Cytosine, 记为 `Z` / `U` / `X`）**。
- 当参考基因组为 **C**，测序 read 对应位置转换为 **T** 时：判定为**非甲基化胞嘧啶（Unmethylated Cytosine, 记为 `z` / `u` / `x`）**。

在单个胞嘧啶位点 $k$，其甲基化水平计算公式为：
$$Methylation\_Level(k) = \frac{C_k}{C_k + T_k} \times 100\%$$

其中 $C_k$ 为支持甲基化的 read 计数，$T_k$ 为支持未甲基化的 read 计数。

Bismark 原生提取三联核苷酸上下文环境：
- **CpG (CG)**：胞嘧啶后紧随鸟嘌呤（大写 `Z` 表示甲基化，小写 `z` 表示未甲基化）。
- **CHG**：C 紧随非 G 碱基（A, C, T），第三位为 G（大写 `U` 表示甲基化，小写 `u` 表示未甲基化）。
- **CHH**：C 紧随后续两个非 G 碱基（大写 `X` 表示甲基化，小写 `x` 表示未甲基化）。

---

## 3. 算法复杂度与计算性能

Bismark 的计算复杂度主要由三部分组成：
1. **转换比对阶段**：时间复杂度为 $O(N \cdot L_{read})$，其中 $N$ 为测序 reads 总数。由于需要比对到两个或四个转换基因组，比对耗时约为常规全基因组 DNA-seq 重测序比对的 2 至 3 倍。
2. **甲基化提取阶段**：时间复杂度为 $O(M)$，其中 $M$ 为比对成功的有效 reads 数量，逐读段回溯胞嘧啶碱基。
3. **内存开销**：取决于参考基因组大小与底层 Bowtie 2 的 FM-index 尺寸。水稻基因组（约 380 Mb）仅需 3–5 GB 内存；玉米基因组（约 2.1 Gb）需 10–14 GB 内存。
4. **多线程并行能力**：支持 `--parallel <int>`（并行启动多个比对子进程）与 `-p <int>`（Bowtie 2 内部多线程），在 32–64 核 HPC 节点上能够实现接近线性的加速扩展。

---

## 4. 植物基因组学应用场景与科研价值

与哺乳动物基因组主要局限于 CpG 甲基化不同，植物具有极其复杂的三种甲基化序列上下文，在表观调控中分工明确：
- **CG 甲基化**：由 MET1 维持，普遍富集于基因区（Gene Body Methylation, gbM）以及转座子区，维持染色质基础构象。
- **CHG 甲基化**：由植物特有的染色质甲基转移酶 CMT3 负责维持，与组蛋白 H3K9me2 修饰形成自我强化的表观抑制正反馈回路。
- **CHH 甲基化**：主要依赖 RNA 介导的 DNA 甲基化（RdDM 途径，由 DRM2 催化）或 CMT2 途径建立，专一性靶向短转座子边缘或异染色质区。

Bismark 的 `bismark_methylation_extractor` 工具能够以极高的精度自动分流输出 CG、CHG 和 CHH 的全基因组单碱基甲基化深度与比例，输出的 CX 报告文件是后续分析植物转座子表观沉默、环境胁迫（干旱、盐碱、热害）表观应答、多倍化基因组亚基因组表观不对称性（Epigenomic Asymmetry）及印记基因发现不可或缺的核心数据源。

---

## 5. 输入输出规范与关键参数指南

### 5.1 输入格式规范
- 参考基因组 FASTA 文件（未经过任何转换的原始组装序列）。
- 单端（Single-End）或双端（Paired-End）FASTQ 文件，需提前完成接头剪切与低质量过滤（推荐使用 Trim Galore，其针对 RRBS/WGBS 进行了专门的胞嘧啶保护优化）。

### 5.2 核心执行命令与参数
```bash
# 1. 构建双向三字母转换索引
bismark_genome_preparation --bowtie2 /path/to/reference_genome/

# 2. 双端重亚硫酸氢盐测序读段比对
bismark \
  --genome /path/to/reference_genome/ \
  -1 sample_R1_val_1.fq.gz \
  -2 sample_R2_val_2.fq.gz \
  --bowtie2 \
  -p 8 \
  --parallel 2 \
  --score_min L,0,-0.2 \
  -o bismark_alignment_out/

# 3. 比对去重（仅适用于 WGBS 全基因组文库，RRBS/扩增子严禁去重）
deduplicate_bismark -p --bam bismark_alignment_out/sample_R1_val_1_bismark_bt2_pe.bam

# 4. 全基因组胞嘧啶甲基化状态提取（植物必开 --CX 与 --cytosine_report）
bismark_methylation_extractor \
  -p \
  --no_overlap \
  --comprehensive \
  --merge_non_CpG \
  --CX \
  --cytosine_report \
  --genome_folder /path/to/reference_genome/ \
  sample_R1_val_1_bismark_bt2_pe.deduplicated.bam
```

### 5.3 关键参数说明
- `--score_min L,0,-0.2`：调整 Bowtie 2 的比对评分阈值，允许一定比例的测序错误与天然单核苷酸多态性（SNP）。
- `--no_overlap`：对双端测序中相互重叠的读段区域只统计一次甲基化状态，防止重复计数人为推高局部深度。
- `--CX` / `--cytosine_report`：强制提取全部序列环境（包括 CHG 和 CHH），对植物表观基因组学必不可少。
- `--merge_non_CpG`：将非 CpG 维度的所有读段整合，辅助快速评估整体表观修饰概况。

---

## 6. 阅读与复现资源

- **软件官方主页与源码仓库**：[FelixKrueger/Bismark GitHub](https://github.com/FelixKrueger/Bismark)
- **官方使用文档与 FAQ**：[Bismark User Guide](https://felixkrueger.github.io/Bismark/)
- **Trim Galore 质控清洗指南**：[Babraham Bioinformatics Trim Galore](https://github.com/FelixKrueger/TrimGalore)
- **站内配套专题**：[DNA 甲基化与测序技术](../../topics/epigenomics-3d-genome/m07-topic-01/)
- **站内实操教程**：[Bismark 亚硫酸氢盐测序全流程分析教程](../../tutorials/bismark-synthetic/)
