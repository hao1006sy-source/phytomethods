export const sectionTitles=['教程概览','运行前准备','软件安装','数据准备','运行 Hifiasm','检查组装输出','GFA 转换为 FASTA','组装质量评估','常见问题与排查','参考资源'];
export const sectionIds=['overview','prepare','install','data','run','outputs','fasta','quality','faq','resources'];
export const goals=['理解 HiFi 输入数据的基本要求','掌握 Hifiasm 的安装和基本运行命令','理解 GFA 等主要输出文件的用途','将 GFA 中的序列导出为 FASTA','了解组装质量评估的基本方法'];
export const workflow=[['HiFi reads','FASTA / FASTQ'],['数据检查','完整性 / 样本'],['Hifiasm','组装'],['GFA / contigs','组装结果'],['FASTA','序列导出'],['质量评估','Merqury / BUSCO']];
export const faq=[
 ['输入文件找不到','日志报告无法打开输入文件。','路径、工作目录或权限不匹配。','核对当前目录、文件名大小写和读取权限，使用实际输入路径。'],
 ['gzip 文件损坏','解压或读入时出现压缩错误。','文件下载不完整或传输受损。','检查 gzip 完整性并对照来源校验和，重新获取损坏文件。'],
 ['内存不足','进程被系统终止或日志提示分配失败。','数据规模或复杂度超过可用内存。','检查调度器与系统日志、内存限制和输入规模，申请合适资源后重跑。'],
 ['运行中断','进程提前结束，输出尚未完成。','作业时限、资源或运行环境异常。','保留日志与命令，检查退出状态和调度器原因，依据官方文档处理缓存和重跑。'],
 ['输出文件缺失','预期的 GFA 文件不存在。','运行未成功、前缀不符或运行模式不同。','核对输出目录、前缀、日志和软件版本，再按对应模式检查输出文件。'],
 ['GFA 图结构复杂','图中出现多个分支或连接。','重复、杂合及覆盖差异都可能影响图结构。','用 Bandage 局部查看节点，结合覆盖与独立质量评估解释分支。'],
 ['单倍型输出与预期不同','输出数量或相位范围不符合实验目标。','输入类型、倍性、杂合度和运行模式影响结果。','核对所用模式和辅助数据，HiFi-only 的部分相位结果需结合原文和独立证据解释。']
];
// Preserve source prose and commands verbatim while placing them in the teaching sequence.
export function sourceParts(body:string){
 const byHeading=Object.fromEntries(body.split(/^## /m).slice(1).map(s=>{const n=s.indexOf('\n');return [s.slice(0,n).trim(),s.slice(n+1).trim()];}));
 const official=byHeading['数据准备与官方示例'];const composite=official.match(/```bash\s*\n([\s\S]*?)\n```/)!;const lines=composite[1].split('\n');
 const output=byHeading['输出解释与排查'];const fasta=output.match(/```bash\s*\n([\s\S]*?)\n```/)!;
 return {byHeading,install:lines.slice(0,4).join('\n'),download:lines[4],test:lines[5],dataBefore:official.slice(0,composite.index).trim(),dataAfter:official.slice(composite.index!+composite[0].length).trim(),output:output.replace(fasta[0],'').trim(),fasta:fasta[1]};
}
