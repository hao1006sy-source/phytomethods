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
| EUPAN | [PubMed 方法论文](https://pubmed.ncbi.nlm.nih.gov/28369371/)、[官方工具页](https://cgm.sjtu.edu.cn/eupan/index.html)、[官方安装说明](https://cgm.sjtu.edu.cn/eupan/installation.html)、[官方 SOP](https://cgm.sjtu.edu.cn/eupan/sop.html) | Map-to-pan、参考与新序列整合、reads 覆盖度及 gene/gene-family PAV 流程；方法论文列出 Perl/R/C++、Linux/集群及 CC BY-NC 4.0 非商业使用 | 未本机安装运行；官方旧版依赖需隔离环境评估；草稿页已完成四视口浏览器检查 |
| 水稻多组装 | [Zhao 等 PubMed](https://pubmed.ncbi.nlm.nih.gov/29335547/)、[作者论文 PDF](https://xhhuanglab.cn/uploads/publications/Rice_Pangenome_NG2018.pdf)、[DOI](https://doi.org/10.1038/s41588-018-0041-z) | 题名、作者、年份、期刊及 DOI；66 份材料、115× Illumina、SOAPdenovo2/Fermi/GapCloser、MUMmer 与 EMBOSS `diffseq`；变异统计及 67 个基因组 PAV 图示 | 页面结果及图表解释待逐项复核；历史工具尚未在本站分别建档 |
| 3,010 水稻材料 | [PubMed](https://pubmed.ncbi.nlm.nih.gov/29695866/)、[PMC 原文与方法](https://pmc.ncbi.nlm.nih.gov/articles/PMC6784863/)、[DOI](https://doi.org/10.1038/s41586-018-0063-9) | 3,010 总群体与 453 份高覆盖 SV/PAV 子集的界限；PLINK、ADMIXTURE、定制 novoBreak、EUPAN/Map-to-pan 关系及研究采用的覆盖阈值 | 全文结果与页面表达仍待继续审核；四视口预览及 M03 专题关系已通过 |
| 拟南芥 69 份材料 | [Lian 等，2024 原文](https://www.nature.com/articles/s41588-024-01715-9)、[PubMed](https://pubmed.ncbi.nlm.nih.gov/38605175/) | DOI、年份、期刊、9 位作者；OrthoFinder v2.5.4 基因家族、PLINK 连锁剪枝/PCA、ADMIXTURE v1.3.0 群体结构及对应关系已核 | 结果页面逐句复核及跨 M05 关联发布闭包 |
| 高粱图比较 | [Kopalli 等，2025](https://doi.org/10.1093/gigascience/giaf121)、[出版方全文](https://academic.oup.com/gigascience/article/doi/10.1093/gigascience/giaf121/8364989) | 六份真实高粱组装；Minigraph 0.21、PGGB 0.5.4、Minigraph-Cactus 2.7.2；ODGI 0.8.6、VG Giraffe 1.58.0、SyRI 1.6.3；模拟与真实读段映射任务已分开核 | 方法细节及页面关联已补；结果解释仍待逐项复审 |
| Minigraph 方法论文 | [Li、Feng、Chu，2020](https://pubmed.ncbi.nlm.nih.gov/33066802/) | 标题、作者、期刊卷页、DOI；方法论文以人类组装方法为主 | 未作为植物应用论文使用 |
| 拟南芥适应泛基因组 | [原文](https://doi.org/10.1038/s41467-023-42029-4)、[PubMed/PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC10558531/) | 方法部分确认 Hifiasm、OrthoFinder、IQ-TREE v2.0.3、独立 Minigraph、vg v1.40.0、PLINK、MCScanX 的用途；32 份 HiFi 组装，图上映射 1,135 份个体 reads，过滤后保留 1,073 个体及 20,326 个 SV 位点 | 结果页面逐句复核和跨领域发布闭包 |

2026-11-21 对照出版方、PubMed 和 PMC 方法论文记录：AnchorWave 原文支持基因结构锚点、最长路径与两段仿射 gap cost；Minigraph-Cactus 从 FASTA 组装经 Minigraph 结构变异图和 Cactus 碱基级多序列比对构图，论文展示 90 条人类单倍型；ODGI PubMed 确认作者、卷期页码与 DOI，摘要描述 GFA 图处理、分析、验证及可视化；VG 原文区分图上映射与独立基因型调用；PGGB 论文说明全对全比对构图与其方法定位；Giraffe 正式题名不含 “of”，5,202 人类基因组和 167,000 个 SV 是方法论文的人类评估数据。上述方法论文均不当作植物应用案例。

图中的样本和序列均为教学模型，未作为真实实验结果。教程 `syri-intro` 已使用 SyRI 1.8.2 和官方拟南芥测试数据执行 NUCmer 到 SyRI 的流程；记录见 `examples/syri/verified-20261121/`。原论文中出现的工具和本网站工具之间的关联，应逐项依据方法部分确认。

2026-11-21 对照 [GFA v1 格式规范](https://github.com/GFA-spec/GFA-spec/blob/master/GFA1.md)复核 M03-05 的交互路径图：segment 表示连续序列片段，link 包含连接端方向和重叠长度，path 是按顺序排列的有向片段。图中 A–D 仅为教学占位符，正向路径和连线省略了节点方向、碱基长度、重叠及坐标；两条预设路径分别为 A–B–D、A–C–D。图注明确该图为原理示意，未模拟 GFA 文件或真实变异输出。该边界与 Minigraph 官方说明中“图可包含输入样本未实际出现的 bubble 遍历路径”一致。Minigraph 的图构建输入是逐份完整组装并增量映射至已有图；PGGB 则以 wfmash 全对全比对、seqwish 图诱导和 smoothxg/gfaffix 规范化为主流程。来源：[Minigraph 官方 README](https://github.com/lh3/minigraph/blob/master/README.md)、[PGGB 官方 README](https://github.com/pangenome/pggb/blob/master/README.md)。`npm run test:figure-a11y` 已覆盖四种视口下的路径选择、文字说明、重置和放大弹窗；科学审查结论仅覆盖上述图意和流程区分，专题其他生物学论断仍需逐条审核。

## 版本来源快照
2026-11-21 查阅官方发布页：AnchorWave [v1.3.0](https://github.com/baoxingsong/AnchorWave/releases)、SyRI [v1.8.2](https://github.com/schneebergerlab/syri/releases)、Minigraph [v0.21/r606](https://github.com/lh3/minigraph/releases)、PGGB [v0.7.4](https://github.com/pangenome/pggb/releases)、ODGI [v0.9.4](https://github.com/pangenome/odgi/releases)、vg [v1.78.0](https://github.com/vgteam/vg/releases)及 Cactus [v4.0.0](https://github.com/ComparativeGenomicsToolkit/cactus/releases)。这是发布页信息；仅 SyRI 1.8.2 已在隔离环境运行，其他版本快照不表示本机安装。高粱论文使用历史软件版本，版本快照不可取代论文方法部分。

- vg 补充 [Giraffe 短读段方法论文](https://doi.org/10.1126/science.abg8871)、[当前索引说明](https://github.com/vgteam/vg/wiki/Index-Construction)与[许可](https://github.com/vgteam/vg/blob/master/LICENSE)。高粱论文以模拟 reads 评估有真值的映射准确度，也以公开真实 paired-end reads 比较图和线性参考映射；PGGB 因索引所需计算和内存未参与映射比较。vg 本机未运行。
- AnchorWave 官方 README v1.3.0 列出 `gff2seq`、`genoAli`、`proali` 和 `ali`；`genoAli` 主要覆盖同名染色体全局比对并可选 `-IV`，`proali` 处理重定位、融合或 WGD 深度差异，`-R/-Q` 需用户根据生物学背景选择。默认 `-w 100000` 对应常规预算约 9.3 GiB，但不构成硬 RSS 上限；`-fa3` 默认值在 1.3.0 中由旧阈值 100000 改为 50000。
- Minigraph 官方 v0.21/r606 README 说明参考引导图构建输入应按完整组装逐样本提供，示例包含 GFA/rGFA、GAF 与 bubble BED 类输出；MIT 许可已核对。独立 Minigraph 的关系补入拟南芥 2023 应用论文，未将其归到 Minigraph-Cactus。
- 2026-11-21 对照 Nature Genetics 出版方方法和 PubMed 书目信息核对拟南芥 69 份材料论文：OrthoFinder v2.5.4 定义基因家族，PLINK 执行 LD pruning/PCA，ADMIXTURE v1.3.0 推断 K=2–5 群体结构。对照 PMC 全文核对拟南芥 2023 适应研究：Hifiasm 组装 32 份 HiFi 材料；OrthoFinder 与 IQ-TREE v2.0.3 用于基因家族和系统树；独立 Minigraph 构图、vg v1.40.0 对 1,135 份个体短读段进行图映射；PLINK 过滤变异，MCScanX 分析共线性。论文元数据关系已按这些方法步骤补齐；这些草稿的跨领域依赖仍未关闭。
- 高粱基准在六份真实组装设置中报告 Minigraph、PGGB、Minigraph-Cactus 图大小约 0.92、4.7、4.2 Gb；Minigraph 只纳入 >50 bp 变异，而另两流程没有相同长度过滤。Giraffe mapping evaluation 同时包含由图生成的模拟 reads 和公开真实 paired-end reads；PGGB 未纳入映射比较。图大小不代表普遍质量排序；模拟定位真值指标与真实样本映射比例分别解释。

## 高粱基准方法细节复核

2026-11-21 对照出版方全文及 PMC 全文复核：论文题名、五位作者、GigaScience 2025;14:giaf121 与 DOI 一致。图构建版本为 Minigraph 0.21、PGGB 0.5.4、Minigraph-Cactus 2.7.2；图处理使用 ODGI 0.8.6；Giraffe 1.58.0；SyRI 1.6.3。六个高粱组装用于真实构图比较；另用已知结构变异构建模拟组装和读段。PGGB 图的 VG mapping index 未能生成，故 mapping comparison 只包括 Minigraph、Minigraph-Cactus 与线性 Minimap2。公开真实 paired-end reads 的比较报告总映射率与完美映射比例：Minimap2 82.47% / 68.77%，Minigraph-Cactus 73.44% / 82.77%，Minigraph 73.27% / 78.13%。这些数值描述论文指定数据及判定方式，不作为跨物种通用性能结论。[出版方方法与结果](https://academic.oup.com/gigascience/article/doi/10.1093/gigascience/giaf121/8364989)。

## 水稻泛基因组论文与 EUPAN 核查

2026-11-21 对照 Nature 原文、PubMed 与作者提供的 PDF 核对 Zhao 等 2018 年多组装研究：书目记录为 Nature Genetics 50(2):278–284，DOI 10.1038/s41588-018-0041-z；作者为 Qiang Zhao、Qi Feng、Hengyun Lu、Yan Li、Ahong Wang、Qilin Tian、Qilin Zhan、Yiqi Lu、Lei Zhang、Tao Huang、Yongchun Wang、Danlin Fan、Yan Zhao、Ziqun Wang、Congcong Zhou、Jiaying Chen、Chuanrang Zhu、Wenjun Li、Qijun Weng、Qun Xu、Zi-Xuan Wang、Xinghua Wei、Bin Han 和 Xuehui Huang。研究比较 66 份栽培与野生稻材料，平均测序深度约 115×，并使用 Fermi、SOAPdenovo2、GapCloser、MUMmer 与 EMBOSS `diffseq`；变异结果及对 67 个基因组编码基因的 PAV 分析在论文页面中说明。此研究属于线性参考锚定的多组装分析，不标记为图泛基因组软件应用。

2026-11-21 对照 Wang 等 3,010 水稻论文 PMC 全文核对测序和分析范围：PLINK 用于 LD 剪枝和 SNP 距离分析，ADMIXTURE 选择 K=9 并配合 CLUMPP 对齐重复运行矩阵；定制 novoBreak-germline 检测 SV。pan-genome 由 Nipponbare RefSeq 与 3,010 份组装产生的非冗余新序列组合，Map-to-pan 读取覆盖用于 PAV；SV/PAV 重点分析限于测序深度 >20× 且参考比对深度 >15× 的 453 份样本，基因存在判定阈值为 CDS >95%、gene body >85%。代码说明把基因及基因家族 PAV 分析纳入 EUPAN。

依据 EUPAN PubMed 方法论文及官方安装页/SOP 新增工具和方法论文草稿。官方文档记录依赖 Perl、R、C++，QUAST 使用旧版 Python 2 环境；工具页列出多样本 FASTQ、参考 FASTA、GFF/GTF 输入、PAV 矩阵和覆盖结果。官方示例 PAV 阈值与 Wang 等论文阈值分别注明，未混作软件全局默认值。页面与案例关系在 375、768、1280、1440 px 下通过浏览器检查；软件没有在本机运行，继续保持草稿。

2026-11-21 对照 [Giraffe 原始论文](https://pmc.ncbi.nlm.nih.gov/articles/PMC9365333/)核查 M03-06 的方法说明：GBWT 表示及查询图中的单倍型路径，minimizer 产生候选种子，按图距离聚类后沿路径延伸无缺口比对，再对剩余 gap 执行带缺口比对。vg 团队的[官方索引文档](https://github.com/vgteam/vg/wiki/Index-Construction)说明 Giraffe 使用 GBZ 图（包含 GBWT 和 GBWTGraph）、distance index、minimizer index，并区分短读段和长读段模式。原始论文中的 5,202 个体、167,000 个结构变异属于人类评估，页面明确未作为植物应用。交互模型的片段拼接为甲 ACGTTG、乙 ACCATG；AC 为共享子串，CGTT 只出现在甲，CCAT 只出现在乙。按钮仅做预设路径的精确子串筛选，不复现 Giraffe 的种子检索或 caller。`npm run test:figure-a11y` 已检查三个读段选择按钮、aria-pressed 状态及重置。

## M03-06 图上比对教学模型复核

2026-11-21 对照 [Giraffe 原始论文](https://pmc.ncbi.nlm.nih.gov/articles/PMC9365333/)核查方法页：Giraffe 使用 GBWT 表示及查询图中的单倍型路径，以 minimizer 建立种子，按图距离对候选种子聚类，沿单倍型路径延伸无缺口匹配，剩余位置才进入带缺口比对。论文案例为人类基因组；正文将 5,202 份个体和约 167,000 个已知 SV 明确标为人类方法评估。对照 [vg 官方索引文档](https://github.com/vgteam/vg/wiki/Index-Construction)，Giraffe 的索引组合包括 GBZ/GBWT、distance 和 minimizer，短读段与长读段索引参数区分。M03-06 的交互教学字符串拼接为甲 ACGTTG、乙 ACCATG；读段 AC 同时是共享子串，CGTT 仅匹配甲，CCAT 仅匹配乙，按钮只模拟精确子串筛选，不模拟 Giraffe 的种子评分或基因型调用。`npm run test:figure-a11y` 已检查三种读段选择和重置。专题其他原理、公式及植物案例仍需继续审核。

## M03-07 泛基因组研究路线示意复核

2026-11-21 检查 M03-07 的原创路线图：五个阶段按常见信息推进顺序排列，新增箭头以区分步骤方向；SVG 替代文本及图注均说明研究设计可按数据和问题分支或迭代。图是通用原理示意，不代表 ODGI、Minigraph、PGGB 或其他软件的特定输出，也不主张所有植物项目遵循固定线性流水线。对照 [ODGI 官方 Sort and Layout 教程](https://odgi.readthedocs.io/en/latest/rst/tutorials/sort_layout.html)和 [`odgi viz` 命令文档](https://github.com/pangenome/odgi/blob/master/docs/rst/commands/odgi_viz.rst)：图节点排序与一维/二维布局服务于图结构的呈现；一维视图按节点次序显示路径片段及图连接。该图与软件生成的路径布局分开说明。Edge/Playwright 回归在 375、768、1280、1440 px 检查了四个方向箭头、分支/迭代替代文本、图放大与横向溢出；静态构建产物的标题、图注和四个箭头几何断言通过。此条仅审核图的语义和说明，不代表 M03-07 正文已完成全面科学审核。
