import type { TopicMetadata } from './topics';

const sequencingHighlights = [
  '理解 Illumina、PacBio HiFi 和 ONT 的数据特征与适用场景。',
  '理解读长、准确率和覆盖度对植物基因组组装的影响。',
  '掌握 FASTQ 检查与测序数据选择的基本流程。'
];

export function getTopicArticleHighlights(metadata: TopicMetadata): string[] {
  if (metadata.id === 'sequencing-data') return sequencingHighlights;
  const concepts = metadata.keyConcepts.slice(0, 5);
  return [metadata.summary, ...(concepts.length ? [`关键概念：${concepts.join('、')}`] : [])];
}
