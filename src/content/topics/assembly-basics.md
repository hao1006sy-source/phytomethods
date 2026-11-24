---
title: 基因组组装基础与技术总览
summary: 系统阐释植物基因组从头组装计算全流程、层级数据表示（Reads/Contigs/Scaffolds/T2T）、图算法选型逻辑与多维度质量基准。
domain: genome-assembly
methods: [hifiasm, verkko, merqury]
updatedAt: 2026-11-25
---

## 植物基因组组装的科学背景与计算挑战

植物界拥有地球上最为复杂、多样的基因组结构体系。从仅有约 125 Mb 的模式植物拟南芥（*Arabidopsis thaliana*），到约 2.2 Gb 且富含转座子的玉米（*Zea mays*），乃至高达 16 Gb 的异源六倍体普通小麦（*Triticum aestivum*）和超过 100 Gb 的百合科植物，其基因组普遍具备以下核心生物学特征：
1. **全基因组加倍（WGD）与多倍化历史**：大量植物在其演化历史中经历过多次古多倍化加倍，基因组内保留了成千上万对结构高度相似但存在功能分化的旁系同源基因（Paralogs）与亚基因组同源物（Homeologs）；
2. **转座子超高爆发（TE Bloat）**：长末端重复逆转座子（LTR-RT，包括 Gypsy 与 Copia 家族）在作物基因组中占比常达 50%~85%，形成横跨数十千碱基对（kb）乃至兆碱基对（Mb）的高同一性重复阵列；
3. **异交引起的极端杂合度（Heterozygosity）**：野生果树、林木及多年生牧草通常自交不亲和，两条同源染色体间存在密集的单核苷酸多态性（SNP）与大尺度结构变异（InDel, Inversion, Translocation）。

从头组装（*De novo* Assembly）的根本任务，就是在这三重高复杂度交织的迷宫中，仅依据实验抽样测序得到的随机读段，严格推断并还原出植物原始染色体的线性全序列。

---

## 序列表示的层级体系：从 Reads 到 T2T 全染色体

| 序列层级表示 | 物理定义与生物学实体 | 数据来源与连接线索 | 典型指标与连续性度量 | 局限性与潜在风险 |
| :--- | :--- | :--- | :--- | :--- |
| **Reads (测序读段)** | 测序仪器直接输出的离散分子片段 | 单分子荧光或电信号 (Illumina, HiFi, ONT) | 读长分布 (N50, Max length)、Phred 质量值 (Q 值) | 带有测序误差，单条读长难以完全跨越复杂重复区 |
| **Unitigs (单元片段)** | 组装图中内部无分叉、高确定性的线性序列块 | 严格根据读段完全一致的重叠关系确定 | 长度通常数千碱基至数万碱基 | 遇到等位变异或重复序列分叉立即终止 |
| **Contigs (重叠群)** | 经过气泡弹出、错误剪枝或单倍型路径遍历后的连续序列 | 长读段直接跨越连通，无任何未知间隔 (`N`) | **Contig N50 / NG50** (现代 HiFi 组装通常达 20~50 Mb) | 难以跨越着丝粒、核仁组织区（NOR）等巨型串联阵列 |
| **Scaffolds (支架假分子)** | 多个 Contigs 经过长程物理线索排序、定向后的集合 | Hi-C 空间接触、光学图谱 (Bionano) 或遗传连锁图谱 | **Scaffold N50**、染色体挂载率 (通常 >95%) | Contigs 之间保留长度未知的占位间隔缺口 (Gaps, 记为 `N`) |
| **T2T (端粒到端粒)** | 单条染色体从一端端粒连续无间隙贯通至另一端端粒 | HiFi + ONT Ultra-long 混合组装与图路径解析 | **0 Gap**、完整端粒基序 `(TTTAGGG)n`、CenH3 着丝粒验证 | 需极高成本的超长高分子量 DNA 与深度正交实验证据 |

---

## 组装算法流水线的五大核心计算阶段

现代第三代长读段组装软件（以 Hifiasm 与 Verkko 为代表）并非单向的线性脚本，而是一个交织了统计纠错、图论遍历与分相优化的复杂启发式系统：

```
原始高保真 Reads (HiFi / ONT)
           │
           ▼
[阶段 1: 读段自校正与全联配] ──> 在同聚物压缩空间消除单碱基微小波动
           │
           ▼
[阶段 2: 初始组装图构建] ──────> 建立 String Graph 或多重 de Bruijn 图 (MBG)
           │
           ▼
[阶段 3: 传递边约简与图清理] ──> Myers 算法剪除冗余边，消除盲端死枝 (Tips)
           │
           ▼
[阶段 4: 单倍型感知路径解析] ──> 利用覆盖度二项检验与跨位点 reads 分离等位气泡 (Bubbles)
           │
           ▼
[阶段 5: 长程挂载与染色体封装] ─> 融合 Hi-C 空间衰减模型，输出染色体水平假分子
```

---

## 组装图算法选型与决策逻辑

在面对具体植物材料时，没有放之四海而皆准的“万能”组装工具，必须根据样本遗传背景、测序数据配置与科学研究目标进行严密选型：

1. **自交系与近交纯合材料（如水稻、拟南芥、高代自交玉米）**：
   - 科学目标：追求极高单倍体共识连续性与极低碱基错误率；
   - 推荐方案：PacBio HiFi（30~40x 覆盖）+ Hifiasm 默认模式，直接获得全染色体尺度的 Contig 骨架；
2. **高杂合二倍体野生种或杂交种（如杂交水稻、果树品种）**：
   - 科学目标：完整分离父本与母本两条同源染色体单倍型，避免同源塌陷；
   - 推荐方案：HiFi 测序 + 双亲短读段（Trio-binning 模式）或 HiFi + Hi-C 辅助分相，输出两套完整的单倍型图谱；
3. **复杂多倍体作物（如四倍体马铃薯、六倍体燕麦、八倍体甘蔗）**：
   - 科学目标：区分亚基因组与同源多倍体拷贝剂量；
   - 推荐方案：结合超高深度 HiFi、超长 ONT 读段，采用多倍体专用分相流程（如 HapHiC 辅助挂载）；
4. **终极完整性目标（追求着丝粒与端粒 T2T 闭合）**：
   - 科学目标：全基因组无缺口闭合；
   - 推荐方案：PacBio HiFi（高精度）+ ONT Ultra-long（>50~100 kb 跨越读段）+ Verkko 混合组装管线。

---

## 质量验证的黄金标准

根据国际生物基因组计划（EBP）与脊椎动物基因组计划（VGP）联合确立的 **6.C.Q40** 评估准则：
- **连续性底线**：Contig NG50 $\ge 1\text{ Mb}$，Scaffold NG50 $\ge 10\text{ Mb}$；
- **染色体归属**：$\ge 90\%\sim 95\%$ 的组装序列需可靠锚定挂载至假分子染色体；
- **单碱基准确度**：基于无参考 $k$-mer 谱测定的 Consensus QV 必须 $\ge Q40$（单碱基准确率 $\ge 99.99\%$）；
- **基因完整度**：BUSCO 核心保守直系同源基因完整性通常应达到 $95\%\sim 98\%$ 以上。

深入学习本领域核心算法与实操细节，请继续阅读：
- [组装图与核心算法](../assembly-graphs/)：深入 String Graph 传递边约简与气泡解析；
- [单倍型解析与单倍型感知组装](../haplotype-resolution/)：最小错误校正（MEC）模型与 Trio-binning 机制；
- [Hi-C 辅助染色体挂载](../hic-scaffolding/)：三维染色质衰减物理模型与 YaHS 迭代挂载；
- [组装质量评估与基准](../assembly-quality/)：N50/NG50 数学推导与 Merqury Spectra-cn 判读；
- [T2T 与复杂区域组装](../complete-assembly/)：植物着丝粒与端粒完整闭合攻略；
- [测序技术与原始数据特征](../sequencing-data/)：Lander-Waterman 模型与 GenomeScope 2.0 勘测。

---

## 参考文献与数据规范

1. **Myers EW.** (2005). The fragment assembly string graph. *Bioinformatics*, 21(suppl_2), ii79–ii85. DOI: [10.1093/bioinformatics/bti1114](https://doi.org/10.1093/bioinformatics/bti1114)
2. **Cheng H, Concepcion GT, Meng X, et al.** (2021). Haplotype-resolved de novo assembly using phased assembly graphs with Hifiasm. *Nature Methods*, 18(2), 170–175. DOI: [10.1038/s41592-020-01056-5](https://doi.org/10.1038/s41592-020-01056-5)
3. **Rhie A, Walenz BP, Koren S, Phillippy AM.** (2020). Merqury: reference-free quality, completeness, and phasing assessment for genome assemblies. *Genome Biology*, 21(1), 245. DOI: [10.1186/s13059-020-02134-9](https://doi.org/10.1186/s13059-020-02134-9)
4. **Earth BioGenome Project Consortium.** (2022). The Earth BioGenome Project 2020: Starting the clock. *PNAS*, 119(4), e2115635118. DOI: [10.1073/pnas.2115635118](https://doi.org/10.1073/pnas.2115635118)
