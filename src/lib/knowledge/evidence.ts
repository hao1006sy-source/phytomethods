/**
 * PhytoMethods 科学证据生成器与分级管理
 */

import type { KnowledgeEvidence, VerificationStatus, EvidenceSourceType } from './graph-types.ts';

export function createEvidence({
  sourceType,
  sourceId,
  sourceUrl,
  doi,
  note,
  verificationStatus = 'source_checked'
}: {
  sourceType: EvidenceSourceType;
  sourceId?: string;
  sourceUrl?: string;
  doi?: string;
  note?: string;
  verificationStatus?: VerificationStatus;
}): KnowledgeEvidence {
  return {
    sourceType,
    ...(sourceId ? { sourceId } : {}),
    ...(sourceUrl ? { sourceUrl } : {}),
    ...(doi ? { doi } : {}),
    ...(note ? { note } : {}),
    verificationStatus
  };
}

/**
 * 合并来自不同数据源的证据数组（去重且避免重复信息）
 */
export function mergeEvidence(existing: KnowledgeEvidence[] = [], newItems: KnowledgeEvidence[] = []): KnowledgeEvidence[] {
  const merged = [...existing];
  for (const item of newItems) {
    const isDuplicate = merged.some(e => 
      e.sourceType === item.sourceType &&
      e.sourceId === item.sourceId &&
      e.doi === item.doi &&
      e.note === item.note
    );
    if (!isDuplicate) {
      merged.push(item);
    }
  }
  return merged;
}
