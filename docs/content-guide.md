# 内容维护指南

内容位于 `src/content`，Markdown 文件名是稳定的英文 ID。每个条目使用 `src/content.config.ts` 的字段与状态，`published` 显示在目录和搜索中。`updatedAt` 仅在内容有实际修改时更新。

方法条目的 `domainIds`、`topicIds`、`principleIds`、`dataIds` 使用稳定 ID，标签名称维护于 `src/data/tags.ts`。新增群体扫描受控原理标签时，应先在 `principleLabels` 建立中文标签；相位单倍型等新数据类型则同步维护在 `dataLabels`。`paper` 指向方法论文的文件 ID。论文填写不带 URL 前缀的 DOI、类别、领域、物种及有证据的 `methodIds`；物种 ID 维护于 `speciesLabels`，新增物种时先建立受控标签；植物应用与工具的关联应核对论文方法部分。教程的 `method` 与 `tested` 指定关联工具及验证状态。

添加内容后运行 `npm run build`。Schema 检查字段类型；首页构建期间检查关联、受控标签与 DOI 唯一性。修改目录元数据或新增领域时同步检查 `src/data/domains.ts` 与 `src/data/topics.ts`。之后运行 `python scripts/check-links.py` 与 `node scripts/browser-test.mjs`；浏览器测试需要运行预览服务器。

## 专题元数据与关系
`src/data/topic-metadata.json` 包含 63 条独立记录。`id` 是持久英文标识；`title` 与 `englishTitle` 分别是中英文名称；`domainId` 和 `order` 控制领域及顺序；`summary` 和 `keyConcepts` 描述主题。`methodIds`、`paperIds`、`tutorialIds` 是指向对应内容的稳定 ID 数组；`principleIds` 和 `dataIds` 来自 `src/data/tags.ts`。`status` 为 `published`、`draft` 或 `planned`；未核实的 `createdAt`、`updatedAt` 为 null，不推定历史日期。

M01 的已发布记录应有同名 Markdown 正文，网页根据专题关系反查工具、论文及教程；工具页面反查专题与论文。论文的 `methodIds` 是多对多关系，只有经原论文证实的工具关系才能写入。构建时验证 63 条记录的 ID、领域、顺序、标签、正文及各类关系，并检查已发布内容、DOI 和重复项。已知 `method` 是历史兼容字段，新论文使用 `methodIds`。

## 通用专题发布
新增专题时，将 Markdown 放入 `src/content/topics/`，设置 `domain` 和稳定 ID，并更新 `src/data/topic-metadata.json` 中对应记录为 `published`。动态路由按领域生成文章与侧栏；`src/lib/validate-content.ts` 负责构建期领域、专题、工具、论文、教程及受控标签校验。方法的 `topicIds` 和专题元数据的 `methodIds` 表示关联；论文使用 `methodIds` 数组，旧 `method` 字段仍可读取。添加经过论文证据确认的关系，并同时核对过滤和导航显示。

开发参考：Kassis T, Agarwal V, He Y, Patel D, Brueckner AM. Scientific Agent Skills: A Library of Procedural Knowledge for Research Agents. 2026. https://doi.org/10.48550/arXiv.2609.00065 （本次用于科学写作流程；科学事实以各文章列示的原始来源为准）。

## 发布前统一验证
`npm run validate` 运行 Astro 类型检查、静态构建、Pagefind 和 `scripts/check-links.py`；GitHub Pages 工作流使用该命令。`status: draft` 的条目不会生成公开文章或进入搜索，科研文字、图解和教程需完成来源核查与浏览器测试后再发布。


## 内容覆盖率

运行 `npm run coverage`，根据专题元数据和内容文件的 frontmatter 统计各领域已发布专题、草稿、工具、论文与教程，并列出缺少论文或工具关联的已发布专题和未实际运行的教程。专题正文以内容文件的 `status` 为准；尚无正文的专题计为待编写。脚本读取当前项目采用的单行标量和内联数组字段，若调整 frontmatter 格式，应同步更新脚本。输出是维护提示，文献和方法是否适配仍需人工核查。

专题正文的 ID、领域和状态必须与专题元数据一致；校验同时覆盖草稿和已发布内容。新增草稿正文时先登记相同 ID、domainId 和 draft 状态的元数据，再运行 npm run validate。

知识关联图从已发布工具的领域、原理、专题、论文和教程关联自动生成；草稿不进入图或搜索。添加关联时应保证关系语义有来源支持，并运行 npm run validate 与 scripts/browser-test-knowledge-graph.mjs。
