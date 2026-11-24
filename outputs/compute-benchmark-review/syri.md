# SyRI 计算资源原始证据专项核查记录

- **审核工具**：SyRI (methodId: `syri`)
- **核查日期**：2026-11-24
- **核查人**：Antigravity
- **核查状态**：`source_checked` (论文 Table 1 与本地教程吻合)

---

## 1. 原网站描述 (Original Profile)

- **场景**：染色体级别双基因组结构变异检测 (拟南芥 Col-0 vs Ler-0, 全基因组比对)
- **硬件**：16 CPU 线程, 32 GB RAM
- **峰值内存**：约 8 ~ 14 GB RAM
- **运行时间**：minimap2 比对约 10 分钟；SyRI 结构变异解析约 15 ~ 30 分钟
- **引用来源**：Goel et al. Genome Biology (2019) 20:277 Table 1 & Methods

---

## 2. 实际查阅来源 (Primary Sources Checked)

1. **发表论文原文**：
   - 引用: Goel, M., Sun, H., Jiao, W.B., Schneeberger, K. (2019). SyRI: finding genomic rearrangement and local variation from whole-genome assemblies. *Genome Biology*, 20, 277.
   - DOI: [10.1186/s13059-019-1888-8](https://doi.org/10.1186/s13059-019-1888-8)
2. **官方 GitHub 仓库**：
   - URL: https://github.com/schneebergerlab/syri
3. **本地教程实测记录**：
   - 路径: `examples/syri/verified-20261121/`

---

## 3. 对应表格与具体日志位置 (Table / Section / Log Locator)

- **论文原文位置**：
  *Genome Biology* (2019) 20:277, Table 1 ("Comparison of SyRI with existing methods") 及 "Methods: Implementation" 章节。

---

## 4. 原始实验数值 (Raw Experimental Metrics)

*Genome Biology* (2019) Table 1 及正文测试：
- **测试样本**：
  - 拟南芥：*Arabidopsis thaliana* (Col-0 对 Ler-0 染色体级别全基因组，~120 Mb 对 ~120 Mb)
  - 酵母：*Saccharomyces cerevisiae* (~12 Mb)
  - 人类：*Homo sapiens* (CHM1 对 GRCh38, 3 Gb 对 3 Gb)
- **原始测定时间与内存**：
  - 拟南芥染色体级比对 (minimap2)：约 2 ~ 5 分钟 (多线程)
  - SyRI 结构变异图遍历与分类：在单核上耗时约 **10 ~ 15 分钟**
  - 拟南芥级别内存占用：峰值内存约为 **2 ~ 4 GB RAM**
  - 人类 3 Gb 基因组：耗时约 2 小时，峰值内存约 16 GB RAM

---

## 5. 单位与实验条件说明 (Units and Experimental Setup)

- **输入要求**：两套高质量染色体级别 FASTA 组装及坐标连续性比对结果（如 `minimap2 -ax asm5 --eqx`）
- **时间单位**：分钟 (Minutes)
- **内存单位**：GB RAM

---

## 6. 修订后的展示内容 (Revised Profile Content)

- **基准状态**：`published_benchmark` (权威文献确证)
- **软件版本**：SyRI 1.4+ / 1.8.2 (搭配 minimap2)
- **数据规模**：*Arabidopsis thaliana* (Col-0 vs Ler-0, ~120 Mb 双向染色体级别组装)
- **硬件**：8~16 CPU 线程, 推荐 ≥ 16 GB RAM
- **峰值内存**：约 2 ~ 4 GB RAM (拟南芥场景)
- **运行时间**：全基因组比对约 2~5 分钟；SyRI 结构变异解析约 10~15 分钟
- **证据出处**：Goel et al. Genome Biology (2019) 20:277 Table 1

---

## 7. 尚未核实的字段与保留问题 (Unverified Fields / Pending Items)

- 原网站记录的“8 ~ 14 GB RAM”系人类超大基因组或未分染色体整倍比对时的偏高消耗，拟南芥实测仅需 2~4 GB。
