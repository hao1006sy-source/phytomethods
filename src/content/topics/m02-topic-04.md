---
title: 转录本辅助注释与选择性剪接解析
summary: 深度解析剪接图网络流模型（StringTie2）、全长转录组（Iso-Seq）外显子链对齐、植物内含子滞留（IR）特色机制与 PASA 结构更新。
domain: genome-annotation
methods: [braker3]
updatedAt: 2026-11-25
---

## 科学定位与生物学核心问题

虽然基因组 DNA 蕴含着生命的全部蓝图，但在不同组织、特定发育阶段或遭受外界逆境胁迫（干旱、高盐、极端温度、病原侵染）时，究竟哪些基因被激活转录、转录产物如何经过剪接体加工形成成熟 mRNA，必须依赖转录组测序（RNA-seq）提供直接的转录活性证据。

对于植物科学而言，转录本辅助注释（Transcript-informed Annotation）承担着三项无可替代的科学使命：
1. **确证剪接边界的单碱基精度**：统计从头预测算法常因局部密码子偏差而预测出错误的外显子起止位点，跨越内含子的 Split reads 能够提供单碱基精度的剪接供体与受体物理证据；
2. **界定非翻译区（5' UTR 与 3' UTR）**：由于 UTR 不发生三联体翻译，从头预测器极难准确判断其起止，转录本覆盖度断崖式边界是唯一定位转录起始位点（TSS）与多聚腺苷酸化位点（PolyA sites）的实验依据；
3. **全景重塑选择性剪接（Alternative Splicing, AS）**：植物广泛通过选择性剪接响应环境胁迫，单一基因座能够转录出多种具有不同亚细胞定位、结构稳定性或催化活性的蛋白质异构体。

---

## 剪接图（Splice Graph）与网络流转录本组装模型

在基于参考基因组的短读段转录本重构（如 StringTie2）中，算法的核心数学架构是**有向无环剪接图（Directed Acyclic Splice Graph, DAG）**。

### 1. 剪接图的数学形式化

设某基因座区间比对的 RNA-seq 覆盖区域由 $n$ 个互不相交的候选外显子片段构成顶点集 $V = \{v_1, v_2, \dots, v_n\}$，每个顶点赋权 $w(v)$ 表示该外显子区域的平均测序深度。

- **边集合 $E$**：若存在 $k$ 条跨越内含子的 Split reads 同时连接外显子片段 $u$ 与 $v$，且其剪接供体受体符合经典二核苷酸（`GT-AG` 等），则在 $u$ 与 $v$ 之间引入有向边 $e = (u, v) \in E$，边的流权重 $f(e)$ 正比于支持该连接的实际 Junction reads 数量。
- **转录本路径**：一条候选成熟 mRNA 转录本 $T_i$ 对应于剪接图上从某个转录源节点（Source）出发、经由一系列外显子顶点与内含子边、最终到达转录汇节点（Sink）的单向通路：

$$T_i = (s, v_{i_1}, v_{i_2}, \dots, v_{i_m}, t)$$

### 2. 极大似然网络流优化求解

由于多条不同的转录本异构体在相同外显子区域发生重叠覆盖，观察到的外显子总深度是各异构体表达丰度 $x_i$ 的线性叠加。StringTie2 通过建立**最小费用循环网络流**（Min-cost Circulation Network Flow）模型，在满足各节点流量守恒（Kirchhoff 定律）的约束下：

$$\min \sum_{v \in V} \left| w(v) - \sum_{T_i \ni v} x_i \right| + \sum_{e \in E} \left| f(e) - \sum_{T_i \ni e} x_i \right|$$

利用单纯形法或贪心路径分解，严格求解出在统计上最简明且能最大化解释实测测序深度的全长转录本集合及其表达丰度（FPKM/TPM）。

---

## 植物选择性剪接的五大经典模式与生物学特性

与哺乳动物中以**外显子跳跃**（Exon Skipping, ES）为主导的剪接模式截然不同，植物界的选择性剪接展现出极其独特的演化特征：

| 选择性剪接模式 | 结构变异机制 | 植物中占比特征 | 典型生物学功能与逆境响应 |
| :--- | :--- | :--- | :--- |
| **内含子滞留 (Intron Retention, IR)** | 某个内含子未被剪接体切除，直接保留在成熟转录本中 | **极其普遍 (占植物 AS 的 40%~60%)** | 引入提前终止密码子 (PTC)，通过无义介导降解 (NMD) 动态调节功能蛋白丰度 (如耐冷/抗旱调控) |
| **替代 3' 剪接受体 (A3SS)** | 竞争性使用两个不同的 3' AG 剪接位点 | 约占 15%~20% | 导致外显子 5' 端发生微小碱基增减 (如相差 3 bp 导致单氨基酸插入) |
| **替代 5' 剪接供体 (A5SS)** | 竞争性使用两个不同的 5' GT 剪接位点 | 约占 5%~10% | 改变多肽链局域疏水性或调控结构域功能 |
| **外显子跳跃 (Exon Skipping, ES)** | 某个内部盒装外显子被整体跳过连入下一个外显子 | 较少 (仅占约 5%~10%) | 产生缺失特定完整功能结构域的截短型受体蛋白 |
| **相互排斥外显子 (MXE)** | 两个相邻外显子每次只能保留其中恰好一个 | 罕见 (<1%) | 组织特异性同工酶选择 |

---

## 全长转录本（Iso-Seq）与短读段的互补组装

由于短读段（150 bp）无法在物理上直接跨越相距数千碱基的多个剪接节点，因此从短读段推导出的复杂多异构体组合在数学上存在一定程度的概率重组歧义。

由 PacBio 或 Oxford Nanopore 驱动的**全长转录组**（Full-length cDNA / Iso-Seq）技术，能够单个分子从 5' 帽子端连续不间断读取至 3' PolyA 尾巴：
1. **Minimap2 剪接比对**：使用 `minimap2 -ax splice -uf` 将全长转录本直接对齐回参考基因组；
2. **PASA（Program to Assemble Spliced Alignments）流程**：自动将全长 cDNA 联配与短读段转录组比对重叠，识别并修正预测基因模型的错误内含子，添加完整的 UTR 边界，并输出包含全量选择性剪接异构体的综合结构注释表。

---

## 常用实战运行命令

```bash
# 1. 使用 HISAT2 进行剪接感知比对并提取已知剪接位点
hisat2 -x genome_idx -1 R1.fq.gz -2 R2.fq.gz --known-splicesite-infile splicesites.txt -p 32 | \
  samtools sort -@ 8 -o rnaseq_aligned.bam -

# 2. 使用 StringTie2 组装高精度转录本
stringtie rnaseq_aligned.bam -p 32 -o stringtie_transcripts.gtf -l plant_tx

# 3. 将转录本证据作为输入无缝传入 BRAKER3 或 PASA 开展注释优化
```

---

## 参考文献与数据来源

1. **Kovaka S, Zimin AV, Pertea GM, et al.** (2019). Transcriptome assembly from long-read RNA-seq alignments with StringTie2. *Genome Biology*, 20(1), 278. DOI: [10.1186/s13059-019-1910-1](https://doi.org/10.1186/s13059-019-1910-1)
2. **Marquez Y, Brown JWS, Simpson C, et al.** (2012). Alternative splicing in *Arabidopsis thaliana* reveals a major role for intron retention. *Genome Research*, 22(6), 1195–1207. DOI: [10.1101/gr.134080.111](https://doi.org/10.1101/gr.134080.111)
3. **Haas BJ, Delcher AL, Mount SM, et al.** (2003). Improving the *Arabidopsis* genome annotation using maximal transcript alignment assemblies. *Nucleic Acids Research*, 31(19), 5654–5666. DOI: [10.1093/nar/gkg770](https://doi.org/10.1093/nar/gkg770)
