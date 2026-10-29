import {PublicKey} from '@solana/web3.js';
import {getAssociatedTokenAddressSync,TOKEN_2022_PROGRAM_ID} from '@solana/spl-token';
import {DEVNET_RPC,DEVNET_GENESIS} from './trusted-devnet-deployment.mjs';
const required=['mintAuthority','treasuryOwner','freezeAuthority'];
export function inspectOwnerReadiness(config){
 if(!config||config.network!=='devnet'||config.rpcUrl!==DEVNET_RPC||config.genesisHash!==DEVNET_GENESIS)throw Error('Devnet-only policy required');
 if(!['hardware-or-owner-controlled','encrypted-software-wallet'].includes(config.mintAuthorityCustody)||config.treasuryCustody!=='owner-controlled')throw Error('Explicit owner custody plan required');
 if(config.freezeAuthorityPolicy!=='retain-until-reviewed')throw Error('Freeze authority policy not reviewed');
 const keys={};
 for(const key of required){if(!config[key]||typeof config[key]!=='string')throw Error('Missing '+key);keys[key]=new PublicKey(config[key]).toBase58()}
 if(new Set(Object.values(keys)).size!==required.length)throw Error('Separate authority and treasury addresses required');
 if(config.secretKey||config.seedPhrase||config.privateKey||config.mnemonic)throw Error('Private wallet material must not be supplied');
 if(config.mintAddress!=null){const mint=new PublicKey(config.mintAddress);if(keys.mintAuthority===mint.toBase58())throw Error('Mint cannot equal mint authority');return {status:'OWNER_PUBLIC_ADDRESS_REVIEW_ONLY',mintAddress:mint.toBase58(),treasuryAta:getAssociatedTokenAddressSync(mint,new PublicKey(keys.treasuryOwner),true,TOKEN_2022_PROGRAM_ID).toBase58(),mintAuthority:keys.mintAuthority,freezeAuthority:keys.freezeAuthority,treasuryOwner:keys.treasuryOwner}}
 return {status:'PUBLIC_ADDRESSES_READY_MINT_ADDRESS_PENDING',...keys};
}
