# PhytoMethods｜植物应用论文与算法关系科学证据核验 V1.2 审计报告

## 一、项目背景与审计目标

PhytoMethods 知识库在经过前期 PR #25–PR #29 的数据关联治理及 PR #33–PR #34 的知识关联图 V2/V2.1 交互设计升级后，知识图谱在结构拓扑上已实现零悬空与零重复。然而在初始数据中，植物应用论文与生物信息学算法之间的 `uses_method` 关系大多基于 Markdown frontmatter 的 `methodIds` 自动映射生成，初始等级为结构有效（`structurally_valid`，共 57 条），仅有 11 条通过特殊策展标记为来源已核实（`source_checked`）。

为避免“为了追求高比例而轻率升级证据”的不良工程倾向，本轮任务（V1.2）对全站全部 **68 条 `uses_method` 关系** 开展了逐篇、逐行、逐工具的严谨科研证据核验。

### 核心核验准则
1. **真实使用 vs 单纯引用**：必须证明论文在自身实验或分析流程中实际运行了该算法，而非在引言或讨论中一般性引证。
2. **实际使用 vs 性能评测**：必须区分生产分析流程与算法横向对比基准评测（基准评测应归为 `evaluates_method`）。
3. **实际使用 vs 算法扩展**：必须区分使用现有工具与对算法核心源码进行扩展加速（扩展应归为 `extends_method`）。
4. **具体实现 vs 算法家族/跨代版本**：必须区分特定软件版本（如 MSMC 1.1.0 vs MSMC2），严禁跨代版本混淆。
5. **拒绝标题关键词推断**：禁止仅凭论文标题含有“improve”、“comparative”或正文出现软件名就自动赋予 `source_checked`。

---

## 二、全量审核统计对比

| 指标维度 | 审计前 (PR #34) | 审计后 (V1.2) | 变化说明 |
| :--- | :---: | :---: | :--- |
| **`uses_method` 关系总数** | 68 条 | **67 条** | 1 条核实为横向评测关系，精确调整为 `evaluates_method` |
| ├─ `source_checked` (来源已核实) | 11 条 | **66 条** | 既有 11 条全部复核无误，新增 55 条确凿文献来源登记 |
| ├─ `structurally_valid` (结构有效待核) | 57 条 | **0 条** | 全部 57 条原有关系均给出明确核查结论 |
| └─ `needs_review` (存在疑问需复查) | 0 条 | **1 条** | `african-rice-246-genomes` 实际使用 MSMC v1，存跨代对应疑问 |
| **`evaluates_method` 关系总数** | 5 条 | **6 条** | 新增 `rice-variant-comparison` ➔ `bcftools` 评测关系 |
| **全图谱实体节点总数** | 303 个 | **303 个** | 保持不变 |
| **全图谱语义关系边总数** | 740 条 | **740 条** | 保持不变 (语义再分类，0 悬空，0 重复) |
| **全图谱证据记录总数** | 798 条 | **798 条** | 来源已核实率由 67.8% (541/798) 升至 **74.8% (597/798)** |

---

## 三、发现的核心科学问题与纠正措施

在对 34 篇论文涉及的 68 条关系进行逐篇核查后，发现并纠正了以下关键科学问题：

### 1. 混淆“基准评测比较”与“生产使用流程”
- **涉事文献**：`paper:rice-variant-comparison` (Balimponya et al., *Plant Methods* 2025, DOI: [10.1186/s13007-025-01437-x](https://doi.org/10.1186/s13007-025-01437-x))
- **涉及算法**：`method:bcftools`
- **原问题**：该文献在前期被赋予 `uses_method` 关系。
- **事实考证**：论文旨在评估从 Illumina 短读段中检测水稻杂合 SNP 的准确度，将 BWA-MEM2 / Bowtie2 与 GATK4.3 HaplotypeCaller / BCFtools mpileup 的 4 种组合在同 DNA 重复测序试验中开展对比。试验表明 BCFtools mpileup 的跨重复相似度仅为 66.5%–71.5%（远低于 GATK4 的 99% 以上），论文后续生产分析全面采用 GATK4，结论明确未选择 BCFtools 作为生产流程。
- **纠偏结论**：将关系类型从 `uses_method` 修正为 **`evaluates_method`**，并赋予 `source_checked` 等级，记录在 `curated-relations.ts` 中。

### 2. 软件版本代际差异与算法家族对应疑问
- **涉事文献**：`paper:african-rice-246-genomes` (Cubry et al., *Current Biology* 2018, DOI: [10.1016/j.cub.2018.05.066](https://doi.org/10.1016/j.cub.2018.05.066))
- **涉及算法**：`method:msmc2`
- **原问题**：关联关系标为 `uses_method`，若简单根据正文提及即升级为 `source_checked`，将掩盖版本代际矛盾。
- **事实考证**：Cubry 等发表于 2018 年，STAR Methods 明确说明运行的是 Stephan Schiffels 和 Richard Durbin 2014 年发布的 MSMC 1.1.0 算法处理自交单倍型构成的伪二倍体；而本站工具节点为 `msmc2`（MSMC2 于 2020 年由 Schiffels & Wang 正式发布）。两代软件在隐马尔可夫状态数、算法架构与输入格式上存在实质性差异。
- **纠偏结论**：**严禁虚假升级为 `source_checked`**。严格保留 `uses_method` 语义，但将证据状态标记为 **`needs_review`**，明确记录“论文实际使用 MSMC v1 而非 MSMC2，本站尚无独立 MSMC v1 工具节点，存在跨代对应疑问”。

### 3. 既有 11 条 `source_checked` 关系的全面独立复核
对前期 PR #28 中录入的 11 条 `uses_method` 已核实关系开展二次独立核验：
1. `rice-gapit-2023` ➔ `gapit`: 确认实际用于水稻 GWAS 育种标记分析（非修改算法）。
2. `maize-drought-deseq2-2019` ➔ `deseq2`: 确认实际用于两品种玉米叶片干旱转录组差异分析（非评测软件）。
3. `sorghum-pangenome-reference-2026` ➔ `minigraph-cactus`: 确认用于构建 33 份高粱泛基因组序列图。
4. `sorghum-pangenome-reference-2026` ➔ `vg`: 确认用于图索引与图结构分析。
5. `sorghum-pangenome-reference-2026` ➔ `odgi`: 确认用于拓扑结构与路径指标统计。
6. `maize-domestication` ➔ `xpclr`: 确认用于玉米驯化与改良过程的选择性清除多位点扫描。
7. `sorghum-graph-benchmark` ➔ `syri`: 确认评测框架中实际使用 SyRI 分析组装间变异基准。
8. `sorghum-graph-benchmark` ➔ `vg`: 确认实际调用 vg deconstruct 解析图路径变异。
9. `sorghum-graph-benchmark` ➔ `odgi`: 确认用于图展平与覆盖度增长统计。
10. `mam-positive-selection-2006` ➔ `paml`: 确认实际运行 PAML 3.14 codeml 比较分支位点 Model A 与空模型。
11. `rice-roots-population` ➔ `gapit`: 确认实际运行 GAPIT 计算 795 份材料的前 3 个 PC 与 Kinship 亲缘矩阵。
- **复核结论**：既有 11 条关系全部具有高可信度直接文献出处，描述完全科学准确，予以 100% 确认保留。

---

## 四、新增结构化证据登记表架构与数据映射

本轮新建了工程化证据登记表：
- **文件路径**：`src/lib/knowledge/verified-application-methods.ts`
- **数据结构**：
  ```typescript
  export interface VerifiedApplicationMethod {
    paperId: string;
    methodId: string;
    relation: 'uses_method';
    sourceUrl: string;
    doi?: string;
    sourceSection?: string;
    softwareVersion?: string;
    analysisPurpose: string;
    evidenceSummary: string;
    verificationStatus: 'source_checked';
    sourceType: 'paper';
    verifiedAt: string;
  }
  ```
- **核心逻辑集成**（`src/lib/knowledge/relation-resolver.ts`）：
  在解析文献与方法关系时，优先匹配 `findCuratedRelation`（处理特殊扩展/评测/历史版本），随后匹配 `findVerifiedApplicationMethod`。一旦命中，自动注入包含**分析目的、版本信息、出处章节与文献 DOI** 的完整结构化证据对象，赋予 `source_checked` 状态。未登记条目严禁擅自升级。

---

## 五、无法完成核实或存疑的关系清单

针对本次审计中无法无保留升级的关系，生成独立清单存入 `outputs/evidence-audit-v1.2/unresolved-relations.csv`：

| 论文 ID | 论文标题 | 年份 | DOI | 工具 ID | 发现问题 | 已查证材料 | 缺少材料与后续建议 |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- | :--- |
| `african-rice-246-genomes` | The Rise and Fall of African Rice Cultivation Revealed by Analysis of 246 New Genomes | 2018 | `10.1016/j.cub.2018.05.066` | `msmc2` | 版本跨代差异 | STAR Methods (P. Cubry et al., 2018) | 原文实际运行 MSMC 1.1.0 (2014)，而非 MSMC2 (2020)。建议在工具库中补充 `msmc` 独立节点或建立时序别名映射；当前严格保持 `needs_review`。 |

---

## 六、自动化防失真测试体系与回归校验

为确保未来内容迭代时证据等级不发生退化或虚假膨胀，新增专用自动化测试套件：
- **脚本路径**：`scripts/test-application-method-evidence.mjs`
- **NPM 指令**：`npm run test:application-evidence`（已正式集成至 `npm run validate` 门禁中）。
- **涵盖的 12 项确定性断言**：
  1. 登记表论文 ID 真实存在于 `src/content/papers/` 中。
  2. 登记表方法 ID 真实存在于 `src/content/methods/` 中。
  3. 登记表关系类型严格为 `uses_method`，状态严格为 `source_checked`。
  4. 来源字段完整性（`sourceUrl`、`analysisPurpose`、`evidenceSummary`、`verifiedAt` 格式与长度校验）。
  5. 严禁重复登记同一论文与工具对（0 duplicate pairs）。
  6. 全图谱中所有 `source_checked` 应用边必须能追溯至登记表或策展库。
  7. 登记表 55 条关系与图谱构建输出 100% 对应。
  8. 证据状态统计与图谱统计数据完全吻合。
  9. 图谱拓扑 0 悬空边。
  10. 图谱拓扑 0 重复边。
  11. PAML 2006 与 GAPIT 2018 等历史时序保护规则持续有效。
  12. 未登记关系绝不会被意外升级为 `source_checked`（防篡改门禁）。

---

## 七、全套测试与验收执行日志

```text
> npm run test:application-evidence
=== PhytoMethods 植物应用论文与算法证据防失真测试 V1.2 ===
✓ 测试 1 通过: 全部 55 条登记的论文 ID 均真实存在于文献库中
✓ 测试 2 通过: 全部 55 条登记的算法工具 ID 均真实存在于方法库中
✓ 测试 3 通过: 登记表关系类型与核验等级规范性校验 100% 合法
✓ 测试 4 通过: 全部证据登记条目的出处链接、分析目的、证据摘要与时间戳 100% 完整
✓ 测试 5 通过: 登记表中 0 项重复条目，严格保证单射唯一性
✓ 测试 6 通过: 图谱中全部 66 条 source_checked 应用关系均具备直接来源证据溯源
✓ 测试 7 通过: 登记表 55 条关系与图谱构建输出 100% 对应
✓ 测试 8 通过: 证据状态统计与图谱统计数据完全吻合
✓ 测试 9 & 10 通过: 图谱 0 悬空边、0 重复边，拓扑结构完全闭环
✓ 测试 11 通过: PAML 2006 与 GAPIT 2018 等历史时序保护规则持续有效
✓ 测试 12 通过: 未经核验登记的关系绝不会自动升级为 source_checked，防篡改门禁生效
🎉 全部 12 项植物应用论文与算法证据防失真测试 100% 顺利通过！

> npm run test:knowledge-integrity
=== PhytoMethods 知识图谱完整性与科学语义测试 V1.1.2 ===
✓ 断言 1–13 全部 100% 通过！

> npm run test:knowledge-v2
=== 开始 PhytoMethods 知识关联图 V2.1 专项自动化回归测试 ===
✓ 全部 21 项专项自动化测试断言 100% 顺利通过！
```

---

## 八、输出归档文件索引

本轮审计产生的数据与报表均已完整归档：
- [application-method-inventory.json](file:///C:/Users/31764/.gemini/antigravity/scratch/phytomethods/outputs/evidence-audit-v1.2/application-method-inventory.json)：审计前 68 条关系基准快照。
- [application-method-inventory.csv](file:///C:/Users/31764/.gemini/antigravity/scratch/phytomethods/outputs/evidence-audit-v1.2/application-method-inventory.csv)：审计前 68 条关系表格清单。
- [evidence-review.json](file:///C:/Users/31764/.gemini/antigravity/scratch/phytomethods/outputs/evidence-audit-v1.2/evidence-review.json)：68 条关系的完整审核结论与科学元数据。
- [evidence-review.csv](file:///C:/Users/31764/.gemini/antigravity/scratch/phytomethods/outputs/evidence-audit-v1.2/evidence-review.csv)：68 条关系的逐项审查对比表。
- [unresolved-relations.csv](file:///C:/Users/31764/.gemini/antigravity/scratch/phytomethods/outputs/evidence-audit-v1.2/unresolved-relations.csv)：存疑待复查关系清单。
- [knowledge-graph-v2.json](file:///C:/Users/31764/.gemini/antigravity/scratch/phytomethods/outputs/knowledge-graph-v2.json)：更新后的正式图谱数据。
