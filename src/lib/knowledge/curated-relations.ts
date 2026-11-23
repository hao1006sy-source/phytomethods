/**
 * PhytoMethods 经科学文献核实的人工策展关系库 (Curated Relations Registry)
 * 严格基于论文原文、官方版本发布及科学事实，严禁依据标题词汇模糊推断
 */

import type { RelationType, VerificationStatus } from './graph-types.ts';

export interface CuratedRelationEntry {
  paperId: string;
  methodId: string;
  relation: RelationType;
  doi?: string;
  verificationStatus: VerificationStatus;
  note: string;
}

/**
 * 经过科学文献逐项审核确认的特殊关系清单 (extends / evaluates / 特殊 uses / 辅助 references)
 */
export const curatedRelations: CuratedRelationEntry[] = [
  // 1. ADMIXTURE 增强版 (算法性能扩展与并行加速)
  {
    paperId: 'admixture-enhancements',
    methodId: 'admixture',
    relation: 'extends_method',
    doi: '10.1186/1471-2105-12-246',
    verificationStatus: 'source_checked',
    note: 'Alexander & Lange (2011) 针对 ADMIXTURE 提出拟牛顿加速与多线程并行算法扩展。'
  },
  // 2. OrthoFinder 2026重大更新 (系统发育同源推断可扩展性与精度提升)
  {
    paperId: 'orthofinder-2026',
    methodId: 'orthofinder',
    relation: 'extends_method',
    doi: '10.1038/s41592-026-03126-6',
    verificationStatus: 'source_checked',
    note: 'Emms et al. (2026) 在 Nature Methods 正式发布 OrthoFinder 新一代扩展升级算法，提升推断准确度与大规模扩展性。'
  },
  // 3. Giraffe 短读段图比对器 (作为核心算法模块扩展并集成进 vg 工具体系)
  {
    paperId: 'giraffe-paper',
    methodId: 'vg',
    relation: 'extends_method',
    doi: '10.1126/science.abg8871',
    verificationStatus: 'source_checked',
    note: 'Sirén et al. (2021) 在 Science 正式提出单倍型感知短读长比对器 Giraffe 并作为核心模块扩展整合至 vg 泛基因组工具套件。'
  },
  // 4. 被子植物长读长 SV 检测基准评测 -> cuteSV
  {
    paperId: 'plant-sv-benchmark-2026',
    methodId: 'cutesv',
    relation: 'evaluates_method',
    doi: '10.1186/s13059-026-04300-x',
    verificationStatus: 'source_checked',
    note: 'Zhang et al. (2026) 构建十种被子植物真值集，系统评估 91 种流程，对 cuteSV 变异检测性能开展基准比较。'
  },
  // 5. 被子植物长读长 SV 检测基准评测 -> Sniffles2
  {
    paperId: 'plant-sv-benchmark-2026',
    methodId: 'sniffles2',
    relation: 'evaluates_method',
    doi: '10.1186/s13059-026-04300-x',
    verificationStatus: 'source_checked',
    note: 'Zhang et al. (2026) 系统横向评测了 Sniffles2 在被子植物不同变异长度与重复区下的 F1 分数与稳定性。'
  },
  // 6. 作物泛基因组图构建基准框架 -> Minigraph
  {
    paperId: 'sorghum-graph-benchmark',
    methodId: 'minigraph',
    relation: 'evaluates_method',
    doi: '10.1093/gigascience/giaf121',
    verificationStatus: 'source_checked',
    note: 'Kopalli et al. (2025) 建立标准化评估框架，系统比较 Minigraph 在作物多组装构建中的图规模与节点特征。'
  },
  // 7. 作物泛基因组图构建基准框架 -> Minigraph-Cactus
  {
    paperId: 'sorghum-graph-benchmark',
    methodId: 'minigraph-cactus',
    relation: 'evaluates_method',
    doi: '10.1093/gigascience/giaf121',
    verificationStatus: 'source_checked',
    note: 'Kopalli et al. (2025) 评估 Minigraph-Cactus 在高粱及多作物中的图内容覆盖度、节点粒度与结构变异一致性。'
  },
  // 8. 作物泛基因组图构建基准框架 -> PGGB
  {
    paperId: 'sorghum-graph-benchmark',
    methodId: 'pggb',
    relation: 'evaluates_method',
    doi: '10.1093/gigascience/giaf121',
    verificationStatus: 'source_checked',
    note: 'Kopalli et al. (2025) 评估无参考 PGGB 流程在高粱真实与模拟组装中的图表示与变异调用表现。'
  },
  // 9. MSMC2 协议指南 -> MSMC2
  {
    paperId: 'msmc2-protocol',
    methodId: 'msmc2',
    relation: 'references_method',
    doi: '10.1007/978-1-0716-0199-0_7',
    verificationStatus: 'source_checked',
    note: 'Schiffels & Wang (2020) 撰写可复现操作协议，引用并指导 MSMC2 在多重顺序马尔可夫共祖分析中的标准流程。'
  },
  // 10. 水稻 GAPIT 育种分析 (明确澄清：实际使用而非算法扩展)
  {
    paperId: 'rice-gapit-2023',
    methodId: 'gapit',
    relation: 'uses_method',
    doi: '10.1038/s41437-023-00599-5',
    verificationStatus: 'source_checked',
    note: '研究利用 GAPIT 软件开展水稻 GWAS 分析，标题之 improve 指基于功能标记提升预测精度，非修改 GAPIT 算法。'
  },
  // 11. 玉米干旱转录组分析 (明确澄清：实际使用而非 DESeq2 基准评估)
  {
    paperId: 'maize-drought-deseq2-2019',
    methodId: 'deseq2',
    relation: 'uses_method',
    doi: '10.1371/journal.pone.0223786',
    verificationStatus: 'source_checked',
    note: '研究采用 DESeq2 开展两品种玉米叶片干旱转录组差异分析，comparative 系指生物学设计，非评测 DESeq2。'
  },
  // 12. 高粱泛基因组参考构建 (明确澄清：实际使用 Minigraph-Cactus 构图)
  {
    paperId: 'sorghum-pangenome-reference-2026',
    methodId: 'minigraph-cactus',
    relation: 'uses_method',
    doi: '10.1038/s41586-026-10229-9',
    verificationStatus: 'source_checked',
    note: '本研究实际使用 Minigraph-Cactus 构建高粱泛基因组变异图，title 之 improves 指作物农艺性状挖掘突破。'
  },
  // 13. 高粱泛基因组参考构建 (明确澄清：实际使用 vg 进行图处理)
  {
    paperId: 'sorghum-pangenome-reference-2026',
    methodId: 'vg',
    relation: 'uses_method',
    doi: '10.1038/s41586-026-10229-9',
    verificationStatus: 'source_checked',
    note: '高粱泛基因组参考研究实际使用 vg 进行图索引与结构处理。'
  },
  // 14. 高粱泛基因组参考构建 (明确澄清：实际使用 ODGI 检查路径)
  {
    paperId: 'sorghum-pangenome-reference-2026',
    methodId: 'odgi',
    relation: 'uses_method',
    doi: '10.1038/s41586-026-10229-9',
    verificationStatus: 'source_checked',
    note: '高粱泛基因组参考研究实际使用 ODGI 进行图拓扑分析与路径检查。'
  },
  // 15. 玉米驯化群体基因组 (明确澄清：实际使用 XP-CLR 扫描选择信号)
  {
    paperId: 'maize-domestication',
    methodId: 'xpclr',
    relation: 'uses_method',
    doi: '10.1038/ng.2309',
    verificationStatus: 'source_checked',
    note: 'Hufford et al. (2012) 实际使用 XP-CLR 开展玉米驯化与改良选择清除扫描，标题之 improvement 指作物品种改良。'
  },
  // 16. 高粱构图基准评估流程中对 SyRI 的辅助基线使用
  {
    paperId: 'sorghum-graph-benchmark',
    methodId: 'syri',
    relation: 'uses_method',
    doi: '10.1093/gigascience/giaf121',
    verificationStatus: 'source_checked',
    note: '评估流程中实际使用 SyRI 分析组装间变异作为比较基准。'
  },
  // 17. 高粱构图基准评估流程中对 vg 的分析调用
  {
    paperId: 'sorghum-graph-benchmark',
    methodId: 'vg',
    relation: 'uses_method',
    doi: '10.1093/gigascience/giaf121',
    verificationStatus: 'source_checked',
    note: '实际调用 VG deconstruct 从泛基因组图中解析路径变异。'
  },
  // 18. 高粱构图基准评估流程中对 ODGI 的分析调用
  {
    paperId: 'sorghum-graph-benchmark',
    methodId: 'odgi',
    relation: 'uses_method',
    doi: '10.1093/gigascience/giaf121',
    verificationStatus: 'source_checked',
    note: '实际使用 ODGI 进行图展平、覆盖度与图增长统计分析。'
  },
  // 19. 拟南芥 MAM 基因簇次生代谢演化分析 -> PAML (明确真实使用历史版本 PAML 3.14)
  {
    paperId: 'mam-positive-selection-2006',
    methodId: 'paml',
    relation: 'uses_method',
    doi: '10.1073/pnas.0601738103',
    verificationStatus: 'source_checked',
    note: 'Benderoth 等 (PNAS 2006) 明确使用 PAML 3.14 的 codeml 程序比较 M1a 空模型与 branch-site Model A，开展密码子演化与正选择分析。'
  },
  // 20. 水稻根系群体适应性演化分析 -> GAPIT (明确真实使用 GAPIT 进行群体结构协变量与亲缘矩阵构建)
  {
    paperId: 'rice-roots-population',
    methodId: 'gapit',
    relation: 'uses_method',
    doi: '10.1371/journal.pgen.1007521',
    verificationStatus: 'source_checked',
    note: 'Zhao 等 (PLOS Genetics 2018) 在 795 份水稻材料中实际使用 GAPIT 计算主成分 (PCA 前 3 个 PC) 与亲缘矩阵 (kinship matrix)，作为 GWAS 混合模型协变量。'
  }
];

export function findCuratedRelation(paperId: string, methodId: string): CuratedRelationEntry | undefined {
  return curatedRelations.find(r => r.paperId === paperId && r.methodId === methodId);
}
