# Scanpy 模拟单细胞示例

`scanpy_demo.py` 生成虚构 Poisson 计数，执行质控、归一化、PCA、近邻图、Leiden 聚类和 UMAP；模拟组不是植物细胞类型。

在安装 Scanpy 1.13.0、igraph、Leiden 和 matplotlib 的 Python 环境中，运行：

```bash
python examples/single-cell/scanpy_demo.py --output results-scanpy-demo
```

输出目录必须不存在。`verified-20261121/` 为 2026-11-21 Windows Python 3.13.9 的真实运行结果，依赖版本及参数见 `run.json`。另在相同环境独立运行一次，输入、质控、聚类与坐标 CSV 和摘要相同；跨平台与依赖版本变化可能影响结果。完整说明见网站教程草稿 `src/content/tutorials/scanpy-synthetic.md`。
