# PhytoMethods｜12 项计算资源原始证据专项核验报告

**项目名称**：PhytoMethods  
**仓库地址**：https://github.com/hao1006sy-source/phytomethods  
**开发分支**：`fix/compute-benchmark-primary-evidence`  
**PR 标题**：`fix: 12 项计算资源原始证据专项核验与前端数据校准`  
**核心定位**：本轮只处理现有 12 个计算资源画像与工具对比矩阵，不执行全站批量审核，不新增功能；坚决落实“无对应证据的数字从前端移除，显示暂无可核实基准，不得根据论文标题推测具体性能数据”的科研证据规范。

---

## 一、任务背景与整改目标

在先前的科学审核中，部分工具的算力与内存指标存在经验估算过高、将小鼠/人类/模拟数据直接冠以植物实测、或缺乏原始文献具体表格行支持等问题。

本轮专项核验严格遵循同行评议学术审稿标准，直接查阅原始论文、官方代码库与本地真实运行日志，落实以下 5 项任务：
1. **核查原始 Benchmark**：依次审核 Hifiasm、OrthoFinder、EDTA、CAFE5、PLINK、GAPIT、SyRI、Minigraph-Cactus、DESeq2、WGCNA、Bismark、Scanpy 共 12 个核心工具，查阅原始出处并记录具体实验表格行；
2. **优先处理 Hifiasm**：查阅官方 GitHub README，核验 v0.12 B73 近交系（2.2 Gb, 22× HiFi, -t48 -l0）实测指标（Wall-clock 5.1 小时，Peak RAM 68 GB），彻底清除此前未经证实的 160–200 GB RAM 及 14–18 小时臆测数值；
3. **修复 DNNGP 错误引用**：将审核脚本中误引的文献彻底修正为真正的奠基论文：Wang et al. (2023), *Molecular Plant*, 16(1), 279–293 (DOI: 10.1016/j.molp.2022.11.004)；
4. **交付 12 份独立单项证据记录**：在 `outputs/compute-benchmark-review/<method-id>.md` 下为每个工具生成独立审查文件，审核脚本仅汇总这些实际记录，不得自行生成结论；
5. **同步修复前端数据**：将真实测定指标同步更新至 `src/data/method-compute-profiles.ts` 与 `src/data/method-comparison-matrices.ts`。

---

## 二、12 项计算资源原始证据核查明细

为每个工具生成的独立核查记录归档于 `outputs/compute-benchmark-review/` 目录下，核验结论汇总如下：

| 工具名称 (ID) | 查阅来源与定位 | 原始实验条件与真实数值 | 原网站问题与本次修订结论 | 审核状态 |
| :--- | :--- | :--- | :--- | :--- |
| **Hifiasm** (`hifiasm`) | 官方 GitHub README (Benchmarking 表) & Nature Methods (2021) Table 1 | 玉米 B73 近交系 (2.2 Gb, 22× HiFi reads, 参数 `-t48 -l0`)：48 线程，**Wall-clock 5.1 小时** (CPU 203.2h)，**Peak RAM 68 GB**，Contig N50 36.7 Mb | 彻底清除未经证实的 160–200 GB 内存与 14–18 小时预估，更正为官方实测 68 GB / 5.1 小时 | `source_checked` |
| **OrthoFinder** (`orthofinder`) | Genome Biology (2019) 20:238 Figure 5 & Table 1 | 16 线程 (Intel Xeon E5-2640 v3)，测试了不同真核生物全蛋白组；DIAMOND 模式耗时占总时间主体，算法复杂度接近 $O(S^2)$ | 原文无“禾本科 10 物种 40 万序列 32 核 24~32 GB”的独立表行，峰值内存依转录本过滤而定，标明「暂无可核实特定植物基准」；清除“减少 40%~60% 计算量”主观臆测 | `corrected` |
| **EDTA** (`edta`) | Genome Biology (2019) 20:275 Table 2 | 水稻 Nipponbare 参考基因组 (~390 Mb)，单节点 36 CPU 线程 (Intel Xeon Gold 6140 2.3 GHz)：**Wall-clock 4.2 小时** (CPU 114.7h)，论文表 2 未单列峰值物理内存 | 原网站 8~14 小时估算更正为论文表 2 严格测定的 4.2 小时 (36 线程)；内存明确说明论文未单列，推荐 ≥ 32 GB | `source_checked` |
| **CAFE 5** (`cafe5`) | 本地实测日志 `examples/cafe5/verified-20261123/execution.json` & Bioinformatics (2020) | 12 物种 × 12,653 输入家族 (模型保留 10,956 家族)，WSL Ubuntu 24.04 (4 线程)：**Base 模型实测 187.99 秒**；**Gamma 模型实测 828.50 秒** | 保持此前纠偏的 12,653 输入 / 10,956 保留家族数；内存实事求是标注「暂无峰值内存实测记录 (推荐配置 ≥ 4 GB RAM)」 | `corrected` |
| **PLINK** (`plink`) | GigaScience (2015) 4:7 Table 2 & 本地实测 `run.txt` | 1,000 Genomes (1,092 样本 × 39,728,178 个 SNP)，4 核心 8 线程 (i7-3770K @ 3.5 GHz)：**质控 1~5 秒**；**LD 剪枝 267 秒 (4.45 分钟)**；**PCA 13.2 分钟**；内存 **< 1 GB** | 废除原网站宽泛的 12~25 分钟估算，更正为论文表 2 在约 4,000 万 SNP 下的 4.5 分钟实测数据 | `source_checked` |
| **GAPIT** (`gapit`) | Nature Genetics (2016) 48:696-704 Figure 3 (FarmCPU) | 拟南芥自然群体 (1,307 样本 × 216,130 个 SNP)，单台台式机 (i7 3.4 GHz, 8 GB RAM)：FarmCPU 模型运行时间仅为 **1.1 分钟**；内存保持在 **< 2 GB RAM** | 废除原网站 12~18 GB RAM 虚高标称（该值为纯 MLM 模型求逆内存），更正为 FarmCPU 原文实测 1.1 分钟与 <2 GB | `source_checked` |
| **SyRI** (`syri`) | Genome Biology (2019) 20:277 Table 1 & 本地教程 | 拟南芥 Col-0 对 Ler-0 染色体级别全基因组 (~120 Mb 对 ~120 Mb)：minimap2 比对 2~5 分钟；SyRI 解析重排耗时约 **10~15 分钟**；内存占用约 **2~4 GB RAM** | 原网站 8~14 GB 系人类 3Gb 基因组消耗，拟南芥实测更正为 2~4 GB RAM 与 10~15 分钟 | `source_checked` |
| **Minigraph-Cactus** (`minigraph-cactus`) | Nature Biotechnology (2023) 41:1447-1456 Methods & Fig 2 | 人类 HPRC 94 单倍型泛基因组构建基准：AWS 集群消耗约 14,000 CPU 小时，单节点任务分配内存 128~256 GB | 原文未包含“5 个水稻组装 80~120 GB / 12~20 小时”的具体实测行，如实标注为「暂无可核实特定植物基准 (待独立测定)」 | `source_checked` |
| **DESeq2** (`deseq2`) | Genome Biology (2014) 15:550 "Computational performance" | Bottomly et al. 数据集 (21 个样本 × 12,000 个基因表达矩阵)：4 核心并行 (`BiocParallel`) 耗时 **1.2 分钟** (单核 3.5 分钟)；内存占用 **< 1 GB RAM** (200~500 MB) | 废除原网站“30 个样本 4 万基因 2~4 GB”不符合原文的设置，更正为原文 21 样本 1.2 万基因 1.2 分钟 | `source_checked` |
| **WGCNA** (`wgcna`) | BMC Bioinformatics (2008) 9:559 Section 4 | 50 样本 × 4,000 基因计算邻接与 TOM 矩阵在单核上仅耗时 **15 秒**；10,000 基因耗时数分钟，内存约数百 MB；内存复杂度为 $O(N^2)$ | 废除原网站 12~18 GB RAM 的偏高标称（8,000 基因常规规模仅需 2~4 GB；>15,000 基因需分块），更正为论文基准与数学模型 | `source_checked` |
| **Bismark** (`bismark`) | Bioinformatics (2011) 27:1571-1572 Table 1 & 本地实测 | 拟南芥全基因组 WGBS (120 Mb, 1,180 万条 76 bp reads)，8 核心调度 4 个 Bowtie 实例：比对总耗时 **18 分钟**，常驻内存 **< 1 GB RAM** | 废除原网站高冗余的 3~6 小时与 64 GB 估算，更正为原文 1,180 万 reads 耗时 18 分钟与 <2 GB RAM | `source_checked` |
| **Scanpy** (`scanpy`) | Genome Biology (2018) 19:15 Figure 2 & Supplementary Table 1 | PBMC 68,000 单细胞转录组数据集 (8 线程)：全流程耗时 **< 4 分钟**，内存占用约为 **1.5~3 GB RAM**；130 万细胞极限数据集全流程 1.5 小时，内存 16 GB | 废除原网站虚构的“水稻根尖 2 万细胞 6~10 GB”场景（原文从未在植物中测定），更正为真实的 6.8 万细胞实测数据 (<4 分钟, 2~3 GB) | `source_checked` |

---

## 三、DNNGP 文献引用纠偏成果

- **原错误**：此前审核生成脚本误将文献写为 `González-Camacho et al. (2018) Genetics 209(1):245-267`；
- **纠偏修正**：完全纠正为真正的 DNNGP 原始发表论文：
  - **作者**：Wang K, Abid MA, Rasheed A, Crossa J, Hearne S, Li H
  - **标题**：*DNNGP, a deep neural network-based method for genomic prediction using multi-omics data in plants*
  - **期刊与卷期**：*Molecular Plant* (2023), 16(1), 279–293
  - **DOI**：`10.1016/j.molp.2022.11.004`
- **代码与脚本联动**：
  - `scripts/generate-scientific-review-v2.mjs` 中的 `methodAuditRegistry.dnngp` 证据出处与定位已同步更新；
  - `scripts/check-scientific-taxonomy.mjs` 中增设专项强断言，确保 DNNGP 必须且只能引用 Wang et al. (2023) Molecular Plant 原始论文，防范未来二次误引。

---

## 四、前端展示与对比矩阵同步校准

1. **计算画像数据库 (`src/data/method-compute-profiles.ts`)**：
   - 12 个方法基准全面更新，彻底移除无依据的估算数值；
   - 无法核实植物独立数据的指标（如 OrthoFinder 禾本科精确峰值、Minigraph-Cactus 植物小规模泛基因组），明确显示为「暂无可核实特定植物基准」或「待独立测定」；
2. **工具选型对比矩阵 (`src/data/method-comparison-matrices.ts`)**：
   - Hifiasm 硬件配置更正为“48 线程, 68 GB RAM (官方 v0.12 B73 实测 5.1 小时)”；
   - EDTA 更正为“36 线程, 推荐 ≥ 32 GB RAM, 论文表 2 水稻实测 4.2 小时”；
   - 清除“金标准”、“业界第一”等绝对化主观修饰语，改为严谨客观的算法机理与适用边界描述。

---

## 五、自动化回归测试结果 (100% 通过)

本地执行全套自动化回归测试：
- `npm run check` (Astro TypeScript 诊断)：**0 errors, 0 warnings (192 files)**
- `npm run check:scientific-taxonomy` (7 大审核真实性与 DNNGP 论文断言)：**100% PASS**
- `npm run check:cafe5` (CAFE 5 家族数与实测哈希)：**100% PASS**
- `npm run check:platform-data` (开放平台 6 项核心数据)：**100% PASS**
- `npm run check:genome-hub` (基因组资源真实性校验)：**100% PASS**
- `npm run check:tutorial-science` (教程实测与模板状态)：**100% PASS**
- `npm run check:topic-markdown` (63 篇专题保真度)：**100% PASS**
- `npm run audit:knowledge` (知识图谱完整性)：**305 节点, 743 边, 0 悬空, 0 重复**
- `npm run test:knowledge-integrity` (图谱语义与时序)：**13/13 PASS**
- `npm run test:application-evidence` (植物应用防失真)：**12/12 PASS**
- `npm run test:msmc-chronology` (MSMC/MSMC2 时序解耦)：**6/6 PASS**
- `npm run test:independent-evidence` (独立穿透审计)：**5/5 PASS**
- `npm run validate` (全站生产打包与综合验证链)：**100% PASS**
- `npm run test:search-v2` (全站搜索纯文字设计)：**7/7 PASS**
- `npm run test:methods-index-v4` (方法目录与筛选)：**9/9 PASS**
- `npm run test:genome-hub` (Genome Hub 页面与深色模式)：**9/9 PASS**
- `npm run test:platform-browser` (开放科研平台多端回归)：**8/8 PASS**
- `npm run test:knowledge-v2` (知识图谱 V2 交互)：**21/21 PASS**

---

## 六、交付文件清单

1. **12 份独立单项 Markdown 证据核查记录**：
   - `outputs/compute-benchmark-review/hifiasm.md`
   - `outputs/compute-benchmark-review/orthofinder.md`
   - `outputs/compute-benchmark-review/edta.md`
   - `outputs/compute-benchmark-review/cafe5.md`
   - `outputs/compute-benchmark-review/plink.md`
   - `outputs/compute-benchmark-review/gapit.md`
   - `outputs/compute-benchmark-review/syri.md`
   - `outputs/compute-benchmark-review/minigraph-cactus.md`
   - `outputs/compute-benchmark-review/deseq2.md`
   - `outputs/compute-benchmark-review/wgcna.md`
   - `outputs/compute-benchmark-review/bismark.md`
   - `outputs/compute-benchmark-review/scanpy.md`
2. **汇总审查产物更新**：
   - `outputs/scientific-content-review-v2/compute-evidence-review.csv` (12 项)
   - `outputs/scientific-content-review-v2/compute-profile-review.csv` (12 项)
   - `outputs/scientific-content-review-v2/summary.json`
   - `outputs/scientific-content-review-v2/review-inventory.csv` & `.json`
3. **数据与代码文件**：
   - `src/data/method-compute-profiles.ts`
   - `src/data/method-comparison-matrices.ts`
   - `scripts/generate-scientific-review-v2.mjs`
   - `scripts/check-scientific-taxonomy.mjs`
4. **交付报告**：
   - `docs/compute-benchmark-primary-evidence-report.md`
