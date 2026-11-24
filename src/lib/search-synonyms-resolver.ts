import synonymsData from '../data/search-synonyms.json';

export interface SynonymGroup {
  terms: string[];
  canonical: string;
  category: string;
}

/**
 * 根据传入的文本内容（如标题、摘要、正文或元数据），
 * 解析命中的同义词组，并返回所有关联的同义词集合（去重）。
 */
export function resolvePageSynonyms(text: string): string[] {
  if (!text) return [];
  const textLower = text.toLowerCase();
  const matchedTerms = new Set<string>();

  for (const group of synonymsData.synonyms as SynonymGroup[]) {
    let hit = false;
    for (const term of group.terms) {
      const termLower = term.toLowerCase();
      if (termLower.length <= 3) {
        // 短英文缩写（如 TE, SV, LD, SNP, PCA），使用非单词边界正则，避免贪婪误伤
        const escaped = termLower.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`(^|[^a-zA-Z0-9])${escaped}([^a-zA-Z0-9]|$)`, 'i');
        if (regex.test(text)) {
          hit = true;
          break;
        }
      } else {
        if (textLower.includes(termLower)) {
          hit = true;
          break;
        }
      }
    }

    if (hit) {
      for (const t of group.terms) {
        matchedTerms.add(t);
      }
    }
  }

  return Array.from(matchedTerms);
}
