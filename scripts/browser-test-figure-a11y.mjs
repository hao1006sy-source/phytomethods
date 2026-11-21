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
    ['m03-topic-05', 'table'],
    ['m03-topic-05', '.graph-stage'],
    ['m03-topic-06', '.katex-display'],
  ]) {
    const response = await keyboardPage.goto(topicUrl(topic));
    if (response?.status() !== 200) throw new Error(`${topic} returned ${response?.status()}`);
    await keyboardPage.waitForFunction(selector => [...document.querySelectorAll(selector)].some(element =>
      element.scrollWidth > element.clientWidth + 1 && element.getAttribute('tabindex') === '0'), selector);
    const regions = keyboardPage.locator(selector);
    let region;
    for (let index = 0; index < await regions.count(); index += 1) {
      const candidate = regions.nth(index);
      if (await candidate.evaluate(element => element.scrollWidth > element.clientWidth + 1 && element.getAttribute('tabindex') === '0')) {
        region = candidate;
        break;
      }
    }
    if (!region) throw new Error(`${topic} has no overflowing region for ${selector} at 375px`);
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

    for (const topic of ['m03-topic-01', 'm03-topic-07']) {
      const response = await page.goto(topicUrl(topic));
      if (response?.status() !== 200) throw new Error(`${topic} returned ${response?.status()}`);

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
