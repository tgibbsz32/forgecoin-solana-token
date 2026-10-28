# mFRG — devnet signed-transaction outbox handoff

Implemented a SQLite one-host pre-broadcast outbox that stores an already-signed Solana versioned transaction, first signature and SHA-256 digest, checks byte/signature consistency, enforces payout-key uniqueness and supports prepared -> uncertain -> confirmed/failed state transitions. A separate read-only official devnet RPC status adapter classifies finalized signature success, pending confirmations, explicit errors and unknown statuses (unknown is never assumed failed). Tests include persistence, idempotency, forged signature, duplicate submission state and RPC finality mocks.

**No live transaction signing, broadcast, minting, SOL spending or real network verification occurred.** Outbox and payout intent tables remain unlinked; transaction intent must be audited against approved payout rows, mint, recipient, amount, fee payer, blockhash and mint authority before any broadcast. Error statuses or missing history are not always proof of safe replay; any uncertain transaction needs careful reconciliation, blockhash expiry and destination balance accounting. Real production use needs a funding wallet/HSM controls, actual devnet test with user approval, rate limits, secrets hygiene and transaction-status reconciliation tests. Never store signing seed keys in this database.

## Operator action gates
- User does NOT need to buy mFRG. Token must be created with a Solana Token-2022 mint transaction by wallet owner after approved deployment.
- **No owner wallet action required yet** for this offline phase. Later: select secure Solana owner and treasury accounts, fund modest SOL for devnet/mainnet fees, approve devnet test and later mainnet mint.
- **Do not open public Oracle/website mining launch yet**: validate native FRG daemon, solo+pool block flow, pool fee/payouts, monitoring, explorer, public binaries and downloads.
- Keep public mFRG sale inactive until separate launch approval and legal review.

## Next development
Tie signed transaction bytes to approved payout batches and on-chain mint, recipient and token program, add finality/recovery rules and a guarded broadcast executor only after testing. Separately integrate genuine native FRG pool work records and signatures.
