# mFRG unified payout gate — handoff

## Completed
Added a read-only single-host SQLite inspection gate joining an approved weekly settlement, payout batch row and prepared signed transaction outbox. The gate cryptographically verifies the transaction signers, requires the actual payer account to match the independently configured fee payer, derives the miner's Token-2022 recipient ATA from the registered beneficiary owner and configured mint, verifies a strict single TransferChecked instruction and expected amount, and performs finalized account checks including source balance.

## Important limits
This is **inspection only**. No signing, submission, minting or transfers occurred. The expected mint, source token account, authority, fee payer and Solana RPC connection must be pinned by trusted deployment configuration; caller-controlled values are unsafe. Tests currently cover rejection of missing approved payouts; actual positive-path integration testing and a deployed devnet mint are still needed. The gate does not check a signed transaction's blockhash against the devnet cluster, enforce a pinned RPC endpoint if a connection is injected, or revalidate the approved payout ledger's full digest. It also does not bind the transaction outbox to the approved intent through a dedicated foreign key or validate token extension fees and transfer restrictions. These must be addressed before any real money movement.

## Next phase
Add positive-path integration tests using realistic account buffers, immutable source/fee-payer/mint configuration, devnet-only RPC pinning and blockhash checks; then perform separately authorized devnet mint and transfer tests after user-controlled wallet setup. Keep Oracle public network and sale inactive pending their separate operational gates.
