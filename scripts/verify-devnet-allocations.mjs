import fs from 'node:fs';
import {Connection,PublicKey,clusterApiUrl} from '@solana/web3.js';
import {TOKEN_2022_PROGRAM_ID,getAssociatedTokenAddressSync,getAccount,getMint} from '@solana/spl-token';
const [mintStr,mappingPath]=process.argv.slice(2);
if(!mintStr||!mappingPath)throw Error('Usage: node scripts/verify-devnet-allocations.mjs <mint> <five-wallets.json>');
const c=JSON.parse(fs.readFileSync(new URL('../config/tokenomics.json',import.meta.url)));
const owners=JSON.parse(fs.readFileSync(mappingPath,'utf8'));
const keys=Object.keys(c.allocations).sort();
if(JSON.stringify(Object.keys(owners).sort())!==JSON.stringify(keys))throw Error('Expected exact five allocation owners');
const parseKey=s=>{const k=new PublicKey(s);if(k.toBase58()!==s)throw Error('Noncanonical public key');return k};
const ownerKeys=keys.map(k=>parseKey(owners[k]));
if(new Set(ownerKeys.map(k=>k.toBase58())).size!==keys.length)throw Error('Owners must be distinct');
const mint=parseKey(mintStr);
const conn=new Connection(clusterApiUrl('devnet'),'confirmed');
const mintState=await getMint(conn,mint,'confirmed',TOKEN_2022_PROGRAM_ID);
if(mintState.decimals!==c.token.decimals)throw Error('Mint decimals mismatch');
const factor=10n**BigInt(c.token.decimals);
const expectedSupply=BigInt(c.token.maxSupply)*factor;
if(mintState.supply!==expectedSupply)throw Error('Mint supply mismatch');
const accounts=[];
for(let i=0;i<keys.length;i++){
 const ata=getAssociatedTokenAddressSync(mint,ownerKeys[i],true,TOKEN_2022_PROGRAM_ID);
 const state=await getAccount(conn,ata,'confirmed',TOKEN_2022_PROGRAM_ID);
 const expected=BigInt(c.allocations[keys[i]])*factor;
 if(!state.mint.equals(mint)||!state.owner.equals(ownerKeys[i])||state.amount!==expected)throw Error('Allocation mismatch: '+keys[i]);
 accounts.push({allocation:keys[i],owner:ownerKeys[i].toBase58(),ata:ata.toBase58(),balanceBaseUnits:state.amount.toString()});
}
console.log(JSON.stringify({network:'devnet',mode:'READ_ONLY_VERIFICATION',mint:mint.toBase58(),supplyBaseUnits:mintState.supply.toString(),allocations:accounts,verified:true},null,2));
