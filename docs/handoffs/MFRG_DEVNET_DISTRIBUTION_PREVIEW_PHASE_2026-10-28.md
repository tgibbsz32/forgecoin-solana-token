# mFRG — devnet distribution preview phase handoff

Completed: deterministic offline distribution preview using real Solana public-key parsing and Token-2022 ATA derivation. Every allocation is individually keyed by a SHA-256 fingerprint covering mint, category, owner and exact base units. Reads a journal to surface planned/submitted/confirmed statuses and rejects duplicate, conflicting or stale entries; journal status is never assumed proof of chain settlement. Added negative tests and GitHub Actions validation.

Run locally after `npm install`:
`node scripts/devnet-distribution-preview.mjs <DEVNET_MINT> fixtures/allocation-wallets.example.json fixtures/payout-journal.example.json`

**Examples are placeholders.** Never reuse those owner addresses for actual custody. This command does not talk to Solana RPC, write a journal, construct/simulate/sign transactions or transfer any tokens.

Next phase: implement persistent journal and actual devnet-only token transfer executor, with dry-run simulation, fee estimation, explicit user authorization, robust retry and chain confirmation. Set up five verified allocation owner wallets and an independently held funded devnet signer. Then run the read-only reconciliation command against actual on-chain balances. Production payment acceptance and mainnet token creation remain inactive.
