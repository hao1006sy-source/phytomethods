---
title: wgd v2
name: wgd
summary: 整合同义替换率（Ks）计算、共线性锚点识别、高斯混合模型（GMM）解卷积与分子钟定年的植物古多倍化全流程套件。
dataType: 编码序列 CDS / 蛋白 FASTA / 基因组注释 GFF3
principle: 同义突变分子钟、共线性锚点过滤、GMM 混合正态解卷积与系统发育调和定年
domainIds: [comparative-genomics]
topicIds: [m04-topic-06]
principleIds: [collinearity, phylogenetics]
dataIds: [assembly, proteins]
paper: wgd-v2-paper
repository: https://github.com/heche-psb/wgd
status: published
updatedAt: 2026-11-25
---

## 生物学问题与定位

`wgd v2`（Whole-Genome Duplication toolkit v2）由比利时根特大学 VIB-UGent 植物系统生物学中心 Yves Van de Peer 教授团队（Hengchi Chen、Arthur Zwaenepoel 等）开发，是植物演化基因组学领域用于**全面鉴定、统计验证与绝对定年古代全基因组加倍事件（WGD / Paleopolyploidy）的最新一代一站式全流程软件套件**。其核心方法发表于 *Bioinformatics*（2024）。

在植物基因组中，由于远古多倍化事件常发生在数千万甚至数亿年前，二倍化过程中的剧烈染色体重排与基因丢失使得多倍化信号高度退化。传统的盲筛同源对 $K_s$ 分析极易受到转座子爆发、串联复制与多重突变饱和的干扰而产生虚假峰。`wgd v2` 创新性地将**高灵敏序列聚类**、**密码子水平 $K_s$ 精确计算**、**染色体共线性锚点物理过滤（Synteny-anchoring）**、**高斯混合模型（GMM）统计解卷积**以及**系统发育树化石校准定年**无缝串联，确立了植物古多倍化研究的现代标准方法学。

---

## 核心算法数学原理与推导

`wgd v2` 的分析体系建立在以下三大数理模块之上：

### 1. 密码子水平同义替换率（$K_s$）精确计算

同义突变由于不改变蛋白质一级结构，受到微弱的选择净化约束，其累积速率可近似视作中性分子钟。`wgd` 调用 MAFFT 构建蛋白质多重比对，映射生成无移码的严格密码子比对，随后调用 PAML codeml 或 yn00 算法计算最大似然同义替换率：

$$K_s = 2rT \implies T = \frac{K_s}{2r}$$

- **中性速率参考**：植物核基因组常取 $r \approx 6.5 \times 10^{-9}$ substitutions/site/year；
- **饱和突变硬截断**：当 $K_s > 2.0$ 时，多重回复突变导致曲线饱和失真，`wgd` 默认过滤高 $K_s$ 离群点。

### 2. 共线性锚点过滤（Synteny-Anchoring）

全基因组范围的同源对混合了单基因串联复制与逆转录转座事件。`wgd syn` 结合 GFF3 物理坐标，仅提取位于多基因保守共线性块内部的**共线性旁系同源基因对（Syntenic paralogs）**，从物理空间上剔除 90% 以上的非多倍化背景噪声。

### 3. 高斯混合模型（GMM）解卷积

实际 $K_s$ 谱由连续常态复制的指数衰减背景与一至多次离散 WGD 事件的正态峰叠加而成：

$$P(K_s) = \pi_0 \lambda e^{-\lambda K_s} + \sum_{k=1}^K \pi_k \frac{1}{\sqrt{2\pi}\sigma_k} \exp\left( -\frac{(K_s - \mu_k)^2}{2\sigma_k^2} \right)$$

`wgd mix` 采用 **EM 期望最大化算法**迭代拟合各高斯分布分量的均值 $\mu_k$ 与方差 $\sigma_k^2$，并结合赤池信息准则（AIC）与贝叶斯信息准则（BIC）客观评估加倍事件峰数量 $K$。

---

## 生产环境全流程实操指南

`wgd v2` 采用模块化子命令设计，标准分析包含四大阶段：

```bash
# 阶段 1：全基因组代表性蛋白同源相似度搜索与聚类
wgd dmd \
  --cds primary_cds.fasta \
  --threads 32 \
  --output_dir wgd_dmd_out/

# 阶段 2：构建密码子比对并计算所有旁系同源对的 Ks 矩阵
wgd ksd \
  --cds primary_cds.fasta \
  --pairs wgd_dmd_out/primary_cds.fasta.tsv \
  --method yn00 \
  --threads 32 \
  --output_dir wgd_ksd_out/

# 阶段 3：结合 GFF3 染色体物理坐标提取共线性锚点 Ks (Synteny-anchored)
wgd syn \
  --ks wgd_ksd_out/primary_cds.fasta.ks.tsv \
  --gff annotation.gff3 \
  --feature gene \
  --attribute ID \
  --output_dir wgd_syn_out/

# 阶段 4：高斯混合模型 (GMM) 拟合解卷积与可视化绘图
wgd mix \
  --ks wgd_syn_out/synteny_anchors.ks.tsv \
  --components 3 \
  --max_ks 2.0 \
  --output_dir wgd_mix_out/
```

| 核心子命令 | 关键参数 | 功能说明与植物科研注意事项 |
| :--- | :--- | :--- |
| `wgd dmd` | `--evalue 1e-10` | 严格控制相似性比对阈值，避免非特异性短结构域假阳性 |
| `wgd ksd` | `--method yn00` | 推荐使用 Yang & Nielsen 2000 最大似然近似法，兼顾速度与精度 |
| `wgd syn` | `--span 25` | 共线性块内允许的最大基因物理间隔跨度 |
| `wgd mix` | `--max_ks 2.0` | 强制截断 $K_s \le 2.0$ 区间，避免突变饱和造成虚假远古加倍峰 |

---

## 输出结果深度解析

```text
wgd_mix_out/
├── synteny_anchors.ks.tsv_mix.pdf   # 带有 GMM 拟合分解曲线的高清矢量图
├── synteny_anchors.ks.tsv_mix.tsv   # 各拟合高斯成分参数表 (均值 mu、方差 sigma、权重 pi)
├── synteny_anchors.ks.tsv_aic.tsv   # 不同组分数 (K=1, 2, 3) 对应的 AIC / BIC 打分表
└── synteny_anchors.ks.tsv_filtered.tsv # 剔除饱和与低置信位点后的清洗后 Ks 数据表
```

通过检查 `synteny_anchors.ks.tsv_mix.tsv` 中 BIC 评分最低的最优模型，即可精准读取植物基因组经历的加倍峰中心位置（例如 $\mu_1 = 0.35$ 对应近期加倍，$\mu_2 = 0.88$ 对应古老 $\gamma$ 六倍化事件）。

---

## 植物应用案例与真实文献证据

1. **大洋波西多尼亚海草（*Posidonia oceanica*）海洋适应性演化**：
   在揭示地中海特有海洋单子叶被子植物海草的次生返水演化研究中，作者利用 `wgd v2` 对其基因组进行了全套 $K_s$ 与共线性分析。通过 `wgd syn` 结合 GMM 拟合，清晰检测到海草基因组中存在一个极其鲜明的共线性 $K_s$ 峰（$\mu \approx 0.65$），随后利用 `wgd date` 结合化石校准物种树，将该特异性古多倍化事件精确定位于白垩纪-古近纪（K-Pg）大灭绝界面（约 6600 万年前），证明 WGD 在帮助植物抵御全球极端气候骤变中发挥了决定性作用（[Chen et al., *Bioinformatics*, 2024](https://doi.org/10.1093/bioinformatics/btae272)）。
2. **豆科植物祖先四倍化与结瘤共生固氮系统建立**：
   在解析大豆与苜蓿的共生固氮演化时，利用 `wgd` 提取豆科共有共线性旁系同源基因对，精确定位了距今约 5800 万年前发生的豆科祖先全基因组加倍事件，并证实参与根瘤菌受体识别与类黄酮信号传导的多个基因拷贝直接来源于该轮加倍。

---

## 实践排错与质控规范

- **错误 1：GMM 拟合无法收敛或产生大量无意义碎峰**
  - *排查原因*：直接使用了全基因组未经共线性过滤的原始 $K_s$ 数据，低 $K_s$ 处的串联基因爆炸性增长破坏了算法优化。
  - *解决方案*：必须以 `wgd syn` 提取的共线性锚点文件作为 `wgd mix` 的输入源。
- **错误 2：`wgd syn` 报错 `No collinear blocks found`**
  - *排查原因*：GFF 文件与 CDS 序列的基因 ID 格式不统一（如缺少染色体标识或 ID 包含版本后缀）。
  - *解决方案*：检查并标准化 GFF3 中的 `ID=` 字段，确保与 FASTA 头部标识完全对应。
