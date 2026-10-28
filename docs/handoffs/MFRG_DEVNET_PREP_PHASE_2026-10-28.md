# mFRG — Devnet-preparation verification handoff

Date: 2026-10-28.

## Baseline
The canonical token repo holds the owner's revised 2M Token-2022 design: initial sale 1M at $0.10 ($100k max gross), first-year miner rewards 175k, future miner/community 375k, ecosystem services 250k, development 200k. No founder token allocation. Proposed sale proceeds 80% project / 20% founder cash compensation. The owner authorized *planning*, but sale activation and token deployment remain separate events.

## Work in this phase
- Existing `scripts/mint-devnet.mjs` is an explicit opt-in devnet-only smoke-test script. It is not a launch-ready mainnet mint/distribution procedure: it currently mints everything to a single devnet payer-controlled token account and does not lock treasuries or revoke authority.
- Added CI for offline configuration, smoke-test safety, payout previews and JavaScript syntax.
- Added negative tests refusing mint commands without explicit opt-in or a devnet-only fee-payer key; purchase preview stays disabled.
- No private wallet keys are committed. No devnet or mainnet mint has been executed during this milestone.

## Devnet test blocker / next big phase
A funded, purpose-specific Solana **devnet-only** keypair must be provisioned and held outside GitHub, plus acceptance of network fees. Run `npm run mint-devnet` only with `ENABLE_DEVNET_MINT=I_UNDERSTAND_DEVNET_ONLY` and `DEVNET_FEE_PAYER_KEYPAIR` set to its local keypair path. This intentionally creates an experimental token on devnet and consumes devnet SOL; no mainnet credentials should be supplied.

Before production: implement an allocation-specific, idempotent distribution journal; validate exact recipient token accounts, signer custody, first-year miner work aggregation, rollback/resumption, and safe verification of mint authority revocation. Build a server-side Solana USDC/SOL purchase processor with real settlement verification and transaction replay protection, with all payment endpoints disabled until separately approved. Have external security and applicable offering compliance reviewed. GitHub Pages cannot safely hold a transaction-signing backend.

## Limitations
Automated tests on synthetic records are not security audits. These scripts are not evidence of on-chain minting, independent signer identity or mainnet readiness. No payouts, purchases, deposits, minting or token transfers executed.
