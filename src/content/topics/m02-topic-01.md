---
title: 基因组注释基础与技术全景
summary: 系统阐释基因组结构与功能注释流程、GFF3 九列层级模型与 CDS Phase 严格换算、多源生物学证据互补与植物多倍体注释陷阱。
domain: genome-annotation
methods: [braker3, interproscan]
updatedAt: 2026-11-25
---

## 科学定位与生物学核心问题

如果说基因组组装（*De novo* Assembly）是绘制了一张精确的线性染色体物理底图，那么基因组注释（Genome Annotation）则是为这张空白地图标注出每一个具有生命活力的生物学地标。它直接回答：在数十亿对碱基的茫茫序列中，究竟哪些区域编码具有催化或结构功能的蛋白质？哪些转录为调控性非编码 RNA？哪些是沉睡的转座子重复元件？这些基因在何时、何地、何种逆境下表达并发挥何种生化功能？

在植物基因组学中，注释工作面临着极其严峻的生物学异质性挑战：
1. **转座子高密度侵蚀**：植物基因组常富含 50%~85% 的逆转录转座子（LTR-RT），大量转座子内部的开放阅读框（如 GAG、POL 多聚蛋白）若未被精准屏蔽，会大量混入正常基因集，造成数万个虚假“基因”的人工膨胀；
2. **多倍化同源异型（Homeologs）**：普通小麦、甘蓝型油菜等多倍体作物中，各亚基因组间存在高度相似的基因对，剪接位点极易在同源物之间发生交叉误配；
3. **时空表达局限性**：任何特定取样（如正常根系或幼叶）的转录组（RNA-seq），通常仅能捕获全基因组中约 40%~60% 的活跃转录本，其余组织特异性、极低表达或特定逆境（干旱、高盐、病害诱导）基因无法仅凭单一转录组获得证据。

现代植物基因组注释必须遵循“**从头预测、转录本验证、同源蛋白跨物种比对三位一体协同整合**”的科学规范。

![BRAKER3 多源证据整合与基因预测模型](/phytomethods/images/topics/m02/braker3-evidence-integration.svg)

---

## 核心证据类型及其适用边界

| 证据类型 | 实验技术与数据格式 | 在注释中的核心价值 | 主要局限性与潜在系统误差 |
| :--- | :--- | :--- | :--- |
| **重复序列软屏蔽基因组** | EDTA / RepeatMasker 输出的小写化 FASTA | 阻止预测器在转座子内部错误预测假基因 | 若发生**过度屏蔽**，真实基因的保守结构域可能被误小写化 |
| **短读段转录组 (RNA-seq)** | Illumina 双端测序比对产生的 BAM (HISAT2 / STAR) | 精确提供被测组织中真实发生的外显子剪接接头 (Junctions) | 受限于取材组织、时期及测序深度，无法覆盖低表达与沉默基因 |
| **全长转录组 (Iso-Seq)** | PacBio 或 ONT 全长 cDNA 测序 (FLNC reads) | 直接横跨完整转录本，确证复杂选择性剪接 (AS) 异构体 | 测序通量较低，文库构建存在反转录提前终止或降解截断 |
| **跨物种同源蛋白** | OrthoDB / UniProt 密集进化枝多肽 FASTA | 利用进化保守性锚定核心直系同源编码区起止边界 | 亲缘距离较远时内含子外显子结构发生漂变，对孤儿基因无效 |
| **统计从头预测 (Ab initio)** | 基于物种密码子与剪接 HMM 的统计概率模型 | 能够预测完全无转录组或蛋白证据的物种特异性新基因 | 极易受序列局部 GC 波动干扰，假阳性率显著高于证据驱动模型 |

---

## GFF3 黄金规范与 CDS Phase 严格换算

通用特征格式第三版（Generic Feature Format version 3, GFF3）是结构基因注释的绝对工业标准。GFF3 文件每行包含严格由制表符（`\t`）分隔的九列信息：

`seqid \t source \t type \t start \t end \t score \t strand \t phase \t attributes`

### 1. 坐标体系与 BED 转换

GFF3 采用 **1-based 闭区间** 坐标系统（起点与终点均包含在特征内部）；而 BED 格式采用 **0-based 半开区间** 坐标系统：

$$\text{Start}_{\text{GFF3}} = \text{Start}_{\text{BED}} + 1 \qquad \text{End}_{\text{GFF3}} = \text{End}_{\text{BED}}$$

### 2. CDS Phase（密码子阅读框相位）的严格定义

在 GFF3 的第 8 列中，对于特征类型为 `CDS` 的记录，必须标注一个取值为 `0`、`1` 或 `2` 的整数（对于非 CDS 特征则记为 `.`）。

Phase 的严格生物学定义是：**从当前 CDS 片段的 5' 起始端算起，需要跳过多少个碱基才能到达第一个完整密码子（Triplet Codon）的第一个碱基位置**。
- **Phase = 0**：当前 CDS 片段的首个碱基恰好是某个密码子的第 1 个碱基（起始密码子 ATG 或上一个外显子刚好在密码子边界处结束）；
- **Phase = 1**：上一个外显子在某个密码子的第 1 个碱基处断开，留下了 2 个碱基由当前外显子提供，因此当前 CDS 需跳过第 1 个碱基才能开始新密码子；
- **Phase = 2**：上一个外显子在某个密码子的第 2 个碱基处断开，留下了 1 个碱基由当前外显子提供，因此当前 CDS 需跳过前 2 个碱基才能开始新密码子。

设上一个外显子 CDS 的长度为 $L_{\text{prev}}$，其进入相位为 $\text{Phase}_{\text{prev}}$，则当前连续 CDS 外显子的起始相位推导递推关系为：

$$\text{Phase}_{\text{curr}} = (3 - ((L_{\text{prev}} - \text{Phase}_{\text{prev}}) \bmod 3)) \bmod 3$$

在解析或生成 GFF3 时，任何 Phase 赋值错误都会直接破坏下游的虚拟翻译阅读框，导致预测出的多肽链提前遭遇虚假终止密码子。

---

## 完整注释工程的标准实施路线

```
参考基因组 FASTA ──> [EDTA 转座子挖掘与过滤] ──> 全基因组软屏蔽 (Soft-masked)
                                                      │
         ┌────────────────────────────────────────────┴─────────────────────┐
         ▼                                                                 ▼
[多组织 RNA-seq 比对] (HISAT2 / STAR)                    [OrthoDB 同源蛋白比对] (ProtHint)
         │ (剪接位点 Junctions)                                            │ (外显子锚点 Hints)
         └────────────────────────────┬────────────────────────────────────┘
                                      ▼
                         [BRAKER3 证据驱动集成预测]
                       (GeneMark-ETP + AUGUSTUS 自训练)
                                      │
                                      ▼
                       [TSEBRA 转录本模型择优筛选]
                                      │
                                      ▼
                       结构注释交付表 (GFF3 / GTF)
                                      │
                                      ▼
                       [InterProScan 5 功能注释]
                       (Pfam, CDD, Gene Ontology, KEGG)
```

---

## 植物实战案例与证据标准

在芒果（*Mangifera indica*）高质量染色体级基因组发表中（Wang et al., 2024, *The Plant Genome*, DOI: [10.1002/tpg2.20441](https://doi.org/10.1002/tpg2.20441)）：
- 研究团队使用 RepeatModeler2 与 RepeatMasker 完成全基因组重复序列挖掘；
- 采集幼叶、成熟叶、花蕾、盛花及多时期果实等 8 种植物组织的 RNA-seq 数据，利用 HISAT2 进行比对；
- 采用 **BRAKER3 v3.0.3** 深度整合转录组与 Viridiplantae 同源蛋白库，最终获得高质量结构基因集合；
- 利用 InterProScan 5 与 eggNOG-mapper 进行功能域与通路注释，并在 BUSCO 蛋白水平评估中达到 98.2% 的超高完整度。

---

## 参考文献与数据来源

1. **Gabriel L, Hoff KJ, Brůna T, et al.** (2024). BRAKER3: Fully automated genome annotation using RNA-seq and protein evidence with GeneMark-ETP, AUGUSTUS, and TSEBRA. *Genome Research*, 34(5), 768–781. DOI: [10.1101/gr.278090.123](https://doi.org/10.1101/gr.278090.123)
2. **Jones P, Binns D, Chang HY, et al.** (2014). InterProScan 5: genome-scale protein function classification. *Bioinformatics*, 30(9), 1236–1240. DOI: [10.1093/bioinformatics/btu031](https://doi.org/10.1093/bioinformatics/btu031)
3. **Wang P, Luo C, Wu H, et al.** (2024). A high-continuity chromosome-scale genome assembly of mango (*Mangifera indica* L.). *The Plant Genome*, 17(2), e20441. DOI: [10.1002/tpg2.20441](https://doi.org/10.1002/tpg2.20441)
