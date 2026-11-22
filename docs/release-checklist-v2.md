# v2.0 分阶段发布核对表

状态更新时间：2026-11-22。工作分支：`feat/long-run-m03-v2`。

## 本地交付状态

M03–M09 七个领域的专题、工具、论文和教程内容均已完成本地发布闭包；M01、M02 保留既有公开内容。本地内容状态为 `published`，表示当前工作树构建会生成对应页面，不代表 GitHub Pages 已同步。

| 领域 | 专题 | 工具 | 论文 | 教程 | 本地状态 |
|---|---:|---:|---:|---:|---|
| M01 测序与组装 | 7/7 | 4 | 7 | 1 | 既有公开内容 |
| M02 基因组注释 | 7/7 | 3 | 7 | 1 | 既有公开内容 |
| M03 泛基因组与结构变异 | 7/7 | 13 | 24 | 2 | 本地发布闭包完成 |
| M04 比较基因组学 | 7/7 | 6 | 16 | 2 | 本地发布闭包完成 |
| M05 群体遗传学 | 7/7 | 9 | 26 | 1 | 本地发布闭包完成 |
| M06 GWAS 与育种 | 7/7 | 5 | 11 | 1 | 本地发布闭包完成 |
| M07 表观基因组与三维基因组 | 7/7 | 5 | 16 | 1 | 本地发布闭包完成 |
| M08 单细胞与空间组学 | 7/7 | 7 | 14 | 1 | 本地发布闭包完成 |
| M09 调控基因组学与 AI | 7/7 | 8 | 13 | 1 | 本地发布闭包完成 |

## 最终本地验收

- `npm run validate`：Astro 63 个内容文件零错误、警告和提示；静态生成 276 页；Pagefind zh-cn 索引 276 页、34,436 词；7,749 条站内链接零错误。
- `node work/audit-metadata-relations.mjs`：63 个专题、58 个方法、127 篇论文，双向关系差异为 0。
- `npm run coverage`：M01–M09 的 63 个专题正文均已发布；各领域教程和方法数量见上表。未真实运行的教程继续按各自 `tested` 状态标明。
- M09 新增内容已执行本地路由生成及链接检查；该领域的浏览器三视口、浏览器内搜索与交互测试未完成。
- 其他领域的逐项科学审核、示意图和已实际运行教程记录见 `docs/scientific-review-v2.md`、`docs/m03-evidence.md` 至 `docs/m09-evidence.md`。
- `npm audit --offline` 使用本机缓存报告 0 vulnerabilities；在线 `npm audit` 因 `registry.npmjs.org` DNS 解析失败，未取得当前在线 advisory 数据。

## 正式发布状态

本地最新提交为 `8f6936e`（`Complete M09 regulatory genomics and AI release`）。本地分支比远程跟踪分支领先 51 个提交。远程仓库 `hao1006sy-source/phytomethods` 的 `main` 仍指向已合并的 M02 版本；远程 `feat/long-run-m03-v2` 仍停留在 2026-11-21 的 M02 基线；GitHub 上未发现本轮 v2.0 PR。

本轮 `git push` 无法连接 `github.com:443`。GitHub MCP 对 Git Trees API 和 Contents API 的写入均返回 `403 Resource not accessible by integration`。网页读取工具也无法访问 Pages 地址。GitHub 仓库 API 显示远程 `main` 仍为 M02；因此尚无 v2.0 PR、Actions 构建、Pages 部署或线上验收记录。不得把当前本地 `published` 状态描述为正式线上发布。

## 尚未关闭的最终步骤

1. 恢复可用的 GitHub 写入通道，将本地提交序列推送至既有分支。
2. 创建并检查 M03–M09 的 v2.0 PR，确认 GitHub Actions 构建结果后按既有授权合并。
3. 检查 `/phytomethods/` 线上首页、九领域、专题、工具、论文、教程和 Pagefind 搜索。
4. 补做 M09 桌面/平板/手机浏览器布局与交互回归，并保存最终页面截图。
5. 在可访问 npm registry 的环境重跑 `npm audit`，复核本机缓存审计结果并记录依赖处置。

在远程同步、线上部署及相应验收完成前，v2.0 的阶段性正式发布保持未完成。
