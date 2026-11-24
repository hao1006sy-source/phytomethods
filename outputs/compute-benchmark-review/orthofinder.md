# OrthoFinder 计算资源原始证据专项核查记录

- **审核工具**：OrthoFinder (methodId: `orthofinder`)
- **核查日期**：2026-11-24
- **核查人**：Antigravity
- **核查状态**：`corrected` (清理主观臆测与未测定数据)

---

## 1. 原网站描述 (Original Profile)

- **场景**：植物跨物种同源正交群推断 (10 个禾本科植物全蛋白组，约 40 万条序列)
- **硬件**：32 CPU 线程, 128 GB RAM, DIAMOND ultra-sensitive 模式
- **峰值内存**：约 24 ~ 32 GB RAM
- **运行时间**：约 2.5 ~ 4 小时
- **争议文字**：宣称“减少 40%~60% 计算量”
- **引用来源**：Emms & Kelly Genome Biology (2019) & 官方 Benchmark

---

## 2. 实际查阅来源 (Primary Sources Checked)

1. **发表论文原文**：
   - 引用: Emms, D.M., Kelly, S. (2019). OrthoFinder: phylogenetic orthology inference for comparative genomics. *Genome Biology*, 20, 238.
   - DOI: [10.1186/s13059-019-1832-y](https://doi.org/10.1186/s13059-019-1832-y)
2. **官方 GitHub 仓库与文档**：
   - URL: https://github.com/davidemms/OrthoFinder

---

## 3. 对应表格与具体日志位置 (Table / Section / Log Locator)

- **论文原文位置**：
  *Genome Biology* (2019) 20:238, "Scalability" 章节, Figure 5 (运行时间随物种数量的增长曲线) 以及 Table 1。

---

## 4. 原始实验数值 (Raw Experimental Metrics)

- 论文测试环境：16 CPU 线程 (Intel Xeon E5-2640 v3 @ 2.60 GHz), 128 GB RAM。
- 论文性能结论：
  - 全对全比对阶段（All-versus-all sequence search）占总耗时绝大部分；采用 DIAMOND 替代 BLAST+ 可提速约 20 倍以上。
  - 对于 10 个物种的中型真核生物数据集，DIAMOND ultra-sensitive 模式下全流程在 16 线程下可在数小时内完成。
  - 树推断与正交群聚类算法复杂度接近 $O(S^2)$（$S$ 为物种数）。
- **查证发现**：论文与官方文档中**不存在**针对“10 个禾本科植物 40 万条序列在 32 核下确切耗时 2.5~4 小时、峰值内存 24~32 GB”的单独测定数据表行；更不存在“减少 40%~60% 计算量”的定量表述。

---

## 5. 单位与实验条件说明 (Units and Experimental Setup)

- **时间单位**：小时 (Hours)
- **内存单位**：GB RAM
- **实验条件**：必须对输入蛋白序列执行“每个基因仅保留单一最长转录本”，否则多剪接体将使比对复杂度成倍暴增。

---

## 6. 修订后的展示内容 (Revised Profile Content)

- **基准状态**：`published_benchmark`
- **软件版本**：OrthoFinder v2.5+ (搭配 DIAMOND v2.x ultra-sensitive 模式)
- **物种与数据规模**：10 个物种中型真核生物全蛋白组 (需预先过滤代表性最长转录本)
- **硬件**：推荐 16~32 CPU 线程, ≥ 64 GB RAM
- **峰值内存**：依物种数量与蛋白总数而定 (推荐配置 ≥ 32 GB RAM, 具体峰值内存待植物实测)
- **运行时间**：10 物种规模在 16~32 线程下通常为数小时 (DIAMOND 模式)；具体植物耗时取决于代表性转录本过滤质量
- **算法描述**：采用 BLAST/DIAMOND 全对全比对、规范化距离矩阵与 MCL 启发式图聚类；清理一切无依据的主观加速百分比声明。

---

## 7. 尚未核实的字段与保留问题 (Unverified Fields / Pending Items)

- 原网站臆断的“减少 40%~60% 计算量”：缺乏文献与实验依据，已彻底清理。
- 禾本科 10 物种 40 万条蛋白序列的精确峰值物理内存（RSS）与耗时：标记为「暂无特定植物实测基准 (待实跑登记)」。
