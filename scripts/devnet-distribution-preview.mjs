import fs from 'node:fs';
import crypto from 'node:crypto';
import {PublicKey} from '@solana/web3.js';
import {getAssociatedTokenAddressSync,TOKEN_2022_PROGRAM_ID} from '@solana/spl-token';
const [mintInput,ownersFile,journalFile]=process.argv.slice(2);
if(!mintInput||!ownersFile||!journalFile)throw Error('Usage: node scripts/devnet-distribution-preview.mjs <mint> <owners.json> <journal.json>');
const mint=new PublicKey(mintInput);
const owners=JSON.parse(fs.readFileSync(ownersFile,'utf8'));
const journal=JSON.parse(fs.readFileSync(journalFile,'utf8'));
const config=JSON.parse(fs.readFileSync(new URL('../config/tokenomics.json',import.meta.url),'utf8'));
const names=Object.keys(config.allocations).sort();
if(JSON.stringify(Object.keys(owners).sort())!==JSON.stringify(names))throw Error('Unexpected allocation names');
if(!Array.isArray(journal))throw Error('Journal must be an array');
const distinct=new Set();
const factor=10n**BigInt(config.token.decimals);
const plans=[];
const journalKeys=new Set();
for(const item of journal){
 if(typeof item.id!=='string'||journalKeys.has(item.id)||!['planned','submitted','confirmed'].includes(item.status))throw Error('Invalid or duplicate journal entry');
 journalKeys.add(item.id);
}
for(const name of names){
 const owner=new PublicKey(owners[name]);
 if(owner.toBase58()!==owners[name])throw Error('Noncanonical owner '+name);
 if(distinct.has(owner.toBase58()))throw Error('Duplicate allocation owner');
 distinct.add(owner.toBase58());
 const ata=getAssociatedTokenAddressSync(mint,owner,true,TOKEN_2022_PROGRAM_ID);
 const amount=(BigInt(config.allocations[name])*factor).toString();
 const id=crypto.createHash('sha256').update(JSON.stringify(['mfrg-devnet-v1',mint.toBase58(),name,owner.toBase58(),amount])).digest('hex');
 const existing=journal.find(x=>x.id===id);
 if(existing&& (existing.allocation!==name||existing.owner!==owner.toBase58()||existing.amountBaseUnits!==amount))throw Error('Conflicting recorded allocation '+name);
 plans.push({allocation:name,owner:owner.toBase58(),associatedTokenAccount:ata.toBase58(),amountBaseUnits:amount,id,status:existing?.status??'not-started'});
}
if(journal.some(x=>!plans.some(p=>p.id===x.id)))throw Error('Journal has entries not in current plan');
const total=plans.reduce((s,p)=>s+BigInt(p.amountBaseUnits),0n);
if(total!==BigInt(config.token.maxSupply)*factor)throw Error('Supply mismatch');
console.log(JSON.stringify({mode:'READ_ONLY_TRANSACTION_PREVIEW',network:'devnet',mint:mint.toBase58(),totalBaseUnits:total.toString(),plans,warning:'No signing or RPC. Confirmed journal entries are not independently verified on-chain. Never treat preview as proof of funds.'},null,2));
