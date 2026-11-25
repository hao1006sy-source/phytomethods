---
title: "Population differentiation as a test for selective sweeps"
summary: "提出跨群体复合似然比检验（XP-CLR），利用等位基因频率多位点分化与重组衰减物理模型高精度检测选择清除。"
authors: "Chen H, Patterson N, Reich D"
year: 2010
journal: Genome Research
doi: 10.1101/gr.100545.109
type: method
methodIds: [xpclr]
domainIds: [population-genetics]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

# Population differentiation as a test for selective sweeps: XP-CLR

## 1. 研究背景与算法贡献

在动植物的农业驯化与适应性演化过程中，目标群体（如栽培作物品系）在特定有益农艺性状位点上经历了强烈的定向人工或自然选择，而对照群体（如野生祖先种或未受选择的分支）在对应位点上则主要经历中性演化。传统检测跨群体等位基因频率分化的经典统计量（如单一 SNP 的群体分化指数 $F_{ST}$）存在显著的方法学缺陷：
1. **忽略物理连锁与空间重组衰减**：$F_{ST}$ 针对单个位点独立计算，无法区分单个位点因抽样方差引起的极端随机漂变，与真正因选择搭车（Genetic Hitchhiking）导致全区段数十个连锁标记集体发生的协同频率分化；
2. **假阳性率高且缺乏明确的选择物理模型**：无法整合局部的减数分裂重组率信息，极易在基因组低重组区产生虚假的高分化信号。

哈佛医学院与 Broad 研究所的 Hua Chen（陈华）、Nick Patterson 与 David Reich 在 2010 年推出了著名的 **XP-CLR（Cross-Population Composite Likelihood Ratio）** 算法（发表于 *Genome Research*）。XP-CLR 构建了一套极其严谨的**两群体等位基因频率分化与空间搭车扩散复合似然比检验框架**。该算法显式利用了全基因组遗传重组距离与 Wright-Fisher 漂变转移概率，能够以极高的信噪比精准勾勒出由于正选择而在目标群体中发生多位点频率协同跃迁的选择清除区段，成为全球植物驯化与适应性演化基因挖掘的标杆工具。

---

## 2. 核心数学模型与数据结构

### 2.1 基于随机遗传漂变的中性先验转移分布

设两群体在历史分歧时由一个共同祖先群体分离，中性演化过程中的等位基因频率变化由连续时间的 Wright-Fisher 扩散过程控制：
- 设某 SNP 标记在参考群体（Pop1 / 祖先对照群体）中的等位基因频率为 $p_1$；
- 在中性零假设模型下，该标记在目标受选择群体（Pop2）中的等位基因频率 $p_2$ 遵循以 $p_1$ 为条件、方差正比于群体分化时间 $\omega$ 的正态/Beta 扩散近似转移概率：
  $$p_2 \mid p_1 \sim \mathcal{N}\left(p_1, \omega \cdot p_1 (1 - p_1)\right)$$
  其中扩散参数 $\omega$ 直接度量了两群体之间由于中性历史漂变引起的整体全局分化背景。

### 2.2 选择搭车空间物理模型

假定在候选染色体位置 $x_0$ 处发生了一个选择系数为 $s$ 的正向选择事件：
- 对于位于物理/遗传坐标 $x_i$ 处的相邻测试标记，其与因果选择核心的遗传重组距离为 $d_i$；
- 在受选择群体中，该标记等位基因频率在经历强选择搭车后的条件期望与方差被显式建模为重组率 $r$ 与选择强度 $s$ 的指数衰减函数：
  $$E[p_{2i} \mid p_{1i}, s, x_0] = (1 - c_i) p_{1i} + c_i \cdot 1, \quad c_i = e^{-d_i / s}$$
  距离因果位点越近（$d_i \to 0$），该标记被完全搭车拖拽至固定频率（$c_i \to 1$）的概率越高；而在远离因果核心的区域，频率变化平滑回归至中性随机漂变基线。

### 2.3 复合似然比（CLR）与多重连锁方差校准

在预设大小的滑动物理窗口（通常为 50 kb–100 kb，步长 10 kb）内，XP-CLR 统计窗口内所有 $M$ 个 SNP 标记在选择模型下的对数似然与中性模型对数似然的差值：
$$\text{Raw\_CLR} = 2 \sum_{i=1}^M \left[ \ln P(p_{2i} \mid p_{1i}, \hat{s}, x_0) - \ln P(p_{2i} \mid p_{1i}, s=0) \right]$$

- **连锁方差降权校准**：由于窗口内相邻标记之间存在紧密的连锁不平衡（LD），简单相加会过度高估自由度。XP-CLR 计算标记间的相关系数矩阵，基于有效独立标记数（Effective Number of Markers）对复合似然分值进行严格的经验方差缩放，生成平滑稳健的全局 XP-CLR 分值。

---

## 3. 算法复杂度与计算性能

1. **计算性能与多进程并行**：Python 与 C 混合编写（包括现代基于多线程的 `xpclr` 优化包），全基因组数百万标记的滑动窗口扫描在常规服务器上通常仅需 15–30 分钟。
2. **支持遗传图谱与物理坐标**：支持输入以厘摩根（cM）为单位的高精度遗传重组图谱；若缺乏高密度重组图谱，支持使用固定重组率经验近似（例如植物常规设定 $1\text{ cM} \approx 250\text{ kb}$ 或 $10^{-8}\text{ cM/bp}$）。
3. **输出清晰连续**：原生输出每个滑动窗口中心坐标、包含标记数以及标准化后的 XP-CLR 分值，适于直接绘制全染色体选择扫荡景观图。

---

## 4. 植物基因组学应用场景与科研价值

在国际植物基因组学研究中，XP-CLR 是解析人工驯化印记与环境适应性选择区段最为权威的分析武器：
- **水稻农业驯化关键基因的权威定位**：在亚洲栽培稻（*Oryza sativa*）与普通野生稻（*O. rufipogon*）的大规模群体比较中，XP-CLR 以极其陡峭的显著性峰值精准锁定了控制水稻落粒性消除的因果基因 *sh4*、控制红米转为白米的关键转录因子 *Rc*、决定直立株型的经典基因 *PROG1* 以及控制粒长的 *GS3*；
- **玉米驯化与株型重塑机制**：在玉米与大刍草（Teosinte）比较中，精准定位顶端优势关键基因 *tb1* 与颖壳硬度基因 *tga1*；
- **极端逆境地方品种适应性分化**：比较深根系耐旱品种与浅根系敏感品种，系统挖掘受干旱选择强烈重塑的根系发育转录调控元件。

---

## 5. 输入输出规范与关键参数指南

### 5.1 核心操作流程与命令行执行 (Python / xpclr)
```bash
# 步骤 1: 准备目标群体样本列表 (pop_cultivar.txt) 与对照群体样本列表 (pop_wild.txt)

# 步骤 2: 运行 XP-CLR 全染色体滑动窗口选择扫描
xpclr \
  --out chr01_xpclr_out \
  --format vcf \
  --input plant_population_joint.vcf.gz \
  --samplesA pop_cultivar.txt \
  --samplesB pop_wild.txt \
  --chr chr01 \
  --ld 0.95 \
  --maxsnps 200 \
  --size 50000 \
  --step 10000

# 步骤 3: 提取输出文件中的 XP-CLR 核心列 (chr, grid, pos, xp_clr)
# 针对全基因组分值，通常提取排名前 1% 或 0.5% 阈值的离群窗口作为驯化选择候选区段
```

### 5.2 关键参数说明
- `--size 50000 --step 10000`：滑动窗口物理跨度设为 50 kb，步长为 10 kb，兼顾定位分辨率与窗口内统计稳定性。
- `--ld 0.95`：窗口内高共线性标记去重阈值，剔除成对 $r^2 > 0.95$ 的冗余标记，避免局部重复序列伪造假阳性。
- `--maxsnps 200`：单个窗口内纳入计算的最大 SNP 数量上限，防止高密度测序区域权重过大。

---

## 6. 阅读与复现资源

- **原始研究论文**：[Genome Research 2010 DOI: 10.1101/gr.100545.109](https://doi.org/10.1101/gr.100545.109)
- **PMC 全文**：[PMC2840981](https://pmc.ncbi.nlm.nih.gov/articles/PMC2840981/)
- **PubMed 记录**：[PMID: 20086244](https://pubmed.ncbi.nlm.nih.gov/20086244/)
- **现代开源 Python 工具库**：[hardingnj/xpclr GitHub](https://github.com/hardingnj/xpclr)
- **站内配套专题**：[选择性清除与自然选择检测](../../topics/population-genetics/m05-topic-05/)
- **站内配套专题**：[群体遗传变异与分化统计指标](../../topics/population-genetics/m05-topic-01/)
