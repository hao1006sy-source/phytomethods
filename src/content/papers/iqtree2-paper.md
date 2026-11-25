---
title: "IQ-TREE 2: New Models and Efficient Methods for Phylogenetic Inference in the Genomic Era"
summary: "提出全基因组系统发育基因组学 (Phylogenomics) 最大似然推断系统 IQ-TREE 2，深度集成 ModelFinder 全自动最优替换模型选择器、超快速自展检验算法 (UFBoot2) 与无偏近似似然比检验 (SH-aLRT)，并在大尺度超多序列比对矩阵下实现极高拓扑精度与计算扩展性。"
authors: "Minh BQ, Schmidt HA, Chernomor O, Schrempf D, Woodhams MD, von Haeseler A, Lanfear R"
year: 2020
journal: Molecular Biology and Evolution
doi: 10.1093/molbev/msaa015
type: method
methodIds: [iqtree2]
domainIds: [comparative-genomics]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

## 研究背景与算法贡献

在后基因组学时代，系统发育重建已从早期的单基因片段比对演变为包含成千上万个直系同源基因串联的大规模系统发育基因组学（Phylogenomics）分析。构建高质量、拓扑稳健的**最大似然（Maximum Likelihood, ML）物种树**，是解析真核生物生命之树演化拓扑、估算物种分化时间以及开展比较基因组学分析的绝对骨架。

然而，传统的最大似然建树软件（如 RAxML、PhyML）在大数据时代面临严重的计算与统计瓶颈：
- **模型选择繁琐且脱节**：必须先借助外部独立工具（如 jModelTest、ProtTest）进行多轮前置测试，无法自动兼容异质位点混合模型与分区比对（Partitioned models）；
- **传统自展检验（Standard Bootstrap）耗时过长**：针对包含数十万个氨基酸位点的大型超级矩阵，传统 1,000 次自展检验往往需要数周至数月的超级计算机时间；
- **缺乏对基因间演化异质性与不完全谱系分选（ILS）的综合建模**：忽略复杂植物网状分化与多倍体背景下的拓扑冲突。

由澳大利亚国立大学 Bui Quang Minh 与 Robert Lanfear 等学者联合开发的 **IQ-TREE 2**，是全球使用最广泛、引用率最高的最大似然系统发育推断工具：
1. **ModelFinder 全自动模型搜索体系**：一键全自动测试数百种核苷酸与氨基酸替代模型（涵盖基序偏好、不变位点比例 $+I$、离散 Gamma 速率异质性 $+G$ 及自由速率模型 $+R$）；
2. **超快速自展检验（Ultrafast Bootstrap 2, UFBoot2）**：将传统 Bootstrap 提速数百倍，同时消除原始 UFBoot 在存在局部拓扑扰动时的过拟合假阳性；
3. **多模型综合评估指标卡**：同时输出 UFBoot 支持度（$\ge 95\%$ 达标）与 SH-aLRT 近似似然比检验分值（$\ge 80\%$ 达标），提供最严苛的拓扑置信双保险。

---

## 核心数学模型与数据结构

IQ-TREE 2 基于 Felsenstein 剪枝算法（Pruning Algorithm），核心流程与概率图推导如下：

```
                多物种串联氨基酸 / 核苷酸多重比对 (Supermatrix)
                                     │
                                     ▼
        [阶段 1: ModelFinder 全自动模型最优求解 (BIC / AICc)]
• 遍历标准替代矩阵 (JTT, WAG, LG, GTR 等)
• 拟合演化速率异质性: $+G$ (分层 Gamma) 或 $+R$ (自由速率 FreeRate)
• 自动合并相似分区 (Partition Merging)
                                     │
                                     ▼
        [阶段 2: 启发式树搜索 (Stochastic Tree Search Algorithm)]
• 结合简约法 (Parsimony) 快速生成多样化初始骨架树
• 实施最近邻交换 (NNI) 与子树修剪重植 (SPR) 拓扑扰动
• 维持高似然候选拓扑池 (Candidate Tree Pool) 逐步收敛
                                     │
                                     ▼
        [阶段 3: 双重置信度支持评估 (Dual Support Values)]
• 1. UFBoot2: 快速重抽样主成分逼近标准 Bootstrap 分值
• 2. SH-aLRT: 基于 Shimodaira-Hasegawa 近似似然比检验
                                     │
                                     ▼
            输出最佳最大似然树 (.treefile) 与详细拟合报告
```

1. **最大似然树目标函数与剪枝算法**：
   对于给定的多重对齐矩阵 $D$ 与候选拓扑结构 $T$，假设各个比对位点之间独立演化。全基因组对数似然值为各独立位点对数似然之和：
   $$\ln L(T, \theta | D) = \sum_{i=1}^N \ln P(D_i | T, \theta)$$
   其中 $\theta$ 包含分支长度向量与替代速率转移矩阵 $Q$。利用马尔可夫转移概率 $P_{ij}(t) = e^{Qt}$，Felsenstein 剪枝算法通过自底向上的动态规划在 $O(M \cdot S)$ 复杂度内递归求解每个内部祖先节点的条件似然向量；
2. **自由速率模型（FreeRate Model, $+R$）的灵活性突破**：
   传统 Gamma 分布模型假定位点演化速率严格遵循对称或偏态的连续单峰分布。IQ-TREE 2 的 $+R$ 模型完全解除了连续分布假设，直接通过极大似然估计 $k$ 个独立的离散速率类别 $r_1, r_2, \dots, r_k$ 及其对应的权重比例 $w_1, w_2, \dots, w_k$：
   $$\sum_{j=1}^k w_j r_j = 1$$
   在真实植物多重比对测试中，相比传统 $+G$ 模型，$+R$ 能够将树拓扑的对数似然值提高数千个对数单位；
3. **UFBoot2 统计偏差校正算法**：
   经典自展检验在候选拓扑相近时易对微弱信号给出虚假的高支持度。UFBoot2 引入了严格的 RELL（Resampling Estimated Log-Likelihoods）近似机制，并在每次重抽样中通过轻量级 NNI 搜索优化替代拓扑，彻底消除了由于参数固定导致的过度自信偏差。

---

## 算法复杂度与计算性能

| 维度 | 指标与性能数据 | 算法优势与设计机制 |
| :--- | :--- | :--- |
| **计算速度** | 相比传统 RAxML 或 PhyML 提速 **10~100 倍** | 结合 AVX-512 / AVX2 / SSE3 指令集多精度并行硬件加速 |
| **并行可扩展性** | 在 64~128 核高配服务器上保持极高线性加速比 | 细粒度 OpenMP 线程级分块与 MPI 分布式跨节点集群支持 |
| **内存管理** | 典型 100 物种串联大矩阵约 **4~16 GB RAM** | 紧凑位模式编码与位点模式（Site Patterns）唯一性去重压缩 |
| **功能整合度** | 单一二进制程序包涵盖全套模型、分区与假设检验 | 杜绝由于第三方脚本串接导致的版本不匹配与数据转换截断 |

---

## 植物基因组学应用场景与科研价值

1. **被子植物系统发育全景生命之树构建**：
   在植物宏演化研究（如中科院植物所牵头的万种被子植物系统发育计划 1KP）中，IQ-TREE 2 是官方标准核心建树工具，成功解析了基底被子植物（无名木、睡莲、木兰类）的分歧顺序与早期辐射演化历史；
2. **多倍体作物不同亚基因组（Subgenomes）系统发生定位**：
   通过提取普通小麦 A、B、D 亚基因组与近缘野生一粒小麦、节节麦的单拷贝同源基因，IQ-TREE 2 能以 100% 的 UFBoot 支持度确定各个亚基因组供体亲本的精确演化分支；
3. **基因树与物种树拓扑冲突（Incongruence）检验**：
   借助内置的基因一致性因子（Gene Concordance Factor, gCF）与位点一致性因子（Site Concordance Factor, sCF），量化不完全谱系分选与杂交渗入在全基因组的占比。

---

## 输入输出规范与关键参数指南

### 关键运行步骤

```bash
# 1. 标准全自动最大似然系统发育推断 (包含 ModelFinder + UFBoot2 + SH-aLRT)
iqtree2 \
  -s plant_concatenated_alignment.phy \
  -m MFP \
  -B 1000 \
  --alrt 1000 \
  -T AUTO \
  --prefix plant_phylogeny

# 2. 针对复杂分区比对数据集 (例如将不同基因独立指定进化模型)
iqtree2 \
  -s supermatrix.fa \
  -p partition_scheme.nex \
  -m MFP+MERGE \
  -B 1000 \
  -T 48 \
  --prefix plant_partitioned
```

- `-s <file>`：输入的多序列比对文件（支持 FASTA、Phylip、Nexus 等格式）；
- `-m MFP`：启用 ModelFinder Plus 自动寻找全基因组最优替代模型；
- `-B 1000`：执行 1,000 次超快速自展检验（UFBoot2，要求支持度 $\ge 95\%$ 为可靠）；
- `--alrt 1000`：执行 1,000 次 SH-aLRT 近似似然比检验（要求支持度 $\ge 80\%$ 为可靠）；
- `-T AUTO`：全自动探测并绑定最佳 CPU 核心数。

### 核心产物文件解读

- `*.treefile`：最终输出的格式化最佳最大似然系统发育树（Newick 格式，内部节点标注了 `SH-aLRT/UFBoot` 双重支持度分值，可直接在 iTOL / FigTree 中渲染）；
- `*.iqtree`：全套文本分析总报告，包含选用的最优替代模型参数、碱基/氨基酸频率、各分支长度统计及 AIC/BIC 打分汇总；
- `*.log`：完整的计算迭代收敛日志。

---

## 阅读与复现资源

- **论文全文**：[Molecular Biology and Evolution, 37(5), 1530–1534 (2020)](https://doi.org/10.1093/molbev/msaa015)
- **PubMed 记录**：[PMID: 32011700](https://pubmed.ncbi.nlm.nih.gov/32011700/)
- **官方开源代码仓库**：[GitHub - iqtree/iqtree2](https://github.com/iqtree/iqtree2)
- **相关算法工具详情**：[IQ-TREE 2 算法原理与指南](../../methods/iqtree2/)
