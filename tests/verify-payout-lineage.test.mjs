import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {createHash} from 'node:crypto';
import {canonical} from '../scripts/verify-pool-export.mjs';
import {WeeklySettlementStore} from '../scripts/weekly-settlement-store.mjs';
import {ApprovedPayoutBatch} from '../scripts/approved-payout-batch.mjs';
import {verifyPayoutLineage} from '../scripts/verify-payout-lineage.mjs';
const data={status:'OFFLINE_PREVIEW_NO_TRANSFERS',week:1,poolSnapshotDigest:'c'.repeat(64),budgetBaseUnits:'100',payouts:[{minerId:'a',frgAddress:'frg1',solanaAddress:'sol1',amountBaseUnits:'100',payoutKey:'a'.repeat(64)}]};
function setup(){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mfrg-lineage-')),file=path.join(dir,'db.sqlite');const ledger={...data,ledgerDigest:createHash('sha256').update(canonical(data)).digest('hex')};const s=new WeeklySettlementStore(file);s.closeWeek(ledger);s.approve(1,ledger.ledgerDigest);s.close();const b=new ApprovedPayoutBatch(file);b.plan(ledger);return {dir,file,b}}
test('full approved payout lineage verifies',()=>{const x=setup();try{assert.equal(verifyPayoutLineage(x.file,1).payoutCount,1)}finally{x.b.close();fs.rmSync(x.dir,{recursive:true,force:true})}});
test('mutated persisted destination rejected',()=>{const x=setup();try{x.b.db.exec("UPDATE approved_payout_rows SET recipient='attacker'");assert.throws(()=>verifyPayoutLineage(x.file,1),/differs/)}finally{x.b.close();fs.rmSync(x.dir,{recursive:true,force:true})}});
test('missing canonical payload fails closed',()=>{const x=setup();try{x.b.db.exec('DELETE FROM batch_payloads');assert.throws(()=>verifyPayoutLineage(x.file,1),/lineage/)}finally{x.b.close();fs.rmSync(x.dir,{recursive:true,force:true})}});
test('modified saved batch payload fails hash check',()=>{const x=setup();try{x.b.db.exec("UPDATE batch_payloads SET canonical_payload='{}'");assert.throws(()=>verifyPayoutLineage(x.file,1),/mismatched/)}finally{x.b.close();fs.rmSync(x.dir,{recursive:true,force:true})}});
