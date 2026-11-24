---
title: 完整基因组组装与复杂区域解析 (T2T)
summary: 深度解析端粒到端粒（T2T）标准定义、植物 TTTAGGG 端粒与 CentO/CentC 着丝粒重复结构、Verkko 混合组装算法及水稻、西瓜真实植物 T2T 突破。
domain: genome-assembly
methods: [hifiasm, verkko]
updatedAt: 2026-11-25
---

## 从染色体草图迈向端粒到端粒（T2T）全贯通

自 2000 年拟南芥基因组（AGI）及 2005 年水稻日本晴参考基因组（IRGSP-1.0）公布以来，植物基因组学经历了从一代 BAC-by-BAC 测序、二代短读段拼装到三代长读段挂载的技术跃升。然而，即便是在获得高连续性染色体级 Scaffold 的黄金时代，全基因组各染色体内部依然残留着数百处未闭合缺口（Gaps）。

这些缺失或高度塌缩的“暗物质（Dark Matter）”区域，正是真核生物基因组中生物学功能极其核心、但序列极端复杂的致密异染色质区：
1. **着丝粒（Centromere）**：确保减数分裂与有丝分裂中染色体均等分离的动力学核心枢纽；
2. **端粒（Telomere）**：维持染色体末端结构完整性与防止 DNA 降解的保护帽；
3. **核糖体 DNA 阵列（rDNA arrays）**：编码 45S 与 5S 核糖体 RNA 的核仁组织区（NOR）。

端粒到端粒（Telomere-to-Telomere, T2T）组装标准的提出，标志着植物基因组学正式告别了充满未知拼图的“草图时代”，迈入每一个碱基均具备可验证物理证据的终极完整时代。

---

## 植物难测复杂区域的序列结构与生物学特征

| 基因组复杂区域 | 植物代表性序列特征 | 长度与拷贝规模 | 组装核心物理瓶颈 | 实验验证金标准 |
| :--- | :--- | :--- | :--- | :--- |
| **染色体端粒 (Telomeres)** | 植物经典 7-bp 基序 `(TTTAGGG)n`；少数植物呈现变体 (如葱属 `CTCGGTTTATGG`) | 单侧末端通常为 2~10 kb；部分物种达数十 kb | 末端单链悬垂、高 GC/AT 偏差与发夹结构 | 端粒特异性末端平衡扩增 (Telomere PCR) / 荧光原位杂交 (FISH) |
| **着丝粒卫星 (Centromeres)** | 水稻 CentO (~155 bp 串联重复)；玉米 CentC (~156 bp 串联重复)；富含逆转座子 (CRR/CRM) | 连续串联排列达数兆碱基对 (1~5 Mb) | 单元间相似度 >99%，形成图论漩涡回路，极易长度塌陷 | **CenH3 (HTR12) ChIP-seq** 确认功能性着丝粒动粒组装位点 |
| **核糖体 DNA (45S rDNA)** | 串联排列的 18S-5.8S-25S 转录单元及基因间间隔区 (IGS) | 聚集为数十至数千拷贝，常横跨数个染色体臂 | 高度同质化串联扩增，常规长读段无法跨越完整阵列 | 脉冲场凝胶电泳 (PFGE) / 光学图谱 (Bionano) 测定总长度 |

---

## Verkko 现代混合组装算法架构

为了克服单一测序技术在 T2T 闭合中的局限，由人类 T2T 联盟核心成员开发、Rautiainen 等人于 2023 年发表的 **Verkko** 组装引擎，创新性地开创了“准确度优先，长读段跨越解析”的分阶段混合图组装架构：

### 1. 同聚物压缩多重德布鲁因图（Multiplex de Bruijn Graph, MBG）

- **以 HiFi 构建坚实骨架**：Verkko 首先将 PacBio HiFi 读段转换至同聚物压缩空间（Homopolymer-compressed space），消除纳米孔或测序仪在连续单碱基微卫星上的测序误差；
- **自适应多重 $k$ 值**：利用 MBG 算法在高准确度读段上构建多重德布鲁因图，图的节点代表高置信度的序列片段（Unitigs），边的连接忠实保留了局部分支。

### 2. 超长读段图联配与路径纠缠解开（GraphAligner）

- **超长读段跨越**：单条读长大于 $50\text{ kb} \sim 100\text{ kb}$ 的 ONT Ultra-long 读段被引入作为长程桥梁；
- **全图路径联配**：利用 GraphAligner 算法，将超长读段直接比对映射到 MBG 图的拓扑结构中，而不是比对到线性序列上；
- **路径重叠消除歧义**：通过多条独立超长读段在图路径上的连续重叠覆盖，系统性穿透着丝粒串联卫星阵列中的微小分歧位点（SVs 与 Divergent monomers），逐步消除分叉，实现整条染色体图路径的确定性线性贯通。

---

## 代表性植物 T2T 科研突破与实证

### 1. 水稻日本晴（Nipponbare）无缺口 T2T 基因组

Shang 等人于 2023 年在 *Molecular Plant* 上公布了水稻模式品种日本晴的无缺口 T2T 参考序列。研究完整解决了水稻全部 12 条染色体的端粒、着丝粒 CentO 阵列及 45S rDNA 簇，揭示了着丝粒内部转座子与活跃转录区段的新构象。

### 2. 西瓜（Citrullus lanatus）T2T 超级泛基因组

Deng 等人于 2024 年在 *Nature Genetics* 上报道了涵盖 27 个代表性基因型的西瓜 T2T 超级泛基因组（Super-pangenome）。相对传统非 T2T 参考基因组，新资源新增了 399.2 Mb 的复杂异染色质序列与 11,225 个此前无法准确定位的新基因，首次高分辨率绘制了瓜类作物着丝粒卫星演化的完整动力学轨迹。

---

## 参考文献与数据来源

1. **Rautiainen M, Nurk S, Walenz BP, et al.** (2023). Telomere-to-telomere assembly of diploid chromosomes with Verkko. *Nature Biotechnology*, 41(7), 1017–1024. DOI: [10.1038/s41587-023-01662-6](https://doi.org/10.1038/s41587-023-01662-6)
2. **Shang L, Li X, He H, et al.** (2023). A complete assembly of the rice Nipponbare reference genome. *Molecular Plant*, 16(8), 1232–1236. DOI: [10.1016/j.molp.2023.08.003](https://doi.org/10.1016/j.molp.2023.08.003)
3. **Deng Y, Liu S, Zhang Y, et al.** (2024). A telomere-to-telomere watermelon super-pangenome reveals the origin of quality traits and wild introgressions. *Nature Genetics*, 56(8), 1709–1720. DOI: [10.1038/s41588-024-01823-6](https://doi.org/10.1038/s41588-024-01823-6)
4. **Garg S, Rautiainen M, Kang L, et al.** (2024). Telomere-to-telomere plant pangenomes: opportunities and challenges. *Nature Genetics*, 56(8), 1544–1554. DOI: [10.1038/s41588-024-01830-7](https://doi.org/10.1038/s41588-024-01830-7)
