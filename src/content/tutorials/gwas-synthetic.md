---
title: 使用模拟基因型和表型理解 GWAS
summary: 用 SciPy 单标记线性回归生成 Manhattan 图和 QQ 图。
method: scipy
tested: verified
status: draft
updatedAt: 2026-11-21
---
## 目标与验证范围
本教程使用模拟基因型和连续表型，解释单标记回归、P 值、多重检验及 Manhattan/QQ 图。2026 年 11 月 21 日已实际运行示例，并对全部 60 个 P 值独立复算。数据不来自真实植物，模型没有群体结构、亲缘或协变量调整；实际植物 GWAS 应结合实验设计使用适当的专业模型。

## 数据与环境
`examples/gwas/gwas_demo.py` 用固定种子 `20261121` 生成 80 个虚构样本和 60 个二倍体标记，基因型值 0、1、2 表示模拟等位基因剂量。表型由第 24 个标记和随机噪声构造，因此该标记是预先设定的模拟信号。数据中没有模拟真实染色体位置、植物物种或复杂遗传结构。

实际运行环境为 Windows、Python 3.13.9、NumPy 2.5.2、SciPy 1.18.1 和 matplotlib 3.11.1；精确版本记录在输出 `run.json`。可在独立 Python 环境安装 NumPy、SciPy 和 matplotlib，再运行：

```bash
python examples/gwas/gwas_demo.py --output results-gwas-demo
```

输出目录必须不存在，脚本不会覆盖已有目录。固定种子使同环境的模拟过程可重复，跨平台与库版本可能影响数值细节。

## 模型与计算
对每个标记分别拟合 $y_i=\beta_0+\beta_1 g_i+\epsilon_i$，其中 $y_i$ 是第 $i$ 个样本的模拟表型，$g_i$ 是该标记的基因型剂量，$\beta_1$ 是估计的每剂量效应。`scipy.stats.linregress` 返回效应及对斜率为零的双侧 t 检验 P 值。[函数文档](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.linregress.html)。

本示例仅进行一元普通最小二乘回归。它不估计亲缘矩阵，不执行 MLM、FarmCPU 或 GAPIT；群体结构与相关样本可能影响真实数据的统计推断。60 个标记的 Bonferroni 阈值为 $0.05/60$，图中展示其 $-\log_{10}$ 值。

## 输出与结果解释
`genotypes.csv` 和 `phenotypes.csv` 为模拟输入；`associations.csv` 包含标记、模拟位置、效应和 P 值；`gwas.png` 包含 Manhattan 图与 QQ 图；`run.json` 记录种子、参数和版本。结果见 `examples/gwas/verified-20261121/`。

本次运行最小 P 值出现在预设的第 24 个标记。由于信号直接用于模拟表型，这只能验证教学计算的连贯性，不能证明对真实植物数据具有相同检出能力。QQ 图使用排序后的期望分位数 $(i+0.5)/60$（$i=0,\ldots,59$）与观察 P 值；解释时区分真实信号、模型失配与抽样误差。

## 独立检查与延伸
`scripts/check-gwas-example.py` 从保存的基因型和表型重新计算相关系数 t 检验，并核对网站交互图使用的 P 值。真实研究需要 QC、协变量与亲缘控制、候选区域和独立实验验证。参考 [SciPy 方法论文](https://doi.org/10.1038/s41592-019-0686-2)及[水稻农艺性状 GWAS](https://doi.org/10.1038/ng.695)。
