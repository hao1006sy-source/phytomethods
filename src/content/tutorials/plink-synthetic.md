---
title: 使用 PLINK 分析模拟群体 SNP
summary: 将模拟 VCF 转换为 PLINK 文件并计算频率、缺失率和 PCA。
method: plink
tested: verified
status: draft
updatedAt: 2026-11-21
---
## 目的与验证状态
本教程使用 8 个虚构二倍体样本和 6 个虚构 SNP 演示 PLINK 数据转换、频率、缺失率和 PCA。2026 年 11 月 21 日已在 Windows 使用 PLINK 1.9.1（11 Nov 2026）实际运行；输入不是植物测序数据，结果仅用于教学。真实植物数据还需要检查倍性、参考版本、缺失、亲缘和连锁不平衡。

## 数据与软件
项目中的 `examples/population/simulated-genotypes.tsv` 记录每个样本的 ALT 等位基因剂量 0、1 或 2；`simulated-genotypes.vcf` 是由 `generate_vcf.py` 生成的对应 VCF。两组 A、B 是预先设定的模拟标签，不是植物群体或真实祖先成分。VCF 的染色体、位置和等位基因也是示意值。

从 [PLINK 官方下载页](https://www.cog-genomics.org/plink/)选择适合系统的二进制程序，并核对版本及许可。可在独立目录从 TSV 生成 VCF；输出路径必须不存在：

```bash
python examples/population/generate_vcf.py --output simulated.vcf
plink --version
```

本次官方 Windows 压缩包 SHA-256 如下；下载链接和版本可能更新，需重新核对。示例命令应在专用工作目录执行，避免覆盖已有文件。

```text
03c83d4a6bb457f2b4f0bf02d2fde821faba06aaf38cff10577d9d5c23378f14
```

## 格式转换和统计

```bash
plink --vcf simulated.vcf --make-bed --out simulated
plink --bfile simulated --freq --missing --pca 2 --out analysis
```

`--vcf` 读取示例，`--make-bed` 生成 `.bed/.bim/.fam` 文件；`--bfile` 读取此文件集；`--freq` 输出等位基因频率；`--missing` 输出样本与位点缺失率；`--pca 2` 输出两个主成分。真实植物染色体名称和倍性与默认设置可能不同，应查阅[官方文档](https://www.cog-genomics.org/plink/1.9/)并确认适用性。

## 实际输出与解释
本次运行读入 8 个样本和 6 个位点，所有位点的次要等位基因频率均为 0.5，样本及位点缺失率为 0；实际文件和已去除本机路径的日志保存在 `examples/population/verified-plink-20261121/`。`analysis.eigenvec` 为样本坐标，`analysis.eigenval` 包含请求的特征值；`analysis.frq`、`.imiss`、`.lmiss` 分别记录频率和缺失情况。日志中的性别不明是模拟样本没有性别元数据所致。

可用以下命令绘制示意图，并以独立脚本核对频率：

```bash
python examples/population/plot_plink.py --input analysis.eigenvec --output plink-pca.png
python scripts/check-plink-example.py
```

绘图脚本按样本名首字母区分模拟组；真实数据应使用独立样本元数据。PLINK 的 PCA 基于其基因型标准化与关系矩阵实现，与本站 NumPy 教学示例的均值中心化 PCA 并非同一计算；坐标数值和方向不应直接比较。6 个位点不足以支持真实群体结构推断。

## 常见问题与延伸
读取失败时检查 VCF 的样本列、GT、参考与替代等位基因、染色体编码及软件版本；PCA 异常时检查单态位点、缺失、样本数和过滤。若需祖先成分，须运行独立的模型方法；本教程没有运行 ADMIXTURE。参考 [PLINK 原始论文](https://doi.org/10.1086/519795)及[官方 PCA 文档](https://www.cog-genomics.org/plink/1.9/strat#pca)。
