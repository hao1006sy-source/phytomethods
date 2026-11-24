---
title: cuteSV
name: cuteSV
summary: 基于第三代长读段比对签名提取、类型特异性聚类与断裂点迭代细化的高灵敏度结构变异检测工具。
version: 2.1.4
dataType: 坐标排序的 PacBio HiFi / ONT 长读段比对 BAM；参考基因组 FASTA
principle: 长读段断裂点与大 InDel 签名提取、变异类型特异空间聚类与断点局部迭代细化
domainIds: [pangenomics-structural-variation]
topicIds: [m03-topic-03]
principleIds: [variant-calling]
dataIds: [long-reads, assembly, variant-data]
paper: cutesv-paper
repository: https://github.com/tjiangHIT/cuteSV
status: published
updatedAt: 2026-11-25
---

## 一句话简介与开发背景

单倍型水平的结构变异（SVs $\ge 50$ bp）是驱动植物表型分化与杂种优势的核心遗传要素。长读段测序技术（PacBio HiFi 与 Oxford Nanopore）的单条读段长度可达 15~100 kb，能够直接物理跨越长达数千碱基的复杂转座子插入与串联重复区。

**cuteSV** 由哈尔滨工业大学 Jiang 等人开发（Jiang et al., *Genome Biology*, 2020），是长读段结构变异挖掘领域的代表性工具。算法专门针对长读段测序平台中存在的局部测序错误与比对剪切噪声，设计了独特的**多签名特征提取**、**变异类型特异性空间聚类**与**断裂点多阶段迭代细化**架构，能够在极低内存消耗和极高速度下输出高精度的结构变异 VCF。

---

## 生物学与计算问题

从三代长读段比对（BAM）中检测结构变异，算法面临两大关键计算挑战：
1. **测序错误与微小 InDel 噪声对断裂点坐标的干扰**：特别是 ONT 读段中富集的同聚物小误差，容易将一个单一的大型结构变异打碎为多段虚假比对；
2. **大片段复杂重排（倒位、易位）的多重分裂比对**：当单条读段跨越倒位断裂点时，BAM 文件中会记录为主比对（Primary Alignment）与附加比对（Supplementary Alignment，标记为 `SA` 标签），算法必须将不同染色体区域的分裂片段正确配对。

cuteSV 将检测解耦为四步流水线：

```
                ┌──────────────────────────────────────────┐
                │ 坐标排序的单/多样本长读段比对 (BAM / CRAM)│
                └────────────────────┬─────────────────────┘
                                     │
                                     ▼
                ┌──────────────────────────────────────────┐
                │        阶段 1: 变异特征签名提取          │
                │   解析 CIGAR 内部大 InDel (≥50 bp)       │
                │   + 软剪切 (Soft-clip) 与 SA 补充比对    │
                └────────────────────┬─────────────────────┘
                                     │
                                     ▼
                ┌──────────────────────────────────────────┐
                │        阶段 2: 变异类型特异性空间聚类    │
                │   按 DEL/INS/INV/DUP/TRA 设置独立公差    │
                │   利用一维距离与长度比率快速凝聚候选簇   │
                └────────────────────┬─────────────────────┘
                                     │
                                     ▼
                ┌──────────────────────────────────────────┐
                │        阶段 3: 断裂点多步迭代细化        │
                │   剔除偏离主簇的离群读段，精细校准断点   │
                └────────────────────┬─────────────────────┘
                                     │
                                     ▼
                ┌──────────────────────────────────────────┐
                │        阶段 4: 贝叶斯等位基因型判定      │
                │        输出标准 VCF (0/0, 0/1, 1/1)      │
                └──────────────────────────────────────────┘
```

---

## 输入、输出与主要参数

### 1. 输入数据准备
- 必须为经过坐标排序（Coordinate-sorted）并建好索引（`.bai`）的长读段比对 BAM 文件；
- 比对器推荐使用 Minimap2 并启用长读段专用预设（如 `-ax map-hifi` 或 `-ax map-ont`）。

### 2. 官方推荐生产运行模板

```bash
# 针对 PacBio HiFi 数据的官方推荐调优参数
cuteSV sample.hifi.sorted.bam reference.fasta sample_hifi_sv.vcf ./tmp_cutesv \
  --threads 16 \
  --min_support 3 \
  --min_size 50 \
  --max_size 100000 \
  --genotype \
  --max_cluster_bias_INS 1000 \
  --diff_ratio_filtering_INS 0.8 \
  --max_cluster_bias_DEL 1000 \
  --diff_ratio_filtering_DEL 0.5
```

```bash
# 针对 Oxford Nanopore (ONT) 数据的参数调整
cuteSV sample.ont.sorted.bam reference.fasta sample_ont_sv.vcf ./tmp_cutesv \
  --threads 16 \
  --min_support 5 \
  --min_size 50 \
  --genotype \
  --max_cluster_bias_INS 100 \
  --diff_ratio_filtering_INS 0.3 \
  --max_cluster_bias_DEL 100 \
  --diff_ratio_filtering_DEL 0.3
```

**核心选项剖析**：
- `--min_support <INT>`：判定为真实变异所需的最低独立长读段支持数（纯合自交系建议设为 3~5；杂合群体或低测序深度下建议放宽）；
- `--min_size <INT>`：检测的最小变异长度，国际标准设定为 `50`（过滤小于 50 bp 的微小 InDel）；
- `--diff_ratio_filtering_INS / DEL`：聚类簇内读段长度差异比率截断，有效防止将两个相邻但不同长度的独立插入错误合并；
- `--genotype`：激活等位基因型判定（输出 `0/1` 杂合或 `1/1` 纯合变异）。

---

## 植物应用案例

- **十种被子植物 HiFi 结构变异基准评测（2026）**：
  在涵盖拟南芥、水稻、玉米、大豆、小麦等 10 种代表性被子植物的跨物种基准测试中，研究人员以染色体级从头组装提取的真值集合（Assembly-derived Truth Sets）作为黄金标准，系统评测了各主流长读段 SV 识别器。结果表明：**Minimap2 比对结合 cuteSV 在大型插入（INS）与缺失（DEL）检测上具有全平台最高的灵敏度与跨物种稳定性**，综合 F1-score 稳定保持在 0.90 以上。
- **拟南芥诱导突变体与抗性位点挖掘**：
  Bechen 等人在拟南芥着丝粒周边异染色质区域研究中，利用 Nanopore 超长读段结合 cuteSV 成功捕获了 12 个长达数十千碱基的复杂结构变异，并通过 PCR 凝胶电泳和一代测序完全证实了断裂点的准确性。

---

## 实战教程与关联资源

- 官方 GitHub 代码仓库：[tjiangHIT/cuteSV](https://github.com/tjiangHIT/cuteSV)
- 奠基方法论文：[Jiang et al., *Genome Biol.*, 2020](https://doi.org/10.1186/s13059-020-02107-y)
- 关联方法：[SyRI](../../methods/syri/)（基于组装）、[Minigraph-Cactus](../../methods/minigraph-cactus/)（基于变异图）；
- 关联专题：[植物基因组结构变异检测](../../topics/pangenomics-structural-variation/m03-topic-03/)。
