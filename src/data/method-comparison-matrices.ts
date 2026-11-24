/**
 * PhytoMethods 9 大研究领域核心工具选型对比矩阵数据
 * 帮助科研工作者根据数据类型、物种特征、算力预算与研究目标精准选型
 */

export interface ComparisonMethodRow {
  methodId: string;
  name: string;
  inputType: string;
  corePrinciple: string;
  computeProfile: string;
  advantages: string;
  limitations: string;
  recommendedScenario: string;
}

export interface DecisionTreeItem {
  condition: string;
  recommendation: string;
  rationale: string;
}

export interface DomainComparisonMatrix {
  domainId: string;
  domainCode: string;
  domainName: string;
  selectionGuideSummary: string;
  methods: ComparisonMethodRow[];
  decisionTrees: DecisionTreeItem[];
}

export const methodComparisonMatrices: Record<string, DomainComparisonMatrix> = {
  // M01 测序与基因组组装
  'genome-assembly': {
    domainId: 'genome-assembly',
    domainCode: 'M01',
    domainName: '测序与基因组组装',
    selectionGuideSummary: '植物从头组装选型主要取决于测序数据组合（HiFi 单独 vs HiFi+ONT 混合）、基因组杂合度与多倍化程度。',
    methods: [
      {
        methodId: 'hifiasm',
        name: 'Hifiasm',
        inputType: 'PacBio HiFi reads (可选配 Hi-C / Trio)',
        corePrinciple: '重叠图 (String Graph) + 单倍型相位气泡分解',
        computeProfile: '高 (植物大基因组需 128~512 GB RAM)',
        advantages: '目前植物 HiFi 组装金标准，分相能力强，错误率极低，生态丰富',
        limitations: '面对超长串联重复（如着丝粒 rDNA）易断开为多个 Contig',
        recommendedScenario: '二倍体/多倍体高杂合植物的高质量染色体级别单倍型基因组构建'
      },
      {
        methodId: 'verkko',
        name: 'Verkko',
        inputType: 'PacBio HiFi + 超长 ONT (Ultra-long reads)',
        corePrinciple: '结合 Canu/Flye 变异图与 HiFi 纠错，逐步解开图路径',
        computeProfile: '极高 (需要大容量临时存储与数百 GB 内存)',
        advantages: '专为端粒到端粒 (T2T) 无缝全长染色体设计，跨越复杂着丝粒',
        limitations: '需要极高分子量（50kb+）的超长 ONT 数据作为支撑，纯 HiFi 效果不明显',
        recommendedScenario: '追求植物完整单倍型无缺口 T2T 基因组'
      },
      {
        methodId: 'yahs',
        name: 'YaHS',
        inputType: 'Contigs FASTA + Hi-C BAM',
        corePrinciple: '改进型局部接触频率衰减模型 + 染色体分群与定向',
        computeProfile: '极低 (轻量快速，仅需 8~16 GB RAM)',
        advantages: '显著优于传统 3D-DNA/ALLHiC，对微小错装更具免疫力，极速高效',
        limitations: '高度依赖前序 Contig 连续性，若 Contig 破碎挂载易出现倒位',
        recommendedScenario: '长读段 Contig 的染色体水平脚手架挂载 (Scaffolding)'
      }
    ],
    decisionTrees: [
      {
        condition: '仅有 30x PacBio HiFi 数据，目标是获得高连续性高质量组装',
        recommendation: '首选 Hifiasm',
        rationale: 'Hifiasm 运算稳健，能自动输出 Primary 与 Alternate 两个单倍型版本。'
      },
      {
        condition: '同时具备 30x HiFi 与 20x+ ONT 超长读长 (N50 > 50kb)，目标是冲击 T2T 零 Gap',
        recommendation: '选择 Verkko',
        rationale: 'Verkko 具备目前业界最顶尖的图路径简化引擎，能利用超长 reads 贯通难辨着丝粒。'
      },
      {
        condition: '已获得 Contigs，需要利用 Hi-C 数据挂载至拟染色体',
        recommendation: '首选 YaHS',
        rationale: 'YaHS 计算资源占用小、挂载准确率高，并可无缝导出 Juicebox 查看热图。'
      }
    ]
  },

  // M02 基因组注释与重复序列
  'genome-annotation': {
    domainId: 'genome-annotation',
    domainCode: 'M02',
    domainName: '基因组注释与重复序列',
    selectionGuideSummary: '植物基因组注释需遵循“先从头挖掘屏蔽转座子，再结合转录组与同源蛋白预测结构基因”的科学分阶段策略。',
    methods: [
      {
        methodId: 'edta',
        name: 'EDTA',
        inputType: '染色体水平基因组 FASTA',
        corePrinciple: '整合 LTR_retriever、TIR-Learner、HelitronScanner 等专业挖掘引擎',
        computeProfile: '高 (多线程密集，耗时 12~36 小时)',
        advantages: '专为植物高重复定制，结构完整，极大降低假阳性与重复重叠',
        limitations: '极度破碎或超大基因组运行时间漫长',
        recommendedScenario: '植物全基因组转座子元件 (TE) 从头识别与泛基因组重复注释'
      },
      {
        methodId: 'braker3',
        name: 'BRAKER3',
        inputType: '屏蔽重复后的 FASTA + RNA-seq BAM + 同源蛋白库',
        corePrinciple: '整合 GeneMark-ETP 与 AUGUSTUS 深度隐马尔可夫模型',
        computeProfile: '中~高 (24~48 小时)',
        advantages: '同时结合短读转录剪接位点与多物种同源蛋白支持，外显子边界极准',
        limitations: '安装依赖环境极度繁杂，对 RNA-seq 组织多样性要求高',
        recommendedScenario: '高可信度结构蛋白编码基因自动预测'
      },
      {
        methodId: 'interproscan',
        name: 'InterProScan',
        inputType: '预测基因蛋白序列 FASTA',
        corePrinciple: '集成 Pfam、SUPERFAMILY、PANTHER 等 14 个结构域数据库扫描',
        computeProfile: '中等 (I/O 读写密集，支持多线程分块)',
        advantages: '蛋白结构域、功能分类、GO 术语与 Reactome 通路注释金标准',
        limitations: '数据库体积超 100 GB，更新维护需充裕磁盘',
        recommendedScenario: '全蛋白质组结构域与生物学功能全景注释'
      }
    ],
    decisionTrees: [
      {
        condition: '新植物基因组刚组装完毕，需要进行高质量重复序列注释与软屏蔽',
        recommendation: '首选 EDTA',
        rationale: 'EDTA 是目前植物学界公认最高精度的全自动转座子注释管线。'
      },
      {
        condition: '需要开展全基因组基因结构预测，且有近缘种蛋白库和组织转录组',
        recommendation: '首选 BRAKER3',
        rationale: '结合实验表达证据与进化同源信息，假阳性最低。'
      }
    ]
  },

  // M03 泛基因组与结构变异
  'pangenomics-structural-variation': {
    domainId: 'pangenomics-structural-variation',
    domainCode: 'M03',
    domainName: '泛基因组与结构变异',
    selectionGuideSummary: '识别大片段倒位、易位与 PAV 时，高连续性组装选择全基因组共线性比对；重测序样本则选择基于 reads 断裂点检测。',
    methods: [
      {
        methodId: 'syri',
        name: 'SyRI',
        inputType: '双基因组全基因组比对 BAM (minimap2 输出)',
        corePrinciple: '共线性块网络遍历与局部重排图解析',
        computeProfile: '低~中 (16 线程, 16~32 GB RAM)',
        advantages: '可精准分类共线性、倒位、易位、重排与插入缺失断点',
        limitations: '依赖于高质量假分子染色体级别组装，不可用于短读重测序',
        recommendedScenario: '两个或多个高质量参考基因组间的结构变异全景剖析'
      },
      {
        methodId: 'minigraph-cactus',
        name: 'Minigraph-Cactus',
        inputType: '多个单倍型/品系基因组 FASTA',
        corePrinciple: '先用 Minigraph 构建主干图，再用 Cactus 填充全碱基对齐',
        computeProfile: '极高 (需分布式集群或 256GB+ 大内存节点)',
        advantages: '真正无参考偏倚的碱基级全基因组图谱，支持直接导出 VCF 与 GFA',
        limitations: '计算资源需求巨大，工作流调试门槛高',
        recommendedScenario: '大规模多品系植物图形泛基因组构建'
      },
      {
        methodId: 'cutesv',
        name: 'CuteSV',
        inputType: '单样本长读长比对 BAM (PacBio/ONT)',
        corePrinciple: '断裂点聚类与单特征向量启发式细化',
        computeProfile: '极低 (速度极快，几十分钟内完成)',
        advantages: '对中等覆盖度长读段敏感度高，资源消耗低',
        limitations: '仅支持单样本比对调用，不具备组装级倒位判定能力',
        recommendedScenario: '利用长读长重测序快速批量挖掘群体的结构变异 (SV)'
      }
    ],
    decisionTrees: [
      {
        condition: '手中拥有多个品系的染色体水平高质量独立组装',
        recommendation: '选择 SyRI 或 Minigraph-Cactus',
        rationale: 'SyRI 便于两两精细比较倒位和易位；Minigraph-Cactus 适合合成统一图形泛基因组。'
      },
      {
        condition: '仅有群体个体的 PacBio HiFi 或 ONT 测序 reads，比对到单一参考基因组',
        recommendation: '选择 CuteSV 或 Sniffles2',
        rationale: '直接利用读段跨越和 CIGAR 异常快速调用群体的插入/缺失变异。'
      }
    ]
  },

  // M04 比较基因组学与演化
  'comparative-genomics': {
    domainId: 'comparative-genomics',
    domainCode: 'M04',
    domainName: '比较基因组学与演化',
    selectionGuideSummary: '根据分析尺度选型：基因家族聚类选 OrthoFinder，多倍化共线性选 MCScanX，基因家族动态演化选 CAFE 5。',
    methods: [
      {
        methodId: 'orthofinder',
        name: 'OrthoFinder',
        inputType: '多物种全蛋白质组 FASTA',
        corePrinciple: '标准化 BLAST 距离 + MCL 图聚类 + 基因树/物种树调和',
        computeProfile: '中等 (结合 DIAMOND 可高效处理数十个植物)',
        advantages: '聚类准确度业界第一，自动输出直系同源矩阵与有根物种树',
        limitations: '面对全基因组复制 (WGD) 频繁的植物，物种树需结合核基因核实',
        recommendedScenario: '比较基因组学、系统发育树推断与同源正交群划分'
      },
      {
        methodId: 'mcscanx',
        name: 'MCScanX',
        inputType: '物种内/跨物种 BLASTP 结果 + GFF3 基因坐标',
        corePrinciple: '动态规划寻找沿染色体共线排列的同源基因对',
        computeProfile: '极低 (秒级运行)',
        advantages: '直观展示全基因组复制 (WGD) 事件、同源块、串联重复与共线性图',
        limitations: '仅识别基因水平共线性，不包含非编码调控区共线性',
        recommendedScenario: '多倍化古演化历史、共线性微区分析与旁系同源基因分类'
      },
      {
        methodId: 'cafe5',
        name: 'CAFE 5',
        inputType: '基因家族大小计数表 + 超度量物种树',
        corePrinciple: '基于生灭过程（Birth-Death Process）的泊松/伽马混合模型',
        computeProfile: '低~中 (单机几分钟至数十分钟)',
        advantages: '严格统计推断特定谱系中显著收缩或扩张的基因家族',
        limitations: '物种树必须为时间超度量树，且易受极端离群大家族干扰',
        recommendedScenario: '环境适应性演化、代谢关键通路基因扩张分析'
      }
    ],
    decisionTrees: [
      {
        condition: '需要鉴定跨物种正交同源基因并推断系统发育物种树',
        recommendation: '首选 OrthoFinder',
        rationale: '自动化程度最高，全面覆盖 1:1, 1:多, 多:多同源关系。'
      },
      {
        condition: '探讨植物是否发生过特定 WGD 古四倍化事件，分析同源共线性',
        recommendation: '首选 MCScanX (结合 wgd 软件包)',
        rationale: '经典经典共线性分析算法，与 Ks 谱分析完美结合。'
      },
      {
        condition: '探讨耐旱或特定农艺性状演化中，哪些基因家族发生了显著扩张',
        recommendation: '首选 CAFE 5',
        rationale: '提供严格的 P 值统计检验，直接指出扩张分支与基因家族 ID。'
      }
    ]
  },

  // M05 群体遗传与驯化
  'population-genetics': {
    domainId: 'population-genetics',
    domainCode: 'M05',
    domainName: '群体遗传与驯化',
    selectionGuideSummary: '根据遗传分析主题选型：数据质控首选 PLINK，亚群分层选 ADMIXTURE，历史有效群体大小 ($N_e$) 动态演化选 SMC++ / PSMC。',
    methods: [
      {
        methodId: 'plink',
        name: 'PLINK',
        inputType: 'VCF 或二进制 BED/BIM/FAM',
        corePrinciple: '紧凑位运算、哈迪-温伯格平衡检验与 LD 统计',
        computeProfile: '极低 (工业级极致性能优化)',
        advantages: '群体遗传学质控、过滤、PCA、亲缘矩阵计算不可替代的基础工具',
        limitations: '1.9 版本不支持多等位变异与非二倍体',
        recommendedScenario: '全基因组变异质控、LD 衰减分析、主成分分析'
      },
      {
        methodId: 'admixture',
        name: 'ADMIXTURE',
        inputType: '经过 LD 剪枝的二进制 BED 格式',
        corePrinciple: '最大似然法结合拟牛顿加速优化祖先成分比例',
        computeProfile: '中等 (支持多线程与交叉验证 CV)',
        advantages: '直观展示群体亚群遗传混合背景，结构明确',
        limitations: '需预先严格做 LD 剪枝，否则因连锁位点虚高权重造成偏差',
        recommendedScenario: '自然群体与栽培品系的祖先遗传成分推断'
      },
      {
        methodId: 'smcpp',
        name: 'SMC++',
        inputType: '多样本联合分型 VCF',
        corePrinciple: '结合隐马尔可夫模型 (SMC) 与等位基因频谱 (SFS)',
        computeProfile: '中等 (需分染色体并行拟合)',
        advantages: '突破 PSMC 单个体的局限，同时支持多个体并可推断两群体分化时间',
        limitations: '对未解析相位的基因型质量和掩码屏蔽非常敏感',
        recommendedScenario: '近期至远古阶段有效群体大小 ($N_e$) 波动及物种分化时间推断'
      }
    ],
    decisionTrees: [
      {
        condition: '刚刚获得数百万个群体原始 SNP，需要进行过滤和降维',
        recommendation: '首选 PLINK',
        rationale: '过滤缺失率、MAF 与 LD 剪枝速度极快，几分钟即可产出 clean 数据。'
      },
      {
        condition: '需要评估作物品种群体的遗传结构分层与杂交渗入比例',
        recommendation: '首选 ADMIXTURE',
        rationale: '通过绘制 Q 矩阵柱状图直观区分地方品种、农家种与现代育成品种。'
      },
      {
        condition: '想知道作物在末次冰期或驯化时期的群体数量是如何波动的',
        recommendation: '首选 SMC++ (多样本) 或 PSMC (单样本深度测序)',
        rationale: '基于重组率与突变率反推过去数万年至数百万年的种群消长历史。'
      }
    ]
  },

  // M06 全基因组关联分析与分子育种
  'gwas-breeding': {
    domainId: 'gwas-breeding',
    domainCode: 'M06',
    domainName: '全基因组关联分析与分子育种',
    selectionGuideSummary: '根据遗传群体类型与模型选型：自然群体 GWAS 选 GAPIT，双亲家系 QTL 选 R/qtl2，育种全基因组选择 (GS) 选 rrBLUP。',
    methods: [
      {
        methodId: 'gapit',
        name: 'GAPIT',
        inputType: 'SNP 基因型矩阵 + 连续/离散表型数据',
        corePrinciple: '混合线性模型 (MLM)、FarmCPU、Blink 等高效算法',
        computeProfile: '中等 (FarmCPU/Blink 模型极度轻量)',
        advantages: '植物 GWAS 黄金标准，有效控制假阳性，自动输出曼哈顿图与 QQ 图',
        limitations: 'R 语言内存回收机制在极端大矩阵下需合理分块',
        recommendedScenario: '作物复杂农艺性状的全基因组关联分析'
      },
      {
        methodId: 'rrblup',
        name: 'rrBLUP',
        inputType: '训练群体基因型与表型',
        corePrinciple: '岭回归最佳线性无偏预测 (Ridge Regression BLUP)',
        computeProfile: '低 (经典线性代数运算)',
        advantages: '基因组选择 (GS) 育种值预测基石，收敛稳定，鲁棒性高',
        limitations: '假设所有位点效应方差相同，不适用于少数大效应主效基因',
        recommendedScenario: '作物杂交育种值预测 (GEBV) 与分子标记辅助选择'
      },
      {
        methodId: 'rqtl2',
        name: 'R/qtl2',
        inputType: '重组自交系 (RIL)、F2 或回交双亲群体遗传图谱',
        corePrinciple: '隐马尔可夫模型估计基因型概率 + 线性模型扫描 LOD 值',
        computeProfile: '低 (支持现代高密度分子标记)',
        advantages: '双亲与多亲（MAGIC、NAM）分离群体 QTL 定位首选',
        limitations: '仅限于已知杂交系谱的受控家系，不可用于多样性自然群体',
        recommendedScenario: '高分辨率遗传连锁图谱构建与双亲分离群体 QTL 精细定位'
      }
    ],
    decisionTrees: [
      {
        condition: '收集了数百份全球收集的作物品种，表型为株高、产量等',
        recommendation: '首选 GAPIT (启用 FarmCPU 或 Blink 模型)',
        rationale: '利用多位点迭代方法剔除混杂关联，显著避免群体结构带来的假阳性。'
      },
      {
        condition: '建立了双亲人工杂交组合（如抗病亲本 × 丰产亲本）后代 RIL 群体',
        recommendation: '首选 R/qtl2',
        rationale: '专门适配家系重组事件，精准计算 LOD 值并确定因果区间。'
      },
      {
        condition: '面向智慧育种，需要通过历史品系预测未测表型后代的育种值',
        recommendation: '首选 rrBLUP',
        rationale: 'GS 领域经典标准，快速计算个体基因组估计育种值 (GEBV)。'
      }
    ]
  },

  // M07 表观基因组与三维基因组
  'epigenomics-3d-genome': {
    domainId: 'epigenomics-3d-genome',
    domainCode: 'M07',
    domainName: '表观基因组与三维基因组',
    selectionGuideSummary: 'DNA 甲基化检测选 Bismark / DSS；染色质开放与组蛋白修饰选 MACS3；三维染色质互作选 HiCExplorer。',
    methods: [
      {
        methodId: 'bismark',
        name: 'Bismark',
        inputType: 'WGBS / RRBS 亚硫酸氢盐测序 FASTQ',
        corePrinciple: '四条 C->T / G->A 转换链双向比对 + 甲基化胞嘧啶提取',
        computeProfile: '中~高 (计算量约为普通比对的 4 倍)',
        advantages: '动植物 DNA 甲基化比对标杆，精确输出 CG、CHG、CHH 三种植物甲基化位点',
        limitations: '比对速度受限于转换链搜索',
        recommendedScenario: '植物全基因组单碱基分辨率 DNA 甲基化图谱构建'
      },
      {
        methodId: 'dss',
        name: 'DSS',
        inputType: '全基因组甲基化位点 Reads 计数表',
        corePrinciple: '贝叶斯 Beta-二项分布分层模型 + 空间平滑空间关联',
        computeProfile: '低 (R 语言轻量计算)',
        advantages: '识别差异甲基化区域 (DMR)，即使低覆盖度下依然保持高统计功效',
        limitations: '输入前需完成序列比对与位点提取',
        recommendedScenario: '逆境胁迫下或不同组织间的差异甲基化区域 (DMR) 鉴定'
      },
      {
        methodId: 'macs3',
        name: 'MACS3',
        inputType: 'ChIP-seq 或 ATAC-seq 比对 BAM',
        corePrinciple: '基于动态泊松分布经验模型进行局部富集峰判定',
        computeProfile: '低 (轻量极速)',
        advantages: '染色质开放区 (Accessible Chromatin) 与转录因子结合位点 Peak Calling 标准',
        limitations: '面对超宽修饰（如 H3K27me3）需开启 `--broad` 选项',
        recommendedScenario: '植物顺式调控元件 (cCREs) 挖掘与染色质可及性分析'
      }
    ],
    decisionTrees: [
      {
        condition: '需要构建植物全基因组 DNA 甲基化图谱并分析 CHG/CHH 状态',
        recommendation: '首选 Bismark 比对 + DSS 寻找差异 DMR',
        rationale: 'Bismark 提供详尽的胞嘧啶环境统计，DSS 在小样本下检测 DMR 极具统计可靠性。'
      },
      {
        condition: '需要检测植物基因启动子区域的染色质开放程度 (ATAC-seq)',
        recommendation: '首选 MACS3',
        rationale: 'MACS3 针对短读段堆叠峰的假阳性控制优秀，输出标准化窄峰 (NarrowPeak)。'
      }
    ]
  },

  // M08 单细胞与空间组学
  'single-cell-spatial-omics': {
    domainId: 'single-cell-spatial-omics',
    domainCode: 'M08',
    domainName: '单细胞与空间组学',
    selectionGuideSummary: '植物单细胞转录组首选 Scanpy，空间转录组原位分析选 Squidpy，细胞分化轨迹推断选 CellRank。',
    methods: [
      {
        methodId: 'scanpy',
        name: 'Scanpy',
        inputType: '单细胞/单核表达矩阵 (10x Genomics MTX 或 H5AD)',
        corePrinciple: '稀疏矩阵线性代数运算 + kNN 邻近图 + UMAP/Leiden 聚类',
        computeProfile: '极低 (优化极佳，数十万细胞秒级/分钟级处理)',
        advantages: 'Python 生态单细胞金标准，内存开销比 Seurat 小数倍，生态扩展广阔',
        limitations: '植物原生质体细胞壁消化造成的应激基因需严格手动过滤',
        recommendedScenario: '植物根尖、叶片分生组织单细胞细胞类型鉴定与标记基因挖掘'
      },
      {
        methodId: 'squidpy',
        name: 'Squidpy',
        inputType: '空间转录组矩阵 + 组织学显微图像坐标 (Visium / Stereo-seq)',
        corePrinciple: '空间近邻图 (Spatial Graph) + 空间自相关性统计 (Moran\'s I)',
        computeProfile: '低~中 (图像处理模块对内存有一定要求)',
        advantages: '无缝衔接 Scanpy，深度整合空间位置与基因表达空间异质性',
        limitations: '植物细胞壁和自发荧光对图像切片配准带来挑战',
        recommendedScenario: '植物器官切片原位表达模式与组织微环境细胞互作'
      },
      {
        methodId: 'cellrank',
        name: 'CellRank',
        inputType: '包含 RNA 速率 (RNA Velocity) 或假时间序列的 AnnData',
        corePrinciple: '马尔可夫链稳态转移矩阵结合生物方向先验',
        computeProfile: '中等',
        advantages: '比传统单向拟时间序列更具物理方向性，准确指出分化起点与终点终态',
        limitations: '需要高比例未剪接前体 RNA (Unspliced reads) 支撑',
        recommendedScenario: '植物分生组织干细胞分化方向与器官发育时序动态推断'
      }
    ],
    decisionTrees: [
      {
        condition: '处理大规模植物根系或发育组织单细胞 RNA 测序数据',
        recommendation: '首选 Scanpy',
        rationale: '计算性能卓越，支持超大规模细胞量，配合 AnnData 格式方便数据交互。'
      },
      {
        condition: '研究作物组织切片上的基因原位表达与空间细胞微区',
        recommendation: '首选 Squidpy',
        rationale: '直接计算空间富集度与组织结构域边界。'
      }
    ]
  },

  // M09 调控网络与组学人工智能
  'regulatory-genomics-ai': {
    domainId: 'regulatory-genomics-ai',
    domainCode: 'M09',
    domainName: '调控网络与组学人工智能',
    selectionGuideSummary: '转录组差异分析选 DESeq2，共表达网络选 WGCNA，调控因子-靶基因因果排序选 GENIE3 / GRNBoost2，基因组序列大模型选 AgroNT。',
    methods: [
      {
        methodId: 'deseq2',
        name: 'DESeq2',
        inputType: '未标准化的基因原始计数矩阵 (Raw Counts)',
        corePrinciple: '负二项分布广义线性模型 (GLM) + 经验贝叶斯离散度收缩',
        computeProfile: '低 (极速统计检验)',
        advantages: '转录组差异分析高引用金标准，对生物学重复波动控制力强',
        limitations: '不可输入经过 FPKM/TPM 标准化的浮点数',
        recommendedScenario: '植物逆境响应、发育时序及不同突变体间的差异基因鉴定'
      },
      {
        methodId: 'wgcna',
        name: 'WGCNA',
        inputType: '经过 VST/rlog 标准化的高变异基因表达矩阵',
        corePrinciple: '相关性软阈值加权网络 + 拓扑重叠矩阵 (TOM) 层次聚类',
        computeProfile: '中等 (基因数过多时需分块计算)',
        advantages: '将数万个基因归纳为数十个协同模块，直接与生理表型关联',
        limitations: '基于非有向共表达相关，无法直接证明因果调控方向',
        recommendedScenario: '生理指标关键模块定位与核心 Hub 枢纽基因挖掘'
      },
      {
        methodId: 'genie3',
        name: 'GENIE3',
        inputType: '基因表达矩阵 + 候选转录因子 (TF) 列表',
        corePrinciple: '随机森林或 Extra-Trees 回归特征重要性排序',
        computeProfile: '中~高 (支持多线程树构建)',
        advantages: 'DREAM 挑战赛常胜算法，输出带权重的有向调控边列表',
        limitations: '运算复杂度随基因数递增，极大规模建议用 GRNBoost2',
        recommendedScenario: '从头推断植物转录调控网络 (GRN) 与靶基因调控层次'
      }
    ],
    decisionTrees: [
      {
        condition: '比较处理组与对照组（如干旱胁迫 vs 正常浇水）的基因表达变化',
        recommendation: '首选 DESeq2',
        rationale: '基于负二项分布的收缩估计在动植物界拥有最广泛的验证和极低假阳性率。'
      },
      {
        condition: '面对数十个发育时期或组织样本，希望找到与特定养分含量强相关的基因群',
        recommendation: '首选 WGCNA',
        rationale: '计算模块特征向量（ME）与性状的相关系数，快速聚焦核心调控通路。'
      },
      {
        condition: '想要从表达数据中挖掘核心转录因子究竟调控了哪些下游靶基因',
        recommendation: '首选 GENIE3 或 GRNBoost2',
        rationale: '利用集成树模型量化转录因子对靶基因表达的预测贡献度。'
      }
    ]
  }
};
