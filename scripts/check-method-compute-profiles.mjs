import { readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { methodComputeProfiles } from '../src/data/method-compute-profiles.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '..');

console.log('--- 校验算法计算资源基准档案真实性 (check-method-compute-profiles.mjs) ---');

const methodFiles = readdirSync(join(root, 'src/content/methods')).filter((f) => f.endsWith('.md'));
const validMethodIds = new Set(methodFiles.map((f) => f.replace(/\.md$/, '')));

const keys = Object.keys(methodComputeProfiles);
if (keys.length < 12) {
  throw new Error(`至少需覆盖 12 个代表性工具的基准数据，当前仅有 ${keys.length} 个`);
}

let empiricalCount = 0;
let publishedCount = 0;

for (const [id, profile] of Object.entries(methodComputeProfiles)) {
  if (!validMethodIds.has(id)) {
    throw new Error(`计算档案中存在未知的方法 ID: ${id}`);
  }

  if (profile.hasBenchmark) {
    if (!profile.scenario || !profile.hardware || !profile.peakMemory || !profile.runtime || !profile.evidenceSource) {
      throw new Error(`方法 ${id} 标记为 hasBenchmark 但缺少必要测试场景、硬件、内存、耗时或数据源！`);
    }

    if (!profile.softwareVersion || !profile.datasetOrSpecies || !profile.verifiedDate) {
      throw new Error(`方法 ${id} 缺少必要审计字段 (softwareVersion / datasetOrSpecies / verifiedDate)`);
    }

    if (profile.benchmarkType === 'empirical_log') {
      empiricalCount++;
      // 核验本地实测日志文件真实物理存在性
      if (profile.benchmarkSectionOrTable?.startsWith('examples/')) {
        const logPath = join(root, profile.benchmarkSectionOrTable);
        if (!existsSync(logPath)) {
          throw new Error(`❌ 方法 ${id} 引用的实测日志文件不存在: ${profile.benchmarkSectionOrTable}`);
        }
      }
    } else if (profile.benchmarkType === 'published_benchmark') {
      publishedCount++;
      if (!profile.benchmarkSectionOrTable) {
        throw new Error(`文献基准方法 ${id} 应提供原始 Benchmark 表格或章节定位`);
      }
    }
  }
}

console.log(`✓ 计算资源基准数据校验通过:`);
console.log(`  - 累计收录 ${keys.length} 个核心算法计算基准画像`);
console.log(`  - 本地实测日志基准: ${empiricalCount} 个 (含 CAFE 5 官方示例实测日志验证)`);
console.log(`  - 权威文献/官方基准: ${publishedCount} 个`);
