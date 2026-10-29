import {Connection,clusterApiUrl} from '@solana/web3.js';
const RPC='https://api.devnet.solana.com';
export async function checkDevnetReadOnly({connection=new Connection(RPC,'finalized')}={}){
 if(!(connection instanceof Connection)||connection.rpcEndpoint!==RPC)throw Error('Official devnet RPC required');
 const [genesisHash,version,slot,health]=await Promise.all([
  connection.getGenesisHash(),connection.getVersion(),connection.getSlot('finalized'),
  connection._rpcRequest('getHealth',[])
 ]);
 if(typeof genesisHash!=='string'||!genesisHash||typeof version?.['solana-core']!=='string'||!Number.isSafeInteger(slot)||slot<1)throw Error('Invalid devnet RPC response');
 if(health?.error||health?.result!=='ok')throw Error('Devnet node health failure');
 // The trusted devnet genesis hash must be configured independently and checked for any payout enablement.
 return {status:'READ_ONLY_DIAGNOSTIC_NOT_LAUNCH_AUTHORIZATION',rpcEndpoint:RPC,genesisHash,solanaCoreVersion:version['solana-core'],finalizedSlot:slot,healthy:true};
}
if(import.meta.url===new URL('file://'+process.argv[1]).href){
 checkDevnetReadOnly().then(x=>console.log(JSON.stringify(x,null,2))).catch(e=>{console.error(e.message);process.exitCode=1});
}
