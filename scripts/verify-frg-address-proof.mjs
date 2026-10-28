// Verification must run against a trusted ForgeCoin wallet RPC implementation.
// Never accept a caller-supplied RPC endpoint or an unverified "good" flag.
export function frgStatement({minerId,frgAddress,solanaAddress,challenge,expiresAt}){
 for(const [name,v] of Object.entries({minerId,frgAddress,solanaAddress,challenge,expiresAt})){
  if(typeof v!=='string'||!v||v.length>512)throw Error('Invalid '+name);
 }
 return JSON.stringify({domain:'forgecoin-mfrg-frg-binding-v1',minerId,frgAddress,solanaAddress,challenge,expiresAt});
}
export async function verifyFrgAddressProof({proof,expected,verifyRpc,now=Date.now()}){
 if(typeof verifyRpc!=='function')throw Error('Trusted ForgeCoin wallet RPC required');
 const {minerId,frgAddress,solanaAddress,challenge,expiresAt,signature}=proof??{};
 if(!expected||minerId!==expected.minerId||frgAddress!==expected.frgAddress||solanaAddress!==expected.solanaAddress||challenge!==expected.challenge)throw Error('Identity/challenge mismatch');
 const expiry=Date.parse(expiresAt);
 if(!Number.isFinite(expiry)||expiry<now||expiry>now+15*60*1000)throw Error('Invalid expiration');
 if(typeof signature!=='string'||!signature||signature.length>2048)throw Error('Invalid FRG signature');
 const data=frgStatement({minerId,frgAddress,solanaAddress,challenge,expiresAt});
 const result=await verifyRpc({data,address:frgAddress,signature});
 if(result?.good!==true)throw Error('ForgeCoin signature verification failed');
 return {minerId,frgAddress,solanaAddress,challenge,verified:true};
}
export function trustedWalletRpcVerifier({url,fetchImpl=fetch,token}){
 const parsed=new URL(url);
 if(parsed.hostname!=='127.0.0.1'&&parsed.hostname!=='localhost'&&parsed.hostname!=='::1')throw Error('Only trusted loopback wallet RPC endpoints allowed in prototype');
 if(parsed.protocol!=='http:')throw Error('Local HTTP wallet RPC only');
 return async params=>{
  const response=await fetchImpl(parsed,{method:'POST',headers:{'content-type':'application/json',...(token?{authorization:token}:{})},body:JSON.stringify({jsonrpc:'2.0',id:'frg-proof-v1',method:'verify',params})});
  if(!response.ok)throw Error('Wallet RPC HTTP failure');
  const json=await response.json();
  if(json.error||!json.result||typeof json.result.good!=='boolean')throw Error('Malformed wallet RPC response');
  return json.result;
 };
}
