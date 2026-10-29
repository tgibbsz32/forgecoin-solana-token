import test from 'node:test';import assert from 'node:assert/strict';
import {Keypair} from '@solana/web3.js';
import {MintLayout,AccountLayout,TOKEN_2022_PROGRAM_ID,getAssociatedTokenAddressSync} from '@solana/spl-token';
import {verifyDevnetTokenAccounts} from '../scripts/verify-devnet-token-accounts.mjs';
const mint=Keypair.generate().publicKey,source=Keypair.generate().publicKey,recipient=Keypair.generate().publicKey,sourceOwner=Keypair.generate().publicKey,dest=getAssociatedTokenAddressSync(mint,recipient,true,TOKEN_2022_PROGRAM_ID);
function info(data,owner=TOKEN_2022_PROGRAM_ID){return {data,owner,executable:false,lamports:1000000}}
function fixture(){const m=Buffer.alloc(MintLayout.span);MintLayout.encode({mintAuthorityOption:1,mintAuthority:sourceOwner,supply:0n,decimals:6,isInitialized:true,freezeAuthorityOption:0,freezeAuthority:sourceOwner},m);function account(keyOwner,amount){const b=Buffer.alloc(AccountLayout.span);AccountLayout.encode({mint,owner:keyOwner,amount,delegateOption:0,delegate:sourceOwner,state:1,isNativeOption:0,isNative:0n,delegatedAmount:0n,closeAuthorityOption:0,closeAuthority:sourceOwner},b);return info(b)}return [info(m),account(sourceOwner,100n),account(recipient,0n)]}
const args={mintAddress:mint.toBase58(),sourceAddress:source.toBase58(),destinationAddress:dest.toBase58(),recipientOwner:recipient.toBase58(),expectedSourceOwner:sourceOwner.toBase58()};
test('accepts mint and both correct devnet token account states',async()=>{const r=await verifyDevnetTokenAccounts({...args,connection:{getMultipleAccountsInfo:async()=>fixture()}});assert.equal(r.sourceBalanceBaseUnits,'100')});
test('rejects missing destination account',async()=>await assert.rejects(verifyDevnetTokenAccounts({...args,connection:{getMultipleAccountsInfo:async()=>[...fixture().slice(0,2),null]}}),/Missing/));
test('rejects wrong account program',async()=>{const f=fixture();f[2].owner=Keypair.generate().publicKey;await assert.rejects(verifyDevnetTokenAccounts({...args,connection:{getMultipleAccountsInfo:async()=>f}}),/program owner/)});
test('rejects wrong ATA recipient',async()=>await assert.rejects(verifyDevnetTokenAccounts({...args,destinationAddress:Keypair.generate().publicKey.toBase58(),connection:{getMultipleAccountsInfo:async()=>fixture()}}),/ATA/));
