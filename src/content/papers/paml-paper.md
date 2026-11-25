---
title: "PAML 4: Phylogenetic Analysis by Maximum Likelihood"
summary: "系统奠定基于最大似然法与贝叶斯理论的分子进化统计推断权威框架 PAML 4，深度囊括密码子替换模型 (Codeml: 分支模型、位点模型、分支-位点模型)、正达尔文选择压力检验 (Positive Selection, ω = dN/dS) 以及基于松弛分子钟的系统发育物种分化时间估算 (MCMCTree)。"
authors: "Yang Z"
year: 2007
journal: Molecular Biology and Evolution
doi: 10.1093/molbev/msm088
type: method
methodIds: [paml]
domainIds: [comparative-genomics]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

## 研究背景与算法贡献

在分子演化与比较基因组学中，如何从蛋白质编码核苷酸序列的突变中探测自然选择的痕迹是演化生物学的终极课题之一。经典的分子演化中性理论认为，大多数固定的同义替换（Synonymous, dS）是中性的，而非同义替换（Nonsynonymous, dN）由于改变了编码的氨基酸，其比率 $\omega = d_N / d_S$ 成为量化选择压力的通用尺度：
- $\omega < 1$：纯化选择（Purifying selection），功能受限；
- $\omega = 1$：中性演化（Neutral evolution）；
- $\omega > 1$：正达尔文选择（Positive Darwinian selection），表明存在有益突变的高速适应性固定。

然而，早期由 Nei-Gojobori 等提出的两两序列计数法存在重大理论缺陷：忽略了多重替换的倒退修正、密码子位置的转换与颠换偏差（Transition/Transversion bias, $\kappa$）以及密码子使用偏好（Codon frequency bias）。更为严重的是，在整个蛋白质分子中，往往只有少数几个位于结合口袋或活性中心的氨基酸位点在特定物种谱系中经历了瞬时的正选择，全基因全局平均法会将局部强正选择信号彻底稀释。

由英国伦敦大学学院（UCL）杨子恒（Ziheng Yang）院士独立开发的 **PAML**（Phylogenetic Analysis by Maximum Likelihood，第 4 版代表作发表于 *Molecular Biology and Evolution* 2007），为整个分子演化领域确立了近二十年不可撼动的数学标准与分析底座：
1. **马尔可夫连续时间密码子替换模型（Codon Substitution Models）**：以 $61 \times 61$ 密码子状态转移矩阵为核心，精确参数化了核苷酸变异偏好、密码子平衡频率与氨基酸理化选择；
2. **多层级似然比检验（Likelihood Ratio Tests, LRT）架构**：首创位点模型（Site Models，允许不同氨基酸位点拥有不同的 $\omega$）、分支模型（Branch Models，允许演化树不同分支拥有不同的 $\omega$）以及最为严苛的分支-位点模型（Branch-site Models，精准捕获特定谱系上特定位点的正选择）；
3. **MCMCTree 贝叶斯松弛分子钟定年系统**：结合化石软边界先验与马尔可夫链蒙特卡罗（MCMC）采样，成为国际生命之树分化定年的事实金标准。

---

## 核心数学模型与数据结构

PAML 4 的核心组件 `codeml` 与 `mcmctree` 建立在严密的概率图模型之上：

```
                 编码蛋白质的密码子多重比对 (CDS Alignment)
                                    │
                                    ▼
         [构建 61×61 连续时间密码子即时转移速率矩阵 Q]
• 矩阵元 q_ij: 参数化平衡频率 π_j、转换/颠换比 κ 与选择压 ω
                                    │
                                    ▼
       ┌────────────────────────────┴────────────────────────────┐
       ▼                                                         ▼
[假设检验模式 1: 位点模型 (Site Models)]      [假设检验模式 2: 分支-位点模型 (Branch-Site)]
• 零假设 M1a (中性) vs 备择假设 M2a (正选择)    • 前景分支 (Foreground) vs 背景分支 (Background)
• 零假设 M7 (Beta) vs 备择假设 M8 (Beta & ω)    • 检验特定适应性演化分支上受正选择的氨基酸位点
       │                                                         │
       └────────────────────────────┬────────────────────────────┘
                                    │
                                    ▼
         [似然比检验 (LRT): 计算统计量 2Δℓ = 2(ln L1 - ln L0)]
• 自由度 df = 2, 卡方分布 χ² 检验显著性 (p < 0.05)
                                    │
                                    ▼
         [贝叶斯经验贝叶斯 (BEB) 算法定位正选择具体位点]
• 输出每个后验概率 P(ω > 1) > 95% 或 99% 的氨基酸物理位点编号
```

1. **Goldman-Yang (GY94) 密码子转移速率矩阵数学形式**：
   在 $61 \times 61$（去除 3 个终止密码子）的即时状态转移矩阵 $Q = (q_{ij})$ 中，从密码子 $i$ 突变至密码子 $j$ 的速率定义为：
   $$q_{ij} = \begin{cases}
   0 & \text{若 } i \text{ 与 } j \text{ 相差超过 1 个核苷酸} \\
   \pi_j & \text{同义颠换} \\
   \kappa \pi_j & \text{同义转换} \\
   \omega \pi_j & \text{非同义颠换} \\
   \omega \kappa \pi_j & \text{非同义转换}
   \end{cases}$$
   其中对角元 $q_{ii} = -\sum_{j \ne i} q_{ij}$。这一优雅的矩阵同时容纳了核苷酸替代偏好（$\kappa$）、背景序列组成（$\pi_j$）与达尔文选择系数（$\omega$）；
2. **分支-位点模型（Branch-Site Model A）四元状态划分**：
   将目标适应性物种分支设定为前景分支（Foreground），其余系统发育分支设定为背景分支（Background）。模型定义 4 类位点模式：
   - 位点类别 0：全树保守纯化选择（$0 < \omega_0 < 1$）；
   - 位点类别 1：全树中性演化（$\omega_1 = 1$）；
   - 位点类别 2a：背景分支受纯化选择，但在前景分支发生正选择（$\omega_2 > 1$）；
   - 位点类别 2b：背景分支受中性演化，但在前景分支发生正选择（$\omega_2 > 1$）。
   通过固定零假设中前景分支 $\omega_2 = 1$，构建具有 1 个自由度的严格混合卡方分布检验；
3. **贝叶斯经验贝叶斯（Bayes Empirical Bayes, BEB）定位算法**：
   在替代模型通过卡方检验后，BEB 算法整合了模型参数的不确定性，计算每个比对位点落入正选择类别（$\omega > 1$）的后验概率：
   $$P(\text{Site } k \in \text{Class } 2 | D) = \int \frac{P(D_k | \theta, \omega > 1) P(\theta | D)}{\sum_c P(D_k | \theta, \omega_c)} d\theta$$
   后验概率超过 95% 的位点被作为高置信正选择功能候选。

---

## 植物基因组学应用场景与科研价值

1. **植物抗病抗逆基因（如 NBS-LRR、RLKs）的达尔文正选择扫描**：
   植物与病原菌长期处于激烈的“军备竞赛”。利用 PAML `codeml` 的分支-位点模型，研究人员能够以单氨基酸精度鉴定出富含亮氨酸重复区（LRR）表面直接与真菌效应蛋白物理接触的关键正选择位点；
2. **植物驯化与人工选择靶基因功能鉴定**：
   在栽培作物与野生祖先的比较中，将驯化种系标记为前景分支，可筛选在农业起源过程中被先民强烈选择的转录调控关键结构域；
3. **MCMCTree 测定植物全基因组古多倍化与分化年代**：
   在获得全套单拷贝直系同源矩阵后，结合古生物化石地质年龄（如被子植物早期化石），MCMCTree 能够给出极高置信度的贝叶斯后验演化时间轴。

---

## 阅读与复现资源

- **论文全文**：[Molecular Biology and Evolution, 24(8), 1586–1591 (2007)](https://doi.org/10.1093/molbev/msm088)
- **PubMed 记录**：[PMID: 17483113](https://pubmed.ncbi.nlm.nih.gov/17483113/)
- **官方开源代码仓库**：[GitHub - abacus-gene/paml](https://github.com/abacus-gene/paml)
- **相关算法工具详情**：[PAML 算法原理与指南](../../methods/paml/)
