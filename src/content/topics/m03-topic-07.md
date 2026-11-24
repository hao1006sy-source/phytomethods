---
title: 泛基因组可视化与植物研究应用
summary: 系统解析从宏观染色体共线性、群体 PAV 热图到 ODGI 一维平铺图及 SequenceTubeMap 局部管状流线的植物泛基因组多尺度可视化方法体系。
domain: pangenomics-structural-variation
methods: [odgi]
status: published
updatedAt: 2026-11-25
---

## 核心科学问题与可视化维度

泛基因组不仅在底层数据结构上超越了线性坐标系，在科研结果沟通与视觉传达上也彻底颠覆了传统的基因组浏览器（如 IGV、JBrowse）展示模式。一个包含数十甚至上百个植物个体的高保真泛基因组，融合了全长核苷酸序列、复杂的非共线性重排、单倍型穿行路径以及多尺度的存在缺失多态性。

如果仅依赖单一维度的图形表示，极易陷入两难困境：
- **宏观全基因组维度**：若直接绘制庞大的拓扑网络图，数以亿计的节点和边会纠缠成无法解读的“毛线球（Hairball）”；
- **微观单碱基维度**：若仅展示局部气泡细节，研究人员又会丢失染色体宏观共线性与群体频率的全局视野。

因此，现代植物泛基因组学构建了“**宏观共线点图 $\to$ 群体 PAV 矩阵 $\to$ ODGI 一维平铺图 $\to$ SequenceTubeMap 局部管状拓扑**”的四级多尺度可视化技术体系。

---

## 四大多尺度可视化模型与工具链

```
                 ┌──────────────────────────────────────────┐
                 │       植物泛基因组多尺度可视化金字塔       │
                 └────────────────────┬─────────────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         ▼                            ▼                            ▼
【层级 1: 全染色体共线点阵图】  【层级 2: 群体 PAV 聚类热图】   【层级 3: ODGI 一维全图平铺】
 D-GENIES / Dotprep            ComplexHeatmap / pheatmap     ODGI viz (Hilbert 排序)
 宏观揭示大片段倒位与易位      直观呈现核心/可变基因演化树   全样本单倍型在全图节点的矩阵映射
         │                            │                            │
         └────────────────────────────┼────────────────────────────┘
                                      ▼
                        【层级 4: 局部管状地铁线图】
                         SequenceTubeMap (地铁线流线)
                         单碱基/转录本尺度穿行变异气泡
```

### 1. 宏观染色体共线性点阵图（Dotplots）
- **核心工具**：D-GENIES、Dotprep、MUMmer `mummerplot`；
- **视觉语言**：以参考基因组坐标为 X 轴，查询基因组坐标为 Y 轴。正斜率（对角线向上）线段代表同向共线性区块（SYN）；负斜率（垂直对角线向下）线段直观揭示**反向互补的大片段染色体倒位（INV）**；偏离主对角线的独立水平/垂直位移线段代表同染色体或跨染色体**易位（TRANS）**；
- **植物诊断价值**：在水稻籼粳对比、玉米自交系比较中，能够一眼识别导致减数分裂重组抑制的数兆碱基（Mb）级古老倒位。

### 2. 群体基因存在缺失（PAV）系统发育共聚热图
- **核心工具**：ComplexHeatmap（R 语言包）、Python Seaborn；
- **视觉语言**：行代表成千上万个非冗余基因家族（Orthogroups），列代表群体测序样本。单元格以离散二值着色（深色代表 Presence，灰色/浅色代表 Absence，特定标记表示缺失数据）。左侧结合基于单倍型 SNP 构建的系统发育生命之树（Phylogenetic Tree）进行共聚类；
- **植物诊断价值**：能够清晰呈现哪些可变基因（Dispensable Genes）与特定亚种分化（如籼稻、粳稻、Aus、Basmati）、生态型适应（高海拔耐冷、旱稻耐旱）或野生近缘种渐渗片段发生严密的共分离（Co-segregation）。

### 3. ODGI 一维无偏平铺可视化（1D Graph Linearization）
在图泛基因组规模达到全染色体或全基因组级别时，ODGI（Optimized Dynamic Genome/Graph Implementation）提供了独步全球的全局平铺降维算法：
- **`odgi sort` 空间排序优化**：为了将多维图节点排布在一条一维轴线上而不产生剧烈的视觉跳跃，ODGI 利用**一维 Hilbert 空间填充曲线**或主成分投影（1D-PVI），求解使全图边跨度总长度最小化的最优拓扑排序：
  
  $$\min_{\pi} \sum_{(u, v) \in E} |\pi(u) - \pi(v)|$$

- **`odgi viz` 平铺投影**：
  - **X 轴**：按上述最优排序平铺展开的全部图节点，节点所占像素宽度正比于其核苷酸物理长度；
  - **Y 轴**：垂直堆叠的各个植物单倍型样本路径（Haplotype Paths）；
  - **像素颜色语义**：当某一样本的路径穿过某节点时，填充颜色；若为正向穿越则显示为默认冷色系（如蓝色/灰色），若为**反向互补链穿越则自动转换为暖色系（如红色/橙色）**。若该单倍型在该位点缺失，则呈现为明显的中空缺口（Blank Gap）。这使得全基因组上百个样本在全部染色体上的大片段倒位、PAV 基因簇与非参考插入节点一览无余。

### 4. SequenceTubeMap：局部候选基因变异气泡解析
- **核心工具**：SequenceTubeMap（Beyer et al., *Bioinformatics*, 2019）；
- **视觉语言**：采用类似城市“地铁交通线路图”的优雅流线设计。每个节点绘制为一个水平矩形，各样本的单倍型路径如同一条条并行的彩色地铁轨道穿行其中；
- **植物诊断价值**：当定位到某个关键农艺或抗病候选基因座（如水稻 *qSH1* 落粒位点、抗稻瘟病 *Pita* 基因簇）时，利用 SequenceTubeMap 能够极其直观地向育种学家展示：各个优良品系是走参考分支、走包含插入外显子的分支，还是走截短旁路分支，极大促进了分子标记开发与基因编辑靶点设计。

---

## 常用实战运行命令与工程规范

### 1. 使用 ODGI 进行全染色体图排序与平铺出图

```bash
# 步骤 1：构建拓扑与路径距离最优排序
odgi sort \
  -i plant_chr1.gfa \
  -o plant_chr1.sorted.og \
  -p Ygs \
  -t 16

# 步骤 2：生成高分辨率一维平铺 PNG/SVG 图像
odgi viz \
  -i plant_chr1.sorted.og \
  -o plant_chr1_pangenome_viz.png \
  -x 3000 \
  -y 50 \
  -R \
  -b
```
- `-p Ygs`：优先结合随机梯度下降（SGD）算法对路径穿行连通性进行流形降维拟合；
- `-R`：将反向互补穿越（Inversion）的节点明确以反向对比色着色；
- `-b`：显示节点长度边界比例尺。

### 2. 导出局部目标子图对接 SequenceTubeMap

```bash
# 针对关键抗病基因位点提取以目标节点为中心前后 50 kb 的子图
odgi extract \
  -i plant_chr1.sorted.og \
  -r Nipponbare#Chr1:12500000-12550000 \
  -o candidate_locus.gfa
```
导出的轻量级 `candidate_locus.gfa` 可直接拖拽载入 SequenceTubeMap 交互界面，实时渲染多品系单倍型分支流线。

---

## 植物应用经典案例

- **高粱染色体级图泛基因组（GigaScience 2024 / 2026）**：
  研究人员以 33 个高质量高粱基因组构建 Minigraph-Cactus 变异诱导图，系统运用 **ODGI** 对 10 条染色体进行全景平铺排序，揭示了着丝粒附近高频发生的大片段非共线性重排；随后借助 **SequenceTubeMap** 深度剖析了控制高粱单宁合成与抗鸟取食的 *dhurrin* 代谢生物合成基因簇在野生种与栽培种间的等位分支变异。[Morris et al., 2026](https://doi.org/10.1093/gigascience/giaf121)。
- **野生稻抗性位点挖掘**：利用 ODGI 路径矩阵快速筛选出在栽培稻中完全缺失、但在野生稻单倍型中高度保守的超长图节点，成功克隆出多拷贝抗稻瘟病新基因。

---

## 参考文献与数据来源

1. **Guarracino A, Heumos S, Nahnsen S, et al.** (2022). ODGI: understanding pangenome graphs. *Bioinformatics*, 38(13), 3319–3326. DOI: [10.1093/bioinformatics/btac308](https://doi.org/10.1093/bioinformatics/btac308)
2. **Beyer W, Novak AM, Hickey G, et al.** (2019). Sequence Tube Maps: making pangenomes readable. *Bioinformatics*, 35(21), 4443–4445. DOI: [10.1093/bioinformatics/btz424](https://doi.org/10.1093/bioinformatics/btz424)
3. **Wick RR, Schultz MB, Zobel J, Holt KE.** (2015). Bandage: interactive visualization of de novo genome assemblies. *Bioinformatics*, 31(20), 3350–3352. DOI: [10.1093/bioinformatics/btv383](https://doi.org/10.1093/bioinformatics/btv383)
4. **Cabanettes F, Klopp C.** (2018). D-GENIES: dot plot large genomes in an interactive, efficient and simple way. *PeerJ*, 6, e4958. DOI: [10.7717/peerj.4958](https://doi.org/10.7717/peerj.4958)
