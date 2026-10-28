import crypto from 'node:crypto';
import {verifySolanaWalletProof} from './verify-wallet-proof.mjs';
// In-memory, single-process demonstrator. Production must use transactional database CAS.
export class ChallengeStore {
 constructor({clock=()=>Date.now(),ttlMs=10*60*1000}={}){this.clock=clock;this.ttlMs=ttlMs;this.rows=new Map()}
 issue({minerId,solanaAddress}){
  if(!minerId||!solanaAddress)throw Error('Miner and recipient required');
  const issued=this.clock(),challenge=crypto.randomBytes(32).toString('hex');
  this.rows.set(challenge,{minerId,solanaAddress,issued,expires:issued+this.ttlMs,used:false});
  return {domain:'forgecoin-mfrg-rewards-v1',minerId,solanaAddress,challenge,issuedAt:new Date(issued).toISOString(),expiresAt:new Date(issued+this.ttlMs).toISOString()};
 }
 consume(proof){
  const row=this.rows.get(proof?.challenge),now=this.clock();
  if(!row||row.used||now>row.expires||row.minerId!==proof.minerId||row.solanaAddress!==proof.solanaAddress)throw Error('Unknown, used, expired or mismatched challenge');
  // Claim before signature validation: invalid attempt burns challenge, preventing brute-force/replay.
  row.used=true;
  return verifySolanaWalletProof(proof,{expectedChallenge:proof.challenge,now});
 }
}
