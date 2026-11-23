import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const root='examples/cafe5';
const manifest=JSON.parse(fs.readFileSync(`${root}/verification-manifest.json`,'utf8'));
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
assert.equal(manifest.status,'verified');assert.equal(manifest.commit,'8d3ab080796eafa192241a1067398832d886592d');
const source=JSON.parse(fs.readFileSync(`${manifest.evidenceDirectory}/source-manifest.json`,'utf8'));
assert.equal(source.commit,manifest.commit);assert.equal(source.tag,'v5.1');
for(const f of manifest.files){assert.equal(fs.statSync(f.path).size,f.bytes,f.path);assert.equal(hash(f.path),f.sha256,`${f.path}: evidence hash`);}
for(const f of source.inputs)assert.equal(hash(f.path),f.sha256);
const execution=JSON.parse(fs.readFileSync(`${manifest.evidenceDirectory}/execution.json`,'utf8'));
assert.equal(execution.length,2);for(const r of execution){assert.equal(r.exitCode,0);assert.ok(r.elapsedSeconds>0);assert.ok(r.command.includes('-p'));}
const validation=JSON.parse(fs.readFileSync(`${manifest.evidenceDirectory}/validation-results.json`,'utf8'));
assert.equal(validation.valid,true);assert.equal(validation.models.length,2);
for(const r of validation.models){assert.equal(r.valid,true);assert.equal(r.inputFamilies,12653);assert.equal(r.retainedFamilies,10956);assert.ok(Number.isFinite(r.negativeLogLikelihood));assert.ok(r.lambdaEstimate>0);}
const records=JSON.parse(fs.readFileSync('src/components/tutorial-v3/tutorial-verification.json','utf8'));
assert.equal(records['cafe5-intro'].status,'verified');assert.equal(records['hifiasm-intro'].status,'template');assert.equal(records['edta-tutorial'].status,'template');
assert.equal(Object.values(records).filter(r=>r.status==='verified').length,8);
for(const p of records['cafe5-intro'].evidencePaths)assert.ok(fs.existsSync(p));
const markdown=fs.readFileSync('src/content/tutorials/cafe5-intro.md','utf8');assert.match(markdown,/tested: verified/);
console.log(`CAFE5 evidence passed: ${manifest.files.length} hashes; 2 model runs; 12653 input / 10956 retained; 8 verified / 2 template`);
