---
title: "EUPAN enables pan-genome studies of a large number of eukaryotic genomes"
summary: "提出面向超大规模真核生物群体的端到端泛基因组分析套件 EUPAN，开创了 Map-to-Pan 范式、非参考序列挖掘流程以及基于基因覆盖度矩阵的基因存在/缺失变异（PAV）判定体系，为大规模植物泛基因组与 Heaps' Law 核心基因组演化建模奠定了方法基础。"
authors: "Hu Z, Sun C, Lu K-C, Chu X, Zhao Y, Lu J, Shi J, Wei C"
year: 2017
journal: "Bioinformatics 33(15):2408–2410"
doi: 10.1093/bioinformatics/btx170
type: method
method: eupan
methodIds: [eupan]
domainIds: [pangenomics-structural-variation]
speciesIds: [rice]
status: published
updatedAt: 2026-11-25
---

## 研究背景与算法贡献

在动植物第二代高通量测序蓬勃发展的阶段（如著名的“水稻 3,000 份核心种质基因组计划”），科研人员面对着海量的低深度或中深度二代全基因组重测序数据。然而，由于长读长三代测序尚未普及且成本极高，直接对成千上万个材料进行染色体级别的高质量从头拼接在当时是不现实的。科研人员面临着迫切的**方法学难题**：
1. **单一参考基因组带来的“暗物质序列丢失”**：将数千个地方品种或野生稻的二代短读段单纯比对到单一参考系（如日本晴），会导致大量非参考特异性功能序列（Unmapped Reads）被当作垃圾数据丢弃；
2. **缺乏标准化的基因存在/缺失变异（PAV）判定规范**：不同课题组对一个基因在某个样品中究竟是“真实缺失”还是由于“测序覆盖度波动导致的假缺失”，缺乏统一且统计鲁棒的评估阈值；
3. **缺乏端到端全自动化的泛基因组大数据流程**：数据预处理、未对齐读段独立组装、序列去冗余合并、群体读段再比对与核心/可变基因划分长期依赖分散的自制脚本，亟需标准化的流水线工具。

针对这些挑战，上海交通大学魏冬青教授团队胡志刚等人开发了 **EUPAN（Eukaryotic Pan-genome Analysis Toolkit）**。EUPAN 首次将真核生物多样本泛基因组分析形式化为模块化、端到端的计算流水线，系统确立了以 **Map-to-Pan** 为核心的大规模植物群体泛基因组分析与 PAV 判定方法。

---

## 核心数学模型与数据结构

EUPAN 架构由七大高度协作的功能模块组成，其核心计算流程如下图所示：

```
                    大规模群体二代测序 FASTQ
                               │
                               ▼
           [阶段 1: 测序质量控制与参考基因组初次比对]
         (BWA-MEM 比对至标准线性参考，分离未比对 Reads)
                               │
                               ▼
           [阶段 2: 未对齐读段从头组装与非参考序列挖掘]
        (SOAPdenovo 对未比对 Reads 独立拼接，过滤短 Contigs)
                               │
                               ▼
           [阶段 3: 聚类消除冗余，构建 Pan-genome 序列]
       (CD-HIT-EST 聚类合并生成: 线性参考 + 非冗余新增序列)
                               │
                               ▼
           [阶段 4: Map-to-Pan 群体序列读段回贴比对]
        (将全群体 Reads 重新比对至合并后的 Pan-genome)
                               │
                               ▼
           [阶段 5: 基于 CDS/Gene 覆盖度的 PAV 精准判定]
        (双阈值模型评估基因存在度，构建全群体 0/1 变异矩阵)
                               │
                               ▼
           [阶段 6: Heaps' Law 拟合与核心/可变基因组划分]
        (拟合幂律方程 $N = \kappa \cdot n^\gamma$，评估物种开放度)
```

### 1. 核心数学模型
- **Map-to-Pan 序列合成**：泛基因组序列由两部分构成：标准参考基因组 $R$ 与所有样本特异从头拼接序列经聚类合并后的非冗余超集 $E$：
  $$\text{Pan-Genome} = R \cup \text{Cluster}(E_{\text{sample}_1} \cup E_{\text{sample}_2} \dots)$$
- **双阈值基因存在/缺失（PAV）判定模型**：对于基因 $g$ 在样本 $s$ 中的状态判定，EUPAN 综合考察基因全长覆盖度（Gene Body Coverage, $C_{\text{gene}}$）与编码区外显子覆盖度（CDS Coverage, $C_{\text{cds}}$）：
  $$\text{PAV}(g, s) = \begin{cases} 1 (\text{Present}), & \text{若 } C_{\text{gene}} \ge \theta_{\text{gene}} \text{ 且 } C_{\text{cds}} \ge \theta_{\text{cds}} \\ 0 (\text{Absent}), & \text{否则} \end{cases}$$
  标准植物参数推荐将阈值设定为 $\theta_{\text{gene}} \ge 0.8$ 且 $\theta_{\text{cds}} \ge 0.8$；
- **Heaps' Law 泛基因组容量演化建模**：通过随机重抽样群体样本量 $n$，拟合泛基因组总基因数 $N(n)$：
  $$N(n) = \kappa \cdot n^\gamma$$
  当拟合指数 $\gamma > 0$ 时，表明泛基因组为**开放型（Open Pan-genome）**，新测序个体将持续带来新基因；当 $\gamma \le 0$ 时，表明泛基因组为**封闭型（Closed Pan-genome）**。

---

## 植物基因组学应用场景与科研价值

1. **大规模农作物核心种质泛基因组构建与资源盘点**：在二代测序占主导的数百至数千个植物群体重测序项目中，EUPAN 提供了标准的非参考基因挖掘与 PAV 分析范式；
2. **核心基因组（Core）与可变基因组（Dispensable）划分**：揭示农作物中必需生命维持基因与抗逆、抗病等可变基因的比例分布；
3. **驱动基于 PAV 的全基因组关联分析（PAV-GWAS）**：生成的基因存在/缺失 0/1 离散矩阵，可直接作为分子标记输入 GAPIT、EMMAX 等 GWAS 软件，挖掘控制农艺性状的关键缺失基因。

更多植物泛基因组建模与分析实操请参阅 [泛基因组与核心、可变基因组](../../topics/pangenomics-structural-variation/m03-topic-01/)。

---

## 阅读与复现资源

- **期刊正式原文**：[Bioinformatics 33(15):2408–2410 (2017)](https://doi.org/10.1093/bioinformatics/btx170)
- **PubMed 检索记录**：[PMID: 28369371](https://pubmed.ncbi.nlm.nih.gov/28369371/)
- **官方代码与资源库**：[EUPAN 工具包主页](http://cgm.sjtu.edu.cn/eupan/)
- **GitHub 维护版本**：[zhb/eupan (GitHub)](https://github.com/cgm-sjtu/eupan)
