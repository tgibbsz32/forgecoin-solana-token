import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';import {createHash} from 'node:crypto';import {Connection,Keypair,TransactionMessage,VersionedTransaction} from '@solana/web3.js';
import {MintLayout,AccountLayout,createTransferCheckedInstruction,getAssociatedTokenAddressSync,TOKEN_2022_PROGRAM_ID} from '@solana/spl-token';
import {inspectApprovedDevnetPayout} from '../scripts/unified-payout-gate.mjs';
const payer=Keypair.generate(),recipient=Keypair.generate(),mint=Keypair.generate().publicKey,source=Keypair.generate().publicKey,dest=getAssociatedTokenAddressSync(mint,recipient.publicKey,true,TOKEN_2022_PROGRAM_ID);
const hash=Keypair.generate().publicKey.toBase58(),payoutKey='a'.repeat(64);
const ix=createTransferCheckedInstruction(source,mint,dest,payer.publicKey,42n,6,[],TOKEN_2022_PROGRAM_ID);
const tx=new VersionedTransaction(new TransactionMessage({payerKey:payer.publicKey,recentBlockhash:hash,instructions:[ix]}).compileToV0Message());tx.sign([payer]);
function info(data){return {owner:TOKEN_2022_PROGRAM_ID,data,executable:false,lamports:1000000}}
function accounts(){const m=Buffer.alloc(MintLayout.span);MintLayout.encode({mintAuthorityOption:1,mintAuthority:payer.publicKey,supply:42n,decimals:6,isInitialized:true,freezeAuthorityOption:0,freezeAuthority:payer.publicKey},m);
 const a=(owner,amount)=>{const b=Buffer.alloc(AccountLayout.span);AccountLayout.encode({mint,owner,amount,delegateOption:0,delegate:payer.publicKey,state:1,isNativeOption:0,isNative:0n,delegatedAmount:0n,closeAuthorityOption:0,closeAuthority:payer.publicKey},b);return info(b)};
 return [info(m),a(payer.publicKey,100n),a(recipient.publicKey,0n)]}
function connection({valid=true,balance=100n}={}){const c=Object.create(Connection.prototype);Object.defineProperty(c,'rpcEndpoint',{value:'https://api.devnet.solana.com'});c.isBlockhashValid=async()=>({value:valid});c.getMultipleAccountsInfo=async()=>{const a=accounts();if(balance!==100n){const b=Buffer.alloc(AccountLayout.span);AccountLayout.encode({mint,owner:payer.publicKey,amount:balance,delegateOption:0,delegate:payer.publicKey,state:1,isNativeOption:0,isNative:0n,delegatedAmount:0n,closeAuthorityOption:0,closeAuthority:payer.publicKey},b);a[1]=info(b)}return a};return c}
async function run({valid=true,balance=100n,badTransaction=false,badDigest=false,badSignature=false}={}){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mfrg-unified-'));const dbPath=path.join(dir,'db.sqlite');try{const db=new DatabaseSync(dbPath);
 db.exec("CREATE TABLE approved_payout_rows(week INTEGER,miner_id TEXT,recipient TEXT,amount_base_units TEXT,payout_key TEXT); CREATE TABLE approved_payout_batches(week INTEGER,ledger_digest TEXT); CREATE TABLE weekly_settlements(week INTEGER,ledger_digest TEXT,status TEXT); CREATE TABLE devnet_outbox(payout_key TEXT,transaction_base64 TEXT,message_digest TEXT,signature TEXT,status TEXT)");
 db.prepare('INSERT INTO approved_payout_rows VALUES(1,?,?,?,?)').run('miner',recipient.publicKey.toBase58(),'42',payoutKey);
 db.prepare('INSERT INTO approved_payout_batches VALUES(1,?)').run('b'.repeat(64));db.prepare("INSERT INTO weekly_settlements VALUES(1,?,'approved')").run('b'.repeat(64));
 const bytes=Buffer.from(tx.serialize());if(badTransaction)bytes[bytes.length-1]^=1;
 db.prepare("INSERT INTO devnet_outbox VALUES(?,?,?,?,'prepared')").run(payoutKey,bytes.toString('base64'),badDigest?'f'.repeat(64):createHash('sha256').update(bytes).digest('hex'),badSignature?Buffer.alloc(64).toString('base64'):Buffer.from(tx.signatures[0]).toString('base64'));db.close();
 return await inspectApprovedDevnetPayout({dbPath,payoutKey,expectedMint:mint.toBase58(),expectedSource:source.toBase58(),expectedAuthority:payer.publicKey.toBase58(),feePayer:payer.publicKey.toBase58(),connection:connection({valid,balance})});
 }finally{fs.rmSync(dir,{recursive:true,force:true})}}
test('positive path verifies approved payout, signature, instruction, ATA, accounts and blockhash',async()=>{const r=await run();assert.equal(r.status,'OFFLINE_VERIFIED_NO_BROADCAST');assert.equal(r.amountBaseUnits,'42')});
test('invalid devnet blockhash fails closed',async()=>await assert.rejects(run({valid:false}),/blockhash/));
test('insufficient source token balance fails closed',async()=>await assert.rejects(run({balance:1n}),/Insufficient/));
test('tampered signed transfer fails closed',async()=>await assert.rejects(run({badTransaction:true}),/signature|decode|deserialize|invalid|buffer|digest mismatch/i));

test('outbox digest tampering rejected',async()=>await assert.rejects(run({badDigest:true}),/digest mismatch/));
test('outbox signature tampering rejected',async()=>await assert.rejects(run({badSignature:true}),/signature mismatch/));
