import {DatabaseSync} from 'node:sqlite';
import {createHash} from 'node:crypto';
import {canonical} from './verify-pool-export.mjs';
export function verifyPayoutLineage(dbPath,week){
 const db=new DatabaseSync(dbPath,{readOnly:true});
 try{
  const batch=db.prepare('SELECT * FROM approved_payout_batches WHERE week=?').get(week);
  const settlement=db.prepare('SELECT * FROM weekly_settlements WHERE week=?').get(week);
  const saved=db.prepare('SELECT canonical_payload FROM batch_payloads WHERE week=?').get(week);
  if(!batch||!settlement||!saved||settlement.status!=='approved'||batch.ledger_digest!==settlement.ledger_digest)throw Error('No matching approved lineage');
  const payload=JSON.parse(saved.canonical_payload);
  if(canonical(payload)!==saved.canonical_payload||payload.week!==week||payload.ledgerDigest!==batch.ledger_digest)throw Error('Noncanonical or mismatched lineage');
  if(createHash('sha256').update(saved.canonical_payload).digest('hex')!==batch.batch_digest)throw Error('Batch digest mismatch');
  if(!Array.isArray(payload.payouts)||payload.payouts.length===0)throw Error('Missing payout rows');
  const rows=db.prepare('SELECT miner_id,recipient,amount_base_units,payout_key FROM approved_payout_rows WHERE week=?').all(week);
  if(rows.length!==payload.payouts.length)throw Error('Payout row count mismatch');
  const map=new Map(rows.map(r=>[r.miner_id,r]));
  if(map.size!==rows.length)throw Error('Duplicate stored miner');
  let total=0n;
  for(const p of payload.payouts){
   const r=map.get(p.minerId);
   if(!r||r.recipient!==p.solanaAddress||r.amount_base_units!==p.amountBaseUnits||r.payout_key!==p.payoutKey)throw Error('Payout row differs from approved batch');
   if(!/^[0-9]+$/.test(p.amountBaseUnits))throw Error('Invalid payout amount');
   total+=BigInt(p.amountBaseUnits);
  }
  if(total!==BigInt(settlement.budget_base_units))throw Error('Approved payout conservation mismatch');
  return {status:'LINEAGE_VERIFIED_READ_ONLY',week,batchDigest:batch.batch_digest,ledgerDigest:batch.ledger_digest,payoutCount:rows.length};
 }finally{db.close()}
}
