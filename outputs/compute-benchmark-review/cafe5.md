# CAFE 5 计算资源原始证据专项核查记录

- **审核工具**：CAFE 5 (methodId: `cafe5`)
- **核查日期**：2026-11-24
- **核查人**：Antigravity
- **核查状态**：`corrected` (本地实测日志确证与数据闭环)

---

## 1. 原网站描述 (Original Profile)

- **场景**：基因家族收缩与扩张演化分析 (官方 12 物种基准，12,653 原始家族，Base 单 λ 与 2 类别 Gamma 离散模型)
- **硬件**：WSL Ubuntu 24.04, 4 CPU 线程, 16 GB 宿主物理内存
- **峰值内存**：暂无峰值内存实测记录 (推荐配置 ≥ 4 GB RAM)
- **运行时间**：Base 模型实测 187.99 秒 (3分08秒)；Gamma 模型实测 828.50 秒 (13分48秒)
- **引用来源**：本地实测执行日志 (execution.json / validation-results.json) & Mendes et al. Bioinformatics (2020)

---

## 2. 实际查阅来源 (Primary Sources Checked)

1. **本地实测执行日志**：
   - 文件路径: `examples/cafe5/verified-20261123/execution.json`
   - 验证结果摘要: `examples/cafe5/verified-20261123/validation-results.json`
   - 标准输出记录: `examples/cafe5/verified-20261123/run.log`
2. **发表论文原文**：
   - 引用: Mendes, F.K., Vanderpool, D., Fulton, B., Hahn, M.W. (2020). CAFE 5 models variation in evolutionary rates among gene families. *Bioinformatics*, 36(22–23), 5516–5518.
   - DOI: [10.1093/bioinformatics/btaa1022](https://doi.org/10.1093/bioinformatics/btaa1022)

---

## 3. 对应表格与具体日志位置 (Table / Section / Log Locator)

- **本地日志对应字段**：
  `validation-results.json` 中 `models[0]` (Base) 与 `models[1]` (Gamma)：
  - `inputFamilies`: 12653
  - `retainedFamilies`: 10956
  - `runtimeSeconds`: 187.99 (Base), 828.50 (Gamma)
- **论文原文位置**：
  *Bioinformatics* (2020) 36:5516–5518, "Implementation and performance" 章节。

---

## 4. 原始实验数值 (Raw Experimental Metrics)

- **输入数据规模**：12 种哺乳动物系统发育超度量树 + 12,653 个基因家族计数表
- **模型有效分析家族数**：过滤后保留 10,956 个基因家族进行似然估计
- **Base 模型耗时 (4 线程)**：187.99 秒 (3分07.99秒)，得分 $-\ln L = 37372.93$
- **Gamma 模型耗时 (4 线程, 2 速率类别)**：828.50 秒 (13分48.50秒)，得分 $-\ln L = 34509.84$
- **峰值内存**：原始日志中未记录精确的常驻峰值内存（RSS）

---

## 5. 单位与实验条件说明 (Units and Experimental Setup)

- **执行硬件**：WSL Ubuntu 24.04 (Linux 5.15.153.1 内核), 4 核心并发, 宿主内存 16 GB DDR4
- **编译版本**：CAFE5 1.1 (v5.1, commit 8d3ab08), OpenMP 启用
- **命令参数**：
  - Base: `cafe5 -t mammals_tree.txt -i mammal_gene_families.txt -p -c 4 -o results-base`
  - Gamma: `cafe5 -t mammals_tree.txt -i mammal_gene_families.txt -p -k 2 -c 4 -o results-gamma`

---

## 6. 修订后的展示内容 (Revised Profile Content)

- **基准状态**：`empirical_log` (本地严格实测日志)
- **软件版本**：CAFE5 1.1 (v5.1, commit 8d3ab08)
- **数据规模**：12 物种 × 12,653 输入家族 (有效分析保留 10,956 家族)
- **硬件**：4 CPU 线程, 推荐 ≥ 4 GB RAM
- **峰值内存**：暂无峰值内存实测记录 (推荐配置 ≥ 4 GB RAM，避免复杂大树 OOM)
- **运行时间**：实测 Base 模型 187.99 秒 (3分08秒)；Gamma 模型 828.50 秒 (13分48秒)
- **证据出处**：`examples/cafe5/verified-20261123/execution.json`

---

## 7. 尚未核实的字段与保留问题 (Unverified Fields / Pending Items)

- 原网站 13,879 家族数据冲突：已更正为真实输入的 12,653 家族（模型保留 10,956 家族），动态联动断言。
- 峰值物理内存（RSS）：实测脚本未调用 `/usr/bin/time -v` 捕获最大物理驻留内存，实事求是标明暂无实测记录，不编造指标。
