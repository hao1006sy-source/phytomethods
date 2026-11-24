---
title: CAFE 5
name: CAFE5
summary: 基于超度量系统发育树与生灭随机过程的基因家族规模扩张与收缩动力学推断软件。
dataType: 基因家族计数表 / 超度量物种树
principle: 连续时间马尔可夫链生灭模型、Gamma 速率异质性与极大似然比检验
domainIds: [comparative-genomics]
topicIds: [m04-topic-02]
principleIds: [birth-death]
dataIds: [gene-counts]
paper: cafe5-paper
repository: https://github.com/hahnlab/CAFE5
status: published
updatedAt: 2026-11-25
---

## 生物学问题与定位

CAFE 5（Computational Analysis of gene Family Evolution 5）由印第安纳大学 Matthew Hahn 教授实验室与 Fábio Mendes 等人开发，是比较基因组学中用于**推断基因家族在演化历程中沿系统发育树各分支的扩张（Expansion）与收缩（Contraction）动力学**的黄金标准软件。其核心算法发表于 *Bioinformatics*（2020）。

直接比较不同植物物种的基因家族成员数目往往无法区分该差异究竟是由中性演化漂变产生，还是由强烈的适应性自然选择驱动。CAFE 5 基于连续时间马尔可夫链生灭模型，能够将基因家族计数矩阵投射到具有绝对地质年代的超度量树上，在考虑基因组组装注释误差与家族间速率异质性的前提下，利用极大似然比检验（LRT）筛选出在特定植物谱系中显著加速扩增或缩减的候选特化基因家族。

---

## 核心算法数学原理与推导

CAFE 5 的概率演化框架基于以下四大数学支柱：

### 1. 连续时间马尔可夫生灭过程

设基因家族在初始祖先节点（时间 $t=0$）的拷贝数为 $s$，经过演化分支长度 $t$ 后，拷贝数变为 $c$ 的条件转移概率满足解析解：

$$P(X_t = c \mid X_0 = s) = \sum_{j=0}^{\min(s,c)} \binom{s}{j} \binom{s+c-j-1}{s-1} \alpha^{s-j} \beta^{c-j} (1-\alpha-\beta)^j$$

在系统处于稳态（出生率 $\lambda$ 等于死亡率 $\mu$）的假设下，转移参数定义为：

$$\alpha = \beta = \frac{\lambda t}{1 + \lambda t}$$

### 2. 伽马速率异质性模型（Gamma Rate Heterogeneity）

植物基因组中，看家基因（如核糖体蛋白）极度保守，而免疫抗病（NBS-LRR）及次生代谢基因演化极其剧烈。CAFE 5 引入**离散 Gamma 分布**（参数 `-k`，通常取 $k=4$）拟合演化速率 $\lambda$：

$$f(\lambda; k, \theta) = \frac{\lambda^{k-1} e^{-\lambda/\theta}}{\theta^k \Gamma(k)}$$

全树每个家族被赋予属于各速率等级的概率，避免了单一生灭率模型将高变适应性家族误判为模型异常值的缺陷。

### 3. 组装注释误差控制模型（Error Model）

针对植物基因组组装缺口导致基因假性丢失的问题，CAFE 5 引入误差概率转移矩阵 $\epsilon_{ij} = P(Obs=j \mid True=i)$。通过参数 `-e` 先验拟合测序质量误差，在后续状态转移计算中自动解卷积修正，根除由于组装质量差异引起的假阳性收缩。

### 4. 假设检验与 Viterbi 算法祖先重构

- **似然比检验（LRT）**：计算备择模型与零模型的对数似然差 $\Delta = 2(\ln L_1 - \ln L_0) \sim \chi^2(df)$，评估目标分支上的扩张/收缩是否达到统计学显著水平（$p < 0.05$）；
- **Viterbi 算法**：利用动态规划逆向回溯，重构出超度量物种树上每一个内部祖先节点的具体基因家族规模整数值，明确指明扩张或收缩发生的确切历史节点。

---

## 输入文件规范与生产环境实操

### 1. 计数表格式 `gene_counts.tsv`
制表符分隔，第一列为 `Desc`（家族描述，可为短横线 `-`），第二列为 `Family ID`（如 Orthogroup ID），后续各列为物种名及其整数拷贝数：
```text
Desc	FamilyID	Arabidopsis_thaliana	Oryza_sativa	Zea_mays
-	OG0000001	12	48	22
-	OG0000002	5	4	6
```

### 2. 超度量树格式 `species_tree.nwk`
必须为**超度量树**（所有叶节点到根的距离严格相等），时间单位推荐为百万年（Ma），分支长度必须为绝对时间（例如 `((A:15,B:15):25,C:40);`）。

### 3. 生产环境标准两步运行流程

```bash
# 步骤 1：极大似然估计测序组装误差模型 (-e)
cafe5 -i gene_counts_filtered.tsv -t species_tree.nwk -e -o error_estimate/

# 步骤 2：加载误差模型并启用 4 类 Gamma 速率异质性运行正式推断
cafe5 \
  -i gene_counts_filtered.tsv \
  -t species_tree.nwk \
  -e error_estimate/Base_error_model.txt \
  -k 4 \
  -c 16 \
  -p \
  -o cafe5_gamma_results/
```

| 核心参数 | 推荐设置 | 说明与植物科研注意事项 |
| :--- | :--- | :--- |
| `-i <file>` | `gene_counts.tsv` | 基因家族计数表文件；建议预先过滤单物种拷贝数 $> 100$ 的异常大簇 |
| `-t <file>` | `species_tree.nwk` | 超度量物种树文件；叶节点名称必须与计数表头完全一一对应 |
| `-k <int>` | 4 | 离散 Gamma 速率类别数（启用后计算多速率模型）；植物基因组强烈推荐启用 |
| `-e <file>` | 加载 `.txt` 误差文件 | 组装注释误差模型；未指定文件时为估计模式，指定文件时为加载模式 |
| `-p` | 开启 | 根部分支采用泊松分布（Poisson distribution）估计先验祖先大小 |
| `-c <int>` | 8 ~ 32 | 多线程加速计算，显著减少 Gamma 模型的数值优化迭代时间 |

---

## 输出结果深度解析

在结果目录中，核心产物包含：

```text
cafe5_gamma_results/
├── Gamma_report.cafe             # 文本格式综合报告 (记录全局似然、λ估计值与显著家族汇总)
├── Gamma_asr.tre                 # 带有祖先节点重构拷贝数的 Newick 树文件
├── Gamma_change.tab              # 各物种与各内部节点相对于其父节点的基因变化差值表 (+扩张 / -收缩)
├── Gamma_branch_probabilities.tab # 各分支上基因家族发生数量变化的统计 p 值表
└── Gamma_family_results.txt      # 各基因家族的全局演化显著性检验汇总表 (含 p-value)
```

通过解析 `Gamma_branch_probabilities.tab` 中 $p < 0.05$ 的记录，可精确定位出哪些抗病、抗旱或次生代谢基因家族在特定驯化品种中经历过爆发式正选择扩张。

---

## 植物应用案例与真实文献证据

1. **山茶属植物茶氨酸与咖啡因代谢家族演化**：
   在茶树（*Camellia sinensis*）与其近缘山茶属物种的比较基因组研究中，作者采用 CAFE 5 加载 Gamma 速率异质性模型（$k=2$），在全基因组 15,000 余个同源家族中鉴定出 328 个显著扩张家族，重点发现参与特异单萜挥发物、儿茶素和茶氨酸合成的甲羟戊酸途径（MVA）酶系在栽培茶树祖先节点发生了剧烈的协同扩张（[Wang et al., *Frontiers in Plant Science*, 2024](https://doi.org/10.3389/fpls.2024.1449006)）。
2. **水稻适应性演化与抗病受体动态**：
   在亚洲栽培稻与野生稻多系比较中，利用 CAFE 5 成功定位出水稻特异性抗病受体激酶（RLK）与富亮氨酸重复序列（NBS-LRR）在籼稻祖先分化节点经历的暴发式扩张，为阐明水稻抗病谱拓展提供了重要演化证据。

---

## 实践排错与质控规范

- **错误 1：程序报错 `Tree is not ultrametric`**
  - *排查原因*：输入的系统发育树各叶节点到根的累计分支长度不严格相等（浮点数微小舍入误差）。
  - *解决方案*：使用 R 语言 `ape::chronos` 或 Python `ete3` 工具执行超度量平滑处理，确保各枝长满足超度量定义。
- **错误 2：Gamma 模型极大似然计算陷入死循环或溢出**
  - *排查原因*：计数表中存在因转座子嵌合导致的极端超大基因家族（如某一物种拷贝数达数百个）。
  - *解决方案*：过滤在任意物种中拷贝数 $> 100$ 的异常簇，此类超大家族需单独进行系统发育树解析。
