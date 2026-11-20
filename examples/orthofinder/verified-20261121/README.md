# OrthoFinder 官方示例运行记录

2026-11-21 在 WSL Ubuntu 临时环境运行 OrthoFinder 3.2（Bioconda）、Python 3.12.16。环境中额外安装 Brotli 1.2.1，以解决 ETE4 的模块导入错误。

输入来自官方 v3.2 发布文件 https://github.com/OrthoFinder/OrthoFinder/releases/download/v3.2/ExampleData.tar.gz ，是四种支原体的蛋白序列，不是植物数据。压缩包和四个主输入 FASTA 的 SHA-256 保存在 `input-sha256.txt`。

执行命令：`orthofinder -f ExampleData -t 2 -a 2`。程序实际运行成功，详细输出在 `run.stdout.log`、`run.stderr.log` 与 `Log.txt`。所保存的 `Statistics_Overall.tsv` 和 `SpeciesTree_rooted.txt` 来自该次运行。结果包括 4 物种、2733 条输入基因、599 个 orthogroup 和 250 个单拷贝 orthogroup；解释应以官方数据和本次设置为界。

完整输入和大批量基因树可按教程从官方链接下载并重新运行。该验证不代表植物蛋白数据已经运行。
