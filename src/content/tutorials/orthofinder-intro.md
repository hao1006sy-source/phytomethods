---
title: 从蛋白序列到同源基因家族入门
summary: 使用 OrthoFinder 官方小型蛋白示例理解同源组和物种树输出。
method: orthofinder
tested: verified
status: published
updatedAt: 2026-11-25
---

## 目的与验证状态

本教程指导如何利用多物种全基因组蛋白质 FASTA 序列，通过 OrthoFinder 进行直系同源组（Orthogroups）划分与物种系统发育树构建。

**真实验证记录**：2026 年 11 月 21 日已在 WSL Ubuntu 环境中基于 OrthoFinder 3.2 官方示例完整运行，真实运行日志、输入文件哈希与输出结果保存在仓库 `examples/orthofinder/verified-20261121/`。该示例数据包含 4 种支原体蛋白质数据，用于软件功能与流程验证；植物基因组研究需按实际注释版本与代表性转录本筛选规则执行。

---

## 环境与数据来源

### 1. 软件环境配置
实际运行环境基于 Python 3.12.16 与 OrthoFinder 3.2。推荐通过 Conda 或 micromamba 构建隔离环境：
```bash
micromamba create -n orthofinder-demo -c conda-forge -c bioconda \
  python=3.12 orthofinder=3.2
micromamba activate orthofinder-demo
orthofinder --version
```
*注：本次测试中 Python ETE4 模块依赖提示缺少 `brotli`，经 `python -m pip install brotli==1.2.1` 补充安装后运行成功。*

### 2. 输入数据说明
测试数据来自官方发布的示例压缩包：
- **数据来源**：[OrthoFinder v3.2 Release 附件 ExampleData.tar.gz](https://github.com/OrthoFinder/OrthoFinder/releases/download/v3.2/ExampleData.tar.gz)；
- **压缩包校验**：SHA-256 为 `60024e9590ebdf48e89e6a7b564c803f93affa76238bd32dc7f16ebad5c7245f`；
- **文件构成**：解压后根目录包含 4 个物种蛋白质 FASTA 文件（`.faa`），分别为 *M. agalactiae*、*M. bovis*、*M. genitalium* 与 *M. pneumoniae*，共收录 2,733 条氨基酸序列（各输入文件的 SHA-256 见 `examples/orthofinder/verified-20261121/input-sha256.txt`）。

---

## 运行命令与关键参数含义

```bash
# 解压测试数据到独立工作目录
tar -xzf ExampleData.tar.gz

# 运行 OrthoFinder
orthofinder -f ExampleData -t 2 -a 2
```

### 关键参数解析
- `-f ExampleData`：指定存放各物种蛋白质 FASTA 文件的输入文件夹路径。每个 `.fa`/`.faa` 文件对应一个独立物种；
- `-t 2`：序列全对全搜索（默认调用 DIAMOND）的并行线程数；
- `-a 2`：后续同源图构建、MCL 聚类与基因树推断的分析线程数；
- `-S diamond`：序列比对引擎（默认 DIAMOND，植物大蛋白集推荐保持默认以兼顾速度与灵敏度）。

---

## 输出文件解释与结构规范

运行完成后，结果归档在 `ExampleData/OrthoFinder/Results_<日期>/` 目录下：
1. **`Orthogroups/Orthogroups.tsv`**：
   核心同源组列表。首列为 Orthogroup ID（如 `OG0000000`），后续各列对应不同物种，单元格内为归入该组的基因 ID（逗号分隔）；
2. **`Species_Tree/SpeciesTree_rooted.txt`**：
   利用所有基因树通过 STAG 算法推断并经 STRIDE 自动定根的物种树（Newick 文本格式）；
3. **`Comparative_Genomics_Statistics/Statistics_Overall.tsv`**：
   全基因组比较统计指标，记录基因总数、分配到同源组的基因数与比例、单拷贝同源组数量等；
4. **`Resolved_Gene_Trees/`**：
   包含每个同源组在调和基因复制与丢失事件后的有根基因树文件（`.txt`）。

---

## 真实结果解读（基于本地实测数据）

根据 `examples/orthofinder/verified-20261121/Statistics_Overall.tsv` 实际记录：
- **物种数**：4 个；
- **输入基因总数**：2,733 条；
- **识别出的 Orthogroup 总数**：599 个；
- **落入 Orthogroup 的基因数**：2,425 条（占总基因数的 88.7%）；
- **单拷贝 Orthogroup 数**：250 个（所有 4 个物种中均严格只出现 1 次的直系同源基因簇）。

*科学结论推断*：Orthogroup 代表源自物种共同祖先中单一祖先基因的基因集合，内部可能包含物种形成后基因复制衍生的旁系同源（Paralogs）。单拷贝同源组是后续多物种级联建树与超矩阵系统发育分析的核心素材。

---

## 常见错误原因与排查指南

1. **ETE 导入失败或报缺少动态库**：
   - *原因*：环境缺少底层编解码库；
   - *排查*：检查 Python 环境依赖，确认 `brotli` 及相关 GUI/图形库已正确安装。
2. **基因 ID 重复或包含特殊符号**：
   - *原因*：输入 FASTA 序列标题包含空格、制表符或物种内非唯一标识符；
   - *排查*：输入前清理 FASTA 头部，确保 `>ID` 简洁且物种内全局唯一。
3. **植物未筛选代表性转录本（关键避坑）**：
   - *原因*：直接输入全量转录组翻译蛋白，导致同一基因的多个剪接异构体（如 `.1`, `.2`）全部入库；
   - *排查*：OrthoFinder 会将同基因异构体误判为近期基因重复。在正式植物分析前，必须使用工具（如 AGAT、GFFread 或自定义脚本）提取每基因最长编码蛋白质。

---

## 原始文档与文献入口

- **方法学奠基论文**：[Emms & Kelly (2019) Genome Biology, DOI: 10.1186/s13059-019-1832-y](https://doi.org/10.1186/s13059-019-1832-y)
- **最新算法改进**：[Emms & Kelly (2026) Nature Methods, DOI: 10.1038/s41592-026-03126-6](https://doi.org/10.1038/s41592-026-03126-6)
- **官方开源代码库**：[OrthoFinder GitHub Repository](https://github.com/OrthoFinder/OrthoFinder)
- **本站关联文献详情**：[OrthoFinder 奠基论文解读](../../papers/orthofinder-paper/)
