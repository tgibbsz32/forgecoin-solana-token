import test from 'node:test';import assert from 'node:assert/strict';import crypto from 'node:crypto';
import {canonical,verifyEnvelope} from '../scripts/verify-pool-export.mjs';
const {publicKey,privateKey}=crypto.generateKeyPairSync('ed25519');
const pub=publicKey.export({format:'pem',type:'spki'});
const payload={schemaVersion:1,source:'forgecoin-official-pool',week:1,closed:true,periodStart:'2026-10-01T00:00:00Z',periodEnd:'2026-10-08T00:00:00Z',work:[{workId:'a',minerId:'miner-a',difficultyWeightedWork:'12000'}]};
function signed(p=payload){const issuedAt='2026-10-09T00:00:00Z';const domain='forgecoin-mfrg-pool-work-v1';const signatureBase64=crypto.sign(null,Buffer.from(canonical({domain,issuedAt,payload:p})),privateKey).toString('base64');return {schemaVersion:1,domain,issuedAt,payload:p,signatureBase64}}
test('signed closed export validates against independently pinned key',()=>{const r=verifyEnvelope(signed(),pub,1,Date.parse('2026-10-10T00:00:00Z'));assert.match(r.digest,/^[a-f0-9]{64}$/)});
test('tampered work rejected',()=>{const e=signed();e.payload.work[0].difficultyWeightedWork='999999';assert.throws(()=>verifyEnvelope(e,pub,1),/Signature/)});
test('wrong public key rejected',()=>{const other=crypto.generateKeyPairSync('ed25519').publicKey.export({type:'spki',format:'pem'});assert.throws(()=>verifyEnvelope(signed(),other,1),/Signature/)});
test('week mismatch rejected',()=>assert.throws(()=>verifyEnvelope(signed(),pub,2),/Invalid pool/));
test('duplicate work rejected even when signed',()=>{const p=structuredClone(payload);p.work.push({...p.work[0]});assert.throws(()=>verifyEnvelope(signed(p),pub,1),/duplicated work/)});
test('signing before period closure rejected',()=>{const p=structuredClone(payload);p.periodEnd='2026-10-20T00:00:00Z';assert.throws(()=>verifyEnvelope(signed(p),pub,1),/Invalid period/)});
