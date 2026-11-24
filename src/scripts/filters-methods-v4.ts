/**
 * PhytoMethods 算法与工具目录 V4 前端交互与检索控制器 (Filters Controller V4)
 * 核心功能：
 * 1. 实时多字段模糊搜索 (支持名称、摘要、原理、数据类型，不区分大小写)
 * 2. 四重维度精确筛选 (研究领域、关联专题、算法原理、输入数据)
 * 3. 领域与专题动态联动 (切换领域自动限定专题候选集，不匹配时清除专题条件)
 * 4. 已选条件标签栏 (Active Filters Bar，单独清除与一键清空)
 * 5. 排序控制 (A-Z 与 Z-A 确定性排序，序号自适应)
 * 6. 完整 URL 状态保持 (支持 pushState/popState，前进/后退、分享链接及无异常刷新)
 * 7. 移动端筛选折叠展开与无横向溢出控制
 * 8. 动态计算结果数量与空状态自适应提示
 */

export function initMethodsFilters(): void {
  const searchInput = document.querySelector<HTMLInputElement>('#method-search');
  const searchClearBtn = document.querySelector<HTMLButtonElement>('#search-clear');
  const domainSelect = document.querySelector<HTMLSelectElement>('#filter-domain');
  const topicSelect = document.querySelector<HTMLSelectElement>('#filter-topic');
  const principleSelect = document.querySelector<HTMLSelectElement>('#filter-principle');
  const dataSelect = document.querySelector<HTMLSelectElement>('#filter-data');
  const sortSelect = document.querySelector<HTMLSelectElement>('#sort-order');
  const filterResetBtn = document.querySelector<HTMLButtonElement>('#filter-reset');
  const emptyResetBtn = document.querySelector<HTMLButtonElement>('#empty-reset');
  
  const mobileToggleBtn = document.querySelector<HTMLButtonElement>('#mobile-filter-toggle');
  const filterSidebar = document.querySelector<HTMLElement>('#filter-sidebar');
  const activeTagsBar = document.querySelector<HTMLElement>('#active-filters-bar');
  const activeTagsList = document.querySelector<HTMLElement>('#active-tags-list');
  const clearAllTagsBtn = document.querySelector<HTMLButtonElement>('#clear-all-tags');
  
  const resultsCountEl = document.querySelector<HTMLElement>('#results-count');
  const listContainer = document.querySelector<HTMLElement>('#methods-list');
  const emptyStateEl = document.querySelector<HTMLElement>('#empty-state');
  
  const items = [...document.querySelectorAll<HTMLElement>('.method-row')];
  if (!listContainer || items.length === 0) return;
  const listEl = listContainer;

  const totalCount = items.length;

  // 缓存全量专题选项
  const allTopicOptions: { value: string; text: string; domain: string }[] = [];
  if (topicSelect) {
    for (let i = 1; i < topicSelect.options.length; i++) {
      const opt = topicSelect.options[i];
      allTopicOptions.push({
        value: opt.value,
        text: opt.text,
        domain: opt.dataset.domain || ''
      });
    }
  }

  // 1. 领域与专题联动
  function updateTopicOptions(selectedDomain: string): void {
    if (!topicSelect) return;
    const currentTopic = topicSelect.value;
    topicSelect.innerHTML = '<option value="">全部专题</option>';
    
    let topicStillValid = false;
    for (const opt of allTopicOptions) {
      if (!selectedDomain || opt.domain === selectedDomain) {
        const optionEl = document.createElement('option');
        optionEl.value = opt.value;
        optionEl.textContent = opt.text;
        optionEl.dataset.domain = opt.domain;
        if (opt.value === currentTopic) {
          optionEl.selected = true;
          topicStillValid = true;
        }
        topicSelect.appendChild(optionEl);
      }
    }

    if (currentTopic && !topicStillValid) {
      topicSelect.value = '';
    }
  }

  // 2. 渲染已选条件标签
  function renderActiveTags(): void {
    if (!activeTagsBar || !activeTagsList) return;
    activeTagsList.innerHTML = '';
    const tags: { key: string; label: string; value: string }[] = [];

    const q = (searchInput?.value || '').trim();
    if (q) {
      tags.push({ key: 'q', label: `搜索: ${q}`, value: q });
    }

    if (domainSelect && domainSelect.value) {
      const text = domainSelect.options[domainSelect.selectedIndex]?.text || domainSelect.value;
      tags.push({ key: 'domain', label: `领域: ${text}`, value: domainSelect.value });
    }

    if (topicSelect && topicSelect.value) {
      const text = topicSelect.options[topicSelect.selectedIndex]?.text || topicSelect.value;
      tags.push({ key: 'topic', label: `专题: ${text}`, value: topicSelect.value });
    }

    if (principleSelect && principleSelect.value) {
      const text = principleSelect.options[principleSelect.selectedIndex]?.text || principleSelect.value;
      tags.push({ key: 'principle', label: `原理: ${text}`, value: principleSelect.value });
    }

    if (dataSelect && dataSelect.value) {
      const text = dataSelect.options[dataSelect.selectedIndex]?.text || dataSelect.value;
      tags.push({ key: 'data', label: `数据: ${text}`, value: dataSelect.value });
    }

    if (tags.length === 0) {
      activeTagsBar.style.display = 'none';
      return;
    }

    activeTagsBar.style.display = 'flex';
    for (const tag of tags) {
      const tagEl = document.createElement('span');
      tagEl.className = 'filter-tag';

      const labelText = document.createTextNode(`${tag.label} `);
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'filter-tag-remove';
      removeBtn.dataset.key = tag.key;
      removeBtn.setAttribute('aria-label', `移除 ${tag.label}`);
      removeBtn.textContent = '×';

      tagEl.appendChild(labelText);
      tagEl.appendChild(removeBtn);
      activeTagsList.appendChild(tagEl);
    }
  }

  // 3. 同步到 URL
  function syncUrl(push = false): void {
    const params = new URLSearchParams();
    const q = (searchInput?.value || '').trim();
    if (q) params.set('q', q);

    if (domainSelect && domainSelect.value) params.set('domain', domainSelect.value);
    if (topicSelect && topicSelect.value) params.set('topic', topicSelect.value);
    if (principleSelect && principleSelect.value) params.set('principle', principleSelect.value);
    if (dataSelect && dataSelect.value) params.set('data', dataSelect.value);
    if (sortSelect && sortSelect.value && sortSelect.value !== 'name-asc') params.set('sort', sortSelect.value);

    const qs = params.toString();
    const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    
    if (push) {
      if (window.location.search !== (qs ? `?${qs}` : '')) {
        window.history.pushState({}, '', newUrl);
      }
    } else {
      window.history.replaceState({}, '', newUrl);
    }
  }

  // 4. 执行过滤与排序
  function applyFilters(): void {
    const q = (searchInput?.value || '').trim().toLowerCase();
    const domain = domainSelect?.value || '';
    const topic = topicSelect?.value || '';
    const principle = principleSelect?.value || '';
    const data = dataSelect?.value || '';
    const sort = sortSelect?.value || 'name-asc';

    if (searchClearBtn) {
      if (q) {
        searchClearBtn.classList.add('is-active');
      } else {
        searchClearBtn.classList.remove('is-active');
      }
    }

    let matchCount = 0;
    const visibleItems: HTMLElement[] = [];

    for (const item of items) {
      const itemQ = (item.dataset.q || '').toLowerCase();
      const itemDomains = (item.dataset.domain || '').split('|');
      const itemTopics = (item.dataset.topic || '').split('|');
      const itemPrinciples = (item.dataset.principle || '').split('|');
      const itemData = (item.dataset.data || '').split('|');

      let visible = true;

      if (q && !itemQ.includes(q)) {
        visible = false;
      }
      if (visible && domain && !itemDomains.includes(domain)) {
        visible = false;
      }
      if (visible && topic && !itemTopics.includes(topic)) {
        visible = false;
      }
      if (visible && principle && !itemPrinciples.includes(principle)) {
        visible = false;
      }
      if (visible && data && !itemData.includes(data)) {
        visible = false;
      }

      item.hidden = !visible;
      if (visible) {
        matchCount++;
        visibleItems.push(item);
      }
    }

    // 确定性排序：依据方法名称 name 升序或降序
    visibleItems.sort((a, b) => {
      const nameA = (a.dataset.name || '').toLowerCase();
      const nameB = (b.dataset.name || '').toLowerCase();
      if (sort === 'name-desc') {
        return nameB.localeCompare(nameA);
      }
      return nameA.localeCompare(nameB);
    });

    // 重新调整 DOM 顺序并刷新序号徽章
    visibleItems.forEach((item, idx) => {
      listEl.appendChild(item);
      const indexEl = item.querySelector('.col-index');
      if (indexEl) {
        indexEl.textContent = String(idx + 1).padStart(2, '0');
      }
    });

    // 更新结果统计 (安全 DOM 操作)
    if (resultsCountEl) {
      resultsCountEl.textContent = '';
      const prefixText = document.createTextNode('找到 ');
      const strongCount = document.createElement('strong');
      strongCount.textContent = String(matchCount);
      const suffixText = document.createTextNode(' 条结果 ');
      const totalSpan = document.createElement('span');
      totalSpan.style.color = '#668576';
      totalSpan.style.fontWeight = 'normal';
      totalSpan.textContent = `（共 ${totalCount} 条）`;
      resultsCountEl.append(prefixText, strongCount, suffixText, totalSpan);
    }

    // 空状态提示
    if (emptyStateEl) {
      if (matchCount === 0) {
        emptyStateEl.classList.add('is-visible');
        listEl.style.display = 'none';
      } else {
        emptyStateEl.classList.remove('is-visible');
        listEl.style.display = '';
      }
    }

    renderActiveTags();
  }

  // 5. 从 URL 恢复状态
  function restoreFromUrl(): void {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';
    const domain = params.get('domain') || '';
    const topic = params.get('topic') || '';
    const principle = params.get('principle') || '';
    const data = params.get('data') || '';
    const sort = params.get('sort') || 'name-asc';

    if (searchInput) searchInput.value = q;
    if (domainSelect) {
      domainSelect.value = domain;
      updateTopicOptions(domain);
    }
    if (topicSelect) topicSelect.value = topic;
    if (principleSelect) principleSelect.value = principle;
    if (dataSelect) dataSelect.value = data;
    if (sortSelect) sortSelect.value = sort;

    applyFilters();
  }

  // 6. 重置所有条件
  function resetAll(): void {
    if (searchInput) searchInput.value = '';
    if (domainSelect) {
      domainSelect.value = '';
      updateTopicOptions('');
    }
    if (topicSelect) topicSelect.value = '';
    if (principleSelect) principleSelect.value = '';
    if (dataSelect) dataSelect.value = '';
    if (sortSelect) sortSelect.value = 'name-asc';
    applyFilters();
    syncUrl(true);
  }

  // 移除单个标签
  function removeTag(key: string): void {
    if (key === 'q' && searchInput) searchInput.value = '';
    else if (key === 'domain' && domainSelect) {
      domainSelect.value = '';
      updateTopicOptions('');
    } else if (key === 'topic' && topicSelect) topicSelect.value = '';
    else if (key === 'principle' && principleSelect) principleSelect.value = '';
    else if (key === 'data' && dataSelect) dataSelect.value = '';
    applyFilters();
    syncUrl(true);
  }

  // 7. 事件绑定
  searchInput?.addEventListener('input', () => {
    applyFilters();
    syncUrl(true);
  });

  searchClearBtn?.addEventListener('click', () => {
    if (searchInput) {
      searchInput.value = '';
      searchInput.focus();
    }
    applyFilters();
    syncUrl(true);
  });

  domainSelect?.addEventListener('change', () => {
    if (domainSelect) {
      updateTopicOptions(domainSelect.value);
    }
    applyFilters();
    syncUrl(true);
  });

  topicSelect?.addEventListener('change', () => {
    applyFilters();
    syncUrl(true);
  });

  principleSelect?.addEventListener('change', () => {
    applyFilters();
    syncUrl(true);
  });

  dataSelect?.addEventListener('change', () => {
    applyFilters();
    syncUrl(true);
  });

  sortSelect?.addEventListener('change', () => {
    applyFilters();
    syncUrl(true);
  });

  filterResetBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    resetAll();
  });

  emptyResetBtn?.addEventListener('click', () => {
    resetAll();
  });

  clearAllTagsBtn?.addEventListener('click', () => {
    resetAll();
  });

  activeTagsList?.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const btn = target.closest<HTMLButtonElement>('.filter-tag-remove');
    if (btn && btn.dataset.key) {
      removeTag(btn.dataset.key);
    }
  });

  // 移动端折叠面板切换
  mobileToggleBtn?.addEventListener('click', () => {
    if (!filterSidebar) return;
    const isExpanded = filterSidebar.classList.contains('is-expanded');
    if (isExpanded) {
      filterSidebar.classList.remove('is-expanded');
      mobileToggleBtn.setAttribute('aria-expanded', 'false');
      const textNode = mobileToggleBtn.querySelector('.toggle-text');
      if (textNode) textNode.textContent = '展开筛选条件';
    } else {
      filterSidebar.classList.add('is-expanded');
      mobileToggleBtn.setAttribute('aria-expanded', 'true');
      const textNode = mobileToggleBtn.querySelector('.toggle-text');
      if (textNode) textNode.textContent = '收起筛选条件';
    }
  });

  // 浏览器前进/后退响应
  window.addEventListener('popstate', () => {
    restoreFromUrl();
  });

  // 初始化
  restoreFromUrl();
}

// 自动在 DOMContentLoaded 或脚本运行后执行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMethodsFilters);
} else {
  initMethodsFilters();
}
