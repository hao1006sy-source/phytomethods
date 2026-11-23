# CAFE5 官方哺乳动物示例复现

上游为 hahnlab/CAFE5，发行标题 1.1，tag `v5.1`，提交 `8d3ab080796eafa192241a1067398832d886592d`。源码 `configure.ac` 的 AC_INIT 版本为 1.1。官方 INSTALL 的旧输出目录说明与此 tag 的 Makefile 不一致，本版本实际二进制是 `bin/cafe5`。源码和示例许可保留于 UPSTREAM-LICENSE。

## 干净环境编译

本次使用 WSL Ubuntu 26.04、系统 GCC 与 OpenMP。实际依赖版本见 `verified-20261123/versions.txt`。需要 Git、GNU Make、C++ 编译器、Autoconf/Automake 和 Python 3；输入检查仅用 Python 标准库。

```bash
git clone --branch v5.1 --depth 1 https://github.com/hahnlab/CAFE5.git CAFE5
cd CAFE5
test "$(git rev-parse HEAD)" = 8d3ab080796eafa192241a1067398832d886592d
autoreconf -fi
./configure
make -j4
./bin/cafe5 -h
```

`environment.yml` 为可选的 conda 编译环境方案，未用于已记录运行；它不能替代实际环境日志。上游本 tag 没有独立的版本打印选项，版本证据由 AC_INIT、源码提交、构建日志与二进制哈希共同提供。

## 输入

`inputs/` 原样保存该提交的 examples/mammals_tree.txt 和 examples/mammal_gene_families.txt。表头为 Desc、Family ID 及 12 个物种，包含 12,653 个家族。根到叶长度一致，时间尺度沿用官方示例；Newick 本身不编码单位或化石校准证据。默认根存在性过滤后 10,956 个家族进入分析。

## 重跑

从 PhytoMethods 仓库任意位置调用；使用新的输出目录：

```bash
export CAFE5_BIN=/absolute/path/CAFE5/bin/cafe5
bash examples/cafe5/run-example.sh /absolute/path/new-cafe5-verification
```

第二个可选参数可指定包含两个同名输入文件的目录。脚本先检查输入，顺序运行基础模型与两个类别的 Gamma 模型，保留 stdout/stderr、精确命令、退出码及耗时，最后核对实际结果。输出目录已存在即拒绝执行。

结果检查对每个保留家族逐个核对叶节点计数与输入一致、家族 ID 集合与独立根存在性规则一致、P 值处于 [0,1]、估计值可解析并为有限值、必需报告非空、日志具有完成标记。Gamma 参数 2 仅是教学模型设定，未通过模型选择证明为最优。

```bash
python3 examples/cafe5/check-inputs.py --tree examples/cafe5/inputs/mammals_tree.txt --table examples/cafe5/inputs/mammal_gene_families.txt --output input-validation.json
python3 examples/cafe5/check-results.py --inputs examples/cafe5/inputs --results NEW_OUTPUT_DIR
python3 examples/cafe5/test-inputs.py
npm run check:cafe5
```

P 值计算含随机模拟，重新运行时不要求 P 值或报告哈希与已记录运行完全一致。哈希用于核对本次保存证据的完整性。原始输出仅支持官方哺乳动物教学示例；植物数据需独立准备注释一致的家族计数、有时间尺度的物种树并验证模型假设。
