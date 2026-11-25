---
title: 使用 Scanpy 分析模拟单细胞表达矩阵
summary: 以可重复生成的模拟数据练习单细胞质控、PCA、邻近图构建、Leiden 聚类和 UMAP 降维。
method: scanpy
tested: verified
status: published
updatedAt: 2026-11-25
---

## 目的与验证状态

本教程演示利用 Scanpy 对单细胞转录组（scRNA-seq）表达矩阵执行端到端分析流程：从原始 UMI 计数读取、低质量细胞质控过滤、文库归一化与对数变换，到高维主成分分析（PCA）、邻近网络（KNN Graph）构建、Leiden 图无监督聚类与 UMAP 二维流形降维可视化。

**真实验证记录**：2026 年 11 月 21 日已在 Windows 环境使用 Python 3.13.9、Scanpy 1.13.0、python-igraph 1.0.0 与 leidenalg 0.12.0 完整运行，真实运行日志与产物保存在仓库 `examples/single-cell/verified-20261121/`。该数据集为具有固定随机种子的 60 个模拟细胞合成数据，用于演示计算流与图分析；真实植物单细胞分析须结合叶绿体/线粒体占比与细胞类型特异性 marker 基因。

---

## 环境与数据来源

### 1. 软件环境配置
建议使用独立虚拟环境安装核心依赖：
```bash
python -m venv .venv-scanpy
# 激活虚拟环境
python -m pip install scanpy==1.13.0 python-igraph==1.0.0 leidenalg==0.12.0 matplotlib
```

### 2. 输入数据说明
输入数据由脚本 `examples/single-cell/scanpy_demo.py` 生成：
- **细胞与基因规模**：共 61 个观测（包含 60 个来自两组不同泊松分布特征的模拟细胞，以及 1 个全零计数的低质量离群点用于演示质控过滤），覆盖 20 个模拟特征基因；
- **真实基准**：输入原始计数矩阵保存为 `simulated_counts.csv`。

```bash
# 运行单细胞分析演示流水线
python examples/single-cell/scanpy_demo.py --output results-scanpy-demo
```
*注：输出目录必须不存在，脚本会自动防止覆盖已有目录。*

---

## 运行命令与关键参数含义

脚本在底层调用核心 Scanpy API：
```python
import scanpy as sc

# 1. 细胞与基因质控过滤 (演示阈值)
sc.pp.filter_cells(adata, min_counts=15)
sc.pp.filter_cells(adata, min_genes=6)

# 2. 文库大小归一化与对数化
sc.pp.normalize_total(adata, target_sum=10000)
sc.pp.log1p(adata)

# 3. 主成分分析与近邻图构建
sc.pp.pca(adata, n_comps=10)
sc.pp.neighbors(adata, n_neighbors=8, n_pcs=10)

# 4. Leiden 社区发现无监督聚类与 UMAP 降维
sc.tl.leiden(adata, resolution=0.5)
sc.tl.umap(adata)
```

### 关键参数解析
- `min_counts=15` / `min_genes=6`：质控过滤截断。真实植物原生质体单细胞测序中，通常设定每个细胞至少检测到 500~1,000 个基因，并过滤线粒体与叶绿体 UMI 占比超过 10%~20% 的破损细胞；
- `target_sum=10000`：将每个细胞的总 UMI 深度缩放至统一的 10,000（相当于 CPM 归一化），消除测序深度的批次波动；
- `log1p`：计算 $\ln(1 + x)$，稳定高表达基因的方差；
- `n_neighbors=8`：近邻图（KNN）的边连接数，控制局域流形结构的紧密程度；
- `resolution=0.5`：Leiden 聚类分辨率参数。调高该值将识别更多微小亚群，调低该值倾向于合并大类群。

---

## 输出文件解释与结构规范

执行后在指定输出目录下生成以下标准成果：
1. **`simulated_counts.csv`**：
   输入的原始未归一化 UMI 计数矩阵；
2. **`qc_before.csv`**：
   质控前各细胞的总 UMI 数（`total_counts`）与检出基因数（`n_genes_by_counts`）；
3. **`cell_results.csv`**：
   过滤后各细胞的分析矩阵，包含标准输出字段：`cell`（细胞 ID）、`UMAP1`、`UMAP2`（降维坐标）、`cluster`（Leiden 聚类标签）与 `simulated_group`（预设真实模拟组标签）；
4. **`umap.png`**：
   高质量 UMAP 双散点图，左图按预设模拟组着色，右图按无监督 Leiden 聚类结果着色；
5. **`run.json`**：
   记录软件版本、随机种子、执行参数（如 `n_pcs: 10`, `n_neighbors: 8`, `leiden_resolution: 0.5`）及细胞保留统计。

---

## 真实结果解读（基于本地实测数据）

对照 `examples/single-cell/verified-20261121/run.json` 与 `cell_results.csv` 实际记录：
- 原始 61 个输入观测中，1 个全零离群点被质控规则精准剔除，保留 60 个高质量细胞；
- **Leiden 聚类规模（分辨率 0.5，flavor: igraph）**：
  - **Cluster 0**：29 个细胞；
  - **Cluster 1**：31 个细胞；
- **聚类与模拟标签交叉列联表分析**：
  - Cluster 0 的 29 个细胞全部属于模拟 A 组（`simulated_group = A`）；
  - Cluster 1 的 31 个细胞中，30 个属于模拟 B 组（`simulated_group = B`），1 个属于模拟 A 组；
  - 总体上 60 个细胞中有 59 个（98.3%）与模拟分组保持一致，但并非完全无缝吻合，存在 1 个边缘过渡细胞被无监督聚类划入 Cluster 1。这一现象在真实单细胞分析中常见于细胞亚型之间的过渡态或异质性表达；
- **UMAP 流形呈现**：两组细胞在二维平面上形成相互独立且内部紧凑的两个点云簇。

---

## 常见错误原因与排查指南

1. **`ImportError: No module named 'leidenalg'`**：
   - *原因*：Scanpy 的 `sc.tl.leiden` 底层依赖 C++ 实现的 `leidenalg` 和 `igraph` 库；
   - *排查*：通过 `pip install python-igraph leidenalg` 补全底层图计算依赖。
2. **植物原生质体解离应激干扰聚类**：
   - *原因*：植物组织需经酶解制备原生质体，热休克蛋白（HSP）与水解酶基因会在离体过程中剧烈应激高表达；
   - *排查*：在执行 PCA 与聚类前，应从高变基因列表中手动屏蔽环境应激特征基因（Stress-related genes）。
3. **UMAP 投影塌陷为一个无结构的圆球**：
   - *原因*：未做高变基因筛选（HVG）或近邻数 `n_neighbors` 设置过大；
   - *排查*：针对植物全转录组提取 2,000 个高变基因（`sc.pp.highly_variable_genes`），并合理设置主成分数（通常取 20~30）。

---

## 原始文档与文献入口

- **Scanpy 方法论文**：[Wolf, Angerer & Theis (2018) Genome Biology, DOI: 10.1186/s13059-017-1382-0](https://doi.org/10.1186/s13059-017-1382-0)
- **Scanpy 官方文档**：[Scanpy Official Tutorials & API](https://scanpy.readthedocs.io/)
- **植物单细胞参考应用**：[水稻根尖单细胞图谱 (Nature Communications 2021)](https://doi.org/10.1038/s41467-021-22352-4)
- **本站关联文献详情**：[Scanpy 奠基论文解读](../../papers/scanpy-paper/)
