---
title: ATAC-seq 与染色质可及性：Tn5 转座酶空间切割与顺式元件识别
summary: 深入推导 ATAC-seq 分子机制、Tn5 +4/-5 bp 坐标移位校正、文库片段周期性分布、MACS3 动态泊松 Peak Calling 以及植物细胞器污染过滤与 TSSE 质控。
domain: epigenomics-3d-genome
methods: [macs3]
status: published
updatedAt: 2026-11-25
---

## 核心科学问题：顺式调控元件的物理可及性与转录状态

真核生物基因组紧密缠绕在组蛋白八聚体核心之上，形成串珠状的核小体（Nucleosome）高级结构。在高度浓缩的异染色质区域，致密的核小体空间位阻使得 RNA 聚合酶与大多数序列特异性转录因子（Transcription Factors, TFs）无法接触 DNA 靶标，基因处于长期转录静默状态。

当特定基因被诱导激活时，染色质重塑复合物（如 SWI/SNF 复合物）会以消耗 ATP 为代价，将启动子及远端增强子（Enhancer）区域的核小体滑移或驱逐，暴露出一片裸露的**无核小体开放染色质区域（Nucleosome-Free Region, NFR / Accessible Chromatin）**，形成具有转录调控活性的顺式调控元件（cis-Regulatory Elements, cCREs）。

**ATAC-seq**（Assay for Transposase-Accessible Chromatin using sequencing）利用突变工程改造的高活性 Tn5 转座酶，在低至数千个活细胞的微量输入下，直接在开放染色质区特异性切割并插入测序接头，成为植物高分辨率鉴定活性启动子、增强子与转录因子足迹（Footprinting）的标准金标准技术。

![ATAC-seq 染色质可及性测序原理与核小体周期性片段分布](/phytomethods/images/topics/m07/atac-seq-tn5-chromatin-accessibility.svg)

---

## 算法数学推导：Tn5 坐标校正与 MACS3 Peak Calling

### 1. Tn5 转座酶空间结构与 +4 / -5 bp 坐标移位校正机制

体外重组的超级转座酶 Tn5（Tn5 Transposase）以**同源二聚体**（Homodimer）的构型结合 DNA，并在每个单体上预先组装高通量测序接头双链复合体（Adaptor complexes）：
- 当 Tn5 识别开放的双链 DNA 时，两个催化亚基分别在 DNA 正反互补链上实施亲核进攻；
- 两条单链上的切割位点在空间三维结构上**相差 9 个碱基对（9-bp Staggered Cut）**；
- DNA 聚合酶在后续文库构建中补平这 9-bp 突出端，导致测序 Reads 的起点坐标相比真实的物理转座结合中心产生了系统性偏差。

**生物信息学坐标校正算法**：
为了精准复原转座酶的真实空间着陆结合中心，比对至参考基因组的 Reads 必须执行**单碱基移位校正**：
- **比对至正链（Watson 链, `+` 链）的 Reads**：其起端坐标向 $3'$ 方向平移 4 个碱基（$\text{Start} \to \text{Start} + 4\text{ bp}$）；
- **比对至负链（Crick 链, `-` 链）的 Reads**：其起端坐标向 $5'$ 方向平移 5 个碱基（$\text{End} \to \text{End} - 5\text{ bp}$）。

经过此法则校正后，正负链的切割点在物理空间上实现严格对齐，为后续高分辨率转录因子空间足迹（Footprinting）分析提供了单碱基级的物理锚点。

### 2. 文库片段长度（Fragment Size）的生物学周期性分布

高品质的植物 ATAC-seq 文库在片段长度分布直方图上展现出极其规则的**多峰周期性特征（Periodicity Distribution）**：
1. **无核小体片段（NFR, Nucleosome-Free Fragments, $< 100\text{ bp}$）**：
   Tn5 酶在同一块无核小体开放区域内发生两次密集切割，生成的超短片段主要源自基因启动子核心区与转录因子结合位点。优质文库中该类片段比例通常应超过 $40\%$；
2. **单核小体保护片段（Mono-nucleosome, $\sim 200\text{ bp}$）**：
   Tn5 在一个核小体的两侧连接区（Linker DNA）分别切割，产生约 $147\text{ bp}$（组蛋白缠绕长度）$+ 50\text{ bp}$（连接区），峰值严格位于 $\sim 180 - 200\text{ bp}$；
3. **双核小体与多核小体片段（$\sim 400\text{ bp}, \sim 600\text{ bp}$）**：
   跨越连续两个或三个核小体切割产生的长片段。

若片段分布呈现单峰平滑退化，通常提示 Tn5 消化过度（Over-digestion）或样本细胞已发生破碎裂解。

### 3. MACS3 动态局部泊松背景 Peak Calling 算法

MACS3 将全基因组划分为滑动窗口，利用候选窗口内观察到的转座酶切断点计数 $k$，评估其相对于局部基因组背景的富集显著性。

由于植物染色质异染色质比例高、转座子重复多，染色质背景水平在不同染色体臂与着丝粒区域极不均匀。MACS3 采用**动态局部泊松参数（Dynamic Local $\lambda_{\text{local}}$）**：

$$\lambda_{\text{local}} = \max \left( \lambda_{\text{BG}}, \lambda_{1\text{k}}, \lambda_{5\text{k}}, \lambda_{10\text{k}} \right)$$

其中：
- $\lambda_{\text{BG}}$ 为全基因组平均背景密度：$\lambda_{\text{BG}} = \frac{N_{\text{total}}}{G_{\text{effective}}}$；
- $\lambda_{1\text{k}}, \lambda_{5\text{k}}, \lambda_{10\text{k}}$ 分别为在候选峰周围 $1\text{ kb}$、$5\text{ kb}$ 和 $10\text{ kb}$ 窗口内计算的局部覆盖参数。

检验零假设 $H_0: k \sim \text{Poisson}(\lambda_{\text{local}})$，计算单点 $p$ 值：

$$p = P(X \ge k \mid X \sim \text{Poisson}(\lambda_{\text{local}})) = \sum_{x=k}^{\infty} \frac{\lambda_{\text{local}}^x e^{-\lambda_{\text{local}}}}{x!}$$

通过 Benjamini-Hochberg 转化为 $q$ 值（$q < 0.05$ 或更严苛的 $-\log_{10} q \ge 5$），输出高置信度的染色质开放窄峰（NarrowPeak）。

在双端测序（Paired-end）处理中，运行参数推荐直接使用 `--format BAMPE`，此时 MACS3 自动将配对 Reads 重构为实际插入片段，无需手动设置虚拟延伸参数。

---

## 植物 ATAC-seq 特异质控挑战与核心指标

### 1. 细胞器（叶绿体与线粒体）超高污染的阻击

植物细胞质内含有大量叶绿体（Chloroplasts）与线粒体（Mitochondria）。由于这些半自主细胞器的环状基因组完全**缺乏核小体缠绕保护**，裸露的细胞器 DNA 对 Tn5 转座酶具有极高的亲和力。在常规植物组织裂解中，往往导致多达 $50\% \sim 80\%$ 的测序数据被细胞器无效序列吞噬。

**解决方案与质控红线**：
1. **实验端纯化**：必须严格优化组织研磨与细胞核分离流程，采用蔗糖密度梯度超速离心或低吸附滤膜纯化游离完整细胞核（Intact Nuclei）；
2. **生信端严格过滤**：在比对后强制剔除比对到叶绿体（`chrC`）与线粒体（`chrM`）的 Reads。合格文库的最终核基因组有效利用率必须高于 $50\%$。

### 2. 转录起始位点富集得分（TSS Enrichment Score, TSSE）

评估可及性信号信噪比的金标准为**转录起始位点富集得分（TSSE）**：

$$\text{TSSE} = \frac{\text{Mean Normalized Coverage in TSS } [-50\text{ bp}, +50\text{ bp}]}{\text{Mean Background Coverage in Flanking } [-2000, -1900\text{ bp}] \text{ and } [+1900, +2000\text{ bp}]}$$

- **$\text{TSSE} \ge 8.0$**：极高信噪比优质植物文库，启动子区域呈现高耸尖锐单峰；
- **$5.0 \le \text{TSSE} < 8.0$**：合格文库，可用于常规 Peak calling；
- **$\text{TSSE} < 5.0$**：文库信噪比不足，背景噪声严重，无法用于精细足迹识别。
