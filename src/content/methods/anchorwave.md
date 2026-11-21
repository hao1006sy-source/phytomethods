---
title: AnchorWave
name: AnchorWave
summary: 以保守基因锚点和复制背景组织植物全基因组比对。
dataType: 基因组 FASTA / GFF3 或 GTF 注释
principle: 共线锚点与两段仿射区块比对
domainIds: [pangenomics-structural-variation]
topicIds: [m03-topic-02]
principleIds: [alignment, collinearity]
dataIds: [assembly, annotation-input]
paper: anchorwave-paper
repository: https://github.com/baoxingsong/AnchorWave
status: draft
updatedAt: 2026-11-21
---
## 简介与开发背景
AnchorWave（Anchored Wavefront Alignment）由 Song 等开发，面向序列分化明显、结构多态性丰富且经历不同全基因组复制历史的基因组比对。方法以保守编码序列的共线锚点组织比对，减少整条植物染色体直接做高成本全局动态规划的需要。[方法论文](https://doi.org/10.1073/pnas.2113075119)。

截至 2026-11-21，官方仓库发布页列出 v1.3.0，仓库许可为 MIT。该版本不仅是论文 2022 年方法的原样封装：现版 README 描述了多种精确/回退序列比对实现及动态选择；本文把论文算法贡献与该版本的软件实现分别说明。[官方仓库及 README](https://github.com/baoxingsong/AnchorWave)、[发布页](https://github.com/baoxingsong/AnchorWave/releases)、[许可证](https://github.com/baoxingsong/AnchorWave/blob/master/LICENSE)。本机未运行 AnchorWave。

## 研究问题与计算原理
一条植物染色体中可能同时出现长距离序列差异、转座子、倒位、复制和染色体融合。仅凭局部相似种子容易将重复拷贝错误连接；直接对大型区间做碱基级全局比对则计算量高。AnchorWave 提取参考注释中的全长 CDS（或按选项使用外显子），把基因序列映射到参考和查询组装，利用锚点的相对位置与拷贝/复制先验组织共线块，再对锚点与锚点间隔做序列比对。

抽象地说，对兼容的有序锚点 $a_i$，算法为各候选链累计权重并扣除跳跃代价；分叉、重复锚点和不兼容的方向需要切分或选择备选链。该类链式规划是论文所述最长路径锚点组织思想的概念表达，不是工具源码某一具体变量的完整递推。

论文的两段仿射 gap 代价可用正代价约定写为

$$
g(k)=\min(o_1+k e_1,\;o_2+k e_2), \quad k\ge1.
$$

$k$ 为 gap 长度；两组开隙/延伸参数分别适应较短与较长的插入缺失。工具参数以负惩罚值表示，且前端参数名采用 `-O1`、`-E1`、`-O2`、`-E2`；实际分数公式和符号需按当前版本理解。长间隔若直接做精确全局比对会耗费较多时间和内存，现版会在配置约束下尝试新锚点切分，并在必要时使用回退策略。

## 版本化的软件流程
1. **准备注释锚点。** `gff2seq` 从参考 GFF3/GTF 与 FASTA 读取 CDS，或按设置选择外显子，提取每个基因的全长序列。若设置了最小外显子长度 `-m`，需在提取和后续对齐命令保持一致。
2. **将锚点映射到两个组装。** 使用剪接感知的 minimap2 或 GMAP，将提取序列映射至参考和查询，分别生成 SAM 文件。参考、注释和两个 FASTA 的命名、版本必须一致；染色体命名相同是 `genoAli` 按染色体端到端配对的重要条件。
3. **组织共线区块。** `genoAli` 适用于按同名染色体组织的整染色体全局比对，并可通过 `-IV` 考虑倒位；`proali` 面向重定位、染色体融合或不同 WGD 历史，要求研究者预先设定 `-R` 和 `-Q` 参考/查询最大匹配深度。软件不会自动推断物种经历过几轮 WGD 或哪个重排最可信。
4. **细化并拼接区间。** 现版在锚点和锚间隔采用 WFA、KSW2 等精确方法及其受限回退方案，按区块组合全基因组比对。可选 `-b` 输出每个区间实际使用的比对方法。
5. **检查与转换。** 检查锚点文件、完整 MAF、分区 MAF、日志和区间算法报告。若转换成 SAM/BAM/PAF 或其他格式，需要固定转换软件及版本，SyRI 等下游程序要求其输入结构满足相应规范。

## 输入、输出与官方示例
主要输入包括参考 GFF/GTF、参考 FASTA、查询 FASTA、`gff2seq` 产生的锚点序列 FASTA，以及把锚点映射到查询和参考后生成的 SAM。

官方 README 中的最小流程结构如下（文件名根据自己的材料替换）：

```bash
anchorwave gff2seq -i reference.gff3 -r reference.fa -o anchors.fa
minimap2 -x splice -t 10 -k 12 -a -p 0.4 -N 20 query.fa anchors.fa > query.sam
minimap2 -x splice -t 10 -k 12 -a -p 0.4 -N 20 reference.fa anchors.fa > reference.sam
anchorwave genoAli -i reference.gff3 -as anchors.fa -r reference.fa \
  -a query.sam -ar reference.sam -s query.fa -n anchors.txt \
  -o alignment.maf -f fragments.maf
```

这是官方文档中的命令模式，尚未在本机执行；参数组合和输出需以安装版本帮助为准。发生染色体重排或不同 WGD 深度时，应依据分析目的评估 `proali`，并由研究者根据共线/复制证据设定 `-R`、`-Q`，不能照搬玉米与高粱的示例数值。

| 参数/输出 | 含义与解释 |
| --- | --- |
| `-i`、`-r`、`-s` | 参考 GFF/GTF、参考 FASTA、目标/query FASTA |
| `-as`、`-a`、`-ar` | 锚点 FASTA、锚点到查询的 SAM、锚点到参考的 SAM |
| `-n` | 锚点及共线块信息文件，可用于检查链组织 |
| `-o` | 合并后的 MAF 全基因组区块比对 |
| `-f` | 各锚点/锚间区间的片段化 MAF |
| `-R`、`-Q` | `proali` 的参考/查询最大匹配覆盖深度；应根据复制关系设置 |
| `-IV` | `genoAli` 中是否考虑倒位，默认关闭 |
| `-fa3` | 新锚点搜索间隔阈值；v1.3.0 默认 50,000，旧版默认曾为 100,000 |
| `-w` | 对齐窗口预算参数；v1.3.0 默认 100,000，README 估计常规每次对齐约 9.3 GiB，精确算法内存可能超过该估算 |
| `-mi`、`-mi2` | CDS 与新锚点相似度阈值；版本默认分别为 0.95 与 0.2 |

参数表反映官方 v1.3.0 README 快照。`-M` 是进程内预测内存包络，不是操作系统硬限制；任务调度器或容器限制仍需单独配置。`-fa3` 会影响新锚点搜索和区块切分；变更后需保存完整命令并重新评估结果。

## 与相邻方法的差异
MUMmer4 与 minimap2 提供通用序列/组装比对；AnchorWave 利用注释锚点及预先给定的复制深度约束，适合复杂植物基因组中的共线区块比对；SyRI 在已有组装比对上解析共线、重排和局部变异；reads-based SV callers 则直接解释 reads 断点、配对或覆盖证据。它们所回答的研究问题与输出层级不同，工具不可相互替代。

AnchorWave 依赖基因注释和可靠锚点；若 GFF/GTF 质量差、材料之间保守基因命名不一致或锚点在重复家族中多重匹配，候选共线链会受影响。对于没有足够锚点的局部复制或易位，论文指出可能被表示为间隙而非完整重排；应结合其他比对、图结构或实验验证。

## 植物应用与方法论文
原始论文在玉米及其他植物组装上评估全基因组比对，并讨论转座子丰富区域、序列多样性、结构多态性和 WGD 变化对比对的影响。论文结果是各自数据与比较方案下的结果，不能泛化到所有材料。[PNAS 原文](https://doi.org/10.1073/pnas.2113075119)、[PubMed 作者和书目信息](https://pubmed.ncbi.nlm.nih.gov/34934012/)。

## 实战教程与上下游资源
本项目当前没有经实跑验证的 AnchorWave 教程。开始实践时，先用小型同源染色体检查注释版本、锚点数量、方向、共线链和 fragment MAF；再按预期重排/WGD 选择 `genoAli` 或 `proali`。官方另提供 [植物流程教程](https://github.com/baoxingsong/AnchorWave/blob/master/README.md)、[安装说明](https://github.com/baoxingsong/AnchorWave/blob/master/installation.md)和[命令参数](https://github.com/baoxingsong/AnchorWave)。

相关专题为[全基因组比对](../topics/pangenomics-structural-variation/m03-topic-02/)，相关论文为[AnchorWave 方法论文](../papers/anchorwave-paper/)；上游需要高质量组装和一致基因注释，下游可用 SyRI 解析重排，也可用共线图、组装图和原始 reads 检查候选区段。
