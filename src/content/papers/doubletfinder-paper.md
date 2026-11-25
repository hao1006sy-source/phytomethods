---
title: "DoubletFinder: Doublet Detection in Single-Cell RNA Sequencing Data Using Artificial Nearest Neighbors"
summary: "提出基于人工合成双细胞（Artificial Doublets）与近邻密度比较（pANN）的单细胞测序双细胞无偏识别算法。"
authors: "McGinnis CS, Murrow LM, Gartner ZJ"
year: 2019
journal: Cell Systems
doi: 10.1016/j.cels.2019.03.003
type: method
methodIds: [doubletfinder]
domainIds: [single-cell-spatial-omics]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

# DoubletFinder: Doublet Detection in Single-Cell RNA Sequencing Data Using Artificial Nearest Neighbors

## 1. 研究背景与算法贡献

在液滴微流控单细胞 RNA 测序（如 10x Chromium、Drop-seq 等）过程中，细胞悬液被随机包裹至含有特定条形码磁珠的微反应油滴中。根据泊松分布随机抽样规律，随着测序上样细胞浓度的增加，不可避免地会有两个或多个完整细胞被共同封装至同一油滴中，从而被打上相同的细胞条形码（Cell Barcode），这种测序产物被称为**双细胞或多细胞（Doublets / Multiplets）**。

双细胞是单细胞数据分析中最隐蔽且极具危害的技术假象：
1. **产生虚假的“过渡中间态”**：异型双细胞（Heterotypic Doublets）混合了两个截然不同的谱系特征，在流形降维与聚类中常位于两类细胞正中间，极易被错误解读为“正在分化的罕见过渡干细胞”；
2. **扭曲拟时间轨迹拓扑**：导致轨迹推断软件错误建立虚假的跨谱系连通桥梁；
3. **传统过滤手段失效**：虽然双细胞通常测序深度（UMI 计数和基因数）高于单细胞，但由于天然细胞大小差异悬殊，简单的文库大小硬阈值无法有效区分大体积活跃单细胞与小体积双细胞。

2019 年，加利福尼亚大学旧金山分校（UCSF）的 Christopher S. McGinnis、Lauren M. Murrow 与 Zev J. Gartner 在 *Cell Systems* 推出了 **DoubletFinder**。DoubletFinder 提出了一套极其优雅且高度鲁棒的**人工合成双细胞邻近密度比较（pANN）算法**，完全无需依赖外部转录组参考或基因型多态性指纹，即可纯粹基于输入表达矩阵从头识别高置信度双细胞，成为全球单细胞质控与过滤的标准流程。

---

## 2. 核心数学模型与数据结构

### 2.1 人工双细胞模拟生成机制

算法首先利用真实观测数据自身作为基底：
- 设输入过滤后的真实单细胞表达矩阵为 $X$（包含 $N$ 个真实细胞）；
- DoubletFinder 按照预设比例 $pN$（默认 $pN = 0.25$），从真实细胞集合中随机抽取 $pN \cdot N$ 对细胞 $(c_a, c_b)$；
- 对抽取的细胞对进行表达向量逐基因线性相加：
  $$c_{\text{artificial}} = c_a + c_b$$
  构建人工合成双细胞矩阵 $X_{\text{artificial}}$；
- 将真实细胞与人工合成双细胞合并为一个联合矩阵，重新进行标准化的库容大小归一化、对数转换、高变基因筛选以及主成分降维（PCA）。

### 2.2 人工近邻比例（pANN）统计度量

在联合 PCA 低维空间中，算法为每个真实细胞 $i$ 搜索其在预设邻域大小参数 $pK$ 下的最近邻点集合 $\mathcal{N}_k(i)$：
- 统计近邻集合中属于人工合成双细胞的比例，定义为 **$pANN$（Proportion of Artificial Nearest Neighbors）**：
  $$pANN_i = \frac{\sum_{j \in \mathcal{N}_k(i)} \mathbb{I}(j \in X_{\text{artificial}})}{|\mathcal{N}_k(i)|}$$
- **判定原理**：若一个真实细胞本身是双细胞，它在基因表达流形上必然与由其组成类型混合生成的人工双细胞高度重叠，因而其局部近邻中人工双细胞的比例（$pANN$）将显著升高；反之，真实的均一单细胞在其近邻中主要被同类真实细胞包围，$pANN$ 极低。

### 2.3 参数自适应网格搜索与双细胞阈值划定

- **参数网格优化（`paramSweep`）**：DoubletFinder 支持在不同 $pN$ 与 $pK$ 组合下进行测试，计算均方根无偏估计（BCmetric），自动推荐在双峰之间辨识度最高的最佳 $pK$；
- **真实双细胞数目预估（$nExp$）**：结合实验实际上样捕获量与厂家技术说明（如 10x Genomics 经验值：每恢复 1000 个细胞双细胞率约增加 0.8%），并剔除由于同类型细胞聚集产生的同型双细胞（Homotypic Doublets，因不改变聚类拓扑通常不予剔除），最终在 $pANN$ 排序分布的截断点将排名前 $nExp$ 的细胞标记为最终 Doublet。

---

## 4. 植物基因组学应用场景与科研价值

植物组织解离与单细胞测序相比动物组织具有更高比例的双细胞风险：
- **植物原生质体（Protoplasts）团聚严重**：植物细胞在去除果胶质与纤维素细胞壁后极易发生自发膜融合或双核粘连；
- **异源多倍体植物的表达复杂性**：在小麦（六倍体）、甘蓝型油菜（四倍体）等异源多倍体植物中，双细胞往往同时呈现两个亲本亚基因组的特异性转录本，极易被错误鉴定为“发生基因组协同激活的全新细胞亚型”；
- **分生组织罕见干细胞的保真度**：在根尖静止中心（QC，通常仅占全根细胞的 0.1% 左右）的研究中，剔除双细胞假象对于防止高丰度中柱鞘细胞与表皮细胞混合伪造出的“虚假 QC 细胞”至关重要。

---

## 6. 阅读与复现资源

- **原始研究论文**：[Cell Systems 2019 DOI: 10.1016/j.cels.2019.03.003](https://doi.org/10.1016/j.cels.2019.03.003)
- **PMC 全文**：[PMC6853612](https://pmc.ncbi.nlm.nih.gov/articles/PMC6853612/)
- **DoubletFinder 官方源码仓库**：[chris-mcginnis-ucsf/DoubletFinder GitHub](https://github.com/chris-mcginnis-ucsf/DoubletFinder)
- **站内配套专题**：[单细胞转录组测序技术与质控](../../topics/single-cell-spatial-omics/m08-topic-01/)
- **站内配套专题**：[单细胞多组学整合分析](../../topics/single-cell-spatial-omics/m08-topic-05/)
