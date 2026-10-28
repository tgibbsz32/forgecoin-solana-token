import {VersionedTransaction,TransactionMessage,PublicKey} from '@solana/web3.js';
import {TOKEN_2022_PROGRAM_ID,decodeTransferCheckedInstruction} from '@solana/spl-token';
export function validateSignedPayout({transactionBase64,expectedMint,expectedSource,expectedDestination,expectedAuthority,expectedAmountBaseUnits,expectedDecimals=6}){
 if(typeof transactionBase64!=='string'||!transactionBase64)throw Error('Missing signed transaction');
 const bytes=Buffer.from(transactionBase64,'base64');
 if(bytes.toString('base64')!==transactionBase64)throw Error('Noncanonical encoding');
 const tx=VersionedTransaction.deserialize(bytes);
 if(tx.version!==0)throw Error('Only v0 transactions supported');
 if(!tx.signatures.length||tx.signatures.some(s=>!s.some(v=>v!==0)))throw Error('Missing transaction signatures');
 if(tx.message.addressTableLookups.length)throw Error('Address lookup tables not permitted');
 const instructions=TransactionMessage.decompile(tx.message).instructions;
 if(instructions.length!==1)throw Error('Exactly one Token-2022 transfer instruction required');
 const ix=instructions[0];
 if(!ix.programId.equals(TOKEN_2022_PROGRAM_ID))throw Error('Wrong token program');
 const decoded=decodeTransferCheckedInstruction(ix,TOKEN_2022_PROGRAM_ID);
 const k=decoded.keys,d=decoded.data;
 for(const [name,actual,expected] of [['mint',k.mint.pubkey,expectedMint],['source',k.source.pubkey,expectedSource],['destination',k.destination.pubkey,expectedDestination],['authority',k.owner.pubkey,expectedAuthority]]){
  if(!actual.equals(new PublicKey(expected)))throw Error('Incorrect '+name);
 }
 if(k.multiSigners.length)throw Error('Multisigner transfer unsupported');
 if(d.amount!==BigInt(expectedAmountBaseUnits)||d.decimals!==expectedDecimals)throw Error('Incorrect amount or decimals');
 return {status:'STRUCTURE_CHECKED_SIGNATURE_CRYPTO_NOT_VERIFIED',mint:expectedMint,destination:expectedDestination,amountBaseUnits:String(d.amount)};
}
