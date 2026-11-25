---
title: Minigraph
name: Minigraph
summary: 基于参考骨架引导的增量泛基因组构图工具，专注于高效捕获与集成 50 bp 以上的大型结构变异 (SVs) 与非参考序列气泡。
dataType: 单倍型级别组装参考基因组 FASTA、逐样本组装 FASTA 与 rGFA 格式泛基因组图
principle: 参考引导的增量图生成、图 minimizer 锚点链化、rGFA 坐标模型与拓扑气泡 (Bubble) 结构变异提取
domainIds: [pangenomics-structural-variation]
topicIds: [m03-topic-01, m03-topic-03, m03-topic-04, m03-topic-05]
principleIds: [graph-genomics]
dataIds: [assembly, graph]
paper: minigraph-paper
repository: https://github.com/lh3/minigraph
version: "0.21"
status: published
updatedAt: 2026-11-25
---

## 软件定位与核心科学问题

随着三代长读段测序（PacBio HiFi、Oxford Nanopore ONT）技术的普及，植物基因组学正从“单物种单参考”迅速迈入“多基因组染色体级从头组装”的黄金时代。

然而，传统的泛基因组图构建方法面临两难困境：
1. **全对全序列多重比对（如早期 Cactus）算力崩溃**：植物基因组动辄数个吉碱基（Gb）且富含 70%~85% 的高度重复转座子序列，全对全全序列对齐在数百个大基因组上计算成本极其昂贵；
2. **微小变异（SNPs/小 Indels）造成图拓扑过度膨胀**：如果把全基因组数千万个单碱基 SNP 全部转化为图的分叉节点，生成的变异图将陷入数亿个微小气泡（Bubbles）的“毛线球”灾难，导致下游比对器无法快速索引。

为了打破这一瓶颈，著名生物信息学学者李恒（Heng Li）等研发了 **Minigraph**（发表于 *Genome Biology*, 2020）。

Minigraph 提出了创新的**参考骨架引导增量构图（Reference-guided Incremental Graph Generation）**策略。它战略性地**过滤掉微小变异，专注于整合长度 $\ge 50\text{ bp}$ 的中大型结构变异（Structure Variations, SVs，包含插入、缺失与复杂倒位）**。通过参考引导的 Graphical Fragment Assembly（rGFA）格式，Minigraph 使得数十个植物大基因组（如水稻、玉米、高粱）能够在几小时内构建出拓扑清晰、计算紧凑的轻量级泛基因组图。

---

## 核心算法原理与数学推导

```
   [参考基因组主干序列 (Ref FASTA)]  ──►  初始化为线性无分支图 G_0 (主干路径 P_ref)
                                                │
                                                ▼
     输入第 1 个样本组装 (Sample 1 FASTA) ──► 图 minimizer 种子抽取与序列到图链化比对
                                                │
                                                ▼
     检测未被图覆盖的新变异 (长度 >= 50 bp) ──► 动态分支插入新节点与边，形成拓扑气泡 (Bubble)
                                                │
                                                ▼
     输入第 2 个样本组装 (Sample 2 FASTA) ──► 比对至更新后的图 G_1 ──► 增量生成图 G_2
                                                │
                                                ▼
     依次增量遍历全样本 ──────────────────────► 最终泛基因组图 (rGFA 格式)
                                                │
                                                ├─────────────────────────────────────────┐
                                                ▼                                         ▼
         从图气泡提取结构变异 (gfatools bubble)        序列到图极速映射 (Sequence-to-graph mapping)
         └─ 导出群体大片段插入/缺失 VCF/BED 矩阵       └─ 长读段或组装 contigs 回比输出 GAF 路径
```

### 1. rGFA 坐标数据模型 (Reference-guided GFA)

为了让泛基因组图既能表达变异分叉，又能与传统线性参考坐标系无缝对齐，Minigraph 规范了 **rGFA（Reference-guided Graphical Fragment Assembly）** 格式：
设图 $G = (V, E, P_{\text{ref}})$：
- **节点集合 $V$**：每个节点 $v$ 包含一段连续的核苷酸序列及唯一编号；
- **边集合 $E$**：有向边连接两个节点的末端与起始端；
- **参考骨架路径 $P_{\text{ref}}$**：图中有且仅有一条主干连续路径，其节点拼接后精确还原用户指定的标准参考基因组序列。
- **稳定坐标标签**：rGFA 在节点行引入特征标签：
  - `SN:Z:chr1`：该节点在参考染色体上的名字；
  - `SO:i:100500`：该节点对应参考序列的起始偏移量（Offset）；
  - `SR:i:0`：主参考骨架节点标为 0；非参考新增变异节点标为 $>0$。
  这一机制确保研究人员即便在高度复杂的变异图中，依然可以瞬间定位任意结构变异相对于传统参考基因组的精确物理区间。

### 2. 序列到图的 minimizer 链化比对 (Sequence-to-Graph Chaining)

如何将一条新的查询组装染色体快速比对到一个已包含分支的图上？
Minigraph 扩展了 minimap2 的算法内核：
1. **图 minimizer 索引**：对图 $G$ 中所有节点序列抽取 $(w, k)$-minimizers，每个 minimizer 记录其出现的节点 ID、方向及节点内相对偏移量；
2. **多项式时间图链化（Graph Chaining）**：
   设查询序列在图上产生一组有序匹配锚点集合 $\mathcal{A} = \{a_1, a_2, \dots, a_m\}$。
   连接锚点 $a_i$ 与 $a_j$ 的打分函数定义为：
   $$\text{Score}(a_i \to a_j) = \text{Score}(a_i) + \min(w_j, \Delta x) - \alpha(\text{dist}_G(a_i, a_j), \Delta x)$$
   其中：
   - $\Delta x$ 为查询序列上的锚点间距；
   - $\text{dist}_G(a_i, a_j)$ 为从锚点 $a_i$ 所在的图节点沿着图的有向边游走到 $a_j$ 的最短测地距离；
   - $\alpha(\cdot)$ 为结合了仿射罚分的距离差距惩罚函数。
   通过动态规划寻找总分最高的全局或半全局锚点链，确定查询组装在图中的最佳行进路径。

### 3. 增量构图机制 (Incremental Graph Generation)

构图过程采用迭代增量推进：
- **初始化**：$G_0$ 为仅包含参考基因组的纯线性图；
- **第 $k$ 步迭代**：输入新样本组装 $A_k$，比对到图 $G_{k-1}$；
- **识别结构变异**：
  若比对中发现连续未匹配的插入片段（长度 $L \ge 50\text{ bp}$），或跨越已有节点的跳跃性缺失（长度 $L \ge 50\text{ bp}$）；
- **节点拓扑裂变与连接**：
  Minigraph 在图的原有节点处执行断开（Split），将新插入的序列作为一个新节点 $v_{\text{novel}}$ 接入，并在侧翼创建两条分支边：
  一条为主干路径，另一条为绕经 $v_{\text{novel}}$ 的旁路路径，形成一个典型的拓扑**气泡（Bubble）**；
- 循环直到全样本遍历结束，最终获得包含全部群体样本结构变异的泛基因组图。

### 4. 拓扑气泡提取与结构变异检测 (Bubble Calling)

变异图构建完成后，Minigraph 自带的 `--call` 选项或专用工具 `gfatools bubble` 能够自动遍历图拓扑：
- 一个标准气泡由一个源节点（Source Node）与一个汇节点（Sink Node）界定；
- 提取连接源与汇之间的两条或多条平行路径：
  - 参考路径（Reference Walk）：穿经主干的序列；
  - 变异路径（Alternate Walk）：穿经样本分叉节点的序列；
- 对比两条路径的长度差与序列差异，直接导出标准 VCF 或 BED 文件，明确报告结构变异类型（INS, DEL, INV）及其在参考基因组上的物理断点坐标。

---

## 泛基因组构图工具特性横向对比

| 评价维度 | Minigraph (李恒) | Minigraph-Cactus (UCSB/Cactus) | PGGB (Pangenome Graph Builder) |
| :--- | :--- | :--- | :--- |
| **变异分辨率** | **宏观结构变异（$\ge 50\text{ bp}$ SVs）**，忽略 SNPs | **全碱基分辨率（包含全部 SNPs、Indels 与 SVs）** | **全碱基分辨率（包含全部 SNPs、Indels 与 SVs）** |
| **参考依赖性** | 强参考引导（以指定参考为主干骨架） | 依赖 Minigraph 骨架引导，再行碱基对齐 | **完全无参考偏倚（无偏全对全比对诱导）** |
| **计算速度与内存** | **极快、超低内存**（20 个水稻组装几小时完成） | 较快（利用分块解耦，但需数百核时） | 较慢（全对全比对计算量随组装数呈平方增长） |
| **生成图大小** | **极小（约 1~1.5 倍参考大小）**，轻量紧凑 | 中等（约 3~5 倍参考大小） | 较大（多重比对图拓扑复杂） |
| **适用科研场景** | **大群体（数百材料）大型结构变异与非参考序列挖掘** | 群体单倍型精细定相、短读段图比对与全变异分型 | 高度分化物种、无优质近缘参考、演化拓扑多尺度分析 |

---

## 典型分析命令与标准操作流

以下为利用 Minigraph 构建植物泛基因组图并提取结构变异的标准工作流：

```bash
# 1. 增量构建植物泛基因组变异图 (以水稻 Nipponbare 为主参考，逐步加入其他栽培稻组装)
# -c: 输出 CIGAR; -xggs: 预设为泛基因组构图模式 (graph generation from assemblies)
# -t 16: 并行 16 线程; -l 50: 仅纳入长度 >= 50 bp 的结构变异 (默认设置)
minigraph \
    -cxggs \
    -t 16 \
    -l 50 \
    Nipponbare_ref.fa \
    Indica_9311.fa \
    Japonica_Kasalath.fa \
    Aus_N22.fa > rice_pangenome.gfa

# 2. 将未知查询组装或长读段映射至构建好的泛基因组图
# -cxlr: 预设为长读段映射模式 (Long-read mapping to graph)
minigraph \
    -cxlr \
    -t 16 \
    rice_pangenome.gfa \
    Wild_rice_reads.fastq.gz > wild_rice_to_graph.gaf

# 3. 基于参考骨架执行变异调用 (Bubble Calling)，提取每个样本特有的结构变异
# --call: 启用路径追踪与变异分型
minigraph \
    -cxasm \
    --call \
    -t 16 \
    rice_pangenome.gfa \
    Indica_9311.fa > Indica_9311_SVs.bed

# 4. 利用 gfatools 统计并导出图拓扑中的全部变异气泡
gfatools bubble rice_pangenome.gfa > rice_pangenome_all_bubbles.bed

# 5. 提取所有非参考新增序列片段 (Novel Segments) 供下游功能注释
gfatools stat rice_pangenome.gfa
```

---

## 科学研究案例与上下游分析协同

- **高粱多基因组图泛基因组基准案例**：在 Kopalli 等（*GigaScience*, 2024）对高粱泛基因组构建算法的权威比较中，研究团队利用 Minigraph 对 6 份高粱代表性染色体级组装进行了构图。在仅纳入 $\ge 50\text{ bp}$ 结构变异的设定下，Minigraph 生成的图大小仅为 0.92 Gb（保持与线性单参考极高的紧凑性），相比于包含全碱基变异膨胀至 4.7 Gb 的全图，Minigraph 在保留全部大片段倒位与基因缺失的前提下，展现出了无可比拟的构图速度与内存经济性；
- **分析工具流转与协作边界**：
  - **输入要求准则**：Minigraph 假定输入为**单倍型级别的连续组装（Assembly FASTA）**，严禁将未组装的短读段 FASTQ 或碎片化 draft contigs 作为单一样本输入；
  - **下游承接**：若需要开展短读段全基因组重测序分型（Genotyping），Minigraph 生成的 rGFA 图可直接作为 **Minigraph-Cactus** 的骨架输入，进一步调用 Cactus 回填高分辨率碱基级比对。
