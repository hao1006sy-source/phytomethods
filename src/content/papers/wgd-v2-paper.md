---
title: "wgd v2: a suite of tools to uncover and date ancient polyploidy and whole-genome duplication"
summary: "提出植物与真核生物古多倍化与全基因组复制 (Whole-Genome Duplication, WGD) 一站式分析系统 wgd v2，深度集成全副同源基因组 (Whole-paranome) 与共线性锚点对 (Anchor pairs) 的同义替换率 (Ks) 联合分布拟合、高斯混合模型 (GMM) 爆发峰分解及基于多物种物种树与化石校准的绝对定年算法。"
authors: "Chen H, Zwaenepoel A, Van de Peer Y"
year: 2024
journal: Bioinformatics
doi: 10.1093/bioinformatics/btae272
type: method
methodIds: [wgd]
domainIds: [comparative-genomics]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

## 研究背景与算法贡献

全基因组重复（Whole-Genome Duplication, WGD）或多倍化是驱动真核生物——尤其是绿色植物（Viridiplantae）基因组膨胀、新基因功能产生及物种大爆发的最剧烈演化力量。几乎所有现代被子植物在其祖先演化史上均经历过一次或多次古多倍化事件。分析植物基因组中的重复基因演化时间谱，主要是通过测定成对重复基因的**同义替换率（Synonymous substitution rate, $K_s$）**：
$$K_s \approx 2 \lambda T$$
其中 $\lambda$ 为中性同义突变速率，$T$ 为分化时间。在 $K_s$ 频率分布图上，古老的 WGD 事件会表现为显著的、全基因组协同爆发的高峰（WGD Peaks）。

然而，经典的同义替换率分析面临多重严重的计算与生物学混淆：
- **串联重复与非多倍化背景噪声的干扰**：植物基因组中充斥着局部的串联重复、转座子介导的分散重复，其产生的连续背景噪声（以 $K_s \to 0$ 附近的指数衰减曲线为主）容易完全淹没年代较新的 WGD 信号；
- **全基因副同源集合（Whole-paranome）与共线性锚点（Syntenic Anchors）分离困难**：如果仅统计全部重复基因（Paranome），易受假基因干扰；若仅看共线性对，又可能在重排严重的退化植物中丢失关键证据；
- **多峰分解与绝对定年（Absolute Dating）脱节**：早期脚本工具仅能绘制二维直方图，缺乏基于期望最大化（EM）的高斯混合模型多峰反卷积，更无法直接与化石地质时代结合进行绝对定年。

由比利时根特大学 VIB 演化生物学先驱 Yves Van de Peer 实验室开发的 **wgd v2**，为植物古多倍化研究提供了现代化、全功能、模块化的高性能分析生态系统：
1. **全基因副同源集与共线性锚点双轨并行管道**：原生整合 DIAMOND/MMseqs2 快速聚类、MUSCLE 密码子对齐与 PAML/codeml 高保真 $K_s$ 求解，并无缝衔接 i-ADHoRe / MCScanX 提取染色体共线性对；
2. **BGMM / GMM 贝叶斯混合模型峰形分解**：利用变分贝叶斯与高斯混合模型自动拟合由古老多倍化引入的正态演化成分，精准分离背景本底与多次 WGD 事件；
3. **基于系统发育物种树与化石先验的绝对定年系统（wgd date）**：直接通过跨物种直系同源 $K_s$ 与物种分化时间建立校准曲线，将抽象的 $K_s$ 峰值精确换算为百万年（Ma）地质年代。

---

## 核心数学模型与数据结构

wgd v2 采用由五个高度解耦的子命令构成的流水线架构：

```
                植物全套蛋白质组 + CDS 编码核苷酸序列
                                  │
                                  ▼
      [wgd mcl: 全基因组蛋白质聚类构建副同源家族 (Paranome)]
• 运行 DIAMOND 进行超快速全对全比对
• 运行 MCL 算法聚类为多基因副同源家族
                                  │
                                  ▼
      [wgd ksd: 提取基因对并计算同义替换率 (Ks Distribution)]
• 运行 MAFFT / MUSCLE 生成密码子对齐 (Codon Alignment)
• 调用 PAML codeml (YN00 / ML) 求解每个基因对的精确 Ks 值
                                  │
                                  ▼
      [wgd syn: 提取共线性锚点重复对 (Syntenic Anchor Pairs)]
• 整合染色体物理坐标，筛选落在大型共线性区块内的 WGD 对
                                  │
                                  ▼
      [wgd mix: 高斯混合模型 (GMM) 多峰分解与统计检验]
• 拟合指数衰减背景曲线 (代表连续散在重复产生与丢失)
• 结合 EM 算法反卷积提取 K 个独立的高斯正态分布峰
                                  │
                                  ▼
      [wgd date: 跨物种比较校准与绝对地质年代测定 (Ma)]
• 结合近缘物种分化直系同源 Ks 峰与化石校准时间
                                  │
                                  ▼
        输出 publication-ready 矢量图表与年代推断报表
```

1. **同义替换率（$K_s$）的修正极大似然模型**：
   对于每一对副同源基因，wgd v2 提取对应的同源编码框，调用 PAML 中的 YN00 或最大似然法（ML），在充分校正转换/颠换比 $\kappa$ 与密码子简并位点（Four-fold degenerate sites, 4DTv）频率偏差后计算单核苷酸同义替换率 $K_s$。通常将 $K_s > 2.5 \sim 3.0$ 的过饱和位点自动标记，避免由于替换饱和造成的长枝吸引与人工假峰；
2. **高斯混合模型（Gaussian Mixture Model, GMM）峰拟合算法**：
   观测到的全基因组 $K_s$ 概率密度 $f(x)$ 被建模为指数衰减本底与多个独立正态成分的线性组合：
   $$f(x) = w_0 \lambda e^{-\lambda x} + \sum_{k=1}^K w_k \frac{1}{\sqrt{2\pi \sigma_k^2}} \exp\left( -\frac{(x - \mu_k)^2}{2\sigma_k^2} \right)$$
   其中 $\mu_k$ 即对应历史上发生的第 $k$ 次全基因组复制事件在 $K_s$ 轴上的峰值中心位置。利用贝叶斯信息准则（BIC）自动确定最优的成分数 $K$；
3. **绝对时间跨物种校准转换方程**：
   设待测植物与其近缘外群物种的分化时间为 $T_{\text{div}}$（基于化石校准估算），两物种间直系同源基因对的 $K_s$ 分布峰值为 $K_{s,\text{ortho}}$。若假设该谱系的演化速率稳定，则待测植物内部古多倍化峰 $\mu_{\text{WGD}}$ 对应的绝对历史发生时间为：
   $$T_{\text{WGD}} = T_{\text{div}} \times \frac{\mu_{\text{WGD}}}{K_{s,\text{ortho}}}$$

---

## 算法复杂度与计算性能

| 维度 | 指标与实测表现 | 算法优势与设计机制 |
| :--- | :--- | :--- |
| **计算速度** | 典型被子植物（~3 万基因）全流程约 **30~60 分钟** | 相比 wgd v1 提速 5 倍以上，支持全流程多进程并行 |
| **安装与环境依赖** | 纯 Python 3 原生现代架构，一键通过 Conda 安装 | 彻底淘汰 Python 2 时代的陈旧不兼容依赖 |
| **峰形拟合鲁棒性** | GMM 与核密度估计（KDE）高度自适应收敛 | 成功消除由于直方图组距（Bin size）划分人为引入的假峰 |
| **图表生成美学** | 原生输出符合顶级期刊（Nature / Cell）美学标准的图表 | 支持一键导出高分辨率 PDF / SVG / PNG 格式图表 |

---

## 植物基因组学应用场景与科研价值

1. **新测序植物门类古多倍化历史首次系统鉴定**：
   在海草（*Posidonia oceanica*）、苏铁（*Cycas panzhihuaensis*）及各类园艺植物从头测序中，wgd v2 是证明物种是否存在独立特有古多倍化事件的核心证据链；
2. **区分谱系特有 WGD 与古老共有 WGD**：
   通过将自身 paranome $K_s$ 峰与近缘物种直系同源 $K_s$ 峰并列重叠显示，直观判断多倍化是发生于两物种分歧之前（共有古多倍化，峰在直系同源峰右侧）还是分歧之后（特有新多倍化，峰在直系同源峰左侧）；
3. **结合共线性锚点（Syntenic Anchors）消除假基因噪声**：
   通过 `wgd syn` 仅绘制共线性区域内的基因对，能过滤掉植物中极其庞大的反转录假基因本底，使模糊平坦的 WGD 峰变得清晰尖锐。

---

## 输入输出规范与关键参数指南

### 关键运行步骤

```bash
# 1. 第一步: 构建副同源全基因组同源矩阵与 Ks 估计 (全自动执行 mcl + ksd)
wgd dnd -cds plant_cds.fasta plant_proteins.fasta

# 2. 第二步: 结合 GFF 坐标提取共线性区域内的 Ks 锚点对
wgd syn -f plant_annotation.gff plant_dnd_dir/plant_proteins.fasta.ks.tsv

# 3. 第三步: 高斯混合模型拟合与高质量绘图
wgd mix -n 3 plant_dnd_dir/plant_proteins.fasta.ks.tsv

# 4. 第四步: 结合近缘物种进行绝对定年与多物种直系同源峰重叠对比
wgd ksd -cds species1_cds.fasta,species2_cds.fasta species1.prot,species2.prot
```

- `wgd dnd`：一键式从头挖掘命令（包括比对、MCL 聚类与 codeml 求解）；
- `-cds <file>`：输入的蛋白质编码核苷酸 FASTA 文件（必须与蛋白质序列一一对应）；
- `-n <int>`：指定 GMM 拟合的高斯峰最大成分数量（通常尝试 2~4）；
- `--preserve_raw`：保留用于深入排查的中间密码子对齐与 PAML 原始输出文件。

### 核心产物文件解读

- `*.ks.tsv`：全基因组副同源对的详细数据表（包含基因 1、基因 2、Ka、Ks、同义位点数与比对得分）；
- `*.gmm.pdf`：包含高斯混合模型分解与贝叶斯信息准则（BIC）评价的拟合曲线图；
- `*.syn.ks.tsv`：严格落入染色体共线性区块的黄金 WGD 锚点基因对集合。

---

## 阅读与复现资源

- **论文全文**：[Bioinformatics, 40(5), btae272 (2024)](https://doi.org/10.1093/bioinformatics/btae272)
- **PubMed 记录**：[PMID: 38632086](https://pubmed.ncbi.nlm.nih.gov/38632086/)
- **官方开源代码与文档**：[GitHub - VIB-PSB/wgd](https://github.com/VIB-PSB/wgd) ｜ [wgd v2 官方文档](https://wgdv2.readthedocs.io/)
- **相关算法专题**：[全基因组多倍化分析专题](../../topics/comparative-genomics/m04-topic-04/)
