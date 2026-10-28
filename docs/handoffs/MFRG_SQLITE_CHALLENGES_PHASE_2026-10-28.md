# mFRG SQLite wallet challenge registry — phase handoff

This phase adds a Node.js built-in SQLite WAL-backed challenge registry, with random nonce generation, ten-minute expiration and an atomic conditional UPDATE ensuring only one consumer can claim a given nonce. Tests cover two connections to the same database, restart/reopen and consumption on invalid signature. The nonce is consumed before signature checking to prevent repeated guessing.

The registry is a **single-host prototype**. It does not prove FRG mining address control, issue authenticated challenges over an HTTP service, rate-limit enrollment, create long-lived wallet bindings or safely operate across multiple hosts. On disk, it contains miner identifiers and Solana wallet addresses, requiring restrictive file permissions and privacy retention policy. The actual ForgeCoin pool has not yet been integrated, and the verifier does not establish the pool's mining records are authentic.

Next phase: verify native FRG wallet address control using an implemented wallet RPC signature method, bind it to signed Solana proof and miner identity, and connect authenticated official-pool exports into immutable weekly ledgers. No mint, transfers, token sale activation or mainnet operations were performed.
