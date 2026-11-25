---
title: "A chromosome-level genome of mango exclusively from long-read sequence data"
summary: "利用超高深度 (204×) PacBio HiFi 长读段独家实现芒果染色体级高质量无缺口基因组组装，并整合 RNA-seq 与同源蛋白证据建立 BRAKER3 与 InterProScan 完整注释流程。"
authors: "Wijesundara UK, Masouleh AK, Furtado A, Dillon NL, Henry RJ"
year: 2024
journal: The Plant Genome
doi: 10.1002/tpg2.20441
type: application
methodIds: [braker3, interproscan]
domainIds: [genome-annotation, genome-assembly]
speciesIds: [mango]
status: published
updatedAt: 2026-11-25
---

## 研究问题与材料范围

芒果（*Mangifera indica* L.，漆树科，染色体数 $2n = 40$）是热带与亚热带地区最重要的常绿果树之一。由于植物基因组普遍存在高度杂合性、高丰度转座元件重复序列以及多倍化历史，传统的植物染色体级全基因组组装通常高度依赖染色质构象捕获（Hi-C）物理挂载技术。然而，Hi-C 实验受限于组织甲醛交联效率、限制性内切酶酶切偏好以及复杂的物理折叠反褶积算法，常常在着丝粒与核糖体 DNA（rDNA）阵列附近引入方向倒置与装配缺口。

为了探索仅依靠单分子长读长技术能否彻底解决高杂合园艺作物的端粒到端粒（T2T）近完整组装，本研究以商业主栽芒果品种为材料，设计了极深覆盖度的测序与注释路线：
- **测序策略**：独家采集单分子超高物理深度（~204×）的 PacBio HiFi 闭环共有长读段（CCS reads，平均读长 15~18 kb）；
- **转录组支持**：分别提取芒果成熟叶片（leaf）与花序（flower）组织的总 RNA，构建双端短读段 RNA-seq 文库（Illumina NovaSeq 6000），提供原位转录剪接证据；
- **研究目标**：验证在完全摒弃 Hi-C 数据的前提下，超高深度 HiFi 长读段能否直接跨越全部染色体着丝粒与复杂异染色质，并依托现代全自动基因注释引擎建立染色体级高质量基因集。

---

## 基因组学与生物信息学分析流程

1. **超深 HiFi 长读段组装与端粒染色体跨越**：
   - 使用 **Hifiasm** 算法在超深物理覆盖度下进行单倍型感知组装，直接将全基因组 20 条染色体中的 17 条分别组装为单条连续无缺口的 contig，且两端均成功检出植物典型端粒重复序列（`TTTAGGG`）；
   - 对剩余 3 条由于高丰度核糖体 DNA（rDNA）重复导致物理断裂的染色体，通过比对末端重叠读段与端粒信号人工缝合定向，最终获得物理总长约 365 Mb、含 20 条伪染色体的近乎完整参考基因组；
2. **转座元件与重复序列 de novo 屏蔽**：
   - 运行 **RepeatModeler2** 构建芒果特异的 de novo 重复序列一致性文库；
   - 运行 **RepeatMasker** 执行全基因组软屏蔽（Soft-masking），全基因组重复序列比例约为 42%~45%；
3. **基于 BRAKER3 的全自动真核生物基因结构预测**：
   - 使用 **HISAT2** 将叶片与花序 RNA-seq 短读段精准对齐至软屏蔽的芒果染色体组装，生成剪接位点 BAM 文件；
   - 从 OrthoDB (v11) 提取植物界（Viridiplantae）高质量同源蛋白质序列库；
   - 运行 **BRAKER3 (v3.0.3)**：全自动无缝整合短读段 RNA-seq 证据与大规模同源蛋白比对证据，驱动 **GeneMark-ETP** 生成高置信度初始训练基因集，进而自动优化 **AUGUSTUS** 隐马尔可夫模型参数，最终输出全套高准确度蛋白质编码基因结构模型（GFF3）；
4. **基于 InterProScan 的全基因组蛋白质功能注释与本体映射**：
   - 从 BRAKER3 预测的基因集中提取代表性最长转录本编码的氨基酸序列；
   - 运行 **InterProScan (v5.62)**，并行检索 Pfam、PANTHER、SUPERFAMILY、Gene3D、SMART 及 CDD 结构域数据库；
   - 自动映射并赋予标准 Gene Ontology (GO) 术语以及 KEGG 代谢通路酶学编号（EC numbers）。

---

## 软件在研究中的具体作用

| 软件 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **BRAKER3 (v3.0.3)** | 联合叶/花 RNA-seq 与 OrthoDB 同源蛋白证据，执行无监督基因预测 | 预测出约 3.3 万个高质量蛋白质编码基因，外显子-内含子剪接位点与转录组高度吻合 |
| **InterProScan (v5.62)** | 扫描全套预测蛋白的保守结构域、跨膜区、信号肽与功能家族 | 超过 88% 的预测蛋白获得明确的 Pfam 结构域或 GO 功能注释，为果实风味代谢通路解析提供依据 |
| **RepeatModeler2** | 构建芒果物种特异性的全长转座元件一致性共有序列文库 | 识别并分类 LTR 反转录转座子（Copia/Gypsy）与 DNA 转座子家族 |
| **RepeatMasker** | 对芒果伪染色体序列进行精准软屏蔽（Soft-masking） | 有效防止转座子衍生假基因对 BRAKER3 隐马尔可夫模型训练的干扰 |
| **BUSCO (v5)** | 基于 eudicots_odb10 数据库评估基因组组装与注释基因集完整度 | 报告组装与基因集完整度均达到 100%（单拷贝 + 重复拷贝），确凿证实长读段注释极高质量 |

---

## 主要科研发现与农艺性状突破

1. **彻底打破植物染色体组装对 Hi-C 的绝对依赖**：
   该研究确凿证明：当 PacBio HiFi 测序物理深度提高至 ~200× 时，长读段重叠群的物理延伸能力足以直接连续跨越绝大多数双子叶植物染色体的异染色质着丝粒与复杂倒位区域，以极高经济与时间效率直接产出端粒到端粒（T2T）近完整的伪染色体；
2. **基因注释完整度突破**：
   经 BRAKER3 与 InterProScan 联合处理的基因集，在 BUSCO（eudicots_odb10）单拷贝直系同源基因完整性测试中取得了 100% 的极高评价，几乎消除了传统 ab initio 预测中常见的嵌合基因与外显子错跳误差；
3. **果实品质与抗病候选基因挖掘**：
   通过 InterProScan 结构域解析，系统鉴定了漆树科植物特有的萜类合成酶（Terpene Synthases, TPS）、查尔酮合成酶（CHS）及漆树醇（Urushiol）生物合成关键酶基因家族，为解析热带芒果独特香气风味形成与抗炭疽病分子育种提供了基石级基因组资源。

---

## 阅读与数据复现资源

- **期刊全文**：[The Plant Genome, 17(2), e20441 (2024)](https://doi.org/10.1002/tpg2.20441)
- **PubMed 记录**：[PMID: 38462715](https://pubmed.ncbi.nlm.nih.gov/38462715/)
- **原始测序数据存取号**：NCBI BioProject [PRJNA1112139](https://www.ncbi.nlm.nih.gov/bioproject/PRJNA1112139)（包含 PacBio HiFi、RNA-seq 原始测序读段及染色体级组装文件）
- **基因组学方法关联**：[BRAKER3 算法原理与使用指南](../../methods/braker3/) ｜ [InterProScan 蛋白质功能注释](../../methods/interproscan/)
