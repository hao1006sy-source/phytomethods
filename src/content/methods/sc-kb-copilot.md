---
title: scKB 与 COPILOT
name: scKB/COPILOT
summary: 基于 kallisto 伪比对与 bustools 快速生成单细胞剪接/未剪接表达矩阵，并通过 COPILOT 自适应统计模型过滤植物原生质体环境游离 RNA 背景噪声。
dataType: 单细胞短读段 FASTQ、10x 条形码白名单、物种转录本与内含子参考注释
principle: de Bruijn 图转录本等价类伪比对、BUS 条形码纠错与 UMI 去重、环境游离 RNA 多项分布背景过滤
domainIds: [single-cell-spatial-omics]
topicIds: [m08-topic-01, m08-topic-02]
principleIds: [pseudoalignment, barcode-filtering]
dataIds: [short-reads, single-cell-matrix]
paper: sc-kb-copilot-paper
repository: https://github.com/Hsu-Che-Wei/scKB
version: "1.0.0"
status: published
updatedAt: 2026-11-25
---

## 软件体系定位与科学问题

在植物单细胞转录组（scRNA-seq）与单核转录组（snRNA-seq）测序中，研究者面临着比动物系统远为严峻的技术挑战：
1. **原生质体制备的高创伤性**：植物细胞被厚重刚性的细胞壁包裹，必须使用高浓度纤维素酶、离解酶和果胶酶进行长时间（1~3 小时）酶解以获得原生质体。在此物理化学应激下，大量脆弱原生质体破裂，将其胞质内容物释放到细胞悬液中，造成极严重的环境游离 RNA（Ambient RNA）污染；
2. **植物大液泡与低 RNA 捕获率**：成熟植物薄壁细胞的中央大液泡常占据细胞体积的 80%~90% 以上，有效细胞质仅为贴壁薄层，导致单个液滴（Droplet）内捕获的 mRNA 分子量通常显著低于哺乳动物细胞；
3. **细胞器转录本高丰度压制**：在植物绿色组织（如叶片、茎表皮）中，叶绿体转录本（如核酮糖-1,5-二磷酸羧化酶大亚基 *rbcL* 等）可占据总测序 reads 的 30%~70%，大幅稀释核基因转录本有效测序深度；
4. **标准分析流程的植物水土不服**：通用比对工具（如 Cell Ranger）默认的 EmptyDrops 算法或固定 UMI 过滤阈值，经常将植物低表达但真实的顶端分生组织小细胞误判为“空液滴”剔除，或把包裹了高浓度游离叶绿体/线粒体 RNA 的空液滴误判为“真实细胞”。

为了解决这一系列植物瓶颈，由台湾中央研究院与德国 Max Delbrück 中心团队联合提出了 **scKB（kallisto-bustools 植物定制流水线）与 COPILOT（Control of Plant and other difficult single cell experiments）** 联合分析框架。两者分工协作：scKB 负责高精度、轻量级的伪比对（Pseudoalignment）与分子去重计数；COPILOT 则基于严密的概率分布模型，专门自适应清除植物破碎液滴背景，保留高纯度真实单细胞。

---

## 核心算法原理与推导

```
  [单细胞双端测序 FASTQ] (R1: 细胞 Barcode + UMI; R2: cDNA 转录本序列)
                            │
                            ▼
              kallisto 伪比对 (Pseudoalignment)
              └─ 基于 de Bruijn 图将 reads 极速映射为转录本等价类 (Equivalence Classes)
                            │
                            ▼
                bustools 分子解析 (BUS 格式)
              ├─ Barcode 纠错：利用 1-Hamming 距离映射至官方白名单 (Whitelist)
              ├─ UMI 去重：相同等价类分子坍缩消除 PCR 扩增偏差
              └─ 双矩阵划分：区分外显子 (Spliced) 与内含子 (Unspliced) 计数
                            │
                            ▼
             原始基因×细胞未过滤矩阵 (Raw Counts Matrix)
                            │
                            ▼
                 COPILOT 背景噪声统计过滤
              ├─ Barcode Rank 曲线局部几何曲率拟合 (Knee/Inflection Detection)
              ├─ 低丰度液滴多项分布 (Multinomial Distribution) 估计环境游离 RNA
              └─ 负二项广义线性模型 (NB GLM) 似然比检验判定真实完整细胞
                            │
                            ▼
           高质量过滤单细胞矩阵 (Filtered Spliced / Unspliced Matrices)
```

### 1. kallisto 转录本等价类伪比对 (Equivalence Class Pseudoalignment)

传统比对软件（如 STAR、HISAT2）需要将每个 read 的全部碱基与整个基因组进行耗时的动态规划全局/局部比对（Smith-Waterman 算法）。而在单细胞定量中，核心目标仅是确定分子来源于哪个转录本。

kallisto 采用**着色 de Bruijn 图（colored de Bruijn graph, cdbg）**算法：
1. **$k$-mer 索引构建**：将目标植物参考转录组（cDNA 序列及包含内含子的 pre-mRNA 序列）切分为长度为 $k$（通常 $k=31$）的连续 $k$-mer，每个 $k$-mer 关联其出现的转录本集合 $T(k)$；
2. **等价类解析**：对于输入的单细胞测序 read $r$，提取其包含的所有有效 $k$-mer，通过图遍历快速求取其转录本交集：
   $$EC(r) = \bigcap_{k \in r} T(k)$$
   该等价类 $EC(r)$ 即为该 read 的潜在来源转录本集合。
3. **优势**：伪比对无需计算核苷酸插入、缺失与错配的精细罚分矩阵，比对速度比 STAR 提升 10~50 倍，且内存消耗极小（通常拟南芥转录本索引仅需 2~4 GB 内存，水稻仅需 4~8 GB）。

### 2. bustools 分子解析与双矩阵生成

kallisto 将匹配信息直接输出为高度紧凑的二进制 **BUS（Barcode, UMI, Set, Count）** 格式文件，每条记录包含：
- **Barcode**：16 bp 细胞条形码；
- **UMI**：10~12 bp 唯一分子标识符；
- **Set**：等价类标识符；
- **Count**：观测频次。

bustools 随后进行三步核心流式处理：
- **条形码纠错（Barcode Error Correction）**：计算测序条形码与已知的 10x Genomics 条形码白名单之间的 Hamming 距离。若 Hamming 距离为 1 且其邻居概率符合测序错误模型，则校正为标准白名单条形码；无法唯一校正者予以丢弃；
- **UMI 去重（Deduplication）**：将相同 Barcode 且落入同一等价类的记录按 UMI 排序聚类。允许 1 个碱基的测序错配，将同一 PCR 扩增簇坍缩为 1 个绝对分子计数，消除 PCR 扩增偏倚；
- **内含子与外显子双矩阵（Spliced / Unspliced Matrices）**：
  在构建索引时同时输入全长转录本（cDNA，对应已剪接成熟 mRNA）与含侧翼内含子的 pre-mRNA 序列。bustools 分别统计完全落入外显子区域的分子计数（$S$ 矩阵）与落入内含子区域的分子计数（$U$ 矩阵）。该双矩阵不仅是常规聚类的输入，更是后续在植物中开展 RNA velocity（细胞分化速率）分析的必要前提。

### 3. COPILOT 环境游离 RNA 背景噪声建模

在得到未过滤的原始矩阵后，COPILOT 针对植物原生质体破裂机制执行统计学判定：

#### (1) 条形码 UMI 丰度等级拐点检测
将所有检测到的条形码按捕获的 UMI 总分子数从大到小降序排列，绘制 $\log(\text{Rank})$ 与 $\log(\text{Total UMI})$ 曲线（Barcode Rank Plot）。COPILOT 通过局部多项式拟合计算曲线一阶导数与二阶导数，精确定位曲线的**拐点（Inflection Point）**与**膝点（Knee Point）**，将条形码划分为：
- 明确真实细胞区段（高于膝点）；
- 混合争议区段（介于膝点与拐点之间）；
- 纯环境背景区段（低于拐点，通常 UMI $< 50$）。

#### (2) 环境游离 RNA 概率分布估计
COPILOT 提取纯环境背景区段内的所有分子，将其视作破损原生质体泄漏到细胞外悬浮液中的游离 RNA 均匀混合物。假设游离背景遵循多项分布（Multinomial Distribution），估计每个基因 $g$ 在环境背景中的相对丰度基线：
$$\hat{p}_g = \frac{\sum_{i \in \text{Background}} c_{gi}}{\sum_{i \in \text{Background}} \sum_{g'=1}^G c_{g'i}}$$

#### (3) 候选液滴的背景似然比检验
对于争议区段内的每个候选液滴 $j$，其观测表达谱为 $\mathbf{c}_j = (c_{1j}, c_{2j}, \dots, c_{Gj})^T$。COPILOT 建立负二项广义线性模型（NB GLM），检验零假设 $H_0$（该液滴的表达仅由环境游离 RNA 随机包裹形成）与备择假设 $H_1$（该液滴包含真实内源转录本）：
$$\Lambda_j = \frac{\mathcal{L}_{\text{Cell}}(\mathbf{c}_j)}{\mathcal{L}_{\text{Ambient}}(\mathbf{c}_j \mid \hat{\mathbf{p}}, s_j)}$$
结合局部 FDR 控制，仅当液滴的基因多样性与表达结构显著偏离环境背景分布时，才被判定为“真实细胞”保留下来。

---

## 植物分析实践规范与参数对策

| 植物单细胞特殊性 | 潜在技术风险 | 应对策略与参数配置 |
| :--- | :--- | :--- |
| **叶绿体基因超高丰度** | *rbcL* 等单个基因即占全库测序量 20%~50%，扭曲文库大小标准化并遮蔽低表达核基因。 | 在 `kb ref` 构建索引阶段，可选择保留叶绿体以监控破损率，但在 COPILOT 质控与 Scanpy 下游分析时，应将叶绿体编码基因独立统计并单独标记，严禁采用动物 line MT > 5% 的统一阈值截断。 |
| **酶解创伤基因快速激活** | 拟南芥、水稻原生质体制备过程中，短时间内会强烈诱导热休克蛋白（*HSP*）及乙烯响应因子（*ERF*）上调。 | 创伤诱导属于细胞真实生理变化而非破损背景，COPILOT 过滤时重点利用全基因组多项分布偏差，避免将创伤细胞误判为游离背景；下游聚类需回归移除 HSP 模体效应。 |
| **内含子保留 (Intron Retention)** | 植物转录组中内含子保留（IR）是最普遍的可变剪接形式（占植物 AS 的 40% 以上）。 | 在使用 `kb count --workflow lamanno` 时，必须确保使用的植物 GTF 注释包含明确的 transcript_biotype 与严格的 exon 边界，防止将成熟保留型 mRNA 错误归入未剪接前体 RNA。 |

---

## 典型分析命令与操作流程

### 阶段 1：利用 kb-python 构建植物双矩阵索引并比对

```bash
# 1. 准备植物参考基因组 FASTA 与结构注释 GTF (以拟南芥 TAIR10 / Araport11 为例)
GENOME_FASTA="Arabidopsis_thaliana.TAIR10.dna.toplevel.fa"
ANNOTATION_GTF="Araport11_GFF3_genes_transposons.gtf"

# 2. 构建包含已剪接 (cDNA) 与未剪接 (Intron) 转录组的 kallisto 索引 (lamanno 工作流)
kb ref \
    -i ath_lamanno.idx \
    -g ath_t2g.txt \
    -f1 ath_cdna.fa \
    -f2 ath_intron.fa \
    -c1 ath_cdna_t2c.txt \
    -c2 ath_intron_t2c.txt \
    --workflow lamanno \
    ${GENOME_FASTA} \
    ${ANNOTATION_GTF}

# 3. 运行伪比对与分子计数 (针对 10x Genomics v3 试剂盒)
kb count \
    -i ath_lamanno.idx \
    -g ath_t2g.txt \
    -x 10xv3 \
    -o ./kb_output/ \
    -m 8G \
    -t 8 \
    --workflow lamanno \
    -c1 ath_cdna_t2c.txt \
    -c2 ath_intron_t2c.txt \
    read_R1.fastq.gz read_R2.fastq.gz
```

### 阶段 2：在 R 中调用 COPILOT 执行植物背景噪声过滤

```r
library(COPILOT)
library(Matrix)

# 1. 读取 scKB 产出的原始未过滤矩阵
# 目录包含: spliced.mtx, unspliced.mtx, genes.txt, barcodes.txt
raw_data <- Read_scKB(
  matrix_dir = "./kb_output/counts_unfiltered/",
  spliced_name = "spliced.mtx",
  unspliced_name = "unspliced.mtx"
)

# 2. 执行 COPILOT 植物自适应背景过滤
# 自动拟合 Barcode Rank 曲线拐点与环境游离 RNA 背景分布
filtered_cells <- COPILOT_filter(
  count_matrix = raw_data$spliced,
  organism = "Arabidopsis_thaliana",
  min_umi_inflection = 50,       # 设定背景液滴界定基线
  chloroplast_filter = FALSE,    # 根系组织无叶绿体设为 FALSE; 叶片组织设为 TRUE
  fdr_threshold = 0.01           # 显著性截断
)

# 3. 导出高质量单细胞表达矩阵与过滤质控报告
Write_filtered_matrix(
  filtered_obj = filtered_cells,
  out_dir = "./copilot_filtered_matrix/"
)
```

---

## 植物应用案例与分析边界

- **水稻根系土壤胁迫单细胞图谱案例**：在水稻幼苗根系应对异质性土壤胁迫研究中，研究团队利用 scKB 对多批次根尖原生质体测序数据执行极速伪比对，并使用 COPILOT 严格过滤了根际破损细胞造成的环境背景污染，成功保留了分生区脆弱的平周分裂细胞与根被细胞，为后续 DoubletFinder 识别双胞体和拟时序推断奠定了高信噪比数据基础；
- **分析边界与职责界定**：
  - **核心边界**：scKB/COPILOT 专职于**原始测序 reads 到纯净表达矩阵**的阶段；它不执行跨样本批次效应校正（Batch Effect Correction）、聚类分群或拟时序轨迹推断；
  - **下游承接**：COPILOT 导出的纯净 `spliced.mtx` 和 `unspliced.mtx` 矩阵应无缝输入 Scanpy、Seurat 或 CellRank 进行下游空间流形学习与细胞命运建模。
