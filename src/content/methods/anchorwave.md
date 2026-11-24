---
title: AnchorWave
name: AnchorWave
summary: 专门针对植物全基因组复制（WGD）背景、染色体大尺度重排与超高转座子富集特征设计的保守基因锚定波前全基因组比对算法。
dataType: 基因组 FASTA / GFF3 或 GTF 注释文件
principle: 保守编码外显子共线锚定、全基因组复制矩阵约束与两段仿射波前比对 (WFA)
domainIds: [pangenomics-structural-variation]
topicIds: [m03-topic-02]
principleIds: [alignment, collinearity]
dataIds: [assembly, annotation-input]
paper: anchorwave-paper
repository: https://github.com/baoxingsong/AnchorWave
status: published
updatedAt: 2026-11-25
---

## 简介与开发背景

在被子植物基因组学中，全基因组比对长期受到三大生物学特性的严重制约：**海量同源转座子（LTR-RT）造成的比对迷航**、**多次全基因组复制（WGD）导致的同源拷贝（Homeologs）混淆**，以及**大片段转座子插入截断常规仿射比对**。

**AnchorWave（Anchored Wavefront Alignment）**由美国康奈尔大学 Song 等人开发（Song et al., *PNAS*, 2022），是植物全基因组比较领域的里程碑工具。它打破了传统纯核苷酸种子比对的局限，巧妙地**以参考基因组中高度保守的蛋白编码外显子/CDS 区域作为不可动摇的物理锚点（Anchors）**，并结合全基因组复制倍性矩阵（1:1 或 1:N）约束共线路径，最终在相邻锚点之间调用创新的**两段仿射波前算法（2-piece WFA）**完成单碱基全局高精度联配。

---

## 研究问题与计算原理

AnchorWave 将复杂的植物染色体全局对齐解构为三大算法阶段：

```
                ┌──────────────────────────────────────────┐
                │ 参考基因组 + 结构注释 GFF3 + 查询基因组  │
                └────────────────────┬─────────────────────┘
                                     │
                                     ▼
                ┌──────────────────────────────────────────┐
                │        阶段 1: 提取保守编码外显子锚点    │
                │        (gff2seq 提取长 CDS / 关键外显子) │
                └────────────────────┬─────────────────────┘
                                     │
                                     ▼
                ┌──────────────────────────────────────────┐
                │        阶段 2: 剪接感知映射与共线链化    │
                │        利用 minimap2 将锚点对齐至双基因组│
                │        genoAli (同染色体) / proali (WGD) │
                └────────────────────┬─────────────────────┘
                                     │
                                     ▼
                ┌──────────────────────────────────────────┐
                │        阶段 3: 锚点间隙两段仿射波前比对   │
                │   小 InDel: 高罚分；大 TE 插入: 平缓罚分 │
                │   WFA2 快速求解全局单碱基最优联配        │
                └────────────────────┬─────────────────────┘
                                     │
                                     ▼
                ┌──────────────────────────────────────────┐
                │        输出标准 MAF 与 SAM/BAM 比对文件  │
                └──────────────────────────────────────────┘
```

### 1. 两段仿射间隙惩罚数学模型
传统的仿射间隙惩罚为单一直线 $g(k) = o + k \cdot e$。在玉米、大麦等植物中，数千碱基的转座子单次插入屡见不鲜。若按传统模型，该插入会承受极其夸张的累积罚分，导致比对器宁可在内部引入大量荒谬的错配或者直接断开比对。

AnchorWave 采用凸两段分段函数（2-piece Affine Gap Model）：

$$g(k) = \min \left( o_1 + k \cdot e_1, \ o_2 + k \cdot e_2 \right)$$

在实际工程中，参数配置为：
- 短间隙段（$o_1, e_1$）：高开隙、高延伸惩罚（如 $o_1 = 40, e_1 = 2$），严格约束小型微变异，保障编码框的完整性；
- 长间隙段（$o_2, e_2$）：极高开隙、极低延伸惩罚（如 $o_2 = 1000, e_2 = 0.1$），专用于容忍植物整段长达数千至数万碱基的 LTR-RT 转座子插入，确保跨越重复元件后共线比对平稳延续。

### 2. 双模式共线骨架组织：`genoAli` vs `proali`
- **`genoAli`（全基因组同染色体比对模式）**：适用于核型一致、染色体端到端同源的品种间比对（如拟南芥品系间、水稻栽培种间）。原生支持 `-IV` 参数，能够自动识别并穿透大片段染色体倒位；
- **`proali`（染色体重排与 WGD 多倍体模式）**：适用于核型分化、发生染色体融合/断裂，或两物种经历不同轮次古多倍化事件（如玉米 vs 高粱，玉米经历过额外的古四倍化事件，存在 2:1 的同源亚基因组区块对应）。研究者可通过 `-R`（参考匹配上限）与 `-Q`（查询匹配上限）精确控制一对多同源比对深度。

---

## 输入、输出与官方生产示例

```bash
# 步骤 1：从参考基因组与 GFF3 提取高保真编码外显子锚点
anchorwave gff2seq -i reference.gff3 -r reference.fasta -o anchors.fasta

# 步骤 2：利用 minimap2 剪接敏感模式将锚点映射至参考与查询基因组
minimap2 -x splice -t 16 -k 12 -a -p 0.4 -N 20 reference.fasta anchors.fasta > ref_anchors.sam
minimap2 -x splice -t 16 -k 12 -a -p 0.4 -N 20 query.fasta anchors.fasta > query_anchors.sam

# 步骤 3：执行两段仿射波前全局对齐并识别倒位
anchorwave genoAli \
  -i reference.gff3 \
  -as anchors.fasta \
  -r reference.fasta \
  -a query_anchors.sam \
  -ar ref_anchors.sam \
  -s query.fasta \
  -n anchors_paired.txt \
  -IV \
  -o alignment.maf \
  -f alignment.fl.sam \
  -t 32
```

**关键输出解析**：
- `alignment.maf`：**核心主输出**，采用标准多重联配格式（Multiple Alignment Format），包含全部外显子与非编码区的高精度单碱基对齐，可直接用于下游 SyRI 结构重排分类；
- `anchors_paired.txt`：记录成功配对的共线基因锚点坐标及链方向，是验证染色体宏观共线性的权威表格。

---

## 植物基准与应用

- **玉米 B73 vs Mo17 全基因组对齐（PNAS 2022）**：
  玉米基因组中转座子占比超过 75%，且 B73 与 Mo17 间存在数万个大型结构变异。在传统比对工具（如 LASTZ）比对覆盖度仅达到 60%~70% 的严苛挑战下，AnchorWave 将可比对区域提升至 90% 以上，并精准保留了全部已知的顺式调控元件；
- **跨物种比较基因组（玉米 vs 高粱）**：调用 `proali` 成功解析了玉米古四倍化产生的两个同源亚基因组与二倍体高粱染色体之间的 2:1 对应关系，极大推动了植物多倍化后的亚基因组分化研究。

---

## 软件版本与结果边界

- 官方 GitHub 仓库：[baoxingsong/AnchorWave](https://github.com/baoxingsong/AnchorWave)
- 奠基方法论文：[Song et al., *PNAS*, 2022](https://doi.org/10.1073/pnas.2113075119)
- 关联方法：[MUMmer4](../../methods/mummer4/)、[Minimap2](../../methods/minimap2/)、[SyRI](../../methods/syri/)；
- 关联专题：[植物全基因组比对](../../topics/pangenomics-structural-variation/m03-topic-02/)。
