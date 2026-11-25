---
title: "A complete assembly of the rice Nipponbare reference genome"
summary: "完成水稻 Nipponbare 参考基因组 T2T 组装，补充既有参考序列中缺失的基因组信息。"
authors: "Shang L et al."
year: 2023
journal: Molecular Plant
doi: 10.1016/j.molp.2023.08.003
type: application
methodIds: []
domainIds: [genome-assembly]
speciesIds: [rice]
updatedAt: 2026-11-25
---
## 研究问题与材料范围
水稻日本晴（Nipponbare）是最重要的模式植物参考基因组之一，但既有参考版本（IRGSP-1.0）仍存在端粒、着丝粒及高重复区域的组装缺口。Shang 等（2023）利用长读段测序与多技术整合组装策略，完成了无缺口的水稻日本晴 **端粒到端粒（T2T-NIP）完整参考基因组**。

## 分析流程
1. **高深度长读段测序与从头组装**：整合 PacBio HiFi、ONT 超长读段（ultra-long reads）及 Hi-C 互作数据构建连续染色体骨架。
2. **端粒与着丝粒缺口闭合**：利用超长读段跨越高度重复的着丝粒卫星阵列（CentO）与 rDNA 区域，实现 12 条染色体的完整闭合。
3. **完整度与准确度评估**：基于端粒特征序列（TTTAGGG）、着丝粒串联重复及测序覆盖度均一性验证 T2T 组装质量，并重新注释新补充区域的基因与重复序列。

## 软件明细表格
| 软件 / 流程 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **长读段混合组装流程** | 整合 HiFi、ONT 超长读段与 Hi-C 构建 T2T-NIP | 跨越着丝粒与 rDNA 等高重复区域，消除既有参考序列中的组装缺口 |
| **端粒/着丝粒与基因注释** | 端粒重复序列识别与新增区域基因注释 | 补充了此前约 3% 的缺失基因组信息，完善着丝粒区结构图谱 |

## 主要科研发现
- 完成了水稻日本晴 T2T-NIP 完整参考基因组，**补充了此前参考基因组中约 3% 的缺失序列信息**（主要位于着丝粒、端粒及高度重复区）。
- 为水稻着丝粒演化、表观遗传修饰及高重复区功能基因研究提供了无缺口参考标准。

## 阅读与数据复现资源
- **原始论文**：[Molecular Plant (2023)](https://doi.org/10.1016/j.molp.2023.08.003)
- **PubMed**：[PMID: 37553831](https://pubmed.ncbi.nlm.nih.gov/37553831/)
- **数据复现**：原始 reads、组装与注释数据已提交至 NCBI BioProject（`PRJNA953663`）与 NGDC（`PRJCA018610`）。
