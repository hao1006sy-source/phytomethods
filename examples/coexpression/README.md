# WGCNA 模拟共表达示例

运行 `Rscript examples/coexpression/wgcna_demo.R NEW_OUTPUT_DIR`，R 环境需安装 WGCNA 及其依赖；输出目录必须不存在。

示例生成 36 个虚构样本和 60 个虚构基因的连续表达矩阵，预设两组共享信号，不是真实植物表达数据。2026-11-21 在 Windows R 4.5.1、WGCNA 1.74 运行两次，输入、模块、模块特征基因与相关矩阵一致；实际结果及 sessionInfo 在 `verified-20261121/`。部分二进制依赖给出 R 4.5.x 版本构建提示，流程成功结束。

热图显示 Pearson 相关系数，按 WGCNA 模块排序；颜色不是调控方向。完整参数和说明见 `src/content/tutorials/wgcna-synthetic.md`。
