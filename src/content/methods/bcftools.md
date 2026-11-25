---
title: BCFtools
name: BCFtools
summary: 全基因组变异检测 (mpileup/call)、格式转换、过滤质控、多样本联合分析与规范化的核心工具集。
dataType: BAM / CRAM 比对文件、VCF / BCF 变异文件
principle: 基因型似然贝叶斯推断 (Li 2011 模型)、碱基对齐质量 (BAQ) 重校准、多等位位点联合调用与表达式动态过滤
domainIds: [population-genetics]
topicIds: [m05-topic-02]
principleIds: [variant-calling]
dataIds: [variant-data]
paper: bcftools-paper
repository: https://github.com/samtools/bcftools
status: published
updatedAt: 2026-11-25
---

## 生物学问题与定位

高通量测序技术（Illumina 短读段、PacBio HiFi、Nanopore 长读段）将海量植物个体 DNA 片段比对到参考基因组后，核心的生物信息学挑战在于：**如何从混杂着测序化学错误、PCR 扩增偏好性、局部微小 InDel 比对错位以及重复序列假同源比对的数亿条 reads 中，以严格的统计学概率精准识别出真实的单核苷酸多态性（SNP）与小插入缺失（InDel）？**

**BCFtools** 由 Heng Li（李恒）、Petr Danecek 等人开发并持续维护，是生物信息学领域变异检测与 VCF/BCF 操作的基石级软件，与 SAMtools、HTSlib 共同构成全球公认的行业事实标准。其核心架构与方法系统发表于 *GigaScience*（Danecek et al., 2021）。

BCFtools 具备以下核心定位与不可替代的优势：
1. **轻量高效的变异检出引擎**：通过 `bcftools mpileup | bcftools call` 管道，以极低的内存开销实现单样本或数百个样本的快速联合变异发现（Joint Variant Calling）；
2. **碱基对齐质量（BAQ）重校准**：通过 HMM 模型实时下调 InDel 邻近区域潜在错位碱基的质量分，从源头上扑灭假阳性 SNP；
3. **极速二进制 BCF 格式与强大表达式过滤**：原生支持高度压缩且带索引起跳的二进制 BCF（比文本 VCF 快数倍），提供无与伦比的布尔表达式动态过滤（`bcftools filter`）、变异位点规范化（`bcftools norm`）与多样本矩阵抽取（`bcftools query`），是所有植物群体遗传学与功能基因组学分析的上游枢纽。

---

## 核心算法数学原理与推导

BCFtools 的变异检测建立在严格的贝叶斯统计概率模型与对齐质量评估之上：

### 1. 碱基对齐质量（Base Alignment Quality, BAQ）模型

在含有微小插入或缺失（InDel）的区域，局部错配的 reads 极易被仿射间隙惩罚（Affine gap penalty）比对算法错误地比对为连续的假 SNP。

李恒于 2011 年提出的 BAQ 算法通过隐马尔可夫模型（HMM）动态计算某个测序碱基与参考基因组对应坐标真正同源（Homologous）的后验对齐概率：

$$\text{BAQ} = -10 \log_{10} P(\text{该碱基由于比对错位而发生错配})$$

BCFtools `mpileup` 会将原始测序碱基质量分（Base Quality, BQ）与计算出的 BAQ 取较小值：$Q' = \min(\text{BQ}, \text{BAQ})$。当比对器在 InDel 周边存在比对模糊时，BAQ 会骤降，从而使该错误碱基在后续基因型似然中被自动赋予极低的权重，彻底消除了假阳性多态峰。

### 2. 基因型似然度（Genotype Likelihood, GL / PL）计算

设在特定二倍体位点处，真实基因型为 $g \in \{A_1A_1, A_1A_2, A_2A_2\}$。测序观测到 $k$ 条覆盖该位点的独立 reads，其比对碱基为 $\mathbf{b} = \{b_1, b_2, \dots, b_k\}$，对应重校准后的测序错误率为 $e_i = 10^{-Q'_i / 10}$。单条 read 的条件概率为：

$$P(b_i \mid g) = \frac{1}{2} P(b_i \mid \text{单倍型 1}) + \frac{1}{2} P(b_i \mid \text{单倍型 2})$$

假设各 read 的测序错误相互独立，全覆盖深度下的基因型似然函数定义为独立乘积：

$$L(g) = P(\mathbf{b} \mid g) = \prod_{i=1}^k P(b_i \mid g)$$

为了便于紧凑存储与规避下溢，VCF 输出将其转换为 Phred 比例尺度的整数基因型似然（Phred-scaled Likelihood, PL）：

$$\text{PL}(g) = -10 \log_{10} \frac{L(g)}{\max_{g'} L(g')}$$

最大似然基因型的 $\text{PL} = 0$，其余可能基因型的 PL 均为非负正整数。

### 3. 多等位位点联合调用模型（Multiallelic Calling, `call -m`）

经典单样本独立调用在低深度测序（如 $5\times \sim 10\times$）时极易由于抽样随机性而漏调真实杂合变异。BCFtools `call -m` 实现了群体先验联合调用（Joint Calling）：
1. 联合收集全群体所有样本在该位点的基因型似然矩阵；
2. 采用最大期望（EM）算法估计群体在该位点的备择等位基因频率先验分布 $\boldsymbol{\phi}$；
3. 将全群体先验注入贝叶斯后验概率计算：
   $$P(g_i \mid \mathbf{b}_i, \boldsymbol{\phi}) \propto P(\mathbf{b}_i \mid g_i) P(g_i \mid \boldsymbol{\phi})$$
4. 这种联合推断使得某一罕见变异若在群体其他样本中被高深度确证，则可极大提升低深度样本在该位点正确检出基因型的统计置信度。

### 4. 变异规范化（Normalization, `norm`）

不同软件输出的 InDel 表达方式极易产生歧义（例如在微卫星或连续均聚物区，同一个 1 bp 缺失可以写在均聚物的最左侧、最右侧或中间）。`bcftools norm` 执行：
- **左对齐（Left-align）**：将所有 InDel 统一推至参考基因组的最左侧边界；
- **多等位位点展开或折叠**：通过 `-m -any` 将一个位点包含 3 个等位基因的复合记录拆分为独立的双等位记录，或通过 `-m +any` 将重叠位点合并，确保多样本合并后的基因型矩阵坐标严格对齐。

---

## 生产环境标准流水线

以下展示从全基因组 BAM 文件执行多样本联合变异检测、左对齐规范化、严格质量过滤并导出最终分析型 VCF/BCF 的工业级流水线：

```bash
# 步骤 1：利用 mpileup 与 call 联合发现变异并直接管道输出未压缩 BCF (-Ou)
# -Ou 避免了管道中转文本解析的巨大开销；-mv 开启多等位模型且仅输出变异位点
bcftools mpileup \
  --threads 8 \
  -Ou \
  -f reference_genome.fa \
  -b bam_list.txt \
  -a FORMAT/AD,FORMAT/DP \
  --max-depth 500 | \
bcftools call \
  --threads 8 \
  -Ou \
  -mv \
  -o raw_calls.bcf

# 步骤 2：变异位点左对齐与多等位位点拆分（Normalization）
bcftools norm \
  -Ou \
  -f reference_genome.fa \
  -m -any \
  raw_calls.bcf | \
bcftools view \
  -Ob \
  -o normalized_calls.bcf

# 步骤 3：严格质量控制过滤（结合变异质量分 QUAL、测序深度 DP、链偏好 FS 与比对质量 MQ）
# 分别对 SNP 和 InDel 设置不同过滤标准
bcftools filter \
  -Ou \
  -e 'QUAL < 30 || FORMAT/DP < 5 || MQ < 40' \
  --set-GTs . \
  normalized_calls.bcf | \
bcftools filter \
  -Oz \
  -e 'FS > 60.0' \
  -o plant_cohort_final_qc.vcf.gz

# 步骤 4：构建 Tabix 空间索引
bcftools index -t plant_cohort_final_qc.vcf.gz

# 步骤 5：快速提取指定基因组区段的变异频率矩阵以供下游作图
bcftools query \
  -r Chr01:1000000-2000000 \
  -f '%CHROM\t%POS\t%REF\t%ALT[\t%GT]\n' \
  plant_cohort_final_qc.vcf.gz > chr01_subset_genotypes.tsv
```

---

## 核心参数科学解析与植物调优指南

| 参数指令 | 推荐设置 | 物理含义与植物科研注意事项 |
| :--- | :--- | :--- |
| `-f <ref.fa>` | 必须提供 | **参考基因组 FASTA**；用于 BAQ 计算与等位基因对齐；必须与 BAM 比对所用参考基因组严格一致。 |
| `--max-depth <int>` | `500` ~ `1000` | **单样本最大覆盖深度截断**；默认仅为 250！植物多拷贝转座子或着丝粒区深度常超数千，默认截断会导致深度抽样偏差，建议适度调大。 |
| `-a FORMAT/AD,DP` | 强烈推荐开启 | **输出等位基因深度（AD）与总深度（DP）**；下游质控与等位基因频率校正的必需字段。 |
| `-m` (call) | 必需参数 | **启用多等位模型（Multiallelic Calling）**；相比已淘汰的单等位共识模型 `-c`，具备更高的灵敏度与抗噪声能力。 |
| `-Ou / -Ob / -Oz` | 按需配置 | **输出格式控制**；`-Ou`（未压缩 BCF，速度最快，适合管道传输）；`-Ob`（压缩 BCF，省空间且读写快）；`-Oz`（bgzip 压缩 VCF，通用性最佳）。 |
| `--set-GTs .` | 配合 filter 使用 | **将未通过过滤标准的劣质基因型替换为缺失（`./.`）**；保护样本矩阵不受低深度劣质位点污染。 |

---

## 植物基因组特有挑战与避坑指南

### 1. 异源多倍体与同源异构变异（Homeologous Variants）的处理
- **机制与风险**：在四倍体小麦（AABB）、普通六倍体小麦（AABBDD）或甘蓝型油菜（AACC）中，亚基因组间存在大量高度保守的序列同源区。
- **严重后果**：若直接使用默认二倍体模型（`--ploidy 2`）且未做特异比对，亚基因组之间的固有固定差异（如 A 组为 A，B 组为 G）将被 BCFtools 全盘调用为“全杂合 SNP”。
- **对策**：
  1. 采用单倍型解析的完整多倍体参考基因组，启用严苛的比对分值过滤（`MQ >= 50`）；
  2. 若进行多倍体基因型调用，必须在 `call` 中使用 `--ploidy-file` 明确指定染色体的倍性（如 `--ploidy 4` 或 `--ploidy 6`）。

### 2. 高拷贝转座子区与异常深度过滤
- 植物基因组普遍含有极高比例的逆转座子（LTR-RT）。在文库构建过程中，转座子片段被超额测序，其比对深度往往达到全基因组平均深度的数十倍。
- 这些过高深度区域通常伴随着非同源重组错配。
- **过滤准则**：在 `bcftools filter` 中，**必须同时设置深度下限与深度上限**（例如 `FORMAT/DP < 6 || FORMAT/DP > 3 * AVG_DEPTH`），坚决过滤掉深度异常畸高的重复区变异。

---

## 植物应用案例与真实文献证据

1. **水稻杂合 SNP 高精度检出与生信流水线性能基准比较**：
   在植物变异检测方法的系统性基准测试中（Zhao et al., *Plant Methods*, 2025），研究人员利用真实杂交水稻重测序数据，全面评测了包括 BCFtools mpileup 在内的多种变异检出方案。结果表明，BCFtools 在开启 BAQ 重校准后，对低频 SNP 和杂合位点的检出精确度（Precision）达到 98.5% 以上，且内存占用与 CPU 计算耗时仅为 GATK 的 1/5，展现出在超大规模植物重测序项目中无可替代的计算性能（[Zhao et al., *Plant Methods*, 2025](https://doi.org/10.1186/s13007-025-01437-x)）。

---

## 实践排错与质控规范

- **错误 1：`bcftools call` 报错 `Failed to read from standard input: partial file`**
  - *排查原因*：上游 `bcftools mpileup` 因参考基因组路径错误、某个 BAM 索引丢失或内存耗尽提前退出，导致管道断裂。
  - *解决方案*：检查每一个 BAM 文件的 `.bai` 索引是否齐全；在运行前用 `samtools quickcheck` 检查 BAM 文件的完整性。
- **错误 2：输出 VCF 的染色体未排序，下游工具（如 PLINK 或 tabix）无法建索引**
  - *排查原因*：输入的多个 BAM 文件所使用的参考基因组表头染色体顺序不一致。
  - *解决方案*：在过滤后使用 `bcftools sort -Oz -o sorted.vcf.gz` 重新按坐标升序排序，随后用 `bcftools index -t` 创建 Tabix 索引。
