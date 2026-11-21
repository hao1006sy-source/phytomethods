---
title: SMC++
name: SMC++
summary: 结合局部共祖连锁信息与条件样本频率谱，从未定相全基因组样本估计群体历史。
dataType: 双等位二倍体 VCF、样本群体表与 BED 格式缺失区 mask
principle: 顺序共祖模型与条件样本频率谱
domainIds: [population-genetics]
topicIds: [m05-topic-06]
principleIds: [sequentially-markovian-coalescent, conditional-site-frequency-spectrum]
dataIds: [variant-data, callable-region-mask]
paper: smcpp-paper
repository: https://github.com/popgenmethods/smcpp
status: draft
updatedAt: 2026-11-21
---

## 一句话简介与开发背景

SMC++ 是 Terhorst、Kamm 与 Song 开发的群体历史推断程序，将 SMC 型局部共祖信息与条件样本频率谱结合，以处理未定相基因组并支持比传统 PSMC 更大的样本集合。方法论文以模拟和多个非植物数据集评估其人口规模与分裂时间估计；植物项目仍需按自己的数据结构验证模型假设。[SMC++ 方法论文](../../papers/smcpp-paper/)；[官方代码与手册](https://github.com/popgenmethods/smcpp)。

## 生物学与计算问题

单个二倍体样本提供沿染色体的局部 TMRCA 信号，但难以利用更多群体样本和近期频率信息。SMC++ 采用一个二倍体“区分样本”提供连锁和共祖状态线索，其他同群体样本以未定相位点计数进入条件 SFS，从而把额外样本信息并入估计。软件用样条正则化表示连续的人口规模函数，降低过多时间点自由度引起的估计波动。

其 `split` 子命令可拟合两群体分裂时间和人口规模，但论文软件实现的该模型假设分裂后没有基因流（clean split）。在持续迁移、复杂混合或植物杂交历史下，该假设应作为模型检验的一部分，而不是默认事实。[方法论文](../../papers/smcpp-paper/)。

## 输入处理与算法流程

1. 将样本 VCF 按群体定义、双等位 SNP、二倍体基因型与可调用序列进行统一过滤，建立参考版本、样本列表及 mask。
2. 对每条 contig 分别运行 `smc++ vcf2smc`，转换为 SMC++ 压缩数据；需要剔除不可调用的大区段时提供 BED mask。
3. 运行 `smc++ estimate`，将每代每位点突变率作为参数，拟合群体历史；可按官方支持选项调整时间界限、样条结点数等拟合控制。
4. 如需比较群体分裂，先分别估计两个群体，再依 `split` 子命令说明构造联合数据并拟合清洁分裂模型。
5. 用 `smc++ plot` 输出曲线，保留模型 JSON、PDF/PNG 图和 CSV 数据表，检查人口曲线对 mask、突变率、世代时间与样本组合的敏感性。

```bash
# 对每条 contig 分别转换；示例使用 population Pop1 中的个体 S1 和 S2
smc++ vcf2smc input.vcf.gz data/chr01.smc.gz chr01 Pop1:S1,S2

# 使用每代每位点突变率拟合群体大小历史
smc++ estimate -o analysis/ 6.5e-9 data/chr*.smc.gz

# 导出模型曲线；可用 -g 指定世代年数，以 CSV 输出绘图数据
smc++ plot history.pdf analysis/model.final.json
```

命令依据[官方 README](https://github.com/popgenmethods/smcpp)整理。突变率值必须替换为物种和研究设定支持的参数；示例中的 `6.5e-9` 取自下方非洲稻研究，不能作为茶树或其他植物的推荐常数。`vcf2smc` 对 VCF 的变异类别、过滤字段、参考等位基因和未出现位点具有特定处理，需查阅对应版本的输入说明。

## 输入、输出与关键参数

| 项目 | 说明 |
| --- | --- |
| VCF | 官方转换器面向双等位二倍体 SNP；需要确认基因型编码、参考等位基因和样本顺序 |
| `vcf2smc` | 每次转换一条 contig，输入输出可以压缩；群体 ID 后列出 VCF 中的样本名 |
| BED mask | 将缺失或不可分析区域标记为未知，避免把 VCF 中没有记录的大段区间错误解读为长纯合片段 |
| `estimate` | 必填每代每位点突变率和一个或多个 `.smc` 文件；最终模型存为 JSON |
| `plot` | 将模型 JSON 转为 PDF/PNG/JPEG；`-g` 添加世代年数，`--logy` 使用纵轴对数尺度，`-c` 另存 CSV |
| `split` | 两群体清洁分裂模型；需要满足分裂后无基因流这一人口模型假设 |
| 版本与依赖 | 官方仓库提供源码和安装步骤；保留 Python 环境、依赖版本及 Git commit，便于复现 |

程序手册指出 `vcf2smc` 会将参考等位基因视为祖先、忽略 VCF 的 FILTER/QUAL 字段、不处理 indel/SV，并要求额外 mask 标记未调用大区段。植物基因组如存在大面积缺失、重复、着丝粒或群体差异可调用区域，输入掩蔽必须针对数据设计。[官方命令与输入格式](https://github.com/popgenmethods/smcpp#file-formats)。

## 植物应用

Cubry 等研究使用 SMC++ 分析非洲栽培稻近期人口历史：把可用材料整理为 79 个伪二倍体，以 5 条区分谱系增强条件频谱估计，采用每代突变率 $6.5\times10^{-9}$、上限 100,000 代和 25 个样条结点，并以一年世代时间换算。该方法与同文 PSMC/MSMC 的样本构造和时间分辨目标不同，论文结果应依各自方法范围比较。[原文案例](../../papers/african-rice-246-genomes/)。Patil 与 Vijay 用 SMC++ 等方法检查杨树重复序列遮罩对人口历史的影响，发现不同重复区处理对应不同历史 $N_e$ 估计。[杨树案例](../../papers/populus-repeats-demography/)。

## 结果解释与关联资源

模型输出包含平滑的人口规模轨迹及拟合参数。变化点应与相应的不确定范围、mutation rate、世代时间、样本构成和 mask 一并报告。`split` 分裂时间不是对任意基因流历史均稳健的单一人口事件日期；当其无迁移假设与植物杂交背景不符时，应采用能表示迁移的其他模型进行比较。

- 方法论文：[Robust and scalable inference of population history from hundreds of unphased whole genomes](../../papers/smcpp-paper/)，Nature Genetics 49:303–309，2017，DOI `10.1038/ng.3748`。
- 官方仓库：[popgenmethods/smcpp](https://github.com/popgenmethods/smcpp)。本机未以真实植物数据执行本页命令，内容依据该仓库的公开 README/输入格式整理。
- 相关专题：[群体历史动态](../../topics/population-genetics/m05-topic-06/)；相关方法：[PSMC](../psmc/)和[MSMC2](../msmc2/)；植物案例：[非洲稻](../../papers/african-rice-246-genomes/)、[杨树重复序列分析](../../papers/populus-repeats-demography/)。
