---
title: "OrthoFinder: improved phylogenetic orthology inference with enhanced accuracy and scalability"
summary: "提出新一代 OrthoFinder 算法升级版本，系统解决动植物超大规模基因组比对的计算可扩展性与跨多倍体系统发育同源推断准确性瓶颈，引入增量式同源更新与多倍体亚基因组感知调和模型，使数千物种或群体泛基因组水平的高精度同源推断成为可能。"
authors: "Emms DM, Liu Y, Belcher L, et al."
year: 2026
journal: Nature Methods
doi: 10.1038/s41592-026-03126-6
type: method
methodIds: [orthofinder]
domainIds: [comparative-genomics]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

## 研究背景与算法贡献

随着全球动植物全基因组重测序与染色体级从头组装项目的指数级爆发，地球生物基因组计划（EBP）等宏大科学工程已积累了数千个物种的基因组数据。然而，经典版 OrthoFinder 2 面临两个日益严峻的现实挑战：
- **$O(N^2)$ 全对全比对计算复杂度的爆炸**：当纳入比较的物种数量从几十个激增至上千个时，两两物种之间的全对全序列比对组合数呈二次方激增（例如 1,000 个物种对应约 50 万次两两比对任务），导致计算时间和存储开销成为不可承受之重；
- **增量式添加物种（Incremental Species Addition）缺失**：过去每次向已有分析集合中新增加 1 个新物种时，必须将所有既有物种全部重新从头计算一遍，严重阻碍了持续更新的植物知识库与物种数据库的动态维护；
- **同源多倍体与杂交物种在树调和中的拓扑异常**：传统二叉物种树模型无法直接表达自然界中广泛存在的植物同源多倍化、网状演化（Reticulate Evolution）与杂交渗入事件。

在发表于 *Nature Methods* (2026) 的这篇重磅升级论文中，牛津大学团队对 OrthoFinder 进行了重大算法理论重构与工程优化：
1. **增量式与分层直系同源推断架构（Incremental Orthology Inference）**：允许用户在已有庞大同源知识库的基础上，仅计算新物种与既有物种核心代表间的关联，以线性代价将新物种即时无缝融入既有 Orthogroups；
2. **多倍体与网状演化调和拓展（Subgenome-aware Reconciliation）**：原生支持将异源多倍体的不同亚基因组（Subgenomes）作为独立演化分支进行树调和，消除同源基因误判；
3. **结合 MMseqs2 级联聚类实现百倍可扩展性飞跃**：大幅降低两两比对中的序列冗余计算，使单机工作站运行数百个植物全蛋白质组同源聚类成为现实。

---

## 核心数学模型与数据结构

新版 OrthoFinder 引入了增量图扩展算法与层次化 HOG 动态维护模型：

```
                既有 N 个物种的 HOGs 知识图谱数据库
                                │
                                ▼
         [新增物种 X 的蛋白质组 (Single New Proteome)]
                                │
                                ▼
         [级联两两快速检索: X 对抗既有核心祖先代表序列]
• 复杂度从 $O(N^2)$ 骤降为 $O(N)$
                                │
                                ▼
        [增量式局部 MCL 聚类 (Incremental Local Clustering)]
• 将 X 的基因根据标准化边权分配入既有主同源群 (Orthogroups)
• 自动识别 X 独有的新基因家族 (Novel Lineage-specific groups)
                                │
                                ▼
       [基于分支交换的局部基因树微调 (Local Tree Re-estimation)]
• 仅在受影响的基因树上插入新叶子节点 X
• 重新评估 LCA 分支，更新基因复制 (Duplication) 与分化 (Speciation)
                                │
                                ▼
           输出更新完毕的全物种直系同源矩阵与演化事件表
```

1. **增量式 HOG 映射似然评估**：
   对于新引入的物种 $X$ 中的基因 $g_x$，算法计算其与既有层次同源群 $\mathcal{H}_k$ 中代表序列的加权相似度：
   $$\mathcal{L}(g_x \in \mathcal{H}_k) = \sum_{g_j \in \mathcal{H}_k} w_j \cdot \frac{S(g_x, g_j)}{\sqrt{L_{g_x} L_{g_j}}}$$
   当似然得分显著高于第二候选同源群且跨越演化深度阈值时，直接将 $g_x$ 归入该群，避免全局重构；
2. **网状多倍体物种网络调和模型**：
   对于杂交起源的异源多倍体植物（如甘蓝型油菜由白菜与甘蓝杂交形成），算法允许物种树结构拓展为有向无环系统发育网络（Phylogenetic Networks），从而使来自不同祖先亲本的亚基因组基因能够正确在各自对应的亲本分支上完成分化事件标注；
3. **自适应树调和置信度评估（Bootstrap-supported Reconciliation）**：
   在树调和过程中引入基因树节点重抽样支持度，对低置信度的内部弱分支进行软收缩（Soft Polytomy），有效防止由于比对噪音导致的虚假基因复制（Spurious Duplications）误报。

---

## 植物基因组学应用场景与科研价值

1. **动态生长的植物基因组知识库核心驱动器**：
   对于像 PhytoMethods、Ensembl Plants 或 NCBI 这样需要定期收录新测序植物品种的大型公共知识库，新版 OrthoFinder 提供了无缝追加新物种的核心引擎，无需中断既有知识图谱服务；
2. **超大规模农作物泛基因组学（Pan-genomics）同源分析**：
   在面对水稻 3,000 份重测序核心种质、玉米或大豆数百个组装的超大型群体泛基因组中，提供稳定、高扩展性的核心与可变基因家族精确分类；
3. **复杂网状演化与异源多倍体起源解密**：
   为小麦族、芸薹属、棉属等经历复杂自然杂交与倍性变迁的重要农作物提供了最先进的系统发育同源推断支持。

---

## 阅读与复现资源

- **论文全文**：[Nature Methods, 23(2), 215–224 (2026)](https://doi.org/10.1038/s41592-026-03126-6)
- **勘误与补充材料**：[Author Correction (2026)](https://doi.org/10.1038/s41592-026-03238-z)
- **官方开源代码仓库**：[GitHub - davidemms/OrthoFinder](https://github.com/davidemms/OrthoFinder)
- **相关算法工具详情**：[OrthoFinder 算法原理与指南](../../methods/orthofinder/)
