import test from 'node:test';import assert from 'node:assert/strict';import nacl from 'tweetnacl';import bs58 from 'bs58';import {verifySolanaWalletProof} from '../scripts/verify-wallet-proof.mjs';
const keys=nacl.sign.keyPair();const now=Date.parse('2026-10-28T18:00:00Z');
const base={domain:'forgecoin-mfrg-rewards-v1',minerId:'miner-a',solanaAddress:bs58.encode(keys.publicKey),challenge:'random-server-generated-challenge',issuedAt:'2026-10-28T17:59:00Z',expiresAt:'2026-10-28T18:09:00Z'};
function sign(data=base){const statement=JSON.stringify(data);return {...data,signatureBase58:bs58.encode(nacl.sign.detached(new TextEncoder().encode(statement),keys.secretKey))}}
test('valid signed wallet challenge is accepted',()=>assert.equal(verifySolanaWalletProof(sign(),{expectedChallenge:base.challenge,now}).minerId,'miner-a'));
test('mutated beneficiary rejected',()=>assert.throws(()=>verifySolanaWalletProof({...sign(),minerId:'miner-b'},{expectedChallenge:base.challenge,now}),/signature/));
test('replay against different challenge rejected',()=>assert.throws(()=>verifySolanaWalletProof(sign(),{expectedChallenge:'different',now}),/challenge/));
test('expired proof rejected',()=>assert.throws(()=>verifySolanaWalletProof(sign(),{expectedChallenge:base.challenge,now:now+3600000}),/Expired/));
