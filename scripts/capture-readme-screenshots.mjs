import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const targetDir = path.resolve('docs/assets/readme');
fs.mkdirSync(targetDir, { recursive: true });

const pagesToCapture = [
  {
    name: '01-homepage.png',
    url: 'https://hao1006sy-source.github.io/phytomethods/',
    waitFor: 'body',
    clipHeight: 820
  },
  {
    name: '02-methods-directory.png',
    url: 'https://hao1006sy-source.github.io/phytomethods/methods/',
    waitFor: '.method-card, .matrix-table, body',
    clipHeight: 820
  },
  {
    name: '03-scientific-topic.png',
    url: 'https://hao1006sy-source.github.io/phytomethods/topics/gwas-breeding/m06-topic-07/',
    waitFor: 'article, body',
    clipHeight: 820
  },
  {
    name: '04-method-detail.png',
    url: 'https://hao1006sy-source.github.io/phytomethods/methods/hifiasm/',
    waitFor: 'body',
    clipHeight: 820
  },
  {
    name: '05-knowledge-graph.png',
    url: 'https://hao1006sy-source.github.io/phytomethods/knowledge/',
    waitFor: 'svg, canvas, #knowledge-explorer, body',
    delay: 2500,
    clipHeight: 820
  },
  {
    name: '06-genome-hub.png',
    url: 'https://hao1006sy-source.github.io/phytomethods/genomes/',
    waitFor: 'body',
    clipHeight: 820
  }
];

async function run() {
  console.log('Launching browser...');
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browser = await chromium.launch({
    headless: true,
    executablePath: fs.existsSync(edgePath) ? edgePath : undefined
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 820 },
    deviceScaleFactor: 1.5
  });

  for (const item of pagesToCapture) {
    const page = await context.newPage();
    console.log(`Navigating to ${item.url}...`);
    try {
      await page.goto(item.url, { waitUntil: 'networkidle', timeout: 30000 });
      if (item.delay) {
        await page.waitForTimeout(item.delay);
      }
      const outPath = path.join(targetDir, item.name);
      await page.screenshot({
        path: outPath,
        clip: { x: 0, y: 0, width: 1280, height: item.clipHeight || 820 }
      });
      console.log(`Saved screenshot: ${outPath} (${fs.statSync(outPath).size} bytes)`);
    } catch (err) {
      console.error(`Failed to capture ${item.url}:`, err.message);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log('All screenshots captured successfully!');
}

run().catch(console.error);
