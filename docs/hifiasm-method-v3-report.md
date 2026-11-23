# Hifiasm 算法详情页 V3 验收报告

日期：2026-11-23。分支：feat/hifiasm-method-v3；基线 main：6f7c5ac（已合并导航V3）。

## 范围与组件

仅动态路由中的 entry.id === hifiasm 使用新模板。其余57个工具保留原有渲染。未修改首页、全站品牌、导航、页脚、其他详情正文及数据集合。

新增 method-v3/ 下的 MethodPageLayout、MethodHeader、MethodSidebar、MethodResources、MethodWorkflow、HifiasmPrincipleFigure、hifiasm.ts 与作用域CSS。布局可接收章节和步骤配置；科研图解当前仅为Hifiasm提供，后续迁移应另行提供各工具的数据与专属图解。

## 数据与原文保留

头部读取 methods/hifiasm.md 的名称、summary、输入、原理和代码仓库；领域取自 domains。原始方法论文读取 papers/hifiasm.md；植物案例通过关联工具与 DOI 10.1111/tpj.15583 从论文集合选择；教程读取 method=hifiasm 的已发布记录及 tested 字段；专题由已发布 metadata.methodIds 匹配。

现有15个Markdown章节按标题映射到新布局，每段只渲染一次。构建阶段检查未映射或重复标题；浏览器将每段 Markdown 渲染文本与页面 data-source-heading 文本逐一比较，全部一致。原文相近主题仍保留，原理补充与多段输入输出/植物案例使用可展开说明，无删减。原Markdown文件未改动。

映射：概览=一句话简介与开发背景；原理=计算思路/开发背景与核心流程/算法原理与图处理；输入输出=输入与输出/输入、参数与结果/运行入口、输入检查与参数/输出文件阅读；生物学问题=研究问题；案例=植物研究/已核实植物案例/植物案例及证据；评估=适用范围与质量评估；资源=实践与来源/相关资源。

## 科研SVG依据

原创矢量图按四阶段呈现HiFi reads、可靠重叠、带分支组装图与候选路径。注明教学示意，非真实数据；分支可能来自等位差异、重复或噪声，候选路径不代表整染色体完全分相。HiFi-only hap1/hap2按官方文档标为部分相位contig图。复用Base现有图解放大、键盘滚动与对话框焦点机制。

主要依据：
- https://hifiasm.readthedocs.io/en/latest/interpreting-output.html （实际读取）
- https://github.com/chhylp123/hifiasm （实际读取）
- https://doi.org/10.1038/s41592-020-01056-5 （现有论文记录；出版方页面受身份跳转限制，使用已收录解读与官方输出文档）
- https://doi.org/10.1111/tpj.15583 （现有核实植物案例记录）

未新增N50/QV等实测统计。命令为教学模板，继续标注“命令已核对，真实数据待验证”，未执行真实植物组装。

## 视觉与响应式

已保存旧版截图、首轮截图、优化后桌面首屏/长图、原理图、表格、命令和资源卡特写、768平板、390手机长图、375截图及前后比较。首轮原理区占高过大；已压缩SVG显示高度，将原理补充整合到展开区域并把放大入口移至图框角落。

参考图顶部品牌栏与当前网站不同，按任务要求保留已完成品牌/导航。目录采用统一编号；章节内容和论文摘要读取真实记录，篇幅及原型示例存在差异。未复制参考图“完全分相”等不适用于全部模式的示例标注。

1600×900、1440×900、1280×800、1024×768、768×1024、390×844、375×812真实Edge浏览器均无页面级横向溢出。桌面三栏；1024右资源下移；小于1024目录折叠、正文单栏；手机步骤纵排，图表和代码局部滚动。

## 功能测试

scripts/browser-test-hifiasm-v3.mjs 通过13组断言：七档布局/锚点/手机目录，15章节原文一致性，图解放大关闭，精确复制命令，站内资源链接HTTP200，其余57工具旧模板，首页/领域/专题回归。控制台pageerror为空。

命令复制得到 hifiasm -o sample -t 32 reads.fq.gz。原始方法论文和植物案例DOI、官方代码入口均验证目标URL；外部网站的长期可用性由来源服务决定。

## 工程验证

- npm run check：83个Astro文件，0 errors / warnings / hints。
- npm run build：由validate执行，279静态页及279页Pagefind索引生成成功。
- npm run validate：11481本地链接0错误，首页/领域校验通过。
- npm run coverage：9领域63专题、58工具、130文献、10教程保持原有数据，Hifiasm教程仍为template。
- npm run test:figure-a11y：375/768/1280/1440px图解选择、重置、键盘滚动、放大对话框及焦点检查通过。
- 新专项浏览器测试：通过。目录测试等待平滑滚动完成后检查当前锚点，避免在动画中间态做错误判断。

## 输出与后续

项目截图：outputs/hifiasm-method-v3/。
最终交付：D:\Codex-Projects-data-output\20261123PhytoMethodsHifiasm详情页V3。
报告包含科学依据、原文映射及测试记录；保持PR未合并，等待视觉验收，不发布正式网站。其他57工具不在本轮适配范围。
