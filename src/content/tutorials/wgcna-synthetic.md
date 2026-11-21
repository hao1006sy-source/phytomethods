---
title: 使用 WGCNA 分析模拟基因表达网络
summary: 从模拟表达矩阵构建加权网络、识别模块并查看相关热图。
method: wgcna
tested: verified
status: published
updatedAt: 2026-11-22
---
## 目标与验证范围
本教程使用虚构表达矩阵练习 WGCNA 模块识别与结果检查。2026 年 11 月 21 日在 Windows、R 4.5.1、WGCNA 1.74 环境实际运行两次，表达矩阵、模块、模块特征基因和相关系数表一致。数据不是植物实验，模拟模块不是已验证的生物学通路。

## 输入与运行环境
示例 `examples/coexpression/wgcna_demo.R` 根据固定种子生成 36 个虚构样本和 60 个虚构基因的连续表达值；前两组基因分别共享人为设置的潜在信号，其余基因以随机噪声为主。它不是 RNA-seq 原始计数矩阵，也不包含真实表型。由于信号被预先构造，模块分离结果只说明这个教学流程能够运行。

WGCNA 可从 [CRAN](https://cran.r-project.org/package=WGCNA) 获取，部分依赖来自 Bioconductor。下面是在 R 中建立独立库的示例；根据 R 和 Bioconductor 版本查阅各自安装文档：

```r
dir.create('R-library', showWarnings = FALSE)
.libPaths(c(normalizePath('R-library'), .libPaths()))
install.packages('BiocManager', repos = 'https://cloud.r-project.org', lib = 'R-library')
BiocManager::install(c('impute', 'preprocessCore', 'WGCNA'),
                     lib = 'R-library', ask = FALSE, update = FALSE)
```

运行时需让 R 找到该库，例如设置 `R_LIBS_USER` 后执行：

```bash
Rscript examples/coexpression/wgcna_demo.R results-wgcna-demo
```

输出目录必须不存在，脚本拒绝覆盖。实际环境中部分二进制包提示使用较新的 R 4.5.x 编译；程序两次运行成功，详细环境见 `examples/coexpression/verified-20261121/run.txt`。

## 分析步骤
示例使用样本 × 基因矩阵，执行 `blockwiseModules`，设定有符号网络（`networkType='signed'`）、软阈值 6、最小模块大小 10、合并阈值 0.25、单线程和固定随机种子。WGCNA 根据表达相关性建立权重，再结合拓扑重叠和聚类得到模块，并计算模块特征基因。这里的参数仅用于小型教学数据，并不构成真实植物研究的默认选择。

输出 `synthetic_expression.tsv`、`modules.csv`、`module_eigengenes.csv`、`gene_correlations.csv`、`correlation-heatmap.png` 和 `run.txt`。热图显示按模块排序的 Pearson 相关系数，不是拓扑重叠矩阵，也不是直接的调控方向图。

## 结果解释
本次运行的模块标签为 blue 26 个基因、turquoise 27 个基因、grey 7 个基因；grey 在 WGCNA 中表示未分配到其他模块的基因集合。模块名称和颜色是程序标签，不对应固定的生物学功能。表达相关可能来自共同调控、组织组成或处理等因素，不能单凭模块关系推断直接作用。

真实植物数据需有适当数量和独立性的样本、记录预处理与批次，并检查低表达基因、异常值、模块稳定性及性状关联的多重检验。可进一步使用功能注释和独立实验检验候选基因。[紫米共表达研究](https://doi.org/10.1038/s41598-024-73698-w)为真实应用案例，并非本次运行数据。

## 常见问题与资料
包无法载入时检查 R 版本、`.libPaths()`、Bioconductor 依赖和安装日志；输出只有灰色基因时检查样本数、表达变异和模块参数；网络结果受预处理及参数影响，需比较稳定性。参考 [WGCNA 方法论文](https://doi.org/10.1186/1471-2105-9-559)与[官方包文档](https://cran.r-project.org/package=WGCNA)。
