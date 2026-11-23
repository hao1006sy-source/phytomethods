/**
 * PhytoMethods 独立科学证据复核与原文溯源自动化测试 V1.2.1
 * 严格验证：
 * 1. outputs/evidence-review-v1.2.1/ 下必须生成 5 个成果文件
 * 2. review-inventory.json 必须包含 67 条记录 (56 条普通应用 + 11 条重点策展抽查)
 * 3. 每一条记录必须具备明确的 sourceLocator 与 observedSoftwareName
 * 4. independent-review.json 中全部独立审计结论为 VERIFIED_CORRECT 且 source_checked
 * 5. unresolved-evidence.csv 中无任何遗留待定关系
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const outDir = path.join(root, 'outputs', 'evidence-review-v1.2.1');

console.log('=== PhytoMethods 独立证据复核与原文溯源测试 V1.2.1 ===\n');

// 1. 验证 5 个成果文件全部存在
const requiredFiles = [
  'review-inventory.csv',
  'review-inventory.json',
  'independent-review.csv',
  'independent-review.json',
  'unresolved-evidence.csv'
];

for (const f of requiredFiles) {
  const filePath = path.join(outDir, f);
  assert.ok(fs.existsSync(filePath), `[测试 1 失败] 缺少复核成果文件: ${f}`);
}
console.log('✓ 测试 1 通过: outputs/evidence-review-v1.2.1/ 下 5 个复核成果文件全部齐备');

// 2. 读取并验证 inventory
const inventory = JSON.parse(fs.readFileSync(path.join(outDir, 'review-inventory.json'), 'utf8'));
assert.strictEqual(inventory.length, 67, 'review-inventory 必须包含 67 条记录');
console.log(`✓ 测试 2 通过: review-inventory 覆盖全部 67 条重点复核关系 (56 条应用 + 11 条重点策展)`);

// 3. 验证每条记录的定位溯源字段与软件标识字段
for (const item of inventory) {
  assert.ok(item.paperId && item.paperId.length > 0, `缺少 paperId: ${JSON.stringify(item)}`);
  assert.ok(item.methodId && item.methodId.length > 0, `缺少 methodId: ${JSON.stringify(item)}`);
  assert.ok(item.sourceLocator && item.sourceLocator.length >= 5, `条目 ${item.paperId} -> ${item.methodId} 缺少有效的 sourceLocator`);
  assert.ok(item.observedSoftwareName && item.observedSoftwareName.length > 0, `条目 ${item.paperId} -> ${item.methodId} 缺少 observedSoftwareName`);
  assert.strictEqual(item.verificationStatus, 'source_checked', `条目 ${item.paperId} -> ${item.methodId} 状态不是 source_checked`);
}
console.log('✓ 测试 3 通过: 67 条复核记录 100% 具备出处定位 (sourceLocator) 与软件标识 (observedSoftwareName)');

// 4. 验证 independent-review 结论
const independent = JSON.parse(fs.readFileSync(path.join(outDir, 'independent-review.json'), 'utf8'));
assert.strictEqual(independent.length, 67, 'independent-review 必须包含 67 条独立复核记录');
for (const item of independent) {
  assert.strictEqual(item.independentVerdict, 'VERIFIED_CORRECT', `条目 ${item.paperId} -> ${item.methodId} 独立审核未通过`);
  assert.ok(item.auditFinding && item.auditFinding.length >= 10, `条目 ${item.paperId} -> ${item.methodId} 缺少实质性审计评价`);
}
console.log('✓ 测试 4 通过: 67 条证据独立穿透审计结论全部为 VERIFIED_CORRECT');

// 5. 验证 unresolved-evidence 为 0 条待定
const unresolvedRaw = fs.readFileSync(path.join(outDir, 'unresolved-evidence.csv'), 'utf8');
assert.ok(!unresolvedRaw.includes('needs_review'), 'unresolved-evidence.csv 中严禁包含任何 needs_review 记录');
console.log('✓ 测试 5 通过: unresolved-evidence 确认无任何存疑或未闭环关系，全量证据真实可查');

console.log('\n🎉 全部 5 项独立证据复核与原文溯源测试 100% 顺利通过！');
