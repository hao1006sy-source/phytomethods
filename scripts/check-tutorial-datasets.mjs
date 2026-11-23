import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '..');

console.log('--- 校验教程测试数据集注册表 (check-tutorial-datasets.mjs) ---');

const datasetsSource = readFileSync(join(root, 'src/data/tutorial-test-datasets.ts'), 'utf-8');

// 读取 content/tutorials 下的所有 markdown 文件
const tutorialFiles = readdirSync(join(root, 'src/content/tutorials')).filter((f) => f.endsWith('.md'));
const tutorialSlugs = tutorialFiles.map((f) => f.replace(/\.md$/, ''));

if (tutorialSlugs.length !== 10) {
  throw new Error(`预期 10 篇教程，实际找到 ${tutorialSlugs.length} 篇`);
}

// 检查每个教程是否都在 tutorial-test-datasets.ts 中注册
for (const slug of tutorialSlugs) {
  if (!datasetsSource.includes(`tutorialId: '${slug}'`)) {
    throw new Error(`教程 ${slug} 缺失测试数据集注册！`);
  }
}

// 提取所有条目的 tutorialId 和 verificationStatus
const itemMatches = [...datasetsSource.matchAll(/tutorialId:\s*'([^']+)'[\s\S]*?verificationStatus:\s*'(executed|documented|not_verified)'/g)];

if (itemMatches.length !== 10) {
  throw new Error(`预期解析到 10 个数据集条目，实际解析到 ${itemMatches.length} 个`);
}

const executedItems = itemMatches.filter((m) => m[2] === 'executed');
const documentedItems = itemMatches.filter((m) => m[2] === 'documented');

if (executedItems.length !== 8) {
  throw new Error(`预期 8 篇 executed 实测教程，实际得到 ${executedItems.length} 篇`);
}

if (documentedItems.length !== 2) {
  throw new Error(`预期 2 篇 documented 官方文档教程 (hifiasm, edta)，实际得到 ${documentedItems.length} 篇`);
}

// 确认 documented 的确实是 hifiasm-intro 和 edta-tutorial
const docSlugs = documentedItems.map((m) => m[1]).sort();
if (docSlugs[0] !== 'edta-tutorial' || docSlugs[1] !== 'hifiasm-intro') {
  throw new Error(`Documented 教程不匹配：${docSlugs.join(', ')}`);
}

console.log(`✓ 教程测试数据集校验全部通过：覆盖全部 10 篇教程 (8 篇 executed，2 篇 documented)`);
