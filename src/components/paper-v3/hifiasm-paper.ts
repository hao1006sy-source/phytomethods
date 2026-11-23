export interface PaperSection {
  id: string;
  number: string;
  title: string;
  icon?: string;
}

export interface InnovationHighlight {
  icon: string;
  title: string;
  description: string;
}

export const hifiasmPaperSections: PaperSection[] = [
  { id: 'paper-info', number: '①', title: '核心信息' },
  { id: 'paper-background', number: '②', title: '研究背景' },
  { id: 'paper-contributions', number: '③', title: '核心贡献' },
  { id: 'paper-methods', number: '④', title: '方法原理' },
  { id: 'paper-results', number: '⑤', title: '关键结果' },
  { id: 'paper-applications', number: '⑥', title: '植物研究应用' },
  { id: 'paper-resources', number: '⑦', title: '关联资源' },
  { id: 'paper-notes', number: '⑧', title: '精读笔记' },
  { id: 'paper-related-papers', number: '⑨', title: '相关文献' },
];

export const hifiasmPaperMeta = {
  badge: '方法学论文',
  badgeType: 'method' as const,
  title: 'Haplotype-resolved de novo assembly using phased assembly graphs with hifiasm',
  fullAuthors: 'Haoyu Cheng, Gregory T. Concepcion, Xiaowen Feng, Haowen Zhang, Ting-Han Li, Ting-You Wang, Arang Rhie, Chun-Shen Li, Chen-Shan Chin, Michael C. Schatz & Heng Li',
  shortAuthors: 'Cheng H, Concepcion GT, Feng X, et al.',
  journal: 'Nature Methods',
  year: 2021,
  volumePages: '18: 170–175',
  doi: '10.1038/s41592-020-01056-5',
  doiUrl: 'https://doi.org/10.1038/s41592-020-01056-5',
  tags: ['基因组组装', '单倍型组装', '组装图', '长读长测序', '植物基因组'],
  
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
  ] as InnovationHighlight[],

  bibtex: `@article{cheng2021haplotype,
  title={Haplotype-resolved de novo assembly using phased assembly graphs with hifiasm},
  author={Cheng, Haoyu and Concepcion, Gregory T and Feng, Xiaowen and Zhang, Haowen and Li, Ting-Han and Wang, Ting-You and Rhie, Arang and Li, Chun-Shen and Chin, Chen-Shan and Schatz, Michael C and Li, Heng},
  journal={Nature Methods},
  volume={18},
  number={2},
  pages={170--175},
  year={2021},
  publisher={Nature Publishing Group},
  doi={10.1038/s41592-020-01056-5}
}`,

  apa: `Cheng, H., Concepcion, G. T., Feng, X., Zhang, H., Li, T. H., Wang, T. Y., Rhie, A., Li, C. S., Chin, C. S., Schatz, M. C., & Li, H. (2021). Haplotype-resolved de novo assembly using phased assembly graphs with hifiasm. Nature Methods, 18(2), 170-175. https://doi.org/10.1038/s41592-020-01056-5`,

  gb7714: `CHENG H, CONCEPCION G T, FENG X, et al. Haplotype-resolved de novo assembly using phased assembly graphs with hifiasm[J]. Nature Methods, 2021, 18(2): 170-175.`
};
