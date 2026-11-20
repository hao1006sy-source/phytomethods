# PhytoMethods 下一次恢复入口

- 当前分支：`feat/long-run-m03-v2`。发布基点 `91f24bd`；最新提交请运行 `git log -1 --oneline` 确认。
- 正在执行：阶段 B，M03 泛基因组与结构变异；阶段 C 已完成 M04 七个专题正文初稿，阶段 D 已有 M05 七个专题正文草稿，阶段 E 已有 M06 七个专题正文草稿；七篇专题、六项工具、十一条 M03 相关论文及一篇教程为草稿，尚未发布。
- 最近通过：`npm run validate`，Astro 类型检查 0 错误/警告，1178 条内部链接通过；`node scripts/browser-test-v1.3.mjs` 通过现有页面回归；`npm audit` 0 项漏洞。
- 知识关联列表已加入，`node scripts/browser-test-knowledge.mjs` 在四种宽度下通过；工具及教程的领域名称已改为从数据推导。
- 源码：`src/content/topics/m03-topic-*.md`、`src/content/methods/` 对应 M03 文件、`src/content/papers/` 对应草稿、`src/content/tutorials/syri-intro.md`、`src/components/PangenomeDemo.astro`。
- 立即执行：`git status --short`，读取 `docs/long-run-progress.md`；核对 M03 各草稿与原始论文、完善图解和教程，使用安全的开发预览测试草稿页面，完成后再修改 `src/data/topic-metadata.json` 的 published 状态。
- 每次验证：`$env:ASTRO_TELEMETRY_DISABLED='1'; npm run validate; node scripts/browser-test-v1.3.mjs`。
- 未解决：M03 读段定位、锚点链、样本路径与三幅图解已在临时预览通过四种宽度检查，M03 尚未完成发布态验证，教程未执行真实数据；M04 工具与教程、逐篇复核及 M05 工具和教程审查、M06 工具和教程、M07～M09、完整知识图谱和最终验收尚未开始。不得把草稿合并为已完成内容。

- 阶段 F 已新增 M07 前三个专题草稿（m07-topic-01～03）；继续 ATAC-seq、ChIP/CUT&Tag、Hi-C 与表观响应，核验工具和植物论文。最新 npm run validate 通过。

- M07 七篇专题正文草稿齐备，工具、图解、教程和草稿浏览器检查仍待完成。接下来可独立推进 M08 内容，同时保留 M03～M07 草稿状态。

- 阶段 G 已新增 M08-01～03 草稿，继续 marker、拟时序、空间组学及多组学；阶段 F 的工具与图解仍待补充。最近一次 npm run validate 通过。

- M08 七篇专题初稿均已写入，最新 npm run validate 通过；继续 M09 与各领域工具、图解、教程及浏览器审查。自动审批曾因额度限制未能执行 Git 提交，检查 git status 确认保存情况。

- 阶段 H 新增 M09-01～03 草稿；M08 七篇初稿已提交。继续 motif、多组学、植物基础模型和预测评估，再补齐工具、图解及逐页审查。

- M03～M09 共 49 篇专题已有草稿；这些不是正式发布页面。最新 npm run validate 通过。下一步逐领域补齐工具及论文关系、交互图、可执行教程，深化正文并逐页审核，随后分阶段发布。
