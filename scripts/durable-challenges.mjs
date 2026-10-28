import crypto from 'node:crypto';
import {verifySolanaWalletProof} from './verify-wallet-proof.mjs';
import {loadJournal,safeWriteJournal} from './journal-state.mjs';
// Single-process local development store. No cross-process locking; not suitable for production.
export class DurableChallengeStore{
 constructor(filename,{clock=()=>Date.now(),ttlMs=600000}={}){this.filename=filename;this.clock=clock;this.ttlMs=ttlMs}
 issue({minerId,solanaAddress}){
  if(!minerId||!solanaAddress)throw Error('Miner and address required');
  const issued=this.clock(),challenge=crypto.randomBytes(32).toString('hex');
  const record={id:challenge,status:'planned',minerId,solanaAddress,issued,expires:issued+this.ttlMs,used:false};
  const journal=loadJournal(this.filename);
  safeWriteJournal(this.filename,[...journal,record]);
  return {domain:'forgecoin-mfrg-rewards-v1',minerId,solanaAddress,challenge,issuedAt:new Date(issued).toISOString(),expiresAt:new Date(issued+this.ttlMs).toISOString()};
 }
 consume(proof){
  const journal=loadJournal(this.filename),record=journal.find(x=>x.id===proof?.challenge),now=this.clock();
  if(!record||record.used||now>record.expires||record.minerId!==proof.minerId||record.solanaAddress!==proof.solanaAddress)throw Error('Used, expired, mismatched, or nonexistent challenge');
  // Consume first, fail closed on invalid signature. Persistent across restarts.
  safeWriteJournal(this.filename,journal.map(x=>x.id===record.id?{...x,used:true}:x));
  return verifySolanaWalletProof(proof,{expectedChallenge:proof.challenge,now});
 }
}
