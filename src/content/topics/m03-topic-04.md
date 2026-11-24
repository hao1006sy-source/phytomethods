---
title: 基因存在缺失变异（PAV）
summary: 深度剖析植物基因存在缺失变异（PAV）的生物学机制、基于读深/组装共线/图路径的三大判读模型、PAV-GWAS 关联分析及水稻/玉米经典案例。
domain: pangenomics-structural-variation
methods: [eupan, orthofinder, minigraph, minigraph-cactus, pggb]
status: published
updatedAt: 2026-11-25
---

## 生物学问题与研究意义

在高等植物基因组中，最剧烈且最直接影响农艺性状表型分化的遗传变异形式是**基因存在/缺失变异（Presence/Absence Variation, PAV）**。与单核苷酸多态性（SNPs）通过改变单个氨基酸微调蛋白质活性不同，PAV 代表了一个具有完整生物学功能的转录单元在特定个体或种质资源中**彻底“有”或“无”的定性突变**。

植物 PAV 的发生与维持受到独特的演化动力学塑造：
1. **转座子介导的基因捕获与异位重组**：植物中丰富的 Helitron 转座子与反转录转座子在频繁转位过程中，常通过通读转录（Read-through Transcription）捕获宿主基因外显子，导致非同源不等交换，在某些个体中产生特异性新基因，而在其他个体中发生整段基因物理缺失；
2. **生殖隔离与杂种不育毒素系统**：多个水稻、番茄研究证实，控制物种或亚种间生殖隔离的关键基因座往往是成对演化的 PAV 基因（如毒素-解毒系统）；
3. **“军备竞赛”驱动的免疫基因快速周转**：植物细胞内抗病受体（NLR 基因家族）与受体样激酶（RLK 家族）承载着巨大的病原菌选择压力，植物通过高频的基因得失（Birth-and-Death 演化）维持多样化的防御武器库，导致抗病基因在泛基因组的可变（Dispensable）与特有（Private）组分中极度富集。

---

## PAV 检测的三大技术路线与数学判读模型

在实际科研中，判定某个基因在某份材料中究竟是“真实存在”、“物理缺失”还是“技术未决”，必须建立严密的定量判据：

```
                      ┌─────────────────────────────────────────┐
                      │    目标植物基因组与群体测序数据评估     │
                      └────────────────────┬────────────────────┘
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         ▼                                 ▼                                 ▼
【路线 1: 基于短/长读段覆盖度】    【路线 2: 基于高质量组装共线性】    【路线 3: 基于变异图路径遍历】
 (Coverage-based Mapping)          (Assembly Synteny Anchoring)       (Graph Path Traversal)
         │                                 │                                 │
         ▼                                 ▼                                 ▼
 统计编码 CDS 覆盖度与标准化深度    检验左右侧翼保守基因座连续性       提取图节点中穿行的样本单倍型
 判别真实缺失 vs 比对假阴性        确证中间物理断裂 vs 测序缺口      通过 Bubble 遍历输出二值状态
```

### 1. 路线 1：基于重测序读段覆盖度的统计模型
将群体重测序 reads 比对至参考基因组，统计目标基因 $g$ 内部各碱基的比对深度。
设基因全长为 $L$，碱基 $i$ 的测序读深为 $d_i$，全基因组常染色质非重复区的平均有效测序深度为 $\bar{D}_{\text{genome}}$：
- **标准化基因平均深度（Normalized Depth, $d_g$）**：
  
  $$d_g = \frac{\frac{1}{L} \sum_{i=1}^L d_i}{\bar{D}_{\text{genome}}}$$

- **编码区横向覆盖度（Coverage Breadth, $C_g$）**：
  
  $$C_g = \frac{1}{L} \sum_{i=1}^L \mathbb{I}(d_i \ge 1)$$

**三态分类准则**：
- **存在（Presence, 1）**：$C_g \ge 0.90$ 且 $d_g \ge 0.3$（支持具有充足的转录全长匹配）；
- **缺失（Absence, 0）**：$C_g \le 0.10$ 且 $d_g \le 0.05$，同时要求**该基因两侧各 5 kb 的侧翼区域测序深度正常**（排查由于局域大片段测序文库缺失导致的假缺失）；
- **未知/未决（Missing, `?`）**：介于两阈值之间，或处于高拷贝重复区，在后续统计中必须保留为缺失值。

### 2. 路线 2：基于染色体级组装的侧翼共线性锚定（Synteny Anchoring）
利用高质量从头组装判断 PAV 时，绝不能仅仅依据“在该组装中未注释出该基因”就直接宣布其缺失（可能是由预测软件假阴性造成）。
- **侧翼双重锚定法**：在参考基因组中提取目标基因 $g$ 上游最近的保守共线基因 $g_{\text{up}}$ 与下游最近的保守共线基因 $g_{\text{down}}$；
- **物理断点确认**：在目标查询组装中定位 $g_{\text{up}}'$ 与 $g_{\text{down}}'$。若两基因在查询基因组中物理距离直接闭合（仅相距正常的几百碱基间隔），且序列完全比对确认无任何多肽编码能力，方可确证为**结构性物理缺失（Clean Absence）**；
- 若两锚点之间存在长段未组装的缺口（N-gaps）或断裂跨 Scaffold，必须诚实记录为“组装未决（Assembly Missing）”。

### 3. 路线 3：基于图泛基因组路径（Graph Pangenome）
在构建好的 Minigraph-Cactus 变异诱导图中，目标基因的等位基因多态性以拓扑气泡（Bubble）呈现。通过追踪各样本的单倍型路径（Path）是否遍历包含该基因序列的内部节点（Nodes），实现全自动、无偏的群体 PAV 矩阵导出。

---

## PAV-GWAS 关联分析与统计学陷阱

传统的全基因组关联分析（GWAS）输入为 SNP 矩阵（数值为 0, 1, 2）。**PAV-GWAS** 则将构建好的全基因组 `样本 × 基因座` PAV 二值矩阵直接作为遗传变异输入，与农艺目标性状表型（如抗病性、分蘖数、耐冷性）构建混合线性模型（Mixed Linear Model, MLM）：

$$y = X\beta + S\alpha + K u + e$$

式中：
- $y$ 为表型向量；
- $S$ 为目标基因座的 PAV 存在缺失指示向量（$S_i \in \{0, 1\}$）；
- $\alpha$ 为该基因存在缺失对表型的加性固定效应；
- $X\beta$ 为群体结构主成分（PCA）固定效应；
- $K u$ 为基于全基因组亲缘关系矩阵（Kinship Matrix）随机多基因背景效应，有效抑制虚假关联。

### 防范虚假关联的生物学规范
1. **频率截断（Minor Allele Frequency, MAF）**：剔除群体频率极低（$f_g < 0.05$ 或 $f_g > 0.95$）的罕见 PAV，防止由极个别测序质量异常样本导致的假阳性统计信号；
2. **严防群体结构亚种假关联**：在水稻籼粳分化、大豆栽培与野生分化中，许多 PAV 是随着亚种古老分化而固定下来的。若不进行严格的群体遗传结构（$Q$ 矩阵或 PCA）校正，极易把亚种间的系统发育背景差异误判为目标表型的因果基因。

---

## 植物经典科研案例穿透

- **水稻 *Se* 杂种不育基因座（Nature Communications 2023）**：
  在亚洲栽培稻籼稻（*Indica*）与粳稻（*Japonica*）亚种间杂交中，长期存在严重的花粉败育。研究人员通过泛基因组分析发现，控制该生殖隔离的关键位点 *Se* 表现为极其严格的 PAV：
  籼稻特异性插入了一个包含相邻 *ORF3* 与 *ORF4* 的超长片段；其中 *ORF3* 在孢子体中表达胞毒蛋白破坏所有花粉，而紧密连锁的 *ORF4* 作为解毒抗毒素专门在配子体中保护自身花粉。缺乏该 PAV 插入片段的粳稻花粉在 F1 植株中因缺乏 *ORF4* 保护而全部败育致死。详见 [Shen et al., *Nat. Commun.*, 2023](https://doi.org/10.1038/s41467-023-38914-y)。
- **玉米抗丝黑穗病关键基因 *ZmWAK*（Nature Genetics 2018）**：
  在玉米全基因组关联分析中，SNP 信号在目标区间均未达到全基因组显著阈值。然而引入全自交系泛基因组 PAV 矩阵后，研究团队迅速锁定了一个编码类受体激酶的 *ZmWAK* 基因——该基因在抗病自交系中完整存在，但在绝大多数感病自交系中完全物理缺失，直接证实了抗病性是由全基因的物理存在与否所决定的。

---

## 参考文献与数据来源

1. **Shen R, Wang L, Liu Y, et al.** (2023). A killer-protector system drives vegetative incompatibility and hybrid sterility in rice. *Nature Communications*, 14, 3042. DOI: [10.1038/s41467-023-38914-y](https://doi.org/10.1038/s41467-023-38914-y)
2. **Zuo W, Chao Q, Zhang N, et al.** (2015). A wall-associated receptor-like kinase confers resistance to *Sporisorium reilianum* in maize. *Nature Genetics*, 47(2), 151–157. DOI: [10.1038/ng.3170](https://doi.org/10.1038/ng.3170)
3. **Wang W, Mauleon R, Hu Z, et al.** (2018). Genomic variation in 3,010 diverse accessions of Asian cultivated rice. *Nature*, 557(7703), 43–49. DOI: [10.1038/s41586-018-0063-9](https://doi.org/10.1038/s41586-018-0063-9)
4. **Zhao Q, Feng Q, Lu H, et al.** (2018). Pan-genome analysis highlights the extent of genomic variation in cultivated and wild rice. *Nature Genetics*, 50(2), 278–284. DOI: [10.1038/s41588-018-0041-z](https://doi.org/10.1038/s41588-018-0041-z)
