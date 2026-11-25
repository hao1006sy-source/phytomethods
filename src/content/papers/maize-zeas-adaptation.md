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
updatedAt: 2026-11-25
---
## 研究问题与材料范围
玉米从热带起源向温带高纬度地区扩散过程中经历了强烈的气候与光周期适应性选择。Xu 等（2022）收集 **982 份玉米自交系** 与 **190 份大刍草（teosinte）材料**，利用 MaizeSNP50 芯片获取全基因组标记，质控过滤后保留 **42,204 个高质量 SNP**，通过"teosinte—玉米"（驯化）与"热带—温带玉米"（适应）两组比较，解析驯化与环境适应的遗传选择特征。

## 分析流程
1. **群体结构与系统关系推断**：使用 **ADMIXTURE**、主成分分析（PCA）及系统发育树检视 1,172 份材料的遗传结构与分群。
2. **多统计量选择性清除扫描**：以 **100 kb 窗口、10 kb 步长** 分别计算窗口化 $F_{ST}$ 与 **XP-CLR** 统计量，取各自经验分布 **前 0.5%** 区域并合并连续窗口。
3. **GWAS 共定位与富集检验**：将公开开花期 GWAS 信号与候选选择区间共定位，并通过置换检验（permutation）评估功能富集。

## 软件明细表格
| 软件 / 方法 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **ADMIXTURE** | 推断玉米自交系与大刍草群体的祖先成分与分群 | 明确热带玉米、温带玉米与大刍草之间的遗传结构边界 |
| **XP-CLR** | 基于多位点等位基因频率变化扫描驯化与适应信号 | 分别鉴定出 394 个驯化特征区（约 5.7% 基因组）与 360 个适应特征区（约 5.5%） |
| **窗口化 $F_{ST}$** | 评估单标记层面的群体间遗传分化 | 与 XP-CLR 候选区重叠有限，体现单标记分化与多位点频率模型的互补性 |

## 主要科研发现
- 鉴定出 **394 个驯化特征区域** 与 **360 个环境适应特征区域**，并结合开花期 GWAS 提出 **10 个与开花期适应相关的候选基因**（如与光周期响应相关的 `GRMZM2G169293`）。
- 指出由于样本未纳入地方品种，该设计无法将所有驯化特征与现代改良特征完全拆分。

## 阅读与数据复现资源
- **原始论文**：[BMC Plant Biology (2022)](https://doi.org/10.1186/s12870-022-03427-w) | [SpringerLink](https://link.springer.com/article/10.1186/s12870-022-03427-w)
- **相关站内资源**：[M05-03 群体结构](../../topics/population-genetics/m05-topic-03/)、[M05-05 选择性清除](../../topics/population-genetics/m05-topic-05/)、[驯化与环境适应案例](../../topics/population-genetics/m05-topic-07/)
- **数据复现**：基因型与相关数据详见原文 Data Availability 部分。
