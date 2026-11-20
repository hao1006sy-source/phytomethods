# M03 草稿来源与核查记录

本表记录开发期间核对的来源及其支持范围。草稿是否达到发布要求仍需逐页检查正文、输入输出、版本、图注和关联。

| 条目 | 来源 | 已核对范围 | 仍待检查 |
| --- | --- | --- | --- |
| AnchorWave | [原论文](https://doi.org/10.1073/pnas.2113075119)、[官方仓库](https://github.com/baoxingsong/AnchorWave) | 基因锚点、全基因组复制、两段间隙代价、植物比较；仓库 MIT 许可 | 具体安装版本、参数及教学例子 |
| SyRI | [原论文](https://doi.org/10.1186/s13059-019-1911-0)、[官方示例](https://schneebergerlab.github.io/syri/example.html) | 组装比对、共线和重排、拟南芥案例；官方示例命令 | 软件环境、真实执行及输出 |
| Minigraph-Cactus | [原论文](https://doi.org/10.1038/s41587-023-01793-w)、[官方文档](https://github.com/ComparativeGenomicsToolkit/cactus/blob/master/doc/pangenome.md) | minigraph 与 Cactus 组合，样本清单及图输出 | 具体版本、资源要求及许可 |
| PGGB | [原论文](https://doi.org/10.1038/s41592-024-02430-3)、[官方仓库](https://github.com/pangenome/pggb) | 全对全比对、图诱导与规范化，仓库 MIT 许可 | 具体版本、参数与软件组成 |
| vg | [原论文](https://doi.org/10.1038/nbt.4227)、[索引文档](https://github.com/vgteam/vg/wiki/Index-Construction) | 变异图；Giraffe 索引类型与模式依赖 | 具体版本、输入输出与许可 |
| ODGI | [原论文](https://doi.org/10.1093/bioinformatics/btac308)、[官方仓库](https://github.com/pangenome/odgi) | 图、路径的存储和可视化；仓库 MIT 许可 | 具体版本、参数和图格式兼容性 |
| 水稻多组装 | [Zhao 等，2018](https://doi.org/10.1038/s41588-018-0041-z) | 栽培和野生水稻材料、基因内容与序列变异 | 个别定量结果和完整分析链 |
| 3,010 水稻材料 | [Wang 等，2018](https://pubmed.ncbi.nlm.nih.gov/29695866/) | 文章标题、年份、期刊、泛基因组与 PAV | 按正文逐项检查分析流程 |
| 高粱图比较 | [Kopalli 等，2025](https://doi.org/10.1093/gigascience/giaf121) | 高粱材料、PGGB、Minigraph-Cactus、Giraffe、ODGI 使用 | 将软件版本和具体评价条件补充到相应页面 |

图中的样本和序列均为教学模型，未作为真实实验结果。教程 `syri-intro` 是官方示例命令的草稿整理，当前没有实际运行记录。原论文中出现的工具和本网站工具之间的关联，应逐项依据方法部分确认。

## 版本来源快照
2026-11-21 查阅官方发布页：AnchorWave [v1.3.0](https://github.com/baoxingsong/AnchorWave/releases)、SyRI [v1.8.2](https://github.com/schneebergerlab/syri/releases)、PGGB [v0.7.4](https://github.com/pangenome/pggb/releases)、ODGI [v0.9.4](https://github.com/pangenome/odgi/releases)、vg [v1.78.0](https://github.com/vgteam/vg/releases)及 Cactus [v4.0.0](https://github.com/ComparativeGenomicsToolkit/cactus/releases)。这是发布页信息，不代表本机安装或教程已在这些版本运行；实际使用时应核对版本配套文档。高粱论文采用的是论文方法部分记录的历史版本，不能用此表替换。
