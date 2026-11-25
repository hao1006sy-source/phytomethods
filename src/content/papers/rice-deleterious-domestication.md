---
title: "Deleterious Variants in Asian Rice and the Potential Cost of Domestication"
summary: "系统量化亚洲栽培稻在驯化与人工选择过程中的有害非同义突变积累，揭示由于有效群体大小剧降引起的‘驯化代价’机制。"
authors: "Liu Q, Zhou Y, Morrell PL, Gaut BS"
year: 2017
journal: Molecular Biology and Evolution
doi: 10.1093/molbev/msw296
type: application
methodIds: [xpclr]
domainIds: [population-genetics]
speciesIds: [rice]
status: published
updatedAt: 2026-11-25
---

## 研究问题与材料范围

在人类驯化农作物以获取高产、不落粒及优质性状的过程中，往往伴随着剧烈的**种群瓶颈（Population Bottleneck）**与强烈的人工正向选择。群体遗传学理论预测：剧烈的有效群体大小（$N_e$）缩减会极大削弱自然选择清除微效有害突变的效力，同时强烈的选择扫荡（Selective Sweeps）会通过遗传搭车效应（Genetic Hitchhiking）将周围中性甚至微效有害的突变强行固定，这一演化现象被称为**“驯化代价”（The Cost of Domestication）**。

本研究对涵盖不同演化阶段的亚洲水稻种质开展了全基因组深度的有害突变图谱比较：
- 选取代表性的亚洲栽培稻籼稻（*Oryza sativa* ssp. *indica*）与粳稻（*O. sativa* ssp. *japonica*）农家种及育成品种；
- 以野生祖先普通野生稻（*Oryza rufipogon*）为原始未驯化对照；
- 结合全基因组重测序数据，系统对比同义突变（sSNPs）、容忍性非同义突变以及破坏蛋白质功能结构的**有害非同义单核苷酸变异（dSNPs）**在野生与栽培群体中的频率与分布。

---

## 基因组学与生物信息学分析流程

1. **变异质控与数据过滤**：
   使用 **BWA-MEM** 将重测序读段比对至水稻 Nipponbare 参考基因组，使用 **bcftools** 进行多等位位点分割、左对齐与深度过滤，剔除比对质量低（$\text{MQ} < 30$）和覆盖度异常的位点；
2. **有害非同义突变的生物信息学预测**：
   - 使用 **SIFT (Sorting Intolerant From Tolerant)** 算法评估跨物种演化保守性：基于同源蛋白多重序列比对（MSA）计算氨基酸替换概率得分，严格将 $\text{SIFT score} < 0.05$ 判定为破坏蛋白质功能的“有害变异（Deleterious Variants, dSNPs）”；
   - 提取外显子区域的同义突变（sSNPs）作为演化中性对照，计算衍生等位基因频率（Derived Allele Frequency, DAF）与 $d_N / d_S$ 等价变异比率；
3. **选择清除扫描与多位点等位基因分化**：
   - 使用 **XP-CLR (Cross-Population Composite Likelihood Ratio)** 算法：以普通野生稻为参考群体，沿染色体滑窗扫描粳稻与籼稻中的多位点等位基因频率分化，精确定位经历人工选择扫荡（Selective Sweeps）的候选物理区间；
   - 辅以 **SweeD** 复合似然比检验，交叉验证选择信号；
4. **群体前向遗传学模拟 (Forward Simulations)**：
   利用前向模拟系统评估交配系统转变（由野生异交转变为栽培自交，Selfing rate 演变）与种群瓶颈对有害突变累积的相对贡献。

---

## 软件在研究中的具体作用

| 软件 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **BWA-MEM** | 双端重测序读段全基因组参考坐标精准对齐 | 保证高覆盖度与对齐保真度，防止外显子错位对变异预测的干扰 |
| **bcftools** | 变异文件规范化（norm）、多等位位点拆分与高质量 SNP 提取 | 输出格式标准、无冗余的单等位基因变异 VCF 文件 |
| **SIFT** | 基于跨物种同源蛋白保守性打分判定有害变异 | 高灵敏度识别导致蛋白质结构破坏的有害等位基因（以 SIFT < 0.05 为截断值） |
| **XP-CLR** | 跨群体复合似然比扫描野生与栽培群体等位基因分化 | 准确定位栽培稻受人工选择的基因组扫荡区间，用于评估有害突变搭车效应 |
| **SweeD** | 基于位点频率谱（SFS）的复合似然比选择清除扫描 | 独立验证选择扫荡区间的物理坐标与候选基因富集情况 |

---

## 主要科研发现与农艺性状突破

1. **确凿证实亚洲栽培水稻的驯化代价**：
   数据分析表明，亚洲栽培水稻个体中携带的有害等位基因总数相比野生祖先普通野生稻增加了约 3%~4%，且有害变异相对于同义变异的比例（dSNP/sSNP 比值）显著上调；
2. **交配系统自交转变的主导驱动效应**：
   前向模拟与基因组实测数据一致表明，相比于纯粹的人口瓶颈（Bottleneck），**水稻生活史由常异交向高度自交（Selfing）的转变**是主导全基因组微效有害突变清除效率下降的核心因素。自交导致有效群体大小（$N_e$）大幅腰斩，使得微效有害突变更容易由于遗传漂变而积累；
3. **低重组率区间有害突变显著富集**：
   在染色体着丝粒及周围低重组区域，自然选择对有害突变的净化效率最低，这些区域富集了大量的纯合有害突变；在受选择清除的强搭车区域，有害突变也伴随人工驯化基因一同被动上升；
4. **作物育种启示：野生近缘种基因组清洗策略**：
   野生稻虽然含有粗糙的农艺表型，但其基因组维持较高的异交率与较大的有效群体大小，其着丝粒与功能区缺少大量在栽培稻中固化的有害变异。现代分子设计育种应通过回交渗入（Introgression）引入野生稻的优异健康等位基因，对现代栽培种进行“基因组净化（Genomic Purging）”，以大幅挖掘水稻杂种优势与潜在单产潜力。

---

## 阅读与数据复现资源

- **期刊全文**：[Molecular Biology and Evolution, 34(4), 908–924 (2017)](https://doi.org/10.1093/molbev/msw296)
- **PubMed 记录**：[PMID: 28087781](https://pubmed.ncbi.nlm.nih.gov/28087781/)
- **变异与数据补充文件**：Oxford Academic MBE Supplementary Data Files
