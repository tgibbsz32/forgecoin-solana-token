import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {spawnSync} from 'node:child_process';
const cwd=new URL('../',import.meta.url);
const pool=JSON.parse(fs.readFileSync(new URL('../fixtures/pool-work-export.example.json',import.meta.url)));
const reg=JSON.parse(fs.readFileSync(new URL('../fixtures/wallet-registry.example.json',import.meta.url)));
function run(p=pool,r=reg){const d=fs.mkdtempSync(path.join(os.tmpdir(),'mfrg-intake-'));try{const a=path.join(d,'pool.json'),b=path.join(d,'wallets.json');fs.writeFileSync(a,JSON.stringify(p));fs.writeFileSync(b,JSON.stringify(r));return spawnSync(process.execPath,['scripts/pool-work-intake.mjs',a,b,'1'],{cwd,encoding:'utf8'})}finally{fs.rmSync(d,{recursive:true,force:true})}}
test('validated schema converts closed pool export to weekly work',()=>{const r=run();assert.equal(r.status,0,r.stderr);const result=JSON.parse(r.stdout);assert.equal(result.work.length,2);assert.equal(result.work[0].source,'official_pool');assert.match(result.digest,/^[a-f0-9]{64}$/)});
test('reject unverified registration',()=>{const r=run(pool,[{...reg[0],ownershipVerified:false},reg[1]]);assert.notEqual(r.status,0);assert.match(r.stderr,/unverified/i)});
test('reject unclosed period',()=>{const r=run({...pool,closed:false});assert.notEqual(r.status,0);assert.match(r.stderr,/not formally closed/i)});
test('reject duplicate work',()=>{const r=run({...pool,work:[pool.work[0],pool.work[0]]});assert.notEqual(r.status,0);assert.match(r.stderr,/repeated/i)});
test('reject unknown miner',()=>{const r=run({...pool,work:[{...pool.work[0],minerId:'unknown'}]});assert.notEqual(r.status,0);assert.match(r.stderr,/Missing verified wallet/)});
