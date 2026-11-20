---
title: 从蛋白序列到同源基因家族入门
summary: 使用 OrthoFinder 官方小型蛋白示例理解同源组和物种树输出。
method: orthofinder
tested: verified
status: draft
updatedAt: 2026-11-21
---
## 目的与验证状态
本教程说明多物种蛋白 FASTA 如何进入 OrthoFinder 的同源组与系统发育分析。2026 年 11 月 21 日已在 WSL Ubuntu 中运行 OrthoFinder 3.2 官方示例，生成同源组、物种树和统计文件。官方示例是四种支原体的蛋白质数据，属于非植物教学数据；植物蛋白集仍需按自己的组装、注释和物种选择进行独立分析。

## 环境与数据来源
实际环境使用 Python 3.12.16、OrthoFinder 3.2。以 micromamba 和公开 conda-forge、bioconda 渠道建立隔离环境：

```bash
micromamba create -n orthofinder-demo -c conda-forge -c bioconda \
  python=3.12 orthofinder=3.2
micromamba activate orthofinder-demo
orthofinder --version
```

本次环境中的 ETE4 导入提示缺少 `brotli`，安装 `python -m pip install brotli==1.2.1` 后运行成功。不同渠道和安装时间的依赖可能不同；先查看实际错误与[官方安装说明](https://github.com/OrthoFinder/OrthoFinder#installation)。

官方示例是 [v3.2 发布文件](https://github.com/OrthoFinder/OrthoFinder/releases/download/v3.2/ExampleData.tar.gz)，并非仓库根目录自带数据。下载并解压到独立工作目录：

```bash
curl -L https://github.com/OrthoFinder/OrthoFinder/releases/download/v3.2/ExampleData.tar.gz -o ExampleData.tar.gz
sha256sum ExampleData.tar.gz
tar -xzf ExampleData.tar.gz
```

本次下载的压缩包 SHA-256 为 `60024e9590ebdf48e89e6a7b564c803f93affa76238bd32dc7f16ebad5c7245f`，四个主输入文件的校验和见 `examples/orthofinder/verified-20261121/input-sha256.txt`。输入目录中的 `AdditionalSpecies` 是额外示例子目录，本次主要运行使用根目录的四个 `.faa` 文件。

## 运行

```bash
orthofinder -f ExampleData -t 2 -a 2
```

`-f` 指向蛋白 FASTA 目录；`-t 2`、`-a 2` 分别控制序列搜索和分析步骤的线程数。运行前确认输入文件和物种标识，保留软件版本、命令及日志；实际可用参数以当前版本 `orthofinder -h` 为准。正式植物数据应记录基因组和注释版本、倍性、蛋白质量及每基因代表转录本的选择规则。

## 输出和解释
结果保存在 `ExampleData/OrthoFinder/Results_日期/`。本次产生 `Orthogroups/Orthogroups.tsv`、`Species_Tree/SpeciesTree_rooted.txt`、基因树和 `Comparative_Genomics_Statistics/Statistics_Overall.tsv`。实际统计包含 4 个物种、2733 条输入基因、599 个 orthogroup 和 250 个单拷贝 orthogroup；这是示例数据和参数下的程序输出，不代表植物数据的预期数量。

Orthogroup 描述从共同祖先基因衍生的基因集合；集合成员可能包含复制产生的旁系同源基因，不能把组内所有成员都当成一对一直系同源。应结合基因树、物种树、重复事件及注释质量解释。

## 常见问题与阅读
命令找不到时检查环境及 PATH；导入失败时查看缺失 Python 模块及安装渠道；输入异常时检查 FASTA 格式、空序列和同一物种内重复 ID；结果异常时核查重复转录本、蛋白截短和物种取样。本次真实日志、输入哈希、统计和物种树保存在 `examples/orthofinder/verified-20261121/`。

参考 [OrthoFinder 2019 方法论文](https://doi.org/10.1186/s13059-019-1832-y)、[2026 版本改进论文](https://doi.org/10.1038/s41592-026-03126-6)与[官方文档](https://github.com/OrthoFinder/OrthoFinder)。
