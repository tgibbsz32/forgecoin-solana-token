# mFRG — first-year miner rewards phase handoff

## Completed
Implemented an offline 52-week miner reward calculator against the locked planning allocation of 175,000 mFRG (six decimals). Each week's base-unit budget is computed as floor(annual * week / 52) minus floor(annual * (week - 1) / 52), so exactly 175,000 mFRG is scheduled without inflation. Pool records are aggregated by miner ID using difficulty-weighted verified-work values supplied by an external source, reject duplicate work IDs and changing recipient addresses, and use deterministic largest-remainder rounding for exact weekly conservation. Per-miner, per-week idempotency IDs are derived.

## Limitations
No direct integration to native FRG mining shares has occurred. Input records are **trusted by the calculator**, not independently authenticated. Public address registration and ownership verification, opt-in requirements, Sybil resistance, min payout/carry-over, audit logs, blockchain settlement, and appeals policy still need implementation. Do not feed externally supplied records into live payments.

Solo mining is **not yet eligible in code**: pool shares and independently mined blocks have incompatible measurement granularity. Do not promise a normalized solo-reward share until a verified work-credit methodology is approved and implemented. No mFRG transfers were executed.

## Next phase
Implement authenticated mining-pool work export and cross-check against FRG daemon block events; immutable weekly period closure, wallet address proofs, a deterministic dry-run ledger, carry-forward balances and audited settlement. Once these exist, integrate a dedicated devnet wallet with devnet SOL and run end-to-end tests. Mainnet token mint and purchases remain inactive.
