export type PaperType = 'method' | 'application' | 'review';

export interface PaperSection {
  id: string;
  number: string;
  title: string;
  depth?: number;
}

export interface PaperHighlightItem {
  icon: string;
  title: string;
  description: string;
}

export const paperTypeBadgeMap: Record<PaperType, string> = {
  method: '方法学论文',
  application: '植物应用论文',
  review: '综述论文'
};

export const paperTypeThemeColor: Record<PaperType, string> = {
  method: '#0e6548',
  application: '#1d6f42',
  review: '#2a6478'
};
