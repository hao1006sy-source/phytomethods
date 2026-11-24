---
title: 物种分化时间与分子钟：MCMCTree 贝叶斯定年与化石软边界校准
summary: 从速率-时间不可识别性、松弛分子钟模型、泰勒展开似然近似到化石先验软边界与 MCMC 链收敛诊断，系统解析植物系统发育绝对地质定年数学体系。
domain: comparative-genomics
methods: [paml]
status: published
updatedAt: 2026-11-25
---

## 核心科学问题：速率与时间的不可识别性

系统发育分析构建出的极大似然树，其分支长度（Branch length $b_i$）表示的是沿该演化路径单位位点上累积的平均替代数（Expected substitutions per site）。然而，演化替代量是由**突变演化速率**（Rate $r_i$）与**物理持续时间**（Time $t_i$）两个参数共同决定的复合乘积：

$$b_i = r_i \times t_i$$

在缺乏外部绝对年代锚点时，仅凭多序列比对数据无法将速率与时间解离（Confounding/Identifiability problem）——一个短分支既可能源于极短的演化时间，也可能源于演化速率极慢的长地质时期。在植物界中，一年生草本植物（如拟南芥）与多年生木本植物（如银杏、杨树）的世代时间相差数十倍，导致中性演化速率存在巨大跨度。

为了在植物基因组尺度上建立客观的地质时间尺度（Time tree），必须结合地质古生物化石记录、松弛分子钟模型以及贝叶斯马尔可夫链蒙特卡洛（MCMC）推断框架。

---

## 算法数学推导：MCMCTree 贝叶斯推断框架

PAML 软件包中的核心定年模块 [MCMCTree](../../../methods/paml/) 建立了严谨的联合后验概率分布模型：

### 1. 贝叶斯联合后验概率

设系统发育树拓扑固定为 $\mathcal{T}$，所有内部节点的发散时间向量为 $\mathbf{t}$，各分支的演化速率向量为 $\mathbf{r}$，替换模型其他参数为 $\boldsymbol{\theta}$，输入的多序列比对超矩阵为 $D$。参数的联合后验概率密度遵循贝叶斯定理：

$$f(\mathbf{t}, \mathbf{r}, \boldsymbol{\theta} \mid D) \propto P(D \mid \mathbf{t}, \mathbf{r}, \boldsymbol{\theta}) \times f(\mathbf{r} \mid \mathbf{t}, \boldsymbol{\theta}) \times f(\mathbf{t}) \times f(\boldsymbol{\theta})$$

其中：
- $P(D \mid \mathbf{t}, \mathbf{r}, \boldsymbol{\theta})$ 为序列数据的似然函数；
- $f(\mathbf{t})$ 为分化时间的先验分布，由出生-死亡物种形成过程（Birth-Death Process）与外部化石校准点共同限定；
- $f(\mathbf{r} \mid \mathbf{t}, \boldsymbol{\theta})$ 为分支速率的先验分布，由所选择的分子钟模型控制。

### 2. 松弛分子钟模型（Relaxed Molecular Clocks）

传统的**严格分子钟**（Strict clock, 全树所有分支 $r_i = r_0$）在跨大门类植物中通常被似然比检验严厉拒绝。MCMCTree 实现了两类主流的松弛时钟模型：

- **独立速率模型（Independent Rates, IR / clock = 2）**：假定各分支的演化速率相互独立，服从以父分支为参考的对数正态分布（Log-normal）：
  $$\ln r_i \sim \mathcal{N}(\mu, \sigma^2)$$
- **自回归相关速率模型（Autocorrelated Rates, AR / clock = 3）**：假定亲缘相近的子代分支继承父代的代谢与生长速率，速率对数在时间轴上遵循几何布朗运动（Geometric Brownian motion），分支时间越长，速率扩散方差越大。

### 3. 正态近似法加速（Approximate Likelihood Method）

当超矩阵包含全基因组数百个核基因（位点数超 $10^5$）时，在每一次 MCMC 迭代中直接调用 Felsenstein 剪枝算法计算完全似然极其耗时。MCMCTree 采用了基于泰勒展开的**正态近似法**（Taylor expansion approximation）：

1. **第一步（BASEML 预计算）**：在无分子钟限制下，通过极大似然法估计各个分支的最优分支长度向量 $\hat{\mathbf{b}}$、梯度向量 $\mathbf{g}$ 以及负海森矩阵（Hessian matrix）$\mathbf{H}$：
   $$\mathbf{H} = -\frac{\partial^2 \ln L}{\partial \mathbf{b} \partial \mathbf{b}^T} \bigg|_{\mathbf{b}=\hat{\mathbf{b}}}$$
2. **第二步（MCMC 快速采样）**：在后续分化时间抽样中，对数似然直接由二级泰勒展开近似表达：
   $$\ln L(\mathbf{b}) \approx \ln L(\hat{\mathbf{b}}) - \frac{1}{2} (\mathbf{b} - \hat{\mathbf{b}})^T \mathbf{H} (\mathbf{b} - \hat{\mathbf{b}})$$
   由于海森矩阵已预先固定，每次似然评估仅需进行极快的矩阵-向量相乘，将计算提速数十倍至数百倍，使得基因组级超矩阵采样成为可能。

---

## 植物化石校准点设计与软边界理论

```
化石校准软边界 (Soft Bounds) 概率密度形态：
P(t)
 ^
 |             /--------\
 |            /          \
 |           /            \     长尾衰减 (Exponential tail)
 |          /              \____________________
 +---------+----------------+----------------------> 时间 t (Ma)
         下限 t_L          上限 t_U (软边界容忍 2.5% 突破概率)
```

### 1. 硬边界 vs 软边界（Soft Bounds）
化石仅代表该类群在地质历史中**最早被发现的最小存在年代**（Minimum age），真实的谱系分化必然早于化石年代。
- 传统“硬边界”强制 $P(t < t_L) = 0$，若化石地层鉴定存在微小偏差，会导致全树 MCMC 链陷入死锁或严重高估深部分化。
- MCMCTree 广泛采用**软边界模型**（`B(t_L, t_U, p_L, p_U)`）：允许在下限 $t_L$ 之下和上限 $t_U$ 之上保留极小的溢出概率（默认 $p_L = p_U = 0.025$），赋予模型容错弹性。

### 2. 植物关键节点典型基石化石参考
- **被子植物冠群分化节点**：参考上限约 139 ~ 145 Ma（早白垩世），结合化石记录严格约束单子叶与真双子叶共同祖先；
- **种子植物分化节点**（被子植物与裸子植物）：参考下限约 310 ~ 365 Ma（晚泥盆世至石炭纪祖先种子植物化石 *Elkinsia polymorpha*）；
- **禾本科起源节点**：白垩纪末期植硅体（Phytolith）化石证据。

---

## 实践规范与质控要点

| 分析环节 | 核心标准与参数建议 | 常见陷阱与科学纠正 |
| :--- | :--- | :--- |
| **仅空采样先验检查** | 必须首先设置 `usedata = 0` 运行 MCMC | 忽略空数据检验，未发现化石先验与生灭过程产生冲突导致的年代畸变 |
| **MCMC 独立链收敛** | 运行两条独立链，相关系数 $R^2 > 0.99$ | 仅跑单条链，未能识别因陷入局部极值导致的假收敛 |
| **有效样本量（ESS）** | 关键时间节点参数的 ESS 必须 $> 200$ | 采样间隔（`sampfreq`）设得过小导致链自相关严重，ESS 偏低 |
| **树拓扑文件格式** | 严格使用纯净 Newick 格式，标签与化石语法配对 | 拓扑中残留单系约束语法错误导致程序解析内存溢出 |

---

## 延伸阅读与前置依赖

- **前置依赖**：单拷贝超矩阵最大似然建树（详见 [M04-Topic-04 系统发育推断](../../comparative-genomics/m04-topic-04/)）。
- **核心算法工具**：[PAML / MCMCTree 官方手册与参数配置](../../../methods/paml/)。
- **下游应用专题**：结合定年物种树推断基因家族生灭动力学（详见 [M04-Topic-02 基因家族聚类与扩张](../../comparative-genomics/m04-topic-02/)）。
