import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { domains } from '../src/data/domains.ts';
import { methodComparisonMatrices } from '../src/data/method-comparison-matrices.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '..');

console.log('--- 校验领域工具选型对比矩阵 (check-method-comparisons.mjs) ---');

const methodFiles = readdirSync(join(root, 'src/content/methods')).filter((f) => f.endsWith('.md'));
const validMethodIds = new Set(methodFiles.map((f) => f.replace(/\.md$/, '')));

if (domains.length !== 9) {
  throw new Error(`预期 9 大研究领域，实际找到 ${domains.length} 个`);
}

for (const [code, slug] of domains) {
  const matrix = methodComparisonMatrices[slug];
  if (!matrix) {
    throw new Error(`缺少领域 ${code} (${slug}) 的选型对比矩阵！`);
  }

  if (matrix.domainCode !== code || matrix.domainId !== slug) {
    throw new Error(`领域编码或 slug 不匹配: ${code} vs ${matrix.domainCode}`);
  }

  if (!matrix.selectionGuideSummary || !matrix.methods.length || !matrix.decisionTrees.length) {
    throw new Error(`领域 ${code} 对比矩阵存在空数据！`);
  }

  for (const m of matrix.methods) {
    if (!validMethodIds.has(m.methodId)) {
      throw new Error(`领域 ${code} 对比矩阵引用了未知的方法 ID: ${m.methodId}`);
    }
    if (!m.inputType || !m.corePrinciple || !m.computeProfile || !m.advantages || !m.limitations || !m.recommendedScenario) {
      throw new Error(`领域 ${code} 方法 ${m.methodId} 存在空字段！`);
    }
  }

  for (const dt of matrix.decisionTrees) {
    if (!dt.condition || !dt.recommendation || !dt.rationale) {
      throw new Error(`领域 ${code} 决策树存在空字段！`);
    }
  }
}

console.log(`✓ 9 大领域工具选型对比矩阵全部校验通过 (共 ${Object.keys(methodComparisonMatrices).length} 个领域，覆盖各主流工具与决策场景)`);
