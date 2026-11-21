# M03 草稿来源与核查记录

本表记录开发期间核对的来源及其支持范围。草稿是否达到发布要求仍需逐页检查正文、输入输出、版本、图注和关联。

| 条目 | 来源 | 已核对范围 | 仍待检查 |
| --- | --- | --- | --- |
| AnchorWave | [原论文](https://doi.org/10.1073/pnas.2113075119)、[PubMed 书目信息](https://pubmed.ncbi.nlm.nih.gov/34934012/)、[官方仓库](https://github.com/baoxingsong/AnchorWave) | 全长 CDS/外显子锚点、最长路径组织、两段仿射 gap、玉米等植物评估；MIT；v1.3.0 命令和参数已核 | 未本机运行；用真实材料验证参数前不得宣称运行通过 |
| SyRI | [原论文](https://doi.org/10.1186/s13059-019-1911-0)、[PubMed 书目](https://pubmed.ncbi.nlm.nih.gov/31842948/)、[官方示例](https://schneebergerlab.github.io/syri/example.html) | 完整作者 Manish Goel、Hequan Sun、Wen-Biao Jiao、Korbinian Schneeberger；组装比对、共线路径和结构分类、拟南芥个案；MIT；v1.8.2 | 官方拟南芥测试集命令链已实跑；预测事件需独立验证；浏览器页面待验收 |
| Minigraph | [方法论文](https://doi.org/10.1186/s13059-020-02168-z)、[官方仓库](https://github.com/lh3/minigraph) | 参考骨架增量构图、rGFA/GAF 与 bubble 接口；v0.21（r606）；MIT；官方命令已核 | 未本机运行；植物应用与 Minigraph-Cactus 已拆开建立关系 |
| Minigraph-Cactus | [原论文](https://doi.org/10.1038/s41587-023-01793-w)、[官方文档](https://github.com/ComparativeGenomicsToolkit/cactus/blob/master/doc/pangenome.md)、[许可证](https://github.com/ComparativeGenomicsToolkit/cactus/blob/master/LICENSE.txt) | minigraph 图映射/分区与 Cactus 序列级对齐；v4.0.0 快照；主仓库 MIT 文本排除部分 externalTools | 未本机运行；各外部工具需独立检查许可证与资源需求 |
| PGGB | [原论文](https://doi.org/10.1038/s41592-024-02430-3)、[官方仓库](https://github.com/pangenome/pggb) | wfmash 全对全比对→seqwish 图诱导→smoothxg/gfaffix 规范化；MIT；v0.7.4 快照与 `-i/-o/-n/-t/-p/-s` 用途已核 | 依赖组件版本与具体参数未实跑；需逐步核对工作流输出 |
| vg / Giraffe | [vg 原论文](https://doi.org/10.1038/nbt.4227)、[Giraffe 原论文](https://doi.org/10.1126/science.abg8871)、[Giraffe PubMed/PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC9365333/)、[官方索引文档](https://github.com/vgteam/vg/wiki/Index-Construction)、[许可证](https://github.com/vgteam/vg/blob/master/LICENSE) | Giraffe 原论文题名、年份和 DOI 已核；其评估为 5,202 个人类基因组与 167,000 个 SV，不标为植物案例。vg 索引文档列出 GBZ、distance 和 minimizer 索引；核心仓库 MIT；v1.78.0 快照 | 未本机运行；高粱论文同时含模拟与真实 reads，PGGB 图未进入 mapping benchmark |
| ODGI | [原论文](https://doi.org/10.1093/bioinformatics/btac308)、[官方仓库](https://github.com/pangenome/odgi) | 图、路径的存储、统计和可视化；MIT；v0.9.4 快照与 `build/stats/sort/viz/draw` 职责已核 | 未本机运行；图布局不能作为线性距离，格式兼容按版本确认 |
| YaHS（共享 M01 工具） | [原始方法论文](https://pmc.ncbi.nlm.nih.gov/articles/PMC9848053/)、[官方仓库](https://github.com/c-zhou/yahs)、[v1.2.2 发布页](https://github.com/c-zhou/yahs/releases/tag/v1.2.2) | Chenxi Zhou、Shane A. McCarthy、Richard Durbin；*Bioinformatics* 39(1):btac808；MIT；官方版本 v1.2.2，水稻案例使用 v1.1；FASTA 与 Hi-C BAM/BED/BIN/PA5 输入、AGP/FASTA 输出及主要参数已核 | 未本机运行；连接至 M01 已发布 Hi-C 专题和 M03 草稿主题 |
| EUPAN | [PubMed 方法论文](https://pubmed.ncbi.nlm.nih.gov/28369371/)、[官方工具页](https://cgm.sjtu.edu.cn/eupan/index.html)、[官方安装说明](https://cgm.sjtu.edu.cn/eupan/installation.html)、[官方 SOP](https://cgm.sjtu.edu.cn/eupan/sop.html) | Map-to-pan、参考与新序列整合、reads 覆盖度及 gene/gene-family PAV 流程；方法论文列出 Perl/R/C++、Linux/集群及 CC BY-NC 4.0 非商业使用 | 未本机安装运行；官方旧版依赖需隔离环境评估；草稿页已完成四视口浏览器检查 |
| 水稻多组装 | [Zhao 等 PubMed](https://pubmed.ncbi.nlm.nih.gov/29335547/)、[作者论文 PDF](https://xhhuanglab.cn/uploads/publications/Rice_Pangenome_NG2018.pdf)、[DOI](https://doi.org/10.1038/s41588-018-0041-z) | 题名、24 位作者、年份、期刊及 DOI；66 份材料、115× Illumina、SOAPdenovo2/Fermi/GapCloser、MUMmer 与 EMBOSS `diffseq`；BAC/cDNA 验证、变异统计及 67 个基因组 PAV 图示 | 结果和方法已按原文逐项复核；图形解释、历史软件条目与跨领域发布关系仍待检查 |
| 3,010 水稻材料 | [PubMed](https://pubmed.ncbi.nlm.nih.gov/29695866/)、[PMC 原文与方法](https://pmc.ncbi.nlm.nih.gov/articles/PMC6784863/)、[DOI](https://doi.org/10.1038/s41586-018-0063-9) | 3,010 总群体与 453 份高覆盖 SV/PAV 子集的界限；29,399,875 个 SNP、2,467,043 个 <40 bp indel、93,683 个子集 SV；PAV 家族分类及新基因覆盖核验；PLINK、ADMIXTURE、定制 novoBreak、EUPAN/Map-to-pan 关系及阈值 | 结果摘要与方法关系已按 PMC 正文复核；案例仍为草稿，跨领域发布依赖未闭合 |
| 拟南芥 69 份材料 | [Lian 等，2024 出版方原文](https://www.nature.com/articles/s41588-024-01715-9)、[作者开放版 PDF](https://www.mpipz.mpg.de/5602936/lian_nat_gen_2024_OA.pdf)、[PubMed](https://pubmed.ncbi.nlm.nih.gov/38605175/) | 九位作者、卷页与 DOI；72 份用于群体分析、3 份杂合材料排除后 69 份用于组装/泛基因组；核心、softcore、可变、私有家族计数；着丝粒和染色体结构结论；Hifiasm、SyRI、Merqury、EDTA、InterProScan、IQ-TREE、OrthoFinder、PLINK、ADMIXTURE 方法范围 | 案例仍为草稿；跨 M05 关联发布闭包与整站发布验收 |
| 高粱图比较 | [Kopalli 等，2025](https://doi.org/10.1093/gigascience/giaf121)、[出版方全文](https://academic.oup.com/gigascience/article/doi/10.1093/gigascience/giaf121/8364989)、[PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC12676463/) | 五位作者、书目、六份高粱组装；Minigraph 0.21、PGGB 0.5.4、Minigraph-Cactus 2.7.2；ODGI 0.8.6、VG Giraffe 1.58.0、SyRI 1.6.3；模拟/真实组装、BUSCO 与 21-mer、图覆盖、F1/置换检验及两类 reads mapping 已逐项对照 | 跨作物补充材料数字仍待逐表录入；页面保持草稿，发布依赖待闭合 |
| Minigraph 方法论文 | [Li、Feng、Chu，2020](https://pubmed.ncbi.nlm.nih.gov/33066802/) | 标题、作者、期刊卷页、DOI；方法论文以人类组装方法为主 | 未作为植物应用论文使用 |
| 拟南芥适应泛基因组 | [原文](https://doi.org/10.1038/s41467-023-42029-4)、[PubMed](https://pubmed.ncbi.nlm.nih.gov/37802986/)、[PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC10558531/) | 32 份 HiFi 组装、Hifiasm/RagTag；OrthoFinder 家族与 17,183 单拷贝基因树；EDTA；独立 Minigraph 图构建、gfatools 变异提取、vg v1.40.0 图上映射、PLINK 筛选、MCScanX 共线性；20,326 个 SV / 1,073 个体；61 项性状、候选功能实验；完整作者、卷页、数据资源 | 摘要与结果段的 SV 总数及方法段与结果段的基因家族总数有内部差异，页面依结果段数字展示；跨领域发布闭包 |

2026-11-21 对照出版方、PubMed 和 PMC 方法论文记录：AnchorWave 原文支持基因结构锚点、最长路径与两段仿射 gap cost；Minigraph-Cactus 从 FASTA 组装经 Minigraph 结构变异图和 Cactus 碱基级多序列比对构图，论文展示 90 条人类单倍型；ODGI PubMed 确认作者、卷期页码与 DOI，摘要描述 GFA 图处理、分析、验证及可视化；VG 原文区分图上映射与独立基因型调用；PGGB 论文说明全对全比对构图与其方法定位；Giraffe 正式题名不含 “of”，5,202 人类基因组和 167,000 个 SV 是方法论文的人类评估数据。上述方法论文均不当作植物应用案例。

图中的样本和序列均为教学模型，未作为真实实验结果。教程 `syri-intro` 已使用 SyRI 1.8.2 和官方拟南芥测试数据执行 NUCmer 到 SyRI 的流程；记录见 `examples/syri/verified-20261121/`。原论文中出现的工具和本网站工具之间的关联，应逐项依据方法部分确认。

2026-11-21 对照 [GFA v1 格式规范](https://github.com/GFA-spec/GFA-spec/blob/master/GFA1.md)复核 M03-05 的交互路径图：segment 表示连续序列片段，link 包含连接端方向和重叠长度，path 是按顺序排列的有向片段。图中 A–D 仅为教学占位符，正向路径和连线省略了节点方向、碱基长度、重叠及坐标；两条预设路径分别为 A–B–D、A–C–D。图注明确该图为原理示意，未模拟 GFA 文件或真实变异输出。该边界与 Minigraph 官方说明中“图可包含输入样本未实际出现的 bubble 遍历路径”一致。Minigraph 的图构建输入是逐份完整组装并增量映射至已有图；PGGB 则以 wfmash 全对全比对、seqwish 图诱导和 smoothxg/gfaffix 规范化为主流程。来源：[Minigraph 官方 README](https://github.com/lh3/minigraph/blob/master/README.md)、[PGGB 官方 README](https://github.com/pangenome/pggb/blob/master/README.md)。`npm run test:figure-a11y` 已覆盖四种视口下的路径选择、文字说明、重置和放大弹窗；科学审查结论仅覆盖上述图意和流程区分，专题其他生物学论断仍需逐条审核。

2026-11-21 对照上游发布页及仓库许可记录更新 M03-02 两个新工具的版本快照：MUMmer4 v4.0.1、Artistic-2.0；minimap2 v2.31 (r1302)、MIT。版本字段与工具页正文一致，许可链接指向项目发布/许可文件；页面将版本作为核查时的快照，复现既有研究仍以论文记载的软件版本和参数为准。未安装或运行这两个软件。来源：[MUMmer4 releases](https://github.com/mummer4/mummer/releases)、[MUMmer4 项目](https://github.com/mummer4)、[minimap2 releases](https://github.com/lh3/minimap2/releases)、[minimap2 MIT License](https://github.com/lh3/minimap2/blob/master/LICENSE.txt)。

2026-11-21 为 M03-05 补入可核查的植物图构建实例，依 Guo 等水稻泛基因组 PMC 原文区分 145 份基因家族集合与 144 份合并图；栽培、野生及合并图分别使用 15、129、144 份材料。补记 Minigraph v0.19-r551 初始结构变异图与 Cactus v2.2.1 后续碱基级比对流程，并将论文 `methodIds` 关系补上独立 Minigraph。3.87 Gb 描述该论文所报非参考图节点序列总长。来源：[PMC 原文](https://pmc.ncbi.nlm.nih.gov/articles/PMC12176639/)、[PubMed 记录](https://pubmed.ncbi.nlm.nih.gov/40240605/)。`npm run validate` 构建/引用检查通过；M03-05 路径交互及图放大在四个视口通过 `npm run test:figure-a11y`。此次仅审核该植物案例和方法关系，专题其他论断仍需继续审阅。

## 版本来源快照
2026-11-21 查阅官方发布页：AnchorWave [v1.3.0](https://github.com/baoxingsong/AnchorWave/releases)、SyRI [v1.8.2](https://github.com/schneebergerlab/syri/releases)、Minigraph [v0.21/r606](https://github.com/lh3/minigraph/releases)、PGGB [v0.7.4](https://github.com/pangenome/pggb/releases)、ODGI [v0.9.4](https://github.com/pangenome/odgi/releases)、vg [v1.78.0](https://github.com/vgteam/vg/releases)及 Cactus [v4.0.0](https://github.com/ComparativeGenomicsToolkit/cactus/releases)。EUPAN 官方工具页的最新版本记录为 [v0.44（2017-10-23）](https://cgm.sjtu.edu.cn/eupan/index.html)，许可为非商业使用 CC BY-NC 4.0。版本来源快照不代表本机安装。仅 SyRI 1.8.2 已在隔离环境运行；高粱论文使用历史软件版本，版本快照不可取代论文方法部分。

### M03 工具页的许可、参数与运行状态复核

2026-11-21 对照各项目官方仓库、发布页或安装页复核八个 M03 专属工具及共享工具 YaHS，共九个工具实体的许可陈述、版本记录、输入输出和常用参数。逐项状态如下：

| 工具 | 官方许可记录 | 官方版本来源快照 | 输入输出与参数页检查 | 本机运行状态 |
| --- | --- | --- | --- | --- |
| AnchorWave | MIT | v1.3.0 | GFF/GTF、FASTA、锚点映射 SAM；`gff2seq`、`genoAli`、`proali` 与主要参数已逐项对照 README | 未运行 |
| SyRI | MIT | v1.8.2 | MUMmer delta/PAF 流程、参考/查询组装、`.out`、VCF、summary 和常见选项已对照官方示例 | v1.8.2 + MUMmer 3.23 已使用官方拟南芥测试数据运行，日志见 `examples/syri/verified-20261121/` |
| Minigraph | MIT | v0.21 / r606 | 参考引导逐组装构图、GFA/rGFA、GAF、bubble 类结果及示例命令已对照 README | 未运行 |
| Minigraph-Cactus | 主仓库 MIT 文本，排除 `externalTools` 中部分文件 | v4.0.0（2026-11-09） | seqfile、jobStore、`cactus-pangenome`、GFA/GBZ/Giraffe/VCF 开关、裁剪统计及主要并行参数已对照官方流程文档；Cactus 4.0 默认配置变化已记录 | 未运行 |
| PGGB | 主仓库 MIT；组成工具和运行镜像依赖须独立核对 | v0.7.4 | FASTA/PanSN 输入、wfmash/seqwish/图规范化流程、`-i/-o/-n/-t/-p/-s` 和 GFA/VCF 输出已对照官方 README | 未运行 |
| ODGI | MIT | v0.9.4 | GFA 导入、图统计、排序、可视化输入输出及路径解释已对照官方仓库与手册 | 未运行 |
| vg / Giraffe | vg 核心仓库 MIT；贡献目录和子模块具有各自许可 | v1.78.0 | GBZ、distance、minimizer 索引，短/长读段映射和 GAM/GAF 输出已对照官方索引与长读段说明 | 未运行 |
| EUPAN | 非商业使用 CC BY-NC 4.0 | v0.44（官方页标示 2017-10-23） | FASTQ、参考 FASTA、注释和外部依赖；PAV 覆盖阈值、覆盖文件和矩阵输出已对照官方安装页与 SOP | 未安装或运行 |
| YaHS（共享 M01 工具） | MIT | v1.2.2 | contig FASTA、Hi-C 比对格式、AGP/FASTA 结果和核心参数已核 | 未运行；野生—栽培稻论文方法段记录 v1.1 |

版本表示对照日能在官方页面找到的版本或发布快照。论文中使用的历史版本单独按原文方法部分记录。运行状态严格区分官方文档核对和本机执行；除 SyRI 外，其余工具没有本机运行记录。EUPAN 的旧依赖需评估隔离环境；许可文本应结合官方页面中非商业用途条款理解。该表只覆盖工具页所述流程，不构成所有命令、依赖和许可文件的全量代码审计。

本轮加深 Minigraph-Cactus 页面，按官方 v4.0.0 文档区分 Minigraph 阶段 `.sv.gfa.gz`、最终图、请求生成的 GBZ/Giraffe/VCF 索引和 `.stats/` 裁剪报告；补充常用参数、参考染色体分区影响、配置快照要求和 v4.0 的输出复现特性。EUPAN 页面加入官方版本日期快照，并将非商业 CC BY-NC 4.0 许可与当前机器未安装状态分开记录。Cactus 官方来源：[pangenome 工作流和输出](https://github.com/ComparativeGenomicsToolkit/cactus/blob/master/doc/pangenome.md)、[v4.0.0 发布记录](https://github.com/ComparativeGenomicsToolkit/cactus/releases/tag/v4.0.0)、[主仓库许可证](https://github.com/ComparativeGenomicsToolkit/cactus/blob/master/LICENSE.txt)；EUPAN 官方来源：[工具主页、版本与许可](https://cgm.sjtu.edu.cn/eupan/index.html)、[安装说明](https://cgm.sjtu.edu.cn/eupan/installation.html)、[SOP](https://cgm.sjtu.edu.cn/eupan/sop.html)。

### 3,010 份水稻论文至 ADMIXTURE 和 M05-03 的发布关联

稳定 ID 和反向导航已对照论文、工具页、专题正文与 63 条专题元数据核查：`rice-3010-pangenome.methodIds` 包含 `admixture`、`plink`、`eupan`；`admixture.topicIds` 包含 `m05-topic-03`，其方法论文为 `admixture-paper`；`m05-topic-03` 的正文 `methods` 与专题元数据 `methodIds` 同为 PLINK 和 ADMIXTURE，`paperIds` 包含 `rice-3010-pangenome`，并列出 PLINK 教学教程和相关方法论文。M05-03 内的主题关系完整，双向工具—专题—论文关系由现有动态关联页面呈现。

发布状态依赖链继续向外扩展：公开 3,010 份水稻论文需要先公开其三个关联工具及各自的方法论文和专题；其中 EUPAN 还要求 M03-01 与 M03-04，PLINK 还要求 M05-02。M03-01/M03-04 又关联 OrthoFinder、Minigraph、PGGB、Minigraph-Cactus 等方法及多篇植物案例，M05-02 关联 bcftools、PLINK 与相应文献。依照 `src/lib/validate-content.ts` 中已发布资源需关联已发布资源的规则，正式发布范围会继续扩展至这些专题和工具引用的论文、工具与教程。M03 与 M05 的相关专题、方法和论文均维持草稿，并保留经论文方法核实的工具关联。`npm run coverage` 确认 M03 为 7 篇草稿专题、8 个草稿工具、15 篇草稿论文、1 个已发布共享工具 YaHS 和 1 篇草稿教程；M05 为 7 篇草稿专题、3 个草稿工具、10 篇草稿论文和 1 篇草稿教程。下一步按完整关联范围完成专题和资源的科学内容审核，再安排发布批次。

- vg 补充 [Giraffe 短读段方法论文](https://doi.org/10.1126/science.abg8871)、[当前索引说明](https://github.com/vgteam/vg/wiki/Index-Construction)与[许可](https://github.com/vgteam/vg/blob/master/LICENSE)。高粱论文以模拟 reads 评估有真值的映射准确度，也以公开真实 paired-end reads 比较图和线性参考映射；PGGB 因索引所需计算和内存未参与映射比较。vg 本机未运行。
- AnchorWave 官方 README v1.3.0 列出 `gff2seq`、`genoAli`、`proali` 和 `ali`；`genoAli` 主要覆盖同名染色体全局比对并可选 `-IV`，`proali` 处理重定位、融合或 WGD 深度差异，`-R/-Q` 需用户根据生物学背景选择。默认 `-w 100000` 对应常规预算约 9.3 GiB，但不构成硬 RSS 上限；`-fa3` 默认值在 1.3.0 中由旧阈值 100000 改为 50000。
- Minigraph 官方 v0.21/r606 README 说明参考引导图构建输入应按完整组装逐样本提供，示例包含 GFA/rGFA、GAF 与 bubble BED 类输出；MIT 许可已核对。独立 Minigraph 的关系补入拟南芥 2023 应用论文，未将其归到 Minigraph-Cactus。
- 2026-11-21 对照 Nature Genetics 出版方方法和 PubMed 书目信息核对拟南芥 69 份材料论文：OrthoFinder v2.5.4 定义基因家族，PLINK 执行 LD pruning/PCA，ADMIXTURE v1.3.0 推断 K=2–5 群体结构。对照 PMC 全文核对拟南芥 2023 适应研究：Hifiasm 组装 32 份 HiFi 材料；OrthoFinder 与 IQ-TREE v2.0.3 用于基因家族和系统树；独立 Minigraph 构图、vg v1.40.0 对 1,135 份个体短读段进行图映射；PLINK 过滤变异，MCScanX 分析共线性。论文元数据关系已按这些方法步骤补齐；这些草稿的跨领域依赖仍未关闭。
- 2026-11-21 对照 Nature Genetics 出版方全文及作者开放版 PDF 逐项复核 69 份拟南芥泛基因组案例。区分 72 份材料的 SNP/PCA/ADMIXTURE 群体分析与排除 3 份杂合材料后的 69 份染色体级组装、SV 和基因家族分析；复核 HiFi 组装器组合（Canu、Flye、Hifiasm）、quickmerge/RaGOO 后处理、ONT SMARTdenovo/Flye 流程，以及 OrthoFinder、SyRI、Merqury、EDTA、InterProScan、IQ-TREE、PLINK 和 ADMIXTURE 的具体用途。核对 32,986 个 69 份材料基因家族及四类计数、6,954 个拆分/合并相关家族、1,281 个未检出跨材料序列相似性的私有家族，并将样本曲线未达平台限制在本研究采样范围内。将可用详情页对应工具加入 `methodIds`，书目字段补全九位作者并加入卷页。科学论断仍为局部审核；跨 M05 发布闭包未关闭，页面保持草稿。
- 2026-11-21 对照 Nature Communications/PMC 全文复核拟南芥适应泛基因组案例：32 份 HiFi 组装及 Hifiasm v0.18/RagTag v2.1.0、OrthoFinder 家族统计、17,183 单拷贝基因与 IQ-TREE、EDTA、Minigraph `-cxggs` 参考引导构图、gfatools 的 50 bp 阈值、vg v1.40.0 图上映射、PLINK 缺失率/MAF 筛选和 Beagle 填补、MCScanX 共线性及 61 项性状分析均逐项对照。按结果段核对 31,318 个 gene clusters 的分类计数、61,322 个组装图 SV 及 20,326 个群体 SV 分析位点；将摘要所写 61,332 和方法段所写 31,317 记为原文内部汇总差异。补录 1,073 个体样本范围、性状方差估计、KNAT3/WH1/HPCA1 功能实验及原始数据/图泛基因组资源链接；工具关系保留为本知识库已建模且原文确用的 Hifiasm、OrthoFinder、IQ-TREE、EDTA、Minigraph、vg、PLINK、MCScanX。页面继续为草稿。
- 高粱基准在六份真实组装设置中报告 Minigraph、PGGB、Minigraph-Cactus 图大小约 0.92、4.7、4.2 Gb；Minigraph 只纳入 >50 bp 变异，而另两流程没有相同长度过滤。Giraffe mapping evaluation 同时包含由图生成的模拟 reads 和公开真实 paired-end reads；PGGB 未纳入映射比较。图大小不代表普遍质量排序；模拟定位真值指标与真实样本映射比例分别解释。

## 高粱基准方法细节复核

2026-11-21 对照出版方全文及 PMC 全文复核：论文题名、五位作者、GigaScience 2025;14:giaf121 与 DOI 一致。图构建版本为 Minigraph 0.21、PGGB 0.5.4、Minigraph-Cactus 2.7.2；图处理使用 ODGI 0.8.6；Giraffe 1.58.0；SyRI 1.6.3。六个高粱组装用于真实构图比较；另用已知结构变异构建模拟组装和读段。PGGB 图的 VG mapping index 未能生成，故 mapping comparison 只包括 Minigraph、Minigraph-Cactus 与线性 Minimap2。公开真实 paired-end reads 的比较报告总映射率与完美映射比例：Minimap2 82.47% / 68.77%，Minigraph-Cactus 73.44% / 82.77%，Minigraph 73.27% / 78.13%。这些数值描述论文指定数据及判定方式，不作为跨物种通用性能结论。[出版方方法与结果](https://academic.oup.com/gigascience/article/doi/10.1093/gigascience/giaf121/8364989)。

2026-11-21 继续对照出版方全文与 PMC 结果段核验高粱基准。模拟组装中，SVIM-asm、SyRI、Minigraph-Cactus、PGGB 的 SV F1 分别为 0.93、0.91、0.89、0.83；Minigraph 检出数量不足，未获得可解释 F1。模拟图规模为 PGGB 851 Mb、Minigraph-Cactus 795 Mb、Minigraph 878 Mb；对应平均节点数约 19 万、22 万和 950。真实组装图规模为 4.7、4.2、0.92 Gb；Minigraph 仅纳入 >50 bp 变异，另两流程无相同长度过滤，因此正文将图大小作为该设置的结果并列呈现，不作同过滤条件排名。真实组装平均 BUSCO 为 95.4% 完整、2.0% duplicated；三种图展平序列依次为 Minigraph-Cactus 94.5%/16.5%、PGGB 98.7%/16.0%、Minigraph 99.4%/2.7%。PGGB 与 Minigraph-Cactus 的各输入组装图覆盖均超过 94%，Minigraph 平均约 83%。

模拟 reads 由含六份输入组装及参考的图生成，论文报告 min_mapQ 60 下 Minigraph-Cactus/Giraffe 映射率 38.27%、正确映射率 99.68%，Minigraph/Giraffe 为 74.62%/95.08%；Minimap2 对线性参考为 48.67%/58.18%。min_mapQ 1 下总读段正确映射比例分别报告为 79.60%、91.91% 和 35.49%。方法段说明模拟集 100 万条、150 bp，错误率 0.24%、indel 率 0.029%。页面将 min_mapQ、模拟/真实 reads 和不同映射指标分列，并保留真实 reads 的总映射率/完美比对率：Minimap2 82.47%/68.77%、Minigraph-Cactus 73.44%/82.77%、Minigraph 73.27%/78.13%。论文未得到 PGGB 图索引，PGGB 映射性能无本研究实测结果。

变异结果的证据边界亦已补入页面：模拟真值提供逐调用集 F1；真实数据的 100 次 `regioneR` 区域置换重叠检验报告 *P*=0.0099，回答已发表变异区域重叠是否高于随机背景。小变异数量和重复序列相似度按论文结果段分别归属具体流程。方法和结果摘录来源为[PMC 正文](https://pmc.ncbi.nlm.nih.gov/articles/PMC12676463/)与[出版方全文](https://academic.oup.com/gigascience/article/doi/10.1093/gigascience/giaf121/8364989)。

论文页共用模板检查发现 Markdown 表格未进入文章横向滚动容器，375px 下高粱页面文档宽度为 419px。模板为全部论文详情页增加 `article.prose` 阅读容器后，Base 布局自动为宽表提供可访问的横向滚动。Edge 对高粱案例、Hifiasm 方法论文、EDTA 方法论文在 375、768、1280、1440px 检查均通过：HTTP 200、正文标题和方法链接可见、无页面级横向溢出、无页面异常；高粱页三张表均进入滚动容器。`npm run validate`、`npm run coverage` 和 `git diff --check` 通过。

## 水稻泛基因组论文与 EUPAN 核查

2026-11-21 对照 Nature 原文、PubMed 与作者提供的 PDF 核对 Zhao 等 2018 年多组装研究：书目记录为 Nature Genetics 50(2):278–284，DOI 10.1038/s41588-018-0041-z；作者为 Qiang Zhao、Qi Feng、Hengyun Lu、Yan Li、Ahong Wang、Qilin Tian、Qilin Zhan、Yiqi Lu、Lei Zhang、Tao Huang、Yongchun Wang、Danlin Fan、Yan Zhao、Ziqun Wang、Congcong Zhou、Jiaying Chen、Chuanrang Zhu、Wenjun Li、Qijun Weng、Qun Xu、Zi-Xuan Wang、Xinghua Wei、Bin Han 和 Xuehui Huang。研究比较 66 份栽培与野生稻材料，平均测序深度约 115×，并使用 Fermi、SOAPdenovo2、GapCloser、MUMmer 与 EMBOSS `diffseq`；变异结果及对 67 个基因组编码基因的 PAV 分析在论文页面中说明。此研究属于线性参考锚定的多组装分析，不标记为图泛基因组软件应用。

2026-11-21 对照 Wang 等 3,010 水稻论文 PMC 全文核对测序和分析范围：PLINK 用于 LD 剪枝和 SNP 距离分析，ADMIXTURE 选择 K=9 并配合 CLUMPP 对齐重复运行矩阵；定制 novoBreak-germline 检测 SV。pan-genome 由 Nipponbare RefSeq 与 3,010 份组装产生的非冗余新序列组合，Map-to-pan 读取覆盖用于 PAV；SV/PAV 重点分析限于测序深度 >20× 且参考比对深度 >15× 的 453 份样本，基因存在判定阈值为 CDS >95%、gene body >85%。代码说明把基因及基因家族 PAV 分析纳入 EUPAN。

2026-11-21 再次对照两篇水稻论文全文复核 M03-04 新增案例段。Zhao 等 2018 年研究以 66 份材料加 Nipponbare 共 67 个组装为统计集合，报告 42,580 个非 TE 蛋白编码基因、≥60/67 的核心阈值及 10,872 个相对 Nipponbare 至少部分缺失的基因；约 9.5% 的新识别基因也出现在独立 Illumina Nipponbare 组装中。Wang 等 2018 年研究区分全体 3,010 份材料与用于高覆盖 PAV 的 453 份子集；复核 23,876 个基因家族、12,770 个严格核心、2,056 个候选核心、9,050 个分布型家族及基于主群体缺失率的判定规则。出处：[Nature Genetics 原文](https://doi.org/10.1038/s41588-018-0041-z)、[Nature 论文 PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC6784863/)。

2026-11-21 对照 BCFtools 官方变异检测说明与代码仓库复核 M05-02 及 BCFtools 页面：`mpileup` 生成有覆盖位置的基因型似然，`call -m` 进行多等位基因调用，`-v` 输出变异位点，`-Ou`/`-Ob` 分别用于未压缩 BCF 管道与压缩 BCF 文件；文档记录每 BAM 每个位点默认深度上限为 250，并提示按数据评估 `--max-depth`。官方许可证提供 MIT/Expat 或 GPL 选项，启用可选 GSL 构建时适用 GPL；官方 release 当前列出 v1.25。页面示例是官方命令语法，不是本机运行结果。[BCFtools 官方变异检测](https://samtools.github.io/bcftools/howtos/variant-calling.html)、[发布页](https://github.com/samtools/bcftools/releases/)、[许可证](https://github.com/samtools/bcftools/blob/develop/LICENSE)。

依据 EUPAN PubMed 方法论文及官方安装页/SOP 新增工具和方法论文草稿。官方文档记录依赖 Perl、R、C++，QUAST 使用旧版 Python 2 环境；工具页列出多样本 FASTQ、参考 FASTA、GFF/GTF 输入、PAV 矩阵和覆盖结果。官方示例 PAV 阈值与 Wang 等论文阈值分别注明，未混作软件全局默认值。页面与案例关系在 375、768、1280、1440 px 下通过浏览器检查；软件没有在本机运行，继续保持草稿。

2026-11-21 对照 [Giraffe 原始论文](https://pmc.ncbi.nlm.nih.gov/articles/PMC9365333/)核查 M03-06 的方法说明：GBWT 表示及查询图中的单倍型路径，minimizer 产生候选种子，按图距离聚类后沿路径延伸无缺口比对，再对剩余 gap 执行带缺口比对。vg 团队的[官方索引文档](https://github.com/vgteam/vg/wiki/Index-Construction)说明 Giraffe 使用 GBZ 图（包含 GBWT 和 GBWTGraph）、distance index、minimizer index，并区分短读段和长读段模式。原始论文中的 5,202 个体、167,000 个结构变异属于人类评估，页面明确未作为植物应用。交互模型的片段拼接为甲 ACGTTG、乙 ACCATG；AC 为共享子串，CGTT 只出现在甲，CCAT 只出现在乙。按钮仅做预设路径的精确子串筛选，不复现 Giraffe 的种子检索或 caller。`npm run test:figure-a11y` 已检查三个读段选择按钮、aria-pressed 状态及重置。

## M03-06 图上比对教学模型复核

2026-11-21 对照 [Giraffe 原始论文](https://pmc.ncbi.nlm.nih.gov/articles/PMC9365333/)核查方法页：Giraffe 使用 GBWT 表示及查询图中的单倍型路径，以 minimizer 建立种子，按图距离对候选种子聚类，沿单倍型路径延伸无缺口匹配，剩余位置才进入带缺口比对。论文案例为人类基因组；正文将 5,202 份个体和约 167,000 个已知 SV 明确标为人类方法评估。对照 [vg 官方索引文档](https://github.com/vgteam/vg/wiki/Index-Construction)，Giraffe 的索引组合包括 GBZ/GBWT、distance 和 minimizer，短读段与长读段索引参数区分。M03-06 的交互教学字符串拼接为甲 ACGTTG、乙 ACCATG；读段 AC 同时是共享子串，CGTT 仅匹配甲，CCAT 仅匹配乙，按钮只模拟精确子串筛选，不模拟 Giraffe 的种子评分或基因型调用。`npm run test:figure-a11y` 已检查三种读段选择和重置。专题其他原理、公式及植物案例仍需继续审核。

## M03-07 泛基因组研究路线示意复核

2026-11-21 检查 M03-07 的原创路线图：五个阶段按常见信息推进顺序排列，新增箭头以区分步骤方向；SVG 替代文本及图注均说明研究设计可按数据和问题分支或迭代。图是通用原理示意，不代表 ODGI、Minigraph、PGGB 或其他软件的特定输出，也不主张所有植物项目遵循固定线性流水线。对照 [ODGI 官方 Sort and Layout 教程](https://odgi.readthedocs.io/en/latest/rst/tutorials/sort_layout.html)和 [`odgi viz` 命令文档](https://github.com/pangenome/odgi/blob/master/docs/rst/commands/odgi_viz.rst)：图节点排序与一维/二维布局服务于图结构的呈现；一维视图按节点次序显示路径片段及图连接。该图与软件生成的路径布局分开说明。Edge/Playwright 回归在 375、768、1280、1440 px 检查了四个方向箭头、分支/迭代替代文本、图放大与横向溢出；静态构建产物的标题、图注和四个箭头几何断言通过。此条仅审核图的语义和说明，不代表 M03-07 正文已完成全面科学审核。

2026-11-21 继续逐句核对 M03-07 的图示术语和资源范围。ODGI 官方导航教程及方法论文以嵌入路径提供坐标语义，并说明节点标识不应作跨图稳定标识；排序、线性化和二维绘图用于图结构理解。Bandage 官方页面定位为 de novo 组装图查看工具，支持 GFA、局部图范围、节点长度/深度标记，并可配置节点绘制长度与序列长度的关系。正文据此将节点的序列长度与节点编号/绘图位置分开，明确路径坐标映射，并提醒使用 Bandage 前核对图格式和路径支持。高粱论文的图覆盖统计与组装级 BUSCO/k-mer 指标分开描述；Nature 水稻研究支持 66 份多材料 de novo 组装及 67 个组装的基因 PAV 背景。正文表格已把 read coverage/可比对性区段与 N50、BUSCO 等组装汇总指标分开。来源：[ODGI 官方路径/坐标教程](https://github.com/pangenome/odgi/blob/master/docs/rst/tutorials/navigating_and_annotating_graphs.rst)、[ODGI 方法论文](https://doi.org/10.1093/bioinformatics/btac308)、[Bandage 官方功能说明](https://rrwick.github.io/Bandage/)、[高粱图比较研究](https://doi.org/10.1093/gigascience/giaf121)、[水稻 66 份材料研究](https://doi.org/10.1038/s41588-018-0041-z)。本次只复核该专题可视化与案例定位相关段落。
2026-11-21 补充 M03-07 手机端表格回归：五列比较表在 375px 视口使用可访问的横向滚动容器，动态名称取自表格标题/表头；滚动区域显示操作提示，键盘 Home/End 可到达两端。表格内容保持适合阅读的最小宽度，文档宽度仍限制在视口内。Edge/Playwright 四视口图示与键盘回归通过；此项未扩大专题科学审核范围。

2026-11-21 逐项复核 3,010 水稻论文 PMC 正文及方法段：全群体报告 29,399,875 个 SNP（27,024,796 个双等位）和 2,467,043 个小于 40 bp 的 indel；SV 对 3,010 份材料调用，正文结果集中报告 453 份高测序/参考映射深度样本中的 93,683 个 SV。论文从 3,010 份组装产生 268 Mb 非冗余新序列，并预测 12,465 个新全长基因；453 份样本的 23,876 个家族分为 12,770 个核心、2,056 个候选核心和 9,050 个可变家族，模拟提示可变家族可能低估。11,792 个新基因（94.6%）在至少两份材料的映射 reads 中达到 CDS >95%、gene-body >85% 的阈值；原文指出约 25% 新基因预测偏短与组装片段化有关。依据方法与代码可用性部分确认 PLINK、ADMIXTURE、EUPAN 和定制 novoBreak 的任务边界。页面结果已按原文样本范围和阈值重写；该案例及跨 M05 关联继续保持草稿。来源：[PMC 全文方法和结果](https://pmc.ncbi.nlm.nih.gov/articles/PMC6784863/)；[Nature DOI](https://doi.org/10.1038/s41586-018-0063-9)。

2026-11-21 对照 Zhao 等 2018 年作者 PDF、出版方页面和 PubMed 复核 66 份材料案例。验证其 57 份代表性材料加 9 个栽培品种、Illumina 115×、3.1 Tb、Fermi/SOAPdenovo2 并行 contig、GapCloser 与 REPLACE 合并、21–75 kb contig N50；MUMmer/IRGSP build 4 锚定与 EMBOSS `diffseq` v4.0、`-wordsize 10` 变异流程也与方法段相符。按 PDF 原文补录 GLA4 273 BAC/约 22 Mb 局部对照和 GLA4、W1943 全长 cDNA >98% identity 近完全匹配比例 90.25%、96.77%。变异定义及 67 基因组的 42,580 非 TE 基因、≥60/67（约89.6%，论文概称约90%）核心阈值、26,372 核心/16,208 可变基因和 InterPro 77.6%/35.8% 对比已与正文核对。Edge 对两篇水稻案例在 375、768、1280、1440px 的标题、结果文字、工具关联及文档宽度检查通过。该研究为短读段、多组装及线性参考锚定，不关联图泛基因组工具。来源：[作者 PDF](https://xhhuanglab.cn/uploads/publications/Rice_Pangenome_NG2018.pdf)、[出版方页面](https://www.nature.com/articles/s41588-018-0041-z)、[PubMed](https://pubmed.ncbi.nlm.nih.gov/29335547/)。

## 野生与栽培稻泛基因组资源核查（2026-11-21）

依据 Guo 等发表于 *Nature* 的原文与 PMC 全文核对新建案例。研究初始选择 149 份稻属材料，叶绿体复核将 3 份归为 *O. longistaminata*、1 份归为 *O. meridionalis* 外群；基因家族分析使用 129 份 *O. rufipogon* 与 16 份 *O. sativa*，合计 145 份。图泛基因组的合并集合为 129 份野生稻加 15 份栽培稻，合计 144 份。Hifiasm v0.16.0 用于 133 份 HiFi 材料并生成 p-contigs/a-contigs；其余 16 份 ONT 材料由 NECAT 与 NextDenovo 处理。30 份代表材料另用 Hi-C、Chromap、YaHS 和 JuiceBox Assembly Tools 进行挂载与人工检查，其余材料使用 ALLMAPS 锚定流程。

论文报告 69,531 个 pan-genes、28,907 个全样本核心基因、5,181 个 private genes 和 13,728 个野生稻特异基因；基因分类按 145 份材料及原文 CDS 一致性/覆盖率规则定义。Minigraph-Cactus 使用 Minigraph v0.19-r551 与 Cactus v2.2.1 构图，合并图报告 3.87 Gb 非参考节点总长。研究另用 vg Giraffe v1.43.0 映射短读段、DeepVariant v1.6.1 调用及 GLnexus v1.4.1 合并变异；该群体包含 142 份本研究材料与 407 份外部材料。图节点总长、基因家族数与变异调用样本集代表不同分析对象，页面不混用其分母。完整方法、版本、指标与资源链接见 `src/content/papers/wild-rice-pangenome-2025.md`。

来源：[Nature/PMC 全文与方法](https://pmc.ncbi.nlm.nih.gov/articles/PMC12176639/)、[PubMed 记录](https://pubmed.ncbi.nlm.nih.gov/40240605/)、[DOI](https://doi.org/10.1038/s41586-025-08883-6)。该论文开放许可为 CC BY-NC-ND；本知识库以文字复述并链接原文，未复用论文图片。案例、专题和工具关联维持草稿状态。

## M03-02 组装间比对方法与输入格式核查（2026-11-21）

依据 [MUMmer4 官方仓库](https://github.com/mummer4/mummer)核对 `nucmer` 用于多 FASTA 核苷酸比较、以最大精确匹配为锚点聚类并延伸，输出 `.delta`；该项目说明其适用场景包含较相近且可能带大片段重排的组装。依据 [minimap2 官方 README](https://github.com/lh3/minimap2/blob/master/README.md)核对 minimizer 索引、种子链化和后续碱基级比对，`-cx asm5` 可用于组装间比对并生成 PAF。依据 [SyRI 官方首页](https://schneebergerlab.github.io/syri/)与[输入要求](https://schneebergerlab.github.io/syri/install.html)核对它接收外部组装比对、寻找最长共线路径并对非共线比对分类；输入可为 SAM/BAM、带 CIGAR 的表格或 MUMmer `.delta`。与已审阅的 AnchorWave 注释锚点方法共同构成正文四行比较表。

Edge/Playwright 于 375、768、1280、1440 px 检查专题标题、草稿状态、AnchorWave/SyRI 关联、方法表、页面宽度及无脚本错误；四种宽度均执行 AnchorChain 下一步和重置。该回归覆盖新增表格与既有交互，不表示本机运行了 MUMmer4、minimap2、AnchorWave 或 SyRI 流程；M03-02 全文仍待后续审核并保持草稿。

## YaHS 工具与书目核查（2026-11-21）

依据 [YaHS 方法论文全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC9848053/)、[官方仓库](https://github.com/c-zhou/yahs) 与 [官方 v1.2.2 发布页](https://github.com/c-zhou/yahs/releases/tag/v1.2.2)新增独立工具实体。论文书目核对为 Chenxi Zhou、Shane A. McCarthy、Richard Durbin，*Bioinformatics* 39(1):btac808（2023 卷期；2022-12-16 在线发布），DOI `10.1093/bioinformatics/btac808`；论文说明软件以 C 实现并使用 MIT License。官方发布页目前列出 v1.2.2，发布说明涉及 v1.2.1 的 `juicer post` 缺陷；Guo 等 2025 水稻研究的方法段报告使用 v1.1。

方法页区分 Hi-C reads 比对（上游）、contig scaffold 构建（YaHS）和接触图人工检查（Juicebox Assembly Tools）。按原论文记录 YaHS 的单倍型输入假设、冗余 haplotig 清理要求、窗口接触计数标准化、四种方向评分、加权 scaffold 图剪枝与多轮遍历；比较结果限定于论文测试的 SALSA2、pin_hic、数据及评价指标。官方 README 核实 FASTA 与 Hi-C BAM/BED/BIN/PA5 输入、AGP/FASTA 输出及常用参数。该工具未在本机运行。

`src/content.config.ts` 的方法 schema 新增可选 `version` 字段，工具详情页仅在有核实值时显示；内容维护说明已同步。构建和链接检查通过后，Edge DEV 预览在 375、768、1280、1440 px 核对 M03-01、野生稻案例、M01 Hi-C 专题及 YaHS 工具页，共 16 个页面/视口状态；页面标题、草稿标识、关系链接、无横向溢出与无页面错误通过。静态预览中 Pagefind 对“YaHS”“组装”“单倍型”各返回结果，搜索资源路径包含 `/phytomethods/` 基路径。M03 论文和专题仍保持草稿。

## M03-03 结构变异检测方法与植物案例审核（2026-11-21）

依据 Goel 等 SyRI 原始论文全文重核方法流程：输入为两组装全基因组局部比对；正向匹配按同源染色体构成 DAG，并通过动态规划寻找高分、非矛盾共线路径；倒位候选通过反向互补坐标思路筛选；剩余匹配区块用于识别易位/转位和复制；随后从区块间隙、重叠及局部比对中解析序列差异。正文的 $P^*=\arg\max_{P\in\mathcal C}\sum s_i$ 仅表示高分兼容路径的概念目标，不对应 SyRI 完整评分实现。来源：[Genome Biology 出版方全文](https://link.springer.com/article/10.1186/s13059-019-1911-0)。

核对拟南芥 Col-0/Ler 应用：原文使用 50 份 F2 重组后代及约 500,000 SNP 标记重建亲本单倍型，对 117 个大于 1 kb 的易位候选进行三类验证，其中 108 个（92.3%）至少通过一类判据；其余 9 个未通过判据的候选经人工查看仍有支持读段。核对原文中结构变异与共线区 SNP/indel 的层级关系，避免把局部变异与重排事件视作互斥类别。

核对 3,010 份亚洲栽培稻研究：结构变异由定制 novoBreak-germline 流程检测，93,683 个 SV 的报告集合来自 453 份高覆盖样本；未把该流程关联到 SyRI。核对 2025 高粱图基准：模拟真值任务中 SVIM-asm、SyRI、Minigraph-Cactus、PGGB F1 为 0.93、0.91、0.89、0.83；真实组装另做已发表 SV 区域重叠的 100 次随机置换检验，这两类结果分别报告。来源：[3,010 水稻论文全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC6784863/)；[GigaScience 出版方全文](https://academic.oup.com/gigascience/article/doi/10.1093/gigascience/giaf121/8364989)。

检查 `PangenomeFigure` 的 M03-03 图：字母代表有序片段，撇号表示反向方向，展示参考相对缺失、重复、倒位和插入；图注明确易位未绘制，未呈现实测数据。当前版本图示语义与图注一致。

新增方法路线比较和算法说明，更新 M03-03 与 SyRI、Minigraph、Minigraph-Cactus、PGGB、VG 的稳定工具关系，补入高粱基准与 2025 野生—栽培稻案例关系。按 PubMed 和软件原始仓库核对 Sniffles2、cuteSV 长读段使用范围及算法概述，并新建两篇方法论文记录：Smolka 等 2024 年 *Nature Biotechnology* 42(10):1571–1580, DOI `10.1038/s41587-023-02024-y`；Jiang 等 2020 年 *Genome Biology* 21(1):189, DOI `10.1186/s13059-020-02107-y`。两篇原论文以人类数据和基准为主，正文说明为方法示例，不作为植物实证。

Edge 开发态检查 M03-03 在 375、768、1280、1440 px 的 HTTP 200、正文标题、公式渲染、结构变异 SVG 标题和文档宽度；四视口均无横向溢出。点击 SyRI 方法论文后页面正常跳转；另以 HTTP 检查 SyRI、Minigraph、Minigraph-Cactus、PGGB、VG 及六篇案例/方法论文共 13 个关联路由，全部返回 200。`npm run test:figure-a11y` 指向开发服务器运行通过，覆盖 375、768、1280、1440 px 的 SVG 放大弹窗、键盘、焦点恢复、唯一 ID 与横向滚动行为。公开静态构建只包含已发布页；M03 页面与新增论文仍为草稿。M03-03 的局部审核通过，全文审核与整域发布闭包仍未完成。

## M03-04 PAV 与水稻 Se 位点核查（2026-11-21）

复核既有三态 PAV 定义与频率分母，保持 `1/0/?` 分别代表支持存在、支持缺失和证据不足；重新核对 3,010 份水稻研究中 453 份高覆盖 PAV 子集、CDS >95% 与基因体 >85% 阈值，并区分 EUPAN 官方示例阈值与论文特定设置。新增水稻 Se 位点功能案例：Wang 等报告 Se 区域的 PAV 与相邻 ORF3/ORF4 互补作用有关，结合位点调查、转基因互补、基因编辑及花粉表型证据解释籼粳杂交生殖隔离；其 787 份、14 个稻属物种调查及 369 bp ORF4 启动子 PAV 均按原文描述，不将该个案推广为一般关联的因果证明。论文元数据为 Wang D et al., *Nature Communications* 14:4531 (2023), DOI `10.1038/s41467-023-40189-x`，书目由 [PubMed](https://pubmed.ncbi.nlm.nih.gov/37507369/)、[出版方原文](https://www.nature.com/articles/s41467-023-40189-x) 和 [PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC10382596/)交叉核对。

将专题元数据补齐 `pav-calling`、reads、蛋白、编码序列、注释和图数据标签，并以稳定论文 ID 关联新增应用案例。新增三态序列证据 SVG，分别呈现基因存在覆盖、侧翼可锚定的候选缺失及装配缺口下的未知状态，明确标注为模拟原理图。Playwright/Edge 的 `npm run test:figure-a11y` 扩展到 M03-04，在 375、768、1280、1440 px 检查图题/替代说明、模拟声明、无页面横向溢出、放大对话框和焦点行为；375 px 下横向滚动区可用键盘 Home/End。`npm run validate` 通过：Astro 63 文件零诊断，55 个已发布页面、Pagefind 55 页/6482 词及 1320 条内部链接通过。专题与新论文保持草稿；M03-01/02 完整审阅及整域发布闭包尚未完成。

## M03-01 频率分母与稀释曲线边界复核（2026-11-21）

对照专题正文、M03-04 三态 PAV 定义及 `topic-metadata.json`，将基因家族频率写为在可判定样本集合 $C_g$ 上计算，未知单元不进入分子或分母；同时记录不同家族可判定样本集不同时需检查缺失机制与样本组成。为累计家族稀释期望式补充条件：矩阵单元可判定、抽样顺序随机且样本集合固定；有未知值时先定义可分析样本或采用明示缺失处理的抽样设计，不把未知编码为 0 后套用该式。结构化专题标签补齐 `alignment`、`pav-calling`、`graph-genomics` 与蛋白、CDS、注释、短读段、组装和图数据类型，均来自该专题正文及已关联方法/案例的分析对象。

`npm run validate` 通过：Astro 63 文件零诊断、静态发布 55 页、Pagefind 55 页/6482 词、1320 条内部链接无错误；`npm run coverage` 通过，M03 七专题仍为草稿。Edge/Playwright 于 375、768、1280、1440 px 检查 M03-01 HTTP 200、13 个 KaTeX 节点及页面宽度无横向溢出。该轮只覆盖频率定义、稀释式前提、受控标签和响应式公式，不构成专题全文科学审核关闭。

## M03-02 MUMmer4 与 minimap2 工具及论文关系（2026-11-21）

新增 MUMmer4 与 minimap2 工具详情及各自的原始方法论文记录，并将稳定 ID 关联至全基因组比对专题。MUMmer4 的 suffix array 索引、最大精确匹配、匹配聚类/Smith–Waterman 延伸及 delta 输出，按 [Marçais 等原文](https://doi.org/10.1371/journal.pcbi.1005944)、[PubMed](https://pubmed.ncbi.nlm.nih.gov/29373581/)和[官方仓库说明](https://github.com/mummer4/mummer)核对。minimap2 的 minimizer 锚点、链化、相邻锚点间动态规划、`asm5` 组装预设及 PAF 输出按 [Li 原文](https://doi.org/10.1093/bioinformatics/bty191)、[PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC6137996/)和[官方 README](https://github.com/lh3/minimap2)核对。两条新增引用作为方法论文，不标作植物实证案例；专题原有 66 份水稻组装应用关系保留其 MUMmer 参考锚定与 EMBOSS `diffseq` 范围。

`npm run validate` 通过，内容覆盖显示 M03 共 10 个草稿工具、20 篇草稿论文；Astro 63 文件零诊断、55 页静态发布、Pagefind 55 页/6482 词、1320 条站内链接无错误。Edge 在 375、768、1280、1440 px 检查专题、MUMmer4、minimap2 和两篇方法论文，共 20 个路由/视口状态，HTTP 200 且无页面横向溢出。M03-02 的全文科学审核仍进行中，新增工具尚未在本机运行。

2026-11-21 对 M03 领域、七专题、9 个工具及 10 篇论文执行 Edge 浏览器回归，四视口共 108 个路由状态全部返回 HTTP 200、具有页面标题且无文档级横向溢出；点击验证 M03-05 → Minigraph → 水稻图泛基因组案例路径可达。该测试只核对本地草稿预览路由和布局。

2026-11-21 对照 vg 官方长读段 Giraffe 说明确认：长读段支持自 vg 1.63.0 起提供；PacBio HiFi 与 ONT R10 分别使用 `hifi`、`r10` 预设，并使用相应长读段索引。由此为受控数据类型新增通用 `long-reads`，更新 minimap2、vg 与 M03-02/M03-06 标签；vg 工具页补版本快照 1.78.0。来源：[vg 官方长读段指南](https://github.com/vgteam/vg/wiki/Mapping-long-reads-with-Giraffe)、[minimap2 官方使用说明](https://github.com/lh3/minimap2)。`npm run validate` 通过，标签引用通过构建检查。

2026-11-21 `npm audit` 重试未能连接 npm 官方安全审计端点（`registry.npmjs.org`，ETIMEDOUT），因此当前没有可判定的依赖漏洞报告；部署前需在网络可用时重试。

2026-11-21 更新 M03-07 的案例导航：高粱图构建比较、水稻多材料研究及拟南芥 69 份材料研究现链接到本站对应论文详情，并把拟南芥论文 ID 补入专题元数据。ODGI 或具体构图软件的实际使用仍严格按各原论文的方法记载，不将仅有植物背景的论文标为工具应用。`npm run validate` 通过（Astro 63 文件零诊断、55 页、Pagefind 55 页/6482 词、1320 条已发布页面本地链接无错误）；`npm run coverage` 通过且检查 M03 论文 ID 存在。
