---
title: "SweepFinder2: increased sensitivity, robustness and flexibility"
summary: "在经典复合似然比框架上全面纳入局部重组率与背景选择（BGS）先验校准的全基因组选择清除扫描工具 SweepFinder2。"
authors: "DeGiorgio M, Huber CD, Hubisz MJ, Hellmann I, Nielsen R"
year: 2016
journal: Bioinformatics
doi: 10.1093/bioinformatics/btw051
type: method
methodIds: [sweepfinder2]
domainIds: [population-genetics]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

# SweepFinder2: increased sensitivity, robustness and flexibility

## 1. 研究背景与算法贡献

在单群体中检测强正向选择（Hard Selective Sweep）时，因果有利变异的快速固定会导致其物理连锁邻近区域的核苷酸多样性急剧衰减，并在全基因组位点频谱（Site Frequency Spectrum, SFS）上留下显著的特征性扰动：即近端中等频率变异大量丢失，而极低频衍生突变与极高频衍生突变（接近固定）异常富集。Nielsen 等在 2005 年提出的 **SweepFinder** 算法，利用复合似然比检验（Composite Likelihood Ratio, CLR）直接从等位基因频率谱中寻找与搭车模型相吻合的空间信号，成为该领域的经典基石。

然而，初代 SweepFinder 存在显著的方法学局限：
1. **忽略全基因组局部重组率的剧烈波动**：假设全染色体重组均匀，在低重组率区（如着丝粒周围）由于搭车物理范围极大，极易将中性背景波动误判为强选择；
2. **易受广泛存在的背景选择（Background Selection, BGS）混淆**：基因密集区持续发生的有害突变纯化清除（Purifying Selection）同样会导致核苷酸多样性下降，初代模型容易将背景选择假象报告为假阳性正选择扫荡；
3. **未充分利用物种固定分歧位点（Fixed Differences）**：遗漏了外群信息提供的历史时间尺度约束。

宾夕法尼亚州立大学与加利福尼亚大学伯克利分校的 Michael DeGiorgio、Christian D. Huber、Melissa J. Hubisz、Ines Hellmann 与 Rasmus Nielsen 在 2016 年推出了 **SweepFinder2**（发表于 *Bioinformatics*）。SweepFinder2 全面重构了复合似然比检验数学架构，系统整合了**高精度变异重组率图谱**、**外群固定分歧位点**以及**基于 McVicker's $B$ 值的背景选择先验基线校正**，大幅提升了选择扫荡检验的灵敏度与鲁棒性。

---

## 2. 核心数学模型与数据结构

### 2.1 空间复合似然比检验（Composite Likelihood Ratio, CLR）

SweepFinder2 在染色体上设立一系列预设间距的网格测试点（Grid Points, $x$）：
- 对于位于 $x$ 点处的潜在受选择核心，模型假设其选择系数为 $s$；
- 设相邻标记 $i$ 距离核心测试点的物理重组距离为 $r_i$。在经历遗传搭车后，该位点逃脱选择扫荡并保留原始中性状态的概率为 $P_{\text{esc}} = 1 - e^{-\alpha_i}$，其中衰减参数 $\alpha_i = r_i / s$；
- **全基因组经验背景 SFS**：模型首先从全染色体中性区域统计出经验背景等位基因频率谱 $P_{\text{neutral}}(k)$；
- **空间复合似然函数**：
  $$\Lambda(x) = 2 \left( \max_{\alpha} \sum_{i \in \text{Region}} \ln P(X_i = k_i \mid \alpha, x) - \sum_{i \in \text{Region}} \ln P_{\text{neutral}}(X_i = k_i) \right)$$
  若在测试网格 $x$ 处观测到的空间突变谱与搭车模型高度吻合，且显著超越全局中性背景期望，则 $\Lambda(x)$ 呈现明显的空间极值峰（CLR Peak）。

### 2.2 背景选择（BGS）与 McVicker's $B$ 值校正

在紧邻重要功能外显子的区域，有害突变的持续负选择会降低邻近中性位点的有效群体大小（$N_e \to B \cdot N_e$，其中 $0 \le B \le 1$ 为背景选择系数）。SweepFinder2 引入了革命性的 **$B$ 值联合校正模块**：
- 支持传入预先模拟或推断的全基因组单碱基 $B$ 值图谱（$B$ 值越接近 0 代表背景选择越剧烈）；
- 在计算零假设似然时，动态利用局部 $B$ 值调整中性预期位点频谱，从而有效将真实的“正向适应性选择清除”与日常的“负选择搭车减损”彻底区分开来。

---

## 4. 植物基因组学应用场景与科研价值

植物基因组往往具有极端不均匀的重组率分布（例如禾本科作物染色体臂端重组率高，而着丝粒及臂中近着丝粒区数百兆重组率几乎为零）：
- **过滤植物低重组着丝粒假阳性扫荡信号**：利用结合重组率文件的模式，能够精准校正着丝粒荒漠区由于重组匮乏引起的虚假极高 CLR 峰，避免将非功能冷区误判为驯化基因；
- **水稻转座子多态性与选择清除扫描**：在水稻重要转座子变异与农艺性状选择研究中，SweepFinder2 被广泛用于扫描淀粉合成酶（*Wx*）、株型调控等核心位点的单群体选择特征；
- **排除纯化选择干扰挖掘真实农艺驯化因果位点**：在基因密集的植物常染色质功能区，借助背景选择校正模式，精准锚定真正经受人工驯化正选择强力洗礼的启动子与外显子区域。

---

## 6. 阅读与复现资源

- **原始研究论文**：[Bioinformatics 2016 DOI: 10.1093/bioinformatics/btw051](https://doi.org/10.1093/bioinformatics/btw051)
- **PubMed 记录**：[PMID: 26868233](https://pubmed.ncbi.nlm.nih.gov/26868233/)
- **DeGiorgio 实验室官方使用手册**：[SweepFinder2 Manual PDF](https://degiorgiogroup.fau.edu/Manual_SweepFinder2_v1.0.pdf)
- **站内配套专题**：[选择性清除与自然选择检测](../../topics/population-genetics/m05-topic-05/)
- **站内配套专题**：[群体遗传结构与主成分分析](../../topics/population-genetics/m05-topic-03/)
