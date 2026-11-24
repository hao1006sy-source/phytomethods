---
title: BRAKER3
name: BRAKER3
summary: 深度整合 RNA-seq 剪接比对与 OrthoDB 同源蛋白证据，协同运行 GeneMark-ETP、AUGUSTUS 与 TSEBRA 的全自动真核生物基因结构预测管线。
dataType: 软屏蔽基因组 FASTA / RNA-seq 剪接比对 BAM / 同源蛋白质 FASTA
principle: 广义隐马尔可夫模型自训练、异质转录与同源证据约束及 TSEBRA 候选模型裁决
domainIds: [genome-annotation]
topicIds: [m02-topic-01, m02-topic-03, m02-topic-04]
principleIds: [annotation]
dataIds: [annotation-input]
paper: braker3-paper
repository: https://github.com/Gaius-Augustus/BRAKER
version: v3.0.3+（随官方仓库维护；新分析建议同步关注开发组发布的 BRAKER4）
updatedAt: 2026-11-25
---

## 简介与开发背景

蛋白质编码基因结构注释（Gene Structural Annotation）是真核生物基因组解析的核心难点。传统的 *Ab Initio* 从头预测算法（如早期单机版 AUGUSTUS 或 GeneMark-ES）高度依赖先验训练好的马尔可夫参数；在缺乏大规模手工校对训练集的物种中，极易产生外显子错连、假阳性短单外显子基因及断裂转录本。而纯粹基于转录组拼接（如 RNA-seq *de novo* 或参考引导装配）又无法覆盖在特定组织、环境逆境或极微弱水平表达的发育调控基因。

**BRAKER3** 是真核生物基因结构注释领域的集大成流程（Gabriel et al., *Genome Research*, 2024）。它将 **GeneMark-ETP**、**AUGUSTUS**、**ProtHint** 与 **TSEBRA** 深度有机集成，彻底解决了真核生物基因预测中“如何无需预先人工构建训练集、全自动整合 RNA-seq 剪接比对与大规模同源蛋白证据”的长期痛点。在拟南芥、番茄、玉米等植物基准测试中，BRAKER3 在外显子与完整转录本层面的预测灵敏度与特异性均显著超越前代工具（BRAKER1/2）。

---

## 问题与算法流程

BRAKER3 的本质是一套多阶段证据自增强与模型裁决流水线，整体架构包含以下核心环节：

```
                ┌──────────────────────────────────────────┐
                │        软屏蔽基因组 (Soft-masked FASTA)  │
                └────────────────────┬─────────────────────┘
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
   【RNA-seq 剪接证据】                                【同源蛋白证据】
   短读/长读比对生成 BAM (含剪接链标签)               OrthoDB 谱系参考多肽集
           │                                                   │
           ▼                                                   ▼
   提取 Intron Hints                               ProtHint 计算高置信比对
           │                                                   │
           └─────────────────────────┬─────────────────────────┘
                                     ▼
                ┌──────────────────────────────────────────┐
                │              GeneMark-ETP                │
                │   整合双重 Hints 进行初始无监督自训练      │
                │   产生高置信度全长基因候选与训练基因集   │
                └────────────────────┬─────────────────────┘
                                     │
                                     ▼
                ┌──────────────────────────────────────────┐
                │          AUGUSTUS (GHMM 预测)            │
                │   基于 GeneMark 生成的物种特异性参数训练   │
                │   在 Hints 软约束下求解全局最优外显子链  │
                └────────────────────┬─────────────────────┘
                                     │
                                     ▼
                ┌──────────────────────────────────────────┐
                │            TSEBRA 模型仲裁筛选           │
                │   依据转录支持率、蛋白匹配度与内含子链一致性│
                │   合并 GeneMark 与 AUGUSTUS 输出最终 GTF │
                └──────────────────────────────────────────┘
```

### 1. 证据产生与 ProtHint 高敏对齐
- **RNA-seq 内含子 Hints**：从剪接敏感的比对 BAM 中提取内含子边界坐标及支持读段数（Coverage），保留精确的 `GT-AG`（或少数规范 `GC-AG`）剪接供体/受体位点信息；
- **ProtHint 同源映射**：同源蛋白通过 DIAMOND 在基因组候选区域比对后，由 ProtHint 进一步细化比对末端与剪接边界，推断可靠的起始密码子、终止密码子及外显子内部保守块。

### 2. GeneMark-ETP 与自训练参数迭代
GeneMark-ETP 利用这些初始 Hints，在不需要任何外部人工训练集的前提下，自动迭代学习目标植物基因组的 GC 含量、密码子使用偏好（Codon Bias）、内含子与外显子长度分布概率，生成高纯度的初始预测基因集。

### 3. AUGUSTUS 广义隐马尔可夫模型求解
将 GeneMark 自动筛选出的一致性极高基因模型作为 AUGUSTUS 的物种训练集，自动拟合 AUGUSTUS 复杂的 GHMM 转移与发射状态参数。随后在全基因组范围内，AUGUSTUS 结合所有外部比对 Hints 作为外生惩罚/奖励权重，通过 Viterbi 算法解码全局最优的隐状态路径，精确预测全长 CDS。

### 4. TSEBRA 综合模型裁决
**TSEBRA（Transcript Selector for BRAKER）**对 GeneMark-ETP 和 AUGUSTUS 分别生成的重叠转录本候选进行规则仲裁：优先保留剪接位点与外部转录组 100% 吻合、且编码区域被同源蛋白充分覆盖的模型，果断剔除缺乏外部证据支持的突触式假阳性冗余。

---

## 输入、命令与输出

### 1. 输入数据准备
- **软屏蔽基因组 FASTA**：转座子区域转为小写字母，严禁使用全硬屏蔽（全大写 N 会直接切断连续长外显子）；
- **RNA-seq BAM 格式要求**：比对工具必须保留剪接链属性。
  - 使用 HISAT2 时必须添加 `--dta` 参数：
    ```bash
    hisat2 --dta -x genome_idx -1 read1.fq.gz -2 read2.fq.gz | samtools sort -o rnaseq.bam
    ```
  - 使用 STAR 时必须指定 `--outSAMstrandField intronMotif`；
- **同源蛋白 FASTA**：强烈建议直接下载 OrthoDB 对应植物门类的整理蛋白质集（例如 `Viridiplantae.fa` 或 `Embryophyta.fa`）。

### 2. 标准运行命令模板

```bash
braker.pl \
  --genome=assembly.softmasked.fa \
  --bam=rnaseq_merged.bam \
  --prot_seq=orthodb_viridiplantae.fa \
  --busco_lineage=embryophyta_odb10 \
  --threads=32 \
  --workingdir=/scratch/braker3_run \
  --gff3
```

**关键选项说明**：
- `--busco_lineage`：指定 BUSCO 谱系库，流程将自动调用 BUSCO 对训练基因集的完整性进行质控，确保训练参数具有代表性；
- `--gff3`：除默认 GTF 外，同时输出标准的 GFF3 格式。

### 3. 输出文件结构与质控重点
- `braker.gtf` / `braker.gff3`：**最终主输出文件**，经 TSEBRA 仲裁筛选后的高置信度全基因组基因结构模型；
- `braker.aa` / `braker.codingseq`：由预测基因模型翻译的氨基酸多肽序列及对应编码 CDS 序列；
- `hintsfile.gff`：从 RNA-seq BAM 与蛋白比对中提取的全部外显子与内含子特征边界坐标；
- `errors/` 与 `braker.log`：运行日志，重点核查 GeneMark 与 AUGUSTUS 各阶段返回的退出代码（Exit Code 0）。

---

## 参数选择与适用范围

- **证据的多样性与广度**：增加 CPU 线程只能缩短运行耗时，无法弥补 RNA-seq 样本组织单一导致的低表达基因假阴性。植物注释建议混合幼苗、根、茎、叶、花、果实及非生物逆境处理样本的比对 BAM；
- **异源同源蛋白的选择范围**：蛋白集并非越多越好。引入序列过短、质量低劣或非植物污染的蛋白会导致 ProtHint 产生大量假内含子 Hints；
- **多倍体与高杂合单倍型**：在异源多倍体植物（如普通小麦）中，不同亚基因组间的直系同源基因相似度可达 95% 以上，短读长 RNA-seq 容易产生多重比对（Multi-mapping reads），建议提高比对唯一性阈值（Unique Mapped Reads），以防止亚基因组间内含子边界交叉污染。

---

## 植物应用与资源

- 芒果（*Mangifera indica*）染色体级基因组：使用 BRAKER3 整合叶与花组织 RNA-seq 及近缘双子叶植物同源蛋白，成功准确注释出 31,881 个高可信度蛋白编码基因，BUSCO 蛋白完整度达到 97.4%。[The Plant Genome, 2024](https://doi.org/10.1002/tpg2.20441)。
- 官方 GitHub 仓库：[Gaius-Augustus/BRAKER](https://github.com/Gaius-Augustus/BRAKER)
- 方法学奠基论文：[Gabriel et al., *Genome Res.*, 2024](https://doi.org/10.1101/gr.278090.123)
- TSEBRA 模型仲裁：[Gabriel et al., *BMC Bioinformatics*, 2021](https://doi.org/10.1186/s12859-021-04482-0)
- 关联专题：[基因结构预测原理](../../topics/genome-annotation/m02-topic-03/)、[转录本辅助与剪接分析](../../topics/genome-annotation/m02-topic-04/)、[基因组注释质量评估](../../topics/genome-annotation/m02-topic-07/)。
