---
title: ADMIXTURE
name: ADMIXTURE
summary: 在给定成分数 K 下，以最大似然估计个体祖先成分比例与成分等位基因频率。
dataType: 多位点双等位 SNP 基因型
principle: 最大似然祖先成分模型
domainIds: [population-genetics]
topicIds: [m05-topic-01, m05-topic-03, m05-topic-07]
principleIds: [ancestry-model]
dataIds: [variant-data]
paper: admixture-paper
repository: https://dalexander.github.io/admixture/
status: draft
updatedAt: 2026-11-21
---
## 一句话简介与开发背景

ADMIXTURE 是 Alexander、Novembre 和 Lange 提出的模型化祖先成分估计程序，面向大规模、多位点 SNP 基因型数据，适用于样本相互独立或已按研究设计处理相关性的群体。它沿用 STRUCTURE 的祖先成分概率模型，以最大似然而非贝叶斯后验抽样估计参数，并使用受约束数值优化加速计算。[方法论文](https://doi.org/10.1101/gr.094052.109)；[官方项目页](https://dalexander.github.io/admixture/)。

官方发布页在本次核查时列出当前版本 **1.4.0**。官方更新记录将 2026 年 4 月 26 日的 1.4.0 描述为性能更新，约有两倍速度提升，并称没有用户可见的行为变化；这与 2015 年发布的 1.3.0 及 2026 年 1 月的 1.3.1 兼容性重建版本区分。[官方下载与手册](https://dalexander.github.io/admixture/download.html)；[官方版本记录](https://dalexander.github.io/admixture/news.html)。

## 解决的问题与模型

令 $g_{ij}\in\{0,1,2\}$ 表示个体 $i$ 在位点 $j$ 上携带的指定等位基因拷贝数，$q_{ik}$ 为个体 $i$ 来自模型成分 $k$ 的比例，$p_{kj}$ 为成分 $k$ 在位点 $j$ 的该等位基因频率。约束为 $q_{ik}\geq 0$、$\sum_{k=1}^{K}q_{ik}=1$、$0\leq p_{kj}\leq 1$。模型中的混合等位基因频率为：

$$
\theta_{ij}=\sum_{k=1}^{K}q_{ik}p_{kj}.
$$

对标准二倍体基因型，条件于参数的基因型似然可写为二项分布形式，其对数似然忽略与参数无关的组合常数后为：

$$
\ell(Q,P)\propto\sum_i\sum_j\left[g_{ij}\log(\theta_{ij})+(2-g_{ij})\log(1-\theta_{ij})\right].
$$

这一模型把每个位点的基因型概率表示为祖先成分比例与成分等位基因频率的组合。$Q$ 矩阵给出每个样本在指定 $K$ 下的模型比例，$P$ 矩阵给出各成分在各位点的频率。它们是给定样本、标记集、$K$ 和模型假设下的参数估计；颜色块不是直接观测的历史族群，也不单独确定混合时间、方向或人口史。[原始论文](https://doi.org/10.1101/gr.094052.109)。

原始模型以相互独立个体的二倍体常染色体 SNP 为主要设定，并以标记间连锁平衡作为近似。植物自交材料、近缘品系、混合倍性和多倍体基因型可能改变独立性、基因型概率或等位基因剂量假设。ADMIXTURE 的 `--haploid` 用于按指定染色体/样本声明单倍体输入；这不构成通用多倍体剂量模型。倍性和材料亲缘关系应在转换数据前确认。[官方手册](https://dalexander.github.io/admixture/admixture-manual.pdf)。

## 核心算法流程

1. 从过滤后的 SNP 基因型和给定的 $K$ 建立参数 $Q$ 与 $P$，检查输入位点顺序、样本顺序和必要的伴随文件。
2. 先进行若干 EM 初始化迭代，使参数进入较优区域。
3. 固定 $P$ 更新 $Q$，再固定 $Q$ 更新 $P$。每个个体的 $Q$ 行和每个位点的 $P$ 列可分块优化。
4. 每个参数块使用满足边界及和为 1 等约束的序列二次规划（sequential quadratic programming，SQP）更新；随后以准牛顿（quasi-Newton）加速块迭代收敛。
5. 输出达到停止条件的最大似然参数估计；可通过交叉验证评估不同 $K$ 的预测误差，并用独立重复运行检查多峰目标函数下的稳定性。

ADMIXTURE 对每个参数块的条件目标进行优化，而非对联合参数一次性做无约束更新。它与 STRUCTURE 的区别在于优化目标和计算策略：STRUCTURE 通过马尔可夫链蒙特卡洛（Markov chain Monte Carlo，MCMC）抽样后验，ADMIXTURE 以最大似然点估计为主；两者的输出解释均依赖模型设定。[Alexander 等，2009](https://doi.org/10.1101/gr.094052.109)；[ADMIXTURE 算法增强论文](https://doi.org/10.1186/1471-2105-12-246)。

2011 年的后续论文报告了交叉验证、监督估计（supervised estimation）、惩罚估计（penalized estimation）和多处理器扩展。监督模式使用 `.ind` 文件指定已知群体个体；它要求参考个体标签可靠、参考群体具有代表性，适用于具有明确定义参考群体的问题。惩罚估计通过目标函数惩罚过小的成分比例，降低特定位点数或近缘群体数据中的过拟合风险；惩罚强度需依据数据调节。[后续方法论文详情](../../papers/admixture-enhancements/)。

交叉验证（cross-validation，CV）会留出部分基因型观测并评价预测误差。官方手册默认采用五折 CV，可用 `--cv=10` 指定十折；它比较的是模型预测表现，不是 STRUCTURE 式边际模型证据，也不能把误差最小的 $K$ 直接解释为历史上真实存在的群体数。[官方手册：选择 K](https://dalexander.github.io/admixture/admixture-manual.pdf)。

## 输入、输出和主要参数

| 项目 | 说明 |
| --- | --- |
| PLINK 二进制输入 | `.bed` 主文件及同目录 `.bim`、`.fam` 伴随文件 |
| PLINK 文本输入 | `.ped` 与 `.map` |
| EIGENSTRAT 输入 | `.geno` 与对应 `.map` |
| 监督学习标签 | 与样本顺序对应的 `.ind` 文件，配合 `--supervised` 使用 |
| `.K.Q` 输出 | 每行对应输入样本，每列为一个模型成分比例；同一行比例和为 1 |
| `.K.P` 输出 | 各模型成分在输入 SNP 上的估计等位基因频率 |
| `.K.Q_se` 输出 | 使用 `-B` 进行区块自助法后得到的祖先比例标准误 |
| 交叉验证输出 | 运行日志报告不同 $K$ 的 CV 误差及其误差估计 |

官方手册列出的常用命令如下。命令输入输出以同一份 `.bim/.fam` 所描述的位点和样本顺序为准。

```bash
# 在指定 K 下进行默认五折交叉验证
admixture --cv filtered.bed 3

# 使用十折交叉验证；可对多个 K 依次运行
admixture --cv=10 filtered.bed 3

# 使用 4 个线程
admixture filtered.bed 3 -j4

# 估计点值并通过区块自助法计算标准误
admixture -B filtered.bed 3
```

`K` 是预设成分数。`--cv` 或 `--cv=N` 运行指定折数的交叉验证；`-jN` 设置线程数；`-B` 开启计算开销更高的标准误估计；`--supervised` 使用 `.ind` 中的参考群体标签。`-P` 可使用已估计的 `.P` 等位基因频率对一组具有相同 SNP 集合的样本投影；这类投影依赖参考与目标数据的位点对应和编码一致。各版本完整选项以[官方手册](https://dalexander.github.io/admixture/admixture-manual.pdf)为准。

## 实际分析流程与结果解释

1. 由变异调用结果生成一致编码的二倍体 SNP 矩阵，并同步保存样本表、位点表、等位基因定义、染色体命名和过滤记录。
2. 使用 PLINK 等工具进行个体/位点缺失、等位基因频率及亲缘关系检查；根据研究问题对强连锁标记进行稀释或剪枝。LD 剪枝不能消除所有连锁，也不是对所有植物群体都相同的固定阈值。
3. 在多个有研究依据的 $K$ 上运行 CV，并在每个 $K$ 下进行独立重复；记录版本、种子、样本和位点数、停止状态、CV 误差和运行日志。
4. 对齐不同重复运行中可能发生置换的成分标签，再结合 PCA、地理来源、育种系谱、环境和独立生物学证据解释。单个柱状图不足以辨认真实祖先群体。
5. 若结构估计用于关联分析，将其作为协变量或与亲缘关系矩阵等模型共同评估，并比较校正前后的 QQ 图和统计量；结构柱状图本身不是因果证据。

ADMIXTURE 主要输出模型化祖先成分参数；PLINK 更适合基因型格式转换、QC、LD 剪枝和 PCA 等外围任务。PCA 给出连续低维轴，ADMIXTURE 在指定 $K$ 下给出约束为非负且行和为 1 的比例矩阵，两种摘要不可互换。

## 植物研究案例

Wang 等对 3,010 份亚洲栽培稻材料进行群体变异研究，使用 PLINK 处理 SNP/LD 步骤，针对候选 $K$ 重复拟合 ADMIXTURE，并以 $K=9$ 描述该研究样本的群体结构；重复得到的 $Q$ 矩阵由 CLUMPP 对齐。这里的九个模型成分只描述论文采样集合与参数设定下的结果，不是对全部稻种群体的固定分类。[原始水稻研究](https://doi.org/10.1038/s41586-018-0063-9)；[PubMed](https://pubmed.ncbi.nlm.nih.gov/29695866/)。

Lian 等对拟南芥群体材料的研究将 72 份材料用于群体 SNP 分析，使用 PLINK 与 ADMIXTURE 描述群体结构；其中 3 份高杂合材料随后从组装分析集合中排除，69 份材料进入组装与泛基因组部分。此处的 72 与 69 是不同分析步骤的样本范围。[拟南芥原始研究](https://doi.org/10.1038/s41588-024-01715-9)。

## 版本、许可与可复核来源

- **版本快照：**官方发布页于本轮核查时标为 1.4.0；官方新闻记载 2026-04-26 发布，属于性能更新。
- **软件分发：**2011 年算法增强论文及 2016 年软件使用论文的资源可用性记录均注明二进制可获取、源代码为 proprietary；该论文记录没有列出非学术使用限制。官方当前下载页提供 Linux x86/x86_64 二进制和手册，未提供标准 SPDX 开源许可文件。[2016 年软件说明](https://pmc.ncbi.nlm.nih.gov/articles/PMC4877806/)。
- **本机运行：**本项目尚未在真实水稻或拟南芥基因型数据上运行 ADMIXTURE；本页的流程和命令依据官方手册核对，不标记为教程实跑。
- **关联资源：**[原始方法论文记录](../../papers/admixture-paper/)、[算法增强论文记录](../../papers/admixture-enhancements/)、[官方主页](https://dalexander.github.io/admixture/)、[下载与手册](https://dalexander.github.io/admixture/download.html)、[版本记录](https://dalexander.github.io/admixture/news.html)、[群体遗传学基本概念](../../topics/population-genetics/m05-topic-01/)、[M05-03 群体结构专题](../../topics/population-genetics/m05-topic-03/)、[PLINK 工具](../plink/)。
