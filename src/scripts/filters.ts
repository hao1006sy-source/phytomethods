/**
 * PhytoMethods 文献索引页面交互与多维筛选控制器
 * 支持：
 * 1. 关键词模糊检索 (标题、作者、DOI)
 * 2. 多维度筛选：年份、文献类型、研究领域、相关工具、物种
 * 3. 结果数量动态统计与空状态友好提示 (安全 DOM)
 * 4. 完整的 URL 状态双向同步与恢复 (支持分享、刷新与浏览器前进/后退)
 */

function initPapersFilters(): void {
  const form = document.querySelector<HTMLFormElement>('#filters');
  const items = [...document.querySelectorAll<HTMLElement>('.filter-item')];
  const out = document.querySelector<HTMLElement>('#filter-count');
  if (!form || items.length === 0) return;

  const targetForm: HTMLFormElement = form;
  const totalCount = items.length;

  function syncUrl(): void {
    const params = new URLSearchParams();
    const values = new FormData(targetForm);

    for (const [key, raw] of values.entries()) {
      const val = String(raw).trim();
      if (val) {
        params.set(key, val);
      }
    }

    const qs = params.toString();
    const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    if (window.location.search !== (qs ? `?${qs}` : '')) {
      window.history.replaceState({}, '', newUrl);
    }
  }

  function update(): void {
    const values = new FormData(targetForm);
    let matchCount = 0;

    for (const item of items) {
      let visible = true;
      for (const [key, raw] of values.entries()) {
        const value = String(raw).trim().toLowerCase();
        if (!value) continue;
        const actual = (item.dataset[key] ?? '').toLowerCase();
        if (key === 'q') {
          if (!actual.includes(value)) {
            visible = false;
            break;
          }
        } else {
          if (!actual.split('|').includes(value)) {
            visible = false;
            break;
          }
        }
      }
      item.hidden = !visible;
      if (visible) matchCount++;
    }

    if (out) {
      out.textContent = '';
      if (matchCount === 0) {
        out.textContent = '没有符合条件的结果。';
      } else {
        const prefix = document.createTextNode('找到 ');
        const countStrong = document.createElement('strong');
        countStrong.textContent = String(matchCount);
        const suffix = document.createTextNode(` 条结果（共 ${totalCount} 篇文献）`);
        out.append(prefix, countStrong, suffix);
      }
    }

    syncUrl();
  }

  function restoreFromUrl(): void {
    const params = new URLSearchParams(window.location.search);
    for (const [key, value] of params.entries()) {
      const control = form?.elements.namedItem(key);
      if (control instanceof HTMLInputElement || control instanceof HTMLSelectElement) {
        control.value = value;
      }
    }
  }

  form.addEventListener('input', update);
  form.addEventListener('change', update);
  form.addEventListener('reset', () => {
    setTimeout(() => {
      update();
    }, 0);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    update();
  });

  for (const control of document.querySelectorAll<HTMLInputElement>('[form="filters"]')) {
    control.addEventListener('input', update);
    control.addEventListener('change', update);
  }

  window.addEventListener('popstate', () => {
    restoreFromUrl();
    update();
  });

  // 页面初次加载恢复 URL 参数并筛选
  restoreFromUrl();
  update();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPapersFilters);
} else {
  initPapersFilters();
}
