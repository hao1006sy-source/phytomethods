import {chromium} from 'playwright-core';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const url='http://127.0.0.1:4321/phytomethods/knowledge/';
for(const width of [375,768,1280,1440]){
 const page=await browser.newPage({viewport:{width,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url);const chooser=page.locator('#knowledge-selected');
 if(width===375){if(await page.locator('.knowledge-graph').isVisible())throw Error('mobile graph should use list');if(!await page.locator('.knowledge-row:visible').count())throw Error('mobile list');}
 else {
  await chooser.selectOption('hifiasm');let graph=page.locator('[data-knowledge-graph="hifiasm"]');if(!await graph.isVisible())throw Error('selected graph');
  if(!await graph.locator('a[aria-label^="领域："]').count()||!await graph.locator('a[aria-label^="专题："]').count()||!await graph.locator('a[aria-label^="文献："]').count())throw Error('relationship nodes');
  await page.locator('[name=domain]').selectOption('genome-annotation');if(await chooser.inputValue()==='hifiasm')throw Error('filtered selection');
  await page.locator('[name=principle]').selectOption('debruijn');if(!await chooser.isDisabled()||!await page.locator('#knowledge-graph-empty').isVisible())throw Error('empty graph');
  await page.getByRole('button',{name:'重置筛选'}).click();await page.waitForTimeout(100);await chooser.selectOption('hifiasm');graph=page.locator('[data-knowledge-graph="hifiasm"]');
  const principle=graph.locator('[data-graph-principle]').first();const value=await principle.getAttribute('data-graph-principle');await principle.click();if(await page.locator('[name=principle]').inputValue()!==value)throw Error('principle node filter');
  await page.getByRole('button',{name:'重置筛选'}).click();await page.waitForTimeout(100);await chooser.selectOption('hifiasm');await page.locator('[data-knowledge-graph="hifiasm"] a[aria-label^="工具："]').click();if(!page.url().includes('/methods/hifiasm/'))throw Error('tool navigation');
 }
 if(errors.length)throw Error(errors.join('; '));if(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)>1)throw Error('overflow '+width);
 console.log(`${width}px graph/list, filters, reset and navigation passed`);await page.close();
}
await browser.close();
