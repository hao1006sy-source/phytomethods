import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
const read=name=>JSON.parse(fs.readFileSync(`src/data/genomes/${name}.json`,'utf8'));
const [species,assemblies,annotations,files,databases]=['species','assemblies','annotations','files','databases'].map(read);
for(const [name,rows]of Object.entries({species,assemblies,annotations,files,databases}))assert.equal(new Set(rows.map(x=>x.id)).size,rows.length,`${name}: duplicate ID`);
const known=(rows,id)=>rows.find(x=>x.id===id);
const validUrl=u=>{assert.equal(new URL(u).protocol,'https:');};
const validDate=d=>{assert.match(d,/^\d{4}-\d{2}-\d{2}$/);assert.equal(new Date(d).toISOString().slice(0,10),d);assert.ok(d<=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()));};
for(const s of species){assert.ok(Number.isInteger(s.taxonomyId)&&s.taxonomyId>0);for(const id of s.databaseIds)assert.ok(known(databases,id));assert.ok(fs.existsSync('src/pages/genomes/[species].astro'));}
assert.equal(new Set(assemblies.map(a=>a.accession)).size,assemblies.length);
for(const a of assemblies){assert.ok(known(species,a.speciesId));assert.match(a.accession,/^(GCA|GCF)_\d{9}\.\d+$/);assert.equal(a.assemblyVersion,a.accession.split('.')[1]);assert.ok(known(databases,a.sourceDatabase));assert.ok(['Complete Genome','Chromosome','Scaffold','Contig'].includes(a.assemblyLevel));validUrl(a.sourceUrl);validDate(a.verifiedAt);if(a.releaseDate)validDate(a.releaseDate);}
for(const n of annotations){assert.ok(known(assemblies,n.assemblyId));assert.ok(known(databases,n.sourceDatabase));validUrl(n.sourceUrl);validDate(n.verifiedAt);if(n.releaseDate)validDate(n.releaseDate);}
const formats={genome:'FASTA',gff3:'GFF3',gtf:'GTF',cds:'FASTA',protein:'FASTA',transcript:'FASTA',functional:'TSV',repeat:'GFF3'};
for(const f of files){assert.ok(known(assemblies,f.assemblyId));const n=known(annotations,f.annotationId);assert.ok(n);assert.equal(n.assemblyId,f.assemblyId);assert.equal(f.speciesId,known(assemblies,f.assemblyId).speciesId);assert.ok(known(databases,f.sourceDatabase));assert.equal(f.format,formats[f.type]);validUrl(f.sourceUrl);validDate(f.verifiedAt);assert.ok(['direct','portal','login_required','unverified'].includes(f.accessType));if(f.relationshipVerified){assert.ok(f.evidence.length);assert.equal(f.coordinateSystem,known(assemblies,f.assemblyId).coordinateSystem);assert.equal(f.formalRelease,n.formalRelease);}if(f.accessType==='direct'){validUrl(f.downloadUrl);assert.ok(f.httpVerified);const proof=JSON.parse(fs.readFileSync(f.verificationEvidence,'utf8')).find(r=>r.url===f.downloadUrl);assert.ok(proof?.gzip&&[200,206].includes(proof.status));assert.match(f.downloadUrl,/\.gz$/);assert.ok(f.verificationMethod.includes('gzip'));}else assert.ok(!f.downloadUrl);}
for(const d of databases){validUrl(d.url);validUrl(d.documentation);validDate(d.verifiedAt);}
// Execute the actual TypeScript compatibility implementation via Node's type stripping.
const {compatibility}=await import('../src/lib/genomes/compatibility.ts');
const get=id=>files.find(f=>f.id===id);
assert.equal(compatibility(get('tair12-genome'),get('araport11-gff3')).status,'incompatible');
assert.equal(compatibility(get('rgap7-genome'),get('rgap7-gff3')).status,'confirmed');
assert.equal(compatibility(get('rgap7-genome'),{...get('rgap7-gff3'),chromosomeNamespace:'NCBI accessions'}).status,'incompatible');
assert.equal(compatibility(get('rgap7-genome'),{...get('rgap7-gff3'),assemblyId:'gcf_001433935.1'}).status,'incompatible');
assert.equal(compatibility(get('rgap7-genome'),{...get('rgap7-gff3'),relationshipVerified:false}).status,'unverified');
assert.equal(compatibility(get('rgap7-genome'),{...get('rgap7-gff3'),formalRelease:undefined}).status,'unverified');
for(const key of ['formalRelease','coordinateSystem','strain','speciesId'])assert.equal(compatibility(get('rgap7-genome'),{...get('rgap7-gff3'),[key]:'different'}).status,'incompatible');
assert.equal(compatibility(get('rgap7-genome'),{...get('rgap7-gff3'),chromosomeNamespace:''}).status,'unverified');
const bundleStates=assemblies.map(a=>compatibility(files.find(f=>f.assemblyId===a.id&&f.type==='genome'),files.find(f=>f.assemblyId===a.id&&f.type==='gff3')).status);
const summary={confirmedBundles:bundleStates.filter(s=>s==='confirmed').length,unverifiedBundles:bundleStates.filter(s=>s==='unverified').length,species:species.length,assemblies:assemblies.length,annotations:annotations.length,files:files.length,direct:files.filter(f=>f.accessType==='direct').length,loginRequired:files.filter(f=>f.accessType==='login_required').length,unverified:files.filter(f=>f.accessType==='unverified').length,portals:files.filter(f=>f.accessType==='portal').length,compatibilityAssertions:11};
if(process.env.GENOME_HUB_REPORT){fs.mkdirSync(path.dirname(process.env.GENOME_HUB_REPORT),{recursive:true});fs.writeFileSync(process.env.GENOME_HUB_REPORT,JSON.stringify(summary,null,2));}
console.log(JSON.stringify(summary));
