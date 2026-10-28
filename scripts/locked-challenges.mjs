import fs from 'node:fs';
import {DurableChallengeStore} from './durable-challenges.mjs';
// Exclusive local filesystem lock. Fail closed; do not auto-steal stale locks.
export function withExclusiveLock(journalPath,fn){
 const lockPath=journalPath+'.lock';let fd;
 try{fd=fs.openSync(lockPath,'wx',0o600)}catch(e){if(e.code==='EEXIST')throw Error('Challenge registry busy or orphan lock; stop and investigate before manual recovery');throw e}
 try{
  fs.writeSync(fd,JSON.stringify({pid:process.pid,createdAt:new Date().toISOString()})+'\n');
  fs.fsyncSync(fd);
  return fn();
 }finally{
  try{fs.closeSync(fd)}finally{fs.unlinkSync(lockPath)}
 }
}
export class LockedChallengeStore extends DurableChallengeStore{
 issue(args){return withExclusiveLock(this.filename,()=>super.issue(args))}
 consume(proof){return withExclusiveLock(this.filename,()=>super.consume(proof))}
}
