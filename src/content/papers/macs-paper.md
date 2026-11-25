---
title: "Model-based Analysis of ChIP-Seq (MACS)"
summary: "基于双峰标签位移经验模型与动态局部泊松背景的 ChIP-seq/ATAC-seq 信号富集峰识别算法。"
authors: "Zhang Y, Liu T, Meyer CA, et al."
year: 2008
journal: Genome Biology
doi: 10.1186/gb-2008-9-9-r137
type: method
methodIds: [macs3]
domainIds: [epigenomics-3d-genome]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

# Model-based Analysis of ChIP-Seq (MACS)

## 1. 研究背景与算法贡献

染色质免疫共沉淀测序（ChIP-seq）是定位转录因子（Transcription Factor, TF）全基因组结合位点及绘制特定组蛋白共价修饰全景图的核心实验手段。在测序建库过程中，抗体富集得到的染色质 DNA 双链断片仅测定两端（单端测序常测定 5' 末端 50–150 bp）。因此，比对到正链（+）和负链（-）的 reads 并非落在结合中心，而是分别聚集在真实结合位点的两侧，形成特征性的“双峰（Bimodal Peaks）”分布。

传统富集峰识别算法（Peak Calling）常将全基因组划分为固定大小的窗口，通过均匀 Poisson 分布进行富集检验，存在两大严重缺陷：
1. **忽略双峰距离带来的分辨率损失**：未能精准推断断裂片段长度，导致结合中心定位偏差；
2. **基因组局部异质性假阳性**：染色质开闭状态、拷贝数变异、高 GC 含量偏好及高重复序列导致测序背景深度在全基因组极不均匀，全局固定阈值会造成假阳性爆发。

2008 年，哈佛大学 Yong Zhang、Tao Liu、Clifford A. Meyer 与 Xiaole Shirley Liu 在 *Genome Biology* 上提出了 **MACS**（Model-based Analysis of ChIP-Seq）。MACS 创新性地引入了**双峰测序标签位移模型（Tag-shift Model）**，在不依赖先验片段长度假设的前提下，通过数据自驱动精准估计超声断裂片段长度 $d$，并将正负链 reads 向结合中心位移 $d/2$；同时，MACS 提出了**动态局部泊松分布模型（Dynamic Local Poisson Model）**，通过多尺度邻域背景极大化控制假阳性，确立了全球 ChIP-seq 与开放染色质（ATAC-seq/DNase-seq）富集分析的标准范式。在最新演进的 **MACS3** 中，算法采用 Cython 与隐马尔可夫模型（HMM）全面重构，性能与功能进一步增强。

---

## 2. 核心数学模型与数据结构

### 2.1 双峰标签位移经验模型（Tag-shift Model）

由于测序仪仅测定断裂片段的 5' 末端：
- 正链 reads 的 5' 端集中在结合靶标的上游；
- 负链 reads 的 5' 端集中在结合靶标的下游。

MACS 遍历全基因组，随机抽取数千个具有适度折叠富集度（默认 10–30 倍富集）的高质量独立候选峰，将正链与负链 reads 分离绘制互相关分布：
- 正负链峰值之间的空间距离即为平均超声断裂片段长度 $d$；
- 在模型计算中，MACS 将所有正链 reads 向 3' 端移动 $d/2$，所有负链 reads 向 5' 端移动 $d/2$，使所有比对信号精准聚焦至蛋白质与 DNA 实际结合的物理中心。

### 2.2 动态局部泊松背景参数估计

常规 Poisson 检验假设背景 reads 服从强度为 $\lambda_{BG}$ 的平稳分布。但由于局部染色质致密性与可测序性差异，局部背景起伏剧烈。MACS 定义局部动态泊松参数 $\lambda_{local}$ 为多个尺度的最大值：
$$\lambda_{local} = \max \left( \lambda_{BG}, \lambda_{1k}, \lambda_{5k}, \lambda_{10k} \right)$$

其中：
- $\lambda_{BG}$：全基因组或输入对照组（Input）的整体平均 reads 强度；
- $\lambda_{1k}, \lambda_{5k}, \lambda_{10k}$：以候选峰为中心，在 1 kb、5 kb 和 10 kb 邻域窗口内统计的背景 reads 期望值。

对于窗口内观测到的 reads 计数 $k$，计算单侧泊松检验 $p$ 值：
$$p = P(X \ge k) = \sum_{x=k}^{\infty} \frac{\lambda_{local}^x e^{-\lambda_{local}}}{x!}$$

随后通过 Benjamini-Hochberg 过程转换为全局假发现率（False Discovery Rate, FDR / $q$-value）。

---

## 3. 算法复杂度与计算性能

1. **高效的滑动窗口与流式扫描**：时间复杂度为 $O(N)$，其中 $N$ 为测序 reads 总数。MACS 借助单遍基因组坐标遍历完成读段聚合与局部背景统计。
2. **C/Cython 底层加速**：MACS3 采用 Cython 重写了核心数据结构，内存峰值控制在 2–4 GB 范围，单一样本千万级比对读段在 8 核心服务器上仅需 5–15 分钟即可完成。
3. **宽峰（Broad Peaks）隐马尔可夫平滑**：支持 `--broad` 模式，在单碱基窄峰识别的基础上，利用局部连锁将临近低显著性边界聚类为平滑的宽结构域，专门适配大范围组蛋白修饰。

---

## 4. 植物基因组学应用场景与科研价值

在植物基因组学研究中，MACS/MACS3 是两类核心实验的金标准分析工具：
- **植物核心转录因子调控靶标发现**：如水稻生长发育调控因子（IPA1、MOC1）、拟南芥开花与光周期关键蛋白（SOC1、FT、PIF4）以及农艺抗逆转录因子（DREB、NAC、MYB）。借助 MACS 的窄峰模式（Narrow Peak），可锁定 200–500 bp 精确的结合峰顶（Summit），直接对接下游 MEME 基序发现。
- **植物组蛋白修饰全景图谱构建**：针对植物中广泛分布的抑制性组蛋白标记（如 H3K27me3 由 PRC2 催化覆盖在基因区；H3K9me2 富集在转座子密集区），使用 `--broad` 模式准确勾画连续的染色质表观抑制区。
- **ATAC-seq 染色质开放区域扫描**：通过参数 `--nomodel --shift -100 --extsize 200`，对植物根、叶、分生组织中的顺式调控元件（CREs）及转录起始位点（TSS）开放性进行高灵敏度定量。

---

## 5. 输入输出规范与关键参数指南

### 5.1 输入格式规范
- 经过比对与排序的 BAM 文件或 BED 文件（必须去除线粒体、叶绿体等非特异性高深结合）。
- 强烈建议提供配套的 Input DNA 阴性对照样本，以消除染色质可裂解性偏差。

### 5.2 核心执行命令与参数
```bash
# 1. 转录因子 ChIP-seq 窄峰分析 (Narrow Peak)
macs3 callpeak \
  -t IP_sample.sorted.bam \
  -c Input_control.sorted.bam \
  -f BAM \
  -g 3.7e8 \
  -n Rice_TF_ChIP \
  -q 0.05 \
  --outdir macs3_results/

# 2. 组蛋白修饰宽峰分析 (Broad Peak, 如 H3K27me3 / H3K9me2)
macs3 callpeak \
  -t H3K27me3.sorted.bam \
  -c Input.sorted.bam \
  -f BAM \
  -g 1.2e8 \
  -n At_H3K27me3 \
  --broad \
  --broad-cutoff 0.1 \
  -q 0.05

# 3. ATAC-seq 开放染色质分析 (Tn5 切割中心校正)
macs3 callpeak \
  -t atac_seq.sorted.bam \
  -f BAMPE \
  -g 2.1e9 \
  -n Maize_ATAC \
  -q 0.01 \
  --nomodel \
  --shift -100 \
  --extsize 200
```

### 5.3 关键参数说明
- `-g <int/str>`：**可比对基因组有效大小（Effective Genome Size）**。植物常见物种参考值：拟南芥约 `1.2e8`；水稻约 `3.7e8`；玉米约 `2.1e9`；小麦单个亚基因组约 `4.5e9`。
- `-q 0.05`：FDR 显著性阈值（默认 0.05）。
- `--broad`：开启宽峰模式，额外输出包含连续修饰区域的 `.broadPeak` 与 `.gappedPeak` 结果。
- `--shift -100 --extsize 200`：针对 ATAC-seq 读段的 Tn5 剪切位点校正，将断裂点居中延伸为 200 bp 片段。

---

## 6. 阅读与复现资源

- **原始研究论文**：[Genome Biology 2008 DOI: 10.1186/gb-2008-9-9-r137](https://doi.org/10.1186/gb-2008-9-9-r137)
- **MACS3 官方源码仓库与文档**：[macs3-project/MACS GitHub](https://github.com/macs3-project/MACS)
- **MACS3 官方用户手册**：[MACS3 Documentation](https://macs3-project.github.io/MACS/)
- **站内配套专题**：[ChIP-seq 与染色质免疫共沉淀技术](../../topics/epigenomics-3d-genome/m07-topic-02/)
- **站内配套专题**：[ATAC-seq 与染色质开放性分析](../../topics/epigenomics-3d-genome/m07-topic-03/)
