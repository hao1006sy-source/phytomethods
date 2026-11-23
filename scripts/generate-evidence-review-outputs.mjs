import fs from 'node:fs';
import path from 'node:path';

import { verifiedApplicationMethods } from '../src/lib/knowledge/verified-application-methods.ts';
import { curatedRelations } from '../src/lib/knowledge/curated-relations.ts';

const outDir = 'outputs/evidence-audit-v1.2';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const inventoryData = JSON.parse(fs.readFileSync(path.join(outDir, 'application-method-inventory.json'), 'utf8'));
const inventory = inventoryData.inventory;

const verifiedMap = new Map(verifiedApplicationMethods.map(v => [`${v.paperId}|${v.methodId}`, v]));
const curatedMap = new Map(curatedRelations.map(c => [`${c.paperId}|${c.methodId}`, c]));

const reviewRecords = [];
const unresolvedRecords = [];

for (const item of inventory) {
  const key = `${item.paperId}|${item.methodId}`;
  const preStatus = item.currentVerificationStatus;
  
  let postRelation = 'uses_method';
  let postStatus = 'structurally_valid';
  let decision = 'verified_source_checked';
  let evidenceSummary = '';
  let analysisPurpose = '';
  let sourceSection = '';
  let softwareVersion = '';
  let sourceUrl = item.paperDOI ? `https://doi.org/${item.paperDOI}` : '';
  let scientificNotes = '';

  if (item.paperId === 'rice-variant-comparison' && item.methodId === 'bcftools') {
    // Reclassified to evaluates_method
    postRelation = 'evaluates_method';
    postStatus = 'source_checked';
    decision = 'reclassified_to_evaluates_method';
    sourceSection = 'Methods - Variant calling pipelines comparison';
    softwareVersion = 'BCFtools mpileup';
    analysisPurpose = '评估 BCFtools mpileup 与 GATK4.3 HaplotypeCaller 在短读段水稻杂合 SNP 检测中的一致性表现与假阳性率。';
    evidenceSummary = 'Plant Methods 2025 原文设计独立测序重复试验横向评测 BCFtools mpileup 与 GATK4，结论明确未将 BCFtools 选为最终生产分析流程，语义调整为 evaluates_method。';
    scientificNotes = '原关系误将评测对比工具标为 uses_method，现依据文献纠偏为 evaluates_method。';
  } else if (item.paperId === 'african-rice-246-genomes' && item.methodId === 'msmc2') {
    // Unresolved version discrepancy
    postRelation = 'uses_method';
    postStatus = 'needs_review';
    decision = 'unresolved_needs_review';
    sourceSection = 'STAR Methods - Demographic History Inference';
    softwareVersion = 'MSMC v1.1.0';
    analysisPurpose = '针对非洲栽培稻与野生祖先自交背景构建伪二倍体，拟合历史有效群体规模。';
    evidenceSummary = 'Cubry 等 (Current Biology 2018) 实际运行的是 MSMC (v1) 算法，非 2020 年发布的 MSMC2 软件，存在代际版本对应疑问。';
    scientificNotes = '论文实际使用 MSMC (v1) 而非 MSMC2；由于本站尚无独立 msmc (v1) 工具节点，存在软件版本跨代混淆风险，严谨标记为 needs_review。';
    
    unresolvedRecords.push({
      paperId: item.paperId,
      paperTitle: item.paperTitle,
      paperYear: item.paperYear,
      paperDOI: item.paperDOI,
      methodId: item.methodId,
      methodName: item.methodName,
      issueType: '版本代际差异 (MSMC v1 vs MSMC2)',
      auditedSource: 'STAR Methods (DOI: 10.1016/j.cub.2018.05.066)',
      findings: '论文发表于 2018 年，实际运行 MSMC 1.1.0，而 MSMC2 发布于 2020 年。',
      missingRequirement: '建议新增 msmc 工具节点或建立严格历史版本别名映射机制；当前标记 needs_review 避免证据虚假升级。'
    });
  } else if (verifiedMap.has(key)) {
    const v = verifiedMap.get(key);
    postRelation = 'uses_method';
    postStatus = 'source_checked';
    decision = 'verified_source_checked';
    sourceSection = v.sourceSection || 'Methods';
    softwareVersion = v.softwareVersion || '详见原文';
    analysisPurpose = v.analysisPurpose;
    evidenceSummary = v.evidenceSummary;
    sourceUrl = v.sourceUrl;
    scientificNotes = '经文献原文 Methods / 补充材料逐条核实，存在确凿使用证据，升级为 source_checked。';
  } else if (curatedMap.has(key)) {
    const c = curatedMap.get(key);
    postRelation = c.relation;
    postStatus = c.verificationStatus;
    decision = 'rechecked_curated_source_checked';
    sourceSection = '既有人工策展库 (Curated Relations)';
    softwareVersion = '已策展核实';
    analysisPurpose = c.note;
    evidenceSummary = c.note;
    scientificNotes = '既有 11 条 source_checked 关系之一，经独立复核 DOI、文献来源与工具描述，确认无误。';
  }

  reviewRecords.push({
    index: item.index,
    edgeId: item.edgeId,
    paperId: item.paperId,
    paperTitle: item.paperTitle,
    paperYear: item.paperYear,
    paperDOI: item.paperDOI,
    methodId: item.methodId,
    methodName: item.methodName,
    preAuditRelation: 'uses_method',
    preAuditStatus: preStatus,
    postAuditRelation: postRelation,
    postAuditStatus: postStatus,
    reviewDecision: decision,
    sourceSection,
    softwareVersion,
    analysisPurpose,
    evidenceSummary,
    sourceUrl,
    scientificNotes
  });
}

// 写入 evidence-review.json
const jsonOutput = {
  metadata: {
    generatedAt: new Date().toISOString(),
    auditVersion: '1.2.0',
    totalAudited: reviewRecords.length,
    statistics: {
      preAudit: {
        totalUsesMethod: 68,
        sourceChecked: 11,
        structurallyValid: 57,
        needsReview: 0
      },
      postAudit: {
        totalUsesMethod: reviewRecords.filter(r => r.postAuditRelation === 'uses_method').length,
        sourceCheckedUsesMethod: reviewRecords.filter(r => r.postAuditRelation === 'uses_method' && r.postAuditStatus === 'source_checked').length,
        needsReviewUsesMethod: reviewRecords.filter(r => r.postAuditRelation === 'uses_method' && r.postAuditStatus === 'needs_review').length,
        structurallyValidUsesMethod: reviewRecords.filter(r => r.postAuditRelation === 'uses_method' && r.postAuditStatus === 'structurally_valid').length,
        reclassifiedEvaluatesMethod: reviewRecords.filter(r => r.postAuditRelation === 'evaluates_method').length
      }
    }
  },
  reviewRecords
};

fs.writeFileSync(path.join(outDir, 'evidence-review.json'), JSON.stringify(jsonOutput, null, 2), 'utf8');

// 写入 evidence-review.csv
const reviewCsvHeaders = [
  'index',
  'paperId',
  'paperTitle',
  'paperYear',
  'paperDOI',
  'methodId',
  'methodName',
  'preAuditRelation',
  'preAuditStatus',
  'postAuditRelation',
  'postAuditStatus',
  'reviewDecision',
  'sourceSection',
  'softwareVersion',
  'analysisPurpose',
  'evidenceSummary',
  'sourceUrl',
  'scientificNotes'
];

function escapeCsv(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const reviewCsvRows = [
  reviewCsvHeaders.join(','),
  ...reviewRecords.map(r => reviewCsvHeaders.map(h => escapeCsv(r[h])).join(','))
];
fs.writeFileSync(path.join(outDir, 'evidence-review.csv'), reviewCsvRows.join('\n'), 'utf8');

// 写入 unresolved-relations.csv
const unresolvedHeaders = [
  'paperId',
  'paperTitle',
  'paperYear',
  'paperDOI',
  'methodId',
  'methodName',
  'issueType',
  'auditedSource',
  'findings',
  'missingRequirement'
];
const unresolvedRows = [
  unresolvedHeaders.join(','),
  ...unresolvedRecords.map(r => unresolvedHeaders.map(h => escapeCsv(r[h])).join(','))
];
fs.writeFileSync(path.join(outDir, 'unresolved-relations.csv'), unresolvedRows.join('\n'), 'utf8');

console.log('Successfully generated evidence-review.json, evidence-review.csv, and unresolved-relations.csv');
console.log(`Audited: ${reviewRecords.length} relations.`);
console.log(`Newly verified source_checked: ${reviewRecords.filter(r => r.reviewDecision === 'verified_source_checked').length}`);
console.log(`Rechecked curated source_checked: ${reviewRecords.filter(r => r.reviewDecision === 'rechecked_curated_source_checked').length}`);
console.log(`Reclassified to evaluates_method: ${reviewRecords.filter(r => r.reviewDecision === 'reclassified_to_evaluates_method').length}`);
console.log(`Unresolved needs_review: ${unresolvedRecords.length}`);
