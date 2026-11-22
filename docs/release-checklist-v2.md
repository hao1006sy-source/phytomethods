# v2.0 分阶段发布核对表

状态更新时间：2026-11-22。正式发布提交：`e65cc18`（PR #2）。

## 本地交付状态

M03–M09 七个领域的专题、工具、论文和教程内容均已合并发布；M01、M02 保留既有内容。GitHub Pages 已部署 `main` 的 `e65cc18`。

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
- M09 新增内容通过构建与链接检查。浏览器三视口、浏览器内搜索及交互测试未完成；当前环境中的 Edge 启动因 `CoCreateInstance of Elevator` 权限错误退出，agent-browser 会话目录也不可写。
- 其他领域的逐项科学审核、示意图和已实际运行教程记录见 `docs/scientific-review-v2.md`、`docs/m03-evidence.md` 至 `docs/m09-evidence.md`。
- 在线 `npm audit` 经系统代理完成，0 vulnerabilities。

## 正式发布状态

PR #2（[完成 M03–M09 科研知识体系与 v2.0 验收](https://github.com/hao1006sy-source/phytomethods/pull/2)）已合并至 `main`，merge commit 为 `e65cc18cb36352a1a6fc34baab14898e54b30582`。GitHub Actions 部署工作流 [44971996069](https://github.com/hao1006sy-source/phytomethods/actions/runs/44971996069) 以 `success` 结束。GitHub Pages 地址为 <https://hao1006sy-source.github.io/phytomethods/>。

线上首页、M01 领域及单倍型专题、Hifiasm 工具/论文/教程、M09 领域及 AgroNT 工具/论文、WGCNA 教程和搜索页均返回 HTTP 200。Pagefind `pagefind-entry.json`、UI 脚本、运行脚本、站点地图与 robots 文件均返回 HTTP 200；线上中文索引包含 276 页。浏览器内搜索交互与三视口布局尚未验证。

## 尚未关闭的最终步骤

1. 在浏览器可启动的环境补做 M09 桌面、平板、手机视口与页面交互回归，并保存最终页面截图。
2. 在浏览器中输入中文查询词，验证 Pagefind 返回结果、点击结果跳转和子路径部署下的资源加载。

除上述浏览器验收项外，v2.0 内容合并、CI 部署、线上路由与资源响应、在线依赖审计均已完成。
