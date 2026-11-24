---
title: PAML
name: PAML
summary: 包含 codeml 密码子达尔文正选择检验与 MCMCTree 贝叶斯松弛分子钟定年的分子演化分析套件。
dataType: 编码序列比对 / 系统发育树
principle: 极大似然密码子演化模型（GY94）与 MCMC 贝叶斯松弛分子钟
domainIds: [comparative-genomics]
topicIds: [m04-topic-05, m04-topic-07]
principleIds: [phylogenetics]
dataIds: [coding-sequences]
paper: paml-paper
repository: https://github.com/abacus-gene/paml
status: published
updatedAt: 2026-11-25
---

## 生物学问题与定位

PAML（Phylogenetic Analysis by Maximum Likelihood）由伦敦大学学院（UCL）Ziheng Yang（杨子恒）院士领衔开发，是全球分子演化、比较基因组学与系统发生生物学领域**历史最悠久、理论体系最完备的标志性基石软件套件**。其核心算法体系发表于 *Molecular Biology and Evolution*（1997, 2007）及专著 *Molecular Evolution: A Statistical Approach*。

PAML 针对植物比较基因组学的两大核心演化问题提供了专用程序：
1. **`codeml`**：基于 Goldman-Yang 密码子替换模型，估算非同义/同义替换比（$\omega = d_N/d_S$），通过位点模型（Site models）与分支-位点模型（Branch-site models）检测蛋白质在适应性演化中受到的达尔文正选择，并通过贝叶斯经验贝叶斯（BEB）高精度定位关键功能氨基酸位点；
2. **`mcmctree`**：结合松弛分子钟模型（Relaxed molecular clocks）、古生物地质化石软边界先验与马尔可夫链蒙特卡洛（MCMC）抽样，估算全基因组物种谱系与古代多倍化事件的绝对地质分化年代。

---

## 核心算法数学原理与推导

### 1. `codeml` 密码子演化模型与似然比检验（LRT）

从有义密码子 $i$ 跃迁到 $j$ 的瞬时转移矩阵 $Q$ 遵循 Goldman-Yang 经典形式：

$$q_{ij} = \begin{cases} 0 & \text{突变碱基数 } \ge 2 \\ \pi_j & \text{单碱基同义颠换} \\ \kappa \pi_j & \text{单碱基同义转换} \\ \omega \pi_j & \text{单碱基非同义颠换} \\ \omega \kappa \pi_j & \text{单碱基非同义转换} \end{cases}$$

- **位点模型检验（Site Models）**：
  - 比较 M1a（近中性：$\omega_0 < 1, \omega_1 = 1$）与 M2a（正选择：增加 $\omega_2 > 1$）；
  - 比较 M7（Beta 连续分布 $\omega \in [0, 1]$）与 M8（增加离散正选择类别 $\omega_s > 1$）；
  - 统计量 $\Delta = 2(\ln L_1 - \ln L_0) \sim \chi^2(df=2)$。
- **分支-位点模型 A（Branch-Site Model A）**：
  - 前景分支上的位点允许转变为 $\omega_2 > 1$；
  - 零模型强制约束前景分支 $\omega_2 = 1$；统计量采用临界值 $\chi^2(df=1)$ 检验。
- **BEB 位点后验概率**：计算位点 $k$ 属于 $\omega > 1$ 类别的后验概率 $P(\omega > 1 \mid \text{Site}_k) \ge 0.95$。

### 2. `mcmctree` 贝叶斯松弛分子钟与正态近似

联合后验概率 $f(\mathbf{t}, \mathbf{r}, \boldsymbol{\theta} \mid D) \propto P(D \mid \mathbf{t}, \mathbf{r}, \boldsymbol{\theta}) \times f(\mathbf{r} \mid \mathbf{t}) \times f(\mathbf{t})$。
- **独立速率时钟（IR）**：分支速率服从对数正态分布 $\ln r_i \sim \mathcal{N}(\mu, \sigma^2)$；
- **自回归时钟（AR）**：速率沿树分支遵循几何布朗运动扩散；
- **泰勒展开正态近似加速（BASEML Approximation）**：
  $$\ln L(\mathbf{b}) \approx \ln L(\hat{\mathbf{b}}) - \frac{1}{2} (\mathbf{b} - \hat{\mathbf{b}})^T \mathbf{H} (\mathbf{b} - \hat{\mathbf{b}})$$
  通过预先计算的海森矩阵 $\mathbf{H}$，使 MCMC 采样摆脱每次遍历海量比对序列的算力瓶颈。

---

## 生产环境实操指南与控制文件解析

### 1. `codeml` 正选择位点模型控制文件（`codeml.ctl`）

```text
seqfile = aligned_cds.phylip   * 密码子多重比对文件
treefile = species_tree.nwk    * 无根或有根树拓扑
outfile = codeml_site_m2a.out  * 输出报告文件

noisy = 2                      * 输出信息量
verbose = 1                    * 详细输出
runmode = 0                    * 给定树拓扑计算

seqtype = 1                    * 1 代表密码子序列
CodonFreq = 2                  * 2: F3X4 模型 (各密码子位点碱基频率加权)
clock = 0                      * 0: 无分子钟限制
aaDist = 0                     * 等距氨基酸替换
model = 0                      * 0: 全树所有分支共享同一位点分布

NSsites = 2                    * 0: M0; 1: M1a; 2: M2a; 7: M7; 8: M8
icode = 0                      * 0: 标准通用遗传密码表
fix_kappa = 0                  * 自由估计转换/颠换比 kappa
kappa = 2                      * 初始 kappa 值
fix_omega = 0                  * 自由估计 omega
omega = 1.5                    * 初始 omega 值 (建议分别以 0.5 与 2.0 运行检验收敛)

cleandata = 0                  * 0: 保留含空位列并根据物种对计算; 1: 全局删除含空位列
```

运行命令：
```bash
codeml codeml.ctl
```

---

### 2. `mcmctree` 贝叶斯定年两步法实操流程

#### 第一步：生成梯度与海森矩阵（BASEML）
配置 `mcmctree.ctl` 中 `usedata = 1`，运行后生成 `out.BV` 文件：
```bash
mcmctree mcmctree.ctl
```

#### 第二步：加载海森矩阵进行快速 MCMC 采样
将控制文件修改为 `usedata = 2`（加载 `in.BV`），设置采样参数并运行：
```text
usedata = 2                    * 2: 加载 in.BV 采用正态近似快速抽样
clock = 2                      * 2: 独立对数正态松弛分子钟 (Independent Rates)
RootAge = '<1.5'               * 根节点先验最大年龄 (150 Ma)

burnin = 50000                 * 预热丢弃抽样步数
sampfreq = 50                  * 抽样间隔步数
nsample = 20000                * 最终保留的有效样本量总数 (20000 步)
```

运行两条独立链并检查结果收敛性：
```bash
mcmctree mcmctree_chain1.ctl
mcmctree mcmctree_chain2.ctl
```

---

## 植物应用案例与真实文献证据

1. **拟南芥硫代葡萄糖苷 MAM 基因簇复制后的正选择**：
   在拟南芥及其近缘种次生代谢合成关键酶 MAM（甲硫氨酸链延长酶）家族研究中，作者利用 `codeml` 的分支-位点模型（Branch-site model A），发现在基因发生串联复制产生 *MAM1* 与 *MAM2* 后的特定分支上经历了显著的正选择（$\Delta = 11.4, p < 0.001$），并利用 BEB 后验概率精确定位了负责底物碳链结合口袋的 3 个关键氨基酸突变，完美解释了生化催化活性的分化机制（[Benderoth et al., *PNAS*, 2006](https://doi.org/10.1073/pnas.0601738103)）。
2. **被子植物早期古多倍化（$\zeta$ 与 $\epsilon$ 事件）绝对地质定年**：
   在厘清被子植物起源与远古全基因组加倍时代的研究中，学者整合 35 项可靠植物化石记录作为软边界先验，利用 `mcmctree` 的独立松弛分子钟和正态近似法，对数百个单拷贝核基因超矩阵进行大规模 MCMC 采样，最终将种子植物共同祖先加倍（$\zeta$）精确锁定在晚泥盆世至早石炭世（约 3.2 亿年前），为被子植物随后的繁盛提供了深时演化骨架（[Clark & Donoghue, *Proc. R. Soc. B*, 2017](https://doi.org/10.1098/rspb.2017.0912)）。

---

## 实践排错与质控规范

- **错误 1：`codeml` 报错 `Error in sequence data: Check for stop codons`**
  - *排查原因*：输入的 CDS 序列中包含未处理的提前终止密码子（TAA/TAG/TGA）或未剔除尾部终止子。
  - *解决方案*：使用专用脚本清洗序列，剔除末端终止密码子并过滤内部含终止子的伪基因。
- **错误 2：`mcmctree` 抽样参数的有效样本量（ESS）严重不足（$< 200$）**
  - *排查原因*：MCMC 抽样步长过密导致连续采样点高度自相关，或链陷入局部极值。
  - *解决方案*：增大采样间隔 `sampfreq` 至 50 ~ 100，并延长总采样步数 `nsample` 至 20,000 以上。
- **错误 3：化石先验与数据产生严重冲突**
  - *排查原因*：未先进行 `usedata = 0` 的空先验采样，导致死硬边界与松弛分子钟产生数值震荡。
  - *解决方案*：必须首先执行 `usedata = 0` 检查先验分布形态是否合理。
