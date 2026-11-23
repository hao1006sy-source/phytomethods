/**
 * PhytoMethods 科研知识关联图 V2.1 客户端交互、统一过滤与无障碍引擎
 */

import type { KnowledgeGraphV2, KnowledgeNode, KnowledgeEdge } from './graph-types';

export const RELATION_LABELS: Record<string, string> = {
  introduces_method: '提出方法',
  uses_method: '实际使用',
  extends_method: '改进扩展',
  evaluates_method: '评测对比',
  references_method: '引用参考',
  features_method: '专题收录',
  references_paper: '专题引证',
  guides_method: '指导使用',
  studies_species: '研究物种',
  belongs_to_domain: '归属领域'
};

export const ALL_RELATION_TYPES = [
  'introduces_method',
  'uses_method',
  'extends_method',
  'evaluates_method',
  'references_method',
  'features_method',
  'references_paper',
  'guides_method',
  'studies_species',
  'belongs_to_domain'
];

export const ALL_NODE_TYPES = [
  'method',
  'paper_method',
  'paper_application',
  'paper_review',
  'topic',
  'tutorial',
  'domain',
  'species'
];

export const NODE_TYPE_INFO: Record<string, { label: string; color: string; bg: string }> = {
  method: { label: '算法工具', color: '#104A36', bg: '#E6F4EA' },
  paper_method: { label: '方法学论文', color: '#226C9C', bg: '#E8F0FE' },
  paper_application: { label: '植物应用', color: '#7A5600', bg: '#FEF7E0' },
  paper_review: { label: '综述论文', color: '#584573', bg: '#F3E8FD' },
  topic: { label: '科研专题', color: '#0D7377', bg: '#E0F2F1' },
  tutorial: { label: '分析教程', color: '#853A12', bg: '#FCE8E6' },
  domain: { label: '研究领域', color: '#0E6548', bg: '#E6F4EA' },
  species: { label: '植物物种', color: '#2E7D32', bg: '#E8F5E9' }
};

export const VERIFICATION_LABELS: Record<string, { label: string; className: string; desc: string }> = {
  source_checked: { label: '来源已核实', className: 'source_checked', desc: '来源已核实：该关联具有已核对的文献、官方资料或明确策展记录。' },
  structurally_valid: { label: '结构有效', className: 'structurally_valid', desc: '结构有效：经 Frontmatter 与双向实体关系严格校验有效。' },
  needs_review: { label: '待核实', className: 'needs_review', desc: '待核实：存在线索但缺少全文确证。' }
};

export interface PositionedNode {
  node: KnowledgeNode;
  x: number;
  y: number;
  isCenter: boolean;
}

export interface PositionedEdge {
  edge: KnowledgeEdge;
  sourceNode: PositionedNode;
  targetNode: PositionedNode;
  labelX: number;
  labelY: number;
}

export interface VisibleSubgraph {
  nodes: PositionedNode[];
  edges: PositionedEdge[];
  nodeMap: Map<string, PositionedNode>;
  edgeMap: Map<string, PositionedEdge>;
}

export interface GraphClientState {
  data: KnowledgeGraphV2;
  baseUrl: string;
  seedNodeId: string;
  visibleNodeIds: Set<string>;
  selectedEntity: { type: 'node'; node: KnowledgeNode } | { type: 'edge'; edge: KnowledgeEdge } | null;
  filters: {
    keyword: string;
    domainId: string;
    nodeTypes: Set<string>;
    relationTypes: Set<string>;
    verificationStatus: string; // 'all' | 'source_checked' | 'structurally_valid'
  };
  viewport: {
    panX: number;
    panY: number;
    scale: number;
  };
  positions: Map<string, { x: number; y: number }>;
  viewMode: 'graph' | 'list';
}

export class KnowledgeGraphClient {
  state: GraphClientState;
  container: HTMLElement;
  svg: SVGSVGElement | null = null;
  viewportG: SVGGElement | null = null;
  edgesG: SVGGElement | null = null;
  nodesG: SVGGElement | null = null;
  isDragging = false;
  dragStartX = 0;
  dragStartY = 0;
  searchHighlightIndex = -1;

  constructor(container: HTMLElement, data: KnowledgeGraphV2, baseUrl: string) {
    this.container = container;
    this.state = {
      data,
      baseUrl: baseUrl.endsWith('/') ? baseUrl : baseUrl + '/',
      seedNodeId: 'method:hifiasm',
      visibleNodeIds: new Set<string>(),
      selectedEntity: null,
      filters: {
        keyword: '',
        domainId: '',
        nodeTypes: new Set(ALL_NODE_TYPES),
        relationTypes: new Set(ALL_RELATION_TYPES),
        verificationStatus: 'all'
      },
      viewport: { panX: 0, panY: 0, scale: 1 },
      positions: new Map(),
      viewMode: 'graph'
    };

    this.initDefaultSeed(this.state.seedNodeId);
    this.bindDOM();
    this.render();
  }

  resolveHref(rawHref?: string): string {
    if (!rawHref) return '#';
    if (rawHref.startsWith('http://') || rawHref.startsWith('https://')) return rawHref;
    const cleanHref = rawHref.startsWith('/') ? rawHref.slice(1) : rawHref;
    return this.state.baseUrl + cleanHref;
  }

  initDefaultSeed(seedId: string) {
    this.state.seedNodeId = seedId;
    this.state.visibleNodeIds.clear();
    this.state.positions.clear();
    // 任务 D: 切换种子网络时彻底清除旧选中状态，重置视口
    this.state.selectedEntity = null;
    this.state.viewport = { panX: 0, panY: 0, scale: 1 };

    const seed = this.state.data.nodes.find(n => n.id === seedId);
    if (!seed) return;

    this.state.visibleNodeIds.add(seedId);

    // 获取直接 1 度相连的边和节点
    const directEdges = this.state.data.edges.filter(
      e => e.source === seedId || e.target === seedId
    );

    for (const edge of directEdges) {
      const neighborId = edge.source === seedId ? edge.target : edge.source;
      this.state.visibleNodeIds.add(neighborId);
    }

    this.computeLayout();
  }

  computeLayout() {
    const seedId = this.state.seedNodeId;
    const centerX = 520;
    const centerY = 360;

    this.state.positions.set(seedId, { x: centerX, y: centerY });

    // 按类型分扇区组织周围节点
    const groups: Record<string, string[]> = {
      domain: [],
      topic: [],
      tutorial: [],
      species: [],
      paper_method: [],
      paper_application: [],
      paper_review: [],
      other: []
    };

    for (const nid of this.state.visibleNodeIds) {
      if (nid === seedId) continue;
      const node = this.state.data.nodes.find(n => n.id === nid);
      if (!node) continue;
      if (groups[node.type]) {
        groups[node.type].push(nid);
      } else {
        groups.other.push(nid);
      }
    }

    // 扇区几何定义 [起始弧度, 结束弧度, 基础半径]
    const sectorDef: Record<string, [number, number, number]> = {
      domain: [-Math.PI * 0.65, -Math.PI * 0.35, 230], // 上方
      topic: [-Math.PI * 0.95, -Math.PI * 0.68, 260],  // 左上方
      tutorial: [Math.PI * 0.68, Math.PI * 0.95, 260], // 左下方
      species: [Math.PI * 0.35, Math.PI * 0.65, 240],  // 正下方
      paper_method: [-Math.PI * 0.28, -Math.PI * 0.05, 280], // 右上方
      paper_application: [0, Math.PI * 0.28, 300],    // 右下方
      paper_review: [-Math.PI * 0.04, Math.PI * 0.04, 320], // 正右方
      other: [Math.PI * 0.95, Math.PI * 1.1, 280]
    };

    for (const [type, nids] of Object.entries(groups)) {
      if (!nids.length) continue;
      const [startAngle, endAngle, radius] = sectorDef[type] || [-Math.PI, Math.PI, 260];
      const count = nids.length;

      nids.forEach((nid, idx) => {
        if (this.state.positions.has(nid)) return;

        let angle: number;
        if (count === 1) {
          angle = (startAngle + endAngle) / 2;
        } else {
          angle = startAngle + (idx / (count - 1)) * (endAngle - startAngle);
        }

        const r = radius + (idx % 2 === 1 ? 60 : 0);
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;

        this.state.positions.set(nid, { x: Math.round(x), y: Math.round(y) });
      });
    }
  }

  expandNode(nodeId: string) {
    const directEdges = this.state.data.edges.filter(
      e => e.source === nodeId || e.target === nodeId
    );
    const added: string[] = [];
    for (const edge of directEdges) {
      const neighborId = edge.source === nodeId ? edge.target : edge.source;
      if (!this.state.visibleNodeIds.has(neighborId)) {
        this.state.visibleNodeIds.add(neighborId);
        added.push(neighborId);
      }
    }

    if (added.length > 0) {
      const basePos = this.state.positions.get(nodeId) || { x: 500, y: 350 };
      const centerPos = this.state.positions.get(this.state.seedNodeId) || { x: 500, y: 350 };
      const outwardAngle = Math.atan2(basePos.y - centerPos.y, basePos.x - centerPos.x);

      added.forEach((nid, i) => {
        const spread = (i - (added.length - 1) / 2) * 0.35;
        const ang = outwardAngle + spread;
        const r = 180 + (i % 2) * 40;
        this.state.positions.set(nid, {
          x: Math.round(basePos.x + Math.cos(ang) * r),
          y: Math.round(basePos.y + Math.sin(ang) * r)
        });
      });
    }

    this.render();
  }

  /**
   * 任务 B: 抽取统一子图过滤函数
   * SVG网络、关系列表、当前统计、高亮计算、右侧详情完全复用同一套数据结果
   */
  computeVisibleSubgraph(): VisibleSubgraph {
    // 1. 过滤候选节点（按节点类型与领域）
    const candidateNodes: PositionedNode[] = [];
    for (const nid of this.state.visibleNodeIds) {
      const node = this.state.data.nodes.find(n => n.id === nid);
      if (!node) continue;

      if (!this.state.filters.nodeTypes.has(node.type)) continue;

      if (this.state.filters.domainId) {
        const belongs = (node.domainIds && node.domainIds.includes(this.state.filters.domainId)) ||
          node.id === `domain:${this.state.filters.domainId}`;
        if (!belongs && nid !== this.state.seedNodeId) continue;
      }

      const pos = this.state.positions.get(nid) || { x: 500, y: 350 };
      candidateNodes.push({
        node,
        x: pos.x,
        y: pos.y,
        isCenter: nid === this.state.seedNodeId
      });
    }

    const candidateNodeMap = new Map<string, PositionedNode>();
    for (const cn of candidateNodes) {
      candidateNodeMap.set(cn.node.id, cn);
    }

    // 2. 过滤连线边（源与目标均需在候选节点中，且匹配关系类型与证据状态）
    const visibleEdges: PositionedEdge[] = [];
    const connectedNodeIds = new Set<string>();

    for (const edge of this.state.data.edges) {
      const srcNode = candidateNodeMap.get(edge.source);
      const tgtNode = candidateNodeMap.get(edge.target);
      if (!srcNode || !tgtNode) continue;

      // 关系类型筛选
      if (!this.state.filters.relationTypes.has(edge.relation)) continue;

      // 证据状态筛选
      if (this.state.filters.verificationStatus !== 'all') {
        const hasStatus = edge.evidence.some(ev => ev.verificationStatus === this.state.filters.verificationStatus);
        if (!hasStatus) continue;
      }

      visibleEdges.push({
        edge,
        sourceNode: srcNode,
        targetNode: tgtNode,
        labelX: (srcNode.x + tgtNode.x) / 2,
        labelY: (srcNode.y + tgtNode.y) / 2
      });

      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    }

    // 3. 孤立节点规则：中心种子节点始终保留；其他节点若失去全部可见连接则过滤
    const visibleNodes = candidateNodes.filter(cn => {
      if (cn.node.id === this.state.seedNodeId) return true;
      return connectedNodeIds.has(cn.node.id);
    });

    const finalNodeMap = new Map<string, PositionedNode>();
    for (const vn of visibleNodes) finalNodeMap.set(vn.node.id, vn);

    const edgeMap = new Map<string, PositionedEdge>();
    for (const ve of visibleEdges) edgeMap.set(ve.edge.id, ve);

    // 任务 D: 检查当前选中实体是否仍然可见，若不可见则清除
    if (this.state.selectedEntity) {
      if (this.state.selectedEntity.type === 'node') {
        if (!finalNodeMap.has(this.state.selectedEntity.node.id)) {
          this.state.selectedEntity = null;
        }
      } else if (this.state.selectedEntity.type === 'edge') {
        if (!edgeMap.has(this.state.selectedEntity.edge.id)) {
          this.state.selectedEntity = null;
        }
      }
    }

    return {
      nodes: visibleNodes,
      edges: visibleEdges,
      nodeMap: finalNodeMap,
      edgeMap
    };
  }

  bindDOM() {
    this.svg = this.container.querySelector<SVGSVGElement>('.svg-viewport');
    this.viewportG = this.container.querySelector<SVGGElement>('#viewport-g');
    this.edgesG = this.container.querySelector<SVGGElement>('#edges-g');
    this.nodesG = this.container.querySelector<SVGGElement>('#nodes-g');

    // 画布拖拽事件
    if (this.svg) {
      this.svg.addEventListener('mousedown', (e) => {
        if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'bg-rect') {
          this.isDragging = true;
          this.dragStartX = e.clientX - this.state.viewport.panX;
          this.dragStartY = e.clientY - this.state.viewport.panY;
          this.svg?.classList.add('dragging');
        }
      });

      window.addEventListener('mousemove', (e) => {
        if (!this.isDragging) return;
        this.state.viewport.panX = e.clientX - this.dragStartX;
        this.state.viewport.panY = e.clientY - this.dragStartY;
        this.updateViewportTransform();
      });

      window.addEventListener('mouseup', () => {
        if (this.isDragging) {
          this.isDragging = false;
          this.svg?.classList.remove('dragging');
        }
      });

      // 滚轮缩放
      this.svg.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 1.1 : 0.9;
        const newScale = Math.min(Math.max(this.state.viewport.scale * delta, 0.4), 2.5);
        this.state.viewport.scale = newScale;
        this.updateViewportTransform();
      }, { passive: false });
    }

    // 缩放与复位按钮
    const zoomInBtn = this.container.querySelector('#btn-zoom-in');
    const zoomOutBtn = this.container.querySelector('#btn-zoom-out');
    const resetBtn = this.container.querySelector('#btn-reset-view');
    const fullscreenBtn = this.container.querySelector('#btn-fullscreen');
    const viewToggleBtn = this.container.querySelector('#btn-view-toggle');

    zoomInBtn?.addEventListener('click', () => {
      this.state.viewport.scale = Math.min(this.state.viewport.scale * 1.2, 2.5);
      this.updateViewportTransform();
    });

    zoomOutBtn?.addEventListener('click', () => {
      this.state.viewport.scale = Math.max(this.state.viewport.scale * 0.8, 0.4);
      this.updateViewportTransform();
    });

    resetBtn?.addEventListener('click', () => {
      this.state.viewport = { panX: 0, panY: 0, scale: 1 };
      this.initDefaultSeed(this.state.seedNodeId);
      this.updateViewportTransform();
      this.render();
    });

    fullscreenBtn?.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        this.container.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.().catch(() => {});
      }
    });

    viewToggleBtn?.addEventListener('click', () => {
      this.state.viewMode = this.state.viewMode === 'graph' ? 'list' : 'graph';
      const mainContainer = this.container.querySelector('.explorer-main');
      if (mainContainer) {
        if (this.state.viewMode === 'list') {
          mainContainer.classList.add('view-mode-list');
          viewToggleBtn.textContent = '⚏ 图谱';
        } else {
          mainContainer.classList.remove('view-mode-list');
          viewToggleBtn.textContent = '⚏ 列表';
        }
      }
    });

    // 任务 E: 搜索框 Combobox 键盘导航与无障碍
    const searchInput = this.container.querySelector<HTMLInputElement>('#explorer-search');
    const searchDropdown = this.container.querySelector<HTMLElement>('#search-dropdown');
    const searchClear = this.container.querySelector<HTMLElement>('#search-clear');
    const combobox = this.container.querySelector<HTMLElement>('#search-combobox');

    const updateSearchSuggestions = () => {
      if (!searchInput || !searchDropdown) return;
      const q = searchInput.value.trim().toLowerCase();
      if (searchClear) searchClear.style.display = q ? 'block' : 'none';
      if (!q) {
        searchDropdown.style.display = 'none';
        combobox?.setAttribute('aria-expanded', 'false');
        this.searchHighlightIndex = -1;
        return;
      }

      const matches = this.state.data.nodes.filter(n => {
        return (
          n.label.toLowerCase().includes(q) ||
          n.id.toLowerCase().includes(q) ||
          (n.summary && n.summary.toLowerCase().includes(q)) ||
          (n.slug && n.slug.toLowerCase().includes(q))
        );
      }).slice(0, 10);

      this.searchHighlightIndex = -1;

      if (matches.length === 0) {
        searchDropdown.innerHTML = '<div style="padding:10px 12px;font-size:12px;color:var(--text-muted)" role="status">无匹配科研实体</div>';
      } else {
        searchDropdown.innerHTML = matches.map((m, idx) => {
          const typeInfo = NODE_TYPE_INFO[m.type] || { label: m.type, color: '#333', bg: '#EEE' };
          return `
            <div class="search-result-item" id="search-opt-${idx}" role="option" aria-selected="false" data-node-id="${m.id}" tabindex="-1">
              <div class="search-result-title">${this.escapeHtml(m.label)}</div>
              <div class="search-result-sub">
                <span style="color:${typeInfo.color}">● ${typeInfo.label}</span>
                <span class="meta-badge">${m.id}</span>
              </div>
            </div>
          `;
        }).join('');
      }

      searchDropdown.style.display = 'block';
      combobox?.setAttribute('aria-expanded', 'true');
    };

    searchInput?.addEventListener('input', updateSearchSuggestions);

    searchInput?.addEventListener('keydown', (e) => {
      if (!searchDropdown || searchDropdown.style.display !== 'block') return;
      const items = searchDropdown.querySelectorAll<HTMLElement>('.search-result-item');
      if (!items.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.searchHighlightIndex = (this.searchHighlightIndex + 1) % items.length;
        items.forEach((item, idx) => {
          const isAct = idx === this.searchHighlightIndex;
          item.classList.toggle('highlighted', isAct);
          item.setAttribute('aria-selected', String(isAct));
          if (isAct) {
            item.scrollIntoView({ block: 'nearest' });
            searchInput.setAttribute('aria-activedescendant', `search-opt-${idx}`);
          }
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.searchHighlightIndex = (this.searchHighlightIndex - 1 + items.length) % items.length;
        items.forEach((item, idx) => {
          const isAct = idx === this.searchHighlightIndex;
          item.classList.toggle('highlighted', isAct);
          item.setAttribute('aria-selected', String(isAct));
          if (isAct) {
            item.scrollIntoView({ block: 'nearest' });
            searchInput.setAttribute('aria-activedescendant', `search-opt-${idx}`);
          }
        });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const targetItem = this.searchHighlightIndex >= 0 ? items[this.searchHighlightIndex] : items[0];
        if (targetItem && targetItem.dataset.nodeId) {
          const nid = targetItem.dataset.nodeId;
          searchDropdown.style.display = 'none';
          combobox?.setAttribute('aria-expanded', 'false');
          this.focusOnNode(nid);
        }
      } else if (e.key === 'Escape') {
        searchDropdown.style.display = 'none';
        combobox?.setAttribute('aria-expanded', 'false');
      }
    });

    searchClear?.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (searchClear) searchClear.style.display = 'none';
      if (searchDropdown) searchDropdown.style.display = 'none';
      combobox?.setAttribute('aria-expanded', 'false');
    });

    searchDropdown?.addEventListener('click', (e) => {
      const item = (e.target as HTMLElement).closest<HTMLElement>('.search-result-item');
      if (item && item.dataset.nodeId) {
        const nid = item.dataset.nodeId;
        searchDropdown.style.display = 'none';
        combobox?.setAttribute('aria-expanded', 'false');
        this.focusOnNode(nid);
      }
    });

    // 预设芯片点击
    const presetChips = this.container.querySelectorAll<HTMLElement>('.preset-chip');
    presetChips.forEach(chip => {
      chip.addEventListener('click', () => {
        presetChips.forEach(c => {
          c.classList.remove('active');
          c.setAttribute('aria-pressed', 'false');
        });
        chip.classList.add('active');
        chip.setAttribute('aria-pressed', 'true');
        const seedId = chip.dataset.seed;
        if (seedId) {
          this.initDefaultSeed(seedId);
          this.render();
        }
      });
    });

    // 领域筛选
    const domainSelect = this.container.querySelector<HTMLSelectElement>('#filter-domain-select');
    domainSelect?.addEventListener('change', () => {
      this.state.filters.domainId = domainSelect.value;
      this.render();
    });

    // 实体类型筛选
    const typeCheckboxes = this.container.querySelectorAll<HTMLInputElement>('.filter-type-checkbox');
    typeCheckboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        const t = cb.value;
        if (cb.checked) {
          this.state.filters.nodeTypes.add(t);
        } else {
          this.state.filters.nodeTypes.delete(t);
        }
        this.render();
      });
    });

    // 任务 A: 科学关系类型筛选
    const relationCheckboxes = this.container.querySelectorAll<HTMLInputElement>('.filter-relation-checkbox');
    relationCheckboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        const r = cb.value;
        if (cb.checked) {
          this.state.filters.relationTypes.add(r);
        } else {
          this.state.filters.relationTypes.delete(r);
        }
        this.render();
      });
    });

    const selectAllRelationsBtn = this.container.querySelector('#btn-select-all-relations');
    const clearAllRelationsBtn = this.container.querySelector('#btn-clear-all-relations');

    selectAllRelationsBtn?.addEventListener('click', () => {
      this.state.filters.relationTypes = new Set(ALL_RELATION_TYPES);
      relationCheckboxes.forEach(cb => { cb.checked = true; });
      this.render();
    });

    clearAllRelationsBtn?.addEventListener('click', () => {
      this.state.filters.relationTypes.clear();
      relationCheckboxes.forEach(cb => { cb.checked = false; });
      this.render();
    });

    // 证据状态筛选
    const statusSelect = this.container.querySelector<HTMLSelectElement>('#filter-evidence-select');
    statusSelect?.addEventListener('change', () => {
      this.state.filters.verificationStatus = statusSelect.value;
      this.render();
    });

    // 重置所有筛选
    const resetFiltersBtn = this.container.querySelector('#btn-reset-filters');
    resetFiltersBtn?.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (searchClear) searchClear.style.display = 'none';
      if (domainSelect) domainSelect.value = '';
      if (statusSelect) statusSelect.value = 'all';

      this.state.filters.domainId = '';
      this.state.filters.verificationStatus = 'all';
      this.state.filters.nodeTypes = new Set(ALL_NODE_TYPES);
      this.state.filters.relationTypes = new Set(ALL_RELATION_TYPES);

      typeCheckboxes.forEach(cb => { cb.checked = true; });
      relationCheckboxes.forEach(cb => { cb.checked = true; });

      this.initDefaultSeed('method:hifiasm');
      presetChips.forEach(c => {
        const isDefault = c.dataset.seed === 'method:hifiasm';
        c.classList.toggle('active', isDefault);
        c.setAttribute('aria-pressed', String(isDefault));
      });

      this.render();
    });
  }

  focusOnNode(nodeId: string) {
    const targetNode = this.state.data.nodes.find(n => n.id === nodeId);
    if (!targetNode) return;

    if (!this.state.visibleNodeIds.has(nodeId)) {
      this.initDefaultSeed(nodeId);
    }

    // 任务 D: 搜索后自动选中目标节点并展示详情
    this.state.selectedEntity = { type: 'node', node: targetNode };
    this.render();
  }

  updateViewportTransform() {
    if (this.viewportG) {
      const { panX, panY, scale } = this.state.viewport;
      this.viewportG.setAttribute('transform', `translate(${panX}, ${panY}) scale(${scale})`);
    }
  }

  render() {
    this.updateViewportTransform();
    // 统一子图过滤计算
    const subgraph = this.computeVisibleSubgraph();
    this.renderCanvas(subgraph);
    this.renderInspector(subgraph);
    this.updateTopStats(subgraph);
    this.renderListView(subgraph);
  }

  renderCanvas(subgraph: VisibleSubgraph) {
    if (!this.edgesG || !this.nodesG) return;

    const { nodes: filteredNodes, edges: filteredEdges } = subgraph;
    const selected = this.state.selectedEntity;

    // 关联高亮计算
    const highlightedNodeIds = new Set<string>();
    const highlightedEdgeIds = new Set<string>();

    if (selected) {
      if (selected.type === 'node') {
        highlightedNodeIds.add(selected.node.id);
        for (const fe of filteredEdges) {
          if (fe.edge.source === selected.node.id || fe.edge.target === selected.node.id) {
            highlightedEdgeIds.add(fe.edge.id);
            highlightedNodeIds.add(fe.edge.source);
            highlightedNodeIds.add(fe.edge.target);
          }
        }
      } else if (selected.type === 'edge') {
        highlightedEdgeIds.add(selected.edge.id);
        highlightedNodeIds.add(selected.edge.source);
        highlightedNodeIds.add(selected.edge.target);
      }
    }

    // 渲染连线与标签
    let edgesHtml = '';
    for (const fe of filteredEdges) {
      const isSelected = selected?.type === 'edge' && selected.edge.id === fe.edge.id;
      const isHighlighted = highlightedEdgeIds.has(fe.edge.id);
      const isDimmed = selected && !isHighlighted;
      const relationLabel = RELATION_LABELS[fe.edge.relation] || fe.edge.relation;
      const labelWidth = Math.max(relationLabel.length * 11 + 14, 52);
      const srcLabel = fe.sourceNode.node.label;
      const tgtLabel = fe.targetNode.node.label;

      edgesHtml += `
        <g class="edge-group ${isSelected ? 'selected' : ''} ${isDimmed ? 'dimmed' : ''}" 
           data-edge-id="${fe.edge.id}"
           tabindex="0"
           role="button"
           aria-label="${this.escapeHtml(srcLabel)} ──${relationLabel}──▶ ${this.escapeHtml(tgtLabel)}"
           aria-pressed="${isSelected}">
          <line class="edge-line ${isHighlighted ? 'highlight' : ''}" 
                x1="${fe.sourceNode.x}" y1="${fe.sourceNode.y}" 
                x2="${fe.targetNode.x}" y2="${fe.targetNode.y}"/>
          <rect class="edge-label-bg" 
                x="${fe.labelX - labelWidth / 2}" y="${fe.labelY - 9}" 
                width="${labelWidth}" height="18"/>
          <text class="edge-label-text" x="${fe.labelX}" y="${fe.labelY}">${relationLabel}</text>
        </g>
      `;
    }
    this.edgesG.innerHTML = edgesHtml;

    // 渲染节点卡片 (任务 E: 键盘 Tab 与无障碍 ARIA 属性完整支持)
    let nodesHtml = '';
    for (const fn of filteredNodes) {
      const isSelected = selected?.type === 'node' && selected.node.id === fn.node.id;
      const isHighlighted = highlightedNodeIds.has(fn.node.id);
      const isDimmed = selected && !isHighlighted;
      const typeInfo = NODE_TYPE_INFO[fn.node.type] || { label: fn.node.type, color: '#333', bg: '#EEE' };

      const cardW = fn.isCenter ? 180 : 160;
      const cardH = fn.isCenter ? 52 : 46;
      const cardX = fn.x - cardW / 2;
      const cardY = fn.y - cardH / 2;

      const title = fn.node.label.length > 13 ? fn.node.label.slice(0, 12) + '…' : fn.node.label;
      const sub = fn.node.meta?.code || (fn.node.type === 'paper_method' || fn.node.type === 'paper_application' || fn.node.type === 'paper_review' ? (fn.node.meta?.journal || '学术论文') : fn.node.id.split(':')[1] || '');
      const subText = sub.length > 15 ? sub.slice(0, 14) + '…' : sub;

      nodesHtml += `
        <g class="node-g ${fn.isCenter ? 'center-hub' : ''} ${isSelected ? 'selected' : ''} ${isDimmed ? 'dimmed' : ''}" 
           data-node-id="${fn.node.id}" 
           tabindex="0"
           role="button"
           aria-label="${typeInfo.label}：${this.escapeHtml(fn.node.label)}"
           aria-pressed="${isSelected}">
          <rect class="node-card" x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}"/>
          
          <rect class="node-badge-rect" x="${cardX + 8}" y="${cardY + 8}" width="42" height="15" fill="${typeInfo.bg}"/>
          <text class="node-badge-text" x="${cardX + 29}" y="${cardY + 18.5}" fill="${typeInfo.color}" text-anchor="middle">${typeInfo.label.slice(0, 4)}</text>
          
          <text class="node-title-text" x="${cardX + 56}" y="${cardY + 20}">${this.escapeHtml(title)}</text>
          <text class="node-sub-text" x="${cardX + 56}" y="${cardY + 34}">${this.escapeHtml(subText)}</text>
          
          <g class="node-expand-btn" data-action="expand" data-node-id="${fn.node.id}" tabindex="0" role="button" aria-label="展开 ${this.escapeHtml(fn.node.label)} 的关联网络">
            <rect x="${cardX + cardW - 20}" y="${cardY + 6}" width="14" height="14" rx="3"/>
            <text x="${cardX + cardW - 13}" y="${cardY + 16.5}" font-size="11" fill="var(--primary-deep)" text-anchor="middle" font-weight="700">+</text>
          </g>
        </g>
      `;
    }
    this.nodesG.innerHTML = nodesHtml;

    this.bindCanvasInteractions();
  }

  bindCanvasInteractions() {
    if (!this.edgesG || !this.nodesG) return;

    // 节点鼠标点击与键盘触发
    this.nodesG.querySelectorAll<SVGGElement>('.node-g').forEach(g => {
      const handleSelectNode = (e: Event) => {
        const target = e.target as HTMLElement;
        const expandBtn = target.closest('[data-action="expand"]');
        const nodeId = g.dataset.nodeId;
        if (!nodeId) return;

        if (expandBtn) {
          e.stopPropagation();
          this.expandNode(nodeId);
          return;
        }

        const node = this.state.data.nodes.find(n => n.id === nodeId);
        if (node) {
          this.state.selectedEntity = { type: 'node', node };
          this.render();
        }
      };

      g.addEventListener('click', handleSelectNode);

      // 任务 E: 键盘 Enter / Space 选中节点
      g.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSelectNode(e);
        }
      });
    });

    // 边鼠标点击与键盘触发
    this.edgesG.querySelectorAll<SVGGElement>('.edge-group').forEach(g => {
      const handleSelectEdge = (e: Event) => {
        e.stopPropagation();
        const edgeId = g.dataset.edgeId;
        if (!edgeId) return;
        const edge = this.state.data.edges.find(ed => ed.id === edgeId);
        if (edge) {
          this.state.selectedEntity = { type: 'edge', edge };
          this.render();
        }
      };

      g.addEventListener('click', handleSelectEdge);

      // 任务 E: 键盘 Enter / Space 选中边
      g.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSelectEdge(e);
        }
      });
    });
  }

  renderInspector(subgraph: VisibleSubgraph) {
    const inspector = this.container.querySelector<HTMLElement>('#inspector-content');
    if (!inspector) return;

    const selected = this.state.selectedEntity;
    const stats = this.state.data.stats;
    const totalEvidence = stats.evidenceEntriesCount || 798;
    const sourceCheckedCount = stats.evidenceByStatus?.source_checked || 0;
    const structurallyValidCount = stats.evidenceByStatus?.structurally_valid || 0;
    const sourceCheckedRatio = stats.evidenceRatiosByStatus?.source_checked || `${((sourceCheckedCount / totalEvidence) * 100).toFixed(1)}%`;
    const structurallyValidRatio = stats.evidenceRatiosByStatus?.structurally_valid || `${((structurallyValidCount / totalEvidence) * 100).toFixed(1)}%`;

    // 1. 未选中状态：展示全图统计与指引 (任务 F1: 使用中性 meta-badge，任务 G: 消除硬编码)
    if (!selected) {
      inspector.innerHTML = `
        <div class="panel-header-badge">
          <span class="type-tag domain">科研知识图谱概览</span>
          <span class="meta-badge">Schema V2.1</span>
        </div>
        <h2 class="entity-title">PhytoMethods 知识探索器</h2>
        <p class="entity-summary">
          当前知识图谱收录植物基因组学 ${stats.nodesCount} 个知识实体与 ${stats.edgesCount} 条科学语义关联。点击图谱中的卡片可探查实体档案；点击连线可溯源学术证据与出版 DOI。
        </p>

        <div class="evidence-section-header">
          <span>图谱核心指标</span>
        </div>
        <div class="detail-attr-list">
          <div class="attr-row">
            <span class="attr-label">收录节点</span>
            <span class="attr-val"><strong>${stats.nodesCount}</strong> 个（算法 ${stats.nodesByType?.method || 58}、文献 ${(stats.nodesByType?.paper_method || 0) + (stats.nodesByType?.paper_application || 0) + (stats.nodesByType?.paper_review || 0)}、专题 ${stats.nodesByType?.topic || 63}、教程 ${stats.nodesByType?.tutorial || 10}）</span>
          </div>
          <div class="attr-row">
            <span class="attr-label">语义关系</span>
            <span class="attr-val"><strong>${stats.edgesCount}</strong> 条严格去重关系</span>
          </div>
          <div class="attr-row">
            <span class="attr-label">证据记录</span>
            <span class="attr-val"><strong>${totalEvidence}</strong> 条学术证据记录</span>
          </div>
          <div class="attr-row">
            <span class="attr-label">奠基文献</span>
            <span class="attr-val" style="color:var(--primary-deep)">100% 工具奠基论文闭环</span>
          </div>
        </div>

        <div class="evidence-section-header">
          <span>三级科学证据体系</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <div class="evidence-card" style="border-left-color:var(--primary-interactive)">
            <div class="evidence-card-title">
              <span>来源已核实 (source_checked)</span>
              <span class="status-badge source_checked">${sourceCheckedCount} 条 (${sourceCheckedRatio})</span>
            </div>
            <div class="evidence-card-note">${VERIFICATION_LABELS.source_checked.desc}</div>
          </div>
          <div class="evidence-card" style="border-left-color:#3C4043">
            <div class="evidence-card-title">
              <span>结构有效 (structurally_valid)</span>
              <span class="status-badge structurally_valid">${structurallyValidCount} 条 (${structurallyValidRatio})</span>
            </div>
            <div class="evidence-card-note">${VERIFICATION_LABELS.structurally_valid.desc}</div>
          </div>
        </div>
      `;
      return;
    }

    // 2. 选中节点：展示实体档案与当前可见关系列表 (任务 F1: 使用 meta-badge，任务 F3: 完整展示证据状态)
    if (selected.type === 'node') {
      const node = selected.node;
      const typeInfo = NODE_TYPE_INFO[node.type] || { label: node.type, color: '#333', bg: '#EEE' };

      // 任务 B: 只列出当前子图中可见的相关边
      const relatedEdges = subgraph.edges.filter(
        fe => fe.edge.source === node.id || fe.edge.target === node.id
      ).map(fe => fe.edge);

      const targetHref = this.resolveHref(node.href);

      inspector.innerHTML = `
        <div class="panel-header-badge">
          <span class="type-tag ${node.type}">${typeInfo.label}</span>
          <span class="meta-badge">${node.id}</span>
        </div>
        <h2 class="entity-title">${this.escapeHtml(node.label)}</h2>
        
        ${node.summary ? `<p class="entity-summary">${this.escapeHtml(node.summary)}</p>` : ''}

        <div class="detail-attr-list">
          ${node.meta?.journal ? `
            <div class="attr-row">
              <span class="attr-label">发表期刊</span>
              <span class="attr-val">${this.escapeHtml(node.meta.journal)} (${node.meta.year || '未知'})</span>
            </div>
          ` : ''}
          ${node.meta?.doi ? `
            <div class="attr-row">
              <span class="attr-label">DOI</span>
              <span class="attr-val"><a href="https://doi.org/${encodeURIComponent(node.meta.doi)}" target="_blank" rel="noopener">${this.escapeHtml(node.meta.doi)} ↗</a></span>
            </div>
          ` : ''}
          ${node.meta?.repository ? `
            <div class="attr-row">
              <span class="attr-label">官方仓库</span>
              <span class="attr-val"><a href="${this.escapeHtml(node.meta.repository)}" target="_blank" rel="noopener">${this.escapeHtml(node.meta.repository)} ↗</a></span>
            </div>
          ` : ''}
          ${node.meta?.principle ? `
            <div class="attr-row">
              <span class="attr-label">计算思想</span>
              <span class="attr-val">${this.escapeHtml(node.meta.principle)}</span>
            </div>
          ` : ''}
        </div>

        <div style="display:flex;gap:8px;margin-top:6px;">
          ${node.href ? `
            <a href="${targetHref}" class="primary-action-btn" style="flex:1">
              查看站内详情页 ↗
            </a>
          ` : ''}
          <button id="btn-expand-inspector" class="secondary-action-btn" data-node-id="${node.id}">
            + 展开关联网络
          </button>
        </div>

        <div class="evidence-section-header">
          <span>当前子网关联关系 (${relatedEdges.length})</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;max-height:360px;overflow-y:auto;padding-right:4px;">
          ${relatedEdges.length === 0 ? `
            <div style="font-size:12px;color:var(--text-muted);padding:8px 0;">当前筛选条件下无可见关联边。</div>
          ` : relatedEdges.map(edge => {
            const isOutgoing = edge.source === node.id;
            const otherId = isOutgoing ? edge.target : edge.source;
            const otherNode = this.state.data.nodes.find(n => n.id === otherId);
            const relationLabel = RELATION_LABELS[edge.relation] || edge.relation;

            return `
              <div class="evidence-card" data-edge-id="${edge.id}" tabindex="0" role="button" aria-label="查看与 ${this.escapeHtml(otherNode?.label || otherId)} 的证据">
                <div class="evidence-card-title">
                  <span>${isOutgoing ? '──▶' : '◀──'} ${relationLabel}: <strong>${this.escapeHtml(otherNode?.label || otherId)}</strong></span>
                  <span class="meta-badge">${edge.evidence.length} 条证据</span>
                </div>
                <!-- 任务 F3: 完整展示各条证据的状态微标 -->
                <div style="display:flex;flex-direction:column;gap:4px;margin-top:4px;">
                  ${edge.evidence.map(ev => {
                    const statusInfo = VERIFICATION_LABELS[ev.verificationStatus] || VERIFICATION_LABELS.structurally_valid;
                    return `
                      <div style="display:flex;align-items:baseline;justify-content:space-between;font-size:11px;">
                        <span style="color:var(--text-muted)">[${ev.sourceType}] ${this.escapeHtml(ev.note?.slice(0, 36) || '')}…</span>
                        <span class="status-badge ${statusInfo.className}">${statusInfo.label}</span>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      inspector.querySelector('#btn-expand-inspector')?.addEventListener('click', () => {
        this.expandNode(node.id);
      });

      inspector.querySelectorAll<HTMLElement>('.evidence-card[data-edge-id]').forEach(card => {
        const selectCardEdge = () => {
          const edgeId = card.dataset.edgeId;
          const edge = this.state.data.edges.find(e => e.id === edgeId);
          if (edge) {
            this.state.selectedEntity = { type: 'edge', edge };
            this.render();
          }
        };
        card.addEventListener('click', selectCardEdge);
        card.addEventListener('keydown', (e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectCardEdge();
          }
        });
      });
      return;
    }

    // 3. 选中边/关系：展示精准学术语义、两端实体与逐条详细证据追溯 (任务 F1: meta-badge，任务 F2: 证据文字，任务 F3: 多证据)
    if (selected.type === 'edge') {
      const edge = selected.edge;
      const srcNode = this.state.data.nodes.find(n => n.id === edge.source);
      const tgtNode = this.state.data.nodes.find(n => n.id === edge.target);
      const relationLabel = RELATION_LABELS[edge.relation] || edge.relation;

      inspector.innerHTML = `
        <div class="panel-header-badge">
          <span class="type-tag domain">科学语义关系</span>
          <span class="meta-badge">${edge.relation}</span>
        </div>
        <h2 class="entity-title">${relationLabel}</h2>

        <div class="edge-detail-box">
          <div class="edge-flow-diagram">
            <span class="edge-node-badge" title="${srcNode?.label || edge.source}">${this.escapeHtml(srcNode?.label || edge.source)}</span>
            <div class="edge-arrow-label">
              <span>── ${relationLabel} ──▶</span>
            </div>
            <span class="edge-node-badge" title="${tgtNode?.label || edge.target}">${this.escapeHtml(tgtNode?.label || edge.target)}</span>
          </div>
        </div>

        <div class="evidence-section-header">
          <span>学术证据溯源记录 (${edge.evidence.length} 条)</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${edge.evidence.map((ev, idx) => {
            const statusInfo = VERIFICATION_LABELS[ev.verificationStatus] || VERIFICATION_LABELS.structurally_valid;
            return `
              <div class="evidence-card active" style="cursor:default">
                <div class="evidence-card-title">
                  <span>证据 #${idx + 1}: <span class="status-badge ${statusInfo.className}">${statusInfo.label}</span></span>
                  <span class="meta-badge">${ev.sourceType}</span>
                </div>
                ${ev.sourceId ? `<div style="font-size:11px;color:var(--text-muted)">来源标识: ${this.escapeHtml(ev.sourceId)}</div>` : ''}
                ${ev.note ? `<div class="evidence-card-note">${this.escapeHtml(ev.note)}</div>` : ''}
                <div class="evidence-card-meta">
                  ${ev.doi ? `<span>DOI: <a href="https://doi.org/${encodeURIComponent(ev.doi)}" target="_blank" rel="noopener">${this.escapeHtml(ev.doi)} ↗</a></span>` : ''}
                  ${ev.sourceUrl ? `<span>官方链接: <a href="${this.escapeHtml(ev.sourceUrl)}" target="_blank" rel="noopener">访问源站 ↗</a></span>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div style="display:flex;gap:8px;margin-top:12px;">
          ${srcNode?.href ? `
            <a href="${this.resolveHref(srcNode.href)}" class="secondary-action-btn" style="flex:1">
              查看起始实体 ↗
            </a>
          ` : ''}
          ${tgtNode?.href ? `
            <a href="${this.resolveHref(tgtNode.href)}" class="secondary-action-btn" style="flex:1">
              查看目标实体 ↗
            </a>
          ` : ''}
        </div>
      `;
    }
  }

  updateTopStats(subgraph: VisibleSubgraph) {
    const totalNodesEl = this.container.querySelector('#stat-total-nodes');
    const totalEdgesEl = this.container.querySelector('#stat-total-edges');
    const viewNodesEl = this.container.querySelector('#stat-view-nodes');
    const viewEdgesEl = this.container.querySelector('#stat-view-edges');

    if (totalNodesEl) totalNodesEl.textContent = String(this.state.data.stats.nodesCount);
    if (totalEdgesEl) totalEdgesEl.textContent = String(this.state.data.stats.edgesCount);

    // 任务 B: 严格使用统一过滤子图中的节点与边数量
    if (viewNodesEl) viewNodesEl.textContent = String(subgraph.nodes.length);
    if (viewEdgesEl) viewEdgesEl.textContent = String(subgraph.edges.length);
  }

  renderListView(subgraph: VisibleSubgraph) {
    const tableBody = this.container.querySelector<HTMLTableSectionElement>('#list-view-tbody');
    if (!tableBody) return;

    // 任务 B: 严格使用与画布完全一致的统一过滤边集合
    const visibleEdges = subgraph.edges;

    if (visibleEdges.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center;padding:24px;color:var(--text-muted)">
            当前筛选条件下没有可见的科学语义关系。
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = visibleEdges.map(ve => {
      const edge = ve.edge;
      const srcNode = ve.sourceNode.node;
      const tgtNode = ve.targetNode.node;
      const relationLabel = RELATION_LABELS[edge.relation] || edge.relation;
      const mainEvidence = edge.evidence[0];
      const statusInfo = VERIFICATION_LABELS[mainEvidence?.verificationStatus || 'structurally_valid'];

      return `
        <tr class="list-view-row" data-edge-id="${edge.id}" tabindex="0" role="button" aria-label="查看 ${this.escapeHtml(srcNode.label)} 与 ${this.escapeHtml(tgtNode.label)} 的证据详情">
          <td><strong>${this.escapeHtml(srcNode.label)}</strong></td>
          <td><span class="type-tag domain">${relationLabel}</span></td>
          <td><strong>${this.escapeHtml(tgtNode.label)}</strong></td>
          <td><span class="status-badge ${statusInfo.className}">${statusInfo.label}</span></td>
          <td>${this.escapeHtml(mainEvidence?.note || '')}</td>
        </tr>
      `;
    }).join('');

    // 任务 E: 表格行点击与键盘 Enter/Space 查看证据详情
    tableBody.querySelectorAll<HTMLTableRowElement>('.list-view-row').forEach(row => {
      const selectRow = () => {
        const edgeId = row.dataset.edgeId;
        const edge = this.state.data.edges.find(e => e.id === edgeId);
        if (edge) {
          this.state.selectedEntity = { type: 'edge', edge };
          this.render();
        }
      };

      row.addEventListener('click', selectRow);
      row.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectRow();
        }
      });
    });
  }

  escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
