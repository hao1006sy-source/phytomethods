---
title: Sniffles2 长读段结构变异检测
name: Sniffles2
summary: 从长读段比对中聚类结构变异信号，并支持群体联合分型和嵌合变异分析。
version: 2.8.1
dataType: 长读段 BAM/CRAM 比对；可选参考 FASTA 与多样本 SNF 文件
principle: 重复感知的信号聚类与覆盖自适应过滤
domainIds: [pangenomics-structural-variation]
topicIds: [m03-topic-03]
principleIds: [variant-calling]
dataIds: [long-reads, assembly, variant-data]
paper: sniffles2-paper
repository: https://github.com/fritzsedlazeck/Sniffles
status: published
updatedAt: 2026-11-21
---
## 一句话简介与开发背景
Sniffles2 是面向 PacBio 与 Oxford Nanopore 长读段的结构变异检测器。相较单样本调用，v2 增加重复感知聚类、快速共识与覆盖度自适应过滤，也支持多样本联合分型及低频嵌合变异模式。方法基于已比对 reads，不直接从 FASTQ 组装 SV。[方法论文](../../papers/sniffles2-paper/)。官方仓库当前 README 给出的安装版本快照为 2.8.1；具体复现仍应固定 release 或环境文件。[官方仓库](https://github.com/fritzsedlazeck/Sniffles)。

## 解决的问题与算法流程
长读段跨越断点的能力有助于发现短读段难以解析的插入、缺失、倒位、重复和易位；长读段仍会在重复区产生多重比对，低覆盖或高错误率也会影响候选支持。Sniffles2 从 BAM/CRAM 读取比对事件，按相邻断点及支持信号聚类，用共识和覆盖模型筛选候选，并按调用模式生成单样本或多样本变异结果。论文提出的 repeat-aware clustering、fast consensus sequence 与 coverage-adaptive filtering 是算法方法贡献；SNF 中间文件、命令参数和 VCF 编码则属于具体软件实现。

常用模式包括：

1. 单样本 germline 调用：从坐标排序、建立索引的长读段 BAM/CRAM 中发现候选 SV。
2. 多样本 population 模式：先为每个样本产生 SNF 文件，再合并 SNF 进行群体级候选整合和基因型输出。
3. mosaic 模式：在支持读段比例较低的体细胞/嵌合分析中使用单独的调用设定。
4. force genotyping：对输入 VCF 中已知候选位点进行重新分型。

不同模式的问题定义、覆盖阈值和 VCF 样本结构不同，不能将 population 的联合结果等同于独立样本调用集合的简单拼接。

## 输入、输出与常用参数
输入为经 minimap2 等比对器处理并坐标排序、索引的长读段 BAM/CRAM。`--input` 指定比对文件，`--vcf` 指定 VCF 输出；群体流程增加每样本 `.snf` 中间文件；`--reference` 可用于输出缺失等位序列。常见参数包括 `--threads`、`--mosaic`、`--genotype-vcf` 和多样本输入清单。参考版本、比对器预设、读段平台、排序状态和索引都应写入运行记录。[官方用法和数据格式](https://github.com/fritzsedlazeck/Sniffles#use-cases--modes)。

输出主要是 VCF/VCF.gz 与可选 SNF 文件。解读时需检查 SVTYPE、END、SVLEN、支持读段、基因型、过滤状态及参考序列版本；SV 记录的归一化与跨样本合并规则也会影响事件数。

## 植物应用与方法论文
Zhang 等 2026 年的十种被子植物 HiFi 基准评估了 91 种 caller pipeline。该研究报告 NGMLR/Sniffles2 在跨物种缺失检测稳定性方面表现较高；论文也指出插入和缺失的适用 pipeline 不同，且重复区及较大 SV 会降低准确度。该结果是特定十物种基准的比较，不构成所有物种、数据深度或软件版本下的普遍排序。[植物基准论文](../../papers/plant-sv-benchmark-2026/)。

Sniffles2 原始方法论文的主要验证数据为人类长读段及相关基准；本知识库不把原论文 benchmark 标为植物验证。植物中的具体应用与跨物种性能应以对应植物论文的数据和版本为准。[原始方法论文](../../papers/sniffles2-paper/)。

## 相关教程、代码与上下游
本项目尚未提供 Sniffles2 真实植物数据实跑教程，官方 README 的命令和输入规范可作为复现入口。官方实现与安装说明见 [GitHub](https://github.com/fritzsedlazeck/Sniffles)。上游为长读段比对与参考基因组；下游可使用 Jasmine 等方法合并跨样本候选，再开展基因型统计、PAV/SV关联或浏览器人工检查。相关专题为[植物基因组结构变异检测](../../topics/pangenomics-structural-variation/m03-topic-03/)，关联案例为[十种被子植物 SV calling 基准](../../papers/plant-sv-benchmark-2026/)。
