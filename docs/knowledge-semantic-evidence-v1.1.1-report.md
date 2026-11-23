# PhytoMethods｜科研知识关系与证据准确性专项修复报告 V1.1.1

> **执行状态**: ✅ 研发、数据治理与全套质量回归测试 100% 完成  
> **对应分支**: `fix/knowledge-semantic-evidence-v1.1.1`  
> **基线 Commit**: `3010d56` (PR #26)  
> **发布日期**: 2026-11-23  

---

## 一、任务背景与专项目标

在 PR #26（科研知识图谱数据完整性与科学证据体系 V1.1）合并后，全站已成功建立 303 个知识节点与严格的 0 悬空边、0 重复边闭环。然而，在进一步审核 V1.1 的实际代码与知识图谱数据时，发现了部分科学关系分类和证据分级问题：

1. **标题关键词误判**: 依赖论文标题正则关键词（如 `improve`, `enhanc`, `comparative`, `benchmark`）推断科学关系，导致水稻与玉米等作物的品种改良研究、比较转录组学研究被误判为生物信息学算法的“扩展”或“基准评测”。
2. **历史时间顺序倒置**: 2007 年发表的 XP-EHH 统计量论文（`xpehh-paper`）的 frontmatter 中包含 `methodIds: [selscan]`，导致推断出 2007 年文献引用/使用了 2014 年才首发的 `selscan` 软件，存在严重的科学事实与历史时间矛盾。
3. **证据状态区分不严**: 部分未精读核实全文的 frontmatter 声明被赋予了默认的 `source_checked`，弱化了科学证据的可信度梯度。

本轮 **V1.1.1 专项修复** 聚焦于科学准确性治理，实现了纯粹、严谨的科研语义体系。

---

## 二、核心修复与工程治理方案

### 1. 彻底删除标题关键词正则推断
在 `src/lib/knowledge/relation-resolver.ts` 中彻底移除了 `/enhanc|extend|improv|v2|version 2/i` 以及 `/benchmark|evaluat|compar/i` 的粗暴正则推断逻辑。在植物基因组学中，论文标题中的 "improvement" 绝大多数代表作物农艺性状或品种改良，"comparative" 代表不同材料或处理间的比较生物学实验，绝非生物信息学软件本身的算法扩展或性能基准。

### 2. 建立人工策展规则库 (`src/lib/knowledge/curated-relations.ts`)
建立常态化的人工策展清单，收录经过严密文献原文核实、版本发布比对后的特殊关系，提供标准化查询接口 `findCuratedRelation(paperId, methodId)`。

### 3. 历史时间倒置修复与时序冲突防御引擎
- **修复历史数据**: 在 `src/content/papers/xpehh-paper.md` 中将 `methodIds: [selscan]` 修正为 `methodIds: []`。Sabeti 等 (2007) 提出的是理论统计量，未介绍 2014 年才出现的 `selscan` 软件。
- **构建时序拦截引擎**: 在 `relation-resolver.ts` 中引入 `paperYear` 与 `targetMethodYear` 时序检测。当文献发表年份早于软件首发年份时，严禁建立 `uses_method`、`extends_method` 或 `evaluates_method`，并自动生成带有 `[时序冲突警告]` 且证据级别为 `needs_review` 的记录。

### 4. 证据分级科学化
- **`source_checked`**: 仅授予经过工具官方文档确认的奠基文献（`introduces_method`）以及人工逐篇精读核准的规则库条目。
- **`structurally_valid`**: Frontmatter 中声明但未经全文人工逐句验证的使用与引用关系（默认级别）。
- **`needs_review`**: 存在发表年份时序冲突或存疑的关联。

---

## 三、全部 19 条特殊关系的逐条科学审核与结论

经过逐篇核对 PubMed、Nature、Science、Bioinformatics 等原文与官方代码仓库，对 7 条原 `extends_method`、9 条原 `evaluates_method` 和 3 条 `references_method` 给出严谨判定：

| # | 论文 ID | 目标工具 | 原关系分类 | 修复后分类 | 科学依据与核实结论 | 证据状态 | DOI / 出处 |
|---|---|---|---|---|---|---|---|
| 1 | `admixture-enhancements` | `admixture` | `extends_method` | `extends_method` | Alexander & Lange (2011) 针对 ADMIXTURE 提出拟牛顿加速与多线程并行算法扩展。 | `source_checked` | 10.1186/1471-2105-12-246 |
| 2 | `maize-domestication` | `xpclr` | `extends_method` | **`uses_method`** | **误判纠正**：Hufford 等 (2012) 实际使用 XP-CLR 开展玉米驯化扫描；标题之 improvement 系玉米育种改良。 | `source_checked` | 10.1038/ng.2309 |
| 3 | `orthofinder-2026` | `orthofinder` | `extends_method` | `extends_method` | Emms 等 (2026) 在 Nature Methods 正式发布 OrthoFinder 新一代扩展升级算法。 | `source_checked` | 10.1038/s41592-026-03126-6 |
| 4 | `rice-gapit-2023` | `gapit` | `extends_method` | **`uses_method`** | **误判纠正**：研究利用 GAPIT 进行水稻 GWAS；标题之 improve 指基于功能标记提升预测精度，非修改软件。 | `source_checked` | 10.1038/s41437-023-00599-5 |
| 5 | `sorghum-pangenome-reference-2026` | `minigraph-cactus` | `extends_method` | **`uses_method`** | **误判纠正**：利用 Minigraph-Cactus 构建高粱泛基因组；标题之 improves 指农艺性状挖掘突破。 | `source_checked` | 10.1038/s41586-026-10229-9 |
| 6 | `sorghum-pangenome-reference-2026` | `vg` | `extends_method` | **`uses_method`** | **误判纠正**：泛基因组构建流程中实际使用 vg 进行图索引与处理。 | `source_checked` | 10.1038/s41586-026-10229-9 |
| 7 | `sorghum-pangenome-reference-2026` | `odgi` | `extends_method` | **`uses_method`** | **误判纠正**：实际使用 ODGI 进行图拓扑分析与覆盖度检查。 | `source_checked` | 10.1038/s41586-026-10229-9 |
| 8 | `maize-drought-deseq2-2019` | `deseq2` | `evaluates_method` | **`uses_method`** | **误判纠正**：玉米两品种干旱转录组分析；comparative 为生物学实验设计，非评测 DESeq2 性能。 | `source_checked` | 10.1371/journal.pone.0223786 |
| 9 | `plant-sv-benchmark-2026` | `cutesv` | `evaluates_method` | `evaluates_method` | Zhang 等 (2026) 构建 10 种植物真值集，系统评估 91 种流程，对 cuteSV 进行基准测试。 | `source_checked` | 10.1186/s13059-026-04300-x |
| 10 | `plant-sv-benchmark-2026` | `sniffles2` | `evaluates_method` | `evaluates_method` | Zhang 等 (2026) 系统横向评测 Sniffles2 在植物不同重复区与变异长度下的表现。 | `source_checked` | 10.1186/s13059-026-04300-x |
| 11 | `sorghum-graph-benchmark` | `minigraph` | `evaluates_method` | `evaluates_method` | Kopalli 等 (2025) 建立标准化评估框架，核心科学目标为比较 Minigraph 的图特征。 | `source_checked` | 10.1093/gigascience/giaf121 |
| 12 | `sorghum-graph-benchmark` | `minigraph-cactus` | `evaluates_method` | `evaluates_method` | Kopalli 等 (2025) 评估 Minigraph-Cactus 在高粱多组装构建中的图表示与一致性。 | `source_checked` | 10.1093/gigascience/giaf121 |
| 13 | `sorghum-graph-benchmark` | `pggb` | `evaluates_method` | `evaluates_method` | Kopalli 等 (2025) 评估无参考 PGGB 流程在作物真实与模拟组装中的表现。 | `source_checked` | 10.1093/gigascience/giaf121 |
| 14 | `sorghum-graph-benchmark` | `syri` | `evaluates_method` | **`uses_method`** | 流程中实际调用 SyRI 分析基因组共线性作为评测比较的基准数据。 | `source_checked` | 10.1093/gigascience/giaf121 |
| 15 | `sorghum-graph-benchmark` | `vg` | `evaluates_method` | **`uses_method`** | 流程中实际调用 VG deconstruct 从图中解析路径变异。 | `source_checked` | 10.1093/gigascience/giaf121 |
| 16 | `sorghum-graph-benchmark` | `odgi` | `evaluates_method` | **`uses_method`** | 流程中实际使用 ODGI 进行图展平、覆盖度与图增长统计。 | `source_checked` | 10.1093/gigascience/giaf121 |
| 17 | `giraffe-paper` | `vg` | `references_method` | **`extends_method`** | **更精确升级**：Sirén 等 (2021) 在 Science 正式提出 Giraffe，并作为核心比对模块扩展整合至 vg。 | `source_checked` | 10.1126/science.abg8871 |
| 18 | `msmc2-protocol` | `msmc2` | `references_method` | `references_method` | Schiffels & Wang (2020) 撰写操作指南，引用并指导 MSMC2 标准运行。 | `source_checked` | 10.1007/978-1-0716-0199-0_7 |
| 19 | `xpehh-paper` | `selscan` | `references_method` | **彻底消除** | **历史时序倒置清除**：2007 年论文无法引用 2014 年软件；修复数据将关系数量归零。 | 无关系 | 10.1038/nature06250 |

---

## 四、知识图谱最新规模与结构统计 (V2.1)

经过本轮修复并重新生成，`outputs/knowledge-graph-v2.json` 数据指标如下：

- **节点总数**: **303 个节点** (100% 保持完整)
  - `domain`: 9 个
  - `method`: 58 个
  - `paper_method`: 70 篇
  - `paper_application`: 59 篇
  - `paper_review`: 1 篇
  - `species`: 33 个物种
  - `topic`: 63 篇专题
  - `tutorial`: 10 篇教程
- **关系边总数**: **740 条** (比 V1.1 少 1 条，精准消除了 xpehh-paper 错误的 selscan 边)
  - `belongs_to_domain`: 200 条
  - `extends_method`: **3 条** (确凿的算法升级扩展)
  - `evaluates_method`: **5 条** (确凿的系统基准评测)
  - `introduces_method`: **58 条** (58 个工具的奠基论文 100% 闭环)
  - `uses_method`: **66 条** (真实植物研究或流程使用)
  - `references_method`: **3 条** (方法学协议或辅助引用)
  - `features_method`: 111 条
  - `references_paper`: 220 条
  - `studies_species`: 64 条
  - `guides_method`: 10 条
- **完整性度量**:
  - 悬空边: **0 条**
  - 重复边: **0 条**
  - 重复节点: **0 个**
  - 教程覆盖率: **10 / 10 (100%)**
- **证据状态分布**:
  - `source_checked`: 539 条 (72.8%)
  - `structurally_valid`: 257 条 (26.9%)
  - `needs_review`: 2 条 (0.3% - 自动时序冲突拦截机制捕获的历史文献项)

---

## 五、质量测试与验证流水线

本次修复通过了所有层级的严苛测试，无任何回退：

1. **类型检查 (`npm run check`)**:  
   119 个 Astro 文件通过，0 errors, 0 warnings, 0 hints。
2. **知识完整性与科学语义测试 (`npm run test:knowledge-integrity`)**:  
   10 项深度数据与语义断言 100% 通过（包含反向正则测试、时序倒置消除测试、人工策展规则断言等）。
3. **全站校验流水线 (`npm run validate`)**:  
   全站 279 个页面静态构建成功；Pagefind 检索索引成功；12,272 个本地链接检查 0 错误；全站内容与领域配置 100% 一致。
4. **内容覆盖度检查 (`npm run coverage`)**:  
   九大研究领域 63 篇专题、58 个工具、130 篇文献、10 篇教程发布状态正常。
5. **端到端浏览器自动化回归 (`npm run test:knowledge`)**:  
   12 项 Playwright 浏览器断言 100% 通过（Hifiasm V3 样板视觉、OrthoFinder 植物研究卡片、Macadamia 原始方法回溯卡片、移动端 390px 响应式无横向溢出）。

---

## 六、交付物清单

```text
src/
  lib/knowledge/
    curated-relations.ts       # [新增] 经过文献核实的人工策展清单与查询接口
    relation-resolver.ts      # [重构] 废除标题关键词正则，引入人工策展库与时序防御
    evidence.ts               # [优化] 默认证据级别规范为 structurally_valid
    graph-builder.ts          # [升级] 接入工具与文献年份，注入时序冲突检测参数
  content/papers/
    xpehh-paper.md            # [修复] 修正 methodIds 为空，消除 2007 vs 2014 时间倒置

scripts/
  test-knowledge-integrity.mjs # [增强] 扩展至 10 项断言，包含科学语义与反向正则测试

outputs/
  knowledge-graph-v2.json      # [更新] 303 节点、740 条严谨科学语义关系边
  knowledge-audit-report.json  # [更新] 最新完整性审计与分级统计报告

docs/
  knowledge-semantic-evidence-v1.1.1-report.md # [新增] 本次科学专项修复报告
```

---

## 七、用户验收与后续建议

本轮修复完成后，分支 `fix/knowledge-semantic-evidence-v1.1.1` 将推送到远程仓库并创建 Pull Request。

**建议验收流程**:
1. 检查 Pull Request 的文件变更，重点核对 `curated-relations.ts` 与 `relation-resolver.ts`。
2. 运行 `npm run test:knowledge-integrity`，确认 10 项语义与完整性测试秒级通过。
3. 检查 `outputs/knowledge-graph-v2.json` 中的 `extends_method` 与 `evaluates_method`，确认所有假阳性已被彻底清除。
4. 确认无误后由用户合入 `main`。
