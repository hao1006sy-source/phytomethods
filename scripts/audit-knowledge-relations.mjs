import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));

const papersDir = join(root, 'src/content/papers');
const methodsDir = join(root, 'src/content/methods');
const tutorialsDir = join(root, 'src/content/tutorials');
const topicMetadataPath = join(root, 'src/data/topic-metadata.json');
const domainsPath = join(root, 'src/data/domains.ts');
const tagsPath = join(root, 'src/data/tags.ts');

// 简单 YAML 解析器
function parseFrontmatter(content) {
  const match = content.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { data: {}, body: content };
  const yamlText = match[1];
  const body = content.slice(match[0].length);
  const data = {};
  
  const lines = yamlText.split(/\r?\n/);
  let currentKey = null;
  let isArray = false;
  
  for (let line of lines) {
    if (/^\s*#/.test(line) || !line.trim()) continue;
    
    const keyMatch = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (keyMatch) {
      currentKey = keyMatch[1];
      let val = keyMatch[2].trim();
      if (val === '') {
        data[currentKey] = [];
        isArray = true;
      } else if (val.startsWith('[') && val.endsWith(']')) {
        const rawItems = val.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
        data[currentKey] = rawItems;
        isArray = false;
      } else {
        val = val.replace(/^['"]|['"]$/g, '');
        if (/^\d+$/.test(val)) val = parseInt(val, 10);
        data[currentKey] = val;
        isArray = false;
      }
    } else if (isArray && currentKey && line.trim().startsWith('-')) {
      const item = line.trim().replace(/^-\s*/, '').replace(/^['"]|['"]$/g, '').trim();
      if (Array.isArray(data[currentKey])) {
        data[currentKey].push(item);
      }
    }
  }
  return { data, body };
}

// 1. 读取领域与标签词典
const domainsSource = readFileSync(domainsPath, 'utf8');
const domainCodes = [...domainsSource.matchAll(/'(M0\d)'/g)].map(m => m[1]);
const domainSlugs = [
  'genome-assembly', 'genome-annotation', 'pangenomics-structural-variation',
  'comparative-genomics', 'population-genetics', 'gwas-breeding',
  'epigenomics-3d-genome', 'single-cell-spatial-omics', 'regulatory-genomics-ai'
];
const validDomains = new Set([...domainCodes, ...domainSlugs]);

const tagsSource = readFileSync(tagsPath, 'utf8');
const knownSpecies = new Set([
  ...[...tagsSource.matchAll(/'([a-z0-9-]+)':/g)].map(m => m[1]),
  'wheat', 'maize', 'soybean', 'tea', 'cycas', 'mungbean', 'sorghum', 'rice',
  'watermelon', 'miscanthus', 'mango', 'tomato', 'potato', 'arabidopsis',
  'macadamia', 'xanthoceras', 'populus-euphratica', 'populus-trichocarpa'
]);

// 2. 加载实体
const papers = new Map();
for (const file of readdirSync(papersDir).filter(f => f.endsWith('.md'))) {
  const id = file.replace(/\.md$/, '');
  const { data, body } = parseFrontmatter(readFileSync(join(papersDir, file), 'utf8'));
  papers.set(id, { id, file, data, body });
}

const methods = new Map();
for (const file of readdirSync(methodsDir).filter(f => f.endsWith('.md'))) {
  const id = file.replace(/\.md$/, '');
  const { data, body } = parseFrontmatter(readFileSync(join(methodsDir, file), 'utf8'));
  methods.set(id, { id, file, data, body });
}

const topicMetadata = JSON.parse(readFileSync(topicMetadataPath, 'utf8'));
const topics = new Map(topicMetadata.map(t => [t.id, t]));

const tutorials = new Map();
for (const file of readdirSync(tutorialsDir).filter(f => f.endsWith('.md'))) {
  const id = file.replace(/\.md$/, '');
  const { data, body } = parseFrontmatter(readFileSync(join(tutorialsDir, file), 'utf8'));
  tutorials.set(id, { id, file, data, body });
}

// 3. 构建关联关系拓扑与语义分类
const relations = [];

// 3.1 Method -> Paper (introduces_method)
const methodToPaper = new Map(); // methodId -> paperId
const paperToMethodsIntroduced = new Map(); // paperId -> methodId[]

for (const [mId, m] of methods.entries()) {
  const pId = m.data.paper;
  methodToPaper.set(mId, pId);
  if (!paperToMethodsIntroduced.has(pId)) paperToMethodsIntroduced.set(pId, []);
  paperToMethodsIntroduced.get(pId).push(mId);

  relations.push({
    source: pId,
    sourceType: 'paper',
    target: mId,
    targetType: 'method',
    relation: 'introduces_method',
    evidence: `Method "${m.data.name}" explicitly references "${pId}" as its canonical method paper.`,
    verified: papers.has(pId)
  });
}

// 3.2 Paper -> Method (uses_method / related_method)
for (const [pId, p] of papers.entries()) {
  const methodIds = Array.isArray(p.data.methodIds) ? p.data.methodIds : [];
  for (const mId of methodIds) {
    const isIntro = methodToPaper.get(mId) === pId;
    const relType = isIntro ? 'introduces_method' : (p.data.type === 'application' ? 'uses_method' : 'related_method');
    relations.push({
      source: pId,
      sourceType: 'paper',
      target: mId,
      targetType: 'method',
      relation: relType,
      evidence: `Paper "${pId}" declares methodId "${mId}" in frontmatter.`,
      verified: methods.has(mId)
    });
  }
}

// 3.3 Topic <-> Method & Paper
for (const [tId, t] of topics.entries()) {
  const mIds = Array.isArray(t.methodIds) ? t.methodIds : [];
  for (const mId of mIds) {
    relations.push({
      source: tId,
      sourceType: 'topic',
      target: mId,
      targetType: 'method',
      relation: 'features_method',
      evidence: `Topic "${t.title}" includes method "${mId}".`,
      verified: methods.has(mId)
    });
  }
  const pIds = Array.isArray(t.paperIds) ? t.paperIds : [];
  for (const pId of pIds) {
    relations.push({
      source: tId,
      sourceType: 'topic',
      target: pId,
      targetType: 'paper',
      relation: 'references_paper',
      evidence: `Topic "${t.title}" lists paper "${pId}".`,
      verified: papers.has(pId)
    });
  }
}

// 3.4 Tutorial -> Method
for (const [tutId, tut] of tutorials.entries()) {
  const mId = tut.data.method;
  relations.push({
    source: tutId,
    sourceType: 'tutorial',
    target: mId,
    targetType: 'method',
    relation: 'guides_method',
    evidence: `Tutorial "${tut.data.title}" guides usage of method "${mId}".`,
    verified: methods.has(mId)
  });
}

// 4. 130 篇文献元数据深度审查
const papersAudit = [];
let paperIssuesCount = 0;

for (const [pId, p] of papers.entries()) {
  const issues = [];
  const d = p.data;
  
  // DOI 格式检查
  if (!d.doi || typeof d.doi !== 'string') {
    issues.push('DOI缺失或非字符串');
  } else if (!/^10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+$/.test(d.doi.trim())) {
    issues.push(`DOI格式非标准: ${d.doi}`);
  }
  
  // 年份检查
  if (!d.year || typeof d.year !== 'number' || d.year < 1990 || d.year > 2026) {
    issues.push(`发表年份异常: ${d.year}`);
  }
  
  // 期刊检查
  if (!d.journal || typeof d.journal !== 'string' || d.journal.trim().length === 0) {
    issues.push('期刊名称缺失');
  }
  
  // 标题检查
  if (!d.title || typeof d.title !== 'string' || d.title.trim().length === 0) {
    issues.push('标题缺失');
  }
  
  // 作者检查
  if (!d.authors || typeof d.authors !== 'string' || d.authors.trim().length === 0) {
    issues.push('作者信息缺失');
  }
  
  // 领域检查
  const domains = Array.isArray(d.domainIds) ? d.domainIds : [d.domainIds].filter(Boolean);
  if (domains.length === 0) {
    issues.push('缺少 domainIds');
  } else {
    for (const dom of domains) {
      if (!validDomains.has(dom)) {
        issues.push(`非法的 domainId: ${dom}`);
      }
    }
  }
  
  // 类型检查
  if (!['method', 'application', 'review'].includes(d.type)) {
    issues.push(`非法的文献类型: ${d.type}`);
  }
  
  // 植物物种检查
  const species = Array.isArray(d.speciesIds) ? d.speciesIds : [];
  if (d.type === 'application' && species.length === 0) {
    issues.push('植物应用论文未声明 speciesIds');
  } else {
    for (const s of species) {
      if (!knownSpecies.has(s)) {
        issues.push(`未知物种标识: ${s}`);
      }
    }
  }
  
  // 工具关联检查
  const mIds = Array.isArray(d.methodIds) ? d.methodIds : [];
  for (const mId of mIds) {
    if (!methods.has(mId)) {
      issues.push(`声明了不存在的工具ID: ${mId}`);
    }
  }

  const isVerified = issues.length === 0;
  if (!isVerified) paperIssuesCount++;

  papersAudit.push({
    id: pId,
    title: d.title,
    type: d.type,
    doi: d.doi,
    year: d.year,
    journal: d.journal,
    domainIds: d.domainIds,
    speciesIds: d.speciesIds,
    methodIds: d.methodIds,
    introducedMethods: paperToMethodsIntroduced.get(pId) || [],
    status: isVerified ? '已核实' : '需审查',
    issues
  });
}

// 5. 58 个工具关联审查
const methodsAudit = [];
for (const [mId, m] of methods.entries()) {
  const issues = [];
  const d = m.data;
  
  const pId = d.paper;
  const canonicalPaper = papers.get(pId);
  if (!pId) {
    issues.push('缺少 paper 字段');
  } else if (!canonicalPaper) {
    issues.push(`指向的论文不存在: ${pId}`);
  }
  
  if (!d.repository || !d.repository.startsWith('http')) {
    issues.push(`代码仓库地址无效: ${d.repository}`);
  }
  
  const mDomains = Array.isArray(d.domainIds) ? d.domainIds : [];
  if (mDomains.length === 0) issues.push('缺少 domainIds');
  for (const dom of mDomains) {
    if (!validDomains.has(dom)) issues.push(`非法的 domainId: ${dom}`);
  }
  
  const linkedApps = [...papers.values()].filter(p => 
    p.data.type === 'application' && Array.isArray(p.data.methodIds) && p.data.methodIds.includes(mId)
  ).map(p => ({ id: p.id, title: p.data.title, species: p.data.speciesIds }));

  methodsAudit.push({
    id: mId,
    name: d.name,
    canonicalPaperId: pId,
    canonicalPaperTitle: canonicalPaper?.data.title,
    repository: d.repository,
    domainIds: d.domainIds,
    topicIds: d.topicIds,
    applicationPapersCount: linkedApps.length,
    applicationPapers: linkedApps,
    status: issues.length === 0 ? '已核实' : '需审查',
    issues
  });
}

// 6. 知识图谱 V2 结构化数据构建
const kgNodes = [
  // 领域节点
  ...domainSlugs.map((slug, idx) => ({
    id: `domain:${slug}`,
    type: 'domain',
    label: slug,
    code: domainCodes[idx]
  })),
  // 专题节点
  ...topicMetadata.map(t => ({
    id: `topic:${t.id}`,
    type: 'topic',
    label: t.title,
    domainId: t.domainId
  })),
  // 工具节点
  ...[...methods.values()].map(m => ({
    id: `method:${m.id}`,
    type: 'method',
    label: m.data.name,
    repository: m.data.repository
  })),
  // 文献节点
  ...[...papers.values()].map(p => ({
    id: `paper:${p.id}`,
    type: p.data.type === 'method' ? 'paper_method' : (p.data.type === 'application' ? 'paper_application' : 'paper_review'),
    label: p.data.title,
    doi: p.data.doi,
    year: p.data.year,
    journal: p.data.journal
  })),
  // 植物物种节点
  ...[...knownSpecies].map(s => ({
    id: `species:${s}`,
    type: 'species',
    label: s
  }))
];

const kgEdges = [
  ...relations.map(r => ({
    source: `${r.sourceType}:${r.source}`,
    target: `${r.targetType}:${r.target}`,
    relation: r.relation,
    evidence: r.evidence
  })),
  // 论文物种边
  ...[...papers.values()].flatMap(p => {
    const sList = Array.isArray(p.data.speciesIds) ? p.data.speciesIds : [];
    return sList.filter(s => knownSpecies.has(s)).map(s => ({
      source: `paper:${p.id}`,
      target: `species:${s}`,
      relation: 'studies_species',
      evidence: `Paper "${p.id}" studies species "${s}".`
    }));
  }),
  // 工具/文献所属领域边
  ...[...papers.values()].flatMap(p => {
    const dList = Array.isArray(p.data.domainIds) ? p.data.domainIds : [];
    return dList.map(d => ({
      source: `paper:${p.id}`,
      target: `domain:${d}`,
      relation: 'belongs_to_domain',
      evidence: `Paper "${p.id}" categorized in domain "${d}".`
    }));
  }),
  ...[...methods.values()].flatMap(m => {
    const dList = Array.isArray(m.data.domainIds) ? m.data.domainIds : [];
    return dList.map(d => ({
      source: `method:${m.id}`,
      target: `domain:${d}`,
      relation: 'belongs_to_domain',
      evidence: `Method "${m.id}" categorized in domain "${d}".`
    }));
  })
];

const knowledgeGraphV2 = {
  version: '2.0.0',
  description: 'PhytoMethods Structured Knowledge Graph Schema V2',
  nodesCount: kgNodes.length,
  edgesCount: kgEdges.length,
  nodes: kgNodes,
  edges: kgEdges
};

// 7. 统计汇总
const stats = {
  totalPapers: papers.size,
  totalMethods: methods.size,
  totalTopics: topics.size,
  totalTutorials: tutorials.size,
  totalRelations: relations.length,
  verifiedRelations: relations.filter(r => r.verified).length,
  relationTypeBreakdown: {
    introduces_method: relations.filter(r => r.relation === 'introduces_method').length,
    uses_method: relations.filter(r => r.relation === 'uses_method').length,
    related_method: relations.filter(r => r.relation === 'related_method').length,
    features_method: relations.filter(r => r.relation === 'features_method').length,
    references_paper: relations.filter(r => r.relation === 'references_paper').length,
    guides_method: relations.filter(r => r.relation === 'guides_method').length
  },
  paperIssuesCount,
  methodIssuesCount: methodsAudit.filter(m => m.issues.length > 0).length,
  applicationPapersWithMethods: papersAudit.filter(p => p.type === 'application' && p.methodIds && p.methodIds.length > 0).length,
  applicationPapersWithoutMethods: papersAudit.filter(p => p.type === 'application' && (!p.methodIds || p.methodIds.length === 0)).length
};

console.log('\n================ 知识关系质量审计总结 ================');
console.log(`全站实体: ${stats.totalPapers} 篇文献 | ${stats.totalMethods} 个工具 | ${stats.totalTopics} 篇专题 | ${stats.totalTutorials} 篇教程`);
console.log(`知识图谱 V2: ${kgNodes.length} 个节点, ${kgEdges.length} 条关联边`);
console.log(`关系类型明细:`);
console.log(`  - introduces_method (提出方法): ${stats.relationTypeBreakdown.introduces_method}`);
console.log(`  - uses_method (植物研究使用工具): ${stats.relationTypeBreakdown.uses_method}`);
console.log(`  - related_method (其他方法关联): ${stats.relationTypeBreakdown.related_method}`);
console.log(`  - features_method (专题收录工具): ${stats.relationTypeBreakdown.features_method}`);
console.log(`  - references_paper (专题引用文献): ${stats.relationTypeBreakdown.references_paper}`);
console.log(`  - guides_method (教程指导工具): ${stats.relationTypeBreakdown.guides_method}`);
console.log(`元数据需审查文献数: ${stats.paperIssuesCount} / 130`);
console.log(`工具定义需审查数: ${stats.methodIssuesCount} / 58`);
console.log(`已声明使用工具的应用论文: ${stats.applicationPapersWithMethods} / 59`);
console.log(`未声明使用工具的应用论文: ${stats.applicationPapersWithoutMethods} / 59`);

// 输出文件
const outputDir = join(root, 'outputs');
writeFileSync(join(outputDir, 'knowledge-audit-report.json'), JSON.stringify({
  generatedAt: new Date().toISOString(),
  stats,
  papersAudit,
  methodsAudit,
  relations
}, null, 2), 'utf8');

writeFileSync(join(outputDir, 'knowledge-graph-v2.json'), JSON.stringify(knowledgeGraphV2, null, 2), 'utf8');
console.log(`\n完整机器可读审计报告已写入: outputs/knowledge-audit-report.json`);
console.log(`知识图谱 V2 数据已生成: outputs/knowledge-graph-v2.json`);
