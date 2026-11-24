# Scanpy 计算资源原始证据专项核查记录

- **审核工具**：Scanpy (methodId: `scanpy`)
- **核查日期**：2026-11-24
- **核查人**：Antigravity
- **核查状态**：`corrected` (依据 Figure 1 与官方 v1.0.0 发布记录修正)

---

## 1. 原网站描述 (Original Profile)

- **场景**：植物单细胞转录组 (scRNA-seq) 降维聚类 (水稻根尖 20000 个原生质体细胞)
- **硬件**：16 CPU 线程, 32 GB RAM, Python 3.11 环境
- **峰值内存**：约 6 ~ 10 GB RAM
- **运行时间**：质控、PCA、UMAP 及 Leiden 聚类全流程约 5 ~ 12 分钟
- **引用来源**：Wolf et al. Genome Biology (2018) 19:15 Performance & scalability

---

## 2. 实际查阅来源 (Primary Sources Checked)

1. **发表论文原文**：
   - 引用: Wolf, F.A., Angerer, P., Theis, F.J. (2018). SCANPY: large-scale single-cell gene expression data analysis. *Genome Biology*, 19, 15.
   - DOI: [10.1186/s13059-017-1382-0](https://doi.org/10.1186/s13059-017-1382-0)
2. **官方发布与版本记录**：
   - Scanpy v1.0.0 Release Notes: https://scanpy.scverse.org/en/stable/release-notes/index.html

---

## 3. 对应表格与具体日志位置 (Table / Section / Log Locator)

- **论文原文位置**：
  *Genome Biology* (2018) 19:15, Figure 1 ("Runtime comparison for single-cell analysis pipelines") 及 Section "Computational scalability"。
- **官方版本发布记录**：
  Scanpy v1.0.0 发布公告基准记录（2018-02-09）。

---

## 4. 原始实验数值 (Raw Experimental Metrics)

官方发布与原文测定事实：
- **基准测试版本**：Scanpy v1.0.0
- **分析任务范围**：涵盖单细胞预处理（质控与标准化）、高变基因筛选（HVGs）、PCA 降维、邻近图构建、Louvain 聚类及可视化流形映射全流程。
- **官方测定耗时**：
  - **68,000 个细胞**（PBMC 68k 数据集）：约 **3 分钟**；
  - **130,000 个细胞**：约 **14 分钟**；
  - **1,300,000 个细胞**（1.3M 脑细胞极限数据集）：约 **6 小时**。
- **查证发现**：
  - 此前关于“130 万细胞 1.5 小时”的描述不准确，官方记录实际为约 6 小时；
  - 官方发布记录仅测试并记录了纯流逝时间，未提供各数据规模下的常驻物理峰值内存（Peak RSS）；
  - 论文与发布记录均未对“水稻根尖 20,000 细胞”进行过测定，虚构场景彻底清除。

---

## 5. 单位与实验条件说明 (Units and Experimental Setup)

- **底层数据结构**：基于 AnnData 与 `scipy.sparse.csr_matrix` 稀疏矩阵
- **时间单位**：分钟 (Minutes) 与 小时 (Hours)

---

## 6. 修订后的展示内容 (Revised Profile Content)

- **基准状态**：`published_benchmark` (官方 v1.0.0 发布公告基准)
- **软件版本**：Scanpy v1.0.0 (官方发布基准)
- **数据规模**：梯度规模: 68,000 个细胞 / 130,000 个细胞 / 1,300,000 个细胞
- **硬件**：8~16 CPU 线程
- **峰值内存**：暂无可核实的峰值内存基准 (官方发布记录未列物理常驻内存，待独立测定)
- **运行时间**：官方 v1.0.0 记录: 6.8 万细胞约 3 分钟；13 万细胞约 14 分钟；130 万细胞约 6 小时 (全流程预处理、聚类与可视化)
- **证据出处**：Wolf et al. Genome Biology (2018) 19:15 Figure 1 & Scanpy v1.0.0 Release Notes (https://scanpy.scverse.org/en/stable/release-notes/index.html)

---

## 7. 尚未核实的字段与保留问题 (Unverified Fields / Pending Items)

- 移除此前缺少实测依据的内存估算数字与百万细胞 1.5 小时错误描述。
- Scanpy 在不同细胞规模下的峰值物理常驻内存（RSS）与植物原生质体实测数据纳入未决清单。
