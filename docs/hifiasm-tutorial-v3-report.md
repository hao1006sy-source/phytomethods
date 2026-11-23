# Hifiasm 组装入门教程 V3 样板报告

## 范围与架构

基于 main f56706b，在 feat/hifiasm-tutorial-v3 分支开发。路由仅对 hifiasm-intro 使用新模板；其他九篇沿用 ArticleShell，教程索引 V4、首页、科研知识关系和方法论文数据均未修改。

新增 tutorial-v3 组件目录：TutorialPageLayout、TutorialSidebar、TutorialStep、TutorialCodeBlock、TutorialMarkdown、TutorialWorkflow、TutorialResources、HifiasmTutorial、hifiasm.ts 及专属样式。布局/侧栏/代码块与 Hifiasm 内容配置分离；代码组件使用 Astro Code 语法高亮，支持 Bash、Python、R、Shell、YAML 等语言参数。hifiasm.ts 从现有 Markdown 提取原文与命令，不改写源文件。

## 内容与来源

原 Markdown 保持完全不变，9 段原文、全部原始命令与链接渲染保留。原复合安装/测试块拆分到安装、数据和运行步骤，避免重复命令。测试逐段比较原文渲染文本、逐行核对源命令，另逐块比对真实系统剪贴板内容。Windows 剪贴板 CRLF 与网页 LF 统一后比较，其余字符精确一致。

命令与参数核对依据：
- https://github.com/chhylp123/hifiasm （官方源码编译、小型测试、HiFi-only 输出、FASTA 导出）。
- https://hifiasm.readthedocs.io/en/latest/parameter-reference.html （-o、-t、-f、--version）。
- https://github.com/marbl/merqury （k-mer 质量评估）。
- https://busco.ezlab.org/busco_userguide.html （保守基因完整性）。

-f 0 保留官方小型测试背景，说明关闭初始 Bloom filter。未写死软件版本、运行耗时、组装指标或评估结果。新增 PATH 提示区分本地编译 ./hifiasm 与已加入 PATH 的 hifiasm 主命令。tested 保持 template，更新时间读取原记录 2026-11-20。此次执行网页与交互测试，未运行真实测序组装。

## 页面与视觉

三栏：左侧 sticky 十步骤目录，中间操作手册，右侧四组信息。头部保留面包屑、标签、官方资源及黄色模板提示。学习目标与原创 SVG 工作流并排；准备清单可折叠；七个 STEP 包含安装、数据、运行、输出、转换、评估和 FAQ。代码为可选择复制文本。

两轮真实浏览器截图完成。第一轮处理全站旧脚本对图解和代码添加重复按钮的问题；局部组件拥有自己的工具栏与放大交互，公共脚本未修改。第二轮收紧目标卡片、SVG 与首屏间距，检查代码区、平板和手机。手机单栏、目录默认折叠、信息区移至正文后，长代码与流程图在各自区域内部滚动。

## 测试结果

- npm run check：117 文件，0 错误、0 警告、0 提示。
- npm run build：通过，279 静态页面，Pagefind 完成索引。
- npm run validate：通过，12,189 本地链接，0 错误。
- npm run coverage：通过，Hifiasm 保持 template，7 verified / 3 template 分布保持。
- Edge：1600×900、1440×900、1280×800、1024×768、768×1024、390×844、375×812 均无页面横向溢出。
- 十个锚点、滚动高亮、5 个代码块真实复制和反馈、工作流放大/Escape/焦点返回、七个 FAQ 全部通过。
- 原文 9 段及全部源命令保留。
- 其他九篇教程仍有原 reading-layout，均 HTTP 200；教程索引 V4 十卡片与 Hifiasm 搜索、首页、算法和论文页回归通过。
- 9 个外部 URL（含 DOI 和官方测试数据）HEAD 请求均 200，详情见 external-links.json。
- 浏览器 pageerror 为 0。

专项脚本：node scripts/browser-test-hifiasm-tutorial-v3.mjs。配置 PHYTOMETHODS_PREVIEW_BASE 或 EDGE_PATH 可调整本地环境。

## 交付

outputs/hifiasm-tutorial-v3 包含旧版、首轮、最终首屏、七尺寸长图、安装代码特写、SVG/截图与放大状态、前后对比、浏览器与外链 JSON。最终交付同步 D 盘任务目录。

无阻断性问题。PR 保持未合并，等待视觉验收。

提交：3623a05。PR：https://github.com/hao1006sy-source/phytomethods/pull/27（开放待验收）。
