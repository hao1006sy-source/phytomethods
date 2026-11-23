# 分析教程索引页 V4 验收报告

## 范围与实现

基线为最新 main（24b0f57），分支 feat/tutorial-index-v4。仅修改教程索引与专用 CSS、脚本及测试，十篇教程正文和详情页、公共 filters.ts、全站导航与部署配置均未修改。

页面采用紧凑 Hero、动态统计、研究任务标签、搜索与三个组合筛选器、双列教程卡片、底部延伸导航。科研图标复用首页 SVG。无合适的现有非水稻叶片素材，Hero 保留纯白背景。专用样式使用 tutorial-index-v4 命名空间。

## 真实数据与状态

教程从已发布 tutorials Collection 读取；工具和领域从已发布 methods 与 domains.ts 关联。统计为 10 篇、verified 7 篇、template 3 篇，not-tested 0 篇。Hifiasm、EDTA、CAFE 5 保留命令模板标签，SyRI 保留已验证状态。SciPy 为现有已发布工具，GWAS 教程按真实 SciPy 关联展示。

分类数量从关联领域动态计算，依次为 2、3、2、2、1。OrthoFinder 关联比较基因组与泛基因组，因此 M03 + verified 的结果为 2 篇。

数据来源标签逐篇依据正文核对：5 篇模拟数据教程、SyRI 官方拟南芥测试数据、OrthoFinder 官方非植物示例、CAFE5 官方非植物示例（模板）。Hifiasm 与 EDTA 不添加已实际使用数据的推断标签。标签配置旁包含审核说明，未来新增教程默认不显示数据来源。

## 筛选与排序

专用 tutorial-index-v4.ts 支持标题、摘要及工具名关键词；研究任务、领域、验证状态、工具采用 AND 组合，领域支持真实多值关联。结果数量与隐藏状态同步。默认按更新日期降序，同日按标题排序；支持标题排序。重置同时恢复研究任务、所有筛选与默认排序，空结果提供重置按钮。任务按钮使用 aria-pressed，结果数量使用 aria-live。

## 两轮视觉检查

第一轮完成桌面与手机检查，发现横屏列表和底部导航需要收紧。第二轮调整 Hero、筛选栏、卡片图标尺寸、字号和间距，保持桌面双列，手机单列，长标题正常换行。最终保存七尺寸完整截图、1600×900 首屏、筛选与空状态、前后对比。

## 实际测试

- npm run check：100 文件，0 错误、0 警告、1 条主分支已有提示（PaperPageLayout.astro 未使用 entry）。
- npm run build：通过，静态站点和 Pagefind 索引成功生成。
- npm run validate：通过，11,498 个站内链接，0 错误。
- npm run coverage：通过；原有 7 verified / 3 template 状态保持。
- Edge 检查 1600×900、1440×900、1280×800、1024×768、768×1024、390×844、375×812，均无页面横向溢出。
- 所有任务分类和实时数量、40 组领域/状态组合、所有工具过滤、大小写关键词、标题和日期排序、重置、空结果通过。
- 十个教程和三个底部入口全部 HTTP 200；首页、研究领域、工具及文献索引可正常访问。
- 公共工具索引搜索 Hifiasm 返回 1 条，重置恢复 58 条；手机键盘分类与工具组合通过。
- 浏览器 pageerror 为 0。

## 交付与复跑

浏览器脚本：scripts/browser-test-tutorial-index-v4.mjs，使用 node 直接运行；可通过 PHYTOMETHODS_PREVIEW_BASE 和 EDGE_PATH 配置预览地址与浏览器。截图和 browser-results.json 保存于 outputs/tutorial-index-v4，最终成果同步 D 盘任务目录。

目前无阻断性问题。PR 保持未合并，等待视觉验收。
