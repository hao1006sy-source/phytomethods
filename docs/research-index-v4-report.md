# 研究领域索引页 V4 验收报告

本次基于 main a165e4f，分支 feat/research-index-v4，仅调整 topics/index.astro 和该页面独立 CSS。首页、内容数据和领域详情页源码保持原样。

## 页面设计与数据

三个研究分区各包含三张领域卡片；Hero 显示已发布内容总数 9 / 63 / 58。领域名称、摘要及路径来自 domains.ts。专题数量读取 topics Collection 的 published 记录与 domain 字段；工具读取 methods Collection 的 published 记录与 domainIds，并按 ID 去重。代表性工具在构建时校验存在、已发布、属于对应领域。所有卡片为单个链接，无嵌套链接。

复用首页九个科研 SVG，Hero 使用页内轻量叶片 SVG。样式限定 research-index-v4；容器使用 main:has(.research-index-v4) 仅匹配本页。保持全站导航、字体栈与品牌组件。

## 两轮视觉检查

第一轮完成三分区结构，检查桌面和手机截图。第二轮收紧桌面主容器、Hero、卡片和分区间距，使横屏视野包含九个领域及继续探索区域；统计图标改用现有 SVG；手机减弱叶片装饰，统计自然排列，卡片单列。

## 实际测试

- npm run check：88 文件，0 错误、0 警告、0 提示。
- npm run build：279 静态页面成功生成，Pagefind 索引完成。
- npm run validate：11,351 本地链接，0 错误；首页精选、领域配置校验通过。
- npm run coverage：通过，九领域各 7 篇已发布专题；原有教程验证状态保持。
- Edge：1600、1440、1280、1024、768、390、375px 均无页面横向溢出；每个视口验证九张卡片、三个分区和 9/63/58 统计。
- 九领域和三个继续探索入口均返回 HTTP 200，并显示有效主标题。
- 首页、genome-assembly 领域主页和 Hifiasm 工具页回归均 HTTP 200；浏览器 pageerror 为 0。

## 交付

outputs/research-index-v4 保存旧版、新版横屏、桌面长图、七尺寸截图、前后对比图和浏览器 JSON。第一轮截图以 round1 开头，最终截图以 final 开头。工具和专题数量来自真实数据，与参考图示例数字存在差异。

PR 保持开放，等待视觉验收。
