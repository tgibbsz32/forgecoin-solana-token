import {DatabaseSync} from 'node:sqlite';
export class PayoutIntentStore{
 constructor(filename){this.db=new DatabaseSync(filename);this.db.exec("PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS payout_intents(payout_key TEXT PRIMARY KEY,week INTEGER NOT NULL CHECK(week BETWEEN 1 AND 52),miner_id TEXT NOT NULL,solana_address TEXT NOT NULL,amount_base_units TEXT NOT NULL,status TEXT NOT NULL CHECK(status IN ('planned','submitted','confirmed','uncertain','failed')),signature TEXT,UNIQUE(week,miner_id));")}
 plan({payoutKey,week,minerId,solanaAddress,amountBaseUnits}){
  if(!/^[a-f0-9]{64}$/.test(payoutKey??'')||!Number.isInteger(week)||week<1||week>52||!minerId||!solanaAddress||! /^[0-9]+$/.test(amountBaseUnits??''))throw Error('Invalid payout intent');
  this.db.prepare("INSERT OR IGNORE INTO payout_intents(payout_key,week,miner_id,solana_address,amount_base_units,status) VALUES(?,?,?,?,?,'planned')").run(payoutKey,week,minerId,solanaAddress,amountBaseUnits);
  const existing=this.get(payoutKey);
  if(!existing||existing.week!==week||existing.minerId!==minerId||existing.solanaAddress!==solanaAddress||existing.amountBaseUnits!==amountBaseUnits)throw Error('Conflicting payout key or duplicated week/miner');
  return existing;
 }
 setSubmitted(payoutKey,signature){
  if(typeof signature!=='string'||!signature||signature.length>128)throw Error('Invalid transaction signature');
  const result=this.db.prepare("UPDATE payout_intents SET status='submitted',signature=? WHERE payout_key=? AND status='planned'").run(signature,payoutKey);
  if(result.changes!==1)throw Error('Cannot submit payout twice or from current state');
  return this.get(payoutKey);
 }
 reconcile(payoutKey,status,signature){
  if(!['confirmed','uncertain','failed'].includes(status))throw Error('Invalid reconciliation');
  const row=this.get(payoutKey);
  if(!row||row.status!=='submitted'&&row.status!=='uncertain'||row.signature!==signature)throw Error('Payout missing, signature mismatch or terminal state');
  if(row.status==='uncertain'&&status==='failed')throw Error('Do not mark uncertain transaction failed without stronger proof');
  this.db.prepare("UPDATE payout_intents SET status=? WHERE payout_key=?").run(status,payoutKey);
  return this.get(payoutKey);
 }
 get(payoutKey){const r=this.db.prepare('SELECT * FROM payout_intents WHERE payout_key=?').get(payoutKey);return r?{payoutKey:r.payout_key,week:r.week,minerId:r.miner_id,solanaAddress:r.solana_address,amountBaseUnits:r.amount_base_units,status:r.status,signature:r.signature}:null}
 close(){this.db.close()}
}
