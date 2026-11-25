---
title: "Protocol for fast scRNA-seq raw data processing using scKB and non-arbitrary quality control with COPILOT"
summary: "基于 kallisto/bustools 极速伪比对与 COPILOT 数据驱动高斯混合模型的植物单细胞质控与定量分析方案。"
authors: "Hsu CW, Shahan R, Nolan TM, Benfey PN, Ohler U"
year: 2022
journal: STAR Protocols
doi: 10.1016/j.xpro.2022.101729
type: method
methodIds: [sc-kb-copilot]
domainIds: [single-cell-spatial-omics]
speciesIds: [arabidopsis]
status: published
updatedAt: 2026-11-25
---

# Protocol for fast scRNA-seq raw data processing using scKB and non-arbitrary quality control with COPILOT

## 1. 研究背景与算法贡献

单细胞 RNA 测序（scRNA-seq）已经成为植物发育生物学、环境逆境应答以及细胞分化时空谱系研究的基石技术。然而，在植物单细胞转录组的数据预处理过程中，长期面临两大严峻的实际技术瓶颈：
1. **上游定量计算耗时冗长且硬件开销极大**：传统的全比对工具链（如 10x Genomics 官方 Cell Ranger）采用 STAR 全基因组剪接比对算法，在处理包含数千万条双端读段的植物单细胞测序文库时，往往需要耗费数十个 CPU 核心并占用高达 32–64 GB 的系统内存，单样本耗时常达数小时乃至整天；
2. **植物原生质体解离导致严重的细胞质渗漏与背景污染**：植物细胞被坚硬的果胶与纤维素细胞壁包围，通常需要经过温和的纤维素酶与离析酶（Macerozyme）长时间酶解消化为原生质体（Protoplasts）。在此过程中，破损细胞极易释放游离 mRNA 到液滴悬液中。传统的质控过滤方法通常主观性地设定一个全局固定硬截断阈值（例如经验性地设定 UMI 计数 $> 500$），极易误删微小但真实的植物特定细胞亚型（如分生组织小细胞），或错误保留大量仅包含游离污染 RNA 的空液滴（Empty Droplets）。

杜克大学的 Chia-Wei Hsu、Rosalinda Shahan、Trevor M. Nolan、Philip N. Benfey 与柏林洪堡大学的 Uwe Ohler 等在 2022 年推出了 **scKB + COPILOT** 协议（发表于 Cell Press *STAR Protocols*）。该协议由两套紧密集成的计算模块组成：
- **scKB（Single-Cell Kallisto/Bustools 流程）**：利用先进的 $k$-mer 伪比对（Pseudoalignment）与 BUS 格式快速提取，将植物单细胞转录本定量提速 5 至 10 倍；
- **COPILOT（Cell-filtration Optimization by Probabilistic Inference of Low-quality cells and Outlier Testing）**：首创了针对植物单细胞的高斯混合模型数据驱动自适应无偏质控过滤算法，确立了植物单细胞转录组数据分析的标准化规范。

---

## 2. 核心数学模型与数据结构

### 2.1 scKB 快速伪比对与转录本等价类量化

scKB 依托 **kallisto | bustools** 底层算法：
- **de Bruijn 图伪比对**：将参考转录组序列构建为基于 $k$-mer 的 de Bruijn 图。测序读段（Reads）无需进行计算开销巨大的单碱基全局比对，而是直接在图中比对并快速匹配至对应的**转录本等价类（Equivalence Classes）**；
- **BUS 文件压缩与 UMI 计数**：利用 `bustools` 极速处理 Barcode、UMI 与等价类对应的二进制 BUS（Barcode, UMI, Set）记录，执行条形码纠错、精确去重并快速矩阵化，直接生成高维稀疏的基因 $\times$ 细胞表达矩阵。

### 2.2 COPILOT 层次高斯混合模型（GMM）无偏数据驱动质控

针对植物解离样本中广泛存在的多峰背景分布，COPILOT 放弃了主观硬阈值，采用**两分量高斯混合模型（Gaussian Mixture Model, GMM）** 对全部被捕获液滴的转录特征进行统计建模：
- 设液滴在主成分特征向量或对数 UMI 计数上的分布为 $x_i$，其概率密度函数表示为两个高斯分量的凸组合：
  $$p(x_i) = \pi_{\text{debris}} \mathcal{N}\left(x_i \mid \mu_{\text{debris}}, \sigma_{\text{debris}}^2\right) + \pi_{\text{cell}} \mathcal{N}\left(x_i \mid \mu_{\text{cell}}, \sigma_{\text{cell}}^2\right)$$
  其中 $\pi$ 为混合权重，$\mu$ 与 $\sigma^2$ 为对应均值和方差。
- **参数估计与后验分离**：利用期望最大化（EM）算法迭代收敛参数，计算每个液滴属于真实活细胞分量的后验概率：
  $$\gamma_i = P(\text{cell} \mid x_i) = \frac{\pi_{\text{cell}} \mathcal{N}(x_i \mid \mu_{\text{cell}}, \sigma_{\text{cell}}^2)}{p(x_i)}$$
- **自适应阈值确定**：结合细胞内细胞器（叶绿体与线粒体）转录本比例的极值分布检验，将后验概率显著高于背景零假设的液滴保留为真实单细胞，实现了非主观、完全基于数据自身分布形态的最佳质控分离。

---

## 3. 算法复杂度与计算性能

1. **计算提速显著**：在 16 核心计算节点上，scKB 伪比对与定量仅需 10–25 分钟即可完成超过 5000 万对双端 reads 的完整处理，比 Cell Ranger 提速 80% 以上。
2. **极小内存消耗**：kallisto 拟南芥转录组索引文件仅数百兆，全套定量过程系统 RAM 占用低于 8 GB。
3. **质控运行仅需数秒**：COPILOT 的 GMM 优化算法在 R 语言中运行极其迅速，单样本万级细胞过滤仅需 10–30 秒，并可自动生成高质量的对数密度质控诊断双峰图。

---

## 4. 植物基因组学应用场景与科研价值

植物组织解离面临着动物研究所没有的极端挑战：
- **植物高丰度叶绿体与线粒体污染控制**：植物光合组织（如成熟叶片）中叶绿体基因转录本可占总 RNA 的 40% 以上，若破裂细胞释放叶绿体转录本，会导致空液滴产生极高的 UMI 假象。COPILOT 能够结合双变量协方差自适应剔除叶绿体/线粒体异常液滴；
- **拟南芥根系精细细胞层图谱**：该协议在 Benfey 实验室发表的顶级拟南芥根系高通量单细胞研究中作为标准流水线应用，能够可靠保留原生木质部初始细胞等极小且脆弱的罕见干细胞类型；
- **大基因组作物多倍体适配**：由于伪比对基于转录组而非全基因组，能够极大减轻小麦、棉花等异源多倍体植物全基因组比对中重复序列引发的比对歧义。

---

## 5. 输入输出规范与关键参数指南

### 5.1 核心操作流程与命令行执行
```bash
# 1. 构建植物转录组索引 (以拟南芥 TAIR10 为例)
kb ref \
  -i Athaliana_transcripts.idx \
  -g Athaliana_t2g.txt \
  -f1 Athaliana_cdna.fa \
  Arabidopsis_thaliana.TAIR10.dna.toplevel.fa \
  Arabidopsis_thaliana.TAIR10.gtf

# 2. 运行 scKB 执行极速伪比对与单细胞定量
kb count \
  -i Athaliana_transcripts.idx \
  -g Athaliana_t2g.txt \
  -x 10xv3 \
  -o kb_output/ \
  -t 16 \
  -m 8G \
  sample_R1.fastq.gz \
  sample_R2.fastq.gz
```

### 5.2 在 R 中执行 COPILOT 非主观智能质控
```R
library(COPILOT)

# 1. 载入 kb count 输出的原始基因表达矩阵
raw_mat <- read_count_output("kb_output/counts_unfiltered")

# 2. 运行 COPILOT 自动高斯混合模型质控
copilot_res <- COPILOT(
  raw_mat,
  organism = "Arabidopsis",
  plot = TRUE,
  out_dir = "copilot_qc_plots/"
)

# 3. 提取过滤后的高置信度纯净单细胞矩阵
clean_matrix <- copilot_res$filtered_matrix
```

### 5.3 关键参数说明
- `-x 10xv3`：指定 10x Genomics 测序化学版本（支持 10xv2、10xv3、DropSeq 等多种微流控格式）。
- `organism = "Arabidopsis"`：COPILOT 内置了拟南芥标准线粒体（`ATMG`）与叶绿体（`ATCG`）基因命名前缀，实现自动识别。

---

## 6. 阅读与复现资源

- **原始研究论文**：[STAR Protocols 2022 DOI: 10.1016/j.xpro.2022.101729](https://doi.org/10.1016/j.xpro.2022.101729)
- **PMC 全文**：[PMCID: PMC9530667](https://pmc.ncbi.nlm.nih.gov/articles/PMC9530667/)
- **PubMed 记录**：[PMID: 36242398](https://pubmed.ncbi.nlm.nih.gov/36242398/)
- **COPILOT 官方 GitHub 仓库**：[BenfeyLab/COPILOT GitHub](https://github.com/BenfeyLab/COPILOT)
- **kallisto | bustools 官方工具套件**：[kallisto-bustools Documentation](https://www.kallistobus.tools/)
- **站内配套专题**：[单细胞转录组测序技术与质控](../../topics/single-cell-spatial-omics/m08-topic-01/)
- **站内配套专题**：[植物单细胞解离与原生质体技术](../../topics/single-cell-spatial-omics/m08-topic-02/)
