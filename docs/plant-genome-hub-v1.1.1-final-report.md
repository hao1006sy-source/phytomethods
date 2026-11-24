# PhytoMethods｜Plant Genome Hub V1.1.1 收尾与科学资源质量补全报告

> **开发分支**: `fix/plant-genome-hub-v1.1.1`  
> **PR 标题**: `fix: Plant Genome Hub 资源核验与主题、CI 收尾`  
> **基准合并**: 基于 PR #45（已合并入 main）  
> **设计系统**: PhytoMethods Scientific Resource Directory V2 (高密度、专业学术、无冗余占位图、WCAG AA 达标)  

---

## 一、V1.1 新设计验收说明

在 PR #45 交付的全页面视觉重构基础上，本次 V1.1.1 全面保留了 V1.1 的全新设计系统，针对学术质量、数据真实度、深色模式冲突与 CI 自动化执行了高标准收尾：

1. **目录页（`/genomes/`）高密度学术目录**：
   - 维持 Hero 紧凑布局与 4 项指标动态计算联动；
   - **多版本归组展示**：在同一物种拥有多套参考组装（如拟南芥 TAIR12 与 TAIR10、番茄 Heinz 1706 SL4.0 与 Micro-Tom SLM_r2.1）时，引入 `<section class="gh-species-group">`，在物种大组下统一呈现，区分「★ 主参考组装」、「历史版本」及「备选品系」，避免物种在列表中无序重复堆叠；
   - 过滤与搜索联动：当筛选命中组内某套组装时，该物种分组正常显示；组内所有组装均不匹配时，整组自动平滑收起。
2. **物种详情页（`/genomes/[species]/`）首屏 2x2 常用下载与多版本切换**：
   - 首屏优先展示全基因组 FASTA、GFF3 注释、CDS 编码区、Protein 蛋白质四大核心文件；
   - 配套指示横幅（Confirmed/Unverified/Incompatible）根据真实登记元数据动态呈现；
   - 科学警示 Alert：保留拟南芥坐标体系不兼容提醒与水稻全基因模型说明，新增番茄 Heinz 1706 SL4.0 与 Micro-Tom 坐标差异及 SGN FTP 状态说明；
   - 跨版本配套检查器、NCBI CLI 命令行复制与本地 Reference Manifest JSON 导出正常工作。
3. **官方数据库导航页（`/genomes/databases/`）客观性修正**：
   - 修正顶部统计指标，移除“全部公开”这一不准确汇总，改为真实客观的「6 大收录官方库 · 5/6 支持免登录直取」；
   - 正文与卡片详细列明各库真实访问政策（如 Phytozome 批量下载需注册 JGI 账号、TAIR 商业与非学术访问受限）。

---

## 二、组装版本、注释与直链数据统计对比

本次更新严格贯彻“真实检查官方 URL、文件名、压缩文件头及可获取的染色体命名，不虚构下载链接”原则，各项核心指标大幅提升：

| 指标项 | V1.1 (PR #45) | V1.1.1 (本次收尾) | 变动说明 |
| :--- | :---: | :---: | :--- |
| **收录物种总数** | 10 | **10** | 保持 10 大植物主粮与模式物种 |
| **参考组装版本 (Assemblies)** | 11 | **12** | 新增番茄经典标准参考组装 Heinz 1706 SL4.0 (`GCA_000188115.5`) |
| **注释发布版本 (Annotations)** | 11 | **12** | 新增番茄配套 ITAG4.0 注释登记 (`itag4.0`) |
| **登记文件资源记录 (Files)** | 85 | **89** | 补齐番茄 SL4.0 的 FASTA/GFF3/CDS/Protein 四大文件 |
| **已核实直接下载链接 (Direct)** | 7 | **25** | 补齐拟南芥 (5)、玉米 (4)、小麦 (4)、大豆 (4)、番茄 (1) 的直链 |
| **已确认配套组合 (Confirmed)** | 1 (水稻) | **5** (水稻/拟南芥/玉米/小麦/大豆) | 经文件头染色体命名与品系/坐标一致性严格核验后升级 |
| **门户访问/待核验资源 (Portals/Unverified)** | 78 | **64** | 随直链核验补齐，待检/门户资源逐步归位为官方确证资源 |

---

## 三、原始文件核验证据与技术参数

所有新增的直接下载链接均通过真实的 HTTP GET Range 请求与本地 Gzip 解压头抽样检验，实测数据永久归档于 `outputs/plant-genome-hub-v1.1/sources/genome-download-checks-v1.1.1.json`：

```json
[
  {
    "species": "水稻 (Rice / Nipponbare)",
    "assembly": "IRGSP-1.0 (GCA_001433935.1)",
    "annotation": "RGAP / MSU Release 7",
    "verifiedUrls": 7,
    "status": "confirmed",
    "chromosomeNamespace": "RGAP Chr-prefixed (Chr1..Chr12)"
  },
  {
    "species": "拟南芥 (Arabidopsis / Col-0)",
    "assembly": "TAIR10 (GCA_000001735.1)",
    "annotation": "Araport11 (Ensembl Plants release-60)",
    "verifiedUrls": 4,
    "status": "confirmed",
    "evidenceHeader": ">1 dna:chromosome chromosome:TAIR10:1:1:30427671:1 REF",
    "chromosomeNamespace": "Ensembl sequence names (1..5)"
  },
  {
    "species": "拟南芥 (Arabidopsis / Col-0)",
    "assembly": "Col-CC.v2 (GCA_028009825.2)",
    "annotation": "TAIR12 (Phoenix Bioinformatics)",
    "verifiedUrls": 1,
    "status": "unverified (注释需TAIR门户登录检索)",
    "evidenceHeader": ">CM053896.1 Arabidopsis thaliana chromosome 1",
    "chromosomeNamespace": "NCBI sequence accession"
  },
  {
    "species": "玉米 (Maize / B73)",
    "assembly": "Zm-B73-REFERENCE-NAM-5.0 (GCF_902167145.1)",
    "annotation": "NCBI RefSeq RS_2025_02",
    "verifiedUrls": 4,
    "status": "confirmed",
    "evidenceHeader": ">NC_050096.1 Zea mays cultivar B73 chromosome 1",
    "chromosomeNamespace": "NCBI sequence accession (NC_050096.1等)"
  },
  {
    "species": "小麦 (Wheat / Chinese Spring)",
    "assembly": "IWGSC_CS_RefSeq_v2.1 (GCF_018294505.1)",
    "annotation": "NCBI RefSeq RS_2025_04",
    "verifiedUrls": 4,
    "status": "confirmed",
    "evidenceHeader": ">NC_057794.1 Triticum aestivum cultivar Chinese Spring chromosome 1A",
    "chromosomeNamespace": "NCBI sequence accession (NC_057794.1等)"
  },
  {
    "species": "大豆 (Soybean / Williams 82)",
    "assembly": "Glycine_max_v4.0 (GCF_000004515.6)",
    "annotation": "NCBI RefSeq Glycine max Annotation Release 103",
    "verifiedUrls": 4,
    "status": "confirmed",
    "evidenceHeader": ">NC_016088.4 Glycine max cultivar Williams 82 chromosome 1",
    "chromosomeNamespace": "NCBI sequence accession (NC_016088.4等)"
  },
  {
    "species": "番茄 (Tomato / Heinz 1706)",
    "assembly": "SL4.0 (GCA_000188115.5)",
    "annotation": "ITAG4.0 (Sol Genomics Network)",
    "verifiedUrls": 1,
    "status": "unverified (SGN FTP 404下线，需通过门户获取)",
    "evidenceHeader": ">CM001064.4 Solanum lycopersicum cultivar Heinz 1706 chromosome 1",
    "chromosomeNamespace": "NCBI sequence accession (CM001064.4等)"
  }
]
```

---

## 四、深色模式三态优先级与冲突修复

### 1. 根因分析
原 `genome-hub.css` 中在 `@media (prefers-color-scheme: dark)` 下使用了 `:not([data-theme="light"]) .gh`。由于 `data-theme` 属性被 `ThemeSwitcher` 附加在 `<html>` 根元素上，而 `<body>` 及内部包装容器并没有 `data-theme` 属性，选择器会将 `body .gh` 判定为符合 `:not([data-theme="light"])`，从而导致在“系统深色 + 手动浅色”场景下系统深色规则错误覆盖用户的手动浅色。

### 2. 修复方案
在 `src/styles/genome-hub.css` 中重构特异性层级：
1. 默认 `:root` 声明基础浅色变量；
2. `html[data-theme="dark"] .gh` 声明手动深色变量；
3. `@media (prefers-color-scheme: dark)` 仅作用于 `html:not([data-theme="light"]) .gh` 和 `:root:not([data-theme="light"]) .gh`，彻底杜绝子元素逃逸；
4. `html[data-theme="light"] .gh` 声明手动浅色覆盖变量，确保手动浅色具有绝对最高优先级。

### 3. 三态测试验证结果
- **手动浅色 + 系统深色**：`--gh-bg` 严格解析为 `#ffffff`（纯白），通过；
- **手动深色 + 系统浅色**：`--gh-bg` 严格解析为 `#0b131e`（深蓝黑），通过；
- **跟随系统 + 系统主题变化**：动态响应系统切换，在系统浅色下为 `#ffffff`，系统深色下为 `#0b131e`，通过；
- **WCAG AA 文本对比度**：深色模式下标题对比度为 `12.8:1`（远超 $\ge 4.5:1$ 要求），通过。

---

## 五、Chromium CI 自动化回归测试接入

已将 Genome Hub 真实浏览器测试接入 `.github/workflows/ci.yml`：

```yaml
      - name: Check Genome Hub data integrity
        run: npm run check:genome-hub

      - name: Install Playwright Chromium
        run: npx playwright install --with-deps chromium

      - name: Run Genome Hub browser regression tests
        run: npm run test:genome-hub

      - name: Upload Genome Hub test artifacts on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: genome-hub-test-artifacts
          path: |
            outputs/plant-genome-hub-v1.1/
          if-no-files-found: ignore
```

- **失败阻断机制**：任何端到端断言失败均会导致 CI 立即返回非 0 状态码；
- **自动归档排查**：CI 失败时通过 `actions/upload-artifact@v4` 自动打包上传测试失败截图与日志文件。

---

## 六、未完成/后续待跟进资源清单（科学透明性）

1. **番茄 SGN 官方 FTP 镜像恢复跟踪**：
   - 目前 Cornell Boyce Thompson Institute 的 SGN 官方 FTP (`ftp://ftp.solgenomics.net` 与 `https://solgenomics.net/ftp/`) 返回 HTTP 404，ITAG4.0 注释文件暂时维持 `portal` 状态，后续若官方开放新 HTTPS 镜像或 Zenodo/Dryad 备份，可再升级为 direct 直链。
2. **马铃薯、高粱、大麦、杨树的直链补齐**：
   - 现阶段已完整实现核心农作物与模式植物（水稻、拟南芥、玉米、小麦、大豆）的直链与确证配套；
   - 其余物种（马铃薯 DM1-3、高粱 BTx623、大麦 Morex、杨树 Nisqually-1）已保留 NCBI 官方组装与门户入口，可按后续科研需要逐步抽样验证。
