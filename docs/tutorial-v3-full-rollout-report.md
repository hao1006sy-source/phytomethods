# PhytoMethods 教程详情页 V3 全站推广报告

## 开发范围

基于 `origin/main` 的 Hifiasm V3 合并版本 `380aa1d` 创建分支 `feat/tutorial-v3-full-rollout`。十篇已发布教程均接入 V3：Hifiasm 保留专用页面，其余九篇使用通用页面和逐篇流程配置。教程 Markdown 与 frontmatter 未修改。

| 教程 | V3 | `tested` | 页面展示的验证范围 |
| --- | --- | --- | --- |
| Hifiasm | 是，保留样板 | template | 官方命令模板核对；真实数据未运行 |
| OrthoFinder | 是 | verified | WSL Ubuntu 运行 OrthoFinder 3.2 官方四种支原体蛋白示例，检查同源组、物种树、基因树和统计输出；非植物数据 |
| SyRI | 是 | verified | WSL Ubuntu 使用官方拟南芥 4 号染色体测试数据运行 NUCmer、过滤、show-coords 和 SyRI，检查 OUT、VCF、summary 与日志 |
| Bismark | 是 | verified | 使用固定种子的虚构参考和模拟 reads 运行 Bismark Rust suite 3.3.0、Bowtie2 2.5.5、Samtools 1.25，并检查 CG/CHG/CHH；非植物数据 |
| PLINK | 是 | verified | Windows 使用 8 个虚构样本、6 个模拟 SNP 运行 PLINK 1.9.1，检查格式转换、频率、缺失率与 PCA |
| SciPy GWAS | 是 | verified | Windows 使用 80 个虚构样本、60 个模拟标记运行单标记线性回归，并独立复算 60 个 P 值；未包含群体结构等校正 |
| Scanpy | 是 | verified | Windows 使用 60×20 模拟表达矩阵运行 Scanpy 1.13.0 两次，检查质控、聚类和坐标输出一致性 |
| WGCNA | 是 | verified | Windows 使用 R 4.5.1、WGCNA 1.74 和 36×60 模拟表达矩阵运行两次，检查模块与输出一致性 |
| EDTA | 是 | template | 官方用法与参数模板核对；真实数据未运行 |
| CAFE 5 | 是 | template | 官方 README、发行说明和示例输入模板核对；本地运行与植物数据验证未完成 |

状态分布为 **7 verified / 3 template**，与原始内容一致。verified 页面明确区分模拟、非植物官方示例和实际植物测试范围；没有把模板状态表述为运行成功。

## 组件结构

- `src/pages/tutorials/[slug].astro` 统一将十篇已发布教程路由至 V3；Hifiasm 继续使用现有专用组件。
- `TutorialV3.astro` 根据教程条目、关联方法、论文和领域数据生成 Hero、章节和站内延伸链接。
- `TutorialResourceCards.astro` 从 Collection 及原始正文动态整理验证状态、运行环境、输入输出和来源链接。
- `tutorial-data.ts` 保存九篇教程各自的流程节点与正文解析帮助函数，不维护重复正文。
- `TutorialWorkflowGeneric.astro` 根据每篇教程的独立步骤生成 SVG 工作流。
- 公用布局负责章节目录、当前章节、代码复制和工作流放大；Hifiasm 原 SVG 与页面内容继续沿用。
- `TutorialMarkdown.astro` 继续用 Markdown 渲染原文，并支持数学公式与 KaTeX。

## 内容完整性

专项浏览器测试逐篇比较原始 Markdown 与 `origin/main`，十篇来源文件均完全一致。测试还逐项检查原始标题和正文、代码块文本及换行、代码复制结果；共验证 19 个代码块。教程 frontmatter、更新时间和 `tested` 状态保持原样。

九篇通用流程分别覆盖 OrthoFinder 同源组/物种树、SyRI 组装比对与结构变异、Bismark 模拟甲基化、PLINK 模拟 SNP 与 PCA、SciPy 单标记 GWAS、Scanpy 模拟单细胞流程、WGCNA 模拟共表达网络、EDTA 重复序列注释、CAFE 5 家族扩张/收缩。流程图展示分析步骤，不展示伪造结果。

## 测试结果

依赖在独立验证副本中安装，避免影响源仓库的现有 `node_modules`。验证副本的 `npm ci` 完成，安装 413 个包，报告 0 vulnerabilities。

| 命令或检查 | 结果 |
| --- | --- |
| `npm run check` | 通过：133 个文件，0 errors、0 warnings、0 hints |
| `npm run build` | 通过：279 个静态页面；Pagefind 索引 279 页、40,156 个词 |
| `npm run validate` | 通过：构建、首页与领域校验、12,264 个站内链接、知识审计和完整性测试均通过 |
| `npm run coverage` | 通过：已发布内容覆盖统计完成；10 篇教程状态为 7 verified / 3 template |
| `npm run audit:knowledge` | 通过：303 节点、741 条关系，0 悬空、0 重复，覆盖 10/10 教程 |
| `npm run test:knowledge-integrity` | 通过：6 类数据完整性断言全部通过 |
| `npm run test:knowledge` | 通过：12 项浏览器断言，0 失败；首页相关知识关联正常 |
| `node scripts/browser-test-hifiasm-tutorial-v3.mjs` | 通过：Hifiasm 样板检查、V3 全站路由回归、目录、复制、放大、移动布局 |
| `node scripts/browser-test-tutorial-v3-full-rollout.mjs` | 通过：10 篇页面、70 次响应式检查、19 个代码复制、76 次目录跳转、71 个站内链接、0 页面错误 |
| `npm run test:methods-v3` | 通过：58 个方法详情、84 次视口检查、0 页面错误 |

浏览器宽度覆盖 1600、1440、1280、1024、768、390 和 375px。检查包含 SVG 放大、Escape 关闭与焦点恢复、FAQ、移动端目录、内链状态码、代码复制及横向溢出。`outputs/tutorial-v3-rollout/browser-results.json` 保存逐页结果。

旧 Hifiasm 测试原本要求另外九篇继续显示旧版布局。本分支已将该回归断言更新为检查十篇教程均使用 V3，之后专项脚本通过。

## 截图交付

- `outputs/tutorial-v3-rollout/<tutorial-id>/desktop-1600.png`：十篇教程桌面首屏。
- `outputs/tutorial-v3-rollout/<tutorial-id>/desktop-full-1600.png`：十篇桌面长图。
- `outputs/tutorial-v3-rollout/<tutorial-id>/mobile-390.png`：十篇手机长图。
- `outputs/tutorial-v3-rollout/<tutorial-id>/workflow.png`：十篇流程图。
- `orthofinder-intro`、`scanpy-synthetic`、`wgcna-synthetic` 子目录中的 `workflow-zoom.png`：三种流程放大图。
- `scanpy-synthetic/code-bash.png`、`scanpy-synthetic/code-python.png`、`wgcna-synthetic/code-r.png`：Bash、Python、R 代码特写。Python 特写由同一 `TutorialMarkdown` 渲染真实 `examples/single-cell/scanpy_demo.py` 生成；源码中没有 Python fenced block，因此用临时隔离验收页检查该语言渲染。
- `outputs/tutorial-v3-rollout/before-after/`：OrthoFinder、SyRI、Scanpy 三篇分别基于 `origin/main` V2 和本分支 V3 的 1600×900 对照截图。

所有截图均由 Microsoft Edge 实际打开构建后的静态站点生成。PR 保持未合并，未部署正式网站。

## 后续建议

EDTA、CAFE 5 与 Hifiasm 的 `template` 状态继续保留。后续若补充真实运行记录、输入数据来源、软件版本和输出检查，可另行更新验证状态；模拟教程也应继续在页面中标明模拟数据边界。
