import {DatabaseSync} from 'node:sqlite';
// One-host SQLite ledger gate. Finality and authorization are out of scope.
export class WeeklySettlementStore{
 constructor(filename){
  this.db=new DatabaseSync(filename);
  this.db.exec("PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS weekly_settlements(week INTEGER PRIMARY KEY CHECK(week BETWEEN 1 AND 52),ledger_digest TEXT NOT NULL UNIQUE,snapshot_digest TEXT NOT NULL,budget_base_units TEXT NOT NULL,status TEXT NOT NULL CHECK(status IN ('closed','approved')),closed_at TEXT NOT NULL,approved_at TEXT);");
 }
 closeWeek(ledger,{now=new Date().toISOString()}={}){
  if(ledger?.status!=='OFFLINE_PREVIEW_NO_TRANSFERS'||!Number.isInteger(ledger.week)||ledger.week<1||ledger.week>52||! /^[a-f0-9]{64}$/.test(ledger.ledgerDigest??'')||! /^[a-f0-9]{64}$/.test(ledger.poolSnapshotDigest??'')||! /^[0-9]+$/.test(ledger.budgetBaseUnits??''))throw Error('Malformed ledger');
  // Idempotent on exact same week+digest, refuses any re-computation with another digest.
  const inserted=this.db.prepare("INSERT OR IGNORE INTO weekly_settlements(week,ledger_digest,snapshot_digest,budget_base_units,status,closed_at) VALUES(?,?,?,?,'closed',?)").run(ledger.week,ledger.ledgerDigest,ledger.poolSnapshotDigest,ledger.budgetBaseUnits,now);
  const stored=this.get(ledger.week);
  if(stored.ledgerDigest!==ledger.ledgerDigest)throw Error('Already closed with different ledger');
  return {inserted:inserted.changes===1,record:stored};
 }
 approve(week,expectedLedgerDigest,{now=new Date().toISOString()}={}){
  if(!Number.isInteger(week)||! /^[a-f0-9]{64}$/.test(expectedLedgerDigest??''))throw Error('Invalid approval');
  const result=this.db.prepare("UPDATE weekly_settlements SET status='approved',approved_at=? WHERE week=? AND ledger_digest=? AND status='closed'").run(now,week,expectedLedgerDigest);
  if(result.changes!==1)throw Error('Cannot approve: unknown, mismatched or already approved');
  return this.get(week);
 }
 get(week){const r=this.db.prepare('SELECT * FROM weekly_settlements WHERE week=?').get(week);return r?{week:r.week,ledgerDigest:r.ledger_digest,poolSnapshotDigest:r.snapshot_digest,budgetBaseUnits:r.budget_base_units,status:r.status,closedAt:r.closed_at,approvedAt:r.approved_at}:null}
 close(){this.db.close()}
}
