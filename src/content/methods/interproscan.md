---
title: InterProScan
name: InterProScan
summary: 综合调用 14 个成员数据库的 Profile HMM 与特征签名模型，对植物全蛋白质组进行结构域识别、家族分类及 GO/通路拓扑映射。
dataType: 预测蛋白质氨基酸 FASTA
principle: 概率 Profile 隐马尔可夫模型比对、多数据库签名聚合与受控词表自动映射
domainIds: [genome-annotation]
topicIds: [m02-topic-01, m02-topic-06]
principleIds: [annotation]
dataIds: [annotation-input]
paper: interproscan-paper
repository: https://github.com/ebi-pf-team/interproscan
version: InterProScan 5.78-109.0（v5 最终长效版本；新一代分析建议关注 InterProScan 6）
updatedAt: 2026-11-25
---

## 简介与计算问题

当真核生物基因结构预测完成后，研究者会获得成千上万个由外显子剪接翻译出的氨基酸多肽序列。直接通过全长序列比对（如 BLASTp）无法有效解释那些仅在局部几十个氨基酸上高度保守、而全长分化极大的多结构域复合蛋白质（如植物典型的受体样激酶 RLK 家族，通常包含胞外富亮氨酸重复 LRR、跨膜螺旋及胞内丝氨酸/苏氨酸激酶结构域）。

**InterProScan** 由欧洲生物信息学研究所（EMBL-EBI）开发并长期维护，是国际公认的蛋白质功能特征注释工业级金标准。它通过集中调度十几个异质的权威蛋白签名数据库，利用 Profile 隐马尔可夫模型（Profile HMMs）、权重矩阵（Position-Specific Scoring Matrices）及模式指纹，将全蛋白质组的序列特征精确分类至 InterPro 知识图谱节点，并自动延伸映射至标准 Gene Ontology（GO）术语及生物代谢途径（Reactome / KEGG / MetaCyc）。

---

## 核心算法流程与成员数据库体系

InterProScan 的核心计算引擎建立在**多源异质模型并行比对**与**层次化条目整合**的基础之上：

```
                    ┌──────────────────────────────────────────┐
                    │      预测蛋白 FASTA (建议最长转录本)       │
                    └────────────────────┬─────────────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
【Profile HMM 驱动库】          【结构与进化分类库】             【位点与拓扑预测库】
 Pfam (HMMER3 GA阈值)            PANTHER (系统发育树HMM)          SignalP (信号肽)
 SMART (信号与调控结构域)        SUPERFAMILY (SCOP 3D拓扑)        TMHMM / Phobius (跨膜区)
 CDD (NCBI 保守催化结构域)       Gene3D (CATH 结构域)             MobiDB-lite (固有无序区)
 HAMAP (严格保守谱系模型)        PIRSF (全长蛋白质家族模型)        PRINTS / PROSITE (活性位点)
        │                                │                                │
        └────────────────────────────────┼────────────────────────────────┘
                                         ▼
                    ┌──────────────────────────────────────────┐
                    │       特征命中聚合与模型阈值过滤           │
                    │   (按各成员库校准的 GA/TC Cutoffs 判定)   │
                    └────────────────────┬─────────────────────┘
                                         ▼
                    ┌──────────────────────────────────────────┐
                    │          InterPro 条目层级归类           │
                    │       (Family / Domain / Repeat / Site)  │
                    └────────────────────┬─────────────────────┘
                                         │
                     ┌───────────────────┴───────────────────┐
                     ▼                                       ▼
            【Gene Ontology (GO) 映射】             【代谢与生化通路映射】
             分子功能 (MF) / 生物过程 (BP)           Reactome Pathways
             细胞组分 (CC) (基于 DAG 真路径)         MetaCyc / KEGG
```

### 1. 核心比对机制与严格阈值系统
- **Profile HMM（HMMER3 加速引擎）**：Pfam、SMART、SUPERFAMILY 等数据库使用 HMMER3 架构。为平衡灵敏度与假阳性，Pfam 采用专门校准的**收集阈值（Gathering Cutoff, GA）**作为严格准入线，唯有对数似然比（Bit Score）超越 GA 阈值的命中才被判定为真实结构域；
- **PANTHER 系统发育树模型**：将植物蛋白质细分至祖先亚家族级别，能够辅助区分全基因组复制后发生早期演化分化的大基因家族成员；
- **物理与拓扑特征模型**：整合 Phobius、TMHMM、SignalP 及 MobiDB-lite，无缝检测蛋白质的跨膜螺旋数目、N 端导向信号肽及固有无序区域（Intrinsically Disordered Regions, IDRs）。

### 2. 自动化受控词表（GO）与通路映射
InterPro 团队人工构建了 InterPro 条目与 Gene Ontology 术语之间的交叉映射表（InterPro2GO）。当某个植物蛋白质成功匹配一个具有明确生化功能的 InterPro 结构域时（例如 `IPR000719`，蛋白激酶催化结构域），InterProScan 会自动赋予其对应的 GO 分子功能（如 `GO:0004672`）与细胞组分，避免了研究者手动编写脚本解析的复杂性与错误风险。

---

## 输入、命令、输出

### 1. 输入数据规范
- **单转录本优先**：每个基因仅提取最长 CDS 翻译的多肽序列，防止多个可变剪接异构体造成功能富集统计偏差；
- **序列字符清洗**：确保氨基酸序列仅包含 IUPAC 标准单字母代号，清除末尾的 `*` 终止符号，移除非标准氨基酸。

### 2. 推荐高性能运行模板

```bash
# 高性能多核集群推荐生产命令
interproscan.sh \
  --input plant_primary_proteins.fa \
  --output-file-base plant_interpro_results \
  --format TSV,GFF3,JSON \
  --goterms \
  --pathways \
  --cpu 32 \
  --tempdir /scratch/tmp_ips \
  --disable-precalc
```

**核心选项剖析**：
- `--goterms`：激活 GO 术语查询与继承映射；
- `--pathways`：提取关联的 Reactome 与 KEGG 代谢网络路径；
- `--disable-precalc`：在无公网访问权限的计算集群节点上禁用 EBI 在线哈希比对预计算缓存，完全基于本地安装的数据库模型独立计算，保障科研数据安全性与完全离线可复现性；
- `--appl Pfam,SMART,CDD,SUPERFAMILY,PANTHER`：若计算资源有限，可显式指定运行核心模块，大幅缩短计算时间。

### 3. 核心输出字段深度解析
TSV 格式（Tab-separated values）是下游生物信息学分析最常用的表格，标准包含 14 列关键信息：

| 列号 | 字段名称 | 示例数据 | 科学含义与解释 |
| :--- | :--- | :--- | :--- |
| **Col 1** | Protein Accession | `Zm00001d000001_P01` | 输入蛋白质的唯一序列标识符 |
| **Col 2** | Sequence MD5 | `3b8d4f...` | 蛋白质序列的 MD5 校验哈希值 |
| **Col 3** | Sequence Length | `450` | 蛋白质全长氨基酸残基数 |
| **Col 4** | Analysis Database | `Pfam` | 产生该命中的成员数据库名称 |
| **Col 5** | Signature Accession | `PF00069` | 成员数据库原始模型标识符 |
| **Col 6** | Signature Description | `Protein kinase domain` | 结构域的文字描述 |
| **Col 7-8**| Start - End | `120 - 380` | 该结构域在输入序列中的起始与终止氨基酸物理坐标 |
| **Col 9** | Score / E-value | `1.2e-45` | 模型比对显著性指标（对数分值或期望值） |
| **Col 10**| Status | `T` | 状态标志（`T` 表示通过该数据库的预设阈值） |
| **Col 11**| Date of Run | `25-11-2026` | 分析执行日期 |
| **Col 12**| InterPro Accession | `IPR000719` | 整合映射后的 InterPro 核心条目编号 |
| **Col 13**| InterPro Description | `Protein kinase domain` | InterPro 标准受控描述 |
| **Col 14**| GO Annotations | `GO:0004672\|GO:0005524` | 自动映射获得的受控 Gene Ontology 术语（以管道符分隔） |

---

## 参数选择与结果解读

- **结构域与全家族的区别**：
  - `Domain` 级命中（如 LRR、Kinase）代表局部功能模块，一个蛋白往往串联多个结构域；
  - `Family` 级命中（如 PANTHER 的亚家族）通常需要全长序列的高度吻合；
  - 在统计基因家族数量时，严禁将一个含有 3 个重复 LRR 结构域的蛋白质错误计数为 3 次；必须以蛋白质实体为统计单位；
- **植物抗病 NBS-LRR 基因全景判读**：
  - 典型的胞内抗病受体包含三个特征模块：N 端的 TIR（`IPR000157`）或 CC 卷曲螺旋、中部的 NB-ARC 核苷酸结合催化中心（`IPR002182`）、C 端串联的 LRR 富亮氨酸重复（`IPR032675`）；
  - 只有通过 InterProScan 确认其结构域坐标拓扑正确排列，方可归类为完整的 CNL（CC-NBS-LRR）或 TNL（TIR-NBS-LRR）抗病蛋白。

---

## 植物应用与资源

- 芒果染色体级基因组项目：系统运行 InterProScan 5 对全基因组 31,881 个蛋白进行结构域注释，成功定位了萜烯合酶（TPS）等特化代谢物合成酶的关键活性位点。[The Plant Genome, 2024](https://doi.org/10.1002/tpg2.20441)。
- 官方 GitHub 仓库：[ebi-pf-team/interproscan](https://github.com/ebi-pf-team/interproscan)
- InterPro 官方文档：[InterProScan Docs](https://interproscan-docs.readthedocs.io/)
- 奠基方法论文：[Jones et al., *Bioinformatics*, 2014](https://doi.org/10.1093/bioinformatics/btu031)
- InterPro 2023 数据库架构：[Paysan-Lafosse et al., *Nucleic Acids Res.*, 2023](https://doi.org/10.1093/nar/gkac993)
- 关联专题：[基因功能注释原理](../../topics/genome-annotation/m02-topic-06/)、[基因组注释质量评估](../../topics/genome-annotation/m02-topic-07/)。
