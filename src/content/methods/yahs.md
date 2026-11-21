---
title: YaHS：Hi-C 染色体级挂载
name: YaHS
summary: 使用 Hi-C 配对联系将单倍型组装 contig 排序、定向并连接为染色体级 scaffold。
dataType: contig FASTA 与 Hi-C BAM、BED、PA5 或 BIN 比对数据
principle: 基于多分辨率 Hi-C 接触矩阵和加权连接图的 scaffold 构建
domainIds: [genome-assembly]
topicIds: [hic-scaffolding]
principleIds: [hic-scaffolding]
dataIds: [assembly, hic-contact-data]
paper: yahs
repository: https://github.com/c-zhou/yahs
version: 1.2.2
status: published
updatedAt: 2026-11-21
---

## 一句话简介与开发背景

YaHS（Yet another Hi-C scaffolding tool）是 Zhou、McCarthy 与 Durbin 开发的 C 语言 Hi-C scaffold 软件，目标是从 contig 和 Hi-C 比对文件建立染色体级 scaffold。方法论文发表于 *Bioinformatics*，DOI 为 `10.1093/bioinformatics/btac808`；软件采用 MIT License。[方法论文](../../papers/yahs/) · [官方代码与说明](https://github.com/c-zhou/yahs)。

版本快照：官方 Releases 列出的最新标签为 [`v1.2.2`](https://github.com/c-zhou/yahs/releases/tag/v1.2.2)，发布说明针对版本 1.2.1 引入的 `juicer post` 问题提供修复；本文记录截至 2026-11-21 核对的版本。水稻案例采用的是 YaHS v1.1。

## 解决的生物学与计算问题

长读段可提供连续序列，但单靠 contig 序列通常无法确定所有 contig 属于哪条染色体、相对顺序和方向。Hi-C 测序通过染色质空间接触提供长距离配对证据。YaHS 将这些配对比对到输入 contig 后，估计连接信号并生成 scaffold 结构；它不负责从原始 Hi-C FASTQ 完成读段比对，也不负责组装 contig。

## 核心计算原理与算法流程

YaHS 将每个 contig 切分为若干窗口，按窗口对汇总 Hi-C 接触，形成接触矩阵。为评估两条 contig 是否相邻，软件将 contig 间窗口对（inter-cells）的联系数量，按同等距离下 contig 内窗口对（intra-cells）的中位数估计期望值并标准化，再以加权和构成连接分数。对每对 contig 的四种相对方向分别计分，保留得分最高的方向。指定限制酶时，还可按酶切位点数量标准化接触频数。

接着软件把 contig 作为节点、候选连接作为加权边建立 scaffold 图，并依次处理低分边、末端结构、重复、传递边、气泡及方向歧义，再沿剩余路径遍历输出 scaffold。该流程按从较高分辨率到更大窗口的多轮策略迭代；每轮可执行 scaffold 错误检查，对缺乏 Hi-C 覆盖支持的连接位置进行拆分。输入 contig 应来自单倍型组装；若存在未清除的冗余 haplotig，可能产生错误连接。

论文报告 YaHS 在其模拟和真实数据基准中相较 SALSA2 与 pin_hic 取得较高连续性和准确性，并对部分组装错误更稳健。该比较范围属于论文所评估的数据、指标和参数，不代表所有物种、Hi-C 文库或复杂倍性条件下的通用排序。

## 输入、输出与常用参数

```bash
yahs contigs.fa hic-to-contigs.bam
```

输入包括已建立索引的 contig FASTA，以及 Hi-C 配对比对数据。官方支持 BAM、BED、PA5 和 YaHS 自有 BIN 格式；通常应在上游完成未比对、次级/补充比对及 PCR/光学重复处理。使用 BAM 时需记录排序方式：按 read name 排序与坐标排序会影响链接计数方式；官方 README 还说明非 read-name 排序 BAM 的 `-q` 映射质量过滤行为不同。

默认输出前缀为 `yahs.out`，主要结果包括 `yahs.out_scaffolds_final.agp` 和 `yahs.out_scaffolds_final.fa`；各轮 scaffold AGP、断点检查文件及 BIN 中间数据可用于追溯。AGP 描述输入 contig 的顺序、方向和 gap 结构，FASTA 给出拼接后的 scaffold 序列。

| 参数 | 用途 | 使用提示 |
| --- | --- | --- |
| `-o` | 指定输出前缀 | 输出目录需事先存在 |
| `-r` | 指定多轮 scaffold 分辨率 | 高度碎片化的组装可按官方说明调整起始分辨率；应记录参数 |
| `-R` | 设置每个分辨率的迭代轮数 | 依据官方长帮助及数据调参 |
| `-e` | 指定 Hi-C 文库限制酶识别序列 | 文库协议与酶信息应匹配；非酶切方案需查看对应指南 |
| `-l` | 设置参与挂载的最短 contig | contig 数量过多时，可依据官方限制筛除极短序列 |
| `-q` | 设置比对质量阈值 | 注意 BAM 排序方式对该过滤项的影响 |

官方说明 YaHS 最多处理约 45,000 条 contig；大基因组且 contig 数量很多时可能需要较多内存。发生远端错误连接时，应回看 Hi-C contact map、原始 contig、reads 支持和其他遗传证据，不能单凭 N50 上升判断挂载正确。

## 植物应用案例

Guo 等野生—栽培稻泛基因组研究在 30 份代表材料中使用 YaHS v1.1 挂载 Hi-C 数据，并通过 JuiceBox Assembly Tools 人工检查和优化 scaffold；论文方法还记录 Chromap 比对与 SAMtools 格式处理。[原始论文 DOI](https://doi.org/10.1038/s41586-025-08883-6)。这是 149 份初始稻属材料中一个经选择的 30 份子集，不能将其 Hi-C 流程误写成对所有材料统一运行。

## 方法论文、教程与关联资源

- 方法论文：[YaHS: yet another Hi-C scaffolding tool](../../papers/yahs/)，*Bioinformatics* 39(1), btac808 (2023)。
- 官方源码、编译说明、参数列表与演示脚本：[c-zhou/yahs](https://github.com/c-zhou/yahs)。官方仓库说明从源码使用 C 编译器、GNU make 与 zlib 开发文件构建；分析时记录仓库 commit 与环境。
- 上游资源：[Hifiasm](../hifiasm/) 生成 HiFi contig；YaHS 处理 Hi-C scaffold；之后可用 JuiceBox Assembly Tools 人工检查，并以 BUSCO、Merqury 等互补指标评估组装质量。
- 相关专题：[M01 Hi-C 辅助染色体挂载](../../topics/genome-assembly/hic-scaffolding/)。

官方 README 和方法论文已核对；本站未在本机真实植物数据上运行 YaHS。本页不包含伪造的运行日志或模拟结果。
