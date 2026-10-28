# mFRG miner-work import — phase handoff

## Completed
Implemented a strict local transform from a closed official-pool-shaped export and registered Solana destination mappings into the format used by the 52-week miner-reward calculator. The transform checks period closure assertions, integer difficulty-weighted work, uniqueness of work IDs, eligible miner mapping, a declared ownershipVerified flag, and deterministic SHA-256 output. Unit tests include negative cases.

## Security boundary
All inputs are **untrusted files**. A bool named ownershipVerified is **not wallet ownership proof**. A self-described official-pool export is **not authenticated**. The importer neither verifies native FRG daemon events nor secures its provenance, signed period cutoffs, or chain reorgs. It must not authorize payouts as-is. All sample recipient addresses are placeholders; no production transfers.

## Next phase
1. Integrate authenticated production pool work-difficulty records and confirm the exact canonical database/API schema.
2. Add signed domain-bound wallet ownership challenge/response for both FRG mining addresses and Solana payout accounts, anti-replay/expiry and revocation.
3. Add immutable snapshot boundaries, audited reconciliation, reward carryforward and minimum payout threshold.
4. Complete devnet token mint/distribution integration with verified custody keys, then test end-to-end.

No mainnet mint, actual devnet token, sale activation or mFRG payout occurred.
