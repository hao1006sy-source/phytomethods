---
title: MCScanX
name: MCScanX
summary: 利用同源基因及其位置识别基因组共线区块。
dataType: 基因坐标 / 蛋白同源比对
principle: 基因锚点链与共线区块识别
domainIds: [comparative-genomics]
topicIds: [m04-topic-03, m04-topic-06]
principleIds: [collinearity]
dataIds: [assembly, proteins]
paper: mcscanx-paper
repository: https://github.com/wyp1125/MCScanX
status: published
updatedAt: 2026-11-22
---
## 研究问题与开发背景
MCScanX 是 Wang 等提出的共线性分析工具集。它结合基因位置和同源匹配，寻找染色体上顺序相近的基因组区块，并提供共线和基因复制相关分析。该工具可以帮助提出染色体重排或古代复制的候选解释；生物学事件仍需结合多种证据验证。[原论文](https://doi.org/10.1093/nar/gkr1293)。

## 核心思想与流程
上游根据蛋白序列搜索候选同源基因，并整理每个基因的染色体和坐标。MCScanX 以候选匹配为锚点，识别在两套坐标中顺序相容的锚点链，按照匹配、间隔和区块要求筛选候选共线区块。重复基因会产生多个可能匹配，筛选阈值、基因缺失与局部重排均影响最终区块边界。

## 输入、输出及参数
按官方仓库说明准备共享前缀的基因位置 BED 文件和 BLAST m8 格式同源搜索结果，核对染色体 ID、基因名及坐标；不能假设任意 GFF3 文件都可原样使用。主程序输出 `<prefix>.collinearity` 区块文件及 `<prefix>.html/` 浏览目录，后者用于检查锚点在参考染色体上的多重比对；下游工具可读取区块结果绘制点图、统计复制类别或计算 Ks。

官方参数中 `-s` 控制识别区块所需的最少匹配基因数（README 默认 5），`-m` 控制允许的最大间隔单位数（README 默认 20）；`-k` 为匹配分数、`-g` 为 gap penalty、`-e` 为显著性阈值。具体默认值以实际安装版本帮助信息为准。低质量组装、基因模型错误和过度严格的同源过滤都可能减少锚点。官方仓库还提供点图、环形图等辅助程序。[仓库与参数](https://github.com/wyp1125/MCScanX)。本页面的命令和软件尚未在本机执行。

## 植物案例与方法比较
澳洲坚果属 *Macadamia jansenii* 研究先进行全对全 BLASTP，再将蛋白同源结果与 GFF 基因坐标输入 MCScanX duplicate gene classifier，分析基因复制类别与共线关系；该研究未将这一局部证据单独当作全基因组复制定论。[案例记录](../../papers/macadamia-mcscanx/)。基因锚点方法依赖注释，适合关注基因顺序；核苷酸全基因组比对还可分析非编码序列，但有不同的计算成本与重复处理问题。

## 上下游与来源
上游是基因组组装、注释和蛋白同源搜索；下游可结合 Ks、基因树和外群共线深度研究 WGD 或染色体演化。MCScanX 上游发行标签 v1.0.0 与 BSD-2-Clause 许可已和发行元数据交叉核对；下游打包版本需另行记录来源和版本。[官方仓库](https://github.com/wyp1125/MCScanX)、[方法论文页面](../../papers/mcscanx-paper/)。本机未执行工具。
