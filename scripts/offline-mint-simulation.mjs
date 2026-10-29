import {createHash} from 'node:crypto';
import {createDeploymentReviewPacket} from './deployment-review-packet.mjs';
import {inspectOwnerReadiness} from './wallet-owner-readiness.mjs';
import {DEVNET_GENESIS,DEVNET_RPC} from './trusted-devnet-deployment.mjs';
import {TOKEN_2022_PROGRAM_ID} from '@solana/spl-token';
// Purely descriptive; no transaction construction, wallet access or network IO.
export function simulateMintDeployment(config){
 const packet=createDeploymentReviewPacket(config);
 const owner=inspectOwnerReadiness({...config,genesisHash:DEVNET_GENESIS,mintAuthorityCustody:config.mintAuthorityCustody??'encrypted-software-wallet',treasuryCustody:'owner-controlled',freezeAuthorityPolicy:config.freezePolicy});
 if(owner.status!=='OWNER_PUBLIC_ADDRESS_REVIEW_ONLY')throw Error('Public mint address required before simulation');
 const plan={network:'devnet',rpc:DEVNET_RPC,genesisHash:DEVNET_GENESIS,program:TOKEN_2022_PROGRAM_ID.toBase58(),mintAddress:packet.review.mintAddress,treasuryAta:packet.review.treasuryAta,authority:packet.review.mintAuthority,freezeAuthority:packet.review.freezeAuthority,decimals:packet.review.decimals,supplyBaseUnits:packet.review.supplyBaseUnits,reviewDigest:packet.reviewDigest,steps:[
  {order:1,operation:'owner review',requiresSignature:false},
  {order:2,operation:'create mint account and initialize Token-2022 mint',requiresSignature:true},
  {order:3,operation:'create treasury associated token account',requiresSignature:true},
  {order:4,operation:'mint approved allocation to owner treasury',requiresSignature:true},
  {order:5,operation:'verify supply, authorities and treasury balances',requiresSignature:false}
 ],permissions:'SIMULATION_ONLY_NO_SIGNING_NO_BROADCAST'};
 return {status:'OFFLINE_SIMULATION_ONLY',planDigest:createHash('sha256').update(JSON.stringify(plan)).digest('hex'),plan};
}
