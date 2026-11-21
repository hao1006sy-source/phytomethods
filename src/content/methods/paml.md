---
title: PAML
name: PAML
summary: 对序列和系统树拟合分子演化模型与分化时间模型。
dataType: 编码序列比对 / 系统树
principle: 最大似然密码子模型与贝叶斯分子钟
domainIds: [comparative-genomics]
topicIds: [m04-topic-05, m04-topic-07]
principleIds: [phylogenetics]
dataIds: [coding-sequences]
paper: paml-paper
repository: https://github.com/abacus-gene/paml
status: published
updatedAt: 2026-11-22
---
## 研究问题与方法
PAML 是 Yang 等开发的分子序列演化分析软件包。codeml 可在给定序列比对与树的情况下拟合密码子模型，分析不同谱系或位点的替换；MCMCTree 使用贝叶斯分子钟方法估计分化时间。二者解决不同问题，输入、模型和结果解释也不同。[PAML 论文](https://doi.org/10.1093/molbev/msm088)。

## 输入、输出及质量控制
codeml 通常需要质量检查后的密码子比对、树及控制文件；MCMCTree 需要序列、树、校准和配置，具体格式及可选参数由版本和分析目标决定。输出含模型拟合、参数估计或节点年龄等信息，应保留控制文件、程序版本、日志和重复运行结果。序列移码、旁系同源、树错误及校准假设均可影响结果。[官方仓库](https://github.com/abacus-gene/paml)。本机未运行示例。

## 植物案例与上下游
茶树及相关山茶属研究使用 MCMCTree v4.9j；Clark 与 Donoghue 的植物 WGD 年代研究使用 MCMCTree normal-approximation 方法和化石校准，拟南芥 MAM 研究则使用 PAML 3.14 的 codeml branch-site 模型。[茶树案例](../../papers/tea-comparative/)、[WGD 年代案例](../../papers/plant-wgd-timing-2017/)、[MAM 案例](../../papers/mam-positive-selection-2006/)。这些是不同程序和统计任务。上游为基因组注释、同源识别和序列比对；下游须结合模型假设、不确定区间和独立生物学证据解释。当前官方仓库列出 GPL-3.0 许可。[官方仓库](https://github.com/abacus-gene/paml)。
