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
| **M02** | 基因组注释与重复序列 | `docs/v2.3-m02-genome-annotation` | #54 | 已合并 (`fd58d00`) | 已发布 (Run 45443833879) |
| **M03** | 泛基因组与结构变异 | `docs/v2.3-m03-pangenomics` | #55 | 已合并 (`aece25d`) | 已发布 (Run 45447742843) |
| **M04** | 比较基因组与系统发育 | `docs/v2.3-m04-comparative-genomics` | #56 | 已合并 (`ec98daa`) | 已发布 (Run 45450999621) |
| **M05** | 群体遗传学与演化 | `docs/v2.3-m05-population-genetics` | #57 | 已合并 (`ec72b5e`) | 已发布 (Run 45453852275) |
| **M06** | GWAS 与全基因组选择 | `docs/v2.3-m06-gwas-breeding` | #58 | 已合并 (`0d395cf`) | 已发布 (Run 45456818404) |
| **M07** | 表观与三维基因组学 | `docs/v2.3-m07-epigenomics-3d` | #59 | 已合并 (`8ff37b0`) | 已发布 (Run 45460325238) |
| **M08** | 单细胞与空间组学 | `docs/v2.3-m08-single-cell` | #60 | 待合并 | 待验证 |
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

### M02：基因组注释与重复序列 (已合并上线)
- **分支**: `docs/v2.3-m02-genome-annotation` | **PR**: #54 (`fd58d00`) | **CI Run ID**: 45443290948 | **Pages Run ID**: 45443833879
- **图解建设**: 绘制 3 幅原创学术 SVG 矢量图解置于 `public/images/topics/m02/`：
  1. `te-classification-and-ltr-structure.svg`: Wicker TE 层次分类与完整 LTR-RT 结构及分子钟推导公式 $T = K / (2\mu)$
  2. `braker3-evidence-integration.svg`: BRAKER3 整合 RNA-seq 剪接与同源蛋白的 GHMM 自训练流程架构
  3. `annotation-evaluation-aed.svg`: 注释质量评估与 AED 累积分布曲线
- **核心专题深度建设**: 覆盖 M02 全部 7 篇核心专题，推导 GFF3 CDS Phase 换算、Kimura 插入年代、GHMM 基因预测、剪接网络流、Profile HMM 对数似然比、GO DAG 真路径与 Fisher 精确检验、AED 累积分布曲线；
- **核心方法深化**: 深度重构 EDTA、BRAKER3、InterProScan，注入详细参数、命令模板、输出解析与植物案例；
- **选型矩阵完善**: 在 `src/data/method-comparison-matrices.ts` 中补充 InterProScan 决策树；
- **文献出处索引**: 在 `source-review.json` 中新增 7 条权威文献追踪记录。

### M03：泛基因组与结构变异 (已合并上线)
- **分支**: `docs/v2.3-m03-pangenomics` | **PR**: #55 (`aece25d`) | **CI Run ID**: 45447252321 | **Pages Run ID**: 45447742843
- **图解建设**: 绘制 3 幅原创学术 SVG 矢量图解置于 `public/images/topics/m03/`：
  1. `pangenome-heaps-law-curves.svg`: 植物泛基因组建模与 Heaps' Law 幂律演化曲线及四大组分层级划分
  2. `graph-pangenome-cactus-topology.svg`: 植物变异诱导图拓扑结构、代数超泡 Snarls 与多样本单倍型遍历模型
  3. `syri-structural-variation-classes.svg`: SyRI 全基因组共线性比对与五大结构变异分类体系及倒位重组抑制机制
- **核心专题深度建设**: 覆盖 M03 全部 7 篇核心专题（Heaps' law 幂律拟合推导、WGA 两段仿射间隙代价、SyRI 动态规划共线路径、PAV 判读模型与 PAV-GWAS、超泡 Snarls 代数拓扑、Giraffe 图比对与贝叶斯分型、ODGI 一维平铺图及 SequenceTubeMap 局部管状拓扑）；
- **核心方法深化**: 深度重构 SyRI、Minigraph-Cactus、cuteSV、ODGI、AnchorWave；
- **选型矩阵完善**: 在 `src/data/method-comparison-matrices.ts` 中补充 AnchorWave 与 ODGI 选型及决策树；
- **文献出处索引**: 在 `source-review.json` 中新增 7 条权威文献追踪记录；
- **部署发布验证**: PR #55 Squash 合并，Pages 自动化持续发布成功上线。

### M04：比较基因组与系统发育 (已合并上线)
- **分支**: `docs/v2.3-m04-comparative-genomics` | **PR**: #56 (`ec98daa`) | **CI Run ID**: 45450407663 | **Pages Run ID**: 45450999621
- **图解建设**: 绘制 3 幅原创学术 SVG 矢量图解置于 `public/images/topics/m04/`：
  1. `orthofinder-mcl-and-reconciliation.svg`: OrthoFinder 比对长度归一化、MCL 矩阵扩展与膨胀算子迭代及 DLCPar 物种树调和
  2. `cafe5-birth-death-evolution-model.svg`: CAFE 5 超度量物种树上的连续时间马尔可夫生灭模型、Gamma 速率异质性拟合与误差校正
  3. `wgd-ks-distribution-and-gmm-deconvolution.svg`: 植物全基因组加倍 WGD、$K_s$ 同义替换率中性时钟谱与 GMM 高斯混合模型解卷积
- **核心专题深度建设**: 覆盖 M04 全部 7 篇核心专题：
  - `m04-topic-01`: 直系同源与旁系同源、比对长度偏差纠正 $S'_{ij} = S_{ij} \cdot \frac{\min(L_i,L_j)}{\max(L_i,L_j)}$、MCL 马尔可夫图聚类算子、DLCPar 基因树-物种树调和
  - `m04-topic-02`: 基因家族扩张与收缩、连续时间马尔可夫生灭过程转移概率解析公式、离散 Gamma 速率异质性分布、组装注释误差控制与 LRT 似然比检验
  - `m04-topic-03`: 全基因组共线性、二维网格锚点最长递增链动态规划打分方程 $S(i) = s_i + \max[S(j)-G(j,i)]$、间隙惩罚、MCScanX 五大基因复制机制分类
  - `m04-topic-04`: 系统发育基因组学、Felsenstein 剪枝算法、ModelFinder BIC 准则、UFBoot2 RELL 近似超快自展检验、PMSF 位点异质模型与 ILS 多物种溯祖
  - `m04-topic-05`: 物种分化时间与分子钟、速率-时间不可识别性、松弛分子钟（IR / AR）、BASEML 海森矩阵正态近似加速法与化石软边界先验
  - `m04-topic-06`: 全基因组加倍与古多倍化、同义替换率中性时钟 $T=K_s/(2r)$、饱和突变过滤、高斯混合模型（GMM）解卷积拟合与三维交叉证据链
  - `m04-topic-07`: 选择压力与分子进化、Goldman-Yang 密码子演化矩阵（GY94）、$\omega=d_N/d_S$ 物理意义、Site 与 Branch-Site 检验模型及 BEB 正选择位点识别
- **核心方法深化**: 深度重构 OrthoFinder、MCScanX、CAFE 5、IQ-TREE 2、PAML、wgd v2 六大核心方法，补充完整算法推导、生产命令模板、输出解析与植物案例；
- **选型矩阵完善**: 在 `src/data/method-comparison-matrices.ts` 扩充 IQ-TREE 2、PAML、wgd v2 选型档案与全套决策树；
- **文献出处索引**: 在 `source-review.json` 中新增 7 条权威文献追踪记录；
- **全量测试验证**: `npm run validate`、`npm run test:methods-index-v4`、`npm run test:platform-browser` 100% 通过（13,291 链接 0 死链，63 篇专题 0 语法报错，多端 7 视口 0 溢出）；
- **部署发布验证**: PR #56 Squash 合并入 main，Pages 部署成功上线。

### M05：群体遗传学与演化 (已合并上线)
- **分支**: `docs/v2.3-m05-population-genetics` | **PR**: #57 (`ec72b5e`) | **CI Run ID**: 45453414539 | **Pages Run ID**: 45453852275
- **图解建设**: 绘制 3 幅原创学术 SVG 矢量图解置于 `public/images/topics/m05/`：
  1. `selective-sweep-and-hitchhiking.svg`: 正向选择选择性清除、有益突变快速固定、周围中性多态性骤降、单倍型纯合度暴涨与 XP-CLR/FST 扫描信号
  2. `population-structure-pca-admixture.svg`: 高维 SNP 基因型矩阵的 Patterson SVD 谱分解投影至前两主成分，以及 ADMIXTURE 祖先成分堆叠条形图随 $K$ 演变与 CV 误差曲线
  3. `demographic-history-smcpp-curves.svg`: 基于隐式马尔可夫溯祖模型 SMC++ / MSMC 的有效种群规模 $N_e$ 动态演化曲线、瓶颈事件、末次盛冰期 LGM 骤降与分化时间跨度推断
- **核心专题深度建设**: 覆盖 M05 全部 7 篇核心专题：
  - `m05-topic-01`: Hardy-Weinberg 平衡检验、Wright-Fisher 随机漂变模型、近交系数 $F$ 与自花授粉纯合化、有效种群大小 $N_e$
  - `m05-topic-02`: 重测序变异检测与分型、GQ/DP/AB/QD/FS/SOR 质控过滤、植物高重复区过度覆盖（Over-depth）截断与重复序列串联拷贝误判规避
  - `m05-topic-03`: 群体结构与主成分分析、Patterson 2006 SVD 协方差谱分解与 Tracy-Widom 显著性检验、ADMIXTURE 极大似然拟牛顿块坐标下降与 5-fold CV 误差最优 $K$ 判定
  - `m05-topic-04`: 群体遗传多样性与分化、核苷酸多样性 $\pi$ 与 Watterson $\theta_W$ 无偏估计、Tajima's $D$ 中性检验、Weir & Cockerham $F_{ST}$ 方差分量与多位点比值平均法则、Hill & Weir 连锁不平衡（LD）衰减模型
  - `m05-topic-05`: 选择性清除与遗传搭车、Maynard Smith 演化动力学方程、XP-CLR 跨群体复合似然比、SweepFinder2 等位基因频谱（CLR）偏离检验、selscan 延伸单倍型纯合度（iHS / XP-EHH）
  - `m05-topic-06`: 群体历史动态推断、局部 TMRCA 等待时间、SMC 隐式马尔可夫模型状态转移方程、SMC++ 区分样本与 CSFS 联合建模、物理时间尺度标定及植物伪二倍体（Pseudo-diploid）策略
  - `m05-topic-07`: 作物驯化与性状演化基因组学、全基因组选择清除扫描定位水稻 *sh4*/*PROG1*/*Wx*、玉米 *tb1*/*tga1* 与大豆 *GmHs1-1*/*GmLHY* 等关键驯化基因的分子机制
- **选型矩阵完善**: 在 `src/data/method-comparison-matrices.ts` 扩充 `msmc2` 与 `psmc` 选型及全套决策树；
- **文献出处索引**: 在 `source-review.json` 中新增 7 条权威文献追踪记录；
- **全量测试验证**: `npm run validate`、`npm run test:methods-index-v4`、`npm run test:platform-browser` 100% 通过（13,291 链接 0 死链，63 篇专题 0 语法报错，多端 7 视口 0 溢出）；
- **部署发布验证**: PR #57 Squash 合并入 main，Pages 部署成功上线。

### M06：GWAS 与全基因组选择 (已合并上线)
- **分支**: `docs/v2.3-m06-gwas-breeding` | **PR**: #58 (`0d395cf`) | **CI Run ID**: 45456306650 | **Pages Run ID**: 45456818404
- **图解建设**: 绘制 3 幅原创学术 SVG 矢量图解置于 `public/images/topics/m06/`：
  1. `gwas-manhattan-qq-plot-architecture.svg`: 曼哈顿图（全基因组位点定位、显著性红线与建议线、候选区间 LD 判定）与 Q-Q 图（群体分层假阳性诊断、膨胀因子 $\lambda_{GC}$ 评估）双联科学架构；
  2. `gwas-mixed-linear-model-farmcpu.svg`: 传统 $Q+K$ 混合线性模型方程、全基因组亲缘矩阵假阴性过度惩罚与多位点 FarmCPU 固定效应（FEM）与随机效应（REM）循环交替机制；
  3. `genomic-selection-gblup-and-cross-validation.svg`: 全基因组选择（GS）工作流、VanRaden 亲缘矩阵、Henderson 混合模型方程组（MME）、5 折交叉验证预测准确度与育种世代大幅压缩效应。
- **核心专题深度建设**: 覆盖 M06 全部 7 篇核心专题：
  - `m06-topic-01`: 数量遗传学与表型变异分解、Fisher 无穷小模型、等位基因替代效应 $\alpha$、加性/显性方差解析、广义与狭义遗传力、自交系加性方差翻倍证明与品系均值遗传力；
  - `m06-topic-02`: QTL 定位与遗传连锁、Haldane 与 Kosambi 交叉干涉图距函数推导、HMM 多位点基因型概率推断、区间作图（IM）与复合区间作图（CIM）、LOD 分数与置换检验（Permutation Test）；
  - `m06-topic-03`: GWAS 关联检验基础与一般线性模型（GLM）、单标记最小二乘回归、植物地理生态亚群分层致假阳性机理、PCA/Q 矩阵固定协变量校正、Bonferroni 与 FDR 多重假设校正；
  - `m06-topic-04`: GWAS 模型演进、Yu 2006 统一混合模型（$Q+K$）、VanRaden 亲缘关系矩阵算法、EMMA 谱分解加速、全基因组因果变异过度吸收缺陷、FarmCPU 循环解耦算法与 BLINK 贝叶斯迭代优化；
  - `m06-topic-05`: GWAS 结果解读与候选基因精细定位、基因组膨胀因子 $\lambda_{GC}$ 诊断公式、局部连锁不平衡（LD block, $r^2 \ge 0.6$）边界判定、变异生物学功能三级分级、单倍型效应方差分析与水稻 *GS3* 提前终止密码子（C-to-A）及 *sd1* 383bp 缺失证据链；
  - `m06-topic-06`: 全基因组选择（GS）理论基石、GBLUP 与 rrBLUP 数学等价性严格证明、Henderson MME 方程组求解、贝叶斯字母表（BayesA/B/C）多元先验模型对比、5 折交叉验证与数据泄漏规避；
  - `m06-topic-07`: 机器学习预测与基因型×环境互作（G×E）、反应规范（Reaction Norm）与交叉互作、多环境 GBLUP Kronecker 积协方差结构（$\boldsymbol{\Omega}_E \otimes \mathbf{G}$）、DNNGP 深度学习多组学网络架构、CV1/CV2/CV0 跨环境交叉验证范式。
- **选型矩阵完善**: 在 `src/data/method-comparison-matrices.ts` 扩充 `dnngp` 选型档案与复杂多组学非线性预测决策树；
- **文献出处索引**: 在 `source-review.json` 中新增 7 条顶级文献追踪记录；
- **全量测试验证**: `npm run validate`、`npm run test:methods-index-v4`、`npm run test:platform-browser` 100% 通过（13,291 链接 0 死链，63 篇专题 0 语法报错，多端 7 视口 0 溢出）；
- **部署发布验证**: PR #58 Squash 合并入 main，Pages 部署成功上线。

### M07：表观基因组与三维基因组学 (已合并上线)
- **分支**: `docs/v2.3-m07-epigenomics-3d` | **PR**: #59 (`8ff37b0`) | **CI Run ID**: 45459755076 | **Pages Run ID**: 45460325238
- **图解建设**: 绘制 3 幅原创学术 SVG 矢量图解置于 `public/images/topics/m07/`：
  1. `plant-dna-methylation-contexts-and-rddm.svg`: 植物特异性 mCG、mCHG、mCHH 三大胞嘧啶甲基化序列环境、维持酶系（MET1、CMT3、CMT2、DRM2）、CMT3-H3K9me2 自催化正反馈循环与经典 RNA 指导的 DNA 甲基化（RdDM）双通路架构；
  2. `atac-seq-tn5-chromatin-accessibility.svg`: ATAC-seq 染色质可及性测序分子原理、高活性突变型 Tn5 转座酶 +4/-5 bp 单碱基空间移位校正机制、文库片段核小体周期性阶梯分布与 TSSE 转录起始位点富集得分质控评估；
  3. `hi-c-contact-matrix-and-compartments.svg`: Hi-C 原位接触热图、TAD 拓扑关联结构域绝缘得分（Insulation Score）边界探测、A/B 区室第一主成分（PC1）特征向量解卷积与植物特定 Rabl 极性构象及 KNOT 纽状体。
- **核心专题深度建设**: 覆盖 M07 全部 7 篇核心专题：
  - `m07-topic-01`: 植物特异性 DNA 甲基化机制、mCG/mCHG/mCHH 三大序列环境、MET1 维持 mCG、CMT3/CMT2 与 H3K9me2 正反馈放大环路、Pol IV/RDR2/DCL3/Pol V 经典 RdDM 通路分子架构、组蛋白共价修饰密码（H3K4me3/H3K9ac 激活与 H3K9me2/H3K27me3 沉默）；
  - `m07-topic-02`: 重亚硫酸氢盐脱氨基三步化学反应动力学、Bismark 四条转化链（OT/OB/CTOT/CTOB）比对算法、叶绿体基因组非转化率校正模型与二项分布单碱基修饰显著性检验、Nanopore 原生电信号甲基化检测；
  - `m07-topic-03`: 差异甲基化区域（DMR）统计建模、DSS 层次 Beta-二项分布模型、经验贝叶斯局部离散度参数收缩估计、空间平滑移动窗口打分与植物各甲基化环境阈值过滤标准（CG 40%、CHG 20%、CHH 10%）；
  - `m07-topic-04`: 开放染色质测序与转录因子足迹、突变型 Tn5 转座酶二聚体空间结合构型、+4/-5 bp 单碱基移位校正数学原理、片段长度多峰周期性分布、MACS3 动态泊松 Peak Calling 模型、植物叶绿体与线粒体高丰度污染去除及 TSSE 质控标准；
  - `m07-topic-05`: 组蛋白修饰与转录因子结合位点鉴定、ChIP-seq 与微量原位 CUT&Tag 技术对比、MACS3 双峰移位模型与片段长度 $d$ 互相关估计、窄峰与宽峰（Broad Domains）模型参数适配、位置权重矩阵（PWM）数学推导与 MEME 期望最大化基序发现；
  - `m07-topic-06`: 染色质三维构象与空间互作、原位 Hi-C 原理、ICE 接触矩阵迭代平衡算法、接触概率距离幂律衰减模型 $P(s) \sim s^{-\gamma}$、Insulation Score 极小值谷底探测 TAD 绝缘边界、A/B 区室第一主成分解卷积以及植物端粒/着丝粒 Rabl 极性构象与 KNOT 纽状体；
  - `m07-topic-07`: 表观调控与植物环境响应、拟南芥与冬小麦春化作用 *FLC* 基因 H3K27me3 逐步成核扩散沉默与胚胎期 *ELF6*/*REF6* 擦除重置机制、转座子驱动的自发旁系表观等位基因（番茄 *Cnr*、油棕 *Karma* mantled 畸形花）、干旱与热胁迫转录启动表观记忆。
- **选型矩阵完善**: 在 `src/data/method-comparison-matrices.ts` 扩充 `hicexplorer` 与 `meme-suite` 选型及全套决策树；
- **文献出处索引**: 在 `source-review.json` 中新增 7 条权威文献追踪记录；
- **全量测试验证**: `npm run validate`、`npm run test:methods-index-v4`、`npm run test:platform-browser` 100% 通过（13,291 链接 0 死链，63 篇专题 0 语法报错，多端 7 视口 0 溢出）；
- **部署发布验证**: PR #59 Squash 合并入 main，Pages 部署成功上线。

### M08：单细胞与空间组学 (待合并验证)
- **分支**: `docs/v2.3-m08-single-cell` | **PR**: #60 | **状态**: 已完成全量开发与本地三套测试
- **图解建设**: 绘制 3 幅原创学术 SVG 矢量图解置于 `public/images/topics/m08/`：
  1. `single-cell-rna-seq-workflow-and-sparse-matrix.svg`: 植物单细胞原生质体制备 vs. 单细胞核抽提双路线对比、液滴微流控油包水微胶滴（GEMs）、Cell Barcode 汉明纠错与 UMI 去重分子计数机制，以及超稀疏表达矩阵的 CSR 压缩存储结构；
  2. `single-cell-clustering-umap-and-rna-velocity.svg`: 高维表达空间到 PCA 截断奇异值分解、 $k$-NN 细胞邻近图、Leiden 模块度最优化社区发现、UMAP 低维流形空间投影，以及未剪接/剪接 mRNA 相平面微分方程与 RNA Velocity 动力学流速场；
  3. `spatial-transcriptomics-cell2location-deconvolution.svg`: 空间转录组原位阵列玻片捕获机制、多细胞 Spot 组织混杂效应、单细胞 scRNA-seq 参考图谱特征字典、Cell2location 层次贝叶斯负二项空间反卷积模型，以及 Squidpy 空间邻近微环境共富集分析。
- **核心专题深度建设**: 覆盖 M08 全部 7 篇核心专题：
  - `m08-topic-01`: 植物单细胞与单核转录组基础、原生质体消化诱发的人工应激转录伪影、snRNA-seq 物理匀浆解离优势、微流控泊松捕获模型、Cell Barcode 汉明距离纠错与 UMI 绝对计数原理、EmptyDrops 游离背景 RNA 判别与 CSR 稀疏矩阵存储；
  - `m08-topic-02`: 单细胞质控、文库归一化与批次校正、中位数绝对偏差（MAD）自适应过滤模型、DoubletFinder 人工双细胞模拟与 pANN 泊松阈值截断、Shifted Logarithm vs. SCTransform 正则化负二项回归残差方差稳定化、Harmony 软聚类与 Scanorama 相互最近邻（MNN）跨批次流形对齐，以及植物光合组织与地下根系细胞器比例组织异质性；
  - `m08-topic-03`: 单细胞流形降维与图聚类、高变基因（HVGs）均值-方差对数拟合筛选、PCA 截断奇异值分解与碎石图拐点判定、 $k$-NN 模糊单纯形网络构建、Leiden 模块度 CPM 质量函数最优化（解决 Louvain 内部孤岛断开缺陷），以及 UMAP 交叉熵损失函数推导；
  - `m08-topic-04`: 标记基因与细胞类型注释、Wilcoxon 秩和检验统计量推导与 AUC 细胞特异性打分、Pseudobulk 样本级聚合规避细胞伪重复、拟南芥与水稻根系由外向内解剖同心圆经典标记基因全景（根冠 *SMB*、表皮 *COBL9*/*GL2*、内皮层 *SCR*/*MYB36*、中柱鞘 *GATA23*、木质部 *VND7*、韧皮部 *APL*/*SUC2*、静止中心 *WOX5*）；
  - `m08-topic-05`: 单细胞拟时序与细胞命运决定、扩散图（Diffusion Maps）马尔可夫转移算子与 DPT 扩散伪时间、RNA 速率（RNA Velocity）两室生化反应常微分方程与相平面瞬时速度矢量 $v = \beta u - \gamma s$、CellRank 吸收马尔可夫链第一步代数方程 $(\mathbf{I} - \mathbf{Q})\mathbf{B} = \mathbf{R}$ 求解谱系分化吸收概率；
  - `m08-topic-06`: 空间转录组与细胞组成反卷积、原位芯片 Spot 组织多细胞混杂物理局限、Moran's $I$ 空间自相关系数方程、Cell2location 层次贝叶斯负二项反卷积推断每个 Spot 的单细胞类型绝对丰度 $w_{s, f}$、Squidpy 空间邻近图与微环境共富集置换检验；
  - `m08-topic-07`: 单细胞多组学与跨模态整合、配对 10x Multiome vs. 非配对跨模态对齐、scATAC-seq TF-IDF 潜语义索引（LSI，剔除测序深度伪影 LSI-1）、ArchR 物理距离指数衰减基因活性评分（Gene Score）、Seurat v4 WNN 加权最近邻多模态整合，以及 Peak-to-Gene 顺式调控网络预测。
- **选型矩阵完善**: 在 `src/data/method-comparison-matrices.ts` 扩充 `cell2location` 与 `archr` 选型档案及全套决策树；
- **文献出处索引**: 在 `source-review.json` 中新增 7 条权威文献追踪记录；
- **全量测试验证**: `npm run validate`、`npm run test:methods-index-v4`、`npm run test:platform-browser` 100% 通过（13,172 链接 0 死链，63 篇专题 0 语法报错，多端 7 视口 0 溢出）。







