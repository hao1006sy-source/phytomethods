---
title: IQ-TREE 2
name: IQ-TREE 2
summary: 整合高效 ModelFinder 模型选择、超快自展检验（UFBoot2）与复杂位点异质模型的极大似然系统发育树推断平台。
dataType: DNA / 蛋白多序列比对（FASTA/Phylip/Nexus）
principle: 极大似然法、Felsenstein 剪枝算法与 RELL 超快速自展检验
domainIds: [comparative-genomics]
topicIds: [m04-topic-04]
principleIds: [phylogenetics]
dataIds: [proteins, coding-sequences]
paper: iqtree2-paper
repository: https://github.com/iqtree/iqtree2
status: published
updatedAt: 2026-11-25
---

## 生物学问题与定位

IQ-TREE 2 由澳大利亚国立大学与维也纳大学的 Bui Quang Minh 教授及其合作团队开发，是当代分子系统发育学与系统发育基因组学（Phylogenomics）中**性能最强劲、算法最完备的极大似然（Maximum Likelihood, ML）建树软件**。其核心算法发表于 *Molecular Biology and Evolution*（2015, 2020）。

在植物基因组研究中，利用数百至数千个直系同源基因拼接而成的超长比对矩阵（Supermatrix）常常包含极高的序列异质性与复杂的突变饱和现象。传统建树工具常面临模型选择过慢、重抽样自展耗时过长或易受长枝吸引（LBA）干扰等难题。IQ-TREE 2 整合了超高速模型搜索工具 **ModelFinder**、**UFBoot2** 快速自展检验、**SH-aLRT** 分支检验以及复杂的**剖面混合模型（PMSF / Complex Mixture Models）**，在兼顾严谨统计学推断的同时，将基因组级建树速度提升了数个数量级。

---

## 核心算法数学原理与推导

IQ-TREE 2 的极大似然优化与支持度评估基于以下数学核心：

### 1. 似然函数与 Felsenstein 剪枝算法

给定多序列比对矩阵 $D$（位点数 $N$），树拓扑 $\mathcal{T}$ 与分支长度向量 $\mathbf{t}$。全对数似然函数为各位点独立似然乘积的对数和：

$$\ln L(\mathcal{T}, \mathbf{t}) = \sum_{i=1}^N \ln P(D_i \mid \mathcal{T}, \mathbf{t}, M)$$

利用 **Felsenstein 剪枝算法**（Pruning algorithm）在树拓扑上自底向上进行后序动态规划，递归计算内部祖先节点 $k$ 在状态 $x$ 下的子树条件似然值 $L_k(x)$：

$$L_k(x) = \left( \sum_y P_{xy}(t_{\text{left}}) L_{\text{left}}(y) \right) \times \left( \sum_z P_{xz}(t_{\text{right}}) L_{\text{right}}(z) \right)$$

其中转移概率矩阵 $P(t) = e^{Qt}$，由瞬时替换速率矩阵 $Q$ 与分支长度 $t$ 的矩阵指数给出。

### 2. ModelFinder 快速模型选择与 BIC 准则

ModelFinder 在短时间内系统评估多达数百种核酸（JC, K80, HKY, GTR 等）或蛋白质（JTT, WAG, LG 等）替换矩阵，并结合离散 Gamma 速率异质性（`+G4`）和不变位点比例（`+I`）。基于**贝叶斯信息准则（BIC）**筛选最优模型：

$$\text{BIC} = -2\ln L + k \ln N$$

其中 $k$ 为模型自由参数数量，$N$ 为有效比对长度。BIC 对过度复杂的模型参数施加严格惩罚，防止过拟合。

### 3. UFBoot2 超快速自展检验与 RELL 近似

传统的非参数 Bootstrap 重抽样在处理基因组大数据时耗时数周。IQ-TREE 2 提出了 **UFBoot2**（Ultrafast Bootstrap）：
- 采用 RELL（Resampling Estimated Log-Likelihoods）近似，在优化完最优树后保存各位点的似然向量，重抽样时直接进行线性加权求和，避免了重复优化分支长度；
- 结合自适应终止准则，完成 1000 次自展仅需数分钟；
- **高置信分支黄金标准**：UFBoot 支持率 $\ge 95\%$ 且 SH-aLRT $\ge 80\%$。

---

## 生产环境实操命令行与参数指南

### 1. 自动模型选择与双重支持度评估标准运行

```bash
# 标准全基因组单拷贝超矩阵建树
iqtree2 \
  -s supermatrix_cds.phy \
  -m MFP \
  -B 1000 \
  --alrt 1000 \
  -T AUTO \
  --prefix plant_species_tree
```

### 2. 多分区模型（Partition Model，如密码子位点分区）

```bash
# 按照密码子第 1、2、3 位点或基因独立设置分区
iqtree2 \
  -s supermatrix.phy \
  -p partitions.nex \
  -m MFP+MERGE \
  -B 1000 \
  -T 32 \
  --prefix plant_partition_tree
```

### 3. 应对深部分化与长枝吸引的位点异质模型（PMSF）

```bash
# 步骤 1：生成向导树 (Guide tree)
iqtree2 -s supermatrix_pep.phy -m LG+G -T 16 --prefix guide

# 步骤 2：加载向导树计算 PMSF 剖面模型并建树
iqtree2 \
  -s supermatrix_pep.phy \
  -m LG+C20+F+G \
  -ft guide.treefile \
  -B 1000 \
  -T 32 \
  --prefix pmsf_resolved_tree
```

| 参数选项 | 功能与推荐设置 | 植物科研注意事项 |
| :--- | :--- | :--- |
| `-s <file>` | 输入多序列比对文件（支持 FASTA, Phylip, Nexus） | 推荐使用 Phylip 松散格式，防止长序列名被截断 |
| `-m MFP` | ModelFinder Plus（自动选择最优模型并建树） | 若数据量极大（超 10 万位点），可指定 `-m TEST` 仅在候选标准模型中测试 |
| `-B 1000` | 运行 1000 次 UFBoot 超快速自展检验 | 阈值 $\ge 95\%$ 判定为统计高置信；严禁将 80% 误报为高支持度 |
| `--alrt 1000`| 运行 1000 次 SH-like 似然比检验（SH-aLRT） | 与 UFBoot 形成双指标交叉互检，有效避免单方法假高支持 |
| `-T AUTO` | 自动检测 CPU 核心数并动态优化线程利用率 | 超矩阵分析推荐固定 `-T 16` ~ `32`，防止过多线程上下文切换浪费 |

---

## 输出结果深度解析

运行完成后生成带有指定前缀的一系列结果文件：

```text
plant_species_tree/
├── plant_species_tree.treefile      # 最终最大似然树拓扑 (Newick 格式，含支持度数值)
├── plant_species_tree.contree       # 共识树文件 (Consensus tree)
├── plant_species_tree.iqtree        # 详细文本日志 (记录最优模型、参数估计值、BIC 打分及 ASCII 树图)
├── plant_species_tree.log           # 命令行执行日志 (记录迭代步数与内存使用)
└── plant_species_tree.model.gz      # 缓存的各位点似然值矩阵 (用于后续拓扑检验)
```

在 `.treefile` 中，每个内部节点标注有两个支持度数值，形如 `89.2/96`，代表 `SH-aLRT / UFBoot` 检验百分比。

---

## 植物应用案例与真实文献证据

1. **拟南芥多态性群体泛基因组系统发育演化**：
   在拟南芥多代表材料的泛基因组演化研究中，作者利用从 OrthoFinder 提取的严格单拷贝直系同源基因，构建了长达数万碱基的超矩阵，在 IQ-TREE 2 中使用 `GTR+F+I+G4` 模型和 1000 次超快自展检验，高精度重塑了欧洲生态型与亚洲极端耐受生态型的分化树，所有主干节点支持度均达到 $100/100$（[Kang et al., *Nature Communications*, 2023](https://doi.org/10.1038/s41467-023-42029-4)）。
2. **被子植物早期分化与维管系统演化**：
   在解析无油樟（*Amborella trichopoda*）、睡莲目与木兰藤目的基部被子植物辐射分化时，利用 IQ-TREE 2 的 PMSF 位点异质模型（`LG+C60+F+G`），成功消除了由化石外群产生的严重长枝吸引伪迹，确定无油樟为现存所有显花植物的最早分化单系基部类群。

---

## 实践排错与质控规范

- **错误 1：程序报 `Alignment contains characters other than valid symbols`**
  - *排查原因*：比对文件中包含非标准氨基酸（如 `B`, `Z`, `X`, `*`）或特殊空白字符。
  - *解决方案*：预先清洗比对文件，将内部终止符 `*` 替换为空位 `-`，去除乱码序列。
- **错误 2：某些深部分支 UFBoot 支持度仅为 70% ~ 85%**
  - *排查原因*：该分化节点发生快速辐射分化，受到强烈的不完全谱系分选（ILS）影响。
  - *解决方案*：不可盲目拼接，应转而使用 ASTRAL-III 运行多物种溯祖模型，分析四分体拓扑冲突比例。
