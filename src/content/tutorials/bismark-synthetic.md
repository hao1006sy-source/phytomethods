---
title: 使用 Bismark 分析模拟甲基化数据
summary: 从已知状态的模拟 reads 进行亚硫酸氢盐感知比对和胞嘧啶提取。
method: bismark
tested: verified
status: draft
updatedAt: 2026-11-21
---
## 目标与验证范围
本教程以虚构参考序列和已知甲基化状态的模拟 reads，演示 Bismark 索引、比对及 CG、CHG、CHH 统计。2026 年 11 月 21 日已在 WSL Ubuntu 中运行 Bismark Rust suite 3.3.0、Bowtie2 2.5.5 和 Samtools 1.25。数据不来自植物样本，模拟结果不能用于推断真实植物甲基化模式。

## 输入与环境
`examples/methylation/generate_synthetic.py` 使用固定种子生成 1000 bp 虚构参考、90 条 100 bp 单端 reads 及胞嘧啶状态真值。模拟对每个正链胞嘧啶按坐标设定甲基化，未甲基化 C 在 reads 中转换为 T；不模拟测序错误、转换失败、生物重复或反向链文库。

可使用独立环境安装 Bismark、Bowtie2 和 Samtools，安装和版本说明见[官方项目](https://github.com/FelixKrueger/Bismark)。下面命令针对本次实际运行的 Rust suite 3.3.0；经典 Perl 版本及其他版本的命令和输出需按各自文档核对。

```bash
python examples/methylation/generate_synthetic.py --output simulated-input
mkdir reference align extracted
cp simulated-input/reference.fa reference/
bismark --version
bowtie2 --version
samtools --version
```

生成器要求输出目录不存在，以避免覆盖。实际验证使用的输入与 SHA-256 保存在 `examples/methylation/synthetic-input-v2/` 和 `examples/methylation/verified-20261121/`。

## 比对与甲基化提取

```bash
bismark prepare reference
bismark align --genome reference -o align simulated-input/reads.fastq
bismark extract --single-end --comprehensive --bedGraph \
  --cytosine_report --CX --genome_folder reference \
  -o extracted align/reads_bismark_bt2.bam
```

`prepare` 为参考构建转换索引；`align` 执行亚硫酸氢盐感知比对；`--single-end` 指明单端数据，`--comprehensive` 合并同一背景的调用，`--cytosine_report --CX` 输出包含所有胞嘧啶背景的报告。植物中需关注 CG、CHG、CHH；省略 `--CX` 时本次版本的综合报告默认仅含 CpG。实际文库还需考虑方向性、重复、链、转换率及质量过滤。

## 结果与独立核对
本次 90 条 reads 均获得唯一最佳比对，BAM 和报告已保存。`reads_bismark_bt2.CX_report.txt` 按染色体、1-based 坐标、链、甲基化计数、未甲基化计数和序列背景列出结果；零覆盖位点不能用来计算甲基化比例。

运行 `python scripts/check-bismark-example.py` 可将覆盖区间内的正链调用与预设真值比较。本次 239 个覆盖 C 位点均一致，其中 CG 50、CHG 45、CHH 144。对每个位点，甲基化比例由甲基化有效读段数除以总有效覆盖数得到；这个无错误模拟的结果不表示真实数据会达到相同准确度。

第一次生成的末端 read 触及参考边界，Bismark 提示缺少序列上下文；最终示例缩短覆盖范围，避免在末端外请求上下文。真实分析遇到类似警告时应核对参考序列、比对位置和工具日志。

## 常见问题与延伸阅读
索引或比对器找不到时检查 PATH 和参考目录；坐标不一致时核对 0-based 与 1-based 输出选项；低覆盖、转换失败、多重比对和 PCR 重复会影响甲基化估计。参考 [Bismark 方法论文](https://doi.org/10.1093/bioinformatics/btr167)及[六倍体小麦靶向甲基化研究](https://doi.org/10.1186/s13059-015-0838-3)。
