import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));

const report = JSON.parse(readFileSync(join(root, 'outputs/knowledge-audit-report.json'), 'utf8'));

const keyToolIds = [
  'hifiasm', 'verkko', 'edta', 'braker3', 'minigraph-cactus', 'pggb',
  'orthofinder', 'iqtree2', 'admixture', 'gapit', 'wgcna', 'scanpy', 'agront'
];

console.log('=== 13 个重点工具文献关联审查 ===\n');

for (const toolId of keyToolIds) {
  const tool = report.methodsAudit.find(m => m.id === toolId);
  if (!tool) {
    console.log(`❌ 工具未找到: ${toolId}`);
    continue;
  }
  const paper = report.papersAudit.find(p => p.id === tool.canonicalPaperId);
  console.log(`【${tool.name}】(${tool.id})`);
  console.log(`  - 官方仓库: ${tool.repository}`);
  console.log(`  - 所属领域: ${tool.domainIds.join(', ')}`);
  console.log(`  - 关联专题数: ${tool.topicIds.length}`);
  console.log(`  - 原始方法论文: [${tool.canonicalPaperId}]`);
  console.log(`    标题: ${paper?.title}`);
  console.log(`    期刊/年份: ${paper?.journal} (${paper?.year}) | DOI: ${paper?.doi}`);
  console.log(`    论文类型: ${paper?.type}`);
  console.log(`  - 植物应用论文 (${tool.applicationPapersCount} 篇):`);
  if (tool.applicationPapers.length > 0) {
    for (const app of tool.applicationPapers) {
      console.log(`    * [${app.id}] ${app.title.slice(0, 40)}... (物种: ${app.species.join(', ')})`);
    }
  } else {
    console.log(`    * 暂无直接声明使用该工具的独立植物应用论文记录`);
  }
  console.log('');
}
