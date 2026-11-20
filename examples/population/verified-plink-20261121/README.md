# PLINK 模拟数据验证记录

2026-11-21 在 Windows 使用官方 PLINK v1.9.1 64-bit (11 Nov 2026)，压缩包 SHA-256 `03c83d4a6bb457f2b4f0bf02d2fde821faba06aaf38cff10577d9d5c23378f14`。官方来源：https://www.cog-genomics.org/plink/ 。

输入 `examples/population/simulated-genotypes.vcf` 由同目录的模拟剂量表生成，不是真实植物数据。实际命令：

```text
plink --vcf examples/population/simulated-genotypes.vcf --make-bed --out work/plink-run-20261121/simulated
plink --bfile work/plink-run-20261121/simulated --freq --missing --pca 2 --out work/plink-run-20261121/analysis
```

保存频率、缺失、PCA 特征值/向量、示意图和运行日志；日志中的主机名与工作目录已去除。8 个样本、6 个位点通过，频率为 0.5、缺失率为 0。`python scripts/check-plink-example.py` 从原始模拟剂量表复核频率和缺失率。官方数据格式与倍性限制应按具体植物材料核查。
