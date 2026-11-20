---
title: 基于组装比对的 SyRI 结构变异分析入门
summary: 按官方示例组织 NUCmer、坐标过滤和 SyRI 的入门流程。
method: syri
tested: template
status: draft
updatedAt: 2026-11-20
---
## 目标与验证状态
本教程拟说明如何比较两套参考与查询组装。命令根据 [SyRI 官方示例](https://schneebergerlab.github.io/syri/example.html)整理；当前环境未安装并运行 SyRI 或真实植物数据。命令需依实际安装版本、基因组大小与文件路径调整。

## 输入和准备
准备研究对象的参考与查询 FASTA，核对样本、倍性、序列标识、质量和坐标版本。官方说明指出，可靠重排识别要求较高的组装连续性；不完整组装须谨慎解释。确保拥有适当版本的 MUMmer、SyRI 及其依赖，记录软件版本和计算资源。可从 [SyRI 官方仓库](https://github.com/schneebergerlab/syri)查找随版本提供的演示数据与安装说明；正式分析使用的数据应有可追溯来源及使用许可。

## 全基因组比对
以下为官方示例的命令结构，将 `refgenome` 和 `qrygenome` 替换为各自 FASTA 路径。`--maxmatch` 寻找候选匹配，`-c`、`-b`、`-l` 影响比对分辨率；这些示例值不是植物基因组的通用参数。

```bash
nucmer --maxmatch -c 500 -b 500 -l 100 refgenome qrygenome
delta-filter -m -i 90 -l 100 out.delta > out_m_i90_l100.delta
show-coords -THrd out_m_i90_l100.delta > out_m_i90_l100.coords
```

`delta-filter` 的过滤会影响保留的重复或一对多匹配；应根据研究问题和官方说明调整，保留完整的版本与日志。

## SyRI 运行与结果检查
官方示例要求提供比对坐标；若分析结构变异，还需要两套 FASTA；某些无 CIGAR 的短变异分析还需 delta 文件。运行前使用 `syri -h` 检查版本对应的完整语法。输出含共线、重排及局部差异等记录，具体文件格式以所用版本文档为准；人工检查断点周围比对、重复序列、序列方向和坐标。可使用长 reads 回贴或独立组装核查候选重排。

## 常见问题与阅读
染色体名称或顺序不一致会影响比较；输入版本和文件名应与比对过程一致。高度重复区的多个匹配可能造成候选歧义；组装缺口或错接也可能表现为变异。原论文及方法验证见 [Goel 等（2019）](https://doi.org/10.1186/s13059-019-1911-0)。

下面的命令是依据官方参数说明整理的模板；它与前面的 MUMmer3 风格示例配套，仍需在实际环境运行验证：

```bash
syri -c out_m_i90_l100.coords -r refgenome -q qrygenome -d out_m_i90_l100.delta
```

## 环境可用性记录
当前开发环境中未发现 `syri`、`nucmer` 或 `conda` 命令；Docker 客户端可见，Linux 引擎当前无法连接。因此本教程的命令仅依据官方示例整理，尚未产生实际分析输出。正式运行时应保存 `syri -h`、`nucmer --version` 或对应版本信息、软件安装来源、输入文件校验和、命令和日志。两份组装中同源染色体的整体方向也应按照[官方限制说明](https://github.com/schneebergerlab/syri#current-limitations)检查。
