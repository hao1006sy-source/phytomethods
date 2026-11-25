---
title: 使用模拟基因型和表型理解 GWAS
summary: 用 SciPy 单标记线性回归生成 Manhattan 图和 QQ 图。
method: scipy
tested: verified
status: published
updatedAt: 2026-11-25
---

## 目的与验证状态

本教程演示利用普通最小二乘法（OLS）对全基因组标记进行单标记关联分析（Single-marker GWAS）的数学原理，并计算统计显著性 $P$ 值、多重假设检验校正（Bonferroni 阈值）以及绘制曼哈顿图（Manhattan Plot）与分位数-分位数图（QQ Plot）。

**真实验证记录**：2026 年 11 月 21 日已在 Windows 环境使用 Python 3.13.9、NumPy 2.5.2、SciPy 1.18.1 与 Matplotlib 3.11.1 完整运行，真实运行日志与产物保存在仓库 `examples/gwas/verified-20261121/`。该数据集为 80 个样本在 60 个标记上的合成教学数据，用于演示回归模型与统计图绘制；真实植物 GWAS 必须考虑群体结构（Q 矩阵）与亲缘关系（K 矩阵）控制。

---

## 环境与数据来源

### 1. 软件环境配置
- 运行依赖：Python 3、NumPy、SciPy 与 Matplotlib；
- 建议在独立虚拟环境中安装：`pip install numpy scipy matplotlib`。

### 2. 输入数据说明
输入数据由脚本 `examples/gwas/gwas_demo.py` 生成（随机种子 `20261121`）：
- **`genotypes.csv`**：80 个样本在 60 个双等位基因位点上的等位基因剂量矩阵（取值为 0、1 或 2）；
- **`phenotypes.csv`**：80 个个体的连续型表型观测值。表型值由第 24 号标记赋予真实加性效应，并叠加独立的高斯随机噪声构造而成。

```bash
# 执行单标记关联分析与绘图
python examples/gwas/gwas_demo.py --output results-gwas-demo
```
*注：输出目录必须不存在，脚本会自动防止覆盖已有目录。*

---

## 运行命令与关键数学模型

脚本对每个标记分别拟合一元普通最小二乘线性模型：
$$y_i = \beta_0 + \beta_1 g_i + \epsilon_i, \qquad \epsilon_i \sim \mathcal{N}(0, \sigma^2)$$

底层调用 `scipy.stats.linregress` 执行拟合：
```python
from scipy import stats

# 对每个标记进行一元线性回归并提取双侧 t 检验 p 值
slope, intercept, r_value, p_value, std_err = stats.linregress(genotype_col, phenotype_col)
```

### 关键参数与统计概念解析
- `slope` ($\beta_1$)：等位基因效应量估计（每增加一个突变等位基因对表型的平均边际贡献）；
- `p_value`：原假设 $H_0: \beta_1 = 0$（位点与表型无关联）的双侧 $t$ 检验统计显著性；
- `Bonferroni 阈值`：全基因组多重假设检验校正，设定显著性水平 $\alpha = 0.05 / M$（其中 $M=60$ 为测试标记数，阈值为 $P = 8.33 \times 10^{-4}$，对应 $-\log_{10}(P) \approx 3.08$）。

---

## 输出文件解释与结构规范

执行后在指定输出目录下生成以下标准成果：
1. **`genotypes.csv`** 与 **`phenotypes.csv`**：
   输入的模拟基因型与表型表格；
2. **`associations.csv`**：
   关联分析结果大表，包含各标记 ID（`snp_id`）、染色体物理位置、效应量估计值（`beta`）、标准误（`se`）与双侧检验 $P$ 值（`p_value`）；
3. **`gwas.png`**：
   曼哈顿图（横轴为标记物理位置，纵轴为 $-\log_{10}(P)$，虚线标出显著性阈值）与 QQ 图（观察 $P$ 值的 $-\log_{10}$ 分布对照均匀分布理论分位数）；
4. **`run.json`**：
   记录随机种子、依赖库版本与最显著位点检出记录。

---

## 真实结果解读（基于本地实测数据）

对照 `examples/gwas/verified-20261121/run.json` 与 `associations.csv` 实测记录：
- 在测试的全部 60 个标记中，**第 24 号标记（SNP_24）**表现出极强的统计显著性，其实测效应值 $\beta = 1.381$，显著性 $P = 4.22 \times 10^{-10}$（对应 `smallest_p = 4.2169e-10`），远超 Bonferroni 显著性校正阈值（$\alpha = 8.33 \times 10^{-4}$）；
- 其余 59 个背景中性标记的 $P$ 值均匀分布在 $0.029 \sim 1.0$ 之间；
- **QQ 图呈现**：大部分中性点严格落在对角线理论线上，仅第 24 号标记在右上方显著脱离理论虚线向上突起，证实模型能够灵敏定位因果变异信号。
- 运行配套核验脚本 `python scripts/check-gwas-example.py` 重新计算各标记关联值，数据 100% 准确复现。

---

## 常见错误原因与排查指南

1. **QQ 图发生整体系统性向上偏离（Inflation，膨胀因子 $\lambda > 1.1$）**：
   - *原因*：群体内部存在深层亚种分化（如水稻籼粳分化）或近交亲缘关系，导致全基因组位点发生虚假关联；
   - *排查*：单标记 OLS 模型无法处理群体结构。必须切换至混合线性模型（如 GAPIT 的 MLM、FarmCPU 或 GEMMA），将 PCA 特征向量作为固定效应、Kinship 亲缘矩阵作为随机效应纳入模型。
2. **QQ 图整体向下偏折（Deflation，$\lambda < 0.9$）**：
   - *原因*：协变量过度校正（Over-correction）或者低频稀有变异（MAF $< 0.01$）未被剔除；
   - *排查*：预先过滤小等位基因频率，合理控制主成分数量。
3. **曼哈顿图出现孤立单点显著（无连锁不平衡支持）**：
   - *原因*：测序基因型分型错误或局部缺失率过高引起的统计假象；
   - *排查*：检查显著位点周围的连锁不平衡（LD）热图，真实 QTL 信号必然伴随两侧连锁位点的阶梯状衰减。

---

## 原始文档与文献入口

- **SciPy 统计模块文档**：[scipy.stats.linregress Documentation](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.linregress.html)
- **SciPy 方法论文**：[Virtanen et al. (2020) Nature Methods, DOI: 10.1038/s41592-019-0686-2](https://doi.org/10.1038/s41592-019-0686-2)
- **植物经典 GWAS 应用参考**：[水稻复杂农艺性状全基因组关联分析 (Nature Genetics 2010)](https://doi.org/10.1038/ng.695)
- **本站关联文献详情**：[GWAS-MLM 混合线性模型论文解读](../../papers/gwas-mlm-paper/)
