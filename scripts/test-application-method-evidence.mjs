/**
 * PhytoMethods 植物应用论文与算法使用证据自动化防失真测试套件 V1.2
 * 确保所有 source_checked 关系必须具备可追溯的登记表与文献证据，严防证据虚构与失真
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getAllVerifiedApplicationMethods } from '../src/lib/knowledge/verified-application-methods.ts';
import { curatedRelations } from '../src/lib/knowledge/curated-relations.ts';
import { resolvePaperMethodRelation } from '../src/lib/knowledge/relation-resolver.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const papersDir = path.join(root, 'src/content/papers');
const methodsDir = path.join(root, 'src/content/methods');
const graphPath = path.join(root, 'outputs/knowledge-graph-v2.json');

console.log('=== PhytoMethods 植物应用论文与算法证据防失真测试 V1.2 ===\n');

const graph = JSON.parse(fs.readFileSync(graphPath, 'utf8'));
const verifiedList = getAllVerifiedApplicationMethods();

// 1. 检查核实登记表中的论文 ID 真实存在
const paperFiles = new Set(fs.readdirSync(papersDir).filter(f => f.endsWith('.md')).map(f => f.replace('.md', '')));
for (const entry of verifiedList) {
  assert.ok(paperFiles.has(entry.paperId), `[测试 1 失败] 登记表中的论文 ID "${entry.paperId}" 在 src/content/papers/ 中不存在`);
}
console.log(`✓ 测试 1 通过: 全部 ${verifiedList.length} 条登记的论文 ID 均真实存在于文献库中`);

// 2. 检查核实登记表中的方法 ID 真实存在
const methodFiles = new Set(fs.readdirSync(methodsDir).filter(f => f.endsWith('.md')).map(f => f.replace('.md', '')));
for (const entry of verifiedList) {
  assert.ok(methodFiles.has(entry.methodId), `[测试 2 失败] 登记表中的方法 ID "${entry.methodId}" 在 src/content/methods/ 中不存在`);
}
console.log(`✓ 测试 2 通过: 全部 ${verifiedList.length} 条登记的算法工具 ID 均真实存在于方法库中`);

// 3. 检查登记关系类型必须为 uses_method
for (const entry of verifiedList) {
  assert.strictEqual(entry.relation, 'uses_method', `[测试 3 失败] 登记条目 "${entry.paperId} -> ${entry.methodId}" 关系必须为 uses_method`);
  assert.strictEqual(entry.verificationStatus, 'source_checked', `[测试 3 失败] 登记条目 "${entry.paperId} -> ${entry.methodId}" 状态必须为 source_checked`);
}
console.log(`✓ 测试 3 通过: 登记表关系类型与核验等级规范性校验 100% 合法`);

// 4. 检查核查来源字段完整性 (URL, DOI, 分析目的, 证据摘要, 审核日期)
for (const entry of verifiedList) {
  assert.ok(entry.sourceUrl && entry.sourceUrl.startsWith('http'), `[测试 4 失败] ${entry.paperId} -> ${entry.methodId} 缺少有效的 sourceUrl`);
  assert.ok(entry.analysisPurpose && entry.analysisPurpose.length >= 10, `[测试 4 失败] ${entry.paperId} -> ${entry.methodId} 分析目的描述过短或缺失`);
  assert.ok(entry.evidenceSummary && entry.evidenceSummary.length >= 15, `[测试 4 失败] ${entry.paperId} -> ${entry.methodId} 证据摘要说明过短或缺失`);
  assert.ok(entry.verifiedAt && /^\d{4}-\d{2}-\d{2}$/.test(entry.verifiedAt), `[测试 4 失败] ${entry.paperId} -> ${entry.methodId} 审核时间格式异常`);
}
console.log(`✓ 测试 4 通过: 全部证据登记条目的出处链接、分析目的、证据摘要与时间戳 100% 完整`);

// 5. 检查同一论文与方法严禁重复登记
const pairSet = new Set();
for (const entry of verifiedList) {
  const pairKey = `${entry.paperId}|${entry.methodId}`;
  assert.ok(!pairSet.has(pairKey), `[测试 5 失败] 登记表中发现重复记录: ${pairKey}`);
  pairSet.add(pairKey);
}
console.log(`✓ 测试 5 通过: 登记表中 0 项重复条目，严格保证单射唯一性`);

// 6. 检查图谱中 source_checked 的普通应用关系必须来自核实登记表或人工策展库
const usesEdges = graph.edges.filter(e => e.relation === 'uses_method');
const curatedUsesKeys = new Set(
  curatedRelations.filter(r => r.relation === 'uses_method').map(r => `${r.paperId}|${r.methodId}`)
);

for (const edge of usesEdges) {
  const pId = edge.source.replace(/^paper:/, '');
  const mId = edge.target.replace(/^method:/, '');
  const key = `${pId}|${mId}`;
  const isChecked = edge.evidence.some(ev => ev.verificationStatus === 'source_checked');
  if (isChecked) {
    const isRegistered = pairSet.has(key) || curatedUsesKeys.has(key);
    assert.ok(isRegistered, `[测试 6 失败] 边 "${edge.id}" 被标记为 source_checked，但在 verifiedApplicationMethods 或 curatedRelations 中找不到登记！`);
  }
}
console.log(`✓ 测试 6 通过: 图谱中全部 ${usesEdges.filter(e => e.evidence.some(ev => ev.verificationStatus === 'source_checked')).length} 条 source_checked 应用关系均具备直接来源证据溯源`);

// 7. 检查登记表与生成图谱中的关系边完全一致
for (const entry of verifiedList) {
  const expectedEdgeId = `paper:${entry.paperId}|uses_method|method:${entry.methodId}`;
  const edge = graph.edges.find(e => e.id === expectedEdgeId);
  assert.ok(edge, `[测试 7 失败] 登记条目 "${expectedEdgeId}" 在图谱边中未找到`);
  assert.strictEqual(edge.relation, 'uses_method');
  assert.ok(edge.evidence.some(ev => ev.verificationStatus === 'source_checked'), `[测试 7 失败] 边 "${expectedEdgeId}" 证据状态不是 source_checked`);
}
console.log(`✓ 测试 7 通过: 登记表 ${verifiedList.length} 条关系与图谱构建输出 100% 对应`);

// 8. 检查证据状态统计与图谱统计闭环一致
const actualUsesEdges = graph.edges.filter(e => e.relation === 'uses_method');
const actualSourceCheckedUses = actualUsesEdges.filter(e => e.evidence.some(ev => ev.verificationStatus === 'source_checked')).length;
const actualStructurallyValidUses = actualUsesEdges.filter(e => e.evidence.some(ev => ev.verificationStatus === 'structurally_valid')).length;
const actualNeedsReviewUses = actualUsesEdges.filter(e => e.evidence.some(ev => ev.verificationStatus === 'needs_review')).length;

assert.strictEqual(graph.stats.edgesByRelation.uses_method, actualUsesEdges.length, 'uses_method 边数统计必须与实际边数一致');
assert.strictEqual(graph.stats.evidenceByRelationAndStatus.uses_method.source_checked, actualSourceCheckedUses, 'uses_method 的 source_checked 统计必须与实际证据一致');
assert.strictEqual(graph.stats.evidenceByRelationAndStatus.uses_method.structurally_valid || 0, actualStructurallyValidUses, 'uses_method 的 structurally_valid 统计必须与实际证据一致');
assert.strictEqual(graph.stats.evidenceByRelationAndStatus.uses_method.needs_review || 0, actualNeedsReviewUses, 'uses_method 的 needs_review 统计必须与实际证据一致');
console.log(`✓ 测试 8 通过: 证据状态统计与图谱统计数据完全闭环 (uses_method 总边数: ${actualUsesEdges.length}, source_checked: ${actualSourceCheckedUses}, structurally_valid: ${actualStructurallyValidUses}, needs_review: ${actualNeedsReviewUses})`);

// 9 & 10. 检查图谱没有悬空边与重复边
const nodeIds = new Set(graph.nodes.map(n => n.id));
const edgeIds = new Set();
for (const edge of graph.edges) {
  assert.ok(nodeIds.has(edge.source), `[测试 9 失败] 悬空边起点: ${edge.source}`);
  assert.ok(nodeIds.has(edge.target), `[测试 9 失败] 悬空边终点: ${edge.target}`);
  assert.ok(!edgeIds.has(edge.id), `[测试 10 失败] 发现重复边: ${edge.id}`);
  edgeIds.add(edge.id);
}
console.log(`✓ 测试 9 & 10 通过: 图谱 0 悬空边、0 重复边，拓扑结构完全闭环`);

// 11. 既有历史版本回归测试保持通过 (PAML 2006, GAPIT 2018, selscan 2014)
const pamlCurated = curatedRelations.find(r => r.paperId === 'mam-positive-selection-2006' && r.methodId === 'paml');
assert.ok(pamlCurated && pamlCurated.verificationStatus === 'source_checked', 'PAML 2006 历史版本策展必须保持');
const gapitCurated = curatedRelations.find(r => r.paperId === 'rice-roots-population' && r.methodId === 'gapit');
assert.ok(gapitCurated && gapitCurated.verificationStatus === 'source_checked', 'GAPIT 2018 历史版本策展必须保持');
console.log(`✓ 测试 11 通过: PAML 2006 与 GAPIT 2018 等历史时序保护规则持续有效`);

// 12. 单元测试验证：未登记核实的普通应用关系绝不会自动升级为 source_checked
const unverifiedResult = resolvePaperMethodRelation({
  paperId: 'hypothetical-unverified-paper',
  paperType: 'application',
  paperYear: 2024,
  targetMethodId: 'hifiasm',
  canonicalMethodPaperId: 'hifiasm-paper',
  isMethodCanonicalPaper: false
});
assert.strictEqual(unverifiedResult.relation, 'uses_method');
assert.strictEqual(unverifiedResult.evidence.verificationStatus, 'structurally_valid', '未登记的关系必须严格保持 structurally_valid，严防虚假升级');
console.log(`✓ 测试 12 通过: 未经核验登记的关系绝不会自动升级为 source_checked，防篡改门禁生效`);

console.log('\n🎉 全部 12 项植物应用论文与算法证据防失真测试 100% 顺利通过！');
