import {chromium} from 'playwright-core';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const records=JSON.parse(fs.readFileSync('src/components/tutorial-v3/tutorial-verification.json','utf8'));
const browser=await chromium.launch({executablePath:process.env.EDGE_PATH??'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const page=await browser.newPage();const rows=[];
for(const [id,r] of Object.entries(records))for(const [width,height] of [[1600,900],[1280,800],[1024,768],[390,844]]){
 await page.setViewportSize({width,height});await page.goto(`${process.env.PHYTOMETHODS_PREVIEW_BASE??'http://127.0.0.1:4334/phytomethods'}/tutorials/${id}/`);
 const resources=await page.locator('.tv3-resources').innerText();
 assert.ok(resources.includes(r.softwareVersion),`${id}: software version`);
 if(id!=='hifiasm-intro') {assert.ok(resources.includes(r.dataSource),`${id}: input mapping`);assert.ok(resources.includes(r.expectedOutputs[0]),`${id}: output mapping`);assert.ok(resources.includes(r.verificationScope),`${id}: verification scope`);}
 rows.push({id,width,height,metadataMatches:true});
}
await browser.close();
const out=process.env.TUTORIAL_SCIENCE_BROWSER_REPORT??'outputs/tutorial-science-v3.1/browser-metadata.json';fs.mkdirSync(out.slice(0,out.lastIndexOf('/')),{recursive:true});fs.writeFileSync(out,JSON.stringify({checks:rows.length,rows},null,2));console.log(`Scientific browser metadata checks: ${rows.length} passed`);
