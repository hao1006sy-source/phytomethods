/**
 * PhytoMethods MSMC/MSMC2 算法版本历史时序与关系解耦专项测试 V1.2.1
 * 严格验证：
 * 1. msmc 与 msmc2 为两个独立的方法节点
 * 2. msmc 首发文献为 msmc-paper (Nature Genetics 2014)
 * 3. msmc2 关联操作协议文献为 msmc2-protocol (Methods Mol Biol 2020)
 * 4. 非洲稻研究 (Cubry et al. 2018) 正确关联 msmc 而非 msmc2
 * 5. 全站不存在由于 MSMC 代际混淆导致的 needs_review 警告
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { methodChronologies } from '../src/lib/knowledge/chronology.ts';
import { findVerifiedApplicationMethod } from '../src/lib/knowledge/verified-application-methods.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const graphPath = path.join(root, 'outputs/knowledge-graph-v2.json');
const graph = JSON.parse(fs.readFileSync(graphPath, 'utf8'));

console.log('=== PhytoMethods MSMC/MSMC2 历史时序与关系解耦测试 V1.2.1 ===\n');

// 1. 验证时序模型中 msmc 与 msmc2 独立存在且年份准确
assert.ok(methodChronologies.msmc, '时序注册表中必须包含 msmc');
assert.strictEqual(methodChronologies.msmc.firstReleaseYear, 2014, 'msmc 首次发布年份必须为 2014');
assert.strictEqual(methodChronologies.msmc.canonicalPaperId, 'msmc-paper', 'msmc 代表性奠基论文必须为 msmc-paper');

assert.ok(methodChronologies.msmc2, '时序注册表中必须包含 msmc2');
assert.strictEqual(methodChronologies.msmc2.firstReleaseYear, 2016, 'msmc2 首次发布年份必须为 2016 (GitHub Release)');
assert.strictEqual(methodChronologies.msmc2.canonicalPaperId, 'msmc2-protocol', 'msmc2 代表性文献必须为 msmc2-protocol');
console.log('✓ 测试 1 通过: 时序模型中 MSMC (2014) 与 MSMC2 (2016/2020) 严格独立注册');

// 2. 验证图谱节点中同时包含 method:msmc 与 method:msmc2
const nodeMsmc = graph.nodes.find(n => n.id === 'method:msmc');
const nodeMsmc2 = graph.nodes.find(n => n.id === 'method:msmc2');
assert.ok(nodeMsmc, '图谱中必须包含 method:msmc 节点');
assert.ok(nodeMsmc2, '图谱中必须包含 method:msmc2 节点');
assert.strictEqual(nodeMsmc.slug, 'msmc');
assert.strictEqual(nodeMsmc2.slug, 'msmc2');
console.log('✓ 测试 2 通过: 知识图谱中包含独立的 method:msmc 与 method:msmc2 实体节点');

// 3. 验证奠基与协议关系准确无误
const introMsmc = graph.edges.find(e => e.id === 'paper:msmc-paper|introduces_method|method:msmc');
assert.ok(introMsmc, '必须存在 paper:msmc-paper|introduces_method|method:msmc 边');
assert.strictEqual(introMsmc.evidence[0].verificationStatus, 'source_checked');

// msmc2 与 msmc2-protocol 之间为 references_method (来自人工策展)
const refMsmc2 = graph.edges.find(e => e.id === 'paper:msmc2-protocol|references_method|method:msmc2');
assert.ok(refMsmc2, '必须存在 paper:msmc2-protocol|references_method|method:msmc2 边');
assert.strictEqual(refMsmc2.evidence[0].verificationStatus, 'source_checked');
console.log('✓ 测试 3 通过: msmc-paper 与 msmc、msmc2-protocol 与 msmc2 的科学关系语义精准无误');

// 4. 验证非洲稻研究与 MSMC 的使用关系
const cubryMsmc = graph.edges.find(e => e.id === 'paper:african-rice-246-genomes|uses_method|method:msmc');
assert.ok(cubryMsmc, '必须存在 paper:african-rice-246-genomes|uses_method|method:msmc 边');
assert.strictEqual(cubryMsmc.evidence[0].verificationStatus, 'source_checked', '证据状态必须为 source_checked');

// 验证原错误的 msmc2 边已被彻底移除
const cubryMsmc2 = graph.edges.find(e => e.id === 'paper:african-rice-246-genomes|uses_method|method:msmc2');
assert.strictEqual(cubryMsmc2, undefined, '严禁存在 paper:african-rice-246-genomes|uses_method|method:msmc2 边');
console.log('✓ 测试 4 通过: 非洲稻研究正确关联至 method:msmc，与 msmc2 的误绑已被彻底移除');

// 5. 验证登记表 verifiedApplicationMethods 中包含非洲稻与 msmc 记录
const verifiedEntry = findVerifiedApplicationMethod('african-rice-246-genomes', 'msmc');
assert.ok(verifiedEntry, 'verifiedApplicationMethods 中必须登记 african-rice-246-genomes -> msmc');
assert.strictEqual(verifiedEntry.softwareVersion, 'v1.1.0');
assert.strictEqual(verifiedEntry.observedSoftwareName, 'MSMC');
assert.strictEqual(verifiedEntry.verificationStatus, 'source_checked');
console.log('✓ 测试 5 通过: verifiedApplicationMethods 完整登记 MSMC v1.1.0 真实使用证据');

// 6. 验证 MSMC/MSMC2 相关关系不存在代际时序冲突 needs_review
const msmcNeedsReview = graph.edges.filter(e => (e.target === 'method:msmc' || e.target === 'method:msmc2') && e.evidence.some(ev => ev.verificationStatus === 'needs_review'));
assert.strictEqual(msmcNeedsReview.length, 0, 'MSMC 与 MSMC2 的关联边不应有任何未解决的时序冲突');
console.log('✓ 测试 6 通过: MSMC 与 MSMC2 关联边均具备合法的版本时序证据，0 项代际冲突');

console.log('\n🎉 全部 6 项 MSMC/MSMC2 历史时序与关系解耦测试 100% 顺利通过！');
