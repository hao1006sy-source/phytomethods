---
title: MSMC2
name: MSMC2
summary: 基于成对复合似然框架的多单倍型顺序马尔可夫共祖软件，支持大规模样本高分辨率群体历史与群体分化定量分析。
dataType: 多样本 VCF、染色体级相位信息、可调用区域 mask 与 multihetsep
principle: 成对共祖复合似然 (Pairwise Composite Likelihood)、单倍型成对 HMM 联合求解与 RCCR 跨群体分化
domainIds: [population-genetics]
topicIds: [m05-topic-06]
principleIds: [sequentially-markovian-coalescent, coalescent-hidden-markov-model]
dataIds: [variant-data, phased-haplotype-data, callable-region-mask]
paper: msmc2-protocol
repository: https://github.com/stschiff/msmc2
status: published
updatedAt: 2026-11-25
---

## 生物学问题与定位

在植物群体基因组学中，准确量化亚种分化年代、栽培种驯化起源以及近现代有效种群规模（$N_e$）的剧烈收缩，需要同时分析数十个个体的单倍型序列。

初代 MSMC 尽管开创了多单倍型联合共祖分析的先河，但其联合状态转移张量受制于指数级维数灾难，实际最多只能联合分析 8 条单倍型，无法充分释放大规模群体样本的统计效力。

**MSMC2** 是 Stephan Schiffels 等人对 MSMC 算法的核心重构与第二代工业级升级，其理论框架发表于 *Nature*（Malaspinas et al., 2016），官方操作协议于 2020 年系统收录于 *Methods in Molecular Biology*。

MSMC2 的革命性改进在于引入了**成对复合似然框架（Pairwise Composite Likelihood）**。通过对所有单倍型对分别执行二序列 SMC 隐马尔可夫模型并联合累加似然，MSMC2 彻底规避了高维隐状态的计算瓶颈，能够轻松扩展至几十乃至上百条已定相单倍型，在显著降低内存占用的同时，大幅提升了对距今数千年至数十万年间群体有效规模波动与相对跨群体共祖率（RCCR）的定量精度。

---

## 核心算法数学原理与推导

MSMC2 的统计基础建立在复合似然理论与成对共祖率联合估计之上：

### 1. 成对复合似然（Pairwise Composite Likelihood）数学构建

设分析样本包含 $M$ 条已定相单倍型，所有可能的两两配对组合构成集合 $\mathcal{P}$，配对总数为：

$$|\mathcal{P}| = \binom{M}{2} = \frac{M(M - 1)}{2}$$

对于任意特定的单倍型对 $(u, v) \in \mathcal{P}$，其沿基因组的杂合/纯合观测序列记为 $O_{uv}$。由于仅涉及两条序列，两单倍型之间的局部共祖状态完全退化为经典的二序列 SMC 过程，其 HMM 状态转移矩阵与发射概率维度仅为 $K \times K$（$K$ 为时间分段数，通常取 $32 \sim 40$）。

在待估计的全局历史参数 $\boldsymbol{\lambda} = \{\lambda_0, \dots, \lambda_{K-1}\}$（各时间区间的相对有效群体大小倒数）下，MSMC2 将全局复合对数似然函数定义为所有单倍型对似然值的总和：

$$\ln L_{\text{composite}}(\boldsymbol{\lambda}) = \sum_{(u, v) \in \mathcal{P}} \ln P(O_{uv} \mid \boldsymbol{\lambda})$$

### 2. 统计一致性与计算复杂度优势

- **统计一致性（Statistical Consistency）**：尽管不同的单倍型对之间共享部分谱系历史（非严格统计独立），但根据复合似然理论（Lindsay, 1988），复合对数似然的梯度（复合评分函数）关于真实参数的期望严格为零（鞅零均值性质）。因此，极大复合似然估计量（MCLE）在大样本极限下具有相合性与渐近正态性；
- **计算复杂度剧降**：计算复杂度从初代的指数级 $O(M^4)$ 彻底降低为多项式级 $O\left(\binom{M}{2} K^2\right)$。这使得在个人工作站上分析 16、32 乃至更多单倍型成为常态。

### 3. 成对群体分化与相对跨群体共祖率（RCCR）

设群体 1 包含单倍型集合 $\mathcal{H}_1$，群体 2 包含单倍型集合 $\mathcal{H}_2$。MSMC2 能够通过灵活的配对索引参数 `-I`，在完全相同的时间网格下独立计算：

1. **群体 1 内部成对共祖率 $\lambda_{11}(t)$**：仅在配对集 $\mathcal{P}_{11} = \{(u, v) \mid u, v \in \mathcal{H}_1, u < v\}$ 上优化；
2. **群体 2 内部成对共祖率 $\lambda_{22}(t)$**：仅在配对集 $\mathcal{P}_{22} = \{(u, v) \mid u, v \in \mathcal{H}_2, u < v\}$ 上优化；
3. **跨群体成对共祖率 $\lambda_{12}(t)$**：仅在跨群体配对集 $\mathcal{P}_{12} = \{(u, v) \mid u \in \mathcal{H}_1, v \in \mathcal{H}_2\}$ 上优化。

通过辅助工具 `combineCrossCoal.py` 整合三者，计算相对跨群体共祖率：

$$\text{RCCR}(t) = \frac{2 \lambda_{12}(t)}{\lambda_{11}(t) + \lambda_{22}(t)}$$

曲线从 $1.0$（两群体共享基因池、完全混合）连续衰减至 $0.0$（彻底生殖隔离、无基因交流），其衰减斜率直观反映了植物谱系分化的缓慢渐渗或急剧阻断过程。

---

## 生产环境标准流水线

以下展示使用 MSMC2 对两个植物亚群（各包含 2 个二倍体样本，即各 4 条单倍型，总共 8 条单倍型，索引为 0 至 7）进行群体规模历史与跨群体分化分析的标准流程：

```bash
# 步骤 1：准备包含 8 条单倍型的 multihetsep 文件（通过 msmc-tools 生成）

# 步骤 2：推断群体 1 内部历史有效种群规模（单倍型索引 0, 1, 2, 3，全部 6 对组合）
msmc2 -t 16 -p "1*2+25*1+1*2" -I 0,1,2,3 \
  -o pop1_within \
  chr*.multihetsep.txt

# 步骤 3：推断群体 2 内部历史有效种群规模（单倍型索引 4, 5, 6, 7，全部 6 对组合）
msmc2 -t 16 -p "1*2+25*1+1*2" -I 4,5,6,7 \
  -o pop2_within \
  chr*.multihetsep.txt

# 步骤 4：推断群体 1 与群体 2 之间的跨群体成对共祖率（跨群体配对共 16 对）
msmc2 -t 16 -p "1*2+25*1+1*2" \
  -I 0-4,0-5,0-6,0-7,1-4,1-5,1-6,1-7,2-4,2-5,2-6,2-7,3-4,3-5,3-6,3-7 \
  -o pop1_pop2_cross \
  chr*.multihetsep.txt

# 步骤 5：使用官方工具合并三份输出并计算 RCCR 曲线
python3 msmc-tools/combineCrossCoal.py \
  pop1_pop2_cross.final.txt \
  pop1_within.final.txt \
  pop2_within.final.txt > cross_coalescence_combined.txt

# 步骤 6：利用 R 或 Python 依据每代突变率与世代时间绘制 Ne(t) 与 RCCR 曲线
```

---

## 核心参数科学解析与植物调优指南

| 参数指令 | 推荐取值 | 物理含义与植物科研注意事项 |
| :--- | :--- | :--- |
| `-I <indices>` | 明确的索引配对列表 | **单倍型配对索引**；可以是以逗号分隔的单倍型索引集合（如 `0,1,2,3`，自动遍历所有内配对），也可以是显式用短横线连接的特定成对列表（如 `0-4,0-5`）。 |
| `-p <pattern>` | `"1*2+25*1+1*2"` | **时间分段参数化模式**；定义时间轴的离散区间数与相邻区间的参数共享。样本数越多，近代时间分辨率越强，可适当增加近代区间的独立参数数。 |
| `-R` | **MSMC2 中通常不建议开启** | 官方手册明确指出：与初代不同，MSMC2 的复合似然优化算法在未固定重组率时表现更优，通常无需沿用旧版的固定 `-R` 建议。 |
| `-t <int>` | `8` ~ `32` | **多线程并行数**；成对 SMC 计算天然支持按染色体或按配对对高度并行，设置充足线程可大幅缩短耗时。 |

---

## 植物基因组特有挑战与避坑指南

### 1. 参考基因组重复序列掩蔽不充分的巨大系统误差
- 植物基因组普遍富含转座子（高达 70%~85%）。未掩蔽的旁系同源重复区会诱发错配与假变异。
- **实测影响证据**：在杨树基因组的系统评估中（Patil & Vijay, 2021），若未开启严苛的重复序列过滤 mask，MSMC2 估计的远古时期有效群体大小会被人工高估数倍，且会将真实的分化时间虚假推向更深远的历史。
- **对策**：必须严格将 RepeatMasker、TRF（串联重复序列）及短 reads 比对不可唯一比对区（Mappability mask）合并为统一的负向过滤掩蔽 BED。

### 2. 异源多倍体作物的亚基因组混淆
- 异源多倍体植物（如普通小麦 AABBDD、油菜 AACC）中，亚基因组间存在高达 90% 以上的同源性。
- 如果将未区分亚基因组的双二倍体 reads 盲目比对到参考基因组，同源异构位点（Homeologous Exchange）将被全盘误判为杂合 SNP，彻底摧毁 MSMC2 的成对共祖模型。
- **对策**：异源多倍体必须先在高质量单倍型解析参考基因组上完成亚基因组特异性比对（Subgenome-specific read assignment），确认仅在单一亚基因组内提取高置信度定相单倍型后，方可输入 MSMC2。

---

## 植物应用案例与真实文献证据

1. **杨树基因组重复序列遮罩对种群历史推断的敏感性**：
   Patil 与 Vijay（2021）针对毛果杨（*Populus trichocarpa*）及其近缘种的重测序数据，系统运用 MSMC2 评估了参考基因组重复区与可调用掩蔽 mask 对种群规模推断的影响。研究表明，未充分掩蔽的重复序列会在距今 100 万年前的深远时代引入大量伪杂合信号，从而产生虚假的种群暴涨；唯有在严格过滤低复杂度与重复区后，MSMC2 方能还原出真实的第四纪气候响应轨迹（[Patil & Vijay, *Molecular Ecology Resources*, 2021](https://doi.org/10.1111/1755-0998.13340)）。

---

## 实践排错与质控规范

- **错误 1：执行 `combineCrossCoal.py` 报错 `AssertionError: time boundaries do not match`**
  - *排查原因*：在分别运行群体内和跨群体 MSMC2 时，使用了不同的时间分段模式 `-p`，或者染色体输入文件集不一致，导致生成的时间分割点数组不相等。
  - *解决方案*：确保群体 1 内部、群体 2 内部以及跨群体配对运行中，**`-p` 参数必须保持完全一致**，且输入的 `multihetsep` 文件完全相同。
- **错误 2：输出曲线在最靠近当代的阶段（$< 10^3$ 年）出现急剧向上翘起飞扬**
  - *排查原因*：输入单倍型数量偏少（如仅有 2~4 条），且第一个时间区间未进行参数绑定（自由度过高）。
  - *解决方案*：在 `-p` 参数的第一个区间强制使用绑定（如 `1*2`），或者纳入更多（8~16 条）高精度长读段定相单倍型以增强近代分辨率。
