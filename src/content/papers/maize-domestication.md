---
title: "Comparative population genomics of maize domestication and improvement"
summary: "比较野生、地方和改良玉米材料的群体基因组变化。"
authors: "Hufford MB, Xu X, van Heerwaarden J, et al."
year: 2012
journal: Nature Genetics
doi: 10.1038/ng.2309
type: application
methodIds: [xpclr]
domainIds: [population-genetics]
speciesIds: [maize]
status: draft
updatedAt: 2026-11-21
---
## 研究问题与样本设计

Hufford 等使用 75 份野生近缘、地方品种和改良玉米材料，按研究中的材料类别包括 35 个改良系、23 个地方品种和 17 个野生近缘材料。野生组中包括 14 份 *Zea mays* ssp. *parviglumis*、2 份 *Z. mays* ssp. *mexicana* 和 1 份 *Tripsacum dactyloides* var. *meridionale*。各样本平均测序深度超过 5×；读段比对到 B73 参考基因组 release 4a.53，最终分析使用 21,141,953 个高质量 SNP。[原文全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC5531767/)。

研究将驯化与现代改良分开比较，并结合核苷酸多样性、分化、衍生等位基因频率及转录组表达分析。选择候选由 XP-CLR 复合似然扫描形成连续窗口区域，再按论文设置的统计范围筛选；作者报告驯化阶段总体选择信号强于改良阶段，并观察到地方材料多样性部分恢复及其与野生近缘种渗入相容的模式。这里的 484 个驯化特征与 695 个改良特征是该论文定义下的候选区域集合，候选列表并不等同于全部已验证因果基因。[XP-CLR 方法页](../../methods/xpclr/)；[M05-05 选择性清除](../../topics/population-genetics/m05-topic-05/)；[M05-07 驯化与环境适应](../../topics/population-genetics/m05-topic-07/)。

研究对玉米演化阶段进行群体基因组比较，适合展示如何把野生近缘种、地方品种和现代材料放入同一分析框架。候选区域的解释依赖样本分组、B73 参考坐标、窗口定义及研究所用 XP-CLR 实现；本站关联 XP-CLR 指向统计方法及当前工具介绍，不表示论文复现了当前 `hardingnj/xpclr` 软件版本。
