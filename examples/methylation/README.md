# 模拟甲基化输入

`generate_synthetic.py` 生成虚构参考、模拟单端亚硫酸氢盐 reads 和已知胞嘧啶状态；运行 `python examples/methylation/generate_synthetic.py --output new-input`，输出目录不得已存在。

`synthetic-input-v2/` 是 2026-11-21 用于实际 Bismark 测试的最终输入；`verified-20261121/` 为真实运行输出。`python scripts/check-bismark-example.py` 对比覆盖区间的正链 C 调用与真值。所有数据均为模拟，不代表植物实验。
