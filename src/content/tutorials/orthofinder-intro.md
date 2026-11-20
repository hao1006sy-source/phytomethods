---
title: 从蛋白序列到同源基因家族入门
summary: 基于 OrthoFinder 官方示例理解蛋白输入、家族和系统树输出。
method: orthofinder
tested: template
status: draft
updatedAt: 2026-11-21
---
## 目的与验证状态
本教程通过 OrthoFinder 官方示例，说明多物种蛋白序列如何进入家族和系统发育分析。命令结构根据[官方仓库](https://github.com/OrthoFinder/OrthoFinder)整理；当前环境未安装并执行 OrthoFinder，以下没有本机实际输出。官方发布页在 2026-11-21 列出 v3.2；运行前应核对实际安装版本及其文档。

## 环境和示例数据
建议在 Linux 环境或配置好的兼容环境中安装 OrthoFinder 及对应依赖，遵循[官方安装说明](https://github.com/OrthoFinder/OrthoFinder#installation)。仓库的 `ExampleData` 目录提供示例蛋白 FASTA；可下载官方版本或克隆仓库，记录版本、下载日期和许可证。教学示例用于理解流程，不应将其结果描述成新的植物研究数据。

```bash
git clone https://github.com/OrthoFinder/OrthoFinder.git
cd OrthoFinder
orthofinder --version
orthofinder --help
```

运行前确认命令可调用、依赖已满足，并检查 `ExampleData` 内的 FASTA 文件。每个物种应使用单独文件，每条序列应有清楚的唯一标识；自建植物蛋白集需要记录物种、基因组与注释版本，并说明可变剪接代表序列的选择方法。

## 运行命令
官方示例的基础命令如下。计算时间与序列数量、依赖和机器配置有关；运行前确认当前目录含 `ExampleData`，且有可写的输出空间。

```bash
orthofinder -f ExampleData
```

`-f` 指向包含蛋白序列文件的目录。线程、搜索程序与树推断方法等设置应使用当前版本的 `--help` 查询；保存完整命令、版本及日志。正式比较植物物种时，应对蛋白完整度、重复 ID、污染和样本倍性进行检查。

## 预期输出与解释
官方文档描述完整分析可输出 orthogroup、直系同源关系、基因树、物种树和复制统计。自 v3.1 起，根节点的家族结果位于 `Orthogroups/Orthogroups.tsv`；v3.2 起默认直系同源结果文件的组织方式也有变化，应以实际版本文档为准。检查结果时区分家族成员和成对直系同源关系；同一家族内可有复制产生的旁系同源。

## 常见问题
- 命令找不到：检查安装环境、PATH 及官方依赖说明。
- 输入解析失败：检查文件扩展名、FASTA 标识、空序列和物种文件划分。
- 结果缺少预期基因：检查注释质量、截短序列、输入文件版本和家族判定。
- 数量异常：检查转录本是否被重复计作基因、基因模型和物种树设置。

进一步阅读 [OrthoFinder 论文](https://doi.org/10.1186/s13059-019-1832-y)及[官方结果说明](https://github.com/OrthoFinder/OrthoFinder#output-files)。
