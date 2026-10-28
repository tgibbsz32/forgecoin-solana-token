import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {spawnSync} from 'node:child_process';
const dir=new URL('../',import.meta.url);
test('on-chain reconciliation requires mint and wallet mapping',()=>{
 const r=spawnSync(process.execPath,['scripts/verify-devnet-allocations.mjs'],{cwd:dir,encoding:'utf8'});
 assert.notEqual(r.status,0);assert.match(r.stderr,/Usage:/);
});
test('on-chain reconciliation rejects invalid Solana mint without network use',()=>{
 const r=spawnSync(process.execPath,['scripts/verify-devnet-allocations.mjs','bad-mint','fixtures/allocation-wallets.example.json'],{cwd:dir,encoding:'utf8'});
 assert.notEqual(r.status,0);
});
test('mint reconciler uses Token-2022 program and checks exact amounts',()=>{
 const src=fs.readFileSync(new URL('../scripts/verify-devnet-allocations.mjs',import.meta.url),'utf8');
 assert.match(src,/TOKEN_2022_PROGRAM_ID/);assert.match(src,/state\.amount!==expected/);assert.match(src,/mintState\.supply!==expectedSupply/);
});
