---
title: "Building pangenome graphs"
summary: "提出无偏全基因组泛基因组构建流水线 PGGB（PanGenome Graph Builder），整合全对全比对、比对诱导构图、图平滑与拓扑优化技术，实现了真正意义上无单一样本依赖的全变异图构建与多基因组解析。"
authors: "Garrison E, Guarracino A, Heumos S, Villani F, et al."
year: 2024
journal: Nature Methods
doi: 10.1038/s41592-024-02430-3
type: method
method: pggb
methodIds: [pggb]
domainIds: [pangenomics-structural-variation]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

## 研究背景与算法贡献

传统的基因组学分析长期依赖于“单一线性参考基因组（Linear Reference）”，甚至许多早期的图形泛基因组构建工具（如 Minigraph）也必须依赖于一个预先选定的参考骨架。然而，在植物演化与系统发生学研究中，这种依赖骨架的设计引入了不可避免的**参考基因组选择偏倚（Reference Bias）**：
1. **参考序列优先权偏差**：优先作为骨架的基因组往往拥有最平滑的路径和最完整的坐标体系，而后加入的基因组序列则被迫拆解为次级分枝，难以客观反映同等的基因组演化地位；
2. **高度多态与重排区域的对齐失效**：在植物特有的抗病 NLR 基因簇、着丝粒及端粒等极端超变异区域，与单一参考骨架的线性距离极远，参考引导的比对策略极易导致比对脱靶或图拓扑坍塌；
3. **缺乏从头全对全比对整合工具**：缺少一个能够直接从多套未知亲缘关系的长读长组装出发，全自动诱导生成高质量变异图的标准化、端到端开源流程。

针对上述科学挑战，Erik Garrison 及其国际合作团队开发了 **PGGB（PanGenome Graph Builder）**。PGGB 抛弃了预设参考骨架的假设，提出了**“全对全比对诱导与局部图平滑（All-to-all Alignment Induction & Graph Smoothing）”**的无偏构建理念，成功在动植物界中实现了对任意多套高质量组装的真正无偏图形泛基因组构建。

---

## 核心数学模型与数据结构

PGGB 并非单一的单体软件，而是一个高度模块化、通过松耦合 Unix 管道无缝编排的端到端算法流水线，其核心由四个核心组件驱动：

```
               多样本全基因组组装 (FASTA)
                           │
                           ▼
          [1. wfmash: 全对全无偏序列比对]
         (波前比对算法 WFA + 局部链化聚类)
                           │
                           ▼
          [2. seqwish: 诱导图拓扑构建]
         (将比对块诱导为节点等价类与有向边)
                           │
                           ▼
          [3. smoothxg: 局部多序列比对平滑]
        (局部 POA 算法消除图拓扑微小气泡与自环)
                           │
                           ▼
          [4. odgi: 图优化、排序与验证]
        (多维尺度变换 1D 线性化与可视化分析)
```

### 1. 核心流水线算法分解
- **wfmash（高效无偏比对）**：基于波前比对算法（Wavefront Alignment Algorithm, WFA）与 minimizer 局部链化策略，实现海量全长染色体序列之间极快且高灵敏度的全对全（All-to-All）核苷酸比对，生成 PAF 格式比对块；
- **seqwish（变异图诱导构建）**：读取 PAF 比对块，将比对完全一致的同源碱基聚类为等价类（Equivalence Classes），诱导合并为图节点，并将序列间的相邻关系诱导为图边，输出原始变异图 GFA；
- **smoothxg（局部拓扑平滑优化）**：原始诱导图因测序误差或微小重复往往包含大量缠结（Tangles）与自环。smoothxg 利用偏序比对（Partial Order Alignment, POA）对局部子图（Blocks）重新执行精细比对平滑，生成规整、易于遍历的图拓扑；
- **odgi（多维拓扑排序）**：利用 1D 降维排序算法对图节点进行全局拓扑排序，使图节点的数字标识符与其物理线性相对顺序保持高度一致。

---

## 算法复杂度与计算性能

- **全对全比对优化**：利用 WFA 算法在现代 CPU 向量指令集（AVX2/AVX-512）上的硬件级加速，wfmash 能够以线性空间与自适应时间复杂度完成长片段比对；
- **单染色体解耦执行**：PGGB 天生支持按同源染色体分染色体执行（Per-chromosome Partitioning），天然适配大规模植物基因组群体的分布式并行计算；
- **基准验证**：论文基准测试表明，PGGB 在 90 个人类单倍型组装构建中展现了卓越的准确率；在水稻、拟南芥等植物测试中，单条染色体的全套 30+ 组装构图通常可在数小时内完成，生成高度紧凑、可直接用于系统发育和结构变异解析的 GFA 图。

---

## 植物基因组学应用场景与科研价值

1. **复杂演化多态性区域（NLR、着丝粒）的无偏解构**：由于不依赖任何单一骨架，PGGB 能够完整保留各个植物生态型特有的基因簇拓扑结构，是解析植物免疫受体演化的首选利器；
2. **多倍体各亚基因组网状演化分析**：在多倍体植物复杂杂交事件中，PGGB 生成的无偏图能够客观展现同源染色体间的重组交换与序列网状演化历程；
3. **宏基因组与超发散近缘种泛基因组探索**：适用于属级（Genus-level）跨物种或超发散野生近缘种的比较泛基因组学研究。

更多关于无偏图构建的理论背景与技术对比，请参阅 [泛基因组与核心、可变基因组](../../topics/pangenomics-structural-variation/m03-topic-01/) 和 [图形泛基因组构建方法](../../topics/pangenomics-structural-variation/m03-topic-02/)。

---

## 输入输出规范与关键参数指南

### 1. 核心输入输出
- **输入**：多样本全基因组或同源染色体拼接的单个多序列 FASTA 文件（必须经 `bgzip` 压缩并由 `samtools faidx` 建立索引）；
- **输出**：平滑优化后的 GFA 图文件（`.smooth.gFA`）、ODGI 优化图（`.og`）、图内多重比对 MSA，以及染色体尺度的 1D 变异图可视化图像。

### 2. 标准运行命令
```bash
# 运行 PGGB 构建无偏染色体泛基因组图
pggb -i Chr01_all_samples.fa.gz \
  -o pggb_output_chr01 \
  -n 30 \
  -t 48 \
  -s 5000 \
  -p 90 \
  -V 'Ref_Chr01:#'
```
- `-i`：输入的多样本合并序列 FASTA 文件；
- `-n 30`：参与构建的单倍型总数；
- `-s 5000`：局部比对分块大小（Segment length），对于植物大基因组或发散近缘种可适当调大至 10000；
- `-p 90`：最小比对相似度百分比（Percentage identity），在种内分析通常设为 90~95，在远缘跨物种分析可下调至 80~85；
- `-V 'Ref_Chr01:#'`：指定用于生成参考坐标系 VCF 变异调用的样本前缀。

---

## 阅读与复现资源

- **期刊正式原文**：[Nature Methods 21:1809–1818 (2024)](https://doi.org/10.1038/s41592-024-02430-3)
- **PubMed 检索记录**：[PMID: 39313626](https://pubmed.ncbi.nlm.nih.gov/39313626/)
- **PubMed Central 全文**：[PMC10104075](https://pmc.ncbi.nlm.nih.gov/articles/PMC10104075/)
- **官方开源代码库**：[pangenome/pggb (GitHub)](https://github.com/pangenome/pggb)
- **官方用户手册**：[PGGB Documentation & Tutorials](https://github.com/pangenome/pggb#readme)
