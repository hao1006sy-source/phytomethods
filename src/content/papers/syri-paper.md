---
title: "SyRI: finding genomic rearrangements and local sequence differences from whole-genome assemblies"
summary: "提出全基因组共线性与结构重排识别算法 SyRI，在染色体尺度系统解构同线性（Synteny）、倒位（Inversion）、易位（Translocation）与串联/分散重复（Duplication）等全尺度变异，配套 Plotsr 工具开创了植物染色体共线性带状图可视化的行业标准。"
authors: "Goel M, Sun H, Jiao WB, Schneeberger K"
year: 2019
journal: Genome Biology
doi: 10.1186/s13059-019-1911-0
type: method
method: syri
methodIds: [syri]
domainIds: [pangenomics-structural-variation]
speciesIds: [arabidopsis]
status: published
updatedAt: 2026-11-25
---

## 研究背景与算法贡献

在长读长测序与高保真组装技术成熟前，基因组结构变异分析大多依赖短读段在断裂点（Breakpoints）或异常插入长度（Discordant Read Pairs）上的间接推断，极易受到基因组重复序列的干扰。当两套染色体级别的连续单倍型组装摆在研究人员面前时，如何**全局、完备且系统地解构两套组装之间所有尺度与类型的序列差异**，成为了比较基因组学与泛基因组学的核心任务：
1. **染色体尺度宏观重排与微观变异的割裂**：传统工具通常要么只能画出全局共线点图（如 Dotplot），要么只能识别局部的短 InDel 与 SNP，缺少统一框架将宏观重排（倒位、易位、重复）与内部嵌套的小变异系统关联起来；
2. **基因组复杂重排缺乏数学分类标准**：染色体内部发生的非互惠易位（Non-reciprocal Translocations）、同源基因片段重复扩增等复杂事件缺乏形式化定义与自动判定算法；
3. **缺乏直观展示多尺度变异的高分辨率可视化手段**：研究人员缺乏一种能够同时清晰呈现染色体大尺度结构变异与基因共线性微观关系的工具。

为突破这些局限，Manish Goel 与 Korbinian Schneeberger 团队开发了 **SyRI（Synteny and Rearrangement Identifier）**。SyRI 以两套组装的全基因组比对为输入，首次建立了染色体尺度全变异的严格分层分类体系，并在拟南芥不同生态型间完成了系统性实验验证，现已成为植物泛基因组与比较基因组重排分析的黄金标准。

---

## 核心数学模型与数据结构

SyRI 采用**有向无环图（DAG）搜索与分层网络聚类**算法，将两套基因组之间的全比对块解析为一个包含不同几何拓扑关系的层级系统：

```
                    两套组装的全基因组比对 (PAF/BAM)
                                  │
                                  ▼
           [阶段 1: 识别最高评分的长同线性骨架 (Syntenic Blocks)]
       (动态规划求解具有单调递增坐标映射的最大共线性路径 SYN)
                                  │
                                  ▼
           [阶段 2: 在剩余未对齐/重排区间识别结构重排事件]
        ┌─────────────────────────┼─────────────────────────┐
        ▼                         ▼                         ▼
   [倒位 (INV)]             [易位 (TRANS)]            [重复 (DUP)]
(方向反转的局部共线块)   (染色体内或跨染色体位置转移)   (同源序列多拷贝映射)
                                  │
                                  ▼
           [阶段 3: 提取块内与块间的局部变异 (Local Differences)]
          (全面记录 SNPs, 小 InDels, 结构变异 SV 与未比对特异区)
                                  │
                                  ▼
             输出 syri.out / syri.vcf 及 Plotsr 可视化
```

### 1. 核心结构变异分类体系
- **同线性区（Synteny, SYN）**：两个基因组中具有严格线性共线性且方向一致的保守同源区段；
- **倒位区（Inversions, INV）**：序列方向严格发生 180 度翻转的高置信度共线区段；
- **易位区（Translocations, TRANS）**：染色体内部（Intra-chromosomal）跨越数个功能区段转移，或发生在非同源染色体之间（Inter-chromosomal）的位置跳跃；
- **重复区（Duplications, DUP）**：参考基因组中的单一区间在查询基因组中存在多个同源拷贝（反之亦然）；
- **非共线性未对齐区（Not Aligned / Highly Divergent, NOTAL/HDR）**：两套基因组之间完全无法对齐的特异新序列（往往富含转座子爆发或外源基因水平转移）；
- **多尺度嵌套记录**：在倒位、易位和同线性块内部，SyRI 会进一步精细递归解析出内部包含的局部小变异（SNVs、短 InDel 与拷贝数变异）。

---

## 算法复杂度与计算性能

- **极低的计算开销**：由于比对计算已在前置比对器（如 minimap2 或 AnchorWave）中完成，SyRI 自身的拓扑图解析与变异分类算法极其高效，在常规植物全基因组染色体分析中通常仅需数分钟至半小时；
- **内存消耗轻量**：在拟南芥、水稻等典型植物基因组中内存开销一般不超过 8~16 GB；
- **实验与生物学验证**：原论文对拟南芥 Col-0 与经典生态型 Cvi-0、Ler 进行全基因组比对，不仅完整重构了染色体核型重排历史，且对预测出的多个大片段倒位与重复进行了 PCR 与荧光原位杂交（FISH）的严格实验验证。

---

## 植物基因组学应用场景与科研价值

1. **物种亚种间核型重排与分化历史解析**：在水稻籼粳亚种间、拟南芥不同生态型间，SyRI 能够全面绘制染色体结构演化图景，揭示倒位介导的重组抑制效应；
2. **农艺关键性状的结构变异溯源**：许多植物优良抗性性状与产量性状受大片段倒位或基因簇串联扩增驱动，SyRI 能够直观确定这些变异的精确断裂点与物理跨度；
3. **Plotsr 共线性带状图可视化**：与下游绘图工具 `plotsr` 深度集成，能够绘制出版级别的多基因组染色体线性比对带状图，直观展示倒位（红色）与易位（蓝色）的染色体位置。

具体实操与命令演示详见本站配套实战教程：[SyRI 染色体共线性与重排识别教程](../../tutorials/syri-intro/)；更多背景请参阅 [全基因组共线性比对与重排识别](../../topics/pangenomics-structural-variation/m03-topic-04/)。

---

## 输入输出规范与关键参数指南

### 1. 核心输入输出
- **输入**：参考基因组 FASTA、查询基因组 FASTA，以及两者的全基因组比对文件（SAM/BAM 或由 `minimap2 -cxasm5 --eqx` 生成的比对文件）；
- **输出**：纯文本重排分类注释表（`syri.out`）、标准化结构变异 VCF 文件（`syri.vcf`），以及 Plotsr 可视化矢量图。

### 2. 标准运行命令
```bash
# 步骤 1: 使用 minimap2 进行全基因组长共线性比对 (保留精确等号比对标记 --eqx)
minimap2 -ax asm5 --eqx -t 16 ref.fa qry.fa | samtools sort -O BAM -o align.bam
samtools index align.bam

# 步骤 2: 运行 SyRI 解构全基因组宏观重排与局部变异
syri -c align.bam -r ref.fa -q qry.fa -k -F B --prefix plant_syri_

# 步骤 3: 使用 plotsr 绘制精美多染色体共线性带状图
plotsr --sr plant_syri_syri.out \
  --genomes genomes.txt \
  -o pangenome_rearrangements.png
```
- `-c align.bam`：输入的排好序的 BAM 比对文件；
- `-k -F B`：保持中间计算缓存并指定比对输入格式为 BAM；
- `--prefix`：输出文件命名前缀。

---

## 阅读与复现资源

- **期刊正式原文**：[Genome Biology 20:277 (2019)](https://doi.org/10.1186/s13059-019-1911-0)
- **PubMed 检索记录**：[PMID: 31847894](https://pubmed.ncbi.nlm.nih.gov/31847894/)
- **PubMed Central 全文**：[PMC6918698](https://pmc.ncbi.nlm.nih.gov/articles/PMC6918698/)
- **官方开源代码库**：[schneebergerlab/syri (GitHub)](https://github.com/schneebergerlab/syri)
- **可视化配套工具**：[schneebergerlab/plotsr (GitHub)](https://github.com/schneebergerlab/plotsr)
- **本站配套教程**：[SyRI 染色体共线性与结构重排实战指南](../../tutorials/syri-intro/)
