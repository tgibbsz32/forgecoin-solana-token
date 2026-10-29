import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {DatabaseSync} from 'node:sqlite';
import {inspectApprovedDevnetPayout} from '../scripts/unified-payout-gate.mjs';
test('fails closed when approved payout or prepared outbox is absent',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mfrg-gate-')),file=path.join(dir,'db.sqlite');
 try{const db=new DatabaseSync(file);db.exec("CREATE TABLE approved_payout_rows(week INTEGER,miner_id TEXT,recipient TEXT,amount_base_units TEXT,payout_key TEXT);CREATE TABLE approved_payout_batches(week INTEGER,ledger_digest TEXT);CREATE TABLE weekly_settlements(week INTEGER,ledger_digest TEXT,status TEXT);CREATE TABLE devnet_outbox(payout_key TEXT,transaction_base64 TEXT,status TEXT)");db.close();
 await assert.rejects(inspectApprovedDevnetPayout({dbPath:file,payoutKey:'missing',expectedMint:'mint',expectedSource:'source',expectedAuthority:'authority',feePayer:'payer'}),/Pinned official Solana devnet RPC connection required/);
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
});
