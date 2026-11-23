export type WorkflowStep = [string, string];

export interface MarkdownSection {
  title: string;
  body: string;
  id: string;
}

export const tutorialWorkflows: Record<string, WorkflowStep[]> = {
  'orthofinder-intro': [
    ['蛋白序列', '多物种 FASTA'], ['目录组织', '物种文件'], ['OrthoFinder', '同源分析'],
    ['Orthogroups', '家族结果'], ['系统发育', '物种树 / 基因树'], ['结果解释', '关系与限制']
  ],
  'syri-intro': [
    ['两套组装', '参考 / 查询'], ['NUCmer', '全基因组比对'], ['过滤坐标', 'delta-filter'],
    ['SyRI', '共线与差异'], ['结果检查', 'OUT / VCF / summary']
  ],
  'bismark-synthetic': [
    ['模拟 reads', '已知胞嘧啶状态'], ['准备参考', '转换索引'], ['Bismark', '感知比对'],
    ['提取位点', 'CG / CHG / CHH'], ['独立核对', '对照模拟真值']
  ],
  'plink-synthetic': [
    ['模拟 VCF', '虚构二倍体样本'], ['格式转换', 'PLINK 文件集'], ['质量检查', '频率 / 缺失率'],
    ['PCA', '两个主成分'], ['结果解释', '模拟群体标签']
  ],
  'gwas-synthetic': [
    ['模拟数据', '基因型 / 表型'], ['单标记回归', 'SciPy linregress'], ['计算 P 值', '双侧检验'],
    ['绘制结果', 'Manhattan / QQ'], ['解释边界', '教学统计模型']
  ],
  'scanpy-synthetic': [
    ['模拟计数', '细胞 × 基因'], ['质量控制', '总量 / 检测基因'], ['归一化', 'log1p / PCA'],
    ['邻居与聚类', 'Leiden'], ['UMAP', '二维嵌入'], ['结果解释', '模拟组非细胞类型']
  ],
  'wgcna-synthetic': [
    ['模拟表达矩阵', '样本 × 基因'], ['数据检查', '表达与变异'], ['相关性网络', '加权共表达'],
    ['识别模块', 'blockwiseModules'], ['模块特征基因', 'eigengenes'], ['谨慎解释', '相关不等于调控']
  ],
  'edta-tutorial': [
    ['基因组 FASTA', '输入检查'], ['环境依赖', 'Linux / 工具链'], ['EDTA', '重复序列发现'],
    ['整合注释', '按参数阶段运行'], ['输出检查', '库 / GFF3 / 摘要']
  ],
  'cafe5-intro': [
    ['家族计数表', '家族 × 物种'], ['物种树', 'Newick'], ['一致性检查', '名称 / 计数'],
    ['CAFE 5', '生灭模型'], ['扩张与收缩', '统计推断'], ['结果解释', '结合独立证据']
  ]
};

/** Split source Markdown at level-two headings without treating code examples as headings. */
export function splitTutorialMarkdown(markdown: string): MarkdownSection[] {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  const sections: MarkdownSection[] = [];
  let currentTitle = '';
  let currentLines: string[] = [];
  let fence: string | undefined;
  let sourceIndex = 0;

  const flush = () => {
    const body = currentLines.join('\n').replace(/^\n+|\n+$/g, '');
    if (currentTitle || body) {
      sourceIndex += 1;
      sections.push({ title: currentTitle || '补充内容', body, id: `source-${String(sourceIndex).padStart(2, '0')}` });
    }
    currentLines = [];
  };

  for (const line of lines) {
    const marker = line.match(/^\s*(`{3,}|~{3,})/);
    if (marker) {
      if (!fence) fence = marker[1][0];
      else if (marker[1][0] === fence) fence = undefined;
    }
    const heading = !fence ? line.match(/^##\s+(.+?)\s*#*\s*$/) : null;
    if (heading) {
      flush();
      currentTitle = heading[1].trim();
    } else {
      currentLines.push(line);
    }
  }
  flush();
  return sections;
}

export function markdownExcerpt(markdown: string, maxLength = 300): string {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!?(\[[^\]]*\])\([^)]+\)/g, '$1')
    .replace(/[*_`>#~]/g, '')
    .replace(/\$\$?[\s\S]*?\$\$?/g, '公式')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}…` : text;
}

export function markdownLinks(markdown: string) {
  const links: { label: string; href: string }[] = [];
  const pattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)(?:\s+"[^"]*")?\)/g;
  for (const match of markdown.matchAll(pattern)) {
    if (!links.some(link => link.href === match[2])) links.push({ label: match[1].trim(), href: match[2] });
  }
  return links;
}

export function sectionExcerpt(sections: MarkdownSection[], pattern: RegExp, fallback: string): string {
  const section = sections.find(item => pattern.test(item.title));
  return section ? markdownExcerpt(section.body, 340) || fallback : fallback;
}
