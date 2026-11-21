# M04 比较基因组学证据记录

## 审核范围

本记录按专题列出截至 2026-11-22 已复核的关键定义、方法边界、原始植物案例和来源。案例页通过稳定 ID 连接专题、工具、论文与教程。M04 七篇专题、六个工具条目、相关论文及两篇教程已进入发布状态；CAFE5 教程按官方材料编写并标记“命令已核对、真实数据待验证”。

## M04-01 同源、直系同源与旁系同源

核对 homology 是共同祖先判断而非相似性百分比；orthology/paralogy 由基因树最近共同祖先处的物种分化/基因复制事件定义，关系以基因对为单位。补充复制后的共直系同源一对多关系、orthogroup 与 pairwise orthology 的区别，以及功能转移需要结合表达和位置证据。OrthoFinder 2019 论文定义 orthogroup 为在所分析物种共同祖先中的单个基因后代集合，并报告 orthogroup、gene trees、rooted species tree、duplication-loss-coalescence 分析输出。[方法论文](https://doi.org/10.1186/s13059-019-1832-y)。植物案例记录：攀枝花苏铁基因组与 Arabidopsis 69 材料泛基因组；后者的样本范围依前序 M03 书目核查记录。

## M04-02 基因家族聚类与扩张

依据 CAFE 5 论文核对家族间 Gamma 分类速率建模，依据官方仓库核对 `-i`、`-t`、`-k`、错误模型格式和根分布要求。增加根节点至少含一个家族拷贝的模型假设：全末端为零的家族仍会被赋予根拷贝，故新生家族需审慎处理；错误模型可表达观测计数误差，不能代替注释一致性检查。[CAFE 5 论文](https://doi.org/10.1093/bioinformatics/btaa1022)、[官方仓库/README](https://github.com/hahnlab/CAFE5)。茶树论文报告 OrthoFinder 2.5.4、MCMCTree/PAML 4.9j、CAFE5 两个 Gamma 速率类别和 Poisson 根分布；该参数组合限定于此研究，不推广为默认最优设置。[茶树原文](https://doi.org/10.3389/fpls.2024.1449006)。

## M04-03 共线性与染色体演化

对照 MCScanX 论文核对锚点、基因位置与共线区块输出；确认 MCScanX 包含多组核心程序和下游分析程序。澳洲坚果 *Macadamia jansenii* 研究具体采用 all-versus-all BLASTP、GFF 注释和 MCScanX duplicate gene classifier 分析重复类别，不将软件输出单独解释为全基因组复制。[MCScanX 方法论文](https://doi.org/10.1093/nar/gkr1293)、[植物案例论文](https://doi.org/10.1002/pld3.364)。

## M04-04 系统发育推断

核对 IQ-TREE 2 最大似然流程、ModelFinder、启发式树搜索和 UFBoot 的方法来源；将 bootstrap 与贝叶斯后验概率分开表述。更新被子植物 2024 案例的规模：Angiosperms353 的 353 核基因，7,923 个属/9,506 个物种，覆盖 64 个目和 416 个科；以 gene trees 和 ASTRAL III 汇总共祖物种树，时间标定另使用 200 项化石和 treePL。[IQ-TREE 2](https://doi.org/10.1093/molbev/msaa015)、[Zuntini et al.](https://doi.org/10.1038/s41586-024-07324-0)。

## M04-05 分化时间与分子钟

确认 MCMCTree 是 PAML 内的贝叶斯分化时间工具，解释严格/松弛时钟、化石校准、校准分布与敏感性分析。Clark 与 Donoghue 将串联基因家族、35 个化石约束和 MCMCTree normal-approximation 结合，推断 ζ、ε 事件时间；页面已区分其研究条件与其他植物类群。[PAML](https://doi.org/10.1093/molbev/msm088)、[Clark & Donoghue 2017](https://doi.org/10.1098/rspb.2017.0912)。茶树研究的 MCMCTree 4.9j 使用和其校准来源已与原文核对。[茶树研究](https://doi.org/10.3389/fpls.2024.1449006)。

## M04-06 全基因组复制与古多倍化

核对 Ks 为同义替换/位点的模型估计，Ks 峰、共线区块、基因树/物种树分别提供互补证据，任何单项均不等于 WGD 定论。wgd v2 论文中包括 whole-paranome 与共线 anchor-pair Ks、替换速率修正、混合模型及提供起始树/化石校准后的多个定年后端；植物演示包括 *Posidonia oceanica*。[wgd v2 论文](https://doi.org/10.1093/bioinformatics/btae272)、[官方安装与使用文档](https://wgdv2.readthedocs.io/en/latest/installation.html)。绿豆研究讨论 Ks 信号和四倍体亚基因组来源；因该文早于 wgd v2，不将该工具误列为该研究所用。[绿豆原文](https://doi.org/10.1038/ncomms6443)。

## M04-07 选择压力与分子进化

核对密码子模型的 omega=dN/dS 解释、branch/site/branch-site 问题层次、似然比检验边界与多重检验要求。拟南芥近缘种 MAM 研究用 PAML 3.14 对 M1a 和 branch-site Model A 比较，且另开展 MAM 蛋白表达和酶学测定；页面将模型选择信号与功能实验结论分开。[PAML 4 论文](https://doi.org/10.1093/molbev/msm088)、[Benderoth et al. 2006](https://doi.org/10.1073/pnas.0601738103)。

## 工具来源快照

- CAFE 5：官方仓库说明生灭模型、Gamma 速率类别、错误模型和 IU Open Source License。
- MCScanX：论文、官方上游代码及 v1.0.0 发行信息；BSD-2-Clause 来源核查至发行元数据。
- IQ-TREE：v2 方法论文与官方 IQ-TREE 2 文档；方法论文对应版本与当前更新版本分开。
- PAML：Yang 2007 方法论文、官方仓库；仓库当前标注 GPL-3.0。
- wgd v2：2024 方法论文和版本化安装文档。

资源的运行状态以教程记录为准。本轮新增 M04 论文案例尚未在植物原始数据上复现。

## M04 工具输出核对补充

CAFE5 官方 README 核实 `-i`、`-t`、`-k`、`-p`、`-e`、`-o`、`-c` 参数。v1.1 release notes 记录新增 `Base_report.cafe` / `Gamma_report.cafe` 报告，兼容 CAFE4 格式。MCScanX 官方 README 核实共享前缀 BED 与 BLAST m8 输入、`.collinearity` 区块输出和 HTML 浏览目录；源码的输出路径拼接使用 `.collinearity` 后缀。CAFE5 教程状态为 `template`，命令据官方材料整理，本机未执行；其他 M04 工具页面也未在本机运行。

## M04 原理图复核

`GeneEvolutionDemo` 展示“先复制、后物种分化”的四拷贝简化基因树；节点颜色区分复制与分化，末端拷贝保留作为明确假设。`PhylogenyDemo` 以四条虚构序列和四个位点比较三种无根二分拓扑，最简约步骤数 5/7/8；该图注明确其不执行 IQ-TREE 最大似然推断。`CollinearityDemo` 的正向/反向点带只编码两组假想锚点的顺序，不把点位当作真实染色体坐标。`WgdDemo` 分离染色体复制示意与单独构造的 8 对虚构 Ks 分箱，明确柱高数据并非由上方三基因派生，且说明峰不能单独确认 WGD。四幅图的科学对象和计算限制均已检查；本轮尚未重做浏览器尺寸及按键回归。
