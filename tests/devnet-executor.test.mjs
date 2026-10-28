import test from 'node:test';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
const cwd=new URL('../',import.meta.url);
function run(command,env={}){return spawnSync(process.execPath,['scripts/devnet-executor.mjs',command,'11111111111111111111111111111111','fixtures/allocation-wallets.example.json','fixtures/payout-journal.example.json'],{cwd,encoding:'utf8',env:{...process.env,...env}})}
test('inspect is nontransactional and has five allocations',()=>{const r=run('inspect');assert.equal(r.status,0,r.stderr);const j=JSON.parse(r.stdout);assert.equal(j.plans.length,5);assert.equal(j.mode,'LOCAL_INSPECTION_ONLY');assert.equal(j.plans.reduce((s,x)=>s+BigInt(x.expected),0n),2000000000000n)});
test('verify refuses RPC without explicit opt-in',()=>{const r=run('verify',{ENABLE_DEVNET_READONLY_VERIFY:''});assert.notEqual(r.status,0);assert.match(r.stderr,/ENABLE_DEVNET_READONLY_VERIFY/)});
test('unsupported commands refused',()=>{const r=run('submit');assert.notEqual(r.status,0);assert.match(r.stderr,/Usage/)});
