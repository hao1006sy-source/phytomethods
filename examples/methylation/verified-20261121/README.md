# Bismark 模拟甲基化验证

2026-11-21 在 WSL Ubuntu 运行 Bismark Rust suite 3.3.0、Bowtie2 2.5.5、Samtools 1.25。输入是固定种子生成的虚构参考和 90 条 100 bp 单端模拟 reads，不是真实植物数据；输入哈希、BAM、日志和胞嘧啶报告保存在本目录。

实际执行：`bismark prepare reference`；`bismark align --genome reference -o align reads.fastq`；`bismark extract --single-end --comprehensive --bedGraph --cytosine_report --CX --genome_folder reference -o extracted-cx align/reads_bismark_bt2.bam`。90 条 reads 均为唯一最佳比对；`python scripts/check-bismark-example.py` 确认覆盖区间内 239 个正链 C 位点（CG 50、CHG 45、CHH 144）的状态和背景与预设真值一致。

初版模拟覆盖到参考末端，报告 1 条 reads 无法提取完整基因组上下文；最终输入缩短末端覆盖。模拟没有测序错误、转换失败、反向链或生物重复，不能作为真实数据准确率评估。
