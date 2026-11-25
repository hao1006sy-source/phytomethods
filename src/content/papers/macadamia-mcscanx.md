---
title: "The genome of the endangered Macadamia jansenii displays little diversity but represents an important genetic resource for plant breeding"
summary: "使用 MCScanX 对澳洲坚果属基因组注释开展重复基因与共线分析。"
authors: "Sharma P, Murigneux V, Haimovitz J, et al."
year: 2021
journal: Plant Direct
doi: 10.1002/pld3.364
type: application
methodIds: [mcscanx]
domainIds: [comparative-genomics]
speciesIds: [macadamia]
status: published
updatedAt: 2026-11-25
---
## 研究问题与材料范围
濒危植物 *Macadamia jansenii*（澳洲坚果属）是解析山龙眼科植物基因组演化与育种遗传资源的重要材料。Sharma 等（2021）对 *Macadamia jansenii* 基因组注释蛋白集开展基因重复与共线性分析，评估其基因组重复结构与遗传多样性特征。

## 分析流程
1. **全基因组蛋白同源比对**：对 *Macadamia jansenii* 全部预测蛋白序列运行 `all-versus-all BLASTP`，获取同源基因对与比对得分。
2. **共线性区块与重复基因分类**：将基因坐标（GFF）与 BLASTP 结果输入 **MCScanX**，运行 `duplicate_gene_classifier` 模块对基因组内重复基因进行分类（WGD/片段重复、串联重复、近端重复、散在重复）。
3. **共线性结果解读**：结合共线性区块分布与多样性统计评估基因家族扩张模式（注：MCScanX 分类结果本身需结合 $K_s$ 分布等额外证据才能严格论证 WGD 事件）。

## 软件明细表格
| 软件 | 论文中的具体任务 | 结果解释与科学推论 |
| :--- | :--- | :--- |
| **BLASTP** | *M. jansenii* 蛋白组 all-vs-all 同源比对 | 为共线性检测提供候选同源基因对输入 |
| **MCScanX (`duplicate_gene_classifier`)** | 共线性区块识别与重复基因类型划分 | 量化 WGD/片段重复与串联重复对 *M. jansenii* 基因组的贡献 |

## 主要科研发现
- 系统分类了 *Macadamia jansenii* 基因组中的重复基因构成，揭示其遗传多样性较低但保留了完整的抗逆与油脂合成相关基因家族。
- 为濒危澳洲坚果属的保育遗传学与杂交育种提供了参考注释与共线性基础。

## 阅读与数据复现资源
- **原始论文**：[Plant Direct (2021)](https://doi.org/10.1002/pld3.364)
- **PubMed**：[PMID: 34938939](https://pubmed.ncbi.nlm.nih.gov/34938939/)
- **相关站内资源**：[MCScanX 方法页](../../methods/mcscanx/)
- **数据复现**：基因组组装与注释数据详见原文 Data Availability 部分。
