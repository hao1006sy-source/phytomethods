# PhytoMethods｜科研知识图谱数据完整性与科学证据体系报告 V1.1

## 一、开发概述

本轮工程（**V1.1**）在 PR #25 的基础上，重点针对 PhytoMethods 知识图谱的数据完整性、科学证据机制和模块化架构进行了深入完善：

- **修复悬空教程节点**：将全站 10 篇已发布教程作为正式实体完整收录入知识图谱，彻底消除了原图谱中 10 条 `guides_method` 关系的悬空引用；
- **建立语义边去重与多源证据合并机制**：采用唯一组合键 `${source}|${relation}|${target}` 对全站关系进行去重合并，将原本存在的 58 条重复语义关系无损合并为多源证据边；
- **升级科研关系语义分类**：彻底解决了方法学论文与算法的语义混淆，细分支持 `introduces_method`（提出方法）、`uses_method`（植物研究使用）、`extends_method`（扩展改进）、`evaluates_method`（基准评测）、`references_method`（辅助集成或引用）等科学语义；
- **构建高内聚工程模块体系**：将原本臃肿的单一审计脚本重构抽取为 `src/lib/knowledge/` 模块群（`graph-types.ts`、`evidence.ts`、`relation-resolver.ts`、`graph-builder.ts`、`graph-validator.ts`），实现科研关系计算逻辑、证据模型与验证逻辑的解耦；
- **全方位自动化测试与 CI 接入**：更新 `.github/workflows/ci.yml`，增加 `audit:knowledge` 与轻量独立的 `test:knowledge-integrity`，升级跨平台 Playwright 浏览器回归测试，实现 100% 确定性构建。

### 修改与新增文件清单
- `src/lib/knowledge/graph-types.ts` (核心类型与 Schema V2.1 定义)
- `src/lib/knowledge/evidence.ts` (科学证据模型与去重合并)
- `src/lib/knowledge/relation-resolver.ts` (科研实体关系细分判定引擎)
- `src/lib/knowledge/graph-builder.ts` (确定性图谱组装构建器)
- `src/lib/knowledge/graph-validator.ts` (严格完整性校验器与断言)
- `src/components/paper-v3/config/paper-relations.ts` (前台文献详情页关联与推荐引擎升级)
- `scripts/audit-knowledge-relations.mjs` (全量知识关系审计与报告导出工具)
- `scripts/test-knowledge-integrity.mjs` (纯数据断言自动化测试，零外部依赖，毫秒级运行)
- `scripts/browser-test-knowledge-relations.mjs` (跨平台 Playwright 浏览器端到端测试)
- `outputs/knowledge-graph-v2.json` (最新确定性图谱数据文件 V2.1)
- `outputs/knowledge-audit-report.json` (机器可读完整审计报告)
- `package.json` (新增 `test:knowledge-integrity` 命令，并整合至 `validate` 流水线实现 CI 自动阻断)

---

## 二、修改前后数据对比

| 统计指标 | V1.0 基线 (PR #25) | V1.1 修复后 | 差异与改进说明 |
| :--- | :---: | :---: | :--- |
| **图谱节点总数 (Nodes)** | 278 | **303** | 补全 10 个教程节点，规范收录 33 个物种节点与 9 领域、63 专题、58 工具、130 论文 |
| **教程节点数量** | 0 (缺失) | **10 (100%)** | 彻底收录，并保留真实 `verified`/`template`/`not-tested` 状态 |
| **悬空关系数量 (Dangling)** | 10 | **0** | 10 条 `guides_method` 悬空边彻底消除，所有端点 100% 存在 |
| **重复语义边数量 (Duplicates)** | 58 | **0** | 通过组合键与多源证据合并机制，重复关系清零 |
| **图谱语义边总数 (Edges)** | 801 | **741** | 消除 58 条重复边与无效冗余，保留高质量独立语义边 |
| **提出方法 (`introduces_method`)** | 116 (混淆) | **58** | 精准对应 58 个算法工具官方奠基论文 |
| **改进方法 (`extends_method`)** | 0 (未区分) | **7** | 精准识别如 ADMIXTURE 增强版等扩展性学术成果 |
| **评测比较 (`evaluates_method`)** | 0 (未区分) | **9** | 精准识别如被子植物 SV 检测基准等横向评测文献 |
| **使用方法 (`uses_method`)** | 73 | **59** | 植物应用研究实际采用算法分析物种数据 |
| **辅助引用 (`references_method`)** | 5 | **3** | 方法学文献辅助集成或提及 |
| **专题收录 (`features_method`)** | 111 | **111** | 63 篇专题核心技术收录工具 |
| **专题引证 (`references_paper`)** | 220 | **220** | 专题精读文献与学术引证 |
| **教程指导 (`guides_method`)** | 10 | **10** | 教程与工具双向绑定闭环 |
| **物种聚焦 (`studies_species`)** | 64 | **64** | 论文研究的特定植物材料 |
| **领域归属 (`belongs_to_domain`)** | 200 | **200** | 工具与文献归属学科领域 |
| **科学证据覆盖 (Evidence Total)** | 741 (简述) | **799** | 596 条 `source_checked`，203 条 `structurally_valid` |

---

## 三、重点工具文献关联审查与语义修正说明

重点核查了任务书指定的 13 个核心工具，其科学关系与证据修正如下：

| 工具名称 (`id`) | 原始奠基论文 (`canonicalPaper`) | 科学关系类型 | 证据来源与修正依据 |
| :--- | :--- | :--- | :--- |
| **Hifiasm** (`hifiasm`) | `hifiasm` (Nat Methods 2021) | `introduces_method` | 官方代码库 `chhylp123/hifiasm` 将其指定为奠基方法学文献。 |
| **ADMIXTURE** (`admixture`) | `admixture-paper` (Genome Res 2009) | `introduces_method` | Alexander 2009 首次提出 ADMIXTURE 快速祖先模型。 |
| - *关联文献* (`admixture-enhancements`) | `admixture-enhancements` | `extends_method` | **语义修正**：原图谱将其误作为 `introduces_method`，现修正为 `extends_method`（性能扩展与大规模数据集增强）。 |
| **Verkko** (`verkko`) | `verkko` (Nat Biotechnol 2023) | `introduces_method` | 官方代码库 `marbl/verkko` 指定之二倍体 T2T 组装论文。 |
| **EDTA** (`edta`) | `edta-paper` (Genome Biol 2019) | `introduces_method` | 转座子全自动注释管线开创性论文。 |
| **BRAKER3** (`braker3`) | `braker3-paper` (Genome Res 2024) | `introduces_method` | 整合 GeneMark-ETP 与 AUGUSTUS 的自动化基因注释论文。 |
| **Minigraph-Cactus** (`minigraph-cactus`) | `minigraph-cactus-paper` (Nat Biotechnol 2024) | `introduces_method` | 基于基因组多重比对构建泛基因组图的方法论文。 |
| **PGGB** (`pggb`) | `pggb-paper` (Nat Methods 2024) | `introduces_method` | 变异感知无参考图构建流程论文。 |
| **OrthoFinder** (`orthofinder`) | `orthofinder-paper` (Genome Biol 2019) | `introduces_method` | 比较基因组系统发育直系同源推断方法论文。 |
| **IQ-TREE 2** (`iqtree2`) | `iqtree2-paper` (MBE 2020) | `introduces_method` | 超快系统发育推断新模型与算法论文。 |
| **GAPIT** (`gapit`) | `gapit3-paper` (GPB 2021) | `introduces_method` | 全基因组关联分析与基因组预测系统方法论文。 |
| **WGCNA** (`wgcna`) | `wgcna-paper` (BMC Bioinform 2008) | `introduces_method` | 加权基因共表达网络构建算法奠基论文。 |
| **Scanpy** (`scanpy`) | `scanpy-paper` (Genome Biol 2018) | `introduces_method` | 大规模单细胞表达数据分析框架论文。 |
| **AgroNT** (`agront`) | `agro-nt-2024` (Commun Biol 2024) | `introduces_method` | 食用植物基因组基础大模型方法论文。 |
| - *基准文献* (`plant-sv-benchmark-2026`) | `plant-sv-benchmark-2026` | `evaluates_method` | **语义修正**：对 `sniffles2` 和 `cutesv` 开展跨 10 种被子植物的长读长检测基准比较，判定为 `evaluates_method`。 |

---

## 四、数据结构与 Schema V2.1 规范

最新 `outputs/knowledge-graph-v2.json` 严格遵循 Schema V2.1：

```json
{
  "version": "2.1.0",
  "description": "PhytoMethods Scientific Knowledge Graph Schema V2.1 with Evidence & Integrity",
  "stats": {
    "nodesCount": 303,
    "edgesCount": 741,
    "nodesByType": {
      "domain": 9,
      "topic": 63,
      "method": 58,
      "paper_method": 70,
      "paper_application": 59,
      "paper_review": 1,
      "species": 33,
      "tutorial": 10
    },
    "edgesByRelation": {
      "introduces_method": 58,
      "extends_method": 7,
      "evaluates_method": 9,
      "uses_method": 59,
      "references_method": 3,
      "features_method": 111,
      "references_paper": 220,
      "guides_method": 10,
      "studies_species": 64,
      "belongs_to_domain": 200
    },
    "evidenceByStatus": {
      "structurally_valid": 203,
      "source_checked": 596
    }
  },
  "nodes": [
    {
      "id": "tutorial:hifiasm-intro",
      "type": "tutorial",
      "label": "Hifiasm 组装入门",
      "slug": "hifiasm-intro",
      "href": "/tutorials/hifiasm-intro/",
      "summary": "使用 Hifiasm 完成 PacBio HiFi 数据的单倍型解析基因组组装流程。",
      "meta": {
        "methodId": "hifiasm",
        "tested": "template"
      }
    }
  ],
  "edges": [
    {
      "id": "paper:admixture-paper|introduces_method|method:admixture",
      "source": "paper:admixture-paper",
      "target": "method:admixture",
      "relation": "introduces_method",
      "evidence": [
        {
          "sourceType": "official_documentation",
          "sourceId": "admixture",
          "doi": "10.1101/gr.094052.109",
          "note": "工具 \"ADMIXTURE\" 官方文档将其指定为原始方法学奠基论文。",
          "verificationStatus": "source_checked"
        }
      ]
    }
  ]
}
```

---

## 五、待审核清单与科学边界说明

在审查过程中，我们严格遵守学术求真底线，绝不凭模型记忆强行补全推断：

1. **24 篇未在 Frontmatter 中声明 `methodIds` 的植物应用研究**：
   - 典型如四倍体马铃薯 Otava 组装（`potato.md`），正文明确指出“该多源数据设计针对四倍体解析，不能简化成 Hifiasm 单独生成四条单倍型”，提及 Hifiasm 是为了辨析算法适用边界，**不可误标为使用了 Hifiasm**；
   - 2018 水稻泛基因组（`rice-pangenome-paper.md`），正文明确指出“这项研究使用线性参考锚定和多组装比较，未构建现代变异图泛基因组，因此页面不将 MUMmer 比对误标为 Minigraph、PGGB 或 Minigraph-Cactus 的应用”；
   - 拟南芥系列表观调控研究属于常规生物学实验，未依赖站内特定的算法详情页；
   - **处理结论**：保持其空数组，列入科学待核实清单，未来有充分全文依据再逐步扩充。
2. **3 篇无单一物种标签的跨分类群基准文献**：
   - `angiosperm-phylogenomics-2024`（被子植物系统发育，7,923 个属 9,506 个物种）；
   - `plant-sv-benchmark-2026`（跨 10 种被子植物比对评估）；
   - `plant-wgd-timing-2017`（植物全基因组加倍演化分析）；
   - **处理结论**：确认其 `speciesIds: []` 真实合理，标记为多物种/跨分类群基准研究。

---

## 六、自动化测试与 CI 接入

本轮新增了全套严密的自动化测试流水线：

```bash
# 1. 静态类型检查
npx astro check
# 结果: Result (117 files): 0 errors, 0 warnings, 0 hints

# 2. 全站静态构建与链接检查
npm run validate
# 结果: 279 页面静态渲染通过, Pagefind 索引正常, 12276 个内部链接 100% 连通 (0 errors)

# 3. 知识图谱完整性审计与失败判定
npm run audit:knowledge
# 结果: 0 悬空边, 0 重复边, 0 重复节点, 10 篇教程全部收录, 退出码 0

# 4. 独立纯数据完整性测试 (毫秒级)
npm run test:knowledge-integrity
# 结果: 6 大类数据完整性断言 100% 通过, 确定性哈希比对 100% 一致

# 5. 跨平台端到端浏览器测试 (Playwright)
npm run test:knowledge
# 结果: 12 项断言 100% 通过, 390px 移动端无横向溢出
```

### GitHub Actions CI 流水线集成
已将 `npm run audit:knowledge` 与 `npm run test:knowledge-integrity` 直接集成至项目的核心 `validate` 命令流水线（`.github/workflows/ci.yml` 默认执行 `npm run validate`），任何悬空边、重复边或结构性异常将直接阻断 GitHub PR 校验。

---

## 七、后续知识关联图 V2 的开发建议（规划备忘）

为下一阶段的「知识关联图 V2：基于真实科研关系的交互式知识探索页面」提供技术规划：

1. **页面横屏设计预览先行**：在编码前先制作 1600×900 电脑横屏设计效果图，交由用户确认交互形式（侧边抽屉筛选、中心画布、节点详情卡片）；
2. **轻量化数据加载**：目前 `knowledge-graph-v2.json` 大小约为 200KB，可直接作为静态 JSON 或通过 Astro 静态数据接口按需分片加载，无需引入复杂后端；
3. **力导向图局部渲染**：303 个节点与 741 条边适合采用层次化或基于领域的子图探索视图（按 M01–M09 领域折叠/展开），支持点击节点高亮一度和二度关联邻居，提供清晰的物理碰撞边界与顺滑缩放拖拽。
