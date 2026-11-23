/**
 * PhytoMethods 确定性知识图谱构建器 V2.1
 */

import type {
  KnowledgeNode,
  KnowledgeEdge,
  KnowledgeGraphV2,
  NodeType,
  RelationType,
  VerificationStatus
} from './graph-types.ts';
import { createEvidence, mergeEvidence } from './evidence.ts';
import { resolvePaperMethodRelation } from './relation-resolver.ts';

export interface BuildGraphInputs {
  papers: Map<string, any>;
  methods: Map<string, any>;
  topics: Map<string, any>;
  tutorials: Map<string, any>;
  domainSlugs: string[];
  domainCodes: string[];
  knownSpecies: Set<string>;
  speciesLabels?: Record<string, string>;
}

export function buildKnowledgeGraph({
  papers,
  methods,
  topics,
  tutorials,
  domainSlugs,
  domainCodes,
  knownSpecies,
  speciesLabels = {}
}: BuildGraphInputs): KnowledgeGraphV2 {
  const nodesMap = new Map<string, KnowledgeNode>();
  const edgesMap = new Map<string, KnowledgeEdge>();

  // 1. 注册 Domain 节点
  domainSlugs.forEach((slug, idx) => {
    const id = `domain:${slug}`;
    nodesMap.set(id, {
      id,
      type: 'domain',
      label: slug,
      slug,
      href: `/topics/${slug}/`,
      meta: { code: domainCodes[idx] }
    });
  });

  // 2. 注册 Topic 节点
  for (const [tId, t] of topics.entries()) {
    const id = `topic:${tId}`;
    nodesMap.set(id, {
      id,
      type: 'topic',
      label: t.title,
      slug: tId,
      href: `/topics/${t.domainId}/${tId}/`,
      domainIds: [t.domainId],
      summary: t.summary,
      meta: {
        order: t.order,
        methodIds: t.methodIds,
        paperIds: t.paperIds
      }
    });
  }

  // 3. 注册 Method 节点
  for (const [mId, m] of methods.entries()) {
    const id = `method:${mId}`;
    nodesMap.set(id, {
      id,
      type: 'method',
      label: m.data.name,
      slug: mId,
      href: `/methods/${mId}/`,
      domainIds: m.data.domainIds,
      summary: m.data.summary,
      meta: {
        repository: m.data.repository,
        dataType: m.data.dataType,
        principle: m.data.principle,
        canonicalPaperId: m.data.paper
      }
    });
  }

  // 4. 注册 Paper 节点
  for (const [pId, p] of papers.entries()) {
    const pType: NodeType = p.data.type === 'method'
      ? 'paper_method'
      : (p.data.type === 'application' ? 'paper_application' : 'paper_review');
    const id = `paper:${pId}`;
    nodesMap.set(id, {
      id,
      type: pType,
      label: p.data.title,
      slug: pId,
      href: `/papers/${pId}/`,
      domainIds: p.data.domainIds,
      summary: p.data.summary,
      meta: {
        authors: p.data.authors,
        journal: p.data.journal,
        year: p.data.year,
        doi: p.data.doi,
        speciesIds: p.data.speciesIds || [],
        methodIds: p.data.methodIds || []
      }
    });
  }

  // 5. 注册 Species 节点
  for (const s of knownSpecies) {
    const id = `species:${s}`;
    nodesMap.set(id, {
      id,
      type: 'species',
      label: speciesLabels[s] || s,
      slug: s,
      meta: { key: s }
    });
  }

  // 6. 注册 Tutorial 节点 (A1 修复核心：补齐 10 个教程节点)
  for (const [tutId, tut] of tutorials.entries()) {
    const id = `tutorial:${tutId}`;
    nodesMap.set(id, {
      id,
      type: 'tutorial',
      label: tut.data.title,
      slug: tutId,
      href: `/tutorials/${tutId}/`,
      summary: tut.data.summary,
      meta: {
        methodId: tut.data.method,
        tested: tut.data.tested // 严格保持原始 verified / template / not-tested
      }
    });
  }

  // 辅助函数：安全添加边并去重合并证据
  function addEdge(source: string, target: string, relation: RelationType, evidence = createEvidence({ sourceType: 'curated' })) {
    const edgeId = `${source}|${relation}|${target}`;
    if (edgesMap.has(edgeId)) {
      const existing = edgesMap.get(edgeId)!;
      existing.evidence = mergeEvidence(existing.evidence, [evidence]);
    } else {
      edgesMap.set(edgeId, {
        id: edgeId,
        source,
        target,
        relation,
        evidence: [evidence]
      });
    }
  }

  // 7. 建立科研关系边
  // 7.1 方法官方原始论文指向 (introduces_method)
  for (const [mId, m] of methods.entries()) {
    const pId = m.data.paper;
    if (pId && papers.has(pId)) {
      const paper = papers.get(pId);
      addEdge(
        `paper:${pId}`,
        `method:${mId}`,
        'introduces_method',
        createEvidence({
          sourceType: 'official_documentation',
          sourceId: mId,
          doi: paper?.data?.doi,
          note: `工具 "${m.data.name}" 官方将论文 "${paper?.data?.title}" 指定为奠基方法文献。`,
          verificationStatus: 'source_checked'
        })
      );
    }
  }

  // 7.2 论文中的方法引用/使用/扩展/评测关系 (B1 & B2 核心：精准分类并去重)
  for (const [pId, p] of papers.entries()) {
    const mIds = Array.isArray(p.data.methodIds) ? p.data.methodIds : [];
    for (const mId of mIds) {
      if (!methods.has(mId)) continue;
      const m = methods.get(mId);
      const isCanonical = m.data.paper === pId;
      const canonicalPaper = m.data.paper ? papers.get(m.data.paper) : undefined;
      const targetMethodYear = canonicalPaper?.data?.year;

      const { relation, evidence } = resolvePaperMethodRelation({
        paperId: pId,
        paperType: p.data.type,
        paperTitle: p.data.title,
        paperDoi: p.data.doi,
        paperYear: p.data.year,
        targetMethodId: mId,
        targetMethodYear,
        canonicalMethodPaperId: m.data.paper,
        isMethodCanonicalPaper: isCanonical
      });

      addEdge(`paper:${pId}`, `method:${mId}`, relation, evidence);
    }
  }

  // 7.3 专题收录工具 (features_method) 与 引证文献 (references_paper)
  for (const [tId, t] of topics.entries()) {
    const mIds = Array.isArray(t.methodIds) ? t.methodIds : [];
    for (const mId of mIds) {
      if (methods.has(mId)) {
        addEdge(
          `topic:${tId}`,
          `method:${mId}`,
          'features_method',
          createEvidence({
            sourceType: 'curated',
            sourceId: tId,
            note: `研究专题 "${t.title}" 核心技术模块收录了算法 "${mId}"。`,
            verificationStatus: 'source_checked'
          })
        );
      }
    }

    const pIds = Array.isArray(t.paperIds) ? t.paperIds : [];
    for (const pId of pIds) {
      if (papers.has(pId)) {
        addEdge(
          `topic:${tId}`,
          `paper:${pId}`,
          'references_paper',
          createEvidence({
            sourceType: 'curated',
            sourceId: tId,
            note: `研究专题 "${t.title}" 重点精读与学术引证了文献 "${pId}"。`,
            verificationStatus: 'source_checked'
          })
        );
      }
    }
  }

  // 7.4 教程指导工具 (guides_method)
  for (const [tutId, tut] of tutorials.entries()) {
    const mId = tut.data.method;
    if (methods.has(mId)) {
      addEdge(
        `tutorial:${tutId}`,
        `method:${mId}`,
        'guides_method',
        createEvidence({
          sourceType: 'frontmatter',
          sourceId: tutId,
          note: `分析教程 "${tut.data.title}" 演示指导算法 "${mId}" 的实操流程。`,
          verificationStatus: 'source_checked'
        })
      );
    }
  }

  // 7.5 论文聚焦物种 (studies_species)
  for (const [pId, p] of papers.entries()) {
    const sList = Array.isArray(p.data.speciesIds) ? p.data.speciesIds : [];
    for (const s of sList) {
      if (knownSpecies.has(s)) {
        addEdge(
          `paper:${pId}`,
          `species:${s}`,
          'studies_species',
          createEvidence({
            sourceType: 'frontmatter',
            sourceId: pId,
            note: `论文 "${pId}" 聚焦植物材料 "${speciesLabels[s] || s}" 展开研究。`,
            verificationStatus: 'source_checked'
          })
        );
      }
    }
  }

  // 7.6 实体归属领域 (belongs_to_domain)
  for (const [pId, p] of papers.entries()) {
    const dList = Array.isArray(p.data.domainIds) ? p.data.domainIds : [];
    for (const d of dList) {
      if (domainSlugs.includes(d)) {
        addEdge(
          `paper:${pId}`,
          `domain:${d}`,
          'belongs_to_domain',
          createEvidence({
            sourceType: 'frontmatter',
            sourceId: pId,
            note: `文献 "${pId}" 归属于领域 "${d}"。`,
            verificationStatus: 'structurally_valid'
          })
        );
      }
    }
  }

  for (const [mId, m] of methods.entries()) {
    const dList = Array.isArray(m.data.domainIds) ? m.data.domainIds : [];
    for (const d of dList) {
      if (domainSlugs.includes(d)) {
        addEdge(
          `method:${mId}`,
          `domain:${d}`,
          'belongs_to_domain',
          createEvidence({
            sourceType: 'frontmatter',
            sourceId: mId,
            note: `工具 "${mId}" 归属于领域 "${d}"。`,
            verificationStatus: 'structurally_valid'
          })
        );
      }
    }
  }

  // 8. 确定性排序输出
  const nodes = [...nodesMap.values()].sort((a, b) => a.id.localeCompare(b.id));
  const edges = [...edgesMap.values()].sort((a, b) => a.id.localeCompare(b.id));

  // 9. 统计数据构建
  const nodesByType: Record<string, number> = {};
  for (const n of nodes) {
    nodesByType[n.type] = (nodesByType[n.type] || 0) + 1;
  }

  const edgesByRelation: Record<string, number> = {};
  const evidenceByStatus: Record<string, number> = {};
  for (const e of edges) {
    edgesByRelation[e.relation] = (edgesByRelation[e.relation] || 0) + 1;
    for (const ev of e.evidence) {
      evidenceByStatus[ev.verificationStatus] = (evidenceByStatus[ev.verificationStatus] || 0) + 1;
    }
  }

  return {
    version: '2.1.0',
    description: 'PhytoMethods Scientific Knowledge Graph Schema V2.1 with Evidence & Integrity',
    stats: {
      nodesCount: nodes.length,
      edgesCount: edges.length,
      nodesByType: nodesByType as Record<NodeType, number>,
      edgesByRelation: edgesByRelation as Record<RelationType, number>,
      evidenceByStatus: evidenceByStatus as Record<VerificationStatus, number>
    },
    nodes,
    edges
  };
}
