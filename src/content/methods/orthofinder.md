---
title: OrthoFinder
name: OrthoFinder
summary: 整合序列长度归一化、马尔可夫图聚类（MCL）与系统发育树调和的比较基因组学直系同源群划分平台。
dataType: 蛋白序列 FASTA
principle: 序列相似性图聚类与基因树-物种树调和
domainIds: [comparative-genomics, pangenomics-structural-variation]
topicIds: [m03-topic-01, m03-topic-04, m04-topic-01, m04-topic-02]
principleIds: [phylogenetics]
dataIds: [proteins]
paper: orthofinder-paper
repository: https://github.com/OrthoFinder/OrthoFinder
status: published
updatedAt: 2026-11-25
---

## 生物学问题与定位

OrthoFinder 由牛津大学 David Emms 与 Steven Kelly 教授团队开发，是当今比较基因组学与植物演化生物学领域使用最广泛的**高精度直系同源群（Orthogroup）划分与谱系推断平台**。其核心方法发表于 *Genome Biology*（2015, 2019）及 *Nature Methods*（2026）。

在植物基因组研究中，由于频繁的全基因组加倍（WGD）、串联复制和广泛的亚基因组差异基因丢失，传统的双向最佳匹配（RBH）或简单的序列相似性聚类极易产生大量假阳性与假阴性。OrthoFinder 创新性地结合了**比对长度偏差纠正**、**马尔可夫随机游走图聚类（MCL）**与**基因树-物种树调和（Gene Tree Reconciliation）**，能够显式定位每个基因拷贝的物种分化与基因复制事件，不仅能精准输出 1:1、1:多与多:多的直系同源关系，还能自动化提取用于超矩阵建树的单拷贝直系同源群（SCOG）。

---

## 核心算法数学原理与推导

OrthoFinder 的计算架构包含三大核心算法模块：

### 1. 序列比对打分的长度偏差归一化

全对全（All-vs-All）Diamond 比对中，长蛋白质因比对命中长度更长，其原始比对 Bit-Score（$S_{ij}$）往往系统性偏高，导致含保守结构域的长蛋白被错误聚类。OrthoFinder 引入了严格的**长度归一化公式**：

$$S'_{ij} = S_{ij} \times \frac{\min(L_i, L_j)}{\max(L_i, L_j)}$$

其中 $L_i$ 和 $L_j$ 为两比对蛋白的氨基酸长度。通过对长度悬殊的比对结果施加比值惩罚，有效消除了结构域嵌合导致的假阳性高分。

### 2. 马尔可夫图聚类（MCL）

所有蛋白质对构成加权无向图，节点为基因，边权重为归一化相似度。将网络表示为按列归一化的马尔可夫转移概率矩阵 $M$（满足 $\sum_i M_{ij} = 1$）。MCL 算法通过两个交替算子的迭代实现图分割：

- **扩展算子（Expansion）**：计算矩阵自乘，模拟随机游走扩散，增强簇内连通度：
  $$M_{t+1/2} = M_t \times M_t$$
- **膨胀算子（Inflation）**：非线性增强强边并蒸发弱边，受膨胀系数 $r$ 控制（植物基因组推荐默认 $r=1.5$）：
  $$(\Gamma_r M)_{ij} = \frac{(M_{ij})^r}{\sum_k (M_{kj})^r}$$

交替迭代直至矩阵收敛为非连续分块对角矩阵，自动划定直系同源群（Orthogroups）边界。

### 3. 基因树与物种树调和（DLCPar）

在每个 Orthogroup 内部构建 MSA 并估计无根基因树，随后采用最大简约调和算法将基因树与物种树进行匹配：
- 设基因树节点为 $g$，映射到物种树节点 $\mathcal{M}(g) = s$；
- 若两个子分支映射无交集：$\mathcal{M}(g_1) \cap \mathcal{M}(g_2) = \emptyset$，判定该节点为**物种分化事件（Speciation）**；
- 若存在包含或重叠关系，判定为**基因复制事件（Duplication）**。

---

## 命令行实操与植物多倍体全流程参数

### 1. 输入数据预处理（代表性最长转录本）
输入必须为每个物种单一的 FASTA 蛋白文件，存放在统一目录中（如 `primary_proteins/`）。每个基因位点仅保留最长蛋白产物，去除尾部星号 `*` 及非标准氨基酸。

### 2. 推荐生产环境执行命令

```bash
# 全功能模式运行：调用 Diamond 超敏模式，使用 MAFFT 构建 MSA 并用 FastTree 建树
orthofinder \
  -f primary_proteins/ \
  -t 32 \
  -a 16 \
  -S diamond_ultra_sens \
  -M msa \
  -A mafft \
  -T fasttree \
  -I 1.5 \
  -o orthofinder_results/
```

| 参数选项 | 功能说明与推荐设置 | 植物科研注意事项 |
| :--- | :--- | :--- |
| `-f <dir>` | 包含所有物种代表蛋白 FASTA 的输入目录 | 文件名即为物种名，请使用英文字母与下划线（如 `Oryza_sativa.fa`） |
| `-t <threads>` | Diamond 比对与文件处理线程数（推荐 16 ~ 64） | 内存消耗主要受线程数影响，每个线程建议分配 2 ~ 4 GB 内存 |
| `-S diamond_ultra_sens`| 序列相似度搜索后端与敏感度模式 | 跨科植物深部分化必须启用 `diamond_ultra_sens`，默认 fast 会漏检 |
| `-M msa` | 基于多序列比对推断基因树（默认 dendroblast） | 高质量发表推荐 `-M msa`，准确度显著高于树距离矩阵推断 |
| `-I 1.5` | MCL 聚类膨胀系数（默认 1.5） | 增大膨胀系数会使超大激酶家族切分更细，通常保持默认值 |
| `-b <dir>` | 加载已有 Diamond 比对结果，重新运行聚类与建树 | 当增减物种或调整建树参数时，避免重复消耗数十小时进行全比对 |

---

## 输出目录结构与关键文件解析

运行完成后，结果保存在 `orthofinder_results/Results_<Date>/` 目录下：

```text
Results_Nov25/
├── Comparative_Genomics_Statistics/      # 全局宏观统计表
│   ├── Duplications_per_Orthogroup.tsv   # 各直系同源群内部复制事件数
│   ├── Duplications_per_Species_Tree_Node.tsv # 物种树各内部节点发生的基因加倍事件数
│   └── Statistics_Overall.tsv            # 全局基因利用率、单拷贝群总数统计
├── Orthogroups/                          # 核心直系同源群划分表
│   ├── Orthogroups.tsv                   # 经典矩阵表 (行: OG编号; 列: 各物种基因列表)
│   ├── Orthogroups.GeneCount.tsv         # 各物种在各 OG 中的拷贝数统计表 (用于 CAFE 5)
│   └── Orthogroups_SingleCopyOrthogroups.txt # 严格单拷贝直系同源群 ID 列表 (用于物种建树)
├── Orthologues/                          # 成对直系同源基因明细表
│   └── Orthologues_*/                    # 物种间一对一、一对多直系同源匹配对
├── Phylogenetically_Informed_Orthogroups/ # 调和后层级同源群 (HOG)
└── Species_Tree/                         # 自动推断并有根化的物种树文件
    └── SpeciesTree_rooted.txt            # Newick 格式有根物种树
```

---

## 植物应用案例与真实文献证据

1. **种子植物早期演化与苏铁基因组**：
   在攀枝花苏铁（*Cycas panzhihuaensis*）基因组研究中，作者利用 OrthoFinder 将苏铁与水膏药、裸子植物、双子叶及单子叶等 18 个代表植物进行全蛋白家族划分，成功鉴定出 423 个严格单拷贝直系同源基因，构建了高置信超矩阵物种树，彻底厘清了裸子植物与被子植物的分化年代（[Liu et al., *Nature Plants*, 2022](https://doi.org/10.1038/s41477-022-01129-7)）。
2. **拟南芥泛基因组核心与可变基因群分析**：
   在 69 份拟南芥代表组装的泛基因组构建中，研究团队利用 OrthoFinder 将所有蛋白聚类为 28,495 个直系同源群，并基于基因在群体中的覆盖频次精准定义核心群（Core）、软核心群（Soft-core）与非必需群（Dispensable），揭示了抗病受体在泛基因组中的动态丢失与保留规律（[Lian et al., *Nature Genetics*, 2024](https://doi.org/10.1038/s41588-024-01715-9)）。

---

## 实践排错与参数质控指南

- **错误 1：内存溢出或 Diamond 运行中断**
  - *排查原因*：单个物种文件中包含了全转录本剪接异构体，导致序列数从 3 万膨胀至 10 万，比对复杂度按平方暴涨。
  - *解决方案*：必须在运行前严格提取最长代表蛋白（Primary transcript）。
- **错误 2：极少量物种未包含在单拷贝列表中**
  - *排查原因*：某一植物发生特异性近期全基因组加倍（如玉米或油菜），导致原本单拷贝的基因均变成双拷贝。
  - *解决方案*：不必强制所有物种均为 1 拷贝，可放宽筛选规则提取“在 $\ge 80\%$ 物种中为单拷贝”的准单拷贝基因群进行建树。
