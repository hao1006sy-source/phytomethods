# M05 群体遗传学证据记录

审核分支：`feat/long-run-m03-v2`；记录日期：2026-11-21。范围：本记录当前先覆盖 ADMIXTURE 及其与 M05-03、3,010 份水稻案例的关系。局部证据核查不代表 M05 专题已全部通过审核或发布。

## ADMIXTURE 方法与软件记录

| 记录项 | 已核事实 | 来源 |
| --- | --- | --- |
| 核心方法 | 在给定 K 下，联合最大似然估计个体成分比例 Q 与成分等位基因频率 P；程序以交替块优化、SQP 和准牛顿加速提高计算效率。标准模型假设相互独立个体与近似连锁平衡。 | [Alexander et al., Genome Research, 2009](https://doi.org/10.1101/gr.094052.109)；[官方 publication 页](https://dalexander.github.io/admixture/publications.html) |
| 算法增强 | 2011 年论文系统介绍 CV、监督学习、惩罚估计和多处理器扩展；监督学习的 `.ind` 标签及参考群体可分配性要求依据全文方法说明。 | [Alexander & Lange, BMC Bioinformatics, 2011, PMID 21682921](https://pubmed.ncbi.nlm.nih.gov/21682921/)；[PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC3146885/) |
| 版本 | 官方下载页当前列出 ADMIXTURE 1.4.0；官方新闻记录 2026-04-26 发布，并称属于性能更新，约两倍速度、无用户可见行为变化。历史植物论文使用的 1.3.0 等版本单独记录，不能用当前版本替换论文环境。 | [官方官方下载页](https://dalexander.github.io/admixture/download.html)；[官方版本新闻](https://dalexander.github.io/admixture/news.html) |
| 输入 | 官方手册列出 PLINK BED（连同 BIM/FAM）、PED（MAP）和 EIGENSTRAT GENO（MAP）。 | [官方 ADMIXTURE 手册](https://dalexander.github.io/admixture/admixture-manual.pdf) |
| 输出与参数 | `.K.Q` 为祖先成分比例；`.K.P` 为成分等位基因频率；`-B` 可输出 `.K.Q_se`；`--cv` 默认为五折且支持 `--cv=N`；`-jN` 设置线程；`-P` 用既有 P 频率投影同位点集样本。 | [官方手册](https://dalexander.github.io/admixture/admixture-manual.pdf) |
| 软件分发 | 2016 年 ADMIXTURE 应用论文的 Availability/Requirements 说明二进制可获取、源码为 proprietary，并报告没有针对非学术用户的使用限制。当前官方下载页提供二进制和手册，没有提供标准 SPDX 开源许可文件；工具页按闭源二进制分发记录。 | [Alexander et al., BMC Bioinformatics, 2016](https://pmc.ncbi.nlm.nih.gov/articles/PMC4877806/)；[官方官方下载页](https://dalexander.github.io/admixture/download.html) |
| 本机运行 | PhytoMethods 当前没有 ADMIXTURE 本机运行日志，也没有基于真实植物基因型数据的运行。本站列出的命令依据官方手册整理，运行状态仍是未实跑。 | 项目本机验证目录与版本记录 |

## 关系与植物案例核查

### 3,010 份亚洲栽培稻

Wang 等论文将 PLINK 的 SNP/LD 数据处理与 ADMIXTURE 的祖先成分估计分开描述。作者对候选 K 进行重复拟合，最终以 K=9 描述论文采样集合，并以 CLUMPP 对齐 Q 矩阵。该群体结构步骤对应全群体研究；结构变异/PAV 的重点分析另限于 453 份高覆盖材料。本站关联 `rice-3010-pangenome`、`admixture`、`plink`、`eupan` 分别对应原论文实际任务，不将 ADMIXTURE 描述为变异检测工具。

来源：[Nature DOI](https://doi.org/10.1038/s41586-018-0063-9)、[PubMed](https://pubmed.ncbi.nlm.nih.gov/29695866/)、[PMC 全文及方法](https://pmc.ncbi.nlm.nih.gov/articles/PMC6784863/)。对应页面：[3,010 水稻论文](../src/content/papers/rice-3010-pangenome.md)、[M05-03](../src/content/topics/m05-topic-03.md)、[ADMIXTURE](../src/content/methods/admixture.md)。

### 拟南芥群体分析样本范围

Lian 等 2024 年研究使用 72 份材料进行群体 SNP 分析，随后从组装/泛基因组分析集合中排除 3 份高杂合材料，以 69 份材料进行后续分析。本站论文关联仅表示论文相应分析步骤实际使用 ADMIXTURE/PLINK；群体结构与组装样本范围分别说明。

来源：[Nature Genetics 原文](https://www.nature.com/articles/s41588-024-01715-9)、[PubMed](https://pubmed.ncbi.nlm.nih.gov/38605175/)。

## 当前审核判定

- ADMIXTURE 工具页和 M05-03 已补充模型、流程、输入输出、参数、版本与案例边界；2011 算法增强论文已建独立文献记录并关联工具和专题。
- ADMIXTURE 原始方法及 2011 算法增强论文的 DOI、题名、作者、期刊和年份已通过出版物/PubMed 核对。
- PLINK 已有模拟 VCF 的 1.9.1 本机运行记录；ADMIXTURE 未运行。
- M05-03、ADMIXTURE、ADMIXTURE 方法论文和水稻应用案例继续保持草稿；M05 其他专题、工具和论文的完整依赖闭包尚未审核。
- `npm run validate` 通过：60 个 Astro 文件零诊断、54 个已发布静态页、54 页/5932 词 Pagefind 索引和 1276 条本地链接无错误；`npm run coverage` 通过。Edge DEV 预览先对 ADMIXTURE、M05-03、原始方法论文和水稻案例各在 375、768、1280、1440px 检查；新增算法增强论文也通过四种宽度，工具页与专题页在 375/1280px 复验，合计 24 次视口状态无文档横向溢出。375px 长公式位于带可访问名称和 Tab 焦点的滚动区。验证 M05-03 → ADMIXTURE → 原始方法论文、M05-03 → 水稻案例、ADMIXTURE ↔ 算法增强论文及 M05-03 → 算法增强论文跳转通过，浏览器 pageerror 为 0。上述草稿预览不等于发布态验收；详细阶段日志见 `docs/long-run-progress.md`。

## PLINK、PCA 与水稻案例方法分工

| 记录项 | 已核事实 | 来源 |
| --- | --- | --- |
| PLINK 1.9 / 2.0 PCA | 官方 1.9 文档说明 PCA 基于方差标准化关系矩阵、默认 20 个 PC，并输出 `.eigenvec`/`.eigenval`；PLINK 2.0 页面列默认 10 个 PC，`approx` 使用随机化算法且均值填补缺失调用。两代样本文件表头和输入格式需分别解析。 | [PLINK 1.9 PCA 文档](https://www.cog-genomics.org/plink/1.9/strat#pca)；[PLINK 2.0 PCA 文档](https://www.cog-genomics.org/plink/2.0/strat)；[PLINK 2.0 格式说明](https://www.cog-genomics.org/plink/2.0/formats) |
| PLINK FST | PLINK 1.9 对常染色体二倍体位点按 Weir–Cockerham 估计量计算逐位点 FST 和原始/加权全局均值；PLINK 2.0 支持 Hudson（默认）与 Weir–Cockerham，`blocksize` 提供区块 jackknife 标准误，`report-variants` 输出逐位点结果。 | [PLINK 1.9 FST 文档](https://www.cog-genomics.org/plink/1.9/basic_stats#fst)；[PLINK 2.0 FST 文档](https://www.cog-genomics.org/plink/2.0/basic_stats#fst)；[Weir–Cockerham 1984](https://doi.org/10.1111/j.1558-5646.1984.tb05657.x) |
| PLINK LD | `--indep-pairwise` 以窗口内基因型等位基因计数相关贪心剪枝，输出 `.prune.in/.prune.out`；`--r2` 报告 genotype-count $r^2$；`--ld` 对单个位点对提供单倍型频率、$r^2$ 和 $D'$。PLINK 1.9 LD 计算默认仅纳入 founders。 | [PLINK 1.9 LD 文档](https://www.cog-genomics.org/plink/1.9/ld) |
| 当前 PLINK 2.0 版本快照 | 官方页在 2026-11-21 查看时标 Beta 1.4，日期为 2026-11-07；官网将 Beta 状态及 GPL v3 信息列在页面上。 | [PLINK 2.0 官方下载与版本页](https://www.cog-genomics.org/plink/2.0/) |
| 3,010 水稻案例 | PLINK 做 SNP/LD 处理；ADMIXTURE 比较候选 K 并用 K=9 描述该研究群体；CLUMPP 对齐 Q 矩阵。方法边界及 453 份高覆盖 PAV/SV 子集见上文。 | [Nature DOI](https://doi.org/10.1038/s41586-018-0063-9)；[PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC6784863/) |
| 水稻根系适应案例 | 795 份栽培稻；PLINK 从 3.3 百万个未填补 SNP 中生成 154,516 个满足论文阈值和 $r^2\leq0.3$ 的剪枝集合；ADMIXTURE 运行 K=1–10，作者以 K=8 作为模型选择；GAPIT 用 3.3 百万个 SNP 计算 PCA/kinship，前 3 个 PC 进入 GWAS 模型。 | [PLOS Genetics 出版方全文](https://journals.plos.org/plosgenetics/article?id=10.1371/journal.pgen.1007521) |
| 本机运行边界 | PLINK 1.9.1（2026-11-11 构建）实际处理 8 个模拟二倍体样本和 6 个 SNP；输出频率与模拟剂量相符、缺失率为 0。PLINK 2.0 未在本机安装/运行；真实植物基因型数据未运行。 | [模拟分析日志](../examples/population/verified-plink-20261121/analysis.log)、[校验脚本](../scripts/check-plink-example.py)、[教程](../src/content/tutorials/plink-synthetic.md) |

PLINK 工具页、M05-03 和 GAPIT 互相关联已据此分清软件任务：在水稻根系研究中，PLINK 对应 LD 标记筛选，GAPIT 对应 PCA/kinship 与 GWAS 模型。三个资源及论文当前仍为草稿；本轮局部方法核查不关闭 M05 全域审核或发布依赖。

### 本轮构建与页面回归

`npm run validate` 在授权环境下通过：Astro 60 个文件零错误/警告/提示，静态构建 54 页，Pagefind 收录 54 页、5932 词，1276 条本地链接无错误。第一次受限运行在 Pagefind 覆写既有本地索引时遇到 Windows PermissionDenied；相同命令在授权环境重跑完成。`npm run coverage` 通过：M05 七个专题、4 个工具、11 篇论文和 1 篇教程均保持草稿。Edge DEV 预览对 PLINK、GAPIT、M05-03 与水稻根系案例在 375、768、1280、1440 px 共 16 个页面状态检查 HTTP 200、草稿标记、页面宽度和浏览器脚本错误；另验证 M05-03 → GAPIT → 水稻根系案例 → PLINK 导航通过。DEV 草稿检查不构成发布态验收。

M05-04 增补后再次运行 `npm run validate`，Astro 60 个文件零诊断、静态构建 54 页、Pagefind 54 页/5932 词、1276 条本地链接通过；`npm run coverage` 确认 7 篇专题、4 个工具、11 篇论文和 1 篇教程继续为草稿，未关联工具的草稿专题由 18 篇降至 17 篇。Edge DEV 对 PLINK 与 M05-04 在 375、768、1280、1440 px 检查，共 8 个页面视口状态通过；M05-04 → PLINK 导航和 FST 正文检查通过，页面脚本错误为 0。PLINK FST/LD 命令依据官方文档整理，尚未在本机实跑。

## M05-05 选择性清除：方法、实现和植物案例

| 记录项 | 已核事实 | 来源 |
| --- | --- | --- |
| XP-CLR 方法 | Chen、Patterson 与 Reich 于 2010 年提出跨群体复合似然方法；中性模型以漂变描述两群体频率变化，选择模型描述连锁邻域的多位点频率差异，按 LD 相关性降低冗余位点贡献。书目信息为 Genome Research 20(3):393–402。 | [PubMed](https://pubmed.ncbi.nlm.nih.gov/20086244/)；[PMC 原文](https://pmc.ncbi.nlm.nih.gov/articles/PMC2840981/) |
| XP-CLR 实现边界 | `hardingnj/xpclr` README 将其列为独立 Python 重写，称其源于原始程序存在的问题；输入包括 VCF/HDF5/文本，含双群体样本、地图、窗口和 LD 权重参数。其输出和归一化分数属于该实现，不能视为原始程序版本互换。 | [仓库 README](https://github.com/hardingnj/xpclr)；[David Reich Lab 软件目录](https://reich.hms.harvard.edu/software) |
| XP-EHH 方法 | Sabeti 等 2007 年在 HapMap 群体扫描中提出 XP-EHH，用两群体延伸单倍型纯合性积分比较识别一群体中接近固定的长单倍型信号；目标/参照输入顺序决定结果方向。 | [Nature 原文](https://www.nature.com/articles/nature06250)；[PubMed](https://pubmed.ncbi.nlm.nih.gov/17943131/) |
| selscan 软件 | 本轮核查时 GitHub 主分支 README 显示 v3.1.0，要求 C++17 与 zlib，XP-EHH 接收群体 VCF、参考 VCF 和地图选项，并说明该输入模式不接受缺失基因型。XP-EHH 方法论文与 selscan 软件论文分别记录。 | [官方仓库与手册](https://github.com/szpiech/selscan)；[2014 软件论文](https://doi.org/10.1093/molbev/msu211) |
| SweepFinder2 方法与输入 | 单群体频率谱 CLR 扫描；官方手册的频率文件含 `position/x/n/folded`，经验中性频谱用 `-f` 生成，`-lr/-lrg` 可加入重组率图。B 值模式具有额外人口参数和群体单系假设。开发者源码库标 GPL-3.0，手册程序版本为 1.0。 | [开发者手册](https://degiorgiogroup.fau.edu/Manual_SweepFinder2_v1.0.pdf)；[源码仓库](https://github.com/mdegiorgio/SweepFinder2)；[方法论文](https://doi.org/10.1093/bioinformatics/btw051) |
| 韩国杂草稻案例 | 30 份杂草稻、30 份地方稻和 10 份野生稻；论文报告 ROD、FST、XP-CLR、iHS 和 XP-EHH，按各自分布最高 2.5%筛选窗口/位点，并将至少两类扫描支持的 537 个基因作为候选集合。论文使用的 XP-CLR 程序与本站 Python 重写不作等同。 | [全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC5316921/)；[DOI](https://doi.org/10.1111/pbi.12630) |
| 亚洲栽培稻有害变异案例 | 论文对部分 3K 数据使用 XP-CLR 与 SweeD，前 5%作为该研究扫描阈值；indica 子集不同方法识别到的区域数和重叠程度不同。 | [出版方原文](https://academic.oup.com/mbe/article/34/4/908/2897207)；[DOI](https://doi.org/10.1093/molbev/msw296) |
| 水稻 TE 标记案例 | Yan 等在 176 份材料中对 SNP/TE 标记运行 SweepFinder2，使用 10 kb 网格和最高 1%窗口阈值，合并相邻高分段。 | [全文方法](https://pmc.ncbi.nlm.nih.gov/articles/PMC9251385/)；[DOI](https://doi.org/10.1016/j.xplc.2021.100270) |
| Huang 水稻驯化案例 | 446 份野生稻与 1,083 份籼/粳稻，报告 55 个驯化扫荡区；主扫描使用 100 kb 窗口的 π 比值并结合置换校准，XP-EHH 为另行测试。 | [全文方法](https://pmc.ncbi.nlm.nih.gov/articles/PMC7518720/)；[补充材料](https://media.springernature.com/original/springer-static/esm/art%3A10.1038%2Fnature11532/MediaObjects/41586_2012_BFnature11532_MOESM59_ESM.pdf) |

M05-05 新增 XP-CLR、selscan、SweepFinder2 工具记录，四篇方法/软件论文和三篇植物应用论文记录。专题、工具、论文和受控标签使用稳定 ID 互联。新工具命令依据各自手册/README 核对，未在本机以真实植物数据实跑；相关页面保持草稿。方法学局部核源不代表 M05 全域审核结束。

### 2026-11-21：M05-05 构建回归

`npm run coverage` 通过：M05 七专题、七工具、18 篇论文、一篇教程仍为草稿；全站无工具关联草稿专题由 17 篇降至 16 篇。`npm run validate` 在授权环境通过：Astro 60 文件零诊断、54 个已发布页面、Pagefind 54 页/5937 词、1276 条本地链接无错误。Edge 对专题、三个工具与四篇相关论文在 375、768、1280、1440 px 共检查 32 个页面视口，HTTP 200、草稿标记、标题、页面宽度与脚本错误检查通过；专题→XP-CLR→方法论文、SweepFinder2→方法论文导航通过。新增工具和论文为草稿，未进入静态发布集合；浏览器检查只覆盖本地 DEV 预览。

## M05-06 群体历史动态：方法与植物案例

| 记录项 | 已核事实 | 来源 |
| --- | --- | --- |
| PSMC 方法与格式 | Li 与 Durbin 2011 年方法论文；官方 README 提供 `fq2psmcfa`、`psmc`、`splitfa`、bootstrap 与 `psmc_plot.pl` 示例，默认 PSMCFA bin size 为 100 bp。命令页未把人类示例时间分段当作植物通用参数。 | [Nature 方法论文](https://doi.org/10.1038/nature10231)；[官方 README](https://github.com/lh3/psmc) |
| MSMC/MSMC2 | MSMC 原方法论文为 Schiffels 与 Durbin 2014；MSMC2 官方 README 更新了时间分段和样本对选择，并提供 multihetsep 输入、`-I/-p/-t` 控制项与跨群体三类配对运行示例。2020 年章节提供 MSMC/MSMC2 分析协议。 | [Nature Genetics 原文](https://doi.org/10.1038/ng.3015)；[MSMC2 仓库](https://github.com/stschiff/msmc2)；[协议 DOI](https://doi.org/10.1007/978-1-0716-0199-0_7)；[msmc-tools](https://github.com/stschiff/msmc-tools) |
| SMC++ 方法与实现 | Terhorst、Kamm 与 Song 2017 方法论文报告未定相样本、条件频率谱、扩展样本处理与样条正则化；`split` 模型假定 clean split。官方仓库列 `vcf2smc`、`estimate`、`plot`、`split` 输入输出，`vcf2smc` 假设双等位二倍体 VCF、参考等位基因为祖先，并需通过 mask 处理未调用区域。 | [Nature Genetics 原文](https://doi.org/10.1038/ng.3748)；[PMC全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC5470542/)；[官方仓库](https://github.com/popgenmethods/smcpp) |
| 非洲稻案例 | Cubry 等 246 份基因组研究分别描述 PSMC、MSMC/MSMC2 和 SMC++。PSMC/MSMC 使用 16 条栽培稻单倍型组合的 8 个伪二倍体并有 6 次 MSMC bootstrap；SMC++ 使用 79 个伪二倍体、5 条区分谱系、$6.5\times10^{-9}$ 每代每位点突变率、100,000 代上界和 25 个 spline knots。原文总体人口曲线在约 3,400 BP 低点与约 1,847 BP 增加信号；该设计依赖伪二倍体方法和一年世代时间。 | [Current Biology全文与STAR Methods](https://rbca.africarice.org/files/doc/journal/10.1016j.cub.2018.05.066.pdf)；[PubMed](https://pubmed.ncbi.nlm.nih.gov/29983312/) |
| 杨树重复序列研究 | Patil 与 Vijay 以 *Populus trichocarpa* 比较 repeat masking 对 PSMC/MSMC/SMC++/Stairway Plot 的影响；在该植物数据中，屏蔽重复区域后远古时期估计下降、近期估计上升，强调 mask 方案会影响历史估计。 | [Heredity原文](https://doi.org/10.1038/s41437-021-00443-8)；[PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC8322061/) |
| 胡杨研究 | Jia 等全基因组重测序研究报告约 3.15 million SNP 和四个具有地理结构的支系；PSMC 用于支系规模历史，fastsimcoal26 单独用于多群体模型/迁移参数，页面不把迁移率归于 PSMC。 | [PubMed与DOI](https://pubmed.ncbi.nlm.nih.gov/32242238/)；[PMC全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC7475257/) |

M05-06 新增 PSMC、MSMC2 和 SMC++ 工具页，新增 MSMC 方法论文、MSMC2 协议、SMC++ 方法论文及三篇植物案例；方法关系和标签通过稳定 ID 管理。新增共祖状态流程 SVG 标明为原理示意。`npm run validate` 通过：Astro 61 文件零诊断、54 个已发布页、Pagefind 54 页/5948 词、1276 条站内链接无错误。`npm run coverage` 确认 M05 七专题、10 工具、24 篇论文和一篇教程均为草稿；无工具关联草稿专题由 16 降为 15。Edge 对 M05-06 专题、三工具与七论文共 11 个路由在 375、768、1280、1440 px 检查 HTTP 200、标题、草稿预览状态和页面溢出；专题—工具—案例链接存在，375px 下流程 SVG 处于内部横向滚动容器，页面整体宽度未溢出。新增工具命令依据官方材料核对，未在本机真实植物基因组上运行。
