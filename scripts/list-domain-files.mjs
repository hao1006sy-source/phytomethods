import fs from 'node:fs';
import path from 'node:path';

const domain = process.argv[2] || 'sequencing-assembly';

console.log(`=== 检索领域: ${domain} ===`);

// 1. Topics
const topicsDir = 'src/content/topics';
const topics = fs.readdirSync(topicsDir)
  .filter(f => f.endsWith('.md'))
  .map(f => {
    const content = fs.readFileSync(path.join(topicsDir, f), 'utf8');
    const domainMatch = content.match(/domain(?:Id)?:\s*['"]?(.*?)['"]?\r?\n/);
    const titleMatch = content.match(/title:\s*['"](.*?)['"]/);
    return { file: f, domain: domainMatch ? domainMatch[1] : null, title: titleMatch ? titleMatch[1] : '' };
  })
  .filter(t => t.domain === domain);

console.log(`\n--- 专题 (Topics) [${topics.length}篇] ---`);
topics.forEach(t => console.log(`- ${t.file}: ${t.title}`));

// 2. Methods
const methodsDir = 'src/content/methods';
const methods = fs.readdirSync(methodsDir)
  .filter(f => f.endsWith('.md'))
  .map(f => {
    const content = fs.readFileSync(path.join(methodsDir, f), 'utf8');
    const domainMatch = content.match(/domain(?:Id)?s?:\s*\[(.*?)\]/) || content.match(/domain(?:Id)?:\s*['"]?(.*?)['"]?\r?\n/);
    const domains = domainMatch ? domainMatch[1].split(',').map(s => s.trim().replace(/['"]/g, '')) : [];
    const nameMatch = content.match(/name:\s*['"]?(.*?)['"]?\r?\n/);
    return { file: f, domains, name: nameMatch ? nameMatch[1] : '' };
  })
  .filter(m => m.domains.includes(domain));

console.log(`\n--- 方法/算法 (Methods) [${methods.length}款] ---`);
methods.forEach(m => console.log(`- ${m.file}: ${m.name}`));

// 3. Tutorials
const tutorialsDir = 'src/content/tutorials';
const tutorials = fs.readdirSync(tutorialsDir)
  .filter(f => f.endsWith('.md'))
  .map(f => {
    const content = fs.readFileSync(path.join(tutorialsDir, f), 'utf8');
    const domainMatch = content.match(/domain(?:Id)?s?:\s*\[(.*?)\]/) || content.match(/domain(?:Id)?:\s*['"]?(.*?)['"]?\r?\n/);
    const domains = domainMatch ? domainMatch[1].split(',').map(s => s.trim().replace(/['"]/g, '')) : [];
    const titleMatch = content.match(/title:\s*['"]?(.*?)['"]?\r?\n/);
    return { file: f, domains, title: titleMatch ? titleMatch[1] : '' };
  })
  .filter(t => t.domains.includes(domain));

console.log(`\n--- 分析教程 (Tutorials) [${tutorials.length}篇] ---`);
tutorials.forEach(t => console.log(`- ${t.file}: ${t.title}`));
