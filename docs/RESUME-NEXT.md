# PhytoMethods 下一次恢复入口

- 当前分支：`feat/long-run-m03-v2`。发布基点 `91f24bd`；最新提交请运行 `git log -1 --oneline` 确认。
- 正在执行：阶段 B，M03 泛基因组与结构变异；七篇专题、六项工具、七条论文及一篇教程为草稿，尚未发布。
- 最近通过：`npm run validate`，Astro 类型检查 0 错误/警告，1171 条内部链接通过；`node scripts/browser-test-v1.3.mjs` 通过现有页面回归；`npm audit` 0 项漏洞。
- 知识关联列表已加入，`node scripts/browser-test-knowledge.mjs` 在四种宽度下通过；工具及教程的领域名称已改为从数据推导。
- 源码：`src/content/topics/m03-topic-*.md`、`src/content/methods/` 对应 M03 文件、`src/content/papers/` 对应草稿、`src/content/tutorials/syri-intro.md`、`src/components/PangenomeDemo.astro`。
- 立即执行：`git status --short`，读取 `docs/long-run-progress.md`；核对 M03 各草稿与原始论文、完善图解和教程，使用安全的开发预览测试草稿页面，完成后再修改 `src/data/topic-metadata.json` 的 published 状态。
- 每次验证：`$env:ASTRO_TELEMETRY_DISABLED='1'; npm run validate; node scripts/browser-test-v1.3.mjs`。
- 未解决：M03 读段定位、锚点链、样本路径与三幅图解已在临时预览通过四种宽度检查，M03 尚未完成发布态验证，教程未执行真实数据；M04～M09、完整知识图谱和最终验收尚未开始。不得把草稿合并为已完成内容。
