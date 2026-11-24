# EDTA 计算资源原始证据专项核查记录

- **审核工具**：EDTA (methodId: `edta`)
- **核查日期**：2026-11-24
- **核查人**：Antigravity
- **核查状态**：`corrected` (核查 Additional file 2 Table S2，清除全管线臆测数值)

---

## 1. 原网站描述 (Original Profile)

- **场景**：全基因组转座子全面注释 (水稻 Nipponbare, ~390 Mb, 参考基因组)
- **硬件**：32 CPU 线程, 64 GB RAM
- **峰值内存**：约 16 ~ 24 GB RAM
- **运行时间**：水稻标准测试集约 8 ~ 14 小时 (32 线程)
- **引用来源**：Ou et al. Genome Biology (2019) 20:275 Table 2

---

## 2. 实际查阅来源 (Primary Sources Checked)

1. **发表论文原文**：
   - 引用: Ou, S., Su, W., Liao, Y., Chougule, K., Agda, J.R.A., Hellinga, A.J., Lugo, C.S.B., Fioretto, E., Ware, D., Hufford, M.B. (2019). Benchmarking transposable element annotation methods for creation of a streamlined, comprehensive pipeline. *Genome Biology*, 20, 275.
   - DOI: [10.1186/s13059-019-1905-y](https://doi.org/10.1186/s13059-019-1905-y)
2. **补充材料核验**：
   - 经实地穿透查验论文正文及补充材料，正文主表仅有 Table 1（水稻基因组 TE 分类含量），无 Table 2；
   - 实际计算效率记录位于 **Additional file 2: Table S2**（"Algorithmic efficiency of TE annotation programs on the rice genome"）。

---

## 3. 对应表格与具体日志位置 (Table / Section / Log Locator)

- **论文原文位置**：
  *Genome Biology* (2019) 20:275, Section "Algorithmic efficiency of TE annotation programs", Additional file 2: Table S2。

---

## 4. 原始实验数值 (Raw Experimental Metrics)

*Genome Biology* (2019) 20:275 补充表格 Table S2 实测记录：
- **测试对象**：针对水稻 MSU7 基因组分别测试了 14 个独立从头挖掘子工具（如 SINE-Finder、GRF、LTR_FINDER、LTRharvest、TIR-Learner、HelitronScanner、RepeatModeler 等）的单项开销；
- **平台差异**：各子工具分别在不同的 HPC 集群节点（平台 A/B/C/D）上独立执行，平均耗时 5.5 小时，最高内存 76 GB（GRF-LTR_FINDER）；
- **查证发现**：**Table S2 从未对 EDTA 整体整合管线在单节点 36 线程下的端到端全流程（4.2 小时 / 114.7 CPU 小时）进行过独立表格行记录**。此前所谓的 4.2 小时与 114.7 CPU 小时缺乏原始表格记录支持。

---

## 5. 单位与实验条件说明 (Units and Experimental Setup)

- **软件管线**：EDTA (Extensive de-novo TE Annotator)
- **子模块组成**：包含 LTR_retriever, TIR-Learner, HelitronScanner, RepeatModeler 及过滤清洗脚本

---

## 6. 修订后的展示内容 (Revised Profile Content)

- **基准状态**：`published_benchmark`
- **软件版本**：EDTA v1.x (整合 LTR_retriever, TIR-Learner, HelitronScanner 等)
- **数据规模**：全基因组 FASTA 序列
- **硬件**：多核计算节点 (支持多线程并行，推荐 ≥ 32 GB RAM)
- **峰值内存**：暂无可核实的峰值内存基准 (论文 Additional file 2 Table S2 仅记录了各单独子程序在不同平台的开销，全管线整体基准待独立测定)
- **运行时间**：暂无可核实的运行时间基准 (论文未单列全管线实测总耗时，待独立测定)
- **证据出处**：Ou et al. Genome Biology (2019) 20:275 Additional file 2: Table S2

---

## 7. 尚未核实的字段与保留问题 (Unverified Fields / Pending Items)

- 彻底清除原网站 8~14 小时估算及此前误引的 4.2 小时 / 114.7 CPU 小时未证实数据。
- EDTA 整合管线在水稻、玉米、小麦等不同梯度植物基因组上的端到端实测性能纳入未决清单，待后续标准化基准评测。
