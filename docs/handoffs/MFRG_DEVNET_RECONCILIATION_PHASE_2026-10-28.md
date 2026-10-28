# mFRG — Devnet read-only reconciliation handoff

## Phase complete
Added a read-only devnet verification command that checks the Token-2022 mint supply, 6 decimals, expected five allocations, distinct canonical Solana owner keys, derived associated token accounts, account owners, mint identity, and exact token balances. No signer keys are needed for verification. This validates observed chain state only when an actual test mint and real owner mappings are supplied.

## Run
`node scripts/verify-devnet-allocations.mjs <DEVNET_MINT_PUBLIC_KEY> <verified-five-owner-wallets.json>`

## Blocking prerequisites and next phase
The five sample wallet addresses in this repository are illustrative placeholders, not verified custody. No devnet mint has been deployed in this phase, so no successful on-chain reconciliation result is claimed.

Next phase must separately:
- Establish five actual devnet allocation owner keys with custody records.
- Implement an idempotent **allocation-specific** devnet mint distribution transaction plan and durable transaction journal.
- Fund a dedicated devnet-only signer, run a real devnet mint and distributions after approval, and use the verifier to check balances.
- Review on-chain authority revocation and treasury locks before any irreversible action.

**No mainnet mint, transfers, token sale or real funds accepted.** The separate public sale is owner-authorized but remains inactive, and required regulatory/security obligations are not discharged by this test phase.
