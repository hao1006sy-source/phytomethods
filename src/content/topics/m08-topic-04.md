---
title: 标记基因与细胞类型注释：Wilcoxon 检验、Pseudobulk 伪重复规避与植物根系解剖标记图谱
summary: 深入推导单细胞 Wilcoxon 秩和检验、AUC 特异性打分、Pseudobulk 样本聚合规避伪重复以及拟南芥和水稻根系解剖同心圆经典标记基因全景图谱。
domain: single-cell-spatial-omics
methods: [scanpy]
status: published
updatedAt: 2026-11-25
---

## 核心科学问题：计算聚类簇向生物学真实身份的跨越

无监督聚类算法（如 Leiden）所产生的“Cluster 0, Cluster 1, Cluster 2…”仅仅是数学表达空间上的连续邻近聚集体，它们本身**不具备任何生物学语义**。将计算聚类赋予生物学细胞类型（如“根毛细胞”、“内皮层细胞”、“厚壁组织”），是单细胞转录组分析中最核心也最易出现主观偏倚的关键步骤。

植物细胞类型注释具有极高的复杂性：
1. **多倍体与同源基因冗余**：许多核心转录因子在植物基因组中存在串联重复或全基因组加倍演化出的旁系同源基因（Paralogs），不同旁系成员在不同细胞亚群中可能发生亚功能化（Subfunctionalization）；
2. **细胞状态与细胞类型的混淆**：受生长素（Auxin）、细胞周期（S/G2M 期）或病原菌侵染诱导的瞬时“细胞状态”，极易被聚类算法切分成独立的群，导致其被错误命名为“新型细胞类型”；
3. **统计学伪重复陷阱**（Pseudoreplication）：将来自同一植株同一组织的数千个细胞当作数千个独立实验重复进行假设检验，会导致极度虚假的极低 $P$ 值（如 $P = 10^{-300}$），放大细微的技术批次波动。

---

## 算法数学推导：差异表达、特异性评价与 Pseudobulk 聚合

### 1. Wilcoxon 秩和检验（Mann-Whitney $U$ Test）与 AUC 打分

单细胞数据具有极高的零膨胀率与偏态分布，非参数秩和检验成为快速筛选簇特异高表达 Marker 基因的标准方案。

**数学推导过程**：
设待检验细胞簇 $A$ 包含 $n_A$ 个细胞，其余所有对比细胞簇 $B$ 包含 $n_B$ 个细胞。
1. 将两组细胞在某基因 $g$ 上的表达量混合，按升序排列，赋予每个细胞秩次 $R_i$（平局值取平均秩）；
2. 计算簇 $A$ 中所有细胞的秩和：
   $$R_A = \sum_{i \in A} R_i$$
3. 计算 Mann-Whitney 统计量 $U_A$：
   $$U_A = R_A - \frac{n_A (n_A + 1)}{2}$$
4. 计算受试者工作特征曲线下面积（ROC AUC）：
   $$\text{AUC} = \frac{U_A}{n_A \cdot n_B}$$
   - $\text{AUC} = 1.0$：完美的排他性特异标记（簇 $A$ 中所有细胞的表达量均严格高于簇 $B$ 中的所有细胞）；
   - $\text{AUC} = 0.5$：随机表达，无任何区分能力。

### 2. 细胞特异性评分（Specificity Score）方程

为了规避仅依据 $P$ 值挑选出在全组织广泛高表达的持家基因，通常综合表达强度倍数（Log Fold Change）与细胞检出百分比（Percent Expressed）：
$$\text{Score}(g, A) = \log_2(\text{FC}_{g, A}) \cdot (pct_{g, A} - pct_{g, B}) \cdot \left( \frac{pct_{g, A}}{pct_{g, B} + \epsilon} \right)$$
其中 $pct_{g, A}$ 表示基因 $g$ 在簇 $A$ 中表达量大于 0 的细胞比例，$pct_{g, B}$ 为在其他所有簇中的检出比例。高分标记基因必须同时满足：**在目标簇高比例检出且在背景簇近乎静默**。

### 3. Pseudobulk 伪大块样本聚合与伪重复消除

当对比不同实验处理（如耐盐处理 vs. 对照）下某一特定细胞类型的差异基因时，直接以细胞为样本进行显著性检验会产生严重的**假阳性膨胀**（Type I Error 膨胀）：
- 相同组织培养皿中的 5,000 个细胞共享相同的微环境波动与制备批次；
- **Pseudobulk 解决方案**：
  1. 对每个独立的生物学植株/样本重复 $k$（如 Biological Replicate 1, 2, 3），将该样本中属于特定细胞类型 $C$ 的所有细胞的原始 UMI 计数进行按基因求和：
     $$Y_{g, k}^{(C)} = \sum_{c \in \text{Sample}_k \cap \text{Cluster}_C} x_{cg}$$
  2. 生成样本数仅为 $N_{\text{samples}}$ 的 Pseudobulk 计数矩阵，随后使用经过数十年严密验证的负二项广义线性模型（如 DESeq2 / edgeR）进行差异假设检验，真实受控于生物学独立重复变异。

---

## 植物经典科学案例：拟南芥根系解剖结构同心圆标记基因图谱

植物根尖分生组织由外向内呈现严密规则的**同心圆柱状解剖排列**，构成了植物单细胞研究的黄金参照系（*Shahan et al., Developmental Cell, 2022*）：

```text
根冠/小柱细胞 (Columella) ──> 表皮层 (Epidermis) ──> 皮层 (Cortex) ──> 内皮层 (Endodermis) ──> 中柱鞘 (Pericycle) ──> 维管束 (Stele/Xylem/Phloem)
```

| 组织解剖层级 | 经典功能与生物学特征 | 拟南芥权威标记基因（Marker Genes） | 水稻/玉米同源标记 |
| :--- | :--- | :--- | :--- |
| **静止中心**（QC） | 多能干细胞源头，超低有丝分裂频率 | *WOX5* (AT3G11260), *AGL42* | *OsWOX5*, *ZmWOX5* |
| **根冠与小柱**（Columella） | 感知重力重力小体，脱落防护 | *SMB* (SOMBRERO), *FEZ*, *CYP705A22* | *OsSMB*, *OsFEZ* |
| **表皮根毛细胞**（Trichoblast） | 侧向伸长形成根毛，水分与营养吸收 | *COBL9* (AT5G49270), *PRP3*, *RHD6* | *OsEXPA17*, *OsRSL4* |
| **表皮非根毛细胞**（Atrichoblast）| 规则紧密排列的表皮平整细胞 | *GL2* (GLABRA2), *WER* (WEREWOLF) | *OsGL2* |
| **皮层**（Cortex） | 贮藏与物理缓冲间质细胞 | *PEP* (PEANUT), *COR* (AT1G09750) | *OsCORTEX* |
| **内皮层**（Endodermis） | 凯氏带（Casparian Strip）疏水木质素沉降 | *SCR* (SCARECROW), *SHR*, *MYB36*, *CASP1* | *OsSCR*, *OsCASP1* |
| **中柱鞘**（Pericycle） | 侧根原基发生的起始母细胞层 | *GATA23*, *SKP2B*, *HCA2* | *OsGATA23* |
| **初生木质部导管**（Xylem） | 输导水分无机盐，次生细胞壁螺旋加厚 | *VND7*, *TMO5*, *LBD30*, *IRX3* | *OsVND7*, *OsCESA4* |
| **韧皮部筛管与伴胞**（Phloem） | 输导光合产物蔗糖与系统性信号分子 | *APL*, *SUC2* (蔗糖转运体), *SEOR1* | *OsSUT1*, *OsSEOR1* |

---

## 关联工具与复现入口

- **Scanpy**：通过 `sc.tl.rank_genes_groups(adata, groupby='leiden', method='wilcoxon')` 快速筛选候选 Marker，并使用 `sc.pl.dotplot`、`sc.pl.matrixplot` 与 `sc.pl.stacked_violin` 绘制高质量学术表达特征图。
- **Decoupler / decoupler-py**：用于一键将单细胞 AnnData 转换为样本级 Pseudobulk 矩阵。
- 参见[拟南芥根发育单细胞图谱文献解读](../../../papers/arabidopsis-root-atlas-2022/)与[单细胞标记基因筛选实战教程](../../../tutorials/scanpy-synthetic/)。
