---
title: "Telomere-to-telomere assembly of diploid chromosomes with Verkko"
summary: "提出多重 de Bruijn 图与超长读段迭代解环架构，创新性地将高准确度 PacBio HiFi 读段与牛津纳米孔 (ONT) 超长读段（Ultra-long reads）相融合，实现真核生物二倍体染色体端粒到端粒 (T2T) 的全自动无缺口分相拼接。"
authors: "Rautiainen M, Nurk S, Walenz BP, Logsdon GA, Porubsky D, Rhie A, Eichler EE, Phillippy AM, Koren S"
year: 2023
journal: Nature Biotechnology
doi: 10.1038/s41587-023-01662-6
type: method
method: verkko
methodIds: [verkko]
domainIds: [genome-assembly]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

## 研究背景与算法贡献

随着端粒到端粒（Telomere-to-Telomere, T2T）人类参考基因组联盟（T2T Consortium）的成功，动植物基因组拼接领域迎来了终极目标：完成整条染色体从一端端粒到另一端端粒的 100% 连续无缺口组装。然而，在面对二倍体与多倍体复杂真核生物时，现有的单一测序技术均存在无法调和的物理缺陷：
- **PacBio HiFi 读段**：碱基准确率极高（>99.9%），能够高灵敏度区分仅相差数个单核苷酸（SNVs）的同源单倍型，但在跨越长度超过 20~50 kb 的超长节段性重复（Segmental Duplications）、核糖体 DNA（rDNA）及巨型着丝粒高阶重复（HORs）时发生物理断裂；
- **ONT 超长读段（Ultra-long, UL reads）**：读长可达 100 kb 至 1 Mb 以上，足以完全跨越自然界中绝大多数超长重复，但其早期原始碱基错误率偏高，直接用于组装易混淆高相似度单倍型分支。

由美国国家人类基因组研究所（NHGRI）Mikko Rautiainen、Sergey Nurk、Adam Phillippy 及 Sergey Koren 等人联合开发的 **Verkko**（芬兰语中意为“网络/网状结构”），首次从数学架构上建立了两种长读长技术的统一组装流水线。其核心贡献包括：
1. **多重 de Bruijn 图（Multiplex de Bruijn Graph）**：以 HiFi 读段为基石构建高保真局部序列网络，完好保留所有微小等位分支与气泡；
2. **ONT 超长读段迭代解环与桥接（Graph Disentanglement）**：将 ONT UL 读段作为物理跨越约束投射至组装图上，逐步消除图中的复式相交节点（Junction nodes）；
3. **单倍型相位标记图驱动**：结合亲本特异 k-mer 标记（Trio markers）或单细胞测序（Strand-seq）定相标记，沿着消解后的染色体巨型路径分离出完全纯合的两套单倍型。

---

## 核心数学模型与数据结构

Verkko 采用分层递进的图解缠计算架构，由 Canu、MBG、GraphAligner 等核心算法组件无缝耦合：

```
                HiFi Reads (高准确长读段)
                         │
                         ▼
        [构建无压缩 k-mer Multiplex de Bruijn 图]
                         │
                         ▼
             [识别单倍型特异性 Bubble 节点]
                         │
                         ├────────────────────────┐
                         │                        │
                         ▼                        ▼
               ONT Ultra-long Reads       Trio / Strand-seq
               (>100 kb 物理跨越)           (亲本/定相标记)
                         │                        │
                         ▼                        │
          [GraphAligner: 超长读段映射至图节点]          │
                         │                        │
                         ▼                        │
           [逐步解环、路径收敛与节点合并]               │
                         │                        │
                         ▼                        ▼
        [单倍型分离 (Haplotype Separation by Marks)]
                         │
                         ▼
       两套 T2T 染色体尺度完全分相 Contigs
```

1. **Multiplex de Bruijn 图构建（MBG）**：
   对于给定较大尺寸的 $k$（通常 $k = 1001$），将 HiFi 读段分解为规范化 $(k+1)$-mers。不同于传统单条路径存储，MBG 在节点内维持序列准确性，并在分支处记录局部单倍型覆盖度流（Flow conservation）。在理想二倍体杂合区域，节点流表现为半深度分流与全深度汇流；
2. **基于图对齐的路径消解（GraphAligner）**：
   设组装图为有向图 $G = (V, E)$，一条 ONT UL 读段可被表示为节点序列遍历路径 $W = (v_1, v_2, \dots, v_m)$。算法计算每个 UL 读段在图拓扑上的最优匹配路径，并建立节点间的连接约束权重矩阵 $M_{uv}$。当且仅当有足够数量的独立超长读段一致支持某条跨越复杂重复节点 $R$ 的路径 $(u \to R \to v)$，且排除了替代分支 $(u \to R \to w)$ 时，算法在拓扑上将节点 $R$ 沿着物理路径复制并分离；
3. **同源着丝粒重复的单倍型拆分**：
   对于着丝粒区包含的多组高阶重复（HOR units），利用微弱的变异单倍型标记（Variant Haplotype Markers, VHMs），建立最小割（Min-Cut）二分图目标函数，将拓扑缠绕图解构为两条平行的线性染色体路径。

---

## 算法复杂度与计算性能

| 维度 | 指标与性能表现 | 算法工程与硬件优化 |
| :--- | :--- | :--- |
| **初始构图阶段 (MBG)** | 耗时约 1~3 小时（32 线程） | 高效多线程哈希表，内存消耗与基因组大小呈线性 $O(G)$ 关系 |
| **超长读段映射 (GraphAligner)** | 耗时约 4~12 小时（计算瓶颈） | 结合有向无环图（DAG）带状动态规划算法，高度依赖向量化指令加速 |
| **内存峰值占用** | 典型 1~2 Gb 基因组约 120~200 GB RAM | 支持大内存多节点工作站或 Slurm 计算集群分布式调度 |
| **终极连续性** | 染色体臂级直接成环，T2T 染色体比率极高 | 在人类及模式植物中实现着丝粒与端粒的无缝闭合 |

---

## 植物基因组学应用场景与科研价值

1. **解决巨型复杂植物着丝粒与核糖体 rDNA 阵列**：
   植物着丝粒通常由成千上万个拷贝、单体长 170~180 bp 的串联卫星 DNA 组成，且常伴随反转录转座子巢穴式插入。仅凭 HiFi 读段难以完全跨越。Verkko 利用 ONT UL 读段能够直接穿透跨越数兆碱基的着丝粒核心，完成植物着丝粒结构的完整重构；
2. **异源多倍体植物亚基因组同源染色体完全分离**：
   在异源四倍体（如棉花、花生、油菜）或六倍体（如普通小麦）中，部分同源染色体间序列一致性极高。Verkko 的逐步解环流水线能有效阻断同源染色体间的错接（Inter-homoeologous chimeras）；
3. **农艺关键大片段结构变异（Inversions & Translocations）精准定位**：
   许多控制作物抗病（如 NLR 基因簇）或耐逆性状的主效 QTL 位于复杂结构变异富集区，Verkko 的 T2T 无缺口组装使研究人员能以单碱基精度锚定全长倒位与重复扩增。

---

## 输入输出规范与关键参数指南

### 关键运行命令行

```bash
# 1. 基础无亲本辅助组装 (HiFi + ONT UL)
verkko -d asm_out \
  --hifi hifi_reads.fq.gz \
  --nano ont_ultra_long.fq.gz \
  --threads 64

# 2. 亲本标记指导的完全分相组装 (Trio-Verkko)
verkko -d asm_trio_out \
  --hifi hifi_reads.fq.gz \
  --nano ont_ultra_long.fq.gz \
  --hap-kmers mat.kmer.meryl pat.kmer.meryl trio \
  --threads 64

# 3. 超大或高重复植物参数调优
verkko -d asm_large_plant \
  --hifi hifi_reads.fq.gz \
  --nano ont_ultra_long.fq.gz \
  --base-k 1001 \
  --max-k 15001 \
  --threads 64
```

- `--hifi <files>`：PacBio HiFi 测序数据（推荐深度 $\ge 30\times$）；
- `--nano <files>`：ONT 读长大于 50 kb（最好大于 100 kb）的超长读段数据（推荐深度 $\ge 25\times$）；
- `--hap-kmers <mat> <pat> trio`：使用 Meryl 预先生成的亲本特异性单倍型标记库；
- `--base-k <int>`：MBG 初始构图 k-mer 大小（默认 `1001`）；
- `--max-k <int>`：逐步递进解环的最大 k-mer 大小。

### 核心产物文件解读

- `assembly.fasta`：最终组装输出的高质量染色体 contigs；
- `assembly.homopolymer-corrected.gfa`：纠正均聚物错误后的单倍型图结构；
- `assembly.hap1.fasta` / `assembly.hap2.fasta`：分相模式下的双单倍型序列。

---

## 阅读与复现资源

- **论文全文**：[Nature Biotechnology, 41(9), 1238–1243 (2023)](https://doi.org/10.1038/s41587-023-01662-6)
- **PubMed 记录**：[PMID: 36797444](https://pubmed.ncbi.nlm.nih.gov/36797444/)
- **官方开源代码仓库**：[GitHub - marbl/verkko](https://github.com/marbl/verkko)
- **相关算法工具详情**：[Verkko 算法原理与指南](../../methods/verkko/)
