---
title: SyRI
name: SyRI
summary: 基于两个高质量染色体级组装的全基因组比对，利用图论动态规划精确分类共线性、倒位、易位、重复及局域核苷酸变异。
dataType: 组装基因组 FASTA / 全基因组比对 BAM / SAM / MUMmer delta
principle: 有向无环图遍历、全局最优共线性骨架动态规划求解与结构重排分层分类
domainIds: [pangenomics-structural-variation]
topicIds: [m03-topic-02, m03-topic-03]
principleIds: [alignment]
dataIds: [assembly]
paper: syri-paper
repository: https://github.com/schneebergerlab/syri
status: published
updatedAt: 2026-11-25
---

## 研究问题与方法定位

在植物泛基因组与演化发育生物学中，解析两个或多个高质量单倍型参考基因组（如野生种与栽培种、不同优良育种自交系）之间的结构变异至关重要。传统基于短读段重测序的比对方法因序列重复度高、读长有限，无法穿透数兆碱基（Mb）级别的染色体倒位与复杂染色体易位。

**SyRI（Synteny and Rearrangement Identifier）**由 Schneeberger 团队开发（Goel et al., *Genome Biology*, 2019），专门面向染色体级高连续性组装的结构差异解析。它的核心定位是：**输入经过严密质控的全基因组比对结果，从宏观染色体结构到微观单碱基，输出全景式、无缝覆盖的五大结构变异分类表与标准 VCF 文件**。

---

## 计算过程与图论算法推导

SyRI 的核心算法并不直接比对核苷酸序列，而是将外部比对器输出的局部同源片段抽象为有向无环图（DAG），利用全局动态规划求解染色体的最优共线主干，并逐级解析非共线重排：

```
                ┌──────────────────────────────────────────┐
                │   全基因组高保真比对 (MUMmer4 / Minimap2) │
                └────────────────────┬─────────────────────┘
                                     │
                                     ▼
                ┌──────────────────────────────────────────┐
                │        阶段 1: 构建正向比对 DAG          │
                │        求解最大权重共线性路径 P*         │
                └────────────────────┬─────────────────────┘
                                     │
                                     ▼
                ┌──────────────────────────────────────────┐
                │        阶段 2: 确立共线性主干 (SYN)      │
                │        未纳入区域转入非共线候选池        │
                └────────────────────┬─────────────────────┘
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           ▼                         ▼                         ▼
   【阶段 3: 倒位判定 (INV)】 【阶段 4: 易位与重复 (TRANS/DUP)】 【阶段 5: 序列发散 (HDR)】
    反向互补比对链           跨染色体/非共线跳跃比对           局部无同源匹配或大插入缺失
    两端具有明确共线侧翼     单倍型一对多拷贝关系             组装缺口与高度歧异区
           │                         │                         │
           └─────────────────────────┼─────────────────────────┘
                                     ▼
                ┌──────────────────────────────────────────┐
                │        阶段 6: 内部微观变异精细提取      │
                │        (SNP, InDel, Copy-Gain/Loss)      │
                │        输出 syri.out, syri.vcf, summary  │
                └──────────────────────────────────────────┘
```

### 1. 最大权重共线性路径动态规划方程
设参考基因组 $R$ 与查询基因组 $Q$ 之间的同向局部比对集合为 $A = \{a_1, a_2, \dots, a_n\}$，每个比对项包含参考坐标 $[r_i^s, r_i^e]$、查询坐标 $[q_i^s, q_i^e]$ 及比对打分 $s_i$。在满足坐标单调递增约束的候选路径集合 $\mathcal{C}$ 中，SyRI 求解全局最优路径：

$$P^* = \arg\max_{P \in \mathcal{C}} \sum_{a_i \in P} s_i$$

被路径 $P^*$ 覆盖的所有区间被严格定义为**共线性区块（Syntenic Region, SYN）**。

### 2. 五大结构变异类别的严格判定逻辑
- **共线性区块（SYN）**：参考与查询染色体间相对物理顺序与正反链方向完全平行的保守主干；
- **倒位区块（INV）**：两序列发生反向互补比对，两端具有明确的共线侧翼断裂点（两侧共线路径连续）；
- **易位区块（TRANS）**：比对序列发生了远距离物理位移，包括同染色体远距离跳跃与非同源染色体间迁移；
- **重复区块（DUP）**：同一段参考序列在查询基因组中存在多个额外比对拷贝（串联或分散重复）；
- **高度分化与未比对区（NOTAL / HDR）**：因序列高度歧异、转座子爆发式特异插入或组装物理间隙导致无法建立局部同源对齐的区域。

---

## 输入、输出与重要参数

### 1. 输入数据准备与比对命令
SyRI 原生支持 MUMmer4 和 Minimap2 的比对输出：

```bash
# 方案 A: 使用 Minimap2 进行比对（推荐短耗时流程）
minimap2 -ax asm5 --eqx -t 32 reference.fasta query.fasta | \
  samtools sort -@ 8 -O BAM -o query_to_ref.bam
samtools index query_to_ref.bam

# 运行 SyRI
syri \
  -c query_to_ref.bam \
  -r reference.fasta \
  -q query.fasta \
  -k -F B \
  --prefix syri_run_ \
  --nc 16
```

**关键选项剖析**：
- `-F B`：指定输入比对格式为 BAM（若使用 MUMmer 则指定 `-F T` 并提供 coords 文件）；
- `-k`：保留共线性内部的微观 SNP 与小型 InDel 解析；
- `--nc 16`：指定 CPU 并行进程数；
- `--dir <path>`：若染色体命名不同，提供 `mapids.txt` 明确指定参考染色体与查询染色体的同源配对关系（如 `Chr1\t1`）。

### 2. 核心输出文件体系
- `syri_run_syri.out`：**核心主输出**，以纯文本形式列出全染色体范围内的全部结构重排块及其首尾物理坐标、变异类型与唯一 ID；
- `syri_run_syri.vcf`：转换为标准 1-based VCF 格式的变异集合，包含 `SVTYPE=INV`、`SVTYPE=TRANS`、`SVTYPE=DUP` 等标准标记；
- `syri_run_syri.summary`：全基因组各结构变异类别的总数量、总覆盖碱基数（bp）及占基因组百分比统计概览表。

### 3. 配套可视化利器：PlotSR
Schneeberger 实验室配套开发了 **PlotSR**，能够直接读取 `syri.out` 生成高出版级质量的染色体共线与倒位彩带图：
```bash
plotsr --sr syri_run_syri.out --genomes genomes.txt -o synteny_plot.png -W 3000 -H 1500
```

---

## 植物应用与限制

- **拟南芥经典验证（Goel et al., 2019）**：在 Col-0 与 Ler 基因组比较中，SyRI 成功检出了 117 个大于 1 kb 的易位事件，并通过 50 份 F2 重组后代群体的单倍型共分离实验，独立证实了 92.3% 预测易位的生物学真实性；
- **植物高重复染色体的注意事项**：在玉米或大麦等转座子含量超过 75% 的植物中，若比对器未过滤高频重复序列，会产生数万个微小碎片化比对，导致 SyRI 的图遍历内存急剧膨胀。运行前必须对比对文件进行适当的长度与相似度阈值过滤（如 MUMmer 使用 `delta-filter -m -i 90 -l 100`）。

---

## 上下游与关联专题

- 上游工具：[MUMmer4](../../methods/mummer4/)、[Minimap2](../../methods/minimap2/)、[AnchorWave](../../methods/anchorwave/) 全基因组比对；
- 下游分析：结合基因组浏览器（IGV/JBrowse2）、[ODGI](../../methods/odgi/) 图泛基因组分析；
- 关联专题：[植物全基因组比对](../../topics/pangenomics-structural-variation/m03-topic-02/)、[植物基因组结构变异检测](../../topics/pangenomics-structural-variation/m03-topic-03/)。

---

## 软件来源与版本记录

- 官方 GitHub 仓库：[schneebergerlab/syri](https://github.com/schneebergerlab/syri)
- 奠基方法论文：[Goel et al., *Genome Biol.*, 2019](https://doi.org/10.1186/s13059-019-1911-0)
- 配套可视化：[Goel & Schneeberger, *Bioinformatics*, 2022](https://doi.org/10.1093/bioinformatics/btac253) (PlotSR)
- 官方发布版本：v1.8.2+（生产环境以实际安装为准）。
