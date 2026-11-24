# PLINK 计算资源原始证据专项核查记录

- **审核工具**：PLINK (methodId: `plink`)
- **核查日期**：2026-11-24
- **核查人**：Antigravity
- **核查状态**：`corrected` (原始文献仅测试分项步骤，全流程基准标记待测)

---

## 1. 原网站描述 (Original Profile)

- **场景**：全基因组群体质控与 LD 剪枝 (1000 份水稻个体, 500 万高质量变异位点)
- **硬件**：8 CPU 线程, 16 GB RAM
- **峰值内存**：约 4 ~ 8 GB RAM
- **运行时间**：质控 < 2 分钟；LD 剪枝约 12 ~ 25 分钟
- **引用来源**：Chang et al. GigaScience (2015) 4:7 Table 2

---

## 2. 实际查阅来源 (Primary Sources Checked)

1. **发表论文原文**：
   - 引用: Chang, C.C., Chow, C.C., Tellier, L.C., Vattikuti, S., Purcell, S.M., Lee, J.J. (2015). Second-generation PLINK: rising to the challenge of larger datasets. *GigaScience*, 4, 7.
   - DOI: [10.1186/s13742-015-0047-8](https://doi.org/10.1186/s13742-015-0047-8)

---

## 3. 对应表格与具体日志位置 (Table / Section / Log Locator)

- **论文原文位置**：
  *GigaScience* (2015) 4:7, Table 2 ("Runtimes for basic operations on 1,000 Genomes Phase 1 dataset")。

---

## 4. 原始实验数值 (Raw Experimental Metrics)

*GigaScience* (2015) Table 2 实测记录：
- 论文 Table 2 仅测试了人类千人基因组数据集（1,092 样本 × 39,728,178 SNP）的部分独立基础操作（质控过滤、LD 剪枝 267 秒、PCA 分析等）；
- **查证发现**：Table 2 仅有运行时间列，**未包含常驻物理峰值内存（Peak RSS）列**；
- 论文未测试植物特定全基因组全流程，原网站标称的“4~8 GB RAM”与“水稻 1000 份”缺乏原始表格行支持。

---

## 5. 单位与实验条件说明 (Units and Experimental Setup)

- **数据编码**：2-bit 二进制压缩格式 (`.bed`)
- **空间复杂度**：理论占用严格为 $O(M \cdot N / 4)$ 字节

---

## 6. 修订后的展示内容 (Revised Profile Content)

- **基准状态**：`published_benchmark`
- **软件版本**：PLINK 1.90b / PLINK 2.0
- **数据规模**：高密度双等位基因 SNP 标记
- **硬件**：4 核心 8 线程 (普通台式机或集群节点), 推荐 ≥ 8 GB RAM
- **峰值内存**：暂无可核实的峰值内存基准 (待独立测定)
- **运行时间**：暂无可核实的运行时间基准 (原始论文表 2 仅测试部分人类步骤，全量软硬件基准待独立测定)
- **证据出处**：Chang et al. GigaScience (2015) 4:7 Table 2

---

## 7. 尚未核实的字段与保留问题 (Unverified Fields / Pending Items)

- 无法定位完整软硬件与植物全流程实测基准表格行，已彻底清除未证实的内存与耗时数值。
- PLINK 在植物群体基因组学标准全流程中的绝对基准性能纳入未决清单，待后续独立测定。
