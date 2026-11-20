import {z} from 'astro/zod';
import {domains} from '../data/domains';
import {principleLabels,dataLabels,speciesLabels} from '../data/tags';
import {topicMetadata} from '../data/topics';
import {getCollection} from 'astro:content';
export async function validateContent(){
const methods=await getCollection('methods');const papers=await getCollection('papers');const tutorials=await getCollection('tutorials');const topics=await getCollection('topics');
const methodIds=new Set(methods.map(x=>x.id));const paperIds=new Set(papers.map(x=>x.id));
for(const m of methods) if(!paperIds.has(m.data.paper)) throw new Error(`无效论文引用：${m.id} → ${m.data.paper}`);
for(const t of [...topics,...tutorials]) for(const id of ('methods' in t.data ? t.data.methods : [t.data.method])) if(!methodIds.has(id)) throw new Error(`无效方法引用：${t.id} → ${id}`);
for(const p of papers) if(p.data.method && !methodIds.has(p.data.method)) throw new Error(`无效方法引用：${p.id}`);
if(new Set(papers.map(p=>p.data.doi.toLowerCase())).size!==papers.length) throw new Error('发现重复 DOI');
const topicIds=new Set(topics.map(x=>x.id));const domainIds=new Set(domains.map(d=>d[1]));
for(const [name,entries] of Object.entries({methods,papers,tutorials,topics})) { const ids=entries.map(e=>e.id);if(new Set(ids).size!==ids.length)throw new Error(`重复 ID: ${name}`); }
for(const m of methods){for(const id of m.data.domainIds)if(!domainIds.has(id as never))throw Error(`无效领域 ${id}`);for(const id of m.data.topicIds)if(!topicIds.has(id))throw Error(`无效专题 ${id}`);for(const id of m.data.principleIds)if(!(id in principleLabels))throw Error(`无效原理标签 ${id}`);for(const id of m.data.dataIds)if(!(id in dataLabels))throw Error(`无效数据标签 ${id}`);}
for(const m of methods.filter(m=>m.data.status==='published')) {
 if(!papers.some(p=>p.id===m.data.paper && p.data.status==='published')) throw Error(`已发布工具引用未发布论文：${m.id}`);
 for(const id of m.data.topicIds) if(!topics.some(t=>t.id===id && t.data.status==='published')) throw Error(`已发布工具引用未发布专题：${m.id} → ${id}`);
}
for(const t of topics.filter(t=>t.data.status==='published')) for(const id of t.data.methods) if(!methods.some(m=>m.id===id && m.data.status==='published')) throw Error(`已发布专题引用未发布工具：${t.id} → ${id}`);
for(const t of tutorials.filter(t=>t.data.status==='published')) if(!methods.some(m=>m.id===t.data.method && m.data.status==='published')) throw Error(`已发布教程引用未发布工具：${t.id}`);
for(const p of papers.filter(p=>p.data.status==='published' && p.data.method)) if(!methods.some(m=>m.id===p.data.method && m.data.status==='published')) throw Error(`已发布论文引用未发布工具：${p.id}`);
for(const t of topics)if(!domainIds.has(t.data.domain as never))throw Error(`无效领域 ${t.data.domain}`);
for(const p of papers){for(const id of p.data.methodIds)if(!methods.some(m=>m.id===id && (p.data.status!=='published'||m.data.status==='published')))throw Error(`无效论文工具关联 ${p.id} → ${id}`);if(!/^10\.\d{4,9}\/\S+$/i.test(p.data.doi))throw Error(`无效 DOI: ${p.id}`);for(const id of p.data.domainIds)if(!domainIds.has(id as never))throw Error(`无效领域 ${id}`);for(const id of p.data.speciesIds)if(!(id in speciesLabels))throw Error(`无效物种 ${id}`);}
const topicMetaSchema=z.object({id:z.string().min(1),title:z.string().min(1),englishTitle:z.string().min(1),domainId:z.string(),order:z.number().int().min(1).max(7),summary:z.string().min(1),keyConcepts:z.array(z.string()).min(1),methodIds:z.array(z.string()),principleIds:z.array(z.string()),dataIds:z.array(z.string()),paperIds:z.array(z.string()),tutorialIds:z.array(z.string()),status:z.enum(['published','draft','planned']),createdAt:z.string().nullable(),updatedAt:z.string().nullable()});
const meta=z.array(topicMetaSchema).length(63).parse(topicMetadata);if(new Set(meta.map(t=>t.id)).size!==63)throw Error('专题元数据 ID 重复');
for(const d of domainIds){const entries=meta.filter(t=>t.domainId===d);if(entries.length!==7 || new Set(entries.map(t=>t.order)).size!==7)throw Error(`专题排序无效 ${d}`);}
for(const t of meta){if(!domainIds.has(t.domainId as never))throw Error(`无效专题领域 ${t.id}`);for(const id of t.methodIds)if(!methodIds.has(id))throw Error(`无效工具 ${id}`);for(const id of t.paperIds)if(!paperIds.has(id))throw Error(`无效论文 ${id}`);for(const id of t.tutorialIds)if(!tutorials.some(x=>x.id===id))throw Error(`无效教程 ${id}`);for(const id of t.principleIds)if(!(id in principleLabels))throw Error(`无效原理 ${id}`);for(const id of t.dataIds)if(!(id in dataLabels))throw Error(`无效数据 ${id}`);if(t.status==='published'&&!topics.some(x=>x.id===t.id&&x.data.status==='published'))throw Error(`缺少专题正文 ${t.id}`);}

}
