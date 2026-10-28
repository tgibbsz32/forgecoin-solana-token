import {DatabaseSync} from 'node:sqlite';
import {VersionedTransaction} from '@solana/web3.js';
import crypto from 'node:crypto';
export class DevnetTransactionOutbox{
 constructor(filename){this.db=new DatabaseSync(filename);this.db.exec("PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS devnet_outbox(payout_key TEXT PRIMARY KEY,transaction_base64 TEXT NOT NULL,signature TEXT NOT NULL UNIQUE,message_digest TEXT NOT NULL,status TEXT NOT NULL CHECK(status IN ('prepared','uncertain','confirmed','failed')),created_at TEXT NOT NULL);");}
 prepare({payoutKey,transactionBase64,signature}){
  if(!/^[a-f0-9]{64}$/.test(payoutKey??'')||typeof transactionBase64!=='string'||!transactionBase64||typeof signature!=='string'||!signature)throw Error('Invalid prepared transaction');
  const bytes=Buffer.from(transactionBase64,'base64');
  if(bytes.length===0||bytes.toString('base64')!==transactionBase64)throw Error('Invalid encoded transaction');
  const transaction=VersionedTransaction.deserialize(bytes);
  const actual=transaction.signatures[0];
  if(!actual||!actual.some(v=>v!==0)||Buffer.from(actual).toString('base64')!==signature)throw Error('Signature does not match signed transaction');
  const messageDigest=crypto.createHash('sha256').update(bytes).digest('hex');
  this.db.prepare("INSERT OR IGNORE INTO devnet_outbox(payout_key,transaction_base64,signature,message_digest,status,created_at) VALUES(?,?,?,?,'prepared',?)").run(payoutKey,transactionBase64,signature,messageDigest,new Date().toISOString());
  const row=this.get(payoutKey);
  if(!row||row.signature!==signature||row.messageDigest!==messageDigest)throw Error('Conflicting prepared transaction');
  return row;
 }
 markUncertain(key){const r=this.db.prepare("UPDATE devnet_outbox SET status='uncertain' WHERE payout_key=? AND status='prepared'").run(key);if(r.changes!==1)throw Error('Outbox is not prepared');return this.get(key)}
 reconcile(key,status){if(!['confirmed','failed'].includes(status))throw Error('Invalid finality status');const r=this.db.prepare("UPDATE devnet_outbox SET status=? WHERE payout_key=? AND status='uncertain'").run(status,key);if(r.changes!==1)throw Error('Outbox is not uncertain');return this.get(key)}
 get(key){const r=this.db.prepare('SELECT * FROM devnet_outbox WHERE payout_key=?').get(key);return r?{payoutKey:r.payout_key,signature:r.signature,messageDigest:r.message_digest,status:r.status,transactionBase64:r.transaction_base64}:null}
 close(){this.db.close()}
}
