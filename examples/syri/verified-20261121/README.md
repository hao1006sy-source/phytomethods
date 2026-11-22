# SyRI 官方拟南芥示例运行记录

2026-11-21，WSL Ubuntu，Python 3.11.18，SyRI 1.8.2；MUMmer 软件包 3.23 的 `nucmer --version` 报告 NUCmer 3.1。官方测试数据来自 https://github.com/schneebergerlab/syri 提交 `acf72ccf47beffaaeade849fd258827ef24bedf4` 的 `test/test_data`。输入文件哈希见 `input-sha256.txt`。

一次运行从 FASTA 依次执行 `nucmer --maxmatch -c 500 -b 500 -l 100 ref.fa query.fa`、`delta-filter -m -i 90 -l 100 out.delta`、`show-coords -THrd` 和 `syri -c out_m_i90_l100.coords -r ref.fa -q query.fa -d out_m_i90_l100.delta --prefix mummer_`，生成 12 MB `.out`、20 MB `.vcf` 和本目录的 `mummer_syri.summary`。记录包括实际 NUCmer/SyRI 日志。两个输入染色体名称不同，自动匹配关系为 `Chr4 → OX291574.1`；详见 SyRI 标准错误日志。

另一次使用仓库现成的 `out.paf`，运行 `syri -c out.paf -r tair10_chr4.fa.gz -q ler_chr4.fa.gz -F P --prefix verified_`，输出摘要为 `verified_syri.summary`。两次比对输入不同，输出数量不要求一致。

大体积输入和 VCF 不提交到仓库；可按教程使用固定提交下载数据并重建完整输出。摘要是程序实际结果，变异类型和数量不构成对每条候选的独立生物学验证。
