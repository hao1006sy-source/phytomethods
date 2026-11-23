# 分析教程科研准确性与可复现性审计 V3.1

审计日期：2026-11-23。基线：origin/main 9a66d01。本轮保持 V3.1 视觉与知识图谱数据。

## 审核统计

审核 10 篇教程、53 条逻辑命令起始行（代码块内续行合并，排除注释与纯文本哈希）；正文全部阅读，代码与历史产物逐项核对。发现并修复 4 类问题：验证标签依赖正文关键词、9 篇通用资源栏依赖章节摘录、CAFE5 缺少物种树时间尺度约束、WGCNA 新 R 进程的库路径说明不清。参数拼写或值错误：0 项；参数修复：0 项。10 篇原先缺少统一结构化验证记录，现已补齐。7 篇历史运行证据目录均存在且包含非空产物；缺失历史证据目录数为 0。

本轮实际重新执行 4 套完整小型流程：GWAS、Scanpy、PLINK、WGCNA，均退出 0。GWAS、Scanpy、WGCNA 共 10 张数据表与历史产物逐字节一致。另执行 GWAS、PLINK、Bismark 独立结果核对，各退出 0。OrthoFinder、SyRI、Bismark 本轮核对历史证据与官方文档，没有重新运行完整工具链。

## 逐篇审核

| 教程 | 原始 / 当前状态 | 版本与环境 | 核实范围 / 输入 | 命令与结果 | 本轮未验证范围 |
| --- | --- | --- | --- | --- | --- |
| hifiasm-intro | template / template | Hifiasm HiFi-only；实际构建版本须记录；Linux；C++、Make、zlib | 命令模板已核对 · 真实数据待验证；PacBio HiFi FASTA/FASTQ；官方 chr11-2M 安装示例 | 官方用法核对；完整流程未运行 | 真实植物独立样本上的完整科研结论；参数敏感性与实验验证；本模板全部运行步骤尚待执行 |
| orthofinder-intro | verified / verified | OrthoFinder 3.2；Python 3.12.16；WSL Ubuntu；micromamba；brotli 1.2.1 | 官方非植物小型示例已验证；官方 v3.2 ExampleData：4 个支原体蛋白 FASTA | 历史日志及产物核对；本轮未重跑工具 | 真实植物独立样本上的完整科研结论；参数敏感性与实验验证 |
| syri-intro | verified / verified | SyRI 1.8.2；MUMmer 3.23 / NUCmer 3.1；WSL Ubuntu；Python 3.11.18 | 官方拟南芥染色体示例已验证；官方固定提交 acf72cc：TAIR10 与 Ler 第 4 染色体 | 历史日志及产物核对；本轮未重跑工具 | 真实植物独立样本上的完整科研结论；参数敏感性与实验验证 |
| bismark-synthetic | verified / verified | Bismark Rust suite 3.3.0；Bowtie2 2.5.5；WSL Ubuntu；单端正链模拟数据 | 模拟数据流程已验证并对照真值；1000 bp 虚构参考；90 条 100 bp reads；已知胞嘧啶真值 | 历史日志及产物核对；本轮未重跑工具 | 真实植物独立样本上的完整科研结论；参数敏感性与实验验证 |
| plink-synthetic | verified / verified | PLINK 1.9.1（11 Nov 2026）；Windows；官方 PLINK 二进制；Python 绘图 | 模拟数据转换、统计与 PCA 已验证；8 个虚构二倍体样本、6 个 SNP 的模拟 VCF | 本轮重跑成功；输出见 final/ | 真实植物独立样本上的完整科研结论；参数敏感性与实验验证 |
| gwas-synthetic | verified / verified | Python 3.13.9；SciPy 1.18.1；NumPy 2.5.2；Windows；matplotlib 3.11.1 | 模拟单标记 OLS 已验证并独立复算；固定种子 20261121；80 样本 × 60 标记的模拟剂量与连续表型 | 本轮重跑成功；输出见 final/ | 真实植物独立样本上的完整科研结论；参数敏感性与实验验证 |
| scanpy-synthetic | verified / verified | Scanpy 1.13.0；Python 3.13.9；Windows；igraph、leidenalg；版本见 run.json | 模拟数据 QC、聚类与 UMAP 已验证；61 个观测 × 20 基因的模拟 Poisson 计数 | 本轮重跑成功；输出见 final/ | 真实植物独立样本上的完整科研结论；参数敏感性与实验验证 |
| wgcna-synthetic | verified / verified | WGCNA 1.74；R 4.5.1；Windows；独立 R 库；单线程 | 模拟有符号共表达网络已验证；36 样本 × 60 基因的模拟连续表达；预设潜在信号 | 本轮重跑成功；输出见 final/ | 真实植物独立样本上的完整科研结论；参数敏感性与实验验证 |
| edta-tutorial | template / template | EDTA 2 系列用法；实际版本与依赖须记录；Linux；按官方依赖清单建立环境 | 命令模板已核对 · 真实数据待验证；基因组 FASTA；可用官方 test/ 安装示例 | 官方用法核对；完整流程未运行 | 真实植物独立样本上的完整科研结论；参数敏感性与实验验证；本模板全部运行步骤尚待执行 |
| cafe5-intro | template / template | CAFE5 1.1 命令格式；实际构建须记录；Linux / 兼容编译环境；安装后 cafe5 -h | 命令模板已核对 · 真实数据待验证；非负整数家族计数表；名称匹配且分支长度有时间尺度的 Newick 物种树 | 官方用法核对；完整流程未运行 | 真实植物独立样本上的完整科研结论；参数敏感性与实验验证；本模板全部运行步骤尚待执行 |

## 关键科学判断

GWAS 使用单标记 OLS 及双侧斜率检验，未声称运行混合模型或群体结构校正。WGCNA 模块和相关热图均为预设模拟表达结果，相关关系不提供调控方向。Scanpy 的模拟聚类未当作细胞类型。OrthoFinder 结果区分 orthogroup 与一对一直系同源，官方数据为支原体。SyRI 结果是指定比对与输入下的候选事件，历史运行使用拟南芥第 4 染色体。Bismark 命令针对 Rust suite 3.3.0，明确区别经典 Perl 参数；独立检查核对覆盖胞嘧啶真值。Hifiasm 小型官方测试未冒充植物基因组复现。EDTA 与 CAFE5 仍为运行模板。

## 修改与证据

验证记录集中在 `src/components/tutorial-v3/tutorial-verification.json`，其 evidencePaths 指向原有日志、版本与产物；documentedCommands 仅表示教程代码清单，安装命令不据此声明已执行。通用组件只读取显式字段，不再根据“模拟/虚构”推断标签，也不再把背景段落映射为输入输出。Hifiasm 专属资源卡使用同一版本记录。

CAFE5 新增有根、时间尺度一致的树要求及退出和收敛检查。WGCNA 补充 `.libPaths()` 仅作用于当前进程，新 Rscript 需在启动前设置 `R_LIBS_USER`。科学正文、代码、DOI 与参考链接保留。

## 官方核查来源

- hifiasm-intro：https://github.com/chhylp123/hifiasm
- orthofinder-intro：https://github.com/OrthoFinder/OrthoFinder
- syri-intro：https://schneebergerlab.github.io/syri/example.html
- bismark-synthetic：https://github.com/FelixKrueger/Bismark
- plink-synthetic：https://www.cog-genomics.org/plink/1.9/
- gwas-synthetic：https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.linregress.html
- scanpy-synthetic：https://scanpy.readthedocs.io/en/stable/api/generated/scanpy.tl.leiden.html
- wgcna-synthetic：https://cran.r-project.org/package=WGCNA
- edta-tutorial：https://github.com/oushujun/EDTA
- cafe5-intro：https://github.com/hahnlab/CAFE5

上述来源在本轮通过官方文档页面核查；例如 CAFE5 的 -p/-k/-c、EDTA 的 --species/--anno、Scanpy 1.13 的 out 参数、WGCNA 1.74 版本均与教程一致。

## 实际执行与复现

正式执行结果在 `outputs/tutorial-science-v3.1/final/execution-results.json`，包含命令、退出码、环境、数据比较。每套流程对应的 run.json 或 run.txt 包含软件版本，输入和输出保存在各自目录。复现脚本 `scripts/run-tutorial-reproducibility.py` 接受 --output、--scanpy-python、--rscript、--plink，R 库由调用者通过 R_LIBS_USER 指定；输出目录必须新建。

初次沙箱运行 PLINK 产生 Windows DLL 加载错误；正常本机进程重跑成功。主项目 npm ci 遇到现有进程占用原生依赖，隔离副本 npm ci 成功（413 包、0 漏洞）。WGCNA 输出包含 locale 与部分依赖构建于较新 R 4.5.x 的警告，程序退出 0，数据表一致。

## 工程和浏览器验证

- 隔离副本 npm ci、check、build、validate、coverage、test:knowledge-integrity、check:tutorial-science 全部通过；日志随 outputs 提交。
- Edge 原有回归：10 篇 × 7 尺寸，19 个代码块复制、77 次目录跳转、71 个站内链接，0 页面异常。
- 资源布局回归：10 篇 × 8 尺寸，80 组实际 DOM 边界检查通过；缩放等效 CSS 视口 4 组通过。
- 科学字段映射：10 篇 × 4 尺寸（1600、1280、1024、390），40 组版本/输入/输出/验证范围断言通过。
- 验证状态保持 7 verified / 3 template。

## 待完成的真实数据验证

Hifiasm、EDTA、CAFE5 保持 template。Hifiasm 和 EDTA 模板的实际构建版本尚未锁定，运行前需记录提交与完整依赖；CAFE5 仍需完成官方示例端到端运行。所有模拟数据教程仍需真实植物样本、实验设计、质量控制、参数敏感性及独立生物学证据。OrthoFinder 官方非植物示例结果不直接迁移到植物；SyRI 单染色体示例不证明全部组装、物种与结构差异均可靠。

本轮 CI 结果请查看 PR 对应的 Pull Request Validation。
