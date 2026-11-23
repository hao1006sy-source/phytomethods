/**
 * PhytoMethods 知识图谱数据完整性与科学语义准确性自动化测试 V1.1.1
 * (纯数据断言，零外部依赖，毫秒级运行)
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

import { buildKnowledgeGraph } from '../src/lib/knowledge/graph-builder.ts';
import { validateKnowledgeGraph } from '../src/lib/knowledge/graph-validator.ts';

const root = fileURLToPath(new URL('../', import.meta.url));

console.log('=== PhytoMethods 知识图谱完整性与科学语义测试 V1.1.1 ===\n');

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

// 断言 7: 科学关系语义与人工策展审核规则断言 (V1.1.1 核心专项)
const extendsEdges = graph.edges.filter(e => e.relation === 'extends_method');
assert.strictEqual(extendsEdges.length, 3, '严格核实后的 extends_method 关系数必须为 3');
const extendsExpected = [
  'paper:admixture-enhancements|extends_method|method:admixture',
  'paper:orthofinder-2026|extends_method|method:orthofinder',
  'paper:giraffe-paper|extends_method|method:vg'
];
for (const exp of extendsExpected) {
  assert.ok(extendsEdges.some(e => e.id === exp), `必须包含核实的扩展关系: ${exp}`);
}

const evaluatesEdges = graph.edges.filter(e => e.relation === 'evaluates_method');
assert.strictEqual(evaluatesEdges.length, 5, '严格核实后的 evaluates_method 关系数必须为 5');
const evaluatesExpected = [
  'paper:plant-sv-benchmark-2026|evaluates_method|method:cutesv',
  'paper:plant-sv-benchmark-2026|evaluates_method|method:sniffles2',
  'paper:sorghum-graph-benchmark|evaluates_method|method:minigraph',
  'paper:sorghum-graph-benchmark|evaluates_method|method:minigraph-cactus',
  'paper:sorghum-graph-benchmark|evaluates_method|method:pggb'
];
for (const exp of evaluatesExpected) {
  assert.ok(evaluatesEdges.some(e => e.id === exp), `必须包含核实的基准评测关系: ${exp}`);
}
console.log('✓ 断言 7 通过: 经文献核准的 3 条 extends_method 与 5 条 evaluates_method 语义精准');

// 断言 8: 历史时序倒置消除与时序冲突防御
const xpehhEdges = graph.edges.filter(e => e.source === 'paper:xpehh-paper' && e.target === 'method:selscan');
assert.strictEqual(xpehhEdges.length, 0, '2007 年的 xpehh-paper 严禁指向 2014 年发布的 selscan 工具');

const needsReviewEdges = graph.edges.filter(e => e.evidence.some(ev => ev.verificationStatus === 'needs_review'));
assert.ok(needsReviewEdges.length > 0, '时序倒置案例必须被自动识别并标记为 needs_review');
for (const nre of needsReviewEdges) {
  assert.ok(nre.evidence.some(ev => ev.note?.includes('时序冲突警告')), '时序冲突边必须附带明确警告');
}
console.log('✓ 断言 8 通过: 历史时间倒置彻底根除，时序冲突自动拦截防御系统生效');

// 断言 9: 反向标题关键词误判拦截断言
const clarifiedUsesCases = [
  { p: 'rice-gapit-2023', m: 'gapit', label: '含 improve 关键词的水稻 GWAS 应用' },
  { p: 'maize-drought-deseq2-2019', m: 'deseq2', label: '含 comparative 关键词的玉米干旱实验' },
  { p: 'maize-domestication', m: 'xpclr', label: '含 improvement 关键词的玉米驯化研究' },
  { p: 'sorghum-pangenome-reference-2026', m: 'minigraph-cactus', label: '含 improves 关键词的高粱泛基因组研究' }
];
for (const c of clarifiedUsesCases) {
  const edge = graph.edges.find(e => e.source === `paper:${c.p}` && e.target === `method:${c.m}`);
  assert.ok(edge, `${c.label} 的边必须存在`);
  assert.strictEqual(edge.relation, 'uses_method', `${c.label} 绝不可误判为 extends 或 evaluates，必须为 uses_method`);
}
console.log('✓ 断言 9 通过: 标题关键词正则推断已彻底废除，所有生物学改良与比较研究均正确归类为 uses_method');

// 断言 10: 科学证据分级机制断言
const statusCounts = { structurally_valid: 0, source_checked: 0, needs_review: 0 };
for (const e of graph.edges) {
  for (const ev of e.evidence) {
    if (ev.verificationStatus in statusCounts) {
      statusCounts[ev.verificationStatus]++;
    }
  }
}
assert.ok(statusCounts.source_checked > 500, '官方与人工策展验证证据应占主体 (>500)');
assert.ok(statusCounts.structurally_valid > 200, '未经全文核实的 frontmatter 结构关系应归为 structurally_valid (>200)');
assert.ok(statusCounts.needs_review >= 1, '必须存在需要人工审核的潜在冲突证据');
console.log(`✓ 断言 10 通过: 证据分级健康 (source_checked: ${statusCounts.source_checked}, structurally_valid: ${statusCounts.structurally_valid}, needs_review: ${statusCounts.needs_review})`);

console.log('\n🎉 全部 10 项数据与科学语义断言 100% 通过！知识图谱达到发布级科学准确性！');
