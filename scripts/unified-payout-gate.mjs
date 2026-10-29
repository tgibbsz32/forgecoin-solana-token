import {DatabaseSync} from 'node:sqlite';
import {validateSignedPayout} from './validate-signed-payout.mjs';
import {verifyTransactionSignatures,verifyRecipientAta} from './verify-transfer-signatures.mjs';
import {verifyDevnetTokenAccounts} from './verify-devnet-token-accounts.mjs';
// Read-only gate: only pre-existing approved rows and prepared transaction bytes can pass.
export async function inspectApprovedDevnetPayout({dbPath,payoutKey,expectedMint,expectedSource,expectedAuthority,feePayer,connection}){
 const db=new DatabaseSync(dbPath,{readOnly:true});
 try{
  const row=db.prepare(`SELECT r.week,r.miner_id,r.recipient,r.amount_base_units,r.payout_key,b.ledger_digest,s.status AS settlement_status,o.transaction_base64,o.status AS outbox_status
   FROM approved_payout_rows r JOIN approved_payout_batches b ON b.week=r.week
   JOIN weekly_settlements s ON s.week=b.week AND s.ledger_digest=b.ledger_digest
   JOIN devnet_outbox o ON o.payout_key=r.payout_key WHERE r.payout_key=?`).get(payoutKey);
  if(!row||row.settlement_status!=='approved'||row.outbox_status!=='prepared')throw Error('Approved payout with prepared outbox required');
  if(!expectedMint||!expectedSource||!expectedAuthority||!feePayer)throw Error('Trusted mint/source/authority/fee payer required');
  const signatures=verifyTransactionSignatures(row.transaction_base64);
  if(!signatures.signerKeys.includes(expectedAuthority)||!signatures.signerKeys.includes(feePayer))throw Error('Required transfer and fee-payer signatures missing');
  const ata=verifyRecipientAta({recipientOwner:row.recipient,expectedMint,expectedDestination:row.recipientAta??''});
  validateSignedPayout({transactionBase64:row.transaction_base64,expectedMint,expectedSource,expectedDestination:ata.destination,expectedAuthority,expectedAmountBaseUnits:row.amount_base_units});
  const accounts=await verifyDevnetTokenAccounts({mintAddress:expectedMint,sourceAddress:expectedSource,destinationAddress:ata.destination,recipientOwner:row.recipient,expectedSourceOwner:expectedAuthority,connection});
  if(BigInt(accounts.sourceBalanceBaseUnits)<BigInt(row.amount_base_units))throw Error('Insufficient source balance');
  return {status:'OFFLINE_VERIFIED_NO_BROADCAST',payoutKey,week:row.week,minerId:row.miner_id,amountBaseUnits:row.amount_base_units,accountChecks:accounts.status};
 }finally{db.close()}
}
