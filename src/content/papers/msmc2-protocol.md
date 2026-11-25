---
title: "MSMC and MSMC2: The Multiple Sequentially Markovian Coalescent"
summary: "提供 MSMC 与 MSMC2 算法规范、全基因组可比对掩码准备、成对边际共祖聚合与可复现群体历史分析协议。"
authors: "Schiffels S, Wang K"
year: 2020
journal: Methods in Molecular Biology
doi: 10.1007/978-1-0716-0199-0_7
type: method
methodIds: [msmc2]
domainIds: [population-genetics]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

# MSMC and MSMC2: The Multiple Sequentially Markovian Coalescent Protocol

## 1. 研究背景与算法贡献

顺序马尔可夫共祖模型（SMC）在解析群体有效群体大小（$N_e$）与群体分化时间历史中扮演了关键角色。然而，初代 MSMC（Schiffels & Durbin 2014）在实际应用中遇到了严峻的计算复杂度天花板：因为初代算法直接构建多条单倍型的全联合状态空间，状态数量随单倍型数量呈指数级激增，使得实际分析最多仅能支持 8 条单倍型；同时，在缺乏严格质量控制时，测序深度偏低、着丝粒重复序列以及跨物种错误比对会剧烈扭曲共祖速率推断。

为了解决计算可扩展性瓶颈并确立实验数据的标准质控范式，Stephan Schiffels 与 Ke Wang（王克）在 2020 年受邀于 Springer 经典方法丛书 *Methods in Molecular Biology*（Vol 2090）发表了权威实验协议 **MSMC and MSMC2: The Multiple Sequentially Markovian Coalescent**。该协议系统重构了算法理论并推出了 **MSMC2**：
- **成对边际共祖聚合（Pairwise Marginal Coalescence）**：巧妙地将全联合状态空间解耦为所有单倍型对的成对边际似然集合，将计算复杂度从指数级骤降为多项式级，支持数十乃至上百条单倍型的超大规模联合推断；
- **全流程可复现分析标准协议**：规范了从原始比对 BAM 文件到全基因组可比对性掩码（Mappability Mask）、单倍型物理定相（Phasing）、输入格式转换、时间区间调优直至相对共祖率（RCCR）解读的完整最佳实践指南。

---

## 2. 核心数学模型与数据结构

### 2.1 成对边际共祖聚合近似理论

MSMC2 的核心算法飞跃在于摆脱了追踪所有单倍型联合首共祖状态的高维陷阱。对于输入的 $M$ 条定相单倍型：
- 集合中共包含 $\binom{M}{2} = \frac{M(M-1)}{2}$ 对两两单倍型组合 $(i, j)$；
- MSMC2 对每一对单倍型运行类似于改进版 PSMC 的双序列隐马尔可夫模型；
- **全局共祖速率加权聚合**：全群体的平均瞬时共祖速率 $\lambda(t)$ 被定义为所有成对单倍型共祖速率的边际无偏均值：
  $$\lambda(t) = \frac{1}{\binom{M}{2}} \sum_{1 \le i < j \le M} \lambda_{ij}(t)$$
- 从而直接推导出目标群体的历史有效群体大小：$N_e(t) = \frac{1}{2 \lambda(t)}$。

该近似在保持对近期历史极高统计灵敏度的同时，彻底杜绝了初代 MSMC 由于高维状态数值舍入引发的虚假震荡，且支持在多核 CPU 与集群上对成对单倍型进行极速并行化求解。

### 2.2 全基因组可调用区域掩码（Mappability & Callable Masks）

群体历史推断模型对未突变区域的纯合度（Homozygosity）高度敏感。若某基因组区域由于测序深度不足、多拷贝转座子串联重复或低可比对性而未能检测到 SNP，模型会错误地将其判定为“发生了极长片段的近期共祖纯合”，从而严重夸大近期群体的瓶颈萎缩程度。MSMC2 协议强制要求构建两个严谨的 BED 格式掩码文件：
1. **参考基因组可比对性掩码（Mappability Mask）**：利用 `snpable` 或 GEM 库模拟全基因组 50–150 bp 读段的比对唯一性，严格过滤所有存在多重匹配的多拷贝区间；
2. **样本特异性测序深度掩码（Coverage Mask）**：利用 `bamCaller.py` 过滤测序深度低于全基因组均值一半或高于均值两倍的异常区域。

---

## 3. 算法复杂度与计算性能

1. **计算性能与扩展性**：相比初代 MSMC 最多处理 8 条单倍型，MSMC2 能够轻松扩展至 16、32 乃至 64 条单倍型，分析速度提速 10 至 50 倍。
2. **输入格式统一**：原生采用 `multihetsep.txt` 单倍型杂合位点格式，每一行记录包含染色体号、物理坐标以及各样本单倍型等位基因调用状态。
3. **内存开销平缓**：基于成对边际解耦设计，内存占用与单倍型总数呈线性微弱增长，单台 32 GB 内存工作站即可胜任全套计算。

---

## 4. 植物基因组学应用场景与科研价值

植物基因组往往具有高杂合度、高转座子比例以及复杂的倍性生活史，MSMC2 标准协议在植物学研究中具有决定性指导价值：
- **非模式植物全基因组 Mask 的严苛过滤**：在玉米（TE > 80%）、大麦等大基因组复杂植物中，严格执行 MSMC2 协议中的可比对掩码过滤，是防止将非特异性转座子错配误判为杂合信号的核心防线；
- **植物农业驯化近期精细历史还原**：利用 8 到 16 条单倍型，高分辨率重建近 1 万年来农家种在人类定向选择下的群体动态收缩；
- **跨群体基因流与渐渗定年**：在野外同域分布的近缘植物物种间，利用多样本 RCCR 分析判定物种形成是“带有持续渐渗基因流的同域分化”还是“完全物理隔离后的异域分化”。

---

## 5. 输入输出规范与关键参数指南

### 5.1 核心分析流程与执行步骤 (MSMC2 官方标准协议)
```bash
# 步骤 1: 生成参考基因组可比对性掩码 (以 100 bp reads 为例)
# 使用 genmap 或 snpable 预生成 ref_mappable_100.mask.bed.gz

# 步骤 2: 利用 bamCaller.py 为每个样本生成深度掩码与 consensus
samtools mpileup -q 20 -Q 20 -C 50 -u -r chr01 -f plant_ref.fa sample1.bam | \
  bcftools call -c -V indels | \
  python bamCaller.py 25 sample1_mask.bed.gz | \
  gzip -c > sample1_consensus.vcf.gz

# 步骤 3: 提取全样本联合杂合位点并合并掩码 (包含多样本定相 VCF)
python generate_multihetsep.py \
  --mask=ref_mappable_100.mask.bed.gz \
  --mask=sample1_mask.bed.gz \
  --mask=sample2_mask.bed.gz \
  phased_snps_chr01.vcf.gz > chr01.multihetsep.txt

# 步骤 4: 运行 MSMC2 执行有效群体大小推断 (16 条单倍型)
msmc2 \
  -t 16 \
  -p 1*2+25*1+1*2 \
  -o msmc2_pop_out \
  chr01.multihetsep.txt chr02.multihetsep.txt ...

# 步骤 5: 结果转换并生成年代曲线
python msmc_runtime_plot.py \
  -u 6.5e-9 \
  -g 1 \
  msmc2_pop_out.final.txt
```

### 5.2 关键参数说明
- `-t 16`：OpenMP 并行线程数，多染色体与多单倍型对自动并行分发。
- `-p 1*2+25*1+1*2`：时间窗口模式，根据样本单倍型数量调整，单倍型较多时可适当增加近期独立区间的数量以提升近代分辨率。

---

## 6. 阅读与复现资源

- **原始协议章节**：[Methods in Molecular Biology 2020 DOI: 10.1007/978-1-0716-0199-0_7](https://doi.org/10.1007/978-1-0716-0199-0_7)
- **PubMed 记录**：[PMID: 32239408](https://pubmed.ncbi.nlm.nih.gov/32239408/)
- **MSMC2 官方开源代码库**：[stschiff/msmc2 GitHub](https://github.com/stschiff/msmc2)
- **配套预处理工具集**：[stschiff/msmc-tools GitHub](https://github.com/stschiff/msmc-tools)
- **站内配套专题**：[群体历史动态与有效群体大小推断](../../topics/population-genetics/m05-topic-06/)
- **站内配套专题**：[群体遗传变异与分化统计指标](../../topics/population-genetics/m05-topic-01/)
