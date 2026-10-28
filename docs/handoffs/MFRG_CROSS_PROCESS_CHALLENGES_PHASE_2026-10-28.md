# mFRG cross-process challenge lock — handoff (2026-10-28)

## Implemented
- Local filesystem-exclusive create ('wx') lock wrapped around durable challenge issue/consume operations, limiting concurrent writers on one local disk.
- Lock creation is fail-closed: an existing lock, even after a crash, blocks all operations until an operator investigates and safely clears it. No dangerous automatic stale-lock stealing.
- Tests for post-restart nonce replay, competing writers, callback failure cleanup and orphan locks.

## Boundaries
This is a **single-machine local-disk** coordination prototype, NOT distributed/multi-server production safety. Cross-host network filesystems may have different lock/rename semantics. A process crash leaves a lock intentionally requiring manual resolution. No actual wallet enrollment HTTP service, native FRG address proof, verified live pool schema or real mFRG payout is operational. Ownership proof of a Solana payout wallet does not prove control of a ForgeCoin/Monero mining address.

## Next major phase
- Add native FRG address ownership authentication using a protocol actually supported by the wallet and network (e.g. verified wallet signatures when available; otherwise proof via a separate authenticated channel). Do not assume Monero wallet signs arbitrary domains identically to Solana.
- Replace local files with a real transactional database (e.g. SQLite WAL for single host, PostgreSQL for multiple app instances), with single-use conditional updates, challenge cleanup, unique constraints, operator audit and secure key management.
- Test authenticated pool exporter and signed snapshot wiring to the payout calculator.
- Set up devnet-only custody to run actual mint/distribution integration tests after separate deployment approval.

Nothing deployed, minted or paid.
