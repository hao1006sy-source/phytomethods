---
title: Merqury
name: Merqury
summary: 基于无参考偏倚 k-mer 频数谱图的现代基因组质量评估工具，精确量化单碱基 QV、k-mer 完整度、拷贝数谱图与单倍型相位纯度。
dataType: 高保真短读段 / HiFi 读段 / 组装序列
principle: 参考无关 k-mer 集合分析与对数 QV 统计推导
domainIds: [genome-assembly]
topicIds: [assembly-basics, assembly-quality, sequencing-data]
principleIds: [kmer]
dataIds: [accurate-reads, assembly]
paper: merqury
repository: https://github.com/marbl/merqury
updatedAt: 2026-11-25
---

## 科学定位与参考无关评估革命

在植物基因组学发展初期，评估新组装基因组的碱基正确率通常依赖于将其比对回现有的近缘模式植物参考序列。然而，这种依赖外部参考的方法存在致命的科学缺陷：
1. **参考偏倚（Reference Bias）**：植物不同种质间存在巨大的自然等位多态性与结构变异，将目标基因组特有的真实变异错误惩罚为“组装错误”；
2. **孤儿基因组无法评估**：对于尚无近缘参考序列的非模式野生植物，传统外部比对方法完全失效。

由 Arang Rhie 等人于 2020 年发表在 *Genome Biology* 上的 **Merqury**，彻底颠覆了传统评估模式。它完全不依赖任何外部参考基因组，直接将目标材料自身的高精度原始测序读段（如 Illumina 短读段或 PacBio HiFi）构建的 $k$-mer 频数数据库作为无偏经验基准，通过数学严谨的集合运算与概率建模，客观、精准地量化全基因组单碱基质量值（QV）、$k$-mer 完整度、拷贝数保真度及单倍型分离纯度。

---

## 核心数学推导与统计建模

### 1. 单碱基错误率 $E$ 与 Phred 质量值 QV 推导

设目标材料测序提取出的 $k$-mer 长度为 $k$。定义组装序列（Assembly）中的所有不同 $k$-mer 构成的集合为 $A$，原始高精度测序读段集合中过滤低频错误后提取出的高可信 $k$-mer 集合为 $R$。

- **共有 $k$-mer 集合**：$K_{\text{shared}} = |A \cap R|$；
- **组装总独特 $k$-mer 数**：$K_{\text{total}} = |A|$。

定义组装序列中无错误的 $k$-mer 占比为：

$$P = \frac{K_{\text{shared}}}{K_{\text{total}}}$$

假设单碱基错误率为 $E$，且各碱基发生替换或微小 InDel 的概率在序列空间中近似独立，则一个长度为 $k$ 的连续子串不含任何错误的概率为 $(1 - E)^k$。由此建立等式：

$$P = (1 - E)^k \implies E = 1 - P^{1/k} = 1 - \left(\frac{K_{\text{shared}}}{K_{\text{total}}}\right)^{1/k}$$

根据 Phred 标度定义全基因组 Consensus QV：

$$QV = -10 \log_{10}(E) = -10 \log_{10}\left(1 - \left(\frac{K_{\text{shared}}}{K_{\text{total}}}\right)^{1/k}\right)$$

- **Q40 标准（$E = 10^{-4}$）**：单碱基准确率达 $99.99\%$，为现代植物参考基因组发布门槛；
- **Q50 标准（$E = 10^{-5}$）**：单碱基准确率达 $99.999\%$，为端粒到端粒（T2T）高质量基因组的基准标志。

### 2. k-mer 完整度（Completeness）

k-mer 完整度度量原始测序读段中所携带的真实基因组信息在组装结果中被找回的百分比：

$$\text{Completeness} = \frac{|A \cap R|}{|R|} \times 100\%$$

若该值显著偏低（例如 $< 95\%$），提示组装在特定高 GC、高重复或着丝粒区域发生了严重的序列丢失。

---

## 三大核心诊断谱图的判读法则

Merqury 通过 R 脚本自动渲染三大正交诊断图谱：

### 1. 拷贝数频谱图（Spectra-cn Plot）

横轴为 $k$-mer 在原始测序读段中的乘数深度（Multiplicity），纵轴为独特 $k$-mer 计数，颜色表示该 $k$-mer 在组装序列中的拷贝数（0-copy 灰色缺失、1-copy 红色单倍体、2-copy 绿色纯合、3-copy 蓝色、4-copy 橙色）：
- **健康二倍体双单倍型组装**：杂合单倍体峰处呈现纯净的 1-copy 红色，纯合主峰处呈现纯净的 2-copy 绿色；
- **等位序列过度丢弃**：杂合峰位置出现大量 0-copy 灰色柱状堆叠，提示软件在去冗余时误将大量真实杂合单倍型彻底删除；
- **重复序列人工扩增**：在纯合峰上方出现反常的 3-copy 或 4-copy 颜色堆叠。

### 2. 组装自身频谱图（Spectra-asm Plot）

直接比较组装序列自生 $k$-mer 的深度分布，用于发现组装中独有的离群异常高频序列。

### 3. 单倍型相位谱图（Spectra-hap Plot / Blob Plot）

当提供父本与母本短读段时，Merqury 利用亲本特异 $k$-mer 检查子代组装的两个单倍型（Hap1 与 Hap2）。若在 Hap1 序列中检测到密集的母本特异 $k$-mer，表明组装发生了单倍型相位跳跃错误（Switch Error）。

---

## 常用实战运行流程与命令

### 1. 利用 Meryl 构建高质量 $k$-mer 频数数据库

```bash
# 1. 估计最佳 k 值 (对于 ~1 Gb 植物基因组，通常推荐 k=21)
# 2. 从高准确度读段 (HiFi 或 Illumina) 构建 meryl 库
meryl k=21 count threads=32 memory=64 output reads.meryl reads.fastq.gz

# 3. 检查 k-mer 直方图并确定过滤低频错误的深度阈值
meryl histogram reads.meryl > reads.hist
```

### 2. 运行 Merqury 全基因组质量评估

```bash
# 针对二倍体双单倍型组装评估
# 参数: <meryl_db> <asm1.fasta> <asm2.fasta> <out_prefix>
merqury.sh reads.meryl hap1.fasta hap2.fasta plant_eval

# 针对包含亲本数据的 Trio 单倍型评估
merqury.sh mat.meryl pat.meryl reads.meryl hap1.fasta hap2.fasta plant_trio_eval
```

### 3. 输出报告核心文件解读

- `plant_eval.qv`：各单倍型及全基因组加权 Consensus QV 与错误碱基估计数；
- `plant_eval.completeness.stats`：$k$-mer 找回完整度百分比统计表；
- `plant_eval.*.spectra-cn.png`：拷贝数频谱图；
- `plant_eval.phased.block.stats`：单倍型相位块（Phase Block）连续性 N50 与 Switch Error 统计表。

---

## 植物科研经典案例：拟南芥 F1 杂交分相验证

Merqury 原创论文中最为经典的实验验证之一，是基于拟南芥生态型 Col-0 与 Cvi-0 杂交获得的 $F_1$ 代材料。研究利用双亲测序提取出的特异 $k$-mer，对 $F_1$ 代组装进行了客观基准测定：
- 证实了二倍体组装中单倍型完全分离时，Spectra-cn 图中的纯合主峰与杂合单拷贝峰呈现完美的 $1:1$ 比例对应；
- 证明了通过无参考 $k$-mer 能够以超越 $99.99\%$ 的置信度发现传统比对方法无法识别的亚显微等位倒位与嵌合。

---

## 参考文献与数据来源

1. **Rhie A, Walenz BP, Koren S, Phillippy AM.** (2020). Merqury: reference-free quality, completeness, and phasing assessment for genome assemblies. *Genome Biology*, 21(1), 245. DOI: [10.1186/s13059-020-02134-9](https://doi.org/10.1186/s13059-020-02134-9)
2. **Marçais G, Delcher AL, Phillippy AM, et al.** (2015). Assembling large genomes with Jellyfish and dense de Bruijn graphs. *PLOS ONE*, 10(12), e0143895. DOI: [10.1371/journal.pone.0143895](https://doi.org/10.1371/journal.pone.0143895)
