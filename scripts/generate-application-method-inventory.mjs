import fs from 'node:fs';
import path from 'node:path';

const graphPath = 'outputs/knowledge-graph-v2.json';
const papersDir = 'src/content/papers';
const methodsDir = 'src/content/methods';
const outputDir = 'outputs/evidence-audit-v1.2';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const graph = JSON.parse(fs.readFileSync(graphPath, 'utf8'));
const nodesMap = new Map(graph.nodes.map(n => [n.id, n]));

// Helper to read markdown frontmatter
function readFrontmatter(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const lines = match[1].split(/\r?\n/);
  const data = {};
  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const val = line.slice(colonIdx + 1).trim().replace(/^['"]|['"]$/g, '');
    data[key] = val;
  }
  return data;
}

const usesMethodEdges = graph.edges.filter(e => e.relation === 'uses_method');

console.log(`Found ${usesMethodEdges.length} uses_method edges in knowledge graph.`);

const inventory = usesMethodEdges.map((edge, index) => {
  const paperId = edge.source.replace(/^paper:/, '');
  const methodId = edge.target.replace(/^method:/, '');

  const paperFm = readFrontmatter(path.join(papersDir, `${paperId}.md`));
  const methodFm = readFrontmatter(path.join(methodsDir, `${methodId}.md`));

  const paperNode = nodesMap.get(edge.source);
  const methodNode = nodesMap.get(edge.target);

  const evidence = edge.evidence?.[0] || {};
  const currentVerificationStatus = evidence.verificationStatus || 'unknown';
  const currentEvidenceSource = evidence.sourceType || 'unknown';

  const isAlreadyChecked = currentVerificationStatus === 'source_checked';

  return {
    index: index + 1,
    edgeId: edge.id,
    paperId,
    paperTitle: paperFm.title || paperNode?.label || paperId,
    paperYear: paperFm.year ? parseInt(paperFm.year, 10) : (paperNode?.metadata?.year || null),
    paperDOI: paperFm.doi || evidence.doi || '',
    methodId,
    methodName: methodFm.name || methodNode?.label || methodId,
    currentRelation: edge.relation,
    currentVerificationStatus,
    currentEvidenceSource,
    reviewStatus: isAlreadyChecked ? 'recheck_needed' : 'pending_audit',
    reviewDecision: 'to_be_determined',
    preAuditSnapshot: {
      edgeId: edge.id,
      relation: edge.relation,
      verificationStatus: currentVerificationStatus,
      sourceType: currentEvidenceSource,
      note: evidence.note || '',
      doi: evidence.doi || ''
    }
  };
});

// Write JSON
fs.writeFileSync(
  path.join(outputDir, 'application-method-inventory.json'),
  JSON.stringify({
    metadata: {
      generatedAt: new Date().toISOString(),
      totalEdges: inventory.length,
      structurallyValidCount: inventory.filter(i => i.currentVerificationStatus === 'structurally_valid').length,
      sourceCheckedCount: inventory.filter(i => i.currentVerificationStatus === 'source_checked').length
    },
    inventory
  }, null, 2),
  'utf8'
);

// Write CSV
const csvHeaders = [
  'index',
  'edgeId',
  'paperId',
  'paperTitle',
  'paperYear',
  'paperDOI',
  'methodId',
  'methodName',
  'currentRelation',
  'currentVerificationStatus',
  'currentEvidenceSource',
  'reviewStatus',
  'reviewDecision'
];

function escapeCsv(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const csvRows = [
  csvHeaders.join(','),
  ...inventory.map(row => csvHeaders.map(h => escapeCsv(row[h])).join(','))
];

fs.writeFileSync(path.join(outputDir, 'application-method-inventory.csv'), csvRows.join('\n'), 'utf8');

console.log('Successfully generated application-method-inventory.json and .csv');
console.log(`Structurally valid: ${inventory.filter(i => i.currentVerificationStatus === 'structurally_valid').length}`);
console.log(`Source checked: ${inventory.filter(i => i.currentVerificationStatus === 'source_checked').length}`);
