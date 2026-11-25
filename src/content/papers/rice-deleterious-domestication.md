---
title: "Deleterious Variants in Asian Rice and the Potential Cost of Domestication"
summary: "系统量化亚洲栽培稻在驯化与人工选择过程中的有害非同义突变积累，揭示由于有效群体大小剧降引起的‘驯化代价’机制。"
authors: "Lu J, Tang T, Tang H, et al."
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
- 结合全基因组高深度重测序数据，系统对比同义突变、容忍性非同义突变以及破坏蛋白质三维结构/功能的**有害突变（Deleterious Mutations）**在野生与栽培群体中的频率与分布。

---

## 基因组学与生物信息学分析流程

1. **变异质控与纯化**：
   使用 **BWA-MEM** 将全基因组重测序读段比对至水稻 Nipponbare 参考基因组，使用 **bcftools** 进行多等位位点分割、左对齐与深度过滤，剔除比对质量差（$\text{MQ} < 30$）的位点；
2. **有害非同义变异的生物信息学功能预测**：
   - 提取所有位于蛋白质编码基因外显子区域的单核苷酸多态性；
   - 使用 **SnpEff (v4.3)** 标注突变的基因组功能影响（同义突变 Synonymous、错义突变 Missense、无义终止突变 Stop-gain / Stop-loss）；
   - 使用 **SIFT (Sorting Intolerant From Tolerant)** 算法评估跨物种演化保守性：基于同源蛋白多重序列比对（MSA）计算氨基酸替换概率得分，将 $\text{SIFT score} < 0.05$ 严格判定为损伤蛋白功能的“有害变异（Deleterious Variants）”；
3. **有害变异负荷与等位基因频谱 (SFS) 比较**：
   - 使用 **PLINK** 计算每个水稻基因组中纯合有害突变与杂合有害突变的个体绝对负荷（Genetic Load）；
   - 统计有害突变相对于同义突变的比例（$P_n / P_s$ 比例）以及衍生等位基因频谱（Derived Allele Frequency, DAF）。

---

## 软件在研究中的具体作用

| 软件 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **BWA-MEM** | 双端重测序读段全基因组参考坐标精准对齐 | 保证高覆盖度与对齐保真度，防止外显子错位对变异预测的干扰 |
| **bcftools** | 变异文件规范化（norm）、多等位位点拆分与高质量 SNP 提取 | 输出格式标准、无冗余的单等位基因变异 VCF 文件 |
| **SnpEff (v4.3)** | 外显子编码区变异注释，区分同义突变与非同义替换 | 提取全基因组所有引起氨基酸改变的候选错义突变 |
| **SIFT** | 基于跨物种同源蛋白保守性打分判定有害变异 | 高灵敏度识别导致蛋白质结构破坏的有害等位基因（SIFT < 0.05） |
| **PLINK (v1.9)** | 统计个体基因型杂合度与纯合有害突变数量 | 定量评估栽培水稻个体中的有害突变累积负荷 |

---

## 主要科研发现与农艺性状突破

1. **确凿证实栽培水稻的驯化代价**：
   数据分析表明，亚洲栽培水稻个体中携带的纯合有害非同义突变数量显著高于野生祖先普通野生稻。在自交程度更高的粳稻群体中，有害突变的累积尤其严重；
2. **选择扫荡区的有害突变搭车效应**：
   在经历强烈人工选择的驯化特征基因（如控制落粒性的 *sh4*、控制芒长的 *An-1*、控制种皮颜色的 *Rc*）侧翼数十 kb 物理区间内，有害变异的密度显著高于全基因组平均水平，直接证实了有益农艺性状在被选择固定的同时，通过强连锁搭车（Hitchhiking）将邻近的有害突变强制带入并固化在了栽培品种中；
3. **育种启示：野生近缘种基因组清洗策略**：
   研究明确指出，野生稻虽然表型粗放，但其基因组中经过长期自然选择的有效净化，缺失许多在栽培稻中固定的有害变异。现代分子设计育种应通过回交渗入（Introgression）引入野生稻的优异健康等位基因，对现代栽培种进行“基因组净化（Genomic Purging）”，以大幅挖掘水稻杂种优势与潜在单产潜力。

---

## 阅读与数据复现资源

- **期刊全文**：[Molecular Biology and Evolution, 34(4), 908–918 (2017)](https://doi.org/10.1093/molbev/msw296)
- **PubMed 记录**：[PMID: 28087771](https://pubmed.ncbi.nlm.nih.gov/28087771/)
- **变异与数据补充文件**：Oxford Academic MBE Supplementary Files
