---
title: SMC++
name: SMC++
summary: 结合区分单倍型局部共祖与大规模未定相样本条件频率谱 (CSFS) 的全基因组群体历史与分化时间推断软件。
dataType: 双等位二倍体 VCF (支持未定相大样本与已定相区分样本)、BED 格式掩蔽区 mask
principle: 区分谱系顺序共祖模型、条件位点频率谱 (CSFS)、样条正则化与清洁分裂模型
domainIds: [population-genetics]
topicIds: [m05-topic-06]
principleIds: [sequentially-markovian-coalescent, conditional-site-frequency-spectrum]
dataIds: [variant-data, callable-region-mask]
paper: smcpp-paper
repository: https://github.com/popgenmethods/smcpp
status: published
updatedAt: 2026-11-25
---

## 生物学问题与定位

在植物群体历史重建中，研究者常常陷入两难境地：
1. PSMC 仅能使用 1 个个体，对近代（距今几千年至几万年）的群体瓶颈几乎没有分辨率；
2. MSMC 与 MSMC2 虽然大幅提升了近代分辨率，但**严格依赖高质量的全染色体物理定相（Phasing）**。然而在大多数植物项目中，群体样本仅测序了二倍体短 reads，定相开关错误（Switch errors）极易在近代引入虚假的重组断点。此外，面对数百个未定相测序个体，传统的 SMC 模型无法有效吸收全群体的等位基因频率信息。

**SMC++** 由加州大学伯克利分校 Jonathan Terhorst、Jack Kamm 和 Yun S. Song 于 2017 年发表在 *Nature Genetics* 上。该方法提出了突破性的混合理论框架：**仅需指定 1~2 个高质量二倍体样本作为“区分谱系（Distinguished lineage）”提供沿染色体的局部重组与连锁信息，其余数十乃至上百个群体样本完全无需定相，直接作为未定相样本提供条件位点频率谱（Conditional Site Frequency Spectrum, CSFS）**！

这种兼顾局部连锁与全群体频率谱的设计，不仅免除了大样本复杂物理定相的苛刻约束，而且将群体历史规模推断的时间分辨率无缝推向了全新世农业驯化与近现代瓶颈（距今数百至数千年以内）；同时引入连续样条正则化（Spline regularization），彻底避免了阶梯状离散化引入的人工突变伪影。

---

## 核心算法数学原理与推导

SMC++ 的数学推导建立在溯祖理论、条件频率谱与三次样条惩罚优化之上：

### 1. 区分谱系与条件位点频率谱（CSFS）联合似然

设群体包含 $n$ 个未定相单倍型样本，以及 1 个指定的二倍体区分样本（包含 2 条同源单倍型，记为区分谱系 $D$）。在基因组任意物理坐标处，区分谱系两条同源链的局部最近共同祖先时间记为隐状态连续变量 $T \in (0, \infty)$。

若在已知 $T = t$ 的条件下发生中性突变，设其余 $n$ 个未定相单倍型中携带该衍生突变的个体拷贝数为随机变量 $C \in \{0, 1, \dots, n\}$。根据多谱系溯祖理论，条件频率谱的概率质量函数 $P(C = c \mid T = t)$ 可以通过将主谱系投射到包含 $n+2$ 条谱系的溯祖树上解析求得：

$$P(C = c \mid T = t) = \sum_{k=2}^{n+2} P(C = c \mid k \text{ lineages}) \cdot P(k \text{ lineages at time } t)$$

该公式巧妙地将两谱系的时空共祖过程与全群体的等位基因频率联合起来。当时间 $t$ 极近时，$C$ 的概率质量显著偏向低频突变（单例或双例突变）；当 $t$ 极深远时，$C$ 偏向高频变异。通过联合优化区分谱系的局部 HMM 状态与外围大样本的突变频数，SMC++ 极大地增强了对近期与远古群体的双重约束。

### 2. 连续人口规模的对数三次样条正则化

传统的 PSMC/MSMC 采用离散阶梯状常数建模 $N_e(t)$，台阶边缘具有突变人为痕迹。SMC++ 将有效群体大小函数参数化为连续的对数三次样条曲线：

$$\eta(t) = \ln N_e(t)$$

目标函数为全基因组复合对数似然与样条二阶导数弯曲度惩罚项的凸组合：

$$\max_{\eta} \left[ \sum_{\text{contigs}} \ln P(\mathbf{O} \mid \eta) - \lambda \int_{t_{\min}}^{t_{\max}} \left( \eta''(t) \right)^2 dt \right]$$

- 惩罚项 $\lambda \int (\eta''(t))^2 dt$ 衡量曲线的整体粗糙度与非物理振荡；
- 平滑度超参数 $\lambda$ 可通过交叉验证自动调节；
- 这种连续光滑先验使得推断出的人口规模轨迹平滑自然，彻底杜绝了模型在过拟合时出现的锯齿状波动。

### 3. 清洁分裂模型（Clean Split Model）

SMC++ 提供专用的 `split` 模块，用于推断两个植物群体之间的分化隔离时间 $T_{\text{split}}$：
- **模型假设**：两群体在 $t > T_{\text{split}}$ 的远古时代为同一个完全混合的祖先群体；在 $T_{\text{split}}$ 发生瞬间分裂；在 $t < T_{\text{split}}$ 的近代各自独立演化，**且分裂后两群体之间不存在后续基因流（Clean Split, No post-split migration）**；
- 软件首先分别独立估计两个群体的群体规模轨迹，随后在联合数据上通过极大似然优化求解单一的分裂时间参数 $T_{\text{split}}$。

---

## 生产环境标准流水线

以下展示将多样本未定相 VCF 转换为 SMC++ 输入格式、拟合群体历史并推断两亚群清洁分裂年代的完整流水线：

```bash
# 步骤 1：利用 smc++ vcf2smc 将每条染色体转换为 .smc.gz 输入文件
# 指定群体 Pop1，其中样本 S1 作为已定相或纯合的区分样本（Distinguished lineage）
# 其余样本（S2, S3, S4...）作为提供未定相 CSFS 的参考样本
smc++ vcf2smc \
  --mask callable_regions_chr01.bed.gz \
  cohort_raw.vcf.gz \
  data/chr01.pop1.smc.gz \
  chr01 \
  Pop1:S1 \
  S2,S3,S4,S5,S6,S7,S8

# 步骤 2：对全基因组所有染色体联合运行群体历史规模拟合
# 指定每代每位点突变率（如水稻 6.5e-9），输出平滑曲线模型 JSON
smc++ estimate \
  --threads 16 \
  --spline cubic \
  --knots 25 \
  --timepoints 100 100000 \
  -o results/pop1_estimate/ \
  6.5e-9 \
  data/chr*.pop1.smc.gz

# 步骤 3：若推断群体 1 与群体 2 的分化时间，准备两群体的联合输入
smc++ vcf2smc \
  --mask callable_regions_chr01.bed.gz \
  cohort_raw.vcf.gz \
  data/chr01.joint.smc.gz \
  chr01 \
  Pop1:S1 \
  Pop2:S9

# 步骤 4：运行清洁分裂模型拟合分化时间
smc++ split \
  --threads 16 \
  -o results/split_estimate/ \
  results/pop1_estimate/model.final.json \
  results/pop2_estimate/model.final.json \
  data/chr*.joint.smc.gz

# 步骤 5：导出矢量图与 CSV 数据表
smc++ plot \
  --g 1 \
  --logy \
  --csv \
  results/pop_history.pdf \
  results/pop1_estimate/model.final.json \
  results/split_estimate/model.final.json
```

---

## 核心参数科学解析与植物调优指南

| 参数指令 | 推荐设置 | 物理含义与植物科研注意事项 |
| :--- | :--- | :--- |
| `mutation_rate` | 必填（如 `6.5e-9`） | **每代每位点自发突变率**；作为 `estimate` 的首个数值参数；对最终种群规模绝对高度与时间横轴起决定性标定作用。 |
| `--knots <int>` | `20` ~ `30` (默认 20) | **样条曲线结点数**；控制时间拟合的精细度。若样本量超 50 个且关注近千年的剧烈驯化波动，可增至 25~30。 |
| `--timepoints <min> <max>` | `100 100000` | **时间拟合边界（单位：世代）**；默认以 100 代至 10 万代为边界。一年生草本作物对应 100 年至 10 万年前。 |
| `--mask` | BED 格式 | **全基因组不可调用区掩蔽**；至关重要！`vcf2smc` 遇到长段无 SNP 区段时，必须通过 mask 区分是“真纯合”还是“缺失未覆盖”。 |
| `--g <float>` | 物种特异值 | **世代年数**；在 `plot` 绘图时用于将世代数转换为日历年（Years Before Present）。草本作物为 1，多年生林木需相应放大。 |

---

## 植物基因组特有挑战与避坑指南

### 1. `vcf2smc` 对参考等位基因与缺失的特殊处理机制
- **机制提示**：SMC++ 的转换工具 `vcf2smc` 默认假定 VCF 中的参考等位基因（REF）即为祖先等位基因（Ancestral allele），并且在解析时会**自动忽略 VCF 中的 QUAL 分值与 FILTER 标记**。
- **避坑准则**：
  1. 输入前必须使用 BCFtools 预先执行严格过滤，彻底剔除低质量变异（如仅保留 `PASS` 位点）；
  2. 若目标植物参考基因组为衍生品种（如高杂交选育栽培种），将其作为祖先等位基因会导致衍生突变频数判断倒置。强烈建议使用远缘野生近缘种的比对结果，通过 `bcftools +setGT` 将真正祖先等位基因极化后再转换。

### 2. 植物渐渗杂交与清洁分裂模型（Clean Split）的冲突
- **原理警示**：`smc++ split` 的核心假设是“分裂后无任何后续基因流”。然而，在大部分植物驯化体系中（如亚洲栽培稻籼稻与粳稻、栽培玉米与大刍草），物种在地理分化后仍然伴随着数千年的人工引种杂交与渐渗。
- **严重后果**：若在存在强烈不对称渐渗的植物亚群中强行使用 `smc++ split`，模型会将持续交流的年轻等位基因误判为分化极近，导致推断出的分化时间严重年轻化。
- **对策**：在解释 `split` 结果前，必须先用 $D$-statistic（ABBA-BABA 检验）或 TreeMix 检验是否存在显著的跨群基因渗入；若存在显著基因流，需在文章中明确标注该分化时间为无迁移假设下的“保守下限值”。

---

## 植物应用案例与真实文献证据

1. **非洲栽培稻近期有效种群规模与驯化瓶颈推断**：
   在非洲栽培稻群体历史研究中（Cubry et al., *Nature Plants*, 2018），研究人员针对短 reads 测序难以大规模全相的难点，采用 SMC++ 联合分析了 79 份高覆盖伪二倍体材料，以 5 个核心区分谱系结合全群体条件频率谱，设定突变率 $6.5 \times 10^{-9}$、上限 10 万代与 25 个样条结点，成功捕获了非洲栽培稻在距今约 3,000~4,000 年前驯化扩张早期的连续历史轨迹，与古代考古遗址炭化稻粒证据高度吻合（[Cubry et al., *Nature Plants*, 2018](https://doi.org/10.1038/s41477-018-0245-7)）。

---

## 实践排错与质控规范

- **错误 1：`smc++ estimate` 报错 `LinAlgError: Matrix is singular`**
  - *排查原因*：输入的某些染色体几乎全被 mask 掩蔽，或者变异位点密度极低，导致某些样条区间内的有效位点数为零，协方差矩阵奇异。
  - *解决方案*：剔除长度较短的未组装 contigs/scaffolds，仅保留组装质量高的大染色体（如 Chr01~Chr12）进行全基因组联合估计。
- **错误 2：`plot` 输出图像在近近代出现极其突兀的垂直峭壁**
  - *排查原因*：`vcf2smc` 未提供掩蔽 BED 文件，导致参考基因组上的长段测序缺口（Assembly gaps / Ns）被模型误认为是没有突变的超长纯合单倍型。
  - *解决方案*：制作严格的 `callable_regions.bed`，把全基因组中的缺口与低覆盖区标记为掩蔽状态，重新运行 `vcf2smc`。
