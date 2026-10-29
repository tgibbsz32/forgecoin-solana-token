import {Connection} from '@solana/web3.js';
import {MINT_SIZE,ACCOUNT_SIZE} from '@solana/spl-token';
import {DEVNET_RPC,verifyDevnetIdentity} from './trusted-devnet-deployment.mjs';
// Read-only estimates; no signing, constructing or broadcasting transactions.
export async function estimateDevnetDeploymentCosts({connection=new Connection(DEVNET_RPC,'finalized')}={}){
 await verifyDevnetIdentity(connection);
 const [mintRent,treasuryRent,version]=await Promise.all([connection.getMinimumBalanceForRentExemption(MINT_SIZE,'finalized'),connection.getMinimumBalanceForRentExemption(ACCOUNT_SIZE,'finalized'),connection.getVersion()]);
 for(const n of [mintRent,treasuryRent])if(!Number.isSafeInteger(n)||n<=0)throw Error('Invalid devnet rent response');
 const sum=BigInt(mintRent)+BigInt(treasuryRent);
 return {status:'READ_ONLY_RENT_ESTIMATE_NO_TRANSACTION',cluster:'devnet',mintAccountBytes:MINT_SIZE,treasuryTokenAccountBytes:ACCOUNT_SIZE,mintRentLamports:String(mintRent),treasuryRentLamports:String(treasuryRent),totalRentLamports:sum.toString(),estimatedRentSol:Number(sum)/1e9,networkFeeLamports:null,networkFeeNote:'Fee not estimated: no reviewed transaction message or signer set. Actual fees and rent may differ.',solanaCoreVersion:version['solana-core']??null};
}
