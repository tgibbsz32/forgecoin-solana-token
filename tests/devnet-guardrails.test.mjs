import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const tokenomics=JSON.parse(fs.readFileSync(new URL('../config/tokenomics.json',import.meta.url)));
test('all allocation quantities are exact integers and sum to cap',()=>{
 const values=Object.values(tokenomics.allocations);
 assert.ok(values.every(x=>typeof x==='string' && /^(0|[1-9][0-9]*)$/.test(x)));
 assert.equal(values.reduce((a,b)=>a+BigInt(b),0n),2_000_000n);
 assert.equal(tokenomics.token.decimals,6);
});
test('sale is owner-authorized only, not active',()=>{
 assert.equal(tokenomics.sale.status,'authorized-pending-activation');
 assert.equal(tokenomics.sale.priceUsd,'0.10');
 assert.equal(tokenomics.sale.targetGrossUsd,'100000');
});
test('mint command fails without explicit opt-in before accessing keys or RPC',()=>{
 const r=spawnSync(process.execPath,['scripts/mint-devnet.mjs'],{
  cwd:new URL('../',import.meta.url),encoding:'utf8',env:{...process.env,ENABLE_DEVNET_MINT:''}
 });
 assert.notEqual(r.status,0);
 assert.match(r.stderr,/ENABLE_DEVNET_MINT/);
});
test('mint command refuses missing fee payer key even with devnet opt-in',()=>{
 const env={...process.env,ENABLE_DEVNET_MINT:'I_UNDERSTAND_DEVNET_ONLY'};
 delete env.DEVNET_FEE_PAYER_KEYPAIR;
 const r=spawnSync(process.execPath,['scripts/mint-devnet.mjs'],{
  cwd:new URL('../',import.meta.url),encoding:'utf8',env
 });
 assert.notEqual(r.status,0);
 assert.match(r.stderr,/DEVNET_FEE_PAYER_KEYPAIR/);
});
test('purchase preview has no enabled purchase control',()=>{
 const page=fs.readFileSync(new URL('../preview/index.html',import.meta.url),'utf8');
 assert.match(page,/<button[^>]*disabled/);
 assert.doesNotMatch(page,/window\.solana\.connect|sendTransaction\(/);
});
