# mFRG single-use payout-wallet challenge — phase handoff

## Completed
Added cryptographically random 32-byte challenge issuance, explicit ten-minute lifetime, miner/recipient binding, signature verification and one-time consumption with tests for replay, expired, mismatched and invalid signatures. A failed signature consumes the nonce, fail-closed.

## Security limitations
The implementation uses an **in-memory single-process Map**. It does not survive restarts, distribute challenges across processes, authenticate native FRG mining addresses or persist an audit record. No HTTP endpoint, production registration UI, chain wallet ownership proof for FRG or signed-pool-to-reward integration exists. No payouts should depend on this alone.

## Next major phase
Develop a durable transactional challenge store with atomic compare-and-set consumption, request authorization and rate limits; securely bind challenge issuance to verified native FRG mining-address control. Connect signed pool exports, Solana proof, period closure and weekly reward previews into one fail-closed acceptance workflow. Test concurrency, crash/recovery and real pool schema. Never commit private keys.

No mint, transfers, live payments or sale activation.
