/**
 * PhytoMethods 科研实体关系判定与语义映射引擎
 */

import type { RelationType, KnowledgeEvidence } from './graph-types.ts';
import { createEvidence } from './evidence.ts';

// 已知的方法扩展/改进论文映射表 (paperId -> methodId)
const knownExtendingPapers: Record<string, string> = {
  'admixture-enhancements': 'admixture'
};

// 已知的基准评估比较论文映射表 (paperId -> methodIds)
const knownBenchmarkingPapers: Record<string, string[]> = {
  'plant-sv-benchmark-2026': ['sniffles2', 'cutesv'],
  'sorghum-graph-benchmark': ['minigraph', 'minigraph-cactus', 'pggb']
};

export interface ResolveRelationParams {
  paperId: string;
  paperType: 'method' | 'application' | 'review';
  paperTitle?: string;
  paperDoi?: string;
  targetMethodId: string;
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
  targetMethodId,
  canonicalMethodPaperId,
  isMethodCanonicalPaper
}: ResolveRelationParams): { relation: RelationType; evidence: KnowledgeEvidence } {
  // 1. 扩展或改进方法 (extends_method)
  if (knownExtendingPapers[paperId] === targetMethodId || /enhanc|extend|improv|v2|version 2/i.test(paperTitle || '')) {
    if (!isMethodCanonicalPaper) {
      return {
        relation: 'extends_method',
        evidence: createEvidence({
          sourceType: 'paper',
          sourceId: paperId,
          doi: paperDoi,
          note: `论文 "${paperTitle || paperId}" 对算法 "${targetMethodId}" 进行功能扩展与性能增强。`,
          verificationStatus: 'source_checked'
        })
      };
    }
  }

  // 2. 基准评测与方法比较 (evaluates_method)
  if (knownBenchmarkingPapers[paperId]?.includes(targetMethodId) || /benchmark|evaluat|compar/i.test(paperTitle || '')) {
    if (!isMethodCanonicalPaper) {
      return {
        relation: 'evaluates_method',
        evidence: createEvidence({
          sourceType: 'paper',
          sourceId: paperId,
          doi: paperDoi,
          note: `论文 "${paperTitle || paperId}" 开展了对算法 "${targetMethodId}" 的基准评测或性能比较。`,
          verificationStatus: 'source_checked'
        })
      };
    }
  }

  // 3. 首次提出或正式发布方法 (introduces_method)
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

  // 4. 植物研究中实际使用 (uses_method)
  if (paperType === 'application') {
    return {
      relation: 'uses_method',
      evidence: createEvidence({
        sourceType: 'frontmatter',
        sourceId: paperId,
        doi: paperDoi,
        note: `植物应用研究 "${paperId}" 在生物信息学分析流程中实际使用了 "${targetMethodId}"。`,
        verificationStatus: 'source_checked'
      })
    };
  }

  // 5. 方法学论文交叉引用或辅助集成 (references_method)
  return {
    relation: 'references_method',
    evidence: createEvidence({
      sourceType: 'frontmatter',
      sourceId: paperId,
      doi: paperDoi,
      note: `方法学论文 "${paperId}" 引用、讨论或集成了算法 "${targetMethodId}"。`,
      verificationStatus: 'structurally_valid'
    })
  };
}
