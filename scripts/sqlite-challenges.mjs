import crypto from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {verifySolanaWalletProof} from './verify-wallet-proof.mjs';
// Node >=22.13; a single-host WAL prototype, not a multi-server enrollment service.
export class SqliteChallengeStore{
 constructor(filename,{clock=()=>Date.now(),ttlMs=600000}={}){
  this.db=new DatabaseSync(filename);this.clock=clock;this.ttlMs=ttlMs;
  this.db.exec("PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS challenges(challenge TEXT PRIMARY KEY,miner_id TEXT NOT NULL,solana_address TEXT NOT NULL,issued INTEGER NOT NULL,expires INTEGER NOT NULL,used INTEGER NOT NULL DEFAULT 0);");
 }
 issue({minerId,solanaAddress}){
  if(!minerId||!solanaAddress)throw Error('Required identity');
  const now=this.clock(),challenge=crypto.randomBytes(32).toString('hex');
  this.db.prepare('INSERT INTO challenges(challenge,miner_id,solana_address,issued,expires) VALUES(?,?,?,?,?)').run(challenge,minerId,solanaAddress,now,now+this.ttlMs);
  return {domain:'forgecoin-mfrg-rewards-v1',minerId,solanaAddress,challenge,issuedAt:new Date(now).toISOString(),expiresAt:new Date(now+this.ttlMs).toISOString()};
 }
 consume(proof){
  const now=this.clock();
  const result=this.db.prepare('UPDATE challenges SET used=1 WHERE challenge=? AND miner_id=? AND solana_address=? AND used=0 AND expires>=?').run(proof?.challenge,proof?.minerId,proof?.solanaAddress,now);
  if(result.changes!==1)throw Error('Challenge missing, expired, mismatched or consumed');
  // Consumption commits before verification: failed attempts burn nonce.
  return verifySolanaWalletProof(proof,{expectedChallenge:proof.challenge,now});
 }
 close(){this.db.close()}
}
