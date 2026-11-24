import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '..');

console.log('=====================================================');
console.log('  PhytoMethods 开放科研平台 V1 全量数据与知识体系完整性校验');
console.log('=====================================================\n');

const scripts = [
  'scripts/check-search-synonyms.mjs',
  'scripts/check-tutorial-datasets.mjs',
  'scripts/check-research-workflows.mjs',
  'scripts/check-method-compute-profiles.mjs',
  'scripts/check-troubleshooting.mjs',
  'scripts/check-method-comparisons.mjs'
];

for (const script of scripts) {
  try {
    const output = execFileSync(process.execPath, ['--experimental-strip-types', join(root, script)], {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'inherit']
    });
    console.log(output.trim());
    console.log('-----------------------------------------------------');
  } catch (err) {
    console.error(`❌ 检查脚本执行失败: ${script}`);
    process.exit(1);
  }
}

console.log('\n🎉 所有 6 项开放科研平台 V1 核心数据校验全部通过！');
