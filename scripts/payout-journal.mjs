import fs from 'node:fs';
import crypto from 'node:crypto';
const [command,inputPath,journalPath]=process.argv.slice(2);
if(command!=='preview'||!inputPath||!journalPath)throw Error('Usage: node scripts/payout-journal.mjs preview <payouts.json> <journal.json>');
const input=JSON.parse(fs.readFileSync(inputPath,'utf8'));
const journal=JSON.parse(fs.readFileSync(journalPath,'utf8'));
if(!Array.isArray(input)||!Array.isArray(journal))throw Error('Input and journal must be arrays');
const used=new Set();const previously=new Set();
for(const row of journal){if(!row.idempotencyKey||previously.has(row.idempotencyKey))throw Error('Duplicate or missing journal key');previously.add(row.idempotencyKey)}
const staged=[];const skipped=[];
for(const row of input){
 if(!/^[a-zA-Z0-9_-]{1,100}$/.test(row.periodId??'')||!/^[a-zA-Z0-9_-]{1,100}$/.test(row.minerId??'')||!/^[0-9]+$/.test(row.amountBaseUnits??'')||BigInt(row.amountBaseUnits)<=0n||!row.solanaAddress)throw Error('Invalid payout');
 const key=crypto.createHash('sha256').update(JSON.stringify([row.periodId,row.minerId])).digest('hex');
 if(used.has(key))throw Error('Duplicate payout within the period');used.add(key);
 const existing=journal.find(x=>x.idempotencyKey===key);
 if(existing){if(existing.solanaAddress!==row.solanaAddress||existing.amountBaseUnits!==row.amountBaseUnits)throw Error('Replay with changed recipient or amount');skipped.push(key);continue}
 staged.push({...row,idempotencyKey:key,status:'planned'});
}
console.log(JSON.stringify({mode:'OFFLINE_PREVIEW_ONLY',staged,skipped,warning:'The journal is read-only in preview mode; an authorized backend must atomically persist and reconcile transfers.'},null,2));
