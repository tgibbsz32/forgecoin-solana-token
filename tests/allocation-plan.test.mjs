import test from 'node:test';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
const cwd=new URL('../',import.meta.url);
function run(file,...args){return spawnSync(process.execPath,[file,...args],{cwd,encoding:'utf8'})}
test('allocation plan includes exact 2M supply in base units',()=>{const r=run('scripts/allocation-plan.mjs','fixtures/allocation-wallets.example.json');assert.equal(r.status,0,r.stderr);const j=JSON.parse(r.stdout);assert.equal(j.entries.reduce((s,e)=>s+BigInt(e.amountBaseUnits),0n),2000000000000n);assert.equal(j.mode,'PLAN_ONLY')});
test('payout journal stages new payment without transferring',()=>{const r=run('scripts/payout-journal.mjs','preview','fixtures/payouts.example.json','fixtures/payout-journal.example.json');assert.equal(r.status,0,r.stderr);const j=JSON.parse(r.stdout);assert.equal(j.staged.length,1);assert.equal(j.mode,'OFFLINE_PREVIEW_ONLY')});
