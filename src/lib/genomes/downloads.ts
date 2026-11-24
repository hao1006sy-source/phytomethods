import type {Assembly,ResourceFile} from './registry';
export function datasetsCommand(a:Assembly){
 if(!/^(GCA|GCF)_\d{9}\.\d+$/.test(a.accession))throw new Error('Invalid accession');
 if(a.sourceDatabase==='ensembl')return '# 此历史 accession 未从 NCBI Datasets 返回；请使用官方 Ensembl 页面。';
 const include=a.sourceDatabase==='ncbi'&&!['GCA_028009825.2','GCA_001433935.1'].includes(a.accession)?'genome,gff3,protein,cds':'genome';
 return `datasets download genome accession ${a.accession} --include ${include} --filename ${a.accession}_reference.zip`;
}
export function referenceManifest(a:Assembly,s:{id:string;scientificName:string;taxonomyId:number},annotation:{releaseName:string;sourceDatabase:string}|undefined,selected:ResourceFile[],status:string){return{schemaVersion:1,speciesId:s.id,scientificName:s.scientificName,taxonomyId:s.taxonomyId,assemblyName:a.assemblyName,assemblyAccession:a.accession,assemblyVersion:a.assemblyVersion,annotationRelease:annotation?.releaseName,annotationSource:annotation?.sourceDatabase,coordinateSystem:a.coordinateSystem,chromosomeNaming:selected[0]?.chromosomeNamespace,selectedFiles:selected.map(f=>({id:f.id,type:f.type,url:'downloadUrl'in f?f.downloadUrl:null,sourcePage:f.sourceUrl,accessType:f.accessType,source:f.sourceDatabase,verifiedAt:f.verifiedAt,sha256:null})),compatibilityStatus:status,retrievedAt:new Date().toISOString(),sources:[...new Set([a.sourceUrl,...selected.map(f=>f.sourceUrl)])],note:'retrievedAt 为清单生成时间；未计算文件哈希。官方页面入口不代表已下载文件。NCBI 包注释可能更新，应核对实际 release。'};}
