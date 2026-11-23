# PhytoMethods｜软件版本时序与科学证据准确性修复报告 V1.1.2

> **执行状态**: ✅ 研发、时序模型重构、数据治理与全套质量回归测试 100% 完成  
> **对应分支**: `fix/knowledge-version-chronology-v1.1.2`  
> **基线 Commit**: `07e9832` (main 最新基线)  
> **发布日期**: 2026-11-23  

---

## 一、修复概述

在 PR #28 (V1.1.1) 中，全站建立了 10 项科学关系语义完整性校验并清除了标题正则误判与时间倒置。但在时序检查逻辑中，系统直接将工具当前关联的代表性方法学文献年份（`canonicalPaperYear`，如 PAML 4 的 2007 年、GAPIT 3 的 2021 年）视为工具的“首发年份”，导致将两篇真实使用早期软件版本的科研论文误报为时序冲突并降级为 `needs_review` 的引用关系：

1. **PAML 误报**: 2006 年发表的拟南芥 MAM 基因簇次生代谢演化论文（`mam-positive-selection-2006`）实际使用 **PAML 3.14** 运行密码子选择模型，被 2007 年的 PAML 4 论文误判为时序冲突。
2. **GAPIT 误报**: 2018 年发表的水稻根系群体适应性演化论文（`rice-roots-population`）实际使用 **GAPIT** 计算主成分 (PCA) 与亲缘矩阵 (kinship matrix) 作为 GWAS 协变量，被 2021 年的 GAPIT 3 论文误判为时序冲突。

### 核心修复方案
1. **建立软件版本时序模型 (`src/lib/knowledge/chronology.ts`)**:  
   明确区分软件首次发布年份 (`firstReleaseYear`)、已知历史版本 (`knownVersions`) 与代表性文献发表年份 (`canonicalPaperYear`)，实现可追溯的科学证据体系。
2. **时序警告与科学关系语义解耦**:  
   将关系类型判定（`uses_method` / `references_method`）与时序审核分离。即使未来遇到潜在的时序存疑，系统也会保持其应用研究的 `uses_method` 语义，仅将证据标记为 `needs_review`，严禁擅自篡改科学关系。
3. **真实科研关系核准归入人工策展库 (`curated-relations.ts`)**:  
   PAML 3.14 与 GAPIT 的真实使用案例均恢复为 `uses_method`，证据级别设为 `source_checked`。
4. **科学证据统计与比例指标校准**:  
   严格区分“关系边总数 (edges)”与“证据记录总数 (evidence entries)”，校正百分比计算分母为总证据条目数。
5. **测试断言优化**:  
   删除强制要求保留 `needs_review > 0` 的非预期断言，升级为 13 项全面严苛断言（支持全部科学事实澄清后 `needs_review: 0`）。

---

## 二、科学时间线考证

针对 PAML、GAPIT、selscan 等重点工具建立经过文献检索、官方仓库比对的严密版本时间线：

| 工具名称 | 首次发布年份 (`firstReleaseYear`) | 当前代表论文年份 (`canonicalPaperYear`) | 历史应用论文 | 真实使用版本与科学任务 | 首发文献 DOI / 出处 |
|---|---|---|---|---|---|
| **PAML** | **1997 年** | 2007 年 (PAML 4) | `mam-positive-selection-2006` (2006 年) | **PAML 3.14** (使用 `codeml` 比较 M1a 空模型与 branch-site Model A 正选择) | [10.1093/bioinformatics/13.5.555](https://doi.org/10.1093/bioinformatics/13.5.555)<br>Yang Z. CABIOS 1997; 13:555–556 |
| **GAPIT** | **2012 年** | 2021 年 (GAPIT 3) | `rice-roots-population` (2018 年) | **GAPIT** (计算 795 份栽培稻材料前 3 个 PC 与亲缘矩阵用于 GWAS 协变量) | [10.1093/bioinformatics/bts444](https://doi.org/10.1093/bioinformatics/bts444)<br>Lipka AE et al. Bioinformatics 2012; 28:2397–2399 |
| **selscan** | **2014 年** | 2014 年 (首发论文) | 无历史冲突 (2007 年 xpehh 理论论文已解绑) | **v1.0.0** (多线程 EHH/iHS/XP-EHH 统计量计算软件) | [10.1093/molbev/msu211](https://doi.org/10.1093/molbev/msu211)<br>Szpiech & Hernandez. MBE 2014; 31:2824–2827 |

> [!NOTE]
> - PAML 4 论文发表于 2007 年（Yang Z, MBE 24:1586–1591），而 PAML 软件包早自 1997 年起即由杨子恒教授公开发布与维护。2006 年 PNAS 论文使用 PAML 3.14 完全符合软件版本演进事实。
> - GAPIT 3 论文发表于 2021 年（Wang & Zhang, GPB 19:929–940），而 GAPIT 1.0 早在 2012 年即由 Lipka 等发表于 Bioinformatics。2018 年水稻群体研究使用 GAPIT 属于完全合法的历史版本应用。

---

## 三、关系修复明细表

| 论文 ID | 目标工具 ID | 修复前关系 | 修复后关系 | 修复前状态 | 修复后状态 | 科学事实与核实依据 | 出版方 DOI |
|---|---|---|---|---|---|---|---|
| `mam-positive-selection-2006` | `paml` | `references_method` | **`uses_method`** | `needs_review` | **`source_checked`** | Benderoth 等 (PNAS 2006) 明确报告使用 PAML 3.14 的 `codeml` 比较 M1a 空模型与 branch-site Model A 密码子正选择。 | 10.1073/pnas.0601738103 |
| `rice-roots-population` | `gapit` | `references_method` | **`uses_method`** | `needs_review` | **`source_checked`** | Zhao 等 (PLOS Genetics 2018) 在 795 份材料中实际使用 GAPIT 计算主成分与亲缘矩阵作为 GWAS 混合模型协变量。 | 10.1371/journal.pgen.1007521 |
| `xpehh-paper` | `selscan` | 无关系 | **无关系** | — | — | 2007 年理论论文与 2014 年软件之间继续保持零关系，彻底清除历史时序倒置。 | 10.1038/nature06250 |

---

## 四、知识图谱最新规模与证据统计 (V1.1.2)

### 1. 核心规模对比
| 指标项 | V1.1.1 (PR #28) | V1.1.2 (本轮修复) | 变动说明 |
|---|---|---|---|
| **知识节点总数** | 303 | **303** | 保持 100% 完整 |
| **语义关系边总数 (Edges)** | 740 | **740** | 关系边总数保持不变 |
| **独立证据记录总数 (Evidence Entries)** | 798 | **798** | 证据条目总数保持稳定 |
| `uses_method` 关系数 | 66 | **68** | +2 条（PAML 与 GAPIT 恢复实际使用语义） |
| `references_method` 关系数 | 3 | **1** | -2 条（解除 2 条时序误判降级关系，仅保留 msmc2-protocol） |
| `extends_method` 关系数 | 3 | **3** | 稳定保持 |
| `evaluates_method` 关系数 | 5 | **5** | 稳定保持 |
| `introduces_method` 关系数 | 58 | **58** | 58 个工具奠基文献 100% 闭环 |
| **悬空边 / 重复边 / 重复节点** | 0 / 0 / 0 | **0 / 0 / 0** | 零容忍保持 |
| **分析教程覆盖率** | 10 / 10 | **10 / 10** | 保持 100% 覆盖 |

### 2. 科学证据分级统计（严格以 798 条证据记录为分母）
| 证据状态 | 条目数量 | 正确占比 (分母 798) | 说明 |
|---|---:|---:|---|
| **`source_checked`** | **541 条** | **67.8%** | 官方奠基文献 (116条) + 人工策展核实 (425条)，可追溯至原文或官方文档 |
| **`structurally_valid`** | **257 条** | **32.2%** | Frontmatter 中声明但未经全文逐句核实的结构有效关系 |
| **`needs_review`** | **0 条** | **0.0%** | 所有存疑历史时序已查明科学事实，真实疑点全部闭环 |

### 3. 各关系类型的证据状态分布
| 关系类型 | `source_checked` | `structurally_valid` | `needs_review` | 合计证据条数 |
|---|---:|---:|---:|---:|
| `belongs_to_domain` | 0 | 200 | 0 | 200 |
| `extends_method` | 3 | 0 | 0 | 3 |
| `introduces_method` | 116 | 0 | 0 | 116 |
| `studies_species` | 64 | 0 | 0 | 64 |
| `uses_method` | **11** | 57 | 0 | 68 |
| `references_method` | **1** | 0 | 0 | 1 |
| `evaluates_method` | 5 | 0 | 0 | 5 |
| `features_method` | 111 | 0 | 0 | 111 |
| `references_paper` | 220 | 0 | 0 | 220 |
| `guides_method` | 10 | 0 | 0 | 10 |
| **总计** | **541** | **257** | **0** | **798** |

---

## 五、自动化测试与全套质量验证

本轮所有质量检验命令均通过，无任何报警或回退：

1. **类型检查 (`npm run check`)**:  
   129 个文件通过，0 errors, 0 warnings, 0 hints。
2. **知识完整性与科学语义测试 (`npm run test:knowledge-integrity`)**:  
   **13 项测试断言 100% 全部通过**：
   - 断言 1: Schema 版本与基础结构规范 (303 节点, 740 关系边)
   - 断言 2: 0 悬空边、0 重复边、0 重复节点，10 篇教程 100% 覆盖
   - 断言 3: 58 个工具奠基关系 100% 闭环
   - 断言 4: 13 个重点工具奠基文献映射无损
   - 断言 5: 10 篇教程元数据完整与真实验证状态保持
   - 断言 6: 图谱构建完全确定性（哈希完全一致）
   - 断言 7: 3 条 extends_method 与 5 条 evaluates_method 语义精准
   - 断言 8: **PAML 3.14 (2006) 与 GAPIT (2018) 真实使用关系精准恢复 (uses_method, source_checked)**
   - 断言 9: **xpehh-paper 与 selscan 无错误关联**
   - 断言 10: **PAML (1997 vs 2007)、GAPIT (2012 vs 2021) 软件首发与后续版本论文时序模型建立**
   - 断言 11: **关系类型与时序警告完全解耦，未知首发年份不编造冲突**
   - 断言 12: **证据总数与比例分母基准一致 (总证据条目 798, source_checked 541 (67.8%), structurally_valid 257 (32.2%), needs_review 0 (0.0%))**
   - 断言 13: 反向标题正则误判拦截断言
3. **全站校验流水线 (`npm run validate`)**:  
   全站 279 个页面静态构建成功；Pagefind 检索索引 279 页生成无误；12,277 个本地链接检查 **0 错误**。
4. **内容覆盖度检查 (`npm run coverage`)**:  
   九大研究领域 63 篇专题、58 个工具、130 篇文献、10 篇教程发布状态正常。
5. **端到端浏览器自动化回归 (`npm run test:knowledge`)**:  
   **15 项 Playwright 浏览器断言全部通过**：
   - OrthoFinder 详情页植物研究卡片及推荐理由展示正常
   - Macadamia 详情页原始方法回溯展示正常
   - Hifiasm 原始样板结构、SVG 流程图与评测基准无损
   - 移动端 390px 响应式检测无横向溢出
   - MAM 正选择论文 (2006) 成功展示并链接至 PAML 工具页
   - 水稻根系研究论文 (2018) 成功展示并链接至 GAPIT 工具页
   - XP-EHH 奠基论文 (2007) 确认无错误的 selscan 工具关联

---

## 六、待审核问题与开放性记录

当前全站 58 个工具中：
1. **已建立确凿首发年份与版本线索的工具**: PAML (1997)、GAPIT (2012)、selscan (2014) 等已建立完整考据。
2. **其他工具首发年份处理策略**: 当前版本严格遵循“不编造年份”原则。若其他工具暂未录入经考证的首次发布年份，系统以其当前收录文献为基准，不会轻率触发时序冲突告警；未来若发现类似历史早期版本应用案例，可随时在 `chronology.ts` 中以文献为锚点扩展收录。

---

## 七、修改文件清单

```text
src/lib/knowledge/
  chronology.ts               # [新增] 算法与软件历史版本时序模型与首发年份注册表
  curated-relations.ts        # [更新] 收录 PAML 3.14 (2006) 与 GAPIT (2018) 经核实的真实使用关系
  relation-resolver.ts        # [重构] 接入软件时序模型，实现关系类型与时序警告完全解耦
  graph-types.ts              # [优化] 完善 KnowledgeGraphV2.stats 类型定义 (加入 evidenceEntriesCount 等)
  graph-builder.ts            # [升级] 校准证据记录条目数与正确占比计算逻辑

scripts/
  audit-knowledge-relations.mjs # [增强] 终端打印各证据状态正确比例与关系类型证据分布
  test-knowledge-integrity.mjs  # [增强] 扩展至 13 项断言，覆盖版本时序模型、解耦测试与证据统计基准
  browser-test-knowledge-relations.mjs # [增强] 增加 PAML、GAPIT 与 XP-EHH 浏览器页面关联回归断言

outputs/
  knowledge-graph-v2.json      # [更新] 最新图谱数据 (303 节点, 740 关系边, 798 证据条目, needs_review: 0)
  knowledge-audit-report.json  # [更新] 最新完整性审计与分级统计报告

docs/
  knowledge-version-chronology-v1.1.2-report.md # [新增] 本次科学版本时序与证据准确性修复报告
```
