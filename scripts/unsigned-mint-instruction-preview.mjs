import {PublicKey,SystemProgram} from '@solana/web3.js';
import {TOKEN_2022_PROGRAM_ID,MINT_SIZE,createInitializeMint2Instruction,createAssociatedTokenAccountInstruction,createMintToCheckedInstruction,getAssociatedTokenAddressSync} from '@solana/spl-token';
import {createDeploymentReviewPacket} from './deployment-review-packet.mjs';
import {inspectOwnerReadiness} from './wallet-owner-readiness.mjs';
import {DEVNET_GENESIS} from './trusted-devnet-deployment.mjs';
// This returns a description of unsigned instructions. It cannot send or sign.
export function previewUnsignedMintInstructions(config,{mintRentLamports}={}){
 const review=createDeploymentReviewPacket(config);
 const custody=inspectOwnerReadiness({...config,genesisHash:DEVNET_GENESIS,mintAuthorityCustody:config.mintAuthorityCustody,treasuryCustody:config.treasuryCustody,freezeAuthorityPolicy:config.freezePolicy});
 if(custody.status!=='OWNER_PUBLIC_ADDRESS_REVIEW_ONLY')throw Error('Mint public address required');
 if(!Number.isSafeInteger(mintRentLamports)||mintRentLamports<=0)throw Error('Trusted devnet mint rent quote required');
 const mint=new PublicKey(config.mintAddress),payer=new PublicKey(config.feePayer),mintAuthority=new PublicKey(config.mintAuthority),treasuryOwner=new PublicKey(config.treasuryOwner);
 const freeze=new PublicKey(config.freezeAuthority),treasuryAta=getAssociatedTokenAddressSync(mint,treasuryOwner,true,TOKEN_2022_PROGRAM_ID);
 const instructions=[
  SystemProgram.createAccount({fromPubkey:payer,newAccountPubkey:mint,lamports:mintRentLamports,space:MINT_SIZE,programId:TOKEN_2022_PROGRAM_ID}),
  createInitializeMint2Instruction(mint,6,mintAuthority,freeze,TOKEN_2022_PROGRAM_ID),
  createAssociatedTokenAccountInstruction(payer,treasuryAta,treasuryOwner,mint,TOKEN_2022_PROGRAM_ID),
  createMintToCheckedInstruction(mint,treasuryAta,mintAuthority,2000000000000n,6,[],TOKEN_2022_PROGRAM_ID)
 ];
 const describe=ix=>({programId:ix.programId.toBase58(),keys:ix.keys.map(k=>({address:k.pubkey.toBase58(),signer:k.isSigner,writable:k.isWritable})),dataHex:Buffer.from(ix.data).toString('hex')});
 return {status:'UNSIGNED_INSTRUCTION_PREVIEW_NOT_AUTHORIZATION',network:'devnet',reviewDigest:review.reviewDigest,mintAddress:mint.toBase58(),feePayer:payer.toBase58(),requiredSigners:[...new Set(instructions.flatMap(ix=>ix.keys.filter(k=>k.isSigner).map(k=>k.pubkey.toBase58())))],instructions:instructions.map(describe),note:'No recent blockhash or serialized transaction; no signer, fee estimate, network broadcast or mint execution.'};
}
