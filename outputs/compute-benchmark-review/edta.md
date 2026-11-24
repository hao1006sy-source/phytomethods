# EDTA 计算资源原始证据专项核查记录

- **审核工具**：EDTA (methodId: `edta`)
- **核查日期**：2026-11-24
- **核查人**：Antigravity
- **核查状态**：`source_checked` (论文 Table 2 原始数值核实并纠偏)

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
2. **官方 GitHub 仓库说明**：
   - URL: https://github.com/oushujun/EDTA

---

## 3. 对应表格与具体日志位置 (Table / Section / Log Locator)

- **论文原文位置**：
  *Genome Biology* (2019) 20:275, Table 2 ("Speed and memory usage of transposable element annotation methods on the rice genome") 及 Supplementary Information。

---

## 4. 原始实验数值 (Raw Experimental Metrics)

*Genome Biology* (2019) 20:275 表 2 中对水稻 Nipponbare 基因组 (~390 Mb) 的明确测定数据：
- **测试样本**：*Oryza sativa* (Nipponbare, ~390 Mb 组装)
- **测试硬件**：单节点 Linux 服务器，配置 36 CPU 核心 (Intel Xeon Gold 6140 @ 2.3 GHz)
- **CPU Time (小时)**：114.7 CPU hours
- **Wall-clock Time (小时)**：4.2 hours (使用 36 线程并发)
- **峰值内存 (Peak RAM)**：论文 Table 2 未单独单列峰值物理内存（指出主要由 RepeatModeler 与 LTR_retriever 并发消耗，推荐配置 ≥ 16–32 GB RAM）。

---

## 5. 单位与实验条件说明 (Units and Experimental Setup)

- **时间单位**：CPU 时间 (114.7 小时)；物理流逝时间 (4.2 小时 @ 36 线程)
- **软件参数**：EDTA 默认参数（包含从头挖掘、结构完整 LTR 过滤、TIR 识别与假阳性清洗）

---

## 6. 修订后的展示内容 (Revised Profile Content)

- **基准状态**：`published_benchmark`
- **软件版本**：EDTA v1.x (Ou et al. 2019 Table 2 原生基准)
- **物种与数据规模**：*Oryza sativa* (Nipponbare 参考基因组, ~390 Mb)
- **硬件**：36 CPU 线程 (Intel Xeon Gold 6140), 推荐 ≥ 32 GB RAM
- **峰值内存**：论文未单列实测峰值 (推荐配置 ≥ 32 GB RAM, 避免单线程模块 OOM)
- **运行时间**：实测 4.2 小时 (Wall-clock, 36 线程) / 114.7 小时 (CPU 时间)
- **证据出处**：Ou et al. Genome Biology (2019) 20:275 Table 2

---

## 7. 尚未核实的字段与保留问题 (Unverified Fields / Pending Items)

- 原网站标称的“8~14 小时”与“16~24 GB RAM”属于早期宽泛估算，已更正为论文表 2 实测的 4.2 小时 (36 线程)。
- 玉米 (~2.3 Gb) 或小麦 (~15 Gb) 超大高重复植物基因组的实测基准待进一步补充。
