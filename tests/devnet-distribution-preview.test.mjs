import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {spawnSync} from 'node:child_process';
const cwd=new URL('../',import.meta.url);
const mint='11111111111111111111111111111111';
function run(journal){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mfrg-journal-'));try{const jf=path.join(dir,'journal.json');fs.writeFileSync(jf,JSON.stringify(journal));return spawnSync(process.execPath,['scripts/devnet-distribution-preview.mjs',mint,'fixtures/allocation-wallets.example.json',jf],{cwd,encoding:'utf8'});}finally{fs.rmSync(dir,{recursive:true,force:true})}}
test('exactly five plans and 2M mFRG base units',()=>{const r=run([]);assert.equal(r.status,0,r.stderr);const p=JSON.parse(r.stdout);assert.equal(p.plans.length,5);assert.equal(p.totalBaseUnits,'2000000000000');assert.equal(p.mode,'READ_ONLY_TRANSACTION_PREVIEW')});
test('duplicate journal entries are rejected',()=>{const r=run([{id:'same',status:'planned'},{id:'same',status:'planned'}]);assert.notEqual(r.status,0);assert.match(r.stderr,/duplicate journal/i)});
test('unknown journal entries are rejected',()=>{const r=run([{id:'unknown',status:'submitted'}]);assert.notEqual(r.status,0);assert.match(r.stderr,/not in current plan/i)});
test('plan fingerprint stable for repeated reads',()=>{const a=JSON.parse(run([]).stdout),b=JSON.parse(run([]).stdout);assert.deepEqual(a.plans,b.plans)});
