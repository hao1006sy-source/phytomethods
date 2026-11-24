---
title: 重复序列与转座子从头挖掘
summary: 深度剖析 Wicker 转座子分类学、LTR 结构特征与 Kimura 插入年代公式、EDTA 多模块集成算法与植物大基因组软屏蔽规范。
domain: genome-annotation
methods: [edta]
updatedAt: 2026-11-25
---

## 植物基因组的“暗物质”：转座子生物学与爆发演化

在被子植物演化历史中，转座元件（Transposable Elements, TEs）不仅是推动基因组大小剧烈波动（C-value 悖论）的终极动力，更是染色质高级三维构象形成、表观遗传沉默及基因表达调控网络重塑的核心源泉。在作物基因组（如玉米、大麦、小麦）中，重复序列的质量占比高达 75%~85% 以上，使得非重复的真实蛋白质编码基因在物理空间上如同漂浮在巨型转座子“海洋”之中的零星“孤岛”。

如果在结构基因预测之前未能精准挖掘并屏蔽这些转座子：
1. **假基因严重污染**：转座子自身编码的反转录酶（RT）、整合酶（INT）、转座酶（Transposase）将被错误注释为宿主的功能基因，造成全基因组基因总数人为虚高（数万个伪基因）；
2. **剪接模型破裂**：转座子内部的隐蔽剪接位点会与侧翼正常基因外显子发生错误拼接，破坏真实转录本结构；
3. **同源聚类失真**：大量携带转座子结构域的嵌合基因进入后续比较基因组学分析，导致直系同源基因聚类发生灾难性串联崩塌。

![植物转座子分类层级与完整 LTR 结构及插入年代推断](/phytomethods/images/topics/m02/te-classification-and-ltr-structure.svg)

---

## Wicker 经典统一分类层级与结构特征

根据 Wicker 等人于 2007 年在 *Nature Reviews Genetics* 确立的真核生物转座子分类规范，TEs 依据其在染色体上的转位机制被严格划分为两大门类（Classes）：

### 1. Class I：RNA 逆转录转座子（Retrotransposons）

采用“**复制—粘贴（Copy-and-Paste）**”机制，以 RNA 为中间模板反转录生成 cDNA 重新插入宿主基因组，导致基因组规模不断膨胀。
- **LTR-RT（长末端重复逆转录转座子）**：植物基因组中最庞大的类群。主要包含 **Gypsy** 家族（多富集于着丝粒与着丝粒周边的异染色质）与 **Copia** 家族（多富集于常染色质区，邻近蛋白编码基因）；
- **Non-LTR**：主要包括 LINE（长散在核元件）与 SINE（短散在核元件）。

### 2. Class II：DNA 转座子（DNA Transposons）

绝大多数采用“**剪切—粘贴（Cut-and-Paste）**”机制，直接以 DNA 实体切离原位点并整合至新位点。
- **TIR（末端倒位重复元件）**：两端具有反向互补倒位重复（Inverted Repeats），主要包含 CACTA、Mutator、hAT、Tc1-Mariner 超家族，以及无自主编码能力但拷贝数极高的 MITE 元件；
- **Helitron（滚环转座子）**：通过不对称滚环复制转位，在植物中经常在转位过程中“抓取”并移动宿主基因的外显子片段，是推动植物基因组新基因起源与嵌合基因产生的重要动力。

---

## 完整 LTR-RT 结构与插入年代分子钟推导

一个结构完整的 LTR-RT 包含两侧完全同向平行的长末端重复（5' LTR 与 3' LTR）、内部核心编码多聚蛋白区（GAG、PR、RT、INT）、引物结合位点（PBS）、聚嘌呤区（PPT）以及两侧因插入宿主双链错切修复而产生的微小靶位点重复（Target Site Duplications, TSD，通常为 4~6 bp）。

### 插入年代推断公式：$T = K / (2\mu)$

在 LTR-RT 插入宿主基因组的物理瞬间，由于其两端的 5' LTR 与 3' LTR 均源自同一分子模板的逆转录复制，两者的核苷酸序列在理论上是 **100% 完全同源一致** 的。

插入之后，两侧的 LTR 在宿主染色体中各自独立累积中性点突变。因此，两端 LTR 之间的序列分歧度（Divergence）便成为测量其插入年代的天然“分子时钟”。

1. **Kimura 2-Parameter (K2P) 遗传距离修正**：
   设两端序列比对中，转换（Transitions: A $\leftrightarrow$ G, C $\leftrightarrow$ T）的比率为 $P$，颠换（Transversions: A/G $\leftrightarrow$ C/T）的比率为 $Q$。核苷酸分歧度 $K$ 计算为：

$$K = -\frac{1}{2} \ln(1 - 2P - Q) - \frac{1}{4} \ln(1 - 2Q)$$

2. **绝对地质演化年代反演**：
   设植物中性分子进化速率为 $\mu$（例如水稻、玉米等单子叶禾本科通常取 $\mu \approx 1.3 \times 10^{-8} \text{ substitutions/site/year}$；十字花科通常取 $\mu \approx 7.0 \times 10^{-9}$）。

$$T = \frac{K}{2\mu}$$

其中分母中的因子 $2$ 精确反映了两侧 LTR 独立向后演化累积变异的双向性。利用该公式，可精确绘制全基因组 LTR 插入年代分布图，揭示作物在驯化或地质历史中的 TE 爆发式扩张峰（如玉米在距今 100~300 万年前发生的大规模 LTR 爆发）。

---

## EDTA 现代自动化多模块集成算法架构

传统工具（如 RepeatModeler）主要依赖无先验序列自比对聚类，容易将宿主本身的多拷贝正常基因家族（如 NLR 抗病基因簇、P450 基因家族）误当成重复序列。

Ou 等人于 2019 年在 *Genome Biology* 上开发的 **EDTA (Extensive de-novo TE Annotator)**，开创了基于精细结构特征的集成过滤新范式：

```
                    植物基因组全序列 FASTA
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
   [LTR 结构识别]       [TIR 结构识别]       [Helitron 结构识别]
(LTR_FINDER_parallel     (TIR-Learner)       (HelitronScanner)
   + LTR_retriever)           │                    │
         │                    │                    │
         └────────────────────┼────────────────────┘
                              ▼
                  [原始候选库多阶段串联清洗]
               1. 排除多拷贝编码基因与串联重复 (Tandem)
               2. 剔除嵌套嵌合片段，确证全长边界
               3. 消除家族内部冗余 (>80% 相似度合并)
                              │
                              ▼
                 物种特异非冗余 TE 家族参考库
                    (*.mod.EDTA.TElib.fa)
                              │
                              ▼
                 [RepeatMasker 全基因组同源扫描]
                              │
                              ▼
        输出高精度结构化 TE 注释 (GFF3) 与软屏蔽序列 (Soft-masked)
```

---

## 常用实战运行命令与规范

```bash
# --genome: 必须的染色体序列 FASTA (序列 ID 建议简短，≤13 字符)
# --species: 模式选择 (Rice / Maize / others，不同物种内置优化 TIR 模型)
# --step all: 执行完整分析阶段
# --anno 1: 自动执行全基因组 RepeatMasker 比对并输出最终注释表
# --threads: 建议 32~64 线程
perl EDTA.pl \
  --genome genome.fasta \
  --species others \
  --step all \
  --anno 1 \
  --threads 32
```

### 软屏蔽（Soft-masking）对下游预测的生命线价值

- **严禁硬屏蔽（Hard-masking）**：硬屏蔽将所有重复区域强制替换为 `N`。由于许多宿主基因内嵌有小型 MITE 或内含子转座子，硬屏蔽会导致基因被硬生生截断为片段，造成内含子边界信息完全丧失；
- **推崇软屏蔽（Soft-masking）**：将重复序列转为小写字母（`atcg`），非重复序列保持大写（`ATCG`）。基因预测器（如 AUGUSTUS）能够感知小写区域以抑制假外显子生成，但在有强转录本剪接证据支撑时，仍允许外显子跨越软屏蔽区，实现最佳平衡。

---

## 参考文献与数据来源

1. **Wicker T, Sabot F, Hua-Van A, et al.** (2007). A unified classification system for eukaryotic transposable elements. *Nature Reviews Genetics*, 8(12), 973–982. DOI: [10.1038/nrg2165](https://doi.org/10.1038/nrg2165)
2. **Ou S, Su W, Liao Y, et al.** (2019). Benchmarking transposable element annotation methods for creation of a streamlined, comprehensive pipeline. *Genome Biology*, 20(1), 275. DOI: [10.1186/s13059-019-1905-y](https://doi.org/10.1186/s13059-019-1905-y)
3. **SanMiguel P, Gaut BS, Tikhonov A, et al.** (1998). The paleontology of intergene retrotransposons of maize. *Science*, 281(5385), 1993–1996. DOI: [10.1126/science.281.5385.1993](https://doi.org/10.1126/science.281.5385.1993)
