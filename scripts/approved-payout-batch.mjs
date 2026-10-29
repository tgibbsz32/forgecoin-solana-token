import {DatabaseSync} from 'node:sqlite';
import {createHash} from 'node:crypto';
import {canonical} from './verify-pool-export.mjs';
export class ApprovedPayoutBatch {
 constructor(filename){this.db=new DatabaseSync(filename);this.db.exec("PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS approved_payout_batches(week INTEGER PRIMARY KEY,ledger_digest TEXT NOT NULL,batch_digest TEXT NOT NULL UNIQUE,created_at TEXT NOT NULL); CREATE TABLE IF NOT EXISTS approved_payout_rows(week INTEGER NOT NULL,miner_id TEXT NOT NULL,recipient TEXT NOT NULL,amount_base_units TEXT NOT NULL,payout_key TEXT NOT NULL UNIQUE,PRIMARY KEY(week,miner_id),FOREIGN KEY(week) REFERENCES approved_payout_batches(week));")}
 plan(ledger,{now=new Date().toISOString()}={}){
  if(!ledger||ledger.status!=='OFFLINE_PREVIEW_NO_TRANSFERS'||!Number.isInteger(ledger.week)||!Array.isArray(ledger.payouts)||ledger.payouts.length===0||!/^[a-f0-9]{64}$/.test(ledger.ledgerDigest??''))throw Error('Malformed ledger');
  const {ledgerDigest,...unsigned}=ledger;
  const recomputed=createHash('sha256').update(canonical(unsigned)).digest('hex');
  if(recomputed!==ledgerDigest)throw Error('Ledger digest mismatch');
  const week=ledger.week,settlement=this.db.prepare("SELECT ledger_digest,budget_base_units,status FROM weekly_settlements WHERE week=?").get(week);
  if(!settlement||settlement.status!=='approved'||settlement.ledger_digest!==ledgerDigest)throw Error('Matching approved settlement required');
  let sum=0n;const seen=new Set(),keys=new Set();
  for(const p of ledger.payouts){
   if(typeof p.minerId!=='string'||!p.minerId||typeof p.solanaAddress!=='string'||!p.solanaAddress||!/^[0-9]+$/.test(p.amountBaseUnits??'')||!/^[a-f0-9]{64}$/.test(p.payoutKey??'')||seen.has(p.minerId)||keys.has(p.payoutKey))throw Error('Invalid or duplicate payout');
   seen.add(p.minerId);keys.add(p.payoutKey);sum+=BigInt(p.amountBaseUnits);
  }
  if(sum!==BigInt(settlement.budget_base_units)||sum!==BigInt(ledger.budgetBaseUnits))throw Error('Payout conservation mismatch');
  const batchDigest=createHash('sha256').update(canonical({week,ledgerDigest,payouts:ledger.payouts})).digest('hex');
  this.db.exec('CREATE TABLE IF NOT EXISTS batch_payloads(week INTEGER PRIMARY KEY,canonical_payload TEXT NOT NULL)');
  this.db.exec('BEGIN IMMEDIATE');
  try{
   const existing=this.db.prepare('SELECT * FROM approved_payout_batches WHERE week=?').get(week);
   if(existing){if(existing.ledger_digest!==ledgerDigest||existing.batch_digest!==batchDigest)throw Error('Conflicting previously planned payout batch');this.db.exec('COMMIT');return {inserted:false,week,batchDigest};}
   this.db.prepare('INSERT INTO approved_payout_batches VALUES(?,?,?,?)').run(week,ledgerDigest,batchDigest,now);
   this.db.prepare('INSERT INTO batch_payloads VALUES(?,?)').run(week,canonical({week,ledgerDigest,payouts:ledger.payouts}));
   const insert=this.db.prepare('INSERT INTO approved_payout_rows VALUES(?,?,?,?,?)');
   for(const p of ledger.payouts)insert.run(week,p.minerId,p.solanaAddress,p.amountBaseUnits,p.payoutKey);
   this.db.exec('COMMIT');return {inserted:true,week,batchDigest};
  }catch(e){this.db.exec('ROLLBACK');throw e}
 }
 close(){this.db.close()}
}
