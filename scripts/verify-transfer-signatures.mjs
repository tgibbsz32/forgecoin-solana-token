import nacl from 'tweetnacl';
import {VersionedTransaction,PublicKey} from '@solana/web3.js';
import {getAssociatedTokenAddressSync,TOKEN_2022_PROGRAM_ID} from '@solana/spl-token';
export function verifyTransactionSignatures(transactionBase64){
 const bytes=Buffer.from(transactionBase64,'base64');
 if(bytes.toString('base64')!==transactionBase64)throw Error('Noncanonical signed transaction');
 const tx=VersionedTransaction.deserialize(bytes);
 const header=tx.message.header,keys=tx.message.staticAccountKeys;
 if(tx.signatures.length!==header.numRequiredSignatures||header.numRequiredSignatures<1)throw Error('Signer count mismatch');
 const message=tx.message.serialize();
 for(let i=0;i<header.numRequiredSignatures;i++){
  const sig=tx.signatures[i],key=keys[i];
  if(!key||sig?.length!==64||!nacl.sign.detached.verify(message,sig,key.toBytes()))throw Error('Invalid transaction signature');
 }
 return {verified:true,signerKeys:keys.slice(0,header.numRequiredSignatures).map(k=>k.toBase58())};
}
export function verifyRecipientAta({recipientOwner,expectedMint,expectedDestination}){
 const owner=new PublicKey(recipientOwner),mint=new PublicKey(expectedMint),dest=new PublicKey(expectedDestination);
 const derived=getAssociatedTokenAddressSync(mint,owner,true,TOKEN_2022_PROGRAM_ID);
 if(!derived.equals(dest))throw Error('Recipient is not expected Token-2022 associated token address');
 return {recipientOwner:owner.toBase58(),destination:dest.toBase58(),addressDerived:true,chainStateVerified:false};
}
