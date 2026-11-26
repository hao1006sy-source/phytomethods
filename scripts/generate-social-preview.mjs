import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1280px;
    height: 640px;
    background: linear-gradient(135deg, #093322 0%, #0d4a34 50%, #135d42 100%);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #ffffff;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 60px 80px;
    position: relative;
    overflow: hidden;
  }

  /* Decorative Background SVG / Grid */
  .bg-grid {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    opacity: 0.08;
    background-image: 
      linear-gradient(#ffffff 1px, transparent 1px),
      linear-gradient(90deg, #ffffff 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
  }

  .bg-dna {
    position: absolute;
    right: -40px;
    top: -30px;
    width: 580px;
    height: 700px;
    opacity: 0.12;
    pointer-events: none;
  }

  /* Header Brand */
  .header-brand {
    display: flex;
    align-items: center;
    gap: 20px;
    z-index: 2;
  }

  .brand-logo {
    width: 72px;
    height: 72px;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }

  .brand-title {
    font-size: 52px;
    font-weight: 800;
    letter-spacing: -1.2px;
    color: #ffffff;
    display: flex;
    align-items: baseline;
    gap: 12px;
  }

  .brand-tag {
    font-size: 16px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    background: rgba(146, 201, 84, 0.2);
    color: #9fe262;
    border: 1px solid rgba(146, 201, 84, 0.4);
    padding: 4px 12px;
    border-radius: 20px;
  }

  /* Main Slogan & Description */
  .main-content {
    z-index: 2;
    max-width: 960px;
    margin-top: 10px;
  }

  .slogan {
    font-size: 34px;
    font-weight: 700;
    line-height: 1.25;
    color: #f0fdf4;
    margin-bottom: 16px;
    letter-spacing: -0.5px;
  }

  .subtitle {
    font-size: 20px;
    font-weight: 400;
    line-height: 1.5;
    color: #cbd5e1;
    margin-bottom: 28px;
  }

  /* Metric Chips */
  .metrics-row {
    display: flex;
    gap: 16px;
    z-index: 2;
  }

  .metric-card {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 14px;
    padding: 12px 20px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .metric-val {
    font-size: 24px;
    font-weight: 800;
    color: #86efac;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }

  .metric-label {
    font-size: 13px;
    font-weight: 500;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Footer bar */
  .footer-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
    padding-top: 20px;
    font-size: 15px;
    color: #94a3b8;
    z-index: 2;
  }

  .url-badge {
    font-family: ui-monospace, monospace;
    color: #6ee7b7;
    background: rgba(16, 185, 129, 0.1);
    padding: 6px 14px;
    border-radius: 8px;
    border: 1px solid rgba(16, 185, 129, 0.25);
  }
</style>
</head>
<body>
  <div class="bg-grid"></div>

  <!-- Decorative Botanical & Graph DNA SVG -->
  <svg class="bg-dna" viewBox="0 0 500 600" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 50 Q 250 150 450 50 T 450 300 T 50 450 T 450 550" stroke="#86efac" stroke-width="2" stroke-dasharray="8 6"/>
    <path d="M450 50 Q 250 150 50 50 T 50 300 T 450 450 T 50 550" stroke="#92c954" stroke-width="2" stroke-dasharray="8 6"/>
    <circle cx="150" cy="100" r="12" fill="#86efac"/>
    <circle cx="350" cy="100" r="10" fill="#92c954"/>
    <circle cx="250" cy="200" r="16" fill="#34d399"/>
    <circle cx="150" cy="300" r="12" fill="#86efac"/>
    <circle cx="350" cy="300" r="14" fill="#92c954"/>
    <circle cx="250" cy="400" r="18" fill="#10b981"/>
    <line x1="150" y1="100" x2="350" y2="100" stroke="#86efac" stroke-width="3"/>
    <line x1="150" y1="300" x2="350" y2="300" stroke="#92c954" stroke-width="3"/>
  </svg>

  <div class="header-brand">
    <div class="brand-logo">
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 38V18C20 9 25 4 35 4C37 15 31 22 22 24" fill="#92c954" stroke="#ffffff" stroke-width="1.8"/>
        <path d="M21 36C13 34 8 28 9 17C17 18 22 25 21 34" fill="#47a365" stroke="#ffffff" stroke-width="1.8"/>
      </svg>
    </div>
    <div class="brand-title">
      PhytoMethods
      <span class="brand-tag">v2.4 stable</span>
    </div>
  </div>

  <div class="main-content">
    <div class="slogan">
      A Scientific Knowledge Base for Plant Genomics & Bioinformatics
    </div>
    <div class="subtitle">
      Integrating mathematical models, computational algorithms, traceable scientific literature, validated tutorials, and knowledge graphs for plant sciences.
    </div>
  </div>

  <div class="metrics-row">
    <div class="metric-card">
      <span class="metric-val">9</span>
      <span class="metric-label">Domains</span>
    </div>
    <div class="metric-card">
      <span class="metric-val">63</span>
      <span class="metric-label">Topics</span>
    </div>
    <div class="metric-card">
      <span class="metric-val">59</span>
      <span class="metric-label">Methods</span>
    </div>
    <div class="metric-card">
      <span class="metric-val">130</span>
      <span class="metric-label">Papers</span>
    </div>
    <div class="metric-card">
      <span class="metric-val">10</span>
      <span class="metric-label">Tutorials</span>
    </div>
    <div class="metric-card">
      <span class="metric-val">801</span>
      <span class="metric-label">Evidence Records</span>
    </div>
  </div>

  <div class="footer-bar">
    <div>Non-Profit · Open Access · Evidence-Based Scientific Reference</div>
    <div class="url-badge">hao1006sy-source.github.io/phytomethods</div>
  </div>
</body>
</html>`;

async function renderSocialPreview() {
  const edgePath = 'C:\\\\Program Files (x86)\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe';
  const browser = await chromium.launch({
    headless: true,
    executablePath: fs.existsSync(edgePath) ? edgePath : undefined
  });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 640 },
    deviceScaleFactor: 2
  });
  await page.setContent(htmlContent);
  await page.waitForTimeout(500);

  const outDir = path.resolve('docs/assets/readme');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'social-preview.png');
  await page.screenshot({ path: outPath });
  console.log('Social preview image generated at:', outPath, 'size:', fs.statSync(outPath).size);
  await browser.close();
}

renderSocialPreview().catch(console.error);
