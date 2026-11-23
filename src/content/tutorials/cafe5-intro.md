---
title: 使用 CAFE 5 分析基因家族大小变化
summary: 使用固定官方哺乳动物示例，运行基础与 Gamma 生灭模型并核查实际输出。
method: cafe5
tested: verified
status: published
updatedAt: 2026-11-24
---
## 目标与验证范围
官方哺乳动物示例已运行验证。2026 年 11 月 23—24 日，在 WSL Ubuntu 26.04 中使用固定 CAFE5 源码完成基础模型与两个速率类别的 Gamma 模型。两种模型均正常退出并完成输出校验。CAFE5 用生灭过程研究沿物种树的基因家族大小变化；本次数据为官方哺乳动物示例，植物家族演化研究需另行验证。

## 软件安装与版本
实际软件 AC_INIT 版本为 **1.1**，官方 tag 为 **v5.1**，固定提交为 `8d3ab080796eafa192241a1067398832d886592d`。本次使用 GCC 15.2.0、GNU Make 4.4.1、Autoconf 和 OpenMP，从源码编译，实际程序位于 `bin/cafe5`。

```bash
git clone --branch v5.1 --depth 1 https://github.com/hahnlab/CAFE5.git CAFE5
cd CAFE5
test "$(git rev-parse HEAD)" = 8d3ab080796eafa192241a1067398832d886592d
autoreconf -fi
./configure
make -j4
./bin/cafe5 -h
```

官方 INSTALL 中的旧程序目录说明与该 tag 的 Makefile 有差异，以上路径按本次实际构建核实。软件没有独立版本打印选项；源码版本、提交、编译日志和二进制 SHA256 共同保存在 `examples/cafe5/verified-20261123/`。

## 官方数据与输入检查
以下命令从 PhytoMethods 仓库根目录执行，`CAFE5_BIN` 应指向上述编译的可执行文件。`examples/cafe5/inputs/` 原样保存同一提交下的 `examples/mammals_tree.txt` 和 `examples/mammal_gene_families.txt`。

输入有 12 个物种、12,653 个家族。制表符分隔的前两列为 `Desc`、`Family ID`，后续列是物种计数；家族 ID 唯一，计数必须为非负整数。树叶名称与计数表物种完全匹配，树有根且枝长为正，根到叶长度约 132.73802，差异在舍入精度内。时间尺度沿用官方标定示例，Newick 文件本身不携带时间单位或标定证据。

```bash
python3 examples/cafe5/check-inputs.py \
  --tree examples/cafe5/inputs/mammals_tree.txt \
  --table examples/cafe5/inputs/mammal_gene_families.txt \
  --output input-validation.json
```

检查脚本验证格式、家族 ID、计数、树结构、物种名称、枝长与等距性，并保存 SHA256。CAFE5 默认剔除不满足根存在性规则的家族，本次从 12,653 个保留 10,956 个；结果检查脚本独立复算该集合。

## 基础模型
先设置 `CAFE5_BIN` 为程序绝对路径，在新的输出目录运行：

```bash
"$CAFE5_BIN" -t examples/cafe5/inputs/mammals_tree.txt \
  -i examples/cafe5/inputs/mammal_gene_families.txt \
  -p -c 4 -o results-base
```

`-t` 为物种树，`-i` 为家族计数，`-p` 使用由输入估计的 Poisson 根分布，`-c 4` 使用 4 个计算核，`-o` 指定输出目录。不提供 `-k` 时运行 Base 模型。实际退出码为 0，耗时约 188 秒；`Base_results.txt` 记录 λ 为 `0.0020461638869407`，最终 -lnL 按报告精度为 `130363`，模型优化完成 27 次迭代。

## Gamma 模型
基础模型成功后，使用同一输入运行：

```bash
"$CAFE5_BIN" -t examples/cafe5/inputs/mammals_tree.txt \
  -i examples/cafe5/inputs/mammal_gene_families.txt \
  -p -k 2 -c 4 -o results-gamma
```

`-k 2` 指定两个离散 Gamma 速率类别，允许家族间速率异质性；未指定 `-a` 时估计 α。本次退出码为 0，耗时约 828 秒；报告中的 λ 为 `0.0055788489716427`，α 为 `0.497586`，最终 -lnL 按报告精度为 `119119`，模型优化完成 69 次迭代。两个类别是教学设定，尚未完成模型选择、多起点搜索或参数敏感性分析。

Gamma 汇总报告记录 163 次参数尝试、约 1% 的整体拒绝率，以及各家族在参数搜索期间的数值失败警告。固定版本源码的 event_monitor 累计搜索过程的失败次数，Gamma 剪枝在饱和条件下可能返回失败；这些记录与最终输出同时保留。最终似然、家族类别似然及 P 值均通过有限值与结构核查，本次未据此证明全局最优或模型生物学适用性。

## 输出报告与结果核验
每种模型实际生成 `Base_` 或 `Gamma_` 前缀的 `results.txt`、`family_likelihoods.txt`、`family_results.txt`、`count.tab`、`change.tab`、`asr.tre` 和 `report.cafe`。Gamma 另有类别似然、分支概率与分支汇总文件。`family_results.txt` 包含家族 ID、P 值与显著性标记；`count.tab` 包含叶节点观测计数和祖先重建计数。

```bash
python3 examples/cafe5/check-results.py \
  --inputs examples/cafe5/inputs \
  --results examples/cafe5/verified-20261123
npm run check:cafe5
```

核验内容包括：两次退出码为 0，报告非空、10,956 个保留 ID 完整匹配、每个叶节点计数与原始输入一致，P 值在 [0,1]，参数和似然字段可解析且有限，日志完成标记存在。本次 P 值含模拟计算，显示为 0 不代表精确概率为零；跨运行的 P 值及优化末位数值可能不同。哈希用于检查本次证据文件完整性。

## 一键复现与成功条件
仓库中的封装脚本依次执行输入校验、基础模型、Gamma 模型与结果核验，自动保留命令、日志、退出码和耗时。输出目录必须不存在：

```bash
export CAFE5_BIN=/absolute/path/CAFE5/bin/cafe5
bash examples/cafe5/run-example.sh /absolute/path/new-cafe5-verification
```

成功条件是两个模型正常退出、全部预期报告存在，且 `validation-results.json` 为有效。固定源码、输入 SHA256、环境、原始日志、输出哈希与结果报告见 `examples/cafe5/verified-20261123/`；运行跨越午夜，验证完成日期为 2026-11-24。

## 常见错误与植物应用
- **物种名不匹配**：逐字符核对表头与树叶，关注大小写和空白。
- **计数或 ID 异常**：先检查整数、重复家族和列数；植物分析需统一注释、倍性和代表转录本规则。
- **树尺度不合适**：使用有根、时间标定一致的树，检查枝长与等距性。
- **数值或收敛警告**：保留完整日志，检查家族大小、速率、根分布与模型拟合；更多起点和参数比较需单独执行。
- **结果被覆盖**：使用新的输出目录；封装脚本遇到已有目录立即拒绝。
- **生物学解释过度**：扩张或收缩是给定数据与模型下的统计推断，需要基因树、注释质量、共线性及独立功能证据。

## 延伸阅读
[CAFE5 方法论文](https://doi.org/10.1093/bioinformatics/btaa1022)、[固定版本源码](https://github.com/hahnlab/CAFE5/tree/8d3ab080796eafa192241a1067398832d886592d)、[官方教程](https://github.com/hahnlab/CAFE5/blob/8d3ab080796eafa192241a1067398832d886592d/docs/tutorial/tutorial.md)与[1.1 发行说明](https://github.com/hahnlab/CAFE5/releases/tag/v5.1)。
