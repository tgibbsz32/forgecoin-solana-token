import fs from 'node:fs';import crypto from 'node:crypto';
export function canonical(v){if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';if(v&&typeof v==='object')return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';if(typeof v==='number'&&!Number.isSafeInteger(v))throw Error('Unsafe numeric value');return JSON.stringify(v)}
export function verifyEnvelope(envelope,pinnedKey,expectedWeek,now=Date.now()){
 if(!envelope||envelope.schemaVersion!==1||envelope.domain!=='forgecoin-mfrg-pool-work-v1'||!envelope.payload||typeof envelope.signatureBase64!=='string')throw Error('Invalid signed envelope');
 const p=envelope.payload;
 if(p.schemaVersion!==1||p.source!=='forgecoin-official-pool'||p.closed!==true||p.week!==expectedWeek||!Array.isArray(p.work)||!p.work.length)throw Error('Invalid pool payload');
 const start=Date.parse(p.periodStart),end=Date.parse(p.periodEnd),issued=Date.parse(envelope.issuedAt);
 if(!Number.isFinite(start)||!Number.isFinite(end)||start>=end||!Number.isFinite(issued)||issued<end||issued>now+300000)throw Error('Invalid period or signing time');
 const message=Buffer.from(canonical({domain:envelope.domain,issuedAt:envelope.issuedAt,payload:p}));
 const signature=Buffer.from(envelope.signatureBase64,'base64');
 if(signature.length!==64||!crypto.verify(null,message,crypto.createPublicKey(pinnedKey),signature))throw Error('Signature verification failed');
 const seen=new Set();for(const r of p.work){if(typeof r.workId!=='string'||!r.workId||seen.has(r.workId)||typeof r.minerId!=='string'||!r.minerId||typeof r.difficultyWeightedWork!=='string'||!/^[1-9][0-9]*$/.test(r.difficultyWeightedWork))throw Error('Invalid or duplicated work');seen.add(r.workId)}
 return {payload:p,digest:crypto.createHash('sha256').update(message).digest('hex')};
}
if(process.argv[1]&&import.meta.url===new URL('file://'+process.argv[1].replaceAll('\\','/')).href){
 const [envelopeFile,pinnedKeyFile,weekArg]=process.argv.slice(2);
 if(!envelopeFile||!pinnedKeyFile||!/^(?:[1-9]|[1-4][0-9]|5[0-2])$/.test(weekArg??''))throw Error('Usage: node scripts/verify-pool-export.mjs <signed-export.json> <trusted-public-key.pem> <week>');
 const result=verifyEnvelope(JSON.parse(fs.readFileSync(envelopeFile,'utf8')),fs.readFileSync(pinnedKeyFile,'utf8'),Number(weekArg));
 console.log(JSON.stringify({status:'SIGNATURE_VERIFIED',digest:result.digest,week:result.payload.week,workCount:result.payload.work.length,warning:'Pool signing key must be independently pinned and access-controlled; wallet ownership and chain work are separate checks.'},null,2));
}
