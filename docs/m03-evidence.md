# M03 草稿来源与核查记录

本表记录开发期间核对的来源及其支持范围。草稿是否达到发布要求仍需逐页检查正文、输入输出、版本、图注和关联。

| 条目 | 来源 | 已核对范围 | 仍待检查 |
| --- | --- | --- | --- |
| AnchorWave | [原论文](https://doi.org/10.1073/pnas.2113075119)、[PubMed 书目信息](https://pubmed.ncbi.nlm.nih.gov/34934012/)、[官方仓库](https://github.com/baoxingsong/AnchorWave) | 全长 CDS/外显子锚点、最长路径组织、两段仿射 gap、玉米等植物评估；MIT；v1.3.0 命令和参数已核 | 未本机运行；用真实材料验证参数前不得宣称运行通过 |
| SyRI | [原论文](https://doi.org/10.1186/s13059-019-1911-0)、[PubMed 书目](https://pubmed.ncbi.nlm.nih.gov/31842948/)、[官方示例](https://schneebergerlab.github.io/syri/example.html) | 完整作者 Manish Goel、Hequan Sun、Wen-Biao Jiao、Korbinian Schneeberger；组装比对、共线路径和结构分类、拟南芥个案；MIT；v1.8.2 | 官方拟南芥测试集命令链已实跑；预测事件需独立验证；浏览器页面待验收 |
| Minigraph | [方法论文](https://doi.org/10.1186/s13059-020-02168-z)、[官方仓库](https://github.com/lh3/minigraph) | 参考骨架增量构图、rGFA/GAF 与 bubble 接口；v0.21（r606）；MIT；官方命令已核 | 未本机运行；植物应用与 Minigraph-Cactus 已拆开建立关系 |
| Minigraph-Cactus | [原论文](https://doi.org/10.1038/s41587-023-01793-w)、[官方文档](https://github.com/ComparativeGenomicsToolkit/cactus/blob/master/doc/pangenome.md)、[许可证](https://github.com/ComparativeGenomicsToolkit/cactus/blob/master/LICENSE.txt) | minigraph 图映射/分区与 Cactus 序列级对齐；v4.0.0 快照；主仓库 MIT 文本排除部分 externalTools | 未本机运行；各外部工具需独立检查许可证与资源需求 |
| PGGB | [原论文](https://doi.org/10.1038/s41592-024-02430-3)、[官方仓库](https://github.com/pangenome/pggb) | wfmash 全对全比对→seqwish 图诱导→smoothxg/gfaffix 规范化；MIT；v0.7.4 快照与 `-i/-o/-n/-t/-p/-s` 用途已核 | 依赖组件版本与具体参数未实跑；需逐步核对工作流输出 |
| vg / Giraffe | [vg 原论文](https://doi.org/10.1038/nbt.4227)、[Giraffe 原论文](https://doi.org/10.1126/science.abg8871)、[官方索引文档](https://github.com/vgteam/vg/wiki/Index-Construction)、[许可证](https://github.com/vgteam/vg/blob/master/LICENSE) | GBZ、distance 和 minimizer 索引；核心仓库 MIT；v1.78.0 快照；Mapping 与 genotyping 已区分 | 未本机运行；高粱论文同时含模拟与真实 reads，PGGB 图未进入 mapping benchmark |
| ODGI | [原论文](https://doi.org/10.1093/bioinformatics/btac308)、[官方仓库](https://github.com/pangenome/odgi) | 图、路径的存储、统计和可视化；MIT；v0.9.4 快照与 `build/stats/sort/viz/draw` 职责已核 | 未本机运行；图布局不能作为线性距离，格式兼容按版本确认 |
| 水稻多组装 | [Zhao 等，2018](https://doi.org/10.1038/s41588-018-0041-z) | 栽培和野生水稻材料、基因内容与序列变异 | 个别定量结果和完整分析链 |
| 3,010 水稻材料 | [Wang 等，2018](https://pubmed.ncbi.nlm.nih.gov/29695866/) | 文章标题、年份、期刊、泛基因组与 PAV | 按正文逐项检查分析流程 |
| 拟南芥 69 份材料 | [Lian 等，2024 原文](https://www.nature.com/articles/s41588-024-01715-9)、[PubMed](https://pubmed.ncbi.nlm.nih.gov/38605175/) | DOI、年份、期刊、9 位作者；OrthoFinder v2.5.4 基因家族、PLINK 连锁剪枝/PCA、ADMIXTURE v1.3.0 群体结构及对应关系已核 | 结果页面逐句复核及跨 M05 关联发布闭包 |
| 高粱图比较 | [Kopalli 等，2025](https://doi.org/10.1093/gigascience/giaf121)、[出版方全文](https://academic.oup.com/gigascience/article/doi/10.1093/gigascience/giaf121/8364989) | 六份真实高粱组装；Minigraph 0.21、PGGB 0.5.4、Minigraph-Cactus 2.7.2；ODGI 0.8.6、VG Giraffe 1.58.0、SyRI 1.6.3；模拟与真实读段映射任务已分开核 | 方法细节及页面关联已补；结果解释仍待逐项复审 |
| Minigraph 方法论文 | [Li、Feng、Chu，2020](https://pubmed.ncbi.nlm.nih.gov/33066802/) | 标题、作者、期刊卷页、DOI；方法论文以人类组装方法为主 | 未作为植物应用论文使用 |
| 拟南芥适应泛基因组 | [原文](https://doi.org/10.1038/s41467-023-42029-4)、[PubMed/PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC10558531/) | 方法部分确认 Hifiasm、OrthoFinder、IQ-TREE v2.0.3、独立 Minigraph、vg v1.40.0、PLINK、MCScanX 的用途；32 份 HiFi 组装，图上映射 1,135 份个体 reads，过滤后保留 1,073 个体及 20,326 个 SV 位点 | 结果页面逐句复核和跨领域发布闭包 |

图中的样本和序列均为教学模型，未作为真实实验结果。教程 `syri-intro` 已使用 SyRI 1.8.2 和官方拟南芥测试数据执行 NUCmer 到 SyRI 的流程；记录见 `examples/syri/verified-20261121/`。原论文中出现的工具和本网站工具之间的关联，应逐项依据方法部分确认。

## 版本来源快照
2026-11-21 查阅官方发布页：AnchorWave [v1.3.0](https://github.com/baoxingsong/AnchorWave/releases)、SyRI [v1.8.2](https://github.com/schneebergerlab/syri/releases)、Minigraph [v0.21/r606](https://github.com/lh3/minigraph/releases)、PGGB [v0.7.4](https://github.com/pangenome/pggb/releases)、ODGI [v0.9.4](https://github.com/pangenome/odgi/releases)、vg [v1.78.0](https://github.com/vgteam/vg/releases)及 Cactus [v4.0.0](https://github.com/ComparativeGenomicsToolkit/cactus/releases)。这是发布页信息；仅 SyRI 1.8.2 已在隔离环境运行，其他版本快照不表示本机安装。高粱论文使用历史软件版本，版本快照不可取代论文方法部分。

- vg 补充 [Giraffe 短读段方法论文](https://doi.org/10.1126/science.abg8871)、[当前索引说明](https://github.com/vgteam/vg/wiki/Index-Construction)与[许可](https://github.com/vgteam/vg/blob/master/LICENSE)。高粱论文以模拟 reads 评估有真值的映射准确度，也以公开真实 paired-end reads 比较图和线性参考映射；PGGB 因索引所需计算和内存未参与映射比较。vg 本机未运行。
- AnchorWave 官方 README v1.3.0 列出 `gff2seq`、`genoAli`、`proali` 和 `ali`；`genoAli` 主要覆盖同名染色体全局比对并可选 `-IV`，`proali` 处理重定位、融合或 WGD 深度差异，`-R/-Q` 需用户根据生物学背景选择。默认 `-w 100000` 对应常规预算约 9.3 GiB，但不构成硬 RSS 上限；`-fa3` 默认值在 1.3.0 中由旧阈值 100000 改为 50000。
- Minigraph 官方 v0.21/r606 README 说明参考引导图构建输入应按完整组装逐样本提供，示例包含 GFA/rGFA、GAF 与 bubble BED 类输出；MIT 许可已核对。独立 Minigraph 的关系补入拟南芥 2023 应用论文，未将其归到 Minigraph-Cactus。
- 2026-11-21 对照 Nature Genetics 出版方方法和 PubMed 书目信息核对拟南芥 69 份材料论文：OrthoFinder v2.5.4 定义基因家族，PLINK 执行 LD pruning/PCA，ADMIXTURE v1.3.0 推断 K=2–5 群体结构。对照 PMC 全文核对拟南芥 2023 适应研究：Hifiasm 组装 32 份 HiFi 材料；OrthoFinder 与 IQ-TREE v2.0.3 用于基因家族和系统树；独立 Minigraph 构图、vg v1.40.0 对 1,135 份个体短读段进行图映射；PLINK 过滤变异，MCScanX 分析共线性。论文元数据关系已按这些方法步骤补齐；这些草稿的跨领域依赖仍未关闭。
- 高粱基准在六份真实组装设置中报告 Minigraph、PGGB、Minigraph-Cactus 图大小约 0.92、4.7、4.2 Gb；Minigraph 只纳入 >50 bp 变异，而另两流程没有相同长度过滤。Giraffe mapping evaluation 同时包含由图生成的模拟 reads 和公开真实 paired-end reads；PGGB 未纳入映射比较。图大小不代表普遍质量排序；模拟定位真值指标与真实样本映射比例分别解释。

## 高粱基准方法细节复核

2026-11-21 对照出版方全文及 PMC 全文复核：论文题名、五位作者、GigaScience 2025;14:giaf121 与 DOI 一致。图构建版本为 Minigraph 0.21、PGGB 0.5.4、Minigraph-Cactus 2.7.2；图处理使用 ODGI 0.8.6；Giraffe 1.58.0；SyRI 1.6.3。六个高粱组装用于真实构图比较；另用已知结构变异构建模拟组装和读段。PGGB 图的 VG mapping index 未能生成，故 mapping comparison 只包括 Minigraph、Minigraph-Cactus 与线性 Minimap2。公开真实 paired-end reads 的比较报告总映射率与完美映射比例：Minimap2 82.47% / 68.77%，Minigraph-Cactus 73.44% / 82.77%，Minigraph 73.27% / 78.13%。这些数值描述论文指定数据及判定方式，不作为跨物种通用性能结论。[出版方方法与结果](https://academic.oup.com/gigascience/article/doi/10.1093/gigascience/giaf121/8364989)。
