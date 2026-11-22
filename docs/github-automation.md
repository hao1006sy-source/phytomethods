# GitHub 自动化发布环境

更新时间：2026-11-22

本文记录 PhytoMethods 本机 GitHub 自动化发布所需的代理、认证和发布步骤。GitHub CLI 是创建与管理 Pull Request 的首选工具；已连接的 GitHub App 接口保留作备用。

## 本机代理与 Codex 执行环境

- FlClash 程序：`E:\FlClash\FlClash.exe`。
- 代理地址：`http://127.0.0.1:7890`。
- Windows 用户代理：`127.0.0.1:7890`。
- Git 全局代理：`http.proxy=http://127.0.0.1:7890`。
- Windows 登录启动：用户 Startup 文件夹中的 `FlClash.lnk`。
- Windows 任务计划程序：`\PhytoMethods-FlClash-Autostart`，当前用户交互式登录触发，程序工作目录为 `E:\FlClash`。

Codex 默认隔离命令无法访问宿主 Windows 的本机回环地址：默认上下文的 `127.0.0.1:7890`、宿主 LAN 地址和 `host.docker.internal:7890` 探测均未连通。使用授权的宿主命令执行环境时，能够看到 FlClash Core 在 `:::7890` 监听，并且 `git ls-remote origin HEAD` 成功。GitHub 网络操作应使用可访问宿主代理的执行环境；不能将默认沙箱里的 localhost 探测结果当作宿主代理状态。

登录任务最后一次运行结果为 `0`。独立命令中的任务状态、FlClash 进程和端口探测可作为后续巡检方式。跨两个独立 Codex 会话的完整端到端验收需要在两个会话中分别执行远程读取；同一会话的不同命令调用不能替代这项验收。

## GitHub CLI 安装与认证

- 安装来源：GitHub CLI 官方 Windows 安装文档推荐的 WinGet 包 `GitHub.cli`。
- 已安装版本：`2.105.0`。
- 当前二进制：`C:\Program Files\GitHub CLI\gh.exe`。
- 安装程序已将目录写入系统 PATH；当前 Codex PowerShell 使用旧 PATH，本轮通过绝对路径执行；新命令会重新加载 PATH。
- 首次认证需运行 `gh auth login --hostname github.com --git-protocol https --web`，在浏览器设备页面登录仓库账号并授权。完成后运行 `gh auth status` 确认登录用户及 Git 操作协议。
- `gh` 通过 Go HTTP 客户端读取 `HTTPS_PROXY`、`HTTP_PROXY`。在宿主执行环境中运行时，设置为 `http://127.0.0.1:7890`；不要将这两个变量设置成默认隔离沙箱无法访问的代理地址。
- GitHub App 连接器的 PR 创建接口目前返回 `403 Resource not accessible by integration`。CLI 经用户授权后作为 PR 首选，连接器作为备用读取或操作入口。

## 发布流程

每次更新从独立开发分支进行：

1. 确认工作区与目标 `main` 状态，创建功能分支。
2. 运行内容校验、Astro 构建、链接检查及相关浏览器检查；PR 会由 `.github/workflows/ci.yml` 自动运行 `npm ci` 与 `npm run validate`。
3. 只暂存本次开发文件，创建描述清楚的 Git 提交。
4. 推送分支：`git push -u origin <branch>`。
5. 创建 PR：`gh pr create --base main --head <branch> --fill`。需要人工审阅的更改使用 `--draft`。
6. 等待 CI：`gh pr checks <number> --watch`，核对 `deploy.yml` 所需检查及 PR 页面状态。
7. 只有全部必需检查成功且仓库规则允许时才合并。可使用 `gh pr merge <number> --auto --squash` 请求在检查满足后自动合并；若仓库未启用自动合并或规则要求人工审核，应停止并按规则完成审核。
8. 合并后检查 GitHub Pages 工作流：`gh run list --workflow deploy.yml`，再访问线上站点验证部署。

禁止向 `main` 强推。自动合并不能绕过必需 CI、分支保护或审阅规则。

## 本轮验证记录

- 远程：`hao1006sy-source/phytomethods`。
- 正式 `main`：`d2193f661fe6faf403823a1405f663d1b53bce50`。
- Git Push：已通过仅含临时测试文件的分支验证；测试分支 `codex-gh-cli-pr-test-20261122` 已删除，未修改 `main`。
- PR：GitHub CLI 浏览器授权成功，`gh auth status` 为 `hao1006sy-source`。CLI 成功创建、查询并关闭临时 PR #7；该 PR 未合并。GitHub App 连接器的创建接口仍返回 403。
- CI：PR #7 没有检查项，确认原有仓库未配置 PR 校验。新增 `.github/workflows/ci.yml`，等待其正式 PR 运行验证。
- Pages：本轮未触发部署，既有 `main` 部署未修改。
- 跨会话：两个独立的授权宿主命令调用均成功读取远程 `HEAD`/`main`，当前仓库均为 `d2193f661fe6faf403823a1405f663d1b53bce50`。这证明独立宿主命令可复用登录态 FlClash；两个独立 Codex 会话的完整验收仍待执行。默认隔离命令不能访问宿主 `localhost`。

测试分支上的临时文件不会合并进正式代码。验证清理应关闭测试 PR 并删除测试分支。
