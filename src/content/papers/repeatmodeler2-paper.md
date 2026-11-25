---
title: "RepeatModeler2 for automated genomic discovery of transposable element families"
summary: "提出全自动真核生物转座子家族从头发现系统 RepeatModeler2，集成 RECON、RepeatScout 及创新的全长长末端重复结构探测器 LTR_Harvest 与 LTR_retriever，并在全自动架构下解决长 LTR-RT 元件末端截断与嵌合分类难题，产出高保真非冗余真核重复序列共有文库。"
authors: "Flynn JM, Hubley R, Goubert C, Rosen J, Clark AG, Feschotte C, Smit AFA"
year: 2020
journal: Proceedings of the National Academy of Sciences
doi: 10.1073/pnas.1921046117
type: method
methodIds: []
domainIds: [genome-annotation]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

## 研究背景与算法贡献

在真核生物从头测序项目中，构建一套高准确度、结构完整的物种特异性**转座元件（TE）一致性共有文库（Consensus Library）**是全基因组重复序列屏蔽与后续基因注释的前提。第一代 RepeatModeler 广泛依赖基于局部自比对序列聚类的算法（如 RECON 和 RepeatScout）。然而，当应用于转座子占比极高且以长反转录转座子为主导的动植物基因组时，存在以下结构性缺陷：
- **无法组装全长 LTR 反转录转座子（LTR-RTs）**：由于植物中 LTR-RTs 长度通常达 5~15 kb，且内部包含复杂的非自主演化缺失与嵌套插入，传统的 k-mer 或局部比对聚类算法通常在内部蛋白编码区（gag/pol）发生多家族混淆塌缩，而将两端的长末端重复（LTR）切碎为孤立的小片段，导致输出文库中充斥着截断型伪家族；
- **缺乏结构化特征约束**：纯序列相似性聚类无法验证转座元件特有的标志性结构（如目标位点重复 TSD、末端倒位重复 TIR 或两端保守的 `TG...CA` 边界基序）；
- **大量产生“无法分类”（Unclassified / Unknown）元件**：由于文库序列截断不全，难以与 Dfam / Repbase 数据库中的保守蛋白质结构域比对，导致大量真实转座子被归类为未知垃圾序列。

由康奈尔大学 Cédric Feschotte 与系统生物学研究所（ISB）Arian Smit 等人联合开发的 **RepeatModeler2**，实现了全基因组从头转座子挖掘技术的重大飞跃：
1. **深度集成高精度 LTR 结构流水线（LTR Structural Pipeline）**：在传统的 RECON / RepeatScout 聚类之前，引入 LTR_Harvest 与 LTR_retriever 作为前置专门模块，直接捕获全长、结构完整的 LTR-RT 家族；
2. **多重对齐与一致性共有序列精细修正**：对从基因组各处提取的同源拷贝进行多序列比对（MSA），自动识别缺失与突变，重构祖先未突变的原始转座子全长序列；
3. **基于深度特征学习的转座子超级分类器**：结合 RepeatClassifier，不仅能自动区分 Class I（反转录转座子）与 Class II（DNA 转座子），更能细化至 Copia、Gypsy、LINE、SINE、hAT、CACTA 及 Helitron 等具体演化超家族。

---

## 核心数学模型与数据结构

RepeatModeler2 采用分层递进式的结构化识别与多序列聚类架构：

```
                    待测动植物全基因组 FASTA
                               │
                               ▼
           [第一阶段: LTR 结构化前置探测 (可选 -LTRStruct)]
• 运行 LTR_Harvest 扫描潜在对称 LTR 结构对
• 运行 LTR_retriever 执行边界基序、TSD 及物理演化距离验证
• 提取高保真全长 LTR-RT 候选家族，并在基因组中软屏蔽
                               │
                               ▼
           [第二阶段: 全基因组无偏从头聚类 (De Novo Clustering)]
• RepeatScout: 基于频繁 k-mer 种子向两侧贪心延伸发现高拷贝家族
• RECON: 基于全对全 BLAST 比对与有向连通图聚类低拷贝家族
                               │
                               ▼
           [第三阶段: 拷贝提取与祖先一致性共有序列重构]
• 从全基因组抽取每个候选家族的 top N 独立物理拷贝 (5~20 份)
• 运行 MUSCLE / MAFFT 构建多序列比对 (MSA)
• 多数表决与轮廓概率矩阵消除随机中性突变，生成 Consensus
                               │
                               ▼
           [第四阶段: 自动分类与蛋白质结构域扫描 (RepeatClassifier)]
• 检索 Dfam / Repbase 数据库
• 扫描由 HMMER 驱动的逆转录酶 (RT)、整合酶 (INT) 与转座酶特征
                               │
                               ▼
               输出高保真物种特异性 TE 共有序列文库 (FASTA)
```

1. **多序列共有序列重构概率模型**：
   对于某个含有 $M$ 个独立基因组拷贝的转座子家族，设在多重对齐矩阵的第 $j$ 列中，各碱基观测频数分别为 $C(A), C(C), C(G), C(T)$。若最高频碱基占比超过阈值：
   $$\frac{\max_{\alpha} C(\alpha)}{M} \ge \tau \quad (\tau \approx 0.6 \sim 0.7)$$
   则确定该位点为祖先特征；对于不确定位点，采用 IUPAC 简并碱基代码（如 R, Y, S, W）标记，从而最大程度兼顾该家族不同演化亚群的兼容性；
2. **两级过滤消除宿主非转座子重复**：
   算法通过将生成的初步共有文库反向比对至基因组，计算其拷贝数 $K$ 与物理覆盖总长 $L$。若某个候选“家族”在全基因组中仅有 1~2 个孤立拷贝，或其序列本质为高度串联的着丝粒卫星 DNA（Tandem Repeats，通过 Tandem Repeats Finder 识别），系统自动执行硬剪枝剥离；
3. **RepeatClassifier 贝叶斯证据链分类**：
   分类器结合了核苷酸相似度得分 $S_{\text{dna}}$ 与蛋白质结构域匹配分值 $S_{\text{prot}}$。当且仅当检出特征反转录酶且内部不含非同源内含子时，赋予标准 `LTR/Copia` 或 `LTR/Gypsy` 国际 Wicker 标签。

---

## 算法复杂度与计算性能

| 维度 | 指标与性能数据 | 算法设计与工程机制 |
| :--- | :--- | :--- |
| **计算耗时** | 典型 1 Gb 基因组约 8~20 小时（32 线程） | LTRStruct 模块显著加速了复杂 LTR 的发现效率 |
| **全长 LTR 恢复率** | 相比 RepeatModeler1 提升 **2~3 倍以上** | 彻底解决了全长 LTR-RT 两端断裂截断的历史缺陷 |
| **内存峰值占用** | 典型真核基因组约 16~32 GB RAM | 采样与分块比对机制，内存需求可控 |
| **分类准确率** | 未分类（Unknown）家族比例减少 50% 以上 | 深度结合 Dfam HMM 库与蛋白质结构域双重扫描 |

---

## 植物基因组学应用场景与科研价值

1. **复杂农作物 RepeatMasker 官方输入文库标准**：
   在国际水稻、玉米、小麦及大豆基因组测序项目中，RepeatModeler2（开启 `-LTRStruct` 模式）是生成高质量 RepeatMasker 输入文库的国际通用事实标准；
2. **比较基因组学与转座子演化多样性图谱**：
   通过比较近缘物种之间经 RepeatModeler2 构建的转座子家族文库，可系统量化在物种分化后新爆发的特异转座子超家族与已灭绝的古老转座子化石；
3. **为高质量结构基因注释提供安全护航**：
   输出的规范 TE 库可无缝衔接至 MAKER 或 BRAKER3 流程，确保基因组软屏蔽既彻底又不会过火，保护外显子不受假阳性屏蔽。

---

## 输入输出规范与关键参数指南

### 关键运行步骤

```bash
# 1. 对待测植物基因组构建专用数据库
BuildDatabase -name plant_db -engine ncbi plant_assembly.fasta

# 2. 运行 RepeatModeler2 (强烈推荐开启 -LTRStruct 模块以获得全长 LTR)
RepeatModeler \
  -database plant_db \
  -threads 36 \
  -LTRStruct \
  > repeatmodeler.log
```

- `-database <name>`：通过 `BuildDatabase` 预处理的基因组数据库前缀；
- `-threads <int>`：指定并行计算 CPU 核心数；
- `-LTRStruct`：**核心参数**。启用基于 LTR_Harvest 与 LTR_retriever 的结构化 LTR 发现引擎（相比默认模式大幅提升全长 LTR-RT 的完整性）。

### 核心产物文件解读

- `*-families.fa`：最终重构出的物种特异性非冗余转座元件共有序列文库（包含标准分类表头，如 `>rnd-1_family-1#LTR/Copia`）；
- `*-families.stk`：包含每个转座子家族多序列比对（Stockholm 格式）的详细比对文件；
- `*-rm.log`：记录各阶段筛选与家族聚类统计的执行日志。

---

## 阅读与复现资源

- **论文全文**：[PNAS, 117(17), 9451–9457 (2020)](https://doi.org/10.1073/pnas.1921046117)
- **PubMed 记录**：[PMID: 32354994](https://pubmed.ncbi.nlm.nih.gov/32354994/)
- **官方开源代码仓库**：[GitHub - Dfam-consortium/RepeatModeler](https://github.com/Dfam-consortium/RepeatModeler)
- **相关算法工具详情**：[RepeatModeler 算法专题](../../topics/genome-annotation/m02-topic-01/)
