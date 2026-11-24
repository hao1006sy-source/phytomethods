---
title: 非编码 RNA 注释与结构协方差模型
summary: 系统剖析随机上下文无关文法（SCFG）与协方差模型（CM）、tRNAscan-SE 三叶草结构识别、植物 21-nt/24-nt 小 RNA 特征与 lncRNA 编码潜能评估。
domain: genome-annotation
methods: []
updatedAt: 2026-11-25
---

## 科学定位与生物学核心问题

虽然蛋白质编码基因长期占据了基因组学研究的舞台中心，但真核生物转录本的绝大部分实际上属于不编码多肽链的非编码 RNA（Non-coding RNA, ncRNA）。在植物生长发育、细胞分化、减数分裂、基因沉默以及应答外界生物/非生物逆境胁迫的过程中，非编码 RNA 构成了多层次、极其精密的表观与转录后调控网络。

由于非编码 RNA 不受三联体密码子阅读框（Open Reading Frame, ORF）的刚性约束，其在初级序列上的突变漂变速率显著快于蛋白编码区。然而，其分子功能（如催化活性、核糖核蛋白组装、靶向引导）高度依赖于严格保守的**空间二级与三级立体结构（如发夹茎环、三叶草结构、假结 Pseudoknots）**。

因此，经典的基于纯序列 BLAST 比对的方法在 ncRNA 挖掘中几乎彻底失效，必须引入结合初级序列与二级结构配对统计的**协方差模型（Covariance Models, CMs）**。

---

## 协方差模型（CM）与随机上下文无关文法（SCFG）数学原理

由 Sean Eddy 团队开发的 **Infernal（Inference of RNA Alignment）** 与 **Rfam** 数据库，是全球非编码 RNA 鉴定的权威金标准。

### 1. 随机上下文无关文法（SCFG）形式化

标准的隐马尔可夫模型（HMM）属于正则文法（Chomsky Type-3），只能描述线性的单碱基马尔可夫转移，无法对 RNA 二级结构中相隔甚远但通过氢键互补配对的碱基对（Nested Base Pairs, 如 $i$ 与 $j$ 位点的 A-U / G-C / G-U 配对）进行概率建模。

随机上下文无关文法（SCFG, Chomsky Type-2）通过引入成对发射产生式（Pairwise Emission Productions），将 RNA 结构解析为树状派生树：

$$W \to a Y b \quad \text{概率为} \quad P(a, b \mid W)$$

其中状态 $W$ 同时在 5' 端发射碱基 $a$、在 3' 端发射碱基 $b$，由联合发射概率矩阵 $P(a, b \mid W)$ 严格约束 Watson-Crick（A-U, G-C）与 Wobble（G-U）配对的空间热力学与演化相容性。

### 2. CYK 动态规划与得分对数几率

对于目标基因组序列 $X$，Infernal 采用 **CYK（Cocke-Younger-Kasami）算法** 在三维动态规划矩阵 $O(L^3)$ 复杂度下搜索最优结构折叠与比对路径。打分采用相对于背景零模型的对数几率比（Bit-score）：

$$S(X, \hat{\pi}) = \sum_{v \in \text{Nodes}} \log_2 \frac{P(\text{State transition})}{P(\text{Background})} + \sum_{v \in \text{Emissions}} \log_2 \frac{P(\text{Emitted bases})}{P(\text{Null model})}$$

只有当 Bit-score 达到或超过 Rfam 家族预先校准的可靠聚集阈值（Gathering Cutoff, GA）时，才被认定为该 ncRNA 家族的可信同源物。

---

## 植物非编码 RNA 全谱系分类与识别策略

| ncRNA 类群 | 核心生物学功能 | 序列与结构特征 | 首选计算工具与数据库 | 质控与过滤关键判据 |
| :--- | :--- | :--- | :--- | :--- |
| **转运 RNA (tRNA)** | 翻译过程中转运特定氨基酸 | 长度 70~90 nt，高度保守的“三叶草”四臂二级结构与反密码子环 | **tRNAscan-SE 2.0** | 区分假基因（Pseudo），检查 A/B-box 内部启动子完整性 |
| **核糖体 RNA (rRNA)** | 核糖体大小亚基催化与骨架核心 | 包含 18S (小亚基)、5.8S、28S/25S (大亚基) 及 5S 串联多拷贝 | **Barrnap / RNAmmer** | 定位核仁组织区（NOR）与细胞器 rDNA 串联重复 |
| **小核/小核仁 RNA (snRNA/snoRNA)** | 剪接体核心组分 (U1, U2 等)；指导 rRNA 甲基化修饰 | 具有保守的 Sm 蛋白结合基序、Box C/D 或 Box H/ACA 盒状结构 | **Infernal / Rfam** | 严格遵循 Rfam GA 阈值过滤，结合转录组表达丰度 |
| **植物微小 RNA (miRNA)** | 转录后剪切靶标 mRNA 或抑制翻译 | 成熟体长度严格为 20~22 nt (单子叶常多见 21-nt)；前体为发夹茎环 | **miRDeep-P2 / ShortStack** | **前体折叠自由能 $\Delta G \le -30\text{ kcal/mol}$**，存在成熟体与星号链（miRNA*）配对且 3' 突出 2 nt |
| **24-nt 异染色质 siRNA (hc-siRNA)** | 植物特有，指导 RNA 依赖的 DNA 甲基化 (RdDM)，沉默转座子 | 长度严格集中于 24 nt，由 Pol IV 转录并由 DCL3 酶切产生 | **ShortStack** | 富集于转座子及着丝粒异染色质，首位碱基强烈偏好腺嘌呤 `A` |
| **长链非编码 RNA (lncRNA)** | 染色质重塑、表观遗传沉默及分子海绵 | 长度 > 200 nt，具 PolyA 尾巴，但不具备长连续开放阅读框 | **CPC2 / PLEK / FEELnc** | **编码潜能评分 (Coding Probability < 0.5)**，彻底剔除含已知蛋白结构域（Pfam）的转录本 |

---

## 常用实战运行流程与命令

### 1. 全基因组 tRNA 自动化扫描

```bash
# -E: 真核生物模式 (Eukaryotic)
# -o: 输出汇总表
# -f: 输出二级结构文本图
# -m: 输出统计指标
tRNAscan-SE -E -o plant_tRNA.out -f plant_tRNA.ss -m plant_tRNA.stats genome.fasta
```

### 2. 基于 Rfam 协方差模型的全基因组 ncRNA 检索

```bash
# 1. 建立 Rfam 协方差模型索引 (包含数百个植物已知 ncRNA 家族)
cmpress Rfam.cm

# 2. 运行并行搜索 (启用 --cut_ga 采用严格专家校准阈值)
cmsearch --cut_ga --rfam --nohmmonly --tblout plant_rfam.tbl -o plant_rfam.out \
  --cpu 32 Rfam.cm genome.fasta
```

### 3. 长链非编码 RNA（lncRNA）无偏编码潜力过滤

```bash
# 使用 CPC2 评估转录本编码潜能 (输入为 StringTie 或全长 Iso-Seq 组装出的 FASTA)
python CPC2.py -i candidate_transcripts.fa -o cpc2_output.txt

# 提取 noncoding 标签且长度 ≥ 200 nt 的高质量 lncRNA
awk '$8=="noncoding" && $3>=200 {print $1}' cpc2_output.txt > high_confidence_lncRNA.ids
```

---

## 植物实战案例与验证标准

在番茄模式品种 VF36 的无缺口端粒到端粒（T2T）高质量基因组研究中（Su et al., 2024, *GigaScience*, DOI: [10.1093/gigascience/giaf058](https://doi.org/10.1093/gigascience/giaf058)）：
- 结构注释整合团队明确将非编码 RNA 分设独立流水线：利用 tRNAscan-SE 鉴定出 1,124 个高可信核 tRNA；
- 利用 RNAmmer 与 Barrnap 定位了位于第 2 号染色体近端粒区的完整 45S rDNA 巨型阵列；
- 利用 Infernal 严格结合 Rfam 14.9 数据库完成 miRNA、snRNA 和 snoRNA 的全基因组精准定位，彻底避免了将短转座子碎片误报为功能 ncRNA 的传统缺陷。

---

## 参考文献与数据来源

1. **Nawrocki EP, Eddy SR.** (2013). Infernal 1.1: 100-fold faster RNA homology searches. *Bioinformatics*, 29(22), 2933–2935. DOI: [10.1093/bioinformatics/btt509](https://doi.org/10.1093/bioinformatics/btt509)
2. **Chan PP, Lin BY, Mak AJ, Lowe TM.** (2021). tRNAscan-SE 2.0: improved detection and functional classification of transfer RNAs. *Nucleic Acids Research*, 49(16), 9077–9096. DOI: [10.1093/nar/gkab688](https://doi.org/10.1093/nar/gkab688)
3. **Kang YJ, Yang DC, Kong L, et al.** (2017). CPC2: a fast and accurate coding potential calculator based on sequence intrinsic features. *Nucleic Acids Research*, 45(W1), W12–W16. DOI: [10.1093/nar/gkx428](https://doi.org/10.1093/nar/gkx428)
4. **Su X, Zhang L, Wang Y, et al.** (2024). A telomere-to-telomere genome assembly of tomato line VF36. *GigaScience*, 13, giaf058. DOI: [10.1093/gigascience/giaf058](https://doi.org/10.1093/gigascience/giaf058)
