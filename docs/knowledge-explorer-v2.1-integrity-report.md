# PhytoMethods｜知识关联图 V2.1 交互逻辑与科学证据展示专项修复报告

## 一、任务背景与原有问题清单

在 PR #33（科研知识关联图 V2）完成上线后，经对实际运行环境与源代码的严格审查，发现以下 7 项交互逻辑与证据表达缺陷：

1. **缺失科学关系类型筛选控件**：前端引擎已具备关系筛选逻辑，但界面缺乏对应 10 种科学关系的多选/全选/清空控件。
2. **图谱模式与列表模式筛选不一致**：`renderListView` 未复用 `renderCanvas` 的多维筛选逻辑，导致用户在画布中隐藏某些实体后，切换列表模式仍能看到已被过滤的关系。
3. **遗漏综述论文实体类型（`paper_review`）**：默认可见实体类型集合与左侧筛选面板漏掉了唯一的综述论文节点，使该合法知识节点无法被常规过滤检索。
4. **切换网络或筛选后详情残留**：切换预设网络（如从 Hifiasm 切换到 OrthoFinder）时，未重置选中的实体，导致右侧依然展示上一个网络的详情；且节点被筛选隐藏后右侧详情未清空。
5. **无障碍与全键盘操作缺失**：SVG 节点与连线未提供 `tabindex`、`role="button"` 及键盘 Enter/Space 选中响应；搜索下拉候选不支持键盘上下键与 Enter 选择。
6. **科学证据徽标滥用与说明不准确**：普通元数据（节点 ID、关系 ID、版本号等）误用了表示证据已核实的绿色 `status-badge source_checked` 样式；多证据关系仅展示 `edge.evidence[0]`。
7. **硬编码数据统计**：页面中存在直接写死的 303、740、798、541、257、67.8%、32.2% 等数值。

本轮任务（V2.1）针对上述问题开展了端到端的系统级修复。

---

## 二、各项任务修复与技术实现

### 1. 任务 A：补全 10 种科学关系类型筛选
- **修改文件**：`src/components/knowledge-v2/KnowledgeFilterPanel.astro`、`src/lib/knowledge/graph-client.ts`。
- **实现内容**：
  - 在左侧控制台新增“科学关系类型筛选”区块，提供全部 10 种真实关系类型的 Checkbox。
  - 每项关系均实时展示其在图谱中的真实统计数量（`stats.edgesByRelation[type]`）。
  - 提供「全选」与「清空」便捷操作按钮，重置筛选时自动恢复全选。
  - 勾选与取消即时触发统一子图重算，图谱与列表同步刷新。

### 2. 任务 B：抽取统一子图过滤函数（VisibleSubgraph）
- **修改文件**：`src/lib/knowledge/graph-client.ts`。
- **实现内容**：
  - 抽取统一过滤方法 `computeVisibleSubgraph(): VisibleSubgraph`。
  - 严格按照：`节点类型筛选` ➔ `领域筛选` ➔ `关系类型筛选` ➔ `证据状态筛选` ➔ `孤立节点规则` 进行双向剪裁。
  - **孤立节点规则**：中心种子节点始终保留锚定，其他外围节点若因关系类型或证据状态过滤导致失去全部连接，则在子图与列表中同步隐藏，杜绝孤立节点。
  - SVG 画布、列表表格、当前视图统计（节点数/关系数）、高亮计算、右侧抽屉中的当前子网关联关系，**100% 复用完全相同的过滤结果**。

### 3. 任务 C：补全综述论文节点（`paper_review`）
- **修改文件**：`src/components/knowledge-v2/KnowledgeFilterPanel.astro`、`src/lib/knowledge/graph-client.ts`、`src/components/knowledge-v2/knowledge-v2.css`。
- **实现内容**：
  - 将 `paper_review` 纳入默认可见实体类型与全选集合。
  - 左侧控制台新增“综述论文”筛选项，配置专属紫色徽标（`color: #7B1FA2, bg: #F3E8FD`）。
  - 综述论文（如 `paper:plant-dna-methylation-review-2021`）支持全局搜索即时定位、节点选中、关联拓扑展示以及站内详情页直达跳转。

### 4. 任务 D：修复切换网络与筛选隐藏后的状态残留
- **修改文件**：`src/lib/knowledge/graph-client.ts`。
- **实现内容**：
  - 在 `initDefaultSeed(seedId)` 中，重置种子节点时将 `selectedEntity` 明确置为 `null`，重置视口位置，右侧面板即刻恢复为图谱宏观概览，彻底杜绝上一网络详情残留。
  - 在 `focusOnNode(nodeId)` 搜索定位后，自动将目标节点设为选中态并展开其详情。
  - 在 `computeVisibleSubgraph()` 执行时，实时校验当前选中的节点或关系是否依然存在于过滤后的子图中，若已被隐藏则自动置为 `null` 并重置抽屉。

### 5. 任务 E：完善全键盘操作与无障碍 ARIA 支持
- **修改文件**：`src/components/knowledge-v2/KnowledgeCanvas.astro`、`src/components/knowledge-v2/KnowledgeFilterPanel.astro`、`src/lib/knowledge/graph-client.ts`、`src/components/knowledge-v2/knowledge-v2.css`。
- **实现内容**：
  - **SVG 节点**：添加 `tabindex="0"`, `role="button"`, `aria-label`, `aria-pressed`，监听 `Enter` 和 `Space` 键触发选中，右上角加号展开按钮具备独立键盘访问。
  - **SVG 连线**：添加 `tabindex="0"`, `role="button"`, `aria-label`（包含起始与目标实体名称），监听 `Enter` 和 `Space` 键直接打开证据抽屉。
  - **清晰可见的高亮焦点**：为 `:focus-visible` 添加 `3px` 森林深绿焦点环与投影。
  - **搜索框 Combobox**：增加 `role="combobox"`, `aria-autocomplete="list"`, `aria-controls`，支持 `ArrowDown` / `ArrowUp` 键盘切换高亮候选项、`Enter` 选择候选并聚焦、`Escape` 关闭下拉。
  - **列表模式**：表格行具备 `tabindex="0"`, `role="button"`，支持键盘 `Enter` 键直接查看科学证据。

### 6. 任务 F：规范科学证据徽标、说明与多证据展示
- **修改文件**：`src/components/knowledge-v2/KnowledgeInspector.astro`、`src/lib/knowledge/graph-client.ts`、`src/components/knowledge-v2/knowledge-v2.css`。
- **实现内容**：
  - **普通元数据中性化**：新增 `.meta-badge` 灰色中性标签样式，用于显示节点 ID、关系 ID、Schema 版本号与证据数量，严禁滥用绿色核验样式。
  - **证据说明准确化**：更新说明文本为：“来源已核实：该关联具有已核对的文献、官方资料或明确策展记录。”。
  - **多证据关系逐条展示**：遍历关系的全部证据记录，逐一展示其来源类型、`sourceId`、出版 DOI、官方链接、核验说明与真实状态徽标。

### 7. 任务 G：消除硬编码数据统计
- **修改文件**：`src/pages/knowledge/index.astro`、`src/components/knowledge-v2/KnowledgeFilterPanel.astro`、`src/components/knowledge-v2/KnowledgeInspector.astro`、`src/lib/knowledge/graph-client.ts`。
- **实现内容**：
  - 所有全局节点数（303）、关系数（740）、证据数（798）、证据状态（541 / 257）与比例（67.8% / 32.2%）全部从 `graphData.stats` 动态读取并传参渲染，彻底移除了所有写死的数值。
  - 当前视图数量随子图过滤动态精准更新。

### 8. 任务 I：接入 GitHub Actions CI
- **修改文件**：`.github/workflows/ci.yml`。
- **实现内容**：
  - 在 PR 验证工作流中增加 Playwright Chromium 无头浏览器依赖安装与执行步骤：
    ```yaml
    - name: Install Playwright Chromium
      run: npx playwright-core install --with-deps chromium

    - name: Run Knowledge Explorer V2 Browser Regression Test
      run: npm run test:knowledge-v2
    ```
  - `scripts/browser-test-knowledge-v2.mjs` 具备跨平台查找能力，在 Linux CI runner 上自动加载 Playwright Chromium，且仅在本地存在 Artifact 目录时执行同步，CI 环境下安全退出并返回正确退出码。

---

## 三、专项自动化回归测试结果

执行 `npm run test:knowledge-v2`，21 项自动化断言 **100% 通过**：

```text
[Test Server] Ready at http://127.0.0.1:4488/phytomethods

=== 开始 PhytoMethods 知识关联图 V2.1 专项自动化回归测试 ===

✓ 测试 1 通过: 默认 Hifiasm 网络加载成功 (画布节点: 14, 连线: 21)
✓ 测试 2 通过: 全局动态统计 (303 节点, 740 关系) 与当前视图 (14 节点, 21 关系) 一致
✓ 测试 3 通过: 点击 Hifiasm 节点成功，右侧面板展示: "Hifiasm"
✓ 测试 4 通过: 普通元数据 ID 与版本号已正确应用中性标签样式
✓ 测试 5 通过: 多证据关联卡片已支持多条证据状态完整列出
✓ 测试 6 通过: 点击边连线成功，右侧面板展示科学语义关系与证据溯源
✓ 测试 7 通过: 局部展开网络成功 (节点数由 14 增至 17)
✓ 测试 8 通过: 切换预设网络后旧详情状态彻底清除并重置概览
✓ 测试 9 通过: 搜索候选键盘操作 (ArrowDown / Enter) 成功定位: "OrthoFinder"
✓ 测试 10 通过: 综述论文节点可搜索且详情联动成功: "Dynamics of DNA Methylation and Its Functions in Plant Growth and Development"
✓ 测试 11 通过: 重置全部筛选成功恢复默认状态
✓ 测试 12 通过: 实体类型过滤后图谱与列表完全一致 (可见边: 11 条)
✓ 测试 13 通过: 10 种科学关系多选、清空与全选过滤测试通过
✓ 测试 14 通过: 领域筛选过滤测试通过 (剩余节点: 10)
✓ 测试 15 通过: 证据级别筛选测试通过 (来源已核实边: 11)
✓ 测试 15b 通过: 节点被筛选隐藏后右侧详情自动清空并重置为概览
✓ 测试 16 通过: SVG 节点键盘 Tab 与 Enter 键选中测试通过
✓ 测试 17 通过: 列表视图表格行键盘 Enter 键打开证据详情: "归属领域"
✓ 测试 18 通过: 画布缩放与复位居中控制正常
✓ 测试 19 通过: 1280px 桌面端布局测试通过
✓ 测试 20 通过: 1024px 平板端布局测试通过
✓ 测试 21 通过: 390px 移动端无横向溢出检测 (scrollWidth: 390, clientWidth: 390)

🎉 全部 21 项专项自动化测试断言 100% 顺利通过！
```

---

## 四、全站质量体系校验

1. `npm run check`: **0 errors, 0 warnings, 0 hints**
2. `npm run build`: **279 个页面成功静态构建**
3. `npm run validate`: **11,574 个站内链接 0 错误；首页、领域与专题 Markdown 100% 通过**
4. `npm run audit:knowledge`: **303 节点、740 关系严格闭环**
5. `npm run test:knowledge-integrity`: **13 项时序与语义断言 100% 通过**
6. `npm run test:knowledge-v2`: **21 项浏览器交互专项断言 100% 通过**

---

## 五、交付结论与 PR 状态

- **PR 分支**：`fix/knowledge-explorer-v2.1-integrity`
- **代码状态**：全部代码已就绪并通过完整性验证，未触碰任何受保护的教程、论文正文或专题数据文件。
- **PR 交付**：保持 OPEN 状态，等待用户最终审查验收。
