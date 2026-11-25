---
title: "Haplotype-resolved de novo assembly using phased assembly graphs with hifiasm"
summary: "提出相位感知组装图（Phased Assembly Graph）算法架构，直接利用 PacBio HiFi 高准确度长读段进行分相组装，支持 HiFi-only 模式输出 Primary/Alternate 组装，以及基于亲本标记的 Trio-binning 模式输出完全分相的双单倍型基因组。"
authors: "Cheng H, Concepcion GT, Feng X, Zhang H, Li H"
year: 2021
journal: Nature Methods
doi: 10.1038/s41592-020-01056-5
type: method
method: hifiasm
methodIds: [hifiasm]
domainIds: [genome-assembly]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

## 1. 研究背景与算法贡献

在真核生物全基因组从头组装（*de novo* assembly）中，解析同源染色体的单倍型序列（Haplotypes）长期以来是计算生物学的重要挑战。传统基于易错长读段的拼接算法普遍采用叠缩折叠策略：将杂合区域压缩为单一的伪单倍型序列（Primary Contigs），再将替代分支剥离为 Alternate Contigs，容易在高度杂合区域引入嵌合拼接错误。

针对 PacBio 高保真长读段（HiFi reads），Haoyu Cheng、Greg T. Concepcion、Xiaowen Feng、Hechen Zhang 与 Heng Li（李恒）于 2021 年在 *Nature Methods* 发表了 **Hifiasm**。该 2021 年原始论文提出了**相位感知组装图（Phased Assembly Graph）**算法架构：
1. **保留杂合分相信息**：在组装图构建初期保留等位变异气泡（Bubbles），避免贪心合并造成的单倍型丢失；
2. **读段纠错与单倍型标记**：利用重叠读段间的单核苷酸差异（SNVs）完成局部纠错并保留真实杂合位点；
3. **分相运行模式**：在 2021 年方法论文中原生支持无外源辅助的独立分相模式（HiFi-only，输出 Primary/Alternate 组装图）以及基于父母本特异短读段 $k$-mer 的三重定相模式（Trio-binning，输出两套完全分相的单倍型组装）。
*(注：利用高通量染色质构象捕获数据进行一步式染色体级分相的 Hi-C 模式，由团队在后续的 2022 年 Nature Biotechnology 论文中独立开发提出。)*

---

## 2. 核心数学模型与数据结构

Hifiasm 基于重叠弦图（String Graph）架构，核心流程包含以下阶段：

### 2.1 读段比对与杂合位点保护
- **全对全比对**：利用 minimizer 索引快速定位潜在重叠读段对，执行带状对齐计算汉明距离；
- **真实变异锁定与纠错**：根据重叠读段支持度统计检验，区分高置信度的真实等位杂合 SNVs 与随机测序噪声，在纠正离散错误的同时锁定真实杂合位点。

### 2.2 相位感知组装图构建与气泡展开
- 构建双向加权组装图，杂合区域以气泡（Bubbles）结构呈现；
- 利用跨越气泡的长读段物理连通信息对局部单倍型路径进行连接与定相；
- **HiFi-only 模式**：通过拓扑解缠与图修剪，输出代表全基因组共识序列的主重叠群（Primary Contigs）组装图与包含杂合等位变异的替代重叠群（Alternate Contigs）组装图；
- **Trio-binning 模式**：读入父母本高准确度短读段预先生成的特异性 $k$-mer 集合，计算图中节点归属于母本或父本的权重，将整图划分为母本单倍型（Hap1）与父本单倍型（Hap2）子图。

---

## 3. 计算资源基准核验（玉米 B73 官方实验证据）

官方文档与代码仓库（v0.12）针对植物复杂基因组提供了明确且经过基准核实的真实运行记录：
- **测试样本**：玉米自交系 B73（*Zea mays*）；
- **基因组规模与数据**：基因组大小 2.2 Gb，PacBio HiFi 数据覆盖度约 22×；
- **运行参数**：`-t48 -l0`（48 线程，禁用杂合序列 purge 级别）；
- **实测性能**：
  - CPU 累计时间：203.2 小时；
  - 实际墙上时间（Wall-clock time）：5.1 小时；
  - 峰值内存占用（Peak RAM）：68 GB；
  - 组装连续性：Contig N50 达到 36.7 Mb。

*注：不同物种的基因组杂合度、重复序列含量及测序深度差异较大，实际计算耗时与内存需求应以具体测试环境与日志记录为准。*

---

## 4. 植物基因组学应用场景与科研价值

1. **复杂植物基因组从头组装**：适用于禾本科作物（如水稻、玉米）、十字花科、茄科及林木等高质量参考序列构建；
2. **家系材料双亲分相**：在具备亲本测序数据的双亲分离群体中，利用 Trio-binning 模式分别拼装出两套亲本来源清晰的染色体级单倍型；
3. **杂合等位变异解析**：在自交不亲和或多年生高杂合植物中，完整保留等位基因特异性序列及结构变异。

---

## 5. 输入输出规范与运行模式

### 5.1 核心命令示例
```bash
# 模式 1: HiFi-only 独立组装 (生成 Primary / Alternate 组装图)
hifiasm -o plant_asm -t 48 sample.hifi.fq.gz

# 模式 2: Trio-binning 亲本标记辅助分相组装 (生成两套分相组装图)
hifiasm -o plant_trio -t 48 \
  -1 mat.yak -2 pat.yak \
  sample.hifi.fq.gz

# 模式 3: 后续扩展的 Hi-C 辅助分相组装 (基于 2022 年扩展算法)
hifiasm -o plant_hic -t 48 \
  --h1 hic_R1.fq.gz --h2 hic_R2.fq.gz \
  sample.hifi.fq.gz
```

### 5.2 核心输出文件体系
- `*.bp.p_ctg.gfa`：Primary contig 组装图（HiFi-only 模式主干）；
- `*.bp.a_ctg.gfa`：Alternate contig 组装图（包含剥离的等位分支）；
- `*.dip.hap1.p_ctg.gfa` 与 `*.dip.hap2.p_ctg.gfa`：Trio-binning 模式下输出的完全分相单倍型组装图；
- `*.hic.hap1.p_ctg.gfa` 与 `*.hic.hap2.p_ctg.gfa`：整合 Hi-C 数据模式下输出的分相单倍型组装图；
- 输出 GFA 文件可使用 `awk '/^S/{print ">"$2;print $3}' input.gfa > output.fa` 或 `gfatools gfa2fa` 转换为标准 FASTA 格式。

---

## 6. 阅读与复现资源

- **2021 年原始方法论文**：[Nature Methods 18(2):170–175 (2021), DOI: 10.1038/s41592-020-01056-5](https://doi.org/10.1038/s41592-020-01056-5)
- **PubMed 检索记录**：[PMID: 33526886](https://pubmed.ncbi.nlm.nih.gov/33526886/)
- **后续 Hi-C 集成分相论文**：[Nature Biotechnology 40(9):1332–1340 (2022), DOI: 10.1038/s41587-022-01261-x](https://doi.org/10.1038/s41587-022-01261-x)
- **官方开源代码库**：[chhylp123/hifiasm (GitHub)](https://github.com/chhylp123/hifiasm)
- **官方技术手册**：[Hifiasm ReadTheDocs Documentation](https://hifiasm.readthedocs.io/en/latest/)
