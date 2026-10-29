import {Connection,PublicKey} from '@solana/web3.js';
import {TOKEN_2022_PROGRAM_ID,unpackMint,unpackAccount,getAssociatedTokenAddressSync} from '@solana/spl-token';
export async function verifyDevnetTokenAccounts({mintAddress,sourceAddress,destinationAddress,recipientOwner,expectedDecimals=6,expectedSourceOwner,connection}){
 const conn=connection??new Connection('https://api.devnet.solana.com','finalized');
 const mint=new PublicKey(mintAddress),source=new PublicKey(sourceAddress),dest=new PublicKey(destinationAddress),owner=new PublicKey(recipientOwner);
 const derived=getAssociatedTokenAddressSync(mint,owner,true,TOKEN_2022_PROGRAM_ID);
 if(!dest.equals(derived))throw Error('Destination does not match recipient Token-2022 ATA');
 const results=await conn.getMultipleAccountsInfo([mint,source,dest],'finalized');
 if(!Array.isArray(results)||results.length!==3||results.some(r=>!r))throw Error('Missing devnet mint or token account');
 const [mintInfo,sourceInfo,destInfo]=results;
 for(const info of results)if(!info.owner.equals(TOKEN_2022_PROGRAM_ID))throw Error('Unexpected account program owner');
 const mintState=unpackMint(mint,mintInfo,TOKEN_2022_PROGRAM_ID);
 if(mintState.decimals!==expectedDecimals)throw Error('Mint decimal mismatch');
 const sourceState=unpackAccount(source,sourceInfo,TOKEN_2022_PROGRAM_ID),destState=unpackAccount(dest,destInfo,TOKEN_2022_PROGRAM_ID);
 if(!sourceState.mint.equals(mint)||!destState.mint.equals(mint))throw Error('Token account mint mismatch');
 if(!destState.owner.equals(owner))throw Error('Recipient token account owner mismatch');
 if(expectedSourceOwner&&!sourceState.owner.equals(new PublicKey(expectedSourceOwner)))throw Error('Source token owner mismatch');
 if(sourceState.isFrozen||destState.isFrozen)throw Error('Frozen token account');
 return {status:'DEVNET_ACCOUNT_STATE_CHECKED',mint:mint.toBase58(),source:source.toBase58(),destination:dest.toBase58(),sourceBalanceBaseUnits:sourceState.amount.toString(),destinationBalanceBaseUnits:destState.amount.toString(),decimals:mintState.decimals};
}
