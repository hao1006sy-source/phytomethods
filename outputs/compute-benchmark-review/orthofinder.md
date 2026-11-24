# OrthoFinder 计算资源原始证据专项核查记录

- **审核工具**：OrthoFinder (methodId: `orthofinder`)
- **核查日期**：2026-11-24
- **核查人**：Antigravity
- **核查状态**：`corrected` (清理主观臆测与未测定数据，标记待独立测定)

---

## 1. 原网站描述 (Original Profile)

- **场景**：跨物种同源正交群推断 (10 个禾本科植物全蛋白组, 40 万条氨基酸序列)
- **硬件**：32 CPU 线程, 64 GB RAM (DIAMOND ultra-sensitive 模式)
- **峰值内存**：约 24 ~ 32 GB RAM
- **运行时间**：约 2.5 ~ 4 小时
- **引用来源**：Emms & Kelly Genome Biology (2019) 20:238

---

## 2. 实际查阅来源 (Primary Sources Checked)

1. **发表论文原文**：
   - 引用: Emms, D.M., Kelly, S. (2019). OrthoFinder: phylogenetic orthology inference for comparative genomics. *Genome Biology*, 20, 238.
   - DOI: [10.1186/s13059-019-1832-y](https://doi.org/10.1186/s13059-019-1832-y)

---

## 3. 对应表格与具体日志位置 (Table / Section / Log Locator)

- **论文原文位置**：
  *Genome Biology* (2019) 20:238, "Scalability" 章节, Figure 5 (运行时间随物种数量的增长曲线) 以及 Table 1。

---

## 4. 原始实验数值 (Raw Experimental Metrics)

*Genome Biology* (2019) 20:238 原文核验：
- 论文在 Figure 5 中展示了运行时间随物种数量（4 至 128 物种）以接近 $O(S^2)$ 规模二次增长的曲线，并对比了 BLAST 与 DIAMOND 模式的相对速度；
- **查证发现**：论文正文与补充材料中**不存在针对“10 个禾本科植物 40 万条序列在 32 核下耗时 2.5~4 小时、峰值内存 24~32 GB”的独立测定表格行**，亦不存在“减少 40%~60% 计算量”的定性表述；
- 真实峰值物理内存由 DIAMOND 进程与树调和算法的蛋白序列量共同决定，论文未对特定植物提供标准化常驻内存测定。

---

## 5. 单位与实验条件说明 (Units and Experimental Setup)

- **算法复杂度**：全对全双向比对计算量随物种数 $S$ 呈 $O(S^2)$ 增长

---

## 6. 修订后的展示内容 (Revised Profile Content)

- **基准状态**：`published_benchmark`
- **软件版本**：OrthoFinder v2.5+ (搭配 DIAMOND v2.x)
- **数据规模**：多物种代表性单一最长蛋白本
- **硬件**：16~32 CPU 线程, 推荐 ≥ 64 GB RAM
- **峰值内存**：暂无可核实的峰值内存基准 (推荐配置 ≥ 32 GB RAM, 视输入蛋白数而定)
- **运行时间**：暂无可核实的运行时间基准 (原始论文 Fig 5 仅展示相对耗时曲线，无特定植物全蛋白组绝对时长表格行，待独立测定)
- **证据出处**：Emms & Kelly Genome Biology (2019) Figure 5

---

## 7. 尚未核实的字段与保留问题 (Unverified Fields / Pending Items)

- 清理了此前虚构的“40%~60% 计算量减少”及未经测定的禾本科精确耗时内存。
- 10 个代表性植物物种全蛋白组标准环境下的实测基准纳入未决清单，待后续独立测定。
