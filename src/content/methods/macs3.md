---
title: MACS3
name: MACS3
summary: 面向 ChIP-seq、CUT&Tag 与 ATAC-seq 的模型化峰值检出 (Peak Calling)、广义泊松先验与染色质开放区识别工具。
dataType: BAM / BED 比对文件、对照组 Input / IgG 比对文件
principle: 动态局部双泊松经验检验 (Dynamic Poisson)、片段延伸移动模型 (d-shift)、隐马尔可夫模型 HMM 与宽峰/窄峰双模式
domainIds: [epigenomics-3d-genome]
topicIds: [m07-topic-04, m07-topic-05]
principleIds: [peak-calling]
dataIds: [atac-fragments, chip-seq]
paper: macs-paper
repository: https://github.com/macs3-project/MACS
version: "3.1.0"
status: published
updatedAt: 2026-11-25
---

## 生物学问题与定位

在植物分子生物学与表观基因组学中，**染色质免疫共沉淀测序（ChIP-seq）**、**转座酶可接近染色质测序（ATAC-seq）**以及微量高灵敏度的 **CUT&Tag（Cleavage Under Targets and Tagmentation）**是解析顺式调控元件（CREs）、转录因子结合位点以及组蛋白翻译后修饰（如转录激活修饰 H3K4me3、转录抑制修饰 H3K27me3 和转座子异染色质标记 H3K9me2）的核心基石。

然而，测序读段（reads）沿全染色体的空间分布具有极强的人为与生物学偏差：
1. **染色质断裂与扩增偏差**：局部 GC 含量、核小体密集度导致不同基因组区段的超声打断或 Tn5 插入效率极不均一；
2. **植物庞大重复序列诱发的比对假象**：植物基因组富含 LTR 转座子，大量 reads 错误堆积在假同源区，产生密集的虚假富集峰；
3. **点状尖峰 vs 宽广结构域的二元分化**：转录因子结合通常表现为 200 bp 左右的尖锐窄峰（Narrow peaks），而植物异染色质与表观修饰（如 H3K27me3）则往往呈现跨越数十至数百 kb 的漫长平坦宽广结构域（Broad domains）。

**MACS（Model-based Analysis of ChIP-Seq，最新版本 MACS3）**由哈佛大学陈曾熙公共卫生学院 Tao Liu 与 Xiaole Shirley Liu（刘小乐）教授实验室于 2008 年发表在 *Genome Biology* 上。作为功能表观组学领域的全球金标准，MACS3 引入了经典的**双向读段链移动模型（d-shift）**与**多尺度动态局部泊松背景分布（Dynamic Local Poisson）**，能够自适应消除植物局部染色质微环境的假阳性背景，支持单碱基峰顶（Summits）精确定位与宽峰自适应拼接，是植物非编码调控元件发掘不可或缺的核心工具。

---

## 核心算法数学原理与推导

MACS3 的统计模型基于片段物理延伸还原与局部自适应泊松检验：

### 1. 读段链分离模型与片段长度推导（Bimodal d-Shift Model）

在蛋白质特异结合位点处，真实的 DNA 双链片段被富集捕获。测序仅测定了片段两端的短序列：
- 来自 DNA 正向链（Watson）的 reads 一律富集在真实结合中心的 5' 上游；
- 来自 DNA 反向链（Crick）的 reads 一律富集在真实结合中心的 3' 下游；
- 正反链 reads 密度沿染色体呈现具有固定间距的双峰模式（Bimodal distribution）。

MACS3 在全基因组高质量候选峰上计算正反链富集峰顶的平均空间偏移距离 $d$（即文库真实 DNA 片段长度）：
- 将所有正向链 reads 向 3' 端移动 $d/2$；
- 将所有反向链 reads 向 5' 端移动 $d/2$；
- 双向延伸移动后，来自两端的信号在真实的转录因子结合中心点精准重合叠加，使信号信噪比（SNR）达到理论最大值。

### 2. 动态局部多尺度泊松背景模型（Dynamic $\lambda_{\text{local}}$）

若仅仅使用全基因组平均测序深度常数 $\lambda_{\text{BG}}$ 作为零假设基线，染色质易脆断区和高 GC 启动子区将产生巨量假阳性。MACS3 创新性地引入了四尺度动态局部泊松参数：

$$\lambda_{\text{local}} = \max\left( \lambda_{\text{BG}}, \lambda_{1\text{k}}, \lambda_{5\text{k}}, \lambda_{10\text{k}} \right)$$

其中：
- $\lambda_{\text{BG}}$：全基因组平均背景期望读段数；
- $\lambda_{1\text{k}}, \lambda_{5\text{k}}, \lambda_{10\text{k}}$：分别在候选区域中心周围 $1\text{ kb}, 5\text{ kb}, 10\text{ kb}$ 窗口内计算的读段密度（优先取自对照组 Input/IgG，无对照组时取自样本自身）。

通过保守地选取局部多尺度的最大值作为零假设参数 $\lambda_{\text{local}}$，即使某区域天然存在轻微 reads 富集，模型依然会动态抬高检验阈值，确保检出的峰值严格源自特异性免疫沉淀或转座酶结合。

### 3. 统计显著性与假阳性率（FDR / $q$-value）

在候选峰区域内观测到 $k$ 条延伸堆叠读段，单侧泊松检验的显著性 $p$ 值为：

$$p = P(X \ge k \mid \lambda_{\text{local}}) = \sum_{m=k}^{\infty} \frac{\lambda_{\text{local}}^m e^{-\lambda_{\text{local}}}}{m!}$$

随后通过全基因组多重假设检验，采用 Benjamini-Hochberg 方法将 $p$ 值调整为经验错误发现率（FDR, $q$-value）。输出格式将分值转换为对数形式：$-10 \log_{10}(q\text{-value})$。

### 4. 宽峰模型（Broad Peak Model）

对于植物中的 H3K27me3 或 H3K9me2 修饰，由于修饰在整条基因或转座子全长连续分布，信号呈现宽平形态。MACS3 启用 `--broad` 模式时：
1. 首先以常规阈值（如 $q < 0.05$）寻找显著小核心峰；
2. 再以较宽松的阈值（参数 `--broad-cutoff`，如 $q < 0.1$）寻找外围弱富集区；
3. 将物理距离小于参数 `--max-gap`（默认与延伸长度相当）的小峰与外围弱富集区缝合为连续的宽广表观结构域（Broad domains），真实还原染色质修饰全貌。

---

## 生产环境标准流水线

以下展示对植物转录因子 ChIP-seq（窄峰模式）以及组蛋白抑制修饰 H3K27me3（宽峰模式）运行 MACS3 的标准流程：

```bash
# 步骤 1：准备经过唯一比对 (MAPQ >= 30) 并去除 PCR 重复的 BAM 文件
# 样本包含处理组 (ChIP) 与严格对应的对照组 (Input)

# 步骤 2：转录因子结合位点或 ATAC-seq 染色质开放区 (窄峰 NarrowPeak 模式)
# -c 提供对照组；-g 提供物种有效基因组大小 (如水稻 ~3.7e8, 拟南芥 ~1.2e8)
macs3 callpeak \
  -t chip_target.bam \
  -c chip_input.bam \
  -f BAMPE \
  -g 3.7e8 \
  -n results/rice_tf_narrow \
  -B \
  -q 0.01 \
  --keep-dup all

# 步骤 3：组蛋白标记 (如 H3K27me3/H3K9me2) 宽广结构域 (宽峰 BroadPeak 模式)
# --broad 开启宽峰缝合；--broad-cutoff 设定边界阈值
macs3 callpeak \
  -t h3k27me3_chip.bam \
  -c chip_input.bam \
  -f BAMPE \
  -g 3.7e8 \
  -n results/rice_h3k27me3_broad \
  --broad \
  --broad-cutoff 0.05 \
  -B \
  --keep-dup all

# 步骤 4：ATAC-seq 专有模式 (需进行 Tn5 酶切中心偏移校正: --shift -100 --extsize 200)
macs3 callpeak \
  -t plant_atac_seq.bam \
  -f BAM \
  --shift -100 \
  --extsize 200 \
  --nomodel \
  -g 3.7e8 \
  -n results/rice_atac_peaks \
  -B \
  -q 0.01
```

---

## 核心参数科学解析与植物调优指南

| 参数指令 | 推荐取值 | 物理含义与植物科研注意事项 |
| :--- | :--- | :--- |
| `-g <size>` | 物种特异（见下文） | **可映射有效基因组大小**；严禁照搬人类的 `hs` 或小鼠的 `mm`！必须明确输入植物有效基因组大小（扣除未测序间隙与极端重复区）。 |
| `-f BAMPE` | 双端测序首选 | **双端比对格式**；直接从双端 reads 对读取真实 DNA 片段长度，跳过建模步，准确度最高。 |
| `-q <float>` | `0.01` ~ `0.05` | **FDR 显著性截断值**；默认 0.05；转录因子结合位点推荐使用更为严格的 0.01 抑制假阳性。 |
| `--broad` | 组蛋白修饰必选 | **宽峰模式开关**；分析 H3K27me3, H3K9me2, H3K36me3 时必须开启，否则峰值会被错误切碎为数千个微小碎片。 |
| `--shift -100 --extsize 200` | ATAC-seq 专用 | **Tn5 剪切位点中心化**；Tn5 转座酶结合在开放区中心，设置该参数使信号精确聚焦在核小体自由区（NFR）中心。 |

---

## 植物基因组特有挑战与避坑指南

### 1. 植物有效基因组大小参数 `-g` 的准确设定
- **错误警示**：MACS3 默认提供了 `hs` (人类 2.7e9)、`mm` (小鼠 1.87e9)、`dm` (果蝇 1.2e8) 与 `ce` (线虫 9e7)。很多研究人员漏设此参数或误用 `hs`，导致背景泊松期望 $\lambda_{\text{BG}}$ 被极度稀释拉低数倍，输出数万个充满假阳性的垃圾峰！
- **常见植物有效大小推荐取值**：
  - 拟南芥（*Arabidopsis thaliana*）：`-g 1.2e8`（约 120 Mb）；
  - 水稻（*Oryza sativa*）：`-g 3.7e8`（约 370 Mb）；
  - 玉米（*Zea mays*）：`-g 2.1e9`（约 2.1 Gb）；
  - 番茄（*Solanum lycopersicum*）：`-g 7.5e8`（约 750 Mb）。

### 2. 植物对照组 Input DNA 的绝对必需性
- 植物基因组富含高拷贝转座子（高达 70%~85%）与非特异性扩增热点。
- **严重后果**：若缺乏 Input 对照组，仅依靠自身样本建模（Mock control），MACS3 无法区分一个富集峰究竟是由转录因子特异结合引起，还是仅仅因为该区域在植物组织裂解中极易断裂被过度测序！
- **避坑准则**：高质量植物 ChIP-seq 必须配套同批次、同组织的 Input 测序文库，作为局部背景消减的坚实基准。

---

## 植物应用案例与真实文献证据

1. **拟南芥全基因组染色质可及性 ATAC-seq 与顺式调控元件解析**：
   在植物表观顺式调控图谱绘制中（Maher et al., *Nature*, 2018），研究团队利用 ATAC-seq 分析了拟南芥不同组织器官的染色质开放景观。通过采用 MACS3 的 Tn5 偏移模型（`--shift -100 --extsize 200`）与严格的 FDR 截断（$q < 0.01$），成功鉴定出 30,000 余个高置信度核心染色质可及区（Chromatin Accessible Regions, CARs），精确定位了控制植物分生组织分化与环境应答的关键顺式作用转录因子结合基序（[Maher et al., *Nature*, 2018](https://doi.org/10.1038/s41586-018-0579-3)）。

---

## 实践排错与质控规范

- **错误 1：程序报 `ValueError: Effective genome size cannot be larger than total genome size`**
  - *排查原因*：参数 `-g` 填入的数值大于 BAM 文件表头所声明的染色体物理总长度。
  - *解决方案*：核实参考基因组物理大小，有效大小通常设定为全基因组物理长度的 75%~85%。
- **错误 2：生成的 `narrowPeak` 文件中完全没有记录（0 peaks）**
  - *排查原因*：BAM 文件过滤过严（如把所有比对 reads 全部滤空），或者设定的 `-q` 阈值过于极端（如 `1e-20`）。
  - *解决方案*：使用 `samtools view -c` 复核 BAM 文件有效 reads 数（建议至少包含 1,000 万条高质量唯一比对 reads）；将 `-q` 恢复为标准 `0.05`。
