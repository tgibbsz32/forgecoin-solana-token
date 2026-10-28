import fs from 'node:fs';import crypto from 'node:crypto';
const [exportPath,registryPath,weekArg]=process.argv.slice(2);
if(!exportPath||!registryPath||!weekArg||!/^(?:[1-9]|[1-4][0-9]|5[0-2])$/.test(weekArg))throw Error('Usage: node scripts/pool-work-intake.mjs <pool-export.json> <verified-registry.json> <week-1..52>');
const exportData=JSON.parse(fs.readFileSync(exportPath,'utf8'));
const registry=JSON.parse(fs.readFileSync(registryPath,'utf8'));
if(exportData.schemaVersion!==1||exportData.week!==Number(weekArg)||exportData.source!=='forgecoin-official-pool'||!Array.isArray(exportData.work)||!Array.isArray(registry))throw Error('Invalid export or registration schema');
if(exportData.closed!==true||!exportData.periodStart||!exportData.periodEnd)throw Error('Mining period not formally closed');
const reg=new Map();for(const r of registry){if(!r.minerId||!r.solanaAddress||r.ownershipVerified!==true||reg.has(r.minerId))throw Error('Registry has unverified or duplicated recipient');reg.set(r.minerId,r)}
const seen=new Set(),output=[];
for(const w of exportData.work){
 if(typeof w.workId!=='string'||!w.workId||seen.has(w.workId)||!/^[1-9][0-9]*$/.test(w.difficultyWeightedWork??''))throw Error('Invalid or repeated work record');
 seen.add(w.workId);
 const r=reg.get(w.minerId);if(!r)throw Error('Missing verified wallet registration for '+w.minerId);
 output.push({workId:w.workId,source:'official_pool',minerId:w.minerId,solanaAddress:r.solanaAddress,difficultyWeightedWork:w.difficultyWeightedWork});
}
if(!output.length)throw Error('No eligible work');
output.sort((a,b)=>a.workId.localeCompare(b.workId));
const digest=crypto.createHash('sha256').update(JSON.stringify({week:Number(weekArg),periodStart:exportData.periodStart,periodEnd:exportData.periodEnd,work:output})).digest('hex');
console.log(JSON.stringify({mode:'UNTRUSTED_EXPORT_TRANSFORMATION_ONLY',week:Number(weekArg),digest,work:output,caveat:'Registry verified flag and export closure are assertions from files, NOT cryptographic proof or authenticated live pool data.'},null,2));
