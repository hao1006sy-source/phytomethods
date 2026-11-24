# Hifiasm 计算资源原始证据专项核查记录

- **审核工具**：Hifiasm (methodId: `hifiasm`)
- **核查日期**：2026-11-24
- **核查人**：Antigravity
- **核查状态**：`source_checked` (官方原始基准确证并纠正)

---

## 1. 原网站描述 (Original Profile)

- **场景**：植物高杂合全基因组组装 (玉米 B73 等中大型植物参考组装，~2.3 Gb，30x PacBio HiFi reads)
- **硬件**：64 CPU 线程, AMD EPYC 7742, 512 GB RAM, NVMe SSD
- **峰值内存**：约 160 ~ 200 GB RAM (依杂合度与 k-mer 频度浮动)
- **运行时间**：约 14 ~ 18 小时
- **引用来源**：Cheng et al. Nature Methods (2021) & Hifiasm 官方文档指南

---

## 2. 实际查阅来源 (Primary Sources Checked)

1. **官方 GitHub 仓库 README**：
   - URL: https://github.com/chhylp123/hifiasm
   - Commit/Release: v0.12 及最新说明
2. **发表论文原文**：
   - 引用: Cheng, H., Concepcion, G.T., Feng, X., Zhang, H., Li, H. (2021). Haplotype-resolved de novo assembly using phased assembly graphs with hifiasm. *Nature Methods*, 18(2), 170–175.
   - DOI: [10.1038/s41592-020-01056-5](https://doi.org/10.1038/s41592-020-01056-5)

---

## 3. 对应表格与具体日志位置 (Table / Section / Log Locator)

- **官方 README 对应表格**：
  GitHub README 中的 `Benchmarking` 表格，第 3 行关于 `Zea mays (B73)` 的测定记录。
- **论文原文对应位置**：
  *Nature Methods* (2021) 18:170–175, Table 1 及 Supplementary Table 1。

---

## 4. 原始实验数值 (Raw Experimental Metrics)

官方 README 记录的具体测定数值如下：
- **物种 (Sample)**：*Zea mays* (近交系 B73)
- **基因组大小 (Size)**：2.2 Gb
- **测序类型与覆盖度 (Coverage)**：22× PacBio HiFi reads
- **运行参数**：`-t48 -l0`
- **CPU Time (小时)**：203.2 h
- **Wall-clock Time (小时)**：5.1 h
- **峰值内存 (Peak RAM)**：68 GB
- **组装质量指标**：Contig N50 达到 36.7 Mb

---

## 5. 单位与实验条件说明 (Units and Experimental Setup)

- **硬件规格**：48 CPU 线程 (Intel/AMD x86_64 服务器，挂载高速本地磁盘)
- **时间单位**：CPU 时间 (单核累加) 为 203.2 小时；实际物理流逝时间 (Wall-clock) 为 5.1 小时
- **内存单位**：最大常驻物理内存 (Peak RSS) 为 68 GB

---

## 6. 修订后的展示内容 (Revised Profile Content)

- **基准状态**：`published_benchmark` (官方实测 Benchmark)
- **软件版本**：Hifiasm v0.12 (参数: `-t48 -l0`)
- **物种与数据规模**：*Zea mays* (B73 近交系), 2.2 Gb 基因组, 22× PacBio HiFi reads
- **硬件**：48 CPU 线程, 推荐 ≥ 128 GB 物理内存
- **峰值内存**：68 GB RAM (官方实测)
- **运行时间**：实测 5.1 小时 (Wall-clock, 48 线程) / 203.2 小时 (CPU 时间)
- **证据出处**：Hifiasm 官方基准表 (https://github.com/chhylp123/hifiasm) & Cheng et al. Nature Methods (2021)

---

## 7. 尚未核实的字段与保留问题 (Unverified Fields / Pending Items)

- **原网站 160–200 GB RAM 及 14–18 小时**：经查证并非官方 B73 22× 测试的真实数据，疑似将超深测序（50×+）或超高杂合多倍体作物的宽泛预估强加给标准参考组装。本轮已彻底从前端展示中清除，替换为官方 68 GB / 5.1 小时的确证基准。
- **高杂合四倍体植物实测**：待在甘蔗或马铃薯等同源多倍体植物测序数据上完成专门实测后补充。
