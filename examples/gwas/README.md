# 模拟 GWAS 教学示例

运行 `python examples/gwas/gwas_demo.py --output results-gwas-demo`，需要 NumPy、SciPy 和 matplotlib；输出目录必须不存在。示例生成 80 个虚构样本、60 个虚构标记和由第 24 个标记构造的表型，执行无协变量单标记回归。数据不是植物实验数据，也不模拟群体结构。

`verified-20261121/` 保存实际运行的输入、关联结果、图和版本。`python scripts/check-gwas-example.py` 从输入独立复算 60 个 P 值，并与网站交互图数据比较。相关教程为 `src/content/tutorials/gwas-synthetic.md`。
