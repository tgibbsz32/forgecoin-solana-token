import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {validateDeploymentConfig,DEVNET_GENESIS} from './trusted-devnet-deployment.mjs';
const ALLOCATIONS=Object.freeze({initialSale:1000000,yearOneMinerRewards:175000,futureMinerCommunity:375000,ecosystemApps:250000,developmentReserve:200000});
export function createDeploymentReviewPacket(config){
 const valid=validateDeploymentConfig(config);
 if(config.freezePolicy!=='retain-until-reviewed')throw Error('Freeze authority policy requires explicit review');
 if(config.mintAuthorityPolicy!=='owner-controlled')throw Error('Mint authority must be owner-controlled');
 if(config.extensionsPolicy!=='none-proposed')throw Error('Token-2022 extensions need separate explicit review');
 const allocations=Object.entries(ALLOCATIONS).map(([name,tokens])=>({name,tokens,baseUnits:String(BigInt(tokens)*1000000n)}));
 if(allocations.reduce((sum,item)=>sum+BigInt(item.baseUnits),0n)!==BigInt(valid.supplyBaseUnits))throw Error('Allocation conservation mismatch');
 const review={network:'devnet',expectedGenesisHash:DEVNET_GENESIS,tokenProgram:config.tokenProgram,mintAddress:valid.mintAddress,mintAuthority:config.mintAuthority,freezeAuthority:config.freezeAuthority,treasuryOwner:config.treasuryOwner,treasuryAta:valid.treasuryAta,decimals:valid.decimals,supplyBaseUnits:valid.supplyBaseUnits,allocations,freezePolicy:config.freezePolicy,mintAuthorityPolicy:config.mintAuthorityPolicy,extensionsPolicy:config.extensionsPolicy,issuanceStatus:'INACTIVE_NO_TOKENS_CREATED',publicSaleStatus:'INACTIVE'};
 const digest=createHash('sha256').update(JSON.stringify(review)).digest('hex');
 return {status:'OFFLINE_REVIEW_ONLY_NOT_AUTHORIZATION',reviewDigest:digest,review};
}
if(process.argv[1]&&import.meta.url===new URL('file://'+process.argv[1]).href){
 try{if(process.argv.length!==3)throw Error('Usage: node scripts/deployment-review-packet.mjs <public-config.json>');
 const config=JSON.parse(readFileSync(process.argv[2],'utf8'));
 console.log(JSON.stringify(createDeploymentReviewPacket(config),null,2));
 }catch(error){console.error(error.message);process.exitCode=1}
}
