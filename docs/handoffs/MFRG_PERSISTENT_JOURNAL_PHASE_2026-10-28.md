# mFRG persistent journal and transaction-state phase — handoff

This phase adds a reusable local JSON journal library with atomic temporary-file replacement, file fsync, best-effort directory fsync and strict planned → submitted → confirmed/failed/uncertain status controls. A submitted state must contain a transaction signature; uncertain outcomes cannot be resubmitted automatically. Tests cover persistence, replay, forbidden state transitions and duplicate IDs.

This is a **local development prototype**, not a production-grade multi-process database or a submitted Solana transaction executor. Journal writes are guarded by ENABLE_LOCAL_JOURNAL_WRITE. No real signature verification or chain reconciliation occurs. Crash windows remain between external submission and journal writes; production needs durable pre-submission intents, immutable prepared transactions/signatures, lock coordination and on-chain confirmation reconciliation. Do not assume atomic rename is adequate for concurrent processes or network-backed filesystems.

Next phase: add a mockable provider-backed Solana transaction submission and verification adapter, durable lock/lease and recovery semantics, integration tests with exact five allocation ATAs, then test with verified dedicated devnet keys and devnet SOL. Mainnet mint and live token sale remain inactive. No network transaction executed in this phase.
