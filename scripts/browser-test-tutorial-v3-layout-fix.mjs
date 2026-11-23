import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const base = (process.env.PHYTOMETHODS_PREVIEW_BASE ?? 'http://127.0.0.1:4334/phytomethods').replace(/\/$/, '');
const output = process.env.TUTORIAL_LAYOUT_OUTPUT ?? 'outputs/tutorial-v3-layout-fix/after';
const edge = process.env.EDGE_PATH ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const ids = ['hifiasm-intro', 'orthofinder-intro', 'syri-intro', 'bismark-synthetic', 'plink-synthetic', 'gwas-synthetic', 'scanpy-synthetic', 'wgcna-synthetic', 'edta-tutorial', 'cafe5-intro'];
const viewports = [[1920,1080],[1600,900],[1440,900],[1280,800],[1024,768],[768,1024],[390,844],[375,812]];
const browser = await chromium.launch({ executablePath: edge, headless: true });
const context = await browser.newContext();
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
fs.mkdirSync(output, { recursive: true });
const results = { base, viewports, effectiveZoomViewports: { '100%':1600, '125%':1280, '150%':1067, '200%':800 }, tutorials: {}, errors };

function overlap(a,b) { return a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1; }

for (const id of ids) {
  const route = `${base}/tutorials/${id}/`;
  const tutorial = { checks: [], screenshots: [], resources: 0 };
  for (const [width,height] of viewports) {
    await page.setViewportSize({ width, height });
    const response = await page.goto(route, { waitUntil:'networkidle' });
    assert.equal(response?.status(), 200, `${id} ${width}: HTTP 200`);
    await page.evaluate(() => document.fonts.ready);
    const state = await page.evaluate(() => {
      const selectors = ['.tv3-hero','.tv3-columns','.tv3-sidebar','.tv3-main','.tv3-resources'];
      const box = selector => {
        const el = document.querySelector(selector);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { left:r.left, right:r.right, top:r.top, bottom:r.bottom, width:r.width, height:r.height, display:getComputedStyle(el).display, position:getComputedStyle(el).position };
      };
      const resource = document.querySelector('.tv3-resources');
      const cards = [...(resource?.querySelectorAll('section') ?? [])].map(el => {
        const r=el.getBoundingClientRect(); return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};
      });
      return { viewport:innerWidth, pageScroll:document.documentElement.scrollWidth, boxes:Object.fromEntries(selectors.map(s=>[s,box(s)])), cards };
    });
    assert.ok(state.boxes['.tv3-hero'] && state.boxes['.tv3-columns'] && state.boxes['.tv3-sidebar'] && state.boxes['.tv3-main'] && state.boxes['.tv3-resources'], `${id} ${width}: layout nodes exist`);
    for (const [selector,box] of Object.entries(state.boxes)) {
      assert.ok(box.left >= -1 && box.right <= width + 1, `${id} ${width}: ${selector} inside viewport (${box.left.toFixed(1)}..${box.right.toFixed(1)})`);
    }
    for (const card of state.cards) assert.ok(card.left >= -1 && card.right <= width + 1, `${id} ${width}: resource card inside viewport`);
    assert.ok(state.cards.length >= 3, `${id} ${width}: resource cards present`);
    const [sidebar,main,resources] = ['.tv3-sidebar','.tv3-main','.tv3-resources'].map(k=>state.boxes[k]);
    assert.ok(!overlap(sidebar,main), `${id} ${width}: sidebar and main do not overlap`);
    assert.ok(!overlap(main,resources), `${id} ${width}: main and resources do not overlap`);
    assert.ok(!overlap(sidebar,resources), `${id} ${width}: sidebar and resources do not overlap`);
    if (width > 1100) assert.ok(sidebar.left < main.left && main.left < resources.left, `${id} ${width}: desktop three-column order`);
    else if (width > 1000) assert.ok(resources.top >= main.bottom - 1, `${id} ${width}: tablet resources follow main`);
    else assert.ok(sidebar.top <= main.top && main.top <= resources.top, `${id} ${width}: single-column order`);
    assert.ok(state.pageScroll <= width + 1, `${id} ${width}: no document horizontal overflow (${state.pageScroll})`);
    tutorial.resources = state.cards.length;
    tutorial.checks.push({ width,height,...state });
    if (width === 1600 || width === 1280 || width === 1024 || width === 390 || width === 375) {
      const dir=path.join(output,id); fs.mkdirSync(dir,{recursive:true});
      const name=`${width}x${height}.png`;
      await page.screenshot({path:path.join(dir,name),fullPage:width<500}); tutorial.screenshots.push(path.join(id,name));
    }
  }
  results.tutorials[id]=tutorial;
}

// Responsive breakpoints at desktop zoom-equivalent CSS viewport widths.
for (const [zoom,width] of Object.entries(results.effectiveZoomViewports)) {
  await page.setViewportSize({width,height:900});
  await page.goto(`${base}/tutorials/cafe5-intro/`,{waitUntil:'domcontentloaded'});
  const state=await page.evaluate(()=>Object.fromEntries(['.tv3-sidebar','.tv3-main','.tv3-resources'].map(s=>{const r=document.querySelector(s).getBoundingClientRect();return[s,{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width}]})));
  for(const [sel,box] of Object.entries(state)) assert.ok(box.left>=-1&&box.right<=width+1,`${zoom} zoom-equivalent ${sel} in viewport`);
  assert.ok(!overlap(state['.tv3-main'],state['.tv3-resources']),`${zoom} zoom-equivalent no overlap`);
  results.zoomChecks ??= {}; results.zoomChecks[zoom]={ effectiveCssViewport:width,state,method:'responsive CSS viewport emulation' };
}

assert.deepEqual(errors,[], 'no page errors');
results.summary={tutorials:ids.length,viewportChecks:ids.length*viewports.length,zoomChecks:Object.keys(results.zoomChecks).length,resourceCardsPerTutorial:results.tutorials['cafe5-intro'].resources,pageErrors:errors.length};
fs.writeFileSync(path.join(output,'browser-results.json'),JSON.stringify(results,null,2));
await browser.close();
console.log(JSON.stringify(results.summary));
