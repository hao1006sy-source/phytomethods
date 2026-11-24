---
title: Minigraph-Cactus
name: Minigraph-Cactus
summary: 结合 Minigraph 宏观结构变异骨架与 Cactus 碱基级多重联配，构建全碱基分辨率高质量植物图泛基因组并一键导出下游索引。
dataType: 多个染色体级组装 FASTA
principle: 参考引导结构变异骨架诱导、超泡分区分治与 Cactus 局部单碱基全联配
domainIds: [pangenomics-structural-variation]
topicIds: [m03-topic-01, m03-topic-03, m03-topic-04, m03-topic-05]
principleIds: [graph-genomics]
dataIds: [assembly]
paper: minigraph-cactus-paper
repository: https://github.com/ComparativeGenomicsToolkit/cactus
status: published
updatedAt: 2026-11-25
---

## 研究问题与原理

在植物泛基因组研究中，构建包含数十个高质量单倍型参考基因组的拓扑序列图面临两大极端矛盾：
1. **纯全对全多重比对（如早期 Cactus 或全比对工具）**：在吉碱基（Gb）级植物基因组上算力消耗极端恐怖，且极易因转座子串联重复导致全局比对彻底崩溃；
2. **纯快速图构建工具（如单独的 Minigraph）**：虽然计算速度极快，但其算法原生仅保留 $\ge 50\text{ bp}$ 的长片段结构变异，彻底丢失了所有单核苷酸多态性（SNPs）与小型 InDels，无法作为短读段高精度变异分型与 GWAS 关联分析的底图。

**Minigraph-Cactus**（Hickey et al., *Nature Biotechnology*, 2023）由 UC Santa Cruz 比较基因组学联合开发，完美化解了上述矛盾。其核心思路是**分层分治（Hierarchical Divide-and-Conquer）**：首先利用 Minigraph 快速确立宏观结构变异拓扑骨架并切割为离散的超泡（Snarls），随后调用 Cactus 引擎在每一个局部超泡内部并行填充单碱基全联配，最终生成兼顾宏观染色体结构重排与微观单碱基精度的工业级图泛基因组。

---

## 核心工作流与阶段分工

Minigraph-Cactus 在 Toil 分布式工作流框架下高度自动化运行，分为五个严密的子阶段：

```
                ┌──────────────────────────────────────────┐
                │   多组装 FASTA 清单 (genomes.tsv / seqfile)│
                └────────────────────┬─────────────────────┘
                                     │
                                     ▼
                ┌──────────────────────────────────────────┐
                │        阶段 1: Minigraph 宏观构图         │
                │        生成仅含 SVs 的骨架图 (*.sv.gfa)   │
                └────────────────────┬─────────────────────┘
                                     │
                                     ▼
                ┌──────────────────────────────────────────┐
                │        阶段 2: 按参考染色体分区与解构     │
                │        识别保守锚点，切分为数千个局部 Snarl │
                └────────────────────┬─────────────────────┘
                                     │
                                     ▼
                ┌──────────────────────────────────────────┐
                │        阶段 3: Cactus 局部单碱基联配     │
                │        在每个 Snarl 内部重构高密度多重图  │
                └────────────────────┬─────────────────────┘
                                     │
                                     ▼
                ┌──────────────────────────────────────────┐
                │        阶段 4: 拓扑平滑与假阳性过滤      │
                │        (vg clip 剔除高频非特异性极短碎片) │
                └────────────────────┬─────────────────────┘
                                     │
                                     ▼
                ┌──────────────────────────────────────────┐
                │        阶段 5: 一体化多格式与索引导出     │
                │        *.gfa.gz (带 W-lines), *.gbz      │
                │        *.dist, *.min (用于 Giraffe), VCF │
                └──────────────────────────────────────────┘
```

---

## 输入、输出与生产命令模板

### 1. 输入数据准备（Seqfile 规范）
需要准备一个制表符分隔的 `genomes.tsv` 文本文件，逐行定义样本名称与其对应的单倍型 FASTA 绝对路径：
```text
Nipponbare    /data/genomes/Nipponbare.fasta
9311          /data/genomes/9311.fasta
MH63          /data/genomes/MH63.fasta
Rufipogon     /data/genomes/Rufipogon.fasta
```
*要求*：选定作为参考基因组的样本（如 `Nipponbare`）必须具备染色体级别组装，且各染色体 Header 命名规范（如 `Chr1`~`Chr12`）。

### 2. 标准运行命令模板

```bash
# 标准全功能图泛基因组构建与下游索引一键生成
cactus-pangenome ./jobStore genomes.tsv \
  --reference Nipponbare \
  --outDir ./rice_pangenome_out \
  --outName rice_pan \
  --gbz \
  --giraffe \
  --vcf \
  --maxCores 32 \
  --maxMemory 128G
```

**关键选项深度解析**：
- `--reference <NAME>`：**极其关键**，指定主参考单倍型。主参考决定了图的线性坐标反向投影基准与 VCF 变异调用的参考等位基因定义；
- `--gbz`：输出用于存储全图拓扑与全样本单倍型路径的紧凑二进制文件（GBWTGraph + GBWT）；
- `--giraffe`：自动计算并导出 `vg giraffe` 短读段比对所需的 `.dist`（距离索引）与 `.min`（Minimizer 索引）；
- `--vcf`：自动将图中的全部变异分解并投影回参考坐标，导出多样本联合基因型 VCF 文件；
- `--clip <INT>`：剪切过滤由于测序错误引入的极端低频短突触分支（默认为自动调优）。

### 3. 产出文件体系
- `rice_pan.sv.gfa.gz`：Minigraph 阶段生成的骨架结构变异图（供宏观 SV 分析）；
- `rice_pan.gfa.gz`：最终经 Cactus 填充全部单碱基多态性后的全量全景变异图（采用 GFA 1.1 规范，包含 `W` 路径行）；
- `rice_pan.gbz`：供下游 `vg` 体系高速读取的核心图文件；
- `rice_pan.dist` / `rice_pan.min`：Giraffe 读段比对专用索引；
- `rice_pan.vcf.gz`：基于参考基因组坐标的标准多样本变异矩阵。

---

## 植物基准与案例

- **野生稻图泛基因组（Nature Genetics 2025）**：
  Guo 等人在野生稻与栽培稻大规模比较中，使用 Minigraph-Cactus 整合 144 份高质量单倍型组装，成功构建了覆盖全水稻物种全碱基分辨率的序列图，检出高达 3.87 Gb 的非参考图节点序列，精准锁定了十余个调控耐涝与抗稻瘟病的新基因。[Guo et al., *Nat. Genet.*, 2025](https://doi.org/10.1038/s41588-024-02008-0)。
- **高粱泛基因组基准测试（GigaScience 2024 / 2026）**：
  在多物种植物基准测试中，Minigraph-Cactus 在变异真实召回率（F1 Score 0.89）与短读段回贴准确率上全面领先，成为当前植物学界公认最稳健的工业级构图管线。[Kopalli et al., *GigaScience*, 2024](https://doi.org/10.1093/gigascience/giaf121)。

---

## 软件版本与运行规范

- 官方 GitHub 仓库：[ComparativeGenomicsToolkit/cactus](https://github.com/ComparativeGenomicsToolkit/cactus)
- 奠基方法论文：[Hickey et al., *Nat. Biotechnol.*, 2023](https://doi.org/10.1038/s41587-023-01793-w)
- 关联专题：[泛基因组与核心/可变基因组](../../topics/pangenomics-structural-variation/m03-topic-01/)、[图泛基因组构建](../../topics/pangenomics-structural-variation/m03-topic-05/)、[图上的序列比对与变异分型](../../topics/pangenomics-structural-variation/m03-topic-06/)。
