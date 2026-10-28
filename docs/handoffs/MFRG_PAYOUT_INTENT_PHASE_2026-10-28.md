# mFRG payout intent state machine — phase handoff

Implemented a SQLite WAL local per-recipient payout-intent registry with unique payoutKey and (week, minerId), immutable recipient/amount checks during idempotent planning, and status planned -> submitted -> confirmed/uncertain/failed. Submission records a transaction signature before allowing confirmation reconciliation. Repeated submission and terminal mutation are rejected; uncertain cannot be treated as failed without stronger evidence. Tests cover conflicts, restart, double submission and uncertain-state behavior.

## Critical limits
This is **not a live Solana executor**. A Solana broadcast can occur before its signature is persistently journaled, causing a crash window; production must persist the fully signed transaction/signature and intended blockhash metadata **before** network broadcast and reconcile it on restart. No provider RPC is connected; signature strings are supplied by the caller and are not independently checked. Intent planning is not automatically linked to the approved weekly settlement database or fully persisted ledger digest. These are necessary before real payouts. No fund custody, balances, treasury authorization, chain verification, Solana mint, transfer or public sale activation occurred.

## Next
Enforce approved-settlement link and immutable payout snapshot, persist signed transactions before submission, add actual devnet signature-status adapter and crash/reorg tests; only then authorize a separately controlled devnet transfer test.
