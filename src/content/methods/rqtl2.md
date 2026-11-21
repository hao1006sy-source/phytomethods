---
title: R/qtl2
name: R/qtl2
summary: 面向实验杂交群体和多亲本设计的 R 包，用于估计 QTL 基因型概率并扫描数量性状关联。
dataType: 分离群体标记基因型、遗传图谱、表型与协变量
principle: 多点基因型概率与 QTL 全基因组扫描
domainIds: [gwas-breeding]
topicIds: [m06-topic-02]
principleIds: [qtl-linkage-mapping]
dataIds: [variant-data, phenotype]
paper: rqtl2-paper
repository: https://github.com/rqtl/qtl2
version: 0.46 (2026-07-21)
status: published
updatedAt: 2026-11-22
---

## 一句话简介与开发背景
R/qtl2（CRAN 包名 `qtl2`）是用于实验杂交群体 QTL 分析的 R 工具，由 R/qtl 工作流重写而来，以支持高维数据、复杂多亲本群体及关联的混合模型扫描。版本快照采用官方 GitHub release 标记 0.46（2026-07-21）。[官方仓库](https://github.com/rqtl/qtl2)；[版本记录](https://github.com/rqtl/qtl2/releases)

## 解决的生物学与计算问题
双亲分离群体、回交群体、重组自交系和多亲本群体可将已知亲本的遗传差异与后代表型联系起来。QTL 定位需要由已观测标记推断未观测基因组位置的潜在基因型，再评估这些基因型与性状的关联。群体设计决定合法的遗传状态、亲本贡献和统计模型，工具不能把不匹配的群体说明套用到其他物种或倍性。

## 算法原理与实现流程
方法论文把分析分为两部分：根据多点标记基因型计算潜在 QTL 位置的基因型概率；再使用这些概率做表型扫描。R/qtl2 以隐马尔可夫模型（hidden Markov model，HMM）描述标记间的遗传状态转移，根据观察到的标记数据推断沿遗传图谱的潜在基因型概率。群体类型及育种方案决定 HMM 的 founder-haplotype 状态结构；官方开发文档也允许在其内置模型不覆盖的方案中准备并导入自定义基因型概率。[方法论文](https://doi.org/10.1534/genetics.118.301595)；[开发者指南](https://rqtl.org/qtl2/assets/vignettes/developer_guide.html)

典型分析由 `read_cross2()` 读入实验设计文件，`insert_pseudomarkers()` 在遗传图谱上插入扫描位置，`calc_genoprob()` 计算基因型概率，`scan1()` 对候选位置拟合单 QTL 模型并输出 LOD 曲线。根据模型可提供协变量和 kinship 矩阵；`scan1perm()` 用与扫描设计匹配的置换估计阈值。`scan1()` 的 LOD 峰提供候选定位证据，不自动识别因果基因。[官方用户指南](https://rqtl.org/qtl2/assets/vignettes/user_guide.html)

## 输入、输出与重要参数
输入由 `cross2` YAML 配置及其关联文件构成，通常包括染色体标记顺序、遗传图谱、基因型、表型和可选协变量。输入表格的样本名、标记名、染色体名必须一致；亲本/创始者信息与群体类型编码影响可推断的基因型状态。常见对象包括基因型概率 RDS 文件、map 和 scan 结果。多性状表型可批量扫描；有亲缘结构时可传入 kinship，采用 LOCO 时按染色体提供 kinship 列表。

报告 `calc_genoprob()` 的 `error_prob`、网格步长、遗传图谱单位、扫描模型、协变量、kinship 方案、置换次数和分层设置；随机置换保留种子和完整参数。用于植物异源多倍体或亲本遗传剂量超过软件支持范围的群体前，须单独确认模型对倍性与遗传方式的支持。

## 植物应用案例与验证边界
水稻深根性研究采用 180 条 F8 重组自交系进行连锁 QTL 定位，并以 237 份水稻材料开展关联分析；论文报告六个与深根比例相关的 QTL，另报告 1,019,883 个 SNP 的关联扫描结果。该研究连接受控群体与多样材料证据，页面不把作者的软件流程归为 R/qtl2（该包论文发表于 2019 年）。[原始应用研究](../../papers/rice-deep-rooting-qtl/)

## 方法学论文、教程与代码
代表性软件论文为 Broman 等 2019 年 *Genetics* 论文，题名、作者、期刊与 DOI 见[本站论文记录](../../papers/rqtl2-paper/)。官方代码仓库为 [rqtl/qtl2](https://github.com/rqtl/qtl2)，官方分析说明见 [R/qtl2 用户指南](https://rqtl.org/qtl2/assets/vignettes/user_guide.html)。本地尚未运行 R/qtl2 或真实植物群体教程。

## 相关专题和上下游
本工具对应[M06-02 QTL 定位与遗传连锁](../../topics/gwas-breeding/m06-topic-02/)；上游是分离群体的表型测量、亲本资料、基因型调用与遗传图谱，下游包括候选区间精细定位、独立群体验证、标记辅助选择及功能验证。
