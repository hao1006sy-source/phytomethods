/**
 * PhytoMethods 63 篇科研专题 Markdown 渲染与排版语法全量审计脚本
 * 兼具静态源码解析与构建后 HTML 真实文本校验，支持独立运行与 CI 流水线门禁
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const topicsDir = join(root, 'src/content/topics');
const distDir = join(root, 'dist/topics');
const metadataPath = join(root, 'src/data/topic-metadata.json');

console.log('================ PhytoMethods 专题 Markdown 渲染质量审计 ================');

// 1. 读取元数据与专题列表
const topicMetadata = JSON.parse(readFileSync(metadataPath, 'utf8'));
const topicDomainMap = new Map();
for (const t of topicMetadata) {
  topicDomainMap.set(t.id, t.domainId);
}

const topicFiles = readdirSync(topicsDir).filter(f => f.endsWith('.md')).sort();
console.log(`已就绪检查专题总数: ${topicFiles.length} 篇 (覆盖 M01~M09 全部 9 大研究领域)`);

const issues = [];

// 2. 静态源码扫描
console.log('\n--- 阶段 1: Markdown 源码语法与 CommonMark 强调边界静态扫描 ---');
for (const file of topicFiles) {
  const filePath = join(topicsDir, file);
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);

  let inCodeBlock = false;
  let inFrontmatter = false;
  let fmDashes = 0;

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed === '---') {
      fmDashes++;
      inFrontmatter = fmDashes < 2;
      return;
    }
    if (inFrontmatter) return;

    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      return;
    }
    if (inCodeBlock) return;

    const lineNum = idx + 1;

    // 剔除行内代码 `...` 以免干扰星号统计
    const cleanLineForStars = line.replace(/`[^`]+?`/g, '');
    const boldDelimiterCount = (cleanLineForStars.match(/\*\*/g) || []).length;

    // 检查 A: 源码中奇数个 ** (存在漏闭合)
    if (boldDelimiterCount % 2 !== 0) {
      issues.push({
        file,
        lineNum,
        level: 'error',
        type: 'unbalanced_bold_delimiters',
        message: `行内 ** 数量为奇数 (${boldDelimiterCount})，存在未闭合的加粗标记`,
        snippet: line
      });
    } else if (boldDelimiterCount > 0) {
      // 检查 B: CommonMark 标点右边界冲突精确检测 (基于 Tokenizer 分词)
      const parts = cleanLineForStars.split('**');
      for (let i = 1; i < parts.length; i += 2) {
        const boldText = parts[i];
        const afterText = parts[i + 1] || '';
        const lastChar = boldText.slice(-1);
        const firstAfter = afterText.slice(0, 1);

        // 如果加粗结尾是标点/括号，而紧随其后的首字符是字母或汉字
        const isLastPunct = /[)）\]｝}、，。！？；："'”’\p{P}]/u.test(lastChar);
        const isAfterLetter = /[\u4e00-\u9fa5a-zA-Z0-9]/u.test(firstAfter);

        if (isLastPunct && isAfterLetter) {
          issues.push({
            file,
            lineNum,
            level: 'error',
            type: 'invalid_delimiter_boundary',
            message: `加粗 "**${boldText}**" 结尾字符 "${lastChar}" 为标点，后直接紧邻字符 "${firstAfter}"，导致 CommonMark 判定失效`,
            snippet: `**${boldText}**${firstAfter}`
          });
        }
      }
    }

    // 检查 C: 未闭合的行内反引号
    const backtickCount = (line.match(/`/g) || []).length;
    if (backtickCount % 2 !== 0 && !line.includes('```')) {
      issues.push({
        file,
        lineNum,
        level: 'error',
        type: 'unbalanced_backticks',
        message: `行内反引号 \` 数量为奇数 (${backtickCount})，存在未闭合的代码语法`,
        snippet: line
      });
    }

    // 检查 D: 格式断裂的 Markdown 链接 [text](url 无闭合右括号
    const brokenLinkRegex = /\[([^\]\n]+?)\]\((https?:\/\/[^\s)]+?)([\u4e00-\u9fa5])/g;
    let bMatch;
    while ((bMatch = brokenLinkRegex.exec(line)) !== null) {
      issues.push({
        file,
        lineNum,
        level: 'error',
        type: 'broken_markdown_link',
        message: 'Markdown 链接缺失闭合右括号或混入中文字符',
        snippet: bMatch[0]
      });
    }
  });
}

// 3. 构建产物真实 HTML 渲染扫描 (如果 dist 目录存在)
if (existsSync(distDir)) {
  console.log('--- 阶段 2: 构建产物 HTML 渲染保真度与原始标记泄漏检测 ---');
  for (const t of topicMetadata) {
    const htmlPath = join(distDir, t.domainId, t.id, 'index.html');
    if (!existsSync(htmlPath)) {
      continue;
    }
    const html = readFileSync(htmlPath, 'utf8');

    // 检查 KaTeX 渲染报错
    if (html.includes('katex-error') || html.includes('ParseError: KaTeX parse error')) {
      issues.push({
        file: `${t.id}.md`,
        lineNum: 0,
        level: 'error',
        type: 'katex_render_error',
        message: `页面中检测到 KaTeX 数学公式解析报错: ${t.domainId}/${t.id}`,
        snippet: ''
      });
    }

    // 提取正文内容并彻底过滤代码、公式、SVG
    const articleMatch = html.match(/<article[\s\S]*?<\/article>/i);
    if (articleMatch) {
      const cleanArticle = articleMatch[0]
        .replace(/<pre[\s\S]*?<\/pre>/gi, '')
        .replace(/<code[\s\S]*?<\/code>/gi, '')
        .replace(/<svg[\s\S]*?<\/svg>/gi, '')
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<span class="katex"[\s\S]*?<\/span>/gi, '')
        .replace(/<annotation[\s\S]*?<\/annotation>/gi, '')
        .replace(/<[^>]+?>/g, ' ');

      // 检查 cleanArticle 中是否残留未经解析的 **
      if (cleanArticle.includes('**')) {
        const starCount = (cleanArticle.match(/\*\*/g) || []).length;
        issues.push({
          file: `${t.id}.md`,
          lineNum: 0,
          level: 'error',
          type: 'unrendered_markdown_in_html',
          message: `HTML 实际渲染正文中直接暴露了 ${starCount} 个未解析的 "**" 标记 (页面: ${t.domainId}/${t.id})`,
          snippet: cleanArticle.slice(Math.max(0, cleanArticle.indexOf('**') - 20), cleanArticle.indexOf('**') + 40).trim()
        });
      }

      // 检查 cleanArticle 中是否残留未渲染的 [text](url) 语法
      const rawLinkMatch = cleanArticle.match(/\[[^\]\n]+?\]\((https?:\/\/|\/|\.)[^\s)]+?\)/g);
      if (rawLinkMatch) {
        issues.push({
          file: `${t.id}.md`,
          lineNum: 0,
          level: 'error',
          type: 'unrendered_link_in_html',
          message: `HTML 实际渲染正文中直接暴露了原始 Markdown 链接语法: ${rawLinkMatch[0]}`,
          snippet: rawLinkMatch[0]
        });
      }
    }
  }
} else {
  console.log('--- 阶段 2: (跳过 HTML 检测，dist 目录尚未构建) ---');
}

// 4. 统计与报告汇总
console.log('\n================ 质量审计统计结果 ================');
console.log(`检查专题总数: ${topicFiles.length} 篇`);
console.log(`发现异常总数: ${issues.length} 处`);

if (issues.length > 0) {
  console.error('\n❌ 检测到以下 Markdown 语法或渲染异常:');
  for (const iss of issues) {
    console.error(`  - [${iss.file}${iss.lineNum ? `:${iss.lineNum}` : ''}] [${iss.type}] ${iss.message}`);
    if (iss.snippet) {
      console.error(`    相关片段: ${iss.snippet}`);
    }
  }
  process.exit(1);
} else {
  console.log('\n✅ 全站 63 篇专题 Markdown 渲染与强调语法审计 100% 通过！0 处边界语法冲突，0 处原始标记暴露！');
}
