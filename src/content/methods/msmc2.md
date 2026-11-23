---
title: MSMC2
name: MSMC2
summary: 基于多个单倍型对的共祖率，估计群体规模历史和群体间分化过程。
dataType: 多样本 VCF、位点相位信息、可调用区域 mask 与 multihetsep
principle: 多序列顺序马尔可夫共祖隐马尔可夫模型
domainIds: [population-genetics]
topicIds: [m05-topic-06]
principleIds: [sequentially-markovian-coalescent, coalescent-hidden-markov-model]
dataIds: [variant-data, phased-haplotype-data, callable-region-mask]
paper: msmc2-protocol
repository: https://github.com/stschiff/msmc2
status: published
updatedAt: 2026-11-22
---

## 一句话简介与开发背景

MSMC2 是 Multiple Sequentially Markovian Coalescent 的第二代算法重构实现，通过计算所有单倍型对的成对共祖率复合似然，突破了初代 MSMC 联合隐状态转移矩阵的计算维度瓶颈，从而支持更多样本的高精度群体规模历史与群体分离历史推断。MSMC 初代方法由 Schiffels 与 Durbin 于 2014 年发表；MSMC2 算法由 Stephan Schiffels 于 2016 年完成重构并在 GitHub 开源，其官方操作协议于 2020 年发表在 Methods in Molecular Biology。[MSMC 初代方法](../msmc/)；[MSMC2 协议论文](../../papers/msmc2-protocol/)；[官方软件仓库](https://github.com/stschiff/msmc2)。

## 研究问题与算法原理

MSMC 模型以沿基因组变化的局部共祖时间为隐藏状态，以顺序马尔可夫近似描述重组如何改变谱系关系，并依据观察到的突变模式估计成对共祖率。与 PSMC 只分析一个个体内的一对同源序列相比，MSMC2 可指定多个样本单倍型对，分别计算群体内与跨群体共祖信号。

MSMC2 的跨群体工作流通过不同单倍型对集合运行群体内与群体间估计，再由辅助脚本合并结果并计算相对跨群体共祖率。该相对指标与时间分段、样本配对和估计噪声有关；不能在脱离模型与样本的情况下，将某个固定相对值直接解释为精确分化日期。[MSMC2 README](https://github.com/stschiff/msmc2)；[MSMC 工具脚本](https://github.com/stschiff/msmc-tools)。

## 数据准备和计算步骤

1. 为每个样本和染色体准备单样本 VCF 与 BED 格式的可调用区域 mask；统一参考组装、样本身份、染色体命名及位点过滤。
2. 根据可信的相位结果和 mask，使用 `msmc-tools` 生成每条染色体的 `multihetsep.txt` 输入；相位不明确位点和不可调用区需按工具规则处理。
3. 使用 `msmc2` 运行单倍型对或单倍型对列表；输出前缀区分不同群体内、跨群体及 bootstrap 分析。
4. 跨群体分析根据官方示例分别运行群体 1 内、群体 2 内和跨群体配对集合，再用 `combineCrossCoal.py` 对齐不同时间分段下的曲线。
5. 依突变率和重组率将尺度化输出转换为生物学时间和有效群体大小，并做相位、时间分段及样本组合敏感性评估。

```bash
# 输入文件由 msmc-tools 按 VCF 与 BED mask 准备
# 以示例时间模式对指定单倍型组合运行 MSMC2
msmc2 -t 8 -p "1*2+15*1+1*2" -I 0,1,2,3 \
  -o population1.msmc2 chr01.multihetsep.txt chr02.multihetsep.txt

# 跨群体共祖率估计需要另行运行指定的跨群体样本对，
# 再用 msmc-tools/combineCrossCoal.py 整理对应输出
```

上述命令演示参数位置；时间分段字符串应依据样本数、覆盖和研究时间范围设计。官方说明 MSMC2 改进了部分多序列场景下重组率的处理，并更新了时间分段设置；不能将旧版 MSMC 的推荐参数机械照搬到 MSMC2。[软件 README](https://github.com/stschiff/msmc2)。

## 输入、输出和关键参数

| 项目 | 作用与注意事项 |
| --- | --- |
| VCF + BED mask | `msmc-tools` 输入；VCF 记录样本变异，mask 标明各样本可可靠分析的序列区域 |
| multihetsep | 每条染色体可独立准备，编码多个样本在同一变异位置的基因型/相位关系及位点间距 |
| `-I` | 从输入单倍型索引中选择分析配对；可指定一个索引集合或明确列出的配对 |
| `-p` | 控制 TMRCA 时间分段模式；改变后估计区间和分辨率都会变化 |
| `-t` | 线程数 |
| `-R` | 固定重组率选项；MSMC2 README 说明多数多单倍型分析通常无需沿用旧 MSMC 的固定重组建议 |
| 输出文件 | 以输出前缀生成分段共祖率结果和日志；保存具体版本并按同一时间模式解释群体内/间曲线 |

MSMC2 的多样本关系对定相错误、低覆盖、错误的缺失区 mask 及样本亲缘敏感。多倍体、异质倍性和明显亚基因组混淆的数据需要先证明输入编码符合模型，再运行标准的二倍体流程。

## 植物案例与实现边界

Patil 与 Vijay 使用包括 MSMC2 在内的多个共祖方法系统评估了杨树重复序列掩蔽处理对种群历史估计的影响，展示了参考基因组重复区与 mask 选择对推断结果的敏感性。[杨树案例](../../papers/populus-repeats-demography/)。注：早期非洲稻群体历史研究（Cubry et al., 2018）实际使用的是初代 MSMC（v1.1.0），详见[MSMC 详情页](../msmc/)。

## 方法论文、教程与相关工具

- 原始 MSMC 方法：[Inferring human population size and separation history from multiple genome sequences](../../papers/msmc-paper/)，Nature Genetics 46:919–925，2014，DOI `10.1038/ng.3015`。
- 软件协议：[MSMC and MSMC2: The Multiple Sequentially Markovian Coalescent](../../papers/msmc2-protocol/)，Methods in Molecular Biology 2090:147–166，2020，DOI `10.1007/978-1-0716-0199-0_7`。
- 官方实现：[stschiff/msmc2](https://github.com/stschiff/msmc2)；输入工具：[stschiff/msmc-tools](https://github.com/stschiff/msmc-tools)。版本以实际使用的 release/commit 记录。
- 相关专题：[群体历史动态](../../topics/population-genetics/m05-topic-06/)。互补方法：[PSMC](../psmc/)与[SMC++](../smcpp/)。本地未使用真实植物样本运行上述命令。
