import type { PaperHighlightItem } from './paper-types';

export const hifiasmCustomData = {
  fullAuthors:
    'Haoyu Cheng, Gregory T. Concepcion, Xiaowen Feng, Haowen Zhang, Ting-Han Li, Ting-You Wang, Arang Rhie, Chun-Shen Li, Chen-Shan Chin, Michael C. Schatz & Heng Li',
  shortAuthors: 'Cheng H, Concepcion GT, Feng X, et al.',
  volumePages: '18: 170–175',
  coreContributionSummary:
    '提出了 hifiasm，一种基于相位组装图（phased assembly graph）的高效单倍型解析基因组组装方法，能够仅在使用高保真长读长（HiFi reads）的情况下，快速、准确地生成染色体水平的单倍型组装。',
  highlights: [
    {
      icon: '⚡',
      title: '高精度',
      description: '在多种真核生物基因组上实现极高连续性与超低错误率（QV > 50）。',
    },
    {
      icon: '🧬',
      title: '单倍型解析',
      description: '无需额外的亲本或 Hi-C 数据即可生成部分相位的单倍型 contig，亦支持多组学模式完全分相。',
    },
    {
      icon: '🍃',
      title: '高效易用',
      description: '计算资源需求低、图构建速度快，特别适用于复杂大基因组与高杂合植物。',
    },
  ] as PaperHighlightItem[],

  benchmarkResults: [
    {
      dataset: '人类 HG002 (HiFi-only)',
      features: '3.1 Gb, 二倍体哺乳动物',
      contigN50: '25.4',
      switchError: '0.54%',
      cpuTime: '< 50 h'
    },
    {
      dataset: '人类 HG002 (Trio-binning)',
      features: '结合父本/母本 Illumina k-mer',
      contigN50: '70.3',
      switchError: '0.22%',
      cpuTime: '< 65 h'
    },
    {
      dataset: '加州红杉 (Sequoia)',
      features: '约 30 Gb, 复杂异源六倍体',
      contigN50: '1.92',
      switchError: '保持多倍体图结构',
      cpuTime: '~ 850 h (同类工具数倍提速)'
    },
    {
      dataset: '拟南芥 (Arabidopsis)',
      features: '135 Mb, 植物经典模式',
      contigN50: '14.8 (近染色体臂级)',
      switchError: '< 0.1%',
      cpuTime: '< 2 h'
    }
  ]
};
