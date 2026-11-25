---
title: Sniffles2
name: Sniffles2
summary: 基于三代长读段比对的重复感知断点聚类、快速局部共识与 .snf 群体多样本联合分型的高精度全基因组结构变异 (SV) 检测工具。
version: "2.5.3"
dataType: 坐标排序并建立索引的长读段 (PacBio HiFi / Oxford Nanopore) BAM/CRAM 比对文件与群体 SNF 特征文件
principle: 读段内 CIGAR 变异与补充对齐 (Split-read) 解析、重复感知断点自适应聚类、泊松覆盖度基因型推断与两阶段群体联合分型
domainIds: [pangenomics-structural-variation]
topicIds: [m03-topic-03]
principleIds: [variant-calling]
dataIds: [long-reads, assembly, variant-data]
paper: sniffles2-paper
repository: https://github.com/fritzsedlazeck/Sniffles
status: published
updatedAt: 2026-11-25
---

## 软件定位与核心科学问题

结构变异（Structural Variations, SVs，定义为长度 $\ge 50\text{ bp}$ 的基因组序列改变，包括大片段插入、缺失、倒位、串联重复与染色体易位）在植物演化、驯化选择以及优良农艺性状形成中扮演着决定性角色。例如，控制玉米穗行数、水稻耐淹性以及油菜含油量的许多关键“隐形等位基因”，本质上都是由大片段转座子插入或基因拷贝数变异驱动的。

然而，传统的二代短读段测序（Illumina 150 bp）受限于物理读长短小，在面对植物基因组极其丰富的反转录转座子（LTR-RT）、简单串联重复（STR）以及着丝粒卫星重复时，其测序读段完全无法跨越数十甚至数千碱基的变异断点，导致全基因组超过 70% 的大型结构变异在短读段重测序中被系统性漏检或错误装配。

单分子长读段测序（PacBio HiFi、Oxford Nanopore ONT）的兴起彻底打破了这一视野局限。为了从长读段比对数据中高精度解码全变异图景，Sedlazeck 实验室研发了 **Sniffles2**（发表于 *Nature Biotechnology*, 2024）。

Sniffles2 彻底重构了早期长读段 SV caller 的统计内核：
1. **发明了重复感知断点聚类（Repeat-Aware Clustering）**，成功攻克植物复杂串联重复区的断点抖动难题；
2. **构建了覆盖度自适应泊松基因型推断模型**，显著消除了异质性测序深度带来的基因型判断偏倚；
3. **开创了基于 `.snf` 紧凑二进制格式的两阶段群体联合分型（Multi-sample Joint Calling）范式**，使数百甚至上千个植物长读段样本的群体变异整合能够在极低内存消耗下高精度完成。

---

## 核心算法原理与数学推导

```
   [坐标排序且建立索引的长读段 BAM/CRAM] (PacBio HiFi / ONT, 由 minimap2 对齐)
                                │
                                ▼
       阶段 1: 结构变异原始信号解析与断点提取
       ├─ 读段内 CIGAR 算子解析: 提取大片段插入 (I) 与缺失 (D) (长度 >= 50 bp)
       └─ 补充比对 (Supplementary / Split-read): 提取跨越断点的嵌合对齐 (INV, DUP, BND)
                                │
                                ▼
       阶段 2: 重复感知断点空间自适应聚类 (Repeat-Aware Clustering)
       └─ 动态评估基因组局部重复度，自适应扩展断点聚类窗口，聚合支持读段
                                │
                                ▼
       阶段 3: 覆盖度自适应贝叶斯基因型推断 (Coverage-Adaptive Genotyping)
       └─ 建立二项/泊松混合分布，精确输出纯合参考 (0/0)、杂合 (0/1) 与纯合变异 (1/1)
                                │
                                ├─────────────────────────────────────────┐
                                ▼                                         ▼
         单样本模式 (Single-sample Calling)           群体模式第一阶段: 输出单样本特征 (.snf)
         └─ 直接导出单样本标准 VCF 文件               └─ 仅保留候选断点与支撑读段元数据 (体积仅数 MB)
                                                                                  │
                                                                                  ▼
                                                      群体模式第二阶段: 全群体联合分型 (combine)
                                                      └─ 统一全群断点坐标，回溯低支持样本，输出方正 VCF
```

### 1. 结构变异物理信号的双轨提取机制

Sniffles2 遍历 BAM/CRAM 文件中的比对记录，通过两种互补机制捕获潜在变异：
- **读段内比对签名（Intra-read CIGAR Signature）**：
  长读段（如 15~20 kb 的 HiFi reads）完全穿透了插入或缺失变异。比对器在 CIGAR 串中直接记录了大段的连续插入（`I`）或缺失（`D`）。Sniffles2 过滤掉长度 $< 50\text{ bp}$ 的微小 Indel，精确提取长度 $L \ge 50\text{ bp}$ 的事件断点坐标及变异序列；
- **分裂读段与补充对齐签名（Split-read / Supplementary Signature）**：
  对于倒位（Inversion）、基因重复（Duplication）或易位（Translocation），单条读段的不同部分会被比对到基因组的不同位置或相反链上。比对器通过 `SA` 标签记录补充比对。Sniffles2 解析这些嵌合坐标对 $(chr_1, pos_1, strand_1) \leftrightarrow (chr_2, pos_2, strand_2)$，重建宏观重排断点。

### 2. 重复感知断点聚类算法 (Repeat-Aware Clustering)

在植物基因组中，大量结构变异发生在微卫星串联重复（STR）或转座子侧翼。受测序化学酶促反应或局部同质多聚物影响，不同 reads 在相同真实断点处的比对坐标往往存在 10~50 bp 的随机物理抖动。

传统的固定距离聚类算法（如强制要求断点相距 $< 10\text{ bp}$）会导致原本属于同一个生物学事件的读段被错误割裂为多个独立的假变异。

Sniffles2 引入了**重复感知动态聚类窗口**：
1. 实时扫描断点周围的序列特征，计算局部 $k$-mer 复杂度与重复序列密度 $\rho_{\text{rep}}$；
2. 动态调整聚类窗口大小 $\Delta W$：
   $$\Delta W = \max \left( W_{\min}, \; W_0 + \beta \cdot \text{Repetitiveness}(pos) \right)$$
   在高度重复区，窗口自动平滑扩展，确保所有支持该事件的读段被完整归并入同一候选簇（Cluster）；在复杂区域结束时，窗口迅速收窄，防止邻近的不同变异发生过度合并。

### 3. 覆盖度自适应基因型推断模型 (Genotyping Model)

设在某个候选结构变异位点，局部全基因组有效测序物理深度为 $D$，明确支持该变异等位基因的跨越读段数为 $R$（非变异参考支持读段数为 $D - R$）：
Sniffles2 构建三种标准二倍体基因型假说的似然模型：
1. **纯合参考型 $0/0$**：观测到的变异读段仅源于测序错误或随机比对噪声，支持数遵循泊松分布：
   $$\mathcal{L}(0/0) = \text{Poisson}(R \mid \epsilon \cdot D)$$
   其中 $\epsilon$ 为该测序平台的特征基线错误率；
2. **杂合变异型 $0/1$**：变异读段与参考读段在期望上各占一半，遵循二项分布：
   $$\mathcal{L}(0/1) = \text{Binomial}(R \mid D, p = 0.5)$$
3. **纯合变异型 $1/1$**：绝大多数读段均支持变异，仅有极少技术噪声：
   $$\mathcal{L}(1/1) = \text{Binomial}(R \mid D, p = 1 - \epsilon)$$
根据贝叶斯最大后验概率（MAP）确定基因型，并输出 Phred-scaled 基因型质量得分（GQ）。当局部由于植物转座子爆炸导致测序深度异常偏高时，模型会自动放宽纯合判定的绝对读段数阈值，极其稳健地适应植物全基因组深度的局部起伏。

### 4. 两阶段群体多样本联合分型架构 (Multi-sample Joint Calling)

在农作物多材料重测序群体（如 100 份水稻自交系或 50 份玉米核心种质）中，直接对多样本独立呼叫的结果做后处理“VCF 求并集”会产生致命的**假缺失（False Absences）**：即某个样本由于局部测序深度略低（如仅有 2 条 reads 支持变异），在单样本模式下因未达到最低阈值被判定为缺失（未输出记录），在合并时被误当作 $0/0$（纯合参考型）。

Sniffles2 彻底革新了这一流程：
- **阶段 1：生成紧凑 `.snf` 特征库**：
  对每个植物样本独立运行 Sniffles2，输出一个高度压缩的二进制文件（`.snf`，通常每个样本仅需 1~5 MB，是原始 BAM 的万分之一）。该文件不仅记录了已达到阈值的变异，更忠实保存了全基因组所有微弱变异候选及局部的测序深度轮廓；
- **阶段 2：群体联合分型（`sniffles --combine`）**：
  将全部样本的 `.snf` 文件输入内存，在全群体尺度统一步调。只要该变异在群体中任意若干个体中达到显著支持，全群体所有样本都会统一在该坐标处强制重新评估基因型。即使某个样本仅有 1 条读段支持，也会在此阶段被准确识别为杂合型（$0/1$），彻底根除了由于抽样波动引发的虚假基因存在缺失。

---

## 植物长读段结构变异分析实践指南

| 植物组学特殊性 | 潜在技术陷阱与偏倚 | Sniffles2 规范对策与参数配置 |
| :--- | :--- | :--- |
| **十种被子植物 HiFi 基准评测表现** | Zhang 等（2026）针对十种代表性被子植物（涵盖拟南芥、水稻、玉米、大豆等）的系统基准评测表明，Sniffles2 在缺失（DEL）与插入（INS）检测的平衡 F1-score 与断点分辨率上均名列前茅。 | 基准同时表明，植物特有的大型转座子嵌套区域（Nested LTRs）仍存在比对盲区，建议针对目标变异结合点阵图或局部组装做双重质控。 |
| **长读段 MAPQ 过滤阈值调优** | 植物基因组中存在大量高同源基因拷贝，比对器（如 minimap2）对多重比对 reads 往往赋值 MAPQ = 0。若严格过滤 MAPQ $\ge 20$，将导致同源基因区结构变异全部漏检。 | 默认参数 `--mapq 20` 适用于全基因组绝大多数单拷贝区；若专门研究特定多基因家族，可适当下调至 `--mapq 5`，但需警惕假阳性上升。 |
| **低频嵌合与体细胞突变（Mosaicism）** | 植物分生组织具有体细胞突变分枝保留特性，单个组织样可能包含不同嵌合比例的体细胞 SV。 | 单倍体/纯合近交系分析应使用默认 germline 模式；若专门探究多年生木本植物枝条嵌合体，可开启 `--mosaic` 模式。 |

---

## 典型分析命令与标准操作流

以下为利用 Sniffles2 开展植物群体多样本长读段结构变异联合分型的标准流水线：

```bash
# 阶段 1：对群体中每个植物样本分别生成单样本紧凑特征文件 (.snf)
# 针对 PacBio HiFi reads 比对生成的 sorted.bam
# -t 8: 8 线程; --reference: 载入参考以完整输出精确插入/缺失等位碱基
for sample_id in Rice_Indica_1 Rice_Indica_2 Rice_Japonica_1 Rice_Wild_1; do
    echo "正在处理样本特征: ${sample_id} ..."
    sniffles \
        --input ./bams/${sample_id}.sorted.bam \
        --snf ./snfs/${sample_id}.snf \
        --reference Nipponbare_ref.fa \
        --threads 8
done

# 阶段 2：全群体多样本联合分型 (Multi-sample Joint Calling)
# 将所有单样本 .snf 文件合并统一分型，产出群体多样本统一 VCF
# 输出的 VCF 包含所有样本在所有候选断点的规整基因型矩阵 (完全无缺失信息假象)
sniffles \
    --input ./snfs/Rice_Indica_1.snf \
            ./snfs/Rice_Indica_2.snf \
            ./snfs/Rice_Japonica_1.snf \
            ./snfs/Rice_Wild_1.snf \
    --vcf rice_population_joint_SVs.vcf \
    --reference Nipponbare_ref.fa \
    --threads 16

# 阶段 3：结构变异基础质量与类型过滤 (bcftools)
# 过滤掉支持数极低、非 PASS 或断点质量不足的低置信度候选
bcftools view \
    -i 'FILTER="PASS" && QUAL>=30' \
    -Oz -o rice_population_joint_SVs.filtered.vcf.gz \
    rice_population_joint_SVs.vcf

# 建立 VCF 索引
bcftools index -t rice_population_joint_SVs.filtered.vcf.gz
```

---

## 科学研究案例与上下游分析协同

- **十种被子植物长读段结构变异系统基准案例**：在 Zhang 等（2026）针对十种亲缘与复杂程度各异的被子植物（涵盖单子叶禾本科水稻、玉米、双子叶十字花科、豆科等）开展的跨平台 SV Caller 权威评测中，研究团队以高深度 PacBio HiFi 和 ONT 数据为底座，深入测试了包含 Sniffles2 在内的多套检测流程。结果证实，基于 minimap2 比对配合 Sniffles2 的流水线在跨物种结构变异检测中综合稳健性最高，特别是在重复序列边界的断点解析精度上表现出极强的抗噪能力；
- **分析工具流转与协作边界**：
  - **上游工具对接**：输入 BAM 文件必须严格由专为长读段设计的比对器（如 **minimap2** 使用 `-ax map-hifi` 或 `-ax map-ont` 预设）生成，且必须执行完整的坐标排序与建索；
  - **下游泛基因组对接**：Sniffles2 产出的多样本高质 SV VCF 矩阵，是后续开展全基因组关联分析（SV-GWAS）、构建泛基因组变异图（如通过 **vg construct** 转化为初始图）或评估基因存在缺失变异的基石数据。
