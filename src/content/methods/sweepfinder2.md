---
title: SweepFinder2
name: SweepFinder2
summary: 基于单群体位点频率谱 (SFS) 空间畸变与背景选择校正的全基因组选择性清除复合似然比 (CLR) 扫描软件。
dataType: 染色体 SNP 位点频率谱 (Position, x, n, folded)、经验全基因组中性 SFS、重组率图谱与 B 值矩阵
principle: 空间位点频率谱复合似然比检验 (CLR)、中性经验频谱背景校正与背景选择 (B 值) 解卷积
domainIds: [population-genetics]
topicIds: [m05-topic-05]
principleIds: [site-frequency-spectrum-scan, composite-likelihood-selection]
dataIds: [variant-data]
paper: sweepfinder2-paper
repository: https://github.com/mdegiorgio/SweepFinder2
status: published
updatedAt: 2026-11-25
---

## 生物学问题与定位

在植物群体适应性演化与作物品种驯化中，自然选择或人工选择往往在单一群体的基因组上留下鲜明的印记。然而在许多实际研究场景中（例如新挖掘的特异野生群体或独立驯化分支），**科研人员往往缺乏一个完美的未受选择对照群体**，无法执行 XP-EHH 或 XP-CLR 等双群体比较分析。

当一个有利突变发生选择性清除时，伴随其搭便车的连锁位点会导致局部的**等位基因频率谱（Site Frequency Spectrum, SFS）**发生特征性的强烈空间畸变：中间频率多态性急剧亏缺，而极低频新生突变与接近固定的高频衍生等位基因显著过剩。

**SweepFinder2** 由佛罗里达大西洋大学 Michael DeGiorgio 等人于 2016 年发表在 *Bioinformatics* 上。作为经典 SweepFinder（Nielsen et al., 2005）的重大升级版，SweepFinder2 是单群体选择扫描领域的标杆工具。其最大优势在于：**利用全基因组经验背景 SFS 彻底吸收了人口历史波动（如历史上经历的冰期瓶颈与近期种群膨胀）对全局频率谱的影响，并将局部重组率变化与背景选择（Background Selection, BGS）校正矩阵（B-value）纳入统计模型**，成功解决了传统 Tajima's D 等方法极易将人口历史瓶颈和纯化选择误判为正选择清扫的高假阳性缺陷。

---

## 核心算法数学原理与推导

SweepFinder2 的统计检验基于空间频率谱复合似然比（Composite Likelihood Ratio, CLR）与背景解卷积模型：

### 1. 经验全基因组中性零假设（$H_0$）

在全基因组范围内，历史有效群体大小波动和全局漂变会塑造整体的等位基因频率分布。SweepFinder2 首先从全基因组中性位点中经验估计背景位点频率谱 $\bar{P}(X = x \mid n)$，其中 $x$ 为衍生等位基因拷贝数，$n$ 为位点有效样本等位基因总数。

在零假设 $H_0$（测试位点邻域不存在正选择清除）下，任意位点 $i$ 的等位基因频率直接服从该经验背景分布：

$$P(X_i = x_i \mid n_i; H_0) = \bar{P}(x_i \mid n_i)$$

通过直接使用经验分布作为零假设基准，SweepFinder2 巧妙规避了假定物种处于严格恒定人口规模的中性平衡假设。

### 2. 选择性清除备择假设（$H_1$）与空间频率畸变

设在测试物理坐标 $y$ 处发生了一个有利等位基因的快速固定事件。该事件以复合选择强度 $\alpha = 2 N_e s$ 驱动。

对于距离测试位点 $y$ 物理距离为 $d_i$、重组率为 $r_i$ 的邻近多态位点 $i$，其在选择清除事件中与受选择位点发生重组脱离的概率由重组参数调控。在备择假设 $H_1$ 下，位点 $i$ 的条件等位基因频率分布发生畸变，表示为中性背景谱与搭便车变换算子的积分卷积：

$$P(X_i = x_i \mid n_i, y, \alpha; H_1) = \sum_{k=1}^{n_i-1} \bar{P}(k \mid n_i) \cdot \Lambda(x_i \mid k, n_i, d_i, r_i, \alpha)$$

其中 $\Lambda$ 为搭便车跃迁矩阵。距离选择中心 $y$ 越近，中频变异丢失越严重，两极化突变（极低频与接近 1.0 的超高频）越富集。

### 3. 复合似然比（CLR）与极大化网格搜索

在染色体测试位置 $y$ 处，复合似然比定义为备择假设下最大似然与零假设似然的比值对数：

$$\text{CLR}(y) = 2 \left[ \max_\alpha \sum_{i=1}^L \ln P(X_i = x_i \mid n_i, y, \alpha; H_1) - \sum_{i=1}^L \ln P(X_i = x_i \mid n_i; H_0) \right]$$

SweepFinder2 沿染色体按预设网格间距（如每 10 kb）遍历测试点 $y$，并在每个网格点通过一维数值优化搜索最佳选择参数 $\hat{\alpha}$。CLR 峰值尖锐处即指示正选择清除的物理中心。

### 4. 背景选择（Background Selection）与 B 值校正

在植物功能区（高密度基因区），对有害突变的持续净化选择（Purifying Selection / Background Selection）同样会压缩局部核苷酸多样性 $\pi$。传统方法极易将低多样性的背景选择冷区误报为正选择扫荡。

SweepFinder2 允许用户输入全基因组 B 值矩阵（$B \in (0, 1]$，量化由于背景选择引起的局部有效群体大小折减比值 $N_e^{\text{local}} = B \cdot N_0$）。软件在计算 $H_0$ 时动态调控预期多样性基线，从而实现将真实适应性正选择从功能区背景选择噪音中精准剥离。

---

## 生产环境标准流水线

以下展示准备单染色体频率文件、全基因组背景 SFS，并执行 10 kb 网格 CLR 扫描的标准生产流水线：

```bash
# 步骤 1：准备输入频率文件（chr01.freq.tsv）
# 格式包含 4 列制表符：position  x (等位基因数)  n (总等位基因数)  folded (0代表极化, 1代表折叠)
# 推荐使用远缘外群（如普通野生稻极化栽培稻）确定祖先状态 (folded=0)

# 步骤 2：从全基因组背景多态位点中提取经验位点频率谱（SFS）
./SweepFinder2 -f genome_background.freq.tsv genome_background.sfs

# 步骤 3：加载经验 SFS 与重组率图谱，以 10 kb 网格步长执行快速全基因组扫描
./SweepFinder2 -lrg 10000 \
  chr01.freq.tsv \
  genome_background.sfs \
  chr01.recombination_map.tsv \
  results/chr01.clr.tsv

# 步骤 4（进阶）：若具备背景选择 B 值矩阵，执行背景选择校正扫描 (-lrbg)
./SweepFinder2 -lrbg 10000 \
  chr01.freq.tsv \
  genome_background.sfs \
  chr01.bvalues.tsv \
  results/chr01.bcorr_clr.tsv

# 步骤 5：在 R 或 Python 中提取全基因组 CLR 前 1% 或 0.5% 经验极值候选窗口
```

---

## 核心参数科学解析与植物调优指南

| 参数指令 | 推荐设置 | 物理含义与植物科研注意事项 |
| :--- | :--- | :--- |
| `-f <in.freq> <out.sfs>` | 必需步骤 | **经验背景 SFS 估计**；必须使用覆盖全基因组的中性标记集合，严禁仅用单条染色体估计背景。 |
| `-lrg <grid_size>` | `5000` ~ `10000` (bp) | **网格步长扫描**；按固定物理间距（如 10 kb）布设测试点；对植物大基因组（玉米/小麦）可设为 20 kb 加速扫描。 |
| `-lr <grid_file>` | 指定测试点文件 | **用户自定义点扫描**；当需要精确定位某些特定候选基因（如抗病受体簇）的启动子区域时采用。 |
| `-lrbg` / `-lb` | 需外部 B 值支持 | **背景选择校正模式**；加载全基因组 B 值矩阵，彻底消除由于密集外显子区有害突变净化引入的假阳性。 |
| `folded = 0 / 1` | 优先推荐 `0` | **频谱折叠标识**；若有可靠外群能准确区分祖先/衍生等位基因，务必设为 `0`；若完全无外群则退化为次要等位基因折叠谱（`1`）。 |

---

## 植物基因组特有挑战与避坑指南

### 1. 外群极化错误（Mispolarization）的严重后果
- **机制提示**：当设置 `folded = 0` 时，模型高度依赖“衍生突变”的准确定义。若由于比对错误或不完全谱系分选（ILS），将真正的祖先等位基因错当成衍生等位基因，一个原本接近固定（$x/n \approx 0.98$）的高频衍生扫荡信号会被彻底颠倒为极低频衍生变异（$x/n \approx 0.02$）。
- **严重后果**：这会导致最强烈的正选择信号被算法系统性漏报！
- **对策**：选取亲缘关系适中的高质量外群（既不能过远导致比对错位，也不能过近导致频繁 ILS）；对无法高置信度极化的位点，应将第四列标记为 `folded = 1`。

### 2. 局部染色体倒位与着丝粒引起的假阳性宽峰
- 植物染色体中常存在数兆碱基（Mb）的染色体大倒位，倒位区内部重组被极度抑制，往往伴随大面积杂合度下降。
- SweepFinder2 在扫过此类倒位区时，会产生数个 Mb 宽度的连续高 CLR“巨型平顶峰”。
- **判读准则**：真实的正选择清除峰应当呈现随距离衰减的陡峭尖峰；对于跨越数个 Mb 的平坦超大 CLR 区域，必须结合染色体结构变异数据与着丝粒物理坐标综合排查。

---

## 植物应用案例与真实文献证据

1. **水稻转座子插入与 SNP 联合选择性清除扫描**：
   在 176 份代表性亚洲水稻种质资源演化研究中（Yan et al., *Plant Communications*, 2022），研究人员为了评估转座子（TE）在植物驯化选择中的贡献，利用 SweepFinder2 对全基因组 SNP 与 TE 插入位点执行了高精度 CLR 空间扫描。以全基因组前 1%经验极值作为候选界限，成功定位出多个在栽培水稻中经历强烈人工选择、显著调控株型与穗部形态的关键 TE 插入扫荡位点（[Yan et al., *Plant Communications*, 2022](https://doi.org/10.1016/j.xplc.2021.100270)）。

---

## 实践排错与质控规范

- **错误 1：程序报 `Error: Positions in recombination/B-value file do not match freq file`**
  - *排查原因*：输入的重组率文件或 B 值文件中的位点坐标顺序、染色体编号与 `chr01.freq.tsv` 不完全一一对应。
  - *解决方案*：SweepFinder2 严格要求辅助文件的位点与频率文件在物理坐标上保持严格升序排列且无重复位点。
- **错误 2：输出结果全染色体的 CLR 数值全为 0.000**
  - *排查原因*：`genome_background.sfs` 文件内容为空，或者测试染色体中所有位点的等位基因计数全部为常数（无多态性）。
  - *解决方案*：检查步骤 2 提取 SFS 的日志，确保输入了充足的全基因组多态位点；检查输入频率文件的格式与数值范围。
