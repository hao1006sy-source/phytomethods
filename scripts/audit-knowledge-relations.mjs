/**
 * PhytoMethods 知识关系与图谱完整性自动化审计程序 V2.1
 * 涵盖：实体扫描、关系解析、图谱构建、悬空与重复消除、严格完整性校验
 */

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildKnowledgeGraph } from '../src/lib/knowledge/graph-builder.ts';
import { validateKnowledgeGraph } from '../src/lib/knowledge/graph-validator.ts';

const root = fileURLToPath(new URL('../', import.meta.url));

const papersDir = join(root, 'src/content/papers');
const methodsDir = join(root, 'src/content/methods');
const tutorialsDir = join(root, 'src/content/tutorials');
const topicMetadataPath = join(root, 'src/data/topic-metadata.json');
const domainsPath = join(root, 'src/data/domains.ts');
const tagsPath = join(root, 'src/data/tags.ts');

// 简单 YAML 解析器
function parseFrontmatter(content) {
  const match = content.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { data: {}, body: content };
  const yamlText = match[1];
  const body = content.slice(match[0].length);
  const data = {};
  
  const lines = yamlText.split(/\r?\n/);
  let currentKey = null;
  let isArray = false;
  
  for (let line of lines) {
    if (/^\s*#/.test(line) || !line.trim()) continue;
    
    const keyMatch = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (keyMatch) {
      currentKey = keyMatch[1];
      let val = keyMatch[2].trim();
      if (val === '') {
        data[currentKey] = [];
        isArray = true;
      } else if (val.startsWith('[') && val.endsWith(']')) {
        const rawItems = val.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
        data[currentKey] = rawItems;
        isArray = false;
      } else {
        val = val.replace(/^['"]|['"]$/g, '');
        if (/^\d+$/.test(val)) val = parseInt(val, 10);
        data[currentKey] = val;
        isArray = false;
      }
    } else if (isArray && currentKey && line.trim().startsWith('-')) {
      const item = line.trim().replace(/^-\s*/, '').replace(/^['"]|['"]$/g, '').trim();
      if (Array.isArray(data[currentKey])) {
        data[currentKey].push(item);
      }
    }
  }
  return { data, body };
}

// 1. 读取领域与标签词典
const domainsSource = readFileSync(domainsPath, 'utf8');
const domainCodes = [...domainsSource.matchAll(/'(M0\d)'/g)].map(m => m[1]);
const domainSlugs = [
  'genome-assembly', 'genome-annotation', 'pangenomics-structural-variation',
  'comparative-genomics', 'population-genetics', 'gwas-breeding',
  'epigenomics-3d-genome', 'single-cell-spatial-omics', 'regulatory-genomics-ai'
];

const tagsSource = readFileSync(tagsPath, 'utf8');
const speciesMatches = [...tagsSource.matchAll(/([a-z0-9-]+):\s*['"]([^'"]+)['"]/g)];
const speciesLabels = Object.fromEntries(speciesMatches.map(m => [m[1], m[2]]));
const knownSpecies = new Set(Object.keys(speciesLabels));

// 2. 加载实体集合
const papers = new Map();
for (const file of readdirSync(papersDir).filter(f => f.endsWith('.md'))) {
  const id = file.replace(/\.md$/, '');
  const { data, body } = parseFrontmatter(readFileSync(join(papersDir, file), 'utf8'));
  papers.set(id, { id, file, data, body });
}

const methods = new Map();
for (const file of readdirSync(methodsDir).filter(f => f.endsWith('.md'))) {
  const id = file.replace(/\.md$/, '');
  const { data, body } = parseFrontmatter(readFileSync(join(methodsDir, file), 'utf8'));
  methods.set(id, { id, file, data, body });
}

const topicMetadata = JSON.parse(readFileSync(topicMetadataPath, 'utf8'));
const topics = new Map(topicMetadata.map(t => [t.id, t]));

const tutorials = new Map();
for (const file of readdirSync(tutorialsDir).filter(f => f.endsWith('.md'))) {
  const id = file.replace(/\.md$/, '');
  const { data, body } = parseFrontmatter(readFileSync(join(tutorialsDir, file), 'utf8'));
  tutorials.set(id, { id, file, data, body });
}

// 3. 构建知识图谱 V2.1
const graph = buildKnowledgeGraph({
  papers,
  methods,
  topics,
  tutorials,
  domainSlugs,
  domainCodes,
  knownSpecies,
  speciesLabels
});

// 4. 执行全量完整性严格校验 (0 悬空、0 重复、类型合法)
const validation = validateKnowledgeGraph(graph);

// 5. 单篇文献元数据规范性审计
const papersAudit = [];
for (const [pId, p] of papers.entries()) {
  const issues = [];
  const d = p.data;
  
  if (!d.doi || typeof d.doi !== 'string') issues.push('DOI缺失或非字符串');
  if (!d.year || typeof d.year !== 'number') issues.push(`发表年份异常: ${d.year}`);
  if (!d.journal) issues.push('期刊名称缺失');
  if (!d.title) issues.push('标题缺失');
  if (!d.authors) issues.push('作者信息缺失');
  
  const mIds = Array.isArray(d.methodIds) ? d.methodIds : [];
  for (const mId of mIds) {
    if (!methods.has(mId)) issues.push(`声明了不存在的工具ID: ${mId}`);
  }

  // 多物种文献特殊处理审查
  const isMultiSpeciesBenchmark = ['angiosperm-phylogenomics-2024', 'plant-sv-benchmark-2026', 'plant-wgd-timing-2017'].includes(pId);
  const sList = Array.isArray(d.speciesIds) ? d.speciesIds : [];
  if (d.type === 'application' && sList.length === 0 && !isMultiSpeciesBenchmark) {
    issues.push('植物应用论文未声明 speciesIds 且非多物种基准');
  }

  papersAudit.push({
    id: pId,
    title: d.title,
    type: d.type,
    doi: d.doi,
    year: d.year,
    journal: d.journal,
    domainIds: d.domainIds,
    speciesIds: d.speciesIds,
    methodIds: d.methodIds,
    status: issues.length === 0 ? '已核实' : '需审查',
    issues
  });
}

// 6. 58 个工具关联审查
const methodsAudit = [];
for (const [mId, m] of methods.entries()) {
  const issues = [];
  const d = m.data;
  const canonicalPaper = papers.get(d.paper);
  if (!d.paper) issues.push('缺少 paper 字段');
  else if (!canonicalPaper) issues.push(`指向论文不存在: ${d.paper}`);
  if (!d.repository || !d.repository.startsWith('http')) issues.push(`代码仓库地址无效: ${d.repository}`);

  const linkedApps = [...papers.values()].filter(p => 
    p.data.type === 'application' && Array.isArray(p.data.methodIds) && p.data.methodIds.includes(mId)
  ).map(p => ({ id: p.id, title: p.data.title, species: p.data.speciesIds }));

  methodsAudit.push({
    id: mId,
    name: d.name,
    canonicalPaperId: d.paper,
    canonicalPaperTitle: canonicalPaper?.data?.title,
    repository: d.repository,
    domainIds: d.domainIds,
    topicIds: d.topicIds,
    applicationPapersCount: linkedApps.length,
    applicationPapers: linkedApps,
    status: issues.length === 0 ? '已核实' : '需审查',
    issues
  });
}

// 7. 打印统计与校验总结
console.log('\n================ PhytoMethods 知识图谱完整性审计 V2.1 ================');
console.log(`全站实体: ${papers.size} 篇文献 | ${methods.size} 个工具 | ${topics.size} 篇专题 | ${tutorials.size} 篇教程`);
console.log(`知识图谱规模: ${graph.nodes.length} 个节点, ${graph.edges.length} 条语义边 (去重合并后)`);
console.log(`节点类型明细:`);
for (const [type, count] of Object.entries(graph.stats.nodesByType)) {
  console.log(`  - ${type}: ${count}`);
}
console.log(`关系类型明细:`);
for (const [rel, count] of Object.entries(graph.stats.edgesByRelation)) {
  console.log(`  - ${rel}: ${count}`);
}
console.log(`科学证据条目统计 (总证据条目数: ${graph.stats.evidenceEntriesCount}):`);
for (const [status, count] of Object.entries(graph.stats.evidenceByStatus)) {
  const ratio = graph.stats.evidenceRatiosByStatus?.[status] || '';
  console.log(`  - ${status}: ${count} (${ratio})`);
}
console.log(`关系类型之证据状态分布:`);
for (const [rel, stMap] of Object.entries(graph.stats.evidenceByRelationAndStatus || {})) {
  console.log(`  - ${rel}: source_checked=${stMap.source_checked || 0}, structurally_valid=${stMap.structurally_valid || 0}, needs_review=${stMap.needs_review || 0}`);
}

console.log(`\n=== 完整性校验结果 ===`);
console.log(`悬空关系数量: ${validation.metrics.danglingEdgesCount} (预期 0)`);
console.log(`重复关系数量: ${validation.metrics.duplicateEdgesCount} (预期 0)`);
console.log(`重复节点数量: ${validation.metrics.duplicateNodesCount} (预期 0)`);
console.log(`已覆盖教程节点: ${validation.metrics.tutorialsCovered} / 10`);
console.log(`错误总数: ${validation.errorsCount} | 警告总数: ${validation.warningsCount}`);

// 8. 写入输出文件
const outputDir = join(root, 'outputs');
writeFileSync(join(outputDir, 'knowledge-graph-v2.json'), JSON.stringify(graph, null, 2), 'utf8');

const auditReport = {
  version: '2.1.0',
  generatedAt: new Date().toISOString(),
  integrityPassed: validation.valid,
  stats: {
    ...graph.stats,
    danglingEdges: validation.metrics.danglingEdgesCount,
    duplicateEdges: validation.metrics.duplicateEdgesCount,
    duplicateNodes: validation.metrics.duplicateNodesCount,
    tutorialsCovered: validation.metrics.tutorialsCovered
  },
  validationIssues: validation.issues,
  papersAudit,
  methodsAudit
};

writeFileSync(join(outputDir, 'knowledge-audit-report.json'), JSON.stringify(auditReport, null, 2), 'utf8');
console.log(`\n知识图谱数据已写入: outputs/knowledge-graph-v2.json`);
console.log(`审计报告已写入: outputs/knowledge-audit-report.json`);

if (!validation.valid) {
  console.error('\n❌ 知识图谱完整性校验未通过！存在以下严重错误:');
  for (const err of validation.issues.filter(i => i.severity === 'error')) {
    console.error(`  - [${err.code}] ${err.message}`);
  }
  process.exit(1);
} else {
  console.log('\n✅ 知识图谱完整性严格校验 100% 通过！0 悬空，0 重复，节点与关系全部合法！');
}
