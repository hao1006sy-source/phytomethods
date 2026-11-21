---
title: 基于组装比对的 SyRI 结构变异分析入门
summary: 使用官方拟南芥测试数据运行 NUCmer、坐标过滤与 SyRI，并检查结构变异输出。
method: syri
tested: verified
status: published
updatedAt: 2026-11-21
---
## 目的与验证状态
本教程比较两套拟南芥第 4 号染色体组装。2026 年 11 月 21 日，在 WSL Ubuntu 中实际运行下列 NUCmer、delta-filter、show-coords 和 SyRI 流程，并生成 `.out`、`.vcf`、`.summary` 和日志。该验证使用 SyRI 官方仓库测试数据，结果取决于比对和软件参数；不代表其他植物基因组已完成验证。

## 环境及数据
本次环境为 Python 3.11.18、SyRI 1.8.2、MUMmer 软件包 3.23（`nucmer --version` 显示 NUCmer 3.1）。软件安装与使用应参考 [SyRI 官方仓库](https://github.com/schneebergerlab/syri)及对应版本文档。可用 Conda 或 micromamba 建立独立环境；此处给出可供复现的版本约束：

```bash
micromamba create -n syri-demo -c conda-forge -c bioconda \
  python=3.11 syri=1.8.2 mummer=3.23
micromamba activate syri-demo
```

数据来自官方仓库 `test/test_data`，使用固定提交 `acf72ccf47beffaaeade849fd258827ef24bedf4`。下载仓库需要网络；测试数据仅用于此处教学，不应直接将整套测序或组装大文件提交到网站仓库。

```bash
git clone https://github.com/schneebergerlab/syri.git syri-source
git -C syri-source checkout acf72ccf47beffaaeade849fd258827ef24bedf4
mkdir syri-example
cd syri-example
gzip -cd ../syri-source/test/test_data/tair10_chr4.fa.gz > ref.fa
gzip -cd ../syri-source/test/test_data/ler_chr4.fa.gz > query.fa
```

参考与查询分别来自官方测试集的 TAIR10 和 Ler 第 4 号染色体文件。输入压缩文件的 SHA-256、运行日志和真实摘要保存在项目的 `examples/syri/verified-20261121/`。文件名及样本来源按官方测试集标记，正式研究应进一步核对组装版本和数据许可。

## 比对和过滤

```bash
nucmer --maxmatch -c 500 -b 500 -l 100 ref.fa query.fa
delta-filter -m -i 90 -l 100 out.delta > out_m_i90_l100.delta
show-coords -THrd out_m_i90_l100.delta > out_m_i90_l100.coords
```

`--maxmatch` 允许寻找多重匹配，`-c`、`-b`、`-l` 调整种子与聚类条件；`delta-filter -m -i 90 -l 100` 过滤冗余及指定身份率和长度以下的比对。参数与组装大小、重复和研究目标有关；该示例数值不可视为所有植物基因组的通用设置。保留原始 delta 和过滤日志。

## 运行 SyRI

```bash
syri -c out_m_i90_l100.coords -r ref.fa -q query.fa \
  -d out_m_i90_l100.delta --prefix mummer_
```

`-c` 指定比对坐标，`-r`、`-q` 分别指定参考和查询，`-d` 提供用于短变异识别的 MUMmer delta；`--prefix` 避免输出混淆。实际输出包括 `mummer_syri.out`、`mummer_syri.vcf`、`mummer_syri.summary` 和 `mummer_syri.log`。文件应在独立工作目录运行以免覆盖已有结果。

本次日志提示两套输入的染色体名称不同，SyRI 自动匹配为 `Chr4 → OX291574.1`，并将映射写入 `mummer_mapids.txt`。正式分析必须检查该映射以及同源染色体整体方向；多个染色体时不能不加核查地接受自动映射。

## 结果解释和检查
本次汇总文件报告 54 个共线区域、4 个倒位区域以及其他类型的候选结构差异。它们是该数据、版本和参数下的程序输出，不等同于已完成独立验证的生物学事件。检查 VCF 的参考方向、坐标、序列和类型，回看原始组装与比对；对关键断点结合长读段回贴、独立组装或实验进行验证。

同一官方数据也使用仓库提供的 PAF 比对输入进行过独立 SyRI 运行，两次结果的比对输入不同，不应直接要求摘要数量相同。记录和摘要见 `examples/syri/verified-20261121/`。

## 常见问题与参考
无有效共线区域时检查输入顺序、染色体方向、组装完整性和比对过滤；染色体名称不同时检查映射文件；重复或复制丰富区域需要更谨慎地检查多重匹配。详情参见 [SyRI 官方教程](https://schneebergerlab.github.io/syri/example.html)与[原始方法论文](https://doi.org/10.1186/s13059-019-1911-0)。
