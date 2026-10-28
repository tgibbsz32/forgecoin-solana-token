import {SqliteChallengeStore} from './sqlite-challenges.mjs';
import {verifyFrgAddressProof} from './verify-frg-address-proof.mjs';
import {verifySolanaWalletProof} from './verify-wallet-proof.mjs';
// One-host prototype. Both wallet proofs share a server-generated nonce and identity.
// The nonce is consumed before external verification; failures require a new challenge.
export class DualWalletRegistration{
 constructor(dbPath,opts={}){
  this.store=new SqliteChallengeStore(dbPath,opts);
  if(!this.store.db.prepare("PRAGMA table_info(challenges)").all().some(c=>c.name==='frg_address')) this.store.db.exec("ALTER TABLE challenges ADD COLUMN frg_address TEXT");
  this.store.db.exec("CREATE TABLE IF NOT EXISTS wallet_bindings(miner_id TEXT PRIMARY KEY,frg_address TEXT NOT NULL,solana_address TEXT NOT NULL,verified_at INTEGER NOT NULL,challenge TEXT UNIQUE NOT NULL)");
 }
 issue({minerId,frgAddress,solanaAddress}){
  if(typeof frgAddress!=='string'||!frgAddress)throw Error('Native FRG address required');
  const challenge=this.store.issue({minerId,solanaAddress});
  this.store.db.prepare('UPDATE challenges SET frg_address=? WHERE challenge=?').run(frgAddress,challenge.challenge);
  return {...challenge,frgAddress};
 }
 async register({frgProof,solanaProof,expected,verifyRpc}){
  if(!expected||!frgProof||!solanaProof||!expected.frgAddress)throw Error('Missing registration proofs');
  for(const key of ['minerId','solanaAddress','challenge']){
   if(expected[key]!==frgProof[key]||expected[key]!==solanaProof[key])throw Error('Registration identity mismatch');
  }
  if(frgProof.frgAddress!==expected.frgAddress)throw Error('FRG registration mismatch');
  const db=this.store.db;
  const record=db.prepare('SELECT * FROM challenges WHERE challenge=?').get(expected.challenge);
  if(!record||record.frg_address!==expected.frgAddress||record.miner_id!==expected.minerId||record.solana_address!==expected.solanaAddress)throw Error('Challenge not issued for these addresses');
  // The conditional UPDATE is atomic across concurrent SQLite connections.
  const consumed=db.prepare('UPDATE challenges SET used=1 WHERE challenge=? AND used=0 AND expires>=? AND miner_id=? AND solana_address=? AND frg_address=?').run(expected.challenge,this.store.clock(),expected.minerId,expected.solanaAddress,expected.frgAddress);
  if(consumed.changes!==1)throw Error('Challenge already used or expired');
  await verifyFrgAddressProof({proof:frgProof,expected,verifyRpc,now:this.store.clock()});
  verifySolanaWalletProof(solanaProof,{expectedChallenge:expected.challenge,now:this.store.clock()});
  const existing=db.prepare('SELECT * FROM wallet_bindings WHERE miner_id=?').get(expected.minerId);
  if(existing)throw Error('Existing miner binding requires separate authenticated rotation');
  db.prepare('INSERT INTO wallet_bindings(miner_id,frg_address,solana_address,verified_at,challenge) VALUES(?,?,?,?,?)').run(expected.minerId,expected.frgAddress,expected.solanaAddress,this.store.clock(),expected.challenge);
  return {minerId:expected.minerId,frgAddress:expected.frgAddress,solanaAddress:expected.solanaAddress,verified:true};
 }
 lookup(minerId){return this.store.db.prepare('SELECT miner_id AS minerId,frg_address AS frgAddress,solana_address AS solanaAddress,verified_at AS verifiedAt FROM wallet_bindings WHERE miner_id=?').get(minerId)??null}
 close(){this.store.close()}
}
