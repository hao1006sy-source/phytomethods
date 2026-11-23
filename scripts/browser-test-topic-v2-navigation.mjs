import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';
import topicMetadata from '../src/data/topic-metadata.json' with { type: 'json' };

const baseUrl = process.env.TOPIC_V2_BASE_URL ?? 'http://127.0.0.1:4322/phytomethods/';
const outputPath = path.join(process.cwd(), 'outputs', 'topic-v2-full-rollout', 'verified-v2', 'navigation-results.json');
const topics = topicMetadata.filter((topic) => topic.status === 'published');
const ids = new Set(topics.map((topic) => topic.id));
const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE_PATH ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
page.setDefaultTimeout(8000);
const rows=[];

for(const topic of topics){
  const domainTopics=topics.filter((item)=>item.domainId===topic.domainId).sort((a,b)=>a.order-b.order);
  const index=domainTopics.findIndex((item)=>item.id===topic.id);
  const expected=[domainTopics[index-1]?.id,domainTopics[index+1]?.id].filter(Boolean);
  const url=new URL(`topics/${topic.domainId}/${topic.id}/`,baseUrl).href;
  const response=await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.locator('.topic-v2').waitFor();
  const links=await page.locator('.article-pagination a').evaluateAll((anchors)=>anchors.map((anchor)=>anchor.href));
  const actual=links.map((href)=>{const match=href.match(/\/topics\/[^/]+\/([^/]+)\/$/);return match?.[1]}).filter((id)=>id&&ids.has(id));
  const firstToc=page.locator('.article-toc a').first();
  let tocNavigation=false;
  if(await firstToc.count()){
    const target=await firstToc.getAttribute('href');
    await firstToc.click();
    tocNavigation=decodeURIComponent(new URL(page.url()).hash.slice(1))===decodeURIComponent(target.slice(1));
  }
  const row={id:topic.id,route:`/topics/${topic.domainId}/${topic.id}/`,status:response?.status(),expectedNeighbors:expected,actualNeighbors:actual,tocNavigation};
  if(response?.status()!==200||JSON.stringify(actual)!==JSON.stringify(expected)||!tocNavigation)row.failure='navigation';
  rows.push(row);
}

await browser.close();
const report={baseUrl,generatedAt:new Date().toISOString(),pages:rows.length,passed:rows.filter((row)=>!row.failure).length,failed:rows.filter((row)=>row.failure)};
fs.writeFileSync(outputPath,`${JSON.stringify(report,null,2)}\n`);
console.log(`Page navigation: ${report.passed}/${report.pages}; failures: ${report.failed.length}`);
if(report.failed.length)process.exitCode=1;
