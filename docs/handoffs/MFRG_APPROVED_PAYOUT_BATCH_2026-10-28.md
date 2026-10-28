# mFRG approved payout batch — handoff

Implemented a local SQLite transaction gate. A payout batch must correspond to an existing approved weekly settlement with an exact ledger digest; the complete ledger's canonical digest is recomputed, miner/payout keys must be unique, and base-unit amounts must sum exactly to the approved week's budget. Rows and batch fingerprint are inserted atomically under BEGIN IMMEDIATE; repeated identical planning is idempotent and conflicting weeks are rejected. Automated tests cover approval gating, tampering, conservation and duplicates.

This is **offline intent preparation only**, and creates no signed transaction, token mint, network connection, Solana transfer or authorization to execute payment. It runs on one local SQLite database; no independent operator identity, audit append-only storage or production payout trigger is implemented. End-to-end pool/FRG wallet identity integration and actual custody controls remain unfinished.

## Operator activation gates
1. Do not mint mainnet mFRG yet: first finalize token mint, allocation treasury addresses, owner keys and custody controls, dry-run scripts, and devnet end-to-end balances. When ready, user must create or approve a Solana wallet (hardware wallet preferred) with enough SOL for fees and explicitly authorize Token-2022 mainnet mint transaction.
2. Do not open FRG public mining on Oracle or advertise the network as production-ready yet: require daemon genesis/ports sync, security audit, actual solo and pool block tests, payouts, monitoring, explorer and public site availability. Open public firewall and announce launch only after those checks and owner approval.
3. Keep mFRG initial sale inactive until separate authorization and relevant legal review.

Next phase: persist signed transaction bytes and signatures *before* submitting, reconcile signature statuses on devnet, and test crashes. Separately complete live pool exporter and real FRG wallet RPC verification.
