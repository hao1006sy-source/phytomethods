---
title: "Toward a standardized framework for pangenome graph evaluation: assessing crop plant pangenome variation graph construction from multiple assemblies"
summary: "以高粱为主模型，分开评估多种泛基因组图的内容覆盖、结构变异检测和读段映射，并将部分分析扩展到三种作物。"
authors: "Venkataramana Kopalli, Kübra Arslan, Noemia Morales-Díaz, Silvia F Zanini, Agnieszka A Golicz"
year: 2025
journal: GigaScience
doi: 10.1093/gigascience/giaf121
type: application
methodIds: [minigraph, pggb, minigraph-cactus, syri, vg, odgi]
domainIds: [pangenomics-structural-variation]
speciesIds: [sorghum]
status: draft
updatedAt: 2026-11-21
---

## 研究问题与数据

Kopalli、Arslan、Morales-Díaz、Zanini 与 Golicz 比较 Minigraph、PGGB 和 Minigraph-Cactus 在作物多组装泛基因组中的图内容、变异检测与下游读段映射表现，并提出从图完整度、重复水平和结构变异一致性等方面开展评价的框架。论文以六份高粱组装为主要数据集，材料覆盖 *Sorghum bicolor* 的不同亚种及近缘种 *S. propinquum*；作者报告这些组装均采用混合测序方案，contig N50 最高约 3.5 Mb，BUSCO 完整度均高于 95%。高粱分析另将 *S. bicolor* v3.0.1 作为图构建和读段映射的线性参考。扩展分析使用大豆、大麦和油菜组装。

研究包含两类证据任务。模拟组装具有已知结构变异真值，可用于计算变异检测 F1 和模拟读段定位正确率；真实组装及公开真实读段用于比较组装覆盖、图内容、变异重叠和实际映射指标。两类任务的评价目标与分母不同，以下分开报告。

## 计算流程与工具版本

| 分析环节 | 论文使用的方法 | 版本或用途 |
| --- | --- | --- |
| 图构建 | Minigraph、PGGB、Minigraph-Cactus | 0.21、0.5.4、2.7.2；按染色体构图 |
| 图处理与统计 | ODGI、Panacus | ODGI 0.8.6；图展平、路径/覆盖与图增长统计；Panacus 0.2.3 |
| 图路径变异提取 | VG deconstruct | VG 1.54.0；以参考路径为坐标并处理图中的 snarl |
| 组装间变异比较 | Minimap2、SyRI、SVIM-asm | Minimap2 2.26-r1175 提供全基因组比对；SyRI 1.6.3 与 SVIM-asm 1.0.3 调用组装间变异 |
| 模拟真值评估 | Truvari bench | 4.1.0；将调用结果与已知变异真值比较并计算 F1 |
| 图完整度与读段映射 | BUSCO、VG Giraffe、Minimap2 | BUSCO 6.0.0 使用 poales_odb10；Giraffe 1.58.0；线性参考比对使用 Minimap2 |

图构建与下游变异识别属于不同层级：图流程以多个组装建立序列图，再由 VG deconstruct 从图中解析路径变异；SyRI 与 SVIM-asm 则依据组装对线性比对结果分析差异。论文的工具清单还包括 bcftools、Jasmine、EDTA、BLASTN、Liftoff 和 regioneR，这些工具分别服务于变异规范化/合并、重复序列相似性、基因映射和区域重叠统计。

## 模拟组装：结构变异检测与图内容

对含已知结构变异的模拟组装，SVIM-asm 的总体 F1 为 0.93，SyRI 为 0.91，Minigraph-Cactus 为 0.89，PGGB 为 0.83。Minigraph 在该模拟设置中检出的变异数量过少，论文未据此给出可解释的 F1。该结果只衡量此模拟真值、输入与参数下的 SV 检测表现。

模拟组装图的总碱基规模分别为 PGGB 851 Mb、Minigraph-Cactus 795 Mb、Minigraph 878 Mb；平均节点数约为 190,000、220,000 和 950。Minigraph 的平均节点长度约 968,806 bp，PGGB 和 Minigraph-Cactus 则分别约 4,517 bp 与 3,714 bp。六份模拟输入组装的平均 BUSCO 完整度和重复率为 98.4% 与 1.6%，相应三种模拟图展平序列的均值为 98.4% 与 1.7%。节点规模和长度描述图表示粒度，不等同于结构变异准确率。

## 真实组装：图规模、覆盖和完整度

以六份真实高粱组装构图时，PGGB、Minigraph-Cactus 与 Minigraph 的报告图规模分别约为 4.7 Gb、4.2 Gb 和 920 Mb；线性参考约为 688 Mb。Minigraph 在该分析中仅纳入长度大于 50 bp 的变异，PGGB 与 Minigraph-Cactus 采用的长度过滤设置不同。阅读图规模时需结合这些筛选条件。

| 评价项 | 输入组装均值 | Minigraph-Cactus | PGGB | Minigraph |
| --- | ---: | ---: | ---: | ---: |
| BUSCO 完整度 | 95.4% | 94.5% | 98.7% | 99.4% |
| BUSCO 重复率 | 2.0% | 16.5% | 16.0% | 2.7% |
| 输入组装在图中的覆盖 | — | 各组装均高于 94% | 各组装均高于 94% | 平均约 83% |

BUSCO 在此用于评估从图路径展平得到的序列。论文另以参考 BUSCO CDS 产生的 21-mer 检查图展平序列的单拷贝与多重映射情况，作为图中重复表示的补充指标。图节点切分方式会影响基因在展平结果中的呈现，组装覆盖、BUSCO 和 k-mer 结果需合并解读。

在图中未恢复的组装区域，作者逐份检查了缺失基因数：AusTRCF317961 为 1，IS19953 和 IS8525 各 4，PI532566 为 14，Rio 为 3，S369-1 为 25；这些计数来自图中未回收的相应组装区域。该项与整条组装覆盖比例共同反映输入序列的图表示情况。

## 真实组装：变异结果

真实组装分析采用已发表高粱变异集进行 100 次区域置换重叠检验。三种图流程与已发表变异集的重叠均达到置换检验 *P* = 0.0099；该统计量衡量观察区域重叠相对于随机化背景的显著性。逐变异精确率与召回率由带真值的模拟数据 F1 任务衡量。

小变异结果也随方法而变。Minigraph-Cactus 报告约 770 万 SNP 和 230 万小于 50 bp 的 indel；PGGB 约 760 万 SNP 和 260 万小 indel；SyRI 约 320 万 SNP 和 93 万小 indel；SVIM-asm 不调用 SNP，并报告约 1.1 万小 indel。Minigraph-Cactus、PGGB 和 Minigraph 分别报告约 59 万、56 万和 4.6 万个多等位位点。不同调用器的变异类别和过滤流程不同，数量表示各流程在该数据集上的输出规模。

重复序列分析显示，PGGB 与 Minigraph-Cactus 的全部变异中约 28% 与高粱重复序列库匹配；在覆盖度大于 80% 的匹配条件下，比例分别为 7.5% 和 11%。两种方法各自独有的变异集合中，与重复位置相似的序列比例分别为 PGGB 48%、Minigraph-Cactus 38%。这些结果说明重复序列区域是图变异解释与独有调用复核的重要对象。

## 读段映射：模拟数据与真实数据

### 带定位真值的模拟读段

作者从包含六份输入组装和参考组装的泛基因组图生成 100 万条 150 bp 模拟读段；模拟错误率为 0.24%，indel 率为 0.029%，插入片段均值 570 bp、标准差 165 bp。图索引映射使用 VG Giraffe，线性参考映射使用 Minimap2。论文以读段是否回到其模拟来源基因组位置定义正确映射，并分别报告不同最小 mapping quality（min_mapQ）阈值下的指标。

| 图/参考与映射器 | min_mapQ = 60 的报告结果 | min_mapQ = 1 的总读段正确映射比例 |
| --- | --- | ---: |
| Minigraph-Cactus 图 / Giraffe | 映射 38.27%；正确映射率 99.68% | 79.60% |
| Minigraph 图 / Giraffe | 映射 74.62%；正确映射率 95.08% | 91.91% |
| 线性参考 / Minimap2 | 映射 48.67%；正确映射率 58.18% | 35.49% |

论文将 Minigraph 图的较高模拟读段映射表现与其较低图复杂度联系起来；该图构建设置主要纳入大于 50 bp 的变异，小变异由此未进入图表示。图复杂度、过滤阈值和 min_mapQ 会共同影响映射率与正确率，结果需结合这些设定解读。

### 公开真实 paired-end reads

真实读段比较报告的总比对率与完美比对比例如下。Minimap2 的总比对率为 82.47%，图方法 Minigraph-Cactus 与 Minigraph 分别为 73.44% 和 73.27%；完美比对比例分别为 Minigraph-Cactus 82.77%、Minigraph 78.13%、Minimap2 68.77%。这两组指标描述不同读段对齐属性，应并列阅读。PGGB 索引构建因计算和内存需求未完成，论文映射比较覆盖 Minigraph-Cactus、Minigraph 与 Minimap2 三种方案。

## 跨作物扩展与方法适用范围

作者将图规模、完整度、重复和变异分析扩展到大豆、大麦与油菜，并对部分物种开展图上映射比较。主文报告的趋势与高粱分析相近：PGGB 和 Minigraph-Cactus 图通常比 Minigraph 图包含更多节点与序列，Minigraph 在多个作物中缺失的组装序列比例较高。跨作物结果支持这些指标在不同植物基因组中的比较用途，细节数值见原文补充表。

研究使用逐染色体构图，以降低资源负担并简化结果管理；跨染色体连接可使用全基因组图等设计另行分析。作者报告的运行代码为 [Benchmarking_graph_pipelines](https://github.com/KopalliV/Benchmarking_graph_pipelines)，仓库标示 GPL-3.0；论文系统要求列出 Linux、至少 32 CPU 核、128 GB RAM 与约 2 TB 存储。

## 阅读结果时应区分的指标

1. 图文件大小、节点数和路径覆盖描述图的表示规模与输入序列回收情况。
2. BUSCO 与 21-mer 映射分别从保守基因完整度和序列重复角度评估展平图，联合阅读可补充两类信息。
3. 模拟数据 F1 依赖已知真值，可比较特定模拟设置下的调用结果；真实数据的置换检验评估与既有变异区域的重叠。
4. 读段映射需同时阅读总比对率、正确映射率或完美比对比例，并注明真实/模拟数据和 min_mapQ。
5. 变异长度过滤不同会改变图大小、可表示变异和映射复杂度；解释比较时应连同输入组装、过滤条件及计算资源一起报告。

## 文献与数据

- [出版方论文与 DOI](https://doi.org/10.1093/gigascience/giaf121)
- [PMC 开放全文及补充材料入口](https://pmc.ncbi.nlm.nih.gov/articles/PMC12676463/)
- [作者提供的分析代码](https://github.com/KopalliV/Benchmarking_graph_pipelines)

本页面依据出版方全文和 PMC 正文整理，仍保持草稿，待完成全站跨领域关联闭包和发布态审核后再公开。
