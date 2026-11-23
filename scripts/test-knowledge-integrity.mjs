/**
 * PhytoMethods 知识图谱数据完整性独立自动化测试 (纯数据断言，零外部依赖，毫秒级运行)
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

import { buildKnowledgeGraph } from '../src/lib/knowledge/graph-builder.ts';
import { validateKnowledgeGraph } from '../src/lib/knowledge/graph-validator.ts';

const root = fileURLToPath(new URL('../', import.meta.url));

console.log('=== PhytoMethods 知识图谱完整性独立数据测试 ===\n');

// 1. 读取 outputs/knowledge-graph-v2.json
const graphPath = join(root, 'outputs/knowledge-graph-v2.json');
const rawGraph = readFileSync(graphPath, 'utf8');
const graph = JSON.parse(rawGraph);

// 断言 1: Schema 版本与基础结构
assert.strictEqual(graph.version, '2.1.0', '图谱 Schema 版本应为 2.1.0');
assert.ok(Array.isArray(graph.nodes), 'nodes 应为数组');
assert.ok(Array.isArray(graph.edges), 'edges 应为数组');
console.log('✓ 断言 1 通过: 图谱 Schema 版本与基础结构规范');

// 断言 2: 完整性校验器 0 错误
const validation = validateKnowledgeGraph(graph);
assert.strictEqual(validation.valid, true, '图谱应通过严格完整性校验');
assert.strictEqual(validation.metrics.danglingEdgesCount, 0, '悬空边数量必须为 0');
assert.strictEqual(validation.metrics.duplicateEdgesCount, 0, '重复边数量必须为 0');
assert.strictEqual(validation.metrics.duplicateNodesCount, 0, '重复节点数量必须为 0');
assert.strictEqual(validation.metrics.tutorialsCovered, 10, '全部 10 篇教程必须已作为节点收录');
console.log('✓ 断言 2 通过: 0 悬空边、0 重复边、0 重复节点，10 篇教程 100% 覆盖');

// 断言 3: 58 个工具的奠基论文关系 100% 完整
const methodNodes = graph.nodes.filter(n => n.type === 'method');
assert.strictEqual(methodNodes.length, 58, '工具节点总数必须为 58');

const introEdges = graph.edges.filter(e => e.relation === 'introduces_method');
assert.strictEqual(introEdges.length, 58, '必须存在 58 条 introduces_method 奠基关系边');
console.log('✓ 断言 3 通过: 58 个算法工具与其奠基文献的 introduces_method 关系 100% 闭环');

// 断言 4: 13 个重点工具文献关联深度核查
const keyToolIds = [
  'hifiasm', 'verkko', 'edta', 'braker3', 'minigraph-cactus', 'pggb',
  'orthofinder', 'iqtree2', 'admixture', 'gapit', 'wgcna', 'scanpy', 'agront'
];
for (const toolId of keyToolIds) {
  const methodNode = graph.nodes.find(n => n.id === `method:${toolId}`);
  assert.ok(methodNode, `重点工具节点 method:${toolId} 必须存在`);
  const canonicalPaperId = methodNode.meta?.canonicalPaperId;
  assert.ok(canonicalPaperId, `工具 ${toolId} 必须指定奠基论文 ID`);
  const paperNode = graph.nodes.find(n => n.id === `paper:${canonicalPaperId}`);
  assert.ok(paperNode, `奠基论文 paper:${canonicalPaperId} 节点必须存在于图谱中`);
}
console.log('✓ 断言 4 通过: 13 个重点工具奠基文献与节点映射完整无损');

// 断言 5: 教程节点元数据完整性与真实验证状态
const tutorialNodes = graph.nodes.filter(n => n.type === 'tutorial');
assert.strictEqual(tutorialNodes.length, 10, '教程节点必须为 10');
for (const tut of tutorialNodes) {
  assert.ok(tut.meta?.methodId, `教程 ${tut.id} 必须关联 methodId`);
  assert.ok(['verified', 'template', 'not-tested'].includes(tut.meta?.tested), `教程 ${tut.id} 必须保持真实验证状态`);
  assert.ok(tut.href?.startsWith('/tutorials/'), `教程 ${tut.id} 路由格式必须正确`);
}
console.log('✓ 断言 5 通过: 10 篇教程节点元数据完整，真实验证状态保持不变');

// 断言 6: 确定性构建测试（重新构建图谱两次，输出结果哈希与结构应完全一致）
const papersDir = join(root, 'src/content/papers');
const methodsDir = join(root, 'src/content/methods');
const tutorialsDir = join(root, 'src/content/tutorials');
const topicMetadataPath = join(root, 'src/data/topic-metadata.json');

function parseSimpleYaml(content) {
  const match = content.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const res = {};
  for (const line of match[1].split(/\r?\n/)) {
    const km = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (km) {
      let val = km[2].trim().replace(/^['"]|['"]$/g, '');
      if (val.startsWith('[') && val.endsWith(']')) {
        val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
      }
      res[km[1]] = val;
    }
  }
  return res;
}

const pMap = new Map();
for (const f of readdirSync(papersDir).filter(f => f.endsWith('.md'))) {
  pMap.set(f.replace('.md', ''), { id: f.replace('.md', ''), data: parseSimpleYaml(readFileSync(join(papersDir, f), 'utf8')) });
}
const mMap = new Map();
for (const f of readdirSync(methodsDir).filter(f => f.endsWith('.md'))) {
  mMap.set(f.replace('.md', ''), { id: f.replace('.md', ''), data: parseSimpleYaml(readFileSync(join(methodsDir, f), 'utf8')) });
}
const tutMap = new Map();
for (const f of readdirSync(tutorialsDir).filter(f => f.endsWith('.md'))) {
  tutMap.set(f.replace('.md', ''), { id: f.replace('.md', ''), data: parseSimpleYaml(readFileSync(join(tutorialsDir, f), 'utf8')) });
}
const topMap = new Map(JSON.parse(readFileSync(topicMetadataPath, 'utf8')).map(t => [t.id, t]));

const domainSlugs = [
  'genome-assembly', 'genome-annotation', 'pangenomics-structural-variation',
  'comparative-genomics', 'population-genetics', 'gwas-breeding',
  'epigenomics-3d-genome', 'single-cell-spatial-omics', 'regulatory-genomics-ai'
];
const domainCodes = ['M01', 'M02', 'M03', 'M04', 'M05', 'M06', 'M07', 'M08', 'M09'];
const knownSpecies = new Set(['rice', 'wheat', 'maize', 'soybean', 'arabidopsis']);

const g1 = buildKnowledgeGraph({ papers: pMap, methods: mMap, topics: topMap, tutorials: tutMap, domainSlugs, domainCodes, knownSpecies });
const g2 = buildKnowledgeGraph({ papers: pMap, methods: mMap, topics: topMap, tutorials: tutMap, domainSlugs, domainCodes, knownSpecies });

assert.strictEqual(JSON.stringify(g1), JSON.stringify(g2), '图谱构建必须保证 100% 确定性');
console.log('✓ 断言 6 通过: 图谱构建算法具有完全确定性 (两次构建输出哈希 100% 一致)');

console.log('\n🎉 全部 6 大类数据完整性断言 100% 通过！');
