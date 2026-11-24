import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '..');

console.log('--- 校验中英文同义词与缩写词典 (check-search-synonyms.mjs) ---');

const synonymsRaw = readFileSync(join(root, 'src/data/search-synonyms.json'), 'utf-8');
const data = JSON.parse(synonymsRaw);
const list = data.synonyms;

if (!Array.isArray(list) || list.length < 10) {
  throw new Error(`同义词数量过少，当前仅 ${list?.length} 组`);
}

for (const item of list) {
  if (!item.canonical || !Array.isArray(item.terms) || item.terms.length < 2) {
    throw new Error(`同义词词条配置非法: ${JSON.stringify(item)}`);
  }
}

console.log(`✓ 检索同义词词典校验通过 (共 ${list.length} 组高频植物基因组学中英文/缩写同义词组)`);
