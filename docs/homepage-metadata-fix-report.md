# 首页元数据精准修复

首页原先按全站 domains 的顺序匹配任意关联领域，M03 排在 M04 前，导致 OrthoFinder 的次要领域覆盖首选领域。现按工具 domainIds[0] 精确查找；缺失或非法时使用既有“方法”回退。跨领域关联和所有 Frontmatter 保留。

CAFE5 正文提交为 2026-11-24 00:25:45+08:00。PR #38 创建于 UTC 2026-11-23 16:28:17，即北京时间 11 月 24 日 00:28:17；合并于 UTC 16:31:21，即北京时间 00:31:21。运行验证跨越 23—24 日并于 24 日完成，verifiedAt 保留 2026-11-24。updatedAt 表示正文更新的日历日期，也保留 2026-11-24。

站点日期基准为 Asia/Shanghai。YAML 日期为 date-only 字段，Astro 将其解析为 UTC 午夜；使用 toISOString().slice(0,10) 保持原始日历日，不再对日历日期进行本地时刻转换。首页与教程详情均遵循此方式。当前日期的防未来检查显式使用 Asia/Shanghai，UTC Runner 不会把北京时间 24 日误当成 23 日。

自动检查覆盖精选 ID、首选领域有效性、OrthoFinder M04、首页选择规则、所有已发布日期合法性与上海当前日期。未修改 CAFE5 Frontmatter、verifiedAt、运行证据或知识图谱。

npm ci、check、build、validate、coverage、check:tutorial-science、check:cafe5 均通过。Edge 在 1600×900、1280×800、390×844 验证 Hifiasm M01、EDTA M02、OrthoFinder M04、CAFE5 2026-11-24、详情链接 HTTP 200 和无横向溢出。截图见 outputs/home-metadata-fix/。
