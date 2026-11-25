---
title: 使用 WGCNA 分析模拟基因表达网络
summary: 从模拟表达矩阵构建加权网络、计算拓扑重叠、识别共表达模块并导出特征基因与相关热图。
method: wgcna
tested: verified
status: published
updatedAt: 2026-11-25
---

## 目的与验证状态

本教程演示利用加权基因共表达网络分析（WGCNA）对转录组表达数据进行分析的核心标准流程：构建基于软阈值的加权基因邻接网络、计算拓扑重叠矩阵（TOM）、通过层次聚类划分共表达模块（Modules），并提取代表各模块总体表达谱的模块特征基因（Module Eigengenes, MEs）。

**真实验证记录**：2026 年 11 月 21 日已在 Windows 环境使用 R 4.5.1 与 WGCNA 1.74 完整执行，真实运行日志与产物保存在仓库 `examples/coexpression/verified-20261121/`。该数据集为 36 个样本在 60 个基因上的合成教学数据，用于演示算法逻辑与输出解析；植物实际分析需准备方差稳定化（如 DESeq2 VST）的高质量多样本表达矩阵。

---

## 环境与数据来源

### 1. 软件环境配置
WGCNA 可通过 CRAN 与 Bioconductor 安装。推荐在独立目录下建立专用 R 库：
```r
dir.create('R-library', showWarnings = FALSE)
.libPaths(c(normalizePath('R-library'), .libPaths()))
install.packages('BiocManager', repos = 'https://cloud.r-project.org', lib = 'R-library')
BiocManager::install(c('impute', 'preprocessCore', 'WGCNA'),
                     lib = 'R-library', ask = FALSE, update = FALSE)
```

### 2. 输入数据说明
输入数据由脚本 `examples/coexpression/wgcna_demo.R` 生成：
- **数据矩阵**：36 个样本（行）× 60 个基因（列）的连续型表达量矩阵；
- **信号分布**：前 26 个基因与中间 27 个基因分别植入了共享的潜在调控驱动信号，后 7 个基因由高斯背景随机噪声填充；
- **真实基准**：输入原始表达量矩阵保存为 `synthetic_expression.tsv`。

```bash
# 执行 WGCNA 模块识别与热图绘制
Rscript examples/coexpression/wgcna_demo.R results-wgcna-demo
```
*注：输出目录必须不存在，脚本会自动防止覆盖已有目录。*

---

## 运行命令与关键参数含义

脚本在底层调用 WGCNA 一步式网络构建函数 `blockwiseModules`：
```r
net = blockwiseModules(
  datExpr,
  power = 6,
  networkType = "signed",
  minModuleSize = 10,
  mergeCutHeight = 0.25,
  numericLabels = FALSE,
  pamRespectsDendro = FALSE,
  saveTOMs = FALSE,
  verbose = 3
)
```

### 关键参数解析
- `power = 6`：软阈值乘幂（$\beta$）。将相关系数转化为邻接度（$a_{ij} = |cor|^\beta$），强调强相关并压制弱相关；植物分析中通常需通过 `pickSoftThreshold` 挑选使无标度拓扑拟合指数 $R^2 \ge 0.8$ 的最小 $\beta$ 值；
- `networkType = "signed"`：有符号网络模式。区分正相关（协同激活）与负相关（相互抑制）；相比无符号网络，有符号网络能更好保留具有生物学明确方向的共表达特征；
- `minModuleSize = 10`：判定独立共表达模块所允许的最小基因数（正式植物分析通常设为 20~30）；
- `mergeCutHeight = 0.25`：模块特征基因（MEs）距离截断值。相当于模块间相关性 $> 0.75$ 时自动执行合并，避免划分过于破碎。

---

## 输出文件解释与结构规范

执行后在指定输出目录下生成以下标准成果：
1. **`synthetic_expression.tsv`**：
   输入的 36 样本 × 60 基因表达量表格；
2. **`modules.csv`**：
   基因与模块归属映射表，包含基因 ID（`gene`）与分配的颜色标签（`module`）；
3. **`module_eigengenes.csv`**：
   各模块特征基因（ME）在 36 个样本中的表达载荷矩阵，第一主成分代表该模块的全局表达趋势；
4. **`gene_correlations.csv`**：
   60 × 60 全基因相关系数对称矩阵；
5. **`correlation-heatmap.png`**：
   按识别出的共表达模块重新排序后的基因相关系数热图（对角线附近呈现清晰的块状共表达特征）；
6. **`run.txt`**：
   记录软件版本、依赖环境、运行参数与执行时间戳。

---

## 真实结果解读（基于本地实测数据）

对照 `examples/coexpression/verified-20261121/modules.csv` 实际记录：
- 60 个输入基因被 WGCNA 精准划分为 3 个模块：
  - **`blue` 模块**：包含 26 个基因（与预设的第一个信号组完全重合）；
  - **`turquoise` 模块**：包含 27 个基因（与预设的第二个信号组完全重合）；
  - **`grey` 模块**：包含 7 个基因（代表未被分配到任何共表达模块的无关联背景噪声）。
- **相关热图**：`blue` 内部与 `turquoise` 内部平均相关系数均大于 0.8，而模块之间或与 `grey` 基因之间的相关系数接近于 0，证实算法能够稳健恢复潜在的非随机共表达结构。

---

## 常见错误原因与排查指南

1. **所有基因全部被划入 `grey` 模块**：
   - *原因*：样本量过少（建议植物分析至少 15~20 个独立样本）或软阈值 `power` 选得过大导致网络连接完全被切断；
   - *排查*：检查表达矩阵的方差分布，重新运行 `pickSoftThreshold` 寻找合适的软阈值。
2. **输入未做方差稳定的原始 Counts 矩阵**：
   - *原因*：直接输入未经归一化的整数 Counts 会使文库大小极差充当第一主成分，导致虚假的伪共表达模块；
   - *排查*：输入 WGCNA 前务必使用 `DESeq2::vst()` 或 `limma::voom()` 进行方差稳定变换并过滤低表达基因。
3. **直接将共表达等同于直接转录调控**：
   - *原因*：共表达仅代表在观测样本中的协同波动，可能受共同上游转录因子驱动或生理微环境影响；
   - *排查*：需结合启动子 Motif 富集分析（如 MEME/JASPAR）或基因调控网络工具（如 GENIE3/GRNBoost2）进一步验证因果调控。

---

## 原始文档与文献入口

- **WGCNA 方法奠基论文**：[Langfelder & Horvath (2008) BMC Bioinformatics, DOI: 10.1186/1471-2105-9-559](https://doi.org/10.1186/1471-2105-9-559)
- **WGCNA 官方教程主页**：[WGCNA Official Tutorials (UCLA)](https://horvath.genetics.ucla.edu/html/CoexpressionNetwork/Rpackages/WGCNA/Tutorials/)
- **植物共表达实战参考**：[紫米花色苷生物合成共表达分析 (Scientific Reports 2024)](https://doi.org/10.1038/s41598-024-73698-w)
- **本站关联文献详情**：[WGCNA 奠基论文解读](../../papers/wgcna-paper/)
