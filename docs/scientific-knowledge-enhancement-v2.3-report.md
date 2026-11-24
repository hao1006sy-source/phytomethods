# PhytoMethods V2.3｜科研知识深度建设与全自动持续发布交付报告

**项目名称**: PhytoMethods (植物基因组学公益知识库)  
**项目仓库**: [hao1006sy-source/phytomethods](https://github.com/hao1006sy-source/phytomethods)  
**官方网站**: [https://hao1006sy-source.github.io/phytomethods/](https://hao1006sy-source.github.io/phytomethods/)  
**执行负责人**: Antigravity  
**执行模式**: 无人值守自主工作、持续资料检索、分阶段交付与全自动 CI/CD 部署发布  
**起始基线**: `main` 分支 PR #52 合并后基线 (`9f9d66e`)

---

## 一、本轮建设总纲与核心目标

PhytoMethods 经过此前基础架构、数据注册表、计算画像核验与全页面视觉重设计，已确立了扎实的学术架构基石。V2.3 版本的核心重心为**科学内容深度全面跃升**：

1. **算法原理与数学建模透彻解析**：深入图算法、概率图模型、混合线性模型、贝叶斯与深度学习网络，补齐关键公式推导与变量物理意义；
2. **植物科学特色与基因组生物学特征**：紧密结合植物复杂多倍体、亚基因组分化、转座子超高爆发（LTR-RT）、杂合度与全基因组复制（WGD）等真实植物生物学情境；
3. **真实作物科研案例穿透**：结合拟南芥、水稻、玉米、小麦、大豆等代表性植物物种的经典研究，穿透至原始文献、具体表格行与实际参数选择依据；
4. **全自动持续交付与部署质量闭环**：M01 至 M10 分阶段开发，阶段内严格执行多视口无溢出断言、静态与浏览器自动化测试、创建 PR、等待 CI、自动 Squash 合并并核实 GitHub Pages 正式发布状态。

---

## 二、里程碑执行跟踪矩阵

| 里程碑 | 领域模块 | 分支名称 | PR 编号 | 合并状态 | Pages 部署验证 |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **M01** | 测序与基因组组装 | `docs/v2.3-m01-genome-assembly` | #53 | 已合并 (`fb0d733`) | 已发布 (Run 45440095694) |
| **M02** | 基因组注释与重复序列 | `docs/v2.3-m02-genome-annotation` | 待提交 | 待合并 | 待验证 |
| **M03** | 泛基因组与结构变异 | `docs/v2.3-m03-pangenomics` | 待开始 | 待合并 | 待验证 |
| **M04** | 比较基因组与系统发育 | `docs/v2.3-m04-comparative-genomics` | 待开始 | 待合并 | 待验证 |
| **M05** | 群体遗传学与演化 | `docs/v2.3-m05-population-genetics` | 待开始 | 待合并 | 待验证 |
| **M06** | GWAS 与全基因组选择 | `docs/v2.3-m06-gwas-breeding` | 待开始 | 待合并 | 待验证 |
| **M07** | 表观与三维基因组学 | `docs/v2.3-m07-epigenomics-3d` | 待开始 | 待合并 | 待验证 |
| **M08** | 单细胞与空间组学 | `docs/v2.3-m08-single-cell` | 待开始 | 待合并 | 待验证 |
| **M09** | 基因调控网络与 AI | `docs/v2.3-m09-networks-ai` | 待开始 | 待合并 | 待验证 |
| **M10** | 全局收尾与持续发布总结 | `docs/v2.3-m10-final-review` | 待开始 | 待合并 | 待验证 |

---

## 三、红线规范与证据真实性声明

1. **零虚构原则**：所有新增公式、参数依据、耗时估算均来源于原始发表文献、官方官方文档或物理执行日志。未获充分佐证数据坚决标注“待测定/待证实”，并在 `pending-items.json` 中公开跟踪；
2. **计算负载红线**：严禁在本地工作区执行任何未经授权的大型生物信息学运算（重组装、全基因组多重比对、海量 FASTQ/BAM/VCF 下载与高负载模型训练）；
3. **格式与视觉统一**：严格继承既定学术卡片与高密度阅读排版，不引入破坏性 UI 变更。

---

## 四、各阶段交付详报

### M01：测序与基因组组装 (已合并上线)
- **分支**: `docs/v2.3-m01-genome-assembly` | **PR**: #53 (`fb0d733`) | **CI Run ID**: 138606580815 | **Pages Run ID**: 45440095694
- **图解建设**: 绘制 3 幅原创学术 SVG 矢量图解置于 `public/images/topics/m01/`：
  1. `assembly-graph-topology.svg`: String Graph 传递边约简与气泡分相拓扑
  2. `assembly-quality-curves.svg`: N50/NG50 阶梯对比与 Merqury Spectra-cn 拷贝数谱图
  3. `hic-scaffolding-decay.svg`: Hi-C 接触概率幂律衰减模型与热图对角线判读
- **核心专题深度建设**: 覆盖 M01 全部门类 7 篇专题，重点推导 Myers 2005 传递边约简定理、Lander-Waterman 泊松分布模型、Merqury 对数 QV、YaHS 多分辨率拟合；
- **核心方法深化**: 深度重构 Hifiasm、Verkko、Merqury、YaHS，严格遵守 Method V3 的 15 项二级标题双向映射保真契约，对齐玉米 B73 官方实测基准。

### M02：基因组注释与重复序列 (本地测试全量通过)
- **分支**: `docs/v2.3-m02-genome-annotation`
- **图解建设**: 绘制 3 幅原创学术 SVG 矢量图解置于 `public/images/topics/m02/`：
  1. `te-classification-and-ltr-structure.svg`: Wicker TE 层次分类与完整 LTR-RT 结构及分子钟推导公式 $T = K / (2\mu)$
  2. `braker3-evidence-integration.svg`: BRAKER3 整合 RNA-seq 剪接与同源蛋白的 GHMM 自训练流程架构
  3. `annotation-evaluation-aed.svg`: 注释质量评估与 AED 累积分布曲线
- **核心专题深度建设**: 覆盖 M02 全部 7 篇核心专题：
  - `m02-topic-01`: 基因组注释基础与 GFF3 CDS Phase 严格数学换算
  - `m02-topic-02`: 转座子从头挖掘、Kimura 插入年代推导、EDTA 算法架构与软屏蔽规范
  - `m02-topic-03`: 蛋白编码基因预测、广义隐马尔可夫模型 GHMM 数学原理、Viterbi 解码与 BRAKER3 流程
  - `m02-topic-04`: 剪接图网络流模型、StringTie2、植物内含子滞留 IR 主导特色与 PASA 更新
  - `m02-topic-05`: 非编码 RNA、随机上下文无关文法 SCFG、Infernal 协方差模型 CM、tRNAscan-SE 2.0 与 24-nt siRNA 特征
  - `m02-topic-06`: 基因功能注释、Profile HMM 对数似然比、GO DAG 真路径规则、超几何分布 Fisher 精确检验与 Benjamini-Hochberg FDR、Plant P450/TPS 家族与 WGD 旁系同源陷阱
  - `m02-topic-07`: 基因组注释质量评估、AED 严密数学推导、BUSCO 蛋白完整度、多倍体 Duplicated BUSCO 生物学真象与技术假阳性鉴别、OMArk 蛋白组一致性与污染排查
- **核心方法深化**: 深度重构 EDTA、BRAKER3、InterProScan，注入详细参数、命令模板、输出解析与植物案例；
- **选型矩阵完善**: 在 `src/data/method-comparison-matrices.ts` 中补充 InterProScan 决策树；
- **文献出处索引**: 在 `source-review.json` 中新增 7 条权威文献追踪记录；
- **全量测试验证**: `npm run validate`、`npm run test:methods-index-v4`、`npm run test:platform-browser` 100% 通过（13,291 链接 0 死链，63 篇专题 0 语法报错，多端 7 视口 0 溢出）。

