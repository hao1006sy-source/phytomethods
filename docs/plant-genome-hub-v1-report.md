# Plant Genome Hub V1 开发与数据核实报告

核实日期：2026-11-24。开发分支：feat/plant-genome-hub-v1。起点为最新 origin/main e50201a，保留已合并的算法与工具目录 V4。

## 实际实现范围

新增 /genomes/ 检索页、10 个物种详情页及 /genomes/databases/。支持中文名、学名、英文名、品系、accession、物种与组装 Taxonomy ID、数据库名称搜索；类别、来源、组装等级、组装版本、文件可用性及获取方式联合筛选。详情页支持版本 URL 恢复、配套检查、官方入口、已核实直链、curl 与 NCBI CLI 复制，以及 JSON manifest 和 Markdown 引用清单。个人操作均在浏览器执行。

## 登记数量

| 实体 / 获取状态 | 数量 |
| --- | ---: |
| 物种 | 10 |
| 组装版本 | 11 |
| 注释记录 | 11 |
| 资源类型登记 | 85 |
| 已核实直链 | 7 |
| 官方页面资源 | 50 |
| 需登录的具体文件 | 0 |
| 尚未核实的文件类型 | 28 |

85 项登记包含 28 项明确标记待核实的资源类型；这些类型没有下载 URL，不能默认选择。50 项为官方页面入口，没有冒充直接文件。尚未登记 JGI 的具体登录文件，数据库导航已注明账号/政策及维护状态。未生成文件校验和，manifest 中 sha256 为 null。

## 组装与注释来源

| 物种 / 品系 | Assembly 名称 | Accession | 注释 | 官方出处 |
| --- | --- | --- | --- | --- |
| 拟南芥 / Col-0 | Col-CC | GCA_028009825.2 | TAIR12 | [组装](https://www.ncbi.nlm.nih.gov/datasets/genome/GCA_028009825.2/) / [注释](https://phoenixbioinformatics.atlassian.net/wiki/spaces/COM/pages/1400373256) |
| 水稻 / Nipponbare | IRGSP-1.0 | GCA_001433935.1 | RGAP / MSU Release 7（文件更新 2024-09-01） | [组装](https://www.ncbi.nlm.nih.gov/datasets/genome/GCA_001433935.1/) / [注释](https://rice.uga.edu/download_osa1r7.shtml) |
| 玉米 / B73 | Zm-B73-REFERENCE-NAM-5.0 | GCF_902167145.1 | GCF_902167145.1-RS_2025_02 | [组装](https://www.ncbi.nlm.nih.gov/datasets/genome/GCF_902167145.1/) / [注释](https://www.ncbi.nlm.nih.gov/genome/annotation_euk/Zea_mays/GCF_902167145.1-RS_2025_02.html) |
| 小麦 / Chinese Spring | IWGSC CS RefSeq v2.1 | GCF_018294505.1 | GCF_018294505.1-RS_2025_04 | [组装](https://www.ncbi.nlm.nih.gov/datasets/genome/GCF_018294505.1/) / [注释](https://www.ncbi.nlm.nih.gov/genome/annotation_euk/Triticum_aestivum/GCF_018294505.1-RS_2025_04.html) |
| 大豆 / Williams 82 | Glycine_max_v4.0 | GCF_000004515.6 | GCF_000004515.6-RS_2025_01 | [组装](https://www.ncbi.nlm.nih.gov/datasets/genome/GCF_000004515.6/) / [注释](https://www.ncbi.nlm.nih.gov/genome/annotation_euk/Glycine_max/GCF_000004515.6-RS_2025_01.html) |
| 番茄 / Micro-Tom | SLM_r2.1 | GCF_036512215.1 | GCF_036512215.1-RS_2024_09 | [组装](https://www.ncbi.nlm.nih.gov/datasets/genome/GCF_036512215.1/) / [注释](https://www.ncbi.nlm.nih.gov/genome/annotation_euk/Solanum_lycopersicum/GCF_036512215.1-RS_2024_09.html) |
| 马铃薯 / DM 1-3 516 R44 | SolTub_3.0 | GCF_000226075.1 | GCF_000226075.1-RS_2025_04 | [组装](https://www.ncbi.nlm.nih.gov/datasets/genome/GCF_000226075.1/) / [注释](https://www.ncbi.nlm.nih.gov/genome/annotation_euk/Solanum_tuberosum/GCF_000226075.1-RS_2025_04.html) |
| 高粱 / BTx623 | Sorghum_bicolor_NCBIv3 | GCF_000003195.3 | NCBI Sorghum bicolor Annotation Release 101 | [组装](https://www.ncbi.nlm.nih.gov/datasets/genome/GCF_000003195.3/) / [注释](https://www.ncbi.nlm.nih.gov/genome/annotation_euk/Sorghum_bicolor/101) |
| 大麦 / Morex | MorexV3_pseudomolecules_assembly | GCF_904849725.1 | NCBI Hordeum vulgare subsp. vulgare Annotation Release 100 | [组装](https://www.ncbi.nlm.nih.gov/datasets/genome/GCF_904849725.1/) / [注释](https://www.ncbi.nlm.nih.gov/genome/annotation_euk/Hordeum_vulgare_subsp._vulgare/100) |
| 美洲黑杨 / Nisqually-1 | P.trichocarpa_v4.1 | GCF_000002775.5 | NCBI Populus trichocarpa Annotation Release 102 | [组装](https://www.ncbi.nlm.nih.gov/datasets/genome/GCF_000002775.5/) / [注释](https://www.ncbi.nlm.nih.gov/genome/annotation_euk/Populus_trichocarpa/102) |
| 拟南芥 / Col-0 | TAIR10 | GCA_000001735.1 | Araport11 | [组装](https://www.ensembl.org/genome/GCA_000001735.1) / [注释](https://www.ensembl.org/genome/GCA_000001735.1) |

组装原始元数据来自 NCBI Datasets v2 dataset_report；历史 TAIR10 来源为 Ensembl 官方组装页。原始响应和失败查询均保存在 outputs/plant-genome-hub-v1/sources/。番茄旧 accession 查询未返回记录，改用官方 taxon 4081 reference 查询返回的 Micro-Tom SLM_r2.1（GCF_036512215.1）。未使用无记录的候选编号。水稻 GCF_001433935.1 为 suppressed，正式使用已核实的 GenBank GCA_001433935.1。水稻物种 Taxonomy ID 4530 与其 Japonica Group 组装 ID 39947 分开；大麦物种 4513 与组装所属分类 112509 分开，另有 taxonomy API 原始响应。

assemblyVersion 记录 accession 点号后的版本，assemblyName 保留官方组装发布名（如 IWGSC v2.1）。注释 release 与数据库快照日期另存，避免把三者当作同一版本。未核实的发布日期明确显示未核实。

配套组合统计：1 组 confirmed（RGAP）；10 组 unverified（文件命名未核实）。TAIR12 与 TAIR10 跨版本比较为 incompatible。

## TAIR12 / TAIR10 案例

TAIR 官方 What Changed 页面明确 TAIR12 基于 Col-CC.v2，GenBank GCA_028009825.2；NCBI assembly_name 为 Col-CC。TAIR10 / Araport11 记录 GCA_000001735.1，Ensembl 页面明确其 Araport11 注释关联。两个 assemblyId 不同，兼容性函数直接返回 incompatible；AGI 名称一致不改变此判断。旧研究应保留原坐标。TAIR12 的细胞器未重注释说明保留。未对 TAIR / Ensembl 实际文件命名做头部核对，因此同一版本门户组合仍返回 unverified，默认仅选择 Genome，用户可明确选择其他文件并导出带未确认状态的清单。

## RGAP / IRGSP 案例

RGAP 官方下载页明确 Release 7 文件基于 Os-Nipponbare-Reference-IRGSP-1.0；Release 7 日期 2011-10-31、文件更新 2024-09-01 分开记录。注释机构为 UGA / MSU RGAP，不将 NCBI GenBank 的提交机构当作 RGAP 注释机构。选择 all_models 全基因模型文件（包括 TE），与 representative 和非 TE 子集分开。

7 个官方 gzip URL 经系统证书验证的 HTTP Range 请求返回 206 且 gzip 文件头有效。另对 Genome 与 GFF3 各读取约 16 KB 压缩片段，实际解压内容分别为 >Chr1 和 GFF3 的 Chr1 / MSU_osa1r7；保留抽查前缀证据。登记的 RGAP 配套组合为 confirmed。未下载完整大文件，也未承诺全文件哈希或逐染色体全量一致性检查。

## 兼容性与命令规则

src/lib/genomes/compatibility.ts 返回 confirmed / incompatible / unverified，并提供中文理由。比较 assemblyId（含 GCA/GCF 及版本）、物种、坐标体系、品系、正式发布记录、染色体命名和来源。缺少命名信息即 unverified；不同 accession、品系、命名或发布即 incompatible。GCA/GCF 编号相近或配对关系均不自动判为等价。玉米 NCBI 元数据中包含细胞器差异说明，保留在版本备注。

其他 NCBI 门户记录的组装和注释关系来自官方元数据，文件命名仍待下载核对，组合不默认标 confirmed。NCBI 命令是独立数据包入口，明确提示不与 TAIR/RGAP/Ensembl 注释自动混配；这些外部发布仅生成 genome 包命令。历史 TAIR10 未从当前 Datasets 查询返回，禁用该版本 CLI 复制，保留 Ensembl 来源。其余有正式注释元数据的 NCBI 记录可生成 genome,gff3,protein,cds 请求，同时提示实际包可能缺失文件、注释 release 需下载后核对。

## 网站集成与保护

复用 Base 品牌导航，新增加基因组资源；首页增加单独入口。研究领域、教程索引、搜索页和教程详情通过 Base 添加关联入口，未修改教程科研正文。现有 main 没有 Workflows 页面，Base 的入口规则已覆盖该未来路由，未创建占位 Workflow 或死链。Pagefind 自动索引新增静态页面，浏览器按 accession 查询已能找到 /genomes/ 结果。新样式限定在 .gh，保留其他页面样式。

未修改 src/content/methods、src/content/papers、src/content/tutorials、src/lib/knowledge、知识图谱 JSON、CAFE5 证据或 Antigravity 的 methods-index-v4 文件。

## 自动检查与浏览器验证

npm ci、npm run check、npm run build、npm run validate、npm run coverage、npm run check:genome-hub 已执行成功；validate 纳入确定性 Genome Hub 检查。数据检查涵盖唯一 ID、合法 accession 与版本、Taxonomy ID、关系引用、来源数据库、格式、URL、日期和直接下载证据。11 项兼容性断言涵盖 TAIR 冲突、RGAP 配套、GCA/GCF、物种、品系、命名、坐标、正式发布及缺失证据。

浏览器脚本 scripts/browser-test-genome-hub.mjs 使用 Edge，覆盖检索、联合筛选、版本选择与刷新、版本冲突、门户和直链展示、剪贴板 CLI、JSON 文件实际导出、Markdown 引用、6 个数据库、10 个详情路由、Pagefind 和深色模式。按 1600×900、1280×800、1024×768、768×1024、390×844、375×812 对检索页、拟南芥、水稻、数据库页检查，共 24 个视口检查，并截图；深色模式另截图及检查标题文字颜色。另完成现有首页 1600、1280、390px 的入口和无溢出检查，以及研究领域、教程、搜索入口检查。测试结果见 outputs/plant-genome-hub-v1/browser/。

## 当前资源状态与后续核实

Ensembl FTP 文档本轮请求失败，历史组装页来源已核实；CNCB GWH 主页请求超时，未登记其具体直链；Phytozome 官方页面显示自 2026-11-09 起维护，页面提供 JGI Data Portal 入口和政策说明。数据库页面保留这些真实状态。后续可对门户资源下载实际文件核对 chromosome header、注释发布与全文件哈希，再升级对应组合状态；JGI/CNCB 具体数据集应逐条登记，资源范围目前为首批人工核实快照。

## 交付与维护

报告、截图、测试 JSON、下载示例 manifest 和注册表交付包保存到 D:/Codex-Projects-data-output/20261124植物基因组资源导航。维护时新增版本实体而非覆盖历史记录，核实来源和文件命名后再调整配套状态，并执行 check:genome-hub 和 test:genome-hub。PR 保持 OPEN，等待用户验收；CI 链接随 PR 交付。

CI 工作流：[Pull Request Validation](https://github.com/hao1006sy-source/phytomethods/actions/workflows/ci.yml)。最终 PR 和运行结果链接写入交付索引。
