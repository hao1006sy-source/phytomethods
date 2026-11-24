---
title: EDTA
name: EDTA
summary: 整合结构特征识别、嵌套去冗余、宿主基因防误判过滤与 RepeatMasker 全局注释的植物基因组转座子专用分析套件。
dataType: 基因组 FASTA / 可选编码 CDS FASTA、已知 TE 文库、基因注释 BED
principle: 结构特征挖掘、多类群协同识别、CDS 去假阳性过滤与高纯度非冗余库构建
domainIds: [genome-annotation]
topicIds: [m02-topic-02]
principleIds: [annotation]
dataIds: [annotation-input]
paper: edta-paper
repository: https://github.com/oushujun/EDTA
version: v2.0+（随官方仓库持续维护；生产环境以实际安装 release 为准）
updatedAt: 2026-11-25
---

## 简介与背景

转座子（Transposable Elements, TEs）是绝大多数被子植物基因组中最主要的序列构成成分。在玉米、大麦和小麦等大型植物基因组中，重复序列占比往往高达 75%~85% 以上。精准注释转座子不仅对解析植物染色体结构演化、着丝粒功能及全基因组大小变异至关重要，更是后续蛋白编码基因准确预测的前提——如果缺乏准确的转座子软屏蔽（Soft-masking），基因预测算法极易将转座子编码的逆转录酶、转座酶误判为宿主编码基因，或导致外显子边界严重串联畸变。

传统从头预测工具（如 RepeatModeler）基于序列局部重复度进行聚类，在多拷贝保守蛋白编码基因（如核糖体蛋白、抗病 NBS-LRR 基因家族）区域极易产生误屏蔽；而单纯依靠同源比对又无法发现植物谱系特异性的新爆发转座子家族。**EDTA（Extensive de novo TE Annotator）**由 Ou 和 Jiang（2019）开发，专门针对植物高重复基因组设计，通过整合各 TE 类型的特异性结构挖掘工具与严密的宿主基因去假阳性过滤机制，构建高质量、非冗余的参考级 TE 文库并输出全基因组注释。

---

## 核心流程与算法边界

EDTA 将复杂的转座子注释划分为三个核心阶段，其算法架构体现了高度模块化与交叉过滤设计：

```
                ┌──────────────────────────────────────────┐
                │        输入基因组 FASTA (≤13字符Header)   │
                └────────────────────┬─────────────────────┘
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           ▼                         ▼                         ▼
   【LTR 结构挖掘模块】       【TIR 结构挖掘模块】      【Helitron 挖掘模块】
    LTR_FINDER_parallel        TIR-Learner 1.19          HelitronScanner
    LTRharvest (genometools)   (检测 TSD 与 TIR)         (5' TC 与 3' CTRR 环)
    LTR_retriever 过滤整理
           │                         │                         │
           └─────────────────────────┼─────────────────────────┘
                                     ▼
                ┌──────────────────────────────────────────┐
                │          候选库合并与嵌套去嵌合          │
                └────────────────────┬─────────────────────┘
                                     ▼
                ┌──────────────────────────────────────────┐
                │   宿主编码基因过滤 (需提供 CDS FASTA)     │
                │   利用 BLASTn / BLASTx 剔除宿主假阳性    │
                └────────────────────┬─────────────────────┘
                                     ▼
                ┌──────────────────────────────────────────┐
                │        RepeatModeler2 补充残片挖掘       │
                └────────────────────┬─────────────────────┘
                                     ▼
                ┌──────────────────────────────────────────┐
                │   最终非冗余文库 (*.EDTA.TElib.fa)       │
                │   + RepeatMasker 全基因组同源注释        │
                │   (*.EDTA.TEanno.gff3 & *.TEanno.sum)    │
                └──────────────────────────────────────────┘
```

### 1. 结构特征识别模块分工
- **LTR-RT（反转录转座子）模块**：同时调用 LTRharvest 与 LTR_FINDER_parallel 对全基因组进行全敏感度扫描，随后通过 **LTR_retriever** 进行极其严格的结构过滤（检查两端 LTR 序列匹配、规范两端碱基 `5'-TG...CA-3'`、靶位点重复 TSD 及引物结合位点 PBS）。利用 Kimura 2-parameter (K2P) 距离公式测算两端 LTR 差异度并估算插入年代：
  
  $$T = \frac{K}{2\mu}$$
  
  （其中中性突变率 $\mu$ 在双子叶草本中常设为 $1.3 \times 10^{-8}$，禾本科设为 $6.5 \times 10^{-9}$）。
- **TIR（DNA 转座子）模块**：调用 **TIR-Learner**，利用机器学习决策树算法识别靶位点重复（TSD）与末端反向重复（TIR），覆盖 Mutator、hAT、CACTA、Mariner、PIF/Harbinger 等植物经典 DNA 转座子超家族。
- **Helitron（滚环复制转座子）模块**：调用 **HelitronScanner**，基于双层隐马尔可夫模型检测植物特异的 $5'\text{-TC}$ 和 $3'\text{-CTRR}$ 发夹环（Hairpin Loop）终止结构。

### 2. 宿主基因防误判与去嵌套机制
- **嵌套与嵌合清洗**：由于 LTR 往往高频插入在旧的转座子内部，EDTA 按照“结构完整 LTR > 完整 TIR/Helitron > 非完整片段”的优先级逐步切除与拆分嵌合序列；
- **利用 CDS 进行假阳性剔除**：当用户提供近缘物种或本物种的编码序列（`--cds`）时，EDTA 使用 BLASTn 进行严格比对。若某条候选 TE 与已知功能编码基因发生高度一致比对且缺乏典型转座酶保守结构域，将被判定为宿主基因污染并予以剔除，极大避免了过度屏蔽编码外显子。

---

## 输入、命令和输出

### 1. 输入数据规范
- **基因组 FASTA**：染色体或 Scaffold 序列 ID 长度严禁超过 13 个字符，严禁包含空格、分号、冒号等特殊符号（否则下游 Perl/Genometools 脚本会发生坐标错位）；
- **CDS 序列（强烈推荐）**：提供可靠同源物种或实验转录本导出的高质量 CDS 序列，用于保护宿主功能基因。

### 2. 常用执行命令模板

```bash
# 标准单倍体/二倍体全流程转座子从头挖掘与全基因组注释
EDTA.pl \
  --genome assembly.fasta \
  --species others \
  --step all \
  --cds high_confidence_cds.fasta \
  --sensitive 1 \
  --anno 1 \
  --threads 32 \
  --overwrite 0
```

**关键参数深度解析**：
- `--species <Rice|Maize|others>`：针对水稻或玉米有专用预置参数和特化过滤规则；其他绝大多数植物均设置 `--species others`；
- `--step <all|filter|final|anno>`：支持断点续跑。若中断，可根据已完成的子阶段继续执行；
- `--sensitive 1`：调用 RepeatModeler2 进行额外的未分类重复序列从头挖掘，最大化检出全基因组重复序列比例（耗时显著增加，推荐在最终参考级基因组发布时启用）；
- `--anno 1`：在成功构建非冗余 TE 库后，立即调用 RepeatMasker 进行全基因组位点映射，生成最终 GFF3 与统计报表。

### 3. 输出文件体系
- `assembly.fasta.EDTA.TElib.fa`：**最核心产物**，去除了宿主基因假阳性、去冗余后的全基因组非冗余参考级 TE 文库（包含标准化命名，如 `LTR/Gypsy#Unknown`、`DNA/Helitron#Unknown`）；
- `assembly.fasta.EDTA.TEanno.gff3`：全基因组转座子物理坐标注释文件，包含结构完整元件（intact）与片段化残基（fragmented）；
- `assembly.fasta.EDTA.TEanno.sum`：全基因组各类群转座子所占碱基数（bp）及全基因组覆盖百分比的统计概览表；
- `assembly.fasta.mod.MAKER.masked`：用于后续基因预测流程的标准**软屏蔽基因组 FASTA**（转座子区域转为小写字母，非重复序列保持大写）。

---

## 结果解释与植物案例

- **区分 Intact TE 与 Fragmented TE**：完整的 LTR-RT 能够提供最近爆发的活跃演化信息（可用于分析植物谱系特异性爆发历史），而残缺的片段化 TE 构成了基因组扩增的古老基底；
- **组装质量对 TE 注释的影响**：高连续性的长读段 T2T 基因组能够揭示被短读段组装严重截断或塌缩的长距离超长反转录转座子阵列（如玉米和水稻着丝粒周边的 CentO/CentC 阵列）；若组装碎片化严重，EDTA 检出的结构完整元件将大幅减少；
- **水稻基准验证**：在水稻（Nipponbare）参考基准测试中，EDTA 在保持 80% 以上高特异性的同时，显著优于传统单一工具，成功避免了将数百个抗病基因家族误判为转座子的缺陷。

---

## 教程和关联资源

- 官方 GitHub 仓库：[oushujun/EDTA](https://github.com/oushujun/EDTA)
- 方法学奠基论文：[Ou et al., *Genome Biol.*, 2019](https://doi.org/10.1186/s13059-019-1905-y)
- LTR_retriever 核心算法：[Ou & Jiang, *Plant Physiol.*, 2018](https://doi.org/10.1104/pp.17.01310)
- 配套全站教程：[EDTA 转座子分析教程](../../tutorials/edta-tutorial/)
- 关联专题：[转座子从头挖掘与分类](../../topics/genome-annotation/m02-topic-02/)、[基因组注释质量评估](../../topics/genome-annotation/m02-topic-07/)。
