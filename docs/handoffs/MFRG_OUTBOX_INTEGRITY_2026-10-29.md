# mFRG signed-outbox integrity gate — phase handoff

## Implemented
The read-only unified payout gate now compares the stored base64 transaction against a canonical encoding, recomputes SHA-256 on exact serialized wire bytes and matches the stored outbox message digest, verifies every required transaction signature, and checks the transaction's first signature against the separately stored outbox signature. Integrated mock-RPC tests include valid signed payout, persisted digest tampering, persisted signature tampering, wire corruption, invalid blockhash and insufficient balance. Existing approved batch and token account checks remain mandatory.

## Critical trust limits
This is **not a real Solana devnet execution**. CI uses mock RPC fixtures and a test-generated Ed25519 transaction; no transaction, mint, transfer, purchase or Oracle launch was performed. The gate still depends on its database being trustworthy. It checks against the previously persisted outbox values, but a database operator could change transaction and hashes together. A signed payload does not encode a Solana cluster; blockhash checks and independently trusted devnet RPC remain critical. Production needs immutable/audited approved payout row lineage, full approved-ledger digest verification, pinned mint/source/authority settings, token-extension policy checks, and a controlled deployment signing/broadcast process. The outbox is not yet linked to the payout intent with enforced relational integrity. Missing or uncertain transaction status must never trigger blind re-payment.

## Owner action
No action yet for Solana token mint or Oracle mainnet. Later, obtain explicit authorization for a devnet Token-2022 deployment using a user-controlled Solana wallet with test SOL; after test acceptance, separately approve mainnet deployment. ForgeCoin Oracle public daemon/pool and website opening remain separate launch gates requiring real mining/payout/explorer/security checks.

## Next major phase
Add complete payout-record lineage and digest consistency for stored weekly batches, read-only live devnet RPC smoke checks, and validated trusted configuration. Run genuine devnet Token-2022 test mint and transfers only after funding and explicit approval.
