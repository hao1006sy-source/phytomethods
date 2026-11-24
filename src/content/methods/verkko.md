---
title: Verkko
name: Verkko
summary: 创新性整合 PacBio HiFi 高保真度与 Oxford Nanopore 超长读段（Ultra-long）的混合图组装管线，专攻着丝粒、端粒及复杂异染色质 T2T 闭合。
dataType: HiFi / ONT Ultra-long
principle: 多重德布鲁因图与图对齐路径解析
domainIds: [genome-assembly]
topicIds: [assembly-basics, assembly-graphs, complete-assembly, haplotype-resolution, sequencing-data]
principleIds: [debruijn, phasing]
dataIds: [hifi, ont-ul]
paper: verkko
repository: https://github.com/marbl/verkko
updatedAt: 2026-11-25
---

## 科学定位与混合组装理念

在追求真核生物完整无缺口基因组（Telomere-to-Telomere, T2T）的过程中，单一测序技术均存在天然物理瓶颈：
- **PacBio HiFi 读段**：虽具备极高的单分子准确率（$\ge Q30 \sim Q40$），但读长通常受限于 $15\sim 25\text{ kb}$，无法完整跨越植物基因组中动辄数兆碱基（Mb）的着丝粒卫星 DNA 阵列（如玉米 CentC 或水稻 CentO）与数十 kb 的 rDNA 基因簇；
- **Oxford Nanopore (ONT) 超长读段**：单分子长度可达 $50\sim 200+\text{ kb}$，足以横跨绝大多数极端串联重复，但其单分子原始错误率（尤其是同聚物 InDel）较高，难以直接构建高保真组装骨架。

由人类端粒到端粒联盟（T2T Consortium）核心算法团队（NHGRI/NIH 与 Canu 开发组）领导、Rautiainen 等人于 2023 年发表在 *Nature Biotechnology* 上的 **Verkko**，首创了“准确度奠基骨架、超长读段穿透图回路”的混合长读段组装新范式。

---

## 核心算法架构与模块拆解

Verkko 内部通过 Snakemake 驱动，由四个精巧衔接的模块组成自动化流水线：

```
PacBio HiFi 读段                       ONT Ultra-long 读段 (>50 kb)
       │                                            │
       ▼                                            │
[1. 同聚物压缩与 MBG 图构建]                        │
       │                                            │
       ▼                                            │
高精度同聚物压缩德布鲁因图 (MBG Unitigs)             │
       │                                            │
       └──────────────┬─────────────────────────────┘
                      ▼
            [2. GraphAligner 图路径比对]
                      │
                      ▼
           [3. 图纠缠解开与气泡解析]
   (利用超长跨越证据逐步消除重叠歧义与自环)
                      │
                      ▼
            [4. 碱基还原与序列共识输出]
```

### 1. 多重德布鲁因图构建（Multiplex de Bruijn Graph, MBG）

Verkko 首先将 HiFi 读段映射到同聚物压缩空间，消除微卫星测序微小波动。利用 MBG（Rautiainen & Marschall, *Bioinformatics* 2021）算法，自适应选取多重字串长度构建高保真局部序列图。MBG 的节点代表无歧义的 Unitigs，边的连接精确反映读段内部的局部物理重叠。

### 2. 超长读段图比对（GraphAligner）

与传统软件将读段比对至扁平线性 FASTA 序列不同，Verkko 调用 **GraphAligner**（Rautiainen et al., *Genome Biology* 2020），将长度大于 $50\text{ kb}$ 的 ONT Ultra-long 读段直接对齐到 MBG 图的拓扑结构中。该算法能够容忍 ONT 的测序误差，在图的所有可能分叉路径中搜寻与该超长分子整体相符的图走线（Graph walks）。

### 3. 图解歧与单倍型分相（Untangling & Phasing）

当多条独立的超长分子一致穿过某个包含大量重复的图分支时，Verkko 将此拓扑结构展开，切断不相容的伪回路。若进一步提供 Hi-C 或亲本特异 $k$-mer（Trio）数据，Verkko 会将局部已闭合的染色体路径分相至对应的同源单倍型染色体。

---

## 硬件与资源需求

由于需要构建全图并执行复杂的全局图路径搜索，Verkko 的内存与磁盘开销显著高于单一组装器：
- **CPU 推荐配置**：32~64 核心线程；
- **物理内存（RAM）**：植物基因组组装建议至少配置 **256 GB ~ 512 GB RAM**（大型复杂植物需 1 TB）；
- **高速存储**：NVMe SSD 临时工作目录，需预留 1~2 TB 磁盘空间以存放中间图拓扑与比对索引。

---

## 常用实战运行命令

### 1. HiFi + ONT Ultra-long 基础混合组装

```bash
# -d: 指定工作目录
# --hifi: 输入 PacBio HiFi FASTQ
# --nano: 输入 ONT Ultra-long FASTQ (建议经过过滤，平均读长 >30 kb)
# --threads: 线程数
verkko -d plant_t2t_run \
  --hifi hifi_reads.fq.gz \
  --nano ont_ultralong.fq.gz \
  --threads 64
```

### 2. 结合 Hi-C 数据的全单倍型 T2T 闭合

```bash
verkko -d plant_t2t_hic \
  --hifi hifi_reads.fq.gz \
  --nano ont_ultralong.fq.gz \
  --hic1 hic_R1.fq.gz --hic2 hic_R2.fq.gz \
  --threads 64
```

---

## 输出结果核心档案解读

- `assembly.fasta`：最终组装出的连续 Scaffold 与无缺口 Contig 序列；
- `assembly.homopolymer-compressed.gfa`：同聚物压缩空间的全局组装拓扑图，保留全部未闭合分叉与气泡，可用 Bandage 软件直观可视化；
- `assembly.scfmap`：记录 GFA 节点与最终 FASTA 染色体序列坐标之间的对应映射表；
- `6-layoutContigs/`：包含图展开过程中的中间路径走线记录，是深入排查着丝粒或端粒断裂原因的核心诊断档案。

---

## 植物实战案例与科学验证

1. **黄花木（*Xanthoceras sorbifolium*）染色体级单倍型组装**：Bi 等人于 2025 年在 *Scientific Data* 上报告了北方木本油料作物黄花木的高质量基因组。研究结合 Hifiasm 与 Verkko 组装产物，利用 Verkko 优异的图路径跨越能力，成功闭合了多个高难度着丝粒异染色质缺口，获得了高度连续的两个单倍型基因组；
2. **水稻 Nipponbare T2T 完整组装**：Shang 等人（*Molecular Plant*, 2023）在构建首个水稻无缺口参考基因组时，正是借鉴并运用了 Verkko 类算法的混合图穿透思想，成功征服了 12 个复杂的 CentO 着丝粒阵列。

---

## 参考文献与数据来源

1. **Rautiainen M, Nurk S, Walenz BP, et al.** (2023). Telomere-to-telomere assembly of diploid chromosomes with Verkko. *Nature Biotechnology*, 41(7), 1017–1024. DOI: [10.1038/s41587-023-01662-6](https://doi.org/10.1038/s41587-023-01662-6)
2. **Rautiainen M, Marschall T.** (2021). MBG: Minimizer-based sparse de Bruijn Graph construction. *Bioinformatics*, 37(16), 2476–2478. DOI: [10.1093/bioinformatics/btab004](https://doi.org/10.1093/bioinformatics/btab004)
3. **Bi Q, Chen Y, Wang X, et al.** (2025). Chromosome-scale haplotype-resolved genome assembly of *Xanthoceras sorbifolium*. *Scientific Data*, 12, 102. DOI: [10.1038/s41597-025-05057-x](https://doi.org/10.1038/s41597-025-05057-x)
