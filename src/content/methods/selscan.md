---
title: selscan
name: selscan
summary: 计算全基因组延伸单倍型纯合性 (EHH)、iHS、XP-EHH 与 nSL 等近期正选择扫描统计量的高性能多线程工具。
dataType: 染色体级已定相 VCF、物理/遗传图谱文件 (Map)
principle: 延伸单倍型纯合性 (EHH)、单倍型积分面积比值检验、跨群体单倍型衰减比较与经验正态归一化
domainIds: [population-genetics]
topicIds: [m05-topic-05]
principleIds: [extended-haplotype-homozygosity]
dataIds: [phased-haplotype-data, variant-data]
paper: selscan-paper
repository: https://github.com/szpiech/selscan
status: published
updatedAt: 2026-11-25
---

## 生物学问题与定位

在植物驯化、人工品种选育以及极端逆境（干旱、盐碱、高寒）适应历程中，强烈的正选择（Positive Natural Selection / Artificial Selection）使得控制优势农艺性状的突变位点在极短的时间内迅速富集升频，甚至在群体中达到固定。

由于减数分裂重组事件尚未有充足的时间切断该有利等位基因周围的紧密连锁单倍型，该突变所在的祖先染色体片段会随之被“搭便车（Hitchhiking）”式地整体保留下来，在群体中形成极其漫长、杂合度极低的**高纯合延伸单倍型块（Extended Haplotypes）**。

**selscan** 由加州大学旧金山分校 Zachary Szpiech 和 Ryan Hernandez 于 2014 年发表在 *Molecular Biology and Evolution* 上。该工具是群体基因组学中用于计算全基因组单倍型选择扫描统计量的工业级高性能 C++ 软件集，完整集成了：
1. **iHS（Integrated Haplotype Score）**：用于检测群体内部尚未完全固定、正在进行中的不完全选择性清除（Incomplete selective sweeps）；
2. **XP-EHH（Cross-Population Extended Haplotype Homozygosity）**：用于跨群体对比（如栽培稻 vs 野生稻），检测在目标群体中已趋于固定而在对照群体中仍呈多态性的强烈正选择信号；
3. **nSL（Number of Segregating sites by Length）**：对单倍型延伸长度以变异位点数计数的统计量，特别适用于**缺乏高密度遗传图谱（Genetic map）的非模式植物物种**。

---

## 核心算法数学原理与推导

selscan 的统计学推导建立在延伸单倍型衰减与积分面积比值之上：

### 1. 延伸单倍型纯合性（EHH）定义

设在染色体核心位点 $x_0$ 处存在等位基因 $A$。在群体所有携带等位基因 $A$ 的单倍型集合中，从 $x_0$ 向染色体上游或下游延伸至标记位点 $x$ 处。在此区间 $[x_0, x]$ 内，任意随机抽取的两条携带等位基因 $A$ 的单倍型在所有位点上完全同一（Homozygous）的概率定义为 EHH：

$$\text{EHH}_{x_0}(x) = \sum_{h \in \mathcal{H}} \frac{\binom{n_h}{2}}{\binom{n_A}{2}}$$

其中 $n_A$ 为群体中携带核心等位基因 $A$ 的单倍型总数，$\mathcal{H}$ 为延伸区间内所有观察到的不同单倍型集合，$n_h$ 为具有相同单倍型 $h$ 的染色体条数。随着延伸距离 $|x - x_0|$ 增加，历史重组与新生突变使 $\text{EHH}$ 连续衰减直至趋于 0。

### 2. 积分单倍型纯合性（iHH）

对 EHH 曲线沿染色体上游（Left）和下游（Right）的遗传距离（单位：厘摩 cM）或物理距离进行数值积分，得到积分单倍型纯合性（Integrated Haplotype Homozygosity, iHH）：

$$\text{iHH}_A = \int_{x_{\text{left}}}^{x_{\text{right}}} \text{EHH}_A(x) dx$$

在实际计算中，当 EHH 衰减至经验截断阈值（默认 $\text{EHH} \le 0.05$）时终止积分。受到近期强烈正选择的等位基因，其单倍型衰减极慢，对应的 $\text{iHH}$ 积分面积显著增大。

### 3. 群体内核酸单倍型积分比（iHS）

在同一个群体内部，比较核心位点上的衍生等位基因（Derived, $D$）与祖先等位基因（Ancestral, $A$）的单倍型延伸衰减面积比：

$$\text{unnorm\_iHS} = \ln \left( \frac{\text{iHH}_D}{\text{iHH}_A} \right)$$

若某个突变为近期有利正选择突变，其延伸单倍型长度显著超越具有相同频率的祖先背景等位基因，导致该对数比呈现显著的正偏离或负偏离。

### 4. 跨群体延伸单倍型纯合性（XP-EHH）

XP-EHH 比较目标群体（Population A，如栽培品种）与参照群体（Population B，如野生祖先）在全单倍型水平的延伸衰减差异：

$$\text{unnorm\_XPEHH} = \ln \left( \frac{\text{iHH}_A}{\text{iHH}_B} \right)$$

若某个基因在栽培品种中经历剧烈的驯化选择扫荡，其在群体 A 中的单倍型纯合积分将极其巨大，而在未受选择的野生群体 B 中单倍型因长期重组早已破碎（$\text{iHH}_B$ 很小），导致该位点的原始 XP-EHH 分值极度偏高。

### 5. 经验分布正态归一化（`norm` 模块）

由于等位基因频率会系统性地影响单倍型的自然延伸长度，selscan 配套的 `norm` 程序将全基因组位点按照衍生等位基因频率划分为多个区间（默认 50 个 Bins），在每个频率区间内执行 Z-score 标准化：

$$\text{iHS} = \frac{\text{unnorm\_iHS} - \mu_{\text{bin}}}{\sigma_{\text{bin}}}, \qquad \text{XP-EHH} = \frac{\text{unnorm\_XPEHH} - \mu}{\sigma}$$

标准化后的统计量服从均值为 0、方差为 1 的标准正态分布 $\mathcal{N}(0, 1)$。通常以 $|\text{iHS}| > 2.5$ 或 $\text{XP-EHH} > 2.5$（对应正态分布双侧 $p < 0.01$）作为候选选择位点的显著性截断值。

---

## 生产环境标准流水线

以下展示对水稻栽培群体与野生群体定相 VCF 分别计算 iHS 与 XP-EHH，并执行经验标准化的标准流程：

```bash
# 步骤 1：准备经过 Beagle 5 高质量定相且无缺失的双群体 VCF 及遗传图谱
# 注意：selscan 要求输入 VCF 中不得包含缺失基因型（./.）

# 步骤 2：多线程计算目标栽培群体的单群体选择统计量 iHS
# --vcf 提供已定相变异；--map 提供物理/遗传对应图谱
selscan --ihs \
  --vcf cultivated_phased.vcf \
  --map rice_chr01.map \
  --threads 16 \
  --out results/cultivated_chr01_ihs

# 步骤 3：跨群体对比计算 XP-EHH（目标群 vs 野生对照群）
# 正值表示目标群体经历单倍型延伸选择
selscan --xpehh \
  --vcf cultivated_phased.vcf \
  --vcf-ref wild_phased.vcf \
  --map rice_chr01.map \
  --threads 16 \
  --out results/cult_vs_wild_chr01_xpehh

# 步骤 4：对全基因组所有染色体输出结果执行标准化归一化
# --bins 设定频率分段数，--min-maf 过滤极低频位点
selscan-norm --ihs \
  --files results/cultivated_chr*_ihs.ihs.out \
  --bins 50 \
  --min-maf 0.05 \
  --out results/cultivated_ihs_normalized

selscan-norm --xpehh \
  --files results/cult_vs_wild_chr*_xpehh.xpehh.out \
  --out results/cult_vs_wild_xpehh_normalized
```

---

## 核心参数科学解析与植物调优指南

| 参数指令 | 推荐取值 | 物理含义与植物科研注意事项 |
| :--- | :--- | :--- |
| `--cutoff <float>` | `0.05` (默认) | **EHH 积分终止阈值**；当单倍型纯合性衰减至低于该值时停止继续延伸积分；过高会导致积分不完全，过低易受远端偶然纯合干扰。 |
| `--max-extend <int>` | `200000` (bp) 或更高 | **最大单倍型延伸物理上限**；在强自交植物中，单倍型块可能跨越数个兆碱基（Mb），需适当放宽上限以捕获超长选择扫荡。 |
| `--gap-scale <int>` | `20000` (bp) | **大物理间隙惩罚尺度**；当相邻 SNP 间距过大（如由于重复区无法比对形成的缺口）时，对物理间距进行阻尼缩放，防止积分失真。 |
| `--nsl` | 备用选项 | **无图谱选择扫描**；若目标植物缺乏高质量遗传图谱，强烈推荐使用 `--nsl` 代替 iHS，用变异位点数替代物理/遗传距离。 |
| `--threads <int>` | `8` ~ `32` | **多线程加速**；selscan 将染色体按核心位点分块并行计算，具备近线性的加速比。 |

---

## 植物基因组特有挑战与避坑指南

### 1. 自交植物“超长单倍型纯合溢出”与截断设置
- **机制与风险**：水稻、大豆等高度自交植物由于缺乏频繁的杂合减数分裂，天然有效重组率极低。在全基因组范围内，常常存在连续长达数兆碱基（Mb）的单倍型完全纯合区域。
- **严重后果**：若直接使用人类遗传学默认的延伸距离上限，程序将在遇到长纯合块时频繁撞击边界截断，导致不同区域的积分面积被强制拉平为相同上限，严重压低真实选择峰的统计显著性。
- **调优策略**：自交植物必须适当放宽 `--max-extend` 参数，或在分析前利用已知着丝粒抑制重组区域坐标，将无重组的着丝粒冷区预先排除。

### 2. 非模式植物缺乏精细遗传图谱的解决方案
- **机制难点**：iHS 与 XP-EHH 的标准定义依赖厘摩（cM）为单位的遗传图谱，以平衡全基因组各染色体区段的重组热点与冷点。然而，除水稻、玉米、拟南芥等少数模式作物外，绝大多数园艺林木植物缺乏高密度连锁遗传图谱。
- **科学应对**：直接采用纯物理距离（bp）计算易受到局部重组冷区（低重组导致的天然长单倍型）的假阳性假象干扰。此时，**推荐采用 selscan 的 `--nsl`（Number of Segregating sites by Length）模块**。nSL 以单倍型跨越的多态变异位点数目作为长度单位，不依赖外部遗传图谱即可对重组率异质性具备极强的统计稳健性。

---

## 植物应用案例与真实文献证据

1. **杂草稻去驯化过程中的全基因组选择扫荡解析**：
   在韩国地方杂草稻（Weedy Rice）的起源演化研究中（He et al., *Plant Biotechnology Journal*, 2017），研究团队利用 selscan 分别计算了地方稻与杂草稻群体的全基因组 XP-EHH 与 iHS 统计量，结合前 2.5%经验离群阈值，精确定位出控制落粒性（*sh4*）、休眠性（*Sdr4*）以及芒长（*An-1*）的关键去驯化适应性选择清除信号（[He et al., *Plant Biotechnology Journal*, 2017](https://doi.org/10.1111/pbi.12630)）。

---

## 实践排错与质控规范

- **错误 1：程序报 `Error: Missing data found in VCF` 并退出**
  - *排查原因*：输入的 VCF 中包含未定相或缺失基因型（如 `./.` 或 `0/.`）。selscan 核心算法严格要求每个样本在每个位点具有完整的染色体相位（`0|0`, `0|1`, `1|1`）。
  - *解决方案*：使用 Beagle 5 进行全基因组填补与定相（Imputation & Phasing），确认 VCF 中缺失率严格为零后再输入 selscan。
- **错误 2：XP-EHH 输出结果全为负数**
  - *排查原因*：输入参数中的目标群体与参考群体顺序颠倒。`--vcf` 必须为受选择的目标群体（如栽培种），`--vcf-ref` 为未受该选择的参考群体（如野生种）。
