---
title: InterProScan
name: InterProScan
summary: 并行运行蛋白签名模型，将序列匹配归入 InterPro 家族和结构域并可映射 GO 术语。
dataType: 预测蛋白 FASTA
principle: 蛋白签名模型匹配与受控术语映射
domainIds: [genome-annotation]
topicIds: [m02-topic-01, m02-topic-06]
principleIds: [annotation]
dataIds: [annotation-input]
paper: interproscan-paper
repository: https://github.com/ebi-pf-team/interproscan
version: InterProScan 5.78-109.0 为 v5 最终版本；InterProScan 6 文档请查官方站点
updatedAt: 2026-11-22
---
## 简介与计算问题

InterProScan 由 EMBL-EBI 维护，针对蛋白 FASTA 调用多个成员数据库的签名模型，识别蛋白家族、结构域、活性位点及其他序列特征，并将匹配关联到 InterPro 条目。它解决的是基于已知蛋白特征对新蛋白分类和注释的问题；未命中不代表没有功能，命中也不等于实验验证。

## 核心算法流程

每个成员数据库运行自身的 profile/HMM、模式或家族特征模型；程序整合命中坐标、模型 accession、显著性分数和数据库来源，再映射到 InterPro 及可用 GO/Pathway 术语。匹配区段与模型覆盖可帮助判断是完整家族、局部结构域还是短局部命中。分析覆盖和数据库内容随版本更新。

## 输入、命令、输出

输入通常为预测蛋白 FASTA；建议保留稳定的蛋白 ID，并记录基因模型版本。命令格式依 InterProScan 版本和安装包配置而异，官方 v5 常见用法为：

```bash
./interproscan.sh -i proteins.fasta -f TSV,GFF3 -goterms
```

`-i` 指定输入，`-f` 选择输出格式，`-goterms` 请求 GO 映射（官方说明该选项会启用相关 InterPro 查找）。TSV 可记录序列 ID、MD5、长度、分析库、签名 accession/描述、匹配坐标、分数/e-value、状态及可选 InterPro/GO/Pathway 字段；GFF3 适于基因组浏览器展示。运行需检查许可、内存、数据库包、临时目录和退出日志。

## 参数选择与结果解读

默认运行全部可用成员分析更全面但资源开销更高；`-appl` 可限定分析模块。过滤时按数据库模型阈值、序列长度和命中覆盖解释，避免仅依赖统一 e-value。多个转录本汇总到基因时应记录规则。GO 术语继承或映射应保留来源，富集检验另行设置背景集和多重校正。

## 植物应用与资源

芒果基因组研究将 InterProScan 用于预测蛋白功能注释，并与其他功能数据库共同整理。[植物应用论文](https://doi.org/10.1002/tpg2.20441)。方法论文：[Jones et al., 2014](https://doi.org/10.1093/bioinformatics/btu031)。[v5 运行文档](https://interproscan-docs.readthedocs.io/en/v5/HowToRun.html)、[输出格式](https://interproscan-docs.readthedocs.io/en/v5/OutputFormats.html)、[官方代码仓库](https://github.com/ebi-pf-team/interproscan)。官方文档指出 v5.78-109.0 是 InterProScan 5 最终版本，后续 InterPro 更新需关注 InterProScan 6。相关专题：基因功能注释、基因组质量评估。

