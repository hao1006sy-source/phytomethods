import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const records=JSON.parse(fs.readFileSync('src/components/tutorial-v3/tutorial-verification.json','utf8'));
const rows=[];
for(const file of fs.readdirSync('src/content/tutorials').filter(f=>f.endsWith('.md'))){
 const id=file.slice(0,-3),text=fs.readFileSync(`src/content/tutorials/${file}`,'utf8').replaceAll('\r\n','\n');
 const fm=text.match(/^---\n([\s\S]*?)\n---/);assert.ok(fm,`${id}: frontmatter`);
 const field=name=>fm[1].match(new RegExp(`^${name}: (.+)$`,'m'))?.[1];
 const r=records[id];assert.ok(r,`${id}: verification record`);
 assert.ok(['verified','template','not-tested'].includes(field('tested')));assert.equal(r.status,field('tested'));
 assert.ok(fs.existsSync(`src/content/methods/${field('method')}.md`),`${id}: method exists`);
 for(const key of ['verificationScope','softwareVersion','environment','dataSource','unverifiedScope'])assert.ok(r[key]?.trim(),`${id}: ${key}`);
 assert.ok(r.expectedOutputs.length);assert.ok(r.sourceUrls.length);
 r.sourceUrls.forEach(url=>assert.equal(new URL(url).protocol,'https:'));
 if(r.status==='verified'){assert.ok(r.verifiedAt && r.evidencePaths.length);for(const f of r.evidencePaths)assert.ok(fs.statSync(f).size>0,`${id}: nonempty evidence ${f}`);}
 const blocks=[...text.matchAll(/^```([^\n]*)\n([\s\S]*?)^```/gm)];
 for(const [,language]of blocks)assert.ok(['bash','python','r','text'].includes(language.trim()),`${id}: language ${language}`);
 const commands=blocks.filter(b=>b[1]!=='text').flatMap(b=>b[2].split('\n').filter(l=>l.trim()&&!l.trim().startsWith('#')&&!/^\s/.test(l)&&!/^\)/.test(l)));
 assert.ok(!text.includes('真实数据验证成功'),`${id}: unsupported broad claim`);
 rows.push({id,status:r.status,codeBlocks:blocks.length,commandLines:commands.length,evidenceFiles:r.evidencePaths.length,scope:r.verificationScope});
}
assert.equal(rows.length,10);
const component=fs.readFileSync('src/components/tutorial-v3/TutorialV3.astro','utf8');assert.ok(!component.includes('/模拟|虚构/'));
const resources=fs.readFileSync('src/components/tutorial-v3/TutorialResourceCards.astro','utf8');assert.ok(!resources.includes('sectionExcerpt('));
const result={tutorials:rows.length,commands:rows.reduce((n,r)=>n+r.commandLines,0),rows};
console.log(JSON.stringify(result,null,2));
if(process.env.TUTORIAL_SCIENCE_REPORT){fs.mkdirSync(path.dirname(process.env.TUTORIAL_SCIENCE_REPORT),{recursive:true});fs.writeFileSync(process.env.TUTORIAL_SCIENCE_REPORT,JSON.stringify(result,null,2));}
