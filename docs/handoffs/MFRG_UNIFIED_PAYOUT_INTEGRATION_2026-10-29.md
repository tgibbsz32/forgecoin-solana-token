# mFRG — unified payout integration / devnet blockhash handoff

## Implemented
The read-only payout gate now requires an actual Solana Connection instance configured with the canonical official devnet RPC endpoint (`https://api.devnet.solana.com`) and verifies that the signed message's recent blockhash remains valid on devnet at finalized commitment. Added integrated mock-RPC tests exercising the positive path from an approved settlement and prepared outbox through cryptographic transaction verification, token transfer instruction inspection, ATA derivation, account owner/mint and sufficient source balance checks. Negative tests cover invalid blockhash, insufficient balance and a tampered signed transaction.

## Critical limits
This is **not an executed devnet payout**. Integration tests inject simulated RPC return values, not actual on-chain accounts. A caller can supply a specially constructed Connection instance with overridden methods in-process; production trust also requires controlling runtime imports and endpoint/network access. This check rejects an expired blockhash, so the operator must reprepare rather than blindly replay transactions.

The payout gate still does not recompute the stored signed transaction's outbox digest, verify account extensions or full ledger hash from stored rows, nor offer a secure broadcaster. No wallet keys, actual Solana mint, transfers, public network switch or public sale were involved.

## Next phase
Strengthen outbox transaction digest and payout intent linkage; authenticate the configured mint and authority; add real read-only devnet RPC smoke testing. Once those pass, seek explicit owner approval for a devnet mint and test-funded wallet, then devnet-only test transfers and confirmation reconciliation. Independently run native ForgeCoin Oracle pool/daemon readiness checks before its public release.
