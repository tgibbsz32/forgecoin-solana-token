# mFRG signed transfer structure inspection — handoff

Implemented an offline Solana v0 signed-transaction inspector restricted to one Token-2022 TransferChecked instruction, no address lookup tables and no multisigner transfer. It matches mint, source token account, destination token account, signing authority, token base units and decimals against independently supplied expected values. Tests cover incorrect recipient, mint, program, amount and extra instructions.

**Critical:** This checks structure and nonzero signature bytes, **not cryptographic signatures**, verified fee-payer intent, associated token account ownership or that a known approved payout row was used to supply expected values. It also does not assert the transaction's blockhash/network: Solana transaction wire data does not encode devnet vs mainnet. The accepted public keys must be derived from a trusted on-chain devnet mint and approved payout intent, not arbitrary caller arguments. Never use this function alone to authorize transfers. No network calls, signing, broadcast or tokens moved.

Next phase: cryptographically validate transaction signatures; verify mint, ATA ownership, fee payer, approved settlement linkage and devnet RPC blockhash/account state before guarded devnet-only submission testing.
