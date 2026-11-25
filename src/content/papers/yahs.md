---
title: "YaHS: yet another Hi-C scaffolding tool"
summary: "提出基于接触矩阵局部概率密度与动态自适应分辨率的全新 Hi-C 染色体挂载算法 YaHS，克服传统工具对初始参数极度敏感的缺陷，在复杂高杂合植物与单倍型解析重叠群上实现极高准确度的染色体尺度快速脚手架拼接。"
authors: "Zhou C, McCarthy SA, Durbin R"
year: 2023
journal: Bioinformatics
doi: 10.1093/bioinformatics/btac808
type: method
methodIds: [yahs]
domainIds: [genome-assembly]
speciesIds: []
status: published
updatedAt: 2026-11-25
---

## 研究背景与算法贡献

在真核生物基因组组装中，通过长读段拼接获得的初始重叠群（Contigs）通常在物理尺度上局限于数十兆碱基，无法直接达到完整染色体级别。高通量染色质构象捕获（Hi-C）技术利用细胞核内三维空间中 DNA 片段发生交联的接触频率与物理基因组距离呈幂律衰减的反比关系：
$$P(s) \propto s^{-\alpha} \quad (\alpha \approx 1)$$
为跨越巨型重复序列将 Contigs 锚定、排序和定向至染色体提供了关键的物理约束。

然而，上一代主流 Hi-C 挂载工具（如 SALSA2、3D-DNA、ALLHiC 等）存在多项严重缺陷：
1. **参数极其敏感且极易早熟终止**：需要人工指定复杂的酶切位点、固定网格分辨率（Bin sizes）或严格的人为经验截断，导致在非模式植物中经常生成大量破碎的碎片或发生全局错连；
2. **运算速度缓慢且内存消耗巨大**：处理动植物数十 Gb 的超深 Hi-C 比对 BAM 文件时常耗时数天甚至发生内存溢出；
3. **难以兼容高杂合双单倍型（Haplotype-resolved）组装**：在等位重叠群并存时容易出现跨同源染色体串联错接。

由剑桥大学与 Wellcome Sanger 研究所的陈周（Chenxi Zhou）、Shane McCarthy 与 Richard Durbin 共同开发的 **YaHS**（Yet another Hi-C Scaffolding tool），针对上述瓶颈提出了多项算法创新：
- **自适应动态多尺度分辨率（Multi-resolution Scaffolding）**：算法从粗粒度（大接触窗口）逐步迭代推进至极细粒度，使大片段染色体骨架搭建与微小重叠群方向校正实现完美收敛；
- **非参数化接触频率衰减拟合**：直接从待处理数据内部学习基因组距离衰减特征，彻底摒弃手工经验调参；
- **极致的工程实现**：纯 C 语言无外部重型依赖编写，比传统算法快 10~50 倍，内存占用降低一个数量级。

---

## 核心数学模型与数据结构

YaHS 的算法主干包含 contact 矩阵构建、纠错断点扫描、加权图构建与贪心自适应路径延伸四个关键阶段：

```
         初始 Contigs FASTA + Hi-C 比对文件 (BAM / BED)
                               │
                               ▼
        [非参数化距离衰减函数拟合: 建立三维期望接触分布]
                               │
                               ▼
     [自适应多层级分辨率迭代 (从 100 kb 逐步细化至 10 kb)]
                               │
                               ▼
    [Hi-C 接触图构建: 节点为 Contig 末端，边权为归一化连接分值]
                               │
                               ▼
     [基于全局最大权匹配与反转/交换的拓扑优化 (Scaffolding)]
                               │
                               ▼
       输出染色体级 Scaffolds 与 Juicebox AGP 规范化布局
```

1. **Hi-C 接触分值的归一化数学建模**：
   对于任意两个待测重叠群末端 $u$ 和 $v$，设在窗口长度 $L$ 内观察到的实际 Hi-C 接触读段对数量为 $O_{uv}$。根据两端长度与有效限制性酶切位点分布计算背景期望接触值 $E_{uv}$，算法定义归一化接触相似度（Normalized Contact Score）：
   $$S(u, v) = \frac{O_{uv}}{E_{uv} + \epsilon}$$
   该得分自动校正了由于测序深度波动、GC 含量偏好及重叠群长度差异引入的技术噪音；
2. **多尺度分辨率金字塔迭代**：
   YaHS 设置多层级分辨率序列（如 $R = \{1000\text{kb}, 500\text{kb}, 200\text{kb}, 100\text{kb}, 50\text{kb}, 10\text{kb}, 2\text{kb}\}$）：
   - 在粗尺度（如 1 Mb 窗口）下，长程接触信号强韧，算法优先完成染色体宏观归类与主干框架连接；
   - 随着迭代步深入细尺度（如 10 kb 窗口），算法聚焦于相近 Contig 之间的相对方向（Orientation, Forward / Reverse）微调与超短片段的高精度缝合；
3. **嵌合 Contig 物理错误自动阻断与切分**：
   在开始挂载前，YaHS 沿每个输入 Contig 滑窗统计三维接触连续性，当检测到 Hi-C 接触对突然出现台阶式悬崖跳跃时，自动将其判定为长读段初始拼接中的假嵌合体（Chimeric joins），并在该物理断点执行阻断切割。

---

## 算法复杂度与计算性能

| 维度 | 指标与实测表现 | 算法优势分析 |
| :--- | :--- | :--- |
| **计算速度** | 典型植物（1~3 Gb）挂载仅需 5~20 分钟 | 相比 3D-DNA 或 SALSA2 的数十小时，提速 20 倍以上 |
| **内存峰值占用** | 仅需 2~8 GB RAM | 采用极致的哈希桶与紧凑二进制内存对齐，避免大矩阵常驻 |
| **输入容忍度** | 原生兼容标准坐标排序 BAM 或 BED 文件 | 无需生成数百 GB 的中间转换文本，大幅节约磁盘 I/O |
| **挂载准确率** | 倒位错误与跨染色体错接率显著低于竞品 | 自适应多分辨率避免了粗分辨率下的过度贪心错连 |

---

## 植物基因组学应用场景与科研价值

1. **复杂超大高杂合植物染色体挂载第一选型**：
   在地球生物基因组计划（EBP）与达尔文生命之树项目（DToL）中，YaHS 已被全面确立为官方标准 Hi-C 挂载核心引擎。其在处理复杂高杂合果树、禾本科作物（如水稻、玉米、高粱）及特大基因组植物（如小麦、裸子植物）时表现出极致的鲁棒性；
2. **单倍型分离组装的高保真支撑**：
   针对由 Hifiasm 或 Verkko 输出的双单倍型组装图，YaHS 原生能够极好地区分单倍型内的同侧接触与单倍型间的跨同源接触，大幅避免将同源染色体的不同等位片段强行串联成环；
3. **与 Juicebox / Pretext 交互式人工审查无缝对接**：
   YaHS 自动输出生成 `.assembly` 与 `.agp` 标准文件，研究人员可直接导入 Juicebox Assembly Tools 或 Pretext-View 进行染色体接触热图的可视化人工检查与端粒/着丝粒微调。

---

## 输入输出规范与关键参数指南

### 关键运行命令行

```bash
# 1. 基础无酶切位点通用挂载模式 (推荐用于现代 HiFi + Hi-C 流程)
yahs target_contigs.fa hic_aligned_sorted.bam

# 2. 启用初始嵌合 Contig 自动检测与纠错切分 (-e 模式)
yahs -e -o plant_scaffolding target_contigs.fa hic_aligned_sorted.bam

# 3. 指定限制性内切酶识别位点 (如 DpnII 或 Arima 四酶组合)
yahs -r GATC,GANTC -o plant_scaffolding target_contigs.fa hic_aligned_sorted.bam

# 4. 生成用于 Juicebox 可视化热图审查的输入文件
juicer pre plant_scaffolding.bin plant_scaffolding_scaffolds_final.agp target_contigs.fa.fai > out.pre.txt
java -Xmx32G -jar juicer_tools.jar pre out.pre.txt out.hic.hic <chrom.sizes>
```

- `-e`：在挂载前执行基于 Hi-C 接触断裂的自动纠错切分（强烈推荐开启）；
- `-r <string>`：限制性内切酶切位点序列（多个以逗号分隔；若采用无酶切构建的 Omni-C 库则无需指定）；
- `-q <int>`：最小比对质量阈值（默认 `10`，可有效过滤重复区域的多重比对 reads）；
- `-o <prefix>`：输出文件名前缀。

### 核心产物文件解读

- `*_scaffolds_final.fa`：最终挂载完毕的染色体级 FASTA 序列；
- `*_scaffolds_final.agp`：记录每个 Contig 在伪染色体上的物理起止坐标、方向（`+` / `-`）及缺口（Gap）长度的标准 AGP 文件；
- `*.assembly`：兼容 Juicebox Assembly Tools 的拓扑结构定义文件。

---

## 阅读与复现资源

- **论文全文**：[Bioinformatics, 39(1), btac808 (2023)](https://doi.org/10.1093/bioinformatics/btac808)
- **PubMed 记录**：[PMID: 36511585](https://pubmed.ncbi.nlm.nih.gov/36511585/)
- **官方开源代码仓库**：[GitHub - c-zhou/yahs](https://github.com/c-zhou/yahs)
- **相关算法工具详情**：[YaHS 算法原理与指南](../../methods/yahs/)
