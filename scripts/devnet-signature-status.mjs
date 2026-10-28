// Read-only RPC. Never broadcasts or signs a transaction.
export async function readDevnetSignatureStatus(signature,{rpcUrl='https://api.devnet.solana.com',fetchImpl=fetch}={}){
 const u=new URL(rpcUrl);if(u.protocol!=='https:'||u.hostname!=='api.devnet.solana.com'||u.pathname!=='/')throw Error('Only official devnet RPC is permitted');
 const response=await fetchImpl(u.toString(),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'getSignatureStatuses',params:[[signature],{searchTransactionHistory:true}]})});
 if(!response.ok)throw Error('Devnet RPC unavailable');
 const result=await response.json();if(result.error||!Array.isArray(result.result?.value)||result.result.value.length!==1)throw Error('Invalid RPC status response');
 const status=result.result.value[0];
 if(status===null)return {state:'unknown',finality:'not_proven'};
 if(status.err)return {state:'failed',finality:status.confirmationStatus??'unknown',error:status.err};
 if(status.confirmationStatus==='finalized')return {state:'confirmed',finality:'finalized'};
 return {state:'pending',finality:status.confirmationStatus??'unknown'};
}
