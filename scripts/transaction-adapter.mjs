import {transition,assertJournal} from './journal-state.mjs';
export function reconcile(rows,updates){
 assertJournal(rows);
 if(!Array.isArray(updates))throw Error('Updates must be array');
 const seen=new Set();let result=rows;
 for(const u of updates){
  if(!u||typeof u.id!=='string'||seen.has(u.id))throw Error('Invalid or repeated observation');
  seen.add(u.id);
  const old=result.find(x=>x.id===u.id);if(!old)throw Error('Unknown transaction ID');
  if(!old.signature)throw Error('Missing stored signature');
  if(u.signature!==old.signature)throw Error('Signature mismatch');
  if(u.confirmation==='finalized'){
   if(!['submitted','uncertain','confirmed'].includes(old.status))throw Error('Unexpected finalized state');
   result=transition(result,u.id,'confirmed');
  }else if(u.confirmation==='unknown'){
   if(old.status==='submitted')result=transition(result,u.id,'uncertain');
  }else if(u.confirmation==='failed'){
   if(!['submitted','uncertain','failed'].includes(old.status))throw Error('Unexpected failure state');
   if(old.status!=='failed')result=transition(result,u.id,'failed');
  }else throw Error('Unknown confirmation');
 }
 return result;
}
export async function observeSignatures(provider,rows){
 assertJournal(rows);
 const observed=[];
 for(const row of rows.filter(x=>['submitted','uncertain'].includes(x.status))){
  if(!row.signature)throw Error('Missing signature');
  const o=await provider.getSignatureStatus(row.signature);
  if(!o||!['finalized','failed','unknown'].includes(o.confirmation))throw Error('Invalid provider response');
  observed.push({id:row.id,signature:row.signature,confirmation:o.confirmation});
 }
 return observed;
}
export class FakeProvider{
 constructor(states={}){this.states=states}
 async getSignatureStatus(signature){return {confirmation:this.states[signature]??'unknown'}}
}
