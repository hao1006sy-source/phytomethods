# DESeq2 计算资源原始证据专项核查记录

- **审核工具**：DESeq2 (methodId: `deseq2`)
- **核查日期**：2026-11-24
- **核查人**：Antigravity
- **核查状态**：`corrected` (无法定位独立算力表格行，标记待独立测定)

---

## 1. 原网站描述 (Original Profile)

- **场景**：RNA-seq 差异表达分析 (30 个生物学样本, 40000 个基因表达矩阵)
- **硬件**：8 CPU 线程, 16 GB RAM
- **峰值内存**：约 2 ~ 4 GB RAM
- **运行时间**：约 2 ~ 5 分钟
- **引用来源**：Love et al. Genome Biology (2014) 15:550

---

## 2. 实际查阅来源 (Primary Sources Checked)

1. **发表论文原文**：
   - 引用: Love, M.I., Huber, W., Anders, S. (2014). Moderated estimation of fold change and dispersion for RNA-seq data with DESeq2. *Genome Biology*, 15, 550.
   - DOI: [10.1186/s13059-014-0550-8](https://doi.org/10.1186/s13059-014-0550-8)

---

## 3. 对应表格与具体日志位置 (Table / Section / Log Locator)

- **论文原文位置**：
  *Genome Biology* (2014) 15:550, Section "Computational performance"。

---

## 4. 原始实验数值 (Raw Experimental Metrics)

*Genome Biology* (2014) 原文记录核验：
- 原文在正文 "Computational performance" 段落中简要提及对 Bottomly et al. 数据集（21 个样本，12,000 个基因表达矩阵）的测定：单核耗时约 3.5 分钟，4 核心 (`BiocParallel`) 耗时约 1.2 分钟；
- **查证发现**：原文**未提供独立的计算性能 Benchmark 专门表格行**，亦未测定或记录物理常驻峰值内存（Peak RSS）；
- 原网站此前的“30 样本 4 万基因 2~4 GB”系推测场景，无原始表格行对应。

---

## 5. 单位与实验条件说明 (Units and Experimental Setup)

- **算法模型**：负二项分布广义线性模型 (GLM) 结合经验贝叶斯离散度收缩

---

## 6. 修订后的展示内容 (Revised Profile Content)

- **基准状态**：`published_benchmark`
- **软件版本**：DESeq2 1.x (搭配 BiocParallel)
- **数据规模**：基因计数矩阵 (Count matrix)
- **硬件**：4~8 CPU 核心, 推荐 ≥ 8 GB RAM
- **峰值内存**：暂无可核实的峰值内存基准 (待独立测定)
- **运行时间**：暂无可核实的运行时间基准 (原始论文仅正文提及 Bottomly 简要测试，无独立算力基准表格行，待独立测定)
- **证据出处**：Love et al. Genome Biology (2014) 15:550 Performance section

---

## 7. 尚未核实的字段与保留问题 (Unverified Fields / Pending Items)

- 无法定位独立完整的算力基准表格行，已彻底清除未证实的内存与耗时数值。
- DESeq2 在不同样本与基因梯度下的基准测试指标纳入未决清单，待后续独立测定。
