/**
 * PhytoMethods 科研实体关系判定与语义映射引擎 V1.1.2
 * 严格基于软件版本时序模型、人工策展库、官方文献对应与科学事实
 * 核心原则：
 * 1. 彻底废除标题关键词模糊推断
 * 2. 软件首发年份 (firstReleaseYear) 与代表性论文年份 (canonicalPaperYear) 严格解耦
 * 3. 时序校验属于证据审核维度，严禁篡改科学关系本身的语义 (uses_method 不会因时序警告被降为 references_method)
 */

import type { RelationType, KnowledgeEvidence } from './graph-types.ts';
import { createEvidence } from './evidence.ts';
import { findCuratedRelation } from './curated-relations.ts';
import { findVerifiedApplicationMethod } from './verified-application-methods.ts';
import { getMethodFirstReleaseYear } from './chronology.ts';

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

  // 3. 查询经过文献 Methods / 实验证据深入核实的应用关系 (Verified Application Methods)
  const verified = findVerifiedApplicationMethod(paperId, targetMethodId);
  if (verified) {
    const details = [
      verified.analysisPurpose,
      verified.softwareVersion ? `版本: ${verified.softwareVersion}` : '',
      verified.sourceSection ? `出处: ${verified.sourceSection}` : ''
    ].filter(Boolean).join('；');

    return {
      relation: 'uses_method',
      evidence: createEvidence({
        sourceType: verified.sourceType || 'paper',
        sourceId: paperId,
        doi: verified.doi || paperDoi,
        note: `${verified.evidenceSummary} [${details}]`,
        verificationStatus: verified.verificationStatus
      })
    };
  }

  // 4. 基础科学关系语义判定（根据研究类型原生赋予，与时序审核解耦）
  const baseRelation: RelationType = paperType === 'application' ? 'uses_method' : 'references_method';

  // 5. 时序合法性审核（查询软件确凿的首发年份）
  const { firstReleaseYear, source: releaseSource, isExplicitReleaseYear } = getMethodFirstReleaseYear(
    targetMethodId,
    targetMethodYear
  );

  // 只有在存在明确核实的首发年份记录时，发表年份早于软件首发才触发时序冲突警告
  if (isExplicitReleaseYear && paperYear && firstReleaseYear && paperYear < firstReleaseYear) {
    return {
      relation: baseRelation, // 保持真实的科学语义，不因时序告警改变关系类型
      evidence: createEvidence({
        sourceType: 'frontmatter',
        sourceId: paperId,
        doi: paperDoi,
        note: `[时序冲突警告] 论文发表于 ${paperYear} 年，早于工具首发文献发布年份 (${firstReleaseYear} 年，依据: ${releaseSource})，标记为待审核。`,
        verificationStatus: 'needs_review'
      })
    };
  }

  // 5. 正常应用或引用关系构建
  if (baseRelation === 'uses_method') {
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
