/**
 * PhytoMethods 知识图谱完整性严格校验器 V2.1
 */

import type { KnowledgeGraphV2, NodeType, RelationType } from './graph-types.ts';

const validNodeTypes: Set<NodeType> = new Set([
  'domain',
  'topic',
  'method',
  'paper_method',
  'paper_application',
  'paper_review',
  'species',
  'tutorial'
]);

const validRelationTypes: Set<RelationType> = new Set([
  'introduces_method',
  'uses_method',
  'extends_method',
  'evaluates_method',
  'references_method',
  'features_method',
  'references_paper',
  'guides_method',
  'studies_species',
  'belongs_to_domain'
]);

export interface ValidationIssue {
  severity: 'error' | 'warning';
  code: string;
  message: string;
  entityId?: string;
}

export interface ValidationResult {
  valid: boolean;
  errorsCount: number;
  warningsCount: number;
  issues: ValidationIssue[];
  metrics: {
    danglingEdgesCount: number;
    duplicateEdgesCount: number;
    duplicateNodesCount: number;
    invalidTypesCount: number;
    invalidRoutesCount: number;
    tutorialsCovered: number;
  };
}

export function validateKnowledgeGraph(graph: KnowledgeGraphV2): ValidationResult {
  const issues: ValidationIssue[] = [];
  const nodeIds = new Set<string>();
  const edgeIds = new Set<string>();

  let danglingEdgesCount = 0;
  let duplicateEdgesCount = 0;
  let duplicateNodesCount = 0;
  let invalidTypesCount = 0;
  let invalidRoutesCount = 0;
  let tutorialsCovered = 0;

  // 1. 节点校验
  for (const node of graph.nodes) {
    // 必需字段检查
    if (!node.id || typeof node.id !== 'string') {
      issues.push({ severity: 'error', code: 'MISSING_NODE_ID', message: '节点缺少有效 id' });
      continue;
    }
    if (nodeIds.has(node.id)) {
      duplicateNodesCount++;
      issues.push({ severity: 'error', code: 'DUPLICATE_NODE_ID', message: `重复节点 ID: ${node.id}`, entityId: node.id });
    }
    nodeIds.add(node.id);

    // 节点类型合法性
    if (!validNodeTypes.has(node.type)) {
      invalidTypesCount++;
      issues.push({ severity: 'error', code: 'INVALID_NODE_TYPE', message: `非法节点类型: ${node.type}`, entityId: node.id });
    }

    if (!node.label || typeof node.label !== 'string' || !node.label.trim()) {
      issues.push({ severity: 'error', code: 'MISSING_NODE_LABEL', message: `节点缺少有效 label`, entityId: node.id });
    }

    // 路由合法性
    if (node.href) {
      if (!node.href.startsWith('/') || !node.href.endsWith('/')) {
        invalidRoutesCount++;
        issues.push({ severity: 'error', code: 'INVALID_ROUTE_FORMAT', message: `节点路由格式非法: ${node.href}`, entityId: node.id });
      }
    }

    if (node.type === 'tutorial') {
      tutorialsCovered++;
    }
  }

  // 2. 边校验
  for (const edge of graph.edges) {
    if (!edge.id || typeof edge.id !== 'string') {
      issues.push({ severity: 'error', code: 'MISSING_EDGE_ID', message: '边缺少有效 id' });
      continue;
    }

    // 唯一性检查
    if (edgeIds.has(edge.id)) {
      duplicateEdgesCount++;
      issues.push({ severity: 'error', code: 'DUPLICATE_EDGE_ID', message: `重复关系 ID: ${edge.id}`, entityId: edge.id });
    }
    edgeIds.add(edge.id);

    // 关系类型合法性
    if (!validRelationTypes.has(edge.relation)) {
      invalidTypesCount++;
      issues.push({ severity: 'error', code: 'INVALID_RELATION_TYPE', message: `非法关系类型: ${edge.relation}`, entityId: edge.id });
    }

    // 端点存在性检查（悬空关系检测）
    const sourceExists = nodeIds.has(edge.source);
    const targetExists = nodeIds.has(edge.target);
    if (!sourceExists || !targetExists) {
      danglingEdgesCount++;
      issues.push({
        severity: 'error',
        code: 'DANGLING_EDGE',
        message: `悬空关系: ${edge.id} (sourceExists: ${sourceExists}, targetExists: ${targetExists})`,
        entityId: edge.id
      });
    }

    // 证据完整性检查
    if (!Array.isArray(edge.evidence) || edge.evidence.length === 0) {
      issues.push({
        severity: 'error',
        code: 'MISSING_EVIDENCE',
        message: `关系缺少科学证据: ${edge.id}`,
        entityId: edge.id
      });
    }
  }

  // 3. 统计结果
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');

  return {
    valid: errors.length === 0,
    errorsCount: errors.length,
    warningsCount: warnings.length,
    issues,
    metrics: {
      danglingEdgesCount,
      duplicateEdgesCount,
      duplicateNodesCount,
      invalidTypesCount,
      invalidRoutesCount,
      tutorialsCovered
    }
  };
}
