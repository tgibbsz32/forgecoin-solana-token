import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const c=JSON.parse(fs.readFileSync(new URL('../config/tokenomics.json',import.meta.url)));
test('fixed allocation matches 2M',()=>assert.equal(Object.values(c.allocations).reduce((s,x)=>s+BigInt(x),0n),2000000n));
test('sale is inactive',()=>assert.notEqual(c.sale.status,'active'));
test('sale math and cash split',()=>{assert.equal(BigInt(c.allocations.initialSale)*10n,10000000n);assert.equal(c.proceedsBudget.projectPercent+c.proceedsBudget.founderCompensationPercent,100)});
test('no team allocation',()=>assert.equal(Object.keys(c.allocations).some(x=>/team|founder/i.test(x)),false));
