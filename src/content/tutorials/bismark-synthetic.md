---
title: 使用 Bismark 分析模拟甲基化数据
summary: 从已知状态的模拟 reads 进行亚硫酸氢盐感知比对和胞嘧啶提取。
method: bismark
tested: verified
status: published
updatedAt: 2026-11-25
---

## 目的与验证状态

本教程演示利用 Bismark 套件对全基因组重亚硫酸盐测序（WGBS）数据进行标准比对与全基因组胞嘧啶甲基化状态提取（CG、CHG 与 CHH 三种序列环境）的计算流程。

**真实验证记录**：2026 年 11 月 21 日已在 WSL Ubuntu 环境中基于 Bismark Rust suite 3.3.0、Bowtie2 2.5.5 与 Samtools 1.25 完整运行，真实运行日志、输入哈希与比对产物保存在仓库 `examples/methylation/verified-20261121/`。该数据集为具有已知甲基化状态真值的 1000 bp 合成参考序列与 90 条读段，用于算法验证；植物真实分析须考虑重亚硫酸盐转化率与双链文库特征。

---

## 环境与数据来源

### 1. 软件环境配置
- 推荐使用 Conda 建立包含 Bismark、Bowtie2 与 Samtools 的隔离环境；
- 官方项目：[FelixKrueger/Bismark GitHub](https://github.com/FelixKrueger/Bismark)；
- 本次验证基于 Bismark Rust suite 3.3.0（支持并行加速与现代化命令集）。

### 2. 输入数据说明
输入数据由脚本 `examples/methylation/generate_synthetic.py` 驱动生成：
- **`reference.fa`**：长度为 1,000 bp 的人工合成 DNA 参考序列（正链共计包含 239 个胞嘧啶位点，其中 CG 50 个、CHG 45 个、CHH 144 个）；
- **`reads.fastq`**：90 条长度为 100 bp 的单端 FASTQ 读段。根据预设真值，甲基化胞嘧啶保持为 C，未甲基化胞嘧啶在经亚硫酸氢盐处理后转换为 T。

```bash
# 生成模拟输入数据并组织目录结构
python examples/methylation/generate_synthetic.py --output simulated-input
mkdir reference align extracted
cp simulated-input/reference.fa reference/
```

---

## 运行命令与关键参数含义

```bash
# 步骤 1: 构建 C->T 与 G->A 转换参考基因组索引
bismark prepare reference

# 步骤 2: 执行重亚硫酸盐感知比对 (调用 Bowtie2)
bismark align --genome reference -o align simulated-input/reads.fastq

# 步骤 3: 提取全胞嘧啶环境甲基化状态并输出全基因组报告
bismark extract --single-end --comprehensive --bedGraph \
  --cytosine_report --CX --genome_folder reference \
  -o extracted align/reads_bismark_bt2.bam
```

### 关键参数解析
- `prepare reference`：将参考序列分别进行 C->T（正链转化）与 G->A（负链转化）双重转换并构建 Bowtie2 索引；
- `align --genome reference`：执行四链或定向文库比对，自动处理 C/T 错配计分；
- `--single-end`：声明测序类型为单端读段（双端数据应使用 `--paired-end`）；
- `--comprehensive`：合并正负链相同上下文的胞嘧啶甲基化计数；
- `--bedGraph`：输出适合基因组浏览器（如 IGV）载入的甲基化百分比 BedGraph 轨道文件；
- `--cytosine_report --CX`：生成包含全基因组所有胞嘧啶环境（CG、CHG、CHH）的完整甲基化报告。在植物中极度重要，因为植物除哺乳动物常见的 CG 甲基化外，还广泛存在受 RdDM 途径调控的 CHG 与 CHH 甲基化。

---

## 输出文件解释与结构规范

执行后在 `extracted/` 目录下生成以下核心结果：
1. **`reads_bismark_bt2.CX_report.txt`**：
   全基因组胞嘧啶报告（制表符分隔，包含染色体、1-based 物理位置、正负链、已甲基化 C 读段计数、未甲基化 C/T 读段计数、三碱基上下文及扩展环境）；
2. **`reads_bismark_bt2.bedGraph.gz`**：
   记录每个覆盖位点的甲基化百分比（$100 \times \text{Counts}_C / (\text{Counts}_C + \text{Counts}_T)$）；
3. **`reads_bismark_bt2_SE_report.txt`**：
   全局比对与甲基化汇总，记录整体比对率、唯一比对数及各环境下总甲基化水平。

---

## 真实结果解读（基于本地实测数据）

对照 `examples/methylation/verified-20261121/` 实测结果：
- 90 条输入 reads 全部实现 100% 唯一正确比对（Unique alignment rate: 100%）；
- 覆盖到的 239 个正链胞嘧啶位点中：
  - **CG 环境**：50 个位点，实测甲基化判定与模拟真值 100% 一致；
  - **CHG 环境**：45 个位点，实测判定与模拟真值 100% 一致；
  - **CHH 环境**：144 个位点，实测判定与模拟真值 100% 一致；
- 运行配套校验脚本 `python scripts/check-bismark-example.py` 对比预设真实标签，239/239 个位点甲基化状态完全吻合。

---

## 常见错误原因与排查指南

1. **未添加 `--CX` 参数导致缺失 CHG/CHH 报告**：
   - *原因*：Bismark 默认仅提取 CpG（CG）环境，植物特有的非 CpG 甲基化会被忽略；
   - *排查*：在植物表观遗传分析中，务必显式指定 `--CX` 与 `--cytosine_report`。
2. **重亚硫酸盐转化不完全导致假阳性**：
   - *原因*：实验中亚硫酸氢钠处理不彻底，未甲基化的 C 未能转化为 T；
   - *排查*：植物实验必须添加未甲基化的叶绿体基因组 DNA 或 Lambda 噬菌体作为内参，通过内参转化率（要求 $>99.5\%$）评估转化质量。
3. **PCR 重复偏倚导致甲基化比例失真**：
   - *原因*：文库构建中扩增循环数过多；
   - *排查*：在运行 `bismark extract` 前，必须调用 `deduplicate_bismark` 剔除基于染色体物理起始与终止坐标相同的 PCR 重复 reads。

---

## 原始文档与文献入口

- **Bismark 方法奠基论文**：[Krueger & Andrews (2011) Bioinformatics, DOI: 10.1093/bioinformatics/btr167](https://doi.org/10.1093/bioinformatics/btr167)
- **Bismark 官方项目主页**：[FelixKrueger/Bismark GitHub](https://github.com/FelixKrueger/Bismark)
- **植物表观应用参考**：[小麦全基因组重亚硫酸盐测序 (Genome Biology 2015)](https://doi.org/10.1186/s13059-015-0838-3)
- **本站关联文献详情**：[Bismark 奠基论文解读](../../papers/bismark-paper/)
