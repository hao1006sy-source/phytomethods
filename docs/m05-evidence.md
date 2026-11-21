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
| 当前 PLINK 2.0 版本快照 | 官方页在 2026-11-21 查看时标 Beta 1.4，日期为 2026-11-07；官网将 Beta 状态及 GPL v3 信息列在页面上。 | [PLINK 2.0 官方下载与版本页](https://www.cog-genomics.org/plink/2.0/) |
| 3,010 水稻案例 | PLINK 做 SNP/LD 处理；ADMIXTURE 比较候选 K 并用 K=9 描述该研究群体；CLUMPP 对齐 Q 矩阵。方法边界及 453 份高覆盖 PAV/SV 子集见上文。 | [Nature DOI](https://doi.org/10.1038/s41586-018-0063-9)；[PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC6784863/) |
| 水稻根系适应案例 | 795 份栽培稻；PLINK 从 3.3 百万个未填补 SNP 中生成 154,516 个满足论文阈值和 $r^2\leq0.3$ 的剪枝集合；ADMIXTURE 运行 K=1–10，作者以 K=8 作为模型选择；GAPIT 用 3.3 百万个 SNP 计算 PCA/kinship，前 3 个 PC 进入 GWAS 模型。 | [PLOS Genetics 出版方全文](https://journals.plos.org/plosgenetics/article?id=10.1371/journal.pgen.1007521) |
| 本机运行边界 | PLINK 1.9.1（2026-11-11 构建）实际处理 8 个模拟二倍体样本和 6 个 SNP；输出频率与模拟剂量相符、缺失率为 0。PLINK 2.0 未在本机安装/运行；真实植物基因型数据未运行。 | [模拟分析日志](../examples/population/verified-plink-20261121/analysis.log)、[校验脚本](../scripts/check-plink-example.py)、[教程](../src/content/tutorials/plink-synthetic.md) |

PLINK 工具页、M05-03 和 GAPIT 互相关联已据此分清软件任务：在水稻根系研究中，PLINK 对应 LD 标记筛选，GAPIT 对应 PCA/kinship 与 GWAS 模型。三个资源及论文当前仍为草稿；本轮局部方法核查不关闭 M05 全域审核或发布依赖。

### 本轮构建与页面回归

`npm run validate` 在授权环境下通过：Astro 60 个文件零错误/警告/提示，静态构建 54 页，Pagefind 收录 54 页、5932 词，1276 条本地链接无错误。第一次受限运行在 Pagefind 覆写既有本地索引时遇到 Windows PermissionDenied；相同命令在授权环境重跑完成。`npm run coverage` 通过：M05 七个专题、4 个工具、11 篇论文和 1 篇教程均保持草稿。Edge DEV 预览对 PLINK、GAPIT、M05-03 与水稻根系案例在 375、768、1280、1440 px 共 16 个页面状态检查 HTTP 200、草稿标记、页面宽度和浏览器脚本错误；另验证 M05-03 → GAPIT → 水稻根系案例 → PLINK 导航通过。DEV 草稿检查不构成发布态验收。
