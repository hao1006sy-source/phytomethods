/**
 * PhytoMethods 科研知识关联图 V2 客户端交互与渲染引擎
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
  source_checked: { label: '来源已核实', className: 'source_checked', desc: '已核对出版方期刊、官方代码库或明确记录' },
  structurally_valid: { label: '结构有效', className: 'structurally_valid', desc: '经 Frontmatter 校验且双向实体完整' },
  needs_review: { label: '待核实', className: 'needs_review', desc: '存在线索但缺少全文确证' }
};

export interface PositionedNode {
  node: KnowledgeNode;
  x: number;
  y: number;
  isCenter: number | boolean;
}

export interface PositionedEdge {
  edge: KnowledgeEdge;
  sourceNode: PositionedNode;
  targetNode: PositionedNode;
  labelX: number;
  labelY: number;
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
        nodeTypes: new Set(['method', 'paper_method', 'paper_application', 'topic', 'tutorial', 'domain', 'species']),
        relationTypes: new Set([
          'introduces_method', 'uses_method', 'extends_method', 'evaluates_method',
          'references_method', 'features_method', 'references_paper', 'guides_method',
          'studies_species', 'belongs_to_domain'
        ]),
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

    const seed = this.state.data.nodes.find(n => n.id === seedId);
    if (!seed) return;

    this.state.visibleNodeIds.add(seedId);

    // 获取直接 1 度相连的边和节点
    const directEdges = this.state.data.edges.filter(
      e => e.source === seedId || e.target === seedId
    );

    // 挑选具有代表性的 12-16 个邻居节点
    const neighborIds = new Set<string>();
    for (const edge of directEdges) {
      const neighborId = edge.source === seedId ? edge.target : edge.source;
      neighborIds.add(neighborId);
    }

    // 默认加入直接邻居
    for (const nid of neighborIds) {
      this.state.visibleNodeIds.add(nid);
    }

    // 计算确定性布局坐标
    this.computeLayout();
    this.state.viewport = { panX: 0, panY: 0, scale: 1 };
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
      other: [Math.PI * 0.95, Math.PI * 1.1, 280]
    };

    for (const [type, nids] of Object.entries(groups)) {
      if (!nids.length) continue;
      const [startAngle, endAngle, radius] = sectorDef[type] || [-Math.PI, Math.PI, 260];
      const count = nids.length;

      nids.forEach((nid, idx) => {
        // 如果已经有缓存位置则保持
        if (this.state.positions.has(nid)) return;

        let angle: number;
        if (count === 1) {
          angle = (startAngle + endAngle) / 2;
        } else {
          angle = startAngle + (idx / (count - 1)) * (endAngle - startAngle);
        }

        // 交错内外圈防止卡片重叠
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

  bindDOM() {
    this.svg = this.container.querySelector<SVGSVGElement>('.svg-viewport');
    this.viewportG = this.container.querySelector<SVGGElement>('#viewport-g');
    this.edgesG = this.container.querySelector<SVGGElement>('#edges-g');
    this.nodesG = this.container.querySelector<SVGGElement>('#nodes-g');

    // 画布拖拽事件
    if (this.svg) {
      this.svg.addEventListener('mousedown', (e) => {
        // 如果点击的是空白区域
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

    // 搜索框输入与筛选
    const searchInput = this.container.querySelector<HTMLInputElement>('#explorer-search');
    const searchDropdown = this.container.querySelector<HTMLElement>('#search-dropdown');
    const searchClear = this.container.querySelector<HTMLElement>('#search-clear');

    searchInput?.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      if (searchClear) searchClear.style.display = q ? 'block' : 'none';
      if (!q || !searchDropdown) {
        if (searchDropdown) searchDropdown.style.display = 'none';
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

      if (matches.length === 0) {
        searchDropdown.innerHTML = '<div style="padding:10px 12px;font-size:12px;color:var(--text-muted)">无匹配科研实体</div>';
      } else {
        searchDropdown.innerHTML = matches.map(m => {
          const typeInfo = NODE_TYPE_INFO[m.type] || { label: m.type, color: '#333', bg: '#EEE' };
          return `
            <div class="search-result-item" data-node-id="${m.id}">
              <div class="search-result-title">${this.escapeHtml(m.label)}</div>
              <div class="search-result-sub">
                <span style="color:${typeInfo.color}">● ${typeInfo.label}</span>
                <span>${m.id}</span>
              </div>
            </div>
          `;
        }).join('');
      }

      searchDropdown.style.display = 'block';
    });

    searchClear?.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (searchClear) searchClear.style.display = 'none';
      if (searchDropdown) searchDropdown.style.display = 'none';
    });

    searchDropdown?.addEventListener('click', (e) => {
      const item = (e.target as HTMLElement).closest<HTMLElement>('.search-result-item');
      if (item && item.dataset.nodeId) {
        const nid = item.dataset.nodeId;
        searchDropdown.style.display = 'none';
        this.focusOnNode(nid);
      }
    });

    // 预设芯片点击
    const presetChips = this.container.querySelectorAll<HTMLElement>('.preset-chip');
    presetChips.forEach(chip => {
      chip.addEventListener('click', () => {
        presetChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
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
      this.state.filters.nodeTypes = new Set(['method', 'paper_method', 'paper_application', 'topic', 'tutorial', 'domain', 'species']);

      typeCheckboxes.forEach(cb => { cb.checked = true; });
      this.initDefaultSeed('method:hifiasm');
      presetChips.forEach(c => {
        if (c.dataset.seed === 'method:hifiasm') c.classList.add('active');
        else c.classList.remove('active');
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
    this.renderCanvas();
    this.renderInspector();
    this.updateTopStats();
    this.renderListView();
  }

  renderCanvas() {
    if (!this.edgesG || !this.nodesG) return;

    // 1. 过滤当前可见节点
    const filteredNodes: PositionedNode[] = [];
    for (const nid of this.state.visibleNodeIds) {
      const node = this.state.data.nodes.find(n => n.id === nid);
      if (!node) continue;

      // 检查类型筛选
      if (!this.state.filters.nodeTypes.has(node.type)) continue;

      // 检查领域筛选
      if (this.state.filters.domainId) {
        const belongs = (node.domainIds && node.domainIds.includes(this.state.filters.domainId)) ||
          node.id === `domain:${this.state.filters.domainId}`;
        if (!belongs && nid !== this.state.seedNodeId) continue;
      }

      const pos = this.state.positions.get(nid) || { x: 500, y: 350 };
      filteredNodes.push({
        node,
        x: pos.x,
        y: pos.y,
        isCenter: nid === this.state.seedNodeId
      });
    }

    const filteredNodeIds = new Set(filteredNodes.map(fn => fn.node.id));

    // 2. 过滤连线边
    const filteredEdges: PositionedEdge[] = [];
    for (const edge of this.state.data.edges) {
      if (!filteredNodeIds.has(edge.source) || !filteredNodeIds.has(edge.target)) continue;

      // 检查关系类型筛选
      if (!this.state.filters.relationTypes.has(edge.relation)) continue;

      // 检查证据状态筛选
      if (this.state.filters.verificationStatus !== 'all') {
        const hasStatus = edge.evidence.some(ev => ev.verificationStatus === this.state.filters.verificationStatus);
        if (!hasStatus) continue;
      }

      const srcNode = filteredNodes.find(fn => fn.node.id === edge.source);
      const tgtNode = filteredNodes.find(fn => fn.node.id === edge.target);
      if (!srcNode || !tgtNode) continue;

      filteredEdges.push({
        edge,
        sourceNode: srcNode,
        targetNode: tgtNode,
        labelX: (srcNode.x + tgtNode.x) / 2,
        labelY: (srcNode.y + tgtNode.y) / 2
      });
    }

    // 3. 关联高亮计算
    const selected = this.state.selectedEntity;
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

    // 4. 渲染连线与标签
    let edgesHtml = '';
    for (const fe of filteredEdges) {
      const isSelected = selected?.type === 'edge' && selected.edge.id === fe.edge.id;
      const isHighlighted = highlightedEdgeIds.has(fe.edge.id);
      const isDimmed = selected && !isHighlighted;
      const relationLabel = RELATION_LABELS[fe.edge.relation] || fe.edge.relation;

      // 控制标签背景尺寸
      const labelWidth = Math.max(relationLabel.length * 11 + 14, 52);

      edgesHtml += `
        <g class="edge-group ${isSelected ? 'selected' : ''} ${isDimmed ? 'dimmed' : ''}" data-edge-id="${fe.edge.id}">
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

    // 5. 渲染节点卡片
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

      // 缩略标题
      const title = fn.node.label.length > 13 ? fn.node.label.slice(0, 12) + '…' : fn.node.label;
      const sub = fn.node.meta?.code || (fn.node.type === 'paper_method' || fn.node.type === 'paper_application' ? (fn.node.meta?.journal || '学术论文') : fn.node.id.split(':')[1] || '');
      const subText = sub.length > 15 ? sub.slice(0, 14) + '…' : sub;

      nodesHtml += `
        <g class="node-g ${fn.isCenter ? 'center-hub' : ''} ${isSelected ? 'selected' : ''} ${isDimmed ? 'dimmed' : ''}" 
           data-node-id="${fn.node.id}" transform="translate(0, 0)">
          <rect class="node-card" x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}"/>
          
          <!-- 类型微标 -->
          <rect class="node-badge-rect" x="${cardX + 8}" y="${cardY + 8}" width="42" height="15" fill="${typeInfo.bg}"/>
          <text class="node-badge-text" x="${cardX + 29}" y="${cardY + 18.5}" fill="${typeInfo.color}" text-anchor="middle">${typeInfo.label.slice(0, 4)}</text>
          
          <!-- 标题 -->
          <text class="node-title-text" x="${cardX + 56}" y="${cardY + 20}">${this.escapeHtml(title)}</text>
          
          <!-- 副标题/代码 -->
          <text class="node-sub-text" x="${cardX + 56}" y="${cardY + 34}">${this.escapeHtml(subText)}</text>
          
          <!-- 展开小加号按钮 -->
          <g class="node-expand-btn" data-action="expand" data-node-id="${fn.node.id}">
            <rect x="${cardX + cardW - 20}" y="${cardY + 6}" width="14" height="14" rx="3"/>
            <text x="${cardX + cardW - 13}" y="${cardY + 16.5}" font-size="11" fill="var(--primary-deep)" text-anchor="middle" font-weight="700">+</text>
          </g>
        </g>
      `;
    }
    this.nodesG.innerHTML = nodesHtml;

    // 绑定卡片与连线点击事件
    this.bindCanvasInteractions();
  }

  bindCanvasInteractions() {
    if (!this.edgesG || !this.nodesG) return;

    // 点击节点
    this.nodesG.querySelectorAll<SVGGElement>('.node-g').forEach(g => {
      g.addEventListener('click', (e) => {
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
      });
    });

    // 点击边
    this.edgesG.querySelectorAll<SVGGElement>('.edge-group').forEach(g => {
      g.addEventListener('click', (e) => {
        e.stopPropagation();
        const edgeId = g.dataset.edgeId;
        if (!edgeId) return;
        const edge = this.state.data.edges.find(e => e.id === edgeId);
        if (edge) {
          this.state.selectedEntity = { type: 'edge', edge };
          this.render();
        }
      });
    });
  }

  renderInspector() {
    const inspector = this.container.querySelector<HTMLElement>('#inspector-content');
    if (!inspector) return;

    const selected = this.state.selectedEntity;

    // 1. 未选中任何元素：展示全图统计与指引
    if (!selected) {
      inspector.innerHTML = `
        <div class="panel-header-badge">
          <span class="type-tag domain">科研知识图谱概览</span>
          <span class="status-badge source_checked">Schema V2.1</span>
        </div>
        <h2 class="entity-title">PhytoMethods 知识探索器</h2>
        <p class="entity-summary">
          当前知识图谱收录植物基因组学 303 个知识实体与 740 条科学语义关联。点击图谱中的卡片可探查实体档案；点击连线可溯源学术证据与出版 DOI。
        </p>

        <div class="evidence-section-header">
          <span>图谱核心指标</span>
        </div>
        <div class="detail-attr-list">
          <div class="attr-row">
            <span class="attr-label">收录节点</span>
            <span class="attr-val"><strong>${this.state.data.stats.nodesCount}</strong> 个（算法 58、文献 130、专题 63、教程 10）</span>
          </div>
          <div class="attr-row">
            <span class="attr-label">语义关系</span>
            <span class="attr-val"><strong>${this.state.data.stats.edgesCount}</strong> 条严格去重关系</span>
          </div>
          <div class="attr-row">
            <span class="attr-label">证据记录</span>
            <span class="attr-val"><strong>${this.state.data.stats.evidenceEntriesCount || 798}</strong> 条学术证据记录</span>
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
              <span class="status-badge source_checked">541 条 (67.8%)</span>
            </div>
            <div class="evidence-card-note">经人工精读核对期刊发表论文、官方 GitHub 仓库或官方文档证实。</div>
          </div>
          <div class="evidence-card" style="border-left-color:#3C4043">
            <div class="evidence-card-title">
              <span>结构有效 (structurally_valid)</span>
              <span class="status-badge structurally_valid">257 条 (32.2%)</span>
            </div>
            <div class="evidence-card-note">Frontmatter 与双向实体关系严格校验有效。</div>
          </div>
        </div>
      `;
      return;
    }

    // 2. 选中节点：展示实体详情与关联证据列表
    if (selected.type === 'node') {
      const node = selected.node;
      const typeInfo = NODE_TYPE_INFO[node.type] || { label: node.type, color: '#333', bg: '#EEE' };

      // 提取与此节点相关的所有边
      const relatedEdges = this.state.data.edges.filter(
        e => e.source === node.id || e.target === node.id
      );

      const targetHref = this.resolveHref(node.href);

      inspector.innerHTML = `
        <div class="panel-header-badge">
          <span class="type-tag ${node.type}">${typeInfo.label}</span>
          <span class="status-badge source_checked">${node.id}</span>
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
          <span>关联关系与学术证据 (${relatedEdges.length})</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;max-height:360px;overflow-y:auto;padding-right:4px;">
          ${relatedEdges.map(edge => {
            const isOutgoing = edge.source === node.id;
            const otherId = isOutgoing ? edge.target : edge.source;
            const otherNode = this.state.data.nodes.find(n => n.id === otherId);
            const relationLabel = RELATION_LABELS[edge.relation] || edge.relation;
            const mainEvidence = edge.evidence[0];
            const statusInfo = VERIFICATION_LABELS[mainEvidence?.verificationStatus || 'structurally_valid'];

            return `
              <div class="evidence-card" data-edge-id="${edge.id}">
                <div class="evidence-card-title">
                  <span>${isOutgoing ? '→' : '←'} ${relationLabel}: <strong>${this.escapeHtml(otherNode?.label || otherId)}</strong></span>
                  <span class="status-badge ${statusInfo.className}">${statusInfo.label}</span>
                </div>
                ${mainEvidence?.note ? `<div class="evidence-card-note">${this.escapeHtml(mainEvidence.note)}</div>` : ''}
                <div class="evidence-card-meta">
                  <span>来源类型: ${mainEvidence?.sourceType || 'frontmatter'}</span>
                  ${mainEvidence?.doi ? `<span>DOI: <a href="https://doi.org/${encodeURIComponent(mainEvidence.doi)}" target="_blank" rel="noopener">${this.escapeHtml(mainEvidence.doi)}</a></span>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      // 绑定抽屉内事件
      inspector.querySelector('#btn-expand-inspector')?.addEventListener('click', () => {
        this.expandNode(node.id);
      });

      inspector.querySelectorAll<HTMLElement>('.evidence-card[data-edge-id]').forEach(card => {
        card.addEventListener('click', () => {
          const edgeId = card.dataset.edgeId;
          const edge = this.state.data.edges.find(e => e.id === edgeId);
          if (edge) {
            this.state.selectedEntity = { type: 'edge', edge };
            this.render();
          }
        });
      });
      return;
    }

    // 3. 选中边/关系：展示精准学术语义、两端实体与详细证据追溯
    if (selected.type === 'edge') {
      const edge = selected.edge;
      const srcNode = this.state.data.nodes.find(n => n.id === edge.source);
      const tgtNode = this.state.data.nodes.find(n => n.id === edge.target);
      const relationLabel = RELATION_LABELS[edge.relation] || edge.relation;

      inspector.innerHTML = `
        <div class="panel-header-badge">
          <span class="type-tag domain">科学语义关系</span>
          <span class="status-badge source_checked">${edge.relation}</span>
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
          <span>学术证据溯源记录 (${edge.evidence.length})</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${edge.evidence.map(ev => {
            const statusInfo = VERIFICATION_LABELS[ev.verificationStatus] || VERIFICATION_LABELS.structurally_valid;
            return `
              <div class="evidence-card active">
                <div class="evidence-card-title">
                  <span>证据状态: <span class="status-badge ${statusInfo.className}">${statusInfo.label}</span></span>
                  <span style="color:var(--text-muted);font-size:11px;">类型: ${ev.sourceType}</span>
                </div>
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

  updateTopStats() {
    const totalNodesEl = this.container.querySelector('#stat-total-nodes');
    const totalEdgesEl = this.container.querySelector('#stat-total-edges');
    const viewNodesEl = this.container.querySelector('#stat-view-nodes');
    const viewEdgesEl = this.container.querySelector('#stat-view-edges');

    if (totalNodesEl) totalNodesEl.textContent = String(this.state.data.stats.nodesCount);
    if (totalEdgesEl) totalEdgesEl.textContent = String(this.state.data.stats.edgesCount);

    // 计算当前视图中的节点与边
    let visibleNodesCount = 0;
    for (const nid of this.state.visibleNodeIds) {
      const node = this.state.data.nodes.find(n => n.id === nid);
      if (node && this.state.filters.nodeTypes.has(node.type)) {
        if (!this.state.filters.domainId || (node.domainIds && node.domainIds.includes(this.state.filters.domainId)) || node.id === `domain:${this.state.filters.domainId}` || nid === this.state.seedNodeId) {
          visibleNodesCount++;
        }
      }
    }

    const visibleEdgesCount = this.edgesG?.querySelectorAll('.edge-group').length || 0;

    if (viewNodesEl) viewNodesEl.textContent = String(visibleNodesCount);
    if (viewEdgesEl) viewEdgesEl.textContent = String(visibleEdgesCount);
  }

  renderListView() {
    const tableBody = this.container.querySelector<HTMLTableSectionElement>('#list-view-tbody');
    if (!tableBody) return;

    const visibleEdges: KnowledgeEdge[] = [];
    for (const edge of this.state.data.edges) {
      if (this.state.visibleNodeIds.has(edge.source) && this.state.visibleNodeIds.has(edge.target)) {
        if (this.state.filters.relationTypes.has(edge.relation)) {
          visibleEdges.push(edge);
        }
      }
    }

    tableBody.innerHTML = visibleEdges.map(edge => {
      const srcNode = this.state.data.nodes.find(n => n.id === edge.source);
      const tgtNode = this.state.data.nodes.find(n => n.id === edge.target);
      const relationLabel = RELATION_LABELS[edge.relation] || edge.relation;
      const statusInfo = VERIFICATION_LABELS[edge.evidence[0]?.verificationStatus || 'structurally_valid'];

      return `
        <tr>
          <td><strong>${this.escapeHtml(srcNode?.label || edge.source)}</strong></td>
          <td><span class="type-tag domain">${relationLabel}</span></td>
          <td><strong>${this.escapeHtml(tgtNode?.label || edge.target)}</strong></td>
          <td><span class="status-badge ${statusInfo.className}">${statusInfo.label}</span></td>
          <td>${this.escapeHtml(edge.evidence[0]?.note || '')}</td>
        </tr>
      `;
    }).join('');
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
