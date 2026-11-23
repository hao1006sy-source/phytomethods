/** Split a Markdown article at real H2 headings while leaving fenced examples intact. */
export interface MethodMarkdownSection {
  id: string;
  title: string;
  markdown: string;
}

export function splitMethodMarkdown(source: string): MethodMarkdownSection[] {
  const lines = source.replace(/^\uFEFF/, '').split(/\r?\n/);
  const sections: MethodMarkdownSection[] = [];
  let current: MethodMarkdownSection | undefined;
  let fence: { marker: string; length: number } | undefined;
  const start = (title: string, markdown = '') => {
    current = { id: '', title, markdown };
    sections.push(current);
  };

  for (const line of lines) {
    const fenceMatch = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (fenceMatch) {
      if (!fence) fence = { marker: fenceMatch[1][0], length: fenceMatch[1].length };
      else if (fenceMatch[1][0] === fence.marker && fenceMatch[1].length >= fence.length) fence = undefined;
    }
    const heading = !fence ? line.match(/^ {0,3}##\s+(.+?)\s*#*\s*$/) : null;
    if (heading) {
      start(heading[1].trim());
      continue;
    }
    if (!current) {
      if (!line.trim() && !sections.length) continue;
      start('工具简介');
    }
    current!.markdown += `${current!.markdown ? '\n' : ''}${line}`;
  }

  sections.forEach((section, index) => {
    section.id = `section-${String(index + 1).padStart(2, '0')}`;
    section.markdown = section.markdown.trim();
  });
  return sections.filter(section => section.title || section.markdown);
}
