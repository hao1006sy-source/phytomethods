# GAPIT 计算资源原始证据专项核查记录

- **审核工具**：GAPIT (methodId: `gapit`)
- **核查日期**：2026-11-24
- **核查人**：Antigravity
- **核查状态**：`corrected` (彻底更正 FarmCPU 原始文献引用，移除未证实数值)

---

## 1. 原网站描述 (Original Profile)

- **场景**：全基因组关联分析 (500 个作物个体, 50 万个高质量 SNP, FarmCPU 模型)
- **硬件**：8 CPU 线程, 32 GB RAM (R 运行环境)
- **峰值内存**：约 12 ~ 18 GB RAM
- **运行时间**：约 10 ~ 25 分钟
- **引用来源**：Lipka et al. & Wang et al. (2016) Nature Genetics 48:696-704 FarmCPU

---

## 2. 实际查阅来源 (Primary Sources Checked)

1. **发表论文原文**：
   - 引用: Liu, X., Huang, M., Fan, B., Buckler, E.S., Zhang, Z. (2016). Iterative Usage of Fixed and Random Effect Models for Powerful and Efficient Genome-Wide Association Studies. *PLOS Genetics*, 12(2), e1005767.
   - DOI: [10.1371/journal.pgen.1005767](https://doi.org/10.1371/journal.pgen.1005767)
2. **算法实现区别**：
   - 原始独立算法包：FarmCPU R 包 (https://github.com/XiaoleiLiuBio/FarmCPU)
   - 网站收录工具：GAPIT3 集成环境 (https://github.com/jiabowang/GAPIT3)

---

## 3. 对应表格与具体日志位置 (Table / Section / Log Locator)

- **论文原文位置**：
  *PLOS Genetics* (2016) 12(2): e1005767, Section "Computational efficiency", Figure 6 ("Computing time and memory usage of five software packages") 及 S10 Table / S11 Table / S25 Fig。
  - 删除错误的 *Nature Genetics* 48:696–704 引用及 DOI (10.1038/ng.3552)。

---

## 4. 原始实验数值 (Raw Experimental Metrics)

*PLOS Genetics* (2016) 原文测定事实：
- **测试环境**：华硕笔记本 (Asus A53S, Ubuntu 12.10 64-bit, 4.0 GB RAM, Intel duo Core i3-2310M @ 2.1 GHz, 单核测试)。
- **测试数据集**：60,000 个模拟标记，样本量从 500 递增至 10,000 (Figure 6 与 S25 Fig 曲线)。
- **查证发现**：原文正文与补充表格中**未包含**“1,307 份拟南芥个体 × 216,130 个 SNP 耗时 1.1 分钟、常驻内存 < 2 GB”的实测表格行记录。
- **实现差异**：GAPIT3 在 R 语言体系下对 FarmCPU 进行了集成重构，内存调度与原始单核 FarmCPU R 包存在差异，无法直接套用模拟曲线估算真实作物 GWAS 性能。

---

## 5. 单位与实验条件说明 (Units and Experimental Setup)

- **算法模型**：FarmCPU (Fixed and random model Circulating Probability Unification)
- **实现载体**：GAPIT3 集成函数与 FarmCPU R 包

---

## 6. 修订后的展示内容 (Revised Profile Content)

- **基准状态**：`published_benchmark`
- **软件版本**：GAPIT3 (含 FarmCPU / Blink 算法实现；原始独立算法见 FarmCPU R 包)
- **数据规模**：通常为数百至数千个体、数万至数百万 SNP 位点
- **硬件**：4~8 CPU 核心 (普通台式机/工作站)
- **峰值内存**：暂无可核实的峰值内存基准 (待独立测定)
- **运行时间**：暂无可核实的运行时间基准 (原始 FarmCPU 论文主要在模拟数据上测试，GAPIT3 实现下的实测运行时间待独立测定)
- **证据出处**：Liu et al. PLOS Genetics (2016) 12(2): e1005767 (DOI: 10.1371/journal.pgen.1005767)

---

## 7. 尚未核实的字段与保留问题 (Unverified Fields / Pending Items)

- 彻底清除错误的 Nature Genetics 引用及 1.1 分钟 / <2 GB RAM 臆测数值。
- GAPIT3 在真实植物多群体规模下的绝对运行耗时与峰值常驻内存（RSS）纳入未决清单，待后续独立基准测定。
