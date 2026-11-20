---
title: 使用 EDTA 注释植物基因组重复序列
summary: 基于官方用法准备基因组 FASTA 并生成重复序列注释。
method: edta
tested: template
updatedAt: 2026-11-20
---
## 目的与验证状态
本教程为命令模板：命令已核对，真实数据待验证。EDTA 需要 Linux 或兼容环境、足够内存和存储，并包含多个依赖程序。运行前依据[官方仓库](https://github.com/oushujun/EDTA)选择版本，记录软件和数据库版本。

## 数据来源与准备
使用公开植物基因组 FASTA，例如 [TAIR 拟南芥资源](https://www.arabidopsis.org/)，核对来源、版本和使用条款。确保序列名唯一、文件可读并检查装配质量。官方仓库另提供小型教学测试数据，适合先检查安装；小样本结果不代表完整基因组评估。

## 运行模板
将文件路径替换为自己的输入，并按环境配置依赖与资源：

```bash
EDTA.pl --genome genome.fa --species others --step all --anno 1 --threads 8
```

`--genome` 指定 FASTA；`--species others` 选择通用 TIR 识别模式；`--step all` 执行完整阶段；`--anno 1` 启用全基因组注释；`--threads` 设定线程数。选项与默认值以实际版本的帮助信息为准。

## 输出与解释
检查日志及完整退出状态，查看产生的候选库、重复分类和全基因组注释；核对结果文件与软件版本文档对应。不同 TE 家族的识别受组装连续性、序列完整性和过滤策略影响。应结合已知库、手工检查与独立证据评估。

## 常见问题
输入路径或格式错误时检查 FASTA 名称与权限；依赖缺失时按官方环境说明核对程序；任务中止时检查日志、内存与磁盘。不要把小型测试得到的统计量作为真实植物结果。

[EDTA 方法论文](https://doi.org/10.1186/s13059-019-1905-y)。

## 官方测试数据和预期文件
官方仓库 `test/` 包含教学用小型基因组及配套文件，可先按[官方测试步骤](https://github.com/oushujun/EDTA#testing)检查安装。官方建议 FASTA 序列名简短、简单，长度不超过 13 个字符；若修改名称，应同步记录映射表。以官方版本说明为准，常见输出包括 `genome.fa.mod.EDTA.TElib.fa`（非冗余 TE 库）；启用 `--anno 1` 后可产生 `.EDTA.TEanno.gff3` 和 `.EDTA.TEanno.sum`。上述是官方说明中的文件命名示例，本站未运行该数据。
