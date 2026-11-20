import {chromium} from 'playwright-core';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const url='http://127.0.0.1:4321/phytomethods/knowledge/';
for(const width of [375,768,1280,1440]){
 const page=await browser.newPage({viewport:{width,height:900}});
 const response=await page.goto(url);if(response.status()!==200)throw Error('状态 '+response.status());
 const size=await page.evaluate(()=>[document.documentElement.scrollWidth,document.documentElement.clientWidth]);if(size[0]>size[1])throw Error('横向溢出 '+width+' '+size);
 await page.locator('[name=domain]').selectOption('genome-assembly');await page.locator('[name=principle]').selectOption('debruijn');
 if(await page.locator('.knowledge-row:visible').count()!==1)throw Error('组合筛选');
 await page.locator('[name=domain]').selectOption('genome-annotation');if(!((await page.locator('#knowledge-count').innerText()).includes('没有')))throw Error('无结果');
 await page.getByRole('button',{name:'重置筛选'}).click();await page.waitForTimeout(100);if(await page.locator('.knowledge-row:visible').count()!==6)throw Error('重置');
 console.log(width+' 布局、组合筛选、无结果和重置通过');await page.close();
}
await browser.close();
