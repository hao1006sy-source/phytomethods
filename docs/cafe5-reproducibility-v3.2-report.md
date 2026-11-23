# CAFE5 官方示例端到端复现与教程 V3.2

## 验证结论

CAFE5 安装与完整官方哺乳动物示例执行成功，基础模型与 Gamma 模型均退出 0，结果完整性校验通过。CAFE5 教程升级为 verified；全站为 8 verified / 2 template，Hifiasm 与 EDTA 仍为模板。运行于 2026-11-23 开始，2026-11-24 完成，证据目录以启动日命名。

## 实际环境与安装

源码发行标题 1.1，tag v5.1，commit `8d3ab080796eafa192241a1067398832d886592d`；configure.ac 的 AC_INIT 为 1.1。WSL Ubuntu 26.04、Linux x86_64、GCC 15.2.0、GNU Make 4.4.1、OpenMP。版本、动态链接库与二进制 SHA256 见 versions.txt。

安装按固定 tag 克隆，补装 Autoconf/Automake，运行 autoreconf -fi、./configure、make -j4。该 tag 未提供生成好的 configure，INSTALL 中旧输出路径与 Makefile 不一致，实际二进制为 work/cafe5-v32/bin/cafe5。帮助信息已保存，确认 -p、-k、-c、-o 的含义。程序没有独立版本打印接口，版本证据由源码版本、提交、构建与二进制哈希组成。可选 conda environment.yml 未用于此次实际运行。

## 输入与来源

输入原样来自同一官方提交 examples/ 目录；包含 12 个物种、12,653 个家族。两个原始文件总量小于 500 KB。

| 文件 | 字节 | SHA256 |
| --- | ---: | --- |
| mammals_tree.txt | 309 | `2688b974861d6d65cdffe02fffea01ea000e16e4840923d83bae40401e04e71d` |
| mammal_gene_families.txt | 458999 | `145e86b6fc18554bbf03dd7d35245816ee7c66ac76bd3639832041ec20747ee2` |

输入检查验证 ID 唯一、计数非负整数、列数合法、物种集合与树叶一致、二叉有根树、正且有限的枝长、根到叶等距。根到叶长度范围为 132.738020–132.738021；时间尺度沿用官方教程的时间标定示例，Newick 语法本身无法证明单位和校准质量。五项输入单元测试通过（有效输入、重复 ID、负计数、名称不符、非等距树）。

## 实际命令与结果

完整绝对路径命令保存在 execution.json；便于复现的等价命令见教程与 examples/cafe5/README.md。二者均使用同一完整输入、-p 和 -c 4；Gamma 另加 -k 2。

| 模型 | 退出码 | 耗时（秒） | λ | α | 最终 -lnL（原报告精度） | 模型优化迭代 |
| --- | ---: | ---: | --- | --- | ---: | ---: |
| base | 0 | 187.987 | 0.0020461638869407 | 不适用 | 130363.0 | 27 |
| gamma | 0 | 828.496 | 0.0055788489716427 | 0.497586 | 119119.0 | 69 |

两个模型均在默认 300 次迭代上限之前完成优化，并完成 P 值计算和祖先计数重建。两次模型运行合计约 1016.48 秒。未通过多起点或不同模型比较证明全局最优。

Gamma 汇总包含 163 次参数尝试、约 1% 整体拒绝率，以及 10,956 个家族搜索期间数值失败警告（每家族 41 次）。固定源码 src/core.cpp 的 event_monitor 累计参数尝试期间的失败次数；src/gamma_core.cpp 的 prune 在饱和时返回失败。原始警告完整保留；最终输出可解析、有限且完整。本次验证状态描述的是官方示例端到端执行范围，尚不包含模型适用性和数值敏感性的科研验证。

## 结果完整性

默认根存在性过滤从 12,653 个家族保留 10,956 个，剔除 1,697 个。输入检查独立根据根的两个子树均有非零后代计数复算该集合。对两个模型逐家族核对保留 ID、count.tab 每个叶计数与输入一致、P 值 [0,1]、似然字段有限、必需报告非空、日志完成标记及退出状态。结果验证文件为 validation-results.json。

每个模型均保存 results.txt、family_likelihoods.txt、family_results.txt、count.tab、change.tab、asr.tre 与 report.cafe。Gamma 另保存 branch_probabilities.tab、category_likelihoods.txt、clade_results.txt。输入和所有输出 SHA256 分别记录于 input-sha256.txt、output-sha256.txt；verification-manifest.json 对 35 个证据文件记录字节与哈希。空 stderr 作为真实运行记录保留。

P 值使用模拟计算；报告中的零值为数值/模拟分辨率下的结果，不能当作精确概率为零。重新运行不要求随机 P 值与全部产物哈希相同，哈希用于保护已保存证据。

## 复现与自动检查

examples/cafe5/run-example.sh 支持全新输出目录及可选输入目录，通过 CAFE5_BIN 指定二进制；run-example.py 校验源码提交和实际帮助信息，保存环境和程序哈希、两种模型命令、日志、耗时及退出码，并调用结果检查。已有输出目录的拒绝覆盖测试通过。完整两模型记录来自本轮实际执行，封装脚本另完成语法、参数与覆盖保护检查。

npm run check:cafe5 执行确定性证据核验，并接入 PR CI；常规 CI 无需重新优化模型。examples/cafe5/.gitattributes 保留原始输入与证据文件字节，确保 Windows/Linux 校验一致。

## 页面与工程测试

- npm run check：退出 0。
- npm run build：退出 0。
- npm run validate：退出 0。
- npm run coverage：退出 0。
- npm run check:tutorial-science：退出 0。
- npm run check:cafe5：退出 0。
- npm run test:knowledge-integrity：退出 0。
- npm ci：隔离副本通过，413 依赖包，0 漏洞。
- 原有浏览器回归：10 篇 × 7 个尺寸；24 个代码块复制、79 次目录跳转、71 个站内链接，0 页面异常。
- DOM 布局：10 篇 × 8 个尺寸，80 组通过；包含 1600、1280、1024、390、375px；另有 4 组缩放等效视口检查。
- 浏览器科学元数据：10 篇 × 4 个尺寸，40 组版本/范围/输入输出检查通过。
- 已检查 CAFE5 1600px 桌面实际截图；右侧资源卡完整、验证标签为绿色，375/390px 单栏长图与目录交互检查通过。
- 其余九篇正文及结构化验证对象与 origin/main 逐项相等；CSS、知识图谱源代码、论文和工具内容未修改。

截图和工程日志见 outputs/cafe5-v3.2/。测试时知识图谱通过已有构建逻辑从教程 Frontmatter 读取新状态，无需手工改写科学关系或图谱文件。

## 后续验证

植物应用需准备注释和转录本规则一致的家族计数、合理时间标定的物种树、输入质量控制、家族规模过滤、数值敏感性检查、多个优化起点与模型选择，以及候选变化的独立生物学证据。Gamma 的数值搜索警告应进入这些后续验证。Hifiasm 与 EDTA 继续保持 template。

## 主要文件

- src/content/tutorials/cafe5-intro.md：完整教程。
- src/components/tutorial-v3/tutorial-verification.json：仅 cafe5-intro 更新。
- examples/cafe5/：源码与数据来源、许可、脚本、输入、环境和完整结果。
- scripts/check-cafe5-reproducibility.mjs：确定性证据检查。
- scripts/browser-test-tutorial-v3-full-rollout.mjs：状态计数变为 8/2，并接受已运行验证标签。
- package.json 与 .github/workflows/ci.yml：新增 check:cafe5。
