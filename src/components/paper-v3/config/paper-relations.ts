/**
 * PhytoMethods 科研文献知识关联与推荐引擎 V2.1
 * 负责解析论文与算法、植物应用、专题及其他文献的多维度科学关联
 */

import { topicMetadata } from '../../../data/topics';

export interface RecommendedPaper {
  id: string;
  title: string;
  journal: string;
  year: number;
  doi: string;
  type: 'method' | 'application' | 'review';
  reason: string;
  score: number;
}

export interface PaperKnowledgeContext {
  entry: any;
  allPapers?: any[];
  allMethods?: any[];
  allTutorials?: any[];
}

/**
 * 获取方法学论文真正首次提出或发布的工具 ID 集合（优先以工具官方奠基论文指向为准）
 */
export function getIntroducedMethodIds(paperId: string, paperMethodIds: string[] = [], allMethods: any[] = []): string[] {
  const result = new Set<string>();
  // 1. 最核心科学依据：来自工具官方将该论文指定为 canonical paper
  for (const m of allMethods) {
    if (m.data?.paper === paperId) {
      result.add(m.id);
    }
  }
  // 2. 备用验证：若工具未指定其他论文，但论文自身声明
  if (result.size === 0) {
    for (const mId of paperMethodIds) {
      const m = allMethods.find(x => x.id === mId);
      if (m && (!m.data?.paper || m.data?.paper === paperId)) {
        result.add(mId);
      }
    }
  }
  return [...result];
}

/**
 * 计算文献多维度关联与精准推荐
 */
export function resolvePaperRelations({
  entry,
  allPapers = [],
  allMethods = [],
  allTutorials = []
}: PaperKnowledgeContext) {
  const paperId = entry.id;
  const paperType = entry.data.type as 'method' | 'application' | 'review';
  const paperDomainIds: string[] = entry.data.domainIds || [];
  const paperSpeciesIds: string[] = entry.data.speciesIds || [];
  const directMethodIds: string[] = entry.data.methodIds || [];

  // 1. 精确区分：真正提出的方法 (introduced) 与 关联引用的方法 (referenced)
  const introducedMethodIds = paperType === 'method'
    ? getIntroducedMethodIds(paperId, directMethodIds, allMethods)
    : [];

  // 有效关联工具（用于展示工具卡片和专题反查）：提出的工具 + 明确引用的工具
  const effectiveMethodIds = Array.from(new Set([
    ...introducedMethodIds,
    ...directMethodIds
  ]));

  // 2. 关联算法与工具实体
  const relatedMethods = allMethods.filter(m => effectiveMethodIds.includes(m.id));

  // 3. 关联研究专题
  const relatedTopics = topicMetadata.filter(t =>
    t.status === 'published' && (
      t.paperIds.includes(paperId) ||
      t.methodIds.some(mId => effectiveMethodIds.includes(mId))
    )
  );

  // 4. 关联分析教程
  const relatedTutorials = allTutorials.filter(tut =>
    effectiveMethodIds.includes(tut.data.method)
  );

  // 5. 植物应用案例（针对 method 论文：优先以本论文提出的算法查找应用案例）
  let plantApplications: any[] = [];
  if (paperType === 'method') {
    const targetIds = introducedMethodIds.length > 0 ? introducedMethodIds : effectiveMethodIds;
    plantApplications = allPapers.filter(p =>
      p.id !== paperId &&
      p.data.status === 'published' &&
      p.data.type === 'application' &&
      Array.isArray(p.data.methodIds) &&
      p.data.methodIds.some((m: string) => targetIds.includes(m))
    );

    // Hifiasm 优先保留已验收的 Macadamia 作为首选代表
    if (paperId === 'hifiasm') {
      const macadamia = plantApplications.find(p => p.id === 'macadamia');
      if (macadamia) {
        plantApplications = [macadamia, ...plantApplications.filter(p => p.id !== 'macadamia')];
      }
    }
  }

  // 6. 算法源头论文（针对 application 论文：查找其使用工具的原始方法学论文）
  let originMethodPapers: any[] = [];
  if (paperType === 'application' && directMethodIds.length > 0) {
    const originPaperIds = new Set<string>();
    for (const m of relatedMethods) {
      if (m.data?.paper && m.data.paper !== paperId) {
        originPaperIds.add(m.data.paper);
      }
    }
    originMethodPapers = allPapers.filter(p => originPaperIds.has(p.id));
  }

  // 7. 高质量文献推荐算法（层级确定性推荐）
  const candidates: RecommendedPaper[] = [];

  for (const candidate of allPapers) {
    if (candidate.id === paperId || candidate.data.status !== 'published') continue;

    let score = 0;
    let reason = '';

    const candMethodIds: string[] = candidate.data.methodIds || [];
    const candDomainIds: string[] = candidate.data.domainIds || [];
    const candSpeciesIds: string[] = candidate.data.speciesIds || [];
    const candType = candidate.data.type;

    // 优先级 1: 算法提出与应用的直接关联 (Score: 100)
    if (paperType === 'method' && candType === 'application' && candMethodIds.some(m => (introducedMethodIds.length > 0 ? introducedMethodIds : effectiveMethodIds).includes(m))) {
      score = 100;
      reason = '本算法实际植物研究案例';
    } else if (paperType === 'application' && candType === 'method' && originMethodPapers.some(p => p.id === candidate.id)) {
      score = 100;
      reason = '本研究所用算法之原始方法论文';
    }
    // 优先级 2: 共同使用相同的关键算法工作流 (Score: 60)
    else if (effectiveMethodIds.length > 0 && candMethodIds.some(m => effectiveMethodIds.includes(m))) {
      score = 60;
      reason = '采用相同生物信息学算法流程';
    }
    // 优先级 3: 共同属于相同核心专题 (Score: 40)
    else if (relatedTopics.some(t => t.paperIds.includes(candidate.id))) {
      score = 40;
      reason = '同属相同基因组学研究专题';
    }
    // 优先级 4: 相同植物物种研究 (Score: 25)
    else if (paperSpeciesIds.length > 0 && candSpeciesIds.some(s => paperSpeciesIds.includes(s))) {
      score = 25;
      reason = '相同植物物种比较研究';
    }
    // 优先级 5: 相同研究领域 (Score: 10)
    else if (paperDomainIds.some(d => candDomainIds.includes(d))) {
      score = 10;
      reason = '同领域经典学术前沿';
    }

    if (score >= 10) {
      candidates.push({
        id: candidate.id,
        title: candidate.data.title,
        journal: candidate.data.journal,
        year: candidate.data.year,
        doi: candidate.data.doi,
        type: candidate.data.type,
        reason,
        score
      });
    }
  }

  // 确定性排序：分数降序 -> 年份降序 -> ID 升序
  candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.year !== a.year) return b.year - a.year;
    return a.id.localeCompare(b.id);
  });

  const recommendedPapers = candidates.slice(0, 2);

  return {
    introducedMethodIds,
    effectiveMethodIds,
    relatedMethods,
    relatedTopics,
    relatedTutorials,
    plantApplications,
    originMethodPapers,
    recommendedPapers
  };
}
