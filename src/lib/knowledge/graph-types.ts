/**
 * PhytoMethods 知识图谱核心类型定义与 Schema V2.1
 */

export type NodeType =
  | 'domain'
  | 'topic'
  | 'method'
  | 'paper_method'
  | 'paper_application'
  | 'paper_review'
  | 'species'
  | 'tutorial';

export type RelationType =
  | 'introduces_method' // 论文首次提出或发布该算法/方法
  | 'uses_method'       // 研究实际使用某工具或算法开展植物分析
  | 'extends_method'    // 论文扩展、强化或改进已有方法（如增强版）
  | 'evaluates_method'  // 论文对多种算法进行基准评测或比较
  | 'references_method' // 论文引用、提及或方法间交叉关联
  | 'features_method'   // 专题收录该方法
  | 'references_paper'  // 专题引证文献
  | 'guides_method'     // 教程指导该工具使用
  | 'studies_species'   // 论文研究聚焦之植物物种
  | 'belongs_to_domain';// 实体归属之植物基因组学科分支领域

export type VerificationStatus =
  | 'structurally_valid' // 结构有效：两端实体存在，ID 与属性合法
  | 'source_checked'     // 来源已核实：已核对出版方论文、官方代码库或明确记录
  | 'needs_review';      // 待核实：存在线索但缺少全文证据

export type EvidenceSourceType =
  | 'frontmatter'
  | 'paper'
  | 'official_documentation'
  | 'curated';

export interface KnowledgeEvidence {
  sourceType: EvidenceSourceType;
  sourceId?: string;
  sourceUrl?: string;
  doi?: string;
  note?: string;
  verificationStatus: VerificationStatus;
}

export interface KnowledgeNode {
  id: string; // 命名空间 ID，例如 "method:hifiasm", "tutorial:hifiasm-intro"
  type: NodeType;
  label: string;
  slug?: string;
  href?: string;
  domainIds?: string[];
  summary?: string;
  meta?: Record<string, any>;
}

export interface KnowledgeEdge {
  id: string; // 唯一组合键: `${source}|${relation}|${target}`
  source: string; // 起始节点 ID
  target: string; // 目标节点 ID
  relation: RelationType;
  evidence: KnowledgeEvidence[];
}

export interface KnowledgeGraphV2 {
  version: string;
  description: string;
  generatedAt?: string;
  stats: {
    nodesCount: number;
    edgesCount: number;
    evidenceEntriesCount?: number;
    nodesByType: Record<NodeType, number>;
    edgesByRelation: Record<RelationType, number>;
    evidenceByStatus: Record<VerificationStatus, number>;
    evidenceRatiosByStatus?: Record<VerificationStatus, string>;
    evidenceByRelationAndStatus?: Record<RelationType, Record<VerificationStatus, number>>;
  };
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
}
