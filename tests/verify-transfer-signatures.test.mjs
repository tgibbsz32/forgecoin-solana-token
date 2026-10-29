import test from 'node:test';import assert from 'node:assert/strict';
import {Keypair,TransactionMessage,VersionedTransaction} from '@solana/web3.js';
import {createTransferCheckedInstruction,getAssociatedTokenAddressSync,TOKEN_2022_PROGRAM_ID} from '@solana/spl-token';
import {verifyTransactionSignatures,verifyRecipientAta} from '../scripts/verify-transfer-signatures.mjs';
const payer=Keypair.generate(),owner=Keypair.generate(),mint=Keypair.generate().publicKey,source=Keypair.generate().publicKey;
const destination=getAssociatedTokenAddressSync(mint,owner.publicKey,true,TOKEN_2022_PROGRAM_ID);
function signed(){const ix=createTransferCheckedInstruction(source,mint,destination,payer.publicKey,42n,6,[],TOKEN_2022_PROGRAM_ID);const tx=new VersionedTransaction(new TransactionMessage({payerKey:payer.publicKey,recentBlockhash:Keypair.generate().publicKey.toBase58(),instructions:[ix]}).compileToV0Message());tx.sign([payer]);return tx}
test('verify real Ed25519 signature on serialized Solana message',()=>{const tx=signed();assert.deepEqual(verifyTransactionSignatures(Buffer.from(tx.serialize()).toString('base64')).signerKeys,[payer.publicKey.toBase58()])});
test('signature tampering rejected',()=>{const tx=signed();tx.signatures[0][10]^=1;assert.throws(()=>verifyTransactionSignatures(Buffer.from(tx.serialize()).toString('base64')),/Invalid transaction signature/)});
test('unsigned transaction rejected',()=>{const tx=signed();tx.signatures[0].fill(0);assert.throws(()=>verifyTransactionSignatures(Buffer.from(tx.serialize()).toString('base64')),/Invalid transaction signature/)});
test('correct derived Token-2022 recipient ATA recognized',()=>assert.equal(verifyRecipientAta({recipientOwner:owner.publicKey.toBase58(),expectedMint:mint.toBase58(),expectedDestination:destination.toBase58()}).addressDerived,true));
test('recipient substituted rejects ATA derivation',()=>assert.throws(()=>verifyRecipientAta({recipientOwner:Keypair.generate().publicKey.toBase58(),expectedMint:mint.toBase58(),expectedDestination:destination.toBase58()}),/not expected/));
