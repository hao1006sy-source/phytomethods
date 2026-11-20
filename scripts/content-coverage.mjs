import {readFile,readdir} from 'node:fs/promises';
import path from 'node:path';

// The checked fields use scalar values and inline arrays in the current content model.
function scalar(front,key,fallback='') {
  const match=front.match(new RegExp(`^${key}:\\s*(.*?)\\s*$`,'m'));
  if(!match)return fallback;
  const value=match[1].replace(/^['"]|['"]$/g,'');
  if(!value)throw Error(`Unsupported empty or multiline field ${key}`);
  return value;
}
function array(front,key) {
  const value=scalar(front,key,'[]');
  if(!/^\[.*\]$/.test(value))throw Error(`Expected inline array for ${key}`);
  return value.slice(1,-1).split(',').map(s=>s.trim().replace(/^['"]|['"]$/g,'')).filter(Boolean);
}
async function entries(collection){
  const dir=path.join('src','content',collection);const files=(await readdir(dir)).filter(x=>x.endsWith('.md'));
  return Promise.all(files.map(async file=>{const source=await readFile(path.join(dir,file),'utf8');const match=source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);if(!match)throw Error(`Missing frontmatter: ${file}`);const front=match[1];return {id:file.slice(0,-3),status:scalar(front,'status','published'),domain:scalar(front,'domain'),domains:array(front,'domainIds'),method:scalar(front,'method'),tested:scalar(front,'tested')};}));
}
const metadata=JSON.parse(await readFile('src/data/topic-metadata.json','utf8'));
const [topics,methods,papers,tutorials]=await Promise.all(['topics','methods','papers','tutorials'].map(entries));
const topicById=new Map(topics.map(t=>[t.id,t]));const methodById=new Map(methods.map(m=>[m.id,m]));
console.log('| 领域 | 专题总数 | 已发布 | 草稿正文 | 待编写 | 已发布工具 | 已发布论文 | 已发布教程 |');
console.log('| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |');
for(const domain of [...new Set(metadata.map(t=>t.domainId))]){
  const ts=metadata.filter(t=>t.domainId===domain);const published=ts.filter(t=>topicById.get(t.id)?.status==='published').length;const draft=ts.filter(t=>topicById.get(t.id)?.status==='draft').length;
  const ms=methods.filter(m=>m.status==='published'&&m.domains.includes(domain));const ps=papers.filter(p=>p.status==='published'&&p.domains.includes(domain));const us=tutorials.filter(t=>t.status==='published'&&methodById.get(t.method)?.domains.includes(domain));
  console.log(`| ${domain} | ${ts.length} | ${published} | ${draft} | ${ts.length-published-draft} | ${ms.length} | ${ps.length} | ${us.length} |`);
}
const noPaper=metadata.filter(t=>t.status==='published'&&!t.paperIds.length).map(t=>t.id);
const noMethod=metadata.filter(t=>t.status==='published'&&!t.methodIds.length).map(t=>t.id);
const unverified=tutorials.filter(t=>t.status==='published'&&t.tested!=='verified').map(t=>`${t.id} (${t.tested})`);
console.log(`\n已发布专题无文献关联: ${noPaper.join(', ')||'无'}`);
console.log(`已发布专题无工具关联: ${noMethod.join(', ')||'无'}`);
console.log(`未实际运行验证的已发布教程: ${unverified.join(', ')||'无'}`);
