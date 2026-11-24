---
title: MCScanX
name: MCScanX
summary: 基于二维锚点动态规划与基因复制分类算法的跨物种基因组共线性与同线性分析套件。
dataType: 基因坐标 GFF / BLASTP 结果
principle: 二维最长递增路径动态规划与几何分布显著性检验
domainIds: [comparative-genomics]
topicIds: [m04-topic-03, m04-topic-06]
principleIds: [collinearity]
dataIds: [assembly, proteins]
paper: mcscanx-paper
repository: https://github.com/wyp1125/MCScanX
status: published
updatedAt: 2026-11-25
---

## 生物学问题与定位

MCScanX（Multiple Collinearity Scan toolkit X）由佐治亚大学 Yupeng Wang 与 Haibao Tang 等人开发，是植物比较基因组学中用于**识别同源染色体共线性区块（Collinear blocks）与解析基因复制机制分类**的经典工业级分析工具。其核心方法发表于 *Nucleic Acids Research*（2012）。

在植物基因组中，由于远古全基因组多倍化（WGD）、大片段重组与转座子插入，染色体呈现高度复杂的镶嵌重排。MCScanX 创新性地将全基因组同源对映射为离散空间中的锚点，利用动态规划算法在海量散在比对噪声中灵敏提取出保守的线性共线链，并基于锚点的物理分布将全基因组基因分类为五种演化发生模式，是植物祖先核型重构与多倍化深度分析的核心支柱。

---

## 核心算法数学原理与推导

MCScanX 的核心计算分为共线链动态规划搜索与几何分布统计检验：

### 1. 锚点坐标系与动态规划打分方程

设两比较染色体上的同源基因为锚点 $u_i = (x_i, y_i, s_i)$，其中 $x_i, y_i$ 分别为同源基因在染色体上的排序位次（Gene rank / index），$s_i$ 为 BLASTP 匹配得分。算法沿坐标递增方向搜索累积分数最高的最优共线链：

$$S(i) = s_i + \max_{j < i, \, x_j < x_i, \, y_j < y_i} \left[ S(j) - G(j, i) \right]$$

其中 $G(j, i)$ 为由于非共线基因插入或缺失引入的**线性间隙惩罚代价（Gap penalty）**：

$$G(j, i) = g \times \left( |x_i - x_j - 1| + |y_i - y_j - 1| \right)$$

- $g$ 为间隙惩罚系数（默认 $g = -1$）；
- 算法施加最大允许间隙截断（`-m`，默认 25 个基因）：若 $|x_i - x_j| > 25$ 或 $|y_i - y_j| > 25$，则强制中断连续链条。

### 2. 统计显著性评估（P-value）

对于由 $m$ 个锚点构成的候选共线链，算法基于全基因组基因总数背景，采用几何分布计算该多重锚点由随机偶然组合产生的理论期望值：

$$P(\text{Block}) = 2 \times \binom{N_A}{m} \binom{N_B}{m} \left( \frac{K}{N_A N_B} \right)^m$$

仅保留 $E$-value $< 10^{-5}$ 且锚点数 $m \ge 5$（参数 `-s`）的候选块作为统计显著的共线性区块。

---

## 输入文件格式标准与实操流程

MCScanX 采用前缀匹配机制，要求两个同名文件存在于当前工作目录下：

### 1. 坐标文件 `<prefix>.gff`
制表符分隔的 4 列格式，**必须预先按染色体及物理起始坐标升序排列**：
```text
chr01	Os01g0100100	1000	2500
chr01	Os01g0100200	3200	4800
chr01	Os01g0100300	5100	7200
```

### 2. 同源比对文件 `<prefix>.blast`
标准 BLASTP 或 Diamond 导出的 12 列制表符格式（`-outfmt 6`）：
```text
Os01g0100100	Sb01g000100	89.5	350	30	2	1	350	1	350	1e-120	450
```

### 3. 生产环境常用执行命令

```bash
# 1. 运行核心共线性块搜索
MCScanX data/rice_sorghum -s 5 -m 25 -e 1e-5

# 2. 运行基因复制机制分类器 (输出 5 类复制基因列表)
duplicate_gene_classifier data/rice_sorghum

# 3. 绘制全基因组共线性点图
java dot_plotter -g data/rice_sorghum.gff -s data/rice_sorghum.collinearity -c data/dotplot.ctl -o dotplot.png
```

| 核心参数 | 推荐设置 | 功能与调优建议 |
| :--- | :--- | :--- |
| `-s <int>` | 5 （宏观演化推荐 8 ~ 10） | 构成共线块的最小锚点基因数；过小会引入短片段随机伪共线 |
| `-m <int>` | 25 （远缘跨科推荐 15） | 允许相邻两锚点间跳过的最大无关基因数；过大会将转座片段串入 |
| `-b <int>` | 0 (intra), 1 (inter), 2 (both) | 比对模式：0 为物种内部自身比对，1 为两物种间比对，2 为全混合比对 |
| `-e <float>`| 1e-5 | 共线性块统计显著性阈值 |

---

## 基因复制五大机制分类器解析

运行 `duplicate_gene_classifier` 后，输出文件 `<prefix>.gene_type` 将全基因组所有基因分类为：

```text
基因复制类别及演化特征：
1. WGD / Segmental : 锚定在显著共线性块内的基因（多倍化或古多倍化产物）
2. Tandem          : 同一染色体上连续相邻的同源基因（物理间隔 ≤ 1 个基因）
3. Proximal        : 同一染色体上相距较近的同源基因（物理间隔 2 ~ 10 个基因）
4. Transposed      : 基因对中一个位于共线性块，另一个散在非同源区（转座产生）
5. Dispersed       : 无共线性且物理距离极远或位于不同染色体（逆转录转座等）
```

---

## 植物应用案例与真实文献证据

1. **澳洲坚果属（*Macadamia jansenii*）基因组加倍与复制分析**：
   在濒危植物澳洲坚果的染色体级基因组组装中，作者利用 MCScanX 运行全基因组基因分类器，系统解析了 32,244 个编码蛋白的来源：其中 43.8% 属于古 WGD/片段复制，11.2% 属于串联重复，证明串联重复直接驱动了特征单萜与氰苷合成酶系的扩增（[Sharma et al., *GigaScience*, 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC8671617/)）。
2. **真双子叶植物古六倍化（$\gamma$ 事件）的共线性追踪**：
   在利用葡萄基因组重构真双子叶植物祖先核型时，通过 MCScanX 比对葡萄与拟南芥、杨树染色体，清晰展示了著名的 1:3 对应比率，成为被子植物古基因组学的标杆证据。

---

## 实践排错与质控规范

- **错误 1：程序运行极快且输出 0 个共线块**
  - *排查原因*：GFF 文件第二列的基因 ID 与 BLAST 文件第一、二列的 ID 无法精确匹配（如 GFF 使用了转录本后缀 `.1` 而 BLAST 使用了基因名）。
  - *解决方案*：编写脚本核对两文件 ID 交集，确保 $100\%$ 字符串精确吻合。
- **错误 2：共线块碎化严重，连续性差**
  - *排查原因*：输入 GFF 文件未进行物理坐标升序排序。
  - *解决方案*：使用 `sort -k1,1 -k3,3n prefix.gff > prefix.sorted.gff` 重新排序后输入。
