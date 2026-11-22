# M01 领域页 V2 视觉验收

实现文件：src/components/domain-v2/M01Domain.astro、domain-v2.css、src/pages/topics/[domain]/index.astro。

M01 专用白绿三栏模板，完整保留 AssemblyOverview；专题元数据与已发布内容集合关联，工具简介取自原内容集合。原创 SVG 表示 Reads、Contigs 与含间隙的 Scaffold；五阶段流程标记为概括性技术路线。整页 Inter/Noto Sans SC 无衬线排版，左侧目录滚动高亮，右侧资源链接。

两轮 Edge 视觉检查：1600、1440、1280、1024、768、390、375px 均无页面溢出。7 个专题可见，13 个专题/工具/相关领域链接实际打开成功，锚点点击与当前章节高亮通过，浏览器无页面脚本错误。M02～M09 全部沿用原模板，首页结构回归通过。

npm run validate 通过：Astro 类型检查零错误，279 页构建，Pagefind 索引成功，10077 个站内链接零错误。npm run test:figure-a11y 在 375、768、1280、1440px 通过。

截图：outputs/m01-domain-v2/before-1600.png、final-{1600,1440,1280,1024,768,390,375}.png、final-390-full.png、before-after.png。浏览器结果为 browser-results.json。

发布状态：开发分支 feat/m01-domain-v2，提交 PR 后等待用户审核，不合并和部署。
