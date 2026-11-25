---
title: "CUT&Tag for efficient epigenomic profiling of small samples and single cells"
summary: "提出抗体引导 protein A-Tn5 对染色质目标进行定位测序的 CUT&Tag 方法与极低背景表观基因组学分析策略。"
authors: "Kaya-Okur HS, Wu SJ, Codomo CA, et al."
year: 2019
journal: Nature Communications
doi: 10.1038/s41467-019-09982-5
type: method
methodIds: []
domainIds: [epigenomics-3d-genome]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

# CUT&Tag for efficient epigenomic profiling of small samples and single cells

## 1. 研究背景与算法贡献

在表观遗传学和染色质生物学领域，染色质免疫共沉淀测序（ChIP-seq）长期作为解析组蛋白修饰和转录因子全基因组占据位置的核心手段。然而，传统 ChIP-seq 存在显著的技术瓶颈：
1. **样本起始量需求大**：通常需要数百万甚至上千万个细胞；
2. **背景噪声显著**：甲醛强交联与超声随机物理打断会导致高比例的非特异性随机背景 DNA 断片，测序 reads 往往只有 5%–20% 真正落在特异性富集峰（Peak）内；
3. **文库构建复杂且损失严重**：免疫共沉淀后需经历去交联、酚氯仿抽提、末端修复、加 A 尾、连接测序接头等多个繁琐体外酶促步骤，导致超微量样本建库成功率极低。

2019 年，Fred Hutchinson 癌症研究中心的 Hatice S. Kaya-Okur 与 Steven Henikoff 等在 *Nature Communications* 提出了 **CUT&Tag**（Cleavage Under Targets and Tagmentation）技术。该技术彻底颠覆了传统的染色质研究范式：
- 采用温和的原位反应系统，直接在完整的细胞核内进行操作；
- 借助高特异性一抗识别目标蛋白，二抗进行信号放大并特异招募融合了测序接头的 **Protein A-Tn5 转座酶** 复合物（pA-Tn5）；
- 激活转座酶（添加 $\text{Mg}^{2+}$）实现靶向结合位点附近的精准就地切割与测序接头连接（Tagmentation）；
- 计算分析上，CUT&Tag 带来了极其优异的超高信噪比，仅需数百万条双端读段即可达到传统 ChIP-seq 数千万读段的灵敏度，为微量植物组织与单细胞表观组学研究开辟了全新路径。

---

## 2. 核心数学模型与数据结构

### 2.1 双末端靶向转座与特征片段长度分布

CUT&Tag 依赖 Tn5 转座酶在结合靶标周围产生的定点切割。因为反应未发生全基因组随机断裂，未结合区域不发生转座剪切，其测序读段呈现出特征性的**片段大小周期性阶梯分布**：
- **核小体占有峰**：对于组蛋白修饰（如 H3K4me3、H3K27me3、H3K9me2 等），Tn5 切割产生的双端测序插入片段长度呈现明显的单核小体（约 150–200 bp）、双核小体（约 300–400 bp）甚至多核小体峰。
- **亚核小体/转录因子峰**：对于转录因子或开放区域，片段长度多集中在 50–120 bp 的无核小体结合区。

### 2.2 极低背景下的富集峰统计模型

传统 ChIP-seq 的 Poisson 背景模型假设全基因组存在均匀的测序背景，而 CUT&Tag 在非富集区的读段覆盖接近于零。为此，专为有偏低背景设计的 **SEACR**（Sparse Enrichment Analysis for CUT&RUN / CUT&Tag）算法被广泛采用：
- **经验阈值曲线拟合**：SEACR 将信号富集区建模为经验信号累积函数，寻找背景信号与真实结合信号分布之间的最大差异拐点：
  $$S(h) = \frac{\sum_{i=1}^M I(x_i \ge h)}{M}$$
  其中 $h$ 为信号峰高阈值。
- **无对照或对照模式**：在存在阴性对照（如 IgG 样本）时，SEACR 自动将 IgG 信号的最高背景分位数作为严苛阈值；在无对照模式下，直接利用经验信号的经验分布尾部拟合进行无偏切割。

---

## 3. 算法复杂度与计算性能

1. **测序深度需求极小**：对于典型的植物二倍体基因组（如水稻、拟南芥），常规 ChIP-seq 窄峰需 2000 万条读段，宽峰需 4000 万至 5000 万条读段；而 CUT&Tag 仅需 300 万至 800 万对双端测序 reads（Paired-End 150 bp）即可实现完全饱和。
2. **比对与处理耗时低**：由于总测序数据量降低一个数量级，采用 Bowtie 2 双端比对并过滤单核小体片段仅需 15–30 分钟。
3. **计算内存占用小**：比对和峰值计算过程在 8 核 CPU、16 GB 内存的标准分析工作站上即可高速完成。

---

## 4. 植物基因组学应用场景与科研价值

植物组织通常含有坚硬的纤维素细胞壁以及大量的多糖、多酚和叶绿体色素等次生代谢物，且分生组织、胚珠、精细胞等关键发育靶标的细胞数量极为稀少，传统 ChIP-seq 极难成功。CUT&Tag 为植物表观基因组学带来了革命性的科研突破：
- **微量分生组织与生殖细胞表观解析**：能够在几百至数千个原生质体（Protoplasts）或流式分选（FACS）细胞核中稳定检测 H3K4me3（转录激活）、H3K27me3（多梳抑制）、H3K9me2（异染色质转座子抑制）动态。
- **逆境表观快速重塑机制研究**：在干旱、高温、盐胁迫早期短时间内捕获染色质修饰与转录因子（如 DREB、bZIP、WRKY）的原位动态结合。
- **单细胞 CUT&Tag 拓展**：结合单细胞微流控技术（如 10x Genomics），实现植物单细胞分辨率下的表观异质性聚类与细胞命运决定轨迹推断。

---

## 5. 输入输出规范与关键参数指南

### 5.1 数据预处理与比对参数

CUT&Tag 测序读段必须采用双端测序（Paired-End），以准确测定 Tn5 两端转座距离：
```bash
# 1. Bowtie 2 高灵敏度比对（关键：必须开启 --dovetail 允许 Tn5 短片段重叠）
bowtie2 \
  --very-sensitive \
  --no-mixed \
  --no-discordant \
  --dovetail \
  -I 10 \
  -X 700 \
  -p 16 \
  -x /path/to/plant_genome_index \
  -1 sample_R1.fq.gz \
  -2 sample_R2.fq.gz \
  -S sample.sam

# 2. 转换为 BAM 并严格过滤线粒体/叶绿体等细胞器污染与低质量读段
samtools view -bS -F 0x04 -q 30 sample.sam | samtools sort -o sample.sorted.bam
samtools index sample.sorted.bam

# 3. 统计插入片段长度分布质控（判断核小体周期性）
samtools stats sample.sorted.bam | grep ^IS | cut -f 2- > insert_size_distribution.txt
```

### 5.2 富集峰识别（Peak Calling）
对于 CUT&Tag 数据，可选择 SEACR 或 MACS3：
```bash
# 方案 A: 使用专为 CUT&Tag 设计的 SEACR（需先生成 bedGraph）
bedtools genomecov -bg -ibam sample.sorted.bam -g plant_chrom_sizes.txt > sample.bedGraph
bash SEACR_1.3.sh sample.bedGraph 0.01 non stringent sample.seacr.peaks

# 方案 B: 使用 MACS3（关闭模型，直接以真实片段中心拓展）
macs3 callpeak \
  -t sample.sorted.bam \
  -c igg_control.sorted.bam \
  -f BAMPE \
  -g 3.7e8 \
  -n sample_macs3 \
  -q 0.05 \
  --keep-dup all
```

---

## 6. 阅读与复现资源

- **原始研究论文**：[Nature Communications 2019 DOI: 10.1038/s41467-019-09982-5](https://doi.org/10.1038/s41467-019-09982-5)
- **Henikoff 实验室官方标准实验方案**：[Protocols.io CUT&Tag Protocol](https://www.protocols.io/view/bench-top-cut-amp-tag-bcuhiwt6)
- **SEACR 峰识别官方源码仓库**：[FredHutch/SEACR GitHub](https://github.com/FredHutch/SEACR)
- **站内配套专题**：[ChIP-seq 与染色质免疫共沉淀技术](../../topics/epigenomics-3d-genome/m07-topic-02/)
- **站内配套专题**：[表观遗传调控与植物抗逆](../../topics/epigenomics-3d-genome/m07-topic-07/)
