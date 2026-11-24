---
title: ODGI
name: ODGI
summary: 高性能图泛基因组处理与多尺度分析套件，提供图格式转换、拓扑统计、路径降维排序及一维全景平铺可视化。
dataType: GFAv1 / GFA1.1 变异图；ODGI 紧凑二进制图 (.og)
principle: 动态紧凑图内存模型、一维空间填充拓扑排序与多单倍型路径无偏投影
domainIds: [pangenomics-structural-variation]
topicIds: [m03-topic-06, m03-topic-07]
principleIds: [graph-genomics]
dataIds: [graph]
paper: odgi-paper
repository: https://github.com/pangenome/odgi
status: published
updatedAt: 2026-11-25
---

## 方法定位与核心价值

当使用 Minigraph-Cactus 或 PGGB 完成全基因组图构建后，生成的标准 GFA 文件往往达到数十至数百吉字节（GB），且节点在图中的物理编号是随机分散的。传统的文本处理工具无法直接对包含复杂环状与分支拓扑的网络进行快速查询、区间切片或宏观可视化。

**ODGI（Optimized Dynamic Genome/Graph Implementation）**由 Guarracino 等人开发（Guarracino et al., *Bioinformatics*, 2022），是现代图泛基因组学不可或缺的中枢工具套件。它的核心定位是：**通过高度优化的动态平铺数组与紧凑差分内存模型，将庞大的序列图转化为极低内存占用的 `.og` 文件，并提供极其丰富的图代数统计、空间拓扑排序、目标区间切片与一维全局平铺可视化功能**。

---

## 数据模型与典型操作

ODGI 的底层架构专为高效支持具有成百上千个单倍型穿行的复杂序列图而设计：
1. **紧凑动态图模型**：节点序列、有向边连接与样本单倍型遍历步骤被编码在连续的一维平铺整数向量中，支持高并发多线程随机访问与局部编辑；
2. **拓扑排序优化（Sorting & Layout）**：为了消除由于复杂倒位或重排引起的视觉与计算错乱，ODGI 实现了多种前沿的降维算法（一维主成分分析 1D-PVI、一维 Hilbert 空间填充曲线、基于随机梯度下降 SGD 的路径流形投影），使拓扑上相邻的节点在物理内存与输出图形中尽可能连续排列。

---

## 核心子命令与实操规范

ODGI 提供了模块化、高度管道化的命令行工具集，标准工作流如下：

```
GFA 图文件 ──► odgi build ──► 紧凑图 (.og) ──► odgi sort ──► 排序图 (.sorted.og)
                                                      │
         ┌────────────────────────────────────────────┼────────────────────────────────────────────┐
         ▼                                            ▼                                            ▼
   【odgi stats】                              【odgi viz】                                 【odgi extract】
   全图节点/边/长度与路径统计                   高分辨率一维平铺可视化图像                   精准切取目标基因座局部子图
```

### 1. 常用命令模板

```bash
# 1. 导入 GFA 构建紧凑二进制图
odgi build -g plant_pangenome.gfa -o plant_pangenome.og -t 16

# 2. 全图拓扑与多单倍型流形排序（极关键步骤）
odgi sort -i plant_pangenome.og -o plant_pangenome.sorted.og -p Ygs -t 16

# 3. 生成全基因组一维无偏平铺图像
odgi viz \
  -i plant_pangenome.sorted.og \
  -o pangenome_overview.png \
  -x 3000 \
  -y 50 \
  -R \
  -b

# 4. 统计图的拓扑指标（总节点数、总边数、各单倍型路径覆盖）
odgi stats -i plant_pangenome.sorted.og -S -l

# 5. 切取感兴趣的抗病候选基因局部子图
odgi extract \
  -i plant_pangenome.sorted.og \
  -r Nipponbare#Chr1:12000000-12050000 \
  -o candidate_locus.og
odgi view -i candidate_locus.og -g > candidate_locus.gfa
```

**关键参数解析**：
- `odgi sort -p Ygs`：采用两阶段随机梯度下降（SGD）算法，优化全样本单倍型在图上的线性流形排列，最小化长距离跳跃；
- `odgi viz -R`：将反向互补链穿越（代表染色体大片段倒位）的单倍型路径以反差强烈的对比色着色，使全物种倒位事件一览无余；
- `odgi stats -S`：输出结构变异图统计指标（包含节点度分布与路径连通性）。

---

## 植物应用案例

- **高粱 33 基因组泛基因组全景解析（Nature 2026 / GigaScience 2024）**：
  Morris 等人在对包含 33 份高质量高粱染色体组装的图泛基因组进行质控与分析时，全程深度调用 **ODGI v0.9.0**。研究团队首先利用 `odgi sort` 与 `odgi stats` 系统评估了全基因组 10 条染色体上非参考图节点序列的分布；随后利用 `odgi viz` 精准绘制了着丝粒与重组抑制区的全景单倍型拓扑；最后利用 `odgi extract` 截取了控制抗鸟食性单宁合成的关键 *dhurrin* 基因簇，无缝对接 SequenceTubeMap 进行单倍型流线展示。[Morris et al., 2026](https://doi.org/10.1093/gigascience/giaf121)。
- **野生稻抗性位点挖掘**：利用 ODGI 路径深度矩阵（`odgi paths`），成功筛选出在栽培稻中完全丢失、但在野生稻单倍型中高度保守的超长非参考节点。

---

## 软件版本与结果边界

- 官方 GitHub 仓库：[pangenome/odgi](https://github.com/pangenome/odgi)
- 奠基方法论文：[Guarracino et al., *Bioinformatics*, 2022](https://doi.org/10.1093/bioinformatics/btac308)
- 关联方法：[Minigraph-Cactus](../../methods/minigraph-cactus/)、[vg](../../methods/vg/)；
- 关联专题：[图上的序列比对与变异分型](../../topics/pangenomics-structural-variation/m03-topic-06/)、[泛基因组可视化与植物研究应用](../../topics/pangenomics-structural-variation/m03-topic-07/)。
