---
title: AnchorWave
name: AnchorWave
summary: 基于锚点和全基因组复制信息进行植物全基因组比对。
dataType: 基因组 FASTA / 基因注释
principle: 锚点识别与区块比对
domainIds: [pangenomics-structural-variation]
topicIds: [m03-topic-02]
principleIds: [alignment]
dataIds: [assembly]
paper: anchorwave-paper
repository: https://github.com/baoxingsong/AnchorWave
status: draft
updatedAt: 2026-11-20
---
## 问题与计算原理
AnchorWave 面向具有序列多样性、结构变化和全基因组复制的基因组比较。该方法利用基因注释识别可比较的锚点，考虑全基因组复制带来的一对多对应，再对共线区块执行碱基级全局比对。论文描述了两段仿射间隙代价，以处理长度不同的间隙。

## 输入与输出
输入通常包含参考与查询基因组、参考注释及用于锚定的序列；输出包括锚点和区块比对文件。基因命名、倍性和参数应依据[官方仓库](https://github.com/baoxingsong/AnchorWave)所用版本核对。

## 植物研究与上下游
原始论文针对重复、转座子和复制丰富的植物基因组评估了方法。[方法论文](https://doi.org/10.1073/pnas.2113075119)。输入组装及注释需要质量控制，下游可对可比较区域进行重排或序列差异分析；并非所有比对结果都能直接作为任一工具输入。

## 算法细节与结果解释
参考注释提供基因锚点，锚点之间的相对顺序用于识别可能的共线区块；在植物全基因组复制背景下，相同基因或区段可能有多个候选同源位置。方法考虑允许的复制关系，然后对锚点间序列进行全局碱基比对。原论文采用两段仿射 gap 代价，针对短 gap 与较长插入缺失提供不同的代价变化；较长、缺少同源性的锚点间区域需要近似策略以控制计算资源。输出的比对区块需要结合染色体方向、重复和序列质量解释，不能将所有未比对位置直接解释成生物学缺失。[原论文](https://pmc.ncbi.nlm.nih.gov/articles/PMC8740769/)。

## 来源、版本与植物证据
官方仓库标示 MIT 许可证；记录实际运行的版本、参考基因组和注释版本，并按所安装版本的帮助说明配置 WGD 相关参数。方法论文用玉米、高粱、水稻及拟南芥等植物序列评估不同分化及复制背景；这些是方法研究中的测试材料，具体结果应结合对应样本和评价设置阅读。[软件仓库](https://github.com/baoxingsong/AnchorWave)。
