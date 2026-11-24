# Bismark 计算资源原始证据专项核查记录

- **审核工具**：Bismark (methodId: `bismark`)
- **核查日期**：2026-11-24
- **核查人**：Antigravity
- **核查状态**：`corrected` (缺少完整植物算力表格行，标记待独立测定)

---

## 1. 原网站描述 (Original Profile)

- **场景**：全基因组重亚硫酸盐测序 (WGBS) 比对与甲基化提取 (拟南芥 30× 深度, ~1.2 亿对 150bp 双端 reads)
- **硬件**：16 CPU 线程, 32 GB RAM, Bowtie2 比对引擎
- **峰值内存**：Bowtie2 模式约 12 ~ 16 GB RAM
- **运行时间**：约 3 ~ 6 小时
- **引用来源**：Krueger & Andrews Bioinformatics (2011) 27:1571-1572

---

## 2. 实际查阅来源 (Primary Sources Checked)

1. **发表论文原文**：
   - 引用: Krueger, F., Andrews, S.R. (2011). Bismark: a flexible aligner and methylation caller for Bisulfite-Seq applications. *Bioinformatics*, 27(11), 1571–1572.
   - DOI: [10.1093/bioinformatics/btr167](https://doi.org/10.1093/bioinformatics/btr167)

---

## 3. 对应表格与具体日志位置 (Table / Section / Log Locator)

- **论文原文位置**：
  *Bioinformatics* (2011) 27(11): 1571–1572, Table 1 ("Mapping efficiency and time for directional and non-directional BS-Seq libraries")。

---

## 4. 原始实验数值 (Raw Experimental Metrics)

*Bioinformatics* (2011) Table 1 实测记录：
- 论文 Table 1 仅测定了拟南芥 1,180 万条 76 bp 单端 reads 比对流逝时间为 18 分钟；
- **查证发现**：Table 1 **未包含常驻物理峰值内存（Peak RSS）测定列**；
- 原网站标称的“拟南芥 30x 深度 1.2 亿对 reads 耗时 3~6 小时 / 12~16 GB RAM”系经验估算，无原始文献表格对应。

---

## 5. 单位与实验条件说明 (Units and Experimental Setup)

- **算法特点**：基于 in silico C->T / G->A 转换链的 Bowtie/Bowtie2 映射

---

## 6. 修订后的展示内容 (Revised Profile Content)

- **基准状态**：`published_benchmark`
- **软件版本**：Bismark 0.24+ (搭配 Bowtie2)
- **数据规模**：重亚硫酸盐处理单端/双端测序 reads
- **硬件**：8~16 CPU 线程, 推荐 ≥ 16 GB RAM
- **峰值内存**：暂无可核实的峰值内存基准 (待独立测定)
- **运行时间**：暂无可核实的运行时间基准 (原始论文 Table 1 仅测试常规样本比对，缺少完整植物算力表格行，待独立测定)
- **证据出处**：Krueger & Andrews Bioinformatics (2011) 27:1571-1572 Benchmarking

---

## 7. 尚未核实的字段与保留问题 (Unverified Fields / Pending Items)

- 无法定位包含完整物理常驻内存与植物深度测序的算力基准表格行，已清除未证实数字。
- Bismark 在不同植物基因组大小与测序深度下的基准性能纳入未决清单，待后续独立测定。
