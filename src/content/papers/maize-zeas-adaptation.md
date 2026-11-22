---
title: "Population genomics of Zea species identifies selection signatures during maize domestication and adaptation"
summary: "以 teosinte—玉米和热带—温带玉米的分组比较研究驯化与环境适应信号。"
authors: "Xu G, Zhang X, Chen W, et al."
year: 2022
journal: BMC Plant Biology
doi: 10.1186/s12870-022-03427-w
type: application
methodIds: [admixture, xpclr]
domainIds: [population-genetics]
speciesIds: [maize]
status: published
updatedAt: 2026-11-22
---

## 研究问题与材料

研究收集 982 份玉米自交系和 190 份 teosinte 材料，使用 MaizeSNP50 芯片获取全基因组标记；质量过滤后使用 42,204 个 SNP 分析属内关系、驯化和适应。作者以 teosinte—玉米比较研究驯化，以热带—温带玉米比较研究环境适应，并使用 ADMIXTURE、主成分与系统发育分析检视样本关系。[出版方全文](https://link.springer.com/article/10.1186/s12870-022-03427-w)。

## 统计方法与论文结果

选择扫描结合窗口化 $F_{ST}$ 和 XP-CLR，使用 100 kb 窗口、10 kb 步长；论文将两种统计方法各自最高 0.5% 的区域作为候选，并分别合并连续窗口。作者报告 394 个驯化特征区域和 360 个适应特征区域，分别覆盖约 5.7% 和 5.5% 基因组；两方法的候选重叠比例有限，体现单标记分化与多位点频率模型关注信号有所不同。相关数值依赖本研究群体、芯片位点和阈值，不能与其他论文的窗口数直接比较。

作者将公开开花期 GWAS 信号与候选区间共定位，再通过置换评估富集，并提出十个与开花期适应相关的候选基因。论文举例的 `GRMZM2G169293` 位于一个适应候选区，与光周期响应相关，其效应在不同海拔关联背景下存在差异。该证据把群体统计与性状关联相连，因果变异及其作用仍需遗传和功能验证。研究未纳入地方品种，因此作者明确指出该样本设计不能把所有驯化特征与改良特征完整分开。

本文是玉米驯化与适应案例，关联 ADMIXTURE 的群体关系分析及 XP-CLR 的群体选择扫描；FST 与芯片数据等任务不归为这两个工具单独完成。相关专题：[M05-03 群体结构](../../topics/population-genetics/m05-topic-03/)、[M05-05 选择性清除](../../topics/population-genetics/m05-topic-05/)和[驯化与环境适应案例](../../topics/population-genetics/m05-topic-07/)。

## 参考记录

Xu G, Zhang X, Chen W, Zhang R, Li Z, Wen W, Warburton ML, Li J, Li H, Yang X. Population genomics of Zea species identifies selection signatures during maize domestication and adaptation. *BMC Plant Biology*. 2022;22:72. [doi:10.1186/s12870-022-03427-w](https://doi.org/10.1186/s12870-022-03427-w).
