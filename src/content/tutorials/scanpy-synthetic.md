---
title: 使用 Scanpy 分析模拟单细胞表达矩阵
summary: 以可重复生成的模拟数据练习质控、PCA、邻近图、聚类和 UMAP。
method: scanpy
tested: verified
status: draft
updatedAt: 2026-11-21
---
## 目标与验证状态
本教程使用固定随机种子生成的教学计数矩阵练习 Scanpy 流程。数据不来自真实植物，生成的两个模拟组也不是细胞类型；目标是理解代码与输出。2026 年 11 月 21 日，示例在 Windows Python 3.13.9、Scanpy 1.13.0 环境运行两次，生成的计数、质控、聚类与坐标表一致。真实植物数据和完整生物学解释尚待验证。

## 输入与运行环境
项目源码的 `examples/single-cell/scanpy_demo.py` 自行生成输入：60 个虚构细胞、20 个虚构基因以及一个用于演示过滤的零计数观测。模拟的两组在部分基因上使用不同 Poisson 均值，故聚类分离程度反映预设设计。

建议使用独立 Python 环境，安装 Scanpy、igraph、Leiden 和绘图依赖；本次运行使用的精确版本保存在 `examples/single-cell/verified-20261121/run.json`。参考[官方安装文档](https://scanpy.readthedocs.io/en/stable/installation.html)。示例要求 Scanpy 1.13.0 的 `out='obs.cluster'` 接口。

```bash
python -m venv .venv-scanpy
# 在当前 shell 中激活该虚拟环境
python -m pip install scanpy==1.13.0 python-igraph==1.0.0 leidenalg==0.12.0 matplotlib
python examples/single-cell/scanpy_demo.py --output results-scanpy-demo
```

输出目录必须是新目录；脚本会拒绝覆盖已有目录。本次验证环境及结果摘要也保存在 `examples/single-cell/verified-20261121/`。跨平台、依赖版本及数值库不同可能影响坐标或聚类，需记录实际版本。

## 计算步骤
脚本先保存原始模拟计数，并计算每个观测的总计数与检测到的基因数。演示阈值为总计数至少 15、检测基因至少 6；这些是教学数据的阈值，不适用于直接过滤真实植物数据。原始 counts 保存在 AnnData 的 `layers['counts']`。

随后按细胞总量归一化至 10,000、执行 `log1p`、计算 10 个主成分，基于 8 个近邻建图，再使用 Leiden（分辨率 0.5）和 UMAP。示例采用全部 20 个基因，未执行高变基因筛选、批次整合或 marker 注释；真实实验需要按设计和质控结果选择这些步骤。

## 输出与解释
`simulated_counts.csv` 是输入计数；`qc_before.csv` 保存过滤前质量指标；`cell_results.csv` 保存过滤后的 UMAP 坐标、聚类及模拟组标签；`umap.png` 分别按模拟组和无监督聚类着色；`run.json` 记录种子、参数、版本和细胞数。本次从 61 个观测中保留 60 个，聚类分别为 29 和 31 个。

UMAP 轴是低维表示而非实际组织坐标，聚类编号也不直接对应细胞身份。真实植物分析需要结合样本重复、组织来源、细胞类型 marker、原生质体处理影响和独立实验解释。

## 常见问题和资料
依赖导入失败时检查 Python、Scanpy、Numba 与 NumPy 的版本兼容性；邻居数和 PCA 维度应小于有效样本或特征规模；空或全零数据需先处理。参考 [Scanpy 方法论文](https://doi.org/10.1186/s13059-017-1382-0)与[水稻根单细胞研究](https://doi.org/10.1038/s41467-021-22352-4)。
