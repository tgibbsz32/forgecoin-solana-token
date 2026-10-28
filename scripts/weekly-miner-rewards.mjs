import fs from 'node:fs';
import crypto from 'node:crypto';
const [recordsPath,weekText]=process.argv.slice(2);
if(!recordsPath||!weekText||!/^(?:[1-9]|[1-4][0-9]|5[0-2])$/.test(weekText))throw Error('Usage: node scripts/weekly-miner-rewards.mjs <verified-work.json> <week-1..52>');
const config=JSON.parse(fs.readFileSync(new URL('../config/tokenomics.json',import.meta.url),'utf8'));
const rows=JSON.parse(fs.readFileSync(recordsPath,'utf8'));
if(!Array.isArray(rows)||rows.length===0)throw Error('Nonempty array required');
const week=Number(weekText),base=BigInt(config.allocations.firstYearMinerRewards)*10n**BigInt(config.token.decimals);
const lower=base*BigInt(week-1)/52n,upper=base*BigInt(week)/52n,budget=upper-lower;
const ids=new Set(),miners=new Map();let total=0n;
for(const r of rows){
 if(!r||typeof r.workId!=='string'||!r.workId||ids.has(r.workId))throw Error('Missing/duplicate work ID');
 ids.add(r.workId);
 if(r.source!=='official_pool'||typeof r.minerId!=='string'||!r.minerId||typeof r.solanaAddress!=='string'||!r.solanaAddress||!/^[1-9][0-9]*$/.test(r.difficultyWeightedWork))throw Error('Only verified official-pool positive integer work supported');
 const work=BigInt(r.difficultyWeightedWork);
 const old=miners.get(r.minerId);
 if(old&&old.solanaAddress!==r.solanaAddress)throw Error('Conflicting recipient address');
 miners.set(r.minerId,{minerId:r.minerId,solanaAddress:r.solanaAddress,work:(old?.work??0n)+work});
 total+=work;
}
const allocations=[...miners.values()].sort((a,b)=>a.minerId.localeCompare(b.minerId)).map(m=>{
 const numerator=budget*m.work;return {...m,amount:numerator/total,remainder:numerator%total};
});
let dust=budget-allocations.reduce((s,p)=>s+p.amount,0n);
const ranked=[...allocations].sort((a,b)=>a.remainder===b.remainder?a.minerId.localeCompare(b.minerId):a.remainder>b.remainder?-1:1);
for(let i=0n;i<dust;i++)ranked[Number(i)].amount++;
const payouts=allocations.map(p=>({minerId:p.minerId,solanaAddress:p.solanaAddress,amountBaseUnits:p.amount.toString(),idempotencyKey:crypto.createHash('sha256').update(JSON.stringify(['mfrg-rewards-v1',week,p.minerId])).digest('hex')}));
if(payouts.reduce((s,p)=>s+BigInt(p.amountBaseUnits),0n)!==budget)throw Error('Payout conservation failed');
console.log(JSON.stringify({mode:'OFFLINE_PREVIEW_NO_PAYMENTS',week,budgetBaseUnits:budget.toString(),payouts,limitations:'Input must be independently verified; solo rewards require separate normalization and are not included. No wallet ownership verification or transfers.'},null,2));
