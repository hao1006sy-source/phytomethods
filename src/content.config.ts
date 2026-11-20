import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
const common = {title:z.string(), summary:z.string(), updatedAt:z.coerce.date(), status:z.enum(['published','draft','planned']).default('published')};
const methods = defineCollection({loader:glob({pattern:'**/*.md',base:'./src/content/methods'}),schema:z.object({...common, name:z.string(), dataType:z.string(), principle:z.string(), paper:z.string(), repository:z.url(), domainIds:z.array(z.string()), topicIds:z.array(z.string()), principleIds:z.array(z.string()), dataIds:z.array(z.string())})});
const topics = defineCollection({loader:glob({pattern:'**/*.md',base:'./src/content/topics'}),schema:z.object({...common, domain:z.string(), methods:z.array(z.string())})});
const papers = defineCollection({loader:glob({pattern:'**/*.md',base:'./src/content/papers'}),schema:z.object({...common, authors:z.string(), year:z.number(), journal:z.string(), doi:z.string(), type:z.enum(['method','application','review']), domainIds:z.array(z.string()), speciesIds:z.array(z.string()), method:z.string().optional(), methodIds:z.array(z.string()).default([])})});
const tutorials = defineCollection({loader:glob({pattern:'**/*.md',base:'./src/content/tutorials'}),schema:z.object({...common, method:z.string(), tested:z.enum(['verified','template','not-tested'])})});
export const collections = { methods, topics, papers, tutorials };

