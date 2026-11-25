---
title: Hifiasm 组装入门
summary: 使用 HiFi reads 运行 Hifiasm 的命令模板与官方测试流程。
method: hifiasm
tested: template
status: published
updatedAt: 2026-11-25
---

## 目的与验证状态

本教程提供在 Linux 环境下利用 PacBio HiFi 高保真长读段运行 Hifiasm 进行基因组从头组装的标准命令模板与官方示例检验指南。

**验证状态声明**：本教程标记为 **`tested: template`（命令已核对 · 真实数据待验证）**。示例命令严格基于官方文档核实，但本站尚未在本机执行过植物全基因组规模的完整组装；植物全基因组组装请务必根据样本基因组大小（1 Gb~15 Gb）与染色体杂合度准备足够的计算内存与磁盘空间。

---

## 环境与安装步骤

### 1. 编译安装
Hifiasm 无需复杂的外部依赖，仅需 C++ 编译器（GCC 或 Clang）与 `zlib` 开发库：
```bash
git clone https://github.com/chhylp123/hifiasm.git
cd hifiasm
make -j 4
./hifiasm --version
```

### 2. 官方小型测试数据准备
官方仓库提供用于安装验证的小型测试数据集：
- **数据来源**：[Hifiasm Release v0.7 附件 chr11-2M.fa.gz](https://github.com/chhylp123/hifiasm/releases/download/v0.7/chr11-2M.fa.gz)；
- **数据性质**：线虫第 11 号染色体局部 2 Mb 区域的 HiFi reads 截断子集，仅用于验证软件正常编译与基本调用，不代表真实植物组装性能。

---

## 运行命令与关键参数含义

### 1. 官方测试命令
```bash
curl -sLO https://github.com/chhylp123/hifiasm/releases/download/v0.7/chr11-2M.fa.gz
./hifiasm -o test -t 4 -f 0 chr11-2M.fa.gz 2> test.log
```

### 2. 植物生产环境推荐命令
```bash
# HiFi-only 独立单倍型感知组装模式
hifiasm -o plant_asm -t 32 --hom-cov 30 -l 0 plant.hifi.fastq.gz 2> plant_asm.log
```

### 关键参数解析
- `-o test`：输出结果文件的前缀名；
- `-t 32`：运行线程数（推荐 32~64 线程以加速 minimizer 索引比对）；
- `-f 0`：关闭用于小数据的内存优化过滤，仅在官方小型测试集上使用；
- `-l 0`：单倍型清除级别（purge level）。`0` 表示不执行 purge，完整保留高杂合等位变异气泡；默认 `3` 适用于常规自交纯系；
- `--hom-cov`：指定纯合单倍型测序覆盖度阈值，通常由 GenomeScope2 基于 $k$-mer 频谱推断给出。

---

## 输出文件解释与结构规范

执行后生成包含组装拓扑图的标准 GFA 文件：
1. **`*.bp.p_ctg.gfa`**：
   主重叠群（Primary Contigs）图。表示全基因组的伪单倍型共识拼接骨架；
2. **`*.bp.a_ctg.gfa`**：
   替代重叠群（Alternate Contigs）图。包含从主干上解离出来的等位杂合分枝序列；
3. **`*.p_utg.gfa`**：
   Unitig 级别组装图，完整保留所有气泡分叉与读段重叠连接。

从 GFA 导出标准 FASTA 序列命令：
```bash
awk '/^S/{print ">"$2;print $3}' test.bp.p_ctg.gfa > test.p_ctg.fa
```

---

## 常见错误原因与排查指南

1. **报 `Segmentation fault` 或程序突然被系统中止（Killed）**：
   - *原因*：内存耗尽（OOM）。植物复杂大基因组（如玉米、小麦）在构建全对全比对图时需要大量临时内存；
   - *排查*：检查 `dmesg | grep oom`；调小线程数 `-t` 或在高内存节点运行。
2. **生成的 Primary 组装大小远超预期基因组大小（甚至接近 2 倍）**：
   - *原因*：样本杂合度极高，算法未能将同源等位气泡有效识别，导致双单倍型序列均被放入 Primary Contig；
   - *排查*：结合 purge_dups 进行后续等位去冗余，或调整 `-l` 清除级别。
3. **组装连续性极低（N50 远小于预期）**：
   - *原因*：HiFi 数据测序深度不足（低于 15×）或读段长度偏短（平均读长 $<10$ kb）；
   - *排查*：利用 Merqury 或 GenomeScope 检查输入数据的有效测序深度与杂合度。

---

## 原始文档与文献入口

- **Hifiasm 奠基论文**：[Cheng et al. (2021) Nature Methods, DOI: 10.1038/s41592-020-01056-5](https://doi.org/10.1038/s41592-020-01056-5)
- **Hifiasm 官方文档**：[Hifiasm GitHub Repository & Docs](https://github.com/chhylp123/hifiasm)
- **组装图可视化**：[Bandage GFA Viewer](https://github.com/rrwick/Bandage)
- **本站关联文献详情**：[Hifiasm 奠基论文解读](../../papers/hifiasm/)
