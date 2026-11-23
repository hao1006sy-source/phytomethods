export interface CitationInput {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number | string;
  doi: string;
  volumePages?: string;
}

export interface CitationResult {
  bibtex: string;
  apa: string;
  gb7714: string;
}

function generateCiteKey(authors: string, year: number | string, title: string): string {
  const firstAuthor = authors.split(/[,，\s]+/)[0].toLowerCase().replace(/[^a-z]/g, '') || 'paper';
  const firstWord = title.split(/[\s:,-]+/)[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 'study';
  return `${firstAuthor}${year}${firstWord}`;
}

export function generateCitations(input: CitationInput): CitationResult {
  const { id, title, authors, journal, year, doi, volumePages } = input;
  const citeKey = id === 'hifiasm' ? 'cheng2021haplotype' : generateCiteKey(authors, year, title);

  // 解析卷期页码（如有形如 "18: 170–175" 或 "18(2): 170-175"）
  let vol = '';
  let num = '';
  let pages = '';
  if (volumePages) {
    const match = volumePages.match(/^(\d+)(?:\(([^)]+)\))?:\s*([0-9–-]+)$/);
    if (match) {
      vol = match[1];
      num = match[2] || '';
      pages = match[3];
    }
  }

  // 1. BibTeX
  const bibtexLines = [
    `@article{${citeKey},`,
    `  title={${title}},`,
    `  author={${authors}},`,
    `  journal={${journal}},`,
    `  year={${year}},`,
  ];
  if (vol) bibtexLines.push(`  volume={${vol}},`);
  if (num) bibtexLines.push(`  number={${num}},`);
  if (pages) bibtexLines.push(`  pages={${pages.replace('–', '--')}},`);
  bibtexLines.push(`  doi={${doi}}`);
  bibtexLines.push(`}`);
  const bibtex = bibtexLines.join('\n');

  // 2. APA
  let apaVolPages = '';
  if (vol && pages) {
    apaVolPages = num ? `, ${vol}(${num}), ${pages}` : `, ${vol}, ${pages}`;
  }
  const apa = `${authors} (${year}). ${title}. ${journal}${apaVolPages}. https://doi.org/${doi}`;

  // 3. GB/T 7714
  let gbVolPages = '';
  if (vol && pages) {
    gbVolPages = num ? `, ${vol}(${num}): ${pages}` : `, ${vol}: ${pages}`;
  }
  const gb7714 = `${authors.toUpperCase()}. ${title}[J]. ${journal}, ${year}${gbVolPages}. DOI: ${doi}`;

  return {
    bibtex,
    apa,
    gb7714
  };
}
