import { chromium } from 'playwright-core';

const previewBase = (process.env.PHYTOMETHODS_PREVIEW_BASE ?? 'http://127.0.0.1:4321/phytomethods').replace(/\/+$/, '');
const topicUrl = topic => `${previewBase}/topics/pangenomics-structural-variation/${topic}/`;
const context = await chromium.launchPersistentContext('node_modules/.cache/figure-dialog-browser-profile', {
  headless: true,
  executablePath: process.env.PHYTOMETHODS_EDGE_PATH ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
});

try {
  const keyboardPage = await context.newPage();
  await keyboardPage.setViewportSize({ width: 375, height: 900 });
  for (const [topic, selector] of [
    ['m03-topic-02', '.katex-display'],
    ['m03-topic-02', '.stage'],
    ['m03-topic-05', '.table-scroll'],
    ['m03-topic-05', '.graph-stage'],
    ['m03-topic-06', '.katex-display'],
  ]) {
    const response = await keyboardPage.goto(topicUrl(topic));
    if (response?.status() !== 200) throw new Error(`${topic} returned ${response?.status()}`);
    const regions = keyboardPage.locator(selector);
    const count = await regions.count();
    if (!count) throw new Error(`${topic} has no region for ${selector}`);
    let region;
    for (let index = 0; index < await regions.count(); index += 1) {
      const candidate = regions.nth(index);
      if (await candidate.evaluate(element => element.scrollWidth > element.clientWidth + 1)) {
        region = candidate;
        break;
      }
    }
    if (!region) {
      console.log(`${topic} ${selector}: fits at 375px; no horizontal scroll required`);
      continue;
    }
    if (await region.getAttribute('tabindex') !== '0') {
      const metrics = await region.evaluate(element => ({
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
        overflowX: getComputedStyle(element).overflowX,
        html: element.outerHTML.slice(0, 300),
      }));
      throw new Error(`${topic} ${selector} is not keyboard focusable: ${JSON.stringify(metrics)}`);
    }
    if (!(await region.getAttribute('aria-label'))) throw new Error(`${topic} ${selector} has no accessible label`);
    await region.focus();
    const start = await region.evaluate(element => element.scrollLeft);
    await keyboardPage.keyboard.press('ArrowRight');
    const moved = await region.evaluate(element => element.scrollLeft);
    if (moved <= start) throw new Error(`${topic} ${selector} did not respond to ArrowRight`);
    await keyboardPage.keyboard.press('Home');
    if (await region.evaluate(element => element.scrollLeft) !== 0) throw new Error(`${topic} ${selector} did not respond to Home`);
    await keyboardPage.keyboard.press('End');
    const end = await region.evaluate(element => element.scrollLeft);
    const maximum = await region.evaluate(element => element.scrollWidth - element.clientWidth);
    if (end < maximum - 1) throw new Error(`${topic} ${selector} did not respond to End`);
    await keyboardPage.keyboard.press('ArrowLeft');
    if (await region.evaluate(element => element.scrollLeft) >= end) throw new Error(`${topic} ${selector} did not respond to ArrowLeft`);
  }
  await keyboardPage.goto(topicUrl('m03-topic-06'));
  const mappingA = keyboardPage.locator('#mapping-a');
  const mappingB = keyboardPage.locator('#mapping-b');
  await keyboardPage.getByRole('button', { name: '读段 CGTT' }).click();
  if (await keyboardPage.getByRole('button', { name: '读段 CGTT' }).getAttribute('aria-pressed') !== 'true') {
    throw new Error('Graph mapping demo did not mark the selected path button');
  }
  if (!(await mappingA.isVisible()) || await mappingA.evaluate(element => element.classList.contains('muted'))) {
    throw new Error('Graph mapping demo did not retain the matching path');
  }
  if (!await mappingB.evaluate(element => element.classList.contains('muted'))) {
    throw new Error('Graph mapping demo did not distinguish the unsupported path');
  }
  if (!(await keyboardPage.locator('#mapping-explanation').innerText()).includes('没有该精确子串')) {
    throw new Error('Graph mapping demo did not explain the exact-substring teaching rule');
  }
  await keyboardPage.getByRole('button', { name: '读段 CCAT' }).click();
  if (await keyboardPage.getByRole('button', { name: '读段 CCAT' }).getAttribute('aria-pressed') !== 'true') {
    throw new Error('Graph mapping demo did not update selected path state');
  }
  if (!await mappingA.evaluate(element => element.classList.contains('muted')) || await mappingB.evaluate(element => element.classList.contains('muted'))) {
    throw new Error('Graph mapping demo did not distinguish the alternate path');
  }
  await keyboardPage.getByRole('button', { name: '读段 AC' }).click();
  if (await mappingA.evaluate(element => element.classList.contains('muted')) || await mappingB.evaluate(element => element.classList.contains('muted'))) {
    throw new Error('Graph mapping demo did not show the shared read on both paths');
  }
  await keyboardPage.getByRole('button', { name: '重置', exact: true }).click();
  if (await mappingA.evaluate(element => element.classList.contains('muted')) || await mappingB.evaluate(element => element.classList.contains('muted'))) {
    throw new Error('Graph mapping demo reset did not restore both paths');
  }
  console.log('375px: M03-06 exact-substring path support and reset passed');
  await keyboardPage.goto(topicUrl('m03-topic-02'));
  const resizeRegion = keyboardPage.locator('.stage');
  await resizeRegion.waitFor();
  await keyboardPage.setViewportSize({ width: 375, height: 900 });
  await keyboardPage.waitForFunction(() => document.querySelector('.stage')?.getAttribute('tabindex') === '0');
  if (await resizeRegion.getAttribute('tabindex') !== '0') throw new Error('scroll region not enabled after resize to 375px');
  await keyboardPage.setViewportSize({ width: 1440, height: 900 });
  await keyboardPage.waitForTimeout(100);
  const desktopOverflow = await resizeRegion.evaluate(element => element.scrollWidth > element.clientWidth + 1);
  if (!desktopOverflow && await resizeRegion.getAttribute('tabindex') === '0') throw new Error('scroll region remained in tab order after overflow cleared');
  await keyboardPage.setViewportSize({ width: 375, height: 900 });
  await keyboardPage.waitForFunction(() => document.querySelector('.stage')?.getAttribute('tabindex') === '0');
  await keyboardPage.waitForTimeout(100);
  if (await resizeRegion.getAttribute('tabindex') !== '0') throw new Error('scroll region was not restored after resizing to 375px');
  console.log('375px: overflowing M03 equations, table and figures scroll with ArrowLeft/ArrowRight/Home/End');
  await keyboardPage.close();

  for (const width of [375, 768, 1280, 1440]) {
    const page = await context.newPage();
    await page.setViewportSize({ width, height: 900 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));

    for (const topic of ['m03-topic-01', 'm03-topic-04', 'm03-topic-05', 'm03-topic-07']) {
      const response = await page.goto(topicUrl(topic));
      if (response?.status() !== 200) throw new Error(`${topic} returned ${response?.status()}`);

      if (topic === 'm03-topic-04') {
        const diagram = page.locator('svg[aria-labelledby="pav-evidence-title pav-evidence-desc"]');
        if (await diagram.count() !== 1) throw new Error('M03-04 PAV evidence diagram is missing');
        if (!(await page.locator('#pav-evidence-desc').textContent()).includes('跨缺失区 reads')) {
          throw new Error('M03-04 PAV figure does not describe read evidence for supported absence');
        }
        if (!(await page.locator('.pav-evidence figcaption').innerText()).includes('均为模拟')) {
          throw new Error('M03-04 PAV figure does not identify its schematic data');
        }
        const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        if (pageWidth > width + 1) throw new Error(`M03-04 causes document horizontal overflow at ${width}px (${pageWidth}px)`);
        if (width === 375) {
          const region = page.locator('.pav-evidence__scroll');
          const sizes = await region.evaluate(element => ({client:element.clientWidth,scroll:element.scrollWidth,tabindex:element.getAttribute('tabindex'),label:element.getAttribute('aria-label')}));
          if (sizes.scroll <= sizes.client + 1 || sizes.tabindex !== '0' || !sizes.label?.includes('方向键')) {
            throw new Error(`M03-04 PAV diagram is not keyboard-scrollable at 375px: ${JSON.stringify(sizes)}`);
          }
          await region.focus();
          await page.keyboard.press('End');
          if (await region.evaluate(element => element.scrollLeft) <= 0) throw new Error('M03-04 PAV diagram did not respond to End');
          await page.keyboard.press('Home');
          if (await region.evaluate(element => element.scrollLeft) !== 0) throw new Error('M03-04 PAV diagram did not respond to Home');
        }
      }

      if (topic === 'm03-topic-07') {
        const route = page.locator('svg[aria-labelledby="workflow-title workflow-desc"]');
        if (await route.locator('[data-arrowhead="workflow"]').count() !== 1) {
          throw new Error('M03-07 workflow does not expose its four directional arrowheads');
        }
        const arrowheads = await route.locator('[data-arrowhead="workflow"]').evaluate(element => {
          const path = element;
          return path.getAttribute('d')?.match(/z/gi)?.length ?? 0;
        });
        if (arrowheads !== 4) throw new Error(`M03-07 workflow expected 4 arrowheads; received ${arrowheads}`);
        if (!(await page.locator('#workflow-desc').textContent()).includes('分支或迭代')) {
          throw new Error('M03-07 workflow does not explain that study designs can branch or iterate');
        }
        if (width === 375) {
          const tableRegion = page.locator('.table-scroll--wide');
          const tableMetrics = await tableRegion.evaluate(element => ({client:element.clientWidth,scroll:element.scrollWidth,tabindex:element.getAttribute('tabindex'),label:element.getAttribute('aria-label')}));
          if (tableMetrics.scroll <= tableMetrics.client + 1 || tableMetrics.tabindex !== '0') {
            throw new Error(`M03-07 wide table is not keyboard-scrollable at 375px: ${JSON.stringify(tableMetrics)}`);
          }
          if (!tableMetrics.label?.includes('可使用方向键横向滚动查看')) {
            throw new Error(`M03-07 table scroll region has no useful accessible label: ${JSON.stringify(tableMetrics)}`);
          }
          const visualCue = await tableRegion.evaluate(element => getComputedStyle(element, '::before').content);
          if (!visualCue.includes('表格可横向滑动查看')) {
            throw new Error(`M03-07 wide table has no visible mobile scroll cue: ${visualCue}`);
          }
          await tableRegion.focus();
          await page.keyboard.press('End');
          if (await tableRegion.evaluate(element => element.scrollLeft) <= 0) {
            throw new Error('M03-07 wide table did not respond to End at 375px');
          }
          await page.keyboard.press('Home');
          if (await tableRegion.evaluate(element => element.scrollLeft) !== 0) {
            throw new Error('M03-07 wide table did not respond to Home at 375px');
          }
        }
      }

      if (topic === 'm03-topic-05') {
        const sampleA = page.locator('#sample-a');
        const sampleB = page.locator('#sample-b');
        await page.getByRole('button', { name: '样本甲', exact: true }).click();
        if (await sampleA.getAttribute('opacity') !== '1' || await sampleB.getAttribute('opacity') !== '0.08') {
          throw new Error('Pangenome demo did not isolate sample A');
        }
        if (await page.locator('#graph-explanation').innerText() !== '样本甲路径：A–B–D。B 是该路径中的示意序列片段。') {
          throw new Error('Pangenome demo did not explain sample A');
        }
        await page.getByRole('button', { name: '重置', exact: true }).click();
        if (await sampleA.getAttribute('opacity') !== '1' || await sampleB.getAttribute('opacity') !== '1') {
          throw new Error('Pangenome demo reset did not restore both sample paths');
        }
        console.log(`${width}px: M03-05 sample selection, explanation and reset passed`);
      }

      const trigger = page.getByRole('button', { name: '放大图解' }).first();
      const expectedDialogName = (await page.locator('figure svg title').first().textContent())?.trim();
      if (!expectedDialogName) throw new Error(`${topic} has no SVG title for the dialog name`);
      await trigger.focus();
      await page.keyboard.press('Enter');

      const dialog = page.getByRole('dialog', { name: expectedDialogName });
      const dialogName = await dialog.getAttribute('aria-labelledby');
      if (!dialogName) throw new Error(`${topic} dialog has no accessible name at ${width}px`);
      await page.getByRole('button', { name: '关闭放大图解' }).waitFor({ state: 'visible' });
      if (!(await page.locator('.figure-dialog h2').innerText()).trim()) throw new Error(`${topic} dialog has no heading`);

      const activeTag = await page.evaluate(() => document.activeElement?.textContent?.trim());
      if (activeTag !== '关闭') throw new Error(`${topic} initial focus is not the close button`);

      const duplicateIds = await page.evaluate(() => {
        const ids = [...document.querySelectorAll('[id]')].map(element => element.id);
        return ids.filter((id, index) => ids.indexOf(id) !== index);
      });
      if (duplicateIds.length) throw new Error(`${topic} has duplicate IDs in zoom dialog: ${duplicateIds.join(', ')}`);

      const size = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
      if (size[0] > size[1] + 1) throw new Error(`${topic} document overflow at ${width}px: ${size}`);

      const visual = page.locator('.figure-dialog-visual');
      const scrollBefore = await visual.evaluate(element => element.scrollLeft);
      await visual.focus();
      const focusState = await visual.evaluate(element => ({active: element === document.activeElement, overflowX: getComputedStyle(element).overflowX, clientWidth: element.clientWidth, scrollWidth: element.scrollWidth}));
      await page.keyboard.press('ArrowRight');
      const scrollAfter = await visual.evaluate(element => element.scrollLeft);
      if (await visual.evaluate(element => element.scrollWidth > element.clientWidth + 1) && scrollAfter <= scrollBefore) {
        throw new Error(`${topic} zoomed SVG did not scroll with the keyboard at ${width}px: ${JSON.stringify({...focusState, scrollBefore, scrollAfter})}`);
      }

      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'detached' });
      if (!(await trigger.evaluate(element => element === document.activeElement))) throw new Error(`${topic} did not restore trigger focus after Escape`);

      await trigger.click();
      await page.getByRole('button', { name: '关闭放大图解' }).click();
      if (!(await trigger.evaluate(element => element === document.activeElement))) throw new Error(`${topic} did not restore trigger focus after close`);
    }

    if (errors.length) throw new Error(errors.join('; '));
    console.log(`${width}px: M03 diagram zoom keyboard, name, focus, SVG IDs, close and overflow checks passed`);
    await page.close();
  }
} finally {
  await context.close();
}
