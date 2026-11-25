---
title: 基于组装比对的 SyRI 结构变异分析入门
summary: 使用官方拟南芥测试数据运行 NUCmer、坐标过滤与 SyRI，并检查结构变异输出。
method: syri
tested: verified
status: published
updatedAt: 2026-11-25
---

## 目的与验证状态

本教程演示如何基于两套染色体级别的高质量基因组组装，利用 MUMmer（NUCmer）进行全染色体共线性比对，并使用 SyRI 系统识别和分类大尺度基因组重排（共线性块 SYN、倒位 INV、易位 TRANS、基因重复 DUP）与局部序列变异。

**真实验证记录**：2026 年 11 月 21 日已在 WSL Ubuntu 环境中使用 Python 3.11.18、SyRI 1.8.2 与 MUMmer 3.23 完整运行官方拟南芥第 4 号染色体实测流程，真实日志与汇总报告保存在仓库 `examples/syri/verified-20261121/`。该验证基于官方测试集（TAIR10 与 Ler-0 第 4 号染色体），用于演示全流程与输出判定；不同植物全基因组比对需根据序列发散度调整比对种子与过滤阈值。

---

## 环境及数据来源

### 1. 软件环境配置
推荐使用 Conda 建立独立的运行环境：
```bash
micromamba create -n syri-demo -c conda-forge -c bioconda \
  python=3.11 syri=1.8.2 mummer=3.23
micromamba activate syri-demo
syri --version
nucmer --version
```

### 2. 输入数据说明
测试数据来自 SyRI 官方代码仓库（commit `acf72cc`）：
- **参考序列**：拟南芥参考品系 Col-0（TAIR10）第 4 号染色体序列 `tair10_chr4.fa.gz`；
- **查询序列**：拟南芥经典生态型 Ler-0 第 4 号染色体组装 `ler_chr4.fa.gz`；
- **哈希校验**：输入压缩包的 SHA-256 见 `examples/syri/verified-20261121/input-sha256.txt`。

```bash
# 准备输入数据文件
mkdir syri-example && cd syri-example
curl -sLO https://raw.githubusercontent.com/schneebergerlab/syri/acf72ccf47beffaaeade849fd258827ef24bedf4/test/test_data/tair10_chr4.fa.gz
curl -sLO https://raw.githubusercontent.com/schneebergerlab/syri/acf72ccf47beffaaeade849fd258827ef24bedf4/test/test_data/ler_chr4.fa.gz
gzip -d tair10_chr4.fa.gz && mv tair10_chr4.fa ref.fa
gzip -d ler_chr4.fa.gz && mv ler_chr4.fa query.fa
```

---

## 运行命令与关键参数含义

```bash
# 步骤 1: 使用 nucmer 执行全染色体比对
nucmer --maxmatch -c 500 -b 500 -l 100 ref.fa query.fa

# 步骤 2: 过滤比对冗余并导出结构化坐标表
delta-filter -m -i 90 -l 100 out.delta > out_m_i90_l100.delta
show-coords -THrd out_m_i90_l100.delta > out_m_i90_l100.coords

# 步骤 3: 运行 SyRI 解构重排并生成 VCF
syri -c out_m_i90_l100.coords -r ref.fa -q query.fa \
  -d out_m_i90_l100.delta --prefix mummer_
```

### 关键参数解析
- `--maxmatch`：允许寻找全基因组多重匹配片段（对于富含重复转座子的植物染色体至关重要）；
- `-c 500 -b 500 -l 100`：分别设定聚类距离、带状比对延伸宽度与最小精确匹配（MUM）长度；
- `delta-filter -m -i 90 -l 100`：`-m` 允许检测多对多同源复制，`-i 90` 保留相似度 $\ge 90\%$ 的高置信比对块，`-l 100` 剔除 100 bp 以下的碎片比对；
- `syri -c`：输入的比对坐标表文件（`.coords`）；
- `syri -d`：提供原始比对 delta 文件，供 SyRI 提取重排区间内部的短 InDel 与 SNP 局部变异；
- `--prefix mummer_`：指定输出文件的前缀，防止结果与临时文件混淆。

---

## 输出文件解释与结构规范

执行后在当前目录下生成核心变异结果：
1. **`mummer_syri.out`**：
   主要结构变异分类表（制表符分隔，记录变异唯一 ID、参考染色体及起始终止、查询染色体及起始终止、变异大类如 SYN/INV/TRANS/DUP、父变异关系与注释）；
2. **`mummer_syri.vcf`**：
   符合标准 VCFv4.2 规范的结构变异文件（将共线性断裂点与大片段倒位标准化为符号变异）；
3. **`mummer_syri.summary`**：
   宏观结构变异与局部序列差异统计表（记录各变异类型的事件数与总跨越碱基长度）；
4. **`mummer_mapids.txt`**：
   两套组装由于染色体命名差异而建立的对应关系表（如 `Chr4 <-> OX291574.1`）。

---

## 真实结果解读（基于本地实测数据）

对照 `examples/syri/verified-20261121/mummer_syri.summary` 实际记录：
- **同线性骨架（SYN）**：识别出 54 个长同线性保守区间，覆盖了第 4 号染色体绝大部分物理长度；
- **倒位事件（INV）**：识别出 4 个倒位区域（包含拟南芥已知的经典大片段染色体倒位）；
- **染色体命名映射**：由于 Ler 组装序列使用了 GenBank 登录号 `OX291574.1`，SyRI 自动完成同源染色体配对并在日志中显式提示。
- *科学结论*：拟南芥不同生态型之间即便整体序列高度同源，染色体内部仍富集着多个千碱基至兆碱基尺度的倒位与局部结构重排，这些重排往往直接导致杂交减数分裂中的重组抑制。

---

## 常见错误原因与排查指南

1. **报 `No syntenic region found`（未找到任何共线性区域）**：
   - *原因*：染色体方向反转（两套组装其中一套为反向互补链）或染色体命名映射错误；
   - *排查*：检查 `mummer_mapids.txt`，确认染色体对应关系；若整条染色体反向，使用 `seqtk seq -r` 将查询染色体反转后再比对。
2. **输出包含大量碎片化的短易位（TRANS）**：
   - *原因*：前置比对过滤（`delta-filter`）设置过宽，将短转座子随机匹配误作为易位处理；
   - *排查*：适当提高 `delta-filter` 的最小长度 `-l 1000` 或相似度 `-i 95`，先建立清晰的主同源骨架。
3. **输入 BAM 代替 coords 时报 CIGAR 格式错误**：
   - *原因*：SyRI 要求 BAM 的 CIGAR 串中必须使用严格的等号匹配格式（`--eqx`）；
   - *排查*：若使用 minimap2 比对，必须添加 `-ax asm5 --eqx` 参数生成合法 BAM。

---

## 原始文档与文献入口

- **SyRI 奠基论文**：[Goel et al. (2019) Genome Biology, DOI: 10.1186/s13059-019-1911-0](https://doi.org/10.1186/s13059-019-1911-0)
- **SyRI 官方教程**：[SyRI Documentation & Quickstart](https://schneebergerlab.github.io/syri/)
- **下游可视化工具**：[Plotsr (GitHub)](https://github.com/schneebergerlab/plotsr)
- **本站关联文献详情**：[SyRI 奠基论文解读](../../papers/syri-paper/)
