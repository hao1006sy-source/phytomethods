---
title: "Pangenome graph construction from genome alignments with Minigraph-Cactus"
summary: "提出 Minigraph-Cactus 全碱基级图形泛基因组构建流水线，将 Minigraph 结构变异骨架与 Cactus 全基因组无偏多重比对有机结合，生成兼具大片段变异与高精度全碱基单核苷酸变异（SNV）的单倍型感知泛基因组图及下游索引体系。"
authors: "Hickey G, Monlong J, Ebler J, Novak AM, Paten B, et al."
year: 2024
journal: Nature Biotechnology
doi: 10.1038/s41587-023-01793-w
type: method
method: minigraph-cactus
methodIds: [minigraph-cactus]
domainIds: [pangenomics-structural-variation]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

## 研究背景与算法贡献

随着三代测序技术在植物基因组学中的普及，研究人员面对的不仅是几十套染色体级别的优质基因组组装，更是如何建立一个**兼顾大尺度结构变异（SVs）与单碱基级小变异（SNVs/InDels）**的高分辨率参考图系统：
1. **纯 Minigraph 骨架图分辨率受限**：早期 Minigraph 仅保留 $\ge 50\text{ bp}$ 的结构变异分支，丢失了全基因组范围内数以千万计的单碱基多态性，无法直接用于短读长高通量测序读段的碱基级无偏比对与基因型分型；
2. **纯从头多序列比对（MSA）算力瓶颈**：直接使用传统 Cactus 或多基因组全局比对算法处理数十个动植物复杂基因组时，因庞大的基因组重复序列和长片段多态性导致比对计算开销呈现超二次方爆炸，难以横向扩展；
3. **缺乏下游变异分型接口与索引标准**：传统的局部图模型无法无缝对接高通量读段比对器（如 vg giraffe），导致泛基因组构建与下游群体变异调用之间存在明显技术断层。

为了打破这一僵局，加州大学圣克鲁兹分校（UCSC）团队 Hickey 等人开发了 **Minigraph-Cactus** 流水线。其核心算法思想在于**分层多尺度构建（Hierarchical Multi-scale Graph Alignment）**：先利用 Minigraph 快速确定全局结构变异拓扑骨架，再利用 Cactus 的分治算法对骨架图中的每一个节点与未对齐局部区间进行精细的多序列比对填充，最终合成为高保真、碱基级分辨率的单倍型感知泛基因组图。

---

## 核心数学模型与数据结构

Minigraph-Cactus 流程整合了祖先重组图（Ancestral Recombination Graph）与紧缩双向有向序列图模型，核心计算分为以下关键阶段：

```
                    输入多样本组装 FASTA
                              │
                              ▼
           [Minigraph 参考引导增量构建 SV 骨架图]
                   (捕捉 >=50 bp 结构变异拓扑)
                              │
                              ▼
           [将每个基因组比对回 Minigraph GFA 骨架]
                   (PAF/GAF 路径投影与分块)
                              │
                              ▼
           [Cactus 对局部未对齐区间进行碱基级比对]
            (精确对齐 SNVs, 小 InDels, 消除微小错配)
                              │
                              ▼
         [组装全碱基变异图 (Hal/GFA) 并剥离伪影]
                              │
                              ▼
     [生成 GBZ 压缩单倍型图及 vg giraffe 全套索引]
            (.gbz, .dist, .min, .snarls)
```

### 1. 骨架引导的比对分治策略
- **骨架投影与分块**：将各个输入的基因组独立映射回 Minigraph 骨架图，将整个染色体或全基因组比对问题拆解为一系列数千个独立的、相互无依赖的小尺度局部子图（Snarls/Bubbles）；
- **Cactus 局部多序列比对**：在每一个局部子图内，Cactus 使用其独特的非重叠最大精确匹配链（Chains of Matches）算法执行高度并行的局部精细比对；
- **全单倍型路径嵌入（Embedded Haplotype Paths）**：比对生成后，所有输入基因组被无损地作为连续路径（Paths）永久嵌入在图拓扑中，确保每个样品的单倍型完整性不被破坏。

---

## 算法复杂度与计算性能

- **时间与空间扩展性**：通过利用 Minigraph 将原本全局 $N$-way 复杂比对降维为一系列局部比对，Minigraph-Cactus 将计算复杂度从传统的 $\mathcal{O}(N^2)$ 或 $\mathcal{O}(N^3)$ 降低到接近线性或拟线性 $\mathcal{O}(N \log N)$ 级别；
- **计算资源利用率**：支持在分布式 HPC 集群（Toil 框架）上对成千上万个局部子图进行动态任务分发与高效并行计算；
- **官方基准数据**：在人类泛基因组参考联盟（HPRC）90 个单倍型基准测试中，Minigraph-Cactus 成功完成了全碱基级变异图构建；在植物领域，已广泛应用于拟南芥、玉米（Panzea 26 套组装）、高粱等物种，构建出的 GBZ 图文件可直接用于后续数千个样品的超高速短读长比对。

---

## 植物基因组学应用场景与科研价值

1. **多倍体与高杂合农作物全尺度泛基因组构建**：在双二倍体甘蓝型油菜、异源四倍体花生、异源六倍体小麦中，Minigraph-Cactus 能够清晰区分亚基因组间的直系同源和部分同源关系，同时记录全单倍型多态性；
2. **植物复杂农艺性状关联变异的全息分型**：构建完成的泛基因组不仅包含基因体缺失（PAV），更精细收录了启动子和增强子区域的单碱基变异与微小插入缺失，为农艺性状精细定位提供全变异图谱；
3. **消除短读长测序的参考基因组比对偏倚**：结合 `vg giraffe`，利用 Minigraph-Cactus 构建的泛基因组图作为比对参考，能够大幅提升富含转座子和多态区域的短读长比对准确度与变异检测灵敏度。

相关构建原理与分析实操可参阅 [图形泛基因组构建方法](../../topics/pangenomics-structural-variation/m03-topic-02/) 与 [结构变异多方法检测](../../topics/pangenomics-structural-variation/m03-topic-03/)。

---

## 输入输出规范与关键参数指南

### 1. 核心输入输出
- **输入**：一个样本配对映射表（`seqFile`），包含参考基因组及所有待分析个体的名称与 FASTA 路径；
- **输出**：全碱基级压缩泛基因组图文件（`.gbz`）、参考变异信息（`.vcf.gz`）、距离索引（`.dist`）与最小采样索引（`.min`）。

### 2. 标准运行命令
```bash
# 使用 Cactus-Pangenome 模式一键构建图并生成 vg giraffe 索引
cactus-pangenome ./js ./seqFile.txt \
  --outDir pangenome_output \
  --outName plant_pangenome \
  --reference RefGenome \
  --vcf --giraffegz \
  --maxCores 64 \
  --maxMemory 256G
```
- `--reference RefGenome`：指定作为主坐标骨架的参考基因组名称；
- `--vcf`：从构建完成的泛基因组图中，针对参考骨架生成标准化群体变异 VCF 文件；
- `--giraffegz`：自动生成 downstream 用于快速 reads 比对的 `.gbz`、`.dist` 和 `.min` 索引体系；
- `--filter 0`：在植物复杂基因组中，可设置过滤微小低频变异以降低图拓扑复杂性。

---

## 阅读与复现资源

- **期刊正式原文**：[Nature Biotechnology 42:256–265 (2024)](https://doi.org/10.1038/s41587-023-01793-w)
- **PubMed 检索记录**：[PMID: 37169861](https://pubmed.ncbi.nlm.nih.gov/37169861/)
- **PubMed Central 全文**：[PMC10638906](https://pmc.ncbi.nlm.nih.gov/articles/PMC10638906/)
- **官方开源代码库**：[ComparativeGenomicsToolkit/cactus (GitHub)](https://github.com/ComparativeGenomicsToolkit/cactus)
- **官方文档手册**：[Cactus Pangenome Pipeline Documentation](https://github.com/ComparativeGenomicsToolkit/cactus/blob/master/doc/pangenome.md)
