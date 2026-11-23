import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { researchWorkflows } from '../src/data/workflows/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '..');

console.log('--- 校验科研工作流数据 (check-research-workflows.mjs) ---');

const methodFiles = readdirSync(join(root, 'src/content/methods')).filter((f) => f.endsWith('.md'));
const validMethodIds = new Set(methodFiles.map((f) => f.replace(/\.md$/, '')));

const tutorialFiles = readdirSync(join(root, 'src/content/tutorials')).filter((f) => f.endsWith('.md'));
const validTutorialIds = new Set(tutorialFiles.map((f) => f.replace(/\.md$/, '')));

if (researchWorkflows.length !== 3) {
  throw new Error(`预期 3 条核心工作流路线，实际包含 ${researchWorkflows.length} 条`);
}

for (const wf of researchWorkflows) {
  if (!wf.id || !wf.title || !wf.summary || !wf.phases || wf.phases.length === 0) {
    throw new Error(`工作流 ${wf.id} 缺少必要字段或阶段`);
  }

  for (const phase of wf.phases) {
    if (!phase.id || !phase.title || !phase.summary) {
      throw new Error(`工作流 ${wf.id} 阶段缺少基础字段`);
    }

    if (!phase.inputData.length || !phase.outputData.length || !phase.qualityCheckpoints.length) {
      throw new Error(`工作流 ${wf.id} 阶段 ${phase.id} 缺少输入/输出/质控点`);
    }

    for (const tool of phase.recommendedTools) {
      if (!validMethodIds.has(tool.methodId)) {
        throw new Error(`工作流 ${wf.id} 阶段 ${phase.id} 引用了未知的方法 ID: ${tool.methodId}`);
      }
      if (tool.alternativeMethodIds) {
        for (const alt of tool.alternativeMethodIds) {
          if (!validMethodIds.has(alt)) {
            throw new Error(`工作流 ${wf.id} 备选工具 ID 未知: ${alt}`);
          }
        }
      }
    }

    if (phase.tutorialId && !validTutorialIds.has(phase.tutorialId)) {
      throw new Error(`工作流 ${wf.id} 阶段 ${phase.id} 关联的教程 ID 不存在: ${phase.tutorialId}`);
    }
  }
}

console.log(`✓ 3 条端到端工作流及其全部阶段、工具和教程引用校验全部通过！`);
