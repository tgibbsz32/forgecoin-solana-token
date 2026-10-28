import test from 'node:test';import assert from 'node:assert/strict';import crypto from 'node:crypto';
import {canonical} from '../scripts/verify-pool-export.mjs';
import {buildVerifiedWeeklyLedger} from '../scripts/verified-weekly-ledger.mjs';
const {publicKey,privateKey}=crypto.generateKeyPairSync('ed25519'),publicPem=publicKey.export({type:'spki',format:'pem'}),now=Date.parse('2026-10-28T22:00:00Z');
const work=[{workId:'x',minerId:'alice',frgAddress:'FRG_A',difficultyWeightedWork:'1'},{workId:'y',minerId:'bob',frgAddress:'FRG_B',difficultyWeightedWork:'3'}];
const registrations=new Map([['alice',{frgAddress:'FRG_A',solanaAddress:'SOL_A'}],['bob',{frgAddress:'FRG_B',solanaAddress:'SOL_B'}]]);
function envelope(rows=work){const payload={schemaVersion:1,source:'forgecoin-official-pool',closed:true,week:1,periodStart:'2026-10-01T00:00:00Z',periodEnd:'2026-10-08T00:00:00Z',work:rows};const domain='forgecoin-mfrg-pool-work-v1',issuedAt='2026-10-09T00:00:00Z';return {schemaVersion:1,domain,issuedAt,payload,signatureBase64:crypto.sign(null,Buffer.from(canonical({domain,issuedAt,payload})),privateKey).toString('base64')}}
const calculate=(e=envelope(),lookupBinding=id=>registrations.get(id))=>buildVerifiedWeeklyLedger({envelope:e,pinnedPoolPublicKey:publicPem,week:1,now,lookupBinding});
test('signed work and matching registrations yield reproducible conserved ledger',()=>{const a=calculate(),b=calculate();assert.deepEqual(a,b);assert.equal(a.payouts.reduce((n,p)=>n+BigInt(p.amountBaseUnits),0n),BigInt(a.budgetBaseUnits));assert.equal(a.payouts[0].solanaAddress,'SOL_A');assert.ok(BigInt(a.payouts[1].amountBaseUnits)>BigInt(a.payouts[0].amountBaseUnits))});
test('reject tampering after snapshot signature',()=>{const e=envelope();e.payload.work[0].difficultyWeightedWork='900';assert.throws(()=>calculate(e),/Signature/)});
test('reject missing registration',()=>assert.throws(()=>calculate(envelope(),id=>id==='alice'?registrations.get(id):null),/matching verified/));
test('reject miner address mismatch',()=>assert.throws(()=>calculate(envelope(),id=>id==='bob'?{frgAddress:'OTHER',solanaAddress:'SOL_B'}:registrations.get(id)),/matching verified/));
test('reject signed work without FRG address',()=>assert.throws(()=>calculate(envelope([{workId:'x',minerId:'alice',difficultyWeightedWork:'1'}])),/FRG address/));
test('reject unclosed signed export',()=>{const e=envelope();e.payload.closed=false;assert.throws(()=>calculate(e),/Invalid pool payload/)});
