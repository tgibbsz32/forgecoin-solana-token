# mFRG payout-gate lineage enforcement — handoff

## Completed
The unified read-only payout gate now requires an approved payout week's persisted canonical batch to pass `verifyPayoutLineage()` before evaluating its signed transaction or consulting the devnet account interface. The validator checks approval lineage, the batch SHA-256 digest, original recipient/amount/key matches, and total conservation. Added a positive integrated offline/mock-RPC fixture containing canonical batch data, plus a tampered payout recipient rejection test. Earlier batch records without canonical payload fail closed.

## Limits
No live on-chain transfer, token mint, sale, public Oracle network change or actual pool/daemon integration. The mock-RPC suite cannot establish real Solana account availability or consensus. Database tampering by a privileged administrator is still possible; independent immutable approval audit and the original signed source ledger linkage are pending. Deployment still needs independently pinned mint/source/authority, genuine devnet RPC smoke checks and correctly guarded signer/broadcaster.

## Next milestone
Run real read-only devnet RPC diagnostics and finalize trusted mint/treasury configuration, then request user approval to create a test mint and prepare test SOL. Separately validate ForgeCoin solo and pool mining on Oracle before public opening.
