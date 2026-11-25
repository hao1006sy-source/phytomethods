---
title: 使用 PLINK 分析模拟群体 SNP
summary: 将模拟 VCF 转换为 PLINK 文件并计算频率、缺失率和 PCA。
method: plink
tested: verified
status: published
updatedAt: 2026-11-25
---

## 目的与验证状态

本教程演示如何利用 PLINK 对群体单核苷酸多态性（SNP）数据进行二进制格式转换（BED/BIM/FAM）、次要等位基因频率（MAF）统计、样本与位点缺失率质控计算，以及主成分分析（PCA）。

**真实验证记录**：2026 年 11 月 21 日已在本地环境使用官方发布的 PLINK 1.9.1（Windows 64-bit，11 Nov 2026 构建）完整执行，真实运行日志与产物保存在仓库 `examples/population/verified-plink-20261121/`。该数据集为 8 个二倍体样本在 6 个位点上的合成教学数据，用于演示规范与结果核验；真实植物群体分析须根据物种倍性与染色体命名规则配置参数。

---

## 环境与数据来源

### 1. 软件环境配置
- 官方二进制程序：[PLINK 1.9 官方下载页](https://www.cog-genomics.org/plink/)；
- Windows 官方安装包 SHA-256：`03c83d4a6bb457f2b4f0bf02d2fde821faba06aaf38cff10577d9d5c23378f14`；
- Python 环境：用于生成 VCF 与绘图脚本。

### 2. 输入数据说明
数据位于 `examples/population/`：
- **`simulated-genotypes.tsv`**：8 个样本（A1–A4 代表群体 A，B1–B4 代表群体 B）在 6 个人工位点上的等位基因剂量矩阵（数值 0、1、2 分别代表纯合参考、杂合与纯合突变）；
- **`simulated-genotypes.vcf`**：由脚本 `generate_vcf.py` 生成的标准二倍体 VCFv4.2 文本文件。

```bash
# 从 TSV 生成测试 VCF 并验证软件版本
python examples/population/generate_vcf.py --output simulated.vcf
plink --version
```

---

## 运行命令与关键参数含义

```bash
# 步骤 1: 将 VCF 转换为紧凑二进制 BED/BIM/FAM 格式
plink --vcf simulated.vcf --make-bed --allow-extra-chr --out simulated

# 步骤 2: 计算等位基因频率、缺失率并提取前两个主成分 (PCA)
plink --bfile simulated --freq --missing --pca 2 --allow-extra-chr --out analysis
```

### 关键参数解析
- `--vcf simulated.vcf`：读取输入的变异文件；
- `--make-bed`：生成 PLINK 二进制文件三件套（`.bed` 基因型、`.bim` 位点信息、`.fam` 家系样本信息）；
- `--allow-extra-chr`：允许非人类的标准染色体编号（如植物的 `Chr1` 或非数字命名的 Scaffold）；植物分析中必须开启，否则默认会将未知染色体当作错误终止；
- `--bfile simulated`：读取二进制三件套前缀；
- `--freq`：统计每个位点的等位基因频率（输出 `.frq`）；
- `--missing`：统计样本级与位点级缺失率（分别输出 `.imiss` 与 `.lmiss`）；
- `--pca 2`：计算基因型相关矩阵的前 2 个主成分特征向量与特征值。

---

## 输出文件解释与结构规范

执行后在输出目录生成以下标准文件：
1. **`analysis.frq`**：
   记录染色体、SNP ID、主要等位基因 A1、次要等位基因 A2、MAF 频率与有效等位基因观测数；
2. **`analysis.imiss`**：
   个体水平缺失率表，记录每个样本的缺失位点数（`N_MISS`）与缺失比例（`F_MISS`）；
3. **`analysis.lmiss`**：
   位点水平缺失率表，记录每个 SNP 在全群体中的缺失样本数与比例；
4. **`analysis.eigenval`**：
   对应所提取主成分的特征值大小（前 2 行对应 PC1 与 PC2）；
5. **`analysis.eigenvec`**：
   样本坐标矩阵，首两列为家系与样本 ID（FID/IID），后续列为各样本在 PC1、PC2 坐标轴上的投影数值。

---

## 真实结果解读（基于本地实测日志）

对照 `examples/population/verified-plink-20261121/analysis.log` 与 `analysis.eigenval` 实际记录：
- 读入 8 个个体（4 个 A 组，4 个 B 组）与 6 个双等位基因位点；
- **缺失率**：样本缺失率与位点缺失率均为 0.0000（数据完全无缺失）；
- **等位基因频率**：6 个位点的次要等位基因频率均为 0.5000（`analysis.frq` 实测全部位点 MAF=0.5）；
- **PCA 分布**：`analysis.eigenval` 实测 PC1 特征值为 `6.7448`，PC2 特征值为 `1.6044`。
  使用配套脚本 `python examples/population/plot_plink.py` 绘制散点图表明，PC1 能够将预设的 A 组与 B 组样本在水平轴上清晰分离。

---

## 常见错误原因与排查指南

1. **报错 `Error: Invalid chromosome code`**：
   - *原因*：PLINK 默认仅识别人类标准常染色体（1–22）与性染色体（X/Y）；植物染色体（如 `Chr01`）会被判定为非法；
   - *排查*：在所有命令行中务必添加 `--allow-extra-chr`。
2. **报错 `Error: All individuals removed due to missingness`**：
   - *原因*：质控阈值 `--mind` 或 `--geno` 设置过于严苛，或者测序数据深度不足；
   - *排查*：先用 `--missing` 检查整体缺失分布，再逐步调整过滤阈值。
3. **PCA 样本全部分离为独立散点或聚集为单点**：
   - *原因*：群体样本数过小（如此处 8 个教学样本）或未过滤单态位点（Monomorphic SNPs）；
   - *排查*：在正式植物自然群体中，必须先用 `--maf 0.05` 剔除低频变异，并用 `--indep-pairwise 50 10 0.2` 进行连锁不平衡（LD）修剪。

---

## 原始文档与文献入口

- **PLINK 官方文档**：[PLINK 1.9 Resources & Documentation](https://www.cog-genomics.org/plink/1.9/)
- **方法学奠基论文**：[Purcell et al. (2007) Am J Hum Genet, DOI: 10.1086/519795](https://doi.org/10.1086/519795)
- **本站关联文献详情**：[PLINK 奠基论文解读](../../papers/plink-paper/)
