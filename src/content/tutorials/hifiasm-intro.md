---
title: Hifiasm 组装入门
summary: 使用 HiFi reads 运行 Hifiasm 的命令模板。
method: hifiasm
tested: template
updatedAt: 2026-11-20
---
## 目的与环境
在 Linux 环境使用 PacBio HiFi FASTQ 构建组装图。本教程为命令模板，未在真实数据上执行。运行前根据样本基因组大小与覆盖度准备足够计算资源。

## 安装与版本
从 [Hifiasm 官方仓库](https://github.com/chhylp123/hifiasm)获取并编译软件，按仓库说明确认依赖。使用 `hifiasm --version` 检查版本。

## 组装
将示例路径替换为实际文件；`-t` 设置线程数，`-o` 设置输出前缀。

```bash
hifiasm -o sample.asm -t 32 sample.hifi.fastq.gz 2> sample.asm.log
```

## 输出与后续评估
主要输出包含 GFA 组装图；具体文件名和单倍型含义依运行模式而定。使用日志检查运行状态，并以 Merqury、BUSCO 等方法评估组装质量。

## 常见问题
输入文件不存在时检查路径和读取权限；内存不足时检查数据规模和可用资源。根据官方文档选择适合输入数据的运行模式。


## 数据准备与官方示例
输入应为同一样本的 PacBio HiFi reads，FASTA 或 FASTQ 均可，支持 gzip。检查文件存在、压缩完整性、read 质量和覆盖度，确认来源与样本倍性。官方仓库提供用于安装检查的 [chr11-2M 示例](https://github.com/chhylp123/hifiasm/releases/download/v0.7/chr11-2M.fa.gz)，该数据是小规模软件测试数据，不能代表植物全基因组组装。

```bash
git clone https://github.com/chhylp123/hifiasm.git
cd hifiasm
make -j 4
./hifiasm --version
curl -L -o chr11-2M.fa.gz https://github.com/chhylp123/hifiasm/releases/download/v0.7/chr11-2M.fa.gz
./hifiasm -o test -t 4 -f 0 chr11-2M.fa.gz 2> test.log
```

上述流程依据[官方 README](https://github.com/chhylp123/hifiasm)核对；`-f 0` 适用于官方小数据示例，实际样本应按数据规模和文档选择参数。需要 Linux 或兼容环境、C++ 编译器和 zlib。记录实际运行的软件版本、线程数和输入文件。**命令已核对，真实数据待验证。**

## 输出解释与排查
HiFi-only 模式下，官方示例的 `test.bp.p_ctg.gfa` 包含 primary contig 图。`S` 行中的序列可用于转换为 FASTA；结果名称和相位文件取决于模式与版本。检查 `test.log` 的报错和退出状态；磁盘空间不足、输入损坏或资源不足时先处理环境，再从记录的命令和日志定位问题。组装后独立检查 k-mer 完整度、QV、BUSCO 与染色体结构。

```bash
awk '/^S/{print ">"$2;print $3}' test.bp.p_ctg.gfa > test.p_ctg.fa
```

## 查看组装图与质量评估
GFA 可使用 [Bandage](https://github.com/rrwick/Bandage) 等支持 GFA 的工具打开，观察连接、分叉和疑似重复；大图需要按节点或区域局部浏览。将 GFA 的序列导出为 FASTA 后，可使用同一样本的高准确度 reads 构建 Meryl k-mer 数据库，并参考 [Merqury 官方指南](https://github.com/marbl/merqury)计算 QV、k-mer 完整度和频谱；另可使用 BUSCO 检查保守基因。图形化结构与质量指标都应与测序覆盖、倍性和污染检查共同解释。本教程尚未执行真实数据，未提供虚构日志或数值。
