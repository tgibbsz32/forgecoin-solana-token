# mFRG signed mining-pool export — security phase handoff

Implemented an Ed25519 domain-separated signed export verifier with a configured pinned public key, signed issue timestamp, closed-period validation, positive difficulty-weighted work, duplicate work-ID checks, and tests for tampering, wrong key and wrong period. Neither fixture private keys nor production signing keys are in the repository.

Security boundary: A valid signature verifies the holder of the pinned key produced the snapshot. It does **not** prove the sender operates the real ForgeCoin pool or that the share totals match mining data. Deployment must establish a trusted key, securely generate signed exports from the authoritative pool database, validate chain reorg windows and retain digest-based replay records. Existing local importer is not automatically chained to this verifier; production consumers must require an authenticated envelope before payouts. Solana wallet ownership verification (signed challenge) is still outstanding. Actual token transfers, devnet mint and the public sale are inactive.

Next phase: implement a single authenticated import pipeline requiring verified envelope, wallet ownership challenge, registry/period verification, plus audited weekly payout previews. No real transactions executed.
