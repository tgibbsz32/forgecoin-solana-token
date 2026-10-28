import crypto from 'node:crypto';
import {verifyEnvelope,canonical} from './verify-pool-export.mjs';
export function buildVerifiedWeeklyLedger({envelope,pinnedPoolPublicKey,week,lookupBinding,now=Date.now(),annualBaseUnits=175000000000n}){
 if(!Number.isInteger(week)||week<1||week>52)throw Error('Invalid week');
 if(typeof lookupBinding!=='function')throw Error('Trusted registration lookup required');
 const {payload,digest}=verifyEnvelope(envelope,pinnedPoolPublicKey,week,now);
 const budget=(annualBaseUnits*BigInt(week))/52n-(annualBaseUnits*BigInt(week-1))/52n;
 const work=new Map();let total=0n;
 for(const share of payload.work){
  if(typeof share.frgAddress!=='string'||!share.frgAddress)throw Error('Signed share must identify FRG address');
  const binding=lookupBinding(share.minerId);
  if(!binding||binding.frgAddress!==share.frgAddress||typeof binding.solanaAddress!=='string'||!binding.solanaAddress)throw Error('Signed work has no matching verified FRG/Solana registration');
  const units=BigInt(share.difficultyWeightedWork),old=work.get(share.minerId);
  if(old&&old.solanaAddress!==binding.solanaAddress)throw Error('Payout recipient changed within snapshot');
  work.set(share.minerId,{minerId:share.minerId,frgAddress:share.frgAddress,solanaAddress:binding.solanaAddress,units:(old?.units??0n)+units});
  total+=units;
 }
 if(total<=0n)throw Error('No eligible work');
 const rows=[...work.values()].map(w=>({...w,amount:budget*w.units/total,remainder:budget*w.units%total}));
 let remainder=budget-rows.reduce((s,r)=>s+r.amount,0n);
 rows.sort((a,b)=>a.remainder===b.remainder?a.minerId.localeCompare(b.minerId):a.remainder>b.remainder?-1:1);
 for(let i=0;i<Number(remainder);i++)rows[i].amount++;
 const payouts=rows.sort((a,b)=>a.minerId.localeCompare(b.minerId)).map(r=>({minerId:r.minerId,frgAddress:r.frgAddress,solanaAddress:r.solanaAddress,amountBaseUnits:r.amount.toString(),payoutKey:crypto.createHash('sha256').update(canonical({domain:'mfrg-weekly-ledger-v1',week,minerId:r.minerId})).digest('hex')}));
 const ledger={status:'OFFLINE_PREVIEW_NO_TRANSFERS',week,poolSnapshotDigest:digest,budgetBaseUnits:budget.toString(),payouts};
 const ledgerDigest=crypto.createHash('sha256').update(canonical(ledger)).digest('hex');
 return {...ledger,ledgerDigest};
}
