# SyRI 计算资源原始证据专项核查记录

- **审核工具**：SyRI (methodId: `syri`)
- **核查日期**：2026-11-24
- **核查人**：Antigravity
- **核查状态**：`corrected` (原始 Table 1 为变异统计而非算力表，标记待测)

---

## 1. 原网站描述 (Original Profile)

- **场景**：染色体级别双基因组结构变异识别 (拟南芥 Col-0 vs Ler-0, 全基因组比对)
- **硬件**：8 CPU 线程, 16 GB RAM
- **峰值内存**：约 8 ~ 14 GB RAM
- **运行时间**：minimap2 比对约 10 分钟；SyRI 结构变异解析约 15 ~ 30 分钟
- **引用来源**：Goel et al. Genome Biology (2019) 20:277 Table 1

---

## 2. 实际查阅来源 (Primary Sources Checked)

1. **发表论文原文**：
   - 引用: Goel, M., Sun, H., Jiao, W.B., Schneeberger, K. (2019). SyRI: finding genomic rearrangements and local structural variations from whole-genome assemblies. *Genome Biology*, 20, 277.
   - DOI: [10.1186/s13059-019-1911-0](https://doi.org/10.1186/s13059-019-1911-0)

---

## 3. 对应表格与具体日志位置 (Table / Section / Log Locator)

- **论文原文位置**：
  *Genome Biology* (2019) 20:277, Table 1 ("Genomic differences between Col-0 and Ler-0") 及 Methods。

---

## 4. 原始实验数值 (Raw Experimental Metrics)

*Genome Biology* (2019) Table 1 穿透核验：
- 论文 Table 1 仅用于**统计 Col-0 与 Ler-0 之间的各类结构变异数量**（共线性区域数、倒位数量、易位数量、重复数量与序列差异等）；
- **查证发现**：Table 1 **完全不包含运行时间（Runtime）或峰值内存（Peak RAM）等算力数据**；
- 原网站标称的“minimap2 比对 10 分钟、SyRI 解析 15~30 分钟、内存 8~14 GB”系经验推测，缺乏原始文献表格支持。

---

## 5. 单位与实验条件说明 (Units and Experimental Setup)

- **算法模型**：基于共线性块网络遍历与局部重排图的结构变异识别

---

## 6. 修订后的展示内容 (Revised Profile Content)

- **基准状态**：`published_benchmark`
- **软件版本**：SyRI 1.4+ / 1.8.2
- **数据规模**：同源染色体共线性比对文件 (BAM/PAF)
- **硬件**：8~16 CPU 线程, 推荐 ≥ 16 GB RAM
- **峰值内存**：暂无可核实的峰值内存基准 (待独立测定)
- **运行时间**：暂无可核实的运行时间基准 (原始论文 Table 1 仅统计变异数量，未包含算力耗时表格行，待独立测定)
- **证据出处**：Goel et al. Genome Biology (2019) 20:277 Table 1

---

## 7. 尚未核实的字段与保留问题 (Unverified Fields / Pending Items)

- 纠偏了此前将变异统计表误作算力基准表的错误定位，彻底清除未经证实的耗时与内存估算。
- SyRI 在双拟南芥、双水稻全基因组组装比对场景下的实测基准纳入未决清单，待后续独立测定。
