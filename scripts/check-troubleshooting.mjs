import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { troubleshootingEntries } from '../src/data/troubleshooting/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '..');

console.log('--- 校验常见报错排查知识库 (check-troubleshooting.mjs) ---');

const methodFiles = readdirSync(join(root, 'src/content/methods')).filter((f) => f.endsWith('.md'));
const validMethodIds = new Set(methodFiles.map((f) => f.replace(/\.md$/, '')));

if (troubleshootingEntries.length < 10) {
  throw new Error(`报错排查条目过少，当前仅 ${troubleshootingEntries.length} 条`);
}

const coveredMethods = new Set();

for (const item of troubleshootingEntries) {
  if (!validMethodIds.has(item.methodId)) {
    throw new Error(`排查库引用了未知的方法 ID: ${item.methodId}`);
  }
  coveredMethods.add(item.methodId);

  if (!item.errorPattern || !item.symptom || !item.rootCause || !item.solution) {
    throw new Error(`排查条目 ${item.errorId} 存在空字段！`);
  }
}

if (coveredMethods.size < 8) {
  throw new Error(`排查库覆盖方法数量不足，当前覆盖 ${coveredMethods.size} 个方法`);
}

console.log(`✓ 报错排查知识库校验通过：收录 ${troubleshootingEntries.length} 条条目，覆盖 ${coveredMethods.size} 个核心工具！`);
