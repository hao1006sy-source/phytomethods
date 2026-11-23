# PhytoMethods｜63 篇科研专题 Markdown 渲染问题全量审计与修复报告

> **执行状态**: ✅ 63 篇全量深度扫描、源码修复、自动化检测门禁建立与 Playwright 浏览器验收 100% 完成  
> **对应分支**: `fix/topic-markdown-rendering-audit`  
> **基线 Commit**: `80399d0` (main 最新基线)  
> **发布日期**: 2026-11-23  

---

## 一、问题原因深度剖析

在比较基因组学与演化领域专题 `/topics/comparative-genomics/m04-topic-01/`（同源、直系同源与旁系同源）页面正文中，原本应该加粗的专业术语直接在网页上暴露了原始 Markdown 标记 `**`：

- `**同源（homology）**表示序列具有共同祖先...`
- `**直系同源（orthology）**与**旁系同源（paralogy）**描述一对同源基因...`

### 规范与解析根因
该问题的本质是触发了 **CommonMark 规范（0.31.2）第 6.2 节关于强调符右边界判定（Right-flanking delimiter run）的边界条件限制**：

1. **CommonMark 强调闭合规则**：
   - 一个强调分隔符（delimiter run，如 `**`）要被识别为闭合符（right-flanking delimiter run），必须满足以下条件之一：
     - 如果其前面是 Unicode 标点字符（Unicode punctuation character，如全角右括号 `）` 或半角右括号 `)`），那么其**后面必须紧跟 Unicode 空白字符（whitespace）或 Unicode 标点字符**。
     - **如果其后面紧跟的是 Unicode 字母/汉字（Unicode letter），则绝对禁止构成 right-flanking delimiter run！**
2. **实际触发场景**：
   - 源码中的写法：`**同源（homology）**表示`
     - 闭合符 `**` 前面的字符是 `）`（Unicode Punctuation）；
     - 闭合符 `**` 后面的字符是汉字 `表`（Unicode Letter，既非空白也非标点）；
     - 因此 Markdown 编译器（Astro 所用的 remark/micromark）根据 CommonMark 规范，**判定此处的 `**` 不是合法的加粗闭合符**！
3. **连锁破坏效应**：
   - 在第 15 行的 `**直系同源（orthology）**与**旁系同源（paralogy）**描述` 中：
     - 首个 `**` 开启加粗，但由于 `（orthology）**` 后面紧连汉字“与”，导致此处的 `**` 无法闭合；
     - 随后编译器遇到下一个 `**`（即“旁系同源”前面的 `**`），将其错误地与前一个未闭合的 `**` 配对，结果反而将夹在中间的汉字“与”渲染成了 `<strong>与</strong>`；
     - 最终末尾的 `**` 紧连汉字“描”，同样因无法构成闭合符而直接作为普通文本泄漏在网页上！

---

## 二、全量检查统计

全站九大研究领域 63 篇专题源文件及构建后的 63 个静态 HTML 页面进行了 100% 全量深度扫描与 DOM 文本校验，统计结果如下：

| 领域代号 | 研究领域名称 | 检查专题数 | 存在问题的专题数 | 异常处数 | 成功修复处数 | 剩余未解决数 |
|---|---|---:|---:|---:|---:|---:|
| **M01** | 测序与基因组组装 | 7 | 0 | 0 | 0 | 0 |
| **M02** | 基因组注释 | 7 | 0 | 0 | 0 | 0 |
| **M03** | 泛基因组与结构变异 | 7 | 0 | 0 | 0 | 0 |
| **M04** | 比较基因组学与演化 | 7 | **1** (`m04-topic-01`) | **3** | **3** | **0** |
| **M05** | 群体遗传学 | 7 | 0 | 0 | 0 | 0 |
| **M06** | GWAS 与分子育种 | 7 | 0 | 0 | 0 | 0 |
| **M07** | 表观基因组与三维基因组 | 7 | 0 | 0 | 0 | 0 |
| **M08** | 单细胞与空间组学 | 7 | 0 | 0 | 0 | 0 |
| **M09** | 调控基因组学与人工智能 | 7 | 0 | 0 | 0 | 0 |
| **合计** | **九大领域全景** | **63** | **1** | **3** | **3** | **0** |

- **总扫描专题数**: **63 篇**
- **存在问题的专题数**: **1 篇** (`m04-topic-01.md`)
- **异常总数**: **3 处**
- **修复成功总数**: **3 处**
- **剩余未解决数量**: **0 处 (100% 清零)**

---

## 三、每处问题明细表

| 序号 | 文件路径 | 行号 | 问题类别 | 原始文本 | 修复后文本 | 生成语义标签 |
|---|---|---|---|---|---|---|
| 1 | `src/content/topics/m04-topic-01.md` | 13 | `paren_boundary` (标点后紧连汉字) | `**同源（homology）**表示序列具有共同祖先...` | `**同源（homology）** 表示序列具有共同祖先...` | `<strong>同源（homology）</strong>` |
| 2 | `src/content/topics/m04-topic-01.md` | 15 | `paren_boundary` (标点后紧连汉字) | `**直系同源（orthology）**与**旁系同源...` | `**直系同源（orthology）** 与 **旁系同源...` | `<strong>直系同源（orthology）</strong>` |
| 3 | `src/content/topics/m04-topic-01.md` | 15 | `paren_boundary` (标点后紧连汉字) | `...与**旁系同源（paralogy）**描述一对同源基因...` | `...与 **旁系同源（paralogy）** 描述一对同源基因...` | `<strong>旁系同源（paralogy）</strong>` |

---

## 四、修复前后对比

### 1. 源码前后对比
```markdown
<!-- 修复前 (m04-topic-01.md:12-16) -->
## 同源关系的三个基本概念
**同源（homology）**表示序列具有共同祖先，是对演化来源的判断。序列相似性是推断同源关系的证据，可以报告比对覆盖度、序列一致性和统计显著性；“同源百分比”不能代替这些可测量的相似性指标。

**直系同源（orthology）**与**旁系同源（paralogy）**描述一对同源基因在基因树上的最近共同祖先节点：前者对应物种分化事件，后者对应基因复制事件。

<!-- 修复后 (m04-topic-01.md:12-16) -->
## 同源关系的三个基本概念
**同源（homology）** 表示序列具有共同祖先，是对演化来源的判断。序列相似性是推断同源关系的证据，可以报告比对覆盖度、序列一致性和统计显著性；“同源百分比”不能代替这些可测量的相似性指标。

**直系同源（orthology）** 与 **旁系同源（paralogy）** 描述一对同源基因在基因树上的最近共同祖先节点：前者对应物种分化事件，后者对应基因复制事件。
```

### 2. 真实 HTML 渲染输出对比
```html
<!-- 修复前 (Astro 构建生成的 HTML) -->
<p>**同源（homology）**表示序列具有共同祖先，是对演化来源的判断...</p>
<p>**直系同源（orthology）<strong>与</strong>旁系同源（paralogy）**描述一对同源基因...</p>

<!-- 修复后 (Astro 构建生成的 HTML) -->
<p><strong>同源（homology）</strong> 表示序列具有共同祖先，是对演化来源的判断...</p>
<p><strong>直系同源（orthology）</strong> 与 <strong>旁系同源（paralogy）</strong> 描述一对同源基因...</p>
```
修复后，网页中所有的原始 `**` 标记彻底消除，三个关键专业科学名词均稳定、正确地被包含在标准的 HTML `<strong>` 标签中，加粗样式完全生效，且科学文字内容 100% 保持无损。

---

## 五、自动化检查与流水线门禁实现

为防止未来新增或更新专题时再次引入此类边界语法异常，新建了自动化审计脚本：
`scripts/check-topic-markdown-rendering.mjs`

### 1. 双阶段审计机制
1. **源码语法与 Tokenizer 深度静态检测**：
   - 提取 Markdown 正文成对加粗 Token；
   - 精确判定加粗结尾字符是否为标点（`[)）\]｝}、，。！？；："'”’\p{P}]`）且紧邻字符为中文字母；
   - 检查行内未闭合的奇数个 `**`；
   - 检查未闭合的行内反引号 \`；
   - 检查断裂的 Markdown 链接 `[text](url`。
2. **构建产物真实 HTML 渲染保真度检测**：
   - 提取所有专题 HTML 的 `.article-content` 或 `<article>` 正文容器；
   - 过滤 `<pre>`、`<code>`、`<svg>`、`<script>`、`<span class="katex">`；
   - 严格断言正文文本节点中 `**` 残留数量必须为 0；
   - 严格断言 KaTeX 数学公式 0 处 `katex-error`。

### 2. 集成至 CI 验证流水线
在 `package.json` 中添加独立脚本与门禁集成：
- **单项检查**: `npm run check:topic-markdown`
- **全站流水线**: `npm run validate` 中自动执行 `check:topic-markdown`，若发现任何 Markdown 渲染异常将立即拦截报错退出。

---

## 六、全量浏览器回归测试与截图验收

编写并执行了全新的 Playwright 专项回归脚本：  
`scripts/browser-test-topic-markdown-rendering.mjs`  
在系统真实 Edge 浏览器环境下完成了 **21 项深度断言**，测试 100% 通过：

### 1. 实际检查范围与断言结果
1. **M04-01 专项修复点 DOM 断言**:
   - `<strong>同源（homology）</strong>` 标签存在且样式正确。
   - `<strong>直系同源（orthology）</strong>` 与 `<strong>旁系同源（paralogy）</strong>` 标签存在。
   - 正文文本中 0 处 `**` 字符泄漏。
2. **63 篇专题全站巡检**:
   - 63 篇专题 100% 可正常加载渲染，无 HTTP 错误或页面空白。
   - 全站 63 篇专题正文文本中 `**` 泄漏数全部为 0。
3. **移动端 (390px) 响应式与溢出检测**:
   - 经测试，`m04-topic-01`、`m01-topic-01`、`m02-topic-01`、`m03-topic-01`、`m05-topic-01` 等在 390px 视口下横向滚动宽度 `scrollWidth <= 390`，无横向溢出。
4. **交互功能回归**:
   - 章节目录点击定位、领域返回导航正常。

### 2. 归档截图清单 (`outputs/topic-markdown-audit/screenshots/`)
- `m04-topic-01-concepts-fixed.png`: M04-01 核心概念加粗修复特写截图。
- `m04-topic-01-desktop-1600.png`: M04-01 桌面端 1600×900 完整长图。
- `m04-topic-01-mobile-390.png`: M04-01 手机端 390×844 响应式长图。
- 九大研究领域代表性专题桌面端截图（9 张全归档）：
  - `genome-assembly-m01-topic-01-desktop.png`
  - `genome-annotation-m02-topic-01-desktop.png`
  - `pangenomics-structural-variation-m03-topic-01-desktop.png`
  - `comparative-genomics-m04-topic-01-desktop.png`
  - `population-genetics-m05-topic-01-desktop.png`
  - `gwas-breeding-m06-topic-01-desktop.png`
  - `epigenomics-3d-genome-m07-topic-01-desktop.png`
  - `single-cell-spatial-omics-m08-topic-01-desktop.png`
  - `regulatory-genomics-ai-m09-topic-01-desktop.png`

---

## 七、修改文件清单

```text
src/content/topics/
  m04-topic-01.md             # [修复] 调整 3 处括号后加粗语法空格，解决 CommonMark 右边界冲突

scripts/
  check-topic-markdown-rendering.mjs         # [新增] 63 篇专题 Markdown 渲染全量自动化审计脚本
  browser-test-topic-markdown-rendering.mjs  # [新增] 专题 Markdown 渲染与交互 Playwright 浏览器回归测试

package.json                  # [更新] 新增 check:topic-markdown 与 test:topic-markdown，纳入 validate 流水线

docs/
  topic-markdown-rendering-audit-report.md    # [新增] 本次审计与修复全景报告
```
