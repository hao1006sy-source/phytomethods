---
title: 使用 EDTA 注释植物基因组重复序列
summary: 基于官方用法准备基因组 FASTA 并生成全基因组转座子与重复序列注释。
method: edta
tested: template
status: published
updatedAt: 2026-11-25
---

## 目的与验证状态

本教程提供在 Linux 环境下利用泛基因组转座子综合注释流水线 EDTA（Extensive *de-novo* TE Annotator）对植物全基因组从头识别、过滤和注释转座子（LTR-RT、TIR、Helitron 等）的标准运行模板与使用指南。

**验证状态声明**：本教程标记为 **`tested: template`（命令已核对 · 真实数据待验证）**。示例命令依据官方文档与发行说明严格核对，本站尚未在本机执行过完整植物全基因组的沉重计算；真实植物基因组转座子注释需根据基因组大小配置足够的计算资源。

---

## 环境与安装步骤

### 1. 软件环境配置
EDTA 整合了数十个专业的转座子结构预测与同源比对工具（如 LTR_retriever、TIR-Learner、HelitronScanner、RepeatModeler 等），依赖关系极为复杂。**强烈建议通过 Conda 或 Docker 镜像安装**：
```bash
# 通过 Conda 安装官方受支持的 EDTA 环境
conda create -n EDTA -c bioconda -c conda-forge edta
conda activate EDTA
EDTA.pl --help
```

### 2. 官方小型测试流程
官方仓库 `test/` 目录提供了小型测试数据集，可用于检查环境依赖是否完整：
```bash
git clone https://github.com/oushujun/EDTA.git
cd EDTA/test
perl ../EDTA.pl --genome genome.fa --step all --threads 4
```

---

## 运行命令与关键参数含义

### 植物生产环境标准调用模板
```bash
EDTA.pl \
  --genome plant_genome.fa \
  --species others \
  --step all \
  --anno 1 \
  --threads 32 \
  --overwrite 0
```

### 关键参数解析
- `--genome plant_genome.fa`：待注释的植物基因组全序列 FASTA 文件；
- `--species others`：物种类型。可选 `Rice`（针对水稻优化）、`Maize`（针对玉米优化）或 `others`（适用于其他被子植物与双子叶植物）；
- `--step all`：执行完整流水线（包括结构特征预测、同源搜索、多工具结果去冗余合并与过滤）；
- `--anno 1`：在构建非冗余 TE 库后，立即调用 RepeatMasker 对全基因组进行同源全掩盖注释；
- `--threads 32`：多线程并行数；
- `--overwrite 0`：遇到中断时支持断点续跑，不覆盖已有中间产物。

---

## 输出文件解释与结构规范

全流程成功结束后，生成以下标准命名的核心输出文件：
1. **`genome.fa.mod.EDTA.TElib.fa`**：
   从头构建的全基因组非冗余、高置信度植物转座子共识库（FASTA 格式）；
2. **`genome.fa.mod.EDTA.TEanno.gff3`**：
   全基因组转座子物理位置注释表（GFF3 格式，记录每个 TE 拷贝的染色体、起始终止、超家族分类与匹配分值）；
3. **`genome.fa.mod.EDTA.TEanno.sum`**：
   转座子统计摘要表，详细汇总各家族（LTR/Gypsy、LTR/Copia、DNA/TIR 等）在基因组中的拷贝数、覆盖总长度与占全基因组的百分比；
4. **`genome.fa.mod.EDTA.raw/`**：
   各独立结构预测工具产生的原始候选特征文件目录。

---

## 常见错误原因与排查指南

1. **报错 `Sequence name too long` 或序列名解析错乱**：
   - *原因*：RepeatMasker 与部分底层组件要求 FASTA 序列 ID 长度不得超过 13 个字符，且不能包含除字母、数字、下划线外的特殊字符；
   - *排查*：在运行 EDTA 前，务必重命名染色体头部（如简化为 `>Chr01`），并保存名称映射表。
2. **报 `BLAST / RepeatMasker segmentation fault` 崩溃**：
   - *原因*：内存耗尽或临时文件系统（`/tmp`）磁盘写满；
   - *排查*：检查临时磁盘剩余空间，确保至少有 50 GB 以上可用空间，并在大内存计算节点上运行。
3. **生成的 TE 库中包含大量编码基因片段**：
   - *原因*：未剔除植物真核生物多基因家族或假基因序列；
   - *排查*：可配置 `--cds <cds.fa>` 参数，让 EDTA 自动剔除与已知植物编码蛋白高度同源的真核功能基因。

---

## 原始文档与文献入口

- **EDTA 方法奠基论文**：[Ou et al. (2019) Genome Biology, DOI: 10.1186/s13059-019-1905-y](https://doi.org/10.1186/s13059-019-1905-y)
- **官方开源代码库**：[oushujun/EDTA (GitHub)](https://github.com/oushujun/EDTA)
- **本站关联文献详情**：[EDTA 奠基论文解读](../../papers/edta-paper/)
