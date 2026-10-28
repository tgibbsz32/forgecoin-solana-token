# mFRG weekly settlement gate — phase handoff

Implemented a one-host SQLite WAL-backed weekly closure registry. `week` is unique 1–52, with pinned ledger SHA-256 digest, pool snapshot digest, fixed budget, and monotonic closed -> approved state. Repeating the same close is idempotent; a different ledger digest for the same week fails closed. Approval requires the exact digest and succeeds only once. Tests cover restart/reopen and two database connections.

**Important limitations:** This is a database gate, not complete immutable or tamper-evident storage. The database administrator could modify rows, and the code currently stores only digests and metadata, not the full ledger or its independently recomputed canonical digest. Approval is not linked to an authenticated operator or multisignature process. No payout transaction IDs, settlement finality, reward claims, carryforward, chain reorg handling or real mining pool feed are integrated. Never treat status 'approved' as authorization to transfer funds; this is a local development state.

**Next phase:** bind full immutable snapshot and payout rows to hash verification; role-controlled approvals; per-recipient idempotent transfer intent journal; crash-safe reconciliation with real Solana devnet signature statuses; audited, authenticated pool data.

No tokens minted or transferred and no public sale activation.
