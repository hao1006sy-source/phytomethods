---
title: YaHS：Hi-C 染色体级挂载
name: YaHS
summary: 使用 Hi-C 配对空间接触信息将 Contig 排序、定向并连接为染色体级假分子的超高速现代挂载引擎，支持多分辨率迭代与自动纠错。
dataType: Contig FASTA 与 Hi-C 比对文件 (BAM / BED / BIN)
principle: 多分辨率接触矩阵与端点加权图遍历
domainIds: [genome-assembly]
topicIds: [hic-scaffolding]
principleIds: [hic-scaffolding]
dataIds: [assembly, hic-contact-data]
paper: yahs
repository: https://github.com/c-zhou/yahs
version: 1.2.2
status: published
updatedAt: 2026-11-25
---

## 科学定位与生物学核心问题

通过长读段从头组装获得的 Contig，通常具有数十 Mb 的高连续性，但因着丝粒、端粒或超长转座子区段的阻断，无法直接形成整条染色体的无间隙全长序列。高通量染色质构象捕获（Hi-C）技术通过空间原位交联记录染色体在三维细胞核内的近邻接触信号。

由英国剑桥大学与 Wellcome Sanger 研究所的 Chenxi Zhou、Shane A. McCarthy 与 Richard Durbin 团队联合开发、发表于 *Bioinformatics*（2023）的 **YaHS (Yet Another Hi-C Scaffolding tool)**，以纯 C 语言编写，专为解决现代长读段组装的染色体级挂载难题而设计。相比上一代工具（如 SALSA2, ALLHiC, 3D-DNA），YaHS 在计算速度上实现数量级突破，具备内建的误组装断点自动侦测能力，并全面支持多轮自适应分辨率迭代。

---

## 核心计算原理与算法流程

YaHS 的算法流水线由三大数学核心构成：

### 1. 两端局部接触加权评分模型

传统工具往往将 Contig 视作单一均质质点，导致在判断两条长 Contig 的相对连接方向（Head-to-Head, Head-to-Tail, Tail-to-Tail）时产生严重歧义。YaHS 创新性地将每个 Contig 的物理端点划分为左端（$A_L$）与右端（$A_R$），将空间接触统计聚焦于端点局部区间（如末端 $50\text{ kb}$ 窗口）。

定义两个端点之间的标准化空间连接权重为：

$$W(A_*, B_*) = \frac{C(A_*, B_*) - E(A_*, B_*)}{\sqrt{\text{Var}(A_*, B_*)}}$$

其中 $E(A_*, B_*)$ 为基于染色质聚合物物理衰减模型推导的背景期望接触计数。对四种可能的连接朝向独立打分，确定性求解最优朝向与邻接关系。

### 2. 多分辨率阶梯式渐进迭代（Multi-resolution Iteration）

挂载时若直接采用超高分辨率窗口，由于覆盖稀疏会产生巨大统计泊松噪声；若直接采用超低分辨率，微小 Contig 则被完全平滑淹没。YaHS 采用自适应多轮渐进式策略：
- **粗粒度阶段（默认起始 500 kb / 100 kb）**：优先锚定大型 Contig 骨架（Backbone），确定主要染色体集群归属；
- **细粒度阶段（逐步细化至 50 kb / 20 kb / 10 kb）**：在宏观染色体骨架约束下，逐步将中小型 Contig 插入缝隙，消除排序微小局部抖动。

### 3. 初始 Contig 内部错组装自动侦测与切断（Mis-assembly Splitting）

在每轮挂载前，YaHS 会对输入序列内部的顺式 Hi-C 接触密度进行滑动窗口微分扫描。若发现某处存在接触密度的断崖式锐减，且该位点两侧呈现出截然不同的全基因组染色体接触特征，YaHS 会在断点处自动切断该 Contig，彻底消除上游长读段组装带入的人工嵌合体，防止错误向假分子染色体传递。

---

## 常用实战运行命令与格式转换

### 1. 基础挂载命令

```bash
# 1. 确保 contig 建立 samtools faidx 索引
samtools faidx contigs.fasta

# 2. 运行 YaHS 基础挂载 (推荐输入按坐标或名称排序且已去重的 Hi-C BAM)
yahs -o plant_scaffold -e GATC contigs.fasta hic_aligned.bam
```

### 2. 生成 Juicebox 可视化渲染矩阵

挂载完成后，需借助配套脚本输出可在 Juicebox 中交互式审查的 `.hic` 与 `.assembly` 文件：

```bash
# 使用 juicer pre 脚本生成联系图
juicer pre plant_scaffold_scaffolds_final.bin plant_scaffold_scaffolds_final.agp contigs.fasta.fai > out.pre
java -jar -Xmx32g juicer_tools.jar pre out.pre plant_scaffold.hic <chrom.sizes>
```

---

## 核心参数规范指南

| 参数标志 | 物理意义与算法作用 | 科学使用建议 |
| :--- | :--- | :--- |
| `-o <prefix>` | 输出文件前缀与路径 | 建议为每批次指定独立前缀 (如 `rice_chr_v1`) |
| `-e <enzyme>` | Hi-C 文库限制性内切酶识别位点 (如 `GATC`, `AAGCTT`) | 用于对酶切位点密度进行几何校正；多酶混合文库可逗号分隔 |
| `-l <int>` | 参与挂载的最小 Contig 长度阈值 (bp) | 默认通常为 0；在超碎片化输入中建议设定 `-l 10000` 剔除极短噪音片段 |
| `-q <int>` | Hi-C 读段最小比对质量值 (Mapping Quality, MAPQ) | 默认通常为 10；建议设为 `-q 30` 确保仅保留唯一高置信度接触 |
| `-r <res>` | 自定义多轮迭代分辨率阶梯 (如 `10000,50000,100000`) | 默认由算法自适应推算，一般无需手动覆盖 |

---

## 核心输出档案解读

- `yahs.out_scaffolds_final.fa`：完成排序、定向且以 100 个 `N` 填补缺口后的最终染色体级假分子 FASTA；
- `yahs.out_scaffolds_final.agp`：黄金标准 AGP（A Golden Path）坐标映射表，记录每个 Scaffold 中各 Contig 的起止位置、相对正反方向及间隙大小；
- `yahs.out_break.agp`：记录算法自动识别并切断的初始 Contig 错组装断点清单。

---

## 植物科研代表案例

在 Guo 等人于 2025 年发表在 *Nature* 上的野生与栽培稻泛基因组重大研究中，研究团队在 30 份具有里程碑意义的代表性材料中使用 **YaHS v1.1** 开展染色体级挂载，并结合 Juicebox Assembly Tools 进行了极其严格的人工构象复核，为全球水稻遗传育种确立了超高连续性的泛基因组底图。

---

## 参考文献与数据来源

1. **Zhou C, McCarthy SA, Durbin R.** (2023). YaHS: yet another Hi-C scaffolding tool. *Bioinformatics*, 39(1), btac808. DOI: [10.1093/bioinformatics/btac808](https://doi.org/10.1093/bioinformatics/btac808)
2. **Guo L, Xu X, Zhang L, et al.** (2025). Pangenomic analysis of wild and cultivated rice reveals structural variations and trait evolution. *Nature*. DOI: [10.1038/s41586-025-08883-6](https://doi.org/10.1038/s41586-025-08883-6)
3. **Dudchenko O, Shamim MS, Batra SS, et al.** (2017). De novo assembly of the *Aedes aegypti* genome using Hi-C yields chromosome-length scaffolds. *Science*, 356(6333), 92–95. DOI: [10.1126/science.aal3327](https://doi.org/10.1126/science.aal3327)
