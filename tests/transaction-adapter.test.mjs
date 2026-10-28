import test from 'node:test';import assert from 'node:assert/strict';
import {FakeProvider,observeSignatures,reconcile} from '../scripts/transaction-adapter.mjs';
const rows=[{id:'txA',status:'submitted',signature:'sigA',amountBaseUnits:'1000'},{id:'txB',status:'uncertain',signature:'sigB',amountBaseUnits:'2000'}];
test('mock provider reconciles confirmed and unknown outcomes without retransmission',async()=>{
 const provider=new FakeProvider({sigA:'finalized',sigB:'unknown'});
 const updates=await observeSignatures(provider,rows);
 const out=reconcile(rows,updates);
 assert.equal(out[0].status,'confirmed');assert.equal(out[1].status,'uncertain');
 assert.deepEqual(reconcile(out,[{id:'txA',signature:'sigA',confirmation:'finalized'}]),out);
});
test('confirmed signature cannot be switched or falsely replayed',()=>{
 assert.throws(()=>reconcile(rows,[{id:'txA',signature:'different',confirmation:'finalized'}]),/Signature mismatch/);
 assert.throws(()=>reconcile(rows,[{id:'txA',signature:'sigA',confirmation:'finalized'},{id:'txA',signature:'sigA',confirmation:'finalized'}]),/repeated/);
});
test('ambiguous outcomes do not become failed automatically',()=>{const out=reconcile(rows,[{id:'txA',signature:'sigA',confirmation:'unknown'}]);assert.equal(out[0].status,'uncertain')});
test('provider has no submit or sign capability',()=>{assert.equal(typeof new FakeProvider().sendTransaction,'undefined')});
