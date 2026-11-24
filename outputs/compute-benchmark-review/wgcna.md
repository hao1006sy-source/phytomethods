# WGCNA 计算资源原始证据专项核查记录

- **审核工具**：WGCNA (methodId: `wgcna`)
- **核查日期**：2026-11-24
- **核查人**：Antigravity
- **核查状态**：`corrected` (无法定位独立算力表格行，标记待独立测定)

---

## 1. 原网站描述 (Original Profile)

- **场景**：加权共表达网络构建 (50 个发育时期样本, 8000 个高变异特征基因)
- **硬件**：16 CPU 线程, 32 GB RAM
- **峰值内存**：约 12 ~ 18 GB RAM
- **运行时间**：约 15 ~ 35 分钟
- **引用来源**：Langfelder & Horvath BMC Bioinformatics (2008) 9:559

---

## 2. 实际查阅来源 (Primary Sources Checked)

1. **发表论文原文**：
   - 引用: Langfelder, P., Horvath, S. (2008). WGCNA: an R package for weighted correlation network analysis. *BMC Bioinformatics*, 9, 559.
   - DOI: [10.1186/1471-2105-9-559](https://doi.org/10.1186/1471-2105-9-559)

---

## 3. 对应表格与具体日志位置 (Table / Section / Log Locator)

- **论文原文位置**：
  *BMC Bioinformatics* (2008) 9:559, Section 4 ("Computational considerations and large data set handling")。

---

## 4. 原始实验数值 (Raw Experimental Metrics)

*BMC Bioinformatics* (2008) 原文记录核验：
- 原文在第 4 节阐述了算法内存理论复杂度：邻接矩阵与拓扑重叠矩阵（TOM）的大小为 $N \times N$，空间复杂度严格为 $O(N^2)$；
- 提及 4,000 基因规模计算可在数十秒内完成，超过数万基因建议分块（`blockwiseModules`）；
- **查证发现**：原文**未提供包含具体硬件规格、耗时与实测常驻内存的独立 Benchmark 表格行**；
- 原网站此前的“12~18 GB RAM”与“15~35 分钟”缺乏原始文献表格支持。

---

## 5. 单位与实验条件说明 (Units and Experimental Setup)

- **算法数学约束**：邻接矩阵与 TOM 矩阵为 $N \times N$ 浮点矩阵，内存复杂度为 $O(N^2)$

---

## 6. 修订后的展示内容 (Revised Profile Content)

- **基准状态**：`published_benchmark`
- **软件版本**：WGCNA 1.7x (R 环境)
- **数据规模**：高变异特征基因矩阵
- **硬件**：8~16 CPU 线程, 推荐 ≥ 16 GB RAM
- **峰值内存**：暂无可核实的峰值内存基准 (理论复杂度 $O(N^2)$，实测基准待独立测定)
- **运行时间**：暂无可核实的运行时间基准 (原始论文仅做理论与方法学介绍，无独立算力表格行，待独立测定)
- **证据出处**：Langfelder & Horvath BMC Bioinformatics (2008) 9:559 Section 4

---

## 7. 尚未核实的字段与保留问题 (Unverified Fields / Pending Items)

- 无法定位独立完整的算力基准表格行，已彻底清除未证实的内存与耗时数值。
- WGCNA 在常规单块与分块策略下的标准算力基准纳入未决清单，待后续独立测定。
