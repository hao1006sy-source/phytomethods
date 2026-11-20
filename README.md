# PhytoMethods

植物基因组学与生物信息学方法知识库。采用 Astro 静态生成，内容使用 Markdown，搜索使用 Pagefind。

## 本地运行

```bash
npm ci
npm run dev
```

浏览终端所示的地址，路径前缀为 `/phytomethods/`。`npm run build` 执行类型检查、构建并生成搜索索引；`npm run preview` 预览构建产物。

## 发布

将项目推送至 `hao1006sy-source/phytomethods` 的 `main` 分支，在 GitHub 仓库 Settings → Pages → Build and deployment 中选择 GitHub Actions。工作流将自动构建并发布。未来使用独立域名时修改 `astro.config.mjs` 的 `site` 与 `base`。

## 内容维护

参见 `docs/content-guide.md`。教程命令为示范模板，执行前需替换路径并按官方文档检查版本。
