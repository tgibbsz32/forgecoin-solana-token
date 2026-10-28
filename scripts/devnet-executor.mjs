import fs from 'node:fs';
import path from 'node:path';
import {Connection,PublicKey,clusterApiUrl} from '@solana/web3.js';
import {getAssociatedTokenAddressSync,getAccount,TOKEN_2022_PROGRAM_ID} from '@solana/spl-token';
const [command,mintText,ownersPath,journalPath]=process.argv.slice(2);
if(!['inspect','verify'].includes(command)||!mintText||!ownersPath||!journalPath)throw Error('Usage: node scripts/devnet-executor.mjs inspect|verify <mint> <owners.json> <journal.json>');
const mint=new PublicKey(mintText),owners=JSON.parse(fs.readFileSync(ownersPath,'utf8'));
const c=JSON.parse(fs.readFileSync(new URL('../config/tokenomics.json',import.meta.url),'utf8'));
const names=Object.keys(c.allocations).sort();
if(JSON.stringify(Object.keys(owners).sort())!==JSON.stringify(names))throw Error('Expected exactly five allocations');
const ownerKeys=names.map(n=>new PublicKey(owners[n]));
if(new Set(ownerKeys.map(x=>x.toBase58())).size!==5)throw Error('Distinct owners required');
const factor=10n**BigInt(c.token.decimals);
const plans=names.map((name,i)=>({name,owner:ownerKeys[i].toBase58(),ata:getAssociatedTokenAddressSync(mint,ownerKeys[i],true,TOKEN_2022_PROGRAM_ID).toBase58(),expected:(BigInt(c.allocations[name])*factor).toString()}));
const journal=JSON.parse(fs.readFileSync(journalPath,'utf8'));
if(!Array.isArray(journal))throw Error('Journal must be an array');
const seen=new Set();
for(const row of journal){
 if(typeof row.id!=='string'||seen.has(row.id)||!['planned','submitted','confirmed'].includes(row.status))throw Error('Duplicate or invalid journal record');
 seen.add(row.id);
}
if(command==='inspect'){
 console.log(JSON.stringify({mode:'LOCAL_INSPECTION_ONLY',plans,journalCount:journal.length,warning:'No signing, transfers, state writes or RPC calls.'},null,2));process.exit(0);
}
if(process.env.ENABLE_DEVNET_READONLY_VERIFY!=='I_UNDERSTAND_DEVNET_ONLY')throw Error('Set ENABLE_DEVNET_READONLY_VERIFY=I_UNDERSTAND_DEVNET_ONLY');
const conn=new Connection(clusterApiUrl('devnet'),'confirmed');
const observations=[];
for(const p of plans){
 let actual='0';let exists=false;
 try{const acc=await getAccount(conn,new PublicKey(p.ata),'confirmed',TOKEN_2022_PROGRAM_ID);if(acc.mint.toBase58()!==mint.toBase58()||acc.owner.toBase58()!==p.owner)throw Error('Token account mismatch');actual=acc.amount.toString();exists=true;}
 catch(e){if(e.name!=='TokenAccountNotFoundError')throw e}
 observations.push({...p,actual,exists,matches:p.expected===actual});
}
console.log(JSON.stringify({mode:'DEVNET_READ_ONLY',mint:mint.toBase58(),observations,allMatch:observations.every(p=>p.matches),warning:'Read-only observations; no transactions created, signed or submitted.'},null,2));
if(!observations.every(p=>p.matches))process.exitCode=2;
