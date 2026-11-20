# 内容维护指南

内容位于 `src/content`，Markdown 文件名是稳定的英文 ID。每个条目使用 `src/content.config.ts` 的字段与状态，`published` 显示在目录和搜索中。`updatedAt` 仅在内容有实际修改时更新。

方法条目的 `domainIds`、`topicIds`、`principleIds`、`dataIds` 使用稳定 ID，标签名称维护于 `src/data/tags.ts`。`paper` 指向方法论文的文件 ID。论文填写不带 URL 前缀的 DOI、类别、领域、物种及有证据的 `method`；植物应用与工具的关联应核对论文方法部分。教程的 `method` 与 `tested` 指定关联工具及验证状态。

添加内容后运行 `npm run build`。Schema 检查字段类型；首页构建期间检查关联、受控标签与 DOI 唯一性。修改目录元数据或新增领域时同步检查 `src/data/domains.ts` 与 `src/data/topics.ts`。之后运行 `python scripts/check-links.py` 与 `node scripts/browser-test.mjs`；浏览器测试需要运行预览服务器。

## 专题元数据与关系
`src/data/topic-metadata.json` 包含 63 条独立记录。`id` 是持久英文标识；`title` 与 `englishTitle` 分别是中英文名称；`domainId` 和 `order` 控制领域及顺序；`summary` 和 `keyConcepts` 描述主题。`methodIds`、`paperIds`、`tutorialIds` 是指向对应内容的稳定 ID 数组；`principleIds` 和 `dataIds` 来自 `src/data/tags.ts`。`status` 为 `published`、`draft` 或 `planned`；未核实的 `createdAt`、`updatedAt` 为 null，不推定历史日期。

M01 的已发布记录应有同名 Markdown 正文，网页根据专题关系反查工具、论文及教程；工具页面反查专题与论文。论文的 `methodIds` 是多对多关系，只有经原论文证实的工具关系才能写入。构建时验证 63 条记录的 ID、领域、顺序、标签、正文及各类关系，并检查已发布内容、DOI 和重复项。已知 `method` 是历史兼容字段，新论文使用 `methodIds`。
