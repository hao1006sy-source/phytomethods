import metadata from './topic-metadata.json';
export interface TopicMetadata {id:string;title:string;englishTitle:string;domainId:string;order:number;summary:string;keyConcepts:string[];methodIds:string[];principleIds:string[];dataIds:string[];paperIds:string[];tutorialIds:string[];status:string;createdAt:string|null;updatedAt:string|null}
export const topicMetadata:TopicMetadata[] = metadata;
export const topicLists: Record<string,string[]> = Object.fromEntries([...new Set(metadata.map(x=>x.domainId))].map(id=>[id,metadata.filter(t=>t.domainId===id).sort((a,b)=>a.order-b.order).map(t=>t.title)]));
export const publishedTopics: Record<number,string> = Object.fromEntries(metadata.filter(t=>t.domainId==='genome-assembly' && t.status==='published').map(t=>[t.order-1,t.id]));
