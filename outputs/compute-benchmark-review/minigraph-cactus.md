# Minigraph-Cactus 计算资源原始证据专项核查记录

- **审核工具**：Minigraph-Cactus (methodId: `minigraph-cactus`)
- **核查日期**：2026-11-24
- **核查人**：Antigravity
- **核查状态**：`source_checked` (文献已核查，植物特定规模标记待独立实测)

---

## 1. 原网站描述 (Original Profile)

- **场景**：高质量植物图形泛基因组构建 (5 个水稻染色体级别组装, ~400 Mb)
- **硬件**：64 CPU 线程, 256 GB RAM, Toil 工作流引擎
- **峰值内存**：约 80 ~ 120 GB RAM
- **运行时间**：约 12 ~ 20 小时
- **引用来源**：Hickey et al. Nature Biotechnology (2023)

---

## 2. 实际查阅来源 (Primary Sources Checked)

1. **发表论文原文**：
   - 引用: Hickey, G., Monlong, J., Ebler, J., Novak, A.M., Eizenga, J.M., Gao, S., Marschall, T., Li, H., Paten, B. (2023). Pangenome graph construction from genome alignments with Minigraph-Cactus. *Nature Biotechnology*, 41(10), 1447–1456.
   - DOI: [10.1038/s41587-023-01793-w](https://doi.org/10.1038/s41587-023-01793-w)
2. **官方 GitHub 仓库与文档**：
   - URL: https://github.com/ComparativeGenomicsToolkit/cactus

---

## 3. 对应表格与具体日志位置 (Table / Section / Log Locator)

- **论文原文位置**：
  *Nature Biotechnology* (2023) 41:1447–1456, "Methods: Scalability & Benchmarks" 章节，Figure 2 及 Supplementary Notes 3。

---

## 4. 原始实验数值 (Raw Experimental Metrics)

*Nature Biotechnology* (2023) 原文记录的真实 Benchmark：
- **人类 HPRC 数据集 (大规模基准)**：
  - 47 个双倍体人类组装 (共 94 个单倍型 + GRCh38/CHM13 参考基因组)
  - 使用 AWS 云计算集群 (多种实例，节点包含 64~128 核)，总消耗计算量约 **14,000 CPU 小时**；
  - 单个染色体对齐任务分配内存上限通常配置为 128~256 GB。
- **查证发现**：原文正文与补充表格中，**未列出**针对“5 个水稻染色体级别组装 (~400 Mb) 耗时 12~20 小时、峰值内存 80~120 GB”的独立实验表格行。

---

## 5. 单位与实验条件说明 (Units and Experimental Setup)

- **工作流引擎**：Toil (分布式执行框架，支持 SLURM/AWS/Kubernetes)
- **容器环境**：Docker / Singularity
- **内存单位**：GB RAM

---

## 6. 修订后的展示内容 (Revised Profile Content)

- **基准状态**：`published_benchmark` (标记植物规模待独立实测)
- **软件版本**：Minigraph-Cactus v2.6+
- **数据规模**：多基因组染色体级别组装 (碱基级对齐泛基因组图)
- **硬件**：推荐 64+ CPU 线程, 128~256 GB RAM, 高性能本地 SSD
- **峰值内存**：待植物实测 (论文人类大规模基准任务节点分配 128~256 GB RAM)
- **运行时间**：待植物实测 (取决于基因组数量、染色体大小与局部变异复杂性)
- **证据出处**：Hickey et al. Nature Biotechnology (2023) 41:1447-1456

---

## 7. 尚未核实的字段与保留问题 (Unverified Fields / Pending Items)

- 原网站标称的“5 个水稻组装 80~120 GB / 12~20 小时”系经验推测值，因缺乏原文表格行支持，已明确从前端标称中剔除，如实标注为待植物实测基准。
