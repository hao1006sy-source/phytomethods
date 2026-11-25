---
title: "De novo chromosome level assembly of a plant genome from long read sequence data"
summary: "使用 HiFi reads 和 Hifiasm 构建 Macadamia jansenii 基因组组装。"
authors: "Sharma P et al."
year: 2022
journal: The Plant Journal
doi: 10.1111/tpj.15583
type: application
method: hifiasm
methodIds: [hifiasm]
domainIds: [genome-assembly]
speciesIds: [macadamia]
updatedAt: 2026-11-25
---
## 研究问题与材料范围
濒危植物 *Macadamia jansenii*（基因组约 800 Mb）缺乏高质量染色体级参考基因组。Sharma 等（2022）评估了仅使用 PacBio HiFi 长读段与 **Hifiasm** 组装器能否在不依赖高密度遗传图谱的情况下实现近染色体级植物基因组组装，并与 Hi-C 伪分子挂载结果进行系统比较。

## 分析流程
1. **不同深度 HiFi 从头组装**：分别测试 10×、18× 独立测序及合并 **28× PacBio HiFi** 数据，在 **24 核、120 GB 内存** 环境下运行 **Hifiasm**（默认参数、内置去重复）构建 primary contig 与 alternate haplotig GFA。
2. **格式转换与 Hi-C 伪分子比较**：将 Hifiasm 输出的 GFA 转换为 FASTA，并与独立构建的 Hi-C 伪分子染色体进行共线性与断点比对。
3. **连续性与完整度评估**：统计 contig N50 与 BUSCO 完整度，定位残余断点（主要位于核糖体基因等高重复区）。

## 软件明细表格
| 软件 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **Hifiasm** | 基于 28× HiFi 数据从头组装 primary/alternate contig | 在 24 核 120 GB 内存下实现 contig N50 达 46.1 Mb、BUSCO 99.6% |
| **Hi-C 挂载与 BUSCO** | 验证 contig 染色体级连续性与基因区完整度 | 14 条染色体中 8 条由单个大 contig 覆盖（6 条具两端端粒重复） |

## 主要科研发现
- 合并 28× HiFi 数据显著优于 10×/18×，最终以 **17 个主要 contig** 覆盖全部 14 条染色体（contig N50 达 **46.1 Mb**，BUSCO **99.6%**）。
- 明确区分了 Hifiasm 原始 contig 与 Hi-C 伪分子的组装边界，指出高重复 rDNA 区域仍是少数残余断点的主因。

## 阅读与数据复现资源
- **原始论文**：[The Plant Journal (2022)](https://doi.org/10.1111/tpj.15583)
- **相关站内资源**：[Hifiasm 方法页](../../methods/hifiasm/)
- **数据复现**：原始 HiFi 测序与组装数据已存放在 NCBI BioProject（`PRJNA694456`）。

