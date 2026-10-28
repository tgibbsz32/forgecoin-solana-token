# mFRG Solana wallet proof — phase handoff

## Completed
Implemented standalone verification of Solana Ed25519 signed, domain-separated, miner-bound, time-limited challenge statements. Tests cover positive, tampering, challenge mismatch and expiration. This proves possession of the Solana receiving account signing key at verification time, **not ownership of the native FRG mining address**. The challenge must be generated unpredictably server-side, tracked as single-use, bound to a separately authenticated FRG miner and securely retired. Wallets may not support this exact arbitrary-message signing flow; supported wallets need compatibility tests.

## Unfinished integration
- Challenge issuance/consumption, native FRG ownership proofs, authenticated official pool feed, signed export and weekly calculation are not wired end-to-end.
- Proofs must never be accepted from an untrusted registry boolean alone.
- Requires a suitable signing-client UI and replay-resistant persistent proof registry.
- No token minting, purchases, mining payouts, or on-chain transfers happened.

## Next
Integrate proof verification into a fail-closed reward pipeline with authenticated upstream identities and server-side challenge replay prevention; add negative end-to-end tests. Do not enable payments until that pipeline, custody, compliance and devnet integration are independently verified.
