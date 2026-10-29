import test from 'node:test';import assert from 'node:assert/strict';import {Keypair} from '@solana/web3.js';import {inspectOwnerReadiness} from '../scripts/wallet-owner-readiness.mjs';
import {DEVNET_GENESIS,DEVNET_RPC} from '../scripts/trusted-devnet-deployment.mjs';
const [mintAuthority,freezeAuthority,treasuryOwner,mint]=Array.from({length:4},()=>Keypair.generate().publicKey.toBase58());
const c={network:'devnet',rpcUrl:DEVNET_RPC,genesisHash:DEVNET_GENESIS,mintAuthority,freezeAuthority,treasuryOwner,mintAuthorityCustody:'hardware-or-owner-controlled',treasuryCustody:'owner-controlled',freezeAuthorityPolicy:'retain-until-reviewed'};
test('public owner addresses validated without requiring mint deployment',()=>assert.equal(inspectOwnerReadiness(c).status,'PUBLIC_ADDRESSES_READY_MINT_ADDRESS_PENDING'));
test('planned mint address derives treasury ATA',()=>assert.match(inspectOwnerReadiness({...c,mintAddress:mint}).treasuryAta,/^[1-9A-HJ-NP-Za-km-z]+$/));
test('rejects wrong network',()=>assert.throws(()=>inspectOwnerReadiness({...c,network:'mainnet-beta'}),/Devnet-only/));
test('rejects shared owner and freeze key',()=>assert.throws(()=>inspectOwnerReadiness({...c,freezeAuthority:mintAuthority}),/Separate/));
test('rejects secret material',()=>assert.throws(()=>inspectOwnerReadiness({...c,seedPhrase:'never upload'}),/Private wallet/));
