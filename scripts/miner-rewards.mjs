import fs from 'node:fs';
const c=JSON.parse(fs.readFileSync(new URL('../config/tokenomics.json',import.meta.url)));
const input=process.argv[2];if(!input)throw Error('Usage: node scripts/miner-rewards.mjs <shares.json>');
const rows=JSON.parse(fs.readFileSync(input));
if(!Array.isArray(rows)||rows.length===0)throw Error('Expected nonempty array');
const unique=new Set();let shares=0n;
for(const row of rows){if(!row.minerId||!row.solanaAddress||!Number.isSafeInteger(row.acceptedShares)||row.acceptedShares<0||unique.has(row.minerId))throw Error('Invalid or duplicate miner row');unique.add(row.minerId);shares+=BigInt(row.acceptedShares)}
if(shares===0n)throw Error('No accepted shares');
// Preview only: shares here are assumed equal difficulty; production must use difficulty-weighted accepted work.
const monthly=BigInt(c.allocations.firstYearMinerRewards)*10n**BigInt(c.token.decimals)/12n;
const payouts=rows.map(r=>({minerId:r.minerId,solanaAddress:r.solanaAddress,baseUnits:(monthly*BigInt(r.acceptedShares)/shares).toString()}));
console.log(JSON.stringify({mode:'PREVIEW_ONLY_NO_TRANSFERS',monthBudgetBaseUnits:monthly.toString(),payouts,unallocatedDustBaseUnits:(monthly-payouts.reduce((s,r)=>s+BigInt(r.baseUnits),0n)).toString(),caveat:'Verify wallet ownership, use difficulty-weighted work, idempotent payout records and production controls before payments.'},null,2));
