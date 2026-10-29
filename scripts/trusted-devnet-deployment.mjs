import {PublicKey,Connection} from '@solana/web3.js';
import {TOKEN_2022_PROGRAM_ID,getAssociatedTokenAddressSync} from '@solana/spl-token';
export const DEVNET_RPC='https://api.devnet.solana.com';
export const DEVNET_GENESIS='EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG';
export function validateDeploymentConfig(config){
 if(!config||config.network!=='devnet'||config.rpcUrl!==DEVNET_RPC||config.tokenProgram!==TOKEN_2022_PROGRAM_ID.toBase58())throw Error('Trusted devnet Token-2022 configuration required');
 if(config.decimals!==6||config.supplyBaseUnits!=='2000000000000')throw Error('Supply or decimal mismatch');
 const names=['mintAddress','mintAuthority','freezeAuthority','treasuryOwner'];
 const keys={};for(const name of names){if(typeof config[name]!=='string'||!config[name])throw Error('Missing '+name);keys[name]=new PublicKey(config[name]).toBase58()}
 if(new Set(Object.values(keys)).size!==4)throw Error('Use distinct mint, mint authority, freeze authority, and treasury owner');
 const treasuryAta=getAssociatedTokenAddressSync(new PublicKey(keys.mintAddress),new PublicKey(keys.treasuryOwner),true,TOKEN_2022_PROGRAM_ID).toBase58();
 if(config.treasuryAta!==treasuryAta)throw Error('Treasury ATA does not match mint and owner');
 return Object.freeze({status:'CONFIG_ONLY_NO_MINT',network:'devnet',mintAddress:keys.mintAddress,treasuryAta,decimals:6,supplyBaseUnits:config.supplyBaseUnits});
}
export async function verifyDevnetIdentity(connection){
 if(!(connection instanceof Connection)||connection.rpcEndpoint!==DEVNET_RPC)throw Error('Official devnet RPC required');
 const genesis=await connection.getGenesisHash();
 if(genesis!==DEVNET_GENESIS)throw Error('Solana genesis mismatch: wrong cluster');
 return {status:'DEVNET_IDENTITY_VERIFIED_READ_ONLY',genesisHash:genesis};
}
