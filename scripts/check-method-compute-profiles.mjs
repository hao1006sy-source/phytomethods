import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { methodComputeProfiles } from '../src/data/method-compute-profiles.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '..');

console.log('--- 校验算法计算资源基准档案 (check-method-compute-profiles.mjs) ---');

const methodFiles = readdirSync(join(root, 'src/content/methods')).filter((f) => f.endsWith('.md'));
const validMethodIds = new Set(methodFiles.map((f) => f.replace(/\.md$/, '')));

const keys = Object.keys(methodComputeProfiles);
if (keys.length < 10) {
  throw new Error(`至少需覆盖 10 个代表性工具的基准数据，当前仅有 ${keys.length} 个`);
}

for (const [id, profile] of Object.entries(methodComputeProfiles)) {
  if (!validMethodIds.has(id)) {
    throw new Error(`计算档案中存在未知的方法 ID: ${id}`);
  }

  if (profile.hasBenchmark) {
    if (!profile.scenario || !profile.hardware || !profile.peakMemory || !profile.runtime || !profile.evidenceSource) {
      throw new Error(`方法 ${id} 标记为 hasBenchmark 但缺少必要测试场景、内存、耗时或数据源！`);
    }
  }
}

console.log(`✓ 计算资源基准数据校验通过：收录 ${keys.length} 个核心工具基准档案`);
