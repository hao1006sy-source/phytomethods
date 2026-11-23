export type CompatibilityStatus='confirmed'|'incompatible'|'unverified';
export interface CompatibilityRecord {assemblyId:string;speciesId?:string;coordinateSystem?:string;chromosomeNamespace?:string;strain?:string;formalRelease?:string;relationshipVerified?:boolean;evidence?:string[];accessType?:string;}
export function compatibility(a:CompatibilityRecord,b:CompatibilityRecord):{status:CompatibilityStatus;reason:string}{
 if(a.assemblyId!==b.assemblyId)return{status:'incompatible',reason:'组装 accession 或版本不同；GCA/GCF 配对也不自动等价。'};
 for(const [key,label]of [['speciesId','物种'],['coordinateSystem','坐标体系'],['chromosomeNamespace','染色体命名'],['strain','品系'],['formalRelease','正式发布记录']] as const){
  if(a[key]&&b[key]&&a[key]!==b[key])return{status:'incompatible',reason:`${label}不同，不能混合使用。`};
  if(!a[key]||!b[key])return{status:'unverified',reason:`缺少${label}核实信息。`};
 }
 if(!a.relationshipVerified||!b.relationshipVerified||!a.evidence?.length||!b.evidence?.length||a.accessType==='unverified'||b.accessType==='unverified')return{status:'unverified',reason:'文件或版本关联来源尚未核实，暂不推荐配套。'};
 return{status:'confirmed',reason:'登记来源确认同一组装、注释发布、品系与命名体系；下载后仍应核对实际文件 header 和包内发布记录。'};
}
export const compatibilityLabels={confirmed:'已确认配套',incompatible:'版本不兼容',unverified:'尚未确认'};
