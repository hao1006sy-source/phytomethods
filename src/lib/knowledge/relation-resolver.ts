/**
 * PhytoMethods 科研实体关系判定与语义映射引擎 V1.1.1
 * 严格基于人工策展库、官方文献对应与发表时序逻辑，彻底废除标题关键词模糊推断
 */

import type { RelationType, KnowledgeEvidence } from './graph-types.ts';
import { createEvidence } from './evidence.ts';
import { findCuratedRelation } from './curated-relations.ts';

export interface ResolveRelationParams {
  paperId: string;
  paperType: 'method' | 'application' | 'review';
  paperTitle?: string;
  paperDoi?: string;
  paperYear?: number;
  targetMethodId: string;
  targetMethodYear?: number;
  canonicalMethodPaperId?: string;
  isMethodCanonicalPaper: boolean;
}

/**
 * 确定论文与工具之间的精确科研语义类型与证据
 */
export function resolvePaperMethodRelation({
  paperId,
  paperType,
  paperTitle,
  paperDoi,
  paperYear,
  targetMethodId,
  targetMethodYear,
  canonicalMethodPaperId,
  isMethodCanonicalPaper
}: ResolveRelationParams): { relation: RelationType; evidence: KnowledgeEvidence } {
  // 1. 优先查询经过人工文献核实的人工策展清单 (Curated Relations)
  const curated = findCuratedRelation(paperId, targetMethodId);
  if (curated) {
    return {
      relation: curated.relation,
      evidence: createEvidence({
        sourceType: 'paper',
        sourceId: paperId,
        doi: curated.doi || paperDoi,
        note: curated.note,
        verificationStatus: curated.verificationStatus
      })
    };
  }

  // 2. 首次提出或正式发布方法 (introduces_method)
  if (isMethodCanonicalPaper || canonicalMethodPaperId === paperId) {
    return {
      relation: 'introduces_method',
      evidence: createEvidence({
        sourceType: 'official_documentation',
        sourceId: targetMethodId,
        doi: paperDoi,
        note: `工具 "${targetMethodId}" 官方文档将其指定为原始方法学奠基论文。`,
        verificationStatus: 'source_checked'
      })
    };
  }

  // 3. 时序冲突防御检测 (发表年份早于软件首发年份)
  if (paperYear && targetMethodYear && paperYear < targetMethodYear) {
    return {
      relation: 'references_method',
      evidence: createEvidence({
        sourceType: 'frontmatter',
        sourceId: paperId,
        doi: paperDoi,
        note: `[时序冲突警告] 论文发表于 ${paperYear} 年，早于工具基准文献发布年份 (${targetMethodYear} 年)，标记为待核实。`,
        verificationStatus: 'needs_review'
      })
    };
  }

  // 4. 植物研究中实际使用 (uses_method)
  if (paperType === 'application') {
    return {
      relation: 'uses_method',
      evidence: createEvidence({
        sourceType: 'frontmatter',
        sourceId: paperId,
        doi: paperDoi,
        note: paperTitle
          ? `植物应用研究 "${paperTitle}" 在生物信息学分析流程中使用了算法 "${targetMethodId}"。`
          : `植物应用研究 "${paperId}" 在生物信息学分析流程中使用了算法 "${targetMethodId}"。`,
        verificationStatus: 'structurally_valid'
      })
    };
  }

  // 5. 方法学或综述论文交叉引用/辅助参考 (references_method)
  return {
    relation: 'references_method',
    evidence: createEvidence({
      sourceType: 'frontmatter',
      sourceId: paperId,
      doi: paperDoi,
      note: paperTitle
        ? `论文 "${paperTitle}" (${paperType}) 在分析、讨论或流程中引用了算法 "${targetMethodId}"。`
        : `论文 "${paperId}" (${paperType}) 在分析、讨论或流程中引用了算法 "${targetMethodId}"。`,
      verificationStatus: 'structurally_valid'
    })
  };
}
