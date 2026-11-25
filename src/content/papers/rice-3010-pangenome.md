---
title: "Genomic variation in 3,010 diverse accessions of Asian cultivated rice"
summary: "对来自 89 个国家的 3,010 份亚洲栽培稻进行全基因组重测序，构建包含千万级 SNP/Indel 与非参考大片段 PAV 的全球水稻泛基因组遗传变异宏图。"
authors: "Wang W, Mauleon R, Hu Z, et al. (The 3,000 Rice Genomes Project)"
year: 2018
journal: Nature
doi: 10.1038/s41586-018-0063-9
type: application
methodIds: [eupan]
domainIds: [population-genetics, pangenomics-structural-variation]
speciesIds: [rice]
status: published
updatedAt: 2026-11-25
---

## 研究问题与材料范围

作为全球半数以上人口的主食，水稻在长期地理扩散与人工驯化中形成了极其广袤的遗传多样性。此前，水稻基因组学主要依赖单一种质（Nipponbare 日本晴）作为单一参考，对全球天然种质库中的隐藏优异基因资源认知极其局限。

由中国农科院（CAAS）、国际水稻研究所（IRRI）以及华大基因（BGI）联合发起的 **“3,000 份水稻基因组计划”（3K RGP）**，是植物基因组学史上规模最大的重测序里程碑项目：
- 精选收集了来自全球 89 个主要水稻种植国的 **3,010 份亚洲栽培稻（*Oryza sativa* L.）核心种质**（涵盖代表性的地方品种、农家种与现代育成品种）；
- 全群体 Illumina 高通量重测序，平均测序物理深度约 14×（从 10× 到 30×，其中 453 份样本平均测序深度 $>20\times$）；
- 产出了规模达数百亿对双端测序读段的庞大数据库，系统探究亚洲栽培稻的精细遗传分群、结构变异全景与核心/可变基因组容量。

---

## 基因组学与生物信息学分析流程

1. **海量短读段比对与单倍型变异呼叫**：
   使用 **BWA-MEM** 将 3,010 份测序读段比对至水稻参考基因组（Nipponbare IRGSP-1.0）；使用 **GATK** 框架执行全基因组联合分型，获得了包含 **2,900 万个双等位 SNPs** 与 **240 万个小片段插入缺失（Indels）** 的超高密度变异图谱；
2. **群体遗传分群与系统发育推断**：
   - 提取经 **PLINK** 剪枝的高质量 45 万个无偏 SNP 子集；
   - 运行 **ADMIXTURE** 在 $K = 2 \sim 15$ 范围内系统推断祖先群体成分，结合 **FastTree** 构建全基因组近邻结合系统发育树；
   - 确立了亚洲栽培稻五大主群（Indica 籼稻, Japonica 粳稻, Aus/Boro 澳洲稻, Basmati/Sadri 芳香稻, Aromatic）及细分的 9 个亚群；
3. **Map-to-pan 泛基因组构建与基因 PAV 鉴定 (EUPAN)**：
   - 从 453 份测序深度 $>20\times$ 的代表性样本中，提取未对齐至 Nipponbare 的高质读段，利用 SOAPdenovo2 进行独立 *de novo* 组装；
   - 使用 **EUPAN** 清洗、去冗余并合并非参考序列，构建出扩展了 268 Mb 新序列的线性泛基因组参考；
   - 基于基因体覆盖度 $\ge 80\%$ 与 CDS 编码区覆盖度 $\ge 95\%$ 的严格准则，调用 `eupan geneExist` 导出全群体基因存在缺失变异（PAV）矩阵；
   - 利用 Heaps 定律评估水稻核心基因组（Core Genome）与可变基因组（Dispensable Genome）的容量饱和曲线。

---

## 软件在研究中的具体作用

| 软件 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **BWA-MEM** | 将 3,010 份水稻全基因组短读段映射至 Nipponbare 参考基因组 | 完成海量 PB 级原始测序数据的参考坐标对齐，比对率稳定在 95% 以上 |
| **GATK** | 全基因组群体联合 SNP 与 InDel 检测及严格质量过滤 | 构建包含 2900 万个 SNPs 的当时全球最大农作物变异数据库 |
| **PLINK (v1.9)** | 全基因组连锁不平衡剪枝与主成分降维（PCA） | 揭示水稻群体第一主成分对应籼粳分化，第二主成分对应地理纬度生态分化 |
| **ADMIXTURE** | 评估全群体在多 $K$ 模型下的祖先遗传渗入 | 精准界定 5 大主群与 9 个细分亚群，并识别出大量杂交渗入材料 |
| **FastTree** | 基于全基因组 SNP 距离矩阵快速构建大规模系统发育树 | 揭示 Aus 与 Indica、Basmati 与 Japonica 之间的亲缘支系演化拓扑 |
| **EUPAN (v0.44)** | 组装非参考 contigs，构建线性 Pan-genome 并呼叫基因 PAV | 鉴定 268 Mb 非参考新序列与 12,465 个全群存在缺失变异基因 |

---

## 主要科研发现与农艺性状突破

1. **确立九大基因组亚群分类基准**：
   将 3,010 份材料高精度划分为籼稻 4 个亚群（XI-1A, XI-1B, XI-2, XI-3）、粳稻 3 个亚群（GJ-tmp 温带粳稻, GJ-trp 热带粳稻, GJ-subtrop 亚热带粳稻）、Aus 群（cA）与 Basmati 芳香群（cB），成为全球水稻遗传学研究的标准分类参考；
2. **水稻泛基因组容量与 268 Mb 新增非参考序列**：
   发现每个水稻品系平均缺失参考基因组中约 1,000~2,000 个基因，而在非参考组装中新鉴定了高达 268 Mb 的全新序列，包含上万个在标准日本晴中完全缺失的基因模型；
3. **关键抗逆与抗病 PAV 的全群分布**：
   - 著名耐淹水稻核心基因 *Sub1A* 证实仅存在于特定籼稻亚群中，在全部粳稻中绝对缺失；
   - 稻瘟病抗性基因（*Pita*, *Pik*, *Pib*）及抗白叶枯病基因表现出强烈的亚种间 PAV 分离特性，为水稻跨亚种抗病抗逆基因渗入育种指明了精准路径。

---

## 阅读与数据复现资源

- **期刊全文**：[Nature, 557, 43–49 (2018)](https://doi.org/10.1038/s41586-018-0063-9)
- **PubMed 记录**：[PMID: 29695866](https://pubmed.ncbi.nlm.nih.gov/29695866/)
- **原始测序数据存取号**：NCBI BioProject **PRJNA262923**（包含 3,010 份样本的全部 SRA 原始测序数据）
- **变异与基因组资源门户**：Rice Functional Genomics & Breeding Database (RFGB) 及 ENA **ERP008453**
