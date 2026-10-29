# mFRG read-only devnet deployment rent preview — handoff

Added a small read-only devnet cost preview that independently checks the pinned genesis identity and fetches current rent-exempt minimums for the standard Token-2022 mint base size and standard token account base size. It computes the sum in integer lamports and presents SOL as a display value, with network fee explicitly **unknown** until a reviewed actual transaction message and signer count are available. Unit tests use mocked RPC data; deployment must still check actual on-chain rent and additional extensions.

Important: The Token-2022 mint and account sizes may be greater with extensions or metadata; this preview assumes none. This is a cost floor/illustrative baseline, not the total deployment cost or a transaction simulation. No wallet private keys, transaction construction, mint, transfer, spending or public Oracle network opening were performed.

Next: run the preview against real Solana devnet, verify intended public mint authority and treasury public addresses, and build accurate unsigned transaction messages for fee estimation after owner review. Mint owner control and Solana Token-2022 extension/freeze policies require explicit approval. The native ForgeCoin Oracle mainnet and public website remain separate operational gates.
