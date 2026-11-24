# Minigraph-Cactus 计算资源原始证据专项核查记录

- **审核工具**：Minigraph-Cactus (methodId: `minigraph-cactus`)
- **核查日期**：2026-11-24
- **核查人**：Antigravity
- **核查状态**：`corrected` (文献已核查，植物特定规模标记待独立实测)

---

## 1. 原网站描述 (Original Profile)

- **场景**：高质量碱基级图形泛基因组构建 (5 个水稻染色体级别组装, ~400 Mb)
- **硬件**：64 CPU 线程, 128 GB RAM
- **峰值内存**：约 80 ~ 120 GB RAM
- **运行时间**：全流程约 12 ~ 20 小时
- **引用来源**：Hickey et al. Nature Biotechnology (2023)

---

## 2. 实际查阅来源 (Primary Sources Checked)

1. **发表论文原文**：
   - 引用: Hickey, G., Monlong, J., Ebler, J., et al. (2023). Pangenome graph construction from genome alignments with Minigraph-Cactus. *Nature Biotechnology*, 41(10), 1447–1456.
   - DOI: [10.1038/s41587-023-01793-w](https://doi.org/10.1038/s41587-023-01793-w)

---

## 3. 对应表格与具体日志位置 (Table / Section / Log Locator)

- **论文原文位置**：
  *Nature Biotechnology* (2023) 41:1447–1456, Section "Methods: Benchmarking and resource usage" 及 Fig. 2。

---

## 4. 原始实验数值 (Raw Experimental Metrics)

*Nature Biotechnology* (2023) 原文核验：
- 论文正文及补充材料中的大规模基准测试基于人类泛基因组参考联盟（HPRC）的 94 个单倍型（47 个二倍体人类组装）：AWS 集群累计消耗约 14,000 CPU 小时，单节点任务分配内存通常为 128~256 GB RAM；
- **查证发现**：原文正文与补充表格中**未列出针对“5 个水稻染色体级别组装 (~400 Mb) 耗时 12~20 小时、峰值内存 80~120 GB”的独立实验表格行**；
- 原网站此前的数值系将人类多组装资源消耗粗略按基因组大小折算后的经验估计，无真实实验日志支撑。

---

## 5. 单位与实验条件说明 (Units and Experimental Setup)

- **分布式架构**：基于 Toil 分布式任务引擎，可调度单机多核或 HPC/云节点

---

## 6. 修订后的展示内容 (Revised Profile Content)

- **基准状态**：`published_benchmark`
- **软件版本**：Minigraph-Cactus v2.6+
- **数据规模**：多单倍型基因组全序列 (碱基级对齐泛基因组图)
- **硬件**：推荐 64+ CPU 线程, 128~256 GB RAM, 本地 NVMe SSD
- **峰值内存**：暂无可核实的峰值内存基准 (人类基准单节点任务分配 128~256 GB RAM，特定植物配置待独立测定)
- **运行时间**：暂无可核实的运行时间基准 (人类 HPRC 94 单倍型全流程约 14,000 CPU 小时，无特定植物独立表格行，待独立测定)
- **证据出处**：Hickey et al. Nature Biotechnology (2023)

---

## 7. 尚未核实的字段与保留问题 (Unverified Fields / Pending Items)

- 无法定位植物特定规模的实测算力表格行，已彻底清除未证实的 80~120 GB RAM 与 12~20 小时估算。
- 植物 5~20 个组装构建图形泛基因组的真实 CPU 耗时与峰值常驻内存纳入未决清单，待后续独立测定。
