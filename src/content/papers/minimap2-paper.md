---
title: "Minimap2: pairwise alignment for nucleotide sequences"
summary: "提出核苷酸序列极速比对算法 Minimap2，首创 Minimizer 稀疏种子采样、自适应动态规划链化（Chaining）与 SIMD 向量化碱基级局部对齐技术，成为三代长读段比对、全基因组组装同源比较与转录组剪切比对的通用工业级基准。"
authors: "Li H"
year: 2018
journal: "Bioinformatics 34(18):3094–3100"
doi: 10.1093/bioinformatics/bty191
type: method
method: minimap2
methodIds: [minimap2]
domainIds: [pangenomics-structural-variation]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

## 研究背景与算法贡献

随着三代单分子测序技术（PacBio 与 Oxford Nanopore）的飞速普及，生物信息学界原有的短读段比对工具（如 BWA-MEM、Bowtie2）与经典局部对齐工具（如 BLAST、BLAT、MUMmer）在面对超长且具有特定测序错误特征的长读段时，遭遇了严重的**速度与内存瓶颈**：
1. **长读段错误率与变异度挑战**：早期长读段包含约 5%~15% 的插入与缺失（InDel）错误，使得基于精确种子查找的传统 FM-index 索引频繁发生种子断裂，比对敏感度大幅暴跌；
2. **超长序列比对的二次方时间复杂度**：传统 Smith-Waterman 或 Needleman-Wunsch 动态规划比对算法在处理动辄数十千碱基（kb）乃至兆碱基（Mb）的全染色体序列时，$\mathcal{O}(L^2)$ 的时间与空间开销根本无法承受；
3. **缺乏统一的全场景比对引擎**：科研人员不得不针对组装比对、长读段比对、短读段比对和剪切 RNA-seq 比对分别维护不同的独立软件，参数调优极其繁琐。

李恒针对上述挑战，开发了通用核苷酸序列比对器 **Minimap2**。Minimap2 在种子、链化与碱基级对齐三个层面上实现了全方位的算法革命，不仅比同类长读段比对工具快 30~50 倍，更以无与伦比的通用性、鲁棒性与精度，成为了长读段比对、全基因组组装比较与泛基因组分析领域的绝对行业基准。

---

## 核心数学模型与数据结构

Minimap2 将全序列比对解耦为三大核心计算阶段，每一阶段均结合了优雅的离散数学建模与现代计算机硬件极致优化：

```
                    查询序列与参考基因组
                              │
                              ▼
           [阶段 1: 索引与 Minimizer 稀疏种子提取]
      (在滑动窗口 $w$ 内选取哈希值最小的 $k$-mer 锚点)
                              │
                              ▼
           [阶段 2: 锚点共线性链化 (Chaining)]
    (动态规划求解具有距离惩罚与长 InDel 容忍的最大评分锚点链)
                              │
                              ▼
           [阶段 3: 链间空隙的碱基级动态规划扩展]
     (双段仿射罚分模型 + 现代 CPU SSE/AVX 向量指令集硬件加速)
                              │
                              ▼
               输出 PAF 坐标比对 / SAM/BAM 比对流
```

### 1. 核心算法阶段拆解
- **Minimizer 稀疏采样（$(w, k)$-minimizers）**：在序列长度为 $w$ 的连续滑动窗口中，仅挑选哈希值最小的那个 $k$-mer 作为种子锚点。这一设计在保留序列同源特异性的同时，将索引大小与种子比对数量大幅缩减至原来的 $2/(w+1)$，极大降低了内存占用与种子查表时间；
- **启发式快速链化算法（Chaining Algorithm）**：寻找一组合法的、在坐标上单调递增的锚点集合。对于锚点 $i$ 和 $j$，其链化动态规划转移方程为：
  $$f(i) = \max_{j < i} \left\{ f(j) + \min(l_i, l_j) - \gamma(gap(j, i)) \right\}$$
  其中 $\gamma(gap)$ 为空位惩罚函数。Minimap2 引入了创新的非线性双段空位惩罚，支持长达数百至数千碱基的结构变异跨越，并在搜索前驱锚点时引入了贪心截断策略，将链化时间从 $\mathcal{O}(N^2)$ 大幅压缩至接近线性 $\mathcal{O}(N)$；
- **Suzuki-Kasahara 向量化动态规划（2-piece Affine Gap）**：在两个相邻链化锚点之间，采用双段仿射罚分模型（分别兼顾短 InDel 与长插入缺失），并使用 CPU 的 128 位/256 位 SIMD 向量寄存器实现并行位级对齐加速。

---

## 算法复杂度与计算性能

- **惊人的计算吞吐率**：比传统的长读段比对器（如 BLASR、NGMLR）快一个数量级以上；在人类或常规植物全基因组 30× HiFi 数据的重测序比对中，通常仅需数十个 CPU 小时即可完成全基因组高保真比对；
- **内存控制卓越**：在人类或玉米等大基因组中构建全基因组 minimizer 索引仅需 10~15 GB 内存，能在普通服务器上轻松运行多样本并发任务；
- **生态主导地位**：Minimap2 的 PAF（Pairwise Alignment Format）格式现已成为计算生物学界通用的轻量比对标准交换格式。

---

## 植物基因组学应用场景与科研价值

1. **三代长读段（HiFi 与 ONT）高保真参考比对**：植物基因组结构变异检测、全基因组重测序分析的标准比对步骤；
2. **全基因组组装同源比较（Assembly-to-Assembly）**：使用 `-ax asm5` 或 `-ax asm10` 快速完成植物不同品系组装间的共线性比对，直接输出全基因组结构变异断裂点；
3. **驱动共线性分析与泛基因组下游**：为 SyRI、Plotsr、MCScanX 等工具提供高质量的全长染色体比对输入；
4. **全长转录组（Iso-Seq / ONT cDNA）剪切比对**：利用 `-ax splice` 模式精准识别植物前体 mRNA 的内含子剪切位点（GT-AG 与各类非经典剪接位点）。

更多比对与共线性应用可参阅 [全基因组共线性比对与重排识别](../../topics/pangenomics-structural-variation/m03-topic-04/) 及 [结构变异多方法检测](../../topics/pangenomics-structural-variation/m03-topic-03/)。

---

## 输入输出规范与关键参数指南

### 1. 核心输入输出
- **输入**：参考基因组 FASTA，以及查询序列 FASTA/FASTQ；
- **输出**：PAF（默认轻量文本坐标流）或带 CIGAR 比对串的 SAM/BAM 文件。

### 2. 常用植物场景预设命令
```bash
# 场景 1: 植物单倍型组装间共线性比对 (输出供 SyRI 使用的保留等号 BAM)
minimap2 -ax asm5 --eqx -t 32 ref.fa qry.fa | samtools sort -o align_asm.bam

# 场景 2: PacBio HiFi 高保真长读段比对至参考基因组
minimap2 -ax map-hifi -t 32 ref.fa hifi_reads.fq.gz | samtools sort -o hifi.bam

# 场景 3: Oxford Nanopore 超长读段 (Ultralong ONT) 比对
minimap2 -ax map-ont -t 32 ref.fa ont_reads.fq.gz | samtools sort -o ont.bam

# 场景 4: 植物全长单分子转录组 (Iso-Seq) 剪接比对
minimap2 -ax splice:hq -uf -C5 -t 32 ref.fa isoseq.fq.gz | samtools sort -o rna.bam
```
- `-ax asm5`：近缘组装间比较（分化度 <5%）；对于发散较大的植物亚种，可使用 `-ax asm10` 或 `-ax asm20`；
- `--eqx`：在 CIGAR 串中使用 `=`（精确匹配）与 `X`（错配）替代模糊的 `M`，是共线性工具 SyRI 的强制要求；
- `-ax splice`：启用内含子感知剪接比对模式。

---

## 阅读与复现资源

- **期刊正式原文**：[Bioinformatics 34(18):3094–3100 (2018)](https://doi.org/10.1093/bioinformatics/bty191)
- **PubMed 检索记录**：[PMID: 29750242](https://pubmed.ncbi.nlm.nih.gov/29750242/)
- **PubMed Central 全文**：[PMC6137996](https://pmc.ncbi.nlm.nih.gov/articles/PMC6137996/)
- **官方开源代码库**：[lh3/minimap2 (GitHub)](https://github.com/lh3/minimap2)
- **官方技术手册**：[Minimap2 Cookbook & Documentation](https://lh3.github.io/minimap2/minimap2.html)
