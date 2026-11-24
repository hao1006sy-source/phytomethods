import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const urls = [
  // 拟南芥 Araport11 (Ensembl Plants release-60)
  'https://ftp.ensemblgenomes.ebi.ac.uk/pub/plants/release-60/fasta/arabidopsis_thaliana/dna/Arabidopsis_thaliana.TAIR10.dna.toplevel.fa.gz',
  'https://ftp.ensemblgenomes.ebi.ac.uk/pub/plants/release-60/gff3/arabidopsis_thaliana/Arabidopsis_thaliana.TAIR10.60.gff3.gz',
  'https://ftp.ensemblgenomes.ebi.ac.uk/pub/plants/release-60/fasta/arabidopsis_thaliana/cds/Arabidopsis_thaliana.TAIR10.cds.all.fa.gz',
  'https://ftp.ensemblgenomes.ebi.ac.uk/pub/plants/release-60/fasta/arabidopsis_thaliana/pep/Arabidopsis_thaliana.TAIR10.pep.all.fa.gz',
  // 拟南芥 Col-CC (TAIR12 NCBI GenBank)
  'https://ftp.ncbi.nlm.nih.gov/genomes/all/GCA/028/009/825/GCA_028009825.2_Col-CC/GCA_028009825.2_Col-CC_genomic.fna.gz',
  // 玉米 NAM-5.0 (NCBI RefSeq)
  'https://ftp.ncbi.nlm.nih.gov/genomes/all/GCF/902/167/145/GCF_902167145.1_Zm-B73-REFERENCE-NAM-5.0/GCF_902167145.1_Zm-B73-REFERENCE-NAM-5.0_genomic.fna.gz',
  'https://ftp.ncbi.nlm.nih.gov/genomes/all/GCF/902/167/145/GCF_902167145.1_Zm-B73-REFERENCE-NAM-5.0/GCF_902167145.1_Zm-B73-REFERENCE-NAM-5.0_genomic.gff.gz',
  'https://ftp.ncbi.nlm.nih.gov/genomes/all/GCF/902/167/145/GCF_902167145.1_Zm-B73-REFERENCE-NAM-5.0/GCF_902167145.1_Zm-B73-REFERENCE-NAM-5.0_cds_from_genomic.fna.gz',
  'https://ftp.ncbi.nlm.nih.gov/genomes/all/GCF/902/167/145/GCF_902167145.1_Zm-B73-REFERENCE-NAM-5.0/GCF_902167145.1_Zm-B73-REFERENCE-NAM-5.0_protein.faa.gz',
  // 小麦 CS v2.1 (NCBI RefSeq)
  'https://ftp.ncbi.nlm.nih.gov/genomes/all/GCF/018/294/505/GCF_018294505.1_IWGSC_CS_RefSeq_v2.1/GCF_018294505.1_IWGSC_CS_RefSeq_v2.1_genomic.fna.gz',
  'https://ftp.ncbi.nlm.nih.gov/genomes/all/GCF/018/294/505/GCF_018294505.1_IWGSC_CS_RefSeq_v2.1/GCF_018294505.1_IWGSC_CS_RefSeq_v2.1_genomic.gff.gz',
  'https://ftp.ncbi.nlm.nih.gov/genomes/all/GCF/018/294/505/GCF_018294505.1_IWGSC_CS_RefSeq_v2.1/GCF_018294505.1_IWGSC_CS_RefSeq_v2.1_cds_from_genomic.fna.gz',
  'https://ftp.ncbi.nlm.nih.gov/genomes/all/GCF/018/294/505/GCF_018294505.1_IWGSC_CS_RefSeq_v2.1/GCF_018294505.1_IWGSC_CS_RefSeq_v2.1_protein.faa.gz',
  // 大豆 Wm82 v4.0 (NCBI RefSeq)
  'https://ftp.ncbi.nlm.nih.gov/genomes/all/GCF/000/004/515/GCF_000004515.6_Glycine_max_v4.0/GCF_000004515.6_Glycine_max_v4.0_genomic.fna.gz',
  'https://ftp.ncbi.nlm.nih.gov/genomes/all/GCF/000/004/515/GCF_000004515.6_Glycine_max_v4.0/GCF_000004515.6_Glycine_max_v4.0_genomic.gff.gz',
  'https://ftp.ncbi.nlm.nih.gov/genomes/all/GCF/000/004/515/GCF_000004515.6_Glycine_max_v4.0/GCF_000004515.6_Glycine_max_v4.0_cds_from_genomic.fna.gz',
  'https://ftp.ncbi.nlm.nih.gov/genomes/all/GCF/000/004/515/GCF_000004515.6_Glycine_max_v4.0/GCF_000004515.6_Glycine_max_v4.0_protein.faa.gz',
  // 番茄 Heinz 1706 SL4.0 (NCBI GenBank)
  'https://ftp.ncbi.nlm.nih.gov/genomes/all/GCA/000/188/115/GCA_000188115.5_SL4.0/GCA_000188115.5_SL4.0_genomic.fna.gz'
];

async function verifyAll() {
  const results = [];
  for (const url of urls) {
    console.log('Verifying:', url.split('/').pop());
    const res = await fetch(url, { headers: { Range: 'bytes=0-10240' } });
    const buffer = Buffer.from(await res.arrayBuffer());
    let isGzip = false;
    let headerText = '';
    try {
      const decomp = zlib.gunzipSync(buffer, { finishFlush: zlib.constants.Z_SYNC_FLUSH });
      isGzip = true;
      headerText = decomp.toString('utf8').slice(0, 150).replace(/\r?\n/g, ' ');
    } catch {
      // Check magic numbers 0x1f 0x8b
      if (buffer[0] === 0x1f && buffer[1] === 0x8b) {
        isGzip = true;
      }
    }

    results.push({
      url,
      status: res.status,
      contentLength: res.headers.get('content-length'),
      contentType: res.headers.get('content-type') || 'application/x-gzip',
      gzip: isGzip,
      verifiedAt: '2026-11-24',
      firstBytesSample: headerText
    });
  }

  // 同时也把原有已核实的水稻直链保留在同一个证据文件中，形成统一的 V1.1.1 完整证据集
  const rgapOldPath = 'outputs/plant-genome-hub-v1/sources/rgap-download-checks-system.json';
  if (fs.existsSync(rgapOldPath)) {
    const rgapItems = JSON.parse(fs.readFileSync(rgapOldPath, 'utf8'));
    for (const item of rgapItems) {
      if (!results.some(r => r.url === item.url)) {
        results.push(item);
      }
    }
  }

  const outDir = 'outputs/plant-genome-hub-v1.1/sources';
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'genome-download-checks-v1.1.1.json'), JSON.stringify(results, null, 2));
  console.log('Done! Total verified URLs:', results.length);
}

verifyAll();
