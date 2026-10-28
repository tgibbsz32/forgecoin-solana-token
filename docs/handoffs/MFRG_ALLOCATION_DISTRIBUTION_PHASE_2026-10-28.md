# mFRG allocation and distribution planning — phase handoff

## Completed
- Implemented allocation-specific devnet planning for the five approved tokenomics buckets. Plans are deterministic and include a SHA-256 fingerprint; no on-chain instructions are signed.
- Added miner payment idempotency preview with duplicate detection and conflict rejection against a previous journal.
- Added test fixtures and automated offline tests; no keys, sales or transfers.

## Critical limitations
- Example destination wallet strings are placeholders. Even structurally valid base58 is not proof of a usable Solana public key or wallet ownership. All five destinations require independently verified public keys and custody.
- A journal preview is not an atomic database, transfer executor or payout reconciliation. Production needs durable state transitions, chain finality tracking, crash recovery and multiple signer approvals.
- The existing devnet mint smoke test still places tokens in one wallet; it must not be mistaken for segregated distributions.
- mFRG token sale is owner-authorized in project planning but remains inactive. This phase has not deployed the mint, accepted funds or paid rewards.

## Next phase
1. Configure dedicated devnet signers and obtain devnet SOL, then run a devnet smoke test with wallet owner approval.
2. Extend the mint to allocate exact five accounts, reconcile each final balance and disable future mint authority after an explicit separate irreversible-action review.
3. Implement a server-side purchase ledger and miner work aggregation from accepted difficulty-weighted shares with replay protection.
4. Review custody, consumer handling, security and applicable compliance before enabling public financial flows.
